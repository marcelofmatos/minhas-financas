// tests/aula5-passo-7.2.test.js
//
// Aula 5 — Passo 7.2 — Roteiro de teste do Botão Excluir na tela de detalhe.
// Sete itens, um teste cada:
//
//   1. Adicionar transações de teste
//   2. Tocar em uma → abre detalhe → botão Excluir aparece
//   3. Tocar em Excluir → confirmação exibe o nome da transação
//   4. Cancelar → transação continua
//   5. Confirmar → volta ao Dashboard, transação sumiu
//   6. Reload (= "fechar e reabrir") → exclusão persistiu no SQLite
//   7. Toque longo na lista do Dashboard segue funcionando como atalho
//
// Pré-requisito: app rodando em http://localhost:8081 (ou BASE_URL).
//   npx expo start --web
//
// Como rodar:
//   cd tests && npx jest aula5-passo-7.2

const puppeteer = require('puppeteer');

const {
  clicarPorTexto,
  irParaNovaTransacao,
  preencherFormulario,
} = require('./helpers');

// Substituto do helpers.salvar: o helper original espera só por "Transações
// Recentes" no DOM, texto que o React Navigation mantém montado em segundo
// plano (a tela do Dashboard fica cacheada). Isso faz a função retornar antes
// do save concluir e iterações seguidas se atropelam. Aqui aguardamos a
// descrição da transação aparecer no DOM — ela só fica visível quando a lista
// do Dashboard re-renderiza com o item novo.
async function salvarEAguardarLista(page, descricao) {
  await clicarPorTexto(page, 'Salvar Transação');
  await page.waitForFunction(
    (d) => (document.body.innerText || '').includes(d),
    { timeout: TIMEOUT },
    descricao
  );
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';
const HEADLESS = process.env.HEADLESS !== 'false';
const TIMEOUT = 30000;
const ONBOARDING_KEY = '@minhasfinancas:primeiro_acesso_concluido';

// -- Helpers específicos da Aula 5 (inlined) -----------------------------------
// As transações agora vivem no SQLite (via WebAssembly + IndexedDB no web),
// não mais no localStorage. Os helpers abaixo:
//   - zeram TODA a persistência do origin (localStorage + IndexedDB) via CDP
//   - opcionalmente regravam a flag de onboarding para pular BoasVindas
//   - leem a lista de transações via fiber do React (sem depender de storage)

async function limparStorage(page, baseUrl) {
  const origin = new URL(baseUrl).origin;
  try {
    const client = await page.target().createCDPSession();
    await client.send('Storage.clearDataForOrigin', {
      origin,
      storageTypes: 'cookies,local_storage,indexeddb,websql,service_workers,cache_storage',
    });
    await client.detach();
  } catch (_) {
    await page.evaluate(async () => {
      try { localStorage.clear(); } catch (_) {}
      try { sessionStorage.clear(); } catch (_) {}
      if (window.indexedDB && indexedDB.databases) {
        try {
          const dbs = await indexedDB.databases();
          await Promise.all(dbs.map(({ name }) => new Promise((r) => {
            if (!name) return r();
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = req.onerror = req.onblocked = () => r();
          })));
        } catch (_) {}
      }
    });
  }
}

async function novaPaginaLimpa(browser, baseUrl, { manterOnboarding = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true });
  page.setDefaultTimeout(TIMEOUT);

  await page.evaluateOnNewDocument(() => {
    window.confirm = () => true;
    window.alert = () => undefined;
  });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await limparStorage(page, baseUrl);

  if (manterOnboarding) {
    await page.evaluate((k) => {
      try { localStorage.setItem(k, 'true'); } catch (_) {}
    }, ONBOARDING_KEY);
  }

  await page.reload({ waitUntil: 'networkidle2' });
  return page;
}

async function aguardarDashboard(page) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText || '';
      return t.includes('Transações Recentes') || t.includes('Nenhuma transação');
    },
    { timeout: TIMEOUT }
  );
}

