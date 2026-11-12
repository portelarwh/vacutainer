// Paradas 1.1.0 · refatoração UX/UI (só apresentação). Referência gravada ANTES da mudança, com os mesmos dados (modo de teste, data fixa):
//   - números das funções que alimentam as telas: statsEquip (MTBF, MTTR, MTBS, disponibilidade, quebras…), programado, recorrencias,
//     Pareto em todas as dimensões × minutos/ocorrências (ranking, valores, % acumulado), totais do período;
//   - o que a tela mostra: dicas (<title>) das barras de cada gráfico, linhas das tabelas de Equipamentos e Recorrência.
// Depois confere a tela nova: faixas da Visão geral, filtros ativos, Pareto (seletores, seleção ativa, 80 % opcional, clique, + Ação),
// seleção por clique nos gráficos, temas, larguras, impressão e sem erro no console.
//   node testes/tparadas_ux.js --gravar   grava a referência (só antes de mudar a tela)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/paradas-ux-referencia.json', SAI = RAIZ + 'testes/saida/paradas-ux/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
/* lê números (funções) e o que a tela mostra (dicas das barras, tabelas) em todas as abas analíticas */
const LER = async () => {
  const w = t => new Promise(r => setTimeout(r, t)), n = s => String(s || '').replace(/\s+/g, ' ').trim(), out = {};
  const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;
  const all = eventosTodos(), L = F.apply(all), perda = L.filter(e => !NAO_PERDA.has(classe(e)));
  out.totais = { registros: L.length, minutos: perda.reduce((s, e) => s + e.minutos, 0), ocorrencias: perda.reduce((s, e) => s + (e.ocorrencias || 1), 0) };
  const P = programado(L, F.de, F.ate); out.programado = { min: r2(P.min), fonte: P.fonte, dias: P.dias };
  out.equip = statsEquip(F.apply(all, { eq: 1 }), F.de, F.ate).map(s => [s.eq, r2(s.min), s.n, s.nQ, r2(s.mQ), r2(s.mOp), s.nMicro, r2(s.mtbf), r2(s.mttr), r2(s.mtbs), r2(s.disp), s.top || '']);
  const ate = F.ate || all.reduce((m, e) => e.dia > m ? e.dia : m, '');
  out.recor = recorrencias(all, ate).map(r => [r.k, r.n30, r2(r.min30), r.n, r2(r.min), r.meses, r.ult, r.acao ? r.acao.status : '']);
  const dicas = id => { const e = document.getElementById(id); return e ? [...e.querySelectorAll('[data-k] > title, [data-k] title')].map(t => n(t.textContent)) : []; };
  App.go('geral'); await w(300); out.geral = { mes: n((document.getElementById('chMes') || {}).textContent ? [...document.querySelectorAll('#chMes title')].map(t => n(t.textContent)).join(' | ') : ''), eq: dicas('chEq'), cl: dicas('chCl'), tu: dicas('chTu') };
  out.pareto = {}; const P0 = VIEWS.pareto, d0 = P0.dim, m0 = P0.med;
  for (const dim of ['codigo', 'grupo', 'equip', 'classe', 'comp', 'modo', 'turno', 'eqcod', 'desc']) for (const med of ['min', 'n']) {
    P0.dim = dim; P0.med = med; App.sel.par = null; App.go('pareto'); await w(120);
    out.pareto[dim + '|' + med] = { ranking: (P0.G || []).slice(0, 25).map(g => [g.k, r2(g.min), g.n]), dicas: dicas('pCh') };
  }
  P0.dim = d0; P0.med = m0;
  App.go('equip'); await w(200); out.telaEquip = [...document.querySelectorAll('#eqT tbody tr, #eqT tr')].map(tr => n(tr.textContent)).filter(Boolean);
  App.go('recor'); await w(200); out.telaRecor = [...document.querySelectorAll('#rcT tbody tr, #rcT tr')].map(tr => n(tr.textContent).replace(/\s*\+ Ação.*$/, '').replace(/Planner/g, '')).filter(Boolean);
  App.go('geral'); await w(200);
  return out;
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => {
    const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00'));
    const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message)); o.on('console', m => { if (m.type() === 'error') pe.push('console: ' + m.text()); }); o.on('dialog', d => d.accept());
    await o.goto('file://' + RAIZ + 'paginas/Paradas.html'); await o.waitForTimeout(900);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); try { localStorage.removeItem('vac.grupos.paradas'); localStorage.removeItem('vac.paradas.p80'); } catch (e) { } modoTeste(); App.go('geral'); }); await o.waitForTimeout(900);
    return { c, o };
  };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(atual.equip.length > 0 && Object.keys(atual.pareto).length === 18 && atual.recor.length >= 0, `lidos: ${atual.equip.length} equipamentos, 18 Paretos, ${atual.recor.length} recorrências, ${atual.totais.registros} registros`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); await b.close(); process.exit(errs.length ? 1 : 0); }
  const ref = JSON.parse(fs.readFileSync(REF, 'utf8')), eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  ok(eq(ref.totais, atual.totais) && eq(ref.programado, atual.programado), `totais iguais: ${atual.totais.minutos} min, ${atual.totais.ocorrencias} ocorrências, tempo programado ${atual.programado.min} min (${atual.programado.fonte})`);
  ok(eq(ref.equip, atual.equip), 'Equipamentos iguais: tempo, ocorrências, quebras, MTBF, MTTR, MTBS, disponibilidade e código principal');
  ok(eq(ref.recor, atual.recor), `Recorrências iguais (${atual.recor.length})`);
  const difP = Object.keys(ref.pareto).filter(k => !eq(ref.pareto[k].ranking, atual.pareto[k].ranking));
  ok(!difP.length, 'Pareto: mesmo ranking e valores nas 9 dimensões × minutos/ocorrências' + (difP.length ? ': ' + difP.join(', ') : ''));
  const difD = Object.keys(ref.pareto).filter(k => !eq(ref.pareto[k].dicas, atual.pareto[k].dicas));
  ok(!difD.length, 'Pareto: mesmas dicas das barras (valor, ocorrências)' + (difD.length ? ': ' + difD.join(', ') : ''));
  ok(eq(ref.geral, atual.geral), 'Visão geral: mesmas dicas dos gráficos (mês, equipamentos, classe, turno)');
  ok(eq(ref.telaEquip, atual.telaEquip), `tabela de Equipamentos com as mesmas linhas (${atual.telaEquip.length})`);
  ok(eq(ref.telaRecor, atual.telaRecor), `tabela de Recorrência com as mesmas linhas (${atual.telaRecor.length})`);
  // ----- tela nova (etapa 1: Visão geral e Pareto)
  const T = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)), q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)], out = {}, M = () => document.getElementById('main');
    App.go('geral'); await w(300);
    out.faixas = qa('#main .pux-faixa').map(x => x.dataset.puxFaixa).join(',');
    out.principais = qa('#main .pux-kpis-main .kpi .l').map(x => x.textContent.trim()).join('|');
    out.secundarios = qa('#main .pux-kpis-sec .kpi .l').map(x => x.textContent.trim()).join('|');
    out.prio = !!q('#main .pux-prio .acao') && !!q('#main .pux-prio .decis');
    out.visual = !!q('#main .pux-visual #chMes') && !!q('#main .pux-visual #chEq');
    out.grupos = qa('#main .vk-grp').length; out.atalhos = qa('#main [data-vk-go]').length;
    out.semAtivos = !q('#main .pux-ativos .pux-chip');
    // filtros ativos: clicar num equipamento do Pareto mostra a pílula; o X tira
    const k = (q('#chEq [data-k]') || {}).dataset ? q('#chEq [data-k]').dataset.k : ''; q('#chEq [data-k]').dispatchEvent(new MouseEvent('click', { bubbles: true })); await w(250);
    out.filtrouEq = F.eq === k; out.chip = qa('#main .pux-ativos .pux-chip').map(c => c.textContent.trim()).join('|');
    const x = q('#main .pux-ativos [data-pux-tira="eq"]'); if (x) { x.click(); await w(250); } out.tirou = F.eq === '';
    // seleção visível no gráfico
    q('#chCl [data-k]').dispatchEvent(new MouseEvent('click', { bubbles: true })); await w(250); out.selCl = !!q('#chCl [data-k].pux-on'); F.cls = ''; App.render(); await w(200);
    // Pareto
    VIEWS.pareto.dim = 'codigo'; VIEWS.pareto.med = 'min'; App.sel.par = null; App.go('pareto'); await w(300);
    out.pDims = qa('#pDim button').length; out.pRolagem = getComputedStyle(q('#pDim')).flexWrap + '/' + getComputedStyle(q('#pDim')).overflowX;
    out.pLeg = !!q('#pCh .pux-leg'); out.p80off = !q('#pCh .pux-80');
    q('#pRef80').click(); await w(250); out.p80on = !!q('#pCh .pux-80') && /80/.test(q('#pCh .pux-80').textContent || q('#pCh').innerHTML); out.p80naoMeta = !/meta/i.test((q('#pCh .pux-80') || {}).textContent || '');
    out.pAcum = qa('#pCh .pux-acum').length > 0;
    const g = q('#pCh [data-k]'); const kk = g.dataset.k; g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await w(300);
    out.pSel = App.sel.par === kk && !!q('#main .pux-selbar') && /paradas/.test(q('#main .pux-selbar').textContent) && !!q('#pAcao') && !!q('#pTab');
    out.pSelBarra = !!q('#pCh [data-k].pux-on');
    q('#pClr').click(); await w(250); out.pLimpou = App.sel.par == null;
    q('#pRef80').click(); await w(150);
    App.go('geral'); await w(200);
    return out;
  });
  console.log('     tela:', JSON.stringify(T));
  ok(T.faixas === 'filtros,principais,secundarios,prioridades,visual,complementar', `Visão geral em faixas: ${T.faixas}`);
  ok(T.principais === 'Tempo de parada|Quebras|MTBF da linha|MTTR|Máquina crítica' && T.secundarios === 'Microparadas|Código temporário', `indicadores principais (${T.principais}) e secundários (${T.secundarios})`);
  ok(T.prio && T.visual && T.grupos >= 2 && T.atalhos >= 5, 'prioridades (ação, decisões), análise visual (mês e equipamentos), grupos recolhíveis e atalhos');
  ok(T.semAtivos && T.filtrouEq && /Equipamento/.test(T.chip) && T.tirou, `filtros ativos em pílulas, com X para tirar (${T.chip})`);
  ok(T.selCl, 'seleção ativa marcada no gráfico');
  ok(T.pDims === 9 && /wrap/.test(T.pRolagem), `Pareto: as 9 dimensões, seletor que quebra linha (${T.pRolagem})`);
  ok(T.pLeg && T.pAcum, 'Pareto: legenda e % acumulado diferenciado das barras');
  ok(T.p80off && T.p80on && T.p80naoMeta, 'Pareto: referência de 80 % opcional (desligada por padrão, não chamada de meta)');
  ok(T.pSel && T.pSelBarra && T.pLimpou, 'Pareto: clique na barra seleciona (barra marcada, faixa da seleção, registros, + Ação) e Limpar volta');
  // impressão e larguras
  await o.emulateMedia({ media: 'print' }); const imp = await o.evaluate(() => getComputedStyle(document.querySelector('#main .pux-ativos') || document.body).display); await o.emulateMedia({ media: 'screen' });
  ok(imp !== undefined, 'impressão da Visão geral sem erro');
  await o.screenshot({ path: SAI + 'geral-1440-claro.png', fullPage: true });
  await o.evaluate(async () => { VIEWS.pareto.dim = 'equip'; App.go('pareto'); await new Promise(r => setTimeout(r, 300)); const g = document.querySelector('#pCh [data-k]'); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await o.waitForTimeout(300); await o.screenshot({ path: SAI + 'pareto-1440-claro.png', fullPage: true });
  await c.close();
  for (const [w, h, tema] of [[1440, 900, 'dark'], [1024, 900, 'light'], [768, 1024, 'light'], [390, 844, 'light'], [390, 844, 'dark']]) {
    const x = await nova(w, h, tema); const sx = await x.o.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sx <= 1, `${w} px ${tema === 'dark' ? 'escuro' : 'claro'}: Visão geral sem rolagem lateral (${sx}px)`);
    await x.o.screenshot({ path: SAI + `geral-${w}-${tema === 'dark' ? 'escuro' : 'claro'}.png`, fullPage: true });
    await x.o.evaluate(() => App.go('pareto')); await x.o.waitForTimeout(300); const sp = await x.o.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(sp <= 1, `${w} px ${tema === 'dark' ? 'escuro' : 'claro'}: Pareto sem rolagem lateral (${sp}px)`);
    await x.o.screenshot({ path: SAI + `pareto-${w}-${tema === 'dark' ? 'escuro' : 'claro'}.png`, fullPage: true }); await x.c.close();
  }
  ok(!pe.length, 'sem erro de página nem no console' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FALHA ' + e.stack); process.exit(1); });
