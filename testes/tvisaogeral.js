// Visão Geral da Produção (UX, docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md): os números não mudam com o layout.
// Monta um período fixo (dados fictícios, mesmas regras do toeereal), lê todos os cartões (todos ligados, "Mais indicadores" aberto),
// o texto dos 13 gráficos e o texto de "Meu painel" e compara com testes/bases/visaogeral-referencia.json.
//   node testes/tvisaogeral.js --gravar   grava a referência (só antes de mudar a tela)
//   node testes/tvisaogeral.js            confere; também tira prints em testes/saida/visaogeral/ (claro/escuro, 390/768/1440)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/visaogeral-referencia.json', SAI = RAIZ + 'testes/saida/visaogeral/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar'), ROTULO = (process.argv.find(a => a.startsWith('--prints=')) || '--prints=depois').slice(9);
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const GRAFICOS = ['Produção boa × meta e capacidade', 'OEE × meta', 'Disponibilidade, Performance e Qualidade', 'PPH real × nominal', 'Scrap % por dia', 'Perdas em minutos por dia',
  'Pareto de paradas', 'Produção por catálogo', 'Resultado por turno', 'Atendimento por hora do dia', 'Cascata de perdas do período', 'Tendência semanal', 'Tendência mensal'];
/* período fixo: 3 dias com produção, scrap, uma parada e caixas do MES (fora de turno) */
const PREP = () => {
  const d = JSON.parse(Store.serialize(Store.S.db)), SD = ServerData, LINE = 'line_vac', D = ['2026-03-09', '2026-03-10', '2026-03-11'];
  const mkShift = (code, name, start, end) => ({ id: 'sh_' + code.toLowerCase(), code, name, lineId: LINE, status: 'ativo', versions: [{ id: 'v_' + code, validFrom: '2000-01-01', validTo: null, start, end, weekdays: [0, 1, 2, 3, 4, 5, 6], active: true, breaks: [], template: null }] });
  d.shifts = [mkShift('T1', 'Turno A', '06:00', '14:30'), mkShift('T2', 'Turno B', '14:30', '22:47'), mkShift('T3', 'Turno C', '22:47', '30:00')];
  d.shifts[2].versions[0].productive = false;
  d.calendar = []; d.productionDays = [];
  const cat = d.catalogs.find(c => !c.deleted && c.active !== false && Engine.resolveTarget(d, D[0], c.id, 'mac_line', LINE));
  Object.assign(d.settings, { foraTurnoDesde: '2026-01-01', continuityMin: 10, serverBoxQty: 1000 });
  const code = (d.downtimeCodes || []).find(c => c.active !== false && !c.deleted && c.affectsA && c.inPareto !== false && !c.deductsPlanned);
  D.forEach((date, k) => { const day = Engine.buildDay(d, date, LINE, 'mac_line', 'teste'); day.demo = false;
    day.shifts.forEach((p, j) => { p.initialCatalogId = cat.id; p.intervals.forEach((i, n) => i.good = 52000 + 1500 * k + 700 * j - 300 * (n % 3)); p.scrap = 120 * (k + 1) + 40 * j; });
    if (code) { const iv = day.shifts[0].intervals[2]; day.events = [{ id: 'ev' + k, codeId: code.id, start: iv.start + 5, end: iv.start + 5 + 12 + 6 * k, minutes: null, intervalId: iv.id, productionShiftId: day.shifts[0].id, manual: false, note: 'teste', impact: { deducts: !!code.deductsPlanned, a: !!code.affectsA, p: !!code.affectsP, q: !!code.affectsQ, pareto: code.inPareto !== false, report: code.inReport !== false } }]; }
    d.productionDays.push(day); });
  const base = SD.dayStartMin(D[1]), rng = (a, z) => { const L = []; for (let m = a; m <= z; m++) L.push(base + m); return L; };
  const seg = (id, lot, ms, b0) => { const e = SD.enc(ms); return { id, lineId: LINE, lot, cat: cat.code, b0, b1: b0 + ms.length - 1, t0: SD.fromMin(ms[0]), t1: SD.fromMin(ms[ms.length - 1]), n: ms.length, base: e.base, m: e.m }; };
  d.server = SD.ensureStore(d); d.server.segments = [seg('s0', 'L-1', rng(20 * 60, 20 * 60 + 10), 1), seg('s1', 'L-2', rng(22 * 60 + 30, 23 * 60 + 40), 1)];
  d.server.lotClass = { 'L-1': { kind: 'normal' }, 'L-2': { kind: 'normal' } };
  Store.S.db = Model.ensure(d); Engine.bumpConfig();
  App.prefs.kcOff = []; App.prefs.moreKpi = true; App.prefs.vgFold = {};
  App.filters.from = D[0]; App.filters.to = D[2]; App.filters.lineId = LINE; App.filters.machineId = ''; App.filters.catalogId = ''; App.filters.shiftId = ''; App.filters.status = '';
  Panel.st().view = 'padrao'; go('overview');
};
const LER = () => {
  const n = s => String(s || '').replace(/\s+/g, ' ').trim(), m = document.getElementById('main');
  const kpis = {}; m.querySelectorAll('.kpi').forEach(k => { const l = k.querySelector('.l'); if (!l) return; const key = n([...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('')) || n(l.textContent);
    const v = n((k.querySelector('.v') || {}).textContent), s = n((k.querySelector('.s') || {}).textContent); (kpis[key] = kpis[key] || []).push(v + ' | ' + s); });
  for (const k in kpis) kpis[k].sort();
  const graf = {}; m.querySelectorAll('section.card').forEach(sc => { const h = sc.querySelector(':scope > header h3'); if (!h) return; const t = n(h.textContent).replace(/^[▾▸]\s*/, '');
    const c = sc.cloneNode(true); c.querySelectorAll('header, button, .vgl-est').forEach(x => x.remove()); graf[t] = n(c.textContent); });
  return { kpis, graf };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => { const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message));
    await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(900);
    await o.evaluate(PREP); await o.waitForTimeout(700); return { c, o }; };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  // Meu painel (o mesmo período): o texto não pode mudar
  await o.evaluate(() => { Panel.st().view = 'mine'; Panel.st().pre = 'custom'; Panel.st().from = '2026-03-09'; Panel.st().to = '2026-03-11'; render(); }); await o.waitForTimeout(600);
  atual.meuPainel = await o.evaluate(() => document.getElementById('main').querySelectorAll('.kpi, section.card').length + ' blocos · ' + [...document.querySelectorAll('#main .kpi .v, #main section.card h3')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
  await o.evaluate(() => { Panel.st().view = 'padrao'; render(); }); await o.waitForTimeout(500);
  ok(GRAFICOS.every(t => atual.graf[t]), `os 13 gráficos na Visão Geral padrão (${Object.keys(atual.graf).filter(t => GRAFICOS.includes(t)).length}/13)`);
  ok(Object.keys(atual.kpis).length >= 20, `cartões lidos: ${Object.keys(atual.kpis).length}`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    const difK = Object.keys(ref.kpis).filter(k => JSON.stringify(ref.kpis[k]) !== JSON.stringify(atual.kpis[k]));
    ok(!difK.length, 'mesmos valores em todos os cartões da referência' + (difK.length ? ': ' + difK.map(k => `${k} [${ref.kpis[k]}] → [${atual.kpis[k] || 'ausente'}]`).join(' ; ') : ` (${Object.keys(ref.kpis).length})`));
    const difG = GRAFICOS.filter(t => ref.graf[t] !== atual.graf[t]);
    ok(!difG.length, 'mesmo texto (valores, rótulos, legendas) nos 13 gráficos' + (difG.length ? ': ' + difG.join(', ') : ''));
    ok(ref.meuPainel === atual.meuPainel, 'Meu painel igual ao de antes');
  }
  // cliques preservados: dia no gráfico → gaveta do dia; Pareto → Paradas
  const cliq = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {};
    const sec = t => [...document.querySelectorAll('#main section.card')].find(s => (s.querySelector(':scope > header h3') || {}).textContent && s.querySelector(':scope > header h3').textContent.includes(t));
    const q = t => { const x = sec(t); return x ? x.querySelectorAll('[data-cid][data-i]').length : -1; };
    out.dia = q('OEE × meta'); out.par = q('Pareto de paradas'); out.temClique = out.dia > 0; out.pareto = out.par > 0; out.total = document.querySelectorAll('#main [data-cid]').length; return out; });
  console.log('     cliques:', JSON.stringify(cliq));
  ok(cliq.temClique && cliq.pareto, 'gráficos com áreas clicáveis (dia e Pareto)');
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  await c.close();
  for (const [w, h, tema] of [[1440, 900, 'dark'], [768, 1024, 'light'], [390, 844, 'light'], [390, 844, 'dark']]) {
    const x = await nova(w, h, tema); const sx = await x.o.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sx <= 1, `${w} px ${tema === 'dark' ? 'escuro' : 'claro'}: sem rolagem lateral (${sx}px)`);
    await x.o.screenshot({ path: SAI + ROTULO + '-' + w + '-' + (tema === 'dark' ? 'escuro' : 'claro') + '.png', fullPage: true }); await x.c.close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FALHA ' + e.stack); process.exit(1); });
