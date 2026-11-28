// Plataforma 1.8.112 · OEE do turno e do dia no Meu Turno (1.0; pedido do responsável, 28/11/2026). Demonstração, dados fictícios. Prova:
//  1. o cadastro que a Administração manda ao celular leva o PPH nominal e a meta de OEE de cada catálogo e as pausas que descontam;
//  2. a capacidade de cada turno no celular é a mesma que a Produção publica (porDiaTurno.cap) para o mesmo dia e catálogo;
//  3. o 2º turno informa só a produção boa do 1º (do quadro): o celular calcula o OEE do turno, o do dia (Σ boa ÷ Σ capacidade) e a
//     mensagem do WhatsApp mostra os dois, com a meta, o ✎ no turno informado e "—" enquanto faltar um turno.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
const mt = fs.readFileSync(path.resolve(__dirname, '../../CELULAR/index.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/mt') ? mt : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, erros = [];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/Sao_Paulo' }), page = await ctx.newPage();
    page.on('pageerror', e => erros.push('plataforma: ' + e.message)); await page.clock.setFixedTime(new Date('2026-11-19T10:00:00-03:00'));
    await page.goto(base + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof MT_APP === 'object', null, { timeout: 60000 });
    const cfg = await f.evaluate(() => MT_APP.cfg(Cad.D).c);
    const c0 = cfg.cats.find(c => c.c === '360060');
    assert.ok(c0 && c0.pph > 0 && c0.oeeMeta > 0, 'catálogo com PPH nominal e meta de OEE: ' + JSON.stringify(c0));
    assert.ok(cfg.turnos.every(t => Array.isArray(t.p)), 'turnos com a lista de pausas que descontam');
    console.log(`ok cadastro para o celular: ${c0.c} com PPH ${c0.pph}/h e meta de OEE ${(c0.oeeMeta * 100).toFixed(1)}%; pausas nos ${cfg.turnos.length} turnos`);

    // capacidade publicada pela Produção para o mesmo dia
    await page.goto(base + '/?demo=1#/oee?tab=reports');
    const q = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
    await q.waitForFunction(() => window.vacPagina && vacPagina.pronto() && typeof Exports !== 'undefined', null, { timeout: 60000 });
    const prod = await q.evaluate(() => { const E = Exports.build(db()); const d = E.porDiaTurno.filter(x => x.cap > 0).map(x => x.dia).sort().pop(); return { dia: d, T: E.porDiaTurno.filter(x => x.dia === d && x.cap > 0).map(x => ({ turno: x.turno, cap: x.cap, boa: x.boa })) }; });
    assert.ok(prod.T.length >= 2, 'a Produção publica ao menos dois turnos: ' + JSON.stringify(prod));

    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo' }); await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => r.abort());
    await cel.addInitScript(c => { if (!localStorage.getItem('mt.cfg')) localStorage.setItem('mt.cfg', JSON.stringify(c)); }, cfg);
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.clock.setFixedTime(new Date(prod.dia + 'T16:00:00-03:00'));
    await m.goto(base + '/mt.html'); await m.waitForFunction(() => typeof capDe === 'function' && typeof txtWA === 'function');
    const caps = await m.evaluate(T => T.map(x => ({ turno: x.turno, cel: Math.round(capDe(turnoDe(x.turno), cat('360060'), x.dia) * 1000), prod: x.cap })), prod.T.map(x => ({ ...x, dia: prod.dia })));
    for (const x of caps) assert.equal(x.cel, x.prod, `capacidade do ${x.turno} no celular = a da Produção (${x.cel} × ${x.prod})`);
    console.log('ok capacidade no celular = a publicada pela Produção em ' + prod.dia + ': ' + caps.map(x => `${x.turno} ${x.cel}`).join(', '));
    const pz = await m.evaluate(dia => { const t = CFG.turnos.find(x => x.c === 'T1'), p0 = t.p; t.p = [{ i: '10:00', f: '10:30', min: null, dias: [] }, { i: '', f: '', min: 10, dias: [] }];
      try { return { min: tempoTurno(t, dia), cap: capDe(t, cat('360060'), dia) }; } finally { t.p = p0; } }, prod.dia);
    assert.equal(pz.min, 510 - 40, 'pausas que descontam saem do tempo disponível (30 min com horário + 10 min sem horário)'); assert.equal(Math.round(pz.cap * 1000), 72000 * 470 / 60);
    console.log('ok pausas que descontam: 8h30 − 40 min = ' + pz.min + ' min disponíveis');

    // 2º turno: informa a boa do 1º (do quadro) e lança o próprio hora a hora
    const r = await m.evaluate(dia => {
      const T = novoTurno('T2', dia); T.cat = '360060'; T.catSnap = fotoCat(cat('360060')); T.slots.forEach((s, i) => { s.real = i < 4 ? 60 : null; });
      TURNOS.push(T); salvarT(); const sem = txtWA(T);
      T.ant = { T1: { boa: 480, cat: '360060', snap: fotoCat(cat('360060')), t: turnoSnap(turnoDe('T1')) } }; salvarT(); const D = diaDe(T), R = resumo(T);
      return { sem, com: txtWA(T), D: { oee: D.oee, boa: D.boa, cap: D.cap }, oee: R.oee, cap: R.cap, id: T.id };
    }, prod.dia);
    const capT2 = caps.find(x => x.turno === 'T2').cel / 1000, capT1 = caps.find(x => x.turno === 'T1').cel / 1000;
    assert.ok(Math.abs(r.cap - capT2) < 1e-9 && Math.abs(r.oee - 240 / capT2) < 1e-9, 'OEE do turno = boa ÷ capacidade');
    assert.ok(Math.abs(r.D.oee - (480 + 240) / (capT1 + capT2)) < 1e-9, 'OEE do dia = Σ boa ÷ Σ capacidade (não média de %)');
    assert.match(r.sem, /⚪ \*OEE do dia: —\* \(falta T1\)/, 'sem o 1º turno informado, o dia fica —');
    assert.match(r.com, /\*OEE do turno: [\d,]+%\* \(meta [\d,]+%\)/); assert.match(r.com, /Capacidade: [\d.,]+ mil em 8h30/);
    assert.match(r.com, /📅 \*DIA \d\d\/\d\d ATÉ O 2º TURNO\* \(2 de 3 turnos\)\n```\nTURNO +BOA +CAP +OEE\nT1 ✎ +480 /); assert.match(r.com, /\nDIA +720 /); assert.match(r.com, /\*OEE do dia: [\d,]+%\* \(meta [\d,]+%\)\n✎ informado pelo quadro/);
    const linhas = [...r.com.matchAll(/```\n([\s\S]*?)\n```/g)].flatMap(x => x[1].split('\n'));
    assert.ok(linhas.every(l => [...l.replace(/[🟢🔴]/gu, 'xx')].length <= 26), 'tabelas com até 26 caracteres: ' + linhas.filter(l => [...l].length > 26).join(' | '));
    console.log('ok 2º turno: OEE do turno ' + (r.oee * 100).toFixed(1) + '% e do dia ' + (r.D.oee * 100).toFixed(1) + '% (Σ boa ÷ Σ capacidade); sem o 1º turno, o dia fica —');

    // na tela: o cartão "Dia até agora" recebe a boa do 1º turno
    await m.evaluate(() => { location.hash = 'turno'; }); await m.waitForSelector('[data-ant="T1"]');
    await m.fill('[data-ant="T1"]', '490'); await m.locator('[data-ant="T1"]').dispatchEvent('change');
    await m.waitForFunction(() => (atual().ant || {}).T1 && atual().ant.T1.boa === 490);
    assert.match(await m.locator('.card', { hasText: 'Dia até agora' }).innerText(), /OEE do dia:\s*[\d,]+%/);
    console.log('ok tela: o cartão "Dia até agora" recebe a produção boa do 1º turno e mostra o OEE do dia');
    console.log((await m.evaluate(() => txtWA(atual()))).split('\n').slice(10, 30).join('\n'));
    // revisão do PR 208: cadastro novo (PPH e pausas diferentes) não muda o OEE de um turno já registrado
    const hist = await m.evaluate(() => { const T = atual(), antes = txtWA(T), c = CFG.cats.find(x => x.c === '360060'), p0 = c.pph, t1 = CFG.turnos.find(x => x.c === 'T1'), t2 = CFG.turnos.find(x => x.c === 'T2'), q1 = t1.p, q2 = t2.p;
      c.pph = p0 * 2; t1.p = [{ i: '08:00', f: '09:00', min: null, dias: [] }]; t2.p = [{ i: '16:00', f: '17:00', min: null, dias: [] }];
      try { return { antes, depois: txtWA(T) }; } finally { c.pph = p0; t1.p = q1; t2.p = q2; } });
    assert.equal(hist.depois, hist.antes, 'o relatório do turno guarda o horário, as pausas e o PPH do momento');
    console.log('ok cadastro novo (PPH dobrado, pausas novas) não muda o OEE já registrado do turno nem do dia');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
