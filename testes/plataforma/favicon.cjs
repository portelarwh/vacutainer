// Plataforma 1.7.2 · favicon com o símbolo BD lido de Marca/favicon.svg (docs/MARCA.md). O SVG daqui é um quadrado fictício,
// não a marca: a marca não entra no repositório. Com o arquivo, a aba ganha o ícone; sem ele, nada é inserido e não há erro.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const SVG_FICTICIO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#044ED7"/></svg>';

function servidor(comArquivo) {
  return http.createServer((q, r) => {
    const url = decodeURIComponent(q.url.split('?')[0]);
    if (url === '/Marca/favicon.svg') {
      if (!comArquivo) { r.statusCode = 404; return r.end(); }
      r.setHeader('Content-Type', 'image/svg+xml'); return r.end(SVG_FICTICIO);
    }
    if (url.startsWith('/Marca/')) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', 'text/html'); r.end(html);
  });
}

async function caso(browser, comArquivo) {
  const srv = servidor(comArquivo); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const page = await browser.newPage(), erros = []; page.on('pageerror', e => erros.push(e.message));
  try {
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.waitForTimeout(800);
    const links = await page.evaluate(() => [...document.querySelectorAll('link[rel~="icon"]')].map(l => ({ id: l.id, href: l.getAttribute('href'), type: l.type })));
    if (comArquivo) assert.deepEqual(links, [{ id: 'vacFavicon', href: 'Marca/favicon.svg', type: 'image/svg+xml' }], 'com o arquivo: um favicon, da pasta Marca');
    else assert.deepEqual(links, [], 'sem o arquivo: nenhum favicon inserido');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok favicon ' + (comArquivo ? 'com Marca/favicon.svg: ícone na aba' : 'sem o arquivo: nada inserido, sem erro'));
  } finally { await page.close(); srv.close(); }
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch(require('./chromium.cjs')());
    await caso(browser, true);
    await caso(browser, false);
  } finally { if (browser) await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
