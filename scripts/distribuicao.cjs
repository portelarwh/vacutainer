const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { copyFile, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const { FILE } = require('./html.cjs');

async function validar(arquivoResultado) {
  if (!arquivoResultado) throw new Error('Uso: node scripts/distribuicao.cjs <resultado.json>');
  const pasta = await mkdtemp(join(tmpdir(), 'Vacutainer homologação '));
  let browser;
  try {
    const html = join(pasta, 'Plataforma.html');
    await copyFile(FILE, html);
    const sha256 = createHash('sha256').update(await readFile(html)).digest('hex');
    const url = pathToFileURL(html);
    url.searchParams.set('demo', '1');
    browser = await chromium.launch();
    const context = await browser.newContext({ offline: true });
    await context.route(/^https?:/, route => route.abort());
    const pagina = await context.newPage();
    const erros = [];
    const requisicoes = [];
    pagina.on('pageerror', error => erros.push(error.message));
    pagina.on('request', request => {
      if (/^https?:/.test(request.url())) requisicoes.push(request.url());
    });

    await pagina.goto(url.href);
    await pagina.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    const rodape = await pagina.getByText(/^Plataforma \d+\.\d+\.\d+$/).first().textContent();
    const versao = rodape?.match(/^Plataforma (\d+\.\d+\.\d+)$/)?.[1];
    assert.ok(versao, 'Versão inválida no rodapé da plataforma');

    await pagina.locator('.sidebar').getByRole('button', { name: 'Produção', exact: false }).click();
    const iframe = await pagina.locator('iframe[title="Módulo Produção"]').elementHandle();
    const producao = await iframe.contentFrame();
    await producao.waitForFunction(() => globalThis.vacPagina?.pronto());
    assert.deepEqual(erros, [], 'Erros ao abrir a plataforma por file://');
    assert.deepEqual(requisicoes, [], 'A plataforma tentou usar HTTP no teste offline');

    await writeFile(arquivoResultado, JSON.stringify({ versao, sha256 }) + '\n', { flag: 'wx' });
    console.log(`Plataforma ${versao}: Visão da linha e Produção abriram offline por file://.`);
  } finally {
    try {
      await browser?.close();
    } finally {
      await rm(pasta, { recursive: true, force: true });
    }
  }
}

validar(process.argv[2]).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
