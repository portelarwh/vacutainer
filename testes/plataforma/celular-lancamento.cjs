// J01 (auditoria de 26/11/2026): em celular (390 e 360 px) a tela Lançamento não alarga a página (sem rolagem horizontal da própria tela;
// as tabelas rolam dentro do cartão). Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    for (const w of [390, 360]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 844 } }), p = await ctx.newPage(), erros = [];
      p.on('pageerror', e => erros.push(e.message)); await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
      await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
      const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
      const f = await (await q.elementHandle()).contentFrame(); await f.waitForSelector('.cab2-nav', { timeout: 30000 }); await p.waitForTimeout(800);
      const m = await f.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
      assert.ok(m.sw <= m.w + 1, `a 390/360 px a tela não pode alargar (${w}px): scrollWidth ${m.sw} > ${m.w}`);
      assert.deepEqual(erros, []); await ctx.close();
    }
    console.log('ok Lançamento no celular (390 e 360 px): sem rolagem horizontal da tela');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
