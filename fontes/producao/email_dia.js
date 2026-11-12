/* ===== Produção 2.4.66 · e-mail do turno e do dia para o Outlook (pedido do usuário, 12/11/2026) =====
   O operador manda o resumo do turno no fim do turno e, na manhã seguinte, o resumo do dia anterior para a supervisão.
   O e-mail antigo repetia os mesmos números (texto + cartões + tabelas; Segurança e Qualidade três vezes) e era pouco visual.
   Aqui: só para "Passagem de turno" e "Relatório do dia" (os outros relatórios continuam com o e-mail antigo).
   - medidor do OEE reportado (PNG desenhado em canvas: o Outlook não mostra SVG);
   - no e-mail do turno, o medidor do turno e, ao lado, o acumulado do dia (OEE reportado do dia até ali);
   - produção boa × meta com barra de atendimento; D, P, Q, scrap e paradas em cartões;
   - hora a hora em gráfico alto; maiores paradas em barras; Segurança e Qualidade uma vez só;
   - itens escolhidos e ordenados em "Itens do e-mail", gravados por computador em App.prefs.mailLay (turno e dia separados).
   Nenhum número é calculado aqui: tudo vem de Engine.computeDay (o mesmo do Lançamento e do relatório da tela).
   Formato de e-mail: tabelas, CSS inline, 680 px, sem flex/grid/JavaScript (como o vacEmail do kit). */
