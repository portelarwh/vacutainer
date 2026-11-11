// Waste 1.9.0 · KKBC_ORD em grade (layout da controladoria, uma ordem por arquivo), estrutura da amostra real já descaracterizada
// (ferramenta Comparar importação, 11/11/2026). Confere:
//   1) a grade é reconhecida (não cai na grade antiga, que rejeitava tudo por "linha sem ordem");
//   2) ordem pelo campo da tela, ou pelo número no nome do arquivo; sem ordem, a prévia pede a ordem;
//   3) só o grupo Materials vira linha (Labor, Mfg Overhead e Allocated Fixed ficam no resumo da ordem);
//      a linha do produto (entrega, sem grupo) dá o material produzido e a quantidade entregue; subtotais e continuações saem;
//   4) Custo teórico, Custo real, Desv. estrutura, Desv. empregado, Desv. preço de input, Desv. teórico/real e Desv. qtde
//      batem com o subtotal "Materials" da amostra; MUV = estrutura + empregado;
//   5) importa, guarda os campos novos e o aviso de "formato antigo" some para a ordem reimportada.
// Código 1 se falhar.
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const T = a => a.join('\t');
const CAB = ['Planta', 'Planta (Texto)', 'Ordem', 'Origem', 'Material', 'Material (Texto)', 'Custos teór.totais', 'Total custos reais', 'Desvio de estrutura', 'Desvio de qtd.empregada', 'Desvio de preço de input', 'Desvio teórico/real', 'Qtd.teór.total', 'Qtd.real total', 'Qtd.total planejada', 'Desvio qtd.teórico/real', 'Unid.de medida da qtd.produz.', 'Moeda', 'Grupo de elementos', 'Grupo de elementos (Texto)', 'Desvio refugo', 'Desvio residual', 'Desvio residual de input', 'Desvio tamanho lote'];
const it = (orig, mat, desc, cT, cR, dE, dEmp, dP, dT, qT, qR, qP, dQ, un, gcod, gtxt) => T(['1147', 'Planta X', '', orig, mat, desc, cT, cR, dE, dEmp, dP, dT, qT, qR, qP, dQ, un, 'BRL', gcod, gtxt, '0,00', '0,00', '0,00', '0,00']);
const GRADE = [T(CAB),
  T(['1147', 'Planta X', '', '8768/MP204035', '360057', 'TUBO EDTA 4ML', '-273.415,95', '-273.415,95', '0,00', '0,00', '0,00', '0,00', '-1.120.860', '-1.120.860', '-592.380', '0', 'UN', 'BRL', '', '', '0,00', '0,34', '0,00', '0,00']),
  T(['', '', '', '', '', '', '0,00', '-16.822,20', '0,00', '0,00', '0,00', '-16.822,20', '0,000', '0,000', '0,000', '0,000', '', 'BRL', '', '', '0,00', '0,00', '0,00', '0,00']),
  T(['Elemento de custo (Texto)', '', '', '', '', '', '-273.415,95', '-290.238,15', '0,00', '0,00', '', '-16.822,20', '-1.120.860', '-1.120.860', '-592.380', '0', 'UN', 'BRL', '', '', '0,00', '', '', '']),
  T(['', '', '', '62685037/NSOIAY', '', '', '16.277,42', '18.332,09', '0,00', '0,00', '2.054,67', '2.054,67', '11.209', '11.209', '5.924', '0', 'UN', 'BRL', '08', 'Allocated Fixed Ovhd', '0,00', '0,00', '0,00', '0,00']),
  T(['Elemento de custo (Texto) Allocated Fixed Ovhd Allocated Fixed Ovhd', '', '', '', '', '', '16.277,42', '18.332,09', '0,00', '0,00', '', '2.054,67', '11.209', '11.209', '5.924', '0', 'UN', 'BRL', '', '', '0,00', '', '', '']),
  T(['', '', '', '60659166/XVUSIZ', '', '', ' 7.714,56', '12.541,78', '0,00', '-2,20', '4.829,41', '4.827,21', '104,800', '104,771', '55,372', '-0,016', 'HRS', 'BRL', '07', 'Labor Activity', '0,00', '0,00', '0,00', '0,00']),
  it('2783/772325422', '129169163', 'FOLHETO IFU', '1.648,92', '0,00', '-1.648,92', '0,00', '0,00', '-1.648,92', '11.321', '0', '0', '-5.983', 'UN', '01', 'Materials'),
  it('7815/506737018', '449778892', 'IFU NOVO', '0,00', '1.786,03', '1.786,03', '0,00', '0,00', '1.786,03', '0', '11.265', '5.983', '5.953', 'UN', '01', 'Materials'),
  it('4299/6070KON', '9295CIH', 'GEL SEPARADOR', '84.302,03', '71.337,11', '0,00', '-3.813,65', '-9.151,27', '-12.964,92', '1.137.897,072', '1.086.420,954', '590.247,432', '-27.205,381', 'G', '01', 'Materials'),
  it('6773/93568QDG', '18620MVG', 'ROLHA HEMOGARD', '45.347,08', '42.337,03', '0,00', '-1.046,66', '-1.963,40', '-3.010,05', '1.160.090', '1.133.314', '613.113', '-14.151', 'UN', '01', 'Materials'),
  T(['Elemento de custo (Texto) Materials Materials', '', '', '', '', '', '131.298,03', '115.460,17', '137,11', '-4.860,31', '', '-15.837,86', '2.309.308,072', '2.230.999,954', '1.209.343,432', '-41.386,381', 'UN', 'BRL', '', '', '0,00', '', '', '']),
  T(['', '', '', '', '', '', '', '', '', '', '', '', '1.137.897,072', '1.086.420,954', '590.247,432', '-27.205,381', 'G', '', '', '', '', '', '', '']),
  T(['', '', '', '61419917/GHDHYE', '', '', '30.044,33', '60.243,31', '0,00', '-41,37', '30.240,36', '30.198,99', '26,228', '26,192', '13,843', '-0,019', 'HRS', 'BRL', '05', 'Mfg Overhead', '0,00', '0,00', '0,00', '0,00'])].join('\n');
(async () => {
  const b = await chromium.launch(); const pe = [];
  const o = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); o.on('pageerror', e => pe.push(e.message));
  await o.goto('file://' + RAIZ + 'paginas/Perdas-Ordem.html'); await o.waitForTimeout(800);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); localStorage.setItem('vac.user', 'Teste'); enterTest(); showTab('importar'); }); await o.waitForTimeout(600);
  const antes = await o.evaluate(() => { B.imports.push({ id: 'velha', tipo: 'KKBC_ORD', arquivo: 'antiga.txt', data: '2026-10-05T10:00:00Z', usuario: 't', periodos: ['2026-09'], status: 'importado' });
    B.rows.push({ id: 'rv1', imp: 'velha', ordem: '900000001', per: '2026-09', comp: '111', cT: 100, cR: 120, dEstr: 0 }); renderAll(); const S = semEmpregado(); return { sem: S.sem, total: S.total, box: (document.getElementById('reimpBox') || {}).innerText || '' }; });
  ok(antes.total > 0 && antes.sem === antes.total && /formato antigo/.test(antes.box), `base antiga: ${antes.sem} de ${antes.total} ordens sem o Desv. de qtd. empregada, com o aviso de reimportar`);
  // sem ordem: a prévia pede a ordem
  await o.fill('#impPer', '2026-10'); await o.fill('#impOrd', ''); await o.fill('#impTxt', GRADE); await o.click('#btnInterp'); await o.waitForTimeout(500);
  ok(/informe a ordem/i.test(await o.$eval('#impPrev', e => e.innerText)), 'sem ordem na tela nem no arquivo: a prévia pede a ordem');
  // com ordem
  await o.fill('#impOrd', '900814702'); await o.click('#btnInterp'); await o.waitForTimeout(500);
  const P = await o.evaluate(() => { const R = IMP && IMP.R; if (!R) return null; const s = k => +R.recs.reduce((a, r) => a + (r[k] || 0), 0).toFixed(2);
    return { grade: !!R.grade, n: R.recs.length, ords: R.orders.map(x => x.ordem), prod: R.orders[0].prod, qEnt: R.orders[0].qEnt, outros: Object.keys(R.outros['900814702'] || {}).sort().join(','),
      cT: s('cT'), cR: s('cR'), dEstr: s('dEstr'), dEmp: s('dEmp'), dPreco: s('dPreco'), dSap: s('dSap'), comps: R.recs.map(r => r.comp).join(','), gel: R.recs.find(r => r.comp === '9295CIH'), rej: R.rej.length, btn: !!document.querySelector('#btnDoImp') }; });
  ok(P && P.grade && P.ords.join() === '900814702' && P.rej === 0, `grade da controladoria reconhecida, ordem 900814702 pelo campo da tela (${P && P.ords})`);
  ok(P && P.n === 4 && P.comps === '129169163,449778892,9295CIH,18620MVG', `só o grupo Materials vira linha: 4 componentes pela coluna Material (${P && P.comps})`);
  ok(P && P.prod === '360057' && P.qEnt === 1120860, `linha do produto: material produzido 360057 e quantidade entregue 1.120.860 (${P && P.prod} · ${P && P.qEnt})`);
  ok(P && P.outros === 'Allocated Fixed Ovhd,Labor Activity,Mfg Overhead', `outros grupos no resumo da ordem (${P && P.outros})`);
  ok(P && P.cT === 131298.03 && P.cR === 115460.17 && P.dEstr === 137.11 && P.dEmp === -4860.31, `totais iguais ao subtotal "Materials": teórico ${P && P.cT}, real ${P && P.cR}, estrutura ${P && P.dEstr}, empregado ${P && P.dEmp}`);
  ok(P && P.gel && P.gel.dEmp === -3813.65 && P.gel.dPreco === -9151.27 && P.gel.dSap === -12964.92 && P.gel.dQtd === -27205.381 && P.gel.un === 'G', 'componente GEL: empregado, preço de input, teórico/real, desvio de qtde e unidade guardados');
  // MUV = estrutura + empregado (o "scrap" antigo incluía o preço)
  ok(P && Math.abs((P.dEstr + P.dEmp) - (-4723.2)) < 0.01, `MUV da ordem = estrutura + empregado = ${(P.dEstr + P.dEmp).toFixed(2)}`);
  // ordem pelo nome do arquivo
  const F = await o.evaluate(() => { document.getElementById('impOrd').value = ''; return ordemDaGrade({ arquivo: 'KKBC_ORD 000900814703.xlsx' }); });
  ok(F === '900814703' || F === '000900814703', `sem o campo: ordem pelo número no nome do arquivo (${F})`);
  // importar e o aviso some para esta ordem
  await o.fill('#impOrd', '900814702'); await o.click('#btnInterp'); await o.waitForTimeout(400);
  const ck = await o.$('#moedaOk'); if (ck) await ck.check();
  await o.click('#btnDoImp'); await o.waitForTimeout(900);
  const D = await o.evaluate(() => { const rs = vigRows().filter(r => r.ordem === '900814702'); const S = semEmpregado(); const imp = B.imports[B.imports.length - 1];
    return { n: rs.length, emp: rs.every(r => r.dEmp != null), fmt: imp.formato, temNaLista: S.ordens.includes('900814702'), sem: S.sem, total: S.total }; });
  ok(D.n === 4 && D.emp && /grade KKBC_ORD/.test(D.fmt), `importada: 4 linhas com o Desv. empregado; formato "${D.fmt}"`);
  ok(!D.temNaLista && D.sem === D.total - 1, `aviso de formato antigo sem a ordem reimportada (${D.sem} de ${D.total})`);
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
