// Gestão de Gel › Visão Geral no padrão visual comum (vacLayout do kit, 11/11/2026): os números não mudam com o layout.
// Lê, no modo demonstração (dados fictícios, data fixa, Meu painel padrão), os indicadores do topo e o texto de cada bloco do painel
// e compara com testes/bases/gel-vg-referencia.json (gravada antes da mudança). A personalização (blocos e ordem) não muda.
//   node testes/tgel_vg.js --gravar   grava a referência (só antes de mudar a tela)
//   node testes/tgel_vg.js            confere; também tira prints em testes/saida/gel-vg/ (claro/escuro, 390/768/1440)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/gel-vg-referencia.json', SAI = RAIZ + 'testes/saida/gel-vg/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar'), ROTULO = (process.argv.find(a => a.startsWith('--prints=')) || '--prints=depois').slice(9);
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const LER = () => {
  const n = s => String(s || '').replace(/\s+/g, ' ').trim(), m = document.getElementById('panel');
  const kpis = {}; m.querySelectorAll('.dbk').forEach(k => { const c = k.cloneNode(true); c.querySelectorAll('svg').forEach(x => x.remove()); kpis[n((k.querySelector('.l, .dbkl, b, h4') || {}).textContent) || n(c.textContent).slice(0, 30)] = n(c.textContent); });
  const blocos = {}; m.querySelectorAll('[data-dbb], .dbblk, #dbGrid > *').forEach((b, i) => { const id = b.dataset.dbb || b.id || ('b' + i); blocos[id] = n(b.textContent).slice(0, 3000); });
  return { kpis, blocos, sub: n((m.querySelector('.dbbar .sub') || {}).textContent) };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => { const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00')); const o = await c.newPage();   /* data fixa: a referência vale em qualquer dia */ o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
    await o.goto('file://' + RAIZ + encodeURI('paginas/Gestão-Gel-Vacutainer.html')); await o.waitForTimeout(1200);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); localStorage.removeItem('vac.cadastros'); enterDemo(); ui.tab = 'painel'; render(); }); await o.waitForTimeout(1200); return { c, o }; };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(Object.keys(atual.kpis).length >= 6 && Object.keys(atual.blocos).length >= 4, `indicadores (${Object.keys(atual.kpis).length}) e blocos (${Object.keys(atual.blocos).length}) lidos`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    const difK = Object.keys(ref.kpis).filter(k => ref.kpis[k] !== atual.kpis[k]);
    ok(!difK.length, 'mesmos valores em todos os indicadores da referência' + (difK.length ? ': ' + difK.map(k => `${k} [${ref.kpis[k]}] → [${atual.kpis[k] || 'ausente'}]`).join(' ; ') : ` (${Object.keys(ref.kpis).length})`));
    const difB = Object.keys(ref.blocos).filter(k => ref.blocos[k] !== atual.blocos[k]);
    ok(!difB.length, 'mesmo conteúdo em todos os blocos do painel' + (difB.length ? ': ' + difB.join(', ') : ` (${Object.keys(ref.blocos).length})`));
    ok(ref.sub === atual.sub, 'mesmo resumo do período');
  }
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  if (!GRAVAR) {
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, M = document.getElementById('panel');
      out.secoes = [...M.querySelectorAll('.vk-sec h3')].map(x => x.textContent);
      out.sit = (M.querySelector('.vk-sit') || {}).textContent || ''; out.diag = M.querySelectorAll('.vk-dc').length; out.exp = M.querySelectorAll('[data-vk-go]').length;
      const f = M.querySelector('[data-vk-f^="mot|"], [data-vk-f^="eq|"]'); if (f) { const [k, v] = f.dataset.vkF.split('|'); f.click(); await w(400); out.filtro = dbState().f[k] === v; dbState().f[k] = ''; render(); await w(300); }
      const g = document.querySelector('#panel [data-vk-go="pend"]'); if (g) { g.click(); await w(300); out.foiPend = ui.tab === 'pend'; ui.tab = 'painel'; render(); await w(300); }
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, sit: L.sit.replace(/\s+/g, ' ').slice(0, 160) }));
    ok(L.secoes.join('|') === 'Situação do período|Números do período|Diagnóstico rápido|Análises do seu painel|Explorar dados', 'cinco seções na ordem: Situação, Números, Diagnóstico, Análises, Explorar');
    ok(/Índice de uso do gel/.test(L.sit) && /Ação prioritária/.test(L.sit) && /Maior perda/.test(L.sit), 'Situação: índice de uso × meta, ação prioritária e maior perda');
    ok(L.diag === 3 && L.exp >= 5, 'Diagnóstico com 3 cartões; Explorar com os atalhos das abas');
    ok(L.filtro === true, 'atalho da maior perda aplica o filtro do painel');
    ok(L.foiPend === true, 'atalho leva às Pendências');
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
