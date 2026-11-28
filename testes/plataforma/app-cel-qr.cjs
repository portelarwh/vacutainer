// APP-CEL fase 3 (plataforma 1.8.103, Linha no celular 0.2; pedido do responsável em 27/11/2026): o cadastro vai da plataforma para o
// celular por QR, sem reenviar o app. Administração › Apps de celular › Enviar cadastro ao celular (QR) mostra as partes (mesmo formato
// "MT1:id:k/n:" do envio do celular para a plataforma) e baixa o mesmo pacote em .json; no celular, Linha.html › Atualizar cadastro lê
// pela câmera (jsQR embutido na geração) ou abre o arquivo e grava em mt.cfg e mm.cfg; os módulos abrem com o cadastro novo e os turnos
// do celular continuam. Demonstração, dados fictícios.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/Linha') ? app : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }));
    const base = 'http://127.0.0.1:' + srv.address().port, erros = [], externos = [];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }), page = await ctx.newPage();
    page.on('pageerror', e => erros.push('plataforma: ' + e.message));
    await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
    await page.goto(base + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof App !== 'undefined', null, { timeout: 60000 });
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#linhaGerar');
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#linhaGerar')]); app = fs.readFileSync(await dl.path(), 'utf8');
    assert.ok(/const VAC_JSQR=\/\*JSQR\*\/"/.test(app), 'o Linha.html leva o leitor de QR (jsQR)');
    console.log(`ok Linha.html gerado com o leitor de QR embutido (${Math.round(app.length / 1024)} KB)`);

    // 1. a plataforma mostra o cadastro em QR (partes que se alternam) e baixa o mesmo pacote em .json
    await f.click('#linhaQR'); await f.waitForSelector('#cqQr svg');
    assert.match(await f.locator('#cqSt').innerText(), /^Parte 1 de \d+$/);
    const [dj] = await Promise.all([page.waitForEvent('download'), f.click('#cqArq')]); assert.equal(dj.suggestedFilename(), 'cadastro-linha.json');
    const arq = JSON.parse(fs.readFileSync(await dj.path(), 'utf8')); assert.equal(arq.a, 'linha-cadastro'); assert.ok(arq.op && arq.man, 'Operação e Manutenção no pacote');
    await f.evaluate(() => Modal.close(true));
    // um cadastro "mudado" (tipo de parada novo) para provar que o celular recebe a mudança sem reenviar o app
    const env = await f.evaluate(async () => { const D2 = JSON.parse(JSON.stringify(Cad.D)); D2.paradas = (D2.paradas || []).concat([{ codigo: 'QR9', nome: 'Parada enviada por QR', ativo: true }]); D2.rev = (D2.rev || 0) + 1;
      const r = await MT_APP.enviarQR(D2); Modal.close(true); return r; });
    assert.ok(env.partes.length >= 1 && env.partes.every(p => /^MT1:[A-Za-z0-9]+:\d+\/\d+:/.test(p)), 'partes no formato MT1');
    console.log(`ok plataforma: cadastro em ${env.partes.length} QR (partes MT1) e o mesmo pacote em cadastro-linha.json`);

    // 2. no celular: a câmera liga; as imagens dos QR, lidas pelo mesmo jsQR, viram o cadastro e entram nos módulos
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR', permissions: ['camera'] });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await cel.clock.install({ time: new Date('2026-11-20T10:20:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/Linha.html'); await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    await m.click('#lancar'); await m.waitForSelector('[data-real]'); await m.fill('[data-real="0"]', '50'); await m.locator('[data-real="0"]').dispatchEvent('change');
    await m.goto(base + '/Linha.html'); await m.click('#atu');
    await m.waitForFunction(() => /Procurando o QR/.test((document.getElementById('st') || {}).textContent || ''), null, { timeout: 15000 });
    console.log('ok celular: Atualizar cadastro liga a câmera (câmera simulada) e procura o QR');
    const lido = await m.evaluate(async svgs => { const e = {}; for (const s of svgs.slice().reverse()) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode();
        const cv = document.createElement('canvas'); cv.width = 600; cv.height = 600; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 600, 600); g.drawImage(img, 0, 0, 600, 600);
        const q = window.jsQR(g.getImageData(0, 0, 600, 600).data, 600, 600); if (!q) return { erro: 'QR não lido' }; VAC_LINHA_QR.juntar(e, q.data); }
      if (!VAC_LINHA_QR.completo(e)) return { erro: 'incompleto' }; const o = await VAC_LINHA_QR.pacote(e); return { ok: VAC_LINHA_QR.aplicar(o), motivos: o.op.motivos }; }, env.svgs);
    assert.deepEqual(lido.ok, ['Operação', 'Manutenção'], JSON.stringify(lido)); assert.ok(lido.motivos.includes('Parada enviada por QR'));
    await m.click('#canc');
    await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    const op = await m.evaluate(() => ({ mot: CFG.motivos.includes('Parada enviada por QR'), cod: CFG.motivosCod['Parada enviada por QR'], cont: /Continuar/.test(document.getElementById('lancar').textContent) }));
    assert.deepEqual(op, { mot: true, cod: 'QR9', cont: true }, 'Operação com o tipo de parada novo e o turno do celular continua: ' + JSON.stringify(op));
    console.log(`ok QR lidos (fora de ordem) pelo jsQR do celular: Operação e Manutenção atualizadas; tipo de parada novo no app; o turno continua`);

    // 3. pelo arquivo: Abrir arquivo (.json) mostra "Cadastro atualizado"; o menu mostra a data e a revisão novas
    await m.click('#trocaMod'); await m.click('#atu'); await m.setInputFiles('#arq', { name: 'cadastro-linha.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(arq)) });
    await m.locator('h1', { hasText: 'Cadastro atualizado' }).waitFor({ timeout: 10000 });
    assert.match(await m.locator('header .sub').innerText(), /Operação e Manutenção · cadastro de \d\d\/\d\d\/\d{4}/);
    await m.click('#volta'); assert.match(await m.locator('.rod').innerText(), /cadastro de \d\d\/\d\d\/\d{4} \(rev \d+\)/);
    // arquivo que não é cadastro: avisa e não grava
    await m.click('#atu'); await m.setInputFiles('#arq', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"a":"outra-coisa"}') });
    await m.waitForFunction(() => /não é o cadastro nem o dia da linha/.test(document.getElementById('st').textContent), null, { timeout: 10000 });
    console.log('ok arquivo .json atualiza o cadastro; arquivo de outra coisa é recusado com aviso');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
