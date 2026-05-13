// tests/feat-item-edit.test.js
//
// Teste E2E da feature "Editar transação".
//
// Cenários cobertos:
//   1. Criar uma transação → abrir detalhe → botão "Editar" aparece
//   2. Tocar em "Editar" → campos do formulário pré-preenchidos
//   3. Alterar descrição e valor → "Salvar Alterações" → volta ao detalhe com dados novos
//   4. Reload → edição persiste no SQLite
//   5. Posição na lista do Dashboard NÃO muda (regressão do DELETE+INSERT)
//
// Pré-requisito: app rodando em http://localhost:8081 (ou BASE_URL).
//   npx expo start --web
//
// Como rodar:
//   cd tests && npx jest feat-item-edit

const puppeteer = require('puppeteer');

const {
  clicarPorTexto,
  irParaNovaTransacao,
  preencherFormulario,
} = require('./helpers');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';
const HEADLESS = process.env.HEADLESS !== 'false';
const TIMEOUT = 30000;
const ONBOARDING_KEY = '@minhasfinancas:primeiro_acesso_concluido';

async function salvarEAguardarLista(page, descricao) {
  await clicarPorTexto(page, 'Salvar Transação');
  await page.waitForFunction(
    (d) => (document.body.innerText || '').includes(d),
    { timeout: TIMEOUT },
    descricao
  );
}

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

async function pularOnboarding(page) {
  await page.evaluate((k) => localStorage.setItem(k, 'true'), ONBOARDING_KEY);
}

async function abrirDetalhe(page, descricao) {
  await page.waitForFunction(
    (d) => (document.body.innerText || '').includes(d),
    { timeout: TIMEOUT },
    descricao
  );
  await clicarPorTexto(page, descricao);
  await page.waitForFunction(
    () => (document.body.innerText || '').includes('Excluir'),
    { timeout: TIMEOUT }
  );
}

async function digitarNoCampo(page, placeholder, valor) {
  await page.evaluate((ph, v) => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const el = inputs.find((i) => i.getAttribute('placeholder') === ph);
    if (!el) throw new Error('Campo não encontrado: ' + ph);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, placeholder, valor);
}

async function lerInput(page, placeholder) {
  return page.evaluate((ph) => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    const el = inputs.find((i) => i.getAttribute('placeholder') === ph);
    return el ? el.value : null;
  }, placeholder);
}

describe('Editar transação', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, TIMEOUT);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await limparStorage(page, BASE_URL);
    await pularOnboarding(page);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  }, TIMEOUT);

  afterEach(async () => {
    if (page) await page.close();
  });

  test('cria, edita e persiste — preservando posição na lista', async () => {
    // 1. Cria duas transações para validar a posição depois
    await irParaNovaTransacao(page);
    await preencherFormulario(page, { descricao: 'Padaria', valor: '10,00' });
    await salvarEAguardarLista(page, 'Padaria');

    await irParaNovaTransacao(page);
    await preencherFormulario(page, { descricao: 'Almoço', valor: '25,00' });
    await salvarEAguardarLista(page, 'Almoço');

    // No Dashboard, "Almoço" foi inserido depois → deve estar acima de "Padaria".
    // 2. Abre detalhe do "Almoço" e confere botão "Editar"
    await abrirDetalhe(page, 'Almoço');
    const temBotaoEditar = await page.evaluate(() =>
      (document.body.innerText || '').includes('Editar')
    );
    expect(temBotaoEditar).toBe(true);

    // 3. Toca em "Editar" e confere pré-preenchimento
    await clicarPorTexto(page, 'Editar');
    await page.waitForFunction(
      () => (document.body.innerText || '').includes('Editar Transação'),
      { timeout: TIMEOUT }
    );
    const descAtual = await lerInput(page, 'Ex: Supermercado, Salário...');
    const valorAtual = await lerInput(page, '0,00');
    expect(descAtual).toBe('Almoço');
    expect(valorAtual).toBe('25,00');

    // 4. Altera descrição e valor → salva
    await digitarNoCampo(page, 'Ex: Supermercado, Salário...', 'Almoço editado');
    await digitarNoCampo(page, '0,00', '30,00');
    await clicarPorTexto(page, 'Salvar Alterações');

    // 5. Volta ao detalhe com os dados novos
    await page.waitForFunction(
      () => {
        const t = document.body.innerText || '';
        return t.includes('Almoço editado') && t.includes('30,00');
      },
      { timeout: TIMEOUT }
    );

    // 6. Reload — a edição persiste no SQLite
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(
      (d) => (document.body.innerText || '').includes(d),
      { timeout: TIMEOUT },
      'Almoço editado'
    );

    // 7. Volta ao Dashboard e confere posição
    const ordem = await page.evaluate(() => {
      const texto = document.body.innerText || '';
      const idxEditado = texto.indexOf('Almoço editado');
      const idxPadaria = texto.indexOf('Padaria');
      return { idxEditado, idxPadaria };
    });
    expect(ordem.idxEditado).toBeGreaterThanOrEqual(0);
    expect(ordem.idxPadaria).toBeGreaterThanOrEqual(0);
    // "Almoço editado" foi criado depois de "Padaria" → deve aparecer ANTES dela na lista
    expect(ordem.idxEditado).toBeLessThan(ordem.idxPadaria);
  }, TIMEOUT);
});
