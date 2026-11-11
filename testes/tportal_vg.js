// Portal › Visão geral no padrão visual comum (vacLayout do kit, 11/11/2026): os números não mudam com o layout.
// Lê, no modo de teste (dados fictícios, data fixa), o cartão de cada página, as pendências da linha e a barra de período
// e compara com testes/bases/portal-vg-referencia.json (gravada antes da mudança).
//   node testes/tportal_vg.js --gravar   grava a referência (só antes de mudar a tela)
//   node testes/tportal_vg.js            confere; também tira prints em testes/saida/portal-vg/ (claro/escuro, 390/768/1440)
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const REF = RAIZ + 'testes/bases/portal-vg-referencia.json', SAI = RAIZ + 'testes/saida/portal-vg/'; fs.mkdirSync(SAI, { recursive: true });
const GRAVAR = process.argv.includes('--gravar'), ROTULO = (process.argv.find(a => a.startsWith('--prints=')) || '--prints=depois').slice(9);
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const LER = () => {
  const n = s => String(s || '').replace(/\s+/g, ' ').trim(), m = document.getElementById('main');
  const cards = {}; m.querySelectorAll('.mods .mod').forEach((c, i) => { cards[n((c.querySelector('h3, .h, header') || {}).textContent).slice(0, 40) || ('c' + i)] = n(c.textContent); });
  const pend = [...m.querySelectorAll('.pl li')].map(l => n(l.textContent)), per = n((m.querySelector('.per-bar') || {}).textContent);
  return { cards, pend, per };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, tema) => { const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema }); await c.clock.setFixedTime(new Date('2026-11-11T12:00:00')); const o = await c.newPage();   /* data fixa: a referência vale em qualquer dia */ o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
    await o.goto('file://' + RAIZ + 'paginas/Portal.html'); await o.waitForTimeout(1000);
    await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); enterTest(); }); await o.waitForTimeout(1500);
    await o.evaluate(() => App.show('geral')); await o.waitForTimeout(600); return { c, o }; };
  const { c, o } = await nova(1440, 900, 'light');
  const atual = await o.evaluate(LER);
  ok(Object.keys(atual.cards).length >= 5 && atual.pend.length >= 1, `cartões (${Object.keys(atual.cards).length}) e pendências (${atual.pend.length}) lidos`);
  if (GRAVAR) { fs.writeFileSync(REF, JSON.stringify(atual, null, 1)); console.log('referência gravada em ' + path.relative(RAIZ, REF)); }
  else {
    const ref = JSON.parse(fs.readFileSync(REF, 'utf8'));
    const difC = Object.keys(ref.cards).filter(k => ref.cards[k] !== atual.cards[k]);
    ok(!difC.length, 'mesmo conteúdo no cartão de cada página' + (difC.length ? ': ' + difC.join(', ') : ` (${Object.keys(ref.cards).length})`));
    ok(JSON.stringify(ref.pend) === JSON.stringify(atual.pend), `mesmas pendências da linha (${atual.pend.length})`);
    ok(ref.per === atual.per, 'mesma barra de período');
  }
  await o.screenshot({ path: SAI + ROTULO + '-1440-claro.png', fullPage: true });
  if (!GRAVAR) {
    const L = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), out = {}, M = document.getElementById('main');
      out.secoes = [...M.querySelectorAll('.vk-sec h3')].map(x => x.textContent);
      out.sit = (M.querySelector('.vk-sit') || {}).textContent || ''; out.diag = M.querySelectorAll('.vk-dc').length; out.exp = M.querySelectorAll('[data-vk-show]').length;
      const b = M.querySelector('[data-vk-show="fila"]'); if (b) { b.click(); await w(300); out.fila = App.tab === 'fila'; App.show('geral'); await w(300); }
      return out; });
    console.log('     layout:', JSON.stringify({ ...L, sit: L.sit.replace(/\s+/g, ' ').slice(0, 160) }));
    ok(L.secoes.join('|') === 'Situação da linha|Números por página|Diagnóstico rápido|Pendências da linha|Explorar', 'cinco seções na ordem: Situação, Números por página, Diagnóstico, Pendências, Explorar');
    ok(/Pendências/.test(L.sit) && /Ação prioritária/.test(L.sit), 'Situação: pendências da linha com o estado em texto e a ação prioritária');
    ok(L.diag === 3 && L.exp >= 4 && L.fila === true, 'Diagnóstico com 3 cartões; Explorar leva às abas (Minha fila)');
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
