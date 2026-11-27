// C24/D01 · P6 (26/11/2026): anexo da ficha de equipamento abre na prévia só se for PDF, imagem (JPG, PNG) ou texto (TXT, CSV), com o
// tipo fixado pelo aplicativo (texto sempre como texto simples). HTML, SVG e outros formatos só são baixados: nada roda na origem do
// aplicativo. Pasta fictícia em OPFS; o arquivo HTML fictício tentaria gravar uma marca se fosse executado.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('portal', 'Módulo Administração', async (f, p) => {
    await f.waitForFunction(() => typeof Store !== 'undefined' && Store.mode === 'pasta' && Store.dir && typeof EqFiles !== 'undefined', null, { timeout: 60000 });
    const nomes = ['manual.pdf', 'foto.JPG', 'foto.png', 'leitura.txt', 'dados.csv', 'pagina.html', 'desenho.svg', 'planilha.xlsx', 'sem-extensao'];
    const r = await f.evaluate(async nomes => {
      const d = await Store.sub('Equipamentos/EQ-FICTICIO', true);
      for (const n of nomes) await Store.writeFile(d, n, new Blob([n.endsWith('html') || n.endsWith('svg') ? '<svg xmlns="http://www.w3.org/2000/svg"><script>localStorage.setItem("anexo.rodou","1")</script></svg><script>localStorage.setItem("anexo.rodou","1")</script>' : 'conteúdo fictício ' + n], { type: n.endsWith('html') ? 'text/html' : n.endsWith('svg') ? 'image/svg+xml' : '' }));
      const out = {}, open = window.open, click = HTMLAnchorElement.prototype.click;
      for (const n of nomes) {
        let aberto = null, baixado = null;
        window.open = u => { aberto = u; return {}; };
        HTMLAnchorElement.prototype.click = function () { if (this.download) baixado = this.href; else click.call(this); };
        try { await EqFiles.abrir('Equipamentos/EQ-FICTICIO/' + n); } finally { window.open = open; HTMLAnchorElement.prototype.click = click; }
        const u = aberto || baixado; out[n] = { modo: aberto ? 'previa' : baixado ? 'baixa' : 'nada', tipo: u ? (await (await fetch(u)).blob()).type : null };
      }
      return out;
    }, nomes);
    const esperado = { 'manual.pdf': ['previa', 'application/pdf'], 'foto.JPG': ['previa', 'image/jpeg'], 'foto.png': ['previa', 'image/png'], 'leitura.txt': ['previa', 'text/plain;charset=utf-8'], 'dados.csv': ['previa', 'text/plain;charset=utf-8'] };
    for (const n of nomes) {
      if (esperado[n]) assert.deepEqual([r[n].modo, r[n].tipo], esperado[n], n + ': ' + JSON.stringify(r));
      else assert.equal(r[n].modo, 'baixa', n + ' só pode ser baixado: ' + JSON.stringify(r));
    }
    assert.equal(await f.evaluate(() => localStorage.getItem('anexo.rodou')), null, 'nenhum anexo foi executado');
    console.log('ok anexos de equipamento: PDF, JPG, PNG, TXT e CSV abrem na prévia com o tipo fixado; HTML, SVG, XLSX e sem extensão só baixam: ' + JSON.stringify(r));
  });
})().catch(e => { console.error(e); process.exit(1); });
