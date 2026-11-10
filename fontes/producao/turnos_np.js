/* ===== Produção 2.4.24 · Fase 2 do briefing de 09/11/2026: turno produtivo, habilitação no dia e produção fora dos turnos =====
   TUR-01 · turno ativo e NÃO produtivo (Portal › Turnos › vigência "Turno não produtivo"): não entra no dia (nem no plano).
   TUR-02 · "Habilitar turno X" no lançamento do dia: o turno entra no dia como produtivo (só naquele dia); o tempo dele vira planejado (D4).
   TUR-01 / POR-10 · caixas do servidor (MES) fora de qualquer turno do dia (janela do turno não produtivo, ou horário sem turno, como a
     madrugada antes das 06:00 quando o turno C não existe no dia) são REATRIBUÍDAS, só para apuração: o registro horário não muda.
     Regra (D1): a janela é dividida em trechos contínuos (intervalo sem caixa até o limite de continuidade, padrão = "Parada sem caixa");
       - trecho emendado com o fim do turno produtivo anterior (a linha não parou na troca) → vai para esse turno;
       - senão → vai para o próximo turno produtivo (ex.: produção da madrugada sem continuidade com o B → A do dia seguinte).
     Só vale para dias a partir de settings.foraTurnoDesde (Portal › Parâmetros › Produção; padrão = 1ª vigência não produtiva):
     dias anteriores (inclusive os fechados) não mudam.
   TUR-04 · OEE reportado = com a reatribuição (é o resultado oficial do dia e dos turnos; Performance acima de 100% é aceita, D2);
     OEE real = sem a reatribuição, e cada trecho fora de turno com o próprio OEE: tempo planejado = 1ª à última caixa (D3).
   TUR-03 · o quadro do dia mostra quanto foi produzido fora dos turnos, para onde foi e o peso no OEE.
   Este trecho entra no script principal (antes do ServerData) pelo build.py. */
