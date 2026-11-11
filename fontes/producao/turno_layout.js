/* ===== Produção 2.4.46 · layout novo do turno no Lançamento (mockup aprovado em 11/11/2026) =====
   Sete faixas por turno: cabeçalho (nome, horário, situação, Fechar/Reabrir, Hora a hora) · catálogo, responsável, tempo planejado e meta ·
   progresso da produção dentro do turno com retorno (meta atingida / quanto falta e ritmo) · fora do turno, Caixas do MES, paradas e scrap ·
   capacidade, OEE reportado, OEE real e D · P · Q · abonos e turno sem produção · segurança e qualidade (formulário do SQDCP).
   Só a tela muda: os números vêm do mesmo Engine.computeDay, TurnoCard.real e OeeReal.mes; os campos mantêm os data-* de antes
   (data-psf, data-closeps, data-reopenps, data-scrapturno, data-shoff, data-hhps, formulário data-sq-*), então o mount continua igual.
   Turno importado como resumo (ps.summary) usa o cartão antigo. Tema: segue o da página (claro/escuro). */
const TurnoUI = (() => {
  const SV = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', fab: '<path d="M3 21V10l5 3v-3l5 3V6h3V3h3v18z"/>',
    bars: '<path d="M5 20v-7M12 20V8M19 20V4"/>', pause: '<path d="M8 5v14M16 5v14"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0zM5 4H3v2a4 4 0 0 0 4 4M19 4h2v2a4 4 0 0 1-4 4M12 14v4M8 21h8"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'
  };
  const ic = (k, n = 20) => `<svg class="tl-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true">${SV[k] || ''}</svg>`;
  const css = `
.tl-list{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
.tl{--t-card:var(--surface);--t-ink:var(--ink);--t-mute:var(--muted);--t-line:var(--line);--t-soft:var(--surface-2);--t-blue:#1565A8;--t-blue-soft:#E7F0FA;--t-pri:#0D4778;--t-pri-ink:#fff;
  --t-ok:#159451;--t-ok-ink:#11743F;--t-ok-soft:#ECF8F0;--t-ok-line:#BFE6CD;--t-warn:#C97A16;--t-warn-ink:#8A4F06;--t-warn-soft:#FEF4E6;--t-pur:#7A45C5;--t-pur-soft:#F1EAFB;--t-grey-soft:#EEF1F5;
  display:grid;gap:12px;padding:14px;border-radius:14px;background:var(--surface-3,var(--bg));border:1px solid var(--t-line)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .tl{--t-blue:#5AA2EC;--t-blue-soft:#1A2F45;--t-pri:#2F6FB0;--t-pri-ink:#FFFFFF;--t-ok:#3FC07A;--t-ok-ink:#6FD89D;--t-ok-soft:#132B20;--t-ok-line:#24553A;--t-warn:#F2AC55;--t-warn-ink:#F5BE78;--t-warn-soft:#2E2414;--t-pur:#B08CEB;--t-pur-soft:#2A2140;--t-grey-soft:#1F2A36}}
:root[data-theme="dark"] .tl{--t-blue:#5AA2EC;--t-blue-soft:#1A2F45;--t-pri:#2F6FB0;--t-pri-ink:#FFFFFF;--t-ok:#3FC07A;--t-ok-ink:#6FD89D;--t-ok-soft:#132B20;--t-ok-line:#24553A;--t-warn:#F2AC55;--t-warn-ink:#F5BE78;--t-warn-soft:#2E2414;--t-pur:#B08CEB;--t-pur-soft:#2A2140;--t-grey-soft:#1F2A36}
.tl .tl-c{background:var(--t-card);border:1px solid var(--t-line);border-radius:12px;box-shadow:0 1px 2px rgba(16,42,86,.05)}
.tl-svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.tl .tl-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
@media (max-width:1180px){.tl .tl-g4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){.tl .tl-g4{grid-template-columns:1fr}}
.tl .tl-head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 16px;min-height:68px}
.tl .tl-hic{width:44px;height:44px;border-radius:10px;background:var(--t-blue);color:var(--t-card);display:grid;place-items:center;flex:none}
.tl .tl-head h3{margin:0;font-family:var(--f-display);font-size:30px;font-weight:700;letter-spacing:.02em;line-height:1;text-transform:uppercase}
.tl .tl-hr{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
.tl .tl-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;font-weight:700;font-size:12.5px;letter-spacing:.04em;text-transform:uppercase;background:var(--t-blue-soft);color:var(--t-blue)}
.tl .tl-badge i{width:8px;height:8px;border-radius:50%;background:currentColor}
.tl .tl-badge.fe{background:var(--t-ok-soft);color:var(--t-ok-ink)}.tl .tl-badge.pe{background:var(--t-warn-soft);color:var(--t-warn-ink)}
.tl .tl-sp{flex:1}
.tl .tl-acts{display:flex;gap:10px;flex-wrap:wrap}
.tl .tl-acts .btn{min-height:44px;padding:0 16px;border-radius:10px;font-weight:600}
.tl .tl-pri{background:var(--t-pri)!important;border-color:var(--t-pri)!important;color:var(--t-pri-ink)!important;font-size:15px}
.tl .tl-k{padding:18px 20px;display:flex;gap:14px;align-items:flex-start;min-width:0}
.tl .tl-ico{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--t-blue-soft);color:var(--t-blue)}
.tl .tl-ico.p{background:var(--t-pur-soft);color:var(--t-pur)}.tl .tl-ico.o{background:var(--t-warn-soft);color:var(--t-warn)}.tl .tl-ico.g{background:var(--t-grey-soft);color:var(--t-mute)}
.tl .tl-b{min-width:0;flex:1;display:grid;gap:4px}
.tl .tl-l{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:500;color:var(--t-ink)}
.tl .tl-v{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.2;overflow-wrap:anywhere}
.tl .tl-v.sm{font-size:20px}.tl .tl-v small{font-size:15px;font-weight:600;color:var(--t-mute);margin-left:3px}
.tl .tl-dpq span{white-space:nowrap}
.tl .tl-a{font-size:13px;color:var(--t-mute);font-variant-numeric:tabular-nums}
.tl .tl-okt{color:var(--t-ok-ink);font-weight:600;font-size:13.5px;display:inline-flex;gap:4px;align-items:center}
.tl .tl-bad{color:var(--crit);font-weight:600;font-size:13.5px}
.tl .tl-pend{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;background:var(--t-warn-soft);color:var(--t-warn-ink);font-weight:600;font-size:13px;width:max-content}
.tl select,.tl .tl-in{min-height:42px;border-radius:8px}
.tl .tl-b select,.tl .tl-b .tl-in{width:100%;font-weight:600;font-size:15px}
.tl .tl-tags{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:13px;color:var(--t-mute)}
.tl .tl-prog{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(250px,1fr);gap:20px;padding:20px 22px}
@media (max-width:900px){.tl .tl-prog{grid-template-columns:1fr}}
.tl .tl-big{font-size:40px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.1;color:var(--t-ink)}.tl .tl-big.ok{color:var(--t-ok-ink)}
.tl .tl-bar{display:flex;align-items:center;gap:16px;margin-top:12px}
.tl .tl-tr{flex:1;height:14px;border-radius:999px;background:var(--t-soft);overflow:hidden}.tl .tl-tr i{display:block;height:100%;border-radius:999px;background:var(--t-blue)}.tl .tl-tr i.ok{background:var(--t-ok)}
.tl .tl-pct{font-size:24px;font-weight:800;min-width:72px;text-align:right;font-variant-numeric:tabular-nums;color:var(--t-blue)}.tl .tl-pct.ok{color:var(--t-ok-ink)}
.tl .tl-pinfo{display:flex;gap:36px;flex-wrap:wrap;margin-top:14px}.tl .tl-pinfo .tl-v{font-size:20px}
.tl .tl-fb{border-radius:10px;display:grid;place-items:center;text-align:center;padding:18px;gap:6px;align-content:center;background:var(--t-blue-soft);color:var(--t-blue)}
.tl .tl-fb.ok{background:var(--t-ok-soft);color:var(--t-ok-ink);border:1px solid var(--t-ok-line)}.tl .tl-fb.n{background:var(--t-grey-soft);color:var(--t-mute)}
.tl .tl-fb b{font-size:20px}.tl .tl-fb p{margin:0}
.tl .tl-ab{display:flex;align-items:center;gap:14px;padding:12px 20px;flex-wrap:wrap}
.tl .tl-vd{width:1px;align-self:stretch;background:var(--t-line);min-height:32px}
.tl .tl-ab .kvrow{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin:0}.tl .tl-ab .kvrow input{width:20px;height:20px}
.tl .sq-ocorrencias{background:var(--t-card);border:1px solid var(--t-line);border-left:4px solid var(--t-blue);border-radius:12px;padding:16px 20px;margin:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,320px);gap:6px 20px;align-items:start}
.tl .sq-ocorrencias>h4{grid-column:1/-1;margin:0;font-size:17px;font-family:var(--f-body);text-transform:none;letter-spacing:0;color:var(--t-ink)}.tl .sq-ocorrencias>p{grid-column:1/-1;margin:0 0 6px}
.tl .sq-ocorrencias .sq-oc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tl .sq-ocorrencias fieldset{border:1px solid var(--t-line);border-radius:10px;padding:10px 14px;margin:0;min-width:0}
.tl .sq-ocorrencias legend{font-weight:600;padding:0 4px;font-family:var(--f-body);text-transform:none;letter-spacing:0;font-size:14px;color:var(--t-ink)}.tl .sq-ocorrencias select{width:100%}
.tl .sq-ocorrencias>.row{display:grid;gap:8px;align-content:center;border-left:1px solid var(--t-line);padding-left:20px;align-self:stretch}
.tl .sq-ocorrencias>.row .btn{min-height:52px;width:100%;background:var(--t-pri)!important;border-color:var(--t-pri)!important;color:var(--t-pri-ink)!important;font-size:15px}
@media (max-width:1000px){.tl .sq-ocorrencias{grid-template-columns:1fr}.tl .sq-ocorrencias>.row{border-left:0;padding-left:0}}
@media (max-width:620px){.tl .sq-ocorrencias .sq-oc-grid{grid-template-columns:1fr}.tl .tl-head h3{font-size:25px}.tl .tl-big{font-size:34px}.tl .tl-acts{width:100%;display:grid;grid-template-columns:1fr 1fr}}
.tl .tl-obs{padding:12px 20px}.tl .tl-obs summary{cursor:pointer;font-weight:600;min-height:28px}.tl .tl-obs textarea{width:100%;min-height:70px;margin-top:8px}
@media (prefers-reduced-motion:reduce){.tl *{transition:none!important}}`;
  function estilo() { if (document.getElementById('tlCss')) return; const s = document.createElement('style'); s.id = 'tlCss'; s.textContent = css; document.head.appendChild(s); }
  const tip = k => typeof ib === 'function' ? ib(k) : '';
  const badge = st => { const c = st === 'fechado' ? 'fe' : /pendente/.test(st || '') ? 'pe' : ''; return `<span class="tl-badge ${c}">${st === 'fechado' ? ic('lock', 13) : '<i></i>'}${esc(st || '—')}</span>`; };
  const noite = ps => { const m = U.toMin(ps.snap.start); return m != null && (m >= 18 * 60 || m < 5 * 60); };
  const card = (ico, cls, rot, corpo) => `<div class="tl-c tl-k"><span class="tl-ico ${cls}">${ic(ico)}</span><div class="tl-b"><span class="tl-l">${rot}</span>${corpo}</div></div>`;
  const pct2 = v => v == null || !isFinite(v) ? '—' : U.pct(v, 2);
  function catsDoTurno(res, ps) { const L = (res.flat || []).filter(f => f.ps === ps && f.cat), vistos = []; for (const f of L) if (!vistos.includes(f.cat)) vistos.push(f.cat); return vistos; }
  /* falta e ritmo: quanto falta para a meta e peças/h nas horas que restam do turno (só com o turno em andamento hoje) */
  function retorno(day, ps, dentro, meta) {
    if (!(meta > 0)) return { cls: 'n', ico: 'target', t: 'Sem meta para este turno', p: 'A meta vem dos intervalos e do catálogo do turno.' };
    if (dentro >= meta) return { cls: 'ok', ico: 'trophy', t: 'Meta do turno atingida!', p: `Você já alcançou ${U.pct(dentro / meta, 0)} da meta.` };
    const falta = meta - dentro, w = OeeReal.janelaPs(ps); let p = ps.status === 'fechado' ? 'O turno foi fechado abaixo da meta.' : 'Faltam peças boas para a meta do turno.';
    if (w && ps.status !== 'fechado' && day.date === U.today()) { const agora = typeof opNowMin === 'function' ? opNowMin(day.date) : null; if (agora != null && agora >= w[0] && agora < w[1]) { const h = (w[1] - agora) / 60; if (h > 0) p = `Ritmo necessário: ${fq(falta / h)} ${unitLbl()}/h nas ${U.fmt(Math.ceil(h * 10) / 10, 1)} h restantes.`; } }
    return { cls: '', ico: 'trend', t: `${ps.status === 'fechado' ? 'Faltaram' : 'Faltam'} ${fq(falta)} ${unitLbl()}`, p };
  }
  function bloco(day, sr, res) {
    const ps = sr.ps; if (ps.summary) return shiftBlock(day, sr, res);
    estilo();
    const r = sr.r, lk = locked(day, ps), x = TurnoCard.real(day, sr, res), dentro = r.good - x.fora, meta = r.metaOp;
    const cats = db().catalogs.filter(c => c.active !== false && Engine.catalogValid(c, day.date)), prod = catsDoTurno(res, ps);
    const w = OeeReal.janelaPs(ps), mx = w ? OeeReal.mes(db(), day, w[0], w[1]) : null, fb = retorno(day, ps, dentro, meta);
    const okP = meta > 0 && dentro >= meta, pc = meta > 0 ? dentro / meta : null;
    const hh = it => `${U.hhmm(it.t0 % 1440)} – ${U.hhmm(it.t1 % 1440)}${it.data !== day.date ? ' de ' + U.brDate(it.data).slice(0, 5) : ''}`;
    const scr = day.scrapMode === 'day' ? `<span class="tl-v sm">${U.fmt(r.scrap)} <small>peças</small></span><span class="tl-a">rateado do total diário</span>`
      : `${ps.scrap == null ? '<span class="tl-pend">● Não informado</span>' : `<span class="tl-v sm">${U.fmt(ps.scrap)} <small>peças</small></span><span class="tl-a">${U.pct(r.scrapPct, 2)} · ${ps.scrapMaq ? 'por máquina' : 'só o total'}${TurnoCard.gelTxt(day, sr, res)}</span>`}
        <button type="button" class="btn" data-scrapturno="${ps.id}" style="margin-top:6px;min-height:42px">${lk ? 'Ver scrap' : ps.scrap == null ? 'Lançar scrap' : 'Editar scrap'}</button>`;
    const trocas = mx && mx.trocas && mx.trocas.length ? `<div class="tl-a" style="display:grid;gap:2px;margin-top:4px">${mx.trocas.map(t => `<div>Troca de ${t.kind === 'catalogo' ? 'catálogo' : 'lote'}: <b>${esc(t.de || '?')}</b>${t.kind === 'catalogo' ? ` (${esc(t.deCat || '')})` : ''} terminou ${OeeReal.hhmm(t.fim, mx.base)} → <b>${esc(t.para || '?')}</b>${t.kind === 'catalogo' ? ` (${esc(t.paraCat || '')})` : ''} começou ${OeeReal.hhmm(t.ini, mx.base)} · <b>${OeeReal.dur(t.min)}</b></div>`).join('')}<div>Total de troca no turno: <b>${OeeReal.dur(U.sum(mx.trocas, t => t.min))}</b></div></div>` : '';
    return `<section class="tl" data-tl="${ps.id}" aria-label="${esc(ps.snap.name)}">
  <header class="tl-c tl-head">
    <span class="tl-hic">${ic(noite(ps) ? 'moon' : 'sun', 24)}</span><h3>${esc(ps.snap.name)}</h3>
    <span class="tl-hr">${ps.snap.start || ''} – ${ps.snap.end ? U.hhmm(U.toMin(ps.snap.end)) : ''}</span>${badge(ps.status)}
    <span class="tl-sp"></span><div class="tl-acts">${lk ? `<button class="btn" data-reopenps="${ps.id}">${ic('unlock', 18)} Reabrir turno</button>` : `<button class="btn tl-pri" data-closeps="${ps.id}">${ic('lock', 18)} Fechar turno</button>`}${HHPs.botao(ps)}</div>
  </header>
  <div class="tl-g4">
    ${card('box', '', `Catálogo em produção ${tip('initialCatalog')}`, `<select data-psf="${ps.id}|initialCatalogId" ${lk ? 'disabled' : ''} data-fk="ps-cat-${ps.id}" aria-label="Catálogo inicial do turno"><option value="">(segue o turno anterior)</option>${cats.map(c => `<option value="${c.id}" ${ps.initialCatalogId === c.id ? 'selected' : ''}>${esc(c.code)} - ${esc(c.name || '')}</option>`).join('')}</select>
      <span class="tl-tags">Produzindo: ${prod.length ? prod.map(id => catPill(id)).join('') : '<span class="muted">—</span>'}</span>`)}
    ${card('user', '', `Responsável do turno ${tip('shiftResponsible')}`, `<input type="text" class="tl-in" data-psf="${ps.id}|responsible" value="${esc(ps.responsible || '')}" maxlength="60" placeholder="${esc(ps.closing ? ps.closing.by || 'Quem responde pelo turno' : 'Quem responde pelo turno')}" data-fk="ps-resp-${ps.id}" aria-label="Responsável do turno">`)}
    ${card('clock', '', `Tempo planejado ${tip('plannedTime')}`, `<span class="tl-v">${U.fmt(r.netMin)} <small>min</small></span><span class="tl-a">Bruto ${U.fmt(r.grossMin)} · Descontos ${U.fmt(r.deductMin)}${r.extraMin ? ` · extra ${U.fmt(r.extraMin)}` : ''}</span>`)}
    ${card('fab', '', `Meta de produção (dentro do turno) ${tip('metaOp')}`, `<span class="tl-v">${fq(meta)} <small>${unitLbl()}</small></span>`)}
  </div>
  <div class="tl-c tl-prog">
    <div>
      <span class="tl-l">Produção dentro do turno ${tip('prodDentro')}</span>
      <div class="tl-big${okP ? ' ok' : ''}">${fq(dentro)} <small style="font-size:24px">${unitLbl()}</small></div>
      <div class="tl-bar" role="progressbar" aria-label="Produção dentro do turno em relação à meta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc == null ? 0 : Math.round(Math.min(1, pc) * 100)}"><span class="tl-tr"><i class="${okP ? 'ok' : ''}" style="width:${pc == null ? 0 : Math.min(100, pc * 100).toFixed(1)}%"></i></span><b class="tl-pct${okP ? ' ok' : ''}">${pc == null ? '—' : U.pct(pc, 0)}</b></div>
      <div class="tl-pinfo">
        <div><div class="tl-v">${fq(r.good)} <small>${unitLbl()}</small></div><div class="tl-a">Produção total considerada ${tip('prodTotal')}</div></div>
        <div>${meta > 0 ? (r.good >= meta ? `<span class="tl-okt">${ic('check', 16)} Meta ${fq(meta)} ${unitLbl()}</span>` : `<span class="tl-bad">Meta ${fq(meta)} ${unitLbl()} · ${U.pct(r.attain, 0)}</span>`) : '<span class="tl-a">Sem meta</span>'}<div class="tl-a">${x.fora ? 'Turno + janela fora do turno' : 'Só o turno'}</div></div>
      </div>
    </div>
    <div class="tl-fb ${fb.cls}" role="status">${ic(fb.ico, 38)}<b>${fb.t}</b><p>${fb.p}</p></div>
  </div>
  <div class="tl-g4">
    ${card('bars', '', `Produção fora do turno ${tip('prodFora')}`, x.its.length ? `<span class="tl-v">${fq(x.fora)} <small>${unitLbl()}</small></span><span class="tl-a">${U.fmt(x.caixas)} caixa(s) · ${x.its.map(hh).join(' · ')}</span>` : `<span class="tl-v sm">—</span><span class="tl-a">Nenhuma caixa fora do turno</span>`)}
    ${card('box', 'p', `Caixas do MES ${tip('mesTurno')}`, !mx ? '<span class="tl-v sm">—</span><span class="tl-a">Sem CSV do MES importado</span>' : mx.n ? `<span class="tl-v sm">1ª ${OeeReal.hhmm(mx.m0, mx.base)} · última ${OeeReal.hhmm(mx.m1, mx.base)}</span><span class="tl-a">${U.fmt(mx.n)} caixa(s)</span>${trocas}` : `<span class="tl-v sm">—</span><span class="tl-a">Nenhuma caixa nesta janela</span>${trocas}`)}
    ${card('pause', 'o', `Minutos de parada ${tip('stopsTurno')}`, `<span class="tl-v">${U.fmt(r.aMin + r.pMin)} <small>min</small></span><span class="tl-a">${U.fmt(r.events)} evento(s)</span>`)}
    ${card('trash', 'g', `Scrap ${tip('scrapTurno')}`, scr)}
  </div>
  <div class="tl-g4">
    ${card('target', '', `Capacidade planejada ${tip('capacity')}`, `<span class="tl-v">${fq(r.cap)} <small>${unitLbl()}</small></span>`)}
    ${card('trend', '', `OEE reportado ${tip('oeeRep')}`, `<span class="tl-v">${pct2(r.oee)}</span>${r.oeeTarget == null ? '<span class="tl-a">sem meta</span>' : r.oee != null && r.oee >= r.oeeTarget ? `<span class="tl-okt">${ic('check', 15)} Meta ${pct2(r.oeeTarget)}</span>` : `<span class="tl-bad">Meta ${pct2(r.oeeTarget)}</span>`}`)}
    ${card('bars', '', `OEE real ${tip('oeeReal')}`, `<span class="tl-v">${pct2(x.real)}</span><span class="tl-a">${x.extraMin ? `+${U.fmt(x.extraMin)} min fora do turno` : 'igual ao reportado'}</span>`)}
    ${card('gear', '', `D · P · Q ${tip('dpq')}`, `<span class="tl-v sm tl-dpq"><span>${pct2(r.D)}</span> · <span>${pct2(r.P)}</span> · <span>${r.Q == null ? '—' : pct2(r.Q)}</span></span>${sr.scrapAllocated ? '<span class="tl-a">Q do dia (scrap diário)</span>' : ''}`)}
  </div>
  <div class="tl-c tl-ab">
    <span class="tl-ico g" style="width:36px;height:36px">${ic('person', 18)}</span><span class="tl-l" style="font-weight:600">Abonos ${tip('breaks')}</span>
    <div class="row" style="flex-wrap:wrap;gap:8px">${abonoChips(day, ps, lk)}</div>
    <span class="tl-vd" aria-hidden="true"></span>
    <label class="kvrow"><input type="checkbox" data-shoff="${ps.id}" ${ps.off ? 'checked' : ''} ${lk ? 'disabled' : ''}> <span>Turno sem produção</span>${ps.off ? `<span class="small muted">· ${offTxt(ps)}</span> <button type="button" class="btn xs" data-shoffed="${ps.id}">alterar</button>` : ''}</label>
  </div>
  ${Sqdcp.formularioTurno(day, ps)}
  <details class="tl-c tl-obs"${ps.note ? ' open' : ''}><summary>Observações do turno${ps.note ? '' : ' <span class="small muted">(nenhuma)</span>'}</summary><textarea data-psf="${ps.id}|note" maxlength="1500" data-fk="ps-note-${ps.id}" aria-label="Observações do turno">${esc(ps.note || '')}</textarea>
    ${ps.closing ? `<div class="small muted" style="margin-top:6px">Fechado por ${esc(ps.closing.by)} em ${U.brDT(ps.closing.at)} · OEE no fechamento ${pct2(ps.closing.snapshot.oee)}</div>` : ''}
    ${(ps.reopenHistory || []).slice(-2).map(h => `<div class="small" style="color:var(--warn)">Reaberto por ${esc(h.by)} em ${U.brDT(h.at)}: ${esc(h.reason)}</div>`).join('')}</details>
</section>`;
  }
  return { bloco, retorno, catsDoTurno };
})();
Object.assign(HELP, {
  metaOp: ['Meta de produção do turno', [['O que é?', 'Soma da meta operacional de todos os intervalos do turno, pelo catálogo de cada hora e pelo arredondamento do Portal.'], ['Exemplo', '8 horas de 69.750 peças = 558.000 un.']]],
  stopsTurno: ['Minutos de parada', [['O que é?', 'Paradas apontadas no turno (disponibilidade + performance), em minutos, e quantos eventos.'], ['Exemplo', '4 min em 1 evento: uma microparada no EQ03.']]],
  dpq: ['D · P · Q', [['O que é?', 'Disponibilidade · Performance · Qualidade do turno. O OEE é o produto dos três.'], ['Exemplo', '99,22% × 76,01% × 100,00% = 75,42%.']]]
});
