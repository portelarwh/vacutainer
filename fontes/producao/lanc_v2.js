/* ===== Produção 2.4.56 · Lançamento no layout novo (proposta visual do usuário, 11/11/2026) =====
   Só apresentação: os mesmos nós, ids, data-* e números de antes, reorganizados no mount (como vg_layout.js). Nenhum cálculo novo.
   - Cabeçalho do dia: seta em círculo; Data / Linha·máquina / Calendário / Scrap com ícone e separador; observação com contador;
     ações principais (Hora a hora, Fechar dia, Marcar como pendente), secundárias com ícone (Restaurar intervalos, Reaplicar metas,
     Marcar dia sem produção, Mover para outro dia) e, na linha de baixo, Histórico de alterações e Excluir lançamento (crítica).
   - Cartões: grade de 7 colunas, ícone ao lado do título, borda e fundo pela situação (na meta / atenção / abaixo);
     Disponibilidade, Performance e Qualidade com medidor (o número continua no cartão, para leitura e testes);
     cartão "OEE do dia (evolução por hora)": OEE de cada intervalo = produção boa ÷ (PPH × minutos ÷ 60), a mesma conta do OEE oficial,
     com a linha da meta (OEE meta do dia). Sem dados, o cartão diz que não há produção lançada.
   - Setas Mostrar/Recolher em círculo (blocos e turnos, LcFold).
   Entra no script principal pelo build.py (antes do boot) e é chamado no mount do Lançamento. */
