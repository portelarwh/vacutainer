/* ===== Produção 2.4.49 · Visão Geral padrão organizada (docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md, aprovado em 11/11/2026) =====
   Só a apresentação da visão "Visão Geral · padrão": a montagem original (filtros, Decide, cartões, Mais indicadores, 13 gráficos) é
   renderizada como antes e, no mount, os mesmos nós são reorganizados (nenhum número é recalculado de outro jeito; os gráficos não
   são redesenhados, então tooltips e cliques continuam os mesmos):
     cabeçalho "Visão geral da operação" com uma fileira de ações (sem o Imprimir repetido) · filtros com "Limpar" e "Mais filtros" no celular ·
     01 Situação do período (OEE × meta × desvio × período anterior; Ação prioritária; maior perda da cascata e 1ª parada do Pareto) ·
     02 Indicadores (Editar cards como antes; em "Mais indicadores", Produção boa e Capacidade só quando desligadas na grade) ·
     03 Diagnóstico rápido (melhor e pior dia do OEE, confiabilidade do apontamento) ·
     04 Análises em 6 grupos recolhíveis (App.prefs.vgGrupo; não colide com App.prefs.vgFold dos blocos), com aviso quando o período
        não sustenta a leitura (1 dia, tendência com menos de 2 semanas/meses) · 05 Explorar dados (rotas existentes).
   Meu painel, visões compartilhadas e modelos (Panel) não passam por aqui. Impressão: grupos sempre abertos. */
