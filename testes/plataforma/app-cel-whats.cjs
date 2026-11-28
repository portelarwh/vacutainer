// APP-CEL fase 1 (plataforma 1.8.101, Meu Turno 0.5; pedido do responsável em 27/11/2026): mensagem do WhatsApp editável.
// Administração › Apps de celular › Mensagem do WhatsApp: modelo com marcadores entre chaves e prévia com valores fictícios; salvo em
// parametros.celular.mensagemWhats e embutido no MeuTurno.html gerado (CFG.modeloWa). No app, o botão WhatsApp usa o modelo; sem
// modelo, a mensagem padrão de antes. O rodapé do app mostra a data e a revisão do cadastro embutido. Demonstração, dados fictícios.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/MeuTurno') ? app : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, erros = [];
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }), page = await ctx.newPage();
    page.on('pageerror', e => erros.push('plataforma: ' + e.message));
    await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
    await page.goto(base + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof App !== 'undefined', null, { timeout: 60000 });
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#mtWa');
    const gerar = async () => { const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#mtGerar')]); return fs.readFileSync(await dl.path(), 'utf8'); };
    const cfgDe = h => JSON.parse(h.match(/const CFG_EMB=\/\*CFG\*\/([\s\S]*?)\/\*CFG\*\//)[1]);

    // 1. sem modelo: a prévia mostra a mensagem padrão e o app gerado não leva modelo
    assert.match(await f.locator('#mtWaPrev').innerText(), /\(mensagem padrão do app\)/);
    const app0 = await gerar(); assert.equal(cfgDe(app0).modeloWa, '', 'sem modelo salvo, o app leva modelo vazio');
    console.log('ok sem modelo: prévia da mensagem padrão; o app gerado não leva modelo');

    // 2. modelo com marcadores: a prévia preenche; marcador desconhecido fica como está; salva no cadastro
    const MODELO = 'Turno {turno} de {data} · {linha}\nOperador: {operador}\n{semaforo} {producao}/{plano} {unidade} ({aderencia})\nParadas: {paradas_min} min\n{xyz}';
    await f.fill('#mtWa', MODELO);
    const prev = await f.locator('#mtWaPrev').innerText();
    assert.match(prev, /Turno 2º Turno de 28\/11\/2026 · Linha Vacutainer/); assert.match(prev, /Operador: Pessoa Fictícia/); assert.match(prev, /432\/476 mil \(91%\)/); assert.match(prev, /\{xyz\}/);
    await f.click('[data-wa="obs"]'); assert.match(await f.inputValue('#mtWa'), /\{obs\}$/, 'o botão do marcador insere {obs} no cursor');
    await f.fill('#mtWa', MODELO); await f.click('#mtWaOk');
    await f.waitForFunction(m => (((Cad.D.parametros || {}).celular || {}).mensagemWhats) === m, MODELO, { timeout: 15000 });
    console.log('ok prévia preenchida com valores fictícios (marcador desconhecido fica como está); modelo salvo em parametros.celular.mensagemWhats');

    // 3. o app gerado leva o modelo; no celular, o WhatsApp sai pelo modelo e o rodapé mostra o cadastro
    app = await gerar(); const cfg = cfgDe(app); assert.equal(cfg.modeloWa, MODELO, 'modelo embutido no MeuTurno.html');
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.clock.install({ time: new Date('2026-11-20T10:20:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/MeuTurno.html#inicio');
    const rodape = await m.locator('main p.small.muted').last().innerText();
    assert.match(rodape, /versão \d+\.\d+/); assert.match(rodape, /cadastro de \d\d\/\d\d\/\d{4} \(rev \d+\)/, 'rodapé com a data e a revisão do cadastro: ' + rodape);
    await m.click('#lancar'); await m.waitForSelector('[data-real]');
    await m.selectOption('#op', cfg.pessoas[0].id); await m.selectOption('#cat', cfg.cats[0].c); await m.fill('#lote', '6275199');
    await m.fill('[data-real="0"]', '50'); await m.locator('[data-real="0"]').dispatchEvent('change');
    const txt = await m.evaluate(() => txtWA(atual()));
    assert.match(txt, new RegExp('^Turno .+ de \\d\\d/\\d\\d/\\d{4} · ' + cfg.linha.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(txt, new RegExp('Operador: ' + cfg.pessoas[0].n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); assert.match(txt, /\n[🟢🟡🔴⚪] 50\/[\d.,]+ mil \(/u); assert.match(txt, /Paradas: 0 min/); assert.match(txt, /\{xyz\}$/);
    console.log('ok no celular: rodapé "' + rodape.split(' · ').slice(-2).join(' · ') + '"; WhatsApp pelo modelo: ' + JSON.stringify(txt.split('\n')[0]));

    // 4. sem modelo no app (o gerado antes): a mensagem padrão de antes
    app = app0; const m0 = await cel.newPage(); m0.on('pageerror', e => erros.push('celular: ' + e.message));
    await m0.evaluate(() => localStorage.clear()).catch(() => {}); await m0.goto(base + '/MeuTurno.html#inicio');
    await m0.evaluate(() => localStorage.clear()); await m0.reload(); await m0.click('#lancar'); await m0.waitForSelector('[data-real]');
    await m0.selectOption('#op', cfg.pessoas[0].id); await m0.selectOption('#cat', cfg.cats[0].c);
    const t0 = await m0.evaluate(() => txtWA(atual()));
    assert.match(t0, /^📊 \*.+ \| .+\*\n📅 \d\d\/\d\d\/\d{4}\n\n\*IDENTIFICAÇÃO\*\nOperador: /); assert.match(t0, /🕒 \*PRODUÇÃO HORA A HORA\*\n```\nHORA/);   /* 0.9 · mensagem padrão em blocos */
    console.log('ok sem modelo: o app mantém a mensagem padrão de antes');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
