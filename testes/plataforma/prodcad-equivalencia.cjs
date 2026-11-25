// Bloco 3 · Task 2: ProdCad.montar (montador em memória) gera as mesmas tabelas que o antigo CadSync gravava a partir do cadastro da
// Administração. A referência (testes/amostras/prodcad-esperado.json) foi congelada a partir da saída do CadSync, antes de ele sair (Task 4).
// Dados fictícios. Ignora só os campos de controle (createdAt/By, updatedAt/By, revision) e os ids que o CadSync sorteava
// (versão de turno e meta): o ProdCad os deriva do código e da vigência, e o formato deles é conferido à parte.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

const { CADASTRO } = require('./prodcad-fixture.cjs');

(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  try {
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' }); const p = await ctx.newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof ProdCad !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(C => {
      const TAB = ['lines', 'families', 'machines', 'catalogs', 'downtimeCodes', 'shifts', 'targets'];
      const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
      const limpa = o => { const x = canon(JSON.parse(JSON.stringify(o))); for (const k of ['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'revision']) delete x[k]; return x; };
      const sem = (k, l) => l.map(limpa).filter(o => !(k === 'catalogs' && o.active === false && o.status === 'inativo')).map(o => { if (k === 'shifts') o.versions.forEach(v => delete v.id); if (k === 'targets' || k === 'catalogs') delete o.id; return o; });
      const cal = l => (l || []).map(c => ({ date: c.date, lineId: c.lineId, kind: c.kind, reason: c.reason, reasonType: c.reasonType, origin: c.origin })).sort((x, y) => x.date < y.date ? -1 : 1);
      const out = { existe: typeof ProdCad !== 'undefined' };
      if (!out.existe) return out;
      const P = ProdCad.montar(JSON.parse(JSON.stringify(C)));
      const base = Model.emptyBase('t').settings;
      const mudou = (st) => Object.fromEntries(Object.keys(st).filter(k => !['cadSync', 'calIgnorados'].includes(k) && JSON.stringify(st[k]) !== JSON.stringify(base[k])).sort().map(k => [k, st[k]]));
      // o que o ProdCad entrega (só as chaves de parâmetro que mudam o padrão, para comparar com o que o CadSync gravava)
      out.obtido = { tabelas: Object.fromEntries(TAB.map(k => [k, sem(k, P[k] || [])])), calendario: cal(P.calendar), settings: mudou(Object.assign({}, base, P.settings)) };
      // o CadSync, quando ainda existe (só para regravar a referência a partir do código antigo)
      if (typeof CadSync !== 'undefined') {
        const b = Model.emptyBase('t'); for (const k of [...TAB, 'calendar']) b[k] = [];
        CadSync.aplicar(b, JSON.parse(JSON.stringify(C)), () => {});
        out.esperado = { tabelas: Object.fromEntries(TAB.map(k => [k, sem(k, b[k])])), calendario: cal(b.calendar), settings: mudou(b.settings) };
      }
      out.idsVersao = P.shifts.flatMap(s => s.versions.map(v => v.id));
      out.idsMeta = P.targets.map(t => t.id);
      out.idsCat = P.catalogs.map(c => c.id);
      return out;
    }, CADASTRO);
    const fs = require('node:fs'), path = require('node:path'), ref = path.resolve(__dirname, '../amostras/prodcad-esperado.json');
    if (process.argv.includes('--gravar')) { assert.ok(r.esperado, 'regravar exige o código antigo, com o CadSync'); fs.writeFileSync(ref, JSON.stringify(r.esperado, null, 2) + '\n', { flag: 'wx' }); console.log('ok referência do CadSync gravada'); return; }
    const esperado = JSON.parse(fs.readFileSync(ref, 'utf8'));
    r.tabelas = Object.fromEntries(Object.keys(esperado.tabelas).map(k => [k, JSON.stringify(esperado.tabelas[k]) === JSON.stringify(r.obtido.tabelas[k]) ? 'igual' : { esperado: esperado.tabelas[k], obtido: r.obtido.tabelas[k] }]));
    r.calendario = JSON.stringify(esperado.calendario) === JSON.stringify(r.obtido.calendario) ? 'igual' : { esperado: esperado.calendario, obtido: r.obtido.calendario };
    r.settings = { difere: JSON.stringify(esperado.settings) === JSON.stringify(r.obtido.settings) ? [] : [{ esperado: esperado.settings, obtido: r.obtido.settings }], falta: [] };
    assert.equal(r.existe, true, 'ProdCad existe');
    for (const [k, v] of Object.entries(r.tabelas)) assert.equal(v, 'igual', 'tabela ' + k + ' igual à do CadSync: ' + JSON.stringify(v).slice(0, 700));
    assert.equal(r.calendario, 'igual', 'marcas de calendário do cadastro: ' + JSON.stringify(r.calendario).slice(0, 400));
    assert.deepEqual(r.settings.difere, [], 'parâmetros derivados iguais aos do CadSync');
    assert.deepEqual(r.settings.falta, [], 'nenhum parâmetro que o CadSync gravava ficou de fora');
    assert.deepEqual(r.idsCat, ['cat_360060_2025-01-01', 'cat_360060_2026-01-01', 'cat_360060_2024-01-01', 'cat_360055_2025-01-01'], 'ids de catálogo sempre cat_<código>_<de>');
    assert.deepEqual(r.idsVersao, ['sv_t1_2025-01-01_12345', 'sv_t1_2026-01-01_12345', 'sv_t1_2026-01-01_6', 'sv_t2_2025-01-01_123456', 'sv_t3_2025-01-01_12345'], 'ids de versão de turno derivados');
    assert.deepEqual(r.idsMeta, ['tg_oee_vac_2025-01-01', 'tg_oee_vac_2026-01-01'], 'ids de meta derivados');
    assert.deepEqual(erros, []);
    console.log('ok ProdCad.montar equivale ao CadSync (7 tabelas, calendário e parâmetros) com ids derivados do código');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
