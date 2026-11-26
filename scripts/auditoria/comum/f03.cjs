const abrir = require('./h.cjs');
abrir(process.argv[2], async f => { console.log(JSON.stringify(await f.evaluate(() => { const d = db(), fams = d.families.filter(x => !x.deleted).map(x => x.id + ':' + x.code); const evs = Engine.eventsIn(d, d.productionDays).map(e => ({ cat: e.catalogId, code: e.code.code, min: e.minutes, fam: ((d.catalogs.find(c => c.id === e.catalogId) || {}).familyId) }));
  const out = { fams, evs };
  for (const fam of [''].concat(d.families.filter(x => !x.deleted).map(x => x.id))) { const R = {}, T = RpTab.st(R); T.mod = 'paradas'; T.from = '2026-11-01'; T.to = '2026-11-30'; T.fam = fam; const M = RpTab.model(R); const html = JSON.stringify(M).replace(/<[^>]+>/g, ' ');
    out['fam=' + (fam || 'todas')] = { linhas: (html.match(/FME|\bFM[A-Z]*\b/g) || []).length, trecho: html.slice(html.indexOf('Total') - 60, html.indexOf('Total') + 40) }; }
  return out; }), null, 1)); }).catch(e => console.error(e.message.slice(0, 600)));
