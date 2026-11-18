// Plataforma 1.8.12 (Produção 2.6.9) · LANC-02: Lançamento unificado. Os três turnos lado a lado (o 3º não produtivo também); o
// detalhe do turno com a faixa de números, "Uma vez por turno" (Segurança, Qualidade, ABONO/REVEZAMENTO, Observações) e o hora a
// hora do turno; gráfico recolhível; "Ver o dia inteiro (24 h)"; aba Hora a hora fora da navegação; cards de produção por turno;
// servidor ao lado dos lotes; líder sugerido; aviso de salvo e Problemas de QN. Dados fictícios (demonstração).
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
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    const w = ms => page.waitForTimeout(ms || 400);

    // 0) o 3º turno da demonstração passa a ser não produtivo e vigente (só na memória desta página; nada é gravado)
    await f.evaluate(() => { const sh = db().shifts.find(s => s.code === 'T3'); sh.versions.forEach(v => { v.active = true; v.productive = false; }); Engine.bumpConfig && Engine.bumpConfig(); App.prefs.kcOff = []; delete App.prefs.lcTurno; render(); });
    await w();

    // 1) três cartões lado a lado (mesma linha), o 3º não produtivo; clicar abre, clicar de novo fecha, outro troca
    const fx = await f.evaluate(() => { const B = [...document.querySelectorAll('.tr-faixa [data-trturno]')]; return { n: B.length, tops: [...new Set(B.map(b => Math.round(b.getBoundingClientRect().top)))].length, np: B.filter(b => b.classList.contains('np')).map(b => b.textContent.replace(/\s+/g, ' ').trim()) }; });
    assert.equal(fx.n, 3, 'três cartões'); assert.equal(fx.tops, 1, 'na mesma linha'); assert.match(fx.np[0] || '', /3º Turno.*não produtivo/);
    console.log('ok três turnos lado a lado, o 3º não produtivo: ' + fx.np[0].slice(0, 60));
    const ids = await f.evaluate(() => [...document.querySelectorAll('[data-trturno]')].map(b => b.dataset.trturno));
    const aberto = () => f.evaluate(() => [...document.querySelectorAll('section.tl[data-tl]')].filter(s => !s.classList.contains('tr-oculto')).map(s => s.dataset.tl));
    await f.click(`[data-trturno="${ids[0]}"]`); await w(200); if ((await aberto())[0] !== ids[0]) { await f.click(`[data-trturno="${ids[0]}"]`); await w(200); }
    assert.deepEqual(await aberto(), [ids[0]], 'clicar abre o detalhe');
    await f.click(`[data-trturno="${ids[0]}"]`); await w(200); assert.deepEqual(await aberto(), [], 'clicar de novo fecha');
    await f.click(`[data-trturno="${ids[2]}"]`); await w(200); assert.deepEqual(await aberto(), [ids[2]], 'o 3º turno abre o próprio detalhe');
    const np = await f.evaluate(id => { const s = document.querySelector(`section.tl[data-tl="${id}"]`); return { hab: !!s.querySelector('[data-turnonp]'), txt: s.textContent.replace(/\s+/g, ' ') }; }, ids[2]);
    assert.ok(np.hab && /Habilitar 3º Turno neste dia/.test(np.txt), 'detalhe do 3º turno com "Habilitar 3º turno neste dia"');
    console.log('ok clicar abre, clicar de novo fecha, outro troca; 3º turno com "Habilitar 3º turno neste dia"');

    // 2) produção fora do turno: só a janela do dia escolhido
    const ft = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day); return LancNP.grupos(day, res).flatMap(g => g.itens).every(i => i.data === day.date); });
    assert.ok(ft, 'fora do turno respeita o dia'); console.log('ok produção fora do turno só da janela do dia');

    // 3) detalhe do turno: faixa, 1/3 à esquerda e 2/3 à direita, gráfico recolhível
    await f.click(`[data-trturno="${ids[1]}"]`); await w(300);
    const d = await f.evaluate(id => {
      const s = document.querySelector(`section.tl[data-tl="${id}"]`), e = s.querySelector('.tl-esq'), r = s.querySelector('.tl-dir'), tx = x => x ? x.textContent.replace(/\s+/g, ' ') : '';
      const day = curDay(), ps = day.shifts.find(p => p.id === id);
      return { faixa: ['Catálogo', 'Responsável', 'Produção dentro do turno', 'Tempo planejado', 'Scrap', 'Paradas', 'OEE reportado', 'OEE real', 'D · P · Q'].filter(k => !tx(s.querySelector('.tl-strip')).includes(k)),
        esq: ['Segurança', 'Qualidade', 'ABONO/REVEZAMENTO', 'Turno sem produção', 'Observações do turno', 'Salvar segurança e qualidade'].filter(k => !tx(e).includes(k)),
        larg: e.getBoundingClientRect().width / r.getBoundingClientRect().width, ladoAlado: Math.abs(e.getBoundingClientRect().top - r.getBoundingClientRect().top) < 40 && e.getBoundingClientRect().left < r.getBoundingClientRect().left,
        hh: r.querySelectorAll('input[data-good]').length, ivs: ps.intervals.filter(i => !i.deleted).length, tot: /Produção total do turno/i.test(tx(r)), ligado: /ligado/.test(tx(r.querySelector('.tl-dhd'))),
        cols: r.querySelectorAll('table.hh thead th').length, graf: !!s.querySelector('details[data-lcgraf] svg'), cores: [getComputedStyle(e.querySelector('.sq-k-acidente')).borderLeftColor, getComputedStyle(e.querySelector('.sq-k-qn')).borderLeftColor] };
    }, ids[1]);
    assert.deepEqual(d.faixa, [], 'faixa com os números do turno'); assert.deepEqual(d.esq, [], 'uma vez por turno à esquerda');
    assert.ok(d.ladoAlado && d.larg > 0.3 && d.larg < 0.5, '1/3 à esquerda e 2/3 à direita (' + d.larg.toFixed(2) + ')');
    assert.equal(d.hh, d.ivs, 'hora a hora do turno com todos os intervalos'); assert.ok(d.tot && d.ligado && d.cols === 13, 'Produção total do turno no topo, "ligado" e todas as colunas');
    assert.ok(d.graf, 'gráfico Atendimento hora a hora'); assert.deepEqual(d.cores, ['rgb(22, 128, 60)', 'rgb(23, 105, 210)'], 'Segurança verde e Qualidade azul do SQDCP');
    await f.evaluate(id => { document.querySelector(`section.tl[data-tl="${id}"] details[data-lcgraf] summary`).click(); }, ids[1]); await w(200);
    assert.equal(await f.evaluate(() => App.prefs.lcGraf), 'fechado', 'gráfico recolhido fica lembrado');
    await f.evaluate(() => { App.prefs.lcGraf = 'aberto'; savePrefs(); });
    console.log('ok detalhe: faixa, 1/3 + 2/3 (' + d.larg.toFixed(2) + '), hora a hora com ' + d.hh + ' intervalos e 13 colunas, gráfico recolhível, cores do SQDCP');

    // 4) lançar produção no hora a hora do detalhe (Enter grava e desce)
    const iv = await f.evaluate(id => { const ps = curDay().shifts.find(p => p.id === id); const i = ps.intervals.filter(x => !x.deleted)[1]; return { id: i.id, antes: i.good }; }, ids[1]);
    await f.fill(`section.tl[data-tl="${ids[1]}"] input[data-good="${iv.id}"]`, '33'); await f.press(`section.tl[data-tl="${ids[1]}"] input[data-good="${iv.id}"]`, 'Enter'); await w(600);
    const gv = await f.evaluate(i => curDay().shifts.flatMap(p => p.intervals).find(x => x.id === i).good, iv.id);
    assert.equal(gv, 33 * (db => db.settings.entryUnit || 1)(await f.evaluate(() => ({ settings: db().settings }))), 'produção gravada pelo hora a hora do detalhe');
    console.log('ok produção lançada no hora a hora do detalhe do turno');

    // 5) Segurança e Qualidade: campos só com "Sim"; Problema da lista de Configurações; aviso de salvo visível
    await f.evaluate(() => Actions.setSettings({ qnProblemas: ['Tampa solta', 'Rótulo ilegível'] })); await w(400);
    await f.click(`[data-trturno="${ids[0]}"]`); await w(300);
    const box = `.sq-ocorrencias[data-sq-turno="${ids[0]}"]`;
    await f.selectOption(`${box} [data-sq-resp="qn"]`, 'nao');
    assert.equal(await f.locator(`${box} [data-sq-detalhe="qn"]`).isHidden(), true, 'QN "Não houve": campos escondidos');
    await f.selectOption(`${box} [data-sq-resp="qn"]`, 'sim');
    assert.equal(await f.locator(`${box} [data-sq-detalhe="qn"]`).isVisible(), true, 'QN "Sim": campos aparecem');
    assert.deepEqual(await f.evaluate(b => [...document.querySelectorAll(b + ' [data-sq-prob="qn"] option')].map(o => o.textContent), box), ['— escolha —', 'Tampa solta', 'Rótulo ilegível']);
    await f.selectOption(`${box} [data-sq-prob="qn"]`, 'Rótulo ilegível'); await f.fill(`${box} [data-sq-resumo="qn"]`, 'Lote fictício');
    await f.selectOption(`${box} [data-sq-resp="acidente"]`, 'sim');
    assert.equal(await f.locator(`${box} [data-sq-detalhe="acidente"] [data-sq-resumo="acidente"]`).isVisible(), true, 'Segurança "Sim": observação aparece');
    await f.selectOption(`${box} [data-sq-resp="acidente"]`, 'nao');
    await f.click(`${box} [data-sq-salvar]`); await w(800);
    const sq = await f.evaluate(([b, id]) => ({ txt: document.querySelector(b + ' [data-sq-ult]').textContent, q: curDay().shifts.find(p => p.id === id).sqdcp.qn }), [box, ids[0]]);
    assert.match(sq.txt, /^✓ Salvo · último registro: .+ · \d{2}\/\d{2}\/\d{4}/); assert.equal(sq.q.problema, 'Rótulo ilegível'); assert.equal(sq.q.resumo, 'Lote fictício');
    console.log('ok S&Q: campos só com Sim, Problema da lista (' + sq.q.problema + ') e aviso "' + sq.txt + '"');

    // 6) Configurações › Problemas de QN
    await f.evaluate(() => { App.cfgSec = 'qn'; go('config'); }); await w(500);
    assert.match(await f.evaluate(() => document.querySelector('#qnLista').value), /Tampa solta\nRótulo ilegível/);
    await f.fill('#qnLista', 'Tampa solta\nVolume baixo\nTampa solta'); await f.click('#qnSave'); await w(500);
    assert.deepEqual(await f.evaluate(() => db().settings.qnProblemas), ['Tampa solta', 'Volume baixo'], 'lista sem repetição');
    console.log('ok Configurações › Problemas de QN');

    // 7) líder sugerido pelo histórico do mesmo turno
    await f.evaluate(() => go('launch')); await w(400);
    const sug = await f.evaluate(async () => {
      const day = curDay(), ps = day.shifts.find(p => !p.deleted && !p.responsible && p.snap.code); if (!ps) return null;
      /* a demonstração só tem o dia de hoje: três dias anteriores fictícios, só na memória desta página */
      [1, 2, 3].forEach(k => { const c = JSON.parse(JSON.stringify(day)); c.id = 'pd_teste_' + k; c.date = U.addDays(day.date, -k); c.shifts.find(p => p.snap.code === ps.snap.code).responsible = k === 2 ? 'Pessoa B' : 'Pessoa A'; db().productionDays.push(c); });
      render(); await new Promise(r => setTimeout(r, 300));
      const inp = document.querySelector(`[data-psf="${ps.id}|responsible"]`), ok = document.querySelector(`[data-respok="${ps.id}"]`);
      return { id: ps.id, v: inp.value, sug: inp.classList.contains('tl-sug'), ok: !!ok, gravado: ps.responsible || '' };
    });
    assert.ok(sug && sug.v === 'Pessoa A' && sug.sug && sug.ok && sug.gravado === '', 'sugestão do mais frequente, sem gravar sozinho ' + JSON.stringify(sug));
    await f.evaluate(id => document.querySelector(`[data-respok="${id}"]`).click(), sug.id); await w(500);
    assert.equal(await f.evaluate(id => curDay().shifts.find(p => p.id === id).responsible, sug.id), 'Pessoa A', 'confirmar grava');
    console.log('ok líder sugerido (Pessoa A, 2 dos últimos 3) e confirmado');

    // 8) cards de produção por turno, servidor ao lado dos lotes
    const k = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day); return res.shifts.map(sr => { const c = [...document.querySelectorAll('.kpis > .kpi')].find(x => KC.chave(x) === 'Produção · ' + sr.ps.snap.name); return c ? c.querySelector('.v').textContent === fq(sr.r.good) + unitLbl() : false; }); });
    assert.ok(k.length >= 2 && k.every(Boolean), 'um card de produção por turno com o número do cálculo');
    const sl = await f.evaluate(() => { const a = document.querySelector('#srvCard'), b = document.querySelector('#lcLotT'); if (!a || !b) return null; const ra = a.getBoundingClientRect(), rb = b.closest('section').getBoundingClientRect(); return Math.abs(ra.top - rb.top) < 5 && rb.left > ra.left; });
    assert.ok(sl, 'Produção registrada no servidor ao lado de Lotes do dia');
    console.log('ok cards de produção por turno e servidor ao lado dos lotes');

    // 9) aba Hora a hora fora da navegação; "Ver o dia inteiro (24 h)" abre o dia inteiro
    assert.ok(await f.evaluate(() => !visibleRoutes().some(([k]) => k === 'hourly')), 'Hora a hora fora da navegação');
    await f.click('[data-dia24]'); await w(500);
    assert.deepEqual(await f.evaluate(() => [App.route, HHPs.id(curDay())]), ['hourly', 'dia'], 'dia inteiro (24 h)');
    console.log('ok aba Hora a hora fora da navegação; "Ver o dia inteiro (24 h)" abre o dia inteiro');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok Lançamento unificado: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
