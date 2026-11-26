// Logo único (26/11/2026): a logo só é enviada na Administração (Sistema › Marca). O envio grava o Logo.png na pasta e as páginas
// (Waste, Gel…) deixam de ter envio próprio. Dados fictícios; pasta simulada na memória.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const texto = html.toString('utf8');
  assert.ok(!/id="logoFile"|id="lgFile"|\$\('#lgFile'\)|\$\('#logoFile'\)/.test(texto), 'Waste e Gel sem envio próprio de logo');
  assert.ok(/id="cLogo"/.test(texto), 'Administração mantém o envio da logo');
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Logo === 'object' && typeof Logo.gravarPasta === 'function');
    const r = await f.evaluate(async () => {
      const gravados = {}, dir = { getFileHandle: async (n, o) => { if (!o || !o.create) { if (!(n in gravados)) throw new Error('não existe'); return { getFile: async () => new Blob([gravados[n]], { type: 'image/png' }) }; } return { createWritable: async () => ({ write: async b => { gravados[n] = b; }, close: async () => { } }) }; }, removeEntry: async n => { delete gravados[n]; } };
      const m0 = Store.mode, d0 = Store.dir; Store.mode = 'pasta'; Store.dir = dir;
      const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      const ok = await Logo.gravarPasta(png), temArq = 'Logo.png' in gravados, url = !!Logo.url;
      const rem = await Logo.removerPasta(); const aposRem = 'Logo.png' in gravados;
      Store.mode = 'local'; Store.dir = null; const semPasta = await Logo.gravarPasta(png);
      Store.mode = m0; Store.dir = d0; return { ok, temArq, url, rem, aposRem, semPasta };
    });
    assert.deepEqual(r, { ok: true, temArq: true, url: true, rem: true, aposRem: false, semPasta: false });
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok logo único: envio só na Administração; grava e remove o Logo.png na pasta; sem pasta, não grava; Waste e Gel sem envio próprio');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
