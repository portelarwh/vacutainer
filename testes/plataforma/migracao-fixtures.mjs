// Migrador pontual (D02): pasta fictícia no formato da main (91744b5) e carregador do núcleo puro vacMigracao.
// Só dados de teste. Pessoas só com nome: únicas, repetidas (homônimos) e ausentes do cadastro.
import vm from 'node:vm';
import helpers from '../../scripts/html.cjs';

/* Núcleo do bloco ferramenta/migracao, avaliado sem DOM (crypto.subtle do Node). */
/* localStorage de teste: {chave: valor}; `quebrar` faz toda leitura lançar (armazenamento ilegível). */
export function armazenamento(inicial = {}) {
  const m = new Map(Object.entries(inicial)), a = {quebrar: false};
  const ler = () => { if (a.quebrar) throw new DOMException('armazenamento bloqueado', 'SecurityError'); };
  Object.defineProperty(a, 'length', {get() { ler(); return m.size; }});
  return Object.assign(a, {key: i => { ler(); return [...m.keys()][i] ?? null; },
    getItem: k => { ler(); return m.has(k) ? m.get(k) : null; }, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k)});
}

export function carregarMigracao(extra = {}) {
  const bloco = helpers.current().text('ferramenta/migracao');
  const nucleo = bloco.match(/<script id="vacMigracaoNucleo">([\s\S]*?)<\/script>/);
  if (!nucleo) throw new Error('Núcleo vacMigracao ausente do bloco ferramenta/migracao.');
  const ctx = vm.createContext({crypto: globalThis.crypto, TextEncoder, localStorage: 'localStorage' in extra ? extra.localStorage : armazenamento()});
  vm.runInContext(nucleo[1], ctx, {filename: 'ferramenta/migracao'});
  if (!ctx.vacMigracao) throw new Error('O núcleo não definiu vacMigracao.');
  return ctx.vacMigracao;
}

const usuarios = () => [
  {codigo: '1001', nome: 'Ana Líder (TESTE)', perfil: 'LIDER', turno: 'T1', ativo: true, area: 'Produção'},
  {codigo: '1002', nome: 'Bruno Operador (TESTE)', perfil: 'OPER', turno: 'T2', ativo: true, area: 'Produção'},
  {codigo: '1003', nome: 'Carla Souza (TESTE)', perfil: 'TEC', turno: 'T1', ativo: true, area: 'Manutenção'},
  {codigo: '1004', nome: 'Carla  Souza (teste)', perfil: 'OPER', turno: 'T3', ativo: false, area: 'Produção'},
  {codigo: '9001', nome: 'Pessoa de demonstração', perfil: 'ADMIN', ativo: true, area: 'Produção'},
];

function cadastro() {
  return {
    schema: 'vac-cadastros', schemaVersion: 2, rev: 14, revBy: 'Ana Líder (TESTE)', revAt: '2026-11-20T10:00:00Z', appVersion: '1.9.82',
    linhas: [{codigo: 'L1', nome: 'Linha fictícia', ativo: true}],
    familias: [{codigo: 'F1', nome: 'Família fictícia'}],
    catalogos: [
      // gel solto (cadastro antigo): vira uma vigência, com data a decidir pelo responsável
      {codigo: 'cat-a', nome: 'Tubo A (TESTE)', familia: 'F1', linha: 'L1', ativo: true, gel: {gTubo: 0.85, bomG: 9, bomPct: 106}},
      // vigência com g/tubo × % (sem bomKg): convertida pela conta da main
      {codigo: 'cat-b', nome: 'Tubo B (TESTE)', familia: 'F1', linha: 'L1', ativo: true,
        gel: {vig: [{from: '2025-03-01', gTubo: 0.9, bomG: 10, bomPct: 105}]}},
      // já no formato atual: nada a fazer
      {codigo: 'cat-c', nome: 'Tubo C (TESTE)', familia: 'F1', linha: 'L1', ativo: true,
        gel: {vig: [{from: '2025-01-01', gTubo: 0.93, bomKg: 9.8, bomBase: 10000, tol: 6}]}},
      {codigo: 'cat-d', nome: 'Preparação D (TESTE)', familia: 'F1', linha: 'L1', ativo: true},
    ],
    materiais: [], bom: [], equipamentos: [{codigo: 'EQ03', nome: 'Máquina de gel (TESTE)', ativo: true}, {codigo: 'EQ08', nome: 'Spray (TESTE)', ativo: true}],
    turnos: [], paradas: [], parametros: {}, auditoria: [], usuarios: usuarios(), perfis: [],
    gel: {
      formatos: [{de: '2025-01-01', ate: null, embalagemG: 75, sobraBarrilKg: 1.6, tubos: {'100': {tuboG: 4.779, gelG: 0.936, aditivoG: 0.02, tampaRolhaG: 2.3}}}],
      locais: [
        {id: 'L-0001', equipamento: 'EQ03', local: 'Máquina de gel (TESTE)', comp: 'tubogel', ordem: 1, ativo: true, legado: [{e: 'eq-EQ03', d: 'd-gel-1'}]},
        {id: 'L-0002', equipamento: 'EQ08', local: 'Spray (TESTE)', comp: 'spray', ordem: 2, ativo: true, legado: [{e: 'eq-EQ08', d: 'd-spray'}, {e: 'eq-ANT', d: 'd-passo3'}]},
      ],
    },
  };
}

