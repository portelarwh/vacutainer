/* ===== Produção 2.4.41 · cartão do turno, scrap por máquina e OEE real no Painel (homologação de 10/11/2026: PRD-08, PRD-10, PRD-13) =====
   Cartão do turno (Lançamento):
     - "Produção dentro do turno" = produção boa sem o que veio de fora do turno; "Produção fora do turno" (caixas e horário de início e
       fim, quando o turno não produtivo não foi habilitado); "Produção total considerada" = turno + janela extra (é a que entra no OEE);
     - sai "Produção processada" (o mesmo número da produção boa);
     - "OEE realizado" passa a se chamar "OEE reportado" e ganha ao lado o "OEE real" do turno (mesma regra do dia: o tempo fora do turno
       em que a linha produziu soma ao planejado do turno que recebeu a produção).
   Scrap (PRD-13): o campo vira o botão "Lançar scrap", que abre o popup com o scrap por máquina (equipamentos da linha) e o gel (quando
     o catálogo do turno usa gel). "Reportar só o total" desabilita as máquinas. ps.scrap continua sendo o total (OEE e exports);
     ps.scrapMaq = { código da máquina: peças } é opcional (só quando lançado por máquina) e vai para o exports porDiaTurno[].scrapMaq.
   Painel (PRD-08): OEE reportado, OEE real, Fora de turno e Caixas do MES no catálogo de indicadores do Painel; "Meu painel" ganha o
     OEE real uma vez (dá para tirar em Personalizar). Entra no script principal pelo build.py (antes do boot). */
