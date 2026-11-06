/* ===== Produção 2.4.1 (2.4.3: desativações do Portal propagadas) · cadastro geral do Portal (vacutainer-cadastros.json) =====
   O Portal é o dono de: linhas, famílias, máquinas (equipamentos), catálogos (tubos), turnos (pausas, intervalos do Hora a Hora),
   tipos de parada, metas de OEE e parâmetros comuns (parada longa, semáforo, motivos de abono e de "sem produção").
   Quando a revisão do cadastro muda, a Produção copia esses dados para a própria base numa alteração só (com auditoria),
   mantendo os ids já usados nos lançamentos. Só entra o que o Portal tem: domínio vazio no Portal continua com o cadastro local.
   Nas Configurações, os domínios que vêm do Portal ficam só para consulta, com "Editar no Portal". */
const CadSync = (() => {
  const SEC_PORTAL = { estrutura: 'linhas', turnos: 'turnos', catalogos: 'catalogos', metas: 'metasOee', paradas: 'paradas' };
  const doc = () => Store.S.cadDoc || null;
  const tem = t => { const d = doc(); return !!(d && Array.isArray(d[t]) && d[t].length); };
  /* domínios que vêm do Portal nesta base */
  function dominios() {
    const d = doc(); if (!d) return {};
    return { estrutura: tem('linhas') || tem('equipamentos') || tem('familias'), turnos: tem('turnos'), catalogos: tem('catalogos'), metas: tem('metasOee'), paradas: tem('paradas'), parametros: !!d.parametros };
  }
  const stampOf = d => d ? `${d.rev}|${d.revId || ''}` : '';
  const pend = () => { const d = doc(); if (!d) return false; const s = (db().settings || {}).cadSync; return !s || s.stamp !== stampOf(d); };
  const vigHoje = vs => { const h = U.today(); return (vs || []).filter(v => v.de <= h && (!v.ate || v.ate >= h)).sort((a, b) => a.de < b.de ? 1 : -1)[0] || (vs || []).slice().sort((a, b) => a.de < b.de ? 1 : -1)[0] || null; };

  /* aplica o cadastro do Portal na base (dentro do Store.mutate) e devolve o resumo */
  function aplicar(d, C, audit) {
    const by = 'Portal', now = U.nowIso(), R = { linhas: 0, familias: 0, maquinas: 0, catalogos: 0, turnos: 0, paradas: 0, metas: 0, parametros: 0, removidas: 0 };
    const reason = `sincronizado do cadastro do Portal (rev ${C.rev})`;
    const novo = () => ({ createdAt: now, createdBy: by, updatedAt: now, updatedBy: by, status: 'ativo', revision: 1 });
    /* muda só o que difere, com auditoria por campo */
    const upd = (o, patch, entity, cont) => { let n = 0; for (const [k, v] of Object.entries(patch)) { if (JSON.stringify(o[k] ?? null) === JSON.stringify(v ?? null)) continue; audit({ action: 'sincronização do Portal', entity, entityId: o.id, field: k, before: o[k] ?? null, after: v ?? null, reason }); o[k] = v; n++; } if (n) { o.updatedAt = now; o.updatedBy = by; o.revision = (o.revision || 1) + 1; R[cont]++; } return n; };
    const add = (arr, o, entity, cont) => { arr.push(o); audit({ action: 'sincronização do Portal', entity, entityId: o.id, field: null, before: null, after: o.code || o.id, reason }); R[cont]++; return o; };
    const live = arr => (arr || []).filter(x => !x.deleted);
    const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_');
    for (const k of ['lines', 'families', 'machines', 'catalogs', 'shifts', 'downtimeCodes', 'targets']) d[k] = d[k] || [];

    /* linhas */
    const linhas = (C.linhas || []).filter(l => l && l.codigo);
    if (linhas.length) for (const l of linhas) {
      let o = live(d.lines).find(x => x.code === l.codigo); if (!o && linhas.length === 1 && live(d.lines).length === 1) o = live(d.lines)[0];
      const p = { code: l.codigo, name: l.nome || l.codigo, unit: l.unidade || null, sector: l.setor || null };
      if (o) upd(o, p, 'linha', 'linhas'); else add(d.lines, { id: 'line_' + slug(l.codigo), ...p, ...novo() }, 'linha', 'linhas');
    }
    const lineId = cod => { const o = live(d.lines).find(x => x.code === cod) || (live(d.lines).length === 1 ? live(d.lines)[0] : null); return o ? o.id : (live(d.lines)[0] || {}).id || null; };
    /* famílias */
    for (const f of (C.familias || []).filter(x => x && x.codigo)) {
      const o = live(d.families).find(x => x.code === f.codigo), p = { code: f.codigo, name: f.nome || f.codigo, color: f.cor || (o && o.color) || '#2f6db5', active: f.ativo !== false };
      if (o) upd(o, p, 'família', 'familias'); else add(d.families, { id: 'fam_' + slug(f.codigo), ...p, ...novo() }, 'família', 'familias');
    }
    const famId = cod => cod ? (live(d.families).find(x => x.code === cod) || {}).id || null : null;
    /* máquinas */
    for (const e of (C.equipamentos || []).filter(x => x && x.codigo)) {
      const o = live(d.machines).find(x => x.code === e.codigo), p = { code: e.codigo, name: e.nome || e.codigo, lineId: lineId(e.linha), role: e.papel === 'oee' ? 'oee' : 'equipamento', active: e.ativo !== false };
      if (o) upd(o, p, 'máquina', 'maquinas'); else add(d.machines, { id: 'mac_' + slug(e.codigo), description: '', ...p, ...novo() }, 'máquina', 'maquinas');
    }
    const macId = cod => cod ? (live(d.machines).find(x => x.code === cod) || {}).id || null : null;
    /* catálogos (só tubos: preparação de aditivo não tem OEE da linha) */
    for (const c of (C.catalogos || []).filter(x => x && x.codigo && x.tipoItem !== 'preparacao')) {
      const vs = (c.vigencias || []).slice().sort((a, b) => a.de < b.de ? -1 : 1), ex = live(d.catalogs).filter(x => x.code === c.codigo).sort((a, b) => String(a.validFrom) < String(b.validFrom) ? -1 : 1), usados = new Set();
      vs.forEach((v, k) => {
        let o = ex.find(x => x.validFrom === v.de && !usados.has(x.id)) || ex.find(x => !usados.has(x.id) && !vs.some(w => w.de === x.validFrom));
        const p = { code: c.codigo, name: c.nome || c.codigo, familyId: famId(c.familia), lineId: lineId(c.linha), pph: v.pphNominal != null ? +v.pphNominal : (o ? o.pph : null), color: c.cor || (o && o.color) || null, validFrom: v.de, validTo: v.ate || null, active: c.ativo !== false };
        if (o) { usados.add(o.id); upd(o, p, 'catálogo', 'catalogos'); } else { const id = 'cat_' + c.codigo + (k && ex.some(x => x.id === 'cat_' + c.codigo) ? '_' + v.de : ''); usados.add(id); add(d.catalogs, { id: d.catalogs.some(x => x.id === id) ? U.uid('cat') : id, machineId: null, note: 'Origem: cadastro do Portal', ...p, ...novo() }, 'catálogo', 'catalogos'); }
      });
      /* 2.4.3 · vigência desativada no Portal (não está mais nas vigências válidas): fica inativa aqui. Não é apagada:
         os registros antigos continuam achando o catálogo pelo id. Só quando o Portal tem vigências (válidas ou desativadas) */
      if (vs.length || (c.vigenciasDesativadas || []).length) for (const x of ex) if (!usados.has(x.id) && x.active !== false) upd(x, { active: false }, 'catálogo', 'catalogos');
    }
    const catId = (cod, data) => { if (!cod) return null; const L = live(d.catalogs).filter(x => x.code === cod); return (L.find(x => (!data || (x.validFrom || '') <= data) && (!x.validTo || !data || x.validTo >= data)) || L[0] || {}).id || null; };
    /* tipos de parada */
    for (const p0 of (C.paradas || []).filter(x => x && x.codigo)) {
      const o = live(d.downtimeCodes).find(x => x.code === p0.codigo);
      const p = { code: p0.codigo, name: p0.nome || p0.codigo, description: (p0.guia && p0.guia.descricao) || (o && o.description) || '', category: p0.categoria || null, subcategory: p0.subcategoria || null, color: p0.cor || (o && o.color) || '#888888',
        planned: !!p0.planejada, deductsPlanned: !!p0.descontaPlanejado, affectsA: !!p0.afetaD, affectsP: !!p0.afetaP, affectsQ: !!p0.afetaQ, inReport: p0.relatorio !== false, inPareto: p0.pareto !== false,
        requiresNote: !!p0.exigeObservacao, requiresTimes: !!p0.exigeHorario, allowsManualDuration: !!p0.duracaoManual, requiresPrevCatalog: !!p0.exigeCatalogoAnterior, requiresNextCatalog: !!p0.exigeCatalogoSeguinte, active: p0.ativo !== false };
      if (o) upd(o, p, 'código de parada', 'paradas'); else add(d.downtimeCodes, { id: 'dc_' + slug(p0.codigo), validFrom: '2025-01-01', validTo: null, ...p, ...novo() }, 'código de parada', 'paradas');
    }
    const dcId = cod => cod ? (live(d.downtimeCodes).find(x => x.code === cod) || {}).id || null : null;
    /* turnos: horário, dias, pausas (código de parada), regra do pedaço final e intervalos do Hora a Hora */
    for (const t of (C.turnos || []).filter(x => x && x.codigo)) {
      let o = live(d.shifts).find(x => x.code === t.codigo);
      const versoes = (t.vigencias || []).slice().sort((a, b) => a.de < b.de ? -1 : 1).map(v => ({ v, p: {
        validFrom: v.de, validTo: v.ate || null, start: v.inicio, end: v.fim, weekdays: (v.dias || []).slice(), color: t.cor || null, active: v.ativo !== false && t.ativo !== false,   /* 2.4.3 · turno inativo no Portal = vigências inativas */
        breaks: (v.pausas || []).map(x => ({ label: x.nome || (x.codigo || 'Pausa'), start: x.inicio || '', end: x.fim || '', minutes: x.inicio && x.fim ? null : (+x.duracaoMin || null), weekdays: (x.dias || []).slice(), deducts: x.desconta !== false, codeId: dcId(x.codigo) })),
        tailMergeMax: v.regraPedacoFinal != null && v.regraPedacoFinal !== '' ? +v.regraPedacoFinal : null,
        template: (v.intervalos || []).length ? v.intervalos.map(x => ({ start: x.inicio, end: x.fim })) : null } }));
      if (!o) { o = add(d.shifts, { id: 'sh_' + slug(t.codigo), code: t.codigo, name: t.nome || t.codigo, lineId: lineId(t.linha), versions: [], ...novo() }, 'turno', 'turnos'); }
      else upd(o, { name: t.nome || t.codigo, lineId: lineId(t.linha) }, 'turno', 'turnos');
      const usados = new Set(); let n = 0;
      for (const { v, p } of versoes) {
        let ver = (o.versions || []).find(x => !x.deleted && x.validFrom === v.de);
        if (ver) { usados.add(ver.id); for (const [k, val] of Object.entries(p)) if (JSON.stringify(ver[k] ?? null) !== JSON.stringify(val ?? null)) { audit({ action: 'sincronização do Portal', entity: 'turno', entityId: o.id, field: 'vigência ' + v.de + ' · ' + k, before: ver[k] ?? null, after: val ?? null, reason }); ver[k] = val; n++; } }
        else { ver = { id: U.uid('sv'), ...p }; o.versions.push(ver); usados.add(ver.id); audit({ action: 'sincronização do Portal', entity: 'turno', entityId: o.id, field: 'vigência', before: null, after: v.de, reason }); n++; }
      }
      for (const ver of o.versions || []) if (!ver.deleted && !usados.has(ver.id)) { ver.deleted = true; audit({ action: 'sincronização do Portal', entity: 'turno', entityId: o.id, field: 'vigência ' + ver.validFrom, before: 'ativa', after: 'removida (não está no Portal)', reason }); n++; }
      if (n) { o.updatedAt = now; o.updatedBy = by; R.turnos++; }
    }
    /* metas de OEE: o Portal manda quando tem pelo menos uma */
    /* 2.4.3 · o Portal manda quando tem metas cadastradas, mesmo todas inativas (antes, desativar a última mantinha a cópia local) */
    const metas = (C.metasOee || []).filter(m => m && m.ativo !== false);
    if ((C.metasOee || []).some(m => m && m.codigo)) {
      const toq = new Set();
      for (const m of metas) for (const v of (m.vigencias || [])) {
        const sc = { lineId: lineId(m.linha), machineId: macId(m.equipamento), familyId: famId(m.familia), catalogId: catId(m.catalogo, v.de) };
        const pct = x => x == null || x === '' ? null : +x / 100;
        const p = { ...sc, validFrom: v.de, validTo: v.ate || null, pph: v.pph ? +v.pph : null, oee: pct(v.oeeMetaPct), dailyTarget: v.metaDiaria ? +v.metaDiaria : null, semGreen: pct(v.semaforoVerdePct), semYellow: pct(v.semaforoAmareloPct), coverageMin: pct(v.coberturaMinPct), divergenceMax: pct(v.divergenciaMaxPct), note: m.observacao || null, intervalBoard: Array.isArray(v.quadro) && v.quadro.length ? v.quadro : null, rounding: 'teto + compensação na última hora', portalCode: m.codigo };
        let o = live(d.targets).find(t => !t.demo && t.validFrom === v.de && (t.lineId || null) === sc.lineId && (t.machineId || null) === sc.machineId && (t.familyId || null) === sc.familyId && (t.catalogId || null) === sc.catalogId);
        if (o) { toq.add(o.id); upd(o, p, 'meta', 'metas'); } else { o = add(d.targets, { id: U.uid('tg'), ...p, ...novo() }, 'meta', 'metas'); toq.add(o.id); }
      }
      for (const t of live(d.targets)) if (!t.demo && !toq.has(t.id)) { t.deleted = true; audit({ action: 'sincronização do Portal', entity: 'meta', entityId: t.id, field: 'situação', before: 'ativa', after: 'removida (não está nas Metas de OEE do Portal)', reason }); R.removidas++; }
    }
    /* parâmetros comuns */
    const P = C.parametros || {}, st = d.settings = d.settings || {};
    const sp = (k, v) => { if (v == null) return; if (JSON.stringify(st[k] ?? null) === JSON.stringify(v)) return; audit({ action: 'sincronização do Portal', entity: 'parâmetros', entityId: 'settings', field: k, before: st[k] ?? null, after: v, reason }); st[k] = v; R.parametros++; };
    if (P.paradaLongaMin) sp('longStopMin', +P.paradaLongaMin);
    if (P.semaforoVerdePct && P.semaforoAmareloPct) sp('semaphore', { green: +P.semaforoVerdePct / 100, yellow: +P.semaforoAmareloPct / 100 });
    if ((P.motivosAbono || []).length) sp('abMotivos', P.motivosAbono.slice());
    if ((P.motivosSemProducaoProg || []).length) sp('offMotivosProg', P.motivosSemProducaoProg.slice());
    if ((P.motivosSemProducaoNP || []).length) sp('offMotivosNP', P.motivosSemProducaoNP.slice());
    st.cadSync = { stamp: stampOf(C), rev: C.rev, revAt: C.revAt || null, em: now, resumo: R };
    return R;
  }

  let rodando = false;
  /* chamado depois de cada leitura do cadastro: aplica se a revisão mudou */
  function talvez() {
    try {
      const S = Store.S, C = doc();
      if (rodando || !C || !S.db || S.mode !== 'pasta' || S.conflict || S.access === 'read' || S.mode === 'aguardando' || !pend()) return;
      rodando = true;
      let R; Store.mutate((d, audit) => { R = aplicar(d, C, audit); }, { flush: true });
      try { Engine.bumpConfig(); } catch (e) { }
      const n = Object.entries(R).filter(([k, v]) => v && k !== 'removidas').map(([k, v]) => `${v} ${k}`).join(', ');
      if (n || R.removidas) toast(`Cadastro do Portal (rev ${C.rev}) aplicado: ${n || 'nada mudou'}${R.removidas ? ` · ${R.removidas} meta(s) antiga(s) substituída(s)` : ''}.`);
      render();
    } catch (e) { console.warn('CadSync', e); toast('Não consegui aplicar o cadastro do Portal: ' + (e.message || e), true); }
    finally { rodando = false; }
  }
  function portalHref(h) { const port = (typeof systems === 'function' ? systems() : []).find(s => s.id === 'portal') || { id: 'portal', html: 'Portal.html' }; return typeof sysHref === 'function' ? sysHref(port, h) : 'Portal.html#' + h; }
  function banner(sec) {
    const D = dominios(), C = doc(), s = (db().settings || {}).cadSync; if (!D[sec]) return '';
    return `<div class="banner info" style="margin-bottom:10px"><p><b>Vem do cadastro do Portal</b> ${ib('cadPortal')} · rev ${esc(C.rev)}${Store.S.cadDocAusente ? ' · <b class="bad">o vacutainer-cadastros.json não foi achado na última leitura da pasta: vale a última cópia lida</b>' : ''}${s && s.em ? ` · aplicado em ${U.brDT(s.em)}` : ''}. Aqui fica só para consulta.
      <a class="btn sm primary" href="${esc(portalHref('cadastros/' + SEC_PORTAL[sec]))}" data-keep="1">Editar no Portal ↗</a>${sec === 'metas' ? `<br><span class="small">A Meta OEE FY27 (planilha OEE-Vacutainer_v2.xlsm) é importada no Portal: <a href="${esc(portalHref('cadastros/importar/metaoee'))}" data-keep="1">Cadastros › Importar › Meta OEE FY27 ↗</a>. As metas e o quadro hora a hora chegam aqui pelo cadastro.</span>` : ''}${pend() ? ' <button class="btn sm" data-keep="1" id="csNow">Aplicar a revisão nova agora</button>' : ''}</p></div>`;
  }
  /* trava a edição da seção que vem do Portal (botões de criar/editar/salvar e campos de formulário) */
  function travar(root, sec) {
    if (!dominios()[sec]) return;
    root.querySelectorAll('button, input, select, textarea').forEach(el => {
      if (el.classList.contains('ib') || el.closest('[data-keep]') || el.dataset.keep || el.closest('.side') || el.closest('.filters') || el.dataset.sec || (el.dataset.sec2 && !(sec === 'metas' && el.dataset.sec2 === 'importacao')) || el.dataset.board || el.closest('details > summary')) return;
      if (el.tagName === 'BUTTON') { el.disabled = true; el.title = 'Vem do cadastro do Portal: use "Editar no Portal"'; } else { el.disabled = true; }
    });
    const b = root.querySelector('#csNow'); if (b) b.onclick = () => talvez();
  }
  return { aplicar, talvez, dominios, banner, travar, pend, portalHref, SEC_PORTAL };
})();