const VGL = (() => {
  const GRUPOS = [
    ['A', 'Produção e plano', 'A produção acompanhou a meta e a capacidade?', ['Produção boa × meta e capacidade', 'Atendimento por hora do dia']],
    ['B', 'Eficiência do OEE', 'Quanto do tempo virou produção boa, e qual componente pesou?', ['OEE × meta', 'Disponibilidade, Performance e Qualidade', 'PPH real × nominal']],
    ['C', 'Perdas e confiabilidade', 'Onde está a maior perda e o que a explica?', ['Cascata de perdas do período', 'Pareto de paradas', 'Perdas em minutos por dia']],
    ['D', 'Qualidade', 'O refugo piorou em algum dia?', ['Scrap % por dia']],
    ['E', 'Resultado operacional', 'Algum turno ou catálogo destoa?', ['Resultado por turno', 'Produção por catálogo']],
    ['F', 'Evolução histórica', 'O resultado melhora com o tempo?', ['Tendência semanal', 'Tendência mensal']]];
  const css = `
#main[data-rota="overview"] .vgl-hd{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:4px 0 10px}
#main[data-rota="overview"] .vgl-hd h2{margin:0;font-family:var(--f-body);font-size:22px;font-weight:700;text-transform:none;letter-spacing:0}
#main[data-rota="overview"] .vgl-hd p{margin:2px 0 0;color:var(--muted);font-size:13.5px}
.vgl-sec{margin:22px 0 10px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.vgl-sec b{font-family:var(--f-body);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.vgl-sec h3{margin:0;font-family:var(--f-body);font-size:18px;font-weight:700;text-transform:none;letter-spacing:0}
.vgl-sec span{color:var(--muted);font-size:13px}
.vgl-sit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:14px}
@media (max-width:980px){.vgl-sit{grid-template-columns:1fr}}
.vgl-oee{padding:18px 20px;display:grid;gap:8px;align-content:start}
.vgl-oee .l{font-size:13.5px;font-weight:600}
.vgl-oee .row1{display:flex;gap:22px;align-items:baseline;flex-wrap:wrap}
.vgl-oee .big{font-size:40px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.05}
.vgl-oee .mt{display:grid;gap:2px;font-size:13px;color:var(--muted)}.vgl-oee .mt b{font-size:17px;color:var(--ink);font-variant-numeric:tabular-nums}
.vgl-bar{height:12px;border-radius:999px;background:var(--surface-2);overflow:hidden;position:relative}
.vgl-bar i{display:block;height:100%;border-radius:999px;background:var(--info)}.vgl-bar i.ok{background:var(--ok)}.vgl-bar i.crit{background:var(--crit)}
.vgl-st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-weight:700;font-size:12.5px;width:max-content}
.vgl-st.ok{background:var(--ok-bg);color:var(--ok)}.vgl-st.crit{background:var(--crit-bg);color:var(--crit)}.vgl-st.none{background:var(--none-bg);color:var(--muted)}
.vgl-acao{display:grid;gap:10px;align-content:start}.vgl-acao .decide{margin:0}
.vgl-perda{padding:14px 18px;display:grid;gap:8px}
.vgl-perda h4{margin:0;font-family:var(--f-body);font-size:14px;font-weight:700;text-transform:none;letter-spacing:0}
.vgl-perda ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}.vgl-perda li{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px}
.vgl-perda li .v{font-weight:700;font-variant-numeric:tabular-nums}
.vgl-dg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (max-width:900px){.vgl-dg{grid-template-columns:1fr}}
.vgl-dc{padding:14px 18px;display:grid;gap:4px;text-align:left;cursor:pointer;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:inherit;font:inherit;min-height:44px}
.vgl-dc:hover{border-color:var(--accent)}.vgl-dc:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.vgl-dc .l{font-size:13px;color:var(--muted)}.vgl-dc .v{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}.vgl-dc .s{font-size:13px;color:var(--muted)}
.vgl-dc[disabled]{cursor:default}.vgl-dc[disabled]:hover{border-color:var(--line)}
.vgl-grp{border:1px solid var(--line);border-radius:12px;background:var(--surface-3,var(--bg));margin:0 0 14px}
.vgl-gh{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;background:none;cursor:pointer;text-align:left;color:inherit;font:inherit;min-height:48px;border-radius:12px}
.vgl-gh:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.vgl-gh .seta{width:18px;color:var(--muted)}.vgl-gh .t{font-family:var(--f-body);font-size:16px;font-weight:700}.vgl-gh .q{color:var(--muted);font-size:13px}.vgl-gh .n{margin-left:auto;color:var(--muted);font-size:12.5px;white-space:nowrap}
.vgl-gb{padding:0 14px 14px}.vgl-grp.fechado .vgl-gb{display:none}
.vgl-est{margin:-2px 0 8px;padding:6px 10px;border-radius:8px;background:var(--warn-bg);color:var(--warn);font-size:12.5px;font-weight:600}
.vgl-exp{padding:14px 18px;display:grid;gap:10px}.vgl-exp .row{gap:8px;flex-wrap:wrap}.vgl-exp .btn{min-height:40px}
.vgl-mais{display:none}
@media (max-width:700px){#main[data-rota="overview"] #gFilters:not(.vgl-aberto) label.f:has(select[name="lineId"]),#main[data-rota="overview"] #gFilters:not(.vgl-aberto) label.f:has(select[name="machineId"]),#main[data-rota="overview"] #gFilters:not(.vgl-aberto) label.f:has(select[name="catalogId"]),#main[data-rota="overview"] #gFilters:not(.vgl-aberto) label.f:has(select[name="shiftId"]),#main[data-rota="overview"] #gFilters:not(.vgl-aberto) label.f:has(select[name="status"]){display:none}.vgl-mais{display:inline-flex}.vgl-oee .big{font-size:34px}}
@media print{.vgl-grp.fechado .vgl-gb{display:block!important}.vgl-gh .seta,.vgl-exp{display:none!important}}`;
  function estilo() { if (document.getElementById('vglCss')) return; const s = document.createElement('style'); s.id = 'vglCss'; s.textContent = css; document.head.appendChild(s); }
  const F = () => { const g = App.prefs.vgGrupo; return g && typeof g === 'object' ? g : (App.prefs.vgGrupo = {}); };
  const titulo = sc => { const h = sc.querySelector(':scope > header h3'); return h ? h.textContent.replace(/[▾▸]/g, '').replace(/\s+/g, ' ').trim() : ''; };
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const sec = (n, t, s) => el(`<div class="vgl-sec"><b>${n}</b><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>`);
  function dados() {
    const days = filteredDays(); if (!days.length) return null;
    const rows = A.dayRows(days), r = aggF(days), pf = A.prevRange(App.filters), pd = filteredDays(pf), pr = pd.length ? aggF(pd, pf) : null;
    return { days, rows, r, pf, pd, pr, weeks: A.byWeek(rows), months: A.byMonth(rows), par: A.pareto(A.events(days), 'codigo'), rel: oeeReliability(days) };
  }
  function situacao(D) {
    const r = D.r, pr = D.pr, temMeta = r.oeeTarget != null && r.oee != null, st = r.oee == null ? 'none' : !temMeta ? 'none' : r.oee >= r.oeeTarget ? 'ok' : 'crit';
    const rot = r.oee == null ? 'Sem dados' : !temMeta ? 'Sem meta vigente' : st === 'ok' ? 'Na meta' : 'Abaixo da meta';
    const pc = temMeta && r.oeeTarget > 0 ? Math.min(100, r.oee / r.oeeTarget * 100) : null;
    const dPrev = pr && pr.oee != null && r.oee != null ? r.oee - pr.oee : null;
    return `<section class="card vgl-oee" aria-label="OEE do período"><span class="l">OEE do período ${ib('oee')}</span>
      <div class="row1"><span class="big">${r.oee == null ? '—' : U.pct(r.oee)}</span>
        <span class="mt"><span>Meta vigente</span><b>${r.oeeTarget == null ? '—' : U.pct(r.oeeTarget)}</b></span>
        <span class="mt"><span>Desvio</span><b>${r.oeeGap == null ? '—' : (r.oeeGap >= 0 ? '+' : '') + U.pp(r.oeeGap)}</b></span></div>
      ${pc == null ? '' : `<div class="vgl-bar" role="progressbar" aria-label="OEE em relação à meta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pc)}"><i class="${st}" style="width:${pc.toFixed(1)}%"></i></div>`}
      <span class="vgl-st ${st}">${rot}</span>
      <span class="small muted">${dPrev == null ? `Sem dados no período anterior (${U.brDate(D.pf.from)} – ${U.brDate(D.pf.to)}).` : `Período anterior (${U.brDate(D.pf.from)} – ${U.brDate(D.pf.to)}): ${U.pct(pr.oee)} · ${dPrev >= 0 ? '▲ +' : '▼ '}${U.pp(dPrev)}`}</span>
      <span class="small muted">${D.days.length} dia(s) com lançamento · ${U.brDate(App.filters.from)} – ${U.brDate(App.filters.to)}</span></section>`;
  }
  function maiorPerda(D) {
    const st = ((D.r.cascade || {}).steps || []).filter(s => !s.kind && s.value < -0.5).sort((a, b) => a.value - b.value)[0], p = D.par[0];
    const li = [];
    if (st) li.push(`<li><span>Maior etapa da cascata: <b>${esc(st.label)}</b></span><span class="v">${fq(-st.value)} ${esc(unitLbl())}${st.min != null && isFinite(st.min) ? ` · ${U.fmt(st.min)} min` : ''}</span><button type="button" class="btn xs" data-vgl-ir="cascata">Ver a cascata</button></li>`);
    if (p) li.push(`<li><span>Parada que mais tirou tempo: <b>${esc(p.label)}</b></span><span class="v">${U.fmt(p.value)} min · ${U.fmt(p.count)}×</span><button type="button" class="btn xs" data-vgl-ir="pareto">Ver eventos</button></li>`);
    return `<section class="card vgl-perda" aria-label="Maior perda do período"><h4>Maior perda do período ${ib('cascade')}</h4>${li.length ? `<ul>${li.join('')}</ul><span class="small muted">Números da cascata e do Pareto deste período. A causa é confirmada nos eventos.</span>` : '<span class="small muted">Sem perda calculada ou parada apontada no período.</span>'}</section>`;
  }
  function diagnostico(D) {
    const v = D.rows.filter(x => x.r.oee != null && isFinite(x.r.oee));
    const best = v.length ? v.reduce((a, b) => b.r.oee > a.r.oee ? b : a) : null, worst = v.length ? v.reduce((a, b) => b.r.oee < a.r.oee ? b : a) : null;
    const dia = (x, rot) => x ? `<button type="button" class="vgl-dc" data-vgl-dia="${esc(x.d.id)}"><span class="l">${rot}</span><span class="v">${U.pct(x.r.oee)}</span><span class="s">${U.brDate(x.d.date)} ${U.WD[U.weekday(x.d.date)]} · meta ${x.r.oeeTarget == null ? '—' : U.pct(x.r.oeeTarget)} · abrir o dia</span></button>`
      : `<button type="button" class="vgl-dc" disabled><span class="l">${rot}</span><span class="v">—</span><span class="s">Sem OEE calculado no período</span></button>`;
    const um = v.length === 1;
    return `<div class="vgl-dg">${dia(best, um ? 'Único dia com OEE' : 'Melhor dia (OEE)')}${um ? `<button type="button" class="vgl-dc" disabled><span class="l">Pior dia (OEE)</span><span class="v">—</span><span class="s">Só 1 dia no período</span></button>` : dia(worst, 'Pior dia (OEE)')}
      <button type="button" class="vgl-dc" data-vgl-rel="1"><span class="l">Confiabilidade do apontamento</span><span class="v">${esc(D.rel.level)}</span><span class="s">${esc(D.rel.txt)} · ver pendências</span></button></div>`;
  }
  function aviso(t, D) {
    const n = D.days.length;
    if (t === 'Tendência semanal' && D.weeks.length < 2) return `Só ${D.weeks.length} semana no período: a tendência aparece com 2 semanas ou mais.`;
    if (t === 'Tendência mensal' && D.months.length < 2) return `Só ${D.months.length} mês no período: a tendência aparece com 2 meses ou mais.`;
    if (n === 1 && ['Produção boa × meta e capacidade', 'OEE × meta', 'Disponibilidade, Performance e Qualidade', 'PPH real × nominal', 'Scrap % por dia', 'Perdas em minutos por dia'].includes(t)) return '1 dia no período: compare com a meta; não há tendência.';
    return '';
  }
  function grupos(root, D) {
    const grade = [...root.querySelectorAll(':scope .grid.g2.section')].find(g => [...g.children].some(c => GRUPOS.some(G => G[3].includes(titulo(c))))); if (!grade) return;
    const cards = [...grade.children].filter(c => c.matches('section.card')), usados = new Set(), frag = document.createDocumentFragment(), f = F();
    const um = (k, nome, q, lista) => {
      if (!lista.length) return;
      const fe = !!f[k], id = 'vglg' + k;
      const g = el(`<section class="vgl-grp${fe ? ' fechado' : ''}" data-vgl-grupo="${k}"><button type="button" class="vgl-gh" aria-expanded="${!fe}" aria-controls="${id}"><span class="seta" aria-hidden="true">${fe ? '▸' : '▾'}</span><span><span class="t">${k} · ${esc(nome)}</span><br><span class="q">${esc(q)}</span></span><span class="n">${lista.length} gráfico(s)</span></button><div class="vgl-gb" id="${id}"><div class="grid g2"></div></div></section>`);
      const body = g.querySelector('.grid');
      for (const c of lista) { const t = titulo(c), a = aviso(t, D); if (a && !c.querySelector('.vgl-est')) { const p = c.querySelector(':scope > p.q'); const n = el(`<p class="vgl-est" role="note">${esc(a)}</p>`); if (p) p.after(n); else c.appendChild(n); } body.appendChild(c); usados.add(c); }
      if (lista.length % 2 === 1) lista[lista.length - 1].style.gridColumn = '1/-1';   /* número ímpar: o último ocupa a linha inteira */
      frag.appendChild(g);
    };
    for (const [k, nome, q, ts] of GRUPOS) um(k, nome, q, ts.map(t => cards.find(c => titulo(c) === t)).filter(Boolean));
    um('X', 'Outros', 'Demais análises do período', cards.filter(c => !usados.has(c)));
    grade.replaceWith(frag);
  }
  function explorar(D) {
    const ult = [...D.days].sort((a, b) => a.date < b.date ? -1 : 1).pop(), bs = (typeof BASE_ST !== 'undefined' && BASE_ST[Store.S.status]) || null;
    return `<section class="card vgl-exp" aria-label="Explorar dados"><div class="row">
      <button type="button" class="btn" data-vgl-go="launch">Abrir o último dia (${U.brDate(ult.date)})</button><button type="button" class="btn" data-vgl-go="stops">Paradas</button>
      <button type="button" class="btn" data-vgl-go="pend">Pendências</button><button type="button" class="btn" data-vgl-go="plan">Plano do mês e ordens</button>
      <button type="button" class="btn" data-vgl-go="history">Histórico</button><button type="button" class="btn primary" data-vgl-go="reports">Relatório do período</button></div>
      <span class="small muted">Período ${U.brDate(App.filters.from)} – ${U.brDate(App.filters.to)} · ${D.days.length} dia(s) com lançamento${bs ? ' · base: ' + esc(bs[1]) : ''}</span></section>`;
  }
  function montar(root) {
    estilo();
    const fil = root.querySelector('#gFilters');
    /* cabeçalho e ações: um Imprimir só; Exportar junto das ações da visão; Limpar e Mais filtros nos filtros */
    const bar = root.querySelector('.vg-bar');
    if (bar && !root.querySelector('.vgl-hd')) bar.before(el(`<div class="vgl-hd"><div><h2>Visão geral da operação</h2><p>OEE, produção, perdas e desempenho da linha Vacutainer</p></div></div>`));
    const pr = root.querySelector('#ovPrint'); if (pr) pr.remove();
    const ex = root.querySelector('#ovExp'), tv = root.querySelector('#vgTv'); if (ex && tv) tv.before(ex);
    if (fil && !fil.querySelector('#vglLimpar')) {
      const sp = fil.querySelector(':scope > .spacer');
      const lim = el('<button type="button" class="btn sm" id="vglLimpar" title="Período do mês atual; Máquina, Catálogo, Turno e Status em Todos (a Linha continua)">Limpar</button>');
      const mais = el('<button type="button" class="btn sm vgl-mais" id="vglMais" aria-expanded="false">Mais filtros ▾</button>');
      if (sp) { sp.before(mais); sp.before(lim); } else { fil.append(mais, lim); }
    }
    const D = dados(); if (!D) return;
    /* 01 · situação */
    const dec = root.querySelector('.decide');
    if (dec && !root.querySelector('.vgl-sit')) {
      const sit = el(`<div class="vgl-sit">${situacao(D)}<div class="vgl-acao"></div></div>`);
      dec.before(sec('01', 'Situação do período', 'Como estamos e onde atuar agora')); dec.before(sit);
      const ac = sit.querySelector('.vgl-acao'); ac.appendChild(dec); ac.appendChild(el(maiorPerda(D)));
    }
    /* 02 · indicadores (sem números novos) */
    const ind = root.querySelector('section.vg-ind');
    if (ind && !root.querySelector('[data-vgl-sec="02"]')) { const s = sec('02', 'Números do período', 'Os cartões ligados em Editar cards e os demais em Mais indicadores'); s.dataset.vglSec = '02'; ind.before(s); }
    const mk = root.querySelector('details.more-kpi');
    if (mk && ind) { const nome = k => { const l = k.querySelector('.l'); return l ? [...l.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('').trim() : ''; };
      const naGrade = new Set([...ind.querySelectorAll('.kpi')].map(nome));
      mk.querySelectorAll('.kpi').forEach(k => { const n = nome(k); if (['Produção boa', 'Capacidade planejada'].includes(n) && naGrade.has(n)) k.remove(); }); }
    /* 03 · diagnóstico */
    const nota = mk ? mk.nextElementSibling : null, apos = nota && nota.matches('p.small') ? nota : mk || ind;
    if (apos && !root.querySelector('.vgl-dg')) { const s = sec('03', 'Diagnóstico rápido', 'Melhor e pior dia, e se o apontamento sustenta o número'); apos.after(s); s.after(el(diagnostico(D))); }
    /* 04 · análises em grupos */
    const dg = root.querySelector('.vgl-dg');
    if (dg && !root.querySelector('.vgl-grp')) { const s = sec('04', 'Análises de desempenho', 'Clique num grupo para recolher ou abrir'); dg.after(s); grupos(root, D); }
    /* 05 · explorar */
    const ult = [...root.querySelectorAll('.vgl-grp')].pop();
    if (ult && !root.querySelector('.vgl-exp')) { const s = sec('05', 'Explorar dados', 'Registros e relatórios do mesmo período'); ult.after(s); s.after(el(explorar(D))); }
    ligar(root, D);
  }
  function ligar(root, D) {
    const lim = root.querySelector('#vglLimpar'); if (lim) lim.onclick = () => { Object.assign(App.filters, { machineId: '', catalogId: '', shiftId: '', status: '' }); const b = root.querySelector('[data-qp="mtd"]'); if (b) b.click(); else render(); };
    const ma = root.querySelector('#vglMais'), fil = root.querySelector('#gFilters'); if (ma && fil) ma.onclick = () => { const o = fil.classList.toggle('vgl-aberto'); ma.setAttribute('aria-expanded', o); ma.textContent = o ? 'Menos filtros ▴' : 'Mais filtros ▾'; };
    root.querySelectorAll('.vgl-gh').forEach(b => b.onclick = () => { const g = b.closest('.vgl-grp'), k = g.dataset.vglGrupo, f = F(), fe = !g.classList.contains('fechado');
      g.classList.toggle('fechado', fe); b.setAttribute('aria-expanded', !fe); b.querySelector('.seta').textContent = fe ? '▸' : '▾'; if (fe) f[k] = 1; else delete f[k]; savePrefs(); if (!fe) Charts.fit(g); });
    root.querySelectorAll('[data-vgl-dia]').forEach(b => b.onclick = () => { const d = D.days.find(x => x.id === b.dataset.vglDia); if (d) openDayDrawer(d); });
    root.querySelectorAll('[data-vgl-rel]').forEach(b => b.onclick = () => { App.scrollTo = 'pend-top'; go('pend'); });
    root.querySelectorAll('[data-vgl-go]').forEach(b => b.onclick = () => { const r = b.dataset.vglGo; if (r === 'launch') { const u = [...D.days].sort((a, c) => a.date < c.date ? -1 : 1).pop(); App.sel.date = u.date; App.sel.lineId = u.lineId; } go(r); });
    root.querySelectorAll('[data-vgl-ir]').forEach(b => b.onclick = () => {
      if (b.dataset.vglIr === 'pareto' && D.par[0]) { App.stops = { dim: 'codigo', pick: D.par[0].label }; go('stops'); return; }
      const g = root.querySelector('[data-vgl-grupo="C"]'); if (!g) return; if (g.classList.contains('fechado')) g.querySelector('.vgl-gh').click();
      const c = [...g.querySelectorAll('section.card')].find(s => titulo(s) === 'Cascata de perdas do período'); (c || g).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  return { montar, GRUPOS };
})();
(() => {
  const O = App.views.overview;
  App.views.overview = { render() { return O.render(); }, mount(root) { if (O.mount) O.mount(root); try { if (VisaoGeral.naPadrao()) VGL.montar(root); } catch (e) { console.error('VGL', e); } } };
  App.views.panel = { render() { return App.views.overview.render(); }, mount(root) { return App.views.overview.mount(root); } };
})();
