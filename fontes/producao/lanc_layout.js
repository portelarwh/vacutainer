/* ===== Produção 2.4.47 · Lançamento: servidor, lotes do dia, 3º turno e produção fora do turno no layout novo (11/11/2026) =====
   Mesma lógica visual do turno (turno_layout.js): cartões brancos, cabeçalho com indicadores, decisões em destaque e textos longos
   em blocos recolhíveis.
   - "Produção registrada no servidor": produção do dia, trocas e validação (Dados conferidos ou Revisar sugestões) + linha do tempo
     com barras por lote na cor do catálogo (lote e caixas dentro), marcador de troca com dica (horário, catálogo e lote anterior e novo)
     e a legenda em "Entenda as marcações".
   - "Lotes do dia": um cartão por lote (catálogo, produto, lote, caixas, Marcar como retrabalho) e "Ver histórico de lotes".
   - Turno não produtivo (ex.: 3º turno): seção própria com o switch "Habilitar … neste dia" e o que muda.
   - "Produção fora do turno": resumo (caixas, produção, período, OEE do período), tabela e "Como a produção fora do turno é contabilizada?".
   Só a tela muda: dados de SrvUI.sug (sugestões do servidor), TurnoNP.doDia e res.foraTurno; ids e data-* de antes (#srvRev, #srvCls,
   data-rw, data-rwapply, data-turnonp, data-route="lots"), então SrvUI.bindDay e ForaTurnoUI.mount continuam ligando os botões. */
