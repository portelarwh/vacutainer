const abrir = require('./h2.cjs'), wt = process.argv[2];
(async () => {
  const o = {};
  await abrir(wt, 'perdas', 'Módulo Waste', async f => { await f.waitForFunction(() => ST.mode === 'pasta', null, { timeout: 30000 }); o.waste = await f.evaluate(async () => { await commit('teste auditoria', b => { b.zzx = 1; }); return Object.keys(B.audit[B.audit.length - 1]).join(','); }); });
  await abrir(wt, 'portal', 'Módulo Administração', async f => { await f.waitForFunction(() => Store.mode === 'pasta', null, { timeout: 30000 }); o.portal = await f.evaluate(async () => { await Store.commit('teste auditoria', b => { b.config = b.config || {}; b.config.zz = 1; }); const a = Store.B.audit || []; return a.length ? Object.keys(a[a.length - 1]).join(',') : 'sem audit'; }); });
  console.log(JSON.stringify(o));
})().catch(e => { console.error(e.message.slice(0, 400)); process.exit(1); });
