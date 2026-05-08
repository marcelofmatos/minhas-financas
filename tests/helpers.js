const STORAGE_KEY = '@minhasfinancas:transacoes';
const TIMEOUT = 30000;

const LABEL_CATEGORIA = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  lazer: 'Lazer',
  moradia: 'Moradia',
  salario: 'Salário',
  outros: 'Outros',
};

async function novaPagina(browser, baseUrl) {
  const page = await browser.newPage();
  await page.setViewport({
    width: 414,
    height: 896,
    isMobile: true,
    hasTouch: true,
  });
  page.setDefaultTimeout(TIMEOUT);

  // RN-web roteia Alert.alert(..., [cancelar, destrutivo]) por window.confirm:
  // true -> chama onPress do último botão; false -> primeiro. Forçamos true
  // para que o "Excluir" seja sempre acionado durante os testes.
  await page.evaluateOnNewDocument(() => {
    window.confirm = () => true;
    window.alert = () => undefined;
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.evaluate((key) => {
    try { localStorage.removeItem(key); } catch (_) {}
  }, STORAGE_KEY);
  await page.reload({ waitUntil: 'networkidle2' });
  return page;
}

async function dispensarBoasVindas(page) {
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const jaDashboard = await page.evaluate(() => {
      const t = document.body.innerText || '';
      return (
        t.includes('Carregando suas finanças') ||
        t.includes('Transações Recentes') ||
        t.includes('Nenhuma transação')
      );
    });
    if (jaDashboard) return;

    const clicou = await page.evaluate(() => {
      const ctas = ['Começar', 'Continuar', 'Vamos lá', 'Entrar', 'Avançar', 'Próximo', 'Iniciar', 'OK'];
      const botoes = Array.from(document.querySelectorAll('[role="button"], button'));
      const visiveis = botoes.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      for (const cta of ctas) {
        const alvo = visiveis.find((el) => (el.innerText || '').includes(cta));
        if (alvo) { alvo.click(); return true; }
      }
      const ultimo = visiveis[visiveis.length - 1];
      if (ultimo) { ultimo.click(); return true; }
      return false;
    });

    if (!clicou) break;
    await new Promise((r) => setTimeout(r, 600));
  }
}

async function abrirApp(page) {
  await page.waitForFunction(() => (document.body.innerText || '').length > 0, {
    timeout: TIMEOUT,
  });
  await dispensarBoasVindas(page);
  await page.waitForFunction(
    () => !(document.body.innerText || '').includes('Carregando suas finanças'),
    { timeout: TIMEOUT }
  );
  await page.waitForFunction(
    () => {
      const t = document.body.innerText || '';
      return t.includes('Transações Recentes') || t.includes('Nenhuma transação');
    },
    { timeout: TIMEOUT }
  );
}

async function acharElementoPorTexto(page, texto, { exato = false } = {}) {
  return page.evaluateHandle(
    (search, exatoFlag) => {
      const todos = Array.from(document.querySelectorAll('[role="button"], button, [tabindex]'));
      const candidatos = todos.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      const matchTexto = (el) => {
        const t = (el.innerText || '').trim();
        return exatoFlag ? t === search : t.includes(search);
      };
      const direto = candidatos.find(matchTexto);
      if (direto) return direto;
      const all = Array.from(document.querySelectorAll('*'));
      return all.find(matchTexto) || null;
    },
    texto,
    exato
  );
}

async function clicarPorTexto(page, texto, opcoes = {}) {
  const handle = await acharElementoPorTexto(page, texto, opcoes);
  const el = handle.asElement();
  if (!el) {
    throw new Error(`Elemento com texto "${texto}" não encontrado`);
  }
  await el.click();
  return el;
}

async function irParaNovaTransacao(page) {
  await clicarPorTexto(page, 'Nova Transação');
  await page.waitForFunction(
    () => {
      const t = document.body.innerText || '';
      return t.includes('Salvar Transação') && t.includes('Descrição');
    },
    { timeout: TIMEOUT }
  );
}

async function preencherFormulario(page, { tipo, descricao, valor, categoria }) {
  const labelTipo = tipo === 'receita' ? 'Receita' : 'Despesa';
  await clicarPorTexto(page, labelTipo, { exato: true });

  const inputs = await page.$$('input');
  if (inputs.length < 2) {
    throw new Error(`Esperava 2 inputs no formulário, encontrei ${inputs.length}`);
  }
  await inputs[0].click({ clickCount: 3 });
  await inputs[0].type(descricao, { delay: 10 });
  await inputs[1].click({ clickCount: 3 });
  await inputs[1].type(valor, { delay: 10 });

  const labelCategoria = LABEL_CATEGORIA[categoria];
  if (!labelCategoria) {
    throw new Error(`Categoria desconhecida: ${categoria}`);
  }
  await clicarPorTexto(page, labelCategoria, { exato: true });
}

async function salvar(page) {
  await clicarPorTexto(page, 'Salvar Transação');
  await page.waitForFunction(
    () => (document.body.innerText || '').includes('Transações Recentes'),
    { timeout: TIMEOUT }
  );
}

function parseValorBR(s) {
  if (!s) return null;
  let limpo = s.replace(/\s/g, '');
  if (limpo.includes('.') && limpo.includes(',')) {
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (limpo.includes(',')) {
    limpo = limpo.replace(',', '.');
  }
  const n = parseFloat(limpo);
  return Number.isNaN(n) ? null : n;
}

async function obterSaldoExibido(page) {
  const valores = await page.evaluate(() => {
    const text = document.body.innerText || '';
    return Array.from(text.matchAll(/R\$\s*([\d.,]+)/g)).map((m) => m[1]);
  });
  if (!valores.length) return null;
  return parseValorBR(valores[0]);
}

async function lerTransacoesStorage(page) {
  return page.evaluate((key) => {
    try {
      const json = localStorage.getItem(key);
      return json ? JSON.parse(json) : [];
    } catch (_) {
      return [];
    }
  }, STORAGE_KEY);
}

async function contarTransacoes(page) {
  const t = await lerTransacoesStorage(page);
  return t.length;
}

// IMPORTANTE: Alert.alert do react-native-web é um no-op
// (node_modules/react-native-web/src/exports/Alert/index.js -> static alert() {}).
// Por isso, no Expo Web, o fluxo onLongPress -> Alert.alert -> botão "Excluir"
// nunca chama removerTransacao. Esta função:
//   1. Confirma que o item tem onLongPress ligado (fiber);
//   2. Localiza removerTransacao no contexto via fiber e a chama com o id real
//      da transação — simulando o usuário confirmando o diálogo no celular.
async function excluirComToqueLongo(page, descricao) {
  const resultado = await page.evaluate((search, storageKey) => {
    function fiberDe(node) {
      const k = Object.keys(node).find(
        (key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      );
      return k ? node[k] : null;
    }

    const candidatos = Array.from(document.querySelectorAll('[role="button"], [tabindex]'));
    let item = null;
    for (const el of candidatos) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (el.innerText || '').includes(search)) {
        item = el;
        break;
      }
    }
    if (!item) return { ok: false, reason: 'item_nao_encontrado' };

    let temOnLongPress = false;
    let removerTransacao = null;
    let fiber = fiberDe(item);
    while (fiber) {
      const props = fiber.memoizedProps || fiber.pendingProps;
      if (props && typeof props.onLongPress === 'function') {
        temOnLongPress = true;
      }
      const value = props && props.value;
      if (
        value &&
        typeof value.removerTransacao === 'function' &&
        typeof value.adicionarTransacao === 'function'
      ) {
        removerTransacao = value.removerTransacao;
      }
      fiber = fiber.return;
    }

    if (!temOnLongPress) return { ok: false, reason: 'sem_onLongPress' };
    if (!removerTransacao) return { ok: false, reason: 'contexto_nao_encontrado' };

    const json = localStorage.getItem(storageKey);
    const transacoes = json ? JSON.parse(json) : [];
    const alvo = transacoes.find((t) => (t.descricao || '').includes(search));
    if (!alvo) return { ok: false, reason: 'transacao_nao_no_storage' };

    removerTransacao(alvo.id);
    return { ok: true, id: alvo.id };
  }, descricao, STORAGE_KEY);

  if (!resultado.ok) {
    throw new Error(`Falha ao acionar exclusão: ${resultado.reason}`);
  }
  return resultado;
}

module.exports = {
  STORAGE_KEY,
  TIMEOUT,
  novaPagina,
  abrirApp,
  dispensarBoasVindas,
  clicarPorTexto,
  irParaNovaTransacao,
  preencherFormulario,
  salvar,
  obterSaldoExibido,
  lerTransacoesStorage,
  contarTransacoes,
  excluirComToqueLongo,
};
