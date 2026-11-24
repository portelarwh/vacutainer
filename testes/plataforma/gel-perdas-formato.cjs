// Administração › Gel: perdas teóricas e gel padrão por formato do tubo (Tubo 100 e Tubo 75), com vigência.
// 1) vacGel.procAt(data, formato): vigência sem formato vale para todos; a do formato vence na mesma data; sem formato, só as de todos;
// 2) vacGel.teorico: cada catálogo usa as perdas do formato do seu tubo; com um só formato o resultado é o de sempre (gel ÷ (1 − perdas));
// 3) a tela grava a vigência por formato (3 botões "+ Vigência"), recusa data e formato repetidos e a leitura pega o que foi gravado.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const w = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-23T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof vacGel !== 'undefined', null, { timeout: 30000 });

    // 1) e 2): a leitura, com vigências simuladas só na memória da página
    const r = await f.evaluate(() => {
      const orig = vacCad.param, V = [
        { from: '2025-01-01', g: .98, pT: 2, pB: 1, pP: 1 },
        { from: '2025-06-01', fmt: '75', g: .7, pT: 4, pB: 2, pP: 2 },
        { from: '2026-01-01', fmt: '100', g: .9, pT: 3, pB: 1, pP: 1 }];
      vacCad.param = c => c === 'gel.processo' ? V : orig(c);
      try {
        const cg = c => ({ fmt: c === 'A' ? '100' : '75', vig: [{ from: '2000-01-01', gTubo: 1 }] });
        const um = vacGel.teorico({ tubosPorCat: { A: 1e6 }, date: '2026-06-01', cg }), dois = vacGel.teorico({ tubosPorCat: { A: 1e6, B: 1e6 }, date: '2026-06-01', cg });
        return {
          todos: vacGel.procAt('2026-06-01').pT, t100: vacGel.procAt('2026-06-01', '100').pT, t75: vacGel.procAt('2026-06-01', '75').pT,
          antes75: vacGel.procAt('2025-03-01', '75').pT, mesmaData: vacGel.procAt('2026-01-01', '100').pT, outroFmt: vacGel.procAt('2026-06-01', '999').pT,
          um: um.teo, doisTeo: dois.teo, doisT: dois.sTeo.T, gelBons: dois.gelBons };
      } finally { vacCad.param = orig; }
    });
    assert.deepEqual([r.todos, r.t100, r.t75, r.antes75, r.mesmaData, r.outroFmt], [2, 3, 4, 2, 3, 2], 'procAt por formato ' + JSON.stringify(r));
    const e100 = 1000 / (1 - .05), e75 = 1000 / (1 - .08);
    assert.ok(Math.abs(r.um - e100) < 1e-9, 'um formato: gel ÷ (1 − perdas) como sempre ' + r.um);
    assert.ok(Math.abs(r.doisTeo - (e100 + e75)) < 1e-9 && r.gelBons === 2000, 'dois formatos somam o teórico de cada um ' + JSON.stringify(r));
    assert.ok(Math.abs(r.doisT - (e100 * .03 + e75 * .04)) < 1e-9, 'perda de tubos por formato ' + r.doisT);
    console.log('ok procAt e teórico por formato do tubo (100: 3 % · 75: 4 % · todos: 2 %)');

    // 3) a tela
    await f.evaluate(() => { location.hash = '#cadastros'; App.render(); }); await f.waitForSelector('.cadside');
    await f.evaluate(() => { Cad.ui.sec = 'inicio'; App.render(); }); await f.click('.cadside [data-sec="gel"]'); await f.waitForSelector('#gelPar');
    assert.equal(await f.locator('#gelPar [data-pgadd="processo"]').count(), 3, 'três botões de vigência: Tubo 100, Tubo 75 e todos');
    await f.click('#gelPar [data-pgadd="processo"]:has-text("Tubo 75")'); await w(300);
    assert.equal(await f.inputValue('#gelPar [data-pg="processo.0.fmt"]'), '75', 'a linha nova vem com o formato 75');
    await f.fill('#gelPar [data-pg="processo.0.pT"]', '5'); await f.fill('#gelPar [data-pg="processo.0.g"]', '0.7');
    await f.click('#gelPar [data-pgadd="processo"]:has-text("Tubo 75")'); await w(300);   // segunda vigência do mesmo formato e da mesma data
    await f.click('#gpOk'); await w(500);
    assert.equal(await f.evaluate(() => (Cad.D.parametros.gel || {}).processo), undefined, 'data e formato repetidos: recusado, nada gravado');
    await f.evaluate(() => { document.querySelector('#gelPar [data-pgdel="processo.1"]').click(); });
    await w(300);
    await f.fill('#gelPar [data-pg="processo.0.pT"]', '5'); await f.click('#gpOk'); await w(600);
    const g = await f.evaluate(() => ({ P: Cad.D.parametros.gel.processo, t75: vacGel.procAt('2099-01-01', '75').pT, t100: vacGel.procAt('2099-01-01', '100').pT }));
    assert.deepEqual(g.P.map(x => [x.fmt, x.pT, x.g]), [['75', 5, 0.7]], 'gravou a vigência do Tubo 75 ' + JSON.stringify(g.P));
    assert.equal(g.t75, 5, 'o cálculo do Tubo 75 lê a vigência gravada'); assert.equal(g.t100, 2.2406, 'Tubo 100 sem vigência continua no padrão');
    console.log('ok tela: vigência por formato gravada; data e formato repetidos recusados');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