const ForaTurno = (() => {
  const SD = () => ServerData;
  /* início do dia operacional (06:00): o menor início de turno ativo do cadastro, como o ServerData */
  function opOff(db) { let m = 1440; for (const sh of db.shifts || []) if (!sh.deleted) for (const v of sh.versions || []) if (!v.deleted && v.active !== false && v.start) m = Math.min(m, U.toMin(v.start)); return m === 1440 ? 360 : m; }
  const desde = db => { const d = (db.settings || {}).foraTurnoDesde; return d ? String(d) : null; };
  const vale = (db, date) => { const d = desde(db); return !!d && date >= d; };
  const limite = db => { const st = db.settings || {}; return +st.continuityMin > 0 ? +st.continuityMin : (+st.serverGapMin > 0 ? +st.serverGapMin : 10); };
  const diaDe = (db, date, lineId) => (db.productionDays || []).find(d => !d.deleted && d.date === date && d.lineId === lineId) || null;
  /* turnos do dia: o lançamento (se existe: respeita habilitação e "sem produção"); senão, o cadastro */
  function turnosDoDia(db, date, lineId) {
    if (Engine.dayMark(db, date, lineId) && Engine.dayMark(db, date, lineId).kind === 'off') return [];
    const day = diaDe(db, date, lineId);
    const fix = (s, e) => { if (e != null && s != null && e <= s) e += 1440; return [s, e]; };
    if (day) return day.shifts.filter(p => !p.deleted).map(p => {
      const iv = p.intervals.filter(i => !i.deleted); let [s, e] = iv.length ? [Math.min(...iv.map(i => i.start)), Math.max(...iv.map(i => i.end))] : fix(U.toMin(p.snap.start), U.toMin(p.snap.end));
      return { date, code: p.snap.code, name: p.snap.name, s, e, prod: !p.off || p.offType === 'np' };
    }).filter(x => x.s != null && x.e != null).sort((a, b) => a.s - b.s);
    return Engine.activeShiftsAt(db, date, lineId).map(({ shift, v }) => { const [s, e] = fix(U.toMin(v.start), U.toMin(v.end)); return { date, code: shift.code, name: shift.name, s, e, prod: true }; }).filter(x => x.s != null && x.e != null).sort((a, b) => a.s - b.s);
  }
  /* turno não produtivo do cadastro que cobre a janela (para o rótulo) */
  function rotulo(db, date, lineId, a, b) {
    for (const { shift, v } of Engine.activeShiftsAt(db, date, lineId, undefined, true)) { if (v.productive !== false) continue; let s = U.toMin(v.start), e = U.toMin(v.end); if (e <= s) e += 1440; if (s < b && e > a) return 'janela do ' + shift.name + ' (não produtivo)'; }
    return 'fora dos turnos do dia';
  }
  /* janelas do dia operacional sem turno, com os turnos produtivos vizinhos (podem ser do dia anterior ou do seguinte) */
  function janelas(db, date, lineId) {
    const off = opOff(db), T = turnosDoDia(db, date, lineId); const W = []; let cur = off;
    for (const x of T) { if (x.s > cur) W.push([cur, x.s]); cur = Math.max(cur, x.e); }
    if (cur < off + 1440) W.push([cur, off + 1440]);
    const P = T.filter(x => x.prod);
    const ant = () => { const L = turnosDoDia(db, U.addDays(date, -1), lineId).filter(x => x.prod); return L.length ? L[L.length - 1] : null; };
    const seg = () => { const L = turnosDoDia(db, U.addDays(date, 1), lineId).filter(x => x.prod); return L.length ? L[0] : null; };
    return W.filter(([a, b]) => b > a).map(([a, b]) => ({ a, b, prev: P.filter(x => x.e <= a).pop() || (a <= off ? ant() : null), next: P.find(x => x.s >= b) || (b >= off + 1440 ? seg() : null), rotulo: rotulo(db, date, lineId, a, b) }));
  }
  /* caixas "normais" do servidor entre A e B (minutos absolutos) */
  function caixas(db, lineId, A, B, date) {
    const S = SD(), byLot = S.orderByLot(db, lineId), out = [];
    for (const s of S.segsOf(db, lineId)) { if (S.tm(s.t1) < A - 1 || S.tm(s.t0) >= B) continue; if (S.lotKind(db, lineId, s.lot, byLot, date) !== 'normal') continue; for (const m of S.dec(s)) if (m >= A && m < B) out.push({ m, cat: s.cat, lot: s.lot }); }
    return out.sort((x, y) => x.m - y.m);
  }
  const pphDe = (db, date, code, lineId, machineId) => { const c = (db.catalogs || []).find(x => !x.deleted && String(x.code) === String(code) && Engine.catalogValid(x, date)) || (db.catalogs || []).find(x => !x.deleted && String(x.code) === String(code)); const rt = c ? Engine.resolveTarget(db, date, c.id, machineId || 'mac_line', lineId) : null; return rt && rt.pph ? rt.pph : (c && +c.pph) || 0; };
  /* trechos fora de turno do dia operacional "date", cada um com o turno que recebe */
  function doDia(db, date, lineId) {
    if (!vale(db, date) || !(db.server && (db.server.segments || []).length)) return [];
    const base = SD().dayStartMin(date), lim = limite(db), qty = +(db.settings || {}).serverBoxQty || 1000, out = [];
    for (const w of janelas(db, date, lineId)) {
      const A = base + w.a, B = base + w.b, bx = caixas(db, lineId, A - lim - 1, B + lim + 1, date); if (!bx.length) continue;
      const runs = []; let r = null; for (const x of bx) { if (!r || x.m - r[r.length - 1].m > lim) { r = []; runs.push(r); } r.push(x); }
      for (const run of runs) {
        const ins = run.filter(x => x.m >= A && x.m < B); if (!ins.length) continue;
        const contPrev = run[0].m < A && !!w.prev, contNext = run[run.length - 1].m >= B && !!w.next;
        const alvo = contPrev ? w.prev : (w.next || w.prev);
        const porCat = new Map(); for (const x of ins) porCat.set(x.cat, (porCat.get(x.cat) || 0) + 1);
        let pecas = 0, cap1h = 0; for (const [cat, n] of porCat) { const p = n * qty, pph = pphDe(db, date, cat, lineId); pecas += p; cap1h += pph ? p / pph : 0; }
        const t0 = ins[0].m - base, t1 = ins[ins.length - 1].m - base, planMin = Math.max(1, t1 - t0 + 1);
        const pphMed = cap1h > 0 ? pecas / cap1h : 0;   /* PPH ponderado pelos catálogos do trecho */
        out.push({ data: date, a: w.a, b: w.b, rotulo: w.rotulo, t0, t1, caixas: ins.length, pecas, goodMin: cap1h * 60, cats: [...porCat.keys()], planMin,
          oeeReal: pphMed > 0 ? pecas / (pphMed * planMin / 60) : null,
          alvo: alvo ? { date: alvo.date, code: alvo.code, name: alvo.name } : null,
          regra: !alvo ? 'sem turno produtivo para receber' : contPrev ? 'continua o ' + alvo.name + ' (sem parada na troca)' : contNext ? 'emenda com o ' + alvo.name : 'sem continuidade com o ' + (w.prev ? w.prev.name : 'turno anterior') + ' → ' + alvo.name });
      }
    }
    return out;
  }
  /* para o cálculo do dia: o que este dia recebe (de qualquer janela) e o que sai da janela dele */
  function paraDia(db, day) {
    if (!day || day.deleted) return null;
    const d0 = U.addDays(day.date, -1), d1 = U.addDays(day.date, 1);
    const todos = [...doDia(db, d0, day.lineId), ...doDia(db, day.date, day.lineId), ...doDia(db, d1, day.lineId)];
    const recebe = todos.filter(i => i.alvo && i.alvo.date === day.date), janela = todos.filter(i => i.data === day.date);
    return recebe.length || janela.length ? { recebe, janela, limite: limite(db), desde: desde(db) } : null;
  }
  /* aplica no cálculo do dia (chamado pelo computeDayRaw antes de fechar os resultados) */
  function aplicar(db, day, shiftRes, dayAgg) {
    let ft = null; try { ft = paraDia(db, day); } catch (e) { console.warn('ForaTurno', e); }
    if (!ft) return null;
    ft.realDia = Object.assign({}, dayAgg); ft.realTurnos = new Map(shiftRes.map(sr => [sr.ps.id, Object.assign({}, sr.agg)]));
    ft.semAlvo = [];
    for (const it of ft.recebe) {
      const sr = shiftRes.find(x => x.ps.snap.code === it.alvo.code && !x.off);
      if (!sr) { ft.semAlvo.push(it); continue; }
      sr.agg.good += it.pecas; sr.agg.goodMin += it.goodMin; dayAgg.good += it.pecas; dayAgg.goodMin += it.goodMin;
      sr.foraTurno = (sr.foraTurno || 0) + it.pecas;
    }
    ft.pecas = U.sum(ft.recebe.filter(i => !ft.semAlvo.includes(i)), i => i.pecas);
    return ft;
  }
  return { opOff, janelas, doDia, paraDia, aplicar, limite, vale, turnosDoDia, caixas };   /* 2.4.37: turnosDoDia e caixas para o OEE real e os cartões dos turnos (oee_real.js) */
})();

