/* ===== Produção 2.4.37 · OEE real pela linha do tempo, cartões dos turnos com as caixas do MES e editor de cartões (10/11/2026) =====
   OEE real (regra do usuário, espelhada no início e no fim): tempo planejado do dia = o dos turnos produtivos + o tempo FORA dos turnos
   em que a linha produziu.
     - início = o menor entre o início do 1º turno produtivo e a 1ª caixa (começou antes, na janela do turno não produtivo → conta da
       1ª caixa; começou atrasado → conta do início do turno e o atraso é perda);
     - fim = o maior entre o fim do último turno produtivo e a última caixa (parou antes do fim sem justificativa → conta até o fim do
       turno; passou do horário → conta até a última caixa);
     - justificativa = o que já sai do tempo planejado no OEE (parada que desconta do planejado, abono, turno sem produção programado);
     - trecho fora de turno entre dois turnos produtivos (buraco no meio do dia) soma o próprio tempo (1ª à última caixa).
     Produção = a mesma do OEE reportado (todas as caixas, inclusive as reatribuídas). Capacidade extra = PPH dos catálogos do trecho ×
     minutos fora do turno. O OEE reportado (oficial), o fechamento e os exports não mudam; o real é calculado na hora.
   Cartões dos turnos: 1ª e última caixa do MES na janela do turno, trocas de lote (fim do lote anterior → início do novo, duração; a
   troca conta no turno em que o novo lote começou) e o total de troca. Turno não produtivo com caixas na janela ganha um cartão só de
   leitura (caixas, produção, para onde foi, OEE do trecho, trocas).
   Editor de cartões: "Editar cards" no cabeçalho do dia liga e desliga cada indicador da faixa de cima (preferência deste computador).
   Entra no script principal pelo build.py (antes do boot). */
