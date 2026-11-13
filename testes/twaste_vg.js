// Waste › Visão Geral no padrão visual comum (vacLayout do kit, 11/11/2026): os números não mudam com o layout.
// Lê, no modo de teste (dados fictícios), todos os indicadores, os totais do Resumo, o quadro por competência, os 4 gráficos e a tabela
// e compara com testes/bases/waste-vg-referencia.json (gravada antes da mudança).
//   node testes/twaste_vg.js --gravar   grava a referência (só antes de mudar a tela)
//   node testes/twaste_vg.js            confere; também tira prints em testes/saida/waste-vg/ (claro/escuro, 390/768/1440)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/waste-vg-referencia.json', SAI = RAIZ + 'testes/saida/waste-vg/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar'), ROTULO = (process.argv.find(a => a.startsWith('--prints=')) || '--prints=depois').slice(9);
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const LER = () => {
  const n = s => String(s || '').replace(/\s+/g, ' ').trim(), t = document.getElementById('t-painel');
  const kpis = {};
  t.querySelectorAll('.kpi').forEach(k => { const l = n((k.querySelector('.l') || {}).textContent).replace(/\s*i$/, ''); if (!l) return; kpis[l.toUpperCase()] = n((k.querySelector('.v') || {}).textContent) + ' | ' + n((k.querySelector('.s') || {}).textContent); });
  // totais do antigo Resumo (VAR. MATERIAL, SCRAP, TOTAL): no layout novo estão nos indicadores; aqui só os valores
  const resumo = {}; const rs = document.getElementById('resumo');
  if (rs && rs.style.display !== 'none') rs.querySelectorAll('.big').forEach(b => { const l = n(b.previousElementSibling && b.previousElementSibling.textContent); resumo[l.toUpperCase()] = n(b.textContent); });
  const g = id => { const e = document.getElementById(id); if (!e) return ''; const c = e.cloneNode(true); c.querySelectorAll('.c-un').forEach(x => x.remove()); return n(c.textContent); };   // 1.8.36: a linha "Valores em …" fica fora da comparação
  /* 1.12.7 (13/11/2026) · D8: Pareto comparado pelos números (rótulo | valor | % acumulado inteiro), na tabela antiga ou no desenho comum do kit (svg.vpar) */
  const pc = x => Math.round(parseFloat(n(x).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')));
  const gp = id => { const e = document.getElementById(id); if (!e) return ''; const sv = e.querySelector('svg.vpar'), tb = e.querySelector('table');
    if (sv) return 'PARETO[' + [...sv.querySelectorAll('g[data-k]')].map(q => [n(q.getAttribute('data-l') || q.querySelector('.lbl').textContent), n(q.querySelector('.pux-val').firstChild.textContent), pc(q.querySelector('.pux-acum').textContent)].join('|')).join('; ') + ']';
    if (tb) return 'PARETO[' + [...tb.querySelectorAll('tr')].map(r => [n((r.cells[0].querySelector('b') || r.cells[0]).textContent), n(r.cells[2].textContent), pc(r.cells[3].textContent)].join('|')).join('; ') + ']';
    return g(id); };
  return { kpis, resumo, trend: g('chTrend'), comp: gp('chComp'), prod: gp('chProd'), causa: gp('chCausa'), porComp: g('porComp'), tabela: g('tblMain').slice(0, 4000), info: g('tblInfo') };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => { const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00')); const o = await c.newPage();   /* data fixa: a referência vale em qualquer dia */ o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
    await o.goto('file://' + RAIZ + 'paginas/Perdas-Ordem.html'); await o.waitForTimeout(900);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); enterTest(); }); await o.waitForTimeout(1200);
    await o.evaluate(() => { try { localStorage.removeItem('vac.grupos.perdas'); } catch (e) { } showTab('painel'); }); await o.waitForTimeout(600); return { c, o }; };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(Object.keys(atual.kpis).length >= 9 && atual.trend && atual.comp && atual.tabela, `indicadores (${Object.keys(atual.kpis).length}), gráficos e tabela lidos`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    const difK = Object.keys(ref.kpis).filter(k => ref.kpis[k] !== atual.kpis[k]);
    ok(!difK.length, 'mesmos valores em todos os indicadores da referência' + (difK.length ? ': ' + difK.map(k => `${k} [${ref.kpis[k]}] → [${atual.kpis[k] || 'ausente'}]`).join(' ; ') : ` (${Object.keys(ref.kpis).length})`));
    // 1.10.0 · MUV oficial: MUV = Desv. estrutura + Desv. empregado; o Desv. real × teórico é o antigo Desvio líquido (R$ 92.350,83 antes da 1.10.0)
    const v = k => (atual.kpis[k] || '').split(' | ')[0], num = t => +String(t).replace(/[^\d,-]/g, '').replace(',', '.');
    ok(Math.abs(num(v('MUV')) - (num(v('DESV. ESTRUTURA')) + num(v('DESV. EMPREGADO')))) < 0.02, `MUV = estrutura + empregado (${v('MUV')} = ${v('DESV. ESTRUTURA')} + ${v('DESV. EMPREGADO')})`);
    ok(v('DESV. REAL × TEÓRICO') === 'R$ 92.350,83', `Desv. real × teórico igual ao Desvio líquido de antes da 1.10.0 (${v('DESV. REAL × TEÓRICO')})`);
    for (const k of ['trend', 'comp', 'prod', 'causa', 'porComp', 'tabela', 'info']) ok(ref[k] === atual[k], `mesmo conteúdo: ${k}`);
  }
  // 1.8.36 · gráficos (docs/graficos-padrao.md): unidade na Tendência, moeda que acompanha a escolha, eixo sem rótulos repetidos
  const gr = await o.evaluate(() => { const t = document.getElementById('chTrend'), u = t.querySelector('.c-un'), ax = [...t.querySelectorAll('svg > text[text-anchor="end"]')].map(x => x.textContent);
    const r = { un: u ? u.textContent.trim() : '', rep: new Set(ax).size < ax.length, met: MET.d.l };
    MOEDA_FORCAR = 'USD'; r.usd = MET.d.l + ' | ' + MET.pm.l; const h = barChart([{ label: 'a', value: 0.4 }, { label: 'b', value: 2.6 }], { unit: msim() }); MOEDA_FORCAR = null;
    const d = document.createElement('div'); d.innerHTML = h; const tk = [...d.querySelectorAll('svg > text[text-anchor="end"]')].map(x => x.textContent);
    r.peq = tk.join('|'); r.peqRep = new Set(tk).size < tk.length; r.peqUn = (d.querySelector('.c-un') || {}).textContent; return r; });
  ok(gr.un === 'Valores em R$' && gr.met === 'R$', `Tendência mensal com "Valores em R$" (${gr.un})`);
  ok(gr.usd === 'US$ | US$/milhão' && gr.peqUn === 'Valores em US$', `em US$, medidas e unidade acompanham a moeda (${gr.usd})`);
  ok(!gr.rep && !gr.peqRep, `eixo sem rótulos repetidos (valores pequenos: ${gr.peq})`);
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  if (!GRAVAR) {
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, T = document.getElementById('t-painel');
      out.secoes = [...T.querySelectorAll('.vk-sec h3')].map(x => x.textContent);
      out.grupos = [...T.querySelectorAll('.vk-grp')].map(g => g.dataset.vkGrupo + ':' + g.querySelectorAll('.card').length);
      out.sit = (T.querySelector('.vk-sit') || {}).textContent || ''; out.diag = T.querySelectorAll('.vk-dc').length;
      out.resumoOculto = getComputedStyle(document.getElementById('resumo')).display === 'none';
      T.querySelector('[data-vk-grupo="B"] .vk-gh').click(); await w(50);
      out.fechou = T.querySelector('[data-vk-grupo="B"]').classList.contains('fechado') && JSON.parse(localStorage.getItem('vac.grupos.perdas') || '{}').B === 1;
      renderPainel(); await w(200); out.lembrou = document.querySelector('#t-painel [data-vk-grupo="B"]').classList.contains('fechado');
      document.querySelector('#t-painel [data-vk-grupo="B"] .vk-gh').click(); await w(50);
      // 1.10.0 · Pareto do MUV: dimensão × métrica × sentido × Top N
      const pzN = () => document.querySelectorAll('#chPz tr, #chPz g[data-k]').length, pzC = (k, v) => { document.querySelector(`#pzCtl [data-pz="${k}"][data-pv="${v}"]`).click(); };
      out.pz = { comp: pzN() }; pzC('top', '5'); await w(30); out.pz.top5 = pzN(); pzC('dim', 'sku'); await w(30); out.pz.sku = pzN(); out.pz.skuTxt = document.getElementById('chPz').textContent.slice(0, 60);
      pzC('met', 'estr'); await w(30); out.pz.estr = document.getElementById('chPz').textContent.includes('Nada desfavorável'); pzC('sen', 'fav'); pzC('met', 'muv'); await w(30); out.pz.fav = document.getElementById('chPz').textContent.slice(0, 40);
      out.pz.lembra = JSON.parse(localStorage.getItem('vac.waste.pareto') || '{}').dim === 'sku';
      pzC('dim', 'comp'); pzC('sen', 'desf'); pzC('top', '10'); try { localStorage.removeItem('vac.waste.pareto'); } catch (e) { }
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, sit: L.sit.replace(/\s+/g, ' ').slice(0, 120) }));
    ok(L.secoes.join('|') === 'Situação do período|Números do período|Diagnóstico rápido|Análises|Ordens e componentes', 'cinco seções na ordem: Situação, Números, Diagnóstico, Análises, Ordens');
    ok(L.pz && L.pz.comp === 9 && L.pz.top5 === 5 && L.pz.sku === 4 && /por SKU/.test(L.pz.skuTxt) && L.pz.estr && /^MUV favorável/.test(L.pz.fav) && L.pz.lembra, `Pareto do MUV: componente ${L.pz && L.pz.comp}, Top 5 = ${L.pz && L.pz.top5}, SKU ${L.pz && L.pz.sku}, estrutura sem desfavorável, favorável, escolha lembrada`);
    ok(L.grupos.join(' ') === 'A:3 B:3 D:9 C:1', `gráficos e quadro em 4 grupos; D = Paretos da controladoria, 1.12.0 (${L.grupos.join(' ')})`);
    ok(/MUV do período/.test(L.sit) && /meta|Sem meta/i.test(L.sit) && /(Acima|Dentro) da meta|Sem meta/.test(L.sit), 'Situação: MUV × meta com estado em texto');
    ok(L.diag === 3 && L.resumoOculto, 'Diagnóstico com 3 cartões; Resumo antigo junto dos indicadores (sem totais repetidos)');
    ok(L.fechou && L.lembrou, 'grupo recolhido lembra a escolha (vac.grupos.perdas)');
    await o.emulateMedia({ media: 'print' }); await o.evaluate(() => document.querySelector('#t-painel [data-vk-grupo="A"] .vk-gh').click());
    const imp = await o.evaluate(() => getComputedStyle(document.querySelector('#t-painel [data-vk-grupo="A"] .vk-gb')).display); await o.emulateMedia({ media: 'screen' });
    ok(imp !== 'none', `impressão com os grupos abertos (${imp})`);
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
