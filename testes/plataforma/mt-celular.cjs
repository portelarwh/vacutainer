// Plataforma 1.8.49 · MT-01 (pedido do responsável, 22/11/2026): app "Meu Turno" gerado pela Administração com o cadastro e o turno de
// volta na Produção por QR (webcam) ou arquivo. Demonstração: dados fictícios. O que este teste prova:
//  1. Administração › Apps de celular gera o MeuTurno.html com turnos, catálogos (meta por hora), equipamentos, tipos de parada e
//     pessoas (só ID, nome e turno), cada nome com o código do cadastro;
//  2. o app gerado abre num celular (Pixel 7) já configurado: operador escolhido da lista, parada com tipo e máquina do cadastro;
//  3. "Enviar para a plataforma" desenha o QR; a Produção lê a imagem do QR (o mesmo leitor da webcam) e junta as partes;
//  4. a prévia resolve os códigos; gravar preenche as horas (ausência não vira zero), a parada com tipo e máquina, o scrap, o
//     operador (com o ID) e a observação; importar de novo não duplica a parada;
//  5. a câmera liga no modal (câmera simulada do navegador) e o arquivo .mt.json abre a mesma prévia;
//  6. nenhum erro de JavaScript e nenhum pedido à internet.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
// o modelo do app dentro da plataforma (bloco celular/meu-turno) é o próprio CELULAR/index.html: editar um sem o outro reprova
assert.equal(require('../../scripts/html.cjs').load().text('celular/meu-turno'), fs.readFileSync(path.resolve(__dirname, '../../CELULAR/index.html'), 'utf8'), 'bloco celular/meu-turno igual a CELULAR/index.html (use: node scripts/bloco.mjs celular/meu-turno CELULAR/index.html)');
console.log('ok modelo do app na plataforma = CELULAR/index.html');
(async () => {
  let app = '';
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/MeuTurno') ? app : html); });
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

    // 1. Administração › Apps de celular
    let f = await frame('#/portal', 'Administração');
    await f.evaluate(() => { Cad.ui.sec = 'apps'; App.show('cad'); }); await f.waitForSelector('#mtGerar');
    const [dl] = await Promise.all([page.waitForEvent('download'), f.click('#mtGerar')]);
    app = fs.readFileSync(await dl.path(), 'utf8');
    const cfg = JSON.parse(app.match(/const CFG_EMB=\/\*CFG\*\/([\s\S]*?)\/\*CFG\*\//)[1]);
    assert.equal(dl.suggestedFilename(), 'MeuTurno.html');
    assert.ok(cfg.turnos.length >= 3 && cfg.cats.length >= 1 && cfg.maqs.length >= 5 && cfg.motivos.length >= 3 && cfg.pessoas.length >= 1, 'cadastro embutido');
    assert.ok(Object.values(cfg.maqsCod).every(Boolean) && Object.values(cfg.motivosCod).every(Boolean) && cfg.pessoas.every(p => p.id && p.n && !p.email), 'códigos ao lado dos nomes; pessoas só com ID, nome e turno');
    assert.ok(cfg.fonte && cfg.fonte.cadRev != null, 'revisão do cadastro no app');
    console.log(`ok Administração gera MeuTurno.html: ${cfg.turnos.length} turnos, ${cfg.cats.length} catálogos (meta ${cfg.cats.map(c => c.c + ' ' + c.meta).join(', ')} mil/h), ${cfg.maqs.length} equipamentos, ${cfg.motivos.length} tipos de parada, ${cfg.pessoas.length} pessoas · cadastro rev ${cfg.fonte.cadRev}`);

    // 2. o app no celular
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    await cel.clock.install({ time: new Date('2026-11-20T10:20:00-03:00') });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push('celular: ' + e.message)); m.on('dialog', d => d.accept());
    await m.goto(base + '/MeuTurno.html#inicio'); await m.click('#lancar'); await m.waitForSelector('[data-real]');
    const pes = cfg.pessoas[0], mot = cfg.motivos[0], maq = cfg.maqs[1];
    await m.selectOption('#op', pes.id); await m.selectOption('#cat', cfg.cats[0].c); await m.fill('#lote', '6275199');
    for (const [i, v] of [[0, '50'], [1, '52'], [3, '49']]) { await m.fill(`[data-real="${i}"]`, v); await m.locator(`[data-real="${i}"]`).dispatchEvent('change'); }
    await m.click('[data-addp="1"]'); await m.fill('#pmin', '12'); await m.click(`[data-mot="${mot}"]`); await m.selectOption('#pmaq', maq); await m.fill('#pobs', 'sensor (TESTE)'); await m.click('#pok');
    await m.fill('#scT', '420'); await m.locator('#scT').dispatchEvent('change'); await m.fill('#obs', 'Turno de teste do QR'); await m.locator('#obs').dispatchEvent('input');
    const T = await m.evaluate(() => { const T = atual(); T.fechado = true; T.fechadoEm = new Date().toISOString(); salvarT(); return { id: T.id, opId: T.operadorId, par: T.slots[1].par[0] }; });
    assert.equal(T.opId, pes.id, 'operador da lista guarda o ID'); assert.ok(T.par.motc === cfg.motivosCod[mot] && T.par.maqc === cfg.maqsCod[maq], 'parada com código do tipo e da máquina');
    console.log(`ok app gerado no celular: operador ${pes.n} (ID ${pes.id}); parada ${mot} [${T.par.motc}] na ${maq} [${T.par.maqc}]`);

    // 3. QR
    await m.goto(base + '/MeuTurno.html#env/' + T.id); await m.waitForFunction(() => document.querySelector('#qr svg'));
    const Q = await m.evaluate(() => ({ partes: ENV.partes, svgs: ENV.partes.map(qrSvg) }));
    const P = await m.evaluate(id => pacote(TURNOS.find(x => x.id === id)), T.id);
    await m.screenshot({ path: path.resolve(__dirname, '../saida/mt-celular-qr.png') });
    f = await frame('#/oee?tab=launch', 'Produção');
    const lidas = await f.evaluate(async svgs => { const out = []; for (const s of svgs) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode(); const cv = document.createElement('canvas'); cv.width = 900; cv.height = 900; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 900, 900); g.drawImage(img, 0, 0, 900, 900); out.push(CelImp.lerImagem(g.getImageData(0, 0, 900, 900))); } return out; }, Q.svgs);
    assert.deepEqual(lidas, Q.partes, 'o leitor da plataforma lê exatamente o que o celular desenhou');
    const P2 = await f.evaluate(async partes => { const e = {}; for (const t of partes.slice().reverse()) CelImp.juntar(e, t); return CelImp.completo(e) ? CelImp.pacoteDe(e) : null; }, lidas);
    assert.deepEqual(P2, P, 'partes juntas (em qualquer ordem) = pacote do celular');
    console.log(`ok QR: ${Q.partes.length} parte(s) desenhada(s) no celular e lida(s) pela plataforma; pacote igual ao do celular`);
    // turno grande: várias partes, lidas fora de ordem
    const Q3 = await m.evaluate(async id => { const partes = await qrPartes(pacote(TURNOS.find(x => x.id === id)), 150); return { partes, svgs: partes.map(qrSvg) }; }, T.id);
    const P3 = await f.evaluate(async svgs => { const e = {}; const ord = svgs.map((s, i) => i).reverse(); for (const i of ord) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgs[i]); await img.decode(); const cv = document.createElement('canvas'); cv.width = 700; cv.height = 700; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 700, 700); g.drawImage(img, 0, 0, 700, 700); CelImp.juntar(e, CelImp.lerImagem(g.getImageData(0, 0, 700, 700))); } return CelImp.completo(e) ? CelImp.pacoteDe(e) : null; }, Q3.svgs);
    assert.ok(Q3.partes.length > 1); assert.deepEqual(P3, P, 'várias partes, lidas fora de ordem, dão o mesmo pacote');
    console.log(`ok QR em ${Q3.partes.length} partes, lidas fora de ordem, dão o mesmo pacote`);

    // 4. prévia e gravação
    const r = await f.evaluate(P => { db().downtimeCodes.filter(c => c.code === 'FME').forEach(c => { c.allowsManualDuration = true; });   /* o cadastro do cenário não permite duração manual no FME; o celular lança só a duração */
      const X = CelImp.plano(P); const prev = { av: X.av, horas: X.horas.filter(h => h.real != null).length, par: X.paradas.map(p => [!!p.code, !!p.eq]), dia: !!X.day, antes: X.horas.map(h => h.antes) };
      const g = CelImp.aplicar(P); const d = db().productionDays.find(x => !x.deleted && x.date === P.d), ps = d.shifts.find(s => s.snap.code === P.t);
      const ivs = ps.intervals.filter(i => !i.deleted).sort((a, b) => a.start - b.start).map(i => i.good);
      const ev = d.events.filter(e => !e.deleted && e.note === 'sensor (TESTE)').map(e => ({ code: (db().downtimeCodes.find(c => c.id === e.codeId) || {}).code, eq: (db().machines.find(x => x.id === e.equipmentId) || {}).code, min: e.minutes }));
      const g2 = CelImp.aplicar(P); const ev2 = d.events.filter(e => !e.deleted && e.note === 'sensor (TESTE)').length;
      return { prev, g, ivs, ev, ev2, scrap: ps.scrap, resp: ps.responsible, respId: ps.responsibleId, note: ps.note, g2 }; }, P);
    assert.ok(!r.prev.av.length && r.prev.horas === 3 && r.prev.par.every(([a, b]) => a && b), 'prévia: códigos resolvidos ' + JSON.stringify(r.prev));
    assert.deepEqual(r.g.erros, [], 'gravação sem erro'); assert.deepEqual(r.ivs.slice(0, 4), [50000, 52000, r.prev.antes[2], 49000], 'horas do celular; a hora que veio vazia mantém o que estava lançado');
    assert.deepEqual(r.ev, [{ code: T.par.motc, eq: T.par.maqc, min: 12 }], 'parada com tipo e máquina do cadastro');
    assert.equal(r.scrap, 420); assert.equal(r.respId, pes.id, 'operador com o ID do cadastro'); assert.match(r.note, /Turno de teste do QR/); assert.match(r.note, /Lote 6275199/);
    assert.equal(r.ev2, 1, 'importar de novo não duplica a parada'); assert.ok(!r.g2.erros.length, 'reimportação sem erro');
    console.log(`ok gravado na Produção (${r.g.ok.length} itens): horas ${r.ivs.slice(0, 4).join(', ')}, parada ${r.ev[0].code}/${r.ev[0].eq} ${r.ev[0].min} min, scrap ${r.scrap}, operador ${r.resp} (ID ${r.respId}); reimportação não duplica`);

    // 5. modal: câmera simulada liga; arquivo abre a prévia
    await f.evaluate(() => CelImp.abrir()); await f.waitForFunction(() => /Procurando o QR/.test((document.querySelector('#ciSt') || {}).textContent || ''), null, { timeout: 15000 });
    console.log('ok câmera liga no modal de importação (câmera simulada)');
    await f.click('[data-ci="arq"]'); const arq = path.resolve(__dirname, '../saida/turno-teste.mt.json'); fs.writeFileSync(arq, JSON.stringify(P));
    await f.setInputFiles('#ciF', arq); await f.waitForFunction(() => /Hora a hora/.test((document.querySelector('#ciPrev') || {}).textContent || ''));
    assert.ok(await f.evaluate(() => /já lançada/.test(document.querySelector('#ciPrev').textContent)), 'prévia do arquivo mostra a parada já lançada');
    await page.waitForTimeout(400); await page.screenshot({ path: path.resolve(__dirname, '../saida/mt-celular-previa.png') });
    console.log('ok arquivo .mt.json abre a mesma prévia (parada já lançada marcada)');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem internet');
    console.log('ok sem erro de JavaScript e sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
