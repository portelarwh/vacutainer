// E1 · Produção › Ordens: gravação e backups confiáveis (plano único de 08/11/2026; F01–F04 / B1, B6).
// Pasta simulada no sistema de arquivos do navegador (OPFS), páginas por HTTP local, falhas injetadas no backend.
// node testes/tordens.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };

// funções que rodam na página
const PREP = async () => {
  const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
  const w = async (dir, n, t) => { const fh = await dir.getFileHandle(n, { create: true }); const s = await fh.createWritable(); await s.write(t); await s.close(); };
  const db = Model.emptyBase('teste'); db.databaseVersion = 5; await w(d, 'oee-vacutainer-base.json', JSON.stringify(db));
  await w(d, 'ordens-base.json', JSON.stringify({ schema: 'vac-ordens', schemaVersion: 1, rev: 3, revId: 'rA', revBy: 'Estação A', competencias: { '2026-09': { mb51: { arquivo: 'set.txt' }, resultado: null } }, auditoria: [], exports: {} }));
  const bk = await d.getDirectoryHandle('00. Backups', { create: true }); await w(bk, 'oee-vacutainer-base_2026-01-01.json', '{"legado":true}');
  const mod = await bk.getDirectoryHandle('OEE', { create: true }); await w(mod, 'oee-vacutainer-base_2026-02-01.json', '{"modulo":true}');
  await IDB.set('ordens', null); await IDB.set('ordens.pend', null); try { localStorage.removeItem('ordens.bk'); } catch (e) { }
  await Store.connect(FolderBackend(d), { ask: false });
  window.__be = Store.S.backend; window.__orig = { ws: __be.writeSibling, bs: __be.backupSub };
  // falha de leitura no próprio acesso ao arquivo (vale para o código antigo e o novo): __falhaLer = n → as próximas leituras de ordens-base.json falham a partir da n-ésima
  if (!window.__gfh) { window.__gfh = FileSystemDirectoryHandle.prototype.getFileHandle; window.__falhaLer = 0; window.__nLer = 0;
    FileSystemDirectoryHandle.prototype.getFileHandle = function (n, o) { if (window.__falhaLer && n === 'ordens-base.json' && !(o && o.create) && ++window.__nLer >= window.__falhaLer) { const e = new Error('falha simulada (NotReadableError)'); e.name = 'NotReadableError'; return Promise.reject(e); } return window.__gfh.call(this, n, o); }; }
  window.__semFalha = async f => { const a = window.__falhaLer; window.__falhaLer = 0; try { return await f(); } finally { window.__falhaLer = a; window.__nLer = 0; } };
  window.__reenv = async () => { if (Ord.reenviar) return Ord.reenviar(); };
  window.__ler = () => __semFalha(async () => { const b = await d.getDirectoryHandle('00. Bases'); return (await (await b.getFileHandle('ordens-base.json')).getFile()).text(); });
  window.__bks = async () => { const L = []; try { const o = await (await d.getDirectoryHandle('00. Backups')).getDirectoryHandle('Ordens'); for await (const [n] of o.entries()) L.push(n); } catch (e) { } return L.sort(); };
  window.__erro = n => { const e = new Error('falha simulada (' + n + ')'); e.name = n; return e; };
  window.__muda = c => { Ord.B.competencias[c] = { mb51: { arquivo: c + '.txt' }, resultado: null }; Ord.aud('teste', c); };
  Ord.carregado = false; await Ord.carregar(true);
  return { mode: Store.S.mode, fonte: Ord.fonte, comps: Object.keys(Ord.B.competencias) };
};

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const nova = async () => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push('página: ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(U + 'OEE-Vacutainer.html'); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.overlay').forEach(o => o.remove())); return p; };
  const p = await nova();

  // 1. leitura normal
  let r = await p.evaluate(PREP);
  ok(r.mode === 'pasta' && r.fonte === 'pasta' && r.comps.join() === '2026-09', `carregar: lê ordens-base.json da pasta (${r.fonte}; ${r.comps.join()})`);

  // 2. F01 · erro de leitura no carregar: mostra a cópia identificada; gravar não escreve por cima e deixa pendente
  r = await p.evaluate(async () => {
    window.__falhaLer = 1; window.__nLer = 0;
    Ord.carregado = false; await Ord.carregar(true); const errC = Ord.err, fonte = Ord.fonte;
    const antes = await __ler(); __muda('2026-10'); let msg = '';
    try { await Ord.gravar('2026-10', 'importação'); } catch (e) { msg = e.message; }
    const depois = await __ler(); const pend = await IDB.get('ordens.pend'); window.__falhaLer = 0;
    return { errC, fonte, msg, igual: antes === depois, pend: pend && pend.comps };
  });
  ok(/Não consegui ler ordens-base\.json/.test(r.errC) && /Nada será gravado/.test(r.errC), `carregar com erro de leitura: avisa e identifica a cópia (${r.errC.slice(0, 70)}…)`);
  ok(r.igual && /nada foi gravado/.test(r.msg), 'gravar com erro de leitura: zero gravação na pasta');
  ok(r.pend && r.pend.join() === '2026-10', `alteração fica pendente neste navegador (${r.pend})`);

  // 3. pendência sobrevive a recarregar a página e aparece na tela
  const p2 = await nova();
  r = await p2.evaluate(async () => {
    const d = await navigator.storage.getDirectory(); await Store.connect(FolderBackend(d), { ask: false });
    Ord.carregado = false; await Ord.carregar(true); go('ordens'); await new Promise(r => setTimeout(r, 400));
    return { pend: Ord.pend && Ord.pend.comps, comps: Object.keys(Ord.B.competencias).sort(), aviso: !!document.querySelector('#oPend #oPendGo') };
  });
  ok(r.pend && r.pend.join() === '2026-10' && r.comps.join() === '2026-09,2026-10' && r.aviso, `outra aba: pendência reaplicada sobre a pasta e aviso "Gravar de novo" (${r.comps.join()})`);
  // "Gravar de novo" com a pasta respondendo: mescla e confirma
  r = await p2.evaluate(async () => { if (Ord.reenviar) await Ord.reenviar(); const bd = await (await navigator.storage.getDirectory()).getDirectoryHandle('00. Bases'); const t = JSON.parse(await (await (await bd.getFileHandle('ordens-base.json')).getFile()).text()); return { comps: Object.keys(t.competencias).sort(), pend: Ord.pend, idb: await IDB.get('ordens.pend'), rev: t.rev }; });
  ok(r.comps.join() === '2026-09,2026-10' && !r.pend && !r.idb, `Gravar de novo: competência da outra estação preservada e pendência limpa (rev ${r.rev}; ${r.comps.join()})`);
  await p2.close();

  // 4. F02 · releitura divergente (outra estação gravou logo depois): não dá como gravado e mantém pendente
  r = await p.evaluate(async () => {
    window.__falhaLer = 0; Ord.carregado = false; await Ord.carregar(true);
    __be.writeSibling = async (n, t) => { await __orig.ws.call(__be, n, t); const o = JSON.parse(t); o.revId = 'rOutra'; o.revBy = 'Estação B'; o.competencias['2026-08'] = { mb51: { arquivo: 'ago.txt' }, resultado: null }; await __orig.ws.call(__be, n, JSON.stringify(o)); };
    __muda('2026-11'); let msg = ''; try { await Ord.gravar('2026-11', 'importação'); } catch (e) { msg = e.message; }
    const pend = Ord.pend && Ord.pend.comps; __be.writeSibling = __orig.ws;
    await __reenv(); const t = JSON.parse(await __ler());
    return { msg, pend, comps: Object.keys(t.competencias).sort(), fim: Ord.pend };
  });
  ok(/não foi confirmada/.test(r.msg) && r.pend && r.pend.includes('2026-11'), `releitura com outra gravação: "não foi confirmada" e pendente (${r.msg.slice(0, 60)}…)`);
  ok(r.comps.join() === '2026-08,2026-09,2026-10,2026-11' && !r.fim, `reenvio mescla sobre a gravação da outra estação, sem perder nada (${r.comps.join()})`);

  // 5. F02 · releitura que falha também não dá sucesso
  r = await p.evaluate(async () => {
    window.__falhaLer = 2; window.__nLer = 0;   // a 1ª leitura (antes de gravar) funciona; a releitura falha
    __muda('2026-12'); let msg = ''; try { await Ord.gravar('2026-12', 'importação'); } catch (e) { msg = e.message; }
    window.__falhaLer = 0; const pend = Ord.pend && Ord.pend.comps; await __reenv(); return { msg, pend, fim: Ord.pend };
  });
  ok(/não foi confirmada: não consegui reler/.test(r.msg) && r.pend && r.pend.includes('2026-12') && !r.fim, 'releitura que falha: sem "gravado", pendente até o reenvio');

  // 6. F03 · backup obrigatório antes de substituir; o diário não bloqueia
  r = await p.evaluate(async () => {
    const antes = await __ler(); __be.backupSub = async () => { throw __erro('NoModificationAllowedError'); };
    Ord.B.competencias['2026-09'].mb51.arquivo = 'set-v2.txt'; Ord.aud('substituição', '2026-09'); let msg = '';
    try { await Ord.gravar('2026-09', 'substituição'); } catch (e) { msg = e.message; }
    const igual = antes === await __ler(); const pend = Ord.pend && Ord.pend.comps;
    __be.backupSub = __orig.bs; await __reenv(); const t = JSON.parse(await __ler());
    // rotina diária com backup falhando: grava normalmente
    __be.backupSub = async () => { throw __erro('NoModificationAllowedError'); }; try { localStorage.removeItem('ordens.bk'); } catch (e) { }
    __muda('2027-01'); let msg2 = ''; try { await Ord.gravar('2027-01', 'coois'); } catch (e) { msg2 = e.message; } __be.backupSub = __orig.bs;
    const t2 = JSON.parse(await __ler());
    return { msg, igual, pend, arq: t.competencias['2026-09'].mb51.arquivo, msg2, tem: !!t2.competencias['2027-01'] };
  });
  ok(/antes de substituir/.test(r.msg) && r.igual && r.pend, 'substituição com backup falhando: nada gravado e pendente');
  ok(r.arq === 'set-v2.txt', 'com o backup de volta: substituição gravada');
  ok(!r.msg2 && r.tem, 'backup diário falhando não bloqueia a gravação de rotina');

  // 7. F03 · nomes únicos: duas substituições seguidas geram dois backups
  r = await p.evaluate(async () => {
    const n0 = (await __bks()).filter(n => /antes-substituir/.test(n)).length;
    for (const v of ['v3', 'v4']) { Ord.B.competencias['2026-09'].mb51.arquivo = v; await Ord.gravar('2026-09', 'substituição'); }
    const L = (await __bks()).filter(n => /antes-substituir/.test(n)); return { novos: L.length - n0, L };
  });
  ok(r.novos === 2 && new Set(r.L).size === r.L.length, `duas substituições no mesmo minuto: ${r.novos} backups distintos`);

  // 8. F04 · readBackup lê o local novo e o antigo
  r = await p.evaluate(async () => {
    const L = await Store.S.backend.listBackups(); const leg = L.find(x => x.legacy), mod = L.find(x => !x.legacy && /2026-02-01/.test(x.name));
    return { leg: leg && await Store.S.backend.readBackup(leg.name, true), mod: mod && await Store.S.backend.readBackup(mod.name, false) };
  });
  ok(r.leg === '{"legado":true}' && r.mod === '{"modulo":true}', 'backups: lê o do local antigo (00. Backups/) e o do módulo (00. Backups/OEE)');

  // 9. arquivo realmente ausente: a gravação cria (decisão explícita, com aviso)
  r = await p.evaluate(async () => {
    const d = await navigator.storage.getDirectory(); const bd = await d.getDirectoryHandle('00. Bases'); await bd.removeEntry('ordens-base.json');
    Ord.carregado = false; await Ord.carregar(true); const fonte = Ord.fonte; __muda('2027-02'); await Ord.gravar('2027-02', 'importação');
    const t = JSON.parse(await __ler()); return { fonte, tem: !!t.competencias['2027-02'] };
  });
  ok(r.tem && (r.fonte === 'ausente' || r.fonte === 'cache'), `arquivo inexistente: carregar sem erro (${r.fonte}) e a gravação cria o arquivo`);

  await b.close(); srv.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
