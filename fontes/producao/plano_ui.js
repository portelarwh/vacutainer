/* ===== Produção 2.4.42 · filtros da tabela "Ordens do mês" (Plano do mês; homologação de 10/11/2026) =====
   Busca (ordem, lote, catálogo), situação (abertas, concluídas, atrasadas, em produção) e período (hoje, ontem, esta semana, semana
   passada, um dia) pelo intervalo da ordem: início (real, apurado ou previsto) até o fim (real, apurado ou previsto). Só filtra a tela;
   a ordenação continua pelo título da coluna. Entra no script principal pelo build.py (antes do boot). */
const OrdF = { q: '', st: '', per: '', dia: '',
  faixa() {
    const h = U.today(), wd = (new Date(h + 'T12:00:00').getDay() + 6) % 7, seg = U.addDays(h, -wd);
    return { hoje: [h, h], ontem: [U.addDays(h, -1), U.addDays(h, -1)], semana: [seg, U.addDays(seg, 6)], semanaPassada: [U.addDays(seg, -7), U.addDays(seg, -1)], dia: this.dia ? [this.dia, this.dia] : null }[this.per] || null;
  },
  barra() {
    const o = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
    return `<div class="row ordf" style="gap:8px;flex-wrap:wrap;align-items:end;margin:6px 0 8px">
      <label class="f"><span>Buscar</span><input id="ofQ" value="${esc(this.q)}" placeholder="ordem, lote ou catálogo" style="min-width:200px"></label>
      <label class="f"><span>Situação</span><select id="ofSt">${o('', 'Todas', this.st)}${o('abertas', 'Abertas', this.st)}${o('producao', 'Em produção', this.st)}${o('atrasadas', 'Atrasadas', this.st)}${o('concluidas', 'Concluídas', this.st)}</select></label>
      <label class="f"><span>Período</span><select id="ofPer">${o('', 'Todo o mês', this.per)}${o('hoje', 'Hoje', this.per)}${o('ontem', 'Ontem', this.per)}${o('semana', 'Esta semana', this.per)}${o('semanaPassada', 'Semana passada', this.per)}${o('dia', 'Um dia…', this.per)}</select></label>
      ${this.per === 'dia' ? `<label class="f"><span>Dia</span><input type="date" id="ofDia" value="${esc(this.dia)}"></label>` : ''}
      <span class="small muted" id="ofN" style="align-self:center"></span>${this.q || this.st || this.per ? '<button type="button" class="btn sm" id="ofX">Limpar filtros</button>' : ''}</div>`;
  },
  aplicar(root) {
    const tb = root.querySelector('table.ord-t'); if (!tb) return;
    const plan = Engine.planFor(db(), App.planMonth, PLAN_LINE); if (!plan) return;
    const G = Engine.orderProgress(db(), plan), F = this.faixa(), q = U.norm(this.q || '');
    let n = 0, tot = 0;
    tb.querySelectorAll('tbody tr[id^="ord-"]').forEach(tr => {
      const o = (plan.orders || []).find(x => 'ord-' + x.id === tr.id); if (!o) return; tot++;
      const g = G.byOrder.get(o.id) || {}, sit = U.norm((tr.cells[tr.cells.length - 1] || {}).textContent || '');
      const ini = String(o.startReal || g.firstAt || o.start || '').slice(0, 10), fim = String(o.endReal || g.doneAt || o.end || ini).slice(0, 10) || ini;
      let ok = true;
      if (q) ok = U.norm([o.order, o.lot, o.code, catName(o.catalogId), o.desc].join(' ')).includes(q);
      if (ok && this.st) ok = { abertas: !/conclu/.test(sit), producao: /em producao/.test(sit), atrasadas: /atras/.test(sit), concluidas: /conclu/.test(sit) }[this.st];
      if (ok && F) ok = !!ini && ini <= F[1] && (fim || ini) >= F[0];
      tr.hidden = !ok; if (ok) n++;
    });
    const nn = root.querySelector('#ofN'); if (nn) nn.textContent = `${n} de ${tot} ordem(ns)`;
  },
  ligar(root) {
    const tw = root.querySelector('table.ord-t'); if (!tw) return;
    const box = tw.closest('.tw'); if (!box || root.querySelector('.ordf')) return;
    box.insertAdjacentHTML('beforebegin', this.barra());
    const re = () => { const b = root.querySelector('.ordf'); if (b) b.remove(); this.ligar(root); };
    const q = root.querySelector('#ofQ'); let t; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { this.q = q.value; this.aplicar(root); }, 150); };
    root.querySelector('#ofSt').onchange = e => { this.st = e.target.value; this.aplicar(root); };
    root.querySelector('#ofPer').onchange = e => { this.per = e.target.value; if (this.per === 'dia' && !this.dia) this.dia = U.today(); re(); };
    const d = root.querySelector('#ofDia'); if (d) { d.onchange = () => { this.dia = d.value; this.aplicar(root); }; if (typeof DateFields !== 'undefined') DateFields.enhance(root.querySelector('.ordf')); }
    const x = root.querySelector('#ofX'); if (x) x.onclick = () => { Object.assign(this, { q: '', st: '', per: '', dia: '' }); re(); };
    this.aplicar(root);
  }
};
(() => { const P = App.views.plan; App.views.plan = { ...P, render() { return P.render.apply(P, arguments); }, mount(root) { if (P.mount) P.mount.call(P, root); OrdF.ligar(root); } }; })();

