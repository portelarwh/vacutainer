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
    # 2.4.73 · histórico enxuto para o Waste não ler a estrutura interna da Produção (registro § U, E4): ordens dos planos
    # mais antigas que os 24 meses do porOrdem e lotes (situação, observação, dias) mais antigos que os 150 dias do lotes
    R("      trechos: origem.trechos, atual: origem.atual, trocas: origem.trocas,",
      "      ordensHistorico: hist.ordens, lotesHistorico: hist.lotes,\n      trechos: origem.trechos, atual: origem.atual, trocas: origem.trocas,")
    R("  function shiftMonth(date, k) {", HIST + "  function shiftMonth(date, k) {")
    R("    const origem = origemProducao(db, today, porOrdem, pePorDia);", "    const origem = origemProducao(db, today, porOrdem, pePorDia), hist = historico(db, mIni, d150);")



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
      atual = { lote: u.lote, catalogo: u.catalogo, ordem: u.ordem, desde: trechos[k].ini, ultimaCaixa: u.fim, caixas: trechos.slice(k).reduce((a, t) => a + t.caixas, 0) };
      /* 2.4.71 · Fase 4 (cartão "Agora" do Portal): ritmo e previsão de término, estimados. Ritmo = caixas ÷ tempo dos trechos da corrida atual
         (sem as paradas entre trechos); o lote inteiro no MES (todos os trechos guardados) × peças por caixa = produzido; restante = qtd da ordem − produzido;
         previsão = última caixa + restante ÷ ritmo. Sem ordem com quantidade, sem previsão. */
      const pc = +((db.settings || {}).serverBoxQty) || 1000, run = trechos.slice(k), minRun = run.reduce((a, t) => a + Math.max(0, (Date.parse(t.fim + ':00Z') - Date.parse(t.ini + ':00Z')) / 60000), 0);
      const cxLote = ((db.server || {}).segments || []).filter(s => s.lineId === LINE && String(s.lot) === u.lote).reduce((a, s) => a + (s.n || 0), 0);
      const o = (porOrdem || []).find(x => x.lote && String(x.lote) === u.lote) || null, cat = (db.catalogs || []).find(c => !c.deleted && String(c.code) === String(u.catalogo)) || null;
      const ritmo = minRun >= 10 ? atual.caixas * pc / (minRun / 60) : null, prod = cxLote * pc, qtd = o && o.qtd ? o.qtd : null, rest = qtd != null ? Math.max(0, qtd - prod) : null;
      Object.assign(atual, { pecasPorCaixa: pc, caixasLote: cxLote, produzidoLote: prod, qtdOrdem: qtd, restante: rest, ritmoPecasHora: ritmo == null ? null : Math.round(ritmo), metaPecasHora: cat && cat.pph ? +cat.pph : null,
        previsaoFim: ritmo && rest != null ? (rest === 0 ? u.fim : new Date(Date.parse(u.fim + ':00Z') + rest / ritmo * 3600000).toISOString().slice(0, 16)) : null,
        base: 'estimado: ritmo da corrida atual do lote no MES (' + Math.round(minRun) + ' min em ' + run.length + ' trecho(s)) e caixas × ' + pc + ' peças' }); }
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


HIST = r"""  /* 2.4.73 · histórico: o que o porOrdem (24 meses) e o lotes (150 dias) não cobrem, só com o que está gravado (sem recalcular o progresso) */
  function historico(db, mIni, d150) {
    const cat = id => { const c = (db.catalogs || []).find(x => x.id === id); return c ? c.code : null; };
    const ordens = [];
    for (const p of db.monthPlans || []) { if (p.deleted || p.lineId !== LINE || !(p.month < mIni)) continue;
      for (const o of p.orders || []) ordens.push({ mes: p.month, ordem: String(o.order), lote: o.lot ? String(o.lot).trim() : null, catalogo: cat(o.catalogId) || o.code || null, qtd: n0(o.qty), qtdReal: o.qtyReal == null ? null : n0(o.qtyReal), inicio: o.start || null, fim: o.end || null, inicioReal: o.startReal || null, fimReal: o.endReal || null }); }
    ordens.sort((a, b) => a.mes.localeCompare(b.mes));
    const S = db.server || {}, dias = new Map();
    for (const [kk, v] of Object.entries(S.dayLot || {})) { const i = kk.indexOf('|'); if (i < 0) continue; const lot = kk.slice(i + 1).trim(), dia = kk.slice(0, i); if (!lot) continue; let a = dias.get(lot); if (!a) dias.set(lot, a = []); a.push({ dia, tipo: (v && v.kind) || null }); }
    const recente = new Set(((S.segments || []).filter(x => x.lineId === LINE && x.t1 && x.t1.slice(0, 10) >= d150)).map(x => String(x.lot)));
    const nomes = new Set([...Object.keys(S.lotClass || {}), ...Object.keys(S.lotNotes || {}), ...dias.keys()]);
    const lotes = [];
    /* revisão Codex (PR #74): fica de fora só o lote que já está no exports.lotes (caixas do MES nos 150 dias); classificação de dia recente sem caixas recentes vem aqui */
    for (const lot of nomes) { if (recente.has(lot)) continue; const ds = (dias.get(lot) || []).map(x => x.dia).sort();
      const c = (S.lotClass || {})[lot], n = (S.lotNotes || {})[lot];
      lotes.push({ lote: lot, situacao: c ? (typeof c === 'object' ? c.kind || null : String(c)) : null, obs: n ? (typeof n === 'object' ? n.text || '' : String(n)) : '', dias: ds, retrabalhoDias: (dias.get(lot) || []).filter(x => x.tipo === 'retrabalho').map(x => x.dia).sort() }); }
    return { ordens, lotes };
  }
"""
