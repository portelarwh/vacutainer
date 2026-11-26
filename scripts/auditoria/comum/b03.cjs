const abrir = require('./h2.cjs'), wt = process.argv[2];
abrir(wt, 'perdas', 'Módulo Waste', async f => {
  await f.waitForFunction(() => ST.mode === 'pasta', null, { timeout: 30000 });
  const r = await f.evaluate(async () => {
    const ler = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('perdas-base.json')).getFile()).text());
    const a = await ler(), out = { revInicial: a.rev };
    const orig = readRemote; let feito = false;
    readRemote = async function (...x) { const r = await orig.apply(this, x); if (!feito) { feito = true; const ext = { ...r.data, rev: (r.data.rev || 0) + 1, zzExterno: 'ESCRITA-DA-OUTRA-ESTACAO' }; const w = await (await parent.fixtureDir.getFileHandle('perdas-base.json')).createWritable(); await w.write(JSON.stringify(ext)); await w.close(); } return r; };
    try { await commit('teste local', b => { b.zzLocal = 'ALTERACAO-LOCAL'; }); } catch (e) { out.erro = String(e.message || e).slice(0, 140); }
    readRemote = orig; const b = await ler(); out.revFinal = b.rev; out.externoPreservado = b.zzExterno === 'ESCRITA-DA-OUTRA-ESTACAO'; out.localGravado = b.zzLocal === 'ALTERACAO-LOCAL'; out.pendente = ST.pending; return out; });
  console.log(JSON.stringify(r));
}).catch(e => { console.error(e.message.slice(0, 600)); process.exit(1); });