function portal() {
  return {
    schema: 'portal-base', rev: 7, updatedAt: '2026-11-20T10:00:00Z', updatedBy: 'Ana Líder (TESTE)', appVersion: '1.9.82',
    config: {modulos: {oee: {ativo: true}}, avisoDias: 30, notas: {oee: 'Nota fictícia'}, links: [{nome: 'Manual (TESTE)', url: 'manual.pdf'}], filaMin: 5},
    audit: [{t: '2026-11-20T10:00:00Z', u: 'Ana Líder (TESTE)', a: 'config', d: 'avisoDias 30'}],
    exports: {exportsVersion: 1, geradoEm: '2026-11-20T10:00:00Z', acoesReuniao: [], resumo: {}},
    reunioes: {
      '2026-11-19|diaria': {itens: [{id: 'r1', txt: 'Pauta fictícia', decisao: 'Seguir', decEm: '2026-11-19T08:10:00Z', decPor: 'Ana Líder (TESTE)', por: 'Ana Líder (TESTE)', em: '2026-11-19T08:00:00Z',
        acoes: [{id: 'a1', oque: 'Conferir tampa', resp: 'Carla Souza (TESTE)', prazo: '2026-11-22', por: 'Ana Líder (TESTE)', em: '2026-11-19T08:05:00Z'}]}], foto: null},
    },
  };
}

function base(schema, extra) {
  return {schema, schemaVersion: 1, rev: 3, revBy: 'Ana Líder (TESTE)', revAt: '2026-11-20T10:00:00Z', revId: 'r-teste', appVersion: '1.0.0', auditoria: [], ...extra};
}

