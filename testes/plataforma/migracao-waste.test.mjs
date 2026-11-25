// Migrador pontual (D02): M5 (ações do Waste nas Iniciativas) e conferência, com dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarMigracao, pastaMain} from './migracao-fixtures.mjs';

const M = carregarMigracao();
const INIC = 'iniciativas-base.json', PAR = 'paradas-base.json', PERD = 'perdas-base.json';
const json = x => JSON.parse(JSON.stringify(x));
const META = {em: '2026-11-25T12:00:00', por: 'Ana Líder (TESTE)', porId: '1001'};
const plano = (arqs, escolhas) => M.planejar(arqs, {__meta: META, ...escolhas}).then(json);
const aplicado = (arqs, p) => ({...arqs, ...Object.fromEntries(Object.entries(p.alteracoes).map(([a, x]) => [a, x.depois]))});
const exc = (p, tipo) => p.excecoes.filter(e => e.tipo === tipo);
const ANA = 'Ana Líder (TESTE)';
const W1 = 'M2-nenhum|' + PERD + '|actions[0].resp', W2 = 'M2-ambiguo|' + PERD + '|actions[1].resp';
const W2U = 'M2-ambiguo|' + PERD + '|actions[1].user';
const ESC = {[W1]: 'sem', [W2]: {id: '1003'}, [W2U]: {id: '1003'}};

test('M5: cada ação do Waste vira AC-W-<id> igual ao conversor da main', async () => {
  const pasta = pastaMain(), p = await plano(pasta, ESC);
  const d = p.alteracoes[INIC].depois, a = d.acoes.find(x => x.id === 'AC-W-w1');
  assert.deepEqual(a, {
    id: 'AC-W-w1', titulo: 'Ação antiga fictícia', descricao: 'Causa: Embalagem\nComponente: 1034567', status: 'em andamento', prioridade: 'media',
    responsavel: 'Qualidade', responsavelId: '', apoios: [], apoiosIds: [], prazo: '2026-11-30', prazoOriginal: '2026-11-30',
    criadaEm: '2026-11-09T12:00:00', criadaPor: ANA, criadaPorId: '1001', concluidaEm: null, eficacia: null,
    origem: {tipo: 'waste', ref: 'waste|w1', resumo: 'Trazida do Waste em 25/11 12:00 · ordem 100234567 · status lá: em andamento'},
    vinculos: [{tipo: 'ordem', cod: '100234567'}], checklist: [], comentarios: [], evidencias: [],
    legado: {pagina: 'Waste', id: 'w1', status: 'em andamento', causa: 'Embalagem', comp: '1034567', area: null, econ: null, abertura: '2026-11-09', conclusao: null, hist: []},
  });
  const b = d.acoes.find(x => x.id === 'AC-W-w2');
  assert.equal(b.status, 'a fazer');
  assert.equal(b.responsavelId, '1003');
  assert.equal(d.acoes.length, pasta[INIC].acoes.length + 2);
  const ev = d.eventos.filter(e => e.acao === 'AC-W-w1');
  assert.equal(ev.length, 1);
  assert.deepEqual({...ev[0], id: undefined}, {id: undefined, em: META.em, por: META.por, acao: 'AC-W-w1', tipo: 'criação', para: 'em andamento', resp: 'Qualidade'});
  assert.deepEqual(d.importacoes, [{id: 'MIGW-' + META.em, em: META.em, por: META.por, programa: 'waste', nome: 'Ações do Waste (migração)', linhas: 2}]);
  assert.equal(p.itens.M5.length > 0, true);
});

