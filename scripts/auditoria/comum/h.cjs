// Harness: abre a Produção em modo demonstração (dados fictícios) a partir de um worktree
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
module.exports = async function abrir(wt, fn, opt = {}) {
  const html = fs.readFileSync(path.join(wt, 'Plataforma.html'));
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require(path.join(wt, 'testes/plataforma/chromium.cjs'))()), ctx = await b.newContext({ viewport: opt.vp || { width: 1440, height: 900 }, timezoneId: 'UTC' }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  try {
    await p.clock.setFixedTime(new Date('2026-11-19T15:00:00Z')); await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/' + (opt.rota || 'oee?tab=launch'));
    const q = p.locator('iframe[title="' + (opt.titulo || 'Módulo Produção') + '"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 60000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto(), null, { timeout: 60000 });
    return await fn(f, p, erros);
  } finally { await b.close(); srv.close(); }
};
