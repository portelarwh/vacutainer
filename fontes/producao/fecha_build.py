# Produção 2.4.64 · fechar turno e dia com turno desabilitado no dia, e botões acesos (12/11/2026, pedido do usuário).
# 1) Turno não produtivo habilitado e depois desabilitado no dia (TUR-02) fica guardado com deleted:true. O fechamento olhava todos
#    os turnos do dia, inclusive esse: "Fechar o dia" quebrava (Cannot read properties of undefined, reading 'r') e fechar os turnos
#    um a um nunca fechava o dia. O envio para conferência e o aviso de dia atrasado tinham o mesmo descuido. Agora os turnos
#    excluídos não contam (como no cálculo, que já os ignora).
# 2) Botões acesos (verde, como a pílula "ok"): o "Reabrir turno" do turno fechado vira "Fechado · Reabrir"; o "Hora a hora x/y"
#    e o seletor de turno do Hora a hora acendem quando todos os intervalos do turno têm produção lançada ou o turno está fechado.
#    (botões em fontes/producao/turno_layout.js e fase7.js; aqui só as regras do código-base)


def aplicar(R):
    # (1) só os turnos que existem no dia
    R("      if (d.shifts.every(s => s.status === 'fechado')) { d.status = 'fechado';",
      "      if (d.shifts.filter(s => !s.deleted).every(s => s.status === 'fechado')) { d.status = 'fechado';   /* 2.4.64: turno desabilitado no dia não conta */")
    R("      if (d.status !== 'fechado') d.status = d.shifts.every(s => s.off || s.status === 'pendente de conferência' || s.status === 'fechado') ? 'pendente de conferência' : 'em lançamento';",
      "      if (d.status !== 'fechado') d.status = d.shifts.filter(s => !s.deleted).every(s => s.off || s.status === 'pendente de conferência' || s.status === 'fechado') ? 'pendente de conferência' : 'em lançamento';")
    R("      for (const ps of d.shifts) if (ps.status !== 'fechado') { freezeTargets(chk.res, ps);",
      "      for (const ps of d.shifts) if (!ps.deleted && ps.status !== 'fechado') { freezeTargets(chk.res, ps);   /* 2.4.64 */")
    R("      const targets = psId ? d.shifts.filter(s => s.id === psId) : d.shifts;",
      "      const targets = psId ? d.shifts.filter(s => s.id === psId) : d.shifts.filter(s => !s.deleted);")
    R("      if (ageMin > lim && !day.shifts.every(p => p.off || p.status === 'pendente de conferência')) out.overdue.push(",
      "      if (ageMin > lim && !day.shifts.filter(p => !p.deleted).every(p => p.off || p.status === 'pendente de conferência')) out.overdue.push(")
    # (2) estilo do botão aceso (verde da pílula "ok", nos dois temas)
    R(".pill.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,var(--line));background:var(--ok-bg)}",
      ".pill.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,var(--line));background:var(--ok-bg)}\n"
      "/* 2.4.64 · botão aceso: turno fechado ou hora a hora completo */\n"
      ".btn.lit,.tl .tl-acts .btn.lit,.seg button.lit{color:var(--ok)!important;border-color:var(--ok)!important;background:var(--ok-bg)!important;font-weight:700}\n"
      ".seg button.lit[aria-pressed=\"true\"]{box-shadow:inset 0 0 0 2px var(--ok)}")
    # cartão antigo do turno (dias importados por resumo)
    R("${lk ? `<button class=\"btn sm\" data-reopenps=\"${ps.id}\">Reabrir turno</button>`",
      "${lk ? `<button class=\"btn sm lit\" data-reopenps=\"${ps.id}\" title=\"Turno fechado. Clique para reabrir (com motivo).\">${I.lock} Fechado · Reabrir</button>`")
