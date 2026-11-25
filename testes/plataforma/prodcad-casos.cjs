// Bloco 3 · Task 2 (Review Focus 2 e 3): o que o ProdCad monta respeita a vigência da data do fato. Catálogo com duas vigências
// (PPH diferente) e turno cuja versão antiga continua valendo para os dias antigos. Dados fictícios.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

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

(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  try {
    const p = await (await browser.newContext({ timezoneId: 'America/Sao_Paulo' })).newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Engine !== 'undefined' && typeof ProdCad !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(C => {
      const T = ProdCad.montar(C), cats = T.catalogs.filter(c => c.code === '360060'), t1 = T.shifts.find(s => s.code === 'T1');
      const pphEm = d => { const c = cats.find(x => Engine.catalogValid(x, d)); return c ? c.pph : null; };
      const v = (d, wd) => { const x = Engine.shiftVersionAt(t1, d, wd); return x ? x.start + '-' + x.end : null; };
      return { pph2025: pphEm('2025-06-10'), pph2026: pphEm('2026-03-10'), pph2024: pphEm('2024-06-10'),
        t1Seg2025: v('2025-06-09', 1), t1Seg2026: v('2026-03-09', 1), t1Sab2026: v('2026-03-14', 6), t1Sab2025: v('2025-06-14', 6),
        versoes: t1.versions.map(x => [x.validFrom, x.validTo, x.weekdays.join('')]), idsUnicos: new Set(t1.versions.map(x => x.id)).size === t1.versions.length };
    }, CADASTRO);
    assert.equal(r.pph2025, 100, 'dia de 2025 usa a vigência de 2025 do catálogo');
    assert.equal(r.pph2026, 120, 'dia de 2026 usa a vigência de 2026');
    assert.equal(r.pph2024, null, 'antes da primeira vigência não há catálogo (não vira zero nem pega a vigência de outro ano)');
    assert.equal(r.t1Seg2025, '06:00-14:30', 'turno de segunda em 2025');
    assert.equal(r.t1Seg2026, '06:00-14:30', 'turno de segunda em 2026');
    assert.equal(r.t1Sab2026, '06:00-13:30', 'sábado de 2026 usa a versão própria (1 h a menos)');
    assert.equal(r.t1Sab2025, null, 'sábado de 2025 não tinha turno (a versão de sábado só existe desde 2026)');
    assert.equal(r.idsUnicos, true, 'cada versão de turno tem id próprio');
    assert.deepEqual(erros, []);
    console.log('ok ProdCad: catálogo e turno respeitam a vigência da data do fato (2025, 2026, sábado e antes da 1ª vigência)');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
