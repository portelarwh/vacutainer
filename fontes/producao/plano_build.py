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
    # 2.4.43 · ordem pelo lote do MES (OrdLote em plano_ui.js) e Qtde real apurada com "usar (MES)"
    R("    const P = new Map(orders.map(o => [o.id, { target: o.qtyReal != null ? o.qtyReal : (o.qty || 0), produced: 0, firstAt: null, lastAt: null, doneAt: null, shiftLevel: false }]));\n",
      "    const P = new Map(orders.map(o => [o.id, { target: o.qtyReal != null ? o.qtyReal : (o.qty || 0), produced: 0, firstAt: null, lastAt: null, doneAt: null, shiftLevel: false }]));\n    const viaLote = typeof OrdLote !== 'undefined' ? OrdLote.aplicar(db, plan, orders, P, chunks) : new Set(), ordersH = orders.filter(o => !viaLote.has(o.id));   /* 2.4.43 */\n")
    R("        const o = pickOrder(orders, P, c, famOf);", "        const o = pickOrder(ordersH, P, c, famOf);")
    R("const ap = f === 'startReal' ? g.firstAt : g.doneAt, src = f === 'startReal' ? 'startSrc' : 'endSrc';",
      "const ap = f === 'qtyReal' ? (g.mes ? g.produced : null) : f === 'startReal' ? g.firstAt : g.doneAt, src = f === 'qtyReal' ? 'qtySrc' : f === 'startReal' ? 'startSrc' : 'endSrc';")
    R("for (const f of fields || ['startReal', 'endReal']) {", "for (const f of fields || ['startReal', 'endReal', 'qtyReal']) {")
    R("if (k === 'startReal') delete o.startSrc; if (k === 'endReal') delete o.endSrc;", "if (k === 'startReal') delete o.startSrc; if (k === 'endReal') delete o.endSrc; if (k === 'qtyReal') delete o.qtySrc;")
    R("""<td class="n">${g ? fq(g.produced) : '—'}${g && g.shiftLevel ? '<br><span class="small muted">por turno</span>' : ''}</td>""",
      """<td class="n">${g ? fq(g.produced) : '—'}${g && g.shiftLevel ? '<br><span class="small muted">por turno</span>' : ''}${g && g.mes ? `<br><span class="small muted" title="Caixas do lote no MES">MES · ${U.fmt(g.mes.caixas)} cx${g.mes.terminou ? ' · lote encerrado' : ''}</span>` : ''}</td>""")
    R("""data-f="qtyReal" value="${o.qtyReal == null ? '' : fq(o.qtyReal)}" aria-label="Quantidade real"></td>""",
      """data-f="qtyReal" value="${o.qtyReal == null ? '' : fq(o.qtyReal)}" aria-label="Quantidade real">${typeof OrdLote !== 'undefined' ? OrdLote.sugQ(o, g) : ''}</td>""")
    # 2.4.43 · OEE e percentuais com as casas do Portal › Parâmetros › Produção (casasPct; padrão 2). Chamadas com casas explícitas não mudam.
    R("  const pct = (v, d = 1) => (v == null || !isFinite(v)) ? '—' : NF[d].format(v * 100) + '%';",
      "  const PCT_D = (() => { let t = 0, v = 2; return () => { const n = Date.now(); if (n - t > 5000) { t = n; try { const c = JSON.parse(localStorage.getItem('vac.cadastros') || 'null'), k = c && c.parametros && c.parametros.producao ? c.parametros.producao.casasPct : null; v = k === 0 || (k >= 1 && k <= 3) ? +k : 2; } catch (e) { v = 2; } } return v; }; })();   /* 2.4.43 */\n  const pct = (v, d) => (v == null || !isFinite(v)) ? '—' : NF[d == null ? PCT_D() : d].format(v * 100) + '%';")
    R("  const pp = (v, d = 1) => (v == null || !isFinite(v)) ? '—' : (v > 0 ? '+' : '') + NF[d].format(v * 100) + ' p.p.';",
      "  const pp = (v, d) => (v == null || !isFinite(v)) ? '—' : (v > 0 ? '+' : '') + NF[d == null ? PCT_D() : d].format(v * 100) + ' p.p.';")