const TurnoCard = {
  recebe(day, res, ps) { const ft = res && res.foraTurno; if (!ft) return []; return (ft.recebe || []).filter(i => !(ft.semAlvo || []).includes(i) && i.alvo && i.alvo.date === day.date && i.alvo.code === ps.snap.code); },
  dd(it, day) { return Math.round((Date.UTC(+it.data.slice(0, 4), +it.data.slice(5, 7) - 1, +it.data.slice(8, 10)) - Date.UTC(+day.date.slice(0, 4), +day.date.slice(5, 7) - 1, +day.date.slice(8, 10))) / 864e5) * 1440; },
  /* OEE real do turno: tempo fora do turno com produção somado ao planejado do turno que recebeu */
  real(day, sr, res) {
    const ps = sr.ps, r = sr.r, its = this.recebe(day, res, ps), w = OeeReal.janelaPs(ps);
    const pph = L => { const p = U.sum(L, i => i.pecas), h = U.sum(L, i => i.goodMin) / 60; return h > 0 ? p / h : 0; };
    let antes = 0, depois = 0; const A = [], D = [];
    if (w) for (const it of its) { const x0 = it.t0 + this.dd(it, day), x1 = it.t1 + this.dd(it, day) + 1; if (x0 < w[0]) { A.push(it); antes = Math.max(antes, w[0] - x0); } else if (x1 > w[1]) { D.push(it); depois = Math.max(depois, x1 - w[1]); } }
    const capExtra = pph(A) * antes / 60 + pph(D) * depois / 60;
    return { its, fora: U.sum(its, i => i.pecas), caixas: U.sum(its, i => i.caixas), extraMin: antes + depois, real: r.cap + capExtra > 0 ? r.good / (r.cap + capExtra) : null };
  },
  producao(day, sr, res) {
    const r = sr.r; if (!res) return `<div class="kv"><span class="l">Produção boa</span><span class="v">${fq(r.good)} ${unitLbl()}</span><span class="small">${semB(r.semAttain, 'meta ' + fq(r.metaOp))}</span></div>`;
    const x = this.real(day, sr, res), dentro = r.good - x.fora;
    const hh = it => `${U.hhmm(it.t0 % 1440)}–${U.hhmm(it.t1 % 1440)}${it.data !== day.date ? ' de ' + U.brDate(it.data).slice(0, 5) : ''}`;
    return `<div class="kv"><span class="l">Produção dentro do turno ${ib('prodDentro')}</span><span class="v">${fq(dentro)} ${unitLbl()}</span></div>
      ${x.its.length ? `<div class="kv"><span class="l">Produção fora do turno ${ib('prodFora')}</span><span class="v">${fq(x.fora)} ${unitLbl()}</span><span class="small muted">${U.fmt(x.caixas)} caixa(s) · ${x.its.map(hh).join(' · ')}</span></div>` : ''}
      <div class="kv"><span class="l">Produção total considerada ${ib('prodTotal')}</span><span class="v">${fq(r.good)} ${unitLbl()}</span><span class="small">${semB(r.semAttain, 'meta ' + fq(r.metaOp))}${x.fora ? ' · turno + janela extra' : ''}</span></div>`;
  },
  oee(day, sr, res) {
    const r = sr.r, x = res ? this.real(day, sr, res) : null;
    return `<div class="kv"><span class="l">OEE reportado ${ib('oeeRep')}</span><span class="v">${U.pct(r.oee)}</span><span class="small">${semB(r.semOee, 'meta ' + U.pct(r.oeeTarget))}</span></div>`
      + (x ? `<div class="kv"><span class="l">OEE real ${ib('oeeReal')}</span><span class="v">${U.pct(x.real)}</span><span class="small muted">${x.extraMin ? `+${U.fmt(x.extraMin)} min fora do turno` : 'igual ao reportado'}</span></div>` : '');
  },
  /* ---------- scrap: botão no cartão e popup ---------- */
  maquinas(d, day) { return (d.machines || []).filter(m => !m.deleted && m.active !== false && m.role !== 'oee' && (!m.lineId || m.lineId === day.lineId)).sort((a, b) => String(a.code).localeCompare(String(b.code), 'pt-BR', { numeric: true })); },
  gelTxt(day, sr, res) {
    let C = null; try { C = GelTurno.ctx(); if (!GelTurno.mostra(res, sr.ps, C)) return ''; } catch (e) { return ''; }
    const gs = sr.ps.gelScrap; if (!gs) return ' · gel: sem registro'; if (gs.none) return ' · gel: sem scrap';
    const k = GelTurno.soma(gs, day.date, C); return ` · gel ${U.fmt(k.T + k.B + k.P, 3)} kg`;
  },
  scrapBtn(day, sr, res, lk) {
    const ps = sr.ps, txt = ps.scrap == null ? '<span class="muted">não informado</span>' : `${U.fmt(ps.scrap)} peças${ps.scrapMaq ? ' · por máquina' : ' · só o total'}`;
    return `<span class="v small">${txt}${res ? this.gelTxt(day, sr, res) : ''}</span><button type="button" class="btn sm" data-scrapturno="${ps.id}" ${ps.summary ? 'disabled' : ''}>${lk ? 'Ver scrap' : 'Lançar scrap'}</button>`;
  },
  num(v) { const s = String(v ?? '').trim(); if (!s) return null; const n = +s.replace(/\./g, '').replace(',', '.'); return Number.isFinite(n) && n >= 0 && Math.round(n) === n ? n : NaN; },
  abrir(day0, psId) {
    const d = db(), day = d.productionDays.find(x => x.id === day0.id) || day0, ps = day.shifts.find(p => p.id === psId); if (!ps) return;
    const res = Engine.computeDay(d, day), sr = res.shifts.find(s => s.ps.id === ps.id), lk = locked(day, ps), M = this.maquinas(d, day);
    const W = { so: !ps.scrapMaq, total: ps.scrap == null ? '' : String(ps.scrap), maq: Object.assign({}, ps.scrapMaq || {}) };
    let C = null, temGel = false; try { C = GelTurno.ctx(); temGel = GelTurno.mostra(res, ps, C); } catch (e) { }
    const soma = () => Object.values(W.maq).reduce((s, v) => { const n = this.num(v); return s + (Number.isFinite(n) && n ? n : 0); }, 0);
    const body = `<p class="small muted">Scrap de peças do turno, por máquina ou só o total. O total entra na Qualidade (Q) do OEE.${temGel ? ' O gel tem a pesagem própria (mesma conta da Gestão de Gel).' : ''}</p>
      <label class="chk"><input type="checkbox" id="scSo" ${W.so ? 'checked' : ''} ${lk ? 'disabled' : ''}> Reportar só o total do turno</label>
      <div class="form" style="margin:8px 0"><label class="f"><span>Total do turno (peças)</span><input type="text" inputmode="numeric" class="n" id="scTot" value="${esc(W.total)}" placeholder="não informado" ${!W.so || lk ? 'disabled' : ''}></label></div>
      <div class="tw" id="scMaqBox" style="${W.so ? 'opacity:.5' : ''}"><table><thead><tr><th>Máquina</th><th class="n">Scrap (peças)</th></tr></thead><tbody>
        ${M.map(m => `<tr><td><span class="mono">${esc(m.code)}</span> · ${esc(m.name || '')}</td><td class="n"><input type="text" inputmode="numeric" class="n" data-scm="${esc(m.code)}" value="${esc(W.maq[m.code] ?? '')}" style="width:110px" ${W.so || lk ? 'disabled' : ''}></td></tr>`).join('') || '<tr><td colspan="2" class="muted">Nenhuma máquina da linha no cadastro (Portal › Equipamentos).</td></tr>'}
        <tr class="total"><td>Total por máquina</td><td class="n" id="scSoma">${U.fmt(soma())}</td></tr></tbody></table></div>
      ${temGel ? `<section class="card" style="margin-top:12px;padding:10px"><b>Gel</b> <span class="small">${this.gelTxt(day, sr, res).replace(/^ · /, '') || 'sem registro'}</span> <button type="button" class="btn sm" id="scGel" ${lk ? 'disabled' : ''}>Registrar scrap de gel (pesagem)</button></section>` : ''}`;
    modal(`Scrap · ${ps.snap.name} · ${U.brDate(day.date)}`, body, `<button class="btn" data-close>${lk ? 'Fechar' : 'Cancelar'}</button>${lk ? '' : '<button class="btn primary" id="scOk">Gravar</button>'}`, (el, close) => {
      const so = el.querySelector('#scSo'), tot = el.querySelector('#scTot'), box = el.querySelector('#scMaqBox');
      if (so) so.onchange = () => { W.so = so.checked; tot.disabled = !W.so; box.style.opacity = W.so ? '.5' : ''; el.querySelectorAll('[data-scm]').forEach(i => { i.disabled = W.so; }); };
      el.querySelectorAll('[data-scm]').forEach(i => i.oninput = () => { W.maq[i.dataset.scm] = i.value; el.querySelector('#scSoma').textContent = U.fmt(soma()); });
      const g = el.querySelector('#scGel'); if (g) g.onclick = () => { close(); GelTurno.abrir(day, ps.id, res); };
      const ok = el.querySelector('#scOk'); if (ok) ok.onclick = () => {
        let total, maq = null;
        if (W.so) { total = this.num(tot.value); if (Number.isNaN(total)) return toast('Total inválido: informe peças (número inteiro).', true); }
        else {
          const e = Object.entries(W.maq).map(([k, v]) => [k, this.num(v)]);
          if (e.some(([, n]) => Number.isNaN(n))) return toast('Valor inválido numa máquina: informe peças (número inteiro).', true);
          const L = e.filter(([, n]) => n != null); maq = L.length ? Object.fromEntries(L) : null; total = L.length ? U.sum(L, x => x[1]) : null;
        }
        run(() => { Actions.setShiftField(day.id, ps.id, 'scrap', total); Actions.setShiftField(day.id, ps.id, 'scrapMaq', maq); }, 'Scrap gravado.').then(() => { close(); render(); });
      };
    });
  },
  ligar(root, day) { root.querySelectorAll('[data-scrapturno]').forEach(b => b.onclick = e => { e.preventDefault(); this.abrir(day, b.dataset.scrapturno); }); }
};
/* ---------- Painel: indicadores novos ---------- */
Object.assign(PN_K, {
  oeeRep: { l: 'OEE reportado', g: 'OEE', c: x => { const s = x.memo.oeR || (x.memo.oeR = OeeReal.periodo(x.days)); return { v: U.pct(s.rep), s: s.fora ? 'oficial: fora de turno somado ao turno que recebe' : 'oficial' }; } },
  oeeReal: { l: 'OEE real', g: 'OEE', c: x => { const s = x.memo.oeR || (x.memo.oeR = OeeReal.periodo(x.days)), p = x.pdays && x.pdays.length ? (x.memo.oeRp || (x.memo.oeRp = OeeReal.periodo(x.pdays))) : null;
    return { v: U.pct(s.real), s: s.extraMin ? `+${U.fmt(s.extraMin)} min fora do turno no planejado` : 'igual ao reportado', d: PN_DELTA(s.real, p && p.real, true) }; } },
  fora: { l: 'Fora de turno', g: 'Produção', c: x => { const s = x.memo.oeR || (x.memo.oeR = OeeReal.periodo(x.days)); return { v: fq(s.fora), u: unitLbl(), s: s.foraPct != null ? `${U.pct(s.foraPct, 1)} da produção boa` : '' }; } },
  caixas: { l: 'Caixas do MES', g: 'Produção', c: x => { const p = MesDia.periodo(x.days); if (!p) return { v: '—', s: 'sem caixas do MES no período' }; return { v: `${OeeReal.hhmm(p.primeiro.m0, p.primeiro.base)}–${OeeReal.hhmm(p.ultimo.m1, p.ultimo.base)}`, s: `${U.fmt(p.n)} cx${p.trocas ? ` · ${p.trocas} troca(s) · ${OeeReal.dur(p.trocaMin)}` : ''}` }; } }
});
(() => {
  const O = App.views.overview;
  App.views.overview = { render() {
    try { const L = App.prefs.panelLayout; if (!App.prefs.pnOeeReal && L && Array.isArray(L.kpis)) { if (!L.kpis.includes('oeeReal')) { const i = L.kpis.indexOf('oee'); L.kpis.splice(i < 0 ? 0 : i + 1, 0, 'oeeReal'); } App.prefs.pnOeeReal = 1; savePrefs(); } } catch (e) { }
    return O.render(); }, mount(root) { return O.mount && O.mount(root); } };
})();
Object.assign(HELP, {
  prodDentro: ['Produção dentro do turno', [['O que é?', 'Produção boa lançada nos intervalos do próprio turno (horário do turno), sem a produção que veio de fora do turno.']]],
  prodFora: ['Produção fora do turno', [['O que é?', 'Caixas do MES feitas fora dos turnos produtivos (ex.: janela do turno C não habilitado) e somadas a este turno pela regra de continuidade, com o horário da 1ª e da última caixa de cada trecho.'], ['Exemplo', '54 caixa(s) · 22:47–23:41 (o B emendou na janela do C).']]],
  prodTotal: ['Produção total considerada', [['O que é?', 'Produção dentro do turno + produção fora do turno (janela extra). É a que entra no OEE reportado e na meta do turno.']]],
  scrapTurno: ['Scrap do turno', [['O que é?', 'Peças refugadas no turno, por máquina ou só o total. O total entra na Qualidade (Q) do OEE. O gel tem a pesagem própria no mesmo popup.']]]
});
