# Produção 2.4.51 · títulos, unidades e legendas dos gráficos (pendência § L / V06 do registro de decisões).
# Só apresentação: nenhum número muda.
#  - "Valores em <unidade>" acima de todo gráfico cujo eixo ou barra mostra número sem unidade
#    (produção em mil tubos ou tubos, conforme a exibição escolhida; PPH em <unidade>/h; paradas em min).
#    Gráficos em % já trazem a unidade em cada rótulo e não ganham a linha.
#  - eixo em % sem rótulos repetidos (ex.: Scrap % com 0,0% · 0,0% · 0,1%): mais casas só no eixo, quando repetiria.
#  - legenda dos gráficos de uma série só com meta (Scrap %, Perda) já existia quando há meta; nada muda.
import os
AQUI = os.path.dirname(os.path.abspath(__file__))


def aplicar(R):
    # ---- motor (Charts) ----
    # unidade: linha pequena acima do gráfico (fora do SVG, então o redesenho ao mudar a largura não a apaga)
    R("""  function wrap(cid, svg, legend, table, h) {
    return `<div class="chart" data-cid="${cid}">""",
      """  const unTag = o => { const u = o && (typeof o.unit === 'function' ? o.unit() : o.unit); return u ? `<div class="c-un small muted">Valores em <b>${esc(u)}</b></div>` : ''; };   /* 2.4.51 */
  function wrap(cid, svg, legend, table, h) {
    return `<div class="chart" data-cid="${cid}">""")
    R("    return wrap(cid, s, series.length > 1 || o.forceLegend || anyMeta ? series.join('') : '', table, H);",
      "    return unTag(o) + wrap(cid, s, series.length > 1 || o.forceLegend || anyMeta ? series.join('') : '', table, H);")
    # Pareto (hbar): minutos quando o gráfico não diz outra coisa (valueName ausente = minutos, como a tabela e a dica já dizem)
    R("    return wrap(cid, s, '', table);\n  }\n\n  /* cascata de perdas (waterfall) */",
      "    return unTag(o.unit !== undefined ? o : { unit: o.valueName ? null : 'min' }) + wrap(cid, s, '', table);\n  }\n\n  /* cascata de perdas (waterfall) */")
    R("    return wrap(cid, s, legend, table);", "    return unTag(o) + wrap(cid, s, legend, table);")
    # eixo em %: sem rótulos repetidos
    R("""    const fmtY = o.fmtY || compact;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || '')}">`;
    s += `<g class="ax">${sc.ticks.map(t => `<line class="gl" x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${esc(fmtY(t))}</text>`).join('')}</g>`;""",
      """    const fmtY = o.fmtY || compact;
    let fmtT = fmtY; { const L = sc.ticks.map(t => String(fmtY(t)));   /* 2.4.51: eixo em % sem rótulos repetidos (só o eixo; barras e dicas como antes) */
      if (new Set(L).size < L.length && L.every(l => /%$/.test(l))) { let d = 0; while (d < 3 && Math.abs(sc.step * 100 * 10 ** d - Math.round(sc.step * 100 * 10 ** d)) > 1e-6) d++; fmtT = t => U.pct(t, d); } }
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || '')}">`;
    s += `<g class="ax">${sc.ticks.map(t => `<line class="gl" x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${esc(fmtT(t))}</text>`).join('')}</g>`;""")
    # rótulos dentro das barras: com as mesmas casas do eixo quando o eixo precisou de mais (Scrap % 0,031% em vez de 0,0%)
    R("      const fl = b.fmtLabel || b.fmt || fmtY;", "      const fl = b.fmtLabel || b.fmt || fmtT;")
    # estilo .c-un: no kit (kit_visual.css), comum às páginas
    # unidade da quantidade: "mil tubos" (exibição em milheiros) ou "tubos" (número completo); outro rótulo do Portal vem como está
    R("const unitLbl = () => vacQtd() === 'abs' ? 'un' : (db() && db().settings.unitLabel) || 'un';",
      "const unitLbl = () => vacQtd() === 'abs' ? 'un' : (db() && db().settings.unitLabel) || 'un';\n"
      "const qUn = () => { const u = unitLbl(); return u === 'un' ? 'tubos' : /tubo/i.test(u) ? u : u + ' tubos'; };   /* 2.4.51 · unidade nos gráficos */")

    # ---- gráficos ----
    # quantidade (produção, meta, capacidade, cascata, plano): todos usam fq() no eixo
    R("fmtY: v => fq(v)", "unit: qUn, fmtY: v => fq(v)", 12)
    R("{ name: 'PPH nominal', values: ser('pphNom'), color: 'var(--muted)', width: 1.5, dots: false }], unit: qUn, fmtY: v => fq(v)",
      "{ name: 'PPH nominal', values: ser('pphNom'), color: 'var(--muted)', width: 1.5, dots: false }], unit: () => qUn() + '/h', fmtY: v => fq(v)")
    # minutos
    R("fmtY: v => U.fmt(v)", "unit: 'min', fmtY: v => U.fmt(v)", 2)
    # produção por catálogo e por família (hbar com valueName): quantidade
    R("fmt: v => fq(v), valueName: 'Produção boa'", "unit: qUn, fmt: v => fq(v), valueName: 'Produção boa'", 2)
