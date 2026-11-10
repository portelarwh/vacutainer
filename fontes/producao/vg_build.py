# Produção 2.4.38 · Visão Geral com os cartões do Lançamento e blocos recolhíveis; Hora a hora com o turno não produtivo (só leitura),
# turnos recolhíveis, gráfico com todas as horas e sem os textos de ajuda fixos; cartão "Caixas do MES" (fontes/producao/vg_hh.js).
import os
AQUI = os.path.dirname(os.path.abspath(__file__))


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'vg_hh.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    # Hora a hora: textos fixos que saem (a ajuda está no F1 e no ⓘ)
    R("""      <span class="small muted">Produção boa em <b>${esc(UNIT() > 1 ? 'mil' : unitLbl())}</b> ou no número completo (61 ou 61.000) (${U.fmt(st.entryUnit)} un). Enter grava e desce · ↑↓ navegam · Esc desfaz · Alt+P parada · Alt+O observação</span>\n""", "")
    R("""<button class="btn xs ghost" id="hhPauseCfg">Pausas e intervalos padrão do turno ›</button><span class="muted">· Para editar um intervalo deste dia use ⋯ no fim da linha.</span>""", "")
    # turnos recolhíveis
    R("""h += `<tr class="grp"><td colspan="${showM ? 17 : 13}"><span class="swatch\"""",
      """h += `<tr class="grp" data-hhgrp="${esc(ps.snap.code || ps.id)}" title="Recolher / expandir o turno"><td colspan="${showM ? 17 : 13}">${HHPs.seta(ps.snap.code || ps.id)} <span class="swatch\"""")
    R("""h += `<tr class="${iv.kind === 'extra' ? 'extra ' : ''}${f.errs.length ? 'has-err ' : ''}${cur ? 'sel' : ''}" data-iv="${iv.id}">""",
      """h += `<tr class="${iv.kind === 'extra' ? 'extra ' : ''}${f.errs.length ? 'has-err ' : ''}${cur ? 'sel' : ''}" data-iv="${iv.id}" data-hhg="${esc(ps.snap.code || ps.id)}"${HHPs.dobrado(ps.snap.code || ps.id) ? ' hidden' : ''}>""")
    # turno não produtivo (só leitura) depois da grade; gráfico com todas as horas
    R("    h += `</tbody></table></div>`;\n", "    h += `</tbody></table></div>`;\n    h += HHPs.npHtml(day, res);   /* 2.4.38 */\n")
    R("${Charts.combo(hhChartOpts(fl, 200))}", "${Charts.combo(HHPs.chart(hhChartOpts(fl, 200), day, res))}")
    R("    HHPs.ligar(root, day);\n    const hm = root.querySelector('#hhMeta');", "    HHPs.ligar(root, day); HHPs.ligarDobra(root);\n    const hm = root.querySelector('#hhMeta');")
    # gráfico combo: allLabels = rótulo em todas as colunas (inclinado quando não cabe)
    R("    const hasMark = !!(o.mark && o.mark.some(m => m && m.length)), padB = 34 + (hasMark ? 9 : 0);",
      "    const hasMark = !!(o.mark && o.mark.some(m => m && m.length)), rotL = !!o.allLabels && (W - 64) / n < 40, padB = 34 + (hasMark ? 9 : 0) + (rotL ? 18 : 0);")
    R("""    s += `<g class="ax">${o.x.map((l, i) => i % every === 0 ? `<text x="${xc(i)}" y="${H - padB + 16}" text-anchor="middle">${esc(l)}</text>` : '').join('')}</g>`;""",
      """    s += `<g class="ax">${o.x.map((l, i) => o.allLabels || i % every === 0 ? (rotL ? `<text transform="translate(${xc(i)},${H - padB + 12}) rotate(-50)" text-anchor="end" style="font-size:10px">${esc(l)}</text>` : `<text x="${xc(i)}" y="${H - padB + 16}" text-anchor="middle">${esc(l)}</text>`) : '').join('')}</g>`;""")
    # Lançamento: cartão Caixas do MES
    R("      ${OeeReal.kpis(day, res)}\n    </div>`);", "      ${OeeReal.kpis(day, res)}${MesDia.kpiDia(day)}\n    </div>`);")
    # Visão Geral: os cartões do Lançamento no período (a faixa antiga sai; os mesmos indicadores estão no bloco novo)
    R('    h += `<div class="kpis">\n      ${A.kpiCmp(\'OEE realizado\', r.oee, v => U.pct(v), { pct: true, meta: r.oeeTarget, semState: r.semOee, prev: pr && pr.oee, series: ser(\'oee\'), best: bOee, worst: wOee, sub: r.oeeGap == null ? \'\' : `${r.oeeGap >= 0 ? \'+\' : \'\'}${U.pp(r.oeeGap)} contra a meta` })}\n      ${A.kpiCmp(\'Disponibilidade\', r.D, v => U.pct(v), { pct: true, prev: pr && pr.D, series: ser(\'D\'), sub: \'medida pelas paradas apontadas\' })}\n      ${A.kpiCmp(\'Performance\', r.P, v => U.pct(v), { pct: true, prev: pr && pr.P, series: ser(\'P\'), sub: r.perfAlert ? semB(\'warn\', \'acima de 100%\') : \'calculada: OEE ÷ (D × Q)\' })}\n      ${A.kpiCmp(\'Qualidade\', r.Q, v => U.pct(v, 2), { pct: true, prev: pr && pr.Q, series: ser(\'Q\') })}\n      ${A.kpiCmp(\'Atendimento ao plano\', r.attain, v => U.pct(v), { pct: true, prev: pr && pr.attain, series: ser(\'attain\'), sub: `${fq(r.good)} de ${fq(r.metaOp)} ${esc(unitLbl())} ${semB(r.semAttain, \'\')}` })}\n      ${A.kpiCmp(\'Confiabilidade do OEE\', 1, () => rel.level, { semState: rel.sem, sub: esc(rel.txt), click: \'rel\' })}\n    </div>\n',
      "    h += `${VGC.html(days, pd, r, pr, ser, bOee, wOee, bG, wG, rel)}   <!-- 2.4.38: os cartões do Lançamento no período -->\n")
    R("\n    ${OeeReal.overview(days, pd)}", "")
    # 2.4.40 · pedido do usuário: o cabeçalho deixa de mostrar "Servidor até …" e a hora da última gravação (a cobertura do MES está em
    # Portal › Importação; a versão e a última gravação de cada página, em Portal › Configuração › Versões; o ⓘ da situação da base continua)
    R('    ${srvEnd ? `<span class="pill none" title="Dados do servidor (MES) importados">Servidor até ${ServerData.br(srvEnd)}</span>` : \'\'}\n    <span class="pill none" title="${esc((S.mode === \'pasta\' ? \'Pasta \' + (S.backend && S.backend.name) : S.mode === \'arquivo\' ? \'Arquivo \' + (S.fileName || \'\') : \'Somente neste navegador\') + (d ? \' · última gravação \' + U.brDT(d.lastModifiedAt) + \' por \' + (d.lastModifiedBy || \'—\') : \'\'))}">${d ? U.brDT(d.lastModifiedAt).slice(0, 5) + \' \' + U.brDT(d.lastModifiedAt).slice(-5) : \'—\'}</span>`;', "`;")
