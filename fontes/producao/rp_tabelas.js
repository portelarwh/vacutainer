/* ===== Produção 2.4.42 · Relatórios › Tabelas (pedido do usuário, 10/11/2026) =====
   Relatório só de tabela, sem gráfico, com filtros: período, dias da semana (ex.: só sábados), turno, família e catálogo.
   Modelos prontos: por turno, por dia, por semana, por mês, por dia da semana, por catálogo, por família, hora a hora, paradas e lotes
   do MES. Os números vêm do mesmo cálculo da Produção (Engine.periodResult com filtro de turno/catálogo/família: OEE = Σ boa ÷ Σ
   capacidade, sem média de médias). Sai como os outros relatórios: prévia, Excel (todas as linhas), PDF, texto e Outlook.
   Entra no script principal pelo build.py (antes do boot). */
const RpTab = {
  MODELOS: [
    ['turno', 'Produção por turno', 'Uma linha por dia e turno'],
    ['dia', 'Produção por dia', 'Uma linha por dia'],
    ['semana', 'Produção por semana', 'Segunda a domingo'],
    ['mes', 'Produção por mês', 'Uma linha por mês'],
    ['diasemana', 'Por dia da semana', 'Seg a Dom: total, média por dia e OEE'],
    ['catalogo', 'Por catálogo', 'Produção, meta e OEE de cada catálogo'],
    ['familia', 'Por família', 'Produção, meta e OEE de cada família'],
    ['hora', 'Hora a hora', 'Cada intervalo lançado'],
    ['paradas', 'Lista de paradas', 'Cada parada apontada'],
    ['lotes', 'Lotes do MES', 'Lote, catálogo, 1ª e última caixa, caixas']],
  WD: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  st(R) { if (!R.tab) R.tab = { mod: 'turno', from: U.addDays(U.today(), -6), to: U.today(), wd: [], turno: '', fam: '', cat: '' }; return R.tab; },
  /* ---------- filtros ---------- */
  params(R) {
    const T = this.st(R), d = db(), o = (v, l, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
    const shifts = (d.shifts || []).filter(s => !s.deleted), fams = (d.families || []).filter(f => !f.deleted), cats = (d.catalogs || []).filter(c => !c.deleted && (!T.fam || c.familyId === T.fam));
    return `<label class="f"><span>Modelo ${ib('rpTabelas')}</span><select id="rtMod">${this.MODELOS.map(([k, l]) => o(k, l, T.mod)).join('')}</select></label>
      <label class="f"><span>De</span><input type="date" id="rtFrom" value="${T.from}"></label><label class="f"><span>Até</span><input type="date" id="rtTo" value="${T.to}"></label>
      <div class="f"><span>Dias da semana</span><div class="seg">${[1, 2, 3, 4, 5, 6, 0].map(i => `<button type="button" data-rtwd="${i}" aria-pressed="${T.wd.includes(i)}" title="${T.wd.length ? '' : 'Nenhum marcado = todos'}">${this.WD[i]}</button>`).join('')}</div></div>
      <label class="f"><span>Turno</span><select id="rtTurno">${o('', 'Todos', T.turno)}${shifts.map(s => o(s.id, s.name || s.code, T.turno)).join('')}</select></label>
      <label class="f"><span>Família</span><select id="rtFam">${o('', 'Todas', T.fam)}${fams.map(f => o(f.id, f.code + (f.name ? ' · ' + f.name : ''), T.fam)).join('')}</select></label>
      <label class="f"><span>Catálogo</span><select id="rtCat">${o('', 'Todos', T.cat)}${cats.map(c => o(c.id, c.code + (c.name ? ' · ' + c.name.slice(0, 28) : ''), T.cat)).join('')}</select></label>`;
  },
  ligar(root, R, re) {
    const T = this.st(R), q = s => root.querySelector(s);
    const on = (id, k, fn) => { const el = q(id); if (el) el.onchange = () => { T[k] = el.value; if (fn) fn(); if (T.to < T.from) T.to = T.from; re(); }; };
    on('#rtMod', 'mod'); on('#rtFrom', 'from'); on('#rtTo', 'to'); on('#rtTurno', 'turno'); on('#rtFam', 'fam', () => { T.cat = ''; }); on('#rtCat', 'cat');
    root.querySelectorAll('[data-rtwd]').forEach(b => b.onclick = () => { const i = +b.dataset.rtwd; T.wd = T.wd.includes(i) ? T.wd.filter(x => x !== i) : T.wd.concat([i]); re(); });
  },
  /* ---------- dados ---------- */
  dias(T) {
    const d = db(); let L; try { L = Panel.ctx({ pre: 'custom', from: T.from, to: T.to, cmp: false, grp: 'day' }).days; } catch (e) { L = (d.productionDays || []).filter(x => !x.deleted && x.lineId === 'line_vac' && x.date >= T.from && x.date <= T.to); }
    return L.filter(x => !T.wd.length || T.wd.includes(U.weekday(x.date))).sort((a, b) => a.date < b.date ? -1 : 1);
  },
  filtro(T, shiftId) { const f = {}; if (shiftId || T.turno) f.shiftId = shiftId || T.turno; if (T.cat) f.catalogId = T.cat; else if (T.fam) f.familyId = T.fam; return f; },
  pr(days, f) { try { return Engine.periodResult(db(), days, f); } catch (e) { return null; } },
  cols: [['Produção boa', r => fq(r.good)], ['Meta', r => fq(r.metaOp)], ['Atend.', r => U.pct(r.attain, 1)], ['OEE', r => U.pct(r.oee, 2)], ['D', r => U.pct(r.D, 2)], ['P', r => U.pct(r.P, 2)], ['Q', r => r.Q == null ? '—' : U.pct(r.Q, 2)], ['Scrap (peças)', r => U.fmt(r.scrap)], ['Paradas (min)', r => U.fmt(r.aMin + (r.pMin || 0))]],
  tabela(cab, linhas, total) {
    const num = i => i > 0;
    return `<div class="tw"><table class="rt-t"><thead><tr>${cab.map((c, i) => `<th${num(i) && !/^(Data|Dia|Turno|Catálogo|Família|Lote|Código|Equipamento|Observação|Descrição|Intervalo|Semana|Mês|Início|Fim|1ª caixa|Última caixa|Ordem)/.test(c) ? ' class="n"' : ''}>${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${linhas.map(l => `<tr>${l.map((v, i) => `<td${num(i) && /^[−\-+]?[\d.,]+(%| min| un)?$/.test(String(v).trim()) ? ' class="n"' : ''}>${v}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cab.length}" class="muted">Sem dados para estes filtros.</td></tr>`}
      ${total ? `<tr class="total">${total.map((v, i) => `<td${i > 0 ? ' class="n"' : ''}>${v}</td>`).join('')}</tr>` : ''}</tbody></table></div>`;
  },
  model(R) {
    const T = this.st(R), d = db(), days = this.dias(T), u = unitLbl(), M = this.MODELOS.find(m => m[0] === T.mod) || this.MODELOS[0];
    const fNome = [T.wd.length ? 'só ' + T.wd.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(i => this.WD[i]).join(', ') : '', T.turno ? 'turno ' + ((d.shifts.find(s => s.id === T.turno) || {}).name || '') : '', T.cat ? 'catálogo ' + catName(T.cat) : T.fam ? 'família ' + ((d.families.find(f => f.id === T.fam) || {}).code || '') : ''].filter(Boolean).join(' · ');
    const base = ['Produção boa (' + u + ')', 'Meta (' + u + ')', 'Atend.', 'OEE', 'D', 'P', 'Q', 'Scrap (peças)', 'Paradas (min)'];
    const vals = r => r ? this.cols.map(([, f]) => f(r)) : this.cols.map(() => '—');
    const tot = this.pr(days, this.filtro(T)); let cab = [], L = [], total = null;
    const dl = date => `${U.brDate(date)}`, wdn = date => this.WD[U.weekday(date)];
    if (T.mod === 'turno') {
      cab = ['Data', 'Dia', 'Turno', 'Catálogo(s)'].concat(base, ['Responsável']);
      for (const day of days) { const res = Engine.computeDay(d, day);
        for (const sr of res.shifts) { if (T.turno && sr.ps.shiftId !== T.turno) continue; const r = this.pr([day], this.filtro(T, sr.ps.shiftId)); if (!r || (!r.good && !r.cap)) continue;
          const cs = [...new Set(res.flat.filter(f => f.ps === sr.ps && f.good && f.cat).map(f => catName(f.cat)))].join(', ');
          L.push([dl(day.date), wdn(day.date), esc(sr.ps.snap.name), esc(cs || '—')].concat(vals(r), [esc(sr.ps.responsible || (sr.ps.closing && sr.ps.closing.by) || '')])); } }
      total = ['Total', '', '', ''].concat(vals(tot), ['']);
    } else if (T.mod === 'dia') {
      cab = ['Data', 'Dia'].concat(base, ['Fora de turno (' + u + ')']);
      for (const day of days) { const r = this.pr([day], this.filtro(T)); if (!r || (!r.good && !r.cap)) continue; let fo = 0; try { const res = Engine.computeDay(d, day); fo = res.foraTurno ? res.foraTurno.pecas || 0 : 0; } catch (e) { }
        L.push([dl(day.date), wdn(day.date)].concat(vals(r), [fo ? fq(fo) : '—'])); }
      total = ['Total', ''].concat(vals(tot), ['']);
    } else if (T.mod === 'semana' || T.mod === 'mes' || T.mod === 'diasemana') {
      const G = new Map(), kOf = day => T.mod === 'semana' ? U.weekStart(day.date) : T.mod === 'mes' ? day.date.slice(0, 7) : String(U.weekday(day.date));
      for (const day of days) { const k = kOf(day); if (!G.has(k)) G.set(k, []); G.get(k).push(day); }
      const ks = [...G.keys()].sort((a, b) => T.mod === 'diasemana' ? ((+a + 6) % 7) - ((+b + 6) % 7) : a < b ? -1 : 1);
      cab = [T.mod === 'semana' ? 'Semana' : T.mod === 'mes' ? 'Mês' : 'Dia da semana', 'Dias com produção'].concat(base, ['Média por dia (' + u + ')']);
      for (const k of ks) { const ds = G.get(k), r = this.pr(ds, this.filtro(T)); if (!r) continue; const nd = ds.filter(x => { const y = this.pr([x], this.filtro(T)); return y && y.good > 0; }).length;
        const lb = T.mod === 'semana' ? `S${U.weekNum(k)} · ${U.brDate(k).slice(0, 5)} a ${U.brDate(U.addDays(k, 6)).slice(0, 5)}` : T.mod === 'mes' ? U.monthName(k + '-01') : this.WD[+k];
        L.push([esc(lb), String(nd)].concat(vals(r), [nd ? fq(r.good / nd) : '—'])); }
      total = ['Total', String(L.reduce((s, l) => s + (+l[1] || 0), 0))].concat(vals(tot), ['']);
    } else if (T.mod === 'catalogo' || T.mod === 'familia') {
      const lista = T.mod === 'catalogo' ? (d.catalogs || []).filter(c => !c.deleted && (!T.cat || c.id === T.cat) && (!T.fam || c.familyId === T.fam)) : (d.families || []).filter(f => !f.deleted && (!T.fam || f.id === T.fam));
      cab = [T.mod === 'catalogo' ? 'Catálogo' : 'Família', T.mod === 'catalogo' ? 'Família' : 'Catálogos'].concat(base);
      for (const x of lista) { const f = T.mod === 'catalogo' ? { catalogId: x.id } : { familyId: x.id }; if (T.turno) f.shiftId = T.turno; const r = this.pr(days, f); if (!r || !r.good) continue;
        L.push(T.mod === 'catalogo' ? [esc(x.code + (x.name ? ' · ' + x.name.slice(0, 30) : '')), esc((d.families.find(y => y.id === x.familyId) || {}).code || '—')].concat(vals(r)) : [esc(x.code + (x.name ? ' · ' + x.name : '')), String((d.catalogs || []).filter(c => c.familyId === x.id && !c.deleted).length)].concat(vals(r))); }
      L.sort((a, b) => (+String(b[2]).replace(/\./g, '').replace(',', '.') || 0) - (+String(a[2]).replace(/\./g, '').replace(',', '.') || 0));
      total = ['Total', ''].concat(vals(tot));
    } else if (T.mod === 'hora') {
      cab = ['Data', 'Turno', 'Intervalo', 'Catálogo', 'Meta (' + u + ')', 'Produção boa (' + u + ')', 'Desvio (' + u + ')', 'Atend.', 'Paradas (min)'];
      let sm = 0, sg = 0;
      for (const day of days) { const res = Engine.computeDay(d, day);
        for (const fl of res.flat) { if (T.turno && fl.ps.shiftId !== T.turno) continue; if (T.cat && fl.cat !== T.cat) continue; if (T.fam && !T.cat && (byIdCat(fl.cat) || {}).familyId !== T.fam) continue;
          sm += fl.metaOp || 0; sg += fl.good || 0;
          L.push([dl(day.date), esc(fl.ps.snap.name), U.range(fl.iv.start, fl.iv.end), esc(fl.cat ? catName(fl.cat) : '—'), fq(fl.metaOp), fl.good == null ? '—' : fq(fl.good), fl.good == null ? '—' : fqs(fl.good - fl.metaOp), fl.good == null || !fl.metaOp ? '—' : U.pct(fl.good / fl.metaOp, 1), U.fmt((fl.a || 0) + (fl.p || 0))]); } }
      total = ['Total', '', '', '', fq(sm), fq(sg), fqs(sg - sm), sm ? U.pct(sg / sm, 1) : '—', ''];
    } else if (T.mod === 'paradas') {
      cab = ['Data', 'Turno', 'Início', 'Fim', 'Min', 'Código', 'Descrição', 'Equipamento', 'Observação'];
      let sm = 0;
      for (const e of Engine.eventsIn(d, days)) { if (T.turno) { const ps = e.day.shifts.find(p => p.shiftId === T.turno); if (!ps || !e.shifts.includes(ps.snap.name)) continue; } if (T.cat && e.catalogId !== T.cat) continue;
        sm += e.minutes || 0;
        L.push([dl(e.day.date), esc(e.shifts.join(', ')), e.ev.start != null ? U.hhmm(e.ev.start) : '—', e.ev.end != null ? U.hhmm(e.ev.end) : '—', U.fmt(e.minutes), esc(e.code.code || ''), esc(e.code.name || ''), esc(e.ev.equipment || ''), esc((e.ev.note || '').slice(0, 120))]); }
      total = ['Total', '', '', '', U.fmt(sm), '', '', '', ''];
    } else if (T.mod === 'lotes') {
      cab = ['Lote', 'Catálogo', '1ª caixa', 'Última caixa', 'Caixas', 'Produção (' + u + ')', 'Ordem'];
      const S = ServerData, qty = +(d.settings || {}).serverBoxQty || 1000, byLot = S.orderByLot ? S.orderByLot(d, 'line_vac') : new Map(), G = new Map();
      for (const s of S.segsOf(d, 'line_vac')) { const dia = s.t0.slice(0, 10); if (dia < T.from || dia > T.to) continue; if (T.wd.length && !T.wd.includes(U.weekday(dia))) continue;
        const c = (d.catalogs || []).find(x => !x.deleted && String(x.code) === String(s.cat)); if (T.cat && (!c || c.id !== T.cat)) continue; if (T.fam && !T.cat && (!c || c.familyId !== T.fam)) continue;
        const g = G.get(s.lot) || { lot: s.lot, cat: s.cat, t0: s.t0, t1: s.t1, n: 0 }; g.n += s.n; if (s.t0 < g.t0) g.t0 = s.t0; if (s.t1 > g.t1) g.t1 = s.t1; G.set(s.lot, g); }
      const br = t => `${t.slice(8, 10)}/${t.slice(5, 7)}/${t.slice(0, 4)} ${t.slice(11, 16)}`;
      for (const g of [...G.values()].sort((a, b) => a.t0 < b.t0 ? -1 : 1)) { const m = byLot.get ? byLot.get(g.lot) : null;
        L.push([esc(g.lot || '—'), esc(g.cat || '—'), br(g.t0), br(g.t1), U.fmt(g.n), fq(g.n * qty), esc(m && m.o ? m.o.order || '—' : '—')]); }
      const nt = [...G.values()].reduce((s, g) => s + g.n, 0); total = ['Total', '', '', '', U.fmt(nt), fq(nt * qty), ''];
    }
    const html = this.tabela(cab, L, L.length ? total : null) + `<p class="small muted">${L.length} linha(s)${fNome ? ' · ' + esc(fNome) : ''}. OEE do total = Σ produção boa ÷ Σ capacidade (sem média de médias). No Excel saem todas as linhas.</p>`;
    const kpis = tot && T.mod !== 'paradas' && T.mod !== 'lotes' ? [{ l: 'Produção boa', v: fq(tot.good), u }, { l: 'Atendimento', v: U.pct(tot.attain, 1) }, { l: 'OEE', v: U.pct(tot.oee, 2) }, { l: 'Dias', v: String(days.length) }] : [];
    const auto = `${M[1]} de ${U.brDate(T.from)} a ${U.brDate(T.to)}${fNome ? ' (' + fNome + ')' : ''}: ${L.length} linha(s).` + (tot && T.mod !== 'paradas' && T.mod !== 'lotes' ? ` Produção boa ${fq(tot.good)} ${u}, atendimento ${U.pct(tot.attain, 1)}, OEE ${U.pct(tot.oee, 2)}.` : '');
    return { type: 'tables', title: 'Tabela · ' + M[1], sub: `${U.brDate(T.from)} a ${U.brDate(T.to)}${fNome ? ' · ' + fNome : ''}`, a: T.from, b: T.to, x: null, kpis, blocks: [{ id: 'tab', l: M[1], w: 'f', html }], key: `tables:${T.mod}:${T.from}:${T.to}:${T.wd.join('')}:${T.turno}:${T.fam}:${T.cat}`, auto };
  }
};
const byIdCat = id => (db().catalogs || []).find(c => c.id === id);
RP_TYPES.push(['tables', 'Tabelas', 'Só tabela, sem gráfico: produção por turno, dia, semana, mês, dia da semana, catálogo, família, hora a hora, paradas e lotes, com filtros (ex.: só sábados).']);
(() => { const m0 = rpModel; rpModel = function (R) { return R.type === 'tables' ? RpTab.model(R) : m0(R); }; })();
HELP.rpTabelas = ['Relatório em tabela', [['O que é?', 'Relatório só com tabela, sem gráfico. Escolha o modelo (por turno, dia, semana, mês, dia da semana, catálogo, família, hora a hora, paradas ou lotes do MES) e filtre por período, dias da semana, turno, família e catálogo. Sai em Excel com todas as linhas, PDF, texto ou Outlook.'], ['Exemplo', 'Produção de todos os sábados de outubro do catálogo 360057: modelo "Produção por dia", De 01/10 Até 31/10, marque só Sáb e escolha o catálogo.']]];
