// C35/G02 (auditoria de 26/11/2026; causa achada em 27/11/2026): ir e voltar entre páginas não pode prender nós nem listeners.
// Causa: o envoltório dos módulos (modulo/core/runtime) guardava cada MutationObserver/ResizeObserver num Set por referência forte,
// para desligá-los no descarte; Gel e Paradas recriam campos de data a cada visita (vacDatas liga um observador a cada um) e o Set
// prendia o observador e o campo antigo: ~400 nós e 10 a 17 listeners por ciclo. Agora o registro usa WeakRef. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/inicio'); await p.waitForTimeout(4000);
    const ir = async h => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(1500); };
    await cdp.send('Performance.enable');
    const medir = async () => { await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(300); await cdp.send('HeapProfiler.collectGarbage'); const m = await cdp.send('Performance.getMetrics'), g = k => m.metrics.find(x => x.name === k).value; return [g('Nodes'), g('JSEventListeners')]; };
    for (const mod of ['gel', 'paradas']) {
      await ir('#/' + mod); await ir('#/inicio'); const a = await medir();
      for (let i = 0; i < 4; i++) { await ir('#/' + mod); await ir('#/inicio'); }
      const d = await medir(), nos = (d[0] - a[0]) / 4, ouv = (d[1] - a[1]) / 4;
      assert.ok(nos <= 20 && ouv <= 1, `${mod} ↔ Visão da linha: ${nos.toFixed(0)} nós e ${ouv.toFixed(1)} listeners a mais por ciclo (antes ~400 e 10 a 17)`);
      console.log(`ok ${mod} ↔ Visão da linha: ${nos.toFixed(0)} nós e ${ouv.toFixed(1)} listeners por ciclo depois da coleta`);
    }
    // o descarte do módulo continua desligando os observadores registrados (agora por WeakRef)
    await ir('#/gel');
    const f = await (await p.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle()).contentFrame();
    const desc = await f.evaluate(async () => { const el = document.createElement('div'); document.body.appendChild(el); let n = 0; const mo = new MutationObserver(() => { n++; }); mo.observe(el, { attributes: true });
      el.setAttribute('a', '1'); await new Promise(r => setTimeout(r, 50)); const antes = n; window.__vacRuntimeDispose(); el.setAttribute('a', '2'); await Promise.resolve(); await new Promise(r => requestAnimationFrame(() => r()));
      return { antes, depois: n, guardado: typeof mo.disconnect }; });
    assert.deepEqual(desc, { antes: 1, depois: 1, guardado: 'function' }, 'descarte desliga o observador: ' + JSON.stringify(desc));
    console.log('ok o descarte do módulo ainda desliga os observadores registrados');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
