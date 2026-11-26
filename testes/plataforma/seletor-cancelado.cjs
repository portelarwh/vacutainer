// C28/E01 (análise comum 26/11/2026): fechar o seletor de arquivo sem escolher nada termina a espera (null), em vez de deixar a
// promessa pendente para sempre. Escolher um arquivo continua igual, e o limite de tamanho continua valendo. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 60000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof pickFile === 'function', null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      const click = HTMLInputElement.prototype.click, out = {};
      /* o navegador automático não abre a janela do sistema: cada caso simula o que a pessoa faz nela */
      const caso = async (acao, ...args) => { let inp; HTMLInputElement.prototype.click = function () { if (this.type === 'file') inp = this; else click.call(this); };
        try { const pr = pickFile(...args); await new Promise(r => setTimeout(r, 50)); acao(inp);
          return await Promise.race([pr.then(v => v ? 'arquivo:' + v.name : String(v), e => 'erro:' + e.message), new Promise(r => setTimeout(() => r('PENDENTE'), 2000))]);
        } finally { HTMLInputElement.prototype.click = click; } };
      const comArquivo = (nome, bytes) => i => { const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(bytes)], nome)); i.files = dt.files; i.dispatchEvent(new Event('change')); };
      out.cancelado = await caso(i => i.dispatchEvent(new Event('cancel')), '.json');
      out.escolhido = await caso(comArquivo('base-ficticia.json', 10), '.json');
      out.grande = await caso(comArquivo('grande-ficticio.csv', 2 * 1048576), '.csv', 1);
      return out; });
    assert.equal(r.cancelado, 'null', 'seletor fechado sem escolher termina com null: ' + JSON.stringify(r));
    assert.equal(r.escolhido, 'arquivo:base-ficticia.json', JSON.stringify(r));
    assert.match(r.grande, /^erro:.*limite é 1 MB/, JSON.stringify(r));
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok seletor de arquivo: cancelar termina a espera (null), escolher devolve o arquivo e o limite de tamanho continua: ' + JSON.stringify(r));
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
