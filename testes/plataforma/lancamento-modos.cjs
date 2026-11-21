// LANC-03 (itens 3, 5 e 6, etapa d) · pílulas de Lançamento (Hora a hora / Por turno) e de Scrap (Por turno / Diário), hora extra por turno.
// Trocar de modo pede confirmação e não apaga nada: o que é do outro modo fica guardado e só deixa de contar. Nenhuma fórmula nova: a
// conta do dia é a mesma (Engine). Dados fictícios (demonstração), data fixa num dia útil.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1'); await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    await f.waitForSelector('#cabDia [data-modolanc]');
    const confirmar = async (sim = true) => { const d = f.locator('.modal.on, .overlay, dialog[open]').last(); await d.waitFor(); const txt = await d.innerText(); await d.locator(sim ? 'button.primary' : 'button:not(.primary)').last().click(); return txt; };
    const estado = () => f.evaluate(() => { const d = curDay(), r = Engine.computeDay(db(), d); return { modo: d.modoLanc || 'hh', scrapMode: d.scrapMode, scrapDay: d.scrapDay, ps: d.shifts.map(p => p.scrap), good: r.r.good, scrap: r.r.scrap, oee: r.r.oee, horas: d.shifts.map(p => p.intervals.filter(i => !i.deleted && i.good != null).length) }; });
    const e0 = await estado();
    /* 1) pílulas no cabeçalho do dia */
    const pil = await f.evaluate(() => ({ lanc: [...document.querySelectorAll('[data-modolanc]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')), scrap: [...document.querySelectorAll('[data-scrapmode]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')) }));
    assert.deepEqual(pil, { lanc: ['Hora a hora:true', 'Por turno:false', 'Dia:false'], scrap: ['Por turno:true', 'Diário:false'] });
    /* 2) Por turno: confirmação, nada apagado, os números do dia iguais; o turno mostra o total e as paradas, sem o hora a hora */
    await f.click('[data-modolanc="turno"]'); const t1 = await confirmar(false); assert.match(t1, /Nada é apagado/); assert.equal((await estado()).modo, 'hh', 'cancelar não muda');
    await f.click('[data-modolanc="turno"]'); await confirmar(true); await f.waitForFunction(() => curDay().modoLanc === 'turno');
    const e1 = await estado(); assert.deepEqual([e1.good, e1.scrap, e1.oee, e1.horas], [e0.good, e0.scrap, e0.oee, e0.horas], 'trocar o modo não muda dados nem contas');
    await f.click('[data-trturno]');
    const t = await f.evaluate(() => { const s = [...document.querySelectorAll('section.tl')].find(x => !x.classList.contains('tr-oculto')); const vis = q => { const el = s.querySelector(q); return !!(el && el.offsetParent); };
      return { mt: vis('.tl-mt'), total: vis('.tl-mt [data-tttot], .tl-mt .tt-in, .tl-mt .tt-per'), parada: vis('[data-addevps]'), tabela: vis('table.hh'), graf: vis('.tl-graf'), rodape: !!document.querySelector('.lc-rodape [data-hhps=""]'),
        audit: (db().audit || db().auditLog || []).some(a => a.field === 'modoLanc') }; });
    assert.deepEqual(t, { mt: true, total: true, parada: true, tabela: false, graf: false, rodape: false, audit: true });
    await f.click('[data-addevps]'); await f.locator('.modal.on, .overlay, dialog[open]').last().waitFor(); await page.keyboard.press('Escape'); await f.evaluate(() => document.querySelectorAll('.overlay,.modal.on').forEach(x => x.remove()));
    await f.click('[data-modolanc="hh"]'); await confirmar(true); await f.waitForFunction(() => !curDay().modoLanc);
    await f.waitForSelector('.lc-rodape [data-hhps=""]', { timeout: 5000 });   /* Abrir hora a hora volta no modo Hora a hora */
    console.log('ok Lançamento: Hora a hora / Por turno com confirmação; nada apagado; total e paradas do turno; auditoria');
    /* 3) Scrap: Diário sugere a soma dos turnos e guarda os valores por turno; voltar traz tudo; a conta usa só o modo atual */
    await f.click('[data-scrapmode="day"]'); const s1 = await confirmar(true); assert.match(s1, /soma dos turnos/); assert.match(s1, /ficam guardados e deixam de contar/);
    await f.waitForFunction(() => curDay().scrapMode === 'day');
    const e2 = await estado(); const soma = e0.ps.reduce((a, b) => a + (b || 0), 0);
    assert.equal(e2.scrapDay, soma, 'Diário com a soma dos turnos'); assert.deepEqual(e2.ps, e0.ps, 'valores por turno guardados'); assert.equal(Math.round(e2.scrap), soma);
    await f.fill('[data-dayscrap]', String(soma + 100)); await f.press('[data-dayscrap]', 'Tab'); await f.waitForFunction(v => curDay().scrapDay === v, soma + 100);
    assert.equal(Math.round((await estado()).scrap), soma + 100, 'conta só o diário');
    await f.click('[data-scrapmode="shift"]'); const s2 = await confirmar(true); assert.match(s2, /fica guardado e deixa de contar/);
    await f.waitForFunction(() => curDay().scrapMode === 'shift');
    const e3 = await estado(); assert.deepEqual([e3.ps, e3.scrapDay], [e0.ps, soma + 100], 'voltar a Por turno: os dois valores guardados'); assert.equal(Math.round(e3.scrap), soma, 'conta só os turnos');
    await f.click('[data-scrapmode="day"]'); await confirmar(true); await f.waitForFunction(() => curDay().scrapMode === 'day');
    assert.equal((await estado()).scrapDay, soma + 100, 'voltar a Diário traz o valor guardado (sem somar de novo)');
    console.log('ok Scrap: Por turno / Diário sem apagar nada; a conta usa só o modo atual');
    /* 4) hora extra num turno só: selo no topo do turno e tempo do turno ajustado */
    const hx = await f.evaluate(async () => { const d = curDay(), ps = d.shifts[0], L = HoraExtra.limites(ps), antes = Engine.computeDay(db(), d).shifts[0].r.netMin;
      Actions.addInterval(d.id, ps.id, L.s - 60, L.s, 'extra'); render(); await new Promise(r => setTimeout(r, 200));
      const R = Engine.computeDay(db(), curDay()); return { antes, depois: R.shifts[0].r.netMin, outro: R.shifts[1].r.netMin, selos: [...document.querySelectorAll('section.tl')].map(s => [s.dataset.tl === ps.id, s.querySelectorAll('.tl-hxselo').length]) }; });
    assert.equal(hx.depois - hx.antes, 60, 'turno com hora extra: +60 min'); assert.deepEqual(hx.selos.filter(x => x[1]).map(x => x[0]), [true], 'selo só no turno com hora extra');
    console.log('ok hora extra só no 1º turno: selo e +60 min no tempo do turno');
    /* 5) modo Dia (itens 3.1 e 4): produção só no dia, sem rateio; turnos fora das visões por turno e hora a hora, dentro dos totais */
    await f.evaluate(async () => { const d = curDay(); const ps = d.shifts[0]; const x = HoraExtra.doTurno(ps)[0]; if (x) Actions.deleteInterval(d.id, x.id); render(); await new Promise(r => setTimeout(r, 150)); });
    const base = await estado();
    await f.click('[data-modolanc="dia"]'); const m1 = await confirmar(true); assert.match(m1, /só no dia, sem divisão por turno ou hora/); assert.match(m1, /Nada é apagado/);
    await f.waitForFunction(() => curDay().modoLanc === 'dia'); await f.waitForSelector('#diaBloco');
    await f.fill('input[data-lancdia="good"]', '800'); await f.press('input[data-lancdia="good"]', 'Tab'); await f.waitForFunction(() => curDay().lancDia && curDay().lancDia.good === 800000);
    const md = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), r = res.r, tT = Engine.periodResult(db(), [day], { shiftId: day.shifts[0].shiftId });
      const ex = Store.exportsFor ? null : null;
      return { good: r.good, oee: r.oee, cap: r.cap, net: r.netMin, scrapMode: day.scrapMode, turnos: res.shifts.map(s => [s.porDia, s.r.good, s.r.oee]), horas: HHComum.pontos(day, res).length, tT: [tT.good, tT.cap, tT.diasPorDia],
        tela: { turnos: document.querySelectorAll('section.tl, .tr-faixa').length, rodape: !!document.querySelector('.lc-rodape [data-hhps=""]'), scrapTravado: document.querySelector('[data-scrapmode="shift"]').disabled },
        guardado: day.shifts.map(p => p.intervals.filter(i => !i.deleted && i.good != null).length) }; });
    assert.equal(md.good, 800000); assert.ok(Math.abs(md.oee - 800000 / md.cap) < 1e-12, 'OEE do dia = produção ÷ capacidade (o mesmo agregado)'); assert.equal(md.net, base.netMin ?? md.net);
    assert.deepEqual(md.turnos, [[true, null, null], [true, null, null]], 'turnos do dia lançado por dia: vazio, não zero'); assert.equal(md.horas, 0, 'fora do hora a hora');
    assert.deepEqual(md.tT, [0, 0, 1], 'visão por turno: o dia não entra e é contado'); assert.equal(md.scrapMode, 'day'); assert.deepEqual(md.tela, { turnos: 0, rodape: false, scrapTravado: true });
    assert.deepEqual(md.guardado, base.horas, 'as horas lançadas ficam guardadas');
    /* abono do dia: desconta do tempo planejado do dia, sem rateio; abono por turno fica guardado e não conta no modo Dia */
    const ab0 = await f.evaluate(() => Engine.computeDay(db(), curDay()).r.netMin);
    await f.click('[data-diaevnovo="abono"]'); const dm = f.locator('.modal.on, .overlay, dialog[open]').last(); await dm.waitFor(); await dm.locator('#deM').fill('30'); await dm.locator('#deOk').click();
    await f.waitForFunction(n => Engine.computeDay(db(), curDay()).r.netMin === n - 30, ab0);
    await f.click('[data-diaevnovo="parada"]'); const dp = f.locator('.modal.on, .overlay, dialog[open]').last(); await dp.waitFor(); await dp.locator('#deC').selectOption({ index: 1 }); await dp.locator('#deM').fill('20'); await dp.locator('#deOk').click();
    await f.waitForFunction(() => curDay().events.filter(e => !e.deleted && e.nivel === 'dia').length === 2);
    const semana = await f.evaluate(() => { const d = curDay(), ds = db().productionDays.filter(x => !x.deleted && x.lineId === d.lineId && x.date >= U.addDays(d.date, -6) && x.date <= d.date), tot = Engine.periodResult(db(), ds), soma = ds.reduce((a, x) => a + Engine.computeDay(db(), x).r.good, 0); return { tot: tot.good, soma, n: ds.length, nota: notaPorDia(ds) }; });
    assert.equal(semana.tot, semana.soma, 'total da semana soma o dia lançado por dia'); assert.match(semana.nota, /1 dia\(s\) lançado\(s\) por dia não entram nesta visão/);
    /* sair do modo Dia: a produção, a parada e o abono do dia ficam guardados e deixam de contar; voltar traz de volta */
    await f.click('[data-modolanc="hh"]'); const m2 = await confirmar(true); assert.match(m2, /ficam guardados e deixam de contar/);
    await f.waitForFunction(() => !curDay().modoLanc);
    const volta = await estado(); assert.deepEqual([volta.good, volta.horas], [base.good, base.horas], 'de volta ao hora a hora: os números de antes');
    await f.click('[data-modolanc="dia"]'); await confirmar(true); await f.waitForFunction(() => curDay().modoLanc === 'dia');
    const de = await f.evaluate(() => { const r = Engine.computeDay(db(), curDay()).r; return [r.good, curDay().events.filter(e => !e.deleted && e.nivel === 'dia').length]; });
    assert.deepEqual(de, [800000, 2], 'voltar ao modo Dia traz a produção, a parada e o abono do dia');
    /* a aba Hora a hora explica o dia lançado por dia */
    await f.evaluate(() => go('hourly')); await f.waitForFunction(() => /lançado por dia/.test(document.querySelector('#main').textContent));
    await f.evaluate(() => go('launch'));
    console.log('ok modo Dia: só no dia, sem rateio; fora das visões por turno e hora a hora, dentro da semana; abono e parada do dia; nada se perde ao trocar');
    /* 6) Segurança e qualidade do dia (modo Dia, turno opcional) e obrigatórias para fechar o dia a partir de 21/11/2026 */
    await f.evaluate(() => { const d = curDay(); if (d.modoLanc !== 'dia') Actions.setModoLanc(d.id, 'dia'); render(); }); await f.waitForSelector('#diaSq .sq-ocorrencias[data-sq-turno="__dia"]');
    const ob = await f.evaluate(() => { const d = curDay(), real = d.date; d.date = '2026-11-21'; const c1 = Actions.closingCheck(db(), d, null); d.date = '2025-01-10'; const c0 = Actions.closingCheck(db(), d, null); d.date = real;
      return { bloqueia: c1.blocking && c1.msgs.some(m => m.ref && m.ref.sq === 'dia'), antigo: c0.msgs.some(m => m.ref && m.ref.sq) }; });
    assert.deepEqual(ob, { bloqueia: true, antigo: false }, 'obrigatório desde a versão; dia antigo não trava');
    /* preenche e salva num passo só: um render assíncrono entre passos refaria o formulário e apagaria as respostas */
    await f.evaluate(() => { const q = s => document.querySelector('#diaSq ' + s), set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      set(q('[data-sq-resp="acidente"]'), 'nao'); set(q('[data-sq-resp="qn"]'), 'sim'); set(q('[data-sq-qtd="qn"]'), '1');
      const t = q('[data-sq-turnoopt="qn"]'); set(t, t.options[2].value); q('[data-sq-salvar]').click(); }); await f.waitForFunction(() => curDay().sqdcpDia && curDay().sqdcpDia.qn);
    const sq = await f.evaluate(() => { const d = curDay(), real = d.date; d.date = '2026-11-21'; const c = Actions.closingCheck(db(), d, null); d.date = real;
      const rows = SQDCPModelo.linhas(db(), d.date, d.date, d.lineId, '', Engine, U), porT = SQDCPModelo.linhas(db(), d.date, d.date, d.lineId, d.shifts[1].shiftId, Engine, U), outro = SQDCPModelo.linhas(db(), d.date, d.date, d.lineId, d.shifts[0].shiftId, Engine, U);
      return { libera: !c.msgs.some(m => m.ref && m.ref.sq), dia: d.sqdcpDia.qn.turno === d.shifts[1].shiftId, rows: rows.map(r => [r.nivel, r.turno, r.acidente && r.acidente.resposta, r.qn && r.qn.resposta]), porT: porT.length, outro: outro.length }; });
    assert.equal(sq.libera, true, '"Não houve" e QN registrada liberam o fechamento'); assert.ok(sq.dia, 'turno opcional da QN guardado');
    assert.deepEqual(sq.rows.length, 1, 'uma linha do dia (sem contar duas vezes)'); assert.equal(sq.rows[0][0], 'dia'); assert.deepEqual([sq.porT, sq.outro], [1, 0], 'por turno: só o que tem turno informado');
    /* Hora a hora: cada turno produtivo precisa responder; o aviso leva ao campo do turno */
    const hh = await f.evaluate(async () => { const d = curDay(); Actions.setModoLanc(d.id, 'hh'); const ps = d.shifts[0], bk = ps.sqdcp; ps.sqdcp = null; const real = d.date; d.date = '2026-11-21'; const c = Actions.closingCheck(db(), d, null); d.date = real; ps.sqdcp = bk;
      return { erro: c.msgs.filter(m => m.level === 'erro' && m.ref && m.ref.sq === ps.id).length, btn: /Ir para Segurança e qualidade/.test(Ajuste.html(c.msgs.find(m => m.ref && m.ref.sq), {})) }; });
    assert.deepEqual(hh, { erro: 1, btn: true }, 'turno sem resposta bloqueia e tem o botão');
    console.log('ok Segurança e qualidade: obrigatórias para fechar (desde 21/11/2026), do dia no modo Dia com turno opcional, sem contar duas vezes');
    /* 7) Excluir dia também em dia fechado (pedido do responsável) */
    const ex = await f.evaluate(async () => { const d = curDay(), st = d.status; d.status = 'fechado'; render(); await new Promise(r => setTimeout(r, 120)); const tem = !!document.querySelector('#dMaisMenu #dDel'); d.status = st; render(); return tem; });
    assert.equal(ex, true, 'Excluir dia no menu de um dia fechado');
    console.log('ok Excluir dia disponível também em dia fechado');
    /* 8) virada da meia-noite: Dia desligado (decisão 1) */
    const vir = await f.evaluate(async () => { const d = curDay(); Actions.setModoLanc(d.id, 'hh'); const ps = d.shifts[d.shifts.length - 1], iv = ps.intervals.filter(i => !i.deleted).sort((a, b) => b.end - a.end)[0], e0 = iv.end;
      iv.end = 1450; const m = Actions.viradaImpede(db(), d); let erro = ''; try { Actions.setModoLanc(d.id, 'dia'); } catch (e) { erro = e.message; } iv.end = e0; return { m, erro }; });
    assert.match(vir.m, /passa da meia-noite/); assert.match(vir.erro, /passa da meia-noite/);
    console.log('ok modo Dia desligado quando um turno passa da meia-noite');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
