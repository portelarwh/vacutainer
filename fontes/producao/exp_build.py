# Produção 2.4.68 · Fase 1 do ordem/lote (13/11/2026): o exports publica de onde vem cada fato de produção.
# - trechos (60 dias): trechos do MES {ini, fim, lote, catalogo, ordem, caixas}; ordem pelo lote no plano
# - atual: o lote em produção (último trecho) {lote, catalogo, ordem, desde, ultimaCaixa, caixas}
# - trocas (60 dias): troca de lote entre trechos seguidos {em, de, para, catalogo, ordem}
# - paradasEventos (90 dias): paradas da Produção com o id estável (eventoId comum com o Paradas), turno, horário,
#   equipamento, código e o lote/ordem/catálogo do trecho do MES no início da parada ("estimado" quando só o mais próximo)
# Nada muda no cálculo, na gravação nem nos campos que já existiam (aditivo; exportsVersion 1).
# Também corrige a ordem de declaração: as pendências de ordem × lote eram empurradas antes do "const pendencias".


def aplicar(R):
    # pendências ordem × lote: guardadas e juntadas depois de declarar a lista
    R("    for (const x of ordemLote.ordens.slice(0, 20)) pendencias.push(",
      "    const pendOL = [];   /* 2.4.68: a lista de pendências é declarada mais abaixo */\n    for (const x of ordemLote.ordens.slice(0, 20)) pendOL.push(")
    R("    for (const x of ordemLote.lotes.slice(0, 20)) pendencias.push(",
      "    for (const x of ordemLote.lotes.slice(0, 20)) pendOL.push(")
    R("    // pendências que o Portal consolida\n    const pendencias = [];\n",
      "    // pendências que o Portal consolida\n    const pendencias = [...pendOL];\n")
    # paradas da Produção, coletadas no mesmo laço do porDia (computeDay já feito)
    R("    const porDia = [], porDiaTurno = [], porDiaCatalogo = [], d120 = U.addDays(today, -119), d60 = U.addDays(today, -59);",
      "    const porDia = [], porDiaTurno = [], porDiaCatalogo = [], d120 = U.addDays(today, -119), d60 = U.addDays(today, -59);\n"
      "    const paradasEventos = [], pe90 = U.addDays(today, -89), pePorDia = [];   /* 2.4.68 */")
    R("      if (d.date >= d60) {\n        // abono do turno",
      "      if (d.date >= pe90) pePorDia.push({ d, res });\n      if (d.date >= d60) {\n        // abono do turno")
    # blocos novos, montados antes do return
    R("    const cad = cadastros(db);\n    const TIPO_IMP",
      "    const origem = origemProducao(db, today, porOrdem, pePorDia);   /* 2.4.68 · trechos, atual, trocas, paradasEventos */\n"
      "    const cad = cadastros(db);\n    const TIPO_IMP")
    R("ordens, porOrdem, porOrdemCobertura, ordemLote, lotes, pendencias, kpis };",
      "ordens, porOrdem, porOrdemCobertura, ordemLote, lotes, pendencias, kpis,\n"
      "      trechos: origem.trechos, atual: origem.atual, trocas: origem.trocas, paradasEventos: origem.paradasEventos, paradasEventosCobertura: origem.cob };")
    R("  function shiftMonth(date, k) {", ORIGEM + "  function shiftMonth(date, k) {")


