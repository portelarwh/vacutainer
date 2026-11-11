// Ferramenta "Comparar importação" (ferramentas/Comparar-importacao.html, 11/11/2026): reconhece as colunas de cada importação como a
// plataforma reconhece hoje, aponta colunas novas e obrigatórias faltando, descaracteriza a amostra (nenhum número longo do original
// sobra) e monta o prompt. Usa as amostras de testes/amostras (MB51, COOIS, CS12) e listas sintéticas (KKBC_ORD, MES, Ações).
// Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const am = f => fs.readFileSync(RAIZ + 'testes/amostras/' + f, 'utf8');
const KKBC = `05.11.2026  Análise
Ordem      900000123  360060
Material   360060 TUBO EDTA TESTE
Quantidade planejada 1.000.000 UN
|Origem   |Material (Texto)  |CstsTeórTo|Tot.CstsRe|Moeda|Coluna Nova|
|1034567  |TAMPA HEMOGARD    |  1.000,00|  1.200,00|BRL  |  7,00|
|1034568  |ROLHA             |    500,00|    450,00-|BRL  |  3,00|
|* Materials|                |  1.500,00|  1.650,00|     |      |`;
const MES = `Time,VAEB01_MES_Catalogo_Atual,VAEB01_MES_Lote_Atual,VAEB01_MES_Caixa_Atual
11/8/2026 12:00:25.000 AM,360057.0000,6299948,0.0
11/9/2026 4:53:06.325 AM,,,1.0
11/9/2026 4:53:31.484 AM,,,2.0`;
const ACOES = 'Ação\tResponsável\tPrazo\tStatus\n"Trocar sensor"\tJoão da Silva\t15/11/2026\tem andamento\nRevisar padrão\tMaria Souza\t20/11/2026\ta fazer';
(async () => {
  const b = await chromium.launch(); const pe = [];
  const o = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); o.on('pageerror', e => pe.push(e.message));
  await o.goto('file://' + RAIZ + 'ferramentas/Comparar-importacao.html'); await o.waitForTimeout(400);
  const rodar = async (tipo, txt, notas) => { await o.selectOption('#tipo', tipo); await o.fill('#txt', txt); if (notas) await o.fill('#notas', notas); await o.waitForTimeout(400);
    return o.evaluate(() => ({ cmp: document.getElementById('cmp').innerText, out: document.getElementById('out').value, seg: document.getElementById('seg').innerText })); };
  // MB51 real (amostra): todas as obrigatórias, sem coluna nova crítica, nenhum número longo original sobra
  let R = await rodar('MB51', am('mb51.txt'));
  ok(/obrigatórias presentes/.test(R.cmp) && /grade \(tab\)/.test(R.cmp), 'MB51: grade (tab) com as obrigatórias');
  ok(/nenhum código de 6\+ caracteres do original/.test(R.seg) && !/900814702|800041210|7109004479/.test(R.out), 'MB51: ordem, material e documento trocados na amostra');
  ok(/"Ordem" → Ordem \(ordem\)/.test(R.out) && /"Data de lançamento" → Data de lançamento/.test(R.out), 'MB51: prompt com o mapa coluna → campo');
  // COOIS
  R = await rodar('COOIS', am('coois.txt'));
  ok(/obrigatórias presentes/.test(R.cmp) && !/900772309|7346946/.test(R.out) && /SOLUCAO|ITEM/.test(R.out), 'COOIS: reconhecida; ordem e lote trocados; descrição com a palavra-chave');
  // CS12 (lista |)
  R = await rodar('CS12', am('cs12din.txt'));
  ok(/lista do SAP/.test(R.cmp) && /obrigatórias presentes/.test(R.cmp) && !/17132AAB/.test(R.out), 'CS12: lista do SAP reconhecida; material do cabeçalho trocado');
  // KKBC_ORD com coluna nova e valores negativos no fim
  R = await rodar('KKBC_ORD', KKBC, 'O SAP passou a trazer a coluna "Coluna Nova".');
  ok(/1 coluna\(s\) nova\(s\)/.test(R.cmp) && /Colunas novas \(não reconhecidas hoje\): "Coluna Nova"/.test(R.out), 'KKBC_ORD: aponta a coluna nova');
  ok(!/900000123|1034567|1034568/.test(R.out) && /\|\* Materials\|/.test(R.out) && /-\|BRL/.test(R.out), 'KKBC_ORD: ordem e componentes trocados; subtotal "* Materials" e sinal no fim mantidos');
  ok(!/1\.000,00\|  1\.200,00/.test(R.out) && /O SAP passou a trazer/.test(R.out), 'KKBC_ORD: valores multiplicados por fator; notas no prompt');
  ok(!/Ordem \(obrigatória\)|faltando: Ordem/.test(R.cmp) && /Lidos fora da tabela/.test(R.cmp), 'KKBC_ORD em lista: a Ordem da linha "Ordem <n>" conta como presente');
  R = await rodar('KKBC_ORD', 'Ordem      900000123  360060\n|Origem   |Material (Texto)  |Valor plan|Valor real|\n|1034567  |TAMPA HEMOGARD    |  1.000,00|  1.200,00|\n|* Materials|                |  1.500,00|  1.650,00|');
  ok(/faltando: Custo meta \(teórico\)/.test(R.cmp) && /candidatas\): Valor plan/.test(R.cmp), 'KKBC_ORD: custo meta faltando, com "Valor plan" como candidata');
  { const m = R.out.match(/\|\d{7}\s*\|ITEM[^|]*\|\s*([\d.,]+)\|\s*([\d.,]+)\|/) || R.out.match(/\|\d{7}\s*\|[^|]*\|\s*([\d.,]+)\|\s*([\d.,]+)\|/); const n = x => +x.replace(/\./g, '').replace(',', '.');
    ok(m && Math.abs(n(m[2]) / n(m[1]) - 1.2) < 0.001, 'KKBC_ORD: coluna de valor não reconhecida usa o mesmo fator dos custos (real ÷ meta = 1,2 mantido)'); }
  // MES (CSV)
  R = await rodar('MES', MES);
  ok(/CSV \(,\)/.test(R.cmp) && /obrigatórias presentes/.test(R.cmp) && !/6299948|360057/.test(R.out) && /11\/9\/2026 4:53:06/.test(R.out) && /,\d{6}\.0000,\d{7},0\.0/.test(R.out), 'MES: CSV reconhecido; catálogo e lote trocados (o .0000 fica); horário mantido');
  // Ações: nomes trocados
  R = await rodar('ACOES', ACOES);
  ok(!/João da Silva|Maria Souza/.test(R.out) && /Pessoa 0/.test(R.out), 'Ações: responsáveis trocados por "Pessoa NN"');
  // obrigatória faltando
  R = await rodar('MB51', 'Ordem\tMaterial\tLote\n900814702\t800041210\t7368012');
  ok(/obrigatória\(s\) faltando: Tipo de movimento, Data de lançamento/.test(R.cmp) && /Obrigatórias que não vieram/.test(R.cmp) && /títulos aceitos hoje: tipo de movimento/.test(R.cmp) && /Obrigatórias que NÃO vieram: Tipo de movimento \(títulos aceitos hoje/.test(R.out), 'MB51 incompleto: mostra quais obrigatórias faltam, com os títulos aceitos (tela e prompt)');
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.join(' | ') : ''));
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
