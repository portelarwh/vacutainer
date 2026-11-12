/* ===== Produção 2.4.59 · todos os gráficos hora a hora com a lógica de Apontamento › Hora a hora (pedido do usuário, 12/11/2026) =====
   Base única: os intervalos dos turnos do dia + as horas do MES FORA do turno que contam neste dia (ForaTurno.recebe → HHPs.porHora),
   em ordem de horário (ex.: 04:00 e 05:00 antes das 06:00). Nada de conta nova: o dia usa o próprio HHPs.chart do Apontamento
   (com a seleção de turno passada aqui, sem mexer na escolha da tela) e o período soma, hora a hora, os mesmos pontos de cada dia.
   Usado por: Visão Geral (Produção por hora do dia), Painel › bloco Hora a hora (1 dia e período), TV › Painel do dia e
   Relatórios › Passagem de turno. */
const HHComum = {
  /* gráfico de 1 dia (todos os turnos, ou só o turno psId com as horas fora do turno que contam nele) — igual ao do Apontamento */
  dia(day, res, psId, height) {
    const sel = Object.assign(Object.create(HHPs), { id: () => psId || '' });
    try { return HHPs.chart.call(sel, hhChartOpts(res.flat, height), day, res); } catch (e) { console.warn('HHComum.dia', e); return hhChartOpts(res.flat, height); }
  },
  /* pontos de 1 dia: { k: rótulo da hora, s: minuto no dia de produção (ordem), g: produção, m: meta, fora, conta } */
  pontos(day, res) {
    const P = [];
    for (const f of res.flat) { if (f.good == null && !(f.metaOp > 0)) continue; P.push({ k: U.hhmm(f.iv.start), s: f.iv.start, g: f.good, m: f.metaOp > 0 ? f.metaOp : 0, fora: false }); }
    const ft = res.foraTurno;
    for (const it of ((ft && ft.recebe) || []).filter(i => i.alvo && i.alvo.date === day.date && !(ft.semAlvo || []).includes(i)))
      for (const r of HHPs.porHora(day, it)) P.push({ k: HHPs.hm(r.h), s: r.h, g: r.pecas, m: 0, fora: true, conta: it.alvo.name });
    return P;
  },
  /* período: média por dia de cada hora (produção e meta), na ordem do dia de produção; hora fora do turno sem meta, com "conta no" */
  periodo(rows, height, vazio) {
    const H = new Map();
    for (const x of rows) { let P = []; try { P = this.pontos(x.d || x.day, x.res); } catch (e) { continue; }
      const vistos = new Set();
      for (const p of P) { const o = H.get(p.k) || { k: p.k, s: p.s, g: 0, gN: 0, m: 0, dias: 0, fora: 0, dentro: 0, conta: new Set() };
        if (p.s < o.s) o.s = p.s; if (p.g != null) { o.g += p.g; o.gN++; } o.m += p.m; if (p.fora) { o.fora++; o.conta.add(p.conta); } else o.dentro++;
        if (!vistos.has(p.k)) { o.dias++; vistos.add(p.k); } H.set(p.k, o); } }
    const L = [...H.values()].sort((a, b) => a.s - b.s);
    const media = (v, n) => n ? v / n : null;
    return { x: L.map(o => o.k), xFull: L.map(o => `${o.k} · ${o.dentro ? (o.fora ? 'turno e fora do turno' : 'no turno') : 'fora do turno · conta no ' + [...o.conta].join(', ')}`), xName: 'Hora', allLabels: true, unit: qUn,
      bars: [{ name: 'Produção média por dia (fora do turno: do MES)', values: L.map(o => media(o.g, o.dias)), color: 'var(--s1)', meta: L.map(o => o.m > 0 ? media(o.m, o.dias) : null) }],
      lines: [{ name: 'Meta média da hora', values: L.map(o => o.m > 0 ? media(o.m, o.dias) : null), color: 'var(--ink)', width: 1.5, dash: true, dots: false }],
      fmtY: v => fq(v), height: height || 200, forceLegend: true,
      tipRows: i => { const o = L[i], r = [['Dias com produção nesta hora', U.fmt(o.dias)]]; if (o.m > 0) r.push(['Atendimento (produção ÷ meta)', U.pct(o.g / o.m, 0)]); if (o.fora) r.push(['Fora do turno', 'produção do MES · conta no ' + [...o.conta].join(', ') + ' (OEE reportado)']); return r; },
      empty: vazio || 'Sem hora a hora no período (dias importados só têm resumo por turno).' };
  }
};
