const abrir = require('./h2.cjs'), wt = process.argv[2];
abrir(wt, 'portal', 'Módulo Administração', async (f, p) => { await f.waitForFunction(() => Store.mode === 'pasta', null, { timeout: 30000 });
  const r = await f.evaluate(async () => {
    const ler = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('portal-base.json')).getFile()).text());
    const a = await ler(), out = { modo: Store.mode, revInicial: a.rev, schemaInicial: a.schemaVersion };
    Store.pending = true; Store.pendFrom = a.rev; await Store.idb.set('pending', { p: true, from: a.rev });
    const novo = { ...a, schemaVersion: 99, campoDaVersaoNova: 'NAO-PODE-SER-APAGADO' }; const w = await (await parent.fixtureDir.getFileHandle('portal-base.json')).createWritable(); await w.write(JSON.stringify(novo)); await w.close();
    try { await Store.sync(true); } catch (e) { out.erro = String(e.message || e).slice(0, 140); }
    const b = await ler(); out.schemaFinal = b.schemaVersion; out.campoNovoPreservado = b.campoDaVersaoNova === 'NAO-PODE-SER-APAGADO'; out.pendenteDepois = Store.pending; return out; });
  console.log(JSON.stringify(r));
}).catch(e => { console.error(e.message.slice(0, 600)); process.exit(1); });
