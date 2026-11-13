# Produção 2.4.73 · calendário de produção do Portal (13/11/2026): o dia que veio do Portal (origin 'portal', aplicado pelo CadSync)
# fica travado no Plano do mês ("edite no Portal") e o exports.calendario diz de onde veio cada dia (origem, aditivo).


def aplicar(R):
    R("    const cur = db.calendar.find(c => !c.deleted && c.date === date && c.lineId === lineId);\n    const before = cur ? cur.kind : 'normal';",
      "    const cur = db.calendar.find(c => !c.deleted && c.date === date && c.lineId === lineId);\n"
      "    if (cur && cur.origin === 'portal' && (extra.origin || 'interface') !== 'portal') { const e = new Error(`O dia ${U.brDate(date)} vem do Calendário de produção do Portal (${cur.kind === 'off' ? 'sem produção' : 'dia extra'}${cur.reason ? ': ' + cur.reason : ''}). Para mudar, edite no Portal › Cadastros › Calendário de produção.`); e.code = 'DAY_PORTAL'; throw e; }   /* 2.4.73 */\n"
      "    const before = cur ? cur.kind : 'normal';")
    R(".map(c => ({ dia: c.date, tipo: c.kind === 'off' ? 'sem produção' : 'extra', motivo: c.reason || '' }))",
      ".map(c => ({ dia: c.date, tipo: c.kind === 'off' ? 'sem produção' : 'extra', motivo: c.reason || '', origem: c.origin === 'portal' ? 'portal' : 'producao' }))")
