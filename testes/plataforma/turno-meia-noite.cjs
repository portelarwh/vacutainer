// Plataforma 1.8.27 (Produção 2.6.19) · TUR-06: produção na janela do 3º turno não produtivo pela regra do relógio (decisão do responsável,
// 20/11/2026; dias a partir de 01/11/2026): antes da meia-noite → o turno anterior (2º); depois → o próximo produtivo (1º do dia seguinte),
// sem olhar paradas no meio. Hora extra acima de 60 min só avisa. Dias antes da data seguem a continuidade entre caixas (D1).
// Dados fictícios: noite montada só na memória da página da demonstração (3º turno fora do dia; caixas 23:05–23:20, 23:50–00:30, 03:00–03:20).
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
    /* data fixa num dia útil (dia seguinte também útil): no sábado/domingo (TUR-04) o horário dos turnos muda e o teste dependia do dia em que rodava */
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());

    const prep = await o.evaluate(() => {
      const d = db(), day = d.productionDays.find(x => !x.deleted && x.date === App.sel.date), D = day.date, D1 = U.addDays(D, 1), L = day.lineId;
      const t3 = day.shifts.find(p => !p.deleted && /3/.test(p.snap.code + p.snap.name)); if (t3) t3.deleted = true;   /* 3º turno fora do dia (não produtivo) */
      const t2 = day.shifts.filter(p => !p.deleted).sort((a, b) => a.intervals[0].start - b.intervals[0].start).pop();
      d.settings.foraTurnoDesde = '2026-11-01';
      const seg = (data, hh, mm, n, id) => { const t0 = `${data}T${hh}:${mm}:00`, base = ServerData.tm(t0), fim = new Date((base + n - 1) * 60000).toISOString().slice(11, 19);
        const t1d = base + n - 1 >= ServerData.dayStartMin(data) + 1440 ? D1 : data;
        return { id, lot: '6275187', cat: '360060', b0: 1, b1: n, n, t0, t1: `${t1d}T${fim}`, base, m: '0' + ',1'.repeat(n - 1), lineId: L }; };
      d.server.segments.push(seg(D, '23', '05', 16, 'tst1'), seg(D, '23', '50', 41, 'tst2'), seg(D1, '03', '00', 21, 'tst3'));
      d.server.rev = (d.server.rev || 0) + 1;
      return { D, D1, L, t2: t2.snap.name, t2fim: U.hhmm(Math.max(...t2.intervals.filter(i => !i.deleted).map(i => i.end))) };
    });

    // 1) regra do relógio (dia ≥ 01/11/2026)
    const r1 = await o.evaluate(({ D, L }) => ForaTurno.doDia(db(), D, L).map(i => ({ lado: i.relogio, caixas: i.caixas, alvo: i.alvo && i.alvo.name, data: i.alvo && i.alvo.date, extra: i.horaExtra ? i.horaExtra.caixas : 0, regra: i.regra })), prep);
    assert.deepEqual(r1.map(x => [x.lado, x.caixas, x.data]), [['antes', 26, prep.D], ['depois', 52, prep.D1]], JSON.stringify(r1));
    assert.equal(r1[0].alvo, prep.t2, 'antes da meia-noite → ' + prep.t2); assert.match(r1[0].regra, /antes da meia-noite/); assert.match(r1[1].regra, /depois da meia-noite → .* de \d\d\/\d\d\/\d{4}/);
    assert.equal(r1[0].extra, 10, 'fim do 2º turno 22:47 + 60 min = 23:47: as 10 caixas de 23:50–23:59 contam no 2º turno com aviso'); assert.equal(r1[1].extra, 52, '00:00–03:20: mais de 60 min antes do 1º turno → aviso');
    console.log(`ok relógio: 23:05–23:20 e 23:50–23:59 (26 caixas, parada de 30 min no meio) → ${prep.t2}; 00:00–00:30 e 03:00–03:20 (52) → 1º turno de ${prep.D1}`);

    // 2) o dia que recebe: produção do 2º turno inclui as 26 caixas; aviso de hora extra (só aviso; a conta não muda)
    const r2 = await o.evaluate(({ D }) => { const day = db().productionDays.find(x => !x.deleted && x.date === D); day._rev = (day._rev || 0) + 1; const res = Engine.computeDay(db(), day), ft = res.foraTurno;
      return { recebe: ft ? ft.recebe.filter(i => i.alvo.date === D).map(i => i.caixas) : [], pecas: ft ? ft.pecas : 0, aviso: res.msgs.some(m => /hora extra/.test(m.text || m.msg || '')) }; }, prep);
    assert.deepEqual(r2.recebe, [26]); assert.equal(r2.pecas, 26 * 1000); assert.equal(r2.aviso, true, 'aviso de hora extra acima de 60 min');
    console.log('ok o 2º turno recebe 26 mil peças fora do turno (OEE reportado) e o dia avisa a hora extra acima de 60 min (23:50–23:59)');

    // 3) antes de 01/11/2026 (aqui: regra marcada para começar depois): continuidade entre caixas, 10 min → tudo vai para o 1º turno
    const r3 = await o.evaluate(({ D, L }) => { db().settings.foraTurnoRelogioDesde = '2027-01-01'; try { return ForaTurno.doDia(db(), D, L).map(i => [i.caixas, i.alvo && i.alvo.date]); } finally { delete db().settings.foraTurnoRelogioDesde; } }, prep);
    assert.ok(r3.length >= 2 && r3.every(([, dt]) => dt === prep.D1), 'regra antiga (continuidade de 10 min): ' + JSON.stringify(r3));
    console.log('ok antes da data da regra nova: continuidade de 10 min (a parada de 30 min manda o resto para o 1º turno), como era');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok regra da meia-noite: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
