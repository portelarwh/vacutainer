// Produção 2.4.63 · relatório diário do MES (regra do usuário, 12/11/2026). Dados fictícios.
// O MES exporta as últimas 24 h. A 1ª linha (00:00:01) traz o catálogo, o lote e a caixa da última linha do relatório anterior:
//  - caixa 0: linha preparada sem produção no dia anterior; catálogo e lote valem para a caixa 1 (regra da 2.4.35);
//  - caixa > 0: é a última caixa do relatório anterior; não conta de novo e o horário dela é ignorado; a contagem começa na 2ª linha.
// Confere também: troca de lote (linha só com o lote, contador volta a 1), linha "(null)" seguida da releitura completa, lote trocado
// e destrocado sem caixas no meio, e a soma de quatro dias seguidos igual ao contador do MES. Código 1 se falhar.
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright'); const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const CAB = 'Time,VAEB01_MES_Catalogo_Atual,VAEB01_MES_Lote_Atual,VAEB01_MES_Caixa_Atual';
const p2 = n => String(n).padStart(2, '0');
const hora = (d, min) => { const h = Math.floor(min / 60), m = min % 60, s = (min * 7) % 60, ap = h < 12 ? 'AM' : 'PM', h12 = h % 12 || 12; return `11/${d}/2030 ${h12}:${p2(m)}:${p2(s)}.000 ${ap}`; };
// dia 1: começa em 0 (sem produção antes), lote A caixas 1–40; troca para B às 15:00, caixas 1–12
const d1 = [CAB, `11/1/2030 12:00:01.000 AM,900001.000,1000001.000,0.0`];
for (let i = 1; i <= 40; i++) d1.push(`${hora(1, 300 + i * 10)},,,${i}.0`);
d1.push(`${hora(1, 900)},,1000002.000,`); for (let i = 1; i <= 12; i++) d1.push(`${hora(1, 910 + i * 10)},,,${i}.0`);
// dia 2: 1ª linha repete B · 12; caixas 13–30; "(null)" e releitura completa da caixa 20; lote trocado para A e de volta para B sem caixas
const d2 = [CAB, `11/2/2030 12:00:01.000 AM,900001.000,1000002.000,12.0`];
for (let i = 13; i <= 30; i++) { d2.push(`${hora(2, 300 + i * 10)},,,${i}.0`); if (i === 20) { d2.push(`${hora(2, 300 + i * 10 + 2)},(null),(null),(null)`); d2.push(`${hora(2, 300 + i * 10 + 3)},900001.000,1000002.000,20.0`); } if (i === 25) { d2.push(`${hora(2, 300 + i * 10 + 2)},,1000001.000,`); d2.push(`${hora(2, 300 + i * 10 + 4)},,1000002.000,`); } }
// dia 3: 1ª linha repete B · 30; caixas 31–35; troca para C (contador volta a 1), caixas 1–20
const d3 = [CAB, `11/3/2030 12:00:01.000 AM,900001.000,1000002.000,30.0`];
for (let i = 31; i <= 35; i++) d3.push(`${hora(3, 300 + i * 2)},,,${i}.0`);
d3.push(`${hora(3, 500)},,1000003.000,`); for (let i = 1; i <= 20; i++) d3.push(`${hora(3, 510 + i * 10)},,,${i}.0`);
// dia 4: 1ª linha repete C · 20; nenhuma caixa nova (linha parada o dia todo)
const d4 = [CAB, `11/4/2030 12:00:01.000 AM,900001.000,1000003.000,20.0`];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(F => { const S = ServerData, store = S.emptyStore(), out = [];
    for (const txt of F) { const an = S.analyze(S.parseCsv(txt)); out.push({ boxes: an.boxes, carry: an.carry, zeros: an.zeros, snaps: an.snaps, jumps: an.jumps.length, gaps: an.gaps.filter(g => /T00:0/.test(g.from)).length, segs: an.segments.map(s => ({ lot: s.lot, cat: s.cat, b0: s.b0, b1: s.b1, n: s.n, t0: s.t0 })) }); S.merge(store, an, 'VAC'); }
    const porLote = {}; for (const s of store.segments) porLote[s.lot] = (porLote[s.lot] || 0) + s.n;
    return { out, porLote, primeira: store.segments.map(s => s.t0).filter(t => /T00:00/.test(t)).length };
  }, [d1, d2, d3, d4].map(x => x.join('\n')));
  const [o1, o2, o3, o4] = r.out;
  ok(o1.zeros === 1 && !o1.carry && o1.boxes === 52 && o1.segs[0].b0 === 1 && o1.segs[0].lot === '1000001' && o1.segs[0].cat === '900001', 'dia 1: começa em 0; catálogo e lote valem para a caixa 1 (52 caixas: 40 do lote A + 12 do B)');
  ok(o1.segs[1] && o1.segs[1].lot === '1000002' && o1.segs[1].b0 === 1, 'troca de lote: linha só com o lote, contador volta a 1 no lote novo');
  ok(o2.carry && o2.carry.box === 12 && o2.carry.lot === '1000002' && o2.boxes === 18 && o2.segs[0].b0 === 13 && !/T00:00/.test(o2.segs[0].t0), `dia 2: 1ª linha (lote B · caixa 12) não conta de novo; a contagem começa na caixa 13, no horário dela (${o2.boxes} caixas)`);
  ok(o2.snaps === 1 && o2.jumps === 0 && o2.segs.length === 1, 'linha "(null)" com releitura completa da mesma caixa e lote trocado e destrocado sem caixas: nada contado em dobro nem trecho novo');
  ok(o3.carry && o3.carry.box === 30 && o3.boxes === 25 && o3.segs[0].b0 === 31 && o3.segs[1].lot === '1000003' && o3.segs[1].b0 === 1, 'dia 3: começa na caixa 31 e troca para o lote C na caixa 1');
  ok(o4.carry && o4.carry.box === 20 && o4.boxes === 0 && o4.segs.length === 0, 'dia 4: só a 1ª linha (linha parada): nenhuma caixa e nenhum trecho');
  ok(r.porLote['1000001'] === 40 && r.porLote['1000002'] === 35 && r.porLote['1000003'] === 20, `quatro dias somados = contador do MES em cada lote (A ${r.porLote['1000001']}, B ${r.porLote['1000002']}, C ${r.porLote['1000003']})`);
  ok(r.primeira === 0 && o2.gaps + o3.gaps + o4.gaps === 0, 'nenhum trecho começando às 00:00 e nenhuma lacuna criada pela 1ª linha');
  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
