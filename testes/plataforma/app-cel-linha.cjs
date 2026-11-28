// APP-CEL fase 2 (plataforma 1.8.102; pedido do responsável em 27/11/2026): um app só no celular, com os módulos Operação (Meu Turno)
// e Manutenção. A Administração › Apps de celular gera o Linha.html com os dois apps já configurados com o cadastro; no celular a pessoa
// escolhe o módulo, cada um funciona como o app separado e guarda os próprios dados; "Trocar de módulo" volta à escolha; "Abrir direto
// no último módulo usado" é opcional. O modelo no repositório (sem módulos) avisa que o arquivo é gerado pela plataforma. Dados fictícios.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const H = require('../../scripts/html.cjs');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
assert.equal(H.load().text('celular/linha'), fs.readFileSync(path.resolve(__dirname, '../../CELULAR/linha.html'), 'utf8'), 'bloco celular/linha igual a CELULAR/linha.html (use: node scripts/bloco.mjs celular/linha CELULAR/linha.html)');
console.log('ok modelo do app da linha na plataforma = CELULAR/linha.html');
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/Linha') ? app : q.url.startsWith('/Modelo') ? fs.readFileSync(path.resolve(__dirname, '../../CELULAR/linha.html')) : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, erros = [], externos = [];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }), page = await ctx.newPage();
    page.on('pageerror', e => erros.push('plataforma: ' + e.message));
    await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
    await page.goto(base + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof App !== 'undefined', null, { timeout: 60000 });
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#linhaGerar');
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#linhaGerar')]);
    assert.equal(dl.suggestedFilename(), 'Linha.html'); app = fs.readFileSync(await dl.path(), 'utf8');
    const mods = await page.evaluate(h => { const m = h.match(/const VAC_MODS=\/\*MODS\*\/([\s\S]*?)\/\*MODS\*\//); return JSON.parse(m[1]); }, app);
    assert.ok(/const CFG_EMB=\/\*CFG\*\/\{/.test(mods.op) && /Meu Turno/.test(mods.op), 'módulo Operação = Meu Turno configurado');
    assert.ok(/const CFG_EMB=\/\*CFG\*\/\{/.test(mods.man) && /Manutenção/.test(mods.man), 'módulo Manutenção configurado');
    assert.ok(mods.meta.linha && mods.meta.cadRev != null, 'linha e revisão do cadastro');
    console.log(`ok Administração gera Linha.html (${Math.round(app.length / 1024)} KB) com Operação e Manutenção configurados (cadastro rev ${mods.meta.cadRev})`);

    // no celular
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await cel.clock.install({ time: new Date('2026-11-20T10:20:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/Linha.html');
    await m.locator('[data-m="op"]').waitFor(); assert.equal(await m.locator('[data-m]').count(), 2, 'escolha entre Operação e Manutenção');
    assert.match(await m.locator('.rod').innerText(), /cadastro de \d\d\/\d\d\/\d{4} \(rev \d+\)/);
    await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    assert.equal(await m.locator('#trocaMod').count(), 1, 'Operação mostra Trocar de módulo');
    await m.click('#lancar'); await m.waitForSelector('[data-real]'); await m.fill('[data-real="0"]', '50'); await m.locator('[data-real="0"]').dispatchEvent('change');
    await m.goto(base + '/Linha.html'); await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    assert.match(await m.locator('#lancar').innerText(), /Continuar meu turno/, 'o turno lançado continua no módulo Operação');
    console.log('ok Operação: abre o Meu Turno configurado, lança e o turno continua depois de reabrir');

    await m.click('#trocaMod'); await m.locator('[data-m="man"]').waitFor();
    await m.click('[data-m="man"]'); await m.locator('#novo').waitFor();
    assert.equal(await m.locator('#trocaMod').count(), 1, 'Manutenção mostra Trocar de módulo');
    await m.click('#novo'); await m.waitForFunction(() => /^#at\//.test(location.hash));
    await m.evaluate(() => { location.hash = '#inicio'; }); await m.locator('[data-at]').first().waitFor();
    console.log('ok Trocar de módulo volta à escolha; Manutenção abre e registra um atendimento');

    // os dados de cada módulo ficam separados e continuam
    const dados = await m.evaluate(() => Object.keys(localStorage).filter(k => /^(mt|mm)\./.test(k)).map(k => k.split('.')[0]));
    assert.ok(dados.includes('mt') && dados.includes('mm'), 'dados da Operação (mt.) e da Manutenção (mm.) no mesmo celular');
    await m.click('#trocaMod'); await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    assert.match(await m.locator('#lancar').innerText(), /Continuar meu turno/);
    console.log('ok dados separados por módulo (mt. e mm.) e preservados ao trocar');

    // abrir direto no último módulo usado (opcional)
    await m.click('#trocaMod'); await m.locator('#lem').check(); await m.click('[data-m="man"]'); await m.locator('#novo').waitFor();
    await m.goto(base + '/Linha.html'); await m.locator('#novo').waitFor({ timeout: 10000 });
    assert.equal(await m.locator('[data-m]').count(), 0, 'com "Abrir direto" marcado, abre no último módulo');
    console.log('ok "Abrir direto no último módulo usado" abre a Manutenção sem passar pela escolha');

    // o modelo do repositório (sem módulos) avisa
    const m2 = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage(); m2.on('pageerror', e => erros.push('modelo: ' + e.message));
    await m2.goto(base + '/Modelo.html'); assert.match(await m2.locator('.aviso').innerText(), /Gere o arquivo pela plataforma/);
    console.log('ok o modelo sem módulos avisa que o app é gerado pela Administração');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
