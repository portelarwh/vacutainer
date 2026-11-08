// E5 do plano único (08/11/2026): ficha da ordem/lote/LP, busca Ctrl K por índice, link #ficha=, cópia sem pasta, ← Voltar.
// Pasta simulada (OPFS) com os exports das 5 páginas em "00. Bases", páginas por HTTP local. A ficha só mostra o exports (regra 1).
// node testes/tficha.js → "sem erros"; código 1 se falhar. Prints em testes/saida/ficha/
const path = require('path'), fs = require('fs'), http = require('http'); const RAIZ = path.resolve(__dirname, '..');
const { chromium } = require('playwright');
const srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const SAI = path.join(RAIZ, 'testes', 'saida', 'ficha'); fs.mkdirSync(SAI, { recursive: true });
const PAGS = { oee: 'OEE-Vacutainer.html', perdas: 'Perdas-Ordem.html', gel: 'Gestão-Gel-Vacutainer.html', paradas: 'Paradas.html', portal: 'Portal.html' };
const O = '100234567';
const BASES = {
  'oee-vacutainer-base.json': { exports: { exportsVersion: 1, geradoEm: '2026-11-08T14:02:00Z', porOrdemCobertura: { de: '2024-12', ate: '2026-11', meses: 24 },
    porOrdem: [{ mes: '2026-10', ordem: O, lote: 'LX1', catalogo: '367895', qtd: 120000, produzido: 112480, inicioReal: '2026-10-28T06:10', fimReal: '2026-11-02T21:40', diasLote: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'], retrabalhoDias: ['2026-11-01'] },
      { mes: '2026-11', ordem: '100234890', lote: 'LX10', catalogo: '367886', qtd: 50000, produzido: 50000, inicioReal: '2026-11-05T06:00', fimReal: '2026-11-07T22:00', diasLote: ['2026-11-05'], retrabalhoDias: [] },
      { mes: '2025-01', ordem: '100100100', lote: 'KA7', catalogo: '367895', qtd: 10000, produzido: 9000, inicioReal: '2025-01-10T06:00', fimReal: '2025-01-11T06:00', diasLote: [], retrabalhoDias: [] }],
    lotes: [{ lote: 'LX1', catalogo: '367895', pecas: 112000, inicio: '2026-10-28T06:10', fim: '2026-11-02T21:40', situacao: 'normal', retrabalhoDias: ['2026-11-01'], obs: '' }] } },
  'ordens-base.json': { exports: { exportsVersion: 1, geradoEm: '2026-11-08T13:00:00Z', porOrdem: [{ ordem: '000' + O, competencia: '2026-10', dataPrincipal: '2026-11-02', status: 'encerrada', materiais: ['367895', '50012'], lotes: ['LX1'], pendencias: [], coois: { tipo: 'ZP01', dIni: '2026-10-28', dFim: '2026-11-02' } }] } },
  'perdas-base.json': { exports: { exportsVersion: 1, geradoEm: '2026-11-08T12:00:00Z', porOrdem: [
    { ordem: O, per: '2026-10', catalogo: '367895', lote: 'LX1', custoMeta: 50000, custoReal: 53000, desvio: 2500, perda: 3000, nivel: 'atenção', causa: 'Tampa', comentarios: 2, acoesAbertas: 1 },
    { ordem: O, per: '2026-11', catalogo: '367895', lote: 'LX1', custoMeta: 30000, custoReal: 31812, desvio: 1000, perda: 1812, nivel: 'crítico', causa: 'Tampa', comentarios: 1, acoesAbertas: 0 }] } },
  'fifo-base.json': { exports: { exportsVersion: 1, geradoEm: '2026-11-08 11:00', ordensCobertura: { desde: '2026-06-11', dias: 150 },
    ordens: [{ ordem: '100234890', lote: 'LX10', catalogo: '367886', inicio: '2026-11-05', fim: '2026-11-07', consumoKg: 41.25, gPorTubo: 0.825, metaG: 0.8, scrapKg: 1.2, lps: ['LP777', 'LP778'], fonte: 'PCP + SAP' }] } },
  'paradas-base.json': { exports: { exportsVersion: 1, geradoEm: '2026-11-08T13:40:00Z', porOrdem: [{ ordem: O, eventos: 14, minutos: 386, equipamentos: ['EQ03', 'EQ05'], de: '2026-10-28', ate: '2026-11-02' }],
    eventos: [{ id: 'e1', dia: '2026-10-29', turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 64, descricao: 'alimentação de tampas', ordem: O }, { id: 'e2', dia: '2026-10-30', turno: 'T2', equipamento: 'EQ05', codigo: 'TRB', minutos: 27, descricao: 'bandeja', ordem: O }, { id: 'e3', dia: '2026-10-30', turno: 'T2', equipamento: 'EQ01', minutos: 5, ordem: '' }] } }
};
const CAD = { schema: 'vac-cadastros', rev: 7, catalogos: [{ codigo: '367895', nome: 'Tubo 4 mL K2EDTA', ativo: true }], equipamentos: [{ codigo: 'EQ01', nome: 'Lavadora', apelidos: ['LX1 lavadora'], ativo: true }, { codigo: 'EQ03', nome: 'Tampadora', ativo: true }] };

// prepara a pasta simulada (OPFS) e faz a ficha da página ler dela
const PREP = async ([bases, cad]) => {
  const d = await navigator.storage.getDirectory(); for await (const [n] of d.entries()) await d.removeEntry(n, { recursive: true });
  const b = await d.getDirectoryHandle('00. Bases', { create: true });
  for (const [n, j] of Object.entries(bases)) { const fh = await b.getFileHandle(n, { create: true }); const w = await fh.createWritable(); await w.write(JSON.stringify(j)); await w.close(); }
  localStorage.setItem('vac.cadastros', JSON.stringify(cad)); window.__pasta = d; vacPastaAtual = () => window.__pasta;
};
const texto = p => p.evaluate(() => { const a = document.querySelector('#vacFicha .vficha'); return a ? a.innerText.replace(/\s+/g, ' ') : ''; });
const blocoTxt = (p, t) => p.evaluate(t => { const s = [...document.querySelectorAll('#vacFicha .vf-bl')].find(x => x.querySelector('h3').textContent.startsWith(t)); return s ? { txt: s.innerText.replace(/\s+/g, ' '), off: s.classList.contains('off') } : null; }, t);

(async () => {
  await new Promise(r => srv.listen(0, r)); const U = `http://127.0.0.1:${srv.address().port}/paginas/`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pe = [];
  const abre = async (arq, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(U + encodeURI(arq) + hash); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.overlay,.ov').forEach(o => { if (!o.closest('#vacFicha')) o.remove(); })); return p; };

  // 1. a ficha da ordem em cada página: mesmos números do exports
  for (const [id, arq] of Object.entries(PAGS)) {
    const p = await abre(arq); await p.evaluate(PREP, [BASES, CAD]);
    const tem = await p.evaluate(() => ({ f: typeof vacFicha, b: typeof vacFichaBotao }));
    await p.evaluate(o => vacFicha.abrir('ordem', o), O); await p.waitForTimeout(700);
    const pr = await blocoTxt(p, 'Produção'), pa = await blocoTxt(p, 'Paradas'), ws = await blocoTxt(p, 'Waste'), ge = await blocoTxt(p, 'Gestão de Gel'), sap = await blocoTxt(p, 'SAP'), t = await texto(p);
    ok(tem.f === 'object' && tem.b === 'function', `${arq}: kit com vacFicha e vacFichaBotao`);
    ok(pr && /120\.000/.test(pr.txt) && /112\.480/.test(pr.txt) && /93,7%/.test(pr.txt) && /6 \(1 retrabalho\)/.test(pr.txt), `${arq}: Produção = exports (planejado 120.000, produzido 112.480, 93,7%, 6 dias com 1 retrabalho)`);
    ok(pa && /14/.test(pa.txt) && /386/.test(pa.txt) && /EQ03, EQ05/.test(pa.txt), `${arq}: Paradas = exports (14 eventos, 386 min)`);
    ok(ws && /R\$ 4\.812/.test(ws.txt) && /R\$ 3\.500/.test(ws.txt) && /2 competências/.test(ws.txt), `${arq}: Waste soma as 2 competências (perda R$ 4.812, desvio R$ 3.500)`);
    ok(ge && ge.off && /Sem registro desta ordem no Gel/.test(ge.txt), `${arq}: Gel sem a ordem → bloco cinza, sem zero`);
    ok(sap && /encerrada/.test(sap.txt) && /ZP01/.test(sap.txt), `${arq}: SAP com zeros à esquerda (000${O}) bate com a ordem`);
    ok(/Catálogo 367895 · Tubo 4 mL K2EDTA/.test(t) && /out\/2026 nov\/2026/.test(t) && !/Ações ligadas/.test(t), `${arq}: cabeçalho com catálogo do cadastro e as competências; sem Iniciativas, sem bloco de ações`);
    if (id === 'perdas') {
      const h = await p.evaluate(() => [...document.querySelectorAll('#vacFicha .vf-abrir')].map(a => a.getAttribute('href')));
      ok(h.includes('#ordem=' + O) && h.some(x => /^OEE-Vacutainer\.html#ordem=/.test(x)) && h.some(x => /^Paradas\.html#ordem=/.test(x)), `Waste: "Abrir em" leva à página dona filtrada (${h.join(' · ')})`);
      await p.click('[data-vf-modo="det"]'); await p.waitForTimeout(200);
      const ev = await p.evaluate(() => { const s = [...document.querySelectorAll('#vacFicha .vf-bl')].find(x => x.querySelector('h3').textContent.startsWith('Paradas')); return s.querySelectorAll('tr').length - 1; });
      const ws2 = await blocoTxt(p, 'Waste');
      ok(ev === 2 && /out\/2026.*nov\/2026/.test(ws2.txt), `Detalhado: lista os 2 eventos da ordem e as competências do Waste (${ev} eventos)`);
      await p.screenshot({ path: path.join(SAI, 'ficha-detalhado.png') });
      await p.click('[data-vf-modo="res"]');
    }
    if (id === 'oee') await p.screenshot({ path: path.join(SAI, 'ficha-claro.png') });
    await p.close();
  }

  // 2. Ctrl K por índice: "LX1" mostra o lote LX1 antes do LX10 e o equipamento com o apelido; Enter abre a ficha do lote
  {
    const p = await abre(PAGS.oee); await p.evaluate(PREP, [BASES, CAD]);
    await p.keyboard.press('Control+k'); await p.waitForTimeout(200); await p.keyboard.type('LX1'); await p.waitForTimeout(700);
    const L = await p.evaluate(() => [...document.querySelectorAll('#vbL li')].map(li => li.querySelector('.tp').textContent + ':' + li.querySelector('.tx').childNodes[0].textContent));
    ok(L[0] === 'Lote:LX1' && L.indexOf('Lote:LX1') < L.indexOf('Lote:LX10') && L.some(x => /^Equipamento:EQ01/.test(x)), `Ctrl K "LX1": ${L.slice(0, 5).join(' | ')}`);
    await p.screenshot({ path: path.join(SAI, 'busca.png') });
    await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    let t = await texto(p);
    ok(/Lote LX1/.test(t) && t.includes(O) && /Peças 112\.000/.test(t), 'Enter abre a ficha do lote: ordem do lote e dados do servidor');
    await p.click(`#vacFicha [data-vac-ordem="${O}"]`); await p.waitForTimeout(400); t = await texto(p);
    ok(/^Ordem 100234567/.test(t), 'na ficha do lote, a ordem abre a ficha da ordem');
    await p.evaluate(() => vacFicha.fechar()); await p.waitForTimeout(300);
    await p.keyboard.press('Control+k'); await p.keyboard.type(O.slice(0, 6)); await p.waitForTimeout(500);
    const L2 = await p.evaluate(() => [...document.querySelectorAll('#vbL li')].map(li => li.querySelector('.tp').textContent));
    ok(L2.filter(x => x === 'Ordem').length === 2, `Ctrl K "${O.slice(0, 6)}": acha as ordens que existem nos exports (${L2.filter(x => x === 'Ordem').length})`);
    await p.keyboard.press('Escape');
    await p.keyboard.press('Control+k'); await p.keyboard.type('LP777'); await p.waitForTimeout(500); await p.keyboard.press('Enter'); await p.waitForTimeout(400); t = await texto(p);
    ok(/LP \(barril de gel\) LP777/.test(t) && /100234890/.test(t) && /41,3/.test(t), 'LP: ficha com a ordem que baixou o barril (Gel)');
    // fora da janela do Gel
    await p.evaluate(() => vacFicha.abrir('ordem', '100100100')); await p.waitForTimeout(400);
    const g = await blocoTxt(p, 'Gestão de Gel');
    ok(g && g.off && /antes da janela/.test(g.txt) && /não quer dizer zero/.test(g.txt), 'ordem de antes dos 150 dias do Gel: "sem dado não quer dizer zero"');
    await p.close();
  }

  // 3. sem pasta: a última cópia lida neste computador, com a data
  {
    const p = await abre(PAGS.paradas); await p.evaluate(() => { vacPastaAtual = () => null; });
    await p.evaluate(o => vacFicha.abrir('ordem', o), O); await p.waitForTimeout(700);
    const pr = await blocoTxt(p, 'Produção');
    ok(pr && /112\.480/.test(pr.txt) && /cópia lida em/.test(pr.txt) && /pasta da rede não conectada/.test(pr.txt), 'sem pasta: mostra a cópia lida antes, com a data e o motivo');
    await p.close();
  }

  // 4. versão desconhecida do exports: não usa e diz por quê
  {
    const p = await abre(PAGS.perdas); const B2 = JSON.parse(JSON.stringify(BASES)); B2['paradas-base.json'].exports.exportsVersion = 2;
    await p.evaluate(PREP, [B2, CAD]); await p.evaluate(o => vacFicha.abrir('ordem', o), O); await p.waitForTimeout(700);
    const pa = await blocoTxt(p, 'Paradas');
    ok(pa && pa.off && /versão 2/.test(pa.txt) && !/386/.test(pa.txt), 'exports do Paradas na versão 2: bloco cinza com o motivo, sem números');
    await p.close();
  }

  // 5. link #ficha= e ← Voltar; o filtro da página continua
  {
    const p = await abre(PAGS.paradas, '#ficha=ordem/' + O); await p.evaluate(PREP, [BASES, CAD]); await p.evaluate(() => vacFicha.carregar(true)); await p.waitForTimeout(500);
    const t = await texto(p), h = await p.evaluate(() => location.hash);
    ok(/^Ordem 100234567/.test(t) && h === '', `link #ficha=ordem/${O}: abre a ficha e limpa o endereço`);
    await p.goto(U + 'Paradas.html#ordem=' + O); await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({ q: F.q, aba: App.view || (document.querySelector('#nav .on') || {}).textContent }));
    ok(r.q === O, `Paradas › #ordem=: eventos filtrados pela ordem (busca "${r.q}")`);
    await p.evaluate(() => { F.q = 'tampa'; }); await p.evaluate(o => vacFicha.abrir('ordem', o), O); await p.waitForTimeout(300);
    await p.goBack(); await p.waitForTimeout(500);
    const r2 = await p.evaluate(() => ({ aberta: !!document.getElementById('vacFicha'), q: F.q, url: location.pathname }));
    ok(!r2.aberta && r2.q === 'tampa' && /Paradas\.html$/.test(r2.url), '← Voltar fecha a ficha, fica na página e mantém o filtro');
    await p.close();
  }

  // 6. botão "Ficha" dentro da página (Waste › ordem; Paradas › evento) abre a ficha comum
  {
    const p = await abre(PAGS.perdas); await p.evaluate(() => enterTest()); await p.waitForTimeout(800); await p.evaluate(PREP, [BASES, CAD]);
    const o = await p.evaluate(() => { const x = B.rows.find(r => r.ordem); openOrder(x.ordem); return x.ordem; }); await p.waitForTimeout(400);
    await p.click(`.modal.on [data-vac-ordem="${o}"]`); await p.waitForTimeout(400); const t = await texto(p);
    ok(t.startsWith('Ordem ' + o), `Waste: botão Ficha na ordem ${o} abre a ficha comum por cima`);
    await p.close();
  }

  // 7. visual: tema escuro e celular (390 px) sem rolagem horizontal
  for (const [nome, vp, tema] of [['escuro', { width: 1440, height: 900 }, 'dark'], ['390', { width: 390, height: 844 }, 'light']]) {
    const c2 = await b.newContext({ viewport: vp }); const p = await c2.newPage(); p.on('pageerror', e => pe.push(e.message)); await p.goto(U + 'Portal.html'); await p.waitForTimeout(900);
    await p.evaluate(t => { document.documentElement.setAttribute('data-theme', t); document.querySelectorAll('.overlay,.modal.on').forEach(o => o.classList.remove('on')); }, tema);
    await p.evaluate(PREP, [BASES, CAD]); await p.evaluate(o => vacFicha.abrir('ordem', o), O); await p.waitForTimeout(700);
    const r = await p.evaluate(() => { const a = document.querySelector('#vacFicha .vficha'); return { sw: a.scrollWidth - a.clientWidth, w: a.getBoundingClientRect().width }; });
    ok(r.sw <= 1, `ficha ${nome}: sem rolagem horizontal (${r.sw}px, largura ${Math.round(r.w)})`);
    await p.screenshot({ path: path.join(SAI, 'ficha-' + nome + '.png') }); await c2.close();
  }
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
