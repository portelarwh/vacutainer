// Plataforma 1.8.109 · auditoria técnica de 28/11/2026 (Codex, revisada), A13 · Iniciativas. Demonstração, dados fictícios.
//  1. importação: campo CSV entre aspas com vírgula não desloca as colunas; 31/02 é prazo inválido; a mesma linha repetida na colagem entra uma vez;
//  2. formulário da ação: com vários equipamentos ligados (como a Linha 360° manda), editar e salvar mantém todos.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }), erros = [];
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/inic');
    const f = await (await p.locator('iframe[title="Módulo Iniciativas / Ações"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => window.vacPagina && vacPagina.pronto(), null, { timeout: 60000 });
    const r = await f.evaluate(() => {
      const txt = ['Título,Responsável,Prazo,Status', '"Ajustar, limpar e lubrificar",Pessoa Fictícia,10/12/2026,a fazer', 'Ação com data impossível,Pessoa Fictícia,31/02/2026,a fazer', '"Ajustar, limpar e lubrificar",Pessoa Fictícia,10/12/2026,a fazer', '"Trocar ""rolete""",Pessoa Fictícia,2026-12-11,a fazer'].join('\n');
      const x = ImpAcoes.ler(txt, 'manual');
      return x.R.map(l => ({ n: l.n, titulo: l.titulo, resp: l.responsavel, prazo: l.prazo, erro: l.erro }));
    });
    assert.deepEqual(r[0], { n: 2, titulo: 'Ajustar, limpar e lubrificar', resp: 'Pessoa Fictícia', prazo: '2026-12-10', erro: '' }, 'vírgula entre aspas não desloca as colunas: ' + JSON.stringify(r[0]));
    assert.match(r[1].erro, /prazo inválido/, '31/02 é prazo inválido: ' + JSON.stringify(r[1]));
    assert.match(r[2].erro, /repetida \(igual à linha 2\)/, 'linha repetida na colagem: ' + JSON.stringify(r[2]));
    assert.equal(r[3].titulo, 'Trocar "rolete"', 'aspas dobradas viram aspas');
    console.log('ok A13 importação: CSV com vírgula entre aspas, 31/02 recusado, linha repetida na colagem entra uma vez');

    const eq = await f.evaluate(async () => {
      const L = equipamentos().slice(0, 2).map(e => String(e.codigo)); if (L.length < 2) return { L };
      const id = 'AC-FICT-A13'; Store.commit({ k: 'nova', a: { id, titulo: 'Ação fictícia com dois equipamentos', descricao: '', status: 'a fazer', prioridade: 'media', responsavel: '', apoios: [], prazo: null, prazoOriginal: null, criadaEm: new Date().toISOString(), criadaPor: 'teste', origem: { tipo: 'linha360', ref: 'ponto|P1' }, vinculos: [{ tipo: 'ponto', cod: 'P1' }, { tipo: 'equipamento', cod: L[0] }, { tipo: 'equipamento', cod: L[1] }, { tipo: 'equipamento', cod: 'EQ-FORA-DO-CADASTRO' }], checklist: [], comentarios: [], evidencias: [] } });
      formAcao(Store.data.acoes.find(a => a.id === id));
      await new Promise(r => setTimeout(r, 300));
      const sel = document.querySelector('#vEq'), marcados = [...sel.selectedOptions].map(o => o.value);
      const ok = [...document.querySelectorAll('button')].find(b => /^(Salvar|Gravar|OK)/i.test(b.textContent.trim()) && b.offsetParent); if (ok) ok.click();
      await new Promise(r => setTimeout(r, 300));
      return { L, multiple: sel.multiple, marcados, depois: Store.data.acoes.find(a => a.id === id).vinculos.filter(v => v.tipo === 'equipamento').map(v => v.cod), clicou: !!ok };
    });
    assert.ok(eq.L.length === 2, 'a demonstração tem equipamentos');
    assert.equal(eq.multiple, true, 'o campo aceita vários equipamentos');
    assert.deepEqual(eq.marcados.sort(), [...eq.L, 'EQ-FORA-DO-CADASTRO'].sort(), 'os três equipamentos aparecem marcados');
    assert.ok(eq.clicou, 'salvou o formulário'); assert.deepEqual(eq.depois.sort(), [...eq.L, 'EQ-FORA-DO-CADASTRO'].sort(), 'depois de salvar, os três continuam (A13)');
    console.log('ok A13 formulário: ação com vários equipamentos continua com todos depois de editar e salvar');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
