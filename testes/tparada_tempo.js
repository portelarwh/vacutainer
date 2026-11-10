// Formulário real, somente dados fictícios: regras do Portal e persistência da parada.
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const srv = http.createServer((q, r) => {
  const f = path.resolve(root, '.' + decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); }
  r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'); fs.createReadStream(f).pipe(r);
});
(async () => {
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch();
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/paginas/OEE-Vacutainer.html?demo=teste-parada-tempo');
    await p.waitForFunction(() => typeof CadSync !== 'undefined' && Store.S.mode === 'exemplo');
    await p.evaluate(() => Store.mutate((d, audit) => {
      d.productionDays[0].status = 'em lançamento'; d.productionDays[0].events = [];
      d.productionDays[0].shifts.forEach(s => s.status = 'em lançamento');
      CadSync.aplicar(d, { schema: 'vac-cadastros', rev: 100, paradas: [
        { codigo: 'MIS', duracaoManual: false }, { codigo: 'MAN', duracaoManual: true },
        { codigo: 'HOR', duracaoManual: true, exigeHorario: true }, { codigo: 'SEM' }
      ].map(c => ({ nome: c.codigo, categoria: 'Teste', ativo: true, ...c })) }, audit);
    }));
    const open = () => p.evaluate(() => eventModal(db().productionDays[0], null, db().productionDays[0].shifts[0].intervals[0].id));
    const select = async code => p.selectOption('#eCode', await p.evaluate(code => db().downtimeCodes.find(c => c.code === code).id, code));
    const state = () => p.evaluate(() => {
      const m = document.querySelector('#eM');
      return { visible: !!m.getClientRects().length, readonly: m.readOnly, disabled: m.disabled, value: m.value,
        label: m.closest('label').querySelector('span').textContent, hint: document.querySelector('#eHint').textContent,
        startDisabled: document.querySelector('#eS').disabled, endDisabled: document.querySelector('#eE').disabled };
    });
    await open();
    for (const code of ['MIS', 'HOR', 'SEM']) {
      await select(code); const s = await state();
      assert.ok(s.visible && s.readonly && !s.disabled && !s.startDisabled && !s.endDisabled);
      assert.match(s.hint, /exige início e fim/);
    }
    console.log('ok duração visível e calculada para horário obrigatório, manual proibido e opção ausente');
    await select('MAN'); await p.fill('#eM', '7');
    assert.ok((await state()).startDisabled);
    await select('MIS');
    assert.equal((await state()).value, ''); assert.equal((await state()).startDisabled, false);
    await p.fill('#eS', '06:10'); await p.fill('#eE', '06:15');
    assert.equal((await state()).value, '5');
    assert.equal(await p.textContent('#eClr'), 'Limpar tempos');
    await p.click('#eClr');
    assert.equal(await p.inputValue('#eS'), ''); assert.equal(await p.inputValue('#eE'), '');
    assert.ok((await state()).readonly); assert.equal(await p.evaluate(() => document.activeElement.id), 'eS');
    await p.click('#eOk'); assert.match(await p.textContent('#eErr'), /início e fim/);
    await p.fill('#eS', '06:10'); await p.fill('#eE', '06:15'); await p.click('#eOk');
    assert.equal(await p.evaluate(() => Engine.eventMinutes(db().productionDays[0].events[0])), 5);
    await p.evaluate(() => eventModal(db().productionDays[0], db().productionDays[0].events[0].id));
    assert.equal((await state()).value, '5'); assert.ok((await state()).readonly);
    console.log('ok troca de código, limpeza, validação, gravação e reabertura por horários');
    await p.click('.overlay [data-close]'); await open(); await select('MAN');
    await p.fill('#eM', '3'); await p.click('#eOk');
    assert.ok(await p.evaluate(() => db().productionDays[0].events.some(e => e.start == null && e.minutes === 3)));
    await open(); await select('MAN'); await p.fill('#eS', '23:55'); await p.fill('#eE', '00:05');
    assert.equal((await state()).value, '10'); assert.ok((await state()).readonly);
    await p.fill('#eS', ''); await p.fill('#eE', '');
    assert.equal((await state()).value, ''); assert.equal((await state()).readonly, false);
    await p.click('.overlay [data-close]');
    await p.evaluate(() => abonoModal(db().productionDays[0], db().productionDays[0].shifts[0].id));
    await p.fill('#abD', '5'); assert.equal(await p.isDisabled('#abS'), true);
    await p.click('#abX'); await p.fill('#abS', '06:10'); await p.fill('#abE', '06:15');
    assert.equal(await p.inputValue('#abD'), '5'); assert.equal(await p.isDisabled('#abD'), true);
    assert.deepEqual(errors, []);
    console.log('ok duração manual, virada do dia, exclusão dos horários e regressão do abono; sem erros JS');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
