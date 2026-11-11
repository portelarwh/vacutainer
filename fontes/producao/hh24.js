/* ===== Produção 2.4.52 · Hora a hora com as 24 h e Ordens sem MB51 (pedido do usuário, 11/11/2026) =====
   1) Hora a hora · produção fora do turno no turno que a recebe: a produção do MES fora dos turnos do dia (ex.: a linha começou às 04:00
      e só os turnos A e B são produtivos) já conta no turno que a recebe (ForaTurno, OEE reportado), mas não aparecia nas linhas dele.
      Agora o turno mostra essas horas, só leitura, antes (ou depois) das linhas dele: horário, catálogo, lote, caixas e produção.
   2) Hora a hora · "Dia (24 h)": o dia de produção inteiro (do início do 1º turno até o mesmo horário do dia seguinte), hora por hora:
      turno (ou "não produtivo"/"sem turno" e em qual turno conta), meta, produção apontada, caixas e produção do MES. As horas recebidas
      de antes do início do dia (ex.: 04:00–06:00, que contam no turno A) aparecem no topo. Só leitura: a produção continua sendo lançada
      na grade do turno.
   3) Ordens › Ordens produzidas sem MB51: em vez de "nada importado", mostra os lotes produzidos no período (MES), com a ordem do
      plano do mês e a situação "não conciliado" (sem MB51) ou "sem ordem no plano". Com MB51, a lista do MB51 continua igual e os lotes
      do MES que ainda não estão no MB51 aparecem embaixo, também como "não conciliado".
   Nenhum cálculo muda: os números vêm de ForaTurno (turnos_np.js), do resultado do dia (Engine.computeDay) e dos lotes (App.views.lots).
   Entra no script principal pelo build.py (antes do boot). */
