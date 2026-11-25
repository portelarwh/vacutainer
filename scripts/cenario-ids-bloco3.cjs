// Uso único (bloco 3, 25/11/2026): leva a base `oee` do cenário fictício (dados/cenario) para a Produção sem cópia dos cadastros.
// Tira as 7 tabelas de cadastro da base (a Produção as monta do cadastro, em memória) e troca os ids antigos da semente
// (cat_360060, sh_1, sh_1_v1, mac_3, dc_FME…) pelos que o ProdCad deriva do código e da vigência. Não muda nenhum número.
//   node scripts/cenario-ids-bloco3.cjs            → mostra o que muda
//   node scripts/cenario-ids-bloco3.cjs --gravar   → grava o bloco dados/cenario
const fs = require('node:fs'), cp = require('node:child_process'), path = require('node:path');
const { chromium } = require('playwright'); const { server } = require('./servidor-testes.cjs');
const RAIZ = path.resolve(__dirname, '..');
const cen = JSON.parse(cp.execFileSync('node', ['scripts/bloco.mjs', 'dados/cenario'], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 1 << 28 }));
(async () => {
  const srv = server(); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require('../testes/plataforma/chromium.cjs')()); const p = await (await b.newContext()).newPage();
  await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html'); await p.waitForFunction(() => typeof ProdCad !== 'undefined');
  const T = await p.evaluate(C => ProdCad.montar(C), cen.bases.cad); await b.close(); srv.close();
  const o = cen.bases.oee, slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const porCod = (lista, cod) => lista.filter(x => x.code === cod);
  const mapa = new Map(), catDe = new Map(), shDe = new Map();
  for (const m of (o.machines || [])) { const n = porCod(T.machines, m.code)[0]; if (n) mapa.set(m.id, n.id); }
  for (const f of (o.families || [])) { const n = porCod(T.families, f.code)[0]; if (n) mapa.set(f.id, n.id); }
  for (const l of (o.lines || [])) { const n = porCod(T.lines, l.code)[0]; if (n) mapa.set(l.id, n.id); }
  for (const d of (o.downtimeCodes || [])) mapa.set(d.id, 'dc_' + slug(d.code));
  for (const c of (o.catalogs || [])) catDe.set(c.id, c.code);
  for (const s of (o.shifts || [])) { const n = porCod(T.shifts, s.code)[0]; if (n) { mapa.set(s.id, n.id); shDe.set(s.id, n); for (const v of s.versions) mapa.set(v.id, '@versao:' + s.code); } }
  const dia = d => new Date(d + 'T12:00:00Z'), wd = d => dia(d).getUTCDay();
  const catEm = (cod, data) => { const L = porCod(T.catalogs, cod).filter(c => c.active !== false).sort((a, b) => a.validFrom < b.validFrom ? -1 : 1); return (L.filter(c => c.validFrom <= data && (!c.validTo || c.validTo >= data)).pop() || L[0] || {}).id; };
  const verEm = (cod, data) => { const s = porCod(T.shifts, cod)[0]; const v = s && s.versions.find(x => x.active !== false && x.validFrom <= data && (!x.validTo || x.validTo >= data) && x.weekdays.includes(wd(data))); return v && v.id; };
  let trocas = 0, orfaos = new Set();
  const troca = (v, ctx) => {
    if (Array.isArray(v)) return v.map(x => troca(x, ctx));
    if (v && typeof v === 'object') { const c = { ...ctx }; if (typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date)) c.data = v.date; if (typeof v.month === 'string') c.data = v.month + '-15';
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, troca(x, c)])); }
    if (typeof v !== 'string') return v;
    if (catDe.has(v)) { const n = catEm(catDe.get(v), ctx.data || cen.referencia); if (!n) orfaos.add(v); else { trocas++; return n; } return v; }
    if (mapa.has(v)) { const n = mapa.get(v); trocas++; if (n.startsWith('@versao:')) return verEm(n.slice(8), ctx.data || cen.referencia) || v; return n; }
    return v;
  };
  /* as metas de OEE moram na Administração: as duas do cenário (EDTA 70% e SST 77,5%) saem da base da Produção e entram no cadastro */
  if (!(cen.bases.cad.metasOee || []).length) cen.bases.cad.metasOee = [
    { codigo: 'OEE-EDTA', nome: 'Meta OEE · EDTA', ativo: true, linha: 'VAC', familia: 'EDTA', vigencias: [{ de: '2000-01-01', ate: null, pph: 90000, oeeMetaPct: 70 }] },
    { codigo: 'OEE-SST', nome: 'Meta OEE · SST', ativo: true, linha: 'VAC', familia: 'SST', vigencias: [{ de: '2000-01-01', ate: null, pph: 72000, oeeMetaPct: 77.5 }] }];
  const sem = {}; for (const [k, v] of Object.entries(o)) if (!['lines', 'machines', 'families', 'catalogs', 'shifts', 'targets', 'downtimeCodes', 'exports'].includes(k)) sem[k] = troca(v, {});
  sem.schemaVersion = 2;
  console.log(JSON.stringify({ trocas, orfaos: [...orfaos], tabelasRemovidas: 7, exportsDescartados: !!o.exports }));
  if (process.argv.includes('--gravar')) { cen.bases.oee = sem; fs.writeFileSync('/tmp/cenario-novo.json', JSON.stringify(cen)); cp.execFileSync('node', ['scripts/bloco.mjs', 'dados/cenario', '/tmp/cenario-novo.json'], { cwd: RAIZ, stdio: 'inherit' }); }
})().catch(e => { console.error(e); process.exit(1); });
