const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');

const hoje = '2026-11-09';
const futuro = '2026-11-10';
const aviso = /Dados de Administração em versão anterior/;   // cadastro de versão anterior não é lido (base limpa, 24/11/2026)

(async () => {
  const srv = server();
  await new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', resolve);
  });
  let browser;
  try {
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1:)/, route => route.abort());
    const erros = [];
    const motores = [
      { id: 'gel', rota: 'gel', titulo: 'Módulo Gestão de Gel' },
      { id: 'oee', rota: 'oee?tab=launch', titulo: 'Módulo Produção' },
    ].filter(m => !process.argv.includes('--gel') || m.id === 'gel');

    for (const { id, rota, titulo } of motores) {
      const page = await ctx.newPage();
      page.on('pageerror', erro => erros.push(erro.message));
      await page.clock.setFixedTime(new Date(hoje + 'T15:00:00Z'));
      await page.goto('http://127.0.0.1:' + srv.address().port + '/Plataforma.html?demo=1#/' + rota);
      const quadro = page.locator(`iframe[title="${titulo}"]`);
      await quadro.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
      const frame = await (await quadro.elementHandle()).contentFrame();
      await frame.waitForFunction(motor => vacCad()?.gel?.locais?.length && (
        motor === 'gel' ? typeof S !== 'undefined' && S && GelProd.oee : window.vacPagina?.pronto()
      ), id);

      const r = await frame.evaluate(({ id, hoje, futuro }) => {
        const gel = id === 'gel';
        const cad = vacCad();
        const local = cad.gel.locais.find(l => l.comp === 'tubogel');
        const cod = local.equipamento;
        const en = { e: gel ? 'eq-' + cod : cod, d: local.id, local: 'Nome guardado', kg: 1.84, cat: '360060' };
        if (gel) en.cat = S.catalogs.find(c => String(c.num) === '360060').id;
        const calcular = dia => gel ? scrapCalc(en, dia) : GelTurno.calc(en, dia, GelTurno.ctx());
        const ativos = () => (gel ? equipList() : GelTurno.ctx().equips()).flatMap(e => e.descs.map(l => l.id));
        const salvarCadastro = () => vacDemo.salvar('cad', cad);
        const original = calcular(hoje)?.unit ?? null;
        const primeiroFormato = cad.gel.formatos[0];
        cad.gel.formatos.push({
          ...primeiroFormato, de: futuro, tubos: {
            ...primeiroFormato.tubos, '100': { ...primeiroFormato.tubos['100'], gelG: 1.2 },
          },
        });
        salvarCadastro();
        const vigenteHoje = calcular(hoje)?.unit ?? null;
        const vigenteAmanha = calcular(futuro)?.unit ?? null;
        const anterior = calcular('2025-01-01');

        const nomeNoRegistro = () => {
          if (gel) return rgScrapProd({ date: hoje, turns: { T1: { eq: [en] } } }, 'T1');
          return GelTurno.form({ date: hoje }, { gelScrap: { eq: [en] } }, { flat: [] }).html();
        };
        const ativoAntes = ativos().includes(local.id);
        local.local = 'Nome atual do local';
        cad.equipamentos.find(e => e.codigo === cod).ativo = false;
        salvarCadastro();
        const ativoDepois = ativos().includes(local.id);
        const historico = calcular(hoje)?.unit ?? null;
        const renomeado = nomeNoRegistro();

        cad.gel.locais = cad.gel.locais.filter(l => l.id !== local.id);
        salvarCadastro();
        const excluido = nomeNoRegistro();

        cad.schemaVersion = 1;
        delete cad.gel;
        salvarCadastro();
        const semCalc = calcular(hoje);
        const mensagem = gel
          ? rgScrapHtml({ date: hoje, turns: {}, orders: [] }, 'T1')
          : GelTurno.estado({ date: hoje }, { gelScrap: { eq: [en] } }, { flat: [] }).motivo;
        const bloqueado = gel
          ? !mensagem.includes('data-rgscrap') && !renderProd().includes('data-rg="sT"')
          : GelTurno.form({ date: hoje }, { gelScrap: { eq: [en] } }, { flat: [] }) === null
            && GelTurno.exp({ gelScrap: { eq: [en] } }, hoje).kg === null;
        return { bloqueado, original, vigenteHoje, vigenteAmanha, anterior, ativoAntes, ativoDepois, historico, renomeado, excluido, semCalc, mensagem };
      }, { id, hoje, futuro });

      assert.ok(r.original > 0, id + ' calcula uma pesagem usando o ID do local da Administração');
      assert.equal(r.vigenteHoje, r.original, id + ' mantém a composição pela data do fato');
      assert.ok(r.vigenteAmanha > r.original, id + ' passa a usar a nova vigência na data dela');
      assert.equal(r.anterior, null, id + ' sem formato vigente fica sem cálculo');
      assert.equal(r.ativoAntes, true);
      assert.equal(r.ativoDepois, false, id + ' tira o local do formulário quando o equipamento fica inativo');
      assert.equal(r.historico, r.original, id + ' calcula a pesagem histórica do local inativo');
      assert.match(r.renomeado, /Nome atual do local/);
      assert.match(r.excluido, /Nome guardado/);
      assert.equal(r.semCalc, null, id + ' cadastro v1 fica sem cálculo');
      assert.match(r.mensagem, aviso);
      assert.equal(r.bloqueado, true, id + ' bloqueia o registro de scrap sem cadastro');
      console.log('ok ' + titulo + ': vigência por data, equipamento inativo, histórico e aviso no cadastro v1');
      await page.close();
    }
    assert.deepEqual(erros, []);
  } finally {
    if (browser) await browser.close();
    srv.close();
  }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