/* ---------- TUR-02 · habilitar / desabilitar um turno não produtivo no dia ---------- */
const TurnoNP = {
  /* turnos não produtivos do cadastro nesta data, que ainda não estão no dia */
  doDia(day) {
    const d = db(); if (!day) return [];
    const ja = new Set(day.shifts.filter(p => !p.deleted).map(p => p.shiftId));
    const hab = day.shifts.filter(p => !p.deleted && p.enabledNP);
    const L = Engine.activeShiftsAt(d, day.date, day.lineId, undefined, true).filter(x => x.v.productive === false && !ja.has(x.shift.id)).map(x => ({ shift: x.shift, v: x.v, on: false }));
    return L.concat(hab.map(p => ({ shift: (d.shifts || []).find(s => s.id === p.shiftId) || { id: p.shiftId, name: p.snap.name, code: p.snap.code }, v: { start: p.snap.start, end: p.snap.end }, on: true, ps: p })));
  },
  habilitar(dayId, shiftId, on) {
    Store.mutate((d, audit) => {
      const day = d.productionDays.find(x => x.id === dayId && !x.deleted); if (!day) throw new Error('Lançamento não encontrado.');
      if (day.status === 'fechado') throw new Error('O dia está fechado. Reabra para habilitar ou desabilitar um turno.');
      const by = Store.S.user || '—';
      if (on) {
        if (day.shifts.some(p => !p.deleted && p.shiftId === shiftId)) return;
        const tmp = Engine.buildDay(d, day.date, day.lineId, day.machineId, by, { only: shiftId });
        const ps = tmp.shifts[0]; if (!ps) throw new Error('Este turno não tem vigência ativa nesta data.');
        ps.enabledNP = true; day.shifts.push(ps); for (const ev of tmp.events) day.events.push(ev);
        audit({ action: 'edição', entity: 'turno', entityId: ps.id, field: 'habilitado no dia', before: 'não produtivo', after: 'produtivo neste dia', reason: 'TUR-02' });
      } else {
        const ps = day.shifts.find(p => !p.deleted && p.shiftId === shiftId && p.enabledNP); if (!ps) return;
        const temProd = ps.intervals.some(i => !i.deleted && +i.good > 0) || ps.scrap != null || (day.events || []).some(e => !e.deleted && !e.auto && (e.productionShiftId === ps.id || ps.intervals.some(i => e.intervalId === i.id) || (e.start != null && ps.intervals.some(i => !i.deleted && e.start < i.end && e.end > i.start))));
        if (temProd) throw new Error('Este turno já tem produção, scrap ou parada lançada no dia. Zere os lançamentos antes de desabilitar.');
        ps.deleted = true; for (const ev of day.events || []) if (ev.auto && ev.productionShiftId === ps.id) ev.deleted = true;
        audit({ action: 'edição', entity: 'turno', entityId: ps.id, field: 'habilitado no dia', before: 'produtivo neste dia', after: 'não produtivo', reason: 'TUR-02' });
      }
      day._rev = (day._rev || 0) + 1; day.updatedAt = U.nowIso(); day.updatedBy = by;
    });
  }
};