test('M5: status, eficácia, prioridade, concluída, economia e histórico seguem os mapas da main', async () => {
  const pasta = pastaMain();
  pasta[PERD].actions = [{id: 'w9', ordem: '100234569', comp: '1034569', desc: 'x'.repeat(250), causa: 'Gel', area: 'Montagem', econ: 1500, obs: 'Foto no mural', pri: 'alta',
    status: 'encerrada eficaz', resp: '1002', prazo: '2026-10-30T10:00:00', conclusao: '2026-11-02', abertura: '2026-09-01', user: '1001',
    hist: [null, {data: '2026-09-01', user: 'Ana Líder (TESTE)', status: 'aberta', prazo: '2026-10-15'}, {data: '2026-10-10', status: 'planejada', prazo: '2026-10-30'}]},
  {id: 'w8', desc: 'Sem datas', status: 'cancelada', resp: '', pri: 'média', abertura: 'ontem'},
  {id: 'w7', desc: 'Acompanhamento', status: 'eficácia em acompanhamento', resp: '', conclusao: 'x'},
  {id: 'w6', desc: 'Sem eficácia', status: 'encerrada sem eficácia', resp: ''}];
  const p = await plano(pasta);
  const A = id => p.alteracoes[INIC].depois.acoes.find(x => x.id === 'AC-W-' + id);
  const a = A('w9');
  assert.equal(a.titulo.length, 200);
  assert.equal(a.descricao, 'Causa: Gel\nComponente: 1034569\nÁrea: Montagem\nEconomia estimada: R$ 1.500/mês\nEvidência / observação: Foto no mural');
  assert.deepEqual([a.status, a.eficacia, a.prioridade], ['concluída', 'eficaz', 'alta']);
  assert.equal(a.prazo, '2026-10-30');
  assert.equal(a.prazoOriginal, '2026-10-15');
  assert.equal(a.concluidaEm, '2026-11-02T12:00:00');
  assert.deepEqual([a.responsavelId, a.criadaPorId], ['1002', '1001']);
  assert.deepEqual(a.legado.hist, [{data: '2026-09-01', user: 'Ana Líder (TESTE)', status: 'aberta', prazo: '2026-10-15'}, {data: '2026-10-10', user: null, status: 'planejada', prazo: '2026-10-30'}]);
  assert.equal(a.legado.econ, 1500);
  const c = A('w8');
  assert.deepEqual([c.status, c.eficacia, c.prioridade, c.prazo, c.prazoOriginal, c.concluidaEm, c.criadaEm, c.vinculos], ['cancelada', null, 'media', null, null, null, META.em, []]);
  assert.equal(c.titulo, 'Sem datas');
  assert.equal(A('w7').eficacia, 'acompanhamento');
  assert.equal(A('w7').concluidaEm, META.em);
  assert.equal(A('w6').eficacia, 'sem');
  assert.equal(A('w6').origem.resumo, 'Trazida do Waste em 25/11 12:00 · status lá: encerrada sem eficácia');
  assert.equal(p.alteracoes[INIC].depois.importacoes[0].linhas, 4);
});

test('M5: responsável ambíguo ou ausente vira exceção e a ação espera a decisão', async () => {
  const p = await plano(pastaMain());
  assert.ok(exc(p, 'M2-nenhum').some(e => e.id === W1));
  assert.ok(exc(p, 'M2-ambiguo').some(e => e.id === W2 && e.candidatos.length === 2));
  const a = (p.alteracoes[INIC] || {depois: {acoes: []}}).depois.acoes;
  assert.equal(a.some(x => x.id === 'AC-W-w1' || x.id === 'AC-W-w2'), false);
  const r = await plano(pastaMain(), {[W1]: 'sem'});
  assert.equal(r.alteracoes[INIC].depois.acoes.some(x => x.id === 'AC-W-w1'), true);
  assert.equal(r.alteracoes[INIC].depois.acoes.some(x => x.id === 'AC-W-w2'), false);
  assert.equal(r.alteracoes[INIC].depois.importacoes[0].linhas, 1);
});

test('M5: ação já migrada (id ou origem.ref) é pulada', async () => {
  const pasta = pastaMain();
  pasta[INIC].acoes.push({id: 'AC-W-w1', titulo: 'Já trazida', origem: {tipo: 'waste', ref: 'waste|w1'}});
  pasta[INIC].acoes.push({id: 'AC-X-1', titulo: 'Por ref', origem: {tipo: 'waste', ref: 'waste|w2'}});
  const p = await plano(pasta, ESC);
  assert.equal(((p.alteracoes[INIC] || {depois: {}}).depois.importacoes || []).length, 0);
  assert.equal(p.itens.M5.length, 0);
  assert.equal(exc(p, 'M2-ambiguo').some(e => e.id === W2), false);
});

test('M5: o perdas-base.json não é alterado; as ações originais ficam no Waste', async () => {
  const pasta = pastaMain(), antes = JSON.stringify(pasta[PERD]);
  const p = await plano(pasta, ESC);
  assert.equal(((p.alteracoes[PERD] || {itens: []}).itens).some(i => i.item === 'M5'), false, 'só o M2 mexe nos comentários do Waste');
  assert.deepEqual(json(p.alteracoes[PERD].depois.actions), json(pasta[PERD].actions));
  assert.equal(JSON.stringify(pasta[PERD]), antes);
  assert.ok(p.itens.M5.every(i => i.arquivo === INIC));
});

