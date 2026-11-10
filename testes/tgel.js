// Fase 4 do briefing (Gel dentro da Produção). Passo 4a (D10, G2/G3): parâmetros do gel no Portal, lidos pelo Gel sem mudar nenhuma conta.
// node testes/tgel.js → código 1 se alguma conferência falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* ---------- Gel: contas iguais com os parâmetros vindos do Portal ---------- */
  const g = await nova('Gestão-Gel-Vacutainer.html', 'Gel');
  await g.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.removeItem('vac.cadastros'); enterDemo();
    // configuração rica, como a da pasta real (a demonstração vem com os padrões)
    S.config.params = [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }, { from: addDays(todayISO(), -10), g: 0.96, pT: 2.0, pB: 0.7, pP: 0.48 }];
    S.config.fmts = [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }];
    S.config.motivos = [{ id: 'm1', name: 'Gel com bolha', comps: [], active: true }, { id: 'm2', name: 'Etiqueta ruim', comps: ['completo'], active: true }];
    S.config.equips = [{ id: 'eq-1', name: 'Máquina de gel', tara: 80, active: true, descs: [{ id: 'd1', comp: 'tubogel', cat: 'T', mots: ['m1'] }, { id: 'd2', comp: 'gel', cat: 'P' }] }];
    S.catalogs.forEach((k, i) => { k.fmt = i % 2 ? '75' : '100'; k.lotSize = 900000; k.rateH = 38000 + i; k.vig = [{ from: '2000-01-01', gTubo: 0.85 + i / 100, bomKg: 8.84, bomBase: 10000, tol: 6 }, { from: addDays(todayISO(), -5), gTubo: 0.86 + i / 100, bomKg: 8.9, bomBase: 10000, tol: 6 }]; });
    render(); });
  const marca = () => g.evaluate(() => { const ex = gelExports(); delete ex.geradoEm; const h = todayISO();
    const dias = Object.keys(S.prodlog || {}).sort().slice(-6).map(d => { const r = prodCalc(d, S.prodlog[d]); return [d, JSON.stringify(r, (k, v) => typeof v === 'function' ? undefined : v)]; });
    const cats = S.catalogs.map(c => [c.num, gelReal(c.id, h), JSON.stringify(bomInfo(c.id, h)), gelReal(c.id, addDays(h, -8)), catFmt(c.id)]);
    return JSON.stringify({ ex, dias, cats, p: [paramsAt(h), paramsAt(addDays(h, -20))], f: fmtAt(h), sob: sobraAt(h), mot: motList(), eq: S.config.equips.map(e => [e.tara, e.descs]) }); });
  const g0 = await marca();
  const nDias = await g.evaluate(() => Object.keys(S.prodlog || {}).length);
  await g.evaluate(() => {   // o mesmo conteúdo, agora no cadastro do Portal (como o Trazer configurações deixa)
    const C = { schema: 'vac-cadastros', rev: 8, parametros: { gel: { processo: JSON.parse(JSON.stringify(S.config.params)), formatos: JSON.parse(JSON.stringify(S.config.fmts)), motivos: JSON.parse(JSON.stringify(S.config.motivos)), registroPelaProducaoDesde: '2026-12-01' } },
      equipamentos: [{ codigo: 'EQ90', nome: 'Máquina de gel', ativo: true, categoria: 'gel', gel: { tara: 80, descs: JSON.parse(JSON.stringify(S.config.equips[0].descs)) } }],
      catalogos: S.catalogs.map(k => ({ codigo: k.num, tipoItem: 'tubo', nome: k.desc, cor: k.color, ativo: k.active !== false, formato: '13x' + k.fmt, gel: { fmt: k.fmt, lotSize: k.lotSize, rateH: k.rateH, vig: JSON.parse(JSON.stringify(k.vig)) } })), materiais: [], bom: [] };
    // a cópia local do Gel é zerada: tudo tem que vir do Portal
    S.config.params = []; S.config.fmts = []; S.config.motivos = []; S.config.equips[0].descs = []; S.config.equips[0].tara = ''; S.catalogs.forEach(k => { k.vig = []; k.fmt = '100'; k.lotSize = null; k.rateH = null; });
    localStorage.setItem('vac.cadastros', JSON.stringify(C)); render(); });
  const g1 = await marca();
  ok(nDias > 0, `GEL-06: base de exemplo com ${nDias} dia(s) de registro para comparar`);
  ok(g0 === g1, 'GEL-06 / 4a: com processo, formatos, motivos, descartes e gel do catálogo vindos do Portal, todas as contas do gel dão os mesmos números');
  const mud = await g.evaluate(() => { const C = JSON.parse(localStorage.getItem('vac.cadastros')); const h = todayISO(); const antes = paramsAt(h).pT;
    C.parametros.gel.processo.push({ from: addDays(h, -1), g: 0.96, pT: 3.5, pB: 0.7, pP: 0.48 }); localStorage.setItem('vac.cadastros', JSON.stringify(C)); render(); return [antes, paramsAt(h).pT, paramsAt(addDays(h, -3)).pT]; });
  ok(mud[0] === 2.0 && mud[1] === 3.5 && mud[2] === 2.0, '4a: vigência nova de perdas no Portal vale da data dela em diante (dias anteriores ficam com a anterior)');
  const trav = await g.evaluate(async () => { const r = {}; for (const sec of ['proc', 'fmts', 'motivos', 'equip']) { openConfig(sec); await new Promise(x => setTimeout(x, 60)); const b = document.querySelector('#ov .cfgbody');
      r[sec] = { banner: /cadastro geral do Portal/.test(b.innerText), livres: [...b.querySelectorAll('input,select,textarea,button')].filter(el => !el.disabled && !el.closest('a') && el.id !== 'ctPortal').length }; }
    document.querySelectorAll('.overlay').forEach(o => o.remove()); return r; });
  for (const [sec, r] of Object.entries(trav)) ok(r.banner && r.livres === 0, `4a: Gel › Configuração › ${sec} só consulta, com "Editar no Portal" (livres: ${r.livres})`);
  await g.evaluate(() => localStorage.removeItem('vac.cadastros'));

  /* ---------- Portal: Parâmetros › Gestão de Gel, fichas e migração ---------- */
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(300);
  await po.evaluate(() => { location.hash = '#cadastros/parametros'; }); await po.waitForTimeout(500);
  ok(await po.evaluate(() => !!document.querySelector('#parGel') && !document.querySelector('#pgOk')), '4a Portal: Parâmetros tem o grupo Gestão de Gel (só consulta sem a senha)');
  await po.evaluate(() => { Lock.on(Cad.D.seguranca.senhaHash); App.render(); }); await po.waitForTimeout(300);
  await po.click('#parGel [data-pgadd="processo"]'); await po.waitForTimeout(200);
  await po.fill('#parGel [data-pg="processo.0.pT"]', '2.5'); await po.fill('#parGel [data-pg="registroPelaProducaoDesde"]', '2026-12-01');
  await po.click('#parGel [data-pgadd="motivos"]'); await po.waitForTimeout(200); await po.fill('#parGel [data-pg="motivos.0.name"]', 'Gel com bolha');
  await po.click('#pgOk'); await po.waitForTimeout(600);
  const pg = await po.evaluate(() => (Cad.D.parametros || {}).gel || null), hoje = await po.evaluate(() => todayISO());
  ok(pg && pg.processo && pg.processo[0].pT === 2.5 && pg.processo[0].from === hoje && pg.registroPelaProducaoDesde === '2026-12-01' && pg.motivos[0].name === 'Gel com bolha' && /^m-/.test(pg.motivos[0].id), '4a Portal: grava parametros.gel (perdas com vigência a partir de hoje, motivos com id, data de corte G3)');
  const recusa = await po.evaluate(() => { App.render(); const W = ParGel.W; W.processo[0].from = '2020-01-01'; W.processo[0].pT = 9; $('#pgOk').click(); return Cad.D.parametros.gel.processo[0].pT; });
  ok(recusa === 2.5, '4a Portal: vigência gravada não muda (data no passado é recusada)');
  await po.waitForTimeout(1200);
  const ficha = await po.evaluate(async () => { const e = Cad.D.equipamentos[0]; location.hash = '#cadastros/equipamentos/' + e.codigo; await new Promise(r => setTimeout(r, 400));
    const sel = document.querySelector('#fBox [data-p="categoria"]'); sel.value = 'gel'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 200));
    const temBloco = /Gel: embalagem e descartes/i.test(document.querySelector('#fBox').innerText); const add = document.querySelector('#fBox [data-add="gel.descs"]'); if (add) add.click(); await new Promise(r => setTimeout(r, 150));
    const mot = document.querySelector('#fBox [data-p="gel.descs.0.mots"]'); if (mot) { mot.checked = true; mot.dispatchEvent(new Event('change', { bubbles: true })); }
    const W = Ficha.W; const c = Cad.D.catalogos.find(x => x.tipoItem !== 'preparacao'); Ficha.fechar && Ficha.fechar(); location.hash = '#cadastros/catalogos/' + c.codigo; await new Promise(r => setTimeout(r, 400));
    return { temBloco, descs: (W.gel || {}).descs, cat: /Gel do catálogo|<b>Gel<\/b>/.test(document.querySelector('#fBox').innerHTML) || /\bGel\b/.test(document.querySelector('#fBox details.cd summary') ? document.querySelector('#fBox').innerText : '') }; });
  if (!(ficha.temBloco && ficha.descs && ficha.descs.length === 1)) console.log('ficha:', JSON.stringify(ficha));
  ok(ficha.temBloco && ficha.descs && ficha.descs.length === 1 && (ficha.descs[0].mots || []).length === 1, '4a Portal: ficha do Equipamento – Gel com embalagem e descartes (composição, categoria e motivos do gel)');
  ok(ficha.cat, '4a Portal: ficha do catálogo com o bloco Gel (formato, lote, velocidade e vigências de gel/BOM)');
  const mig = await po.evaluate(() => { TrazCfg.B = { gel: { config: { params: [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }], fmts: [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }], motivos: [{ id: 'm9', name: 'Quebra', comps: [], active: true }],
      equips: [{ id: 'eq-z', name: Cad.D.equipamentos[1].nome, tara: 80, active: true, descs: [{ id: 'dz', comp: 'gel', cat: 'P' }] }] }, catalogs: { items: [{ id: 'cat-q', num: Cad.D.catalogos[0].codigo, fmt: '75', lotSize: 900000, vig: [{ from: '2000-01-01', gTubo: 0.85, bomKg: 8.84, bomBase: 10000, tol: 6 }] }] } } };
    Cad.D.parametros.gel = {}; Cad.D.equipamentos[1].gel = null; Cad.D.catalogos[0].gel = null;
    TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const L = TrazCfg.P.filter(i => i.grupo === 'Só no Gel · parâmetros do gel'); const W2 = JSON.parse(JSON.stringify(Cad.D)); L.forEach(i => i.fn(W2));
    return { n: L.length, pg: W2.parametros.gel, eq: W2.equipamentos[1].gel, cat: W2.catalogos[0].gel, catg: W2.equipamentos[1].categoria }; });
  ok(mig.n === 5 && mig.pg.processo[0].pT === 2.1 && mig.pg.formatos[0].sobra === 1.3 && mig.pg.motivos[0].id === 'm9' && mig.eq.descs[0].cat === 'P' && mig.catg === 'gel' && mig.cat.fmt === '75' && mig.cat.vig[0].bomKg === 8.84, '4a migração: Trazer configurações leva processo, formatos, motivos, descartes (Equipamento – Gel) e o gel do catálogo, com a mesma estrutura');

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