/* ---------- quadro do dia (Lançamento): habilitar turno, produção fora de turno, OEE reportado × real ---------- */
const ForaTurnoUI = {
  card(day, res) {
    const np = TurnoNP.doDia(day), ft = res.foraTurno, d = db();
    if (!np.length && !ft) return '';
    const pct = v => v == null ? '—' : U.pct(v);
    const linha = it => `<tr><td>${esc(it.rotulo)}${it.data !== day.date ? ` <span class="small muted">(${U.brDate(it.data)})</span>` : ''}</td><td class="mono">${U.hhmm(it.t0)}–${U.hhmm(it.t1)}</td><td class="n">${U.fmt(it.caixas)}</td><td class="n">${fq(it.pecas)}</td><td class="n">${pct(it.oeeReal)}</td><td>${it.alvo ? esc(it.alvo.name) + (it.alvo.date !== day.date ? ` <span class="small muted">${U.brDate(it.alvo.date)}</span>` : '') : '<span class="ferr">—</span>'}<br><span class="small muted">${esc(it.regra)}</span></td></tr>`;
    const itens = ft ? [...new Map([...ft.janela, ...ft.recebe].map(i => [i.data + '|' + i.t0 + '|' + i.t1, i])).values()].sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : a.t0 - b.t0) : [];
    const real = ft && ft.realDia ? Engine.finalize(ft.realDia, d.settings) : null, rep = res.r;
    const peso = ft && rep.good > 0 ? ft.pecas / rep.good : null;
    const lk = day.status === 'fechado';
    return `<section class="card section" id="ftCard"><header><h3>Turnos não produtivos e produção fora de turno ${ib('foraTurno')}</h3></header>
      ${np.length ? `<div class="row" style="gap:6px 14px;flex-wrap:wrap">${np.map(x => `<label class="chk"><input type="checkbox" data-turnonp="${esc(x.shift.id)}" ${x.on ? 'checked' : ''} ${lk ? 'disabled' : ''}> Habilitar ${esc(x.shift.name)} neste dia <span class="small muted">${esc(x.v.start || '')}–${esc(U.hhmm(U.toMin(x.v.end)))}</span></label>`).join('')}</div>
        <p class="small muted" style="margin:4px 0 8px">Turno cadastrado como não produtivo no Portal. Habilitado, ele entra neste dia como produtivo: o tempo dele vira planejado e a produção da janela conta nele. Só vale para este dia.</p>` : ''}
      ${itens.length ? `<p class="small muted" style="margin:0 0 6px">OEE reportado, OEE real e Fora de turno estão na faixa de indicadores do topo (2.4.37).</p>
        <div class="tw"><table><thead><tr><th>Janela</th><th>Caixas (1ª–última)</th><th class="n">Caixas</th><th class="n">Produção (${esc(unitLbl())})</th><th class="n">OEE do trecho ${ib('foraTurnoOee')}</th><th>Contou em</th></tr></thead><tbody>${itens.map(linha).join('')}</tbody></table></div>
        ${ft.semAlvo && ft.semAlvo.length ? `<p class="small ferr">${ft.semAlvo.length} trecho(s) sem turno lançado para receber neste dia: crie o lançamento do turno ou habilite o turno.</p>` : ''}
        <p class="small muted">O registro de cada caixa continua na hora real. Regra: trecho emendado com o fim do turno anterior (sem parada maior que ${U.fmt(ft.limite)} min) conta nele; sem continuidade, conta no próximo turno produtivo. Vale desde ${U.brDate(ft.desde)}.</p>` : (np.length ? '' : '')}
    </section>`;
  },
  mount(root, day) {
    root.querySelectorAll('[data-turnonp]').forEach(c => c.onchange = () => run(() => TurnoNP.habilitar(day.id, c.dataset.turnonp, c.checked), c.checked ? 'Turno habilitado neste dia.' : 'Turno voltou a não produtivo neste dia.').then(() => render()).catch(() => render()));
  }
};
HELP.foraTurno = ['Turno não produtivo e produção fora de turno', [['O que é turno não produtivo?', 'Turno que existe no cadastro, mas cuja produção não conta para ele mesmo (Portal › Turnos › vigência "Turno não produtivo"). Ele não entra no dia nem no plano.'], ['E a produção feita nessa janela?', 'As caixas do servidor (MES) continuam gravadas na hora real. Para apuração, cada trecho contínuo vai para um turno produtivo: se emenda com o fim do turno anterior (a linha não parou na troca), conta nele; senão, conta no próximo turno produtivo (ex.: madrugada → turno A do dia seguinte).'], ['Habilitar no dia', 'Torna o turno produtivo só naquele dia: o tempo dele vira planejado e a produção conta nele.'], ['OEE reportado × real', 'Reportado = com a reatribuição (o oficial; a Performance pode passar de 100%). Real = pelo horário real, sem essa produção; o OEE real do trecho usa como tempo planejado da 1ª à última caixa.']]];
HELP.foraTurnoOee = ['OEE real do trecho', [['Como é calculado?', 'Produção do trecho ÷ (PPH do catálogo × tempo da 1ª à última caixa). Mostra o quanto a linha rendeu enquanto produziu fora do turno.']]];