test('M5: idempotência, sem relógio e sem a base das Iniciativas', async () => {
  const pasta = pastaMain(), p = await plano(pasta, ESC), de_novo = await plano(aplicado(pasta, p), ESC);
  assert.deepEqual(de_novo.itens.M5, []);
  assert.equal(de_novo.alteracoes[INIC], undefined);
  const sem = await M.planejar(pasta, ESC).then(json);
  assert.equal(exc(sem, 'M5-meta').length, 1);
  assert.equal(sem.itens.M5.length, 0);
  const s2 = pastaMain();
  delete s2[INIC];
  const q = await plano(s2, ESC);
  assert.equal(exc(q, 'M5-estrutura').length, 1);
});

test('conferirM5: compara título, status mapeado, prazo e responsável com a cópia', async () => {
  const pasta = pastaMain(), p = await plano(pasta, ESC), inic = p.alteracoes[INIC].depois;
  assert.deepEqual(json(M.conferirM5(pasta[PERD], inic)), {ok: true, faltam: [], divergentes: []});
  assert.deepEqual(json(M.conferirM5(pasta[PERD], pasta[INIC])).faltam, ['w1', 'w2']);
  const mexido = json(inic);
  const a = mexido.acoes.find(x => x.id === 'AC-W-w1');
  a.titulo = 'Outro'; a.prazo = '2027-01-01';
  mexido.acoes = mexido.acoes.filter(x => x.id !== 'AC-W-w2');
  const r = json(M.conferirM5(pasta[PERD], mexido));
  assert.equal(r.ok, false);
  assert.deepEqual(r.faltam, ['w2']);
  assert.deepEqual(r.divergentes.map(d => [d.id, d.campos.map(c => c.campo).sort()]), [['w1', ['prazo', 'titulo']]]);
  assert.deepEqual(json(M.conferirM5({actions: []}, {acoes: []})), {ok: true, faltam: [], divergentes: []});
});

test('auditoria: alteracoes[].itens[].de guarda o valor original (o documento depois é cópia)', async () => {
  const pasta = pastaMain();
  pasta[PAR].eventos[1].tecnicoForms = 'Ana Líder (TESTE)';
  pasta[PAR].tecnico['EV-2'] = {codigoValidado: 'FME'};
  const antes = json(pasta);
  const p = await plano(pasta, ESC);
  assert.deepEqual(json(pasta), antes, 'a entrada não muda');
  const it = p.alteracoes[PAR].itens.find(i => i.item === 'M2b');
  assert.deepEqual(it.de, {codigoValidado: 'FME'});
  assert.notDeepEqual(it.de, it.para);
  const m2 = p.alteracoes[INIC].itens.find(i => i.caminho === 'acoes[0].responsavelId');
  assert.equal(m2.de, null);
  assert.equal(m2.para, '1001');
});

test('M2b: tecnico{} com tecnico ou tecnicoId fica intocado; valor que não é objeto vira exceção', async () => {
  for (const atual of [{tecnico: 'Nome já gravado'}, {tecnicoId: '1002'}]) {
    const pasta = pastaMain();
    pasta[PAR].eventos[1].tecnicoForms = 'Ana Líder (TESTE)';
    pasta[PAR].tecnico['EV-2'] = atual;
    const p = await plano(pasta, ESC);
    assert.deepEqual(p.alteracoes[PAR].depois.tecnico['EV-2'], atual);
    assert.equal(p.itens.M2b.length, 0);
  }
  for (const atual of [null, 0, '', false, 'texto', [1]]) {
    const pasta = pastaMain();
    pasta[PAR].eventos[1].tecnicoForms = 'Ana Líder (TESTE)';
    pasta[PAR].tecnico['EV-2'] = atual;
    const p = await plano(pasta, ESC), alt = p.alteracoes[PAR];
    assert.deepEqual(json(alt ? alt.depois : pasta[PAR]).tecnico['EV-2'], atual === undefined ? undefined : json(atual), String(atual));
    assert.equal(p.itens.M2b.length, 0, String(atual));
    assert.ok(exc(p, 'M2-estrutura').some(e => e.arquivo === PAR && e.caminho === 'tecnico[EV-2]'), String(atual));
  }
});
