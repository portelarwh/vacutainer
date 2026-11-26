const abrir = require('./h2.cjs'), wt = process.argv[2];
abrir(wt, 'paradas', 'Módulo Paradas', async f => {
  await f.waitForFunction(() => Store.dir && Store.baseFound !== undefined, null, { timeout: 30000 }); await new Promise(r => setTimeout(r, 2500));
  const r = await f.evaluate(async () => {
    const ler = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('paradas-base.json')).getFile()).text());
    const a = await ler(), out = { schemaAtual: a.schemaVersion, revAtual: a.rev };
    const { schemaVersion, ...semVersao } = a; const velho = { ...semVersao, rev: 3 };   // backup sem schemaVersion (base de versão anterior)
    Store.queue.push({ id: 'pend-ficticia', op: 'x', t: Date.now() }); out.filaAntes = Store.queue.length;
    const bk = { nome: 'paradas-base_2026-11-01.json', h: { getFile: async () => new File([JSON.stringify(velho)], 'b.json') } };
    try { await Store.restaurar(bk); } catch (e) { out.erro = String(e.message || e).slice(0, 160); }
    const b = await ler(); out.schemaDepois = b.schemaVersion; out.revDepois = b.rev; out.filaDepois = Store.queue.length; return out; });
  console.log(JSON.stringify(r));
}).catch(e => { console.error(e.message.slice(0, 600)); process.exit(1); });
