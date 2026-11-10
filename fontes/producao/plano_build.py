# Produção 2.4.42 · homologação de 10/11/2026 (rodada 2): Plano do mês e Ordens.
# - Plano do mês: a produção fora de turno (somada ao turno que a recebe no OEE reportado) entra no realizado do mês, por catálogo, e
#   nas ordens (antes o plano somava só os intervalos dos turnos: 1.058 no dia × 1.039 no plano, 19 mil fora de turno).
# - Tabelas da aba Ordens e "Ordens do mês" ordenam pelo título da coluna (tabelas sem cabeçalho separado e a de ordens com campos).
import os
AQUI = os.path.dirname(os.path.abspath(__file__))
LINHA_CHUNK = '      for (const sr of res.shifts) if (!sr.off && sr.ps.summary && !res.flat.some(f => f.ps === sr.ps)) for (const sg of sr.ps.summary.segments || []) if (sg.good > 0) chunks.push({ cat: sg.catalogId || null, fam: sg.familyId || famOf(sg.catalogId), good: sg.good, s: at(d.date, toMin(sr.ps.snap.start)), e: at(d.date, toMin(sr.ps.snap.end)), date: d.date, shiftLevel: true });'
FT_PLANO = """      { const ft = res.foraTurno; if (ft) for (const it of (ft.recebe || [])) { if ((ft.semAlvo || []).includes(it)) continue; for (const [code, q] of Object.entries(it.porCat || {})) { if (!q) continue; const c = (db.catalogs || []).find(x => !x.deleted && String(x.code) === String(code)); g += q; add(realCat, c ? c.id : '_none', q); add(realFam, (c || {}).familyId || '_none', q); } } }   /* 2.4.42: produção fora de turno no realizado do plano */
"""
FT_CHUNKS = """
      { const ft = res.foraTurno; if (ft) for (const it of (ft.recebe || [])) { if ((ft.semAlvo || []).includes(it)) continue; for (const [code, q] of Object.entries(it.porCat || {})) { const c = (db.catalogs || []).find(x => !x.deleted && String(x.code) === String(code)); if (q > 0 && c) chunks.push({ cat: c.id, fam: famOf(c.id), good: q, s: at(it.data, it.t0), e: at(it.data, it.t1 + 1), date: d.date }); } } }   /* 2.4.42: fora de turno nas ordens */"""


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'plano_ui.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    R("      perDay[d.date] = (perDay[d.date] || 0) + g; real += g;", FT_PLANO + "      perDay[d.date] = (perDay[d.date] || 0) + g; real += g;")
    R(LINHA_CHUNK, LINHA_CHUNK + FT_CHUNKS)
    # ordenação: tabela sem <thead> (cabeçalho na 1ª linha) e tabela com campos marcada com data-sortok
    R("      const body = tb.tBodies[0]; if (!body || !tb.tHead) return;\n      if (body.querySelector('input,select,textarea,[draggable=\"true\"]')) return; // tabelas de formulário não são ordenadas",
      "      if (!tb.tHead && tb.tBodies[0] && tb.tBodies[0].rows[0] && [...tb.tBodies[0].rows[0].cells].every(c => c.tagName === 'TH')) tb.createTHead().appendChild(tb.tBodies[0].rows[0]);   /* 2.4.42 */\n      const body = tb.tBodies[0]; if (!body || !tb.tHead) return;\n      if (!tb.dataset.sortok && body.querySelector('input,select,textarea,[draggable=\"true\"]')) return; // tabelas de formulário não são ordenadas (a não ser as marcadas data-sortok)")
    R('<table data-nosort="1" class="ord-t">', '<table data-sortok="1" class="ord-t">')
    # Relatórios › Tabelas (fontes/producao/rp_tabelas.js)
    R("async function boot() {\n", open(os.path.join(AQUI, 'rp_tabelas.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    R("    const M = rpModel(R); App.rep.model = M;", "    if (R.type === 'tables') par += RpTab.params(R);   /* 2.4.42 */\n    const M = rpModel(R); App.rep.model = M;")
    R("    bind('#rpDate', 'date'); bind('#rpPs', 'psId');", "    if (R.type === 'tables') RpTab.ligar(root, R, re);   /* 2.4.42 */\n    bind('#rpDate', 'date'); bind('#rpPs', 'psId');")
