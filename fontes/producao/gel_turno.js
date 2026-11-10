/* ===== Produção 2.4.28 · Fase 4 · 4c do briefing (GEL-03 / PRD-10): Registrar scrap de gel na página de cada turno =====
   G1: o scrap de gel registrado aqui fica na base da Produção (no turno do dia: ps.gelScrap) e vai para o exports
   (porDiaTurno[].gel); a Gestão de Gel lê de lá (passo 4d). Mesmos campos e regras do Gel: equipamento (Portal, categoria
   Equipamento – Gel), descarte (composição e categoria Tubos/Barril/Purga), catálogo, peso bruto da balança, nº de barris
   (composição barril) e motivos (com kg opcional por motivo); "sem scrap de gel neste turno".
   A conta é a comum do kit (vacGel.pesagem) com os parâmetros do Portal (vacGel.ctx): o mesmo número que o Gel calcula.
   Entra no script principal pelo build.py (antes do boot). */
const GelTurno = {
  ctx() { try { return vacGel.ctx(); } catch (e) { return null; } },
  /* códigos (Portal) dos catálogos produzidos no turno */
  catsDoTurno(res, ps) { const d = db(); const ids = [...new Set((res.flat || []).filter(f => f.ps === ps && f.cat).map(f => f.cat))]; return ids.map(id => ((d.catalogs || []).find(c => c.id === id) || {}).code).filter(Boolean); },
  /* o turno mostra o gel? há equipamento de gel no Portal e algum catálogo do turno usa gel (ou já tem registro) */
  mostra(res, ps, C) { if (ps.gelScrap) return true; if (!C || !C.equips().length) return false; return this.catsDoTurno(res, ps).some(c => C.usaGel(c)); },
  /* conta de uma pesagem (mesma da Gestão de Gel) */
  calc(en, date, C) { const eq = C && C.eq(en.e); if (!eq) return null; const desc = (eq.descs || []).find(x => x.id === en.d); if (!desc) return null;
    const kg = typeof en.kg === 'string' ? (vacNumero(en.kg) || 0) : (+en.kg || 0);
    return vacGel.pesagem({ desc, taraEq: eq.tara, kg, nb: en.nb, cg: C.cat(en.cat) || { fmt: '100' }, date, fmts: C.fmts, params: C.params }); },
  soma(gs, date, C) { const o = { T: 0, B: 0, P: 0, n: 0 }; if (!gs || gs.none) return o; for (const en of gs.eq || []) { const c = this.calc(en, date, C); if (!c) continue; o[c.scat] += c.gel; o.n++; } return o; },
  /* para o exports (porDiaTurno[].gel): as pesagens como foram registradas e o gel por categoria */
  exp(ps, date) { const gs = ps.gelScrap; if (!gs) return undefined; const C = this.ctx(), k = this.soma(gs, date, C), r3 = v => Math.round(v * 1000) / 1000;
    return { none: !!gs.none, pesagens: (gs.none ? [] : gs.eq || []).map(e => ({ e: e.e, d: e.d, cat: e.cat || null, kg: +e.kg || 0, nb: +e.nb || 0, mots: (e.mots || []).map(m => ({ m: m.m, kg: +m.kg || 0 })) })), kg: { T: r3(k.T), B: r3(k.B), P: r3(k.P) }, em: gs.em || null, por: gs.por || null }; },
  salvar(dayId, psId, gs) {
    Store.mutate((d, audit) => {
      const day = d.productionDays.find(x => x.id === dayId && !x.deleted); const ps = day && day.shifts.find(p => p.id === psId && !p.deleted); if (!ps) throw new Error('Turno não encontrado.');
      if (day.status === 'fechado' || ps.status === 'fechado') throw new Error('O turno está fechado. Reabra para registrar o scrap de gel.');
      const by = Store.S.user || '—', antes = ps.gelScrap ? JSON.stringify(ps.gelScrap.none ? 'sem scrap' : (ps.gelScrap.eq || []).length + ' pesagem(ns)') : null;
      ps.gelScrap = { none: !!gs.none, eq: gs.none ? [] : (gs.eq || []).map(e => ({ e: String(e.e), d: String(e.d), cat: e.cat ? String(e.cat) : null, kg: +e.kg || 0, nb: +e.nb || 0, mots: (e.mots || []).filter(m => m.m).map(m => ({ m: String(m.m), kg: +m.kg || 0 })) })), em: U.nowIso(), por: by };
      audit({ action: 'edição', entity: 'turno', entityId: ps.id, field: 'scrap de gel', before: antes, after: ps.gelScrap.none ? 'sem scrap' : ps.gelScrap.eq.length + ' pesagem(ns)', reason: 'GEL-03' });
      day._rev = (day._rev || 0) + 1; day.updatedAt = U.nowIso(); day.updatedBy = by;
    });
  },
  /* bloco no turno (Lançamento) */
  bloco(day, sr, res) {
    const ps = sr.ps, C = this.ctx(); if (!this.mostra(res, ps, C)) return '';
    const gs = ps.gelScrap, k = this.soma(gs, day.date, C), lk = day.status === 'fechado' || ps.status === 'fechado', f3 = v => U.fmt(v, 3);
    const txt = !gs ? '<span class="muted">sem registro</span>' : gs.none ? 'sem scrap de gel neste turno' : `${k.n} pesagem(ns) · gel Tubos ${f3(k.T)} kg · Barril ${f3(k.B)} kg · Purga ${f3(k.P)} kg`;
    return `<div class="kv" style="grid-column:1/-1"><span class="l">Scrap de gel ${ib('gelScrap')}</span><span class="v small">${txt}</span><button type="button" class="btn sm" data-gelscrap="${ps.id}" ${lk ? 'disabled' : ''}>Registrar scrap</button></div>`;
  },
  /* formulário (mesmos campos do Registrar scrap da Gestão de Gel) */
  abrir(day, psId, res) {
    const ps = day.shifts.find(p => p.id === psId), C = this.ctx(); if (!ps || !C) return;
    const cats = this.catsDoTurno(res, ps).filter(c => C.usaGel(c)); const eqs = C.equips();
    const W = { none: !!(ps.gelScrap && ps.gelScrap.none), eq: JSON.parse(JSON.stringify((ps.gelScrap && ps.gelScrap.eq) || [])) };
    const novo = () => { const e = eqs[0]; return { e: e ? e.codigo : '', d: e && e.descs[0] ? e.descs[0].id : '', cat: cats[0] || '', kg: '', nb: 0, mots: [] }; };
    if (!W.eq.length && !W.none) W.eq.push(novo());
    const motsDe = en => { const e = C.eq(en.e), dsc = e && (e.descs || []).find(x => x.id === en.d); if (!dsc) return []; return (C.motivos || []).filter(m => m.active !== false && (!(m.comps || []).length || m.comps.includes(dsc.comp)) && (!(dsc.mots || []).length || dsc.mots.includes(m.id))); };
    const linha = (en, i) => { const e = C.eq(en.e), dsc = e && (e.descs || []).find(x => x.id === en.d), c = this.calc(en, day.date, C);
      return `<tr data-gi="${i}"><td><select data-gf="e">${eqs.map(x => `<option value="${esc(x.codigo)}" ${x.codigo === en.e ? 'selected' : ''}>${esc(x.codigo)} · ${esc(x.nome || '')}</option>`).join('')}</select></td>
        <td><select data-gf="d">${(e ? e.descs : []).map(x => `<option value="${esc(x.id)}" ${x.id === en.d ? 'selected' : ''}>${esc((vacGel.COMPS[x.comp] || {}).l || x.comp)} → ${esc(vacGel.SCAT[x.cat] || x.cat)}</option>`).join('')}</select></td>
        <td><select data-gf="cat"><option value="">—</option>${[...new Set(cats.concat(en.cat ? [en.cat] : []))].map(x => `<option value="${esc(x)}" ${x === en.cat ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></td>
        <td><input data-gf="kg" inputmode="decimal" value="${esc(en.kg === 0 ? '' : String(en.kg).replace('.', ','))}" style="width:90px" placeholder="kg"></td>
        <td>${dsc && dsc.comp === 'barril' ? `<input data-gf="nb" type="number" min="0" step="1" value="${esc(en.nb || '')}" style="width:70px">` : ''}</td>
        <td class="small">${motsDe(en).map(m => { const x = (en.mots || []).find(y => y.m === m.id); return `<label style="margin-right:8px"><input type="checkbox" data-gm="${esc(m.id)}" ${x ? 'checked' : ''}> ${esc(m.name)}${x ? ` <input data-gmk="${esc(m.id)}" inputmode="decimal" value="${esc(x.kg ? String(x.kg).replace('.', ',') : '')}" placeholder="kg" style="width:60px">` : ''}</label>`; }).join('') || '<span class="muted">—</span>'}</td>
        <td class="small n">${c ? (c.comp === 'barril' && c.est && vacGel.sobraAt(C.fmts, day.date) == null ? '<span class="ferr">sobra do barril não cadastrada no Portal</span>' : `gel <b>${U.fmt(c.gel, 3)}</b> kg${c.n ? ` · ${U.fmt(c.n)} tubos` : ''}`) : '—'}</td><td><button type="button" class="btn xs" data-gdel="${i}">✕</button></td></tr>`; };
    const html = () => `<p class="small muted">Mesmos campos e a mesma conta da Gestão de Gel. Fica neste turno da Produção e a Gestão de Gel lê daqui. Equipamentos, descartes, formatos e motivos vêm do Portal.</p>
      <label class="chk"><input type="checkbox" id="gNone" ${W.none ? 'checked' : ''}> Sem scrap de gel neste turno</label>
      ${W.none ? '' : `<div class="tw"><table><thead><tr><th>Equipamento</th><th>Descarte → categoria</th><th>Catálogo</th><th>Peso bruto</th><th>Barris</th><th>Motivos</th><th class="n">Gel</th><th></th></tr></thead><tbody>${W.eq.map(linha).join('')}</tbody></table></div>
      <button type="button" class="btn sm" id="gAdd">+ Pesagem</button>`}
      ${!eqs.length ? '<p class="ferr small">Nenhum equipamento da categoria Equipamento – Gel com descartes no Portal.</p>' : ''}`;
    modal(`Registrar scrap de gel · ${ps.snap.name} · ${U.brDate(day.date)}`, `<div id="gBox">${html()}</div>`, `<button class="btn" data-close>Cancelar</button><button class="btn primary" id="gOk">Gravar</button>`, (el, close) => {
      const box = el.querySelector('#gBox'), draw = () => { box.innerHTML = html(); };
      box.addEventListener('change', e => { const t = e.target, tr = t.closest('[data-gi]');
        if (t.id === 'gNone') { W.none = t.checked; if (!W.none && !W.eq.length) W.eq.push(novo()); return draw(); }
        if (!tr) return; const en = W.eq[+tr.dataset.gi];
        if (t.dataset.gf === 'e') { en.e = t.value; const x = C.eq(en.e); en.d = x && x.descs[0] ? x.descs[0].id : ''; en.mots = []; }
        else if (t.dataset.gf === 'd') { en.d = t.value; en.mots = []; }
        else if (t.dataset.gf) en[t.dataset.gf] = t.dataset.gf === 'nb' ? (+t.value || 0) : t.value;
        else if (t.dataset.gm) { en.mots = en.mots || []; if (t.checked) en.mots.push({ m: t.dataset.gm, kg: 0 }); else en.mots = en.mots.filter(m => m.m !== t.dataset.gm); }
        else if (t.dataset.gmk) { const m = (en.mots || []).find(x => x.m === t.dataset.gmk); if (m) m.kg = vacNumero(t.value) || 0; }
        draw(); });
      box.addEventListener('click', e => { const a = e.target.closest('#gAdd'), x = e.target.closest('[data-gdel]'); if (a) { W.eq.push(novo()); draw(); } if (x) { W.eq.splice(+x.dataset.gdel, 1); draw(); } });
      el.querySelector('#gOk').onclick = () => {
        const eq = W.none ? [] : W.eq.map(en => ({ ...en, kg: typeof en.kg === 'string' ? (en.kg.trim() === '' ? 0 : vacNumero(en.kg)) : +en.kg || 0 }));
        if (eq.some(en => !isFinite(en.kg) || en.kg < 0)) return toast('Peso inválido: use número (ex.: 2,345).', true);
        if (eq.some(en => !(en.kg > 0) && !(en.nb > 0))) return toast('Cada pesagem precisa do peso (ou do nº de barris, no barril).', true);
        run(() => this.salvar(day.id, ps.id, { none: W.none, eq }), 'Scrap de gel gravado.').then(() => { close(); render(); });
      };
    }, { wide: true });
  },
  mount(root, day, res) { root.querySelectorAll('[data-gelscrap]').forEach(b => b.onclick = () => this.abrir(day, b.dataset.gelscrap, res)); }
};

/* ---------- 2.4.29 · Fase 4 · 4e (GEL-04): Teórico × Real do gel no dia, só quando algum catálogo produzido usa gel ----------
   Teórico, gel nos tubos bons, índice (BOM do Portal) e o scrap pesado nos turnos: calculados aqui pela conta comum (vacGel).
   Barris baixados (o real, G4): da Gestão de Gel, pelo exports (porDiaGel), com a data em que foi lido. */
const GelDia = {
  gel: null, lendo: false, lidoEm: 0,
  ler() { if (this.lendo || typeof vacFicha === 'undefined') return Promise.resolve(); this.lendo = true;
    return vacFicha.carregar().then(() => { const x = vacFicha.dados('gel'); this.gel = x && x.d ? x : null; this.lidoEm = Date.now(); }).catch(e => console.warn('GelDia', e)).finally(() => { this.lendo = false; }); },
  calc(day, res) {
    const C = GelTurno.ctx(); if (!C) return null; const d = db(), tub = {};
    for (const f of res.flat || []) { if (!f.cat || !(f.good > 0)) continue; const code = ((d.catalogs || []).find(c => c.id === f.cat) || {}).code; if (code && C.usaGel(code)) tub[code] = (tub[code] || 0) + f.good; }
    if (!Object.keys(tub).length) return null;
    const cg = code => C.cat(code) || { fmt: '100' }, teo = vacGel.teorico({ tubosPorCat: tub, date: day.date, cg, fmts: C.fmts, params: C.params });
    let meta = 0, allowed = 0; for (const [code, t] of Object.entries(tub)) { const b = vacGel.bom(cg(code), day.date, C.fmts, C.params); meta += t * b.meta / 1000; allowed += t * b.allowed / 1000; }
    const sc = { T: 0, B: 0, P: 0 }; let pesou = false; for (const sr of res.shifts) { const k = GelTurno.soma(sr.ps.gelScrap, day.date, C); if (sr.ps.gelScrap) pesou = true; sc.T += k.T; sc.B += k.B; sc.P += k.P; }
    const scrap = sc.T + sc.B + sc.P, real = teo.gelBons + scrap;
    const g = this.gel && this.gel.d ? (this.gel.d.porDiaGel || []).find(x => x.dia === day.date) : null;
    return { tub, tubos: Object.values(tub).reduce((a, b) => a + b, 0), teo, sc, pesou, meta, allowed, real, idx: meta > 0 && pesou ? real / meta * 100 : null, saving: pesou ? allowed - real : null, g, desvio: g && g.baixadoKg && teo.teo > 0 ? g.baixadoKg / teo.teo - 1 : null };
  },
  card(day, res) {
    const x = this.calc(day, res); if (!x) return '';
    if (!this.gel && !this.lendo && Date.now() - this.lidoEm > 60000) this.ler().then(() => { if (this.gel) render(); });
    const f3 = v => v == null ? '—' : U.fmt(v, 3), pc = v => v == null ? '—' : (v >= 0 ? '+' : '') + U.fmt(v * 100, 1) + '%';
    const linha = (l, t, r, aj) => `<tr><td>${l}${aj ? ' ' + ib(aj) : ''}</td><td class="n">${t}</td><td class="n">${r}</td></tr>`;
    return `<section class="card section" id="gelDia"><header><h3>Gel · teórico × real do dia ${ib('gelTeoReal')}</h3><span class="small muted">${Object.keys(x.tub).map(esc).join(', ')}</span></header>
      <div class="kpis" style="margin-bottom:8px">${kpi('Gel teórico', f3(x.teo.teo), 'kg', 'tubos bons × g/tubo ÷ (1 − perdas)')}${kpi('Índice de uso', x.idx == null ? '—' : U.fmt(x.idx, 2), '', x.idx == null ? 'falta o scrap pesado dos turnos' : `meta 100 · BOM ${U.fmt(100 + ((x.allowed / x.meta - 1) * 100 || 0), 0)}`)}${kpi('Baixado × teórico', pc(x.desvio), '', x.g ? `${U.fmt(x.g.barris)} barril(is) · ${f3(x.g.baixadoKg)} kg` : 'sem baixa do Gel neste dia')}</div>
      <div class="tw"><table><thead><tr><th></th><th class="n">Teórico (kg)</th><th class="n">Real (kg)</th></tr></thead><tbody>
      ${linha('Tubos bons (catálogos com gel)', U.fmt(x.tubos), U.fmt(x.tubos))}
      ${linha('Gel nos tubos bons', f3(x.teo.gelBons), '—')}
      ${linha('Scrap de gel · Tubos', f3(x.teo.sTeo.T), x.pesou ? f3(x.sc.T) : '—')}
      ${linha('Scrap de gel · Barril', f3(x.teo.sTeo.B), x.pesou ? f3(x.sc.B) : '—')}
      ${linha('Scrap de gel · Purga', f3(x.teo.sTeo.P), x.pesou ? f3(x.sc.P) : '—')}
      ${linha('<b>Total de gel</b>', '<b>' + f3(x.teo.teo) + '</b>', x.g ? `<b>${f3(x.g.baixadoKg)}</b> <span class="small muted">baixado</span>` : '—', 'gelBaixado')}</tbody></table></div>
      <p class="small muted">Teórico, índice e scrap pela mesma conta da Gestão de Gel (parâmetros do Portal). As baixas de barril são da Gestão de Gel${this.gel ? ` (lidas de ${esc(this.gel.geradoEm ? U.brDT(this.gel.geradoEm) : '—')})` : ': ainda não lidas (conecte a pasta)'}. O relatório de gel continua na Gestão de Gel.</p></section>`;
  }
};
HELP.gelTeoReal = ['Gel · teórico × real do dia', [['Quando aparece?', 'Só quando algum catálogo produzido no dia usa gel (BOM do Portal com material de gel, ou o bloco Gel do catálogo).'], ['Teórico', 'Gel nos tubos bons (tubos × gramas de gel por tubo do catálogo, com vigência) ÷ (1 − perdas teóricas), dividido em Tubos, Barril e Purga.'], ['Real', 'O scrap pesado nos turnos (Registrar scrap) e os barris baixados na Gestão de Gel.'], ['Índice de uso', '(Gel nos tubos bons + scrap pesado) ÷ meta da BOM × 100. Abaixo de 100 é melhor que a meta; acima da BOM (ex.: 106) passa o permitido.']]];
HELP.gelBaixado = ['Gel baixado', [['O que é?', 'Os barris baixados como consumidos na Gestão de Gel neste dia (kg líquidos). Vem do exports do Gel: aparece depois que o Gel grava a base.']]];
HELP.gelScrap = ['Scrap de gel do turno', [['O que é?', 'As pesagens de scrap de gel do turno (Registrar scrap): equipamento, descarte, catálogo e peso da balança. A conta tira a embalagem e divide pelo peso da composição, igual à Gestão de Gel.'], ['Onde fica?', 'No turno da Produção. A Gestão de Gel lê daqui (a partir da data de corte do Portal) para o resumo do dia, o índice e o saving.'], ['De onde vêm os equipamentos e os pesos?', 'Do Portal: equipamentos da categoria Equipamento – Gel (descartes) e Parâmetros › Gestão de Gel (formatos, perdas e motivos).']]];
