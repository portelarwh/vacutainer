const abrir = require('./h.cjs'), wt = process.argv[2];
const tabs = ['reports', 'relatorios', 'rel'];
(async () => {
  for (const t of tabs) {
    const ok = await abrir(wt, async f => {
      const has = await f.evaluate(() => typeof rpState === 'function' && typeof RpTab !== 'undefined').catch(() => false); if (!has) return null;
      const r = await f.evaluate(async () => {
        const XL = await Libs.loadXLSX(); let blob = null; download = (n, b) => { blob = b; };
        const d = db(); const x0 = d.productionDays.find(y => !y.deleted); x0.shifts[0].intervals[0].good = 500; x0._rev++; const cat = d.catalogs.find(c => c.id === x0.shifts[0].intervals[0].catalogId) || d.catalogs.find(c => !c.deleted); const codeAntes = cat.code; cat.code = '00123'; const R = rpState(); R.type = 'tables'; const T = RpTab.st(R); T.from = '2026-11-19'; T.to = '2026-11-19';
        const cap = async (mod, mut) => { T.mod = mod; blob = null; if (mut) mut(); const M = rpModel(R); const doc = document.createElement('div'); doc.id = 'rpDoc'; doc.innerHTML = rpDocHtml(M, '', ''); const c = { M, sum: '', note: '', doc }; await rpXlsx(c);
          const wb = XL.read(await blob.arrayBuffer()); const out = {}; for (const sn of wb.SheetNames) { if (sn === 'Resumo') continue; const ws = wb.Sheets[sn]; out[sn] = Object.entries(ws).filter(([k]) => /^[D-F]2$/.test(k)).map(([k, v]) => k + '=' + JSON.stringify(v.v) + (v.z ? ' z=' + v.z : '') + ' t=' + v.t + ' w=' + v.w)  .slice(0, 8); } return { html: M.blocks ? M.blocks.length : null, out }; };
        const res = {}; res.hora = await cap('hora'); res.codigoCadastro = '00123';
        res.horaPrev = (() => { T.mod = 'hora'; const M = rpModel(R); const t = (M.blocks[0].html || JSON.stringify(M.blocks[0])).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); return t.slice(0, 500); })();
        return res; });
      return r; }, { rota: 'oee?tab=' + t }).catch(e => ({ erro: e.message.slice(0, 300) }));
    if (ok) { console.log(t, JSON.stringify(ok, null, 1).slice(0, 3500)); break; }
  }
})();
