# Produção 2.4.41 · homologação de 10/11/2026 (PRD-08, PRD-10, PRD-13): cartão do turno (produção dentro/fora/total, OEE reportado e real),
# scrap por máquina e gel num popup, indicadores novos no Painel (fontes/producao/turno_card.js).
import os
AQUI = os.path.dirname(os.path.abspath(__file__))
SCRAP_ANTES = """<label class="kv"><span class="l">Scrap (peças) ${ib('scrap')}</span>${day.scrapMode === 'day' ? `<span class="v">${U.fmt(r.scrap)}</span><span class="small muted">rateado do total diário</span>` : `<input type="text" inputmode="numeric" class="n" data-psf="${ps.id}|scrap" value="${ps.scrap == null ? '' : ps.scrap}" ${lk || ps.summary ? 'disabled' : ''} data-fk="ps-scrap-${ps.id}" placeholder="não informado">`}</label>"""
SCRAP_DEPOIS = """<div class="kv"><span class="l">Scrap ${ib('scrapTurno')}</span>${day.scrapMode === 'day' ? `<span class="v">${U.fmt(r.scrap)} peças</span><span class="small muted">rateado do total diário</span>` : TurnoCard.scrapBtn(day, sr, res, lk)}</div>"""


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'turno_card.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    R("""      <div class="kv"><span class="l">Produção boa</span><span class="v">${fq(r.good)} ${unitLbl()}</span><span class="small">${semB(r.semAttain, 'meta ' + fq(r.metaOp))}</span></div>""",
      """      ${TurnoCard.producao(day, sr, res)}""")
    R("""      <div class="kv"><span class="l">Produção processada</span><span class="v">${fq(r.processed)} ${unitLbl()}</span></div>\n""", "")
    R("""<div class="kv"><span class="l">OEE realizado ${ib('oee')}</span><span class="v">${U.pct(r.oee)}</span><span class="small">${semB(r.semOee, 'meta ' + U.pct(r.oeeTarget))}</span></div>""",
      """${TurnoCard.oee(day, sr, res)}""")
    R(SCRAP_ANTES, SCRAP_DEPOIS)
    R("      ${res ? GelTurno.bloco(day, sr, res) : ''}\n", "")   # o gel fica no popup do scrap (a tela do operador continua com o dela)
    R("SrvUI.bindDay(root, day); ForaTurnoUI.mount(root, day); GelTurno.mount(root, day, Engine.computeDay(db(), day));",
      "SrvUI.bindDay(root, day); ForaTurnoUI.mount(root, day); GelTurno.mount(root, day, Engine.computeDay(db(), day)); TurnoCard.ligar(root, day);")
    R(", gel: GelTurno.exp(sr.ps, d.date) });", ", gel: GelTurno.exp(sr.ps, d.date), scrapMaq: sr.ps.scrapMaq || undefined });")
    R("const PN_MINE = () => ({ kpis: ['oee', 'gap',", "const PN_MINE = () => ({ kpis: ['oee', 'oeeReal', 'gap',")
    R("'kas', 's5', 'oee', 'worst', 'gap', 'days'],", "'kas', 's5', 'oee', 'oeeReal', 'worst', 'gap', 'days'],")