async function lerTransacoesViaContext(page) {
  return page.evaluate(() => {
    function fiberDe(node) {
      const k = Object.keys(node).find(
        (key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      );
      return k ? node[k] : null;
    }
    const candidatos = Array.from(document.querySelectorAll('[role="button"], [tabindex]'));
    for (const el of candidatos) {
      let fiber = fiberDe(el);
      while (fiber) {
        const props = fiber.memoizedProps || fiber.pendingProps;
        const value = props && props.value;
        if (
          value &&
          Array.isArray(value.transacoes) &&
          typeof value.adicionarTransacao === 'function' &&
          typeof value.removerTransacao === 'function'
        ) {
          return value.transacoes;
        }
        fiber = fiber.return;
      }
    }
    return null;
  });
}
// -----------------------------------------------------------------------------

// Adiciona três transações; a transação "alvo" é a que será excluída no roteiro.
const TRANSACOES_INICIAIS = [
  { tipo: 'despesa', descricao: 'Cafe da manha',     valor: '5,00',    categoria: 'alimentacao' },
  { tipo: 'despesa', descricao: 'Almoco no centro',  valor: '25,00',   categoria: 'alimentacao' },
  { tipo: 'receita', descricao: 'Salario',           valor: '3000,00', categoria: 'salario'     },
];
const ALVO = 'Almoco no centro';

// Sobrescreve window.confirm para capturar a mensagem e controlar a resposta
// (true = OK, false = Cancelar). É reinstalado a cada navegação via
// evaluateOnNewDocument, e também aplicado no documento atual.
function instalarConfirmInstrumentado() {
  window.__confirmMessages = window.__confirmMessages || [];
  window.__confirmAnswer = (typeof window.__confirmAnswer === 'boolean') ? window.__confirmAnswer : true;
  window.confirm = (msg) => {
    window.__confirmMessages.push(String(msg));
    return window.__confirmAnswer;
  };
}

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: HEADLESS ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Página única para a suite inteira — o roteiro é sequencial.
  page = await novaPaginaLimpa(browser, BASE_URL, { manterOnboarding: true });

  await page.evaluateOnNewDocument(instalarConfirmInstrumentado);
  await page.evaluate(instalarConfirmInstrumentado);

  await aguardarDashboard(page);
});

afterAll(async () => {
  // Fecha a página antes do browser para evitar "Protocol error: Connection
  // closed" — browser.close() já encerra todas as páginas, mas seguir essa
  // ordem deixa explícito e tolera reordenações futuras.
  if (page && !page.isClosed()) {
    try { await page.close(); } catch (_) {}
  }
  if (browser) await browser.close();
});

