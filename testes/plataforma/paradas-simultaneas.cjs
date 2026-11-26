// A03 (auditoria de 26/11/2026, autorizado pelo responsável): paradas simultâneas contam UMA vez (união dos intervalos, por categoria).
// Base: dia da demonstração (parada de 07:00 a 07:30). Demonstração, dados fictícios.
const assert = require('node:assert/strict');
const { abrir } = (() => { const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
  return { async abrir(fn) { const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const b = await chromium.launch(require('./chromium.cjs')()), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z')); await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 }); const f = await (await q.elementHandle()).contentFrame();
    await f.waitForFunction(() => window.vacPagina?.pronto() && typeof Engine !== 'undefined' && db().productionDays.length, null, { timeout: 30000 });
    try { return await fn(f, erros); } finally { await b.close(); srv.close(); } } }; })();
abrir(async (f, erros) => {
  const r = await f.evaluate(() => { const d = db(), base = d.productionDays.find(x => !x.deleted), clone = o => JSON.parse(JSON.stringify(o));
    const ev = (s, e, code = 'dc_fme') => ({ id: 'x' + s + '_' + e + code, codeId: code, start: s, end: e, minutes: null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } });
    const medir = evs => { const x = clone(base); evs.forEach(e => x.events.push(e)); const per = Engine.periodResult(d, [x], {}), res = Engine.computeDay(d, x); return { aMin: per.aMin, D: per.D, oee: per.oee, msgs: res.msgs.map(m => m.msg) }; };
    return { base: medir([]), igual: medir([ev(420, 480), ev(420, 480, 'dc_fme')]), parcial: medir([ev(430, 500)]), contiguas: medir([ev(480, 540), ev(540, 600)]), dentro: medir([ev(425, 440)]), separadas: medir([ev(600, 630), ev(700, 730)]) }; });
  // base: 07:00–07:30 (30 min). 
  assert.equal(r.base.aMin, 30);
  assert.equal(r.igual.aMin, 60, 'duas paradas 07:00–08:00 (e a de 07:00–07:30 do dia): união = 07:00–08:00 = 60 min (antes somava 150)');
  assert.equal(r.parcial.aMin, 80, 'parcial: 07:00–07:30 e 07:10–08:20 => união 07:00–08:20 = 80 min'); 
  assert.equal(r.contiguas.aMin, 30 + 120, 'contíguas (08:00–09:00 e 09:00–10:00) somam normalmente: 30 + 120');
  assert.equal(r.dentro.aMin, 30, 'parada inteira dentro de outra não soma nada');
  assert.equal(r.separadas.aMin, 30 + 30 + 30, 'separadas somam');
  assert.ok(r.igual.msgs.some(m => /coincide com outra já contada/.test(m)), 'avisa que parte não soma de novo');
  assert.ok(!r.separadas.msgs.some(m => /coincide com outra/.test(m)), 'sem aviso quando não há coincidência');
  assert.ok(r.igual.D > 0.93 && r.igual.D < 0.95, 'D coerente com 60 min parados: ' + r.igual.D);
  assert.deepEqual(erros, []); console.log('ok paradas simultâneas contam uma vez: igual 150→60, parcial=união, contíguas e separadas somam, aviso quando coincide');
}).catch(e => { console.error(e); process.exit(1); });
