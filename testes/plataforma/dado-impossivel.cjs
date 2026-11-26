// A01, A08, A09, A10 (auditoria de 26/11/2026, autorizado pelo responsável): o lançamento recusa dado impossível e diz o motivo:
// produção ou scrap negativos ou não numéricos, e acima de 3x a capacidade do trecho; a importação da planilha recusa linha com valor negativo.
// O que é possível continua entrando. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }), erros = [];
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept()); await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof Actions !== 'undefined' && db().productionDays.length, null, { timeout: 30000 });
    const r = await f.evaluate(() => { const d = db(), day = d.productionDays.find(x => !x.deleted), ps = day.shifts[0], iv = ps.intervals[1], tenta = fn => { try { fn(); return 'passou'; } catch (e) { return e.message; } };
      day.status = 'em lançamento';
      const out = {
        negativa: tenta(() => Actions.setIv(day.id, iv.id, 'good', -5)), texto: tenta(() => Actions.setIv(day.id, iv.id, 'good', 'abc')), gigante: tenta(() => Actions.setIv(day.id, iv.id, 'good', 51000 * 1000)),
        lote: tenta(() => Actions.setGoods(day.id, [{ ivId: iv.id, good: 1e9 }])), normal: tenta(() => Actions.setIv(day.id, iv.id, 'good', 52000)), zero: tenta(() => Actions.setIv(day.id, iv.id, 'good', 0)), vazio: tenta(() => Actions.setIv(day.id, iv.id, 'good', null)),
        scrapNeg: tenta(() => Actions.setShiftField(day.id, ps.id, 'scrap', -500)), scrapGigante: tenta(() => Actions.setShiftField(day.id, ps.id, 'scrap', 1e9)), scrapNormal: tenta(() => Actions.setShiftField(day.id, ps.id, 'scrap', 3300)),
        goodDepois: (() => { const dd = db().productionDays.find(x => x.id === day.id); return dd.shifts[0].intervals[1].good; })(), scrapDepois: (() => { const dd = db().productionDays.find(x => x.id === day.id); return dd.shifts[0].scrap; })() };
      day.scrapMode = 'day'; out.scrapDiaNeg = tenta(() => Actions.setDayField(day.id, 'scrapDay', -1)); out.scrapDiaGigante = tenta(() => Actions.setDayField(day.id, 'scrapDay', 1e9)); out.scrapDiaNormal = tenta(() => Actions.setDayField(day.id, 'scrapDay', 8000));
      return out; });
    assert.match(r.negativa, /não pode ser negativa/); assert.match(r.texto, /informe um número/); assert.match(r.gigante, /mais de 3x a capacidade/); assert.match(r.lote, /mais de 3x a capacidade/);
    assert.equal(r.normal, 'passou'); assert.equal(r.zero, 'passou'); assert.equal(r.vazio, 'passou'); assert.equal(r.goodDepois, null, 'o último valor aceito (vazio) é o que ficou; os recusados não entraram');
    assert.match(r.scrapNeg, /não pode ser negativa/); assert.match(r.scrapGigante, /mais de 3x a capacidade do turno/); assert.equal(r.scrapNormal, 'passou');
    assert.match(r.scrapDiaNeg, /não pode ser negativa/); assert.match(r.scrapDiaGigante, /mais de 3x a capacidade do dia/); assert.equal(r.scrapDiaNormal, 'passou');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok dado impossível: produção e scrap negativos, não numéricos ou acima de 3x a capacidade são recusados com o motivo; o normal, zero e vazio passam');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
