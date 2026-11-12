/* ===== Produção 2.4.34 · Fase 7 do briefing (09/11/2026): apontamento e ajuda =====
   - PRD-05: o responsável é por turno (ps.responsible, no cartão de cada turno). O "Responsável" do dia sai do cabeçalho; só com o
     scrap em "Total diário" aparece "Responsável pelo reporte" (o mesmo campo day.responsible de antes, nada se perde).
   - PRD-06: na visão de turnos lado a lado, cada turno tem o seu "Hora a hora" (com quantos intervalos já têm produção); o Hora a
     hora abre só aquele turno, com a troca para os outros ou para todos.
   - UX-01: ⓘ em Restaurar intervalos padrão, Reaplicar metas vigentes, Mover para outro dia e Marcar dia sem produção.
   Entra no script principal pelo build.py (antes do boot). */
const HHPs = {
  sel: null,   // { date, id }: turno escolhido no Lançamento; vale só para aquele dia
  id(day) { const s = this.sel; return s && day && s.date === day.date && (day.shifts || []).some(p => p.id === s.id && !p.deleted) ? s.id : null; },
  mostra(day, ps) { const i = this.id(day); return !i || ps.id === i; },
  fill(ps) { const L = (ps.intervals || []).filter(i => !i.deleted); return [L.filter(i => i.good != null).length, L.length]; },
  /* botão do cartão do turno (Lançamento) */
  /* 2.4.64 · aceso (verde) quando o turno está fechado ou todos os intervalos têm produção lançada */
  feito(ps) { const [f, n] = this.fill(ps); return ps.status === 'fechado' || (n > 0 && f === n); },
  botao(ps) { if (ps.summary) return ''; const [f, n] = this.fill(ps); return `<button type="button" class="btn sm${this.feito(ps) ? ' lit' : ''}" data-hhps="${esc(ps.id)}" title="Abre o hora a hora só deste turno (${f} de ${n} intervalo(s) com produção lançada${ps.status === 'fechado' ? '; turno fechado' : ''})">Hora a hora <span class="small ${f && f === n ? '' : 'muted'}">${f}/${n}</span> ${I.chevR}</button>`; },
  /* barra no Hora a hora: Todos · turno A (x/y) · … */
  barra(day, res) {
    const L = res.shifts.map(sr => sr.ps).filter(ps => !ps.summary); if (L.length < 2) return '';
    const i = this.id(day), ch = (id, txt, on, lit) => `<button type="button" data-hhsel="${esc(id)}" aria-pressed="${on}"${lit ? ' class="lit" title="Turno fechado ou com todos os intervalos lançados"' : ''}>${txt}</button>`;
    return `<div class="row" style="margin:-4px 0 10px"><span class="small muted">Turno ${ib('hhTurno')}</span><div class="seg">${ch('', 'Todos', !i)}${L.map(ps => { const [f, n] = this.fill(ps); return ch(ps.id, `${esc(ps.snap.name)} <span class="small${this.feito(ps) ? '' : ' muted'}">${ps.status === 'fechado' ? '✓ fechado' : f + '/' + n}</span>`, i === ps.id, this.feito(ps)); }).join('')}</div></div>`;
  },
  ir(day, id) { this.sel = id ? { date: day.date, id } : null; go('hourly'); },
  ligar(root, day) {
    root.querySelectorAll('[data-hhps]').forEach(b => b.onclick = () => this.ir(day, b.dataset.hhps));
    root.querySelectorAll('[data-hhsel]').forEach(b => b.onclick = () => { this.sel = b.dataset.hhsel ? { date: day.date, id: b.dataset.hhsel } : null; render(); });
  }
};
Object.assign(HELP, {
  responsible: ['Responsável pelo reporte', [['O que é?', 'Quem responde pelo número único do dia quando o scrap é lançado como "Total diário". Nos outros dias o responsável é de cada turno (campo no cartão do turno).'], ['Exemplo', 'J. Lima (líder do turno A), que fechou o total diário de scrap.']]],
  shiftResponsible: ['Responsável do turno', [['O que é?', 'Quem responde pelo lançamento deste turno (líder ou operador). Vale para o relatório e a passagem de turno; a auditoria continua registrando cada alteração com o nome de quem fez.'], ['Exemplo', 'P. Costa (turno B). Vazio: aparece em cinza quem fechou o turno.']]],
  hhTurno: ['Turno no hora a hora', [['O que é?', 'Mostra só o turno escolhido (o botão "Hora a hora" de cada turno, no Lançamento, já abre assim) ou todos. O número é quantos intervalos já têm produção lançada.'], ['Exemplo', 'A 8/8 e B 3/9: o turno A está completo; o B tem 6 intervalos sem produção.']]],
  restaurarIv: ['Restaurar intervalos padrão', [['O que faz?', 'Volta os intervalos de todos os turnos do dia para o padrão do turno vigente na data (Portal › Turnos): horários, pausas e catálogo inicial da grade.'], ['E os dados?', 'Só funciona sem produção lançada (com produção, pede para zerar antes, para não apagar nada). Paradas e observações continuam. Fica no histórico.'], ['Quando usar?', 'O turno mudou de horário no Portal depois de o dia ser aberto, ou os intervalos foram editados por engano.']]],
  reaplicarMetas: ['Reaplicar metas vigentes', [['O que faz?', 'Troca as metas congeladas no último fechamento (PPH, OEE meta, meta por intervalo) pelas metas vigentes hoje para a data deste dia (Portal › Metas de OEE).'], ['E os dados?', 'Produção, paradas e scrap não mudam; mudam a meta e os indicadores contra a meta (atingimento, semáforo). Fica no histórico.'], ['Quando usar?', 'Uma meta foi corrigida no Portal com vigência que pega este dia.']]],
  moverDia: ['Mover para outro dia', [['O que faz?', 'Copia tudo deste dia (turnos, hora a hora, paradas, scrap, observações) para a data certa e deixa este dia vazio.'], ['E os dados?', 'As metas são recalculadas para a data nova (vigência da data do fato). O original fica no histórico/auditoria; nada é apagado de verdade. Dia fechado precisa ser reaberto antes.'], ['Quando usar?', 'Lançou no dia errado (ex.: o C de domingo lançado na segunda).']]],
  diaSemProd: ['Marcar dia sem produção', [['O que faz?', 'Registra que a linha não rodou no dia por decisão (feriado, inventário, sem programação): o dia sai do tempo programado do OEE.'], ['E se rodou e parou?', 'Não é "sem produção": marque os turnos como não programados ou aponte as paradas (falta de material, quebra), que entram no OEE.']]]
});
