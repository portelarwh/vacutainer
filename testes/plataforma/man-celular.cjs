// Plataforma 1.8.50 · MAN-01 (pedido do responsável, 22/11/2026): app "Manutenção" (corretiva) gerado pela Administração e o atendimento
// de volta como OS em Equipamentos › Ordens de serviço, por QR (webcam) ou arquivo. Demonstração: dados fictícios. O que este teste prova:
//  1. o modelo do app na plataforma (bloco celular/manutencao) é o próprio CELULAR/manutencao.html;
//  2. Administração › Apps de celular gera o Manutencao.html com equipamentos, modos de falha e pessoas (só ID, nome e turno);
//  3. no celular (Pixel 7): técnico da lista, equipamento, modo de falha (ou "outro"), parou a linha, início/fim, sintoma, causa, ação,
//     peças e situação; "Enviar para a plataforma" desenha o QR;
//  4. Equipamentos lê o QR (leitor comum vacQR), cria a OS corretiva concluída com o técnico (ID), detalhe e apontamento; importar de
//     novo não duplica; a câmera liga e o arquivo abre a mesma prévia;
//  5. nenhum erro de JavaScript e nenhum pedido à internet.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
assert.equal(require('../../scripts/html.cjs').load().text('celular/manutencao'), fs.readFileSync(path.resolve(__dirname, '../../CELULAR/manutencao.html'), 'utf8'), 'bloco celular/manutencao igual a CELULAR/manutencao.html (use: node scripts/bloco.mjs celular/manutencao CELULAR/manutencao.html)');
console.log('ok modelo do app na plataforma = CELULAR/manutencao.html');
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/Manutencao') ? app : html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }));
    const base = 'http://127.0.0.1:' + srv.address().port;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, permissions: ['camera'] }), externos = [], erros = [];
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    const page = await ctx.newPage(); page.on('pageerror', e => erros.push('plataforma: ' + e.message));
    await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
    const frame = async (rota, nome) => { await page.goto(base + '/?demo=1' + rota); const f = await (await page.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame(); await f.waitForFunction(() => document.readyState === 'complete'); await page.waitForTimeout(1500); return f; };

    let f = await frame('#/portal', 'Administração');
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#mmGerar');
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#mmGerar')]);
    app = fs.readFileSync(await dl.path(), 'utf8'); const cfg = JSON.parse(app.match(/const CFG_EMB=\/\*CFG\*\/([\s\S]*?)\/\*CFG\*\//)[1]);
    assert.equal(dl.suggestedFilename(), 'Manutencao.html'); assert.ok(cfg.maqs.length >= 5 && cfg.pessoas.length >= 1 && cfg.pessoas.every(p => p.id && p.n && !p.email), 'cadastro embutido');
    console.log(`ok Administração gera Manutencao.html: ${cfg.maqs.length} equipamentos, ${cfg.modos.length} modos de falha, ${cfg.pessoas.length} pessoas · cadastro rev ${cfg.fonte.cadRev}`);

    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await cel.clock.install({ time: new Date('2026-11-20T09:40:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/Manutencao.html'); await m.click('#novo'); await m.waitForSelector('#eq');
    const tec = cfg.pessoas[0], eq = cfg.maqs[2];
    await m.selectOption('#tec', tec.id); await m.selectOption('#eq', eq.c);
    if (cfg.modos.length) await m.selectOption('#mf', cfg.modos[0].c); else { await m.selectOption('#mf', '_'); await m.fill('#mfTxt', 'Folga (TESTE)'); await m.locator('#mfTxt').dispatchEvent('input'); }
    await m.check('#parou'); await m.fill('#ini', '2026-11-20T09:05'); await m.locator('#ini').dispatchEvent('change'); await m.fill('#fim', '2026-11-20T09:37'); await m.locator('#fim').dispatchEvent('change');
    for (const [k, v] of [['sint', 'Ruído no cabeçote (TESTE)'], ['causa', 'Rolamento gasto'], ['acao', 'Troca do rolamento e ajuste'], ['pecas', 'Rolamento 6204\nGraxa']]) { await m.fill('#' + k, v); await m.locator('#' + k).dispatchEvent('input'); }
    await m.click('#env'); await m.waitForFunction(() => document.querySelector('#qr svg'));
    const Q = await m.evaluate(() => ({ partes: ENV.partes, svgs: ENV.partes.map(qrSvg), P: pacote(AT[0]) }));
    assert.equal(Q.P.dur, 32); assert.equal(Q.P.tecId, tec.id); assert.deepEqual(Q.P.pecas, ['Rolamento 6204', 'Graxa']);
    await m.screenshot({ path: path.resolve(__dirname, '../saida/man-celular-app.png') });
    console.log(`ok app no celular: técnico ${tec.n} (ID ${tec.id}), ${eq.n}, 32 min, parou a linha, 2 peças; QR em ${Q.partes.length} parte(s)`);

    f = await frame('#/equip?aba=os', 'Equipamentos');
    const P2 = await f.evaluate(async svgs => { const e = {}; for (const s of svgs.slice().reverse()) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode(); const cv = document.createElement('canvas'); cv.width = 800; cv.height = 800; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 800, 800); g.drawImage(img, 0, 0, 800, 800); vacQR.juntar(e, vacQR.lerImagem(g.getImageData(0, 0, 800, 800))); } return vacQR.completo(e) ? vacQR.pacoteDe(e) : null; }, Q.svgs);
    assert.deepEqual(P2, Q.P, 'Equipamentos lê o QR do celular');
    const r = await f.evaluate(P => { const n0 = Store.data.os.length, id = EqImp.aplicar(P), o = Store.data.os.find(x => x.id === id), id2 = EqImp.aplicar(P);
      return { novas: Store.data.os.length - n0, id, id2, o: { eq: o.equipamento, tipo: o.tipo, st: o.status, resp: o.responsavel, respId: o.responsavelId, prio: o.prioridade, ref: o.origem.ref, dados: o.origem.dados, ap: o.apontamentos.map(a => a.txt), desc: o.descricao } }; }, P2);
    assert.equal(r.novas, 1, 'uma OS'); assert.equal(r.id2, r.id, 'importar de novo devolve a mesma OS'); assert.equal(r.o.eq, eq.c); assert.equal(r.o.tipo, 'corretiva'); assert.equal(r.o.st, 'concluída'); assert.equal(r.o.respId, tec.id); assert.equal(r.o.prio, 'alta');
    assert.match(r.o.desc, /Causa: Rolamento gasto/); assert.match(r.o.ap[0], /Troca do rolamento/); assert.equal(r.o.dados.duracaoMin, 32); assert.equal(r.o.dados.parouLinha, true);
    console.log(`ok OS ${r.id} criada: ${r.o.eq} corretiva ${r.o.st}, prioridade ${r.o.prio}, responsável ${r.o.resp} (ID ${r.o.respId}); reimportação não duplica`);

    await f.evaluate(() => EqImp.abrir()); await f.waitForFunction(() => /Procurando o QR/.test((document.querySelector('#miSt') || {}).textContent || ''), null, { timeout: 15000 });
    await page.screenshot({ path: path.resolve(__dirname, '../saida/man-celular-modal.png') }); await f.evaluate(() => document.querySelector('[data-mi="arq"]').click()); const arq = path.resolve(__dirname, '../saida/atendimento-teste.mm.json'); fs.writeFileSync(arq, JSON.stringify(Q.P));
    await f.setInputFiles('#miF', arq); await f.waitForFunction(() => /Já importado/.test((document.querySelector('#miPrev') || {}).textContent || ''));
    assert.ok(await f.evaluate(() => document.querySelector('.mod [data-ok]').disabled), 'atendimento já importado: Criar OS desabilitado');
    await page.waitForTimeout(300); await page.screenshot({ path: path.resolve(__dirname, '../saida/man-celular-previa.png') });
    console.log('ok câmera liga; arquivo .mm.json abre a prévia e avisa que já foi importado');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem internet');
    console.log('ok sem erro de JavaScript e sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
