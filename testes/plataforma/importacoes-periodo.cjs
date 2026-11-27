// Plataforma 1.8.7 (Administração 1.9.47) · IMP-01: conferência das importações por período, com frequência e prazo
// configurados na própria aba, e contagens (lidas, gravadas, duplicadas, rejeitadas) publicadas pelas páginas. Dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, timezoneId: 'UTC' }), erros = [];
    /* relógio fixo às 15:00 do dia: entre 0h e 6h o "hoje" da demonstração é a madrugada do dia de produção anterior e o resultado mudava conforme a hora do teste */
    { const a = new Date(); await page.clock.setFixedTime(new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), 15, 0, 0))); }
    page.on('pageerror', e => erros.push(e.message));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/importacoes?tab=por-pagina'; });
    const el = page.locator('iframe[title="Módulo Administração"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForSelector('#impGrade');

    // 1) as páginas publicam as contagens (campos opcionais) e a grade mostra o que veio
    const ex = await f.evaluate(() => Object.fromEntries(['oee', 'paradas', 'gel', 'perdas'].map(k => [k, ((MOD.data[k] || {}).ex || {}).importacoes || []])));
    for (const [k, L] of Object.entries(ex)) assert.ok(L.every(i => ['lidas', 'gravadas', 'duplicadas', 'rejeitadas'].every(c => c in i)), k + ': importações com as quatro contagens (número ou null)');
    const g = await f.evaluate(() => ({ dias: document.querySelectorAll('#impGrade th.d').length, fontes: [...document.querySelectorAll('#impGrade tr')].slice(1).map(r => r.cells[0].innerText.trim()),
      mes: [...document.querySelectorAll('#impGrade tr')].find(r => /MES/.test(r.cells[0].innerText)).lastElementChild.innerText }));
    assert.equal(g.dias, 7, 'Últimos 7 dias'); assert.equal(g.fontes.length, 7, 'cinco diárias/semanais e duas mensais');
    assert.match(g.mes, /\d+ lidas · \d+ gravadas/, 'contagens do MES no período');
    console.log('ok contagens publicadas pelas páginas e somadas no período (MES: ' + g.mes + ')');

    // 2) regras: diária vencida = falta; no prazo; semanal; não obrigatória; página não lida = sem leitura
    const R = await f.evaluate(() => {
      const setEx = (id, L) => { MOD.data[id] = MOD.data[id] || { sys: sysOf(id), kpis: [], pend: [] }; MOD.data[id].ex = Object.assign({}, MOD.data[id].ex || { exportsVersion: 1 }, { importacoes: L }); };
      const c = id => IMP_CAT.find(x => x.id === id), h = todayISO(), ont = addDays(h, -1);
      setEx('paradas', [{ tipo: 'FORMS', em: h + 'T07:00', de: addDays(h, -20), ate: addDays(h, -10) }]);
      const antes = Store.B.config.importacao; Store.B.config.importacao = { FORMS: { freq: 'diaria', prazo: 1 }, MB51: { freq: 'nao', prazo: 0 } };
      const out = { velho: impCelula(c('FORMS'), addDays(h, -5)).st, coberto: impCelula(c('FORMS'), addDays(h, -15)).st, ontem: impCelula(c('FORMS'), ont).st, mb51: impCelula(c('MB51'), addDays(h, -30)) };
      Store.B.config.importacao = { FORMS: { freq: 'semanal', prazo: 1 } }; out.semanal = impCelula(c('FORMS'), h).st;
      const guard = MOD.data.paradas; MOD.data.paradas = { sys: sysOf('paradas'), erro: 'não lida' }; out.semLeitura = impCelula(c('FORMS'), ont).st; MOD.data.paradas = guard;
      out.kkbc = impMes(c('KKBC_ORD'), '2020-01').st;
      Store.B.config.importacao = antes; return out; });
    assert.equal(R.velho, 'cr', 'diária sem importação e prazo vencido = falta'); assert.equal(R.coberto, 'ok'); assert.equal(R.ontem, 'ag', 'ontem com prazo de 1 dia = no prazo');
    assert.equal(R.mb51.st, 'na'); assert.equal(R.mb51.obr, false, 'não obrigatória não conta'); assert.equal(R.semanal, 'ag', 'semanal: a semana atual ainda está no prazo');
    assert.equal(R.semLeitura, 'sl', 'página não lida = sem leitura'); assert.equal(R.kkbc, 'cr', 'mensal vencida sem competência = falta');
    console.log('ok regras: falta, coberto, no prazo, semanal, não obrigatória, sem leitura e mensal');

    // 2b) revisão do PR #101: o plano do PCP vale pelos meses com plano gravado, não pela data da importação;
    //     as contagens do período só somam importações que cobrem os dias do período (hoje não entra em "Ontem")
    const rv = await f.evaluate(() => {
      const c = id => IMP_CAT.find(x => x.id === id), h = todayISO(), ont = addDays(h, -1), oee = MOD.data.oee, antes = oee.ex;
      oee.ex = Object.assign({}, antes, { planosMeses: ['2020-03'], planoMes: null, importacoes: [{ tipo: 'PLANOS_PCP', em: '2020-04-02T09:00' },
        { tipo: 'MES', em: h + 'T08:00', de: ont + 'T05:00', ate: h + 'T06:30', lidas: 10, gravadas: 10, duplicadas: null, rejeitadas: 0 },
        { tipo: 'MES', em: h + 'T18:00', de: h + 'T06:00', ate: h + 'T18:00', lidas: 99, gravadas: 99, duplicadas: null, rejeitadas: 0 }] });
      const out = { marco: impMes(c('PLANOS_PCP'), '2020-03').st, abril: impMes(c('PLANOS_PCP'), '2020-04').st };
      Imp.per = '1'; App.render(); out.ontem = [...document.querySelectorAll('#impGrade tr')].find(r => /MES/.test(r.cells[0].innerText)).lastElementChild.innerText;
      oee.ex = antes; Imp.per = '7'; App.render(); return out; });
    assert.equal(rv.marco, 'ok', 'mês com plano gravado = coberto'); assert.equal(rv.abril, 'cr', 'importação em abril sem plano de abril não cobre abril');
    assert.match(rv.ontem, /^10 lidas/, '"Ontem" não soma a importação de hoje: ' + rv.ontem);
    console.log('ok revisão: plano do PCP pelos meses gravados; contagens só dos dias do período');

    // 3) configuração: salvar e voltar ao padrão (gravado na base da Administração)
    await f.evaluate(() => { Imp.cfgAberta = true; App.render(); }); await f.waitForSelector('#impCfg[open]');
    await f.locator('[data-ifq="MB51"]').selectOption('nao'); await f.locator('[data-ipz="FORMS"]').fill('2'); await f.locator('#iCfgSalvar').click();
    await f.waitForFunction(() => (Store.B.config.importacao || {}).MB51?.freq === 'nao');
    const cf = await f.evaluate(() => ({ cfg: Store.B.config.importacao, freqTxt: [...document.querySelectorAll('#impGrade tr')].find(r => /MB51/.test(r.cells[0].innerText)).cells[1].innerText }));
    assert.equal(cf.cfg.FORMS.prazo, 2); assert.equal(cf.cfg.KKBC_ORD.freq, 'mensal', 'fonte mensal só aceita mensal ou não obrigatória'); assert.equal(cf.freqTxt, 'Não obrigatória');
    await f.locator('#iCfgPadrao').click(); await f.waitForFunction(() => !Store.B.config.importacao);
    console.log('ok configuração: salva frequência e prazo, volta ao padrão');

    // 4) detalhe ao clicar num dia; período personalizado limitado
    await f.locator('[data-ic^="MES|"]').last().click(); await f.waitForSelector('#impDet');
    assert.match(await f.locator('#impDet').innerText(), /Lidas[\s\S]*Gravadas[\s\S]*Duplicadas[\s\S]*Rejeitadas/);
    await f.locator('#iPer [data-v="p"]').click(); await f.waitForSelector('#iDe');
    await f.evaluate(() => { Imp.de = '2020-01-01'; Imp.ate = todayISO(); App.render(); });
    assert.ok(await f.locator('#impGrade th.d').count() <= 62, 'personalizado limitado a 62 dias');
    console.log('ok detalhe do dia com contagens; período personalizado limitado');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok importações por período: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
