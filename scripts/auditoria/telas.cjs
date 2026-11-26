const { chromium } = require('/home/user/vacutainer/node_modules/playwright'), http = require('http'), fs = require('fs');
const html = fs.readFileSync('/home/user/vacutainer/Plataforma.html');
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require('/home/user/vacutainer/testes/plataforma/chromium.cjs')());
  const pontos = [['producao-visao', '#/oee?tab=overview'], ['producao-lanc', '#/oee?tab=launch'], ['admin-cad', '#/portal?tab=cadastros'], ['gel', '#/gel']];
  for (const [w, h, tag] of [[1440, 900, 'desk'], [390, 844, 'cel']]) for (const [nome, hash] of pontos) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }), p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1' + hash); await p.waitForTimeout(3500);
    const m = await p.evaluate(() => { const de = document.documentElement; const fr = document.querySelector('iframe'); const alvo = fr ? fr.contentDocument : document; const larg = (alvo.documentElement || de).scrollWidth; return { rolagemX: de.scrollWidth > innerWidth + 2, rolagemXframe: larg > innerWidth + 2, larg }; });
    await p.screenshot({ path: `/tmp/claude-0/auditoria/prova/tela-${nome}-${tag}.png` }); console.log(tag, nome, JSON.stringify(m)); await ctx.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