const EmailDia = {
  ITENS: {
    shift: [['painel', 'Medidor do OEE do turno, acumulado do dia e produção', 1], ['kpis', 'Disponibilidade, Performance, Qualidade, scrap e paradas', 1], ['hh', 'Gráfico hora a hora', 1], ['paradas', 'Maiores paradas (barras)', 1],
      ['sq', 'Segurança e Qualidade', 1], ['obs', 'Observações do turno', 1], ['hhtab', 'Tabela hora a hora', 0], ['lista', 'Lista completa das paradas', 0], ['resumo', 'Resumo em texto', 0]],
    day: [['painel', 'Medidor do OEE do dia e produção', 1], ['kpis', 'Disponibilidade, Performance, Qualidade, scrap e paradas', 1], ['turnos', 'Resultado por turno', 1], ['hh', 'Gráfico hora a hora', 1], ['paradas', 'Maiores paradas (barras)', 1],
      ['sq', 'Segurança e Qualidade', 1], ['obs', 'Observações registradas', 1], ['cascata', 'Cascata do OEE (gráfico)', 0], ['lista', 'Lista completa das paradas', 0], ['resumo', 'Resumo em texto', 0]]
  },
  vale(tipo) { return tipo === 'shift' || tipo === 'day'; },
  /* layout gravado + itens novos do padrão (no fim) − itens que deixaram de existir */
  lay(tipo) {
    const P = this.ITENS[tipo], g = ((App.prefs.mailLay || {})[tipo] || []).filter(x => x && P.some(p => p[0] === x.id));
    return g.concat(P.filter(p => !g.some(x => x.id === p[0])).map(p => ({ id: p[0], on: !!p[2] })));
  },
  gravar(tipo, L) { App.prefs.mailLay = App.prefs.mailLay || {}; App.prefs.mailLay[tipo] = L.map(x => ({ id: x.id, on: !!x.on })); savePrefs(); },
  padrao(tipo) { if (App.prefs.mailLay) { delete App.prefs.mailLay[tipo]; savePrefs(); } },
  nome(tipo, id) { return (this.ITENS[tipo].find(p => p[0] === id) || [, id])[1]; },

  /* ---------- dados (os mesmos números da tela) ---------- */
  dados(R) {
    const d = db(), day = (d.productionDays || []).find(z => !z.deleted && z.lineId === 'line_vac' && z.date === R.date); if (!day) return null;
    const res = Engine.computeDay(d, day), turno = R.type === 'shift';
    const sr = turno ? (res.shifts.find(s => s.ps.id === R.psId) || res.shifts[0]) : null; if (turno && !sr) return null;
    const r = turno ? sr.r : res.r, ps = sr ? sr.ps : null;
    const evs = Engine.eventsIn(d, [day]).filter(e => !turno || e.shifts.includes(ps.snap.name));
    const stops = evs.filter(e => !e.ev.abono), abonos = evs.filter(e => e.ev.abono);
    const semScrap = turno && ps.scrap == null && day.scrapMode !== 'day';
    const notas = turno ? [ps.off ? 'Turno sem produção' + (ps.offReason ? ': ' + ps.offReason : '') : '', ps.note, day.note ? 'Dia: ' + day.note : ''].filter(Boolean)
      : [day.note].concat(res.shifts.map(s => s.ps.note ? s.ps.snap.name + ': ' + s.ps.note : '')).filter(Boolean);
    if (abonos.length) notas.push('Pausas e abonos: ' + abonos.map(e => (e.ev.note || e.code.name) + ' ' + (e.ev.start != null ? U.range(e.ev.start, e.ev.end) : U.fmt(e.minutes) + ' min')).join('; '));
    return { d, day, res, turno, sr, ps, r, rDia: res.r, stops, semScrap, notas, u: unitLbl(), fechado: turno ? ps.status === 'fechado' : day.status === 'fechado', st: turno ? (ps.off ? 'sem produção' : ps.status) : day.status };
  },

  /* ---------- medidor em PNG (canvas) ---------- */
  COR: { ok: '#14804A', warn: '#D78B11', crit: '#C94645', sem: '#6F8092' },
  medidor(valor, meta, sem, titulo, sub, W = 440) {
    const H = Math.round(W * 0.7), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), cx = W / 2, cy = H * 0.66, R = W * 0.36, lw = W * 0.085;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.lineCap = 'butt';
    const ang = v => Math.PI + Math.PI * Math.max(0, Math.min(1, v));
    g.lineWidth = lw; g.strokeStyle = '#E3EAF1'; g.beginPath(); g.arc(cx, cy, R, Math.PI, 2 * Math.PI); g.stroke();
    if (valor != null && isFinite(valor)) { g.strokeStyle = this.COR[sem] || this.COR.sem; g.beginPath(); g.arc(cx, cy, R, Math.PI, ang(valor)); g.stroke(); }
    if (meta != null && isFinite(meta) && meta > 0) { const a = ang(meta); g.strokeStyle = '#102F55'; g.lineWidth = Math.max(3, W * 0.009); g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - lw * 0.72), cy + Math.sin(a) * (R - lw * 0.72)); g.lineTo(cx + Math.cos(a) * (R + lw * 0.72), cy + Math.sin(a) * (R + lw * 0.72)); g.stroke();
      g.fillStyle = '#102F55'; g.font = `600 ${Math.round(W * 0.05)}px Segoe UI, Arial, sans-serif`; g.textAlign = Math.cos(a) > 0.15 ? 'left' : Math.cos(a) < -0.15 ? 'right' : 'center'; g.textBaseline = 'bottom'; g.fillText('meta ' + U.pct(meta, 0), cx + Math.cos(a) * (R + lw * 0.95), cy + Math.sin(a) * (R + lw * 0.95)); }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#102F55'; g.font = `700 ${Math.round(W * 0.125)}px Segoe UI, Arial, sans-serif`; g.fillText(valor == null || !isFinite(valor) ? '—' : U.pct(valor, 1), cx, cy - R * 0.08);
    g.fillStyle = '#64788F'; g.font = `600 ${Math.round(W * 0.044)}px Segoe UI, Arial, sans-serif`; g.textAlign = 'left'; g.fillText('0%', cx - R - lw / 2, cy + W * 0.05); g.textAlign = 'right'; g.fillText('100%', cx + R + lw / 2, cy + W * 0.05);
    g.textAlign = 'center'; g.fillStyle = '#102F55'; g.font = `700 ${Math.round(W * 0.064)}px Segoe UI, Arial, sans-serif`; g.fillText(titulo, cx, cy + W * 0.125);
    if (sub) { g.fillStyle = '#64788F'; g.font = `${Math.round(W * 0.048)}px Segoe UI, Arial, sans-serif`; g.fillText(sub, cx, cy + W * 0.185); }
    return cv.toDataURL('image/png');
  },
  /* gráfico da tela (SVG) → PNG, no tema claro */
  async png(svgHtml, escala = 2) {
    const h = document.createElement('div'); h.style.cssText = 'position:fixed;left:-99999px;top:0;width:900px'; h.innerHTML = svgHtml; document.body.appendChild(h);
    try { const svg = h.querySelector('svg'); if (!svg) return null; return await rpSvgPng(svg, escala); } catch (e) { console.warn('EmailDia.png', e); return null; } finally { h.remove(); }
  },

  /* ---------- HTML do e-mail ---------- */
  async html(c, comImagem, layout) {
    const R = App.rep, X = this.dados(R); if (!X) return null;
    const F = 'font-family:Segoe UI,Arial,sans-serif;', ink = '#102F55', mut = '#64788F', lin = '#DCE6EF', C = this.COR, e = esc;
    const { day, res, turno, ps, r, rDia, u } = X, L = (layout || this.lay(R.type)).filter(x => x.on);
    const sec = t => `<tr><td style="padding:18px 24px 6px;${F}font-size:15px;font-weight:bold;color:${ink}">${e(t)}</td></tr>`;
    const linha = h => `<tr><td style="padding:0 24px">${h}</td></tr>`;
    const th = (t, n) => `<th align="${n ? 'right' : 'left'}" style="${F}font-size:11px;color:${mut};font-weight:bold;padding:6px 8px;border-bottom:2px solid ${lin};background:#F5F9FC">${e(t)}</th>`;
    const td = (t, n, st = '') => `<td align="${n ? 'right' : 'left'}" style="${F}font-size:12.5px;color:${ink};padding:6px 8px;border-bottom:1px solid ${lin};${st}">${t}</td>`;
    const tab = (cab, rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">${cab ? `<tr>${cab.map(([t, n]) => th(t, n)).join('')}</tr>` : ''}${rows.join('')}</table>`;
    const corSem = s => C[s] || C.sem, rot = turno ? ps.snap.name : 'Dia';
    const semTxt = { ok: 'OEE na meta ou acima', warn: 'OEE perto da meta', crit: 'OEE abaixo da meta', sem: 'OEE sem meta' }[r.semOee] || '';
    const P = [];
    /* cabeçalho */
    P.push(`<tr><td bgcolor="#102333" style="background:#102333;padding:16px 24px;${F}color:#FFFFFF"><div style="font-size:11px;letter-spacing:1px;color:#C9D8E5">BD &middot; SISTEMAS DA LINHA VACUTAINER &middot; PRODUÇÃO</div><div style="font-size:20px;font-weight:bold;padding-top:4px">${e(turno ? 'Passagem de turno · ' + ps.snap.name : 'Resumo do dia')}</div><div style="font-size:13px;color:#C9D8E5;padding-top:2px">${e(U.brDate(day.date) + ' · ' + U.WD[U.weekday(day.date)] + (turno && ps.snap.start ? ' · ' + ps.snap.start + '–' + U.hhmm(U.toMin(ps.snap.end)) : '') + (turno && ps.responsible ? ' · responsável ' + ps.responsible : ''))}</div></td></tr>`);
    P.push(`<tr><td style="padding:14px 24px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${corSem(r.semOee)}" style="background:${corSem(r.semOee)};padding:4px 12px;${F}font-size:12px;font-weight:bold;color:#FFFFFF">${e(semTxt)}</td><td style="padding:4px 10px;${F}font-size:12px;color:${mut}">${e(X.fechado ? (turno ? 'Turno fechado' : 'Dia fechado') : 'Situação: ' + X.st + ' (números parciais)')}</td></tr></table></td></tr>`);
    if (c.note && c.note.trim()) P.push(linha(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px"><tr><td style="background:#EAF4FC;border-left:4px solid #0D5E9C;padding:10px 12px;${F}font-size:13px;line-height:19px;color:${ink}"><b>Comentário:</b> ${e(c.note.trim()).replace(/\n/g, '<br>')}</td></tr></table>`));
    const pctBar = (v, cor) => { const w = Math.max(0, Math.min(100, Math.round((v || 0) * 100))); return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px"><tr>${w ? `<td width="${w}%" height="10" bgcolor="${cor}" style="background:${cor};font-size:1px;line-height:1px">&nbsp;</td>` : ''}${w < 100 ? `<td height="10" bgcolor="#E3EAF1" style="background:#E3EAF1;font-size:1px;line-height:1px">&nbsp;</td>` : ''}</tr></table>`; };
    const prod = (rr, titulo) => `<div style="${F}font-size:11px;color:${mut};text-transform:uppercase;letter-spacing:.5px">${e(titulo)}</div><div style="${F}font-size:26px;font-weight:bold;color:${ink};padding-top:2px">${e(fq(rr.good))} <span style="font-size:13px;font-weight:normal;color:${mut}">${e(u)}</span></div><div style="${F}font-size:12px;color:${mut}">meta ${e(fq(rr.metaOp))} ${e(u)} &middot; <b style="color:${corSem(rr.semAttain)}">${e(U.pct(rr.attain, 0))}</b> da meta</div>${pctBar(rr.attain, corSem(rr.semAttain))}`;
    const itens = {
      painel: async () => {
        const g1 = comImagem ? this.medidor(r.oee, r.oeeTarget, r.semOee, 'OEE reportado', turno ? ps.snap.name : 'do dia') : '';
        const g2 = turno && comImagem ? this.medidor(rDia.oee, rDia.oeeTarget, rDia.semOee, 'Acumulado do dia', 'OEE reportado', 440) : '';
        const alt = (rr, t) => `${t}: ${U.pct(rr.oee)} (meta ${U.pct(rr.oeeTarget)})`;
        const semImg = (rr, t) => `<div style="${F}font-size:11px;color:${mut};text-transform:uppercase;letter-spacing:.5px">${e(t)}</div><div style="${F}font-size:30px;font-weight:bold;color:${corSem(rr.semOee)}">${e(U.pct(rr.oee))}</div><div style="${F}font-size:12px;color:${mut}">meta ${e(U.pct(rr.oeeTarget))}</div>`;
        const cel = (h, w) => `<td width="${w}" valign="middle" align="center" style="padding:6px;border:1px solid ${lin}">${h}</td>`;
        const a = g1 ? `<img src="${g1}" width="${turno ? 212 : 250}" alt="${e(alt(r, 'OEE reportado ' + (turno ? ps.snap.name : 'do dia')))}" style="display:block;border:0">` : semImg(r, 'OEE reportado · ' + (turno ? ps.snap.name : 'dia'));
        const b = turno ? (g2 ? `<img src="${g2}" width="176" alt="${e(alt(rDia, 'OEE reportado acumulado do dia'))}" style="display:block;border:0">` : semImg(rDia, 'Acumulado do dia · OEE reportado')) : '';
        const pr = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:4px 8px" align="left">${prod(r, 'Produção boa' + (turno ? ' do turno' : ' do dia'))}</td></tr>${turno ? `<tr><td style="padding:10px 8px 4px;border-top:1px solid ${lin}" align="left">${`<div style="${F}font-size:11px;color:${mut};text-transform:uppercase;letter-spacing:.5px">Acumulado do dia</div><div style="${F}font-size:15px;font-weight:bold;color:${ink}">${e(fq(rDia.good))} <span style="font-size:11px;font-weight:normal;color:${mut}">${e(u)} &middot; ${e(U.pct(rDia.attain, 0))} da meta</span></div>`}</td></tr>` : ''}</table>`;
        return sec(turno ? 'OEE do turno e acumulado do dia' : 'OEE e produção do dia') + linha(`<table role="presentation" width="100%" cellpadding="0" cellspacing="6" border="0"><tr>${cel(a, turno ? '36%' : '44%')}${turno ? cel(b, '30%') : ''}${cel(pr, turno ? '34%' : '56%')}</tr></table>`);
      },
      kpis: async () => {
        const K = [['Disponibilidade', U.pct(r.D), ''], ['Performance', U.pct(r.P), ''], ['Qualidade', U.pct(r.Q, 2), ''],
          ['Scrap', X.semScrap ? '—' : U.pct(r.scrapPct, 2), X.semScrap ? 'não informado' : U.fmt(r.scrap) + ' un'], ['Paradas', U.fmt(r.apontMin) + ' min', X.stops.length + ' registro(s)']];
        return sec('Indicadores') + `<tr><td style="padding:0 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="6" border="0"><tr>${K.map(([n, v, s]) => `<td width="20%" valign="top" style="border:1px solid ${lin};border-top:3px solid #0D5E9C;padding:8px 10px;${F}"><div style="font-size:10.5px;color:${mut}">${e(n)}</div><div style="font-size:18px;font-weight:bold;color:${ink};padding-top:2px">${e(v)}</div><div style="font-size:10.5px;color:${mut};padding-top:1px">${e(s) || '&nbsp;'}</div></td>`).join('')}</tr></table></td></tr>`;
      },
      turnos: async () => {
        if (turno) return '';
        const rows = res.shifts.map(s => { const q = s.r; return `<tr>${td('<b>' + e(s.ps.snap.name) + '</b>' + (s.ps.off ? ' <span style="color:' + mut + '">(sem produção)</span>' : ''))}${td(e(fq(q.good)), 1)}${td(e(fq(q.metaOp)), 1)}${td(`<b style="color:${corSem(q.semAttain)}">${e(U.pct(q.attain, 0))}</b>`, 1)}${td(`<b style="color:${corSem(q.semOee)}">${e(U.pct(q.oee))}</b>`, 1)}${td(e(U.pct(q.oeeTarget)), 1)}${td(e(U.pct(q.D, 0)), 1)}${td(e(U.pct(q.P, 0)), 1)}${td(e(U.pct(q.Q, 1)), 1)}${td(e(U.fmt(q.apontMin)), 1)}</tr>`; });
        rows.push(`<tr>${td('<b>Dia</b>', 0, 'background:#F5F9FC;')}${td('<b>' + e(fq(r.good)) + '</b>', 1, 'background:#F5F9FC;')}${td(e(fq(r.metaOp)), 1, 'background:#F5F9FC;')}${td(`<b style="color:${corSem(r.semAttain)}">${e(U.pct(r.attain, 0))}</b>`, 1, 'background:#F5F9FC;')}${td(`<b style="color:${corSem(r.semOee)}">${e(U.pct(r.oee))}</b>`, 1, 'background:#F5F9FC;')}${td(e(U.pct(r.oeeTarget)), 1, 'background:#F5F9FC;')}${td(e(U.pct(r.D, 0)), 1, 'background:#F5F9FC;')}${td(e(U.pct(r.P, 0)), 1, 'background:#F5F9FC;')}${td(e(U.pct(r.Q, 1)), 1, 'background:#F5F9FC;')}${td(e(U.fmt(r.apontMin)), 1, 'background:#F5F9FC;')}</tr>`);
        return sec('Resultado por turno') + linha(tab([['Turno'], ['Produção (' + u + ')', 1], ['Meta', 1], ['Atend.', 1], ['OEE', 1], ['Meta OEE', 1], ['D', 1], ['P', 1], ['Q', 1], ['Paradas (min)', 1]], rows));
      },
      hh: async () => {
        if (day.shifts.every(p => p.summary)) return '';
        let h = sec('Hora a hora' + (turno ? ' · ' + ps.snap.name : ''));
        if (comImagem) { Charts.setWidth(900); let svg; try { svg = Charts.combo({ ...HHComum.dia(day, res, turno ? ps.id : null, 360), forceLegend: true }); } finally { Charts.setWidth(720); }
          const im = await this.png(svg, 2); if (im) h += linha(`<img src="${im.data}" width="632" alt="Produção boa e meta por hora" style="display:block;width:632px;max-width:100%;height:auto;border:1px solid ${lin}"><div style="${F}font-size:11px;color:${mut};padding-top:4px">Barras: produção boa por hora (verde = na meta ou acima; vermelho = abaixo). Linha tracejada: meta da hora. Faixa colorida embaixo: catálogo. Valores em ${e(u)}.</div>`); else comImagem = false; }
        if (!comImagem) h += await itens.hhtab(true);
        return h;
      },
      hhtab: async semTitulo => {
        const fs = res.flat.filter(f => !turno || f.ps === ps); if (!fs.length) return '';
        let cg = 0, cm = 0;
        const rows = fs.map(f => { cg += f.good || 0; cm += f.metaOp; const at = f.metaOp === 0 && f.deduct >= f.min ? 'pausa' : f.attain == null ? '—' : U.pct(f.attain, 0); return `<tr>${td(e(U.range(f.iv.start, f.iv.end)))}${turno ? '' : td(e(f.ps.snap.code || f.ps.snap.name))}${td(e(catName(f.cat)))}${td(e(fq(f.metaOp)), 1)}${td(f.good == null ? '—' : e(fq(f.good)), 1)}${td(`<b style="color:${f.attain == null ? mut : corSem(f.sem)}">${e(at)}</b>`, 1)}${td(e(fq(cg) + ' / ' + fq(cm)), 1)}${td(e(U.fmt(f.a + f.p)), 1)}</tr>`; });
        return (semTitulo === true ? '' : sec('Hora a hora · tabela')) + linha(tab([['Horário']].concat(turno ? [] : [['Turno']], [['Catálogo'], ['Meta', 1], ['Produção', 1], ['Atend.', 1], ['Acum. / meta', 1], ['Paradas (min)', 1]]), rows));
      },
      paradas: async () => {
        const par = A.pareto(X.stops, 'codigo'), tot = U.sum(X.stops, s => s.minutes);
        if (!par.length) return sec('Maiores paradas') + linha(`<div style="${F}font-size:13px;color:${mut}">Nenhuma parada apontada.</div>`);
        const mx = par[0].value || 1, rows = par.slice(0, 5).map(p => { const w = Math.max(2, Math.round(p.value / mx * 100)), eq = [...new Set(p.events.map(x => x.equipment ? x.equipment.name : '').filter(Boolean))].slice(0, 2).join(', ');
          return `<tr><td width="38%" valign="middle" style="${F}font-size:12.5px;color:${ink};padding:5px 8px 5px 0">${e(p.label)}${eq ? `<div style="font-size:11px;color:${mut}">${e(eq)}</div>` : ''}</td><td valign="middle" style="padding:5px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="${w}%" height="16" bgcolor="${C.crit}" style="background:${C.crit};font-size:1px;line-height:1px">&nbsp;</td>${w < 100 ? '<td style="font-size:1px;line-height:1px">&nbsp;</td>' : ''}</tr></table></td><td width="92" align="right" valign="middle" style="${F}font-size:12.5px;color:${ink};padding:5px 0 5px 8px"><b>${e(U.fmt(p.value))} min</b> <span style="color:${mut}">&middot; ${p.count}&times;</span></td></tr>`; });
        return sec('Maiores paradas') + linha(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table><div style="${F}font-size:11px;color:${mut};padding-top:4px">Total apontado: ${e(U.fmt(tot))} min em ${X.stops.length} registro(s)${par.length > 5 ? ` &middot; mais ${par.length - 5} tipo(s) no relatório completo` : ''}.</div>`);
      },
      lista: async () => {
        if (!X.stops.length) return '';
        const S = X.stops.slice().sort((a, b) => (a.ev.start == null ? 9e9 : a.ev.start) - (b.ev.start == null ? 9e9 : b.ev.start)).slice(0, 25);
        return sec('Paradas apontadas') + linha(tab([['Horário']].concat(turno ? [] : [['Turno']], [['Tipo'], ['Equipamento'], ['Min', 1], ['Observação']]), S.map(x => `<tr>${td(e(x.ev.start != null ? U.range(x.ev.start, x.ev.end) : 'sem horário'))}${turno ? '' : td(e(x.shifts.join(' + ')))}${td(e(x.code.code + ' · ' + x.code.name))}${td(e(x.equipment ? x.equipment.name : '—'))}${td(e(U.fmt(x.minutes)), 1)}${td(e(x.ev.note || ''))}</tr>`)) + (X.stops.length > 25 ? `<div style="${F}font-size:11px;color:${mut};padding-top:4px">+${X.stops.length - 25} parada(s) no PDF/Excel.</div>` : ''));
      },
      sq: async () => {
        if (!RelSQ.incluir()) return ''; const T = RelSQ.turnos(R); if (!T || !T.length) return '';
        const cor = ev => !ev ? mut : ev.resposta === 'sim' ? C.crit : C.ok;
        return sec('Segurança e Qualidade') + linha(tab([['Turno'], ['Acidente'], ['QN (Quality Notification)']], T.map(t => `<tr>${td(e(t.ps.snap.name))}${td(`<b style="color:${cor(t.ac)}">${e(RelSQ.txt(t.ac))}</b>`)}${td(`<b style="color:${cor(t.qn)}">${e(RelSQ.txt(t.qn))}</b>`)}</tr>`)));
      },
      obs: async () => X.notas.length ? sec('Observações') + linha(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${X.notas.map(n => `<tr><td width="14" valign="top" style="${F}font-size:13px;color:#0D5E9C;padding:3px 0">&bull;</td><td style="${F}font-size:13px;line-height:19px;color:${ink};padding:3px 0">${e(n)}</td></tr>`).join('')}</table>`) : '',
      cascata: async () => {
        if (turno || !comImagem) return ''; let svg; try { Charts.setWidth(900); const x = Panel.ctx({ pre: 'custom', from: day.date, to: day.date, cmp: false, grp: 'day' }); svg = PN_B.waterfall.r(x); } catch (er) { return ''; } finally { Charts.setWidth(720); }
        const im = await this.png(svg, 2); return im ? sec('Cascata do OEE') + linha(`<img src="${im.data}" width="632" alt="Cascata do OEE: da capacidade planejada à produção boa" style="display:block;width:632px;max-width:100%;height:auto;border:1px solid ${lin}">`) : '';
      },
      resumo: async () => c.sum && c.sum.trim() ? sec('Resumo') + linha(`<div style="${F}font-size:13px;line-height:19px;color:${ink}">${e(c.sum.trim()).replace(/\n/g, '<br>')}</div>`) : ''
    };
    /* o resumo editado à mão vai mesmo com o item desligado: quem escreveu espera que chegue */
    const ids = L.map(x => x.id); if (R.summary != null && c.sum && c.sum.trim() && !ids.includes('resumo')) ids.push('resumo');
    for (const id of ids) if (itens[id]) { try { P.push(await itens[id]()); } catch (er) { console.error('EmailDia', id, er); } }
    P.push(`<tr><td style="padding:18px 24px 16px;${F}font-size:11px;line-height:16px;color:${mut};border-top:1px solid ${lin}">Gerado pela Produção (OEE-Vacutainer ${e(APP_VERSION)}) em ${e(U.brDT(U.nowIso()))}${Store.S.user ? ' por ' + e(Store.S.user) : ''} &middot; Uso interno &middot; OEE reportado; números ${X.fechado ? 'do fechamento' : 'parciais, do lançamento em aberto'}</td></tr>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F2F7FB" style="background:#F2F7FB"><tr><td align="center" style="padding:16px 8px">
<table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:680px;max-width:680px;background:#FFFFFF;border:1px solid ${lin}">${P.filter(Boolean).join('\n')}</table></td></tr></table>`;
  },
  /* texto simples (WhatsApp/Teams e versão sem formatação do e-mail): sem repetir o que já está nos indicadores */
  texto(c) {
    const R = App.rep, X = this.dados(R); if (!X) return rpText(c);
    const { day, turno, ps, r, rDia, u } = X, L = [`*${turno ? 'Passagem de turno · ' + ps.snap.name : 'Resumo do dia'}* · ${U.brDate(day.date)} (${U.WD[U.weekday(day.date)]})`, ''];
    if (c.note && c.note.trim()) L.push(c.note.trim(), '');
    L.push(`• OEE reportado${turno ? ' do turno' : ''}: ${U.pct(r.oee)} (meta ${U.pct(r.oeeTarget)})`);
    if (turno) L.push(`• Acumulado do dia: OEE ${U.pct(rDia.oee)} · produção ${fq(rDia.good)} ${u} (${U.pct(rDia.attain, 0)} da meta)`);
    L.push(`• Produção boa: ${fq(r.good)} ${u} de ${fq(r.metaOp)} ${u} (${U.pct(r.attain, 0)})`, `• D ${U.pct(r.D)} · P ${U.pct(r.P)} · Q ${U.pct(r.Q, 2)}`, `• Scrap: ${X.semScrap ? 'não informado' : U.pct(r.scrapPct, 2) + ' (' + U.fmt(r.scrap) + ' un)'}`);
    const par = A.pareto(X.stops, 'codigo').slice(0, 3); L.push(`• Paradas: ${U.fmt(r.apontMin)} min${par.length ? ' · ' + par.map(p => `${p.label.split(' · ').slice(1).join(' · ') || p.label} ${U.fmt(p.value)} min`).join('; ') : ''}`);
    if (RelSQ.incluir()) { const s = RelSQ.resumo(R); if (s) L.push('• ' + s); }
    for (const n of X.notas) L.push('• ' + n);
    if (R.summary != null && c.sum && c.sum.trim()) L.push('', c.sum.trim());
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  },

  /* ---------- "Itens do e-mail": escolher, ordenar e ver a prévia ---------- */
  abrir(cur, comImagem) {
    const tipo = App.rep.type; let L = this.lay(tipo);
    modal('Itens do e-mail · ' + (tipo === 'shift' ? 'Passagem de turno' : 'Relatório do dia'), `<p class="small muted" style="margin-top:0">Marque o que vai no e-mail e use as setas para a ordem. Fica gravado neste computador, separado para o turno e para o dia.</p>
      <div class="em-lay"><div class="em-lista" id="emLista"></div><div class="em-prev"><div class="small muted" style="margin-bottom:4px">Prévia do e-mail</div><iframe id="emPrev" class="em-quadro" title="Prévia do e-mail" sandbox="allow-same-origin"></iframe></div></div>`,
      `<button class="btn" id="emPad">Voltar ao padrão</button><span class="spacer"></span><button class="btn" data-close>Fechar</button><button class="btn primary" id="emCopiar">Copiar para Outlook</button>`, (el, close) => {
        if (!document.getElementById('emCss')) { const s = document.createElement('style'); s.id = 'emCss'; s.textContent = '.em-lay{display:grid;grid-template-columns:minmax(260px,330px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:900px){.em-lay{grid-template-columns:1fr}}.em-it{display:flex;align-items:center;gap:8px;padding:7px 8px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;background:var(--surface)}.em-it label{flex:1;display:flex;gap:8px;align-items:center;cursor:pointer;font-size:13.5px}.em-it.off label{color:var(--muted)}.em-quadro{display:block;width:100%;height:62vh;border:1px solid var(--line);border-radius:8px;background:#F2F7FB}'; document.head.appendChild(s); }
        let seq = 0;
        const prev = async () => { const n = ++seq, box = el.querySelector('#emPrev'); try { const h = await this.html(cur(), comImagem(), L); if (n === seq) box.srcdoc = '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#F2F7FB">' + (h || '<p style="font-family:Segoe UI,Arial,sans-serif;padding:12px">Sem lançamento neste dia.</p>'); } catch (er) { console.error(er); if (n === seq) box.srcdoc = '<p style="font-family:Segoe UI,Arial,sans-serif;padding:12px">Não foi possível montar a prévia.</p>'; } };   /* quadro próprio: o estilo da página não entra na prévia */
        const lista = () => { el.querySelector('#emLista').innerHTML = L.map((x, i) => `<div class="em-it${x.on ? '' : ' off'}"><label><input type="checkbox" data-emon="${i}" ${x.on ? 'checked' : ''}> ${esc(this.nome(tipo, x.id))}</label><button type="button" class="btn xs" data-emup="${i}" ${i ? '' : 'disabled'} aria-label="Subir" title="Subir">↑</button><button type="button" class="btn xs" data-emdn="${i}" ${i < L.length - 1 ? '' : 'disabled'} aria-label="Descer" title="Descer">↓</button></div>`).join('');
          el.querySelectorAll('[data-emon]').forEach(b => b.onchange = () => { L[+b.dataset.emon].on = b.checked; this.gravar(tipo, L); lista(); prev(); });
          const mv = (i, j) => { const t = L[i]; L[i] = L[j]; L[j] = t; this.gravar(tipo, L); lista(); prev(); };
          el.querySelectorAll('[data-emup]').forEach(b => b.onclick = () => mv(+b.dataset.emup, +b.dataset.emup - 1)); el.querySelectorAll('[data-emdn]').forEach(b => b.onclick = () => mv(+b.dataset.emdn, +b.dataset.emdn + 1)); };
        el.querySelector('#emPad').onclick = () => { this.padrao(tipo); L = this.lay(tipo); lista(); prev(); };
        el.querySelector('#emCopiar').onclick = () => run(async () => { const c = cur(); await rpCopy(await this.html(c, comImagem(), L), this.texto(c)); close(); }, 'Copiado. No Outlook, abra um novo e-mail e cole (Ctrl+V).');
        lista(); prev();
      }, { wide: true });
  }
};
