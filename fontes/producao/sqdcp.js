/* Quadro SQDCP e relatórios A4. Incorporado pelo build; não requer servidor ou biblioteca externa. */
Object.assign(HELP, {
  sqIndicador: ['Indicador da posição', [['O que é?', 'A medida que ocupa esta folha do quadro.'], ['Exemplo', 'Q1 pode mostrar as QNs do dia; uma vaga livre não imprime indicador.']]],
  sqTitulo: ['Título personalizado', [['O que é?', 'Nome que aparece na tela e no topo da folha. Vazio usa o nome padrão.'], ['Exemplo', 'Refugo da linha Vacutainer.']]],
  sqPeriodo: ['Período do resultado', [['O que é?', 'Dia, últimos sete dias ou mês até a data de referência. A evolução mostra o mês.'], ['Exemplo', 'Mês: do dia 1 até o dia escolhido. Indicador manual usa a fotografia do último dia.']]],
  sqFormato: ['Modelo da folha', [['O que é?', 'Resultado com evolução, calendário mensal ou síntese de desvios e ações.'], ['Exemplo', 'Segurança em calendário; OEE com evolução. Todos imprimem uma A4 paisagem.']]],
  sqMeta: ['Meta do quadro', [['O que é?', 'Comparação usada nesta posição. Não altera as metas de produção do cadastro. Vazio usa a meta vigente quando disponível.'], ['Exemplo', 'Scrap percentual: 1,5 significa 1,5%, não 0,015.']]],
  sqSentido: ['Sentido da meta', [['O que é?', 'Define qual lado da meta é favorável.'], ['Exemplo', 'Acidentes: menor é melhor. Atendimento ao plano: maior é melhor.']]],
  sqUnidade: ['Unidade', [['O que é?', 'Rótulo ao lado do número, sem converter o valor. Vazio usa o padrão do indicador.'], ['Exemplo', 'pessoas, peças, kg ou %.']]],
  sqObservacao: ['Observação da folha', [['O que é?', 'Nota curta que acompanha as impressões desta posição até ser alterada.'], ['Exemplo', 'Conferir a causa do aumento de scrap na reunião.']]],
  sqBlocos: ['Blocos do Painel', [['O que é?', 'Gráficos do Painel da Produção impressos nesta folha (até 3), cada um com o seu período contado a partir da data de referência. Linha Vacutainer, todos os turnos.'], ['Exemplo', 'Scrap % no dia e Scrap % na semana; Hora a hora do dia de referência (ontem) e Plano do mês acumulado.']]],
  sqManual: ['Indicador manual', [['O que é?', 'Valor informado nesta linha, data, turno e posição. Vazio é Não informado; zero é uma medição válida.'], ['Exemplo', 'Presença: 12 pessoas. O relatório não soma pessoas entre dias.']]],
  sqAcidente: ['Acidente no turno', [['O que é?', 'Registre apenas as novas ocorrências deste turno. Sem resposta não significa ausência de acidente.'], ['Exemplo', 'Não houve: zero confirmado. Sim: informe a quantidade e, se houver, a referência.']]],
  sqQN: ['Quality Notification', [['O que é?', 'Notificações de qualidade reportadas no turno. Números ficam como texto.'], ['Exemplo', '00001234 é preservado. O mesmo número em dois turnos conta uma vez no período; sem número a contagem é provisória.']]],
  sqReferencia: ['Data de referência', [['O que é?', 'Data dos indicadores da reunião. Na operação normal abre no dia anterior.'], ['Exemplo', 'Na reunião de terça, selecione a segunda-feira. Fontes com posição atual ou competência mensal indicam sua própria referência.']]]
});
const Sqdcp = (() => {
  const M = SQDCPModelo, e = U.esc, copia = M.copiar;
  const UI = { dia: vacDemo.ativo ? U.today() : U.addDays(U.today(), -1), linha: 'line_vac', turno: '', editando: null };
  const fontes = {}, arquivos = { perdas: 'perdas-base.json', gel: 'fifo-base.json', inic: 'iniciativas-base.json' };
  let origem = null, carregando = null, geracao = 0;
  const cache = { base: null, rev: null, rows: new Map() };
  const catalogo = [
    { id: 'acidentes', p: 'S', nome: 'Acidentes', unidade: 'ocorrências', tipo: 'acidente', sentido: 'menor', meta: 0 },
    { id: 'diasSeguros', p: 'S', nome: 'Dias confirmados sem acidente', unidade: 'dias', sentido: 'maior' },
    { id: 'coberturaS', p: 'S', nome: 'Segurança: turnos respondidos', unidade: '%', sentido: 'maior', meta: 100 },
    { id: 'qn', p: 'Q', nome: 'QN — Quality Notification', unidade: 'notificações', tipo: 'qn', sentido: 'menor', meta: 0 },
    { id: 'scrap', p: 'Q', nome: 'Scrap', unidade: 'peças', campo: 'scrap', sentido: 'menor' },
    { id: 'scrapPct', p: 'Q', nome: 'Scrap percentual', unidade: '%', campo: 'scrapPct', fator: 100, sentido: 'menor' },
    { id: 'qualidade', p: 'Q', nome: 'Qualidade do OEE', unidade: '%', campo: 'Q', fator: 100, sentido: 'maior' },
    { id: 'boa', p: 'DP', nome: 'Produção boa', unidade: 'peças', campo: 'good', sentido: 'maior' },
    { id: 'atendimento', p: 'DP', nome: 'Produção × meta operacional', unidade: '%', campo: 'attain', fator: 100, sentido: 'maior', meta: 100 },
    { id: 'oee', p: 'DP', nome: 'OEE', unidade: '%', campo: 'oee', fator: 100, sentido: 'maior' },
    { id: 'paradas', p: 'DP', nome: 'Paradas apontadas', unidade: 'min', campo: 'apontMin', sentido: 'menor' },
    { id: 'waste', p: 'C', nome: 'Waste — MUV da competência', unidade: 'R$', fonte: 'perdas', sentido: 'menor' },
    { id: 'gel', p: 'C', nome: 'Gel disponível — posição atual', unidade: 'kg', fonte: 'gel' },
    { id: 'acoes', p: 'SP', nome: 'Ações abertas — posição atual', unidade: 'ações', fonte: 'inic' },
    { id: 'atrasadas', p: 'SP', nome: 'Ações atrasadas — posição atual', unidade: 'ações', fonte: 'inic', sentido: 'menor', meta: 0 },
    { id: 'manual', p: 'SQDCP', nome: 'Indicador manual', unidade: '', sentido: 'maior' },
    { id: 'painel', p: 'SQDCP', nome: 'Blocos do Painel (gráficos da Produção)', unidade: '', painel: true }
  ];
  const info = id => catalogo.find(c => c.id === id);
  const fmt = v => v == null || !Number.isFinite(v) ? '—' : Math.abs(v) > 1e15 ? v.toExponential(3).replace('.', ',') : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const nomeLinha = () => ((db().lines || []).find(l => l.id === UI.linha) || {}).name || UI.linha;
  const pode = fn => typeof vacPode !== 'function' || vacPode('oee', fn);
  const sel = (valores, atual) => valores.map(a => '<option value="' + e(a[0]) + '"' + (String(a[0]) === String(atual) ? ' selected' : '') + '>' + e(a[1]) + '</option>').join('');
  const campos = (v, k) => v && v[k] || {};
  function formularioTurno(day, ps) {
    const s = ps.sqdcp || {}, bloqueado = locked(day, ps) || !pode('lancar');
    return '<div class="sq-ocorrencias" data-sq-day="' + e(day.id) + '" data-sq-turno="' + e(ps.id) + '"><h4>Segurança e qualidade do turno</h4>' +
      '<p class="small muted">Informe as ocorrências deste turno. Deixar em branco mantém o relatório como não informado.</p><div class="sq-oc-grid">' +
      ['acidente', 'qn'].map(k => {
        const x = M.lerEvento(s[k]), n = k === 'acidente' ? 'Houve acidente?' : 'Houve QN (Quality Notification)?';
        return '<fieldset><legend>' + n + ' ' + ib(k === 'acidente' ? 'sqAcidente' : 'sqQN') + '</legend><label>Resposta <span class="small muted">(Sim, Não houve ou Não informado)</span><select data-sq-resp="' + k + '"' + (bloqueado ? ' disabled' : '') + '>' +
          sel([['', 'Não informado'], ['nao', 'Não houve'], ['sim', 'Sim']], x ? x.resposta : '') + '</select></label><div data-sq-detalhe="' + k + '"' + (!x || x.resposta !== 'sim' ? ' hidden' : '') + '>' +
          '<label>Quantidade de ocorrências no turno <input data-sq-qtd="' + k + '" type="number" min="1" max="100000" step="1" value="' + (x && x.resposta === 'sim' ? x.quantidade : 1) + '"' + (bloqueado ? ' disabled' : '') + '></label>' +
          '<label>' + (k === 'qn' ? 'Números das QNs' : 'Referências dos acidentes') + ' <span class="small muted">(opcional; separados por vírgula)</span><input data-sq-refs="' + k + '" maxlength="6000" value="' + e(x ? x.numeros.join(', ') : '') + '"' + (bloqueado ? ' disabled' : '') + '></label>' +
          '<label>Resumo operacional <textarea data-sq-resumo="' + k + '" maxlength="400"' + (bloqueado ? ' disabled' : '') + '>' + e(x ? x.resumo : '') + '</textarea></label></div></fieldset>';
      }).join('') + '</div><div class="row"><button type="button" class="btn primary" data-sq-salvar' + (bloqueado ? ' disabled' : '') + '>Salvar segurança e qualidade</button>' +
      '<span class="small muted">' + (s.em ? 'Último registro: ' + e(s.por) + ' · ' + e(U.brDT(s.em)) : 'Sem respostas registradas neste turno') + '</span></div></div>';
  }
  function lerFormulario(box) {
    const v = {};
    for (const k of ['acidente', 'qn']) v[k] = { resposta: box.querySelector('[data-sq-resp="' + k + '"]').value,
      quantidade: box.querySelector('[data-sq-qtd="' + k + '"]').value, numeros: box.querySelector('[data-sq-refs="' + k + '"]').value,
      resumo: box.querySelector('[data-sq-resumo="' + k + '"]').value };
    return M.validarTurno(v);
  }
  function avisos(day, shifts) {
    return shifts.filter(s => !s.ps.off && !s.ps.summary).flatMap(s => ['acidente', 'qn'].filter(k => !M.lerEvento((s.ps.sqdcp || {})[k])).map(k =>
      ({ level: 'alerta', msg: s.ps.snap.name + ': ' + (k === 'acidente' ? 'acidente' : 'QN') + ' não informado.', ref: { ps: s.ps.id } })));
  }
  // Padrão sugerido das posições com blocos do Painel (homologação de 10/11/2026); cada posição pode ser trocada em Configurar.
  const PADRAO_PAINEL = {
    Q3: { titulo: 'Scrap % · dia e semana', blocos: [{ b: 'scrapDay', periodo: 'dia' }, { b: 'scrapDay', periodo: 'semana' }] },
    D3: { titulo: 'Produção × meta · hora a hora e plano do mês', blocos: [{ b: 'hourly', periodo: 'dia' }, { b: 'planMonth', periodo: 'mes' }] },
    C2: { titulo: 'OEE · velocímetro, semana e mês', blocos: [{ b: 'gaugeOee', periodo: 'dia' }, { b: 'oeeDay', periodo: 'semana' }, { b: 'oeeDay', periodo: 'mes' }] }
  };
  const ROT_PER = { dia: 'Dia de referência', semana: 'Últimos 7 dias', mes: 'Mês até a referência' };
  const blocosPainel = () => typeof PN_B === 'undefined' ? [] : Object.keys(PN_B).map(k => [k, PN_B[k].l + (PN_B[k].g ? ' · ' + PN_B[k].g : '')]);
  function padrao(key) {
    if (PADRAO_PAINEL[key]) return { indicador: 'painel', formato: 'painel', periodo: 'dia', titulo: PADRAO_PAINEL[key].titulo, unidade: '', meta: null, sentido: '', observacao: '',
      blocos: PADRAO_PAINEL[key].blocos.map(b => ({ ...b })) };
    const defs = { S: ['acidentes', 'diasSeguros', 'coberturaS'], Q: ['qn', 'scrapPct', 'qualidade'], D: ['boa', 'atendimento', 'oee'],
      C: ['waste', 'gel'], P: ['acoes', 'atrasadas'] };
    return { indicador: (defs[key[0]] || [])[+key.slice(1)] || '', formato: key === 'S0' || key === 'Q0' ? 'calendario' : 'evolucao',
      periodo: 'dia', titulo: '', unidade: '', meta: null, sentido: '', observacao: '' };
  }
  function quadro() { return ((db().sqdcp || {}).quadros || {})[UI.linha] || { p: 'pessoas', slots: {} }; }
  function vaga(key) { return { ...padrao(key), ...((quadro().slots || {})[key] || {}) }; }
  function validarVaga(key, v) {
    if (!/^[SQDCP][0-4]$/.test(key)) throw new Error('Vaga inválida.');
    const c = v.indicador ? info(v.indicador) : null;
    if (v.indicador && (!c || !c.p.includes(key[0]))) throw new Error('Indicador inválido para esta coluna.');
    if (v.indicador === 'painel') {
      const ok = new Set(blocosPainel().map(a => a[0]));
      const blocos = (Array.isArray(v.blocos) ? v.blocos : []).filter(b => b && b.b).slice(0, 3).map(b => {
        if (ok.size && !ok.has(b.b)) throw new Error('Bloco do Painel inválido: ' + b.b + '.');
        if (!['dia', 'semana', 'mes'].includes(b.periodo)) throw new Error('Período do bloco inválido.');
        return { b: String(b.b), periodo: b.periodo };
      });
      if (!blocos.length) throw new Error('Escolha ao menos um bloco do Painel.');
      return { indicador: 'painel', formato: 'painel', periodo: 'dia', titulo: String(v.titulo || '').trim().slice(0, 80), unidade: '', meta: null, sentido: 'maior',
        observacao: String(v.observacao || '').trim().slice(0, 300), blocos };
    }
    if (!['evolucao', 'calendario', 'desvios'].includes(v.formato) || !['dia', 'semana', 'mes'].includes(v.periodo)) throw new Error('Formato ou período inválido.');
    if (v.meta != null && (!Number.isFinite(v.meta) || Math.abs(v.meta) > 1e15)) throw new Error('Meta inválida.');
    return { indicador: v.indicador, formato: v.formato, periodo: v.periodo, titulo: String(v.titulo || '').trim().slice(0, 80),
      unidade: String(v.unidade || '').trim().slice(0, 20), meta: v.meta == null ? null : v.meta, sentido: v.sentido === 'menor' ? 'menor' : 'maior',
      observacao: String(v.observacao || '').trim().slice(0, 300) };
  }
  function intervalo(cfg, dia) {
    if (cfg.periodo === 'mes') return [dia.slice(0, 7) + '-01', dia];
    if (cfg.periodo === 'semana') return [U.addDays(dia, -6), dia];
    return [dia, dia];
  }
  function linhas(de, ate) {
    if (cache.base !== db() || cache.rev !== Store.S.rev) { cache.base = db(); cache.rev = Store.S.rev; cache.rows.clear(); }
    const k = [UI.linha, UI.turno, de, ate].join('|');
    if (!cache.rows.has(k)) cache.rows.set(k, M.linhas(db(), de, ate, UI.linha, UI.turno, Engine, U));
    return cache.rows.get(k);
  }
  function dados(c, cfg, de, ate, key) {
    const rows = linhas(de, ate), resumo = M.resumo(rows), ret = { valor: null, nota: '', parcial: false, rows, resumo, fonte: 'Produção', itens: [] };
    if (c.tipo) {
      const r = resumo[c.tipo]; ret.valor = r.quantidade; ret.parcial = !r.completo;
      ret.nota = r.respondidos + '/' + resumo.esperados + ' turnos respondidos' + (c.tipo === 'qn' ? ' · Mesmo número de QN conta uma vez no período.' : '') +
        (c.tipo === 'qn' && r.semNumero ? ' · ' + r.semNumero + ' QN(s) sem número; contagem provisória' : '');
      ret.itens = rows.filter(r => !r[c.tipo] || r[c.tipo].quantidade).map(r => [U.brDate(r.dia) + ' · ' + r.turno,
        r[c.tipo] ? r[c.tipo].quantidade + ' ocorrência(s)' + (r[c.tipo].numeros.length ? ' · ' + r[c.tipo].numeros.join(', ') : '') : 'Não informado',
        r[c.tipo] ? r[c.tipo].resumo : 'Aguardando resposta']);
    } else if (c.id === 'coberturaS') {
      ret.valor = resumo.acidente.cobertura == null ? null : resumo.acidente.cobertura * 100;
      ret.parcial = !resumo.acidente.completo; ret.nota = resumo.acidente.respondidos + '/' + resumo.esperados + ' turnos respondidos';
    } else if (c.id === 'diasSeguros') {
      let n = 0;
      for (let d = ate, i = 0; i < 365; d = U.addDays(d, -1), i++) {
        const r = M.resumo(linhas(d, d));
        if (!r.esperados || !r.acidente.completo || r.acidente.quantidade > 0) break;
        n++;
      }
      ret.valor = resumo.acidente.completo || n ? n : null; ret.parcial = !resumo.acidente.completo;
      ret.nota = 'Até 365 dias verificados, com todos os turnos confirmados; interrompe em lacuna ou acidente.';
    } else if (c.campo) {
      const days = Engine.daysIn(db(), { from: de, to: ate, lineId: UI.linha });
      if (days.length) {
        const r = Engine.periodResult(db(), days, { shiftId: UI.turno || undefined });
        let conhecido = true;
        if (['scrap', 'scrapPct', 'qualidade'].includes(c.id)) conhecido = days.every(d => {
          if (d.scrapMode === 'day') return d.scrapDay != null;
          return d.shifts.filter(p => !p.deleted && !p.off && (!UI.turno || p.shiftId === UI.turno)).every(p => p.scrap != null || p.summary);
        });
        ret.valor = conhecido && r[c.campo] != null ? r[c.campo] * (c.fator || 1) : null;
        ret.parcial = r.goodMissing > 0 || !conhecido;
        if (c.id === 'oee') ret.metaNativa = r.oeeTarget == null ? null : r.oeeTarget * 100;
        if (c.id === 'boa') ret.metaNativa = r.metaOp || null;
        ret.nota = days.length + ' dia(s) com lançamento' + (ret.parcial ? ' · apontamento incompleto' : '') +
          (UI.turno && days.some(d => d.scrapMode === 'day') && ['scrap', 'scrapPct', 'qualidade'].includes(c.id) ? ' · scrap diário rateado pelo cálculo da Produção' : '');
      } else ret.nota = 'Sem lançamento de produção no período.';
    } else if (c.id === 'manual') {
      const vals = [];
      for (let d = de; d <= ate; d = U.addDays(d, 1)) {
        const v = ((((db().sqdcp || {}).manuais || {})[UI.linha] || {})[key + '|' + d + '|' + UI.turno]);
        if (v && Number.isFinite(v.valor)) vals.push({ dia: d, ...v });
      }
      // Indicador manual é uma fotografia na data de referência, não soma taxas ou pessoas entre dias.
      const atual = vals.find(v => v.dia === ate); ret.valor = atual ? atual.valor : null;
      ret.nota = atual ? 'Informado por ' + atual.por + ' em ' + U.brDT(atual.em) : 'Valor manual não informado na data de referência.';
      ret.fonte = 'Registro manual'; ret.itens = vals.map(v => [U.brDate(v.dia), fmt(v.valor), v.nota || '']);
    } else {
      if (UI.linha !== 'line_vac') { ret.nota = 'Esta fonte publica a linha Vacutainer, sem detalhamento para a linha selecionada.'; return ret; }
      const x = fontes[c.fonte]; ret.fonte = c.fonte === 'perdas' ? 'Waste · exports' : c.fonte === 'gel' ? 'Gel · exports' : 'Iniciativas · exports';
      if (!x || !x.ex) { ret.nota = x && x.erro || 'Conecte a pasta e atualize as fontes do quadro.'; return ret; }
      const ex = x.ex;
      if (c.id === 'waste') {
        const p = (ex.porMes || []).filter(p => p.per <= ate.slice(0, 7)).sort((a, b) => b.per.localeCompare(a.per))[0];
        if (p) { ret.valor = Number.isFinite(p.muv) ? p.muv : Number.isFinite(p.liquido) ? p.liquido : null; ret.nota = (Number.isFinite(p.muv) ? 'MUV (estrutura + empregado) · ' : '') + 'Competência ' + p.per + ' · ' + (p.fechado ? 'fechada' : 'em aberto') + ' · não representa custo diário ou do turno.'; }
        else ret.nota = 'Sem competência publicada até esta referência.';
      } else if (c.id === 'gel') {
        ret.valor = ex.estoque && Number.isFinite(ex.estoque.disponivelKg) ? ex.estoque.disponivelKg : null;
        ret.nota = 'Posição atual da base; não representa saldo histórico na data escolhida.';
      } else {
        const ac = (ex.acoes || []).filter(a => a.status !== 'concluída' && a.status !== 'cancelada' && (key[0] === 'S' ? (a.origem || {}).tipo === 'osm' : true));
        const list = c.id === 'atrasadas' ? ac.filter(a => a.prazo && a.prazo < U.today()) : ac;
        ret.valor = list.length; ret.nota = 'Posição atual da base; prazos comparados com ' + U.brDate(U.today()) + '.';
        ret.itens = list.slice().sort((a, b) => String(a.prazo || '9999').localeCompare(String(b.prazo || '9999'))).map(a => [a.titulo, a.responsavel || 'Sem responsável', a.prazo ? U.brDate(a.prazo) : 'Sem prazo']);
      }
      ret.nota += ' Fonte atualizada: ' + U.brDT(ex.geradoEm || '');
    }
    return ret;
  }
  function conferirOrigem() {
    const be = Store.S.backend, atual = vacDemo.ativo ? vacDemo.id : be && be.dir;
    if (origem !== atual) {
      origem = atual; geracao++; carregando = null;
      for (const k of Object.keys(fontes)) delete fontes[k];
    }
    return be;
  }
  async function carregarFontes(forcar) {
    const be = conferirOrigem();
    if (!forcar && (carregando || Object.keys(fontes).length)) return carregando;
    const seq = ++geracao;
    if (forcar) for (const k of Object.keys(fontes)) delete fontes[k];
    carregando = (async () => {
      for (const [id, arquivo] of Object.entries(arquivos)) {
        let resultado;
        try {
          let ex;
          if (vacDemo.ativo) ex = vacDemo.exports(id);
          else {
            if (!be || !be.dir) throw new Error('Conecte a Produção à pasta da linha para consultar esta fonte.');
            const raiz = typeof vacRaiz === 'function' ? vacRaiz(be.dir) : be.dir;
            const fh = await raiz.getFileHandle(arquivo);
            ex = JSON.parse(await (await fh.getFile()).text()).exports;
          }
          if (!ex || !vacExportsOk(ex).ok) throw new Error('Fonte sem exports compatível.');
          if (id === 'perdas' && !Array.isArray(ex.porMes) || id === 'inic' && !Array.isArray(ex.acoes) ||
            id === 'gel' && (!ex.estoque || typeof ex.estoque !== 'object')) throw new Error('Fonte sem os campos esperados para este indicador.');
          resultado = { ex };
        } catch (err) { resultado = { erro: err && err.name === 'NotFoundError' ? 'Base da fonte não encontrada na pasta conectada.' : String(err.message || err) }; }
        if (seq === geracao) fontes[id] = resultado;
      }
    })().finally(() => { if (seq === geracao) { carregando = null; if (App.route === 'sqdcp') render(); } });
    return carregando;
  }
  function relatorio(key) {
    const cfg = vaga(key), c = info(cfg.indicador);
    if (!c) return null;
    if (c.painel) {
      const blocos = cfg.blocos || [], de = blocos.reduce((m, b) => { const a = intervalo(b, UI.dia)[0]; return a < m ? a : m; }, UI.dia);
      return { cfg, c, key, valor: null, parcial: false, itens: [], serie: [], rows: [], de, ate: UI.dia, meta: null, sentido: 'maior', estado: 'info', unidade: '',
        titulo: cfg.titulo || c.nome, fonte: 'Painel da Produção', painel: true,
        nota: blocos.map(b => (typeof PN_B !== 'undefined' && PN_B[b.b] ? PN_B[b.b].l : b.b) + ' (' + (ROT_PER[b.periodo] || b.periodo).toLowerCase() + ')').join(' · ') + ' · Linha Vacutainer, todos os turnos.' };
    }
    const [de, ate] = intervalo(cfg, UI.dia), d = dados(c, cfg, de, ate, key);
    const meta = cfg.meta != null ? cfg.meta : d.metaNativa != null ? d.metaNativa : c.meta;
    const sentido = cfg.sentido || c.sentido || 'maior';
    const ruim = d.valor != null && meta != null && (sentido === 'menor' ? d.valor > meta : d.valor < meta);
    const estado = d.valor == null ? 'sem' : ruim ? 'crit' : d.parcial ? 'parcial' : meta == null ? 'info' : 'ok';
    const titulo = cfg.titulo || c.nome, unidade = cfg.unidade || c.unidade;
    const serie = [];
    for (let dia = UI.dia.slice(0, 7) + '-01'; dia <= UI.dia; dia = U.addDays(dia, 1))
      serie.push({ dia, ...dados(c, cfg, dia, dia, key) });
    return { cfg, c, ...d, key, de, ate, meta, sentido, estado, titulo, unidade, serie };
  }
  const rotEstado = r => ({ sem: 'Não informado', parcial: 'Dados parciais', info: 'Sem meta cadastrada', ok: 'Na meta', crit: 'Fora da meta' })[r.estado] + (r.estado === 'crit' && r.parcial ? ' · parcial' : '');
  /* PRD-09 (Fase 5 · 5d): barras por dia, verdes quando atingem a meta e vermelhas quando não (pelo sentido do indicador);
     âmbar = parcial, azul = sem meta. Linha só para a meta (tracejada) e para a tendência (a partir de 4 valores). */
  /* 2.4.41 · homologação (PRD-23): mesmo padrão dos gráficos da Visão Geral, para ler a distância na A4 — valor em cada barra, dia em cada
     coluna, meta com o valor, legenda dentro do gráfico e fontes grandes (viewBox 1000×250 na mesma proporção da área da folha: rótulos de 20–26 unidades ≈ 15–19 pt). */
  function grafico(r) {
    if (r.c.fonte) return '<div class="sq-sem-serie">' + e(r.nota) + '</div>';
    const valores = r.serie.map(p => p.valor).filter(v => v != null);
    if (!valores.length) return '<div class="sq-sem-serie">Sem valores informados para desenhar a evolução.</div>';
    const n = r.serie.length, X0 = 78, X1 = 935, Y0 = 168, Y1 = 64;
    const min = Math.min(0, ...valores, r.meta || 0), max = Math.max(1e-9, ...valores, r.meta || 0) * 1.04;
    const passo = (X1 - X0) / Math.max(1, n), larg = Math.max(4, passo * 0.72), x = i => X0 + passo * i + passo / 2, y = v => Y0 - (v - min) / ((max - min) || 1) * (Y0 - Y1), y0 = y(0);
    const cor = p => { if (p.parcial) return '#9b6600'; if (r.meta == null) return '#235f91'; const ruim = r.sentido === 'menor' ? p.valor > r.meta : p.valor < r.meta; return ruim ? '#c62828' : '#2e7d32'; };
    const curto = v => { const a = Math.abs(v); if (a >= 1e6) return (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi'; if (a >= 1e4) return (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil'; return v.toLocaleString('pt-BR', { maximumFractionDigits: a < 10 ? 1 : 0 }); };
    const fv = Math.max(14, Math.min(26, passo * 0.8)), vert = n > 12, fd = Math.max(14, Math.min(24, passo * 0.85)), cadaDia = passo >= fd * 1.15 ? 1 : 2;
    const barras = r.serie.map((p, i) => {
      if (p.valor == null) return '';
      const yt = Math.min(y(p.valor), y0), h = Math.max(1, Math.abs(y0 - y(p.valor))), t = curto(p.valor), cx = x(i);
      const rect = '<rect x="' + (cx - larg / 2).toFixed(1) + '" y="' + yt.toFixed(1) + '" width="' + larg.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + cor(p) + '" rx="2"><title>' + e(p.dia.split('-').reverse().join('/') + ': ' + fmt(p.valor) + (p.parcial ? ' (parcial)' : '')) + '</title></rect>';
      const comp = t.length * fv * 0.6 + 8, dentro = vert && h > comp;
      const lbl = vert
        ? '<text transform="translate(' + (cx + fv * 0.35).toFixed(1) + ',' + (dentro ? yt + 6 : yt - 6).toFixed(1) + ') rotate(-90)" text-anchor="' + (dentro ? 'end' : 'start') + '" font-size="' + fv.toFixed(0) + '" font-weight="700" fill="' + (dentro ? '#ffffff' : '#1b2733') + '">' + e(t) + '</text>'
        : '<text x="' + cx.toFixed(1) + '" y="' + (yt - 8).toFixed(1) + '" text-anchor="middle" font-size="' + fv.toFixed(0) + '" font-weight="700" fill="#1b2733">' + e(t) + '</text>';
      return rect + lbl;
    }).join('');
    const pts = r.serie.map((p, i) => [i, p.valor]).filter(q => q[1] != null); let tend = '';
    if (pts.length >= 4) { const k = pts.length, sx = pts.reduce((a, q) => a + q[0], 0), sy = pts.reduce((a, q) => a + q[1], 0), sxx = pts.reduce((a, q) => a + q[0] * q[0], 0), sxy = pts.reduce((a, q) => a + q[0] * q[1], 0), den = k * sxx - sx * sx;
      if (den) { const b = (k * sxy - sx * sy) / den, a = (sy - b * sx) / k, i0 = pts[0][0], i1 = pts[k - 1][0]; tend = '<line x1="' + x(i0) + '" y1="' + y(a + b * i0) + '" x2="' + x(i1) + '" y2="' + y(a + b * i1) + '" stroke="#4a5868" stroke-width="3" stroke-dasharray="4 7"/>'; } }
    const meta = r.meta != null ? '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + y(r.meta) + '" y2="' + y(r.meta) + '" stroke="#785300" stroke-width="3" stroke-dasharray="12 8"/><text x="' + (X1 + 4) + '" y="' + (y(r.meta) - 6) + '" font-size="22" font-weight="700" fill="#785300">Meta</text><text x="' + (X1 + 4) + '" y="' + (y(r.meta) + 20) + '" font-size="22" font-weight="700" fill="#785300">' + e(curto(r.meta)) + '</text>' : '';
    const dias = r.serie.map((p, i) => (i % cadaDia === 0 || i === n - 1 ? '<text x="' + x(i).toFixed(1) + '" y="' + (Y0 + 26) + '" text-anchor="middle" font-size="' + fd.toFixed(0) + '" fill="#1b2733">' + p.dia.slice(-2) + '</text>' : '')).join('');
    const topo = Math.max(...valores, r.meta || 0), eixo = '<text x="' + (X0 - 8) + '" y="' + (y(topo) + 7) + '" font-size="20" text-anchor="end" fill="#4a5868">' + e(curto(topo)) + '</text><text x="' + (X0 - 8) + '" y="' + (Y0 + 7) + '" font-size="20" text-anchor="end" fill="#4a5868">' + e(curto(min)) + '</text>';
    const leg = [['#2e7d32', 'Atingiu a meta'], ['#c62828', 'Não atingiu'], ['#9b6600', 'Parcial'], ...(r.meta == null ? [['#235f91', 'Sem meta']] : [])];
    let lx = X0; const legenda = leg.map(([c, t]) => { const s = '<rect x="' + lx + '" y="' + (Y0 + 46) + '" width="20" height="20" rx="3" fill="' + c + '"/><text x="' + (lx + 30) + '" y="' + (Y0 + 63) + '" font-size="20" fill="#1b2733">' + t + '</text>'; lx += 36 + t.length * 11.5; return s; }).join('')
      + (r.meta != null ? '<line x1="' + lx + '" x2="' + (lx + 36) + '" y1="' + (Y0 + 56) + '" y2="' + (Y0 + 56) + '" stroke="#785300" stroke-width="3" stroke-dasharray="12 8"/><text x="' + (lx + 44) + '" y="' + (Y0 + 63) + '" font-size="20" fill="#1b2733">Meta</text>' : '')
      + (tend ? '<line x1="' + (lx + 120) + '" x2="' + (lx + 156) + '" y1="' + (Y0 + 56) + '" y2="' + (Y0 + 56) + '" stroke="#4a5868" stroke-width="3" stroke-dasharray="4 7"/><text x="' + (lx + 164) + '" y="' + (Y0 + 63) + '" font-size="20" fill="#1b2733">Tendência</text>' : '');
    return '<svg class="sq-grafico" role="img" aria-label="Valores por dia no mês: verde atingiu a meta, vermelho não atingiu" viewBox="0 0 1000 250" font-family="Arial, Helvetica, sans-serif">' +
      '<line x1="' + X0 + '" y1="' + y0 + '" x2="' + X1 + '" y2="' + y0 + '" stroke="#9aa5b1" stroke-width="2"/>' + barras + tend + meta + dias + eixo + legenda + '</svg>';
  }
  function calendario(r) {
    const first = UI.dia.slice(0, 7) + '-01', n = +U.monthEnd(first).slice(-2), offset = (new Date(first + 'T12:00:00').getDay() + 6) % 7;
    let html = '<div class="sq-cal">' + ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => '<b>' + d + '</b>').join('') + '<span></span>'.repeat(offset);
    for (let i = 1; i <= n; i++) {
      const dia = UI.dia.slice(0, 7) + '-' + String(i).padStart(2, '0'), p = r.serie.find(p => p.dia === dia);
      let rot = 'Sem dado', cls = 'sem';
      if (p && p.valor != null) {
        const lim = r.meta;
        const ruim = lim != null && (r.sentido === 'menor' ? p.valor > lim : p.valor < lim);
        cls = ruim ? 'crit' : p.parcial ? 'parcial' : lim == null ? 'info' : 'ok';
        rot = fmt(p.valor) + (p.parcial ? ' · parcial' : '');
      }
      if (dia > UI.dia) rot = 'Após referência';
      html += '<div class="sq-dia ' + cls + '"><strong>' + i + '</strong><span>' + e(rot) + '</span></div>';
    }
    return html + '</div><p class="sq-nota">Verde: na meta · Vermelho: fora da meta · Âmbar: parcial · Cinza: sem dado. Nunca considera resposta ausente como zero.</p>';
  }
  function tabelaItens(r) {
    const itens = r.itens.length ? r.itens : [[r.nota || 'Sem desvios detalhados neste indicador.', '', '']];
    return '<table class="sq-itens"><thead><tr><th>Referência / item</th><th>Resultado / responsável</th><th>Resumo / prazo</th></tr></thead><tbody>' +
      itens.slice(0, 5).map(a => '<tr>' + a.map(v => '<td>' + e(String(v || '').slice(0, 100)) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table><p class="sq-nota">Síntese: até 5 itens, com até 100 caracteres por campo. Consulte a base ou o CSV para o detalhamento completo.' +
      (itens.length > 5 ? ' Total: ' + itens.length + ' itens.' : '') + '</p>';
  }
  // Blocos do Painel na folha: mesmo cálculo do Painel (Panel.ctx + PN_B), período contado a partir da data de referência.
  function blocosHtml(r) {
    if (typeof PN_B === 'undefined' || typeof Panel === 'undefined') return '<div class="sq-sem-serie">Painel indisponível nesta página.</div>';
    const bl = r.cfg.blocos || [], n = bl.length || 1, larg = bl.some(b => b.b === 'gaugeOee') && n > 1 ? null : Math.floor(1000 / n);
    const cel = bl.map(b => {
      const B = PN_B[b.b]; if (!B) return '<div class="sq-blk"><h5>' + e(b.b) + '</h5><div class="sq-sem-serie">Bloco não existe mais no Painel.</div></div>';
      const [de, ate] = intervalo(b, UI.dia);
      let h; Charts.setWidth(b.b === 'gaugeOee' ? 320 : larg || Math.floor(1000 / (n - 0.5)));
      try { const x = Panel.ctx({ pre: 'custom', from: de, to: ate, cmp: false, grp: 'day' });
        h = x.days.length || ['external', 'trend12', 'planMonth', 'planTable'].includes(b.b) ? B.r(x) : '<div class="sq-sem-serie">Sem lançamentos no período.</div>'; }
      catch (err) { console.error(err); h = '<div class="sq-sem-serie">Não foi possível montar este bloco.</div>'; }
      Charts.setWidth(720);
      return '<div class="sq-blk' + (b.b === 'gaugeOee' ? ' sq-blk-g' : '') + '"><h5>' + e(B.l) + ' · ' + e(de === ate ? U.brDate(de) : U.brDate(de) + ' a ' + U.brDate(ate)) + '</h5>' + h + '</div>';
    }).join('');
    return '<div class="sq-blocos">' + cel + '</div>';
  }
  function folha(key) {
    const r = relatorio(key); if (!r) return '';
    if (r.painel) {
      const letra = key[0], pilar = { S: 'Segurança', Q: 'Qualidade', D: 'Entrega', C: 'Custo', P: quadro().p === 'produtividade' ? 'Produtividade' : 'Pessoas' }[letra];
      return '<article class="sq-folha sq-folha-painel"><header class="sq-fhead"><b class="sq-letra">' + letra + '</b><div><h1>' + e(r.titulo) + '</h1><p>' + e(pilar + ' · Linha Vacutainer') +
        '</p></div><div class="sq-ref"><b>' + e(U.brDate(UI.dia)) + '</b><span>Todos os turnos</span><span>Blocos do Painel</span></div></header>' +
        '<section class="sq-conteudo">' + blocosHtml(r) + '</section>' +
        '<div class="sq-comentario"><b>Observação / ação</b><p>' + e(r.cfg.observacao || '') + '</p><span>Responsável: __________________________ Prazo: ______________</span></div>' +
        '<footer>Painel da Produção · Gerado em ' + e(U.brDT(U.nowIso())) + ' · ' + e(vacDemo.ativo ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'SQDCP · Produção') + '</footer></article>';
    }
    const valorFormatado = fmt(r.valor), tamanho = valorFormatado.length > 16 ? '25pt' : valorFormatado.length > 10 ? '34pt' : '44pt';
    const letra = key[0], pilar = { S: 'Segurança', Q: 'Qualidade', D: 'Entrega', C: 'Custo', P: quadro().p === 'produtividade' ? 'Produtividade' : 'Pessoas' }[letra];
    return '<article class="sq-folha"><header class="sq-fhead"><b class="sq-letra">' + letra + '</b><div><h1>' + e(r.titulo) + '</h1><p>' + e(pilar + ' · ' + nomeLinha()) +
      '</p></div><div class="sq-ref"><b>' + e(U.brDate(UI.dia)) + '</b><span>' + e(UI.turno ? ((db().shifts || []).find(s => s.id === UI.turno) || {}).name || UI.turno : 'Todos os turnos') + '</span><span>' + e(U.brDate(r.de) + ' a ' + U.brDate(r.ate)) + '</span></div></header>' +
      '<div class="sq-resultado"><div><strong style="font-size:' + tamanho + '">' + e(valorFormatado) + '</strong><span>' + e(r.unidade) + '</span></div><div><span>Meta</span><b>' + (r.meta == null ? 'Não cadastrada' : e((r.sentido === 'menor' ? '≤ ' : '≥ ') + fmt(r.meta) + ' ' + r.unidade)) + '</b><b class="sq-situacao ' + r.estado + '">' + e(rotEstado(r)) + '</b></div></div>' +
      '<p class="sq-nota">' + e(r.nota) + '</p><section class="sq-conteudo">' + (r.cfg.formato === 'calendario' ? calendario(r) : r.cfg.formato === 'desvios' ? tabelaItens(r) : grafico(r)) + '</section>' +
      '<div class="sq-comentario"><b>Observação / ação</b><p>' + e(r.cfg.observacao || '') + '</p><span>Responsável: __________________________ Prazo: ______________</span></div>' +
      '<footer>' + e(r.fonte) + ' · Gerado em ' + e(U.brDT(U.nowIso())) + ' · ' + e(vacDemo.ativo ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'SQDCP · Produção') + '</footer></article>';
  }
  function htmlImpressao(key) {
    const r = relatorio(key) || {}, estilos = r.painel ? [...document.querySelectorAll('style')].map(s => s.textContent).join('\n') : '';
    return '<!doctype html><html lang="pt-BR"' + (r.painel ? ' data-theme="light"' : '') + '><head><meta charset="utf-8"><title>SQDCP · ' + e(r.titulo || '') +
      '</title><style>' + estilos + '\n' + IMPRESSAO_CSS + '</style></head><body class="sq-print">' + folha(key) + '</body></html>';
  }
  function imprimir(key) {
    if (!pode('exportar')) return toast('Seu perfil não permite exportar relatórios.', true);
    const f = document.createElement('iframe'); f.className = 'sq-print-frame'; f.title = 'Impressão SQDCP A4 paisagem';
    f.style.cssText = 'position:fixed;left:-20000px;top:0;width:1123px;height:794px;border:0';
    f.onload = () => { f.contentWindow.onafterprint = () => f.remove(); f.contentWindow.focus(); f.contentWindow.print(); };
    f.srcdoc = htmlImpressao(key); document.body.appendChild(f);
  }
  function previa(key) {
    if (!pode('exportar')) return toast('Seu perfil não permite exportar relatórios.', true);
    const r = relatorio(key); if (!r) return;
    modal('Prévia · uma folha A4 em paisagem', '<p>Na janela de impressão, mantenha A4, paisagem e escala 100%. Desative cabeçalhos e rodapés do navegador.</p><iframe id="sqPreview" title="Prévia da folha SQDCP" style="width:100%;height:65vh;border:1px solid var(--line)"></iframe>',
      '<button class="btn" data-close>Voltar</button><button class="btn primary" id="sqPrint">Imprimir / Salvar PDF</button>', el => {
        const f = el.querySelector('#sqPreview'); f.onload = () => { f.contentDocument.documentElement.style.zoom = String(Math.min(1, f.clientWidth / 1123)); };
        f.srcdoc = htmlImpressao(key); el.querySelector('#sqPrint').onclick = () => imprimir(key);
      }, { wide: true });
  }
  function editar(key) {
    UI.editando = key; const v = vaga(key), c = info(v.indicador), atual = (((db().sqdcp || {}).manuais || {})[UI.linha] || {})[key + '|' + UI.dia + '|' + UI.turno];
    modal('Configurar posição ' + key[0] + ' · ' + (+key.slice(1) + 1), '<div class="form sq-form"><label class="f wide">Indicador ' + ib('sqIndicador') + '<select id="sqIndicador">' +
      sel([['', 'Vaga livre'], ...catalogo.filter(c => c.p.includes(key[0])).map(c => [c.id, c.nome])], v.indicador) + '</select></label>' +
      '<div id="sqBlocos" class="f wide"><b>Blocos do Painel ' + ib('sqBlocos') + '</b>' + [0, 1, 2].map(i => { const b = (v.blocos || [])[i] || {};
        return '<div class="sq-blrow"><select data-sqbl="' + i + '"><option value="">' + (i ? '(nenhum)' : 'Escolha o bloco') + '</option>' + sel(blocosPainel(), b.b || '') + '</select><select data-sqblp="' + i + '">' +
          sel(Object.entries(ROT_PER), b.periodo || 'dia') + '</select></div>'; }).join('') + '</div>' +
      '<label class="f wide">Título personalizado ' + ib('sqTitulo') + ' <input id="sqTitulo" maxlength="80" value="' + e(v.titulo) + '" placeholder="Usar o nome do indicador"></label>' +
      '<label class="f">Período do resultado ' + ib('sqPeriodo') + '<select id="sqPeriodo">' + sel([['dia', 'Dia de referência'], ['semana', 'Últimos 7 dias'], ['mes', 'Mês até a referência']], v.periodo) + '</select></label>' +
      '<label class="f">Modelo da folha ' + ib('sqFormato') + '<select id="sqFormato">' + sel([['evolucao', 'Resultado e evolução'], ['calendario', 'Calendário mensal'], ['desvios', 'Desvios e ações']], v.formato) + '</select></label>' +
      '<label class="f">Meta para este quadro ' + ib('sqMeta') + ' <input id="sqMeta" inputmode="decimal" value="' + e(v.meta == null ? '' : String(v.meta)) + '" placeholder="' + e(c && c.meta != null ? String(c.meta) : 'Meta vigente, quando disponível') + '"></label>' +
      '<label class="f">Sentido da meta ' + ib('sqSentido') + '<select id="sqSentido">' + sel([['maior', 'Maior ou igual é melhor'], ['menor', 'Menor ou igual é melhor']], v.sentido || c && c.sentido || 'maior') + '</select></label>' +
      '<label class="f">Unidade personalizada ' + ib('sqUnidade') + '<input id="sqUnidade" maxlength="20" value="' + e(v.unidade) + '" placeholder="%, peças, R$…"></label>' +
      '<label class="f wide">Observação para a folha ' + ib('sqObservacao') + '<textarea id="sqObs" maxlength="300">' + e(v.observacao) + '</textarea></label></div>' +
      '<div id="sqManual"><h4>Valor manual na referência ' + e(U.brDate(UI.dia)) + ' ' + ib('sqManual') + '</h4><p class="small">Usado somente para indicador manual; vazio permanece não informado. É uma fotografia nesta data, sem soma automática entre dias.</p><label>Valor <input id="sqValorManual" inputmode="decimal" value="' + e(atual && atual.valor != null ? String(atual.valor) : '') + '"></label><label>Nota da medição <input id="sqNotaManual" maxlength="300" value="' + e(atual ? atual.nota : '') + '"></label></div>',
      '<button class="btn" data-close>Cancelar</button><button class="btn primary" id="sqGravar">Salvar posição</button>', (el, fechar) => {
        const tipo = el.querySelector('#sqIndicador'), toggle = () => { el.querySelector('#sqManual').hidden = tipo.value !== 'manual'; const pn = tipo.value === 'painel';
          el.querySelector('#sqBlocos').hidden = !pn; for (const id of ['#sqPeriodo', '#sqFormato', '#sqMeta', '#sqSentido', '#sqUnidade']) el.querySelector(id).closest('label').hidden = pn; };
        tipo.onchange = toggle; toggle();
        el.querySelector('#sqGravar').onclick = () => {
          try {
            const num = id => { const t = el.querySelector(id).value.trim(); if (!t) return null; const n = vacNumero(t, { ponto: 'decimal' }); if (!Number.isFinite(n)) throw new Error('Valor numérico inválido.'); return n; };
            const cfg = validarVaga(key, { indicador: tipo.value, titulo: el.querySelector('#sqTitulo').value, periodo: el.querySelector('#sqPeriodo').value,
              formato: el.querySelector('#sqFormato').value, meta: num('#sqMeta'), sentido: el.querySelector('#sqSentido').value,
              unidade: el.querySelector('#sqUnidade').value, observacao: el.querySelector('#sqObs').value,
              blocos: [0, 1, 2].map(i => ({ b: el.querySelector('[data-sqbl="' + i + '"]').value, periodo: el.querySelector('[data-sqblp="' + i + '"]').value })) });
            const manual = cfg.indicador === 'manual' ? { valor: num('#sqValorManual'), nota: el.querySelector('#sqNotaManual').value.trim().slice(0, 300) } : undefined;
            Actions.setSQDCPVaga(UI.linha, key, cfg, UI.dia, UI.turno, manual); fechar(); render();
          } catch (err) { toast(err.message, true); }
        };
      }, { wide: true });
  }
  function registrarManual(key) {
    const r = relatorio(key), atual = (((db().sqdcp || {}).manuais || {})[UI.linha] || {})[key + '|' + UI.dia + '|' + UI.turno];
    modal('Registrar · ' + (r ? r.titulo : key), '<p>Referência: ' + e(U.brDate(UI.dia)) + ' · ' + e(nomeLinha()) +
      '</p><label>Valor <input id="sqDiaValor" inputmode="decimal" value="' + e(atual ? String(atual.valor) : '') + '"></label><label>Nota da medição <input id="sqDiaNota" maxlength="300" value="' + e(atual ? atual.nota : '') + '"></label><p class="small muted">Vazio remove a medição desta referência e volta a indicar Não informado.</p>',
      '<button class="btn" data-close>Cancelar</button><button class="btn primary" id="sqDiaSalvar">Salvar valor</button>', (el, fechar) => {
        el.querySelector('#sqDiaSalvar').onclick = () => {
          try {
            const raw = el.querySelector('#sqDiaValor').value.trim(), valor = raw ? vacNumero(raw, { ponto: 'decimal' }) : null;
            Actions.setSQDCPManual(UI.linha, key, UI.dia, UI.turno, valor, el.querySelector('#sqDiaNota').value);
            fechar(); render();
          } catch (err) { toast(err.message, true); }
        };
      });
  }
  function renderQuadro() {
    conferirOrigem();
    const q = quadro(), letras = ['S', 'Q', 'D', 'C', 'P'], nomes = ['Segurança', 'Qualidade', 'Entrega', 'Custo', q.p === 'produtividade' ? 'Produtividade' : 'Pessoas'];
    return '<section class="card"><header><div><h2>SQDCP · Gestão diária</h2><p class="small muted">Cada posição representa uma folha A4 em paisagem. Configure uma vez e atualize a referência para a reunião.</p></div></header><div class="sq-filtros">' +
      '<label>Data de referência dos indicadores ' + ib('sqReferencia') + '<input type="date" id="sqDia" value="' + e(UI.dia) + '"></label><button class="btn" id="sqOntem">Dia anterior</button>' +
      '<label>Linha<select id="sqLinha">' + sel((db().lines || []).filter(l => !l.deleted && !l.demo && l.active !== false).map(l => [l.id, l.name]), UI.linha) + '</select></label>' +
      '<label>Turno<select id="sqTurno">' + sel([['', 'Todos'], ...(db().shifts || []).filter(s => !s.deleted && !s.demo).map(s => [s.id, s.name])], UI.turno) + '</select></label>' +
      '<label>Coluna P<select id="sqP"' + (!pode('configurar') ? ' disabled' : '') + '>' + sel([['pessoas', 'Pessoas'], ['produtividade', 'Produtividade']], q.p || 'pessoas') + '</select></label>' +
      '<button class="btn" id="sqFontes">Atualizar fontes</button><button class="btn" id="sqCsv"' + (!pode('exportar') ? ' disabled' : '') + '>CSV · Segurança e QN</button></div></section>' +
      '<div class="sq-quadro">' + letras.map((l, i) => '<section class="sq-coluna sq-col-' + l + '"><h3><b>' + l + '</b><span>' + nomes[i] + '</span></h3>' +
        Array.from({ length: 5 }, (_, n) => {
          const key = l + n, r = relatorio(key);
          if (r && r.painel) return '<article class="sq-vaga sq-vaga-painel"><span class="sq-pos">Posição ' + (n + 1) + '</span><h4>' + e(r.titulo) + '</h4><span class="sq-tag info">Blocos do Painel</span><small>' + e(r.nota) +
            '</small><button class="btn primary" data-sq-previa="' + key + '"' + (!pode('exportar') ? ' disabled' : '') + '>Prévia / imprimir</button><button class="btn ghost" data-sq-editar="' + key + '"' + (!pode('configurar') ? ' disabled' : '') + '>Configurar posição</button></article>';
          return '<article class="sq-vaga"><span class="sq-pos">Posição ' + (n + 1) + '</span>' + (r ? '<h4>' + e(r.titulo) + '</h4><strong class="sq-v">' + e(fmt(r.valor)) + '</strong><span>' + e(r.unidade) +
            '</span><span class="sq-tag ' + r.estado + '">' + e(rotEstado(r)) + '</span><small>' + e(r.nota) + '</small><button class="btn primary" data-sq-previa="' + key + '"' + (!pode('exportar') ? ' disabled' : '') + '>Prévia / imprimir</button>' +
            (r.c.id === 'manual' && pode('lancar') ? '<button class="btn" data-sq-manual="' + key + '">Registrar valor</button>' : '') : '<h4>Vaga livre</h4><p class="small muted">Escolha o indicador desta posição.</p>') +
            '<button class="btn ghost" data-sq-editar="' + key + '"' + (!pode('configurar') ? ' disabled' : '') + '>' + (r ? 'Configurar posição' : '+ Escolher indicador') + '</button></article>';
        }).join('') + '</section>').join('') + '</div>';
  }
  function montar(root) {
    const muda = () => { const d = root.querySelector('#sqDia').value; if (!M.dataValida(d)) return toast('Data inválida.', true);
      UI.dia = d; UI.linha = root.querySelector('#sqLinha').value; UI.turno = root.querySelector('#sqTurno').value; render(); };
    for (const id of ['sqDia', 'sqLinha', 'sqTurno']) root.querySelector('#' + id).onchange = muda;
    root.querySelector('#sqOntem').onclick = () => { UI.dia = U.addDays(U.today(), -1); render(); };
    root.querySelector('#sqP').onchange = ev => run(() => Actions.setSQDCPP(UI.linha, ev.target.value));
    root.querySelector('#sqFontes').onclick = () => carregarFontes(true);
    root.querySelector('#sqCsv').onclick = () => {
      if (!pode('exportar')) return toast('Seu perfil não permite exportar relatórios.', true);
      const cfg = { periodo: 'mes' }, [de, ate] = intervalo(cfg, UI.dia);
      Exporter.csv('SQDCP_Seguranca_QN_' + de + '_' + ate + '.csv', M.tabela(linhas(de, ate)));
    };
    root.querySelectorAll('[data-sq-editar]').forEach(b => b.onclick = () => editar(b.dataset.sqEditar));
    root.querySelectorAll('[data-sq-previa]').forEach(b => b.onclick = () => previa(b.dataset.sqPrevia));
    root.querySelectorAll('[data-sq-manual]').forEach(b => b.onclick = () => registrarManual(b.dataset.sqManual));
    carregarFontes(false);
  }
  function resumoTexto(de, ate, turno) {
    const r = M.resumo(M.linhas(db(), de, ate, 'line_vac', turno || '', Engine, U));
    return 'Segurança: ' + (r.acidente.quantidade == null ? 'não informado' : fmt(r.acidente.quantidade) + ' acidente(s) reportado(s)') +
      ' (' + r.acidente.respondidos + '/' + r.esperados + ' turnos). QN: ' + (r.qn.quantidade == null ? 'não informado' : fmt(r.qn.quantidade)) +
      ' (' + r.qn.respondidos + '/' + r.esperados + ' turnos)' + (r.qn.semNumero ? ' · ' + r.qn.semNumero + ' sem número, contagem provisória' : '') + '.';
  }
  function blocoRelatorio(de, ate, turno) {
    const rows = M.linhas(db(), de, ate, 'line_vac', turno || '', Engine, U);
    const texto = x => !x ? 'Não informado' : x.resposta === 'nao' ? 'Não houve' : 'Sim · ' + x.quantidade + (x.numeros.length ? ' · ' + x.numeros.join(', ') : ' · sem referência');
    return { id: 'sqdcp', l: 'Segurança e QN por turno', w: 'f', html: '<p>' + e(resumoTexto(de, ate, turno)) +
      '</p><div class="tw"><table><thead><tr><th>Dia</th><th>Turno</th><th>Acidente</th><th>QN</th><th>Resumo</th><th>Informado por</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + e(U.brDate(r.dia)) + '</td><td>' + e(r.turno) + '</td><td>' + e(texto(r.acidente)) + '</td><td>' + e(texto(r.qn)) +
        '</td><td>' + e([r.acidente && r.acidente.resumo, r.qn && r.qn.resumo].filter(Boolean).join(' · ')) + '</td><td>' + e(r.informadoPor) + '</td></tr>').join('') +
      '</tbody></table></div>' };
  }
  function demo() {
    if (!vacDemo.ativo || db().sqdcpDemo) return;
    Store.mutate(d => {
      for (const day of d.productionDays) day.shifts.forEach((ps, i) => {
        if (ps.sqdcp) return;
        ps.sqdcp = { acidente: { resposta: i === 0 ? 'sim' : 'nao', quantidade: i === 0 ? 1 : 0,
          numeros: i === 0 ? ['AC-DEMO-001'] : [], resumo: i === 0 ? 'Registro fictício para demonstração' : '' },
        qn: { resposta: i < 2 ? 'sim' : 'nao', quantidade: i < 2 ? 1 : 0, numeros: i < 2 ? ['00004567'] : [],
          resumo: i < 2 ? 'QN fictícia compartilhada entre turnos' : '' }, por: 'Pessoa de demonstração', em: U.nowIso() };
      });
      d.sqdcpDemo = true;
    });
  }
  document.addEventListener('change', ev => {
    const s = ev.target.closest('[data-sq-resp]'); if (!s) return;
    s.closest('.sq-ocorrencias').querySelector('[data-sq-detalhe="' + s.dataset.sqResp + '"]').hidden = s.value !== 'sim';
  });
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-sq-salvar]'); if (!b) return;
    const box = b.closest('.sq-ocorrencias');
    try { const valor = lerFormulario(box); run(() => Actions.setShiftSQDCP(box.dataset.sqDay, box.dataset.sqTurno, valor), 'Segurança e qualidade registradas.'); }
    catch (err) { toast(err.message, true); }
  });
  // A tela do operador exige as duas respostas ao concluir e salva o formulário no mesmo fluxo.
  // O fechamento pela liderança mantém alertas para bases antigas e importações sem esses campos.
  document.addEventListener('click', ev => {
    if (!ev.target.closest('#opDone')) return;
    const box = document.querySelector('.sq-ocorrencias'); if (!box) return;
    try {
      const v = lerFormulario(box);
      if (!v.acidente || !v.qn) throw new Error('Informe se houve acidente e QN antes de concluir o turno.');
      const day = db().productionDays.find(d => d.id === box.dataset.sqDay), ps = day && day.shifts.find(p => p.id === box.dataset.sqTurno);
      if (!ps || JSON.stringify({ acidente: ps.sqdcp && ps.sqdcp.acidente || null, qn: ps.sqdcp && ps.sqdcp.qn || null }) !== JSON.stringify(v))
        Actions.setShiftSQDCP(box.dataset.sqDay, box.dataset.sqTurno, v);
    } catch (err) { ev.preventDefault(); ev.stopImmediatePropagation(); toast(err.message, true); box.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }, true);
  App.views.sqdcp = { render: renderQuadro, mount: montar };
  return { UI, catalogo, formularioTurno, lerFormulario, avisos, validarVaga, linhas, dados, resumo: M.resumo,
    relatorio, folha, htmlImpressao, previa, imprimir, carregarFontes, fontes, resumoTexto, blocoRelatorio, demo };
})();
