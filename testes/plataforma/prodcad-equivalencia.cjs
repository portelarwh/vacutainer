// Bloco 3 · Task 2: ProdCad.montar (montador em memória) gera as mesmas tabelas que o CadSync grava hoje a partir do cadastro da
// Administração. O CadSync sai na Task 4; até lá este teste prova que a troca de origem não muda o que o motor lê.
// Dados fictícios. Ignora só os campos de controle (createdAt/By, updatedAt/By, revision) e os ids que o CadSync sorteava
// (versão de turno e meta): o ProdCad os deriva do código e da vigência, e o formato deles é conferido à parte.
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
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' }); const p = await ctx.newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof CadSync !== 'undefined', null, { timeout: 60000 });
    const r = await p.evaluate(C => {
      const TAB = ['lines', 'families', 'machines', 'catalogs', 'downtimeCodes', 'shifts', 'targets'];
      const canon = v => Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
      const limpa = o => { const x = canon(JSON.parse(JSON.stringify(o))); for (const k of ['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'revision']) delete x[k]; return x; };
      const b = Model.emptyBase('t'); for (const k of [...TAB, 'calendar']) b[k] = [];
      CadSync.aplicar(b, JSON.parse(JSON.stringify(C)), () => {});
      const out = { existe: typeof ProdCad !== 'undefined' };
      if (!out.existe) return out;
      const P = ProdCad.montar(JSON.parse(JSON.stringify(C)));
      out.tabelas = {};
      for (const k of TAB) {
        const a = b[k].map(limpa), n = (P[k] || []).map(limpa);
        if (k === 'shifts') for (const l of [a, n]) for (const s of l) for (const v of s.versions) delete v.id;
        if (k === 'targets') for (const l of [a, n]) for (const t of l) delete t.id;
        if (k === 'catalogs') for (const l of [a, n]) for (const c of l) delete c.id;   // o CadSync sorteava o id da 2ª vigência em diante
        out.tabelas[k] = JSON.stringify(a) === JSON.stringify(n) ? 'igual' : { cadSync: a, prodCad: n };
      }
      out.idsVersao = P.shifts.flatMap(s => s.versions.map(v => v.id));
      out.idsMeta = P.targets.map(t => t.id);
      out.idsCat = P.catalogs.map(c => c.id);
      const cal = l => (l || []).map(c => ({ date: c.date, lineId: c.lineId, kind: c.kind, reason: c.reason, reasonType: c.reasonType, origin: c.origin })).sort((x, y) => x.date < y.date ? -1 : 1);
      out.calendario = JSON.stringify(cal(b.calendar)) === JSON.stringify(cal(P.calendar)) ? 'igual' : { cadSync: cal(b.calendar), prodCad: cal(P.calendar) };
      const falta = [], difere = [];
      for (const [k, v] of Object.entries(P.settings || {})) if (JSON.stringify(b.settings[k]) !== JSON.stringify(v)) difere.push(k);
      const base = Model.emptyBase('t').settings;
      for (const k of Object.keys(b.settings)) if (!['cadSync', 'calIgnorados'].includes(k) && JSON.stringify(b.settings[k]) !== JSON.stringify(base[k]) && !(k in (P.settings || {}))) falta.push(k);
      out.settings = { difere, falta, chaves: Object.keys(P.settings || {}).sort() };
      return out;
    }, CADASTRO);
    assert.equal(r.existe, true, 'ProdCad existe');
    for (const [k, v] of Object.entries(r.tabelas)) assert.equal(v, 'igual', 'tabela ' + k + ' igual à do CadSync: ' + JSON.stringify(v).slice(0, 700));
    assert.equal(r.calendario, 'igual', 'marcas de calendário do cadastro: ' + JSON.stringify(r.calendario).slice(0, 400));
    assert.deepEqual(r.settings.difere, [], 'parâmetros derivados iguais aos do CadSync');
    assert.deepEqual(r.settings.falta, [], 'nenhum parâmetro que o CadSync gravava ficou de fora');
    assert.deepEqual(r.idsCat, ['cat_360060', 'cat_360060_2026-01-01', 'cat_360055'], 'ids de catálogo derivados do código e da vigência');
    assert.deepEqual(r.idsVersao, ['sv_t1_2025-01-01_12345', 'sv_t1_2026-01-01_12345', 'sv_t1_2026-01-01_6', 'sv_t2_2025-01-01_123456', 'sv_t3_2025-01-01_12345'], 'ids de versão de turno derivados');
    assert.deepEqual(r.idsMeta, ['tg_oee_vac_2025-01-01', 'tg_oee_vac_2026-01-01'], 'ids de meta derivados');
    assert.deepEqual(erros, []);
    console.log('ok ProdCad.montar equivale ao CadSync (7 tabelas, calendário e parâmetros) com ids derivados do código');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