Object.assign(HHPs, {
  /* turno escolhido: '' (todos), o id de um turno, 'np:<turno>' (não produtivo) ou 'dia' (24 h) */
  id(day) {
    const s = this.sel; if (!s || !day || s.date !== day.date) return null;
    if (s.id === 'dia') return 'dia';
    if (String(s.id).startsWith('np:')) return this.nps(day).some(w => w.id === s.id) ? s.id : null;
    return (day.shifts || []).some(p => p.id === s.id && !p.deleted) ? s.id : null;
  },
  mostra(day, ps) { const i = this.id(day); return !i || ps.id === i; },
  barra(day, res) {
    const L = res.shifts.map(sr => sr.ps).filter(ps => !ps.summary), N = this.nps(day); if (!L.length) return '';
    const i = this.id(day), ch = (id, txt, on, t) => `<button type="button" data-hhsel="${esc(id)}" aria-pressed="${on}"${t ? ` title="${esc(t)}"` : ''}>${txt}</button>`;
    const nCx = w => { try { return this.npGrade(day, w).n; } catch (e) { return 0; } };
    return `<div class="row" style="margin:-4px 0 10px"><span class="small muted">Turno ${ib('hhTurno')}</span><div class="seg">${ch('', 'Todos', !i)}${L.map(ps => { const [f, n] = this.fill(ps); return ch(ps.id, `${esc(ps.snap.name)} <span class="small muted">${f}/${n}</span>`, i === ps.id); }).join('')}${N.map(w => ch(w.id, `${esc(w.name)} <span class="small muted">não produtivo · ${nCx(w)} cx</span>`, i === w.id)).join('')}${ch('dia', 'Dia (24 h)', i === 'dia', 'O dia de produção inteiro, hora por hora (todos os turnos e as horas sem turno)')}</div></div>`;
  },
  hm(x) { x = ((Math.round(x) % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); },
  /* caixas de um trecho fora de turno, por hora do relógio, em minutos relativos ao dia "day" */
  porHora(day, it) {
    const d = db(), S = ServerData, b0 = S.dayStartMin(it.data), bD = S.dayStartMin(day.date), qty = +(d.settings || {}).serverBoxQty || 1000;
    let bx = []; try { bx = ForaTurno.caixas(d, day.lineId, b0 + it.t0, b0 + it.t1 + 1, it.data); } catch (e) { return []; }
    const H = new Map();
    for (const c of bx) { const r = c.m - bD, h = Math.floor(r / 60) * 60; if (!H.has(h)) H.set(h, []); H.get(h).push({ ...c, r }); }
    return [...H.entries()].sort((a, b) => a[0] - b[0]).map(([h, L]) => ({ h, n: L.length, pecas: L.length * qty, r0: L[0].r, r1: L[L.length - 1].r, cats: [...new Set(L.map(c => c.cat))], lots: [...new Set(L.map(c => c.lot))] }));
  },
  catTxt(c) { const k = (db().catalogs || []).find(z => String(z.code) === String(c)); return k ? catName(k.id) : String(c); },
  /* linhas "fora do turno" do turno ps (só leitura), antes e depois das linhas dele */
  fora(day, res, ps) {
    const out = { antes: '', depois: '', pecas: 0 }, ft = res && res.foraTurno; if (!ft || !ft.recebe) return out;
    const its = ft.recebe.filter(i => i.alvo && i.alvo.date === day.date && i.alvo.code === ps.snap.code && !(ft.semAlvo || []).includes(i)); if (!its.length) return out;
    const showM = App.prefs.showMetaCols, g = esc(ps.snap.code || ps.id), dob = this.dobrado(ps.snap.code || ps.id), ini = U.toMin(ps.snap.start);
    for (const it of its) for (const r of this.porHora(day, it)) {
      out.pecas += r.pecas;
      const dh = U.addDays(day.date, Math.floor(r.h / 1440)), outro = dh !== day.date ? ` <span class="small muted">(${U.brDate(dh).slice(0, 5)})</span>` : '';   /* data só quando a hora é de outro dia */
      const tr = `<tr class="hh-fora" data-hhg="${g}"${dob ? ' hidden' : ''} title="Produção do MES fora do horário do turno: conta neste turno (OEE reportado). Só leitura.">
        <td class="ivt">${this.hm(r.h)}–${this.hm(r.h + 60)}${outro} <span class="flag on">fora do turno</span></td><td class="n">${r.r1 - r.r0 + 1}</td><td>${esc(r.cats.map(c => this.catTxt(c)).join(', '))}</td>
        ${showM ? '<td></td><td></td><td></td><td></td>' : ''}<td class="n muted">—</td><td class="n"><b>${fq(r.pecas)}</b></td>
        <td colspan="7" class="small muted">MES: ${U.fmt(r.n)} cx · lote ${esc(r.lots.join(', '))} · ${this.hm(r.r0)}–${this.hm(r.r1)} · ${esc(it.regra || '')} · conta neste turno</td></tr>`;
      if (r.h < ini) out.antes += tr; else out.depois += tr;
    }
    return out;
  },
  /* ---------- Dia (24 h) ----------
     2.4.54 (pedido do usuário): "são as 24 h das 00 às 24 h". Janela = dia do calendário (00:00–24:00) quando nenhum turno produtivo
     passa da meia-noite (1 ou 2 turnos); com o 3º turno produtivo atravessando a meia-noite, a janela é a do dia de produção
     (início do 1º turno → mesmo horário do dia seguinte). Horas sem turno dizem em qual turno a produção conta (ForaTurno). */
  dia24Dados(day, res) {
    const d = db(), S = ServerData, base = S.dayStartMin(day.date), qty = +(d.settings || {}).serverBoxQty || 1000;
    let off = 360; try { off = ForaTurno.opOff(d); } catch (e) { }
    const temMes = !!(d.server && (d.server.segments || []).some(s => s.lineId === day.lineId));
    const turnos = res.shifts.filter(sr => !sr.ps.summary).map(sr => { const iv = sr.ps.intervals.filter(i => !i.deleted); let a = iv.length ? Math.min(...iv.map(i => i.start)) : U.toMin(sr.ps.snap.start), b = iv.length ? Math.max(...iv.map(i => i.end)) : U.toMin(sr.ps.snap.end); if (b <= a) b += 1440; return { ps: sr.ps, a, b, off: !!sr.ps.off }; });
    const fim = Math.max(0, ...turnos.filter(t => !t.off).map(t => t.b)), w0 = fim <= 1440 ? 0 : off, w1 = w0 + 1440, cal = w0 === 0;
    const nps = this.nps(day), npAt = m => nps.find(x => m >= x.a && m < x.b) || nps.find(x => m + 1440 >= x.a && m + 1440 < x.b);
    /* trechos fora de turno (do dia anterior, deste e do seguinte) em minutos absolutos, com o turno que recebe */
    let itens = []; try { itens = [-1, 0, 1].flatMap(k => { const dt = U.addDays(day.date, k), b0 = S.dayStartMin(dt); return ForaTurno.doDia(d, dt, day.lineId).map(i => ({ A: b0 + i.t0, Z: b0 + i.t1, alvo: i.alvo })); }); } catch (e) { }
    const contaEm = (A, B) => { const j = itens.find(i => i.A < B && i.Z >= A); if (!j) return ''; return j.alvo ? j.alvo.name + (j.alvo.date !== day.date ? ' de ' + U.brDate(j.alvo.date).slice(0, 5) : '') : 'sem turno para receber'; };
    const H = []; for (let h = w0; h < w1; h += 60) {
      const m = h + 30, t = turnos.find(x => m >= x.a && m < x.b), w = !t && npAt(m);
      let meta = 0, apont = 0, temAp = false;
      for (const f of res.flat) { const a = Math.max(f.iv.start, h), b = Math.min(f.iv.end, h + 60); if (b <= a || !f.min) continue; const k = (b - a) / f.min; meta += (f.metaOp || 0) * k; if (f.good != null) { apont += f.good * k; temAp = true; } }
      let n = 0; if (temMes) { try { n = ForaTurno.caixas(d, day.lineId, base + h, base + h + 60, day.date).length; } catch (e) { } }
      H.push({ h, turno: t ? t.ps.snap.name + (t.off ? ' (sem produção)' : '') : w ? w.name + ' (não produtivo)' : 'sem turno', dentro: !!t, cor: t ? t.ps.snap.color : null, meta: t ? meta : null, apont: temAp ? apont : null, n, mes: n * qty, conta: !t && n ? contaEm(base + h, base + h + 60) : '' });
    }
    /* produção que conta neste dia mas cai fora da janela (raro: ex. 3º turno emendado depois do fim da janela) */
    const ft = res.foraTurno, R = [];
    for (const it of (ft && ft.recebe) || []) { if (!it.alvo || it.alvo.date !== day.date) continue; for (const r of this.porHora(day, it)) if (r.h < w0 || r.h >= w1) R.push({ ...r, conta: it.alvo.name }); }
    return { off, w0, w1, cal, H, R, temMes, qty };
  },
  dia24(day, res) {
    const D = this.dia24Dados(day, res), sem = D.temMes ? '' : '<span class="muted small">sem MES</span>';
    const tot = { meta: U.sum(D.H, x => x.meta || 0), apont: U.sum(D.H, x => x.apont || 0), n: U.sum(D.H, x => x.n), fora: U.sum(D.H.filter(x => !x.dentro), x => x.mes) };
    const row = x => `<tr class="${x.dentro ? '' : 'hh-fora'}"><td class="ivt">${this.hm(x.h)}–${this.hm(x.h + 60)}</td><td>${x.cor ? `<span class="swatch" style="background:${esc(x.cor)}"></span> ` : ''}${esc(x.turno)}</td>
      <td class="n">${x.meta == null ? '<span class="muted">—</span>' : fq(x.meta)}</td><td class="n">${x.apont == null ? '' : fq(x.apont)}</td>
      <td class="n">${D.temMes ? (x.n ? U.fmt(x.n) : '') : ''}</td><td class="n">${D.temMes ? (x.n ? fq(x.mes) : '') : sem}</td>
      <td class="small">${x.conta ? `conta no ${esc(x.conta)}` : ''}</td></tr>`;
    const janela = D.cal ? `00:00 às 24:00 de ${U.brDate(day.date).slice(0, 5)}` : `${this.hm(D.w0)} de ${U.brDate(day.date).slice(0, 5)} às ${this.hm(D.w1)} de ${U.brDate(U.addDays(day.date, 1)).slice(0, 5)} (3º turno passa da meia-noite)`;
    const rec = D.R.length ? `<tr class="grp"><td colspan="7">Fora desta janela, mas conta neste dia</td></tr>` + D.R.map(r => `<tr class="hh-fora"><td class="ivt">${this.hm(r.h)}–${this.hm(r.h + 60)}</td><td class="small">fora dos turnos</td><td class="n"><span class="muted">—</span></td><td class="n"></td><td class="n">${U.fmt(r.n)}</td><td class="n">${fq(r.pecas)}</td><td class="small">conta no ${esc(r.conta)} · lote ${esc(r.lots.join(', '))}</td></tr>`).join('') : '';
    const ch = Charts.combo({ x: D.H.map(x => this.hm(x.h)), xFull: D.H.map(x => `${this.hm(x.h)}–${this.hm(x.h + 60)} · ${x.turno}`), xName: 'Hora', allLabels: true, unit: qUn,
      bars: [{ name: 'Produção apontada', values: D.H.map(x => x.apont), color: 'var(--s1)', meta: D.H.map(x => x.meta) }],
      lines: [{ name: 'Meta da hora', values: D.H.map(x => x.meta), color: 'var(--ink)', dash: true, dots: false }].concat(D.temMes ? [{ name: 'Produção do MES (caixas)', values: D.H.map(x => x.n ? x.mes : null), color: 'var(--s2)', width: 1.5 }] : []),
      fmtY: v => fq(v), forceLegend: true, height: 220 });
    return `<section class="card section hh-dia"><header><h3>Dia de produção · 24 h</h3>${ib('hhDia')}<span class="spacer"></span><span class="small muted">só leitura · a produção é lançada na grade de cada turno</span></header>
      <p class="q">Cada hora de ${janela}, com e sem turno. A produção fora dos turnos conta no turno indicado (OEE reportado).</p>
      <div class="tw"><table class="hh"><thead><tr><th>Hora</th><th>Turno</th><th class="n">Meta</th><th class="n">Apontado</th><th class="n">Caixas MES</th><th class="n">Produção MES</th><th>Onde conta</th></tr></thead><tbody>
      ${D.H.map(row).join('')}${rec}
      <tr class="total"><td>Total</td><td></td><td class="n">${fq(tot.meta)}</td><td class="n">${fq(tot.apont)}</td><td class="n">${D.temMes ? U.fmt(tot.n) : ''}</td><td class="n">${D.temMes ? fq(tot.n * D.qty) : ''}</td><td class="small">${tot.fora ? `${fq(tot.fora)} fora dos turnos · ` : ''}considerada no dia: <b>${fq(res.r.good)}</b> ${esc(unitLbl())}</td></tr>
      </tbody></table></div>${ch}</section>`;
  }
});
/* 2.4.54 · gráfico "Atendimento hora a hora": as horas do MES fora do turno que contam neste dia entram na ordem do relógio
   (ex.: 04:00 e 05:00 antes das 06:00), e só elas (antes: as horas do turno não produtivo iam no fim, mesmo contando em outro dia) */
HHPs.chart = function (o, day, res) {
  o.allLabels = true;
  try {
    const sel = this.id(day), ps = sel && !String(sel).startsWith('np:') && sel !== 'dia' ? (day.shifts || []).find(p => p.id === sel) : null;
    const ft = res && res.foraTurno, its = ((ft && ft.recebe) || []).filter(i => i.alvo && i.alvo.date === day.date && !(ft.semAlvo || []).includes(i) && (!ps || i.alvo.code === ps.snap.code));   /* com um turno escolhido, só o que conta nele */
    const n0 = o.x.length, todos = n0 === res.flat.length, fl = todos ? res.flat : res.flat.filter(f => !ps || f.ps === ps), base = [];
    for (let i = 0; i < n0; i++) base.push({ k: 'iv', i, s: fl[i] ? fl[i].iv.start : i * 60 });
    for (const it of its) for (const r of this.porHora(day, it)) base.push({ k: 'f', r, it, s: r.h });
    if (base.length === n0) return o;
    base.sort((a, b) => a.s - b.s || (a.k === 'iv' ? -1 : 1));
    const pick = (arr, f) => base.map(e => e.k === 'iv' ? arr[e.i] : f(e));
    const X = o.x, XF = o.xFull, B = (o.bars || []).map(b => ({ v: b.values, m: b.meta })), Lv = (o.lines || []).map(l => l.values), M = o.mark, TR = o.tipRows;
    o.x = pick(X, e => this.hm(e.r.h)); if (XF) o.xFull = pick(XF, e => `${this.hm(e.r.h)}–${this.hm(e.r.h + 60)} · fora do turno · conta no ${e.it.alvo.name}`);
    (o.bars || []).forEach((b, k) => { b.values = pick(B[k].v, e => k === 0 ? e.r.pecas : null); if (b.meta) b.meta = pick(B[k].m, () => null); });
    (o.lines || []).forEach((l, k) => { l.values = pick(Lv[k], () => null); });
    if (M) o.mark = pick(M, () => []);
    if (TR) o.tipRows = i => { const e = base[i]; return e.k === 'iv' ? TR(e.i) : [['Fora do turno', `${U.fmt(e.r.n)} caixa(s) do MES · lote ${e.r.lots.join(', ')}`], ['Conta no', e.it.alvo.name + ' (OEE reportado)']]; };
  } catch (e) { console.warn('HHPs.chart', e); }
  return o;
};
Object.assign(HELP, {
  hhDia: ['Dia de produção (24 h)', [['O que é?', 'As 24 horas do dia, das 00:00 às 24:00 (com o 3º turno passando da meia-noite, do início do 1º turno até o mesmo horário do dia seguinte): em cada hora, o turno (ou "não produtivo"/"sem turno"), a meta, a produção apontada e as caixas do MES.'], ['E a produção fora do turno?', 'As horas sem turno com caixas mostram em qual turno a produção conta (OEE reportado). A produção recebida de antes do início do dia (ex.: 04:00–06:00, que conta no turno A) aparece no topo.'], ['Exemplo', 'A linha começou às 04:00 e só os turnos A (06:00) e B são produtivos: 04:00–06:00 aparece no topo como "conta no Turno A", e a linha do turno A no Hora a hora mostra essas horas como "fora do turno".']]]
});

/* ---------- Ordens › Ordens produzidas: lotes do MES sem MB51 ---------- */
const OrdMes = {
  /* meses do período escolhido em Ordens (de/até ou ano fiscal); null = todos */
  meses() {
    const P = Ord.per || {}; if (P.fy) { const y = 2000 + +P.fy.slice(2); const L = []; for (let i = 0; i < 12; i++) { const m = ((9 + i) % 12) + 1, yy = m >= 10 ? y - 1 : y; L.push(`${yy}-${String(m).padStart(2, '0')}`); } return L; }
    if (!P.de && !P.ate) return null; const a = P.de || P.ate, b = P.ate || P.de, L = []; let k = a; while (k <= b && L.length < 120) { L.push(k); const [y, m] = k.split('-').map(Number); k = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`; } return L;
  },
  /* ordem → competência do MB51 em que aparece (qualquer competência importada) */
  noMB51() { const M = new Map(); for (const [k, c] of Object.entries(Ord.B.competencias || {})) for (const o of ((c.resultado || {}).ordens || [])) M.set(String(o.ordem).replace(/^0+(?=\d)/, ''), k); return M; },
  linhas() {
    if (typeof ServerData === 'undefined' || !App.views.lots) return [];
    let R = []; try { R = App.views.lots.rows(); } catch (e) { return []; }
    const ms = this.meses(), mb = this.noMB51(), q = +(db().settings || {}).serverBoxQty || 1000;
    return R.filter(r => r.kind !== 'ignorar' && (!ms || r.days.some(z => ms.includes(z.date.slice(0, 7))))).map(r => {
      const ord = r.order ? String(r.order.order) : '', comp = ord ? mb.get(ord.replace(/^0+(?=\d)/, '')) : null;
      return { r, ord, comp, pecas: r.n * q, sit: comp ? 'conciliado' : ord ? 'não conciliado · sem MB51' : 'não conciliado · sem ordem no plano', d0: r.days.length ? r.days[0].date : null, d1: r.days.length ? r.days[r.days.length - 1].date : null };
    });
  },
  /* tabela: soConc = false → todos; true → só os não conciliados */
  html(titulo, soNao) {
    let L = this.linhas(); const tot = L.length; if (soNao) L = L.filter(x => !x.comp); if (!L.length) return soNao ? '' : `<section class="card section"><p class="muted">Nenhum lote do MES no período. Importe o CSV do MES em Configurações › Importação › Dados do servidor.</p></section>`;
    const nNao = L.filter(x => !x.comp).length;
    return `<section class="card section"><header><h3>${esc(titulo)} <span class="muted small">${L.length}${soNao ? ` de ${tot} lote(s) do MES` : ' lote(s)'}</span></h3>${ib('ordMes')}<span class="spacer"></span><button class="btn sm" data-route="lots" type="button">Lotes (MES) ›</button></header>
      ${nNao ? `<div class="note w small"><b>${nNao} lote(s) ainda não conciliado(s)</b>: a ordem não está em nenhum MB51 importado (ou o lote não tem ordem no plano do mês). Importe o MB51 da competência para conciliar.</div>` : ''}
      <div class="tw"><table><thead><tr><th>Lote</th><th>Catálogo</th><th>Ordem (plano)</th><th class="n">Caixas</th><th class="n">Produção</th><th>Dias</th><th>Conciliação</th><th></th></tr></thead><tbody>
      ${L.slice(0, 600).map(x => `<tr><td class="mono">${esc(x.r.lot)}</td><td>${(() => { const c = (db().catalogs || []).find(z => String(z.code) === String(x.r.cat)); return c ? catPill(c.id) : esc(x.r.cat || ''); })()}</td>
        <td class="mono">${x.ord ? esc(x.ord) : '<span class="muted">sem ordem</span>'}</td><td class="n">${U.fmt(x.r.n)}</td><td class="n">${fq(x.pecas)}</td>
        <td class="small">${x.d0 ? U.brDate(x.d0).slice(0, 5) + (x.d1 !== x.d0 ? ' a ' + U.brDate(x.d1).slice(0, 5) : '') : '—'}</td>
        <td>${x.comp ? ordPill('conciliado · MB51 ' + compTxt(x.comp), 'ok') : ordPill(x.ord ? 'não conciliado · sem MB51' : 'não conciliado · sem ordem no plano', 'warn')}</td>
        <td>${x.comp ? `<button type="button" class="btn xs" data-oord="${esc(x.ord)}" data-ofcomp="${x.comp}">Ordem</button>` : typeof vacFicha !== 'undefined' ? `<button type="button" class="btn xs" data-oflote="${esc(x.r.lot)}" title="Ficha do lote (o que as páginas publicam sobre ele)">Ficha</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>${L.length > 600 ? '<p class="small muted">Mostrando 600; use o filtro de competência.</p>' : ''}</section>`;
  }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-oflote]'); if (!b) return; try { vacFicha.abrir('lote', b.dataset.oflote); } catch (er) { toast('Ficha indisponível: ' + er.message, true); } });
Object.assign(HELP, {
  ordMes: ['Lotes do MES e conciliação', [['O que é?', 'Os lotes que a linha produziu (CSV do MES), com a ordem do plano do mês. "Conciliado" = a ordem está num MB51 importado; "não conciliado" = ainda sem MB51 (ou sem ordem no plano).'], ['Para que serve?', 'Ver tudo o que foi produzido antes de importar o MB51, e saber o que falta conciliar.'], ['Exemplo', 'Lote 6275187, catálogo 367986, ordem 100234567, 120 caixas: "não conciliado · sem MB51" até o MB51 de novembro ser importado.']]]
});

/* ===== Produção 2.4.53 · caixas do dia de trabalho (pedido do usuário, 11/11/2026) =====
   "Caixas do MES" pegava a janela 06:00→06:00 e "Lotes do dia" só o horário dos turnos: os dois davam número diferente do dia.
   Dia de trabalho = caixas dentro dos intervalos dos turnos do dia + caixas fora do turno que contam neste dia (ForaTurno: emendadas
   com o turno anterior, ou que vão para o próximo; inclui as da madrugada antes do 1º turno). Caixas de fora do turno que contam em
   outro dia ficam lá. É o mesmo conjunto que o OEE reportado já soma; aqui só a apresentação (cartão, Visão Geral, Lotes do dia). */
const CaixasDia = {
  _memo: new Map(),
  /* [{m, cat, lot, kind, fora}] em minutos absolutos, em ordem */
  lista(d, day, res) {
    if (!day || !(d.server && (d.server.segments || []).length)) return null;
    const S = ServerData, k = day.id + '|' + day._rev + '|' + (d.server.segments || []).length + '|' + ((d.server.imports || []).length) + '|' + JSON.stringify(d.server.lotClass || {}).length;
    if (this._memo.has(k)) return this._memo.get(k);
    if (!res) { try { res = Engine.computeDay(d, day); } catch (e) { return null; } }
    const base = S.dayStartMin(day.date), byLot = S.orderByLot(d, day.lineId), out = [];   /* várias caixas no mesmo minuto: lista, sem juntar por minuto */
    const ivs = (day.shifts || []).filter(p => !p.deleted).flatMap(p => (p.intervals || []).filter(i => !i.deleted));
    for (const s of S.segsOf(d, day.lineId)) {
      const t0 = S.tm(s.t0), t1 = S.tm(s.t1); if (!ivs.some(i => t1 >= base + i.start && t0 < base + i.end)) continue;
      const kind = S.lotKind(d, day.lineId, s.lot, byLot, day.date);
      for (const m of S.dec(s)) if (ivs.some(i => m >= base + i.start && m < base + i.end)) out.push({ m, cat: s.cat, lot: s.lot, kind, fora: false });
    }
    const ft = res && res.foraTurno;
    for (const it of (ft && ft.recebe) || []) {
      if ((ft.semAlvo || []).includes(it) || !it.alvo || it.alvo.date !== day.date) continue;
      const b0 = S.dayStartMin(it.data); let bx = []; try { bx = ForaTurno.caixas(d, day.lineId, b0 + it.t0, b0 + it.t1 + 1, it.data); } catch (e) { }
      for (const c of bx) out.push({ m: c.m, cat: c.cat, lot: c.lot, kind: 'normal', fora: true });   /* a janela fora do turno não cruza os intervalos do dia */
    }
    const L = out.sort((a, b) => a.m - b.m);
    if (this._memo.size > 60) this._memo.clear(); this._memo.set(k, L); return L;
  },
  /* por lote: {lot, cat, n, kind, fora} na ordem da 1ª caixa */
  lotes(d, day, res) {
    const L = this.lista(d, day, res); if (!L) return null; const M = new Map();
    for (const c of L) { const x = M.get(c.lot) || { lot: c.lot, cat: c.cat, n: 0, kind: c.kind, fora: 0, m0: c.m, m1: c.m }; x.n++; if (c.fora) x.fora++; x.m1 = c.m; M.set(c.lot, x); }
    return [...M.values()];
  }
};
/* cartão "Caixas do MES" (dia e período) pelo dia de trabalho */
MesDia.dia = function (d, day) {
  const S = ServerData; if (!day || !(d.server && (d.server.segments || []).length)) return null;
  const L = CaixasDia.lista(d, day); if (!L) return null;
  const base = S.dayStartMin(day.date), bx = L.filter(c => c.kind === 'normal');
  let ch = []; try { ch = bx.length ? S.changes(d, day.lineId).filter(c => { const f = S.tm(c.first); return f > bx[0].m && f <= bx[bx.length - 1].m; }) : []; } catch (e) { }
  return { date: day.date, base, n: bx.length, m0: bx.length ? bx[0].m : null, m1: bx.length ? bx[bx.length - 1].m : null, trocas: ch.length, trocaMin: U.sum(ch, c => c.min || 0), fora: bx.filter(c => c.fora).length };
};