/* Pasta fictícia {arquivo: conteúdo} no formato gravado pela main. */
export function pastaMain() {
  return {
    'portal-base.json': portal(),
    'vacutainer-cadastros.json': cadastro(),
    'iniciativas-base.json': base('vac-iniciativas', {
      acoes: [
        {id: 'AC-T-0001', titulo: 'Ação fictícia única', status: 'a fazer', responsavel: 'Ana Líder (TESTE)', apoios: ['Bruno Operador (TESTE)'], criadaPor: 'Ana Líder (TESTE)', prazo: '2026-12-01'},
        {id: 'AC-T-0002', titulo: 'Ação fictícia homônima', status: 'a fazer', responsavel: 'Carla Souza (TESTE)', apoios: ['Ninguém Cadastrado'], criadaPor: 'Pessoa Ausente'},
        {id: 'AC-T-0003', titulo: 'Ação com ID gravado', status: 'feita', responsavel: 'Nome Antigo', responsavelId: '1002'},
      ],
      eventos: [{id: 'e1', acao: 'AC-T-0001', tipo: 'criação', de: '', para: 'Ana Líder (TESTE)', em: '2026-11-19T08:00:00Z', por: 'Ana Líder (TESTE)'},
        {id: 'e2', acao: 'AC-T-0001', tipo: 'responsável', de: 'Ana Líder (TESTE)', para: 'Bruno Operador (TESTE)', paraId: '', em: '2026-11-19T09:00:00Z', por: 'Ana Líder (TESTE)'}],
      kas: [],
    }),
    'equipamentos-base.json': base('vac-equipamentos', {
      os: [{id: 'OS-T-0001', equipamento: 'EQ03', titulo: 'OS fictícia', status: 'aberta', responsavel: 'Bruno Operador (TESTE)', criadaPor: 'Carla Souza (TESTE)',
        apontamentos: [{em: '2026-11-19T09:00:00Z', por: 'Pessoa Ausente', txt: 'Apontamento fictício'}]}],
      tags: [], padroes: [], anomalias: [], eventos: [],
    }),
    'linha360-base.json': base('vac-linha360', {
      pontos: [], areas: [], checklists: [], eventos: [],
      postos: [{id: 'P1', nome: 'Posto fictício', pessoas: {T1: 'Ana Líder (TESTE)', T2: 'Carla Souza (TESTE)'}, pessoasIds: {T1: '', T3: '1002'}}],
      feitos: [{id: 'f1', por: 'Bruno Operador (TESTE)', em: '2026-11-19T09:00:00Z'}],
      formularios: [{id: 'FM-1', resp: 'Ana Líder (TESTE)', conf: 'Bruno Operador (TESTE)', emissor: 'Pessoa Ausente', desvio: {resp: 'Ana Líder (TESTE)'}, exec: {por: 'Carla Souza (TESTE)', aval: {}},
        concluidoPor: 'Ana Líder (TESTE)', confirmadoPor: 'Bruno Operador (TESTE)', devolucoes: [{em: '2026-11-19T10:00:00Z', por: 'Bruno Operador (TESTE)'}]}],
      fotos: [{id: 'ft2', tiradaPor: 'Ana Líder (TESTE)'}],
    }),
    'paradas-base.json': base('vac-paradas', {
      eventos: [
        {id: 'EV-1', origem: 'forms', dia: '2026-11-19', turno: 'T1', minutos: 30, equipamento: 'EQ03', codigo: 'FME', tecnicoForms: 'Carla Souza (TESTE)'},
        {id: 'EV-2', origem: 'forms', dia: '2026-11-19', turno: 'T2', minutos: 10, equipamento: 'EQ08', codigo: 'FME', tecnicoForms: 'Bruno Operador (TESTE)'},
      ],
      tecnico: {'EV-1': {componente: 'Rolamento', modo: 'Desgaste', tecnico: 'Ana Líder (TESTE)'}},
      validacao: {}, acoes: [], importacoes: [], config: {},
    }),
    'perdas-base.json': {
      schema: 'perdas-base', appVersion: '1.12.19', rev: 9, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-11-20T10:00:00Z', updatedBy: 'Ana Líder (TESTE)',
      config: {}, imports: [], rows: [], closings: [], audit: [],
      comments: [{id: 'c1', ordem: '100234567', comp: '1034567', texto: 'Comentário fictício', user: 'Ana Líder (TESTE)', data: '2026-11-19T08:00:00Z', ativo: true,
        alteradoPor: 'Bruno Operador (TESTE)', excluidoPor: 'Ana Líder (TESTE)', hist: [{data: '2026-11-19T07:00:00Z', user: 'Bruno Operador (TESTE)'}]}],
      actions: [
        {id: 'w1', ordem: '100234567', comp: '1034567', desc: 'Ação antiga fictícia', causa: 'Embalagem', status: 'em andamento', resp: 'Qualidade', prazo: '2026-11-30', abertura: '2026-11-09', user: 'Ana Líder (TESTE)'},
        {id: 'w2', ordem: '100234568', comp: '1034568', desc: 'Ação antiga de homônimo', causa: 'Processo', status: 'aberta', resp: 'Carla Souza (TESTE)', prazo: '2026-12-05', abertura: '2026-11-10', user: 'Carla Souza (TESTE)'},
      ],
      exclusoes: [{id: 'x1', por: 'Bruno Operador (TESTE)', em: '2026-11-18T10:00:00Z'}],
    },
    'fifo-base.json': {
      version: 2, savedAt: '2026-11-20T10:00:00Z', lps: [], closed: [], events: [], imports: [], config: {}, plan: {}, catalogs: [],
      prodlog: {'2026-11-19': {date: '2026-11-19', orders: [{cat: 'cat-a', t: 1000}], turns: {T1: {t: 1000, x: 0, off: false,
        eq: [{e: 'eq-EQ03', d: 'd-gel-1', kg: 1.2, mots: [], cat: 'cat-a'}, {e: 'eq-EQ08', d: 'L-0002', kg: 0.4, mots: [], cat: 'cat-a'}, {e: 'eq-EQ03', d: 'd-sumiu', kg: 0.2, mots: [], cat: 'cat-a'}]}}}},
    },
    'oee-vacutainer-base.json': {
      databaseVersion: 3, applicationVersion: '2.6.44', baseId: 'oee-teste', productionDays: [{id: 'D1', date: '2026-11-19', shifts: [{id: 'S1',
        gelScrap: {none: false, em: '2026-11-19T15:00:00Z', por: 'Ana Líder (TESTE)', eq: [{e: 'eq-EQ08', d: 'd-spray', cat: 'cat-a', kg: 0.3, nb: 0, mots: []}, {e: 'eq-EQ08', d: 'd-passo3', cat: 'cat-a', kg: 0.1, nb: 0, mots: []}]}}]}],
    },
  };
}
