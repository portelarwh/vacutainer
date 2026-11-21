// LANC-03 (item 9, etapa c) · Validação e Qualidade do apontamento: cada aviso com "Ir para o ajuste" (abre o turno certo, rola, foca e
// destaca o campo; Administração › Metas de OEE pela seção; Configurações pela seção) e a linha com a conta. Os textos, limites e status
// dos avisos não mudam. Dados fictícios (demonstração), data fixa num dia útil.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1'); await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    await f.waitForSelector('#cabDia');
    const voltar = async () => { await f.evaluate(() => { App.route = 'launch'; render(); }); await f.waitForSelector('#cabDia'); };
    /* 1) os avisos continuam com o mesmo texto; os do apontamento ganham a conta e os botões */
    const v = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), q = res.r.qa;
      const val = [...document.querySelectorAll('section.card')].find(s => s.querySelector('h3')?.textContent.trim() === 'Validação');
      const li = t => [...val.querySelectorAll('li')].find(l => l.textContent.includes(t));
      const cob = li('cobertura do apontamento está abaixo'), div = li('divergência ultrapassa');
      return { tipos: q.tipos, msgsIguais: q.msgs.every(m => [...val.querySelectorAll('li')].some(l => l.textContent.includes(m))),
        cob: cob && [cob.querySelector('.aj-conta')?.textContent, [...cob.querySelectorAll('.aj-bt')].map(b => b.textContent.trim())],
        div: div && [div.querySelector('.aj-conta')?.textContent, [...div.querySelectorAll('.aj-bt')].map(b => b.textContent.trim())],
        qa: [...document.querySelectorAll('.aj-bts')].length, notaQa: /aviso\(s\) do apontamento, com o botão de ajuste, na Validação/.test(document.body.textContent), apont: res.r.apontMin, perda: res.r.lossTotalMin }; });
    assert.deepEqual(v.tipos, ['cobertura', 'divergencia']); assert.ok(v.msgsIguais, 'texto dos avisos igual');
    assert.match(v.cob[0], /^Cobertura \d+% = [\d.,]+ min apontados ÷ [\d.,]+ min de perda; mínimo \d+%\.$/); assert.deepEqual(v.cob[1], ['Registrar paradas', 'Ver o mínimo']);
    assert.match(v.div[0], /^Divergência -?[\d.,]+ min = -?[\d.,]+% do tempo planejado de [\d.,]+ min; máximo \d+%\.$/);
    assert.deepEqual(v.div[1], ['Tempo planejado do turno', 'PPH e catálogo', 'Classificação das paradas', 'Ver o limite']);
    assert.ok(v.qa === 2 && v.notaQa, 'botões só na Validação: a Qualidade do apontamento não repete os avisos (design 2.6.29)');
    console.log('ok avisos com a conta e os botões (' + v.cob[0] + ')');
    /* 2) Registrar paradas: abre o turno com mais minutos sem explicação e foca o lançamento de parada */
    const alvo = async sel => { await f.click(sel); await page.waitForTimeout(150); return f.evaluate(() => { const a = document.querySelector('.aj-alvo'), sec = a && a.closest('section.tl'); return { cls: a ? (a.dataset.addev ? 'addev' : a.dataset.abonoadd ? 'abono' : a.matches('select') ? a.dataset.psf : a.tagName) : null, ps: sec && sec.dataset.tl, vis: !!(sec && !sec.classList.contains('tr-oculto')), foco: document.activeElement && (document.activeElement.dataset.addev ? 'addev' : document.activeElement.dataset.abonoadd ? 'abono' : document.activeElement.dataset.psf || document.activeElement.tagName) }; }); };
    const pior = await f.evaluate(() => { const res = Engine.computeDay(db(), curDay()); return res.shifts.filter(s => !s.ps.off).sort((a, b) => b.r.unexplMeasMin - a.r.unexplMeasMin)[0].ps.id; });
    const a1 = await alvo('.aj-bt[data-ajuste="paradas"]');
    assert.equal(a1.ps, pior, 'turno com mais minutos sem explicação'); assert.ok(a1.vis, 'turno aberto'); assert.equal(a1.foco, 'addev', 'foco no lançamento de parada');
    await page.waitForTimeout(2100); assert.equal(await f.evaluate(() => document.querySelectorAll('.aj-alvo').length), 0, 'destaque some em 2 s');
    const a2 = await alvo('.aj-bt[data-ajuste="planejado"]'); assert.equal(a2.foco, 'abono', 'tempo planejado: abonos do turno');
    const a3 = await alvo('.aj-bt[data-ajuste="catalogo"]'); assert.match(a3.foco || '', /\|initialCatalogId$/, 'catálogo do turno');
    console.log('ok Registrar paradas, Tempo planejado e PPH e catálogo abrem o turno e focam o campo');
    /* 3) Classificação das paradas → Configurações › Tipos de parada; Ver o mínimo → Administração › Metas de OEE */
    await f.click('.aj-bt[data-ajuste="cfg"][data-aj-arg="paradas"]'); await f.waitForFunction(() => App.route === 'config' && App.cfgSec === 'paradas'); await voltar();
    const href = await f.evaluate(() => document.querySelector('[data-aj-adm="metasOee"]').getAttribute('href'));
    assert.match(href, /cadastros(%2F|\/)metasOee$/, 'link para Administração › Metas de OEE');
    await f.click('[data-aj-adm="metasOee"]');
    const adm = page.locator('iframe[title="Módulo Administração"]'); await adm.waitFor({ timeout: 10000 });
    const fa = await (await adm.elementHandle()).contentFrame(); await fa.waitForFunction(() => typeof Cad !== 'undefined' && Cad.ui.sec === 'metasOee', null, { timeout: 10000 });
    console.log('ok Classificação das paradas abre Configurações › Tipos de parada; Ver o mínimo abre Administração › Metas de OEE');
    /* 4) referências das mensagens: hora, parada e turno */
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; }); await f.waitForSelector('#cabDia');
    const refs = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), iv = res.flat.find(x => x.iv)?.iv.id, ev = day.events.find(e => !e.deleted && !e.abono)?.id, ps = res.shifts[1].ps.id;
      return { hora: Ajuste.html({ ref: { iv } }), parada: Ajuste.html({ ref: { ev } }), turno: Ajuste.html({ ref: { ps } }), iv, ev, ps }; });
    assert.match(refs.hora, /Ir para a hora/); assert.match(refs.parada, /Ir para a parada/); assert.match(refs.turno, /Ir para o turno/);
    const r4 = await f.evaluate(async ({ iv, ev, ps }) => { const root = document.querySelector('#main'), day = curDay(), o = {};
      Ajuste.ir(root, day, 'hora', iv); const hb = document.querySelector(`[data-addev="${iv}"]`); o.hora = !!(hb && hb.offsetParent && hb.closest('.aj-alvo'));
      Ajuste.ir(root, day, 'parada', ev); const ch = document.querySelector(`[data-ev="${ev}"]`); o.parada = !!(ch && ch.offsetParent && ch.closest('.aj-alvo'));
      Ajuste.ir(root, day, 'turno', ps); o.turno = document.querySelector('section.tl.aj-alvo')?.dataset.tl === ps; return o; }, refs);
    assert.deepEqual(r4, { hora: true, parada: true, turno: true });
    console.log('ok mensagens com hora, parada ou turno levam ao lugar');
    /* 5) sem permissão de lançar: o botão diz "Ver"; sem configurar, a Administração explica quem ajusta */
    const sem = await f.evaluate(() => { const o = vacPodeAqui; vacPodeAqui = () => false; const h = Ajuste.html({ ref: { qa: 'cobertura' } }, { r: Engine.computeDay(db(), curDay()).r }); vacPodeAqui = o; return h; });
    assert.match(sem, />Ver paradas</); assert.match(sem, /quem ajusta é o perfil com permissão de configurar/);
    console.log('ok sem permissão: Ver paradas e quem ajusta');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
