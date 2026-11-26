const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), wt = process.argv[2];
(async () => {
  const html = fs.readFileSync(path.join(wt, 'Plataforma.html')), srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require(path.join(wt, 'testes/plataforma/chromium.cjs'))()), out = {};
  for (const tema of ['light', 'dark']) { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: tema }), p = await ctx.newPage(); await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/importacoes'); await p.waitForTimeout(3500);
    out[tema] = await p.evaluate(() => { const e = document.querySelector('.import-row p'); return e ? { fs: getComputedStyle(e).fontSize, txt: e.textContent.slice(0, 50) } : 'sem .import-row p; hash=' + location.hash; }); await ctx.close(); }
  console.log(JSON.stringify(out)); await b.close(); srv.close();
})();
