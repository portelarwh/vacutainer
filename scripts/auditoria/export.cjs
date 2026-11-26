const { abrir } = require('./base.cjs');
abrir(async f => {
  const r = await f.evaluate(() => {
    const d = db(), days = d.productionDays.filter(x => !x.deleted); const T = Exporter.tables(days), per = Engine.periodResult(d, days, {});
    const col = (t, nome) => { const h = T[t][0], i = h.indexOf(nome); return T[t].slice(1).map(r => +r[i] || 0); }, soma = a => a.reduce((x, y) => x + y, 0);
    return { dias: days.length, resumoBoa: soma(col('Resumo', 'producao_boa')), turnosBoa: soma(col('Turnos', 'producao_boa')), hhBoa: soma(col('Hora a hora', 'producao_boa')), perBoa: per.good,
      paradasMin: soma(col('Paradas', 'minutos')), perAMin: per.aMin, perDeduct: per.deductMin, turnosDesc: soma(col('Turnos', 'descontado_min')),
      resumoOee: (T['Resumo'].slice(1).map(r => r[T['Resumo'][0].indexOf('oee')])), perOee: per.oee, metaResumo: soma(col('Resumo', 'meta_operacional')), perMeta: per.metaOp,
      cabResumo: T['Resumo'][0].slice(6, 22), abas: Object.keys(T) }; });
  console.log(JSON.stringify(r));
});
