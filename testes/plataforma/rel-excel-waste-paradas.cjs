// C33 (análise comum 26/11/2026): Excel dos relatórios do Waste e das Paradas (e da Administração, mesmo exportador) igual ao PDF.
// Gera o arquivo de verdade pelo Report.xlsx de cada relatório, captura a planilha e confere célula a célula: mesmas linhas que o PDF
// (inclusive Total), colunas numéricas como número com o mesmo valor, % com formato % e as mesmas casas, códigos e texto como texto.
// Demonstração, dados fictícios, relógio fixo.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'UTC' })).newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    { const a = new Date(); await p.clock.setFixedTime(new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), 15))); }
    const frame = async (rota, t) => { await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/' + rota); const q = p.locator(`iframe[title="Módulo ${t}"]`); await q.waitFor({ state: 'attached', timeout: 60000 }); const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto?.(), null, { timeout: 60000 }); return f; };
    /* no navegador: gera cada relatório, chama Report.xlsx, captura o workbook e confere contra o que o PDF mostra (b.linhas) */
    const conferir = async (f, gerar) => f.evaluate(async src => {
      const docs = (0, eval)(src)(), X = await (typeof Libs !== 'undefined' && Libs.xlsx ? Libs.xlsx() : RepLibs.xlsx()), w = X.writeFile, out = [];
      for (const [nome, doc] of docs) {
        let wb = null; X.writeFile = b => { wb = b; };
        try { await Report.xlsx(doc); } finally { X.writeFile = w; }
        const tabs = doc.blocos.filter(b => b.tipo === 'tabela'); let k = 0;
        for (const b of tabs) {
          const ws = wb.Sheets[wb.SheetNames[++k]], num = new Set(b.num || []), prob = [];
          const lin = X.utils.decode_range(ws['!ref']).e.r;   /* última linha (0 = cabeçalho) */
          if (lin !== b.linhas.length) prob.push(`linhas: PDF ${b.linhas.length} × Excel ${lin}`);
          b.linhas.forEach((r, i) => r.forEach((c, j) => {
            const cell = ws[X.utils.encode_cell({ r: i + 1, c: j })], p = vacXlsxNumero(c);
            if (num.has(j) && p) {
              if (!cell || cell.t !== 'n') prob.push(`[${i},${j}] "${c}" não é número no Excel (${cell && cell.t})`);
              else { const casas = p.pct ? p.casas + 2 : (String(c).split(',')[1] || '').replace(/\D/g, '').length; if (Math.abs(cell.v - p.v) > 0.5 * Math.pow(10, -casas) + 1e-9) prob.push(`[${i},${j}] PDF "${c}" × Excel ${cell.v}`); if (p.pct && !/%/.test(cell.z || '')) prob.push(`[${i},${j}] "${c}" sem formato % (${cell.z})`); }
            } else if (!num.has(j) && c !== '' && c != null && cell && cell.t === 'n' && typeof c === 'string') prob.push(`[${i},${j}] texto "${c}" virou número`);
          }));
          out.push({ rel: nome, tabela: b.titulo, linhas: b.linhas.length, prob: prob.slice(0, 5) });
        }
      }
      return out;
    }, gerar.toString());
    const res = [];
    const fw = await frame('perdas', 'Waste');
    res.push(...await conferir(fw, () => { const ps = allPers().slice().sort(), per = ps[ps.length - 1], ord = vigRows().map(r => r.ordem).find(Boolean);
      return [['Waste por tipo de ordem', docPorTipo(ps[0], per)], ['Waste mensal', docMensal(per)], ['Ordem', docOrdem(ord)], ['Comparativo', docComparativo()]]; }));
    const fp = await frame('paradas', 'Paradas');
    res.push(...await conferir(fp, () => [['Paradas da linha', relParadas()]]));
    const fa = await frame('portal', 'Administração');
    const adm = await fa.evaluate(async () => { const X = await Libs.xlsx(); const ws = vacXlsxTabela(X, { cab: ['Código', 'Valor', 'Taxa', 'Tempo', 'Obs'], num: [1, 2, 3], linhas: [['007', 'R$ 1.234,56', '31,2%', '369 min', '845,4 mil'], ['010', '-R$ 0,50', '—', '0 min', '']] });
      const c = a => ws[a] && { t: ws[a].t, v: ws[a].v, z: ws[a].z }; return { cod: c('A2'), rs: c('B2'), pct: c('C2'), min: c('D2'), mil: c('E2'), neg: c('B3'), traco: c('C3') }; });
    const comProblema = res.filter(r => r.prob.length);
    assert.deepEqual(comProblema, [], 'Excel diferente do PDF:\n' + JSON.stringify(comProblema, null, 1));
    assert.ok(res.length >= 10 && res.some(r => r.linhas > 1), 'tabelas conferidas: ' + res.length);
    console.log(`ok Excel = PDF em ${res.length} tabelas dos relatórios do Waste e das Paradas (números como número, % com formato %, Total incluído, códigos como texto)`);
    assert.deepEqual(adm, { cod: { t: 's', v: '007', z: undefined }, rs: { t: 'n', v: 1234.56, z: undefined }, pct: { t: 'n', v: 0.312, z: '0.0%' }, min: { t: 'n', v: 369, z: undefined }, mil: { t: 's', v: '845,4 mil', z: undefined }, neg: { t: 'n', v: -0.5, z: undefined }, traco: { t: 's', v: '—', z: undefined } }, JSON.stringify(adm));
    console.log('ok exportador comum (Administração): "R$ 1.234,56" → 1234,56; "31,2%" → 0,312 (0.0%); "369 min" → 369; código "007", "845,4 mil" e "—" ficam texto');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
