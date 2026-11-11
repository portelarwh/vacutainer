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
    const c = sc.cloneNode(true); c.querySelectorAll('header, button, .vgl-est, .c-un').forEach(x => x.remove()); c.querySelectorAll('svg').forEach(v => { const g = v.querySelector('g.ax'); if (g && g.querySelector('line.gl')) g.remove(); });   /* 2.4.51: a linha da unidade e os rótulos do eixo Y (só escala) ficam fora da comparação; os valores das barras e da tabela continuam */ graf[t] = n(c.textContent); });
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
  // 2.4.51 · unidade em todo gráfico cujo eixo não a traz; eixo em % sem rótulos repetidos
  const un = await o.evaluate(() => { const r = {}; document.querySelectorAll('#main section.card').forEach(sc => { const h = sc.querySelector(':scope > header h3'), ch = sc.querySelector('.chart'); if (!h || !ch) return;
    const t = h.textContent.replace(/[▾▸]/g, '').replace(/\s+/g, ' ').trim(), u = sc.querySelector('.c-un'), ax = ch.querySelector('svg g.ax'), L = ax && ax.querySelector('line.gl') ? [...ax.querySelectorAll('text')].map(x => x.textContent) : [];
    r[t] = { u: u ? u.textContent.trim() : '', pct: L.length > 0 && L.every(l => /%$/.test(l)), rep: new Set(L).size < L.length }; }); return r; });
  const semUn = GRAFICOS.filter(t => un[t] && !un[t].pct && !un[t].u);
  ok(!semUn.length, 'todo gráfico sem % no eixo diz a unidade ("Valores em …")' + (semUn.length ? ': ' + semUn.join(', ') : ''));
  ok(un['Produção boa × meta e capacidade'].u === 'Valores em mil tubos' && un['PPH real × nominal'].u === 'Valores em mil tubos/h' && un['Pareto de paradas'].u === 'Valores em min', 'unidades: produção em mil tubos, PPH em mil tubos/h, paradas em min');
  const rep = GRAFICOS.filter(t => un[t] && un[t].rep);
  ok(!rep.length, 'nenhum eixo com rótulos repetidos' + (rep.length ? ': ' + rep.join(', ') : ''));
  ok(Object.keys(atual.kpis).length >= 20, `cartões lidos: ${Object.keys(atual.kpis).length}`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    // "Mais indicadores" deixa de repetir Produção boa e Capacidade planejada quando já estão na grade (decisão de 11/11/2026): compara os valores sem repetição
    const uniq = L => L ? [...new Set(L)] : L;
    const difK = Object.keys(ref.kpis).filter(k => JSON.stringify(uniq(ref.kpis[k])) !== JSON.stringify(uniq(atual.kpis[k])));
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
  if (!GRAVAR) {
    // comportamento do layout novo (2.4.49)
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, m = document.getElementById('main'), q = s => m.querySelector(s), qa = s => [...m.querySelectorAll(s)];
      out.secoes = qa('.vgl-sec h3').map(x => x.textContent);
      out.grupos = qa('.vgl-grp').map(g => g.dataset.vglGrupo + ':' + g.querySelectorAll('section.card').length);
      out.imprimir = qa('button').filter(b => /Imprimir/.test(b.textContent)).length;
      out.exportar = !!q('.vg-bar #ovExp');
      out.situacao = (q('.vgl-oee') || {}).textContent || ''; out.perda = (q('.vgl-perda') || {}).textContent || ''; out.decide = !!q('.vgl-acao .decide');
      out.diag = qa('.vgl-dc').length;
      out.maisDup = qa('details.more-kpi .kpi .l').map(l => [...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('').trim()).filter(t => ['Produção boa', 'Capacidade planejada'].includes(t)).length;
      out.avisoSem = /tendência aparece com 2 semanas/.test((qa('.vgl-grp[data-vgl-grupo="F"] .vgl-est')[0] || {}).textContent || '');
      // recolher o grupo C: lembra em vgGrupo, não mexe em vgFold
      q('[data-vgl-grupo="C"] .vgl-gh').click(); await w(50);
      out.fechouC = q('[data-vgl-grupo="C"]').classList.contains('fechado') && App.prefs.vgGrupo.C === 1 && !Object.keys(App.prefs.vgFold || {}).length;
      render(); await w(400); out.lembrou = document.querySelector('#main [data-vgl-grupo="C"]').classList.contains('fechado');
      // Editar cards: desligar Produção boa na grade → ela volta em Mais indicadores
      App.prefs.kcOff = ['Produção boa']; render(); await w(400);
      const g2 = [...document.querySelectorAll('#main section.vg-ind .kpi .l')].map(l => [...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('').trim());
      out.desligada = !g2.includes('Produção boa') && [...document.querySelectorAll('#main details.more-kpi .kpi .l')].some(l => /Produção boa/.test(l.textContent));
      App.prefs.kcOff = []; render(); await w(400);
      // Limpar: Máquina/Catálogo/Turno/Status em Todos e período do mês atual
      App.filters.status = 'aberto'; App.filters.shiftId = 'sh_t1'; render(); await w(400);
      document.querySelector('#vglLimpar').click(); await w(500);
      out.limpar = App.filters.status === '' && App.filters.shiftId === '' && App.filters.to >= U.today().slice(0, 8) + '01' && App.filters.lineId === 'line_vac';
      // 1 dia no período: aviso nos gráficos por dia, sem tendência inventada
      App.filters.from = '2026-03-10'; App.filters.to = '2026-03-10'; App.filters.status = ''; render(); await w(500);
      out.umDia = [...document.querySelectorAll('#main .vgl-est')].filter(x => /1 dia no período/.test(x.textContent)).length;
      out.umDiaPior = /Só 1 dia/.test((document.querySelector('#main .vgl-dg') || {}).textContent || '');
      App.filters.from = '2026-03-09'; App.filters.to = '2026-03-11'; App.prefs.vgGrupo = {}; render(); await w(500);
      // Meu painel não recebe a organização da visão padrão
      Panel.st().view = 'mine'; render(); await w(500); out.painelSemVgl = !document.querySelector('#main .vgl-sec, #main .vgl-grp');
      Panel.st().view = 'padrao'; render(); await w(500);
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, situacao: L.situacao.slice(0, 80), perda: L.perda.slice(0, 80) }));
    ok(L.secoes.join('|') === 'Situação do período|Números do período|Diagnóstico rápido|Análises de desempenho|Explorar dados', 'cinco seções na ordem: Situação, Números, Diagnóstico, Análises, Explorar');
    ok(L.grupos.join(' ') === 'A:2 B:3 C:3 D:1 E:2 F:2', `13 gráficos em 6 grupos (${L.grupos.join(' ')})`);
    ok(L.imprimir === 1 && L.exportar, 'um botão Imprimir só; Exportar junto das ações da visão');
    ok(/OEE do período/.test(L.situacao) && /Meta vigente/.test(L.situacao) && /Abaixo da meta|Na meta/.test(L.situacao) && /Período anterior|Sem dados no período anterior/.test(L.situacao), 'Situação: OEE, meta, desvio, estado em texto e período anterior');
    ok(L.decide && /Maior etapa da cascata/.test(L.perda) && /Parada que mais tirou tempo: TRC/.test(L.perda), 'Ação prioritária mantida e maior perda (cascata e Pareto) ao lado');
    ok(L.diag === 3 && L.maisDup === 0 && L.desligada, 'Diagnóstico com 3 cartões; Mais indicadores sem repetir os ligados na grade (e com eles quando desligados)');
    ok(L.avisoSem && L.umDia >= 6 && L.umDiaPior, 'avisos honestos: tendência curta e período de 1 dia');
    ok(L.fechouC && L.lembrou, 'grupo recolhido lembra a escolha (vgGrupo) sem mexer nas dobras dos blocos');
    ok(L.limpar, 'Limpar volta para o mês e Todos (a Linha continua)');
    ok(L.painelSemVgl, 'Meu painel sem a organização da visão padrão');
    // impressão: grupos abertos
    await o.evaluate(() => { const g = document.querySelector('#main [data-vgl-grupo="B"] .vgl-gh'); g.click(); }); await o.emulateMedia({ media: 'print' });
    const imp = await o.evaluate(() => getComputedStyle(document.querySelector('#main [data-vgl-grupo="B"] .vgl-gb')).display);
    await o.emulateMedia({ media: 'screen' }); ok(imp !== 'none', `impressão com os grupos abertos (${imp})`);
  }
  await c.close();
  for (const [w, h, tema] of [[1440, 900, 'dark'], [768, 1024, 'light'], [390, 844, 'light'], [390, 844, 'dark']]) {
    const x = await nova(w, h, tema); const sx = await x.o.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sx <= 1, `${w} px ${tema === 'dark' ? 'escuro' : 'claro'}: sem rolagem lateral (${sx}px)`);
    await x.o.screenshot({ path: SAI + ROTULO + '-' + w + '-' + (tema === 'dark' ? 'escuro' : 'claro') + '.png', fullPage: true }); await x.c.close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FALHA ' + e.stack); process.exit(1); });
