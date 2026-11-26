const { chromium } = require('/home/user/vacutainer/node_modules/playwright'), http = require('http'), fs = require('fs');
const html = fs.readFileSync('/home/user/vacutainer/Plataforma.html');
async function abrir(fn) {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require('/home/user/vacutainer/testes/plataforma/chromium.cjs')());
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }), erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
  const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
  const f = await (await q.elementHandle()).contentFrame();
  await f.waitForFunction(() => window.vacPagina?.pronto() && typeof Engine !== 'undefined' && db().productionDays.length, null, { timeout: 30000 });
  try { return await fn(f, p, erros); } finally { await b.close(); srv.close(); }
}
module.exports = { abrir };
