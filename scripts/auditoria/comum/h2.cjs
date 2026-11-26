// Harness 2: pasta fictícia em OPFS carregada com as bases geradas pelo próprio SHA; conecta e abre um módulo
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const files = { portal: 'portal-base.json', oee: 'oee-vacutainer-base.json', perdas: 'perdas-base.json', gel: 'fifo-base.json', paradas: 'paradas-base.json', equip: 'equipamentos-base.json', inic: 'iniciativas-base.json', linha: 'linha360-base.json', cad: 'vacutainer-cadastros.json', ordens: 'ordens-base.json' };
module.exports = async function abrir(wt, rota, titulo, fn) {
  const fx = JSON.parse(fs.readFileSync(path.join(wt, '.test-cache/fixtures.json'))), html = fs.readFileSync(path.join(wt, 'Plataforma.html'));
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require(path.join(wt, 'testes/plataforma/chromium.cjs'))()), ctx = await b.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss());
  try {
    await p.clock.setFixedTime(new Date('2026-11-15T12:00:00Z')); await p.goto('http://127.0.0.1:' + srv.address().port + '/');
    await p.evaluate(async ({ bases, files, cadVazio }) => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio', { create: true }), dir = await root.getDirectoryHandle('00. Bases', { create: true });
      for (const [id, file] of Object.entries(files)) { if (!bases[id]) continue; const w = await (await dir.getFileHandle(file, { create: true })).createWritable(); await w.write(id === 'cad' && cadVazio ? '' : JSON.stringify(bases[id])); await w.close(); }
      window.fixtureDir = dir; window.showDirectoryPicker = async () => root; }, { bases: fx.bases, files, cadVazio: !!process.env.CAD_VAZIO });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/#/oee'); // a casca precisa de uma rota com o botão de conectar
    const conectar = p.locator('.heading-actions').locator('[data-act="connect"]'); await conectar.waitFor({ timeout: 60000 }); await conectar.click();
    await p.locator('.folder-info strong').filter({ hasText: 'Somente-Ficticio' }).waitFor({ timeout: 60000 });
    await p.evaluate(() => { const prefix = 'vac.app.' + vacAppHost.scope + '.'; localStorage.setItem(prefix + 'vac.userId', '9099'); localStorage.setItem(prefix + 'vac.user', 'Pessoa Fictícia de Verificação'); localStorage.setItem(prefix + 'vac.sessao', JSON.stringify({ id: '9099', ate: Date.now() + 3600000 })); });
    await p.evaluate(r => { location.hash = '#/' + r; }, rota);
    const q = p.locator('iframe[title="' + titulo + '"]'); await q.waitFor({ timeout: 60000 }); const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto(), null, { timeout: 60000 });
    return await fn(f, p, fx, erros);
  } finally { await b.close(); srv.close(); }
};
