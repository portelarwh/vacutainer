/* SQDCP: funções puras. Ausência de resposta permanece desconhecida, inclusive em bases antigas. */
const SQDCPModelo = (() => {
  const copiar = v => JSON.parse(JSON.stringify(v));
  function dataValida(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return false;
    try { return new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v; } catch (_) { return false; }
  }
  function lerEvento(v) {
    if (!v || !['sim', 'nao'].includes(v.resposta)) return null;
    if (v.resposta === 'nao') return { resposta: 'nao', quantidade: 0, numeros: [], resumo: '' };
    if (!Number.isSafeInteger(v.quantidade) || v.quantidade < 1 || v.quantidade > 100000) return null;
    const numeros = Array.isArray(v.numeros) ? [...new Set(v.numeros.map(x => String(x).trim()).filter(Boolean))] : [];
    if (numeros.length > v.quantidade || numeros.some(x => x.length > 60)) return null;
    return { resposta: 'sim', quantidade: v.quantidade, numeros, resumo: String(v.resumo || '').slice(0, 400) };
  }
  function validarTurno(v) {
    const o = {};
    for (const k of ['acidente', 'qn']) {
      const x = (v || {})[k] || {}, r = x.resposta;
      if (r == null || r === '') { o[k] = null; continue; }
      if (!['sim', 'nao'].includes(r)) throw new Error('Escolha Sim, Não houve ou Não informado.');
      if (r === 'nao') { o[k] = lerEvento({ resposta: r }); continue; }
      if (!/^[1-9]\d*$/.test(String(x.quantidade)) || !Number.isSafeInteger(+x.quantidade) || +x.quantidade > 100000)
        throw new Error('Informe uma quantidade inteira entre 1 e 100.000.');
      const numeros = Array.isArray(x.numeros) ? x.numeros : String(x.numeros || '').split(/[,;\n]+/);
      o[k] = lerEvento({ ...x, quantidade: +x.quantidade, numeros });
      if (!o[k]) throw new Error('Confira as referências: até 60 caracteres cada, sem ultrapassar a quantidade informada.');
    }
    return o;
  }
  const codigo = p => String(p.snap && (p.snap.code || p.snap.name) || p.shiftId || '');
  function preservarImportacao(anterior, novo) {
    if (!anterior) return;
    const historico = copiar(anterior.sqdcpTurnos || {});
    for (const p of anterior.shifts || []) if (p.sqdcp) historico[p.shiftId] = { snap: copiar(p.snap || {}), sqdcp: copiar(p.sqdcp) };
    if (!Object.keys(historico).length) return;
    novo.sqdcpTurnos = historico;
    for (const p of novo.shifts || []) if (!p.sqdcp && historico[p.shiftId]) p.sqdcp = copiar(historico[p.shiftId].sqdcp);
  }
  function linhas(db, de, ate, linha, turno, engine, util) {
    const porDia = new Map((db.productionDays || []).filter(d => !d.deleted && !d.demo && d.lineId === linha).map(d => [d.date, d]));
    const rows = [];
    for (let dia = de; dia <= ate; dia = util.addDays(dia, 1)) {
      const d = porDia.get(dia), off = engine.dayMark(db, dia, linha);
      const registros = d ? [...d.shifts, ...Object.values(d.sqdcpTurnos || {})] : [];
      if (off && off.kind === 'off' && !registros.some(p => p.sqdcp && (lerEvento(p.sqdcp.acidente) || lerEvento(p.sqdcp.qn)))) continue;
      const previsto = d || engine.buildDay(db, dia, linha, null, 'SQDCP'), ps = (previsto.shifts || []).slice();
      for (const [shiftId, antigo] of Object.entries(d && d.sqdcpTurnos || {})) {
        if (!ps.some(p => p.shiftId === shiftId)) ps.push({ shiftId, snap: antigo.snap, sqdcp: antigo.sqdcp, status: 'registro SQDCP preservado da importação' });
      }
      for (const p of ps.filter(p => !p.deleted && (!turno || p.shiftId === turno))) {
        if (p.off && p.offType === 'prog' && !(p.sqdcp && (lerEvento(p.sqdcp.acidente) || lerEvento(p.sqdcp.qn)))) continue;
        const s = d && p.sqdcp || {};
        rows.push({ dia, linha, turno: codigo(p), shiftId: p.shiftId, diaId: d ? d.id : null, turnoId: d && p.id || null,
          status: d ? p.status : 'sem lançamento', acidente: lerEvento(s.acidente), qn: lerEvento(s.qn),
          informadoPor: s.por || '', informadoEm: s.em || '' });
      }
    }
    return rows;
  }
  function resumo(rows) {
    const saida = { esperados: rows.length };
    for (const k of ['acidente', 'qn']) {
      const confirmadas = rows.filter(r => r[k]), refs = new Map();
      let soma = 0, semNumero = 0;
      for (const r of confirmadas) {
        const e = r[k]; soma += e.quantidade;
        semNumero += Math.max(0, e.quantidade - e.numeros.length);
        for (const n of e.numeros) if (!refs.has(n.toUpperCase())) refs.set(n.toUpperCase(), n);
      }
      saida[k] = { respondidos: confirmadas.length, pendentes: rows.length - confirmadas.length,
        completo: rows.length > 0 && confirmadas.length === rows.length, reportados: soma,
        quantidade: confirmadas.length ? k === 'qn' ? refs.size + semNumero : soma : null,
        referencias: [...refs.values()], semNumero, cobertura: rows.length ? confirmadas.length / rows.length : null };
    }
    return saida;
  }
  function exportar(db, hoje, engine, util) {
    const linhasDb = (db.lines || []).filter(l => !l.deleted && !l.demo && l.active !== false);
    const de = util.addDays(hoje, -119), turnos = linhasDb.flatMap(l => linhas(db, de, hoje, l.id, '', engine, util));
    return { versao: 1, de, ate: hoje, turnos, porDia: [...new Set(turnos.map(r => r.linha + '|' + r.dia))].map(k => {
      const [linha, dia] = k.split('|'); return { linha, dia, ...resumo(turnos.filter(r => r.linha === linha && r.dia === dia)) };
    }) };
  }
  function tabela(rows) {
    const out = [['data', 'linha', 'turno', 'situacao_turno', 'acidente', 'quantidade_acidentes', 'referencias_acidentes',
      'resumo_acidente', 'qn', 'quantidade_qn_reportada', 'numeros_qn', 'resumo_qn', 'informado_por', 'informado_em']];
    const rot = x => x ? x.resposta === 'sim' ? 'Sim' : 'Não houve' : 'Não informado';
    for (const r of rows) out.push([r.dia, r.linha, r.turno, r.status, rot(r.acidente), r.acidente ? r.acidente.quantidade : null,
      r.acidente ? r.acidente.numeros.join('; ') : '', r.acidente ? r.acidente.resumo : '', rot(r.qn), r.qn ? r.qn.quantidade : null,
      r.qn ? r.qn.numeros.join('; ') : '', r.qn ? r.qn.resumo : '', r.informadoPor, r.informadoEm]);
    return out;
  }
  return { copiar, dataValida, lerEvento, validarTurno, linhas, resumo, exportar, tabela, preservarImportacao };
})();
if (typeof module !== 'undefined') module.exports = SQDCPModelo;
