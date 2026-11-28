// Plataforma 1.8.110 · auditoria técnica de 28/11/2026 (Codex, revisada): apps do celular (Linha no celular 0.5, Meu Turno 0.8, Manutenção 0.3)
// e página publicada. Dados fictícios; celular emulado (Pixel 7), sem celular físico.
//  A19 Linha: pacote só da Operação não libera a Manutenção; cadastro mais antigo (rev 10) não substitui o mais novo (rev 20); metas de hoje
//      aparecem sem o plano do mês;
//  A20 Meu Turno: "Reabrir" abre o turno reaberto (não outro aberto hoje); o pacote do dia só oferece ordens no mesmo dia do turno; zero bons
//      e 10 descartados é 100% de scrap;
//  A21 Meu Turno: gravação local que falha não mostra "Turno fechado" e o turno continua aberto;
//  A22 página publicada: a ativação do service worker não apaga o cache de outro app da mesma origem; resposta 503 não substitui a cópia boa;
//      sem internet, um arquivo que não está guardado não recebe a página (HTML) no lugar.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert/strict'), { execFileSync } = require('child_process');
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cel-auditoria-'));
  execFileSync(process.execPath, [path.resolve(__dirname, '../../scripts/celular-site.mjs'), dir], { stdio: 'pipe' });
  const meuTurno = fs.readFileSync(path.resolve(__dirname, '../../CELULAR/index.html'));
  let falhar503 = false;
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]);
    if (u === '/meu-turno.html') { r.setHeader('Content-Type', 'text/html; charset=utf-8'); return r.end(meuTurno); }
    if (falhar503 && u === '/icone.svg') { r.statusCode = 503; return r.end('indisponível'); }
    const f = path.join(dir, u === '/' ? 'index.html' : u.slice(1)); if (!f.startsWith(dir) || !fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', tipos[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port + '/', erros = [];
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => r.abort());
    const m = await cel.newPage(); m.on('pageerror', e => erros.push(e.message)); m.on('dialog', d => d.accept());

    // A22 (1): cache de outro app na mesma origem, criado antes do service worker deste
    await m.goto(base + 'versao.json'); await m.evaluate(async () => { const c = await caches.open('outro-app-v1'); await c.put('/outro.txt', new Response('outro app')); });
    await m.goto(base); await m.locator('#semcad').waitFor();
    await m.evaluate(() => navigator.serviceWorker.ready); await m.reload(); await m.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });

    // A19
    const cadastro = (rev, comMan) => ({ a: 'linha-cadastro', v: 1, id: 'x' + rev, meta: { linha: 'Linha Fictícia', geradoEm: '2026-11-28T10:00:0' + (rev % 10) + '.000Z', cadRev: rev },
      op: { linha: 'Linha Fictícia', unidade: 'mil', junta: 45, turnos: [{ c: 'T1', n: 'Turno 1', i: '06:00', f: '14:00' }], cats: [{ c: 'C1', n: 'Produto rev ' + rev, meta: 40, gel: 0 }], maqs: ['Máquina fictícia'], motivos: ['Setup'], pessoas: [], scrapGel: ['Purga'], modeloWa: '', fonte: { cadRev: rev }, rev },
      ...(comMan ? { man: { linha: 'Linha Fictícia', maqs: [{ c: 'MF1', n: 'Máquina fictícia' }], modos: [], pessoas: [], fonte: { cadRev: rev }, rev } } : {}) });
    const r19 = await m.evaluate(async ([c20, c10]) => {
      const out = {}; VAC_LINHA_QR.aplicar(c20); location.hash = '';
      out.cats = JSON.parse(localStorage.getItem('mt.cfg')).cats[0].n;
      try { VAC_LINHA_QR.aplicar(c10); out.antigo = 'aplicou'; } catch (e) { out.antigo = e.message; }
      out.depois = JSON.parse(localStorage.getItem('mt.cfg')).cats[0].n; out.meta = JSON.parse(localStorage.getItem('linha.meta')).cadRev;
      return out;
    }, [cadastro(20, false), cadastro(10, false)]);
    assert.match(r19.antigo, /mais antigo que o deste celular/, 'cadastro rev 10 é recusado depois do rev 20: ' + r19.antigo);
    assert.equal(r19.depois, 'Produto rev 20'); assert.equal(r19.meta, 20, 'os metadados continuam os do rev 20');
    await m.reload(); await m.locator('[data-m="op"]').waitFor();
    assert.equal(await m.locator('[data-m="op"]').isDisabled(), false, 'Operação com o cadastro dela');
    assert.equal(await m.locator('[data-m="man"]').isDisabled(), true, 'pacote só da Operação não libera a Manutenção (A19)');
    console.log('ok A19 Linha: cadastro rev 10 não substitui o rev 20; pacote só da Operação deixa a Manutenção esperando o cadastro dela');
    await m.evaluate(() => localStorage.setItem('linha.dia', JSON.stringify({ a: 'linha-dia', dia: '2026-11-28', geradoEm: '2026-11-28T06:00:00Z', plano: null, metasHoje: [{ turno: 'T1', metaOp: 312000 }], ordens: [], acoes: [], resumo: null })));
    await m.reload(); await m.click('#dia'); const tDia = await m.locator('#vl').innerText();
    assert.match(tDia, /Plano não publicado/); assert.match(tDia, /Meta de hoje por turno/, 'metas de hoje sem o plano do mês (A19)');
    console.log('ok A19 Linha: metas de hoje aparecem mesmo sem o plano do mês');

    // A22 (2 e 3)
    const r22 = await m.evaluate(async () => {
      const k = await caches.keys(); const ic0 = await (await fetch('icone.svg')).text(); return { outro: k.includes('outro-app-v1'), linha: k.filter(x => /^linha-/.test(x)).length, ic0: /<svg/.test(ic0) };
    });
    assert.ok(r22.outro, 'o cache do outro app continua (A22)'); assert.equal(r22.linha, 1); assert.ok(r22.ic0);
    falhar503 = true;
    const r503 = await m.evaluate(async () => { const r = await fetch('icone.svg'); const t = await r.text(); const c = await (await caches.match('icone.svg')).text(); return { status: r.status, svg: /<svg/.test(t), guardado: /<svg/.test(c) }; });
    falhar503 = false;
    assert.ok(r503.guardado, 'o 503 não substituiu a cópia guardada'); assert.ok(r503.svg && r503.status === 200, 'com 503, responde a cópia guardada: ' + JSON.stringify(r503));
    await cel.setOffline(true);
    const off = await m.evaluate(async () => { try { const r = await fetch('nao-guardado.svg'); return { tipo: r.headers.get('content-type') || '', ok: r.ok }; } catch (e) { return { erro: true }; } });
    await cel.setOffline(false);
    assert.ok(off.erro || !/html/.test(off.tipo), 'sem internet, arquivo não guardado não recebe a página HTML: ' + JSON.stringify(off));
    console.log('ok A22 página: o cache de outro app fica; 503 não substitui a cópia guardada; sem internet, arquivo não guardado não vira HTML');

    // A20 e A21 · Meu Turno
    const t = await cel.newPage(); t.on('pageerror', e => erros.push('meu turno: ' + e.message)); t.on('dialog', d => d.accept());
    await t.clock.setFixedTime(new Date('2026-11-28T15:00:00-03:00'));
    await t.goto(base + 'meu-turno.html');
    await t.waitForFunction(() => typeof resumo === 'function' && typeof TURNOS !== 'undefined');
    const r20 = await t.evaluate(() => {
      const out = {}, hoje = turnoAgora(), outro = CFG.turnos.find(x => x.c !== hoje.t) || CFG.turnos[0];
      const T = novoTurno(outro.c, hoje.data); T.slots.forEach(s => { s.real = 0; }); T.scrapModo = 'total'; T.scrapTotal = 10; out.scrapPct = resumo(T).scrapPct;
      localStorage.setItem('linha.dia', JSON.stringify({ a: 'linha-dia', dia: '2026-11-27', ordens: [{ lote: '700001', ordem: '900001', catalogo: 'C1' }] }));
      out.ordensOutroDia = ordensDia(hoje.data).length; out.ordensMesmoDia = ordensDia('2026-11-27').length;
      const A = novoTurno(hoje.t, hoje.data); T.fechado = true; TURNOS = [A, T]; salvarT();
      ir('rel/' + T.id); return { ...out, T: T.id, A: A.id };
    });
    assert.equal(r20.scrapPct, 1, 'zero bons e 10 descartados é 100% (A20)');
    assert.equal(r20.ordensOutroDia, 0, 'pacote de outro dia não oferece ordens (A20)'); assert.equal(r20.ordensMesmoDia, 1);
    await t.locator('#reab').click(); await t.waitForFunction(() => location.hash === '#turno');
    assert.equal(await t.evaluate(() => atual().id), r20.T, 'Reabrir abre o turno reaberto, não o outro aberto hoje (A20)');
    console.log('ok A20 Meu Turno: Reabrir abre o turno certo; pacote do dia só no mesmo dia; zero bons e 10 descartados = 100% de scrap');
    const r21 = await t.evaluate(() => { const T = atual(), orig = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('cheia', 'QuotaExceededError'); };
      try { return { gravou: salvarT(), id: T.id }; } finally { Storage.prototype.setItem = orig; } });
    assert.equal(r21.gravou, false, 'falha da gravação local é informada a quem chamou (A21)');
    await t.evaluate(() => { const orig = Storage.prototype.setItem; window._origSet = orig; Storage.prototype.setItem = function (k, v) { if (k === 'mt.turnos') throw new DOMException('cheia', 'QuotaExceededError'); return orig.call(this, k, v); }; });
    await t.locator('#fechar').click(); await t.locator('#fok').waitFor({ state: 'attached' }); await t.evaluate(() => { const b = document.querySelector('#fok'); b.disabled = false; b.click(); });   /* a confirmação pede o operador; aqui só a gravação importa */
    await t.waitForTimeout(400);
    const r21b = await t.evaluate(() => { Storage.prototype.setItem = window._origSet; return { fechado: atual() && atual().fechado, toasts: [...document.querySelectorAll('.toast')].map(x => x.textContent) }; });
    assert.ok(!r21b.toasts.some(x => /Turno fechado/.test(x)), 'não diz "Turno fechado" sem gravar: ' + JSON.stringify(r21b.toasts));
    assert.ok(r21b.toasts.some(x => /Não gravou/.test(x)), 'avisa que não gravou'); assert.equal(r21b.fechado, false, 'o turno continua aberto');
    console.log('ok A21 Meu Turno: gravação local que falha não mostra "Turno fechado" e o turno continua aberto');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); fs.rmSync(dir, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
