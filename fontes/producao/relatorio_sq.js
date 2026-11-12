/* ===== Produção 2.4.32 · Fase 5 · 5c do briefing (PRD-07): Segurança e Qualidade no relatório do dia e na passagem de turno =====
   Bloco "Segurança e Qualidade" (acidentes e QNs de cada turno, do registro SQDCP do turno) no relatório do dia e no de passagem
   de turno, e uma linha no resumo automático. Opção "incluir Segurança e Qualidade": desmarcada, o relatório é só de performance.
   Sem resposta é "não informado" (nunca zero). Entra no script principal pelo build.py (antes do boot). */
const RelSQ = {
  incluir() { return App.prefs.rpSQ !== false; },
  turnos(R) {
    const d = db(), day = (d.productionDays || []).find(z => !z.deleted && z.lineId === 'line_vac' && z.date === R.date); if (!day) return null;
    const L = day.shifts.filter(p => !p.deleted && (R.type !== 'shift' || p.id === R.psId)).sort((a, b) => (U.toMin(a.snap.start) || 0) - (U.toMin(b.snap.start) || 0));
    return L.map(ps => { const s = ps.sqdcp || {}; return { ps, ac: SQDCPModelo.lerEvento(s.acidente), qn: SQDCPModelo.lerEvento(s.qn) }; });
  },
  txt(ev) { return !ev ? 'não informado' : ev.resposta === 'nao' ? 'não' : `${ev.quantidade}${ev.numeros.length ? ' (' + ev.numeros.join(', ') + ')' : ''}${ev.resumo ? ' · ' + ev.resumo : ''}`; },
  bloco(R) {
    const T = this.turnos(R); if (!T || !T.length) return null;
    const cls = ev => !ev ? 'muted' : ev.resposta === 'sim' ? 'ferr' : '';
    const html = `<table><thead><tr><th>Turno</th><th>Acidente</th><th>QN (Quality Notification)</th></tr></thead><tbody>${T.map(t => `<tr><td>${esc(t.ps.snap.name)}${t.ps.off ? ' <span class="small muted">(sem produção)</span>' : ''}</td><td class="${cls(t.ac)}">${esc(this.txt(t.ac))}</td><td class="${cls(t.qn)}">${esc(this.txt(t.qn))}</td></tr>`).join('')}</tbody></table>
      <p class="small muted">Do registro de Segurança e Qualidade de cada turno (SQDCP). Sem resposta é "não informado", não zero.</p>`;
    return { id: 'sq', l: 'Segurança e Qualidade', w: 'f', html };
  },
  resumo(R) {
    const T = this.turnos(R); if (!T || !T.length) return '';
    const soma = k => { const r = T.map(t => t[k]); if (r.some(x => !x)) return null; return r.reduce((s, x) => s + x.quantidade, 0); };
    const a = soma('ac'), q = soma('qn'), ni = (k, l) => { const n = T.filter(t => !t[k]).length; return n ? `${l} não informado em ${n} turno(s)` : ''; };
    return [a == null ? ni('ac', 'Segurança:') : `Segurança: ${a ? a + ' acidente(s)' : 'sem acidente'}.`, q == null ? ni('qn', 'Qualidade:') : `Qualidade: ${q ? q + ' QN(s)' : 'sem QN'}.`].filter(Boolean).join(' ');
  }
};
(() => {
  const m0 = rpModel;
  rpModel = function (R) {
    let M = m0(R); if (!(R.type === 'day' || R.type === 'shift')) return M;
    /* 2.4.66 · no dia e no turno, o bloco "Segurança e QN por turno" do SQDCP repetia este; fica um só (e nenhum com a opção desmarcada) */
    { const ps = R.type === 'shift' ? ((db().productionDays || []).find(z => !z.deleted && z.lineId === 'line_vac' && z.date === R.date) || { shifts: [] }).shifts.find(p => p.id === R.psId) : null;
      let dup = ''; try { dup = Sqdcp.resumoTexto(M.a, M.b, ps ? ps.shiftId : undefined); } catch (e) { }
      M = { ...M, blocks: (M.blocks || []).filter(b => b.id !== 'sqdcp'), auto: String(M.auto || '').split('\n').filter(l => l && l !== dup).join('\n') }; }
    if (!RelSQ.incluir()) return M;
    const b = RelSQ.bloco(R); if (!b) return M;
    return { ...M, blocks: [b].concat(M.blocks || []), auto: [M.auto, RelSQ.resumo(R)].filter(Boolean).join('\n') };
  };
})();