const LancUI = (() => {
  const css = `
.lc{display:grid;gap:16px;margin-bottom:16px}
.lc .lc-c{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px 20px;box-shadow:0 1px 2px rgba(16,42,86,.05);min-width:0}
.lc{--l-blue:#1565A8;--l-blue-soft:#E7F0FA;--l-pri:#0D4778;--l-ok:#159451;--l-ok-ink:#11743F;--l-ok-soft:#ECF8F0;--l-warn:#C97A16;--l-warn-ink:#8A4F06;--l-warn-soft:#FEF4E6;--l-pur:#7A45C5;--l-pur-soft:#F1EAFB}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .lc{--l-blue:#5AA2EC;--l-blue-soft:#1A2F45;--l-pri:#2F6FB0;--l-ok:#3FC07A;--l-ok-ink:#6FD89D;--l-ok-soft:#132B20;--l-warn:#F2AC55;--l-warn-ink:#F5BE78;--l-warn-soft:#2E2414;--l-pur:#B08CEB;--l-pur-soft:#2A2140}}
:root[data-theme="dark"] .lc{--l-blue:#5AA2EC;--l-blue-soft:#1A2F45;--l-pri:#2F6FB0;--l-ok:#3FC07A;--l-ok-ink:#6FD89D;--l-ok-soft:#132B20;--l-warn:#F2AC55;--l-warn-ink:#F5BE78;--l-warn-soft:#2E2414;--l-pur:#B08CEB;--l-pur-soft:#2A2140}
.lc .lc-svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.lc .lc-hd{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.lc .lc-hic{width:40px;height:40px;border-radius:10px;background:var(--l-blue);color:var(--surface);display:grid;place-items:center;flex:none}
.lc h3.lc-t{margin:0;font-family:var(--f-body);font-size:20px;font-weight:700;text-transform:none;letter-spacing:0;color:var(--ink)}
.lc .lc-s{margin:2px 0 0;color:var(--muted);font-size:13.5px}
.lc .lc-sp{flex:1}
.lc .lc-ks{display:flex;gap:12px;flex-wrap:wrap}
.lc .lc-k{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:10px 14px;min-height:60px;background:var(--surface)}
.lc .lc-k .ki{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;background:var(--l-blue-soft);color:var(--l-blue);flex:none}
.lc .lc-k .kl{font-size:12.5px;color:var(--muted)}.lc .lc-k .kv{font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.2}
.lc .lc-k.ok .ki{background:var(--l-ok);color:#fff}.lc .lc-k.ok .kv{color:var(--l-ok-ink)}
.lc .lc-k.warn .ki{background:var(--l-warn-soft);color:var(--l-warn)}.lc .lc-k.warn .kv{color:var(--l-warn-ink)}
.lc .lc-k .btn{min-height:40px}
.lc .lc-tl{position:relative;margin-top:16px;padding-top:22px}
.lc .lc-ticks{position:relative;height:18px;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.lc .lc-ticks span{position:absolute;transform:translateX(-50%);white-space:nowrap}.lc .lc-ticks span::after{content:"";position:absolute;left:50%;top:18px;height:58px;border-left:1px dashed var(--line)}
.lc .lc-track{position:relative;height:50px;border-radius:10px;background:var(--surface-2);border:1px solid var(--line);margin-top:4px}
.lc .lc-seg{position:absolute;top:6px;bottom:6px;border-radius:6px;background:var(--cc);color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;padding:0 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:3px;cursor:default}
.lc .lc-seg span{overflow:hidden;text-overflow:ellipsis}
.lc .lc-seg.retrabalho,.lc .lc-seg.pendente{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.35) 0 6px,transparent 6px 12px)}
.lc .lc-ev{position:absolute;top:-4px;bottom:-4px;z-index:2;padding:0;border:0;background:none;cursor:help;transform:translateX(-50%);width:14px}
.lc .lc-ev i{display:block;width:8px;height:100%;margin:0 auto;border-radius:4px;background:#F2B233;box-shadow:0 0 0 2px var(--surface)}
.lc .lc-ev.lote i{width:6px;background:#D9A86C}
.lc .lc-gap{position:absolute;top:6px;bottom:6px;z-index:1;border-radius:4px;background:repeating-linear-gradient(135deg,var(--muted) 0 2px,transparent 2px 7px);opacity:.55}
.lc .lc-tip{display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--ink);color:var(--surface);border-radius:8px;padding:8px 10px;font-size:12.5px;font-weight:400;line-height:1.45;width:max-content;max-width:260px;text-align:left;z-index:5;white-space:normal}
.lc .lc-ev:hover .lc-tip,.lc .lc-ev:focus-visible .lc-tip,.lc .lc-seg:hover .lc-tip{display:block}
.lc .lc-leg{margin-top:12px;border:1px solid var(--line);border-radius:10px;padding:8px 14px}
.lc .lc-leg summary,.lc .lc-how summary{cursor:pointer;font-weight:600;color:var(--l-blue);min-height:28px;display:flex;align-items:center;gap:8px}
.lc .lc-leg .row{gap:18px;flex-wrap:wrap;margin-top:8px;font-size:13px;color:var(--muted)}
.lc .lc-sw{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:6px}
.lc .lc-row2{display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,1fr);gap:16px}
@media (max-width:1000px){.lc .lc-row2{grid-template-columns:1fr}}
.lc .lc-lots{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:14px}
.lc .lc-lot{border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:grid;gap:4px;background:var(--surface)}
.lc .lc-lot.rw{border-color:var(--l-warn);background:var(--l-warn-soft)}
.lc .lc-lot .tags{display:flex;gap:6px;flex-wrap:wrap}
.lc .lc-tag{display:inline-block;padding:2px 9px;border-radius:6px;background:var(--l-pur-soft);color:var(--l-pur);font-weight:600;font-size:12.5px}
.lc .lc-lot .lt{font-size:15px}.lc .lc-lot .cx{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}
.lc .lc-lot label{display:inline-flex;align-items:center;gap:8px;min-height:36px;cursor:pointer;font-size:14px}.lc .lc-lot input[type=checkbox]{width:18px;height:18px}
.lc .lc-link{color:var(--l-blue);font-weight:600;background:none;border:0;cursor:pointer;min-height:40px;padding:0 4px}
.lc .lc-np{display:grid;gap:12px;align-content:start}
.lc .lc-swt{display:flex;align-items:center;gap:14px;cursor:pointer;min-height:44px}
.lc .lc-swt input{appearance:none;width:52px;height:30px;border-radius:999px;background:var(--line);position:relative;cursor:pointer;flex:none;transition:background .2s;margin:0}
.lc .lc-swt input::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:left .2s}
.lc .lc-swt input:checked{background:var(--l-blue)}.lc .lc-swt input:checked::after{left:25px}
.lc .lc-swt input:focus-visible{outline:2px solid var(--l-blue);outline-offset:2px}.lc .lc-swt input:disabled{opacity:.5}
.lc .lc-swt b{font-size:16px;display:block}
.lc .lc-info{border-radius:10px;background:var(--l-blue-soft);padding:12px 14px;font-size:13.5px;display:flex;gap:10px;color:var(--ink)}
.lc .lc-info .lc-svg{color:var(--l-blue);margin-top:1px}
.lc .lc-sum{display:flex;gap:24px;align-items:center;flex-wrap:wrap;border-radius:10px;background:var(--l-blue-soft);padding:14px 18px;margin-top:14px}
.lc .lc-sum .big{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.lc .lc-sum .vd{width:1px;align-self:stretch;background:color-mix(in srgb,var(--l-blue) 30%,transparent)}
.lc .lc-sum .it{display:flex;gap:8px;align-items:center;font-size:14.5px}.lc .lc-sum .it b{font-variant-numeric:tabular-nums}
.lc .lc-tw{margin-top:14px;border:1px solid var(--line);border-radius:10px;overflow-x:auto}
.lc .lc-tw table{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
.lc .lc-tw th{text-align:left;font-weight:600;font-size:13px;color:var(--muted);background:var(--surface-2);padding:10px 14px;text-transform:none;letter-spacing:0;font-family:var(--f-body)}
.lc .lc-tw td{padding:12px 14px;border-top:1px solid var(--line);vertical-align:top}
.lc .lc-how{margin-top:14px;border:1px solid var(--line);border-radius:10px;padding:10px 16px}
.lc .lc-how ul{margin:8px 0;padding-left:20px;display:grid;gap:4px}.lc .lc-how p{margin:6px 0}
.lc .lc-banner{border-radius:10px;background:var(--l-warn-soft);color:var(--l-warn-ink);padding:12px 14px;margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
@media (max-width:620px){.lc .lc-ticks span:nth-child(even){display:none}.lc .lc-c{padding:16px}.lc .lc-ks{width:100%}.lc .lc-k{flex:1 1 100%}.lc .lc-sum .vd{display:none}}
@media (prefers-reduced-motion:reduce){.lc *{transition:none!important}}
/* resto do Lançamento na mesma lógica: cartões arredondados, títulos e rótulos em texto normal (sem caixa alta), números em destaque */
#main[data-rota="launch"] .card{border-radius:12px}
#main[data-rota="launch"] .card.section{padding:18px 20px}
#main[data-rota="launch"] .card>header h3,#main[data-rota="launch"] section.card h3{font-family:var(--f-body);text-transform:none;letter-spacing:0;font-size:19px;font-weight:700}
#main[data-rota="launch"] .kpis{gap:12px}
#main[data-rota="launch"] .kpi{border-radius:12px;padding:16px 18px}
#main[data-rota="launch"] .kpi .l{font-family:var(--f-body);text-transform:none;letter-spacing:0;font-size:13px;font-weight:500;color:var(--ink);white-space:normal;overflow:visible;text-overflow:clip;padding-right:34px;line-height:1.3}
#main[data-rota="launch"] .kpi .s{font-size:12.5px}
#main[data-rota="launch"] .kv .l,#main[data-rota="launch"] .dh-l,#main[data-rota="launch"] .card .lbl{text-transform:none;letter-spacing:0;font-family:var(--f-body)}
#main[data-rota="launch"] .btn{border-radius:8px}
#cabDia.cab-fold>:not(header){display:none}
#cabDia .cab-tg{min-height:32px;font-weight:600}`;
  const P = {
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>', box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
    swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', bars: '<path d="M5 20v-7M12 20V8M19 20V4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const ic = (k, n = 20) => `<svg class="lc-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true">${P[k]}</svg>`;
  function estilo() { if (document.getElementById('lcCss')) return; const s = document.createElement('style'); s.id = 'lcCss'; s.textContent = css; document.head.appendChild(s); }
  const tip = k => typeof ib === 'function' ? ib(k) : '';
  const L = 'line_vac';
  const catBy = code => (db().catalogs || []).find(c => !c.deleted && String(c.code) === String(code)) || null;
  const cor = code => { const c = catBy(code); if (!c) return '#768290'; const f = (db().families || []).find(x => x.id === c.familyId); return c.color || (f && f.color) || '#7A45C5'; };
  const famCode = code => { const c = catBy(code); const f = c && (db().families || []).find(x => x.id === c.familyId); return f ? f.code : ''; };
  const cx = n => `${U.fmt(n)} caixa${n === 1 ? '' : 's'}`;
  const hm = t => String(t || '').slice(11, 16);
  function pend(S) {
    const goods = S.ivs.filter(x => !x.off && (x.st === 'vazio' && x.n.normal > 0 || x.st === 'diverge')), cats = S.ivs.filter(x => x.catSug), evs = S.events.filter(e => !e.dup);
    return goods.length + cats.length + evs.length;
  }
  /* ---------- servidor ---------- */
  function servidor(day, res) {
    let S = null; try { S = SrvUI.sug(day, res); } catch (e) { return ''; }
    if (!S || !S.has) return '';
    const q = S.qty, tot = k => U.sum(S.lots.filter(x => x.kind === k), x => x.n), n = pend(S);
    const pends = S.lots.filter(x => x.kind === 'pendente'), chg = S.events.filter(e => e.type === 'catalogo' || e.type === 'lote');
    const nCat = chg.filter(e => e.type === 'catalogo').length, nLote = chg.length - nCat;
    const span = S.w1 - S.w0, pct = m => Math.max(0, Math.min(100, (m - S.w0) / span * 100));
    const kind = lot => ServerData.lotKind(db(), L, lot, null, S.date);
    const ticks = []; for (let m = Math.ceil(S.w0 / 120) * 120; m <= S.w1; m += 120) ticks.push(m);
    const segs = S.segs.map(s => { const a = pct(ServerData.tm(s.t0) - S.base), b = pct(ServerData.tm(s.t1) - S.base), k = kind(s.lot), nb = Math.max(0, (+s.b1 || 0) - (+s.b0 || 0) + 1);
      const t = `Lote ${s.lot} · ${cx(nb)}`;
      return `<div class="lc-seg ${k}" style="left:${a}%;width:${Math.max(0.4, b - a)}%;--cc:${esc(cor(s.cat))}" role="img" aria-label="${esc(`${t} · catálogo ${s.cat} · ${hm(s.t0)} a ${hm(s.t1)}${k !== 'normal' ? ' · ' + Srv.KIND[k] : ''}`)}"><span>${esc(t)}</span><span class="lc-tip"><b>Lote ${esc(s.lot)}</b><br>Catálogo ${esc(s.cat)}${famCode(s.cat) ? ' · ' + esc(famCode(s.cat)) : ''}<br>${hm(s.t0)} – ${hm(s.t1)} · ${cx(nb)}${k !== 'normal' ? '<br>' + esc(Srv.KIND[k]) : ''}</span></div>`; }).join('');
    const marks = chg.map(e => { const c = e.info || {}; const t = e.type === 'catalogo' ? 'Troca de catálogo' : 'Troca de lote';
      return `<button type="button" class="lc-ev ${e.type}" style="left:${pct((e.start + e.end) / 2)}%" aria-label="${esc(`${t} ${hm(c.first) || U.hhmm(e.start)}: ${c.fromCat || ''} lote ${c.fromLot || ''} para ${c.toCat || ''} lote ${c.toLot || ''}`)}"><i></i><span class="lc-tip"><b>${t} · ${hm(c.first) || U.hhmm(e.start)}</b><br>Catálogo: ${esc(c.fromCat || '?')} → ${esc(c.toCat || '?')}<br>Lote: ${esc(c.fromLot || '?')} → ${esc(c.toLot || '?')}<br>Última caixa ${hm(c.last)} · 1ª caixa ${hm(c.first)} (${U.fmt(e.end - e.start)} min)</span></button>`; }).join('');
    const gaps = S.events.filter(e => e.type === 'parada').map(e => `<div class="lc-gap" style="left:${pct(e.start)}%;width:${Math.max(0.3, pct(e.end) - pct(e.start))}%" title="${esc(`${U.range(e.start, e.end)} · ${e.note}`)}"></div>`).join('');
    const valid = n ? `<div class="lc-k warn"><span class="ki">${ic('alert', 18)}</span><div><div class="kl">Validação</div><div class="kv">${n} sugest${n === 1 ? 'ão' : 'ões'} para revisar</div></div><button class="btn primary" id="srvRev">Revisar</button></div>`
      : `<div class="lc-k ok"><span class="ki">${ic('check', 18)}</span><div><div class="kl">Validação</div><div class="kv">Dados conferidos</div><div class="kl">Lançamento confere com o servidor</div></div></div>`;
    const lotes = S.lots.map(x => { const rw = x.kind === 'retrabalho', has = (day.events || []).some(e => !e.deleted && e.srvRework === x.lot), nt = (((db().server || {}).lotNotes || {})[x.lot] || {}).text, c = catBy(x.cat);
      return `<div class="lc-lot${rw ? ' rw' : ''}"><div class="tags"><span class="lc-tag">${esc(x.cat)}</span>${famCode(x.cat) ? `<span class="lc-tag">${esc(famCode(x.cat))}</span>` : ''}${x.kind === 'pendente' ? '<span class="lc-tag" style="background:var(--l-warn-soft);color:var(--l-warn-ink)">a confirmar</span>' : ''}</div>
        ${c && c.name ? `<div class="small muted" style="overflow-wrap:anywhere">${esc(c.name)}</div>` : ''}<div class="lt">Lote <span class="mono">${esc(x.lot)}</span></div><div class="cx">${cx(x.n)}</div>
        <label title="${esc(nt || '')}"><input type="checkbox" data-rw="${esc(x.lot)}" ${rw ? 'checked' : ''} ${day.status === 'fechado' ? 'disabled' : ''}> Marcar como retrabalho</label>
        ${rw && !has ? `<button type="button" class="btn xs warnb" data-rwapply="${esc(x.lot)}" title="O lote está marcado como retrabalho, mas o tempo ainda não foi descontado neste dia">Descontar o tempo do retrabalho</button>` : ''}${rw && has ? '<span class="small muted">Fora do OEE neste dia</span>' : ''}${nt ? `<span class="small muted">${esc(nt.slice(0, 60))}</span>` : ''}</div>`; }).join('');
    return {
      topo: `<section class="lc-c" id="srvCard" aria-labelledby="lcSrvT">
      <div class="lc-hd"><span class="lc-hic">${ic('db', 22)}</span><div><h3 class="lc-t" id="lcSrvT">Produção registrada no servidor ${tip('serverData')}</h3><p class="lc-s">Linha do tempo da produção do dia (horário do servidor MES)</p></div><span class="lc-sp"></span>
        <div class="lc-ks"><div class="lc-k"><span class="ki">${ic('box', 18)}</span><div><div class="kl">Produção do dia</div><div class="kv">${cx(tot('normal'))} · ${fq(tot('normal') * q)} ${esc(unitLbl())}</div>${tot('retrabalho') || tot('pendente') ? `<div class="kl">${tot('retrabalho') ? 'retrabalho ' + cx(tot('retrabalho')) : ''}${tot('retrabalho') && tot('pendente') ? ' · ' : ''}${tot('pendente') ? 'a confirmar ' + cx(tot('pendente')) : ''}</div>` : ''}</div></div>
          <div class="lc-k"><span class="ki">${ic('swap', 18)}</span><div><div class="kl">Trocas</div><div class="kv">${chg.length} troca${chg.length === 1 ? '' : 's'}</div>${chg.length ? `<div class="kl">${nCat} de catálogo · ${nLote} de lote</div>` : ''}</div></div>${valid}</div></div>
      ${pends.length ? `<div class="lc-banner">${ic('alert', 18)}<span><b>${pends.length === 1 ? 'Um lote rodou' : pends.length + ' lotes rodaram'} sem ordem no plano:</b> ${pends.map(x => `${esc(x.lot)} (${esc(x.cat)}, ${cx(x.n)})`).join(', ')}. É retrabalho?</span><button type="button" class="btn sm" id="srvCls">Confirmar lotes</button></div>` : ''}
      <div class="lc-tl"><div class="lc-ticks">${ticks.map(m => `<span style="left:${pct(m)}%">${U.hhmm(m)}</span>`).join('')}</div><div class="lc-track">${gaps}${segs}${marks}</div></div>
      <details class="lc-leg"><summary>Entenda as marcações</summary><div class="row">
        <span><span class="lc-sw" style="background:#7A45C5"></span>Trecho de lote (cor do catálogo)</span><span><span class="lc-sw" style="background:#F2B233"></span>Troca de catálogo</span><span><span class="lc-sw" style="background:#D9A86C"></span>Troca de lote</span>
        <span><span class="lc-sw" style="background:repeating-linear-gradient(135deg,var(--muted) 0 2px,transparent 2px 6px)"></span>Sem caixa por mais de ${U.fmt(db().settings.serverGapMin || 10)} min</span><span><span class="lc-sw" style="background:repeating-linear-gradient(135deg,#7A45C5 0 4px,#c9b2ea 4px 8px)"></span>Retrabalho ou lote a confirmar</span></div>
        <p class="small muted" style="margin:8px 0 0">Passe o mouse (ou toque) numa barra ou num marcador para ver horário, catálogo e lote.</p></details>
    </section>`,
      lotes: `<section class="lc-c" aria-labelledby="lcLotT"><div class="lc-hd"><span class="lc-hic">${ic('box', 22)}</span><div><h3 class="lc-t" id="lcLotT">Lotes do dia ${tip('serverRework')}</h3><p class="lc-s">Lotes produzidos neste dia, conforme o servidor.</p></div><span class="lc-sp"></span><button type="button" class="lc-link" data-route="lots">Ver histórico de lotes ${ic('arrow', 16)}</button></div>
      <div class="lc-lots">${lotes || '<p class="small muted">Nenhum lote.</p>'}</div></section>`
    };
  }
  /* ---------- turno não produtivo e produção fora do turno ---------- */
  function npCards(day) {
    let np = []; try { np = TurnoNP.doDia(day); } catch (e) { }
    const lk = day.status === 'fechado';
    return np.map(x => `<section class="lc-c lc-np" aria-label="${esc(x.shift.name)}"><div class="lc-hd"><span class="lc-hic" style="background:var(--l-blue-soft);color:var(--l-blue)">${ic('moon', 22)}</span><div><h3 class="lc-t">${esc(x.shift.name)} ${tip('foraTurno')}</h3><p class="lc-s">Cadastrado como não produtivo no Portal</p></div></div>
      <label class="lc-swt"><input type="checkbox" role="switch" data-turnonp="${esc(x.shift.id)}" ${x.on ? 'checked' : ''} ${lk ? 'disabled' : ''} aria-label="Habilitar ${esc(x.shift.name)} neste dia"><span><b>Habilitar ${esc(x.shift.name)} neste dia</b><span class="small muted">Horário: ${esc(x.v.start || '')} – ${esc(U.hhmm(U.toMin(x.v.end)))}</span></span></label>
      <div class="lc-info">${ic('info', 18)}<div>Habilitado, o ${esc(x.shift.name)} entra neste dia como produtivo: o tempo dele vira <b>tempo planejado</b>, a produção da janela conta nele e os indicadores (OEE, meta) passam a incluí-lo. Vale só para este dia.</div></div></section>`).join('');
  }
  function fora(day, res) {
    const ft = res.foraTurno; if (!ft) return '';
    const itens = [...new Map([...(ft.janela || []), ...(ft.recebe || [])].map(i => [i.data + '|' + i.t0 + '|' + i.t1, i])).values()].sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : a.t0 - b.t0);
    if (!itens.length) return '';
    const caixas = U.sum(itens, i => i.caixas), pecas = U.sum(itens, i => i.pecas);
    const dur = i => Math.max(1, i.t1 - i.t0 + 1), oeeP = (() => { const L2 = itens.filter(i => i.oeeReal != null); const w = U.sum(L2, dur); return w > 0 ? U.sum(L2, i => i.oeeReal * dur(i)) / w : null; })();
    const per = itens.length === 1 ? `${U.hhmm(itens[0].t0)} – ${U.hhmm(itens[0].t1)}` : `${itens.length} trechos`;
    const pct = v => v == null ? '—' : U.pct(v, 2);
    const linha = it => `<tr><td>${esc(String(it.rotulo || '').replace(/^./, c => c.toUpperCase()))} · ${U.brDate(it.data)}</td><td>${U.hhmm(it.t0)} – ${U.hhmm(it.t1)}</td><td>${U.fmt(it.caixas)}</td><td>${fq(it.pecas)} ${esc(unitLbl())}</td><td>${pct(it.oeeReal)}</td><td>${it.alvo ? esc(it.alvo.name) + (it.alvo.date !== day.date ? ` <span class="small muted">${U.brDate(it.alvo.date)}</span>` : '') : '<span class="ferr">sem turno para receber</span>'}<div class="small muted">${esc(it.regra || '')}</div></td></tr>`;
    return `<section class="lc-c" id="ftCard" aria-labelledby="lcFtT"><div class="lc-hd"><span class="lc-hic">${ic('bars', 22)}</span><div><h3 class="lc-t" id="lcFtT">Produção fora do turno ${tip('foraTurno')}</h3><p class="lc-s">Caixas registradas antes do início ou depois do fim dos turnos produtivos.</p></div></div>
      <div class="lc-sum"><span class="it">${ic('clock', 22)}<span><span class="big">${cx(caixas)} · ${fq(pecas)} ${esc(unitLbl())}</span><br><span class="small muted">registradas fora do horário do turno</span></span></span><span class="lc-sp"></span>
        <span class="it">${ic('cal', 20)} Período: <b>${per}</b></span><span class="vd"></span><span class="it">${ic('trend', 20)} OEE do período ${tip('foraTurnoOee')}: <b>${pct(oeeP)}</b></span></div>
      <div class="lc-tw"><table data-nosort="1"><thead><tr><th>Período registrado</th><th>Horário das caixas</th><th>Caixas</th><th>Produção</th><th>OEE do período</th><th>Contabilizado em</th></tr></thead><tbody>${itens.map(linha).join('')}</tbody></table></div>
      ${ft.semAlvo && ft.semAlvo.length ? `<div class="lc-banner">${ic('alert', 18)}<span>${ft.semAlvo.length} trecho(s) sem turno lançado para receber neste dia: crie o lançamento do turno ou habilite o turno.</span></div>` : ''}
      <details class="lc-how"><summary>${ic('book', 18)} Como a produção fora do turno é contabilizada?</summary>
        <p>Cada caixa continua registrada no horário real em que passou no servidor.</p>
        <ul><li>Se a produção continuar depois do fim de um turno, sem parada maior que ${U.fmt(ft.limite)} minutos, ela conta no turno anterior.</li><li>Se não houver essa continuidade, ela conta no próximo turno produtivo.</li><li>O OEE reportado do turno não muda; o tempo fora do turno entra no OEE real.</li></ul>
        <p class="small muted">Regra vigente desde ${U.brDate(ft.desde)}.</p></details></section>`;
  }
  function bloco(day, res) {
    estilo();
    const sv = servidor(day, res), np = npCards(day), ft = fora(day, res);
    if (!sv && !np && !ft) return '';
    const segunda = sv && np ? `<div class="lc-row2">${sv.lotes}<div class="lc" style="margin:0">${np}</div></div>` : (sv ? sv.lotes : '') + np;
    return `<div class="lc section">${sv ? sv.topo : ''}${segunda}${ft}</div>`;
  }
  return { bloco, servidor, fora, npCards };
})();
