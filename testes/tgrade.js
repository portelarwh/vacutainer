// 12/11/2026 · cartões reorganizáveis (kit vacGrade) e o cartão Pendências da linha do Portal.
// - Produção › Visão geral (padrão e Meu painel): todo cartão de uma grade com gráfico tem a barra (também os sem gráfico);
//   a alça ⠿ arrasta de verdade com o mouse (o all:unset do botão desligava o arrasto no Chrome/Edge); 1/1 · 1/2 · 1/3 funcionam;
//   setas apagadas na ponta e no cartão sozinho do grupo.
// - Portal › Visão geral: Pendências da linha com metade da largura, Ação prioritária e Próximas decisões ao lado (empilha no celular).
// Dados fictícios (modo exemplo/teste). node testes/tgrade.js → "sem erros"; código 1 se falhar
const { chromium } = require('playwright'); const path = require('path');
const PG = 'file://' + path.resolve(__dirname, '..') + '/paginas/';
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PROD = v => { localStorage.setItem('vac.grade.oee', '{}'); document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); const d = Store.S.db; for (const k of ['productionDays', 'monthPlans', 'calendar']) (d[k] || []).forEach(x => delete x.demo); Engine.bumpConfig(); document.querySelectorAll('.overlay').forEach(o => o.remove()); Panel.st().view = v; go('overview'); };
(async () => {
  const b = await chromium.launch(); const pe = [];
  const pagina = async (arq, w = 1440, tema = 'light') => { const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); await ctx.addInitScript(t => localStorage.setItem('vac.theme', t), tema); const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); await p.goto(PG + arq); await p.waitForTimeout(1300); return p; };
  for (const v of ['padrao', 'mine']) {
    const p = await pagina('OEE-Vacutainer.html'); await p.evaluate(PROD, v); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => { const grades = [...document.querySelectorAll('main .vg-grade')]; const semBarra = [];
      for (const g of grades) for (const x of g.children) if (x.matches('.card,.vk-card,.chart-card,.gcard,.vg-card') && x.offsetParent && x.getBoundingClientRect().height >= 60 && !x.querySelector(':scope > .vg-barra')) semBarra.push((x.querySelector('h3,h2,h4') || {}).textContent || x.className);
      return { grades: grades.length, it: document.querySelectorAll('.vg-it').length, semBarra }; });
    ok(r.grades > 0 && r.it > 0 && !r.semBarra.length, `Produção › ${v}: todos os cartões das ${r.grades} grade(s) têm a barra (${r.it})${r.semBarra.length ? '; sem barra: ' + r.semBarra.join(', ') : ''}`);
    // 1/3 por clique de mouse em cada cartão
    const n = r.it; let falhou = [];
    for (let i = 0; i < n; i++) { const c = (await p.$$('.vg-it'))[i]; await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(120); const bb = await c.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(200);
      const bt = await c.$(':scope > .vg-barra [data-vg="l2"]'); const q = await bt.boundingBox(); await p.mouse.click(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(150);
      if ((await c.evaluate(e => e.dataset.vgL)) !== '2') falhou.push(i); }
    ok(!falhou.length, `Produção › ${v}: botão 1/3 funciona com o mouse em todos os cartões${falhou.length ? ' (falhou: ' + falhou + ')' : ''}`);
    await p.context().close();
  }
  {
    const p = await pagina('OEE-Vacutainer.html'); await p.evaluate(PROD, 'padrao'); await p.waitForTimeout(1800);
    const ordem = () => p.evaluate(() => [...document.querySelectorAll('#vglgC .vg-grade > *')].filter(x => x.dataset.vgKey).sort((a, b) => (+a.style.order || 0) - (+b.style.order || 0)).map(x => x.dataset.vgKey.slice(0, 12)).join('|'));
    const o0 = await ordem(); const c = (await p.$$('#vglgC .vg-it'))[0]; await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
    const cb = await c.boundingBox(); await p.mouse.move(cb.x + 100, cb.y + 100); await p.waitForTimeout(250);
    const pb = await (await c.$(':scope > .vg-barra .vg-pega')).boundingBox(), ab = await (await p.$$('#vglgC .vg-it'))[1].boundingBox();
    await p.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await p.mouse.down(); await p.mouse.move(pb.x + 40, pb.y + 20, { steps: 5 }); await p.mouse.move(ab.x + ab.width * .75, ab.y + ab.height / 2, { steps: 15 }); await p.mouse.up(); await p.waitForTimeout(500);
    const o1 = await ordem();
    ok(o1 !== o0 && o1.split('|')[1] === o0.split('|')[0], `Produção › Visão geral: arrastar pela alça ⠿ muda a ordem (${o0} → ${o1})`);
    await p.evaluate(() => go('launch')); await p.waitForTimeout(400); await p.evaluate(() => go('overview')); await p.waitForTimeout(1500);
    ok((await ordem()) === o1, 'a ordem arrastada continua ao voltar para a Visão geral');
    const s = await p.evaluate(() => { const c = [...document.querySelectorAll('.vg-it')].find(x => /Scrap % por dia/.test((x.querySelector('h3') || {}).textContent || '')); const q = k => c.querySelector(`:scope > .vg-barra [data-vg="${k}"]`); return { a: q('antes').getAttribute('aria-disabled'), d: q('depois').getAttribute('aria-disabled'), t: q('antes').title }; });
    ok(s.a === 'true' && s.d === 'true' && /Único/.test(s.t), `cartão sozinho no grupo (Scrap % por dia): setas apagadas, com o motivo (${s.t})`);
    await p.context().close();
  }
  for (const [w, tema] of [[1440, 'light'], [1024, 'dark'], [390, 'light']]) {
    const p = await pagina('Portal.html', w, tema); await p.evaluate(() => { enterTest(); App.show('geral'); }); await p.waitForTimeout(700);
    const r = await p.evaluate(() => { const a = document.querySelector('.pd-card').getBoundingClientRect(), s = document.querySelector('.pd-sit .vk-side').getBoundingClientRect(), t = document.querySelector('.pd-sit').getBoundingClientRect();
      return { meia: Math.abs(a.width - (t.width - 14) / 2) < 4, lado: s.left > a.right - 1 && Math.abs(s.top - a.top) < 2, empilha: s.top >= a.bottom - 1, scroll: document.documentElement.scrollWidth > innerWidth + 1, ap: /Ação prioritária/.test(document.querySelector('.pd-sit .vk-side').innerText) }; });
    if (w >= 1024) ok(r.meia && r.lado && r.ap && !r.scroll, `Portal ${w}px ${tema}: Pendências da linha com metade da largura e Ação prioritária/Próximas decisões ao lado`);
    else ok(r.empilha && !r.scroll, `Portal ${w}px: no celular, Ação prioritária embaixo do cartão, sem rolagem lateral`);
    await p.context().close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });
