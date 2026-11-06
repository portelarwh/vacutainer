/* Portal 1.8.2 · Importar › Meta OEE FY27 (planilha fictícia no formato da aba Meta OEE FY27)
   Precisa de: npm i -D playwright xlsx   ·   uso: node testes/tmeta.js */
const RAIZ = require('path').resolve(__dirname, '..') + '/';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const XLSX = require('xlsx');
const XLSX_JS = path.join(path.dirname(require.resolve('xlsx')), 'dist', 'xlsx.full.min.js');
const SAIDA = RAIZ + 'testes/saida/'; fs.mkdirSync(SAIDA, { recursive: true });

/* aba Meta OEE FY27: quadro mensal EDTA e SST (milheiros), quadro explícito EDTA out/26; BASE DE DADOS com PPH FY27 da EDTA */
function planilha(arq, oeeNovEdta = 77.4) {
  const d = s => new Date(s + 'T12:00:00');
  const lin = (oee, pph) => { const h = pph * oee / 100 / 1000, m = h / 2; return [h, m, `${String(+(h * 8 + m).toFixed(3)).replace('.', ',')} (${String(oee).replace('.', ',')}%)`]; };
  const A = [
    ['EDTA'],
    ['Mês', '06:00–14:00', '14:00–14:30', 'Total'],
    [d('2026-10-01'), ...lin(69, 50000)],
    [d('2026-11-01'), ...lin(oeeNovEdta, 50000)],
    [],
    ['SST'],
    ['Mês', '06:00–14:00', '14:00–14:30', 'Total'],
    [d('2026-10-01'), ...lin(70, 72000)],
    [d('2026-11-01'), ...lin(72.5, 72000)],
    [],
    ['EDTA – Outubro/26'],
    ['Horário', 'Meta', ''],
  ];
  const h = 50000 * .69 / 1000;
  for (let i = 0; i < 8; i++) A.push([`${String(6 + i).padStart(2, '0')}:00–${String(7 + i).padStart(2, '0')}:00`, h, '']);
  A.push(['14:00–14:30', h / 2, '']);
  A.push(['Total (69,0%)', '', +(h * 8.5).toFixed(3)]);
  A.push([], ['Comentário: metas aprovadas na reunião']);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Outra aba ignorada']]), 'RELATÓRIO');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(A, { cellDates: true }), 'Meta OEE FY27');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['PPH nominal', 'FY27'], ['EDTA', 'SST'], [50000, null]].map(r => r)), 'BASE DE DADOS');
  /* bloco FY27: "PPH nominal" na linha que menciona FY27; famílias na linha de baixo; valores na seguinte */
  XLSX.writeFile(wb, arq, { bookType: 'xlsx' });
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1100 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dl => dl.accept());
  await p.goto('file://' + RAIZ + 'paginas/Portal.html#geral'); await p.waitForTimeout(600);
  await p.addScriptTag({ path: XLSX_JS });
  await p.evaluate(() => enterTest()); await p.waitForTimeout(400); await p.evaluate(() => Lock.on(Cad.D.seguranca.senhaHash));
  await p.evaluate(() => { location.hash = '#cadastros/importar/metaoee'; }); await p.waitForTimeout(500);
  console.log('modo:', await p.evaluate(() => Cad.ui.imp && Cad.ui.imp.modo), '| botão ativo:', await p.textContent('#iModo .on'));

  const f1 = SAIDA + 'OEE-Vacutainer_v2-teste.xlsx'; planilha(f1);
  await p.setInputFiles('#mofArq', f1); await p.waitForTimeout(600);
  const prev = await p.evaluate(() => { const P = Cad.ui.imp.mof; return { n: P.recs.length, linhas: P.recs.map(r => `${r.fam} ${r.mes} ${r.st} OEE ${r.nv.oeeMetaPct} PPH ${r.nv.pph} (${r.pphSrc}) dia ${r.nv.metaDiaria} quadro ${r.nv.quadro && r.nv.quadro.length} esc ${r.escala}${r.av.concat(r.av2).length ? ' AVISO ' + r.av.concat(r.av2).join(' | ') : ''}`), nao: P.nao }; });
  console.log('prévia:', prev.n, 'registros'); prev.linhas.forEach(l => console.log('  ', l)); console.log('  não reconhecidos:', prev.nao.join(' · '));
  await p.screenshot({ path: SAIDA + 'meta1.png', fullPage: true });
  await p.click('#mofGo'); await p.waitForTimeout(1200);
  const g1 = await p.evaluate(() => (Cad.D.metasOee || []).map(m => `${m.codigo} [${m.familia}] ` + m.vigencias.map(v => `${v.de}→${v.ate || '…'} ${v.oeeMetaPct}% dia ${v.metaDiaria} q${(v.quadro || []).length}`).join(' · ')));
  console.log('gravado:', g1.join(' || '), '| status:', await p.evaluate(() => Cad.status), '| fila:', await p.evaluate(() => Cad.fila.length));
  console.log('validação:', await p.evaluate(() => (Cad.D.metasOee || []).map(m => cadValidaItem ? JSON.stringify(cadValidaItem('metasOee', m)) : '?').join(' ')).catch(e => 'sem cadValidaItem'));

  /* mesma planilha de novo: tudo igual */
  await p.setInputFiles('#mofArq', f1); await p.waitForTimeout(600);
  console.log('reimportar igual:', await p.evaluate(() => Cad.ui.imp.mof.recs.map(r => r.fam + ' ' + r.mes + ' ' + r.st).join(', ')), '| botão:', await p.$('#mofGo') ? 'aparece' : 'não aparece');

  /* EDTA nov com OEE diferente: alterada, desmarcada; marcar e importar */
  const f2 = SAIDA + 'OEE-Vacutainer_v2-teste2.xlsx'; planilha(f2, 78);
  await p.setInputFiles('#mofArq', f2); await p.waitForTimeout(600);
  const alt = await p.evaluate(() => Cad.ui.imp.mof.recs.map((r, i) => ({ i, k: r.fam + ' ' + r.mes, st: r.st, sel: r.sel })));
  console.log('alterada:', JSON.stringify(alt.filter(x => x.st !== 'igual')));
  const ia = alt.find(x => x.st === 'alterada').i; await p.check(`[data-ms="${ia}"]`); await p.waitForTimeout(300);
  await p.fill('#iMot', 'teste: revisão da meta'); await p.click('#mofGo'); await p.waitForTimeout(1200);
  console.log('após substituir:', await p.evaluate(() => { const m = Cad.D.metasOee.find(x => x.familia === 'EDTA'); return m.vigencias.map(v => v.de + ' ' + v.oeeMetaPct).join(' · ') + ' | desativadas: ' + (m.vigenciasDesativadas || []).map(v => v.de + ' ' + v.oeeMetaPct + ' (' + v.motivoDesativacao + ')').join(' · '); }));
  console.log('auditoria:', await p.evaluate(() => Cad.D.auditoria.filter(a => a.tipo === 'metasOee').slice(-3).map(a => `${a.acao} ${a.codigo} ${a.campo || ''} · ${a.origem || ''} · ${a.motivo || ''}`).join(' || ')));

  /* ficha mostra o quadro com horário */
  await p.evaluate(() => { location.hash = '#cadastros/metasOee/OEE-EDTA'; }); await p.waitForTimeout(600);
  console.log('ficha quadro:', (await p.evaluate(() => { const d = [...document.querySelectorAll('details.cd summary')].find(s => /Quadro hora a hora/.test(s.textContent)); return d ? d.parentElement.textContent.replace(/\s+/g, ' ').slice(0, 160) : 'não achei'; })));
  await p.screenshot({ path: SAIDA + 'meta2.png', fullPage: true });
  console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'sem erros'); await b.close();
})();
