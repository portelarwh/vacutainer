// Padrões embutidos do Waste (decisão 9, 26/11/2026): a base nova nasce sem Tipos de item e sem Causas de perda; a sugestão de partida só
// entra no campo quando o usuário pede (e só vale depois de salvar). Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const texto = html.toString('utf8');
  assert.ok(/layouts:\{\},causas:'',tipos:null\}/.test(texto), 'base nova do Waste sem causas nem tipos');
  assert.ok(!/CFG\(\)\.tipos\|\|DEFAULT_TIPOS/.test(texto) && !/c\.tipos\|\|DEFAULT_TIPOS/.test(texto), 'sem padrão escondido nos tipos');
  assert.ok(/id="btnSugTipos"/.test(texto) && /id="btnSugCausas"/.test(texto), 'botões de sugestão de partida');
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/perdas');
    const f = await (await page.locator('iframe[title="Módulo Waste"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof DEFAULT_TIPOS === 'string' && typeof tipos === 'function', null, { timeout: 60000 });
    const r = await f.evaluate(() => { const c0 = CFG();
      c0.tipos = null; c0.causas = ''; return { sem: { tipos: tipos().length, causas: parseCausas().length } }; });
    assert.deepEqual(r.sem, { tipos: 0, causas: 0 }, 'sem cadastro: nenhuma lista embutida age');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok Waste: sem tipos e sem causas cadastrados nada embutido vale; sugestão de partida só por botão');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
