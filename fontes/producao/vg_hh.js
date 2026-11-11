/* ===== Produção 2.4.38 · Visão Geral e Hora a hora (pedido do usuário, 10/11/2026) =====
   Hora a hora:
     - o turno não produtivo do dia (ex.: C) entra no seletor de turno e ganha a grade dele, SÓ LEITURA, por hora, com as caixas do MES
       (catálogo, lote, caixas, produção, acumulado, 1ª–última caixa). Aparece mesmo sem caixas;
     - cada turno (produtivo ou não) recolhe e expande pela linha do turno (lembrado neste computador, App.prefs.hhFold, pelo código);
     - o gráfico "Atendimento hora a hora" mostra todas as horas registradas (rótulo em cada coluna) e as horas do turno não produtivo
       que tiveram caixas (sem meta).
   Visão Geral (padrão): os mesmos cartões do Lançamento somados no período (com "Editar cards", mesma preferência), mais
     Atendimento ao plano e Confiabilidade; cada bloco recolhe e expande (App.prefs.vgFold, pelo título).
   Cartão "Caixas do MES": 1ª e última caixa do dia (ou do período), caixas e trocas de lote com o tempo total de troca.
   Entra no script principal pelo build.py (antes do boot). */
const MesDia = {
  /* caixas do dia operacional (06:00 a 06:00) e trocas com a 1ª caixa do novo lote no dia */
  dia(d, day) {
    const S = ServerData; if (!day || !(d.server && (d.server.segments || []).length)) return null;
    let off = 360; try { off = ForaTurno.opOff(d); } catch (e) { }
    const base = S.dayStartMin(day.date), A0 = base + off, B0 = A0 + 1440;
    let bx = []; try { bx = ForaTurno.caixas(d, day.lineId, A0, B0, day.date); } catch (e) { return null; }
    let ch = []; try { ch = S.changes(d, day.lineId).filter(c => { const f = S.tm(c.first); return f >= A0 && f < B0; }); } catch (e) { }
    return { date: day.date, base, n: bx.length, m0: bx.length ? bx[0].m : null, m1: bx.length ? bx[bx.length - 1].m : null, trocas: ch.length, trocaMin: U.sum(ch, c => c.min || 0) };
  },
  periodo(days) {
    const d = db(), L = (days || []).filter(x => x && !x.deleted).map(x => this.dia(d, x)).filter(x => x && x.n);
    if (!L.length) return null; L.sort((a, b) => a.m0 - b.m0);
    return { n: U.sum(L, x => x.n), primeiro: L[0], ultimo: L.reduce((a, b) => (b.m1 > a.m1 ? b : a)), trocas: U.sum(L, x => x.trocas), trocaMin: U.sum(L, x => x.trocaMin), dias: L.length };
  },
  hh(m, base) { return OeeReal.hhmm(m, base); },
  kpiDia(day) {
    const x = this.dia(db(), day);
    if (!x) return kpi('Caixas do MES', '—', '', 'sem dados do servidor (MES) importados');
    if (!x.n) return kpi('Caixas do MES', '—', '', 'nenhuma caixa no dia');
    return kpi('Caixas do MES', `<span class="kv-sm">${this.hh(x.m0, x.base)} – ${this.hh(x.m1, x.base)}</span>`, '', `1ª e última caixa do dia de trabalho · ${U.fmt(x.n)} cx${x.fora ? ` (${U.fmt(x.fora)} fora do turno)` : ''}${x.trocas ? ` · ${x.trocas} troca(s) · ${OeeReal.dur(x.trocaMin)}` : ' · sem troca de lote'}`);
  },
  kpiPeriodo(days) {
    const p = this.periodo(days);
    if (!p) return kpi('Caixas do MES', '—', '', 'sem caixas do servidor (MES) no período');
    const dm = x => U.brDate(x.date).slice(0, 5);
    const val = p.dias === 1 ? `${this.hh(p.primeiro.m0, p.primeiro.base)} – ${this.hh(p.ultimo.m1, p.ultimo.base)}` : `${this.hh(p.primeiro.m0, p.primeiro.base)} – ${this.hh(p.ultimo.m1, p.ultimo.base)}`;
    return kpi('Caixas do MES', `<span class="kv-sm">${val}</span>`, '', `${p.dias === 1 ? '1ª e última caixa' : `1ª em ${dm(p.primeiro)} · última em ${dm(p.ultimo)}`} · ${U.fmt(p.n)} cx${p.trocas ? ` · ${p.trocas} troca(s) · ${OeeReal.dur(p.trocaMin)}` : ''}`);
  }
};
/* ---------- Hora a hora: turno não produtivo e recolher turnos ---------- */
Object.assign(HHPs, {
  /* turnos não produtivos do dia (não habilitados), com a janela em minutos do dia */
  nps(day) {
    let L = []; try { L = TurnoNP.doDia(day).filter(x => !x.on); } catch (e) { return []; }
    return L.map(x => { let a = U.toMin(x.v.start), b = U.toMin(x.v.end); if (a == null || b == null) return null; if (b <= a) b += 1440; return { id: 'np:' + x.shift.id, code: x.shift.code || x.shift.id, name: x.shift.name, a, b }; }).filter(Boolean);
  },
  id(day) {
    const s = this.sel; if (!s || !day || s.date !== day.date) return null;
    if (String(s.id).startsWith('np:')) return this.nps(day).some(w => w.id === s.id) ? s.id : null;
    return (day.shifts || []).some(p => p.id === s.id && !p.deleted) ? s.id : null;
  },
  mostra(day, ps) { const i = this.id(day); return !i || ps.id === i; },
  fold() { const F = App.prefs.hhFold; return F && typeof F === 'object' ? F : (App.prefs.hhFold = {}); },
  dobrado(code) { return !!this.fold()[code]; },
  seta(code) { return `<span class="hh-seta" aria-hidden="true">${this.dobrado(code) ? '▸' : '▾'}</span>`; },
  /* grade por hora do turno não produtivo (só leitura) */
  npGrade(day, w) {
    const d = db(), S = ServerData, base = S.dayStartMin(day.date), qty = +(d.settings || {}).serverBoxQty || 1000;
    let bx = []; try { bx = ForaTurno.caixas(d, day.lineId, base + w.a, base + w.b, day.date); } catch (e) { }
    const L = []; let t = w.a; while (t < w.b) { const n = Math.min(w.b, Math.floor(t / 60) * 60 + 60); L.push([t, n]); t = n; }
    let acc = 0;
    const rows = L.map(([x, y]) => { const B = bx.filter(c => c.m >= base + x && c.m < base + y); acc += B.length * qty;
      const cats = [...new Set(B.map(c => c.cat))], lots = [...new Set(B.map(c => c.lot))];
      return { x, y, n: B.length, pecas: B.length * qty, acc, cats, lots, m0: B.length ? B[0].m : null, m1: B.length ? B[B.length - 1].m : null }; });
    return { base, rows, n: bx.length, pecas: bx.length * qty };
  },
  npHtml(day, res) {
    const sel = this.id(day), W = this.nps(day).filter(w => !sel || sel === w.id); if (!W.length) return '';
    const ft = res && res.foraTurno, alvo = w => { const J = ft ? (ft.janela || []).filter(i => i.data === day.date && i.a === w.a) : []; const N = [...new Set(J.map(i => i.alvo ? i.alvo.name + (i.alvo.date !== day.date ? ' de ' + U.brDate(i.alvo.date) : '') : 'sem turno para receber'))]; return N.join(' · '); };
    return W.map(w => {
      const g = this.npGrade(day, w), dob = this.dobrado(w.code), cat = c => { const k = (db().catalogs || []).find(z => String(z.code) === String(c)); return k ? catName(k.id) : c; };
      return `<section class="card section hh-np" data-hhnp="${esc(w.code)}"><header style="cursor:pointer" title="Recolher / expandir"><h3>${this.seta(w.code)} ${esc(w.name)} <span class="muted small">${U.hhmm(w.a)}–${U.hhmm(w.b)}</span></h3><span class="pill none" title="Turno não produtivo: só leitura; a produção desta janela conta no turno indicado (OEE reportado)">não produtivo · só leitura</span>
        <span class="small muted">${U.fmt(g.n)} caixa(s) · ${fq(g.pecas)} ${esc(unitLbl())}${g.n ? ' · contou em ' + esc(alvo(w) || '—') : ''}</span>${ib('hhNP')}</header>
        <div class="tw" ${dob ? 'hidden' : ''}><table class="hh"><thead><tr><th>Intervalo</th><th class="n">Min</th><th>Catálogo</th><th>Lote</th><th class="n">Caixas</th><th class="n">Produção</th><th class="n">Acumulado</th><th>1ª – última caixa</th></tr></thead><tbody>
        ${g.rows.map(r => `<tr${r.n ? '' : ' class="muted"'}><td class="ivt">${U.range(r.x, r.y)}</td><td class="n">${r.y - r.x}</td><td>${esc(r.cats.map(cat).join(', ') || '—')}</td><td class="mono">${esc(r.lots.join(', ') || '—')}</td><td class="n">${r.n || ''}</td><td class="n">${r.n ? fq(r.pecas) : ''}</td><td class="n">${r.acc ? fq(r.acc) : ''}</td><td class="mono">${r.n ? OeeReal.hhmm(r.m0, g.base) + ' – ' + OeeReal.hhmm(r.m1, g.base) : ''}</td></tr>`).join('')}
        </tbody></table></div></section>`;
    }).join('');
  },
  barra(day, res) {
    const L = res.shifts.map(sr => sr.ps).filter(ps => !ps.summary), N = this.nps(day); if (L.length + N.length < 2) return '';
    const i = this.id(day), ch = (id, txt, on) => `<button type="button" data-hhsel="${esc(id)}" aria-pressed="${on}">${txt}</button>`;
    const nCx = w => { try { return this.npGrade(day, w).n; } catch (e) { return 0; } };
    return `<div class="row" style="margin:-4px 0 10px"><span class="small muted">Turno ${ib('hhTurno')}</span><div class="seg">${ch('', 'Todos', !i)}${L.map(ps => { const [f, n] = this.fill(ps); return ch(ps.id, `${esc(ps.snap.name)} <span class="small muted">${f}/${n}</span>`, i === ps.id); }).join('')}${N.map(w => ch(w.id, `${esc(w.name)} <span class="small muted">não produtivo · ${nCx(w)} cx</span>`, i === w.id)).join('')}</div></div>`;
  },
  /* gráfico: rótulo em todas as colunas e as horas do turno não produtivo com caixas */
  chart(o, day, res) {
    o.allLabels = true;
    try {
      for (const w of this.nps(day)) for (const r of this.npGrade(day, w).rows.filter(r => r.n)) {
        o.x.push(U.hhmm(r.x)); if (o.xFull) o.xFull.push(`${U.range(r.x, r.y)} · ${w.name} (não produtivo)`);
        (o.bars || []).forEach((b, k) => { b.values.push(k === 0 ? r.pecas : null); if (b.meta) b.meta.push(null); });
        (o.lines || []).forEach(l => l.values.push(null));
        if (o.mark) o.mark.push([]);
      }
      const tr = o.tipRows, n0 = res.flat.length; if (tr) o.tipRows = i => i < n0 ? tr(i) : [['Turno não produtivo', 'só leitura · conta no turno que recebe']];
    } catch (e) { console.warn('HHPs.chart', e); }
    return o;
  },
  ligarDobra(root) {
    if (this.sel && String(this.sel.id).startsWith('np:')) { const t = root.querySelector('table.hh tr.total'); if (t && t.closest('.tw')) t.closest('.tw').hidden = true; }   /* só o turno não produtivo escolhido */
    root.querySelectorAll('tr[data-hhgrp]').forEach(tr => tr.onclick = e => { if (e.target.closest('input,select,button,a')) return; const c = tr.dataset.hhgrp, F = this.fold(); F[c] = !F[c]; if (!F[c]) delete F[c]; savePrefs();
      root.querySelectorAll(`tr[data-hhg="${CSS.escape(c)}"]`).forEach(r => { r.hidden = !!F[c]; }); const s = tr.querySelector('.hh-seta'); if (s) s.textContent = F[c] ? '▸' : '▾'; });
    root.querySelectorAll('section.hh-np > header').forEach(h => h.onclick = e => { if (e.target.closest('.ib,button,a')) return; const c = h.parentElement.dataset.hhnp, F = this.fold(); F[c] = !F[c]; if (!F[c]) delete F[c]; savePrefs();
      const t = h.parentElement.querySelector('.tw'); if (t) t.hidden = !!F[c]; const s = h.querySelector('.hh-seta'); if (s) s.textContent = F[c] ? '▸' : '▾'; });
  }
});
/* ---------- Visão Geral: os cartões do Lançamento no período ---------- */
const VGC = {
  html(days, pdays, r, pr, ser, bOee, wOee, bG, wG, rel) {
    const d = db(), oe = OeeReal.periodo(days), op = pdays && pdays.length ? OeeReal.periodo(pdays) : null;
    let ult = null, meta = 0, nMeta = 0;
    for (const day of [...days].sort((a, b) => a.date < b.date ? -1 : 1)) { let res; try { res = Engine.computeDay(d, day); } catch (e) { continue; }
      if (res.officialDaily != null) { meta += res.officialDaily; nMeta++; } const f = res.flat.filter(x => x.cat && x.good).pop(); if (f) ult = f.cat; }
    const cat = `<div class="kpi kpi-cat">${kpiDeco('catálogo').icon}<span class="l">Último catálogo do período${ib('initialCatalog')}</span><span class="v">${ult ? catPill(ult, true) : '—'}</span><span class="s">o último que produziu no período</span></div>`;
    const inner = `<div class="kpis">${cat}
      ${A.kpiCmp('Produção boa', r.good, v => fq(v), { unit: unitLbl(), meta: r.metaOp, semState: r.semAttain, prev: pr && pr.good, series: ser('good'), best: bG, worst: wG })}
      ${A.kpiCmp('OEE realizado', r.oee, v => U.pct(v), { pct: true, meta: r.oeeTarget, semState: r.semOee, prev: pr && pr.oee, series: ser('oee'), best: bOee, worst: wOee, sub: r.oeeGap == null ? '' : `${U.pp(r.oeeGap)} contra a meta` })}
      ${A.kpiCmp('Disponibilidade', r.D, v => U.pct(v), { pct: true, prev: pr && pr.D, series: ser('D'), sub: `${U.fmt(r.aMin)} min de parada` })}
      ${A.kpiCmp('Performance', r.P, v => U.pct(v), { pct: true, prev: pr && pr.P, series: ser('P'), sub: r.perfAlert ? semB('warn', 'acima de 100%') : 'calculada: OEE ÷ (D × Q)' })}
      ${A.kpiCmp('Qualidade', r.Q, v => U.pct(v, 2), { pct: true, prev: pr && pr.Q, series: ser('Q'), sub: `scrap ${U.fmt(r.scrap)} un · ${U.pct(r.scrapPct, 2)}` })}
      ${A.kpiCmp('Capacidade planejada', r.cap, v => fq(v), { unit: unitLbl(), prev: pr && pr.cap, sub: `${U.fmt(r.netMin)} min líquidos` })}
      ${A.kpiCmp('Meta oficial do período', nMeta ? meta : null, v => fq(v), { unit: unitLbl(), sub: `soma das metas diárias oficiais de ${nMeta} dia(s)` })}
      ${A.kpiCmp('OEE reportado', oe.rep, v => U.pct(v), { pct: true, prev: op && op.rep, sub: oe.fora ? 'oficial: produção fora de turno somada ao turno que a recebe' : 'oficial · sem produção fora de turno' })}
      ${A.kpiCmp('OEE real', oe.real, v => U.pct(v), { pct: true, prev: op && op.real, sub: oe.extraMin ? `+${U.fmt(oe.extraMin)} min fora do turno no tempo planejado` : 'igual ao reportado no período' })}
      ${A.kpiCmp('Fora de turno', oe.fora, v => fq(v), { unit: unitLbl(), prev: op && op.fora, higher: false, sub: oe.foraPct != null ? `${U.pct(oe.foraPct, 1)} da produção boa reportada` : '' })}
      ${MesDia.kpiPeriodo(days)}
      ${A.kpiCmp('Atendimento ao plano', r.attain, v => U.pct(v), { pct: true, prev: pr && pr.attain, series: ser('attain'), sub: `${fq(r.good)} de ${fq(r.metaOp)} ${esc(unitLbl())} ${semB(r.semAttain, '')}` })}
      ${A.kpiCmp('Confiabilidade do OEE', 1, () => rel.level, { semState: rel.sem, sub: esc(rel.txt), click: 'rel' })}</div>`;
    return `<section class="card section vg-ind"><header><h3>Indicadores do período</h3><span class="spacer"></span><button class="btn xs" id="kcEditVg" title="Liga e desliga os indicadores (vale neste computador; a mesma escolha do Lançamento)">Editar cards</button></header>${KC.filtrar(inner)}</section>`;
  }
};
/* ---------- recolher e expandir os blocos da Visão Geral ---------- */
const Dobra = {
  F() { const F = App.prefs.vgFold; return F && typeof F === 'object' ? F : (App.prefs.vgFold = {}); },
  ligar(root) {
    root.querySelectorAll('section.card > header').forEach(h => {
      const sec = h.parentElement, t = (h.querySelector('h3,h2') || {}).textContent; if (!t || h.querySelector('.dobra')) return;
      const k = t.replace(/[▾▸]/g, '').trim().slice(0, 80), F = this.F();
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn xs ghost dobra'; b.title = 'Recolher / expandir este bloco'; b.setAttribute('aria-expanded', F[k] ? 'false' : 'true'); b.textContent = F[k] ? '▸' : '▾';
      h.insertBefore(b, h.firstChild); if (F[k]) sec.classList.add('dobrado');
      b.onclick = e => { e.stopPropagation(); const G = this.F(); G[k] = !G[k]; if (!G[k]) delete G[k]; savePrefs(); sec.classList.toggle('dobrado', !!G[k]); b.textContent = G[k] ? '▸' : '▾'; b.setAttribute('aria-expanded', G[k] ? 'false' : 'true'); };
    });
  }
};
(() => {
  const st = document.createElement('style');
  st.textContent = 'section.card.dobrado>:not(header){display:none!important}section.card>header .dobra{margin-right:6px;min-width:26px}tr.grp[data-hhgrp]{cursor:pointer}.hh-seta{display:inline-block;width:14px;color:var(--muted)}section.hh-np header{flex-wrap:wrap;gap:8px}.kpi .v .kv-sm{font-size:.62em;white-space:nowrap}[data-hhsel][aria-pressed=true] .muted{color:inherit;opacity:.85}';
  document.head.appendChild(st);
  const O = App.views.overview;
  App.views.overview = { render() { return O.render(); }, mount(root) { if (O.mount) O.mount(root); Dobra.ligar(root); const k = root.querySelector('#kcEditVg'); if (k) k.onclick = () => KC.editar(); } };
})();
Object.assign(HELP, {
  caixasDia: ['Caixas do MES', [['O que é?', 'Hora da 1ª e da última caixa do servidor (MES) no dia operacional (06:00 a 06:00), quantas caixas passaram e as trocas de lote com o tempo total de troca. No período, a 1ª caixa do primeiro dia e a última do último.'], ['Exemplo', '06:04 – 23:40 · 1.058 cx · 2 troca(s) · 1h05.']]],
  hhNP: ['Turno não produtivo no hora a hora', [['O que é?', 'A janela de um turno marcado como não produtivo no Portal, por hora, com as caixas do MES. É só leitura: a produção desta janela conta no turno indicado (anterior, se emendou; senão, o seguinte) e entra no OEE reportado dele.'], ['Quero lançar nele', 'Use "Habilitar turno" no Lançamento: o turno vira produtivo só naquele dia.']]]
});
Object.assign(KPI_HELP, { 'Caixas do MES': 'caixasDia', 'Meta oficial do período': 'metaDaily', 'Último catálogo do período': 'initialCatalog' });
