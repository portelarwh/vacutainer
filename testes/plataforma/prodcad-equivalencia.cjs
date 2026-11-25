// Bloco 3 · Task 2: ProdCad.montar (montador em memória) gera as mesmas tabelas que o CadSync grava hoje a partir do cadastro da
// Administração. O CadSync sai na Task 4; até lá este teste prova que a troca de origem não muda o que o motor lê.
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
    await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof CadSync !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(C => {
      const TAB = ['lines', 'families', 'machines', 'catalogs', 'downtimeCodes', 'shifts', 'targets'];
      const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
      const limpa = o => { const x = canon(JSON.parse(JSON.stringify(o))); for (const k of ['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'revision']) delete x[k]; return x; };
      const b = Model.emptyBase('t'); for (const k of [...TAB, 'calendar']) b[k] = [];
      CadSync.aplicar(b, JSON.parse(JSON.stringify(C)), () => {});
      const out = { existe: typeof ProdCad !== 'undefined' };
      if (!out.existe) return out;
      const P = ProdCad.montar(JSON.parse(JSON.stringify(C)));
      out.tabelas = {};
      for (const k of TAB) {
        const a = b[k].map(limpa), n = (P[k] || []).map(limpa);
        if (k === 'shifts') for (const l of [a, n]) for (const s of l) for (const v of s.versions) delete v.id;
        if (k === 'targets') for (const l of [a, n]) for (const t of l) delete t.id;
        if (k === 'catalogs') for (const l of [a, n]) for (const c of l) delete c.id;   // o CadSync sorteava o id da 2ª vigência em diante
        out.tabelas[k] = JSON.stringify(a) === JSON.stringify(n) ? 'igual' : { cadSync: a, prodCad: n };
      }
      out.idsVersao = P.shifts.flatMap(s => s.versions.map(v => v.id));
      out.idsMeta = P.targets.map(t => t.id);
      out.idsCat = P.catalogs.map(c => c.id);
      const cal = l => (l || []).map(c => ({ date: c.date, lineId: c.lineId, kind: c.kind, reason: c.reason, reasonType: c.reasonType, origin: c.origin })).sort((x, y) => x.date < y.date ? -1 : 1);
      out.calendario = JSON.stringify(cal(b.calendar)) === JSON.stringify(cal(P.calendar)) ? 'igual' : { cadSync: cal(b.calendar), prodCad: cal(P.calendar) };
      const falta = [], difere = [];
      for (const [k, v] of Object.entries(P.settings || {})) if (JSON.stringify(b.settings[k]) !== JSON.stringify(v)) difere.push(k);
      const base = Model.emptyBase('t').settings;
      for (const k of Object.keys(b.settings)) if (!['cadSync', 'calIgnorados'].includes(k) && JSON.stringify(b.settings[k]) !== JSON.stringify(base[k]) && !(k in (P.settings || {}))) falta.push(k);
      out.settings = { difere, falta, chaves: Object.keys(P.settings || {}).sort() };
      return out;
    }, CADASTRO);
    assert.equal(r.existe, true, 'ProdCad existe');
    for (const [k, v] of Object.entries(r.tabelas)) assert.equal(v, 'igual', 'tabela ' + k + ' igual à do CadSync: ' + JSON.stringify(v).slice(0, 700));
    assert.equal(r.calendario, 'igual', 'marcas de calendário do cadastro: ' + JSON.stringify(r.calendario).slice(0, 400));
    assert.deepEqual(r.settings.difere, [], 'parâmetros derivados iguais aos do CadSync');
    assert.deepEqual(r.settings.falta, [], 'nenhum parâmetro que o CadSync gravava ficou de fora');
    assert.deepEqual(r.idsCat, ['cat_360060', 'cat_360060_2026-01-01', 'cat_360055'], 'ids de catálogo derivados do código e da vigência');
    assert.deepEqual(r.idsVersao, ['sv_t1_2025-01-01_12345', 'sv_t1_2026-01-01_12345', 'sv_t1_2026-01-01_6', 'sv_t2_2025-01-01_123456', 'sv_t3_2025-01-01_12345'], 'ids de versão de turno derivados');
    assert.deepEqual(r.idsMeta, ['tg_oee_vac_2025-01-01', 'tg_oee_vac_2026-01-01'], 'ids de meta derivados');
    assert.deepEqual(erros, []);
    console.log('ok ProdCad.montar equivale ao CadSync (7 tabelas, calendário e parâmetros) com ids derivados do código');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
