// Design System BD (12/11/2026, kit_ds.css + kit_ds.js) e Linha 360° 1.0.0.
// node testes/tds.js → barra lateral nas 9 páginas (item ativo, recolher com preferência, menu sobreposto < 900 px, Esc), cabeçalho de 58 px com
// "onde estou", modais acima da barra, grade de gráficos (largura e ordem gravadas por página), vacOrdemLote, impressão sem navegação,
// Paretos verticais do Waste e Linha 360° (números da planta = soma dos eventos, ficha do ponto, postos, checklists). Código 1 se falhar.
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright'); const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PAGS = [['portal', 'Portal.html'], ['oee', 'OEE-Vacutainer.html'], ['perdas', 'Perdas-Ordem.html'], ['gel', 'Gestão-Gel-Vacutainer.html'], ['paradas', 'Paradas.html'], ['equip', 'Equipamentos.html'], ['inic', 'Iniciativas.html'], ['linha', 'Linha-360.html'], ['projetos', 'Projetos.html']];
(async () => {
  const b = await chromium.launch(); const pe = [];
  const nova = async (w, h, ini) => { const c = await b.newContext({ viewport: { width: w, height: h } }); if (ini) await c.addInitScript(ini); const p = await c.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept()); return { c, p }; };
  // 1 · casca nas 9 páginas
  { const { c, p } = await nova(1440, 900);
    for (const [id, arq] of PAGS) { await p.goto(PG + encodeURI(arq)); await p.waitForTimeout(700);
      const r = await p.evaluate(() => { const sb = document.querySelector('header.vsuite'), q = sb.getBoundingClientRect(), top = document.getElementById('vdsTop'), cur = document.querySelector('#sysNav a.cur');
        return { fixa: getComputedStyle(sb).position, w: Math.round(q.width), h: Math.round(q.height), topo: top && Math.round(top.getBoundingClientRect().height), mig: (document.getElementById('vdsMig') || {}).textContent, cur: cur && cur.getAttribute('aria-current'), curSis: cur && cur.dataset.sis, icones: document.querySelectorAll('#sysNav a > svg.vi').length, links: document.querySelectorAll('#sysNav a').length,
          pad: parseInt(getComputedStyle(document.body).paddingLeft), tema: document.documentElement.dataset.theme, busca: !!document.querySelector('#vdsTop #vacBusca'), rolaX: document.documentElement.scrollWidth > innerWidth + 1, mod: !!document.querySelector('.vpage .vds-mod svg'), itens: ['vdsRel', 'vdsImp', 'vdsAjuda', 'vdsRec', 'btnTheme', 'btnAdmin'].filter(i => !document.querySelector('header.vsuite #' + i)) }; });
      ok(r.fixa === 'fixed' && r.w === 232 && r.h === 900 && r.pad === 232, `${id}: barra lateral fixa de 232 px e conteúdo ao lado`);
      ok(r.topo >= 56 && r.topo <= 62 && r.mig && r.busca && r.mod, `${id}: cabeçalho de ${r.topo} px com "onde estou" (${(r.mig || '').trim()}), busca e ícone do módulo`);
      ok(r.icones === r.links && r.links >= 8 && !r.itens.length, `${id}: ${r.links} módulos com ícone; Relatórios, Importação, Administração, Ajuda, Tema e Recolher na barra${r.itens.length ? ' (faltou ' + r.itens + ')' : ''}`);
      ok(id === 'projetos' || (r.cur === 'page' && r.curSis === id), `${id}: item ativo marcado (aria-current)`);
      ok(r.tema === 'light' && !r.rolaX, `${id}: tema claro por padrão e sem rolagem horizontal`); }
    // recolher: preferência vale na página seguinte
    await p.click('#vdsRec'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => localStorage.getItem('vac.sidebarCollapsed') === 'true' && Math.round(document.querySelector('header.vsuite').getBoundingClientRect().width) === 72), 'recolher: 72 px e preferência gravada (vac.sidebarCollapsed)');
    await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.documentElement.classList.contains('vds-rec') && !!document.querySelector('#sysNav a.cur') && !!document.querySelector('#sysNav a[title]')), 'barra recolhida reaplicada em outra página, com item ativo e nome no title');
    await c.close(); }
  // 2 · notebook recolhe por padrão; abaixo de 900 px vira menu sobreposto
  { const { c, p } = await nova(1100, 800); await p.goto(PG + 'Portal.html'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => Math.round(document.querySelector('header.vsuite').getBoundingClientRect().width) === 72), '1.100 px: barra recolhida por padrão'); await c.close(); }
  { const { c, p } = await nova(768, 900); await p.goto(PG + 'Perdas-Ordem.html'); await p.waitForTimeout(600);
    const fora = await p.evaluate(() => document.querySelector('header.vsuite').getBoundingClientRect().right <= 0 && parseInt(getComputedStyle(document.body).paddingLeft) === 0);
    await p.click('#vdsMenu'); await p.waitForTimeout(350); const aberta = await p.evaluate(() => document.querySelector('header.vsuite').getBoundingClientRect().left >= 0 && getComputedStyle(document.getElementById('vdsFundo')).display === 'block');
    await p.keyboard.press('Escape'); await p.waitForTimeout(350); const fechou = await p.evaluate(() => document.querySelector('header.vsuite').getBoundingClientRect().right <= 0);
    ok(fora && aberta && fechou, '768 px: barra escondida, abre sobreposta com fundo escuro e fecha com Esc'); await c.close(); }
  // 3 · modal acima da barra; grade de gráficos; Paretos verticais; impressão
  { const { c, p } = await nova(1440, 900); await p.goto(PG + 'Perdas-Ordem.html?demo=1'); await p.waitForTimeout(2500);
    const pv = await p.evaluate(() => ({ cartoes: document.querySelectorAll('#pvBox > .card').length, barras: document.querySelectorAll('#pvBox .pv-bar').length, grade: document.getElementById('pvBox').classList.contains('vg-grade'), barrasCtl: document.querySelectorAll('#pvBox .vg-barra').length,
      soma: (() => { const t = (document.querySelector('#pv-comp-muv .pv-sum') || {}).textContent || ''; return /Saldo líquido/.test(t) && /Desfavorável/.test(t) && /Favorável/.test(t); })() }));
    ok(pv.cartoes === 9 && pv.barras > 0 && pv.soma, `Waste: 9 Paretos da controladoria (3 dimensões × 3 métricas), ${pv.barras} barras, saldo líquido com favorável e desfavorável`);
    ok(pv.grade && pv.barrasCtl >= 1, `grade de gráficos ligada nos Paretos (${pv.barrasCtl} cartões com controle)`);
    const comp = await p.evaluate(() => { const b = document.querySelector('#pv-comp-muv .pv-bar'); const k = b.dataset.pvk; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return k; }); await p.waitForTimeout(500);
    ok(await p.evaluate(k => String(F.comp) === String(k) && !!document.querySelector('#pv-comp-muv .pv-bar[stroke]'), comp), 'clique na barra do Pareto aplica o filtro e destaca a barra');
    await p.evaluate(() => { F.comp = ''; renderPainel(); }); await p.waitForTimeout(500);
    const l3 = await p.evaluate(async () => { const c = document.querySelector('#pvBox .vg-it'); if (!c) return null; c.querySelector('[data-vg="l2"]').click(); await new Promise(r => setTimeout(r, 400)); const k = c.dataset.vgKey; renderPainel(); await new Promise(r => setTimeout(r, 700)); const d = [...document.querySelectorAll('#pvBox > *')].find(x => x.dataset.vgKey === k); return { l: d && d.dataset.vgL, ls: localStorage.getItem('vac.grade.perdas') || '' }; });
    ok(l3 && l3.l === '2' && /"larg"/.test(l3.ls), 'largura de 1/3 escolhida num gráfico fica gravada (vac.grade.perdas) e volta depois de redesenhar');
    await p.emulateMedia({ media: 'print' }); const imp = await p.evaluate(() => ['header.vsuite', '#vdsTop', 'nav.vtabs', '.vg-barra'].filter(s => { const e = document.querySelector(s); return e && getComputedStyle(e).display !== 'none'; }).concat(parseInt(getComputedStyle(document.body).paddingLeft) === 0 ? [] : ['body padding ' + getComputedStyle(document.body).paddingLeft]));
    ok(!imp.length, 'impressão: sem barra lateral, cabeçalho, abas e controles' + (imp.length ? ' (visível: ' + imp.join(', ') + ')' : '')); await c.close(); }
  // 4 · vacOrdemLote
  { const { c, p } = await nova(1280, 800); await p.goto(PG + 'Linha-360.html'); await p.waitForTimeout(600);
    const r = await p.evaluate(() => vacOrdemLote([{ ordem: '100', lote: 'A', mes: '2026-10' }, { ordem: '100', lote: 'B', mes: '2026-11' }, { ordem: '200', lote: 'C' }, { ordem: '300', lote: 'C' }, { ordem: '400', lote: 'D' }, { ordem: '400', lote: 'D' }, { ordem: '500', lote: '' }, { ordem: 100, lote: 'A' }]));
    ok(r.ordens.length === 1 && r.ordens[0].ordem === '100' && r.ordens[0].lotes.join() === 'A,B' && r.ordens[0].mes === '2026-11' && r.lotes.length === 1 && r.lotes[0].lote === 'C' && r.lotes[0].ordens.join() === '200,300', 'vacOrdemLote: ordem com 2 lotes e lote em 2 ordens apontados; par repetido e lote vazio não contam');
    // 5 · Linha 360° em modo de teste
    await p.evaluate(() => enterTest()); await p.waitForTimeout(600);
    const L = await p.evaluate(() => { const N = numeros(), ev = eventos(), tot = ev.reduce((s, e) => s + e.minutos, 0); const pinos = [...document.querySelectorAll('[data-pin]')];
      return { pinos: pinos.length, somaPlanta: N.tot.min + N.fora.min, somaEv: tot, ord: (document.querySelector('.l3-top .l3-k .v') || {}).textContent, lote: /lote\s*6275190/.test(document.querySelector('.l3-top').textContent), graf: document.querySelectorAll('#l3graf .l3-ch > svg').length, ficha: !!document.querySelector('#ficha h3'), img: document.querySelector('#cv img').naturalWidth }; });
    ok(L.pinos === 17 && L.img === 2000, `Linha 360°: planta do PDF (${L.img} px) com 17 pontos (1–12 e 14–18)`);
    ok(L.somaPlanta === L.somaEv && L.somaEv > 0, `tempo parado da planta (${L.somaPlanta} min) = soma dos eventos do Paradas no período (${L.somaEv} min)`);
    ok(L.ord === '100234563' && L.lote && L.graf === 3 && L.ficha, 'ordem em produção com o lote, 3 gráficos e ficha do ponto');
    await p.click('[data-pin="6"]'); await p.waitForTimeout(300);
    const f6 = await p.evaluate(() => { const N = numeros(); return { t: document.querySelector('#ficha h3').textContent, v: document.querySelector('#ficha .l3-tl .g b').textContent, n: N.R['6'].min, acao: !!document.querySelector('#ficha a[href*="nova="]'), par: !!document.querySelector('#ficha a[href*="Paradas.html#equipamento=EQ04"]') }; });
    ok(/Cap \+ Stopper/.test(f6.t) && f6.v.replace(/\D/g, '') === String(f6.n) && f6.acao && f6.par, `clique no ponto 6: ficha com ${f6.v}, link do Paradas e nova ação em Iniciativas`);
    await p.selectOption('#fPer', '30'); await p.waitForTimeout(300); await p.selectOption('#fOrdem', '100234562'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => eventos().length > 0 && eventos().every(e => e.ordem === '100234562')), 'filtro Ordem · lote: só as paradas daquela ordem');
    await p.click('#nav [data-t="pessoas"]'); await p.waitForTimeout(300); await p.click('button[data-posto="OP3-A"]'); await p.waitForTimeout(200); await p.fill('#fPosto input[name="t_T1"]', 'Pessoa Teste'); await p.click('#fPosto button[type=submit]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => postos().find(x => x.id === 'OP3-A').pessoas.T1 === 'Pessoa Teste' && !document.querySelector('button[data-posto="OP3-A"]').classList.contains('vago')), 'posto: pessoa do turno gravada por operação e posto deixa de aparecer vago');
    await p.click('#nav [data-t="checklists"]'); await p.waitForTimeout(300); const antes = await p.evaluate(() => chkPendentes(hoje(), App.chkTurno || turnoAgora()).length); await p.click('[data-feito]'); await p.waitForTimeout(300);
    ok(await p.evaluate(a => chkPendentes(hoje(), App.chkTurno || turnoAgora()).length === a - 1 && !!document.querySelector('.l3-ck.feito'), antes), 'checklist marcado como feito sai dos pendentes');
    const ex = await p.evaluate(() => { const e = calcExports(Store.data); return { v: e.exportsVersion, p: e.pontos.length, eq: e.pontos.find(x => x.id === '2').equipamentos.join(), pend: e.pendencias.every(x => x.sev && x.txt && x.link) }; });
    ok(ex.v === 1 && ex.p === 17 && ex.eq === 'EQ03' && ex.pend, 'exports da Linha 360°: versão 1, 17 pontos com equipamentos e pendências com link');
    await c.close(); }
  // 6 · ponta a ponta na demonstração: ação aberta num ponto da planta nasce em Iniciativas (origem Linha 360°, vínculo do ponto) e a OS em Equipamentos; as duas voltam para a planta
  { const { c, p } = await nova(1440, 900); await p.goto(PG + 'Linha-360.html?demo=1'); await p.waitForTimeout(2500); const demo = new URL(p.url()).searchParams.get('demo');
    const ini = await p.evaluate(() => { const pt = pontos().find(x => eqDoPonto(x).lista.length), N = numeros(); App.sel = pt.id; render(); return { id: pt.id, eq: eqDoPonto(pt).lista[0], ac: N.R[pt.id].ac, os: N.R[pt.id].os, hA: document.querySelector('#ficha a[href*="nova="]').getAttribute('href'), hO: document.querySelector('#ficha a[href*="novaOS="]').getAttribute('href') }; });
    const com = h => PG + h.replace(/^([^?#]+)(\?[^#]*)?/, (m, f) => encodeURI(decodeURI(f)) + '?demo=' + demo);
    await p.goto(com(ini.hA)); await p.waitForTimeout(2500);
    const fa = await p.evaluate(() => { const m = document.querySelector('.mod'); return m ? { or: m.querySelector('#aO').value, eq: m.querySelector('#vEq').value, txt: m.innerText } : null; });
    ok(fa && fa.or === 'linha360' && fa.eq === ini.eq && /Linha 360°/.test(fa.txt), `Iniciativas abre a ação do ponto ${ini.id} com origem Linha 360° e o equipamento ${ini.eq}`);
    await p.fill('.mod #aT', 'Ação criada na planta (teste)'); await p.click('.mod [data-ok]'); await p.waitForTimeout(800);
    const cri = await p.evaluate(id => { const a = Store.data.acoes.find(x => x.titulo === 'Ação criada na planta (teste)'); return a ? { or: a.origem.tipo, ref: a.origem.ref, pt: (a.vinculos || []).some(v => v.tipo === 'ponto' && v.cod === id), eq: (a.vinculos || []).some(v => v.tipo === 'equipamento') } : null; }, ini.id);
    ok(cri && cri.or === 'linha360' && cri.ref === 'ponto|' + ini.id && cri.pt && cri.eq, 'ação gravada com origem linha360, referência do ponto e os vínculos de ponto e equipamento');
    await p.goto(com(ini.hO)); await p.waitForTimeout(2500);
    const fo = await p.evaluate(() => { const m = document.querySelector('.mod'); return m ? m.querySelector('#oEq').value : null; });
    ok(fo === ini.eq, `Equipamentos abre a OS já no equipamento ${ini.eq}`);
    await p.fill('.mod #oT', 'OS criada na planta (teste)'); await p.click('.mod [data-ok]'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => { const o = Store.data.os.find(x => x.titulo === 'OS criada na planta (teste)'); return !!o && o.origem && o.origem.tipo === 'linha360'; }), 'OS gravada com a origem da Linha 360°');
    await p.goto(PG + 'Linha-360.html?demo=' + demo); await p.waitForTimeout(2500);
    const fim = await p.evaluate(id => { const N = numeros(); return { ac: N.R[id].ac, os: N.R[id].os }; }, ini.id);
    ok(fim.ac === ini.ac + 1 && fim.os === ini.os + 1, `de volta à planta: o ponto ${ini.id} passa de ${ini.ac} para ${fim.ac} ação(ões) e de ${ini.os} para ${fim.os} OS`);
    await c.close(); }
  // 7 · e-mail para o Outlook (vacEmail), chips de filtros e número da página
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] }); const p = await c.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(PG + 'Linha-360.html'); await p.waitForTimeout(700); await p.evaluate(() => enterTest()); await p.waitForTimeout(500);
    await p.selectOption('#fTurno', 'T1'); await p.waitForTimeout(300);
    const ch = await p.evaluate(() => ({ n: document.querySelectorAll('.l3-chip').length, t: (document.querySelector('.l3-chip') || {}).textContent || '' }));
    ok(ch.n === 1 && /Turno/.test(ch.t), 'filtro ativo aparece como chip');
    const e = await p.evaluate(async () => { const N = numeros(), d = await emailLinha(), h = vacEmail.html(d), box = document.createElement('div'); box.innerHTML = h; const img = box.querySelector('img');
      return { tm: N.tot.min + N.fora.min, k0: d.kpis[0].valor, nk: box.querySelectorAll('td[style*="border-left:4px"]').length, proib: /display:\s*(flex|grid)|<script|<style|position:\s*fixed/i.test(h), tabelas: box.querySelectorAll('table').length, larg: /width="680"/.test(h), png: !!img && /^data:image\/png/.test(img.getAttribute('src')), alt: img ? img.getAttribute('alt') : '', filtros: d.resumo[0].rot, ass: vacEmail.assunto(d), txt: vacEmail.texto(d), oc: d.ocorrencias.length, ac: d.acoes.length, clip: await navigator.clipboard.readText().catch(() => '') }; });
    ok(e.nk === 4 && e.k0.replace(/\D/g, '') === String(e.tm), `e-mail: 4 KPIs e o tempo parado (${e.k0}) igual ao da tela`);
    ok(!e.proib && e.tabelas >= 6 && e.larg, `e-mail em tabelas de 680 px, sem flex, grid, script nem folha de estilo (${e.tabelas} tabelas)`);
    ok(e.png && /Gráfico de barras/.test(e.alt), 'gráfico em PNG com texto alternativo (legível com as imagens bloqueadas)');
    ok(e.filtros === 'Filtros' && /^Linha 360° \| Relatório da linha \| Linha Vacutainer \| .* \| (Atenção|Adequado)$/.test(e.ass) && e.oc <= 5 && e.ac <= 5, `assunto sugerido (${e.ass}), filtros no resumo e no máximo 5 ocorrências e 5 ações`);
    ok(/Resultado:/.test(e.txt) && /Resultado:/.test(e.clip), 'versão em texto simples copiada junto');
    await p.click('[data-chip="todos"]'); await p.waitForTimeout(300); ok(await p.evaluate(() => !App.f.turno && !document.querySelector('.l3-chip')), 'Limpar filtros tira os chips');
    ok(await p.evaluate(() => [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.type === 6 && /counter\(page\)/.test(r.cssText)); } catch (x) { return false; } })), 'impressão: regra de "Página X de Y" presente');
    await p.click('#nav [data-t="config"]'); await p.waitForTimeout(300); ok(await p.evaluate(() => document.querySelectorAll('details.l3-ms').length === 17 && !document.querySelector('details.l3-ms[open]')), 'Configuração: equipamentos de cada ponto recolhidos até clicar em alterar');
    await c.close(); }
  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