/* Configurações: seções que vêm do Portal ficam só para consulta */
(() => {
  HELP.cadPortal = ['Cadastro do Portal', [['O que é?', 'Linhas, máquinas, famílias, catálogos, turnos (pausas e intervalos do Hora a Hora), tipos de parada, metas de OEE e os parâmetros comuns são cadastrados uma vez no Portal (Administração) e valem para todas as páginas.'], ['Como chega aqui?', 'Quando o cadastro do Portal muda (nova revisão), a Produção copia esses dados para a própria base numa alteração só, com auditoria, mantendo o que já foi lançado.'], ['Como mudar?', 'Clique em "Editar no Portal". Dias já lançados guardam o que usaram e não são recalculados.']]];
  for (const sec of Object.keys(CadSync.SEC_PORTAL)) {
    const C = Cfg[sec]; if (!C || C._portal) continue; C._portal = 1;
    const r0 = C.render, m0 = C.mount;
    C.render = function () { return CadSync.banner(sec) + r0.apply(this, arguments); };
    C.mount = function (root) { if (m0) m0.apply(this, arguments); CadSync.travar(root, sec); };
  }
  /* Parâmetros: os comuns (parada longa, semáforo) vêm do Portal */
  const P = Cfg.parametros;
  if (P && !P._portal) {
    P._portal = 1; const r0 = P.render, m0 = P.mount;
    P.render = function () { const D = CadSync.dominios(); return (D.parametros ? `<div class="banner info" style="margin-bottom:10px"><p><b>Parada longa e semáforo comum vêm do Portal</b> (Parâmetros e semáforo) e ficam travados aqui. <a class="btn sm" href="${esc(CadSync.portalHref('cadastros/parametros'))}">Editar no Portal ↗</a></p></div>` : '') + r0.apply(this, arguments); };
    P.mount = function (root) { if (m0) m0.apply(this, arguments); if (!CadSync.dominios().parametros) return; for (const k of ['longStopMin', 'semGreen', 'semYellow']) { const el = root.querySelector(`[data-k="${k}"]`); if (el) { el.disabled = true; el.title = 'Vem do Portal (Parâmetros e semáforo)'; } } };
  }
  /* 2.4.1 · Importação: com as metas vindo do Portal, a Meta OEE FY27 é importada lá (importar aqui gravaria metas que a sincronização tira) */
  const Im = Cfg.importacao;
  if (Im && !Im._portal) {
    Im._portal = 1; const m0 = Im.mount;
    Im.mount = function (root) {
      if (m0) m0.apply(this, arguments); if (!CadSync.dominios().metas) return;
      const b = root.querySelector('#imMeta'); if (!b) return;
      const card = b.closest('.card'), p = card && card.querySelector('p.small');
      if (p) p.innerHTML = 'As metas de OEE vêm do cadastro do Portal: a aba Meta OEE FY27 é importada lá (mesma leitura, com prévia) e chega aqui na próxima revisão do cadastro.';
      const a = document.createElement('a'); a.className = 'btn primary'; a.href = CadSync.portalHref('cadastros/importar/metaoee'); a.textContent = 'Importar no Portal ↗'; a.title = 'Portal › Cadastros › Importar › Meta OEE FY27'; b.replaceWith(a);
    };
  }
  /* Usuário: o nome vem do "Entrar" pelo ID (cabeçalho comum) */
  const Uu = Cfg.usuario;
  if (Uu && !Uu._portal) {
    Uu._portal = 1; const r0 = Uu.render;
    Uu.render = function () { return `<div class="banner info" style="margin-bottom:10px"><p>Quem está usando vem do <b>Entrar</b> do cabeçalho (ID do cadastro de Usuários do Portal). <button class="btn sm" type="button" onclick="VacEntrar.abrir()">Entrar / trocar</button></p></div>` + r0.apply(this, arguments); };
  }
})();
