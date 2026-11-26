const { chromium } = require('playwright'), http = require('http'), fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').resolve(__dirname, '../../../Plataforma.html'));
(async () => { const srv = http.createServer((q, r) => r.end(html)); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/inicio'); await p.waitForTimeout(4000);
  const ir = async h => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(1800); };
  const medir = async () => { await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(300); await cdp.send('HeapProfiler.collectGarbage'); const m = await cdp.send('Performance.getMetrics'); const g = k => m.metrics.find(x => x.name === k).value; return [g('Nodes'), g('JSEventListeners'), g('Documents'), g('Frames')]; };
  await cdp.send('Performance.enable');
  for (const ciclo of [['#/inicio', '#/relatorios'], ['#/oee', '#/inicio'], ['#/perdas', '#/inicio'], ['#/gel', '#/inicio'], ['#/oee', '#/perdas']]) {
    for (const h of ciclo) await ir(h); const a = await medir(); for (let i = 0; i < 5; i++) for (const h of ciclo) await ir(h); const d = await medir();
    console.log(ciclo.join(' ↔ '), 'por ciclo: nós', ((d[0] - a[0]) / 5).toFixed(0), 'listeners', ((d[1] - a[1]) / 5).toFixed(1)); } await b.close(); srv.close(); })();