describe('Aula 5 — Passo 7.2 — Roteiro de teste do botão Excluir', () => {

  test('1. adicionar algumas transações de teste no app', async () => {
    for (const t of TRANSACOES_INICIAIS) {
      await irParaNovaTransacao(page);
      await preencherFormulario(page, t);
      await salvarEAguardarLista(page, t.descricao);
    }

    const transacoes = await lerTransacoesViaContext(page);
    expect(transacoes).toBeTruthy();
    expect(transacoes.length).toBe(TRANSACOES_INICIAIS.length);
    for (const t of TRANSACOES_INICIAIS) {
      expect(transacoes.some(x => x.descricao === t.descricao)).toBe(true);
    }
  }, TIMEOUT * 3);

  test('2. tocar na transação abre o detalhe com o botão "Excluir"', async () => {
    await clicarPorTexto(page, ALVO);

    await page.waitForFunction(
      (alvo) => {
        const t = document.body.innerText || '';
        return t.includes('Voltar') && t.includes('Excluir') && t.includes(alvo);
      },
      { timeout: TIMEOUT },
      ALVO
    );

    const texto = await page.evaluate(() => document.body.innerText || '');
    expect(texto).toContain('Excluir');
    expect(texto).toContain(ALVO);
    expect(texto).toContain('Voltar');
  }, TIMEOUT * 2);

  test('3. tocar em "Excluir" exibe a confirmação com o nome da transação', async () => {
    // Zera mensagens capturadas e configura para CANCELAR (item 4 do roteiro)
    await page.evaluate(() => {
      window.__confirmMessages = [];
      window.__confirmAnswer = false;
    });

    await clicarPorTexto(page, 'Excluir', { exato: true });

    await page.waitForFunction(
      () => window.__confirmMessages && window.__confirmMessages.length > 0,
      { timeout: TIMEOUT }
    );
    const mensagem = await page.evaluate(
      () => window.__confirmMessages[window.__confirmMessages.length - 1]
    );

    // A mensagem deve mencionar o nome da transação
    expect(mensagem).toContain(ALVO);
  }, TIMEOUT * 2);

  test('4. cancelar → Alert fecha e a transação continua na lista', async () => {
    // No item anterior já configuramos __confirmAnswer = false (Cancelar)
    // e clicamos em Excluir. O fluxo do código:
    //   if (Platform.OS === 'web') { if (window.confirm(msg)) excluir(); return; }
    // Como confirm devolveu false, excluir() NÃO é chamado: ficamos no detalhe
    // e a transação continua no contexto.

    const transacoes = await lerTransacoesViaContext(page);
    expect(transacoes.some(t => t.descricao === ALVO)).toBe(true);
    expect(transacoes.length).toBe(TRANSACOES_INICIAIS.length);

    // Confere que continuamos na tela de detalhe (não voltou ao dashboard)
    const aindaNoDetalhe = await page.evaluate(() => {
      const t = document.body.innerText || '';
      return t.includes('Voltar') && t.includes('Excluir');
    });
    expect(aindaNoDetalhe).toBe(true);
  }, TIMEOUT);

  test('5. confirmar exclusão → volta ao Dashboard e a transação sai da lista', async () => {
    await page.evaluate(() => {
      window.__confirmMessages = [];
      window.__confirmAnswer = true;
    });

    await clicarPorTexto(page, 'Excluir', { exato: true });

    // A descrição desaparece quando: removerTransacao concluiu no SQLite +
    // re-renderizou o Dashboard sem o item. Esperar o sumiço é o sinal robusto.
    await page.waitForFunction(
      (alvo) => !(document.body.innerText || '').includes(alvo),
      { timeout: TIMEOUT },
      ALVO
    );
    await aguardarDashboard(page);

    const transacoes = await lerTransacoesViaContext(page);
    expect(transacoes.some(t => t.descricao === ALVO)).toBe(false);
    expect(transacoes.length).toBe(TRANSACOES_INICIAIS.length - 1);
  }, TIMEOUT * 2);

  test('6. fechar e reabrir o app (reload) — a exclusão persistiu no SQLite', async () => {
    await page.reload({ waitUntil: 'networkidle2' });
    await aguardarDashboard(page);

    const transacoes = await lerTransacoesViaContext(page);
    expect(transacoes.some(t => t.descricao === ALVO)).toBe(false);

    // As demais transações ainda estão lá
    const restantes = TRANSACOES_INICIAIS.filter(t => t.descricao !== ALVO);
    for (const t of restantes) {
      expect(transacoes.some(x => x.descricao === t.descricao)).toBe(true);
    }
    expect(transacoes.length).toBe(restantes.length);
  }, TIMEOUT * 2);

  test('7. o toque longo na lista do Dashboard segue ativo como atalho', async () => {
    // Verifica via fiber que algum item da lista ainda tem onLongPress.
    // Não acionamos de verdade — no web Alert.alert é no-op (vide comentário
    // em helpers.excluirComToqueLongo); a presença do handler já garante que
    // o atalho continua wired-up no JSX.
    const temAtalho = await page.evaluate(() => {
      function fiberDe(node) {
        const k = Object.keys(node).find(
          (key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
        );
        return k ? node[k] : null;
      }
      const candidatos = Array.from(document.querySelectorAll('[role="button"], [tabindex]'));
      for (const el of candidatos) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (!(el.innerText || '').includes('Cafe da manha')) continue;
        let fiber = fiberDe(el);
        while (fiber) {
          const props = fiber.memoizedProps || fiber.pendingProps;
          if (props && typeof props.onLongPress === 'function') return true;
          fiber = fiber.return;
        }
      }
      return false;
    });

    expect(temAtalho).toBe(true);
  }, TIMEOUT);
});
