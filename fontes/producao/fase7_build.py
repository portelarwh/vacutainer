# Produção 2.4.34 · Fase 7 do briefing (09/11/2026): PRD-05 (responsável por turno), PRD-06 (hora a hora por turno), UX-01 (ⓘ nos
# botões do dia) e UX-04 (pílula única do cadastro, kit vacCadPilula). Lógica em fontes/producao/fase7.js.
import os
AQUI = os.path.dirname(os.path.abspath(__file__))


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'fase7.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    # PRD-05: responsável do dia só no "Total diário" (Responsável pelo reporte); responsável em cada turno
    R("""        <label class="f"><span>Responsável ${ib('responsible')}</span><input type="text" data-dayf="responsible" value="${esc(day.responsible || '')}" maxlength="60" data-fk="d-resp"></label>\n""",
      """        ${day.scrapMode === 'day' ? `<label class="f"><span>Responsável pelo reporte ${ib('responsible')}</span><input type="text" data-dayf="responsible" value="${esc(day.responsible || '')}" maxlength="60" data-fk="d-resp"></label>` : ''}\n""")
    R("""      <div class="kv"><span class="l">Tempo planejado ${ib('plannedTime')}</span>""",
      """      <label class="kv"><span class="l">Responsável do turno ${ib('shiftResponsible')}</span><input type="text" data-psf="${ps.id}|responsible" value="${esc(ps.responsible || '')}" maxlength="60" placeholder="${esc(ps.closing ? ps.closing.by || '' : '')}" data-fk="ps-resp-${ps.id}"></label>\n      <div class="kv"><span class="l">Tempo planejado ${ib('plannedTime')}</span>""")
    R("      if (field !== 'note') assertEditable(d, ps);", "      if (field !== 'note' && field !== 'responsible') assertEditable(d, ps);   /* 2.4.34 · PRD-05: responsável como a observação */")
    # PRD-06: hora a hora de cada turno
    R("""<button class="btn sm" data-reopenps="${ps.id}">Reabrir turno</button>` : `<button class="btn sm primary" data-closeps="${ps.id}">${I.lock} Fechar turno</button>`}</header>""",
      """<button class="btn sm" data-reopenps="${ps.id}">Reabrir turno</button>` : `<button class="btn sm primary" data-closeps="${ps.id}">${I.lock} Fechar turno</button>`}${HHPs.botao(ps)}</header>""")
    R("""<button class="btn primary" data-route="hourly">Hora a hora ${I.chevR}</button>""", """<button class="btn primary" data-hhps="" title="Hora a hora de todos os turnos do dia">Hora a hora ${I.chevR}</button>""")
    R("    const c = root.querySelector('#dClose'); if (c) c.onclick = () => closeFlow(day, null);",
      "    HHPs.ligar(root, day);   /* 2.4.34 · PRD-06 */\n    const c = root.querySelector('#dClose'); if (c) c.onclick = () => closeFlow(day, null);")
    R("    h += SrvUI.hourlyBanner(day, res);", "    h += HHPs.barra(day, res);   /* 2.4.34 · PRD-06 */\n    h += SrvUI.hourlyBanner(day, res);")
    R("    for (const sr of res.shifts) {\n      const ps = sr.ps, lk = locked(day, ps), fs = res.flat.filter(f => f.ps === ps);",
      "    for (const sr of res.shifts.filter(sr => HHPs.mostra(day, sr.ps))) {\n      const ps = sr.ps, lk = locked(day, ps), fs = res.flat.filter(f => f.ps === ps);")
    R("<td>Total do dia</td>", "<td>Total do dia${HHPs.id(day) ? ' (todos os turnos)' : ''}</td>")
    R("    const hm = root.querySelector('#hhMeta');", "    HHPs.ligar(root, day);\n    const hm = root.querySelector('#hhMeta');")
    # UX-01: ⓘ nos botões do dia
    R("""<button class="btn sm ghost" id="dRestore">Restaurar intervalos padrão</button>""", """<button class="btn sm ghost" id="dRestore">Restaurar intervalos padrão</button>${ib('restaurarIv')}""")
    R("""Reaplicar metas vigentes</button>""", """Reaplicar metas vigentes</button>${ib('reaplicarMetas')}""")
    R("""<button class="btn sm ghost" id="dOff">Marcar dia sem produção</button>""", """<button class="btn sm ghost" id="dOff">Marcar dia sem produção</button>${ib('diaSemProd')}""")
    R("""<button class="btn sm ghost" id="dMove">Mover para outro dia</button>""", """<button class="btn sm ghost" id="dMove">Mover para outro dia</button>${ib('moverDia')}""")
    # UX-04 (D8): pílula única do cadastro (kit)
    R("""    <span class="pill ${cad ? 'info' : 'none'}" title="${cad ? `vacutainer-cadastros.json · gravado em ${U.brDT(cad.revAt)} por ${esc(cad.revBy || '—')}` : 'O cadastro base do Portal ainda não existe na pasta: o OEE usa os próprios cadastros'}">${cad ? `Cadastro rev ${cad.rev}` : 'Cadastro próprio do OEE'}</span>""",
      """    ${cad && typeof vacCadPilula === 'function' ? vacCadPilula(cad.rev, { fonte: 'pasta', revAt: cad.revAt, revBy: cad.revBy }) : `<span class="pill none" title="O cadastro base do Portal ainda não existe na pasta: o OEE usa os próprios cadastros">Cadastro próprio do OEE</span>`}""")
