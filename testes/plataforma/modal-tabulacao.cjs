// C50/J02 (análise comum 26/11/2026): no diálogo de metas da Produção, Tab e Shift+Tab circulam só dentro do diálogo; Escape fecha e o
// foco volta ao botão que abriu. Teclado real (Playwright), demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.waitFor({ state: 'attached', timeout: 60000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof metasModal === 'function', null, { timeout: 60000 });
    await f.evaluate(() => { const b = document.createElement('button'); b.id = 'abreMetasTeste'; b.textContent = 'Metas'; b.onclick = () => metasModal(); document.body.prepend(b); b.focus(); b.click(); });
    await f.waitForSelector('.overlay .modal', { timeout: 10000 }); await p.waitForTimeout(300);
    const dentro = () => f.evaluate(() => !!document.activeElement.closest('.overlay .modal'));
    const n = await f.evaluate(() => document.querySelectorAll('.overlay .modal button, .overlay .modal input, .overlay .modal select, .overlay .modal textarea, .overlay .modal a[href]').length);
    const fora = [];
    for (let i = 0; i < n + 3; i++) { await p.keyboard.press('Tab'); if (!(await dentro())) fora.push('Tab ' + i); }
    for (let i = 0; i < n + 3; i++) { await p.keyboard.press('Shift+Tab'); if (!(await dentro())) fora.push('Shift+Tab ' + i); }
    assert.deepEqual(fora, [], 'o foco saiu do diálogo de metas: ' + fora.join(', '));
    console.log('ok diálogo de metas: ' + (n + 3) + ' Tab e ' + (n + 3) + ' Shift+Tab sem o foco sair do diálogo');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    const fim = await f.evaluate(() => ({ aberto: !!document.querySelector('.overlay .modal'), foco: document.activeElement.id }));
    assert.deepEqual(fim, { aberto: false, foco: 'abreMetasTeste' }, JSON.stringify(fim));
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok Escape fecha o diálogo e o foco volta ao botão que o abriu');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
