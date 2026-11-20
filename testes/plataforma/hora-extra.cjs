// Plataforma 1.8.28 (Produção 2.6.20) · HEX-01: "Houve hora extra?" no cartão do turno (aba Lançamento). Até 60 min antes do início ou
// depois do fim; cria o intervalo de hora extra que já existia (kind 'extra'): o tempo do turno no OEE, na meta e na capacidade cresce
// (ex.: 510 → 570 min). Limite de 60 min por turno; remover volta ao tempo original. Dados fictícios (demonstração; nada vai para pasta).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());
    const mostra = ps => o.evaluate(id => { const sec = document.getElementById('tl-' + id); if (sec) sec.classList.remove('tr-oculto'); }, ps);   // só a visão: a aba mostra um turno por vez
    const estado = () => o.evaluate(() => { const day = curDay(), ps = day.shifts.filter(p => !p.deleted).sort((a, b) => a.intervals[0].start - b.intervals[0].start)[0], res = Engine.computeDay(db(), day), sr = res.shifts.find(x => x.ps.id === ps.id);
      return { ps: ps.id, nome: ps.snap.name, extra: ps.intervals.filter(i => !i.deleted && i.kind === 'extra').map(i => U.range(i.start, i.end)), gross: sr.agg.grossMin, meta: Math.round(sr.agg.metaDec), cap: Math.round(sr.agg.cap), card: (document.querySelector(`[data-hxps="${ps.id}"]`) || {}).textContent || '' }; });

    // 1) cartão do 1º turno: pergunta e as duas opções com o horário
    const a = await estado();
    assert.match(a.card, /HORA EXTRA[\s\S]*Houve hora extra neste turno\?[\s\S]*Antes do início \(05:00–06:00\)/, a.card);
    assert.doesNotMatch(a.card, /Depois do fim/, 'depois do fim do 1º turno é horário do 2º: a opção não aparece');
    assert.deepEqual(a.extra, []);
    console.log(`ok cartão do ${a.nome}: "Houve hora extra?" com antes do início (05:00–06:00); "depois do fim" não aparece (horário do 2º turno)`);

    // 2) 60 min antes do início: o tempo do turno, a meta e a capacidade crescem
    await mostra(a.ps); await o.click(`[data-hx="${a.ps}|ini"]`); await page.waitForTimeout(500);
    const b = await estado();
    assert.deepEqual(b.extra, ['05:00–06:00']); assert.equal(b.gross, a.gross + 60, `${a.gross} → ${b.gross} min`);
    assert.ok(b.meta > a.meta && b.cap > a.cap, 'meta e capacidade maiores'); assert.match(b.card, new RegExp(`Tempo do turno: ${a.gross} \\+ 60 = ${a.gross + 60} min`));
    assert.match(b.card, /Limite de 60 min de hora extra no turno atingido/);
    console.log(`ok hora extra 05:00–06:00: tempo do turno ${a.gross} → ${b.gross} min, meta ${a.meta} → ${b.meta}, capacidade ${a.cap} → ${b.cap}; limite de 60 min atingido`);

    // 3) a hora extra aparece no hora a hora do turno; remover volta ao original
    assert.ok(await o.evaluate(() => [...document.querySelectorAll('.hh tr.extra')].some(tr => /05:00/.test(tr.textContent))), 'linha de hora extra no hora a hora');
    await mostra(a.ps); await o.click('[data-hxdel]'); await o.click('#cOk'); await page.waitForTimeout(500);
    const c = await estado(); assert.deepEqual(c.extra, []); assert.equal(c.gross, a.gross);
    console.log('ok a hora extra aparece no hora a hora; remover volta o tempo do turno ao original');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok hora extra: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
