// C51/J03 (análise comum 26/11/2026; P9: operador e líder em Android comum). Produção › Lançamento no celular (390 e 360 px): ao
// confirmar a produção de uma hora com Enter, a tela é recriada, mas a tabela não volta à esquerda e o campo seguinte fica inteiro à
// vista dentro do cartão. Toque e teclado reais (Playwright), demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    for (const w of [390, 360]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, hasTouch: true }), p = await ctx.newPage(), erros = [];
      p.on('pageerror', e => erros.push(e.message)); await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
      await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
      const q = p.locator('iframe[title="Módulo Produção"]'); await q.waitFor({ state: 'attached', timeout: 60000 });
      const f = await (await q.elementHandle()).contentFrame(); await f.waitForSelector('.cab2-nav', { timeout: 60000 }); await p.waitForTimeout(1200);
      await f.locator('#main button', { hasText: '1º Turno' }).first().click(); await p.waitForTimeout(800);
      const inp = f.locator('input[data-fk^="g-iv_"]:visible').first(); await inp.scrollIntoViewIfNeeded(); await inp.tap(); await p.waitForTimeout(300);
      const estado = () => f.evaluate(() => { const e = document.activeElement, t = e.closest('.tw'), r = e.getBoundingClientRect(), tr = t.getBoundingClientRect();
        return { fk: e.dataset.fk, rolagem: Math.round(t.scrollLeft), inteiro: r.left >= tr.left - 1 && r.right <= tr.right + 1, larga: t.scrollWidth > t.clientWidth + 1 }; });
      const antes = await estado();
      assert.ok(antes.larga && antes.rolagem > 0 && antes.inteiro, `${w} px: o toque desloca a tabela para mostrar o campo: ` + JSON.stringify(antes));
      const passos = [];
      for (const v of ['1', '2']) { await p.keyboard.press('Control+A'); await p.keyboard.type(v); await p.keyboard.press('Enter'); await p.waitForTimeout(700); passos.push(await estado()); }
      for (const d of passos) { assert.notEqual(d.fk, antes.fk); assert.ok(d.rolagem > 0, `${w} px: a tabela não volta à esquerda: ` + JSON.stringify({ antes, passos })); assert.ok(d.inteiro, `${w} px: o campo seguinte fica inteiro à vista: ` + JSON.stringify({ antes, passos })); }
      assert.equal(new Set([antes.fk, ...passos.map(x => x.fk)]).size, 3, 'o foco avança uma hora a cada Enter');
      assert.deepEqual(erros, []); await ctx.close();
      console.log(`ok celular ${w} px: depois de Enter a tabela mantém a rolagem (${passos.map(x => x.rolagem).join(', ')}) e o próximo campo fica inteiro`);
    }
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