ORIGEM = r"""  /* 2.4.68 · de onde vem cada fato: trecho do MES → lote → ordem do plano; parada → trecho no horário dela */
  function origemProducao(db, today, porOrdem, pePorDia) {
    const d60 = U.addDays(today, -59), lim = today + 'T23:59:59';
    const ordDoLote = new Map(); for (const o of porOrdem || []) if (o.lote && !ordDoLote.has(String(o.lote))) ordDoLote.set(String(o.lote), o.ordem);
    const segs = ((db.server || {}).segments || []).filter(s => s.lineId === LINE && s.lot != null && s.t1 && s.t1.slice(0, 10) >= d60 && s.t0 <= lim).sort((a, b) => a.t0 < b.t0 ? -1 : a.t0 > b.t0 ? 1 : 0);
    const trechos = segs.map(s => ({ ini: s.t0.slice(0, 16), fim: s.t1.slice(0, 16), lote: String(s.lot), catalogo: s.cat == null ? null : String(s.cat), ordem: ordDoLote.get(String(s.lot)) || null, caixas: s.n || 0 }));
    const trocas = [];
    for (let i = 1; i < trechos.length; i++) { const a = trechos[i - 1], b = trechos[i]; if (a.lote !== b.lote) trocas.push({ em: b.ini, de: a.lote, para: b.lote, catalogo: b.catalogo, ordem: b.ordem }); }
    let atual = null;
    if (trechos.length) { const u = trechos[trechos.length - 1]; let k = trechos.length - 1; while (k > 0 && trechos[k - 1].lote === u.lote) k--;
      atual = { lote: u.lote, catalogo: u.catalogo, ordem: u.ordem, desde: trechos[k].ini, ultimaCaixa: u.fim, caixas: trechos.slice(k).reduce((a, t) => a + t.caixas, 0) }; }
    // trecho do MES no horário (AAAA-MM-DDTHH:MM): o que contém; senão o último que terminou até 4 h antes (estimado)
    const naHora = ts => { let ant = null; for (const t of trechos) { if (t.ini <= ts && ts <= t.fim) return { t, fonte: 'trecho' }; if (t.fim < ts) ant = t; else break; }
      if (ant) { const dm = (Date.parse(ts + ':00Z') - Date.parse(ant.fim + ':00Z')) / 60000; if (dm <= 240) return { t: ant, fonte: 'estimado' }; } return null; };
    const isoMin = (date, min) => { const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) + Math.round(min) * 60000); return d.toISOString().slice(0, 16); };
    const paradasEventos = [];
    for (const { d, res } of pePorDia || []) for (const er of Object.values(res.events || {})) {
      if (er.imp && er.imp.deducts) continue;   // pausas planejadas e RTB não são parada de máquina (como em paradasEquipamento)
      const ev = er.ev || {}, c = (db.downtimeCodes || []).find(x => x.id === ev.codeId) || null, eq = (db.machines || []).find(x => x.id === ev.equipmentId) || null;
      const tur = er.dayLevel ? null : [...(er.shiftIds || [])].map(id => (res.shifts.find(s => s.ps.id === id) || {}).ps).filter(Boolean).map(ps => ps.snap.code || ps.snap.name);
      const ini = ev.start != null ? isoMin(d.date, ev.start) : null, fim = ev.end != null ? isoMin(d.date, ev.end) : null, o = ini ? naHora(ini) : null;
      paradasEventos.push({ id: String(ev.id), dia: d.date, turno: tur && tur.length ? tur[0] : null, turnos: tur && tur.length > 1 ? tur : undefined,
        inicio: ev.start != null ? U.hhmm(ev.start) : null, fim: ev.end != null ? U.hhmm(ev.end) : null, ini, fimEm: fim, minutos: n0(er.minutes),
        equipamento: eq ? eq.code : null, codigo: c ? c.code || null : null, descricao: c ? c.name : null, obs: ev.note || '',
        lote: o ? o.t.lote : null, ordem: o ? o.t.ordem : null, catalogo: o ? o.t.catalogo : null, origemLote: o ? o.fonte : null });
    }
    paradasEventos.sort((a, b) => (a.dia + (a.inicio || '')).localeCompare(b.dia + (b.inicio || '')));
    return { trechos, atual, trocas, paradasEventos, cob: { de: U.addDays(today, -89), ate: today, dias: 90, fonte: 'Apontamento da Produção (paradas do dia)' } };
  }
"""
