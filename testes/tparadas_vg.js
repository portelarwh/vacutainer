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
  const g = id => n((document.getElementById(id) || {}).textContent);
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
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  if (!GRAVAR) {
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, M = document.getElementById('main');
      out.secoes = [...M.querySelectorAll('.vk-sec h3')].map(x => x.textContent);
      out.grupos = [...M.querySelectorAll('.vk-grp')].map(g => g.dataset.vkGrupo + ':' + g.querySelectorAll('.card').length);
      out.sit = (M.querySelector('.vk-sit') || {}).textContent || ''; out.diag = M.querySelectorAll('.vk-dc').length; out.exp = M.querySelectorAll('[data-vk-go]').length;
      M.querySelector('[data-vk-grupo="B"] .vk-gh').click(); await w(50);
      out.fechou = M.querySelector('[data-vk-grupo="B"]').classList.contains('fechado') && JSON.parse(localStorage.getItem('vac.grupos.paradas') || '{}').B === 1;
      App.render(); await w(200); out.lembrou = document.querySelector('#main [data-vk-grupo="B"]').classList.contains('fechado');
      document.querySelector('#main [data-vk-grupo="B"] .vk-gh').click(); await w(50);
      // atalho da maior perda filtra o equipamento (mesmo efeito do clique no Pareto)
      const f = document.querySelector('#main [data-vk-f^="eq|"]'); if (f) { const k = f.dataset.vkF.split('|')[1]; f.click(); await w(200); out.filtro = F.eq === k; F.eq = ''; App.render(); await w(200); }
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, sit: L.sit.replace(/\s+/g, ' ').slice(0, 140) }));
    ok(L.secoes.join('|') === 'Situação do período|Números do período|Diagnóstico rápido|Análises|Explorar dados', 'cinco seções na ordem: Situação, Números, Diagnóstico, Análises, Explorar');
    ok(L.grupos.join(' ') === 'A:1 B:2 C:1', `gráficos em 3 grupos (${L.grupos.join(' ')})`);
    ok(/Tempo de parada/.test(L.sit) && /Ação prioritária/.test(L.sit) && /Próximas decisões/.test(L.sit) && /Maior perda/.test(L.sit), 'Situação: tempo parado, ação prioritária, decisões e maior perda');
    ok(L.diag === 3 && L.exp >= 5, 'Diagnóstico com 3 cartões; Explorar com os atalhos das abas');
    ok(L.fechou && L.lembrou, 'grupo recolhido lembra a escolha (vac.grupos.paradas)');
    ok(L.filtro === true, 'atalho da maior perda filtra o equipamento');
    await o.emulateMedia({ media: 'print' }); await o.evaluate(() => document.querySelector('#main [data-vk-grupo="A"] .vk-gh').click());
    const imp = await o.evaluate(() => getComputedStyle(document.querySelector('#main [data-vk-grupo="A"] .vk-gb')).display); await o.emulateMedia({ media: 'screen' });
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
