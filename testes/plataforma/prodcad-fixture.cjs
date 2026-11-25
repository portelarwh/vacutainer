// Cadastro fictício da Administração usado pelos testes do ProdCad (bloco 3). Só dados inventados.
const CADASTRO = {
  rev: 7, revId: 'r-teste',
  linhas: [{ codigo: 'VAC', nome: 'Linha Vacutainer', unidade: 'Unidade Fictícia', setor: 'Setor Fictício', ativo: true }],
  familias: [{ codigo: 'EDTA', nome: 'EDTA', cor: '#7b5ea7', ativo: true }, { codigo: 'SST', nome: 'SST', cor: '#c08a1e', ativo: true }],
  equipamentos: [
    { codigo: 'LINHA', nome: 'Saída da linha', linha: 'VAC', papel: 'oee', ativo: true },
    { codigo: 'EQ01', nome: 'Máquina Um', linha: 'VAC', papel: 'equipamento', ativo: true },
    { codigo: 'EQ02', nome: 'Máquina Dois', linha: 'VAC', papel: 'equipamento', ativo: false }],
  catalogos: [
    { codigo: '360060', nome: 'Tubo A', familia: 'SST', linha: 'VAC', cor: '#2f6db5', ativo: true,
      vigencias: [{ de: '2025-01-01', ate: '2025-12-31', pphNominal: 100 }, { de: '2026-01-01', ate: null, pphNominal: 120 }], vigenciasDesativadas: [{ de: '2024-01-01' }] },
    { codigo: '360055', nome: 'Tubo B', familia: 'EDTA', linha: 'VAC', ativo: true, vigencias: [{ de: '2025-01-01', pphNominal: 90 }] },
    { codigo: '80004', nome: 'Aditivo', tipoItem: 'preparacao', ativo: true, vigencias: [{ de: '2025-01-01', pphNominal: 1 }] }],
  paradas: [
    { codigo: 'REF', nome: 'Refeição', categoria: 'Planejada', subcategoria: 'Pausa', cor: '#8d99a6', planejada: true, descontaPlanejado: true, relatorio: true, pareto: false, duracaoManual: true, ativo: true, guia: { descricao: 'Pausa de refeição' } },
    { codigo: 'FME', nome: 'Falha mecânica', categoria: 'Quebra', subcategoria: 'Mecânica', cor: '#c22a2a', afetaD: true, exigeObservacao: true, exigeHorario: true, ativo: true }],
  turnos: [
    { codigo: 'T1', nome: '1º Turno', linha: 'VAC', cor: '#2f6db5', ativo: true, vigencias: [
      { de: '2025-01-01', ate: '2025-12-31', inicio: '06:00', fim: '14:30', dias: [1, 2, 3, 4, 5], pausas: [{ nome: 'Refeição', codigo: 'REF', inicio: '10:00', fim: '10:30', dias: [1, 2, 3, 4, 5], desconta: true }], regraPedacoFinal: 20, intervalos: [{ inicio: '06:00', fim: '07:00' }, { inicio: '07:00', fim: '08:00' }] },
      { de: '2026-01-01', inicio: '06:00', fim: '14:30', dias: [1, 2, 3, 4, 5] },
      { de: '2026-01-01', inicio: '06:00', fim: '13:30', dias: [6] }] },
    { codigo: 'T2', nome: '2º Turno', linha: 'VAC', cor: '#3a8f5c', ativo: true, vigencias: [{ de: '2025-01-01', inicio: '14:30', fim: '22:47', dias: [1, 2, 3, 4, 5, 6], naoProdutivo: true }] },
    { codigo: 'T3', nome: '3º Turno', linha: 'VAC', ativo: false, vigencias: [{ de: '2025-01-01', inicio: '22:47', fim: '30:00', dias: [1, 2, 3, 4, 5] }] }],
  metasOee: [{ codigo: 'OEE-VAC', ativo: true, linha: 'VAC', equipamento: 'LINHA', observacao: 'meta fictícia', vigencias: [
    { de: '2025-01-01', ate: '2025-12-31', oeeMetaPct: 70, metaDiaria: 800, semaforoVerdePct: 90, semaforoAmareloPct: 75, coberturaMinPct: 95, divergenciaMaxPct: 5 },
    { de: '2026-01-01', oeeMetaPct: 75, pph: 110, quadro: [{ inicio: '06:00', fim: '07:00', valor: 100 }] }] }],
  parametros: { paradaLongaMin: 15, semaforoVerdePct: 90, semaforoAmareloPct: 75, motivosAbono: ['Treinamento'], motivosSemProducaoProg: ['Feriado'], motivosSemProducaoNP: ['Parada geral'],
    producao: { unidadeLancamento: 1000, rotuloUnidade: 'milheiro', continuidadeMin: 30, arredondamentoMeta: [{ de: '2025-01-01', valor: 1000 }, { de: '2026-06-01', valor: 500 }] } },
  calendario: [{ codigo: '2026-12-25', tipo: 'sem produção', nome: 'Natal', ativo: true }, { codigo: '2026-12-26', tipo: 'dia extra', nome: 'Reposição', ativo: true }, { codigo: '2026-12-27', tipo: 'sem produção', nome: 'Inativo', ativo: false }],
};
module.exports = { CADASTRO: { schema: 'vac-cadastros', schemaVersion: 2, ...CADASTRO } };
