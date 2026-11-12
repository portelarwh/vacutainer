// Produção 2.4.66 (12/11/2026): e-mail do turno e do dia para o Outlook (fontes/producao/email_dia.js).
// - mesmos números do cálculo (Engine.computeDay): OEE reportado do turno, acumulado do dia, produção, D/P/Q;
// - medidor do OEE em PNG, gráfico hora a hora alto, paradas em barras, Segurança e Qualidade uma vez só;
// - formato de e-mail: tabelas, 680 px, sem script/svg/flex/grid; "Itens do e-mail" grava o layout por computador;
// - relatório da tela (dia e turno) sem o bloco repetido do SQDCP.
// Dados fictícios (modo exemplo). Prints em testes/saida/email/. node testes/temail.js → "sem erros"; código 1 se falhar
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..') + '/', PG = 'file://' + RAIZ + 'paginas/OEE-Vacutainer.html', SAI = RAIZ + 'testes/saida/email/'; fs.mkdirSync(SAI, { recursive: true });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const p = await ctx.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(PG); await p.waitForTimeout(1300);
  await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); const d = Store.S.db; for (const k of ['productionDays', 'monthPlans', 'calendar']) (d[k] || []).forEach(x => delete x.demo); Engine.bumpConfig(); document.querySelectorAll('.overlay').forEach(o => o.remove()); delete App.prefs.mailLay; });
  await p.waitForTimeout(400);
  const dia = await p.evaluate(() => db().productionDays.filter(d => !d.deleted && d.status === 'fechado').map(d => d.date).sort().pop());
  const abre = async tipo => { await p.evaluate(([t, d]) => { const R = rpState(); R.type = t; R.date = d; R.summary = null; go('reports'); }, [tipo, dia]); await p.waitForTimeout(1300); };
  const copia = async () => { await p.evaluate(() => { App.rep.lastCopy = null; document.querySelector('#rpOut').click(); }); await p.waitForFunction(() => App.rep.lastCopy && App.rep.lastCopy.html, null, { timeout: 20000 }); return p.evaluate(() => App.rep.lastCopy); };
  const formato = h => /<table role="presentation" width="680"/.test(h) && !/<script|<svg|display:\s*(flex|grid)|<style/i.test(h);
  const conta = (h, t) => h.split(t).length - 1;
  const print = async (h, nome) => { const q = await ctx.newPage(); await q.setViewportSize({ width: 760, height: 800 }); await q.setContent('<meta charset="utf-8"><body style="margin:0">' + h); await q.waitForTimeout(400); await q.screenshot({ path: SAI + nome + '.png', fullPage: true }); const imgs = await q.evaluate(() => [...document.images].map(i => ({ w: i.naturalWidth, h: i.naturalHeight, alt: i.alt, exib: Math.round(i.getBoundingClientRect().height) }))); await q.close(); return imgs; };

  // ---------- turno
  await abre('shift');
  const N = await p.evaluate(() => { const R = App.rep, d = db(), day = d.productionDays.find(z => !z.deleted && z.date === R.date), res = Engine.computeDay(d, day), sr = res.shifts.find(s => s.ps.id === R.psId) || res.shifts[0];
    return { nome: sr.ps.snap.name, oee: U.pct(sr.r.oee), dia: U.pct(res.r.oee), good: fq(sr.r.good), goodDia: fq(res.r.good), D: U.pct(sr.r.D), P: U.pct(sr.r.P), Q: U.pct(sr.r.Q, 2), turnos: res.shifts.map(s => ({ n: s.ps.snap.name, oee: U.pct(s.r.oee), good: fq(s.r.good) })) }; });
  let c = await copia(), h = c.html; fs.writeFileSync(SAI + 'turno.html', h);
  ok(formato(h), 'turno: e-mail em tabelas de 680 px, sem script, SVG, flex, grid nem <style>');
  ok(h.includes('Passagem de turno · ' + N.nome) && h.includes(N.good) && h.includes(N.D) && h.includes(N.P) && h.includes(N.Q), `turno: produção ${N.good} e D/P/Q (${N.D} · ${N.P} · ${N.Q}) iguais aos do cálculo`);
  ok(new RegExp('alt="OEE reportado ' + N.nome + ': ' + N.oee.replace('.', '\\.')).test(h) && new RegExp('alt="OEE reportado acumulado do dia: ' + N.dia).test(h) && h.includes('Acumulado do dia') && h.includes(N.goodDia),
    `turno: medidor do OEE reportado do turno (${N.oee}) e acumulado do dia (${N.dia}; produção ${N.goodDia})`);
  ok(conta(h, 'Segurança e Qualidade') === 1 && !/Segurança e QN por turno/.test(h), 'turno: Segurança e Qualidade aparece uma vez só');
  ok(conta(h, '>Maiores paradas<') === 1 && !/Paradas apontadas|Hora a hora · tabela/.test(h), 'turno: paradas em barras; lista completa e tabela hora a hora ficam fora do padrão');
  let I = await print(h, 'turno'); const g = I.filter(i => /OEE reportado/.test(i.alt)), hh = I.find(i => /por hora/.test(i.alt));
  ok(g.length === 2 && g.every(i => i.w >= 400) && hh && hh.exib >= 230, `turno: 2 medidores em PNG e gráfico hora a hora com ${hh && hh.exib} px de altura no e-mail`);
  ok(/OEE reportado do turno/.test(c.text) && /Acumulado do dia/.test(c.text) && conta(c.text, 'OEE reportado') <= 2, 'turno: texto simples com o OEE do turno e o acumulado do dia');

  // ---------- "Itens do e-mail": desligar, ordenar, gravar, prévia
  await p.click('#rpItens'); await p.waitForFunction(() => { const f = document.querySelector('#emPrev'); return f && f.contentDocument && /Passagem de turno/.test(f.contentDocument.body.innerText || ''); }, null, { timeout: 15000 });
  const lista = () => p.evaluate(() => [...document.querySelectorAll('#emLista .em-it')].map(x => (x.querySelector('input').checked ? '+' : '-') + x.innerText.trim().split('\n')[0].slice(0, 22)));
  const l0 = await lista();
  await p.evaluate(() => { const i = [...document.querySelectorAll('#emLista .em-it')].findIndex(x => /Segurança/.test(x.innerText)); document.querySelector(`[data-emon="${i}"]`).click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const i = [...document.querySelectorAll('#emLista .em-it')].findIndex(x => /Maiores paradas/.test(x.innerText)); document.querySelector(`[data-emup="${i}"]`).click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const i = [...document.querySelectorAll('#emLista .em-it')].findIndex(x => /Tabela hora a hora/.test(x.innerText)); document.querySelector(`[data-emon="${i}"]`).click(); }); await p.waitForTimeout(900);
  const pv = await p.evaluate(() => { const t = document.querySelector('#emPrev').contentDocument.body.innerText; return { sq: /Segurança e Qualidade/.test(t), tab: /Hora a hora · tabela/.test(t), ordem: t.indexOf('Maiores paradas') < t.indexOf('Hora a hora ·') && t.indexOf('Maiores paradas') > 0 }; });
  ok(!pv.sq && pv.tab && pv.ordem, `Itens do e-mail: a prévia segue o que foi marcado (sem Segurança e Qualidade, com a tabela, paradas antes do gráfico); lista ${l0.length} itens`);
  await p.screenshot({ path: SAI + 'itens.png' });
  await p.evaluate(() => document.querySelector('.overlay [data-close]').click()); await p.waitForTimeout(300);
  const gravado = await p.evaluate(() => JSON.stringify((JSON.parse(localStorage.getItem('oee.prefs') || localStorage.getItem('oeeVacPrefs') || 'null') || App.prefs).mailLay || App.prefs.mailLay));
  await abre('day'); await abre('shift'); c = await copia();
  ok(!/Segurança e Qualidade/.test(c.html) && /Hora a hora · tabela/.test(c.html) && /"id":"sq","on":false/.test(gravado), 'o layout fica gravado e vale no próximo "Copiar para Outlook" do turno');
  ok(await p.evaluate(() => { const d = EmailDia.lay('day'); return d.find(x => x.id === 'sq').on && !d.find(x => x.id === 'lista').on; }), 'o layout do dia é separado do layout do turno');
  await p.evaluate(() => { EmailDia.padrao('shift'); });

  // ---------- dia (o e-mail da manhã seguinte)
  await abre('day'); c = await copia(); h = c.html; fs.writeFileSync(SAI + 'dia.html', h);
  ok(formato(h) && h.includes('Resumo do dia') && new RegExp('alt="OEE reportado do dia: ' + N.dia).test(h) && h.includes(N.goodDia), `dia: medidor do OEE reportado do dia (${N.dia}) e produção ${N.goodDia}`);
  ok(/Resultado por turno/.test(h) && N.turnos.every(t => h.includes('<b>' + t.n + '</b>') && h.includes(t.oee) && h.includes(t.good)), `dia: resultado por turno com os números de cada turno (${N.turnos.map(t => t.n + ' ' + t.oee).join(' · ')})`);
  ok(conta(h, 'Segurança e Qualidade') === 1 && !/Segurança e QN por turno|Gap vs meta|Período de /i.test(h) && conta(h, '>Maiores paradas<') === 1, 'dia: sem repetições (Segurança e Qualidade uma vez; sem "Gap vs meta" nem texto repetindo os cartões)');
  I = await print(h, 'dia'); ok(I.filter(i => /OEE reportado/.test(i.alt)).length === 1 && (I.find(i => /por hora/.test(i.alt)) || {}).exib >= 230, 'dia: 1 medidor e gráfico hora a hora alto');
  // sem imagens (opção desmarcada): os números continuam no e-mail
  await p.evaluate(() => { const x = document.querySelector('#rpImg'); if (x.checked) x.click(); }); c = await copia();
  ok(!/<img/.test(c.html) && c.html.includes(N.dia) && /Hora a hora/.test(c.html) && /Horário/.test(c.html), 'sem "gráficos como imagem": OEE em número e hora a hora em tabela, nenhum <img>');
  await p.evaluate(() => { const x = document.querySelector('#rpImg'); if (!x.checked) x.click(); });

  // ---------- relatório da tela sem o bloco repetido; os outros tipos continuam com o e-mail antigo
  for (const t of ['day', 'shift']) { await abre(t); const r = await p.evaluate(() => ({ blocos: App.rep.model.blocks.map(b => b.l), auto: App.rep.model.auto }));
    ok(r.blocos.filter(x => /Segurança/.test(x)).length === 1 && conta(r.auto, 'Segurança') === 1, `relatório da tela (${t}): Segurança e Qualidade uma vez nos blocos e no resumo`); }
  await p.evaluate(() => { const R = rpState(); R.type = 'week'; go('reports'); }); await p.waitForTimeout(1300);
  c = await copia(); ok(!(await p.$('#rpItens')) && /Relatório semanal/.test(c.html) && !/width="680"/.test(c.html), 'relatório semanal: e-mail antigo, sem o botão Itens do e-mail');

  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });
