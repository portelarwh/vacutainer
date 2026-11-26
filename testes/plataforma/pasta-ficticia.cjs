// Ajuda dos testes de persistência: pasta fictícia em OPFS carregada com as bases que o código atual gera; conecta, entra com um ID fictício e abre um módulo.
// Exclusivamente dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), generate = require('./generate-fixtures.cjs');
const files = { portal: 'portal-base.json', oee: 'oee-vacutainer-base.json', perdas: 'perdas-base.json', gel: 'fifo-base.json', paradas: 'paradas-base.json', equip: 'equipamentos-base.json', inic: 'iniciativas-base.json', linha: 'linha360-base.json', cad: 'vacutainer-cadastros.json', ordens: 'ordens-base.json' };
let cache = null;
module.exports = async function abrir(rota, titulo, fn) {
  cache = cache || await generate();
  const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html')), srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()), ctx = await b.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss());
  try {
    await p.clock.setFixedTime(new Date('2026-11-15T12:00:00Z')); await p.goto('http://127.0.0.1:' + srv.address().port + '/');
    await p.evaluate(async ({ bases, files }) => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio', { create: true }), dir = await root.getDirectoryHandle('00. Bases', { create: true });
      for (const [id, file] of Object.entries(files)) { if (!bases[id]) continue; const w = await (await dir.getFileHandle(file, { create: true })).createWritable(); await w.write(JSON.stringify(bases[id])); await w.close(); }
      window.fixtureDir = dir; window.showDirectoryPicker = async () => root; }, { bases: cache.bases, files });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/#/oee');
    const conectar = p.locator('.heading-actions').locator('[data-act="connect"]'); await conectar.waitFor({ timeout: 60000 }); await conectar.click();
    await p.locator('.folder-info strong').filter({ hasText: 'Somente-Ficticio' }).waitFor({ timeout: 60000 });
    await p.evaluate(() => { const prefix = 'vac.app.' + vacAppHost.scope + '.'; localStorage.setItem(prefix + 'vac.userId', '9099'); localStorage.setItem(prefix + 'vac.user', 'Pessoa Fictícia de Verificação'); localStorage.setItem(prefix + 'vac.sessao', JSON.stringify({ id: '9099', ate: Date.now() + 3600000 })); });
    await p.evaluate(r => { location.hash = '#/' + r; }, rota);
    const q = p.locator('iframe[title="' + titulo + '"]'); await q.waitFor({ timeout: 60000 }); const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto(), null, { timeout: 60000 });
    return await fn(f, p, erros);
  } finally { await b.close(); srv.close(); }
};
