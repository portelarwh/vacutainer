// Plataforma 1.8.19 (Produção 2.6.15) · REL-01: gel no relatório/e-mail do dia e do turno e o botão "Enviar relatório" na janela do dia
// (dia inteiro, um turno, só o gel, scrap e perdas; Copiar para o Outlook ou Abrir na aba Relatórios). Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage(), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());
    const antes = await o.evaluate(() => ({ dirty: !!Store.S.dirty, aud: (db().auditLog || []).length }));
    // lê a área de transferência quando a cópia termina (o diálogo fecha depois de copiar)
    const copiar = async () => { await o.click('#envrCopiar'); await o.waitForFunction(() => !document.querySelector('.overlay #envrCopiar'), null, { timeout: 15000 });
      return o.evaluate(async () => { const it = await navigator.clipboard.read(), out = {}; for (const i of it) for (const t of i.types) out[t] = await (await i.getType(t)).text(); return out; }); };
    const escolher = async v => { await o.evaluate(() => { go('launch'); }); await o.locator('#dMais').click(); await o.locator('#dEnviar').click();   /* LANC-03: Enviar relatório fica no menu ⋮ Mais ações */ await o.locator(`input[name="envr"][value="${v}"]`).check(); };

    // 1) "Scrap e perdas" como PRIMEIRA cópia da sessão (antes, sem a aba Relatórios aberta, a cópia falhava): scrap de tubos, gel e Waste da ordem do dia
    await escolher('perdas');
    const c1 = await copiar(), h1 = c1['text/html'] || '';
    assert.match(h1, /Scrap e perdas do dia/); assert.match(h1, /Scrap de tubos \(Produção\)/); assert.match(h1, /Gel do dia · teórico × real/);
    assert.match(h1, /Waste \(MUV\) das ordens do dia/); assert.match(h1, /acumulados na competência indicada: não são do dia/);
    assert.match(h1, /100234567/, 'OP do dia (dia ↔ lote)'); assert.match(c1['text/plain'] || '', /Waste das ordens do dia \(acumulado da competência\)/);
    console.log('ok Enviar relatório › Scrap e perdas: scrap de tubos por turno, gel do dia e Waste por ordem (acumulado da competência)');

    // 1b) revisão do PR #109: a ordem do dia vem também da produção do servidor (lote normal sem marcação dia ↔ lote) e de plano de outro mês
    const r1b = await o.evaluate(() => { const d = db(), day = curDay(), lista = () => EnviarRel.ordensDoDia(day).map(x => x.ordem + '/' + x.lote).join(',');
      const dl = (d.server.dayLot = d.server.dayLot || {}), guard = JSON.parse(JSON.stringify(dl)); for (const k of Object.keys(dl)) if (k.startsWith(day.date + '|')) delete dl[k];
      const semMarcacao = lista(); Object.keys(dl).forEach(k => delete dl[k]); Object.assign(dl, guard);
      const p = Engine.planFor(d, day.date.slice(0, 7), 'line_vac'), m0 = p.month; p.month = '2020-01'; const outroMes = lista(); p.month = m0;
      return { semMarcacao, outroMes }; });
    assert.deepEqual(r1b, { semMarcacao: '100234567/6275187', outroMes: '100234567/6275187' }, 'ordens do dia: servidor e plano de outro mês');
    console.log('ok ordens do dia: lote com produção do servidor sem marcação no dia e ordem de plano de outro mês');

    // 2) Dia inteiro: o e-mail do dia leva o item Gel (mesmos números do quadro da tela)
    const tela = await o.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), x = GelDia.calc(day, res); return x && U.fmt(x.teo.teo, 3); });
    assert.ok(tela, 'dia da demonstração com catálogo de gel');
    await escolher('dia'); const c2 = await copiar(), h2 = c2['text/html'] || '';
    assert.match(h2, /Resumo do dia/); assert.match(h2, /Gel do dia · teórico × real/); assert.ok(h2.includes(tela + ' kg'), 'gel teórico igual ao da tela ' + tela);
    assert.match(c2['text/plain'] || '', /• Gel: teórico /);
    console.log('ok Dia inteiro: e-mail do dia com o gel (teórico ' + tela + ' kg, igual ao quadro da tela)');

    // 3) Um turno: passagem de turno com o scrap de gel do turno escolhido
    await escolher('turno'); const ps2 = await o.evaluate(() => { const s = document.querySelector('#envrPs'); s.selectedIndex = 1; s.dispatchEvent(new Event('change')); return s.options[1].textContent; });
    const c3 = await copiar(), h3 = c3['text/html'] || '';
    assert.match(h3, /Passagem de turno/); assert.ok(h3.includes(ps2), 'turno escolhido ' + ps2); assert.match(h3, /Gel · scrap pesado no turno/);
    console.log('ok Um turno: passagem de turno do ' + ps2 + ' com o scrap de gel do turno');

    // 4) Abrir na aba Relatórios: relatório do dia no dia certo, com o bloco Gel e a linha do gel no resumo
    await escolher('dia'); await o.click('#envrAbrir'); await o.waitForFunction(() => App.route === 'reports' && document.querySelector('#rpDoc'));
    const r4 = await o.evaluate(() => ({ type: App.rep.type, date: App.rep.date, dia: curDay().date, blocos: [...document.querySelectorAll('#rpDoc h3')].map(h => h.textContent), auto: App.rep.model.auto }));
    assert.equal(r4.type, 'day'); assert.equal(r4.date, r4.dia); assert.ok(r4.blocos.includes('Gel do dia · teórico × real'), JSON.stringify(r4.blocos)); assert.match(r4.auto, /^Gel: teórico /m);
    console.log('ok Abrir na aba Relatórios: relatório do dia com o bloco "Gel do dia" (vai para PDF, Excel e Outlook)');

    // 5) Só o gel: abre o relatório da Gestão de Gel no dia (sem "Copiar": lá ele tem o seu)
    await escolher('gel'); const b5 = await o.evaluate(() => ({ a: document.querySelector('#envrAbrir').textContent, oculto: document.querySelector('#envrCopiar').hidden }));
    assert.deepEqual(b5, { a: 'Abrir o relatório do Gel ↗', oculto: true });
    await o.click('#envrAbrir');
    const g = await (await page.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle()).contentFrame();
    await g.waitForFunction(() => !!document.querySelector('#ov #grOut'), null, { timeout: 15000 });
    const r5 = await g.evaluate(() => [$('#grF').value, $('#grT').value]);
    assert.deepEqual(r5, [r4.dia, r4.dia]);
    console.log('ok Só o gel: abre o relatório da Gestão de Gel no dia');

    // 6) só leitura: nada gravado na base da Produção
    const depois = await o.evaluate(() => ({ dirty: !!Store.S.dirty, aud: (db().auditLog || []).length }));
    assert.deepEqual(depois, antes, 'Enviar relatório não grava nada');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok Enviar relatório: só leitura e sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