/* ===== Produção 2.4.43 · ordem pelo lote do MES (aprovado pelo usuário em 10/11/2026) =====
   Cada lote tem uma ordem: quando o CSV do servidor (MES) traz o lote de uma ordem do plano, a ordem recebe exatamente as caixas dele
   (produzido = caixas × peças por caixa), com início e fim = 1ª e última caixa do lote, e fica concluída quando o lote termina (começou
   outro lote depois) ou quando atinge a quantidade. Essa produção sai da distribuição por sequência (a de sempre, que continua para
   as ordens sem lote no MES). A Qtde real ganha "✓ usar (MES)", aceito como os horários apurados (qtySrc = 'apurado'). */
const OrdLote = {
  nk(v) { const s = String(v ?? '').trim(); return /^\d+$/.test(s) ? s.replace(/^0+(?=\d)/, '') : s.toUpperCase(); },
  aplicar(db, plan, orders, P, chunks) {
    const out = new Set(); if (typeof ServerData === 'undefined' || !(db.server && (db.server.segments || []).length)) return out;
    let segs = []; try { segs = ServerData.segsOf(db, plan.lineId); } catch (e) { return out; } if (!segs.length) return out;
    const qty = +(db.settings || {}).serverBoxQty || 1000, byLot = new Map();
    for (const s of segs) { if (!s.lot) continue; const k = this.nk(s.lot); if (!byLot.has(k)) byLot.set(k, []); byLot.get(k).push(s); }
    for (const o of orders) {
      if (!o.lot) continue; const L = byLot.get(this.nk(o.lot)); if (!L || !L.length) continue;
      const n = L.reduce((a, s) => a + (s.n || 0), 0); if (!n) continue;
      const t0 = L.map(s => s.t0).sort()[0].slice(0, 16), t1 = L.map(s => s.t1).sort().pop().slice(0, 16);
      const terminou = segs.some(s => s.lot && this.nk(s.lot) !== this.nk(o.lot) && s.t0.slice(0, 16) > t1);
      const p = P.get(o.id); if (!p) continue;
      p.produced = n * qty; p.firstAt = t0; p.lastAt = t1; p.mes = { caixas: n, lote: o.lot, terminou };
      p.doneAt = terminou || p.produced >= p.target ? t1 : null; out.add(o.id);
      let r = p.produced;   // a produção lançada desse catálogo no intervalo do lote não vai para outra ordem
      for (const c of chunks) { if (r <= 0) break; if (c.cat !== o.catalogId || c.e <= t0 || c.s > t1 || !(c.good > 0)) continue; const t = Math.min(c.good, r); c.good -= t; r -= t; }
    }
    return out;
  },
  sugQ(o, g) {
    if (!g || !g.mes) return '';
    const ap = g.produced, v = o.qtyReal;
    if (v == null) return `<br><button type="button" class="btn xs acc" data-acc="${o.id}|qtyReal" title="Caixas do lote ${esc(g.mes.lote)} no MES × peças por caixa">✓ usar ${fq(ap)} (MES)</button>`;
    if (o.qtySrc === 'apurado') return v === ap ? '<br><span class="small muted">MES aceito</span>' : `<br><button type="button" class="btn xs acc warnb" data-acc="${o.id}|qtyReal|1">MES mudou: ${fq(ap)} · atualizar</button>`;
    return v !== ap ? `<br><span class="small muted" title="Valor digitado; o MES diz outro">MES: ${fq(ap)}</span>` : '';
  }
};
