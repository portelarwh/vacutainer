// Migrador pontual (D02): preparação comum dos testes de aplicação (pasta em memória, plano, sessão e opções). Dados fictícios.
import {carregarMigracao, pastaMain, registrarPasta, SESSAO_TESTE} from './migracao-fixtures.mjs';
import {pastaMemoria, carregarRaiz, travasTeste} from './pasta-memoria.mjs';

export const M = carregarMigracao(), vacRaiz = carregarRaiz();
export const CAD = 'vacutainer-cadastros.json', PORTAL = 'portal-base.json', INIC = 'iniciativas-base.json', EQUIP = 'equipamentos-base.json',
  LINHA = 'linha360-base.json', PAR = 'paradas-base.json', PERD = 'perdas-base.json', FIFO = 'fifo-base.json', OEE = 'oee-vacutainer-base.json';
export const ORDEM = [CAD, INIC, EQUIP, LINHA, PAR, PERD, FIFO, OEE, PORTAL];
export const BK = {[CAD]: 'Cadastros', [PORTAL]: 'Portal', [INIC]: 'Iniciativas', [EQUIP]: 'Equipamentos', [LINHA]: 'Linha360', [PAR]: 'Paradas',
  [PERD]: 'Perdas', [FIFO]: 'Gel', [OEE]: 'OEE'};
export const META = {em: '2026-11-25T14:30:00', por: 'Pessoa de demonstração', porId: '9001'};
export const REG = '00. Backups/Migracao/registro-2026-11-25T14-30-00.json';
export const backup = f => '00. Backups/Migracao/' + BK[f] + '/antes-da-migracao-2026-11-25.json';
export const ESC = {__meta: META, ['M2-nenhum|' + PERD + '|actions[0].resp']: 'sem', ['M2-ambiguo|' + PERD + '|actions[1].resp']: {id: '1003'},
  ['M2-ambiguo|' + PERD + '|actions[1].user']: {id: '1003'}, ['M3-data|' + CAD + '|catalogos[0].gel']: {from: '2025-01-01'},
  /* todas as exceções da pasta fictícia decididas: aplicar recusa enquanto houver exceção sem escolha */
  ['M2-ambiguo|' + INIC + '|acoes[1].responsavel']: {id: '1003'}, ['M2-nenhum|' + INIC + '|acoes[1].criadaPor']: 'sem',
  ['M2-nenhum|' + INIC + '|acoes[1].apoios[0]']: 'sem', ['M2-ambiguo|' + EQUIP + '|os[0].criadaPor']: {id: '1003'},
  ['M2-nenhum|' + EQUIP + '|os[0].apontamentos[0].por']: 'sem', ['M2-nenhum|' + LINHA + '|formularios[0].emissor']: 'sem',
  ['M2-ambiguo|' + LINHA + '|formularios[0].exec.por']: {id: '1003'}, ['M2-ambiguo|' + LINHA + '|postos[0].pessoas[T2]']: {id: '1003'},
  ['M4-sem-local|' + FIFO + '|prodlog[2026-11-19].turns[T1].eq[2]']: 'manter'};
export const ASSUNTOS = ['planta', 'produto', 'gel', 'equipamentos', 'turnos', 'paradas', 'pessoas', 'sistema'];
export const assuntos = (f = () => 'editar') => Object.fromEntries(ASSUNTOS.map(a => [a, f(a)]));
/* a mesma sessão gravada no escopo da pasta de teste (migracao-fixtures): o núcleo confere uma com a outra */
export const SESSAO = SESSAO_TESTE;

export function arqsTeste() {
  const a = pastaMain();
  a[CAD].perfis = [{codigo: 'ADMIN', nome: 'Administrador (TESTE)', assuntos: assuntos()},
    {codigo: 'LIDER', nome: 'Líder (TESTE)', assuntos: assuntos(x => x === 'pessoas' ? 'ver' : 'editar')},
    {codigo: 'OPER', nome: 'Operador (TESTE)', assuntos: assuntos(() => 'ver')}];
  return JSON.parse(JSON.stringify(a));
}
export async function montar(arqs = arqsTeste()) {
  const fs = pastaMemoria();
  registrarPasta(fs.raiz);
  for (const [f, c] of Object.entries(arqs)) await fs.gravar('00. Bases/' + f, JSON.stringify(c));
  const plano = JSON.parse(JSON.stringify(await M.planejar(arqs, ESC)));
  return {fs, pasta: vacRaiz(fs.raiz), plano, arqs};
}
export const opcoes = extra => ({escolhas: ESC, sessao: SESSAO, confirmacao: M.CONFIRMACAO, janela: true, travas: travasTeste(), ...extra});
export const lerBase = async (fs, f) => JSON.parse(await fs.ler('00. Bases/' + f));
export const bases = fs => fs.log.filter(x => x.caminho.startsWith('00. Bases/'));
export const hashTexto = t => M.hash(JSON.parse(t));
/* resultados do núcleo (outro realm do vm) em objetos deste realm, para o deepEqual */
export const J = x => x == null ? x : JSON.parse(JSON.stringify(x));
export const aplicar = async (...a) => J(await M.aplicar(...a));
export const retomar = async (...a) => J(await M.retomar(...a));
export const restaurar = async (...a) => J(await M.restaurar(...a));