const OeeReal = {
  /* ---------- cálculo ---------- */
  dia(d, day, res) {
    if (!day || !res || !res.agg) return null;
    const a = res.agg, ft = res.foraTurno, out = { good: a.good || 0, cap: a.cap || 0, capExtra: 0, antes: 0, depois: 0, meio: 0, fora: ft ? ft.pecas || 0 : 0 };
    out.rep = a.cap > 0 ? a.good / a.cap : null;
    const its = ft ? (ft.recebe || []).filter(i => !(ft.semAlvo || []).includes(i)) : [];
    if (its.length) {
      let T = []; try { T = ForaTurno.turnosDoDia(d, day.date, day.lineId).filter(x => x.prod); } catch (e) { }
      const s0 = T.length ? Math.min(...T.map(x => x.s)) : null, e0 = T.length ? Math.max(...T.map(x => x.e)) : null;
      const dd = it => Math.round((Date.UTC(+it.data.slice(0, 4), +it.data.slice(5, 7) - 1, +it.data.slice(8, 10)) - Date.UTC(+day.date.slice(0, 4), +day.date.slice(5, 7) - 1, +day.date.slice(8, 10))) / 864e5) * 1440;
      const pph = L => { const p = U.sum(L, i => i.pecas), h = U.sum(L, i => i.goodMin) / 60; return h > 0 ? p / h : 0; };
      const A = [], D = [], M = []; let ini = s0, fim = e0;
      for (const it of its) {
        const x0 = it.t0 + dd(it), x1 = it.t1 + dd(it) + 1;
        if (s0 == null) { M.push(it); out.meio += it.planMin || 0; continue; }
        if (x0 < s0) { A.push(it); ini = Math.min(ini, x0); } else if (x1 > e0) { D.push(it); fim = Math.max(fim, x1); } else { M.push(it); out.meio += it.planMin || 0; }
      }
      if (s0 != null) { out.antes = Math.max(0, s0 - ini); out.depois = Math.max(0, fim - e0); }
      out.capExtra = pph(A) * out.antes / 60 + pph(D) * out.depois / 60 + pph(M) * out.meio / 60;
    }
    out.extraMin = out.antes + out.depois + out.meio;
    out.real = out.cap + out.capExtra > 0 ? out.good / (out.cap + out.capExtra) : null;
    return out;
  },
  periodo(days) {
    const d = db(), s = { good: 0, cap: 0, capExtra: 0, fora: 0, extraMin: 0, n: 0 };
    for (const day of days || []) { if (!day || day.deleted || (day.shifts || []).every(p => p.summary)) continue; let res; try { res = Engine.computeDay(d, day); } catch (e) { continue; }
      const x = this.dia(d, day, res); if (!x) continue; s.good += x.good; s.cap += x.cap; s.capExtra += x.capExtra; s.fora += x.fora; s.extraMin += x.extraMin; s.n++; }
    s.rep = s.cap > 0 ? s.good / s.cap : null; s.real = s.cap + s.capExtra > 0 ? s.good / (s.cap + s.capExtra) : null; s.foraPct = s.good > 0 ? s.fora / s.good : null;
    return s;
  },
  /* ---------- indicadores (Lançamento e Visão Geral) ---------- */
  kpis(day, res) {
    const x = this.dia(db(), day, res); if (!x) return '';
    return `${kpi('OEE reportado', U.pct(x.rep), '', x.fora ? 'com a reatribuição (oficial)' : 'oficial · sem produção fora de turno')}`
      + `${kpi('OEE real', U.pct(x.real), '', x.extraMin ? `+${U.fmt(x.extraMin)} min fora do turno no tempo planejado` : 'igual ao reportado (sem produção fora de turno)')}`
      + `${kpi('Fora de turno', fq(x.fora), unitLbl(), x.good ? `${U.pct(x.fora / x.good, 1)} da produção boa reportada` : '')}`;
  },
  overview(days, pdays) {
    const s = this.periodo(days), p = pdays && pdays.length ? this.periodo(pdays) : null;
    return `<div class="kpis section">${A.kpiCmp('OEE reportado', s.rep, v => U.pct(v), { pct: true, prev: p && p.rep, sub: 'oficial: produção fora de turno somada ao turno que a recebe' })}`
      + `${A.kpiCmp('OEE real', s.real, v => U.pct(v), { pct: true, prev: p && p.real, sub: s.extraMin ? `+${U.fmt(s.extraMin)} min fora do turno no tempo planejado` : 'igual ao reportado no período' })}`
      + `${A.kpiCmp('Fora de turno', s.fora, v => fq(v), { unit: unitLbl(), prev: p && p.fora, higher: false, sub: s.foraPct != null ? `${U.pct(s.foraPct, 1)} da produção boa reportada` : '' })}</div>`;
  },
  /* ---------- caixas do MES por turno ---------- */
  hhmm(m, base) { const x = ((Math.round(m - base) % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); },
  dur(min) { min = Math.round(min); return min >= 60 ? `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}` : `${min} min`; },
  janelaPs(ps) { const iv = (ps.intervals || []).filter(i => !i.deleted); if (iv.length) return [Math.min(...iv.map(i => i.start)), Math.max(...iv.map(i => i.end))]; let s = U.toMin(ps.snap.start), e = U.toMin(ps.snap.end); if (s == null || e == null) return null; if (e <= s) e += 1440; return [s, e]; },
  mes(d, day, a, b) {
    const S = ServerData; if (!(d.server && (d.server.segments || []).length)) return null;
    const base = S.dayStartMin(day.date), A0 = base + a, B0 = base + b;
    let bx = []; try { bx = ForaTurno.caixas(d, day.lineId, A0, B0, day.date); } catch (e) { return null; }
    let ch = []; try { ch = S.changes(d, day.lineId).filter(c => { const f = S.tm(c.first); return f >= A0 && f < B0; }); } catch (e) { }
    if (!bx.length && !ch.length) return { base, n: 0, trocas: [] };
    return { base, n: bx.length, m0: bx.length ? bx[0].m : null, m1: bx.length ? bx[bx.length - 1].m : null,
      trocas: ch.map(c => ({ de: c.fromLot, para: c.toLot, deCat: c.fromCat, paraCat: c.toCat, fim: S.tm(c.last), ini: S.tm(c.first), min: c.min, kind: c.kind })) };
  },
  mesHtml(x) {
    if (!x) return '';
    if (!x.n && !x.trocas.length) return `<div class="kv" style="grid-column:1/-1"><span class="l">Caixas do MES ${ib('mesTurno')}</span><span class="v muted small">nenhuma caixa nesta janela</span></div>`;
    const tot = U.sum(x.trocas, t => t.min);
    return `<div class="kv" style="grid-column:1/-1"><span class="l">Caixas do MES ${ib('mesTurno')}</span><span class="v">${x.n ? `1ª ${this.hhmm(x.m0, x.base)} · última ${this.hhmm(x.m1, x.base)}` : '—'} <span class="small muted">· ${U.fmt(x.n)} caixa(s)</span></span>
      ${x.trocas.length ? `<div class="small" style="margin-top:4px">${x.trocas.map(t => `<div>Troca de ${t.kind === 'catalogo' ? 'catálogo' : 'lote'}: <b>${esc(t.de || '?')}</b>${t.kind === 'catalogo' ? ` (${esc(t.deCat || '')})` : ''} terminou ${this.hhmm(t.fim, x.base)} → <b>${esc(t.para || '?')}</b>${t.kind === 'catalogo' ? ` (${esc(t.paraCat || '')})` : ''} começou ${this.hhmm(t.ini, x.base)} · <b>${this.dur(t.min)}</b></div>`).join('')}<div class="muted">Total de troca no turno: <b>${this.dur(tot)}</b></div></div>` : ''}</div>`;
  },
  turno(day, ps) { if (ps.summary) return ''; const w = this.janelaPs(ps); if (!w) return ''; return this.mesHtml(this.mes(db(), day, w[0], w[1])); },
  /* cartões dos turnos não produtivos com caixas na janela (só leitura) */
  cardsNP(day, res) {
    const ft = res && res.foraTurno; if (!ft) return '';
    const J = (ft.janela || []).filter(i => i.data === day.date); if (!J.length) return '';
    const G = new Map(); for (const it of J) { const k = it.a + '|' + it.b; if (!G.has(k)) G.set(k, []); G.get(k).push(it); }
    return [...G.values()].map(L => {
      const w = L[0], pecas = U.sum(L, i => i.pecas), cx = U.sum(L, i => i.caixas), x = this.mes(db(), day, w.a, w.b);
      const pl = U.sum(L, i => i.planMin), gm = U.sum(L, i => i.goodMin), oee = pl > 0 ? gm / pl : null;
      const nome = String(w.rotulo || 'fora dos turnos').replace(/^janela do /, '').replace(/ \(não produtivo\)$/, '');
      return `<section class="shift np" style="opacity:.92"><header><span class="sw" style="background:var(--muted)"></span><h3>${esc(nome.charAt(0).toUpperCase() + nome.slice(1))} <span class="muted small">${this.hhmm(w.a, 0)}–${this.hhmm(w.b, 0)}</span></h3><span class="pill none" title="Turno não produtivo: as caixas desta janela foram somadas ao turno indicado (OEE reportado)">não produtivo</span></header>
        <div class="body"><div class="kv"><span class="l">Produção na janela ${ib('turnoNPCard')}</span><span class="v">${fq(pecas)} ${unitLbl()}</span><span class="small muted">${U.fmt(cx)} caixa(s)</span></div>
        <div class="kv"><span class="l">Contou em</span><span class="v">${L.map(i => i.alvo ? esc(i.alvo.name) + (i.alvo.date !== day.date ? ' de ' + U.brDate(i.alvo.date) : '') : '<span class="ferr">sem turno para receber</span>').filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</span><span class="small muted">${esc(L[0].regra || '')}</span></div>
        <div class="kv"><span class="l">OEE do trecho ${ib('foraTurnoOee')}</span><span class="v">${U.pct(oee)}</span><span class="small muted">1ª à última caixa</span></div>
        ${this.mesHtml(x)}
        <p class="small muted" style="grid-column:1/-1">Só leitura. Para lançar neste turno como produtivo, use "Habilitar turno" no quadro do dia.</p></div></section>`;
    }).join('');
  }
};
/* ---------- editor de cartões (faixa de indicadores do Lançamento; preferência deste computador) ---------- */
const KC = {
  chave(el) { if (el.classList.contains('kpi-cat')) return 'Catálogo'; const l = el.querySelector('.l'); if (!l) return ''; const c = l.cloneNode(true); c.querySelectorAll('.ib,button').forEach(b => b.remove()); return c.textContent.trim(); },
  off() { const L = App.prefs.kcOff; return Array.isArray(L) ? L : []; },
  filtrar(html) {
    const t = document.createElement('template'); t.innerHTML = html; const box = t.content.querySelector('.kpis'); if (!box) return html;
    const off = new Set(this.off()), todos = [];
    [...box.children].forEach(el => { if (!el.classList.contains('kpi')) return; const k = this.chave(el); if (!k) return; todos.push(k); if (off.has(k)) el.remove(); });
    KC.ultimos = todos; return t.innerHTML;
  },
  editar() {
    const L = KC.ultimos || [], off = new Set(this.off());
    modal('Editar cards', `<p class="small muted">Escolha os indicadores que aparecem no topo do Lançamento. Vale só neste computador; os números não mudam.</p>
      <div class="form">${L.map(k => `<label class="f chk"><input type="checkbox" data-kc="${esc(k)}" ${off.has(k) ? '' : 'checked'}> ${esc(k)}</label>`).join('')}</div>`,
      `<button class="btn ghost" id="kcTodos">Mostrar todos</button><span class="spacer"></span><button class="btn primary" data-close>Pronto</button>`,
      el => {
        const salvar = () => { App.prefs.kcOff = [...el.querySelectorAll('[data-kc]')].filter(c => !c.checked).map(c => c.dataset.kc); savePrefs(); render(); };
        el.querySelectorAll('[data-kc]').forEach(c => c.onchange = salvar);
        el.querySelector('#kcTodos').onclick = () => { el.querySelectorAll('[data-kc]').forEach(c => { c.checked = true; }); salvar(); };
      });
  }
};
Object.assign(HELP, {
  oeeRep: ['OEE reportado', [['O que é?', 'O OEE oficial do dia: a produção feita fora dos turnos (janela de turno não produtivo) é somada ao turno que a recebe, e o tempo planejado é só o dos turnos. É o que vai para o fechamento, o relatório e o Portal.'], ['Exemplo', 'O B emendou 1h na janela do C: as caixas contam no B, mas o tempo continua o do B. Por isso a performance pode passar de 100%.']]],
  oeeReal: ['OEE real', [['O que é?', 'O OEE pela linha do tempo real: mesma produção, mas o tempo planejado inclui o tempo fora do turno em que a linha produziu.'], ['Como conta o tempo?', 'Início: o menor entre o início do 1º turno e a 1ª caixa (começou atrasado = perda; começou antes = conta da 1ª caixa). Fim: o maior entre o fim do último turno e a última caixa (parou antes sem justificativa = conta até o fim do turno; passou do horário = conta até a última caixa). Justificativa = parada que desconta do planejado, abono ou turno sem produção programado.'], ['Exemplo', 'B termina 22:47 e a última caixa saiu 23:40: o tempo planejado ganha 53 min e o OEE real fica abaixo do reportado.']]],
  foraTurnoKpi: ['Fora de turno', [['O que é?', 'Produção boa feita fora dos turnos produtivos (janela do turno não produtivo ou madrugada sem turno) e somada a um turno pela regra de continuidade.'], ['Exemplo', '19 mil = 19 caixas de 1.000 feitas depois das 22:47 e contadas no B.']]],
  mesTurno: ['Caixas do MES no turno', [['O que é?', 'Hora da 1ª e da última caixa do servidor (MES) dentro da janela do turno e as trocas de lote ou de catálogo: quando terminou o lote anterior, quando começou o novo e quanto tempo durou. A troca conta no turno em que o novo lote começou.'], ['Exemplo', 'Lote 6299948 terminou 10:42 → 6299950 começou 11:15 · 33 min.']]],
  turnoNPCard: ['Turno não produtivo com produção', [['O que é?', 'A janela de um turno marcado como não produtivo no Portal em que passaram caixas. A produção não fica nele: vai para o turno anterior (se emendou) ou para o seguinte, e entra no OEE reportado desse turno.']]]
});
Object.assign(KPI_HELP, { 'OEE reportado': 'oeeRep', 'OEE real': 'oeeReal', 'Fora de turno': 'foraTurnoKpi' });
