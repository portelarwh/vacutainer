// Migrador pontual (D02): o gel teórico como a main (91744b5) o calculava, para comparar com o da plataforma depois da migração.
// As linhas de MAIN são cópia literal do vacGel da main (comum/bases, Plataforma.html 91744b5, linhas 669-692 e 755-769);
// o teste migracao-tela confere a cópia com o Git quando o commit está disponível. Só leitura de um cadastro; sem fórmula nova.
import vm from 'node:vm';

export const MAIN = [
  "  const PROC_DEF = { from: '', g: 0.98, pT: 2.2406, pB: 0.7352, pP: 0.5252 };",
  "  const ord = L => (L || []).slice().sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : 0);",
  "  function procAt(date) {",
  "    const L = ord(vacCad.param('gel.processo')).filter(p => p.from <= date);",
  "    return L.length ? { ...PROC_DEF, ...L[L.length - 1] } : { ...PROC_DEF };",
  "  }",
  "  function vigList(cg) { if (!cg) return []; const L = cg.vig && cg.vig.length ? cg.vig : (cg.gTubo || cg.bomG || cg.bomKg ? [{ from: '2000-01-01', gTubo: cg.gTubo || null, bomG: cg.bomG || null, bomPct: cg.bomPct || 106, bomKg: cg.bomKg || null, bomBase: cg.bomBase || 10000, tol: cg.tol ?? 6 }] : []); return ord(L); }",
  "  function vigAt(cg, date) { const L = vigList(cg); if (!L.length) return {}; let v = L[0]; for (const x of L) if (x.from <= date) v = x; return v; }",
  "  function gelPorTubo(cg, date) {",
  "    const v = vigAt(cg, date);",
  "    return valorPeso(v.gTubo) ?? valorPeso(vacCad.gel.formato(date)?.tubos?.[cg?.fmt || '100']?.gelG);",
  "  }",
  "  function bomVals(v) { if (+v.bomKg) return { kg: +v.bomKg, base: +v.bomBase || 10000, tol: v.tol != null && v.tol !== '' ? +v.tol : 6 }; if (+v.bomG) { const p = +(v.bomPct || 106); return { kg: +v.bomG * p / 100 * 10, base: 10000, tol: p - 100 }; } return { kg: null, base: +v.bomBase || 10000, tol: v.tol != null && v.tol !== '' ? +v.tol : 6 }; }",
  "  function bom(cg, date) {",
  "    const b = bomVals(vigAt(cg, date));",
  "    const g = valorPeso(vacCad.gel.formato(date)?.tubos?.[cg?.fmt || '100']?.gelG);",
  "    const allowed = b.kg ? b.kg * 1000 / b.base : g == null ? null : g * (1 + b.tol / 100);",
  "    return { ...b, allowed, meta: allowed == null ? null : allowed / (1 + b.tol / 100), lim: 100 + b.tol, est: !b.kg };",
  "  }",
  "  function valorPeso(v) {",
  "    return v != null && v !== '' && Number.isFinite(+v) && +v >= 0 ? +v : null;",
  "  }",
  "  function teorico({ tubosPorCat, date, cg }) {",
  "    const P = procAt(date);",
  "    let gelBons = 0;",
  "    for (const [cat, t] of Object.entries(tubosPorCat || {})) {",
  "      const g = gelPorTubo(cg(cat), date);",
  "      if (g == null) return null;",
  "      gelBons += (+t || 0) * g / 1000;",
  "    }",
  "    const perda = ((+P.pT || 0) + (+P.pB || 0) + (+P.pP || 0)) / 100, teo = gelBons / Math.max(.01, 1 - perda);",
  "    return { gelBons, teo, sTeo: { T: teo * (+P.pT || 0) / 100, B: teo * (+P.pB || 0) / 100, P: teo * (+P.pP || 0) / 100 }, perdas: P };",
  "  }",
  "    const cat = cod => { const k = (c && c.catalogos || []).find(x => x && String(x.codigo) === String(cod)); if (!k) return null; const g = k.gel || {}; const f = g.fmt || (/75/.test(k.formato || '') ? '75' : /100/.test(k.formato || '') ? '100' : null); return { ...g, fmt: f || '100' }; };",
];

/* vacCad da main reduzido ao que essas linhas usam: param (main 640, sem vigencias) e gel.formato (main 637 e 647). */
const CAD_MAIN = `
const vacCad = () => c;
vacCad.param = caminho => { let v = c && c.parametros; for (const k of String(caminho).split('.')) { if (v == null || typeof v !== 'object') return null; v = v[k]; } return v ?? null; };
vacCad.vigente = (vigencias, data) => { const d = String(data || '').slice(0, 10); return (vigencias || []).filter(v => v.de <= d && (!v.ate || v.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0] || null; };
vacCad.gel = { formato: data => { const g = c && c.gel; return g && Array.isArray(g.formatos) ? vacCad.vigente(g.formatos, data) : null; } };`;

/* gelMain(cadastro) → {teorico(tubosPorCat, date), bom(cat, date), cat(cod)}: o que a main mostrava com esse cadastro. */
export function gelMain(cadastro) {
  const ctx = vm.createContext({c: JSON.parse(JSON.stringify(cadastro))});
  vm.runInContext(CAD_MAIN + '\n' + MAIN.join('\n') + '\nglobalThis.G = { teorico: (tubosPorCat, date) => teorico({ tubosPorCat, date, cg: cat }), bom: (k, date) => bom(cat(k), date), cat };', ctx, {filename: 'vacGel da main (91744b5)'});
  return ctx.G;
}
