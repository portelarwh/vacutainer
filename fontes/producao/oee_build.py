# Produção 2.4.37 · OEE real pela linha do tempo (início e fim espelhados), OEE reportado / OEE real / Fora de turno na faixa do dia e na
# Visão Geral, caixas do MES e trocas de lote em cada turno, cartão do turno não produtivo com caixas e "Editar cards" (fontes/producao/oee_real.js).
import os
AQUI = os.path.dirname(os.path.abspath(__file__))


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'oee_real.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    # faixa de indicadores do Lançamento: os 3 novos e o filtro do "Editar cards"
    R("""    h += `<div class="section kpis">\n      <div class="kpi kpi-cat">""", """    h += KC.filtrar(`<div class="section kpis">\n      <div class="kpi kpi-cat">""")
    R("""    </div>`;\n    h += SrvUI.dayCard(day, res);""", """      ${OeeReal.kpis(day, res)}\n    </div>`);\n    h += SrvUI.dayCard(day, res);""")
    R("""<button class="btn xs" id="dayMetas">Metas dos próximos meses</button>""",
      """<button class="btn xs" id="dayMetas">Metas dos próximos meses</button><button class="btn xs" id="kcEdit" title="Liga e desliga os indicadores do topo (vale neste computador)">Editar cards</button>""")
    R("{ const mb = root.querySelector('#dayMetas'); if (mb) mb.onclick = () => metasModal(); }",
      "{ const mb = root.querySelector('#dayMetas'); if (mb) mb.onclick = () => metasModal(); const kc = root.querySelector('#kcEdit'); if (kc) kc.onclick = () => KC.editar(); }")
    # cartões dos turnos: caixas do MES e trocas; turno não produtivo com caixas
    R("""      <div class="kv"><span class="l">Produção processada</span>""", """      ${OeeReal.turno(day, ps)}\n      <div class="kv"><span class="l">Produção processada</span>""")
    R("""${res.shifts.map(sr => shiftBlock(day, sr, res)).join('')}</div>`;""", """${res.shifts.map(sr => shiftBlock(day, sr, res)).join('')}${OeeReal.cardsNP(day, res)}</div>`;""")
    # Visão Geral
    R("""      ${A.kpiCmp('Confiabilidade do OEE', 1, () => rel.level, { semState: rel.sem, sub: esc(rel.txt), click: 'rel' })}\n    </div>""",
      """      ${A.kpiCmp('Confiabilidade do OEE', 1, () => rel.level, { semState: rel.sem, sub: esc(rel.txt), click: 'rel' })}\n    </div>\n    ${OeeReal.overview(days, pd)}""")
