// Resumo do dia (15/11/2026): vacFicha 'dia' do kit. Clique numa barra de dia → resumo com Produção, Paradas, ordens e lotes, Gel e ações,
// só com os exports (regra 1); navegação para o dia anterior/próximo, ordem e lote; Resumo × Detalhado; busca por data; link #ficha=dia/.
// Também confere a grade de gráficos: disposição aplicada antes da pintura, letra legível num cartão de 1/3 e Ampliar.
// Dados fictícios em pasta simulada (OPFS). node testes/tdia.js → "sem erros"; código 1 se falhar. Prints em testes/saida/dia/
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = require('../scripts/servidor-testes.cjs').server();
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = path.join(RAIZ, 'testes', 'saida', 'dia'); fs.mkdirSync(SAI, { recursive: true });
const D1 = '2030-03-04', D2 = '2030-03-05', D3 = '2030-03-07', O = '100900111';
const BASES = {
  'oee-vacutainer-base.json': { exports: { exportsVersion: 1, geradoEm: '2030-03-08T10:00:00Z',
    porDia: [{ dia: D1, oee: 0.81, oeeMeta: 0.775, boa: 900000, scrap: 4000, metaOp: 880000, status: 'fechado', origem: 'lançado' }, { dia: D2, oee: 0.7, oeeMeta: 0.775, boa: 760000, scrap: 40000, metaOp: 950000, status: 'fechado', origem: 'lançado' }, { dia: D3, oee: 0.79, oeeMeta: 0.775, boa: 910000, scrap: 3000, metaOp: 900000, status: 'em lançamento', origem: 'lançado' }],
    porDiaTurno: [{ dia: D2, turno: 'T1', oee: 0.75, boa: 400000, scrap: 15000, metaOp: 470000, status: 'fechado' }, { dia: D2, turno: 'T2', oee: 0.65, boa: 360000, scrap: 25000, metaOp: 480000, status: 'fechado' }],
    porDiaCatalogo: [{ dia: D2, turno: 'T1', catalogo: '367895', boa: 400000, metaOp: 470000, oee: 0.75, minutos: 510 }],
    trechos: [{ ini: D2 + 'T06:05', fim: D2 + 'T14:20', lote: 'LD5', ordem: O, catalogo: '367895', caixas: 400 }, { ini: D2 + 'T14:40', fim: D2 + 'T22:30', lote: 'LD6', ordem: null, catalogo: '367895', caixas: 360 }],
    trocas: [{ em: D2 + 'T14:30', de: 'LD5', para: 'LD6' }], calendario: [{ dia: D3, tipo: 'extra', motivo: 'Recuperação do plano' }],
    porOrdem: [{ mes: '2030-03', ordem: O, lote: 'LD5', catalogo: '367895', qtd: 500000, produzido: 400000, inicioReal: D2 + 'T06:05', fimReal: D2 + 'T14:20', diasLote: [D2], retrabalhoDias: [] }],
    paradasEventos: [{ id: 'P-9', dia: D2, turno: 'T2', inicio: '20:00', ini: D2 + 'T20:00', minutos: 12, equipamento: 'EQ05', codigo: 'AJU', descricao: 'ajuste', ordem: null }, { id: 'P-1', dia: D2, turno: 'T1', inicio: '07:10', ini: D2 + 'T07:10', minutos: 64, equipamento: 'EQ03', codigo: 'FAL' }] } },
  'paradas-base.json': { exports: { exportsVersion: 1, geradoEm: '2030-03-08T09:00:00Z', porOrdem: [{ ordem: O, eventos: 2, minutos: 91, equipamentos: ['EQ03'], de: D2, ate: D2 }],
    eventos: [{ id: 'e1', dia: D2, turno: 'T1', inicio: '07:10', equipamento: 'EQ03', codigo: 'FAL', minutos: 64, descricao: 'alimentação de tampas', ordem: O, eventoId: 'P-1' }, { id: 'e2', dia: D2, turno: 'T1', inicio: '11:00', equipamento: 'EQ03', codigo: 'TRB', minutos: 27, descricao: 'bandeja', ordem: O },
      { id: 'e3', dia: D2, turno: 'T2', inicio: '16:00', equipamento: 'EQ01', codigo: 'LIM', minutos: 9.5, descricao: 'limpeza' }, { id: 'e4', dia: D1, turno: 'T1', inicio: '08:00', equipamento: 'EQ01', codigo: 'LIM', minutos: 5, descricao: 'limpeza' }] } },
  'fifo-base.json': { exports: { exportsVersion: 1, geradoEm: '2030-03-08 08:00', ordens: [], porDiaGel: [{ dia: D2, tubos: 760000, gelBonsKg: 600, teoKg: 610.5, baixadoKg: 640, barris: 3, scrapKg: { T: 1.5, B: 0.5, P: 0.25 }, desvio: 29.5, indice: 1.048, savingKg: -29.5, fonte: 'Produção' }] } },
  'iniciativas-base.json': { exports: { exportsVersion: 1, geradoEm: '2030-03-08T08:30:00Z', acoes: [{ id: 'AC-1', titulo: 'Trocar guia de tampas', status: 'aberta', responsavel: 'Pessoa Teste', criadaEm: D2 + 'T15:00:00Z', prazo: '2030-03-20', vinculos: [{ tipo: 'ordem', cod: O }] }, { id: 'AC-2', titulo: 'Outra ação', status: 'aberta', criadaEm: '2030-02-01T10:00:00Z', prazo: '2030-04-01' }] } },
};
const CAD = { schema: 'vac-cadastros', rev: 3, catalogos: [{ codigo: '367895', nome: 'Tubo 4 mL', ativo: true }], equipamentos: [{ codigo: 'EQ01', nome: 'Lavadora', ativo: true }, { codigo: 'EQ03', nome: 'Tampadora', ativo: true }] };
const PREP = async ([bases, cad]) => {
  const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
  const b = await d.getDirectoryHandle('00. Bases', { create: true });
  for (const [n, j] of Object.entries(bases)) { const fh = await b.getFileHandle(n, { create: true }); const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close(); }
  localStorage.setItem('vac.cadastros', JSON.stringify(cad)); window.__pasta = d; vacPastaAtual = () => window.__pasta;
};
const bloco = (p, t) => p.evaluate(t => { const s = [...document.querySelectorAll('#vacFicha .vf-bl')].find(x => x.querySelector('h3').textContent.startsWith(t)); return s ? { txt: s.innerText.replace(/\s+/g, ' '), off: s.classList.contains('off') } : null; }, t);
const cab = p => p.evaluate(() => { const a = document.querySelector('#vacFicha .vf-cab'); return a ? a.innerText.replace(/\s+/g, ' ') : ''; });
(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/__modulos__/`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const abre = async (arq, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(U + encodeURI(arq) + hash); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.overlay,.ov').forEach(o => { if (!o.closest('#vacFicha')) o.remove(); })); return p; };
  for (const arq of ['Paradas.html', 'Perdas-Ordem.html', 'Portal.html']) {
    const p = await abre(arq); await p.evaluate(PREP, [BASES, CAD]);
    await p.evaluate(() => localStorage.setItem('vac.ficha.modo', 'res')); await p.evaluate(d => vacFicha.abrir('dia', d), D2); await p.waitForTimeout(800);
    const fr = await p.evaluate(() => { const f = document.querySelector('#vacFicha .vf-frase'); return f ? f.innerText.replace(/\s+/g, ' ') : ''; });
    const pr = await bloco(p, 'Produção'), pa = await bloco(p, 'Paradas'), ol = await bloco(p, 'Ordens e lotes'), ge = await bloco(p, 'Gestão de Gel'), ac = await bloco(p, 'Ações do dia'), c = await cab(p);
    ok(/05\/03\/2030/.test(c) && /terça-feira/.test(c) && /T1 T2/.test(c), `${arq}: cabeçalho com a data, o dia da semana e os turnos`);
    ok(/70,0%/.test(fr) && /abaixo da meta/.test(fr) && /-7,5 p\.p\./.test(fr) && /112,5 min parados em 4 parada/.test(fr) && /EQ03 · Tampadora/.test(fr) && /64 min/.test(fr), `${arq}: frase do dia por extenso (OEE 70,0%, abaixo da meta, −7,5 p.p.; 112,5 min em 4 paradas; a maior na Tampadora)`);
    ok(pr && /760\.000/.test(pr.txt) && /950\.000/.test(pr.txt) && /80,0%/.test(pr.txt) && /40\.000 · 5,00%/.test(pr.txt) && /T1/.test(pr.txt) && /360\.000/.test(pr.txt), `${arq}: Produção = exports (boa 760.000, meta 950.000, atendimento 80,0%, scrap 40.000 · 5,00%, turnos)`);
    ok(pa && /Paradas 4/.test(pa.txt) && /112,5/.test(pa.txt) && /EQ03 · Tampadora 2 91/.test(pa.txt) && !/alimentação de tampas/.test(pa.txt), `${arq}: Paradas somadas sem contar em dobro a que está nas duas páginas (4 paradas, 112,5 min; Tampadora 2 · 91 min); lista só no Detalhado`);
    ok(ol && new RegExp(O).test(ol.txt) && /LD5/.test(ol.txt) && /LD6/.test(ol.txt) && /sem ordem ligada/.test(ol.txt), `${arq}: ordens e lotes do dia (ordem com o lote LD5; LD6 sem ordem ligada)`);
    ok(ge && /610,5 kg/.test(ge.txt) && /640,0 kg/.test(ge.txt) && /2,25 kg/.test(ge.txt), `${arq}: Gel = exports (teórico 610,5 kg, baixado 640,0 kg, scrap 2,25 kg)`);
    ok(ac && /Trocar guia de tampas/.test(ac.txt) && !/Outra ação/.test(ac.txt), `${arq}: só as ações criadas, concluídas ou com prazo no dia`);
    if (arq === 'Paradas.html') {
      await p.screenshot({ path: path.join(SAI, 'resumo.png') });
      await p.click('#vacFicha [data-vf-modo="det"]'); await p.waitForTimeout(200); const pa2 = await bloco(p, 'Paradas'), pr2 = await bloco(p, 'Produção');
      ok(/alimentação de tampas/.test(pa2.txt) && /só na Produção/.test(pa2.txt) && /também na Produção/.test(pa2.txt) && /Por catálogo/.test(pr2.txt) && /14:30 \(LD5 → LD6\)/.test(pr2.txt), 'Detalhado: lista das paradas com a origem, catálogos e troca de lote');
      await p.screenshot({ path: path.join(SAI, 'detalhado.png') });
      await p.click('#vacFicha .vf-nav[data-vac-dia="' + D1 + '"]'); await p.waitForTimeout(200); const c1 = await cab(p), f1 = await p.evaluate(() => document.querySelector('#vacFicha .vf-frase').innerText);
      ok(/04\/03\/2030/.test(c1) && /na meta/.test(f1) && /\+3,5 p\.p\./.test(f1), 'seta ‹ leva ao dia anterior com dados (04/03, na meta, +3,5 p.p.)');
      await p.click('#vacFicha .vf-nav[aria-label^="Próximo"]'); await p.waitForTimeout(150); await p.click('#vacFicha .vf-nav[aria-label^="Próximo"]'); await p.waitForTimeout(200); const c3 = await cab(p), f3 = await p.evaluate(() => document.querySelector('#vacFicha .vf-frase').innerText), pa3 = await bloco(p, 'Paradas');
      ok(/07\/03\/2030/.test(c3) && /extra: Recuperação do plano/.test(f3) && pa3.off && /sem dado não quer dizer zero/.test(pa3.txt), 'seta › pula o dia sem dados (06/03) e chega a 07/03: calendário por escrito; sem parada ≠ zero');
      await p.click('#vacFicha .vf-nav[aria-label^="Dia anterior"]'); await p.waitForTimeout(200); await p.click(`#vacFicha .vf-bl [data-vac-ordem="${O}"]`); await p.waitForTimeout(300);
      ok(/Ordem/.test(await cab(p)) && new RegExp(O).test(await cab(p)), 'do dia para a ficha da ordem com um clique');
      await p.goBack(); await p.waitForTimeout(300); ok(/05\/03\/2030/.test(await cab(p)), '← Voltar retorna ao resumo do dia');
      await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok(await p.evaluate(() => !document.getElementById('vacFicha')), 'Esc fecha');
      const bs = await p.evaluate(() => (Busca.itens('05/03/2030') || []).filter(x => x.tipo === 'Dia').map(x => x.txt + '|' + x.sub)); ok(bs.length === 1 && /05\/03\/2030\|resumo do dia/.test(bs[0]), 'Ctrl K: data digitada oferece o resumo do dia');
    }
    await p.close();
  }
  { const p = await abre('Paradas.html', '#ficha=dia/' + D2); await p.evaluate(PREP, [BASES, CAD]); await p.evaluate(d => vacFicha.abrir('dia', d), D2); await p.waitForTimeout(600); ok(/05\/03\/2030/.test(await cab(p)), 'link #ficha=dia/<data> abre o resumo'); await p.close(); }
  // Linha 360°: a barra do dia abre o resumo (clique e teclado)
  { const p = await abre('Linha-360.html'); const tem = await p.evaluate(() => { try { if (typeof enterTest === 'function') enterTest(); } catch (e) { } return 1; }); await p.waitForTimeout(1200);
    const n = await p.evaluate(() => document.querySelectorAll('#gDia rect[data-vac-dia]').length);
    if (n) { const d = await p.evaluate(() => { const r = [...document.querySelectorAll('#gDia rect[data-vac-dia]')].find(x => +x.getAttribute('height') > 2); r.dispatchEvent(new MouseEvent('click', { bubbles: true })); return r.dataset.vacDia; }); await p.waitForTimeout(500);
      const c = await cab(p); ok(/^Dia/.test(c) && c.includes(d.split('-').reverse().join('/')), `Linha 360°: clicar na barra do dia abre o resumo (${d})`);
      await p.keyboard.press('Escape'); await p.evaluate(() => { const r = document.querySelector('#gDia rect[data-vac-dia]'); r.focus(); }); await p.keyboard.press('Enter'); await p.waitForTimeout(300); ok(/^Dia/.test(await cab(p)), 'Linha 360°: Enter na barra com foco também abre'); await p.screenshot({ path: path.join(SAI, 'linha360.png') });
    } else ok(false, 'Linha 360°: gráfico por dia com barras clicáveis (nenhuma barra encontrada)');
    await p.close(); }
  // grade: letra legível num cartão de 1/3 e Ampliar (Waste em modo teste)
  { const p = await abre('Perdas-Ordem.html'); await p.evaluate(() => { try { enterTest(); } catch (e) { } }); await p.waitForTimeout(2500);
    const r = await p.evaluate(async () => { const med = sv => { const vb = sv.viewBox.baseVal, k = sv.getBoundingClientRect().width / vb.width, f = [...sv.querySelectorAll('text')].map(t => parseFloat(getComputedStyle(t).fontSize) * k).sort((a, b) => a - b); return f[f.length >> 1]; };
      const c = [...document.querySelectorAll('.vg-it')].find(c => c.offsetParent && [...c.querySelectorAll('svg[viewBox]')].some(s => s.viewBox.baseVal.width > 500 && s.querySelector('text'))); if (!c) return null; const sv = () => [...c.querySelectorAll('svg[viewBox]')].find(s => s.viewBox.baseVal.width > 500);
      const antes = med(sv()); c.querySelector('[data-vg="l2"]').click(); await new Promise(r => setTimeout(r, 700)); const terco = med(sv()), rola = sv().parentElement.classList.contains('vg-rola'), semH = document.documentElement.scrollWidth <= innerWidth + 1;
      c.querySelector('[data-vg="amp"]').click(); await new Promise(r => setTimeout(r, 500)); const amp = c.classList.contains('vg-amp'), larg = c.getBoundingClientRect().width; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await new Promise(r => setTimeout(r, 200)); const saiu = !c.classList.contains('vg-amp');
      c.querySelector('[data-vg="l6"]').click(); await new Promise(r => setTimeout(r, 600)); return { antes, terco, rola, semH, amp, larg, saiu, volta: !sv().dataset.vgLeg }; });
    ok(r && r.terco >= 8.5 && r.rola && r.semH, `gráfico num cartão de 1/3: letra continua legível (${r && r.terco.toFixed(1)} px; antes ficava abaixo de 3 px) com rolagem só dentro do cartão`);
    ok(r && r.amp && r.larg > 1300 && r.saiu && r.volta, 'Ampliar põe o cartão na tela inteira, Esc volta, e a largura inteira desfaz a rolagem');
    await p.close(); }
  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.join(' | ') : ''));
  await b.close(); srv.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
