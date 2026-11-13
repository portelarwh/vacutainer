// Paradas › Visão geral no padrão visual comum (vacLayout do kit, 11/11/2026): os números não mudam com o layout.
// Lê, no modo de teste (dados fictícios, data fixa), os indicadores, a ação prioritária, as decisões, os 4 gráficos e a informação dos filtros
// e compara com testes/bases/paradas-vg-referencia.json (gravada antes da mudança).
//   node testes/tparadas_vg.js --gravar   grava a referência (só antes de mudar a tela)
//   node testes/tparadas_vg.js            confere; também tira prints em testes/saida/paradas-vg/ (claro/escuro, 390/768/1440)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/paradas-vg-referencia.json', SAI = RAIZ + 'testes/saida/paradas-vg/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar'), ROTULO = (process.argv.find(a => a.startsWith('--prints=')) || '--prints=depois').slice(9);
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const LER = () => {
  const n = s => String(s || '').replace(/\s+/g, ' ').trim(), m = document.getElementById('main');
  const kpis = {}; m.querySelectorAll('.kpi').forEach(k => { const l = n((k.querySelector('.l') || {}).textContent); if (l) kpis[l] = n((k.querySelector('.v') || {}).textContent) + ' | ' + n((k.querySelector('.s') || {}).textContent); });
  const g = id => { const e = document.getElementById(id); if (!e) return ''; const c = e.cloneNode(true); c.querySelectorAll('.c-un').forEach(x => x.remove()); return n(c.textContent).replace(/% acum\./g, '%'); };   // 1.0.33: "% acum." e "Valores em …" são só rótulo
  return { kpis, acao: n((m.querySelector('.acao .f') || {}).textContent), decis: [...m.querySelectorAll('.decis li')].map(l => n(l.textContent)), mes: g('chMes'), eq: g('chEq'), cl: g('chCl'), tu: g('chTu'), info: n((m.querySelector('.filters .info, .finfo, .filters .muted') || {}).textContent) };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => { const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00')); const o = await c.newPage();   /* data fixa: a referência vale em qualquer dia */ o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
    await o.goto('file://' + RAIZ + 'paginas/Paradas.html'); await o.waitForTimeout(900);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); try { localStorage.removeItem('vac.grupos.paradas'); } catch (e) { } modoTeste(); App.go('geral'); }); await o.waitForTimeout(900); return { c, o }; };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(Object.keys(atual.kpis).length >= 7 && atual.mes && atual.eq && atual.cl && atual.tu, `indicadores (${Object.keys(atual.kpis).length}) e gráficos lidos`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    const difK = Object.keys(ref.kpis).filter(k => ref.kpis[k] !== atual.kpis[k]);
    ok(!difK.length, 'mesmos valores em todos os indicadores da referência' + (difK.length ? ': ' + difK.map(k => `${k} [${ref.kpis[k]}] → [${atual.kpis[k] || 'ausente'}]`).join(' ; ') : ` (${Object.keys(ref.kpis).length})`));
    for (const k of ['acao', 'decis', 'mes', 'eq', 'cl', 'tu', 'info']) ok(JSON.stringify(ref[k]) === JSON.stringify(atual[k]), `mesmo conteúdo: ${k}`);
  }
  // 1.2.8 · mapa de calor: total das linhas = minutos das paradas de perda com horário (mesmos filtros); equipamento × hora com até 10 linhas
  const HC = await o.evaluate(() => { const L = F.apply(eventosTodos()).filter(e => !NAO_PERDA.has(classe(e)) && /^\d{1,2}:/.test(e.inicio || '')), soma = Math.round(L.reduce((s, e) => s + e.minutos, 0));
    const tot = sel => [...document.querySelectorAll(`[data-calor="${sel}"] tr`)].slice(1).map(r => +r.cells[r.cells.length - 1].innerText.replace(/\D/g, ''));
    const d = tot('dia'), q = tot('eq'); return { soma, dia: d.reduce((a, b) => a + b, 0), linhasDia: d.length, linhasEq: q.length, celulas: document.querySelectorAll('[data-calor] td.hc').length, ver: PAGE.versao }; });
  ok(HC.ver === '1.2.9' && HC.linhasDia === 7 && HC.linhasEq >= 1 && HC.linhasEq <= 10 && HC.celulas > 0 && Math.abs(HC.dia - HC.soma) <= 7, `mapa de calor: dia × hora soma ${HC.dia} min = ${HC.soma} min das paradas com horário (7 dias, ${HC.linhasEq} equipamento(s), número em cada célula)`);
  // 1.0.33 · gráficos (docs/graficos-padrao.md): "% acum." no Pareto, unidade em Ocorrências, eixo sem rótulos repetidos
  const gr = await o.evaluate(async () => { const r = {}; r.acum = /% acum\./.test(document.getElementById('chEq').textContent);
    const d = document.createElement('div'); d.innerHTML = vbars([{ k: 'a', label: 'a' }, { k: 'b', label: 'b' }], [{ nome: 'x', cor: '#888', v: [1, 3] }], { fmt: fmtMin });
    const tk = [...d.querySelectorAll('svg > text[text-anchor="end"]')].map(x => x.textContent); r.tk = tk.join('|'); r.rep = new Set(tk).size < tk.length;
    VIEWS.pareto.med = 'n'; App.go('pareto'); await new Promise(z => setTimeout(z, 400)); r.unN = ((document.querySelector('#pCh .c-un') || {}).textContent || '').trim();
    VIEWS.pareto.med = 'min'; App.go('pareto'); await new Promise(z => setTimeout(z, 400)); r.unMin = !!document.querySelector('#pCh .c-un');
    App.go('geral'); await new Promise(z => setTimeout(z, 400)); return r; });
  ok(gr.acum, 'Pareto com "% acum." (não só "%")');
  ok(gr.unN === 'Valores em ocorrências' && !gr.unMin, `Pareto em Ocorrências diz a unidade; em Minutos a barra já traz h/min (${gr.unN})`);
  ok(!gr.rep, `eixo sem rótulos repetidos (escala pequena: ${gr.tk})`);
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  if (!GRAVAR) {
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, M = document.getElementById('main');
      out.secoes = [...M.querySelectorAll('.vk-sec h3')].map(x => x.textContent);
      out.grupos = [...M.querySelectorAll('.vk-grp')].map(g => g.dataset.vkGrupo + ':' + g.querySelectorAll('.card').length);
      out.sit = [...M.querySelectorAll('.pux-prio, .pux-kpis-main')].map(x => x.textContent).join(' '); out.diag = M.querySelectorAll('.vk-dc').length; out.exp = M.querySelectorAll('[data-vk-go]').length;
      M.querySelector('[data-vk-grupo="B"] .vk-gh').click(); await w(50);
      out.fechou = M.querySelector('[data-vk-grupo="B"]').classList.contains('fechado') && JSON.parse(localStorage.getItem('vac.grupos.paradas') || '{}').B === 1;
      App.render(); await w(200); out.lembrou = document.querySelector('#main [data-vk-grupo="B"]').classList.contains('fechado');
      document.querySelector('#main [data-vk-grupo="B"] .vk-gh').click(); await w(50);
      // atalho da maior perda filtra o equipamento (mesmo efeito do clique no Pareto)
      const f = document.querySelector('#main [data-vk-f^="eq|"]'); if (f) { const k = f.dataset.vkF.split('|')[1]; f.click(); await w(200); out.filtro = F.eq === k; F.eq = ''; App.render(); await w(200); }
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, sit: L.sit.replace(/\s+/g, ' ').slice(0, 140) }));
    ok(L.secoes.join('|') === 'Indicadores principais|Prioridades|Análise visual|Análises complementares', 'Paradas 1.1.0: seções na ordem Indicadores, Prioridades, Análise visual, Complementares (faixa de filtros no topo)');
    ok(L.grupos.join(' ') === 'B:1 C:1 D:2', `análises complementares em 3 grupos recolhíveis, com o mapa de calor (Paradas 1.2.8) (${L.grupos.join(' ')}); evolução e Pareto de equipamentos na Análise visual`);
    ok(/Tempo de parada/.test(L.sit) && /Ação prioritária/.test(L.sit) && /Próximas decisões/.test(L.sit) && /Máquina crítica/.test(L.sit), 'Indicadores e prioridades: tempo parado, máquina crítica, ação prioritária e decisões');
    ok(L.diag === 2 && L.exp >= 5, 'mês com mais e menos parada junto do gráfico mensal; Explorar com os atalhos das abas');
    ok(L.fechou && L.lembrou, 'grupo recolhido lembra a escolha (vac.grupos.paradas)');
    ok(L.filtro === true, 'atalho da máquina crítica filtra o equipamento');
    await o.emulateMedia({ media: 'print' }); await o.evaluate(() => document.querySelector('#main [data-vk-grupo="C"] .vk-gh').click());
    const imp = await o.evaluate(() => getComputedStyle(document.querySelector('#main [data-vk-grupo="C"] .vk-gb')).display); await o.emulateMedia({ media: 'screen' });
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
