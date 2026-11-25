// Plataforma 1.8.15 (Administração 1.9.50, Produção 2.6.12) · TUR-04: turno com horário diferente no sábado.
// Na Administração › Turnos, a vigência nova ganha "+ Horário para outros dias": Seg–Sex 06:00–14:30 e Sáb 06:00–13:30 no mesmo
// período; o dia de uma linha fica desabilitado na outra; a validação recusa o mesmo dia em duas linhas. A Produção monta o sábado
// com a janela do sábado e a meta acompanha (menos intervalos, meta menor). Dados fictícios (demonstração), só na memória.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('sábado com 1 h a menos'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/portal'; });
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame(); await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D);
    const w = ms => page.waitForTimeout(ms || 400);

    // 1) validação: o mesmo dia em duas linhas do mesmo período é recusado; dias diferentes passam
    const val = await f.evaluate(() => {
      const it = JSON.parse(JSON.stringify(Cad.D.turnos.find(t => t.codigo === 'T1'))), v0 = it.vigencias[0];
      const a = { ...v0, de: '2026-12-01', ate: null, dias: [1, 2, 3, 4, 5] }, b = { ...v0, de: '2026-12-01', ate: null, inicio: '06:00', fim: '13:30', dias: [6] };
      v0.ate = '2026-11-30';
      const ok = cadValidarItem('turnos', { ...it, vigencias: [v0, a, b] }, Cad.D, {});
      const ruim = cadValidarItem('turnos', { ...it, vigencias: [v0, a, { ...b, dias: [5, 6] }] }, Cad.D, {});
      return { ok, ruim };
    });
    assert.deepEqual(val.ok, [], 'Seg–Sex e Sáb no mesmo período: sem erro');
    assert.ok(val.ruim.some(e => /se sobrepõem em Sex/.test(e)), 'Sex nas duas linhas: recusado ' + JSON.stringify(val.ruim));
    console.log('ok validação: Seg–Sex + Sáb passa; o mesmo dia em duas linhas é recusado');

    // 2) tela: nova vigência, tira o Sáb, "+ Horário para outros dias" cria a linha do Sáb; o Sáb fica desabilitado na outra linha
    /* datas a partir de hoje (o cenário da demonstração calcula as vigências pelo dia de hoje; datas fixas quebravam à meia-noite) */
    const D = await f.evaluate(() => { const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'), h = new Date(); h.setHours(12, 0, 0, 0);
      const am = new Date(h), on = new Date(h); am.setDate(h.getDate() + 1); on.setDate(h.getDate()); return { de0: Cad.D.turnos.find(t => t.codigo === 'T1').vigencias[0].de, nova: iso(am), fim: iso(on) }; });
    await f.evaluate(() => { location.hash = '#cadastros/turnos/T1'; }); await w(1200);
    await f.fill('#fvDe', D.nova); await f.click('#fvNova'); await w();
    const i = await f.evaluate(() => document.querySelector('[data-linhavig]').dataset.linhavig);
    await f.locator(`input[data-p="vigencias.${i}.dias"][data-dia="6"]`).uncheck(); await w();
    await f.click(`[data-linhavig="${i}"]`); await w();
    const j = await f.evaluate(i => { const el = [...document.querySelectorAll('input[data-p$=".dias"][data-dia="6"]')].find(x => x.checked && x.dataset.p !== `vigencias.${i}.dias` && !x.disabled); return el && el.dataset.p.split('.')[1]; }, i);
    assert.ok(j != null, 'linha nova com o Sáb marcado');
    assert.equal(await f.locator(`input[data-p="vigencias.${i}.dias"][data-dia="6"]`).isDisabled(), true, 'Sáb desabilitado na linha Seg–Sex');
    assert.equal(await f.locator(`input[data-p="vigencias.${j}.dias"][data-dia="1"]`).isDisabled(), true, 'Seg desabilitada na linha do Sáb');
    await f.fill(`[data-p="vigencias.${j}.fim"]`, '13:30'); await f.locator(`[data-p="vigencias.${j}.fim"]`).dispatchEvent('change'); await w();
    await f.click('#fSalvar'); await w(1500);
    const T1 = await f.evaluate(() => Cad.D.turnos.find(t => t.codigo === 'T1').vigencias.map(v => [v.de, v.ate, v.inicio, v.fim, (v.dias || []).join('')]));
    assert.deepEqual(T1, [[D.de0, D.fim, '06:00', '14:30', '123456'], [D.nova, null, '06:00', '14:30', '12345'], [D.nova, null, '06:00', '13:30', '6']]);
    console.log('ok Administração: período novo com Seg–Sex 06:00–14:30 e Sáb 06:00–13:30; o dia de uma linha fica desabilitado na outra');

    // 3) leitura comum e Produção: o sábado usa a janela do sábado; a meta acompanha
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());
    await w(1500);
    const R = await o.evaluate(nova => {
      { const d0 = Store.S.db; Store.S.db = d0; } try { Engine.bumpConfig(); } catch (e) { }   // remonta as tabelas a partir do cadastro
      const mk = dt => { const d = Engine.buildDay(db(), dt, 'line_vac', 'mac_line', 'x'), cat = db().catalogs.find(c => c.active !== false); d.shifts.forEach(p => { p.initialCatalogId = cat.id; });
        const r = Engine.computeDayRaw(db(), d), sr = r.shifts.find(x => x.ps.snap.code === 'T1'); return { janela: sr.ps.snap.start + '–' + sr.ps.snap.end, ivs: sr.ps.intervals.length, meta: sr.r.metaOp }; };
      /* a primeira sexta e o sábado seguinte a partir do início da vigência nova (antes eram datas fixas) */
      const x = new Date(nova + 'T12:00:00'); while (x.getDay() !== 5) x.setDate(x.getDate() + 1); const iso = y => y.toISOString().slice(0, 10), sex = iso(x); x.setDate(x.getDate() + 1); const sab = iso(x);
      return { sexta: mk(sex), sabado: mk(sab), comum: vacTurnosEm(sab).find(t => t.codigo === 'T1'), comumSexta: vacTurnosEm(sex).find(t => t.codigo === 'T1') };
    }, D.nova);
    assert.equal(R.comum.inicio + '–' + R.comum.fim, '06:00–13:30', 'vacTurnosEm no sábado'); assert.equal(R.comumSexta.fim, '14:30', 'vacTurnosEm na sexta');
    assert.equal(R.sexta.janela, '06:00–14:30'); assert.equal(R.sabado.janela, '06:00–13:30');
    assert.ok(R.sabado.ivs < R.sexta.ivs && R.sabado.meta < R.sexta.meta, 'sábado com menos intervalos e meta menor ' + JSON.stringify(R));
    console.log(`ok Produção: sexta ${R.sexta.janela} (${R.sexta.ivs} intervalos), sábado ${R.sabado.janela} (${R.sabado.ivs} intervalos, meta menor)`);

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok turno de sábado: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