const LancV2 = (() => {
  const P = {
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    fab: '<path d="M3 20V10l5 3V10l5 3V6l8 4v10z"/><path d="M3 20h18"/>',
    cal2: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/>',
    layers: '<path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M3 14l9 5 9-5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12.5l3 3 5-6"/>',
    restore: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    calx: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M10 13l4 4M14 13l-4 4"/>',
    move: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    hist: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4M12 8v4l3 2"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
    chev: '<path d="M6 9l6 6 6-6"/>'
  };
  const ic = (k, n = 18) => `<svg class="v2i" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || ''}</svg>`;
  const css = `
#main[data-rota="launch"]{--v2-r:12px}
/* cabeçalho do dia */
#cabDia.v2-cab{border-radius:var(--v2-r);padding:14px 18px}
#cabDia.v2-cab>header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
#cabDia.v2-cab>header h3{font-size:20px;text-transform:none;letter-spacing:0}
.v2-chev{width:30px;height:30px;min-height:30px!important;border-radius:50%!important;border:1px solid var(--line)!important;display:inline-grid!important;place-items:center;padding:0!important;color:var(--ink);background:var(--surface)!important}
.v2-chev .v2i{transition:transform .15s}.v2-chev[aria-expanded="false"] .v2i{transform:rotate(-90deg)}
.v2-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
#cabDia.v2-cab .form{display:flex!important;flex-wrap:wrap;gap:12px 0;align-items:flex-start;margin-top:10px}
#cabDia.v2-cab .v2-f{display:flex;gap:10px;align-items:flex-start;padding:2px 26px;border-left:1px solid var(--line);min-width:0}
#cabDia.v2-cab .v2-f:first-child{padding-left:4px;border-left:0}
#cabDia.v2-cab .v2-f>.v2i{color:var(--muted);margin-top:2px;flex:none}
#cabDia.v2-cab .v2-f .kv,#cabDia.v2-cab .v2-f .f{margin:0}
#cabDia.v2-cab .v2-f .kv .l,#cabDia.v2-cab .v2-f .f>span:first-child{font-size:12.5px;color:var(--muted);text-transform:none;letter-spacing:0}
#cabDia.v2-cab .v2-f .kv .v{font-weight:600;font-size:15px}
#cabDia.v2-cab .form .wide{flex-basis:100%;border-left:0;padding:0}
#cabDia.v2-cab textarea[data-dayf="note"]{min-height:46px;border-radius:8px}
.v2-cnt{display:block;text-align:right;font-size:11.5px;color:var(--muted);margin-top:-22px;margin-right:10px;pointer-events:none;position:relative}
#cabDia.v2-cab .v2-acts{display:flex;flex-wrap:wrap;gap:8px 6px;align-items:center;margin-top:12px}
#cabDia.v2-cab .v2-acts .v2-sec{font-size:13.5px;padding-left:6px;padding-right:6px}
#cabDia.v2-cab .v2-acts .ib,#cabDia.v2-cab .v2-acts i.i{transform:scale(.85);margin-left:-4px;margin-right:2px}
#cabDia.v2-cab .v2-acts .btn,#cabDia.v2-cab .v2-row2 .btn{display:inline-flex;align-items:center;gap:7px}
#cabDia.v2-cab .v2-out{background:var(--surface)!important;color:var(--ink)!important;border:1px solid var(--line)!important}
#cabDia.v2-cab .v2-out:hover{border-color:var(--muted)!important}
#cabDia.v2-cab .v2-sep{width:1px;align-self:stretch;background:var(--line);margin:0 6px}
#cabDia.v2-cab .v2-sec{background:transparent!important;border:0!important;color:var(--ink)!important;font-weight:500}
#cabDia.v2-cab .v2-sec .v2i{color:var(--muted)}#cabDia.v2-cab .v2-sec:hover{background:var(--surface-3)!important}
#cabDia.v2-cab .v2-row2{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-top:10px}
#cabDia.v2-cab .v2-del{background:var(--surface)!important;color:var(--crit)!important;border:1px solid var(--crit)!important}
#cabDia.v2-cab .v2-del:hover{background:color-mix(in srgb,var(--crit) 8%,var(--surface))!important}
/* cartões */
#main[data-rota="launch"] .v2-kpis{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;background:transparent;border:0;overflow:visible;border-radius:0}
#main[data-rota="launch"] .v2-kpis .kpi{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:8px;row-gap:3px;align-content:start;background:var(--surface);border:1px solid var(--line);border-radius:var(--v2-r);box-shadow:0 1px 2px rgba(16,42,86,.06);padding:12px;min-height:118px}
#main[data-rota="launch"] .v2-kpis .kpi>*{grid-column:1/-1}
#main[data-rota="launch"] .v2-kpis .kpi .kic{position:static;grid-column:1;grid-row:1;width:24px;height:24px;background:none;border-radius:0;color:color-mix(in srgb,var(--kc,var(--accent)) 85%,var(--ink))}
#main[data-rota="launch"] .v2-kpis .kpi .kic svg{width:20px;height:20px}
#main[data-rota="launch"] .v2-kpis .kpi .l{grid-column:2;grid-row:1;align-self:center;text-transform:none;letter-spacing:0;font-size:13.5px;font-weight:600;color:var(--ink);font-family:var(--f-body);display:block;line-height:1.3}
#main[data-rota="launch"] .v2-kpis .kpi .l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;justify-self:start;max-width:100%}
@media (min-width:1281px){#main[data-rota="launch"] .v2-kpis .kpi{padding:12px 10px;column-gap:6px}#main[data-rota="launch"] .v2-kpis .kpi .kic{width:20px}#main[data-rota="launch"] .v2-kpis .kpi .kic svg{width:18px;height:18px}#main[data-rota="launch"] .v2-kpis .kpi .l{font-size:12.5px;letter-spacing:-.1px}}
#main .v2-help{cursor:help;text-decoration:underline dotted color-mix(in srgb,var(--muted) 70%,transparent);text-underline-offset:3px;text-decoration-thickness:1px}
#main .v2-help:hover,#main .v2-help:focus-visible{text-decoration-color:var(--accent);outline:none}
#main .v2-ibh{display:none!important}
#main[data-rota="launch"] .v2-kpis .kpi .v{font-size:28px;margin-top:4px}
#main[data-rota="launch"] .v2-kpis .kpi.k-ok{border-left:4px solid var(--ok)}
#main[data-rota="launch"] .v2-kpis .kpi.k-warn{border-left:4px solid var(--warn)}
#main[data-rota="launch"] .v2-kpis .kpi.k-crit{border-left:4px solid var(--crit);background:color-mix(in srgb,var(--crit) 6%,var(--surface))}
#main[data-rota="launch"] .v2-kpis .kpi .v2-g{display:grid;place-items:center;margin-top:2px}
#main[data-rota="launch"] .v2-kpis .kpi .v2-g svg{width:112px;height:66px;display:block}
#main[data-rota="launch"] .v2-kpis .kpi .v2-g .gv{font-family:var(--f-display);font-weight:700;font-size:16px;fill:var(--ink)}
#main[data-rota="launch"] .v2-kpis .kpi.v2-gk .s{justify-content:center;text-align:center}
#main[data-rota="launch"] .v2-kpis .v2-oeeh{grid-column:span 2}
#main[data-rota="launch"] .v2-kpis .v2-oeeh .l small{font-weight:400;color:var(--muted);margin-left:4px}
#main[data-rota="launch"] .v2-kpis .v2-oeeh .leg{display:flex;gap:12px;font-size:11.5px;color:var(--muted);justify-content:flex-end;margin-top:-22px;pointer-events:none}
#main[data-rota="launch"] .v2-kpis .v2-oeeh .leg i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#1e6fd9;margin-right:4px;vertical-align:middle}
#main[data-rota="launch"] .v2-kpis .v2-oeeh .leg i.m{width:14px;height:0;border-radius:0;background:none;border-top:2px dashed var(--ok)}
#main[data-rota="launch"] .v2-kpis .v2-oeeh svg{width:100%;height:auto;display:block}
#main[data-rota="launch"] .v2-kpis .v2-oeeh svg text{font-size:10px;fill:var(--muted)}
.v2-sr2{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:1599px){#main[data-rota="launch"] .v2-kpis{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media (max-width:1280px){#main[data-rota="launch"] .v2-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:1050px){#main[data-rota="launch"] .v2-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
/* no celular o título pode ir para a 2ª linha (melhor que cortar a palavra) */
@media (max-width:760px){#main[data-rota="launch"] .v2-kpis .kpi .l{white-space:normal}}
@media (max-width:760px){#main[data-rota="launch"] .v2-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#cabDia.v2-cab .v2-f{border-left:0;padding:2px 10px 2px 4px;flex-basis:50%}#cabDia.v2-cab .v2-sep{display:none}}
/* setas Mostrar/Recolher em círculo (blocos e turnos) */
#main[data-rota="launch"] .lf-tg{width:30px;height:30px;border-radius:50%;padding:0;justify-content:center;background:var(--surface);color:var(--ink)}
#main[data-rota="launch"] .lf-tg .lf-tx{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#main[data-rota="launch"] .lf-tg>span[aria-hidden]{font-size:0}
#main[data-rota="launch"] .lf-tg>span[aria-hidden]::before{content:'';width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);display:block}
#main[data-rota="launch"] .lf-fold>.lc-hd .lf-tg>span[aria-hidden]::before,#main[data-rota="launch"] .lf-fold>.tl-head .lf-tg>span[aria-hidden]::before,#main[data-rota="launch"] section.card.lf-fold>header .lf-tg>span[aria-hidden]::before{transform:translateX(-2px) rotate(-45deg)}
@media print{.v2-chev,.v2-cnt{display:none!important}}
`;
  function estilo() { if (document.getElementById('lancV2Css')) return; const s = document.createElement('style'); s.id = 'lancV2Css'; s.textContent = css; document.head.appendChild(s); }
  const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const pre = (el, k) => { if (el && !el.querySelector(':scope > .v2i')) el.insertAdjacentHTML('afterbegin', ic(k, 17)); };
  function cabecalho(root) {
    const c = root.querySelector('#cabDia'); if (!c) return; c.classList.add('v2-cab');
    const tg = c.querySelector('#cabTg'); if (tg) { const ab = tg.getAttribute('aria-expanded') !== 'false'; tg.classList.add('v2-chev'); tg.innerHTML = ic('chev', 16) + `<span class="v2-sr">${ab ? 'Recolher' : 'Mostrar'}</span>`; }
    pre(c.querySelector('#dayMetas'), 'target'); pre(c.querySelector('#kcEdit'), 'pencil');
    const form = c.querySelector(':scope > .form');
    if (form) for (const el of [...form.children]) {
      if (el.classList.contains('wide') || el.classList.contains('v2-f')) continue;
      const t = txt(el.querySelector('.l, :scope > span')); const k = /^data/i.test(t) ? 'cal' : /linha/i.test(t) ? 'fab' : /calend/i.test(t) ? 'cal2' : /scrap/i.test(t) ? 'layers' : /respons/i.test(t) ? 'pencil' : 'cal';
      const w = document.createElement('div'); w.className = 'v2-f'; w.innerHTML = ic(k, 20); el.replaceWith(w); w.appendChild(el);
    }
    const nota = c.querySelector('textarea[data-dayf="note"]');
    if (nota && !nota.dataset.v2) { nota.dataset.v2 = '1'; nota.placeholder = 'Digite uma observação para o dia...'; const mx = +nota.getAttribute('maxlength') || 2000; const cnt = document.createElement('span'); cnt.className = 'v2-cnt'; const up = () => { cnt.textContent = `${nota.value.length} / ${mx}`; }; up(); nota.addEventListener('input', up); nota.after(cnt); }
    const row = [...c.children].find(x => x.classList.contains('row') && x.querySelector('[data-hhps]'));
    if (row && !row.classList.contains('v2-acts')) {
      row.classList.add('v2-acts'); row.style.marginTop = '';
      const cl = row.querySelector('#dClose'); if (cl) { cl.classList.remove('primary'); cl.classList.add('v2-out'); }
      const ro = row.querySelector('#dReopen'); if (ro) { ro.classList.add('v2-out'); pre(ro, 'unlock'); }
      const pd = row.querySelector('#dPend'); if (pd) { pd.classList.add('v2-out'); pre(pd, 'check'); }
      const sp = row.querySelector('.spacer'); if (sp) { const s = document.createElement('span'); s.className = 'v2-sep'; sp.replaceWith(s); }
      for (const [id, k] of [['#dRestore', 'restore'], ['#dReapply', 'copy'], ['#dOff', 'calx'], ['#dMove', 'move']]) { const b = row.querySelector(id); if (b) { b.classList.add('v2-sec'); pre(b, k); } }
      const r2 = document.createElement('div'); r2.className = 'v2-row2';
      const hi = row.querySelector('#dHist'); if (hi) { hi.classList.add('v2-sec'); pre(hi, 'hist'); r2.appendChild(hi); }
      const de = row.querySelector('#dDel'); if (de) { de.classList.remove('danger'); de.classList.add('v2-del'); pre(de, 'trash'); r2.appendChild(de); }
      if (r2.children.length) row.after(r2);
    }
  }
  /* medidor em meia-lua: valor de 0 a 1 (acima de 1 fica cheio) */
  function gauge(v, cor, rot) {
    const p = v == null || !isFinite(v) ? 0 : Math.max(0, Math.min(1, v)), R = 44, cx = 56, cy = 56, L = Math.PI * R;
    const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
    return `<svg viewBox="0 0 112 66" role="img" aria-label="${esc(rot)}"><path d="${arc}" fill="none" stroke="var(--line)" stroke-width="9" stroke-linecap="round"/>
      <path d="${arc}" fill="none" stroke="${cor}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(p * L).toFixed(1)} ${L.toFixed(1)}"/>
      <text class="gv" x="${cx}" y="${cy - 4}" text-anchor="middle">${esc(rot)}</text></svg>`;
  }
  /* OEE de cada intervalo do dia: produção boa ÷ capacidade do intervalo (PPH × minutos ÷ 60) */
  /* 2.4.59 · mesma base do Apontamento › Hora a hora: intervalos dos turnos + horas do MES fora do turno que contam no dia, em ordem de horário.
     Hora fora do turno: OEE da hora = produção do MES ÷ (PPH do turno que recebe × 1 h), como no OEE real; barra mais clara. O OEE oficial não muda. */
  function oeeHoras(res, day) {
    const H = (res.flat || []).filter(f => f.good != null && f.pph > 0 && f.min > 0).map(f => ({ h: U.hhmm(f.iv.start), s: f.iv.start, v: f.good / (f.pph * f.min / 60) }));
    if (day && typeof HHPs !== 'undefined') try {
      const ft = res.foraTurno;
      for (const it of ((ft && ft.recebe) || []).filter(i => i.alvo && i.alvo.date === day.date && !(ft.semAlvo || []).includes(i))) {
        const f0 = (res.flat || []).find(f => f.ps && f.ps.snap.code === it.alvo.code && f.pph > 0); if (!f0) continue;
        for (const r of HHPs.porHora(day, it)) H.push({ h: HHPs.hm(r.h), s: r.h, v: r.pecas / f0.pph, fora: it.alvo.name });
      }
    } catch (e) { console.warn('oeeHoras', e); }
    return H.sort((a, b) => a.s - b.s);
  }
  function grafOee(res, day) {
    const H = oeeHoras(res, day), meta = res.r && res.r.oeeTarget;
    if (!H.length) return '<p class="small muted" style="margin:14px 0 0">Sem produção lançada no hora a hora deste dia.</p>';
    const W = 380, Ht = 150, L = 34, R = 6, T = 10, B = 20, iw = W - L - R, ih = Ht - T - B, n = H.length, bw = iw / n;
    const mx = Math.max(1, ...H.map(x => x.v), meta || 0), y = v => T + ih - Math.min(v, mx) / mx * ih;
    const ticks = [0, .25, .5, ...(meta && meta < 1 && Math.abs(meta - .5) > .06 && Math.abs(meta - .75) > .06 ? [meta] : [.75]), 1].sort((a, b) => a - b);
    let s = `<svg viewBox="0 0 ${W} ${Ht}" role="img" aria-label="OEE do dia por hora">`;
    for (const t of ticks) s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y(t) + 3}" text-anchor="end">${U.pct(t, 0)}</text>`;
    H.forEach((x, i) => { const bx = L + i * bw + bw * .18, w = bw * .64, yy = y(x.v); s += `<rect x="${bx.toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(1, T + ih - yy).toFixed(1)}" rx="2" fill="#1e6fd9"${x.fora ? ' fill-opacity=".45" class="v2-fora"' : ''}><title>${esc(x.h)} · OEE ${esc(U.pct(x.v, 1))}${x.fora ? ' · fora do turno · conta no ' + esc(x.fora) + ' (pelo PPH do turno)' : ''}</title></rect>`;
      if (n <= 16 || i % Math.ceil(n / 12) === 0) s += `<text x="${(L + i * bw + bw / 2).toFixed(1)}" y="${Ht - 6}" text-anchor="middle">${esc(x.h.slice(0, 2))}h</text>`; });
    if (meta) s += `<line x1="${L}" x2="${W - R}" y1="${y(meta)}" y2="${y(meta)}" stroke="var(--ok)" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    return s + '</svg>';
  }
  function kpis(root, res, day) {
    const k = root.querySelector('.section.kpis'); if (!k) return; k.classList.add('v2-kpis');
    const r = res.r || {};
    const G = { disponibilidade: [r.D, '#1e6fd9'], performance: [r.P, '#7d93ad'], qualidade: [r.Q, 'var(--ok)'] };
    for (const c of k.querySelectorAll(':scope > .kpi')) {
      const l = c.querySelector('.l'), nome = (l ? [...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('') : '').trim().toLowerCase();
      const g = G[nome]; if (!g || c.querySelector('.v2-g')) continue;
      const v = c.querySelector('.v'); c.classList.add('v2-gk');
      const rot = v ? txt(v) : U.pct(g[0]); if (v) v.classList.add('v2-sr2');
      const d = document.createElement('div'); d.className = 'v2-g'; d.innerHTML = gauge(g[0], g[1], rot); (v || l).after(d);
    }
    if (!k.querySelector('.v2-oeeh')) {
      const meta = r.oeeTarget;
      k.insertAdjacentHTML('beforeend', `<div class="kpi v2-oeeh"><span class="kic">${ic('chart', 20)}</span><span class="l">OEE do dia <small>(evolução por hora)</small></span>
        <div class="leg"><span><i></i>OEE (%)</span>${meta ? `<span><i class="m"></i>Meta (${esc(U.pct(meta, 0))})</span>` : ''}</div>${grafOee(res, day)}</div>`);
    }
  }
  /* Explicação no próprio título (Produção inteira, todas as abas):
     - o ⓘ sai e o título/rótulo ao lado dele passa a abrir a explicação (o popup de ajuda lê [data-help]);
     - cartão sem ⓘ ganha a explicação pelo título (KPI_HELP da página + PALAVRA_AJUDA abaixo);
     - cabeçalho de tabela: o texto vira a palavra clicável (o resto do cabeçalho continua ordenando);
     - botão de ação: o clique continua sendo a ação; a explicação vai para a dica do mouse. */
  const AJUDA_NOVA = {
    oeeHoras: ['OEE do dia (evolução por hora)', [['O que mostra?', 'O OEE de cada intervalo do dia: produção boa ÷ (PPH × minutos ÷ 60), a mesma conta do OEE oficial.'], ['E as horas fora do turno?', 'Como no Apontamento › Hora a hora: as horas do MES fora do turno que contam neste dia entram na ordem do horário (ex.: 04:00 e 05:00 antes das 06:00), em barra mais clara, com o PPH do turno que recebe a produção. O OEE oficial do dia não muda.'], ['E a linha tracejada?', 'A OEE meta do dia. Barra abaixo dela = hora abaixo da meta.']]],
    paradasApont: ['Paradas apontadas', [['O que é?', 'Minutos de parada apontados no dia (Hora a hora e Paradas).'], ['Para que serve?', 'Comparado com a perda total, mostra quanto da perda tem causa conhecida.']]],
    semExplic: ['Sem explicação', [['O que é?', 'Perda de Disponibilidade e Performance que nenhum apontamento cobre: perda de D+P − minutos apontados.'], ['O que fazer?', 'Apontar as paradas que faltam no Hora a hora.']]],
    cascata: ['Consistência da cascata', [['O que é?', 'Confere se capacidade − perdas de D, P e Q chega na produção boa.'], ['"Não fecha"?', 'Há diferença entre os números lançados; a diferença em unidades aparece embaixo.']]],
    validacao: ['Validação', [['O que é?', 'Erros e alertas do lançamento do dia.'], ['Erro x alerta', 'Erro (vermelho) impede fechar o turno; alerta (amarelo) é para conferir.']]],
    segQual: ['Segurança e qualidade do turno', [['O que é?', 'Acidente e QN do turno, que alimentam o SQDCP.'], ['Respostas', 'Sim, Não houve ou Não informado. Ausência de resposta nunca é zero.']]],
    obsDia: ['Observação geral', [['O que é?', 'Fatos do dia que valem para todos os turnos e entram no relatório.'], ['Exemplo', 'Falta de rolha das 10h às 11h; linha parada para limpeza no fim do dia.']]],
    dataDia: ['Data', [['O que é?', 'O dia de produção que está sendo lançado.'], ['Turno que passa da meia-noite', 'Conta no dia em que começou.']]],
    linhaMaq: ['Linha · máquina', [['O que é?', 'Linha e máquina deste lançamento, pelo cadastro do Portal.']]],
    difMeta: ['Diferença contra a meta', [['Como calcula?', 'Produção boa − meta do período.'], ['Sinal', 'Positivo = acima da meta; negativo = faltou produzir.']]],
    scrapPct: ['Scrap %', [['Como calcula?', 'Scrap ÷ (produção boa + scrap).'], ['Onde entra?', 'É a perda de Qualidade do OEE.']]],
    pphReal: ['PPH real', [['Como calcula?', 'Produção boa ÷ horas líquidas trabalhadas no período.'], ['Comparar com', 'O PPH nominal: a diferença é perda de ritmo, paradas e scrap.']]],
    pphNom: ['PPH nominal', [['O que é?', 'Peças por hora do catálogo (cadastro do Portal), ponderada pelo tempo de cada catálogo no período.'], ['Para que serve?', 'É a velocidade de referência da capacidade.']]],
    cabDia: ['Cabeçalho do dia', [['O que é?', 'Dados e ações que valem para o dia inteiro: data, calendário, scrap, observação, fechar o dia.']]]
  };
  const PALAVRA_AJUDA = { 'OEE do dia': 'oeeHoras', 'Paradas apontadas': 'paradasApont', 'Sem explicação': 'semExplic', 'Consistência da cascata': 'cascata', 'Validação': 'validacao', 'Segurança e qualidade do turno': 'segQual', 'Observação geral': 'obsDia', 'Data': 'dataDia', 'Linha': 'linhaMaq', 'Linha · máquina': 'linhaMaq', 'Cabeçalho do dia': 'cabDia', 'Diferença contra a meta': 'difMeta', 'Scrap %': 'scrapPct', 'PPH real': 'pphReal', 'PPH nominal': 'pphNom' };
  const SO_CAB = { dataDia: 1, linhaMaq: 1, cabDia: 1 }; // palavras genéricas: só no cabeçalho do dia
  const resumo = k => { const h = (typeof HELP !== 'undefined' && HELP[k]) || null; if (!h) return ''; const a = (h[1] || [])[0]; return h[0] + (a ? ': ' + a[1] : ''); };
  const chaveDo = t => { t = String(t || '').replace(/\s+/g, ' ').trim(); const m = (typeof KPI_HELP !== 'undefined' && KPI_HELP) || {}; return m[t] || PALAVRA_AJUDA[t] || PALAVRA_AJUDA[t.replace(/\s*\(.*\)$/, '')] || ''; };
  function marcar(alvo, k) { alvo.dataset.help = k; alvo.classList.add('v2-help'); alvo.setAttribute('role', 'button'); alvo.tabIndex = 0; alvo.title = resumo(k) || 'Clique para ver a explicação'; }
  function textoClicavel(cel, k) { // th/td: só o texto vira palavra, o resto da célula continua com a ação dela (ordenar)
    const tn = [...cel.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return false; const sp = document.createElement('span'); sp.textContent = tn.textContent.trim(); tn.replaceWith(sp, ' '); marcar(sp, k); return true;
  }
  function palavras(root) {
    if (typeof HELP !== 'undefined') for (const k in AJUDA_NOVA) if (!HELP[k]) HELP[k] = AJUDA_NOVA[k];
    // ⓘ só com dica (title, sem data-help): vira uma explicação comum, com a palavra ao lado como título
    for (const ib of [...root.querySelectorAll('.ib:not([data-help])[title]')]) {
      const tt = ib.title.trim(); if (!tt || tt === 'Ajuda' || typeof HELP === 'undefined') continue;
      const pai = ib.parentElement, pal = pai ? [...pai.childNodes].filter(n => n !== ib).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim() : '';
      const k = 'dica:' + tt.slice(0, 60); if (!HELP[k]) HELP[k] = [pal || 'Ajuda', [['O que é?', tt]]];
      ib.removeAttribute('onclick'); ib.dataset.help = k;
    }
    for (const ib of [...root.querySelectorAll('.ib[data-help]')]) {
      if (ib.classList.contains('v2-ibh') || !ib.isConnected) continue;
      const k = ib.dataset.help, prev = ib.previousElementSibling, pai = ib.parentElement;
      if (!pai) continue;
      if (prev && prev.matches('button,.btn,a')) { prev.title = resumo(k) || prev.title; ib.classList.add('v2-ibh'); continue; }
      if (pai.matches('button,.btn,a')) { pai.title = resumo(k) || pai.title; ib.classList.add('v2-ibh'); continue; }
      if (pai.matches('th,td')) { if (textoClicavel(pai, k)) ib.remove(); else ib.classList.add('v2-ibh'); continue; }
      // a palavra é só o texto ao lado do ⓘ: nunca um contêiner com botões/campos (senão o clique neles abriria a ajuda)
      const CTRL = 'button,input,select,textarea,a,.btn,canvas,svg.chart,table';
      const curto = el => el && !el.querySelector(CTRL) && el.textContent.replace(/\s+/g, ' ').trim().length > 0 && el.textContent.trim().length <= 70;
      let alvo = null;
      if (pai.matches('label')) { const sp = pai.querySelector(':scope > span'); if (curto(sp)) alvo = sp; }
      else if (curto(pai) || (!pai.querySelector(CTRL) && pai.matches('h1,h2,h3,h4,h5,legend,.l,.kl,.lbl,.tl-l,span,b,strong'))) alvo = pai;
      if (!alvo && prev && curto(prev) && !prev.matches(CTRL)) alvo = prev;
      if (!alvo) { const tn = ib.previousSibling; if (tn && tn.nodeType === 3 && tn.textContent.trim()) { const sp = document.createElement('span'); sp.textContent = tn.textContent.replace(/\s+$/, ''); tn.replaceWith(sp); alvo = sp; } }
      // ⓘ solto, sem palavra ao lado (ajuda da tela inteira, ex.: Plano do mês, Relatórios): a explicação vai para o título da tela
      if (!alvo) { const h = root.querySelector('h1, h2'); if (h && !h.dataset.help && !h.closest('[data-help]') && !h.querySelector('button,input,select,a')) alvo = h; }
      if (!alvo) continue;
      if (alvo.dataset.help || alvo.closest('[data-help]')) { ib.classList.add('v2-ibh'); continue; }
      marcar(alvo, k); ib.remove();
    }
    // títulos de cartão e de bloco sem ⓘ: a explicação pelo próprio título
    for (const t of root.querySelectorAll('.kpi .l, .kpi > span:first-child, .card > header h3, h3, h4, label.f > span:first-child, .kv > .l')) {
      if (t.dataset.help || t.closest('[data-help]') || t.querySelector('[data-help]') || t.closest('button,a,.ipop') || t.querySelector('button,input,select,textarea,a')) continue;
      const txt = (t.firstChild && t.firstChild.nodeType === 3 ? t.firstChild.textContent : t.textContent);
      let k = chaveDo(txt) || chaveDo(t.textContent);
      if (k && SO_CAB[k] && !t.closest('#cabDia')) k = '';
      // título de gráfico/bloco: a explicação é a pergunta que ele responde e a unidade (sem repetir texto na tela)
      if (!k && typeof HELP !== 'undefined' && t.matches('section.card > header h3')) {
        const sec = t.closest('section.card'), q = sec.querySelector(':scope > p.q, :scope > header + p'), un = sec.querySelector('.c-un');
        const tit = t.textContent.trim(), itens = [];
        if (q && q.textContent.trim()) itens.push(['Pergunta que responde', q.textContent.trim()]);
        if (un && un.textContent.trim()) itens.push(['Como ler', un.textContent.trim()]);
        if (sec.querySelector('.chart, svg')) itens.push(['Detalhe', 'Passe o mouse sobre as barras ou pontos para ver os valores; clique para abrir o detalhe quando houver.']);
        if (itens.length) { k = 'titulo:' + tit; HELP[k] = [tit, itens]; }
      }
      if (k && typeof HELP !== 'undefined' && HELP[k]) marcar(t, k);
    }
  }
  let pend = 0;
  function observar() {
    const m = document.getElementById('main'); if (!m || m.dataset.v2pal) return; m.dataset.v2pal = '1';
    const rodar = () => { pend = 0; try { palavras(m); } catch (e) { console.warn('palavras', e); } };
    new MutationObserver(() => { if (!pend) pend = requestAnimationFrame(rodar); }).observe(m, { childList: true, subtree: true });
    rodar();
  }
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('v2-help')) { e.preventDefault(); e.target.click(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { estilo(); observar(); }); else setTimeout(() => { estilo(); observar(); }, 0);
  return {
    montar(root, day) {
      try { estilo(); const res = Engine.computeDay(db(), day); cabecalho(root); kpis(root, res, day); palavras(root); } catch (e) { console.warn('LancV2', e); }
    },
    oeeHoras
  };
})();
