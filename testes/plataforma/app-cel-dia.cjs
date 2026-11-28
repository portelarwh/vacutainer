// APP-CEL fase 3, parte 2 (plataforma 1.8.104, Linha no celular 0.3, Meu Turno 0.7; o responsável pediu os quatro itens em 28/11/2026):
// a plataforma manda o pacote do dia por QR (ou arquivo) para o celular: ordens e lotes, plano e meta, ações abertas e o resumo de ontem.
// Tudo sai dos exports já publicados (Produção e Iniciativas); o que não foi publicado vai como ausente, nunca como zero. No celular,
// "Dia de hoje" mostra os quatro blocos (só consulta) e, na Operação, as ordens do dia viram a lista do campo Lote; escolher o lote
// preenche a OP vazia. Demonstração, dados fictícios.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/Linha') ? app : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, erros = [], externos = [];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }), page = await ctx.newPage();
    page.on('pageerror', e => erros.push('plataforma: ' + e.message));
    await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
    await page.goto(base + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof App !== 'undefined' && MOD.data.oee && MOD.data.oee.ex, null, { timeout: 60000 });
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#linhaDia');
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#linhaGerar')]); app = fs.readFileSync(await dl.path(), 'utf8');

    // 1. o pacote do dia sai dos exports publicados
    const P = await f.evaluate(() => MT_APP.pacoteDia());
    assert.equal(P.a, 'linha-dia'); assert.ok(P.ordens.some(o => o.lote === '6275187' && o.ordem === '100234567'), 'ordem e lote do cenário');
    assert.ok(P.plano && P.plano.mes && P.plano.atual != null, 'plano do mês'); assert.ok(Array.isArray(P.acoes) && P.acoes.length >= 1 && P.acoes.every(a => a.titulo), 'ações abertas');
    assert.ok(P.resumo === null || (P.resumo.dia < P.dia && 'oee' in P.resumo), 'resumo do dia anterior (ou ausente)');
    // com um dia anterior publicado (cópia em memória dos exports), o resumo de ontem traz o dia e os turnos
    const R = await f.evaluate(() => { const ex = MOD.data.oee.ex, bk = [ex.porDia, ex.porDiaTurno], d0 = todayISO(), d = new Date(d0 + 'T12:00:00'); d.setDate(d.getDate() - 1); const on = d.toISOString().slice(0, 10);
      try { ex.porDia = (bk[0] || []).concat([{ dia: on, oee: 0.7, oeeMeta: 0.775, boa: 800000, scrap: 1000, metaOp: 900000 }]); ex.porDiaTurno = (bk[1] || []).concat([{ dia: on, turno: 'T1', oee: 0.71, boa: 400000, metaOp: 450000, scrap: 500 }]); return { on, r: MT_APP.pacoteDia().resumo }; }
      finally { ex.porDia = bk[0]; ex.porDiaTurno = bk[1]; } });
    assert.equal(R.r.dia, R.on); assert.equal(R.r.boa, 800000); assert.deepEqual(R.r.turnos.map(x => x.turno), ['T1']);
    await f.click('#linhaDia'); await f.waitForSelector('#cqQr svg'); assert.match(await f.locator('#coreModal h2').innerText(), /Enviar o dia ao celular/);
    const [dj] = await Promise.all([page.waitForEvent('download'), f.click('#cqArq')]); assert.equal(dj.suggestedFilename(), 'dia-linha.json');
    const arq = JSON.parse(fs.readFileSync(await dj.path(), 'utf8')); assert.equal(arq.a, 'linha-dia');
    const env = await f.evaluate(async () => { Modal.close(true); const r = await MT_APP.enviarQR(Cad.D, MT_APP.pacoteDia(), 'Enviar o dia ao celular'); Modal.close(true); return r; });
    console.log(`ok pacote do dia: ${P.ordens.length} ordem(ns), plano ${P.plano.mes}, ${P.acoes.length} ação(ões) aberta(s), resumo ${P.resumo ? P.resumo.dia : 'ausente'}; ${env.partes.length} QR e dia-linha.json`);

    // 2. no celular: lido pelo QR (jsQR do app), a tela "Dia" mostra os quatro blocos
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await cel.clock.install({ time: new Date('2026-11-20T10:20:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/Linha.html'); await m.locator('[data-m="op"]').waitFor();
    assert.equal(await m.locator('#dia').count(), 0, 'sem pacote, sem o botão do dia');
    const ok = await m.evaluate(async svgs => { if (!window.jsQR) (0, eval)(VAC_JSQR); const e = {}; for (const s of svgs) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode();
        const cv = document.createElement('canvas'); cv.width = 600; cv.height = 600; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 600, 600); g.drawImage(img, 0, 0, 600, 600);
        const q = window.jsQR(g.getImageData(0, 0, 600, 600).data, 600, 600); if (!q) return 'QR não lido'; VAC_LINHA_QR.juntar(e, q.data); }
      return VAC_LINHA_QR.aplicar(await VAC_LINHA_QR.pacote(e)); }, env.svgs);
    assert.match(String(ok), /^Dia \d\d\/\d\d\/\d{4}$/);
    await m.reload(); await m.click('#dia'); const tela = await m.locator('#vl').innerText();
    for (const t of ['Plano e meta', 'Ordens e lotes', 'Ações abertas', 'Resumo de ontem', 'Lote 6275187', 'OP 100234567']) assert.ok(tela.toLowerCase().includes(t.toLowerCase()), 'tela do dia mostra ' + t);   /* títulos em maiúsculas pelo CSS */
    assert.ok(!/NaN|undefined|null/.test(tela), 'sem NaN/undefined/null na tela');
    console.log('ok celular: QR do dia lido pelo jsQR do app; "Dia" mostra plano e meta, ordens e lotes, ações abertas e resumo de ontem');

    // 3. pelo arquivo, com a tela de confirmação; na Operação, o lote vira lista e preenche a OP
    await m.click('#volta'); await m.click('#atu'); await m.setInputFiles('#arq', { name: 'dia-linha.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(arq)) });
    await m.locator('h1', { hasText: 'Dia recebido' }).waitFor({ timeout: 10000 }); await m.click('#volta');
    await m.click('[data-m="op"]'); await m.click('#lancar'); await m.waitForSelector('#lote');
    assert.equal(await m.locator('#lote').getAttribute('list'), 'lotesDia'); assert.ok(await m.locator('#lotesDia option[value="6275187"]').count() === 1, 'lote do dia na lista');
    await m.fill('#lote', '6275187'); assert.equal(await m.inputValue('#opn'), '100234567', 'escolher o lote preenche a OP');
    console.log('ok arquivo dia-linha.json recebido; na Operação o lote do dia vem da lista e preenche a OP');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
