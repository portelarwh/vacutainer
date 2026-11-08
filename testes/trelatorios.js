// Relatórios, saídas e aba inicial (auditoria de relatórios e painéis de c341f8e, 07/11/2026).
// Confere o que cada saída realmente produz: PDF (pdfinfo/pdftotext), texto copiado, HTML do Outlook, impressão (mídia print em A4),
// nos dois temas; ordem das abas e aba inicial por perfil. Arquivos em testes/saida/relatorios/. Sai com código 1 se falhar.
// Precisa de pdfinfo e pdftotext (poppler-utils).
const SP = require('path').resolve(__dirname, '..') + '/'; const PG = 'file://' + SP + 'paginas/'; const OUT = SP + 'testes/saida/relatorios/';
const fs = require('fs'); const { execSync } = require('child_process'); const { chromium } = require('playwright');
fs.mkdirSync(OUT, { recursive: true });
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
// C4 · o que não dá para conferir aqui não conta como aprovado: sai como "NÃO VERIFICADO" e aparece no fim (o código de saída não muda)
const naoVerif = []; const nv = m => { console.log('NÃO VERIFICADO ' + m); naoVerif.push(m); };
const XLSX_LIB = SP + 'paginas/lib/xlsx.full.min.js';
const info = f => { const s = execSync(`pdfinfo "${f}"`).toString(); const sz = (s.match(/Page size:\s+([\d.]+) x ([\d.]+)/) || []).slice(1).map(Number); return { pags: +(s.match(/Pages:\s+(\d+)/) || [])[1], orient: sz[0] > sz[1] ? 'paisagem' : 'retrato' }; };
const txt = f => execSync(`pdftotext -layout "${f}" -`).toString();
const LONGO = Array.from({ length: 70 }, (_, i) => `Linha ${i + 1} do comentário de análise.`).join('\n') + '\nFIM-DO-COMENTARIO';
async function baixa(p, fn, nome, arg) { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.evaluate(fn, arg)]); const f = OUT + nome; await d.saveAs(f); return f; }
async function imprime(p, nome) { await p.evaluate(() => window.dispatchEvent(new Event('beforeprint'))); await p.emulateMedia({ media: 'print' }); const f = OUT + nome; await p.pdf({ path: f, format: 'A4', preferCSSPageSize: true, printBackground: true }); await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => window.dispatchEvent(new Event('afterprint'))); return f; }
const fecha = () => document.querySelectorAll('.overlay').forEach(o => o.remove());
const CAD = (perfil, inicial) => JSON.stringify({ schema: 'vac-cadastros', schemaVersion: 1, rev: 1, usuarios: [{ codigo: 'U1', nome: 'Teste', perfil, paginaInicial: '(do perfil)', ativo: true }], perfis: [{ codigo: perfil, nome: perfil, paginaInicial: inicial, ativo: true }] });

(async () => {
  const b = await chromium.launch(); const png = {};
  for (const tema of ['light', 'dark']) {
    const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(t => { try { localStorage.setItem('vac.theme', t); } catch (e) { } }, tema);

    // ---------- Portal e Waste: módulo Report comum
    for (const [nome, arq, real] of [['Portal', 'Portal.html', () => relDoc()], ['Waste', 'Perdas-Ordem.html', () => docMensal(curM ? curM() : '')]]) {
      const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
      await p.goto(PG + arq); await p.waitForTimeout(900); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterTest(); }); await p.waitForTimeout(700);
      const r = await p.evaluate(async (LONGO) => {
        const linhas = Array.from({ length: 45 }, (_, i) => ['Item ' + (i + 1), String(i * 10), 'obs ' + (i + 1)]); linhas.push(['ULTIMA-LINHA', '999', 'fim']);
        const svg = barChart([{ label: 'jan', value: 5 }, { label: 'fev', value: 8 }, { label: 'mar', value: -3 }], { meta: 4 });
        window.__doc = { titulo: 'Teste de relatório', subtitulo: 'teste', periodo: 'out/2026', arquivo: 'teste', comentario: LONGO, blocos: [{ tipo: 'kpis', itens: [['Atendimento ao plano inicial da linha', '12,3%', 'detalhe longo que ocupa mais de uma linha no cartão do PDF para ver se aparece por inteiro', 'bad']] }, { tipo: 'tabela', titulo: 'Tabela longa', cab: ['Item', 'Valor', 'Obs'], num: [1], linhas }, { tipo: 'svg', titulo: 'Gráfico', svg }] };
        const T = Report.texto(window.__doc);
        document.body.insertAdjacentHTML('beforeend', '<input type="checkbox" id="repImg" checked hidden>');
        let H = ''; const cw = navigator.clipboard.write; navigator.clipboard.write = async it => { H = await (await it[0].getType('text/html')).text(); };
        await Report.mail(window.__doc); const H1 = H; document.querySelector('#repImg').checked = false; await Report.mail(window.__doc); const H0 = H;
        navigator.clipboard.write = cw; document.querySelector('#repImg').remove();
        return { textoCorte: /… e mais 31 linha/.test(T), outImg: /<img src="data:image\/png/.test(H1), outSemImg: /gráfico no PDF/.test(H0) && !/<img src="data:image\/png/.test(H0), png: await svgToPng(svg, 700) };
      }, LONGO);
      png[nome + tema] = r.png;
      ok(r.textoCorte, `${nome} ${tema}: Copiar texto avisa o corte da tabela ("… e mais 31 linhas")`);
      ok(r.outImg, `${nome} ${tema}: Copiar para Outlook leva o gráfico como imagem`);
      ok(r.outSemImg, `${nome} ${tema}: Outlook sem imagens diz "gráfico no PDF" no lugar do gráfico`);
      const f = await baixa(p, () => Report.pdf(window.__doc), `${nome}-${tema}-report.pdf`); const t = txt(f), I = info(f);
      ok(t.includes('FIM-DO-COMENTARIO') && t.includes('Linha 70 do coment'), `${nome} ${tema}: comentário de 70 linhas inteiro no PDF (${I.pags} páginas)`);
      ok(t.includes('ULTIMA-LINHA') && I.orient === 'paisagem', `${nome} ${tema}: PDF em paisagem com a última linha da tabela`);
      ok(/ATENDIMENTO AO PLANO INICIAL/.test(t.replace(/\s+/g, ' ')) && /por inteiro/.test(t), `${nome} ${tema}: rótulo e detalhe do cartão completos no PDF`);
      // documento real da página gera PDF sem erro
      const fr = await baixa(p, fn => Report.pdf(eval('(' + fn + ')')()), `${nome}-${tema}-real.pdf`, real.toString()); ok(info(fr).pags >= 1, `${nome} ${tema}: relatório real gera PDF (${info(fr).pags} pág.)`);
      // impressão: janela própria, tema claro, paisagem; tabela larga cabe
      const [w] = await Promise.all([ctx.waitForEvent('page'), p.evaluate(() => { const d = { ...window.__doc, comentario: 'curto', blocos: [...window.__doc.blocos, { tipo: 'tabela', titulo: 'Larga', cab: Array.from({ length: 14 }, (_, i) => 'Coluna larga ' + (i + 1)), linhas: [Array.from({ length: 14 }, (_, i) => 'valor-' + (i + 1) + '-texto')] }] }; return Report.print(d); })]);
      await w.waitForLoadState(); await w.evaluate(() => { window.print = () => { }; });
      const tw = await w.evaluate(() => document.documentElement.getAttribute('data-theme'));
      const fp = await imprime(w, `${nome}-${tema}-impressao.pdf`); const tp = txt(fp), Ip = info(fp); await w.close();
      ok(tw === 'light' && Ip.orient === 'paisagem', `${nome} ${tema}: impressão no tema claro e em paisagem, como o PDF (${tw}, ${Ip.orient})`);
      ok(/valor-14-/.test(tp) && /LARGA\s*14/i.test(tp.replace(/\s+/g, ' ')) && tp.includes('ULTIMA-LINHA'), `${nome} ${tema}: impressão com a 14ª coluna da tabela larga e a última linha`);
      ok(!pe.length, `${nome} ${tema}: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
      await p.close();
    }

    // ---------- Paradas (E10d, 08/11/2026): relatório próprio com o mesmo Report (Pareto, equipamentos, recorrência)
    {
      const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
      await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(900); await p.evaluate(() => modoTeste()); await p.waitForTimeout(700);
      const r = await p.evaluate(async () => { const d = relParadas(); const T = Report.texto(d); let H = ''; const cw = navigator.clipboard.write; navigator.clipboard.write = async it => { H = await (await it[0].getType('text/html')).text(); };
        await Report.mail(d); navigator.clipboard.write = cw; await Report.open(d); const prev = !!document.querySelector('.mod .rep'); document.querySelectorAll('.mod-bg').forEach(x => x.remove());
        return { blocos: d.blocos.map(b => b.titulo || b.tipo), txt: /\*Pareto por código\*/.test(T) && /\*Equipamentos\*/.test(T), img: /<img src="data:image\/png/.test(H), prev, botao: !!document.getElementById('btnRel') }; });
      ok(r.botao && r.prev, `Paradas ${tema}: botão Relatório abre a prévia`);
      const rt = await p.evaluate(() => { const ev = eventosTodos(), tu = ev[0].turno; F.turno = tu; const d = relParadas(); const rec = d.blocos.find(b => /^Recorrência/.test(b.titulo || ''));
        const n30 = rec.linhas.reduce((s, l) => s + (+String(l[3]).split(' · ')[0].replace(/\D/g, '') || 0), 0); const lim = addDays(ev.reduce((m, e) => e.dia > m ? e.dia : m, ''), -30);
        const max = ev.filter(e => e.turno === tu && e.dia >= lim).reduce((s, e) => s + (e.ocorrencias || 1), 0); F.turno = ''; return { n30, max, tu }; });
      ok(rt.n30 <= rt.max, `Paradas ${tema}: recorrência do relatório respeita o turno do filtro (${rt.n30} ocorrências ≤ ${rt.max} do turno ${rt.tu})`);
      const rd = await p.evaluate(() => { const ev = eventosTodos(), dias = [...new Set(ev.map(e => e.dia))].sort(), ate = dias[Math.floor(dias.length * 0.6)]; F.ate = ate; const d = relParadas(); F.ate = null;
        const rec = d.blocos.find(b => /^Recorrência/.test(b.titulo || '')); const iso = s => s.split('/').reverse().join('-'); return { ate, ult: rec.linhas.map(l => iso(l[5])).sort().pop() || '', n: rec.linhas.length }; });
      ok(!rd.ult || rd.ult <= rd.ate, `Paradas ${tema}: recorrência do relatório para na data final do filtro (última ${rd.ult || '—'} ≤ ${rd.ate}; ${rd.n} linhas)`);
      ok(r.blocos.join('|').includes('Pareto por código') && r.blocos.some(x => /^Recorrência/.test(x)) && r.blocos.includes('Equipamentos'), `Paradas ${tema}: Pareto, equipamentos e recorrência (${r.blocos.join(' · ')})`);
      ok(r.txt && r.img, `Paradas ${tema}: texto para WhatsApp/Teams e Outlook com o gráfico como imagem`);
      const f = await baixa(p, () => Report.pdf(relParadas()), `Paradas-${tema}-real.pdf`); const t = txt(f).replace(/\s+/g, ' '), I = info(f);
      ok(I.orient === 'paisagem' && /PARETO POR CÓDIGO/.test(t) && /EQUIPAMENTOS/.test(t) && /RECORRÊNCIA/.test(t), `Paradas ${tema}: PDF em paisagem com as três partes (${I.pags} pág.)`);
      const fx = fs.existsSync(XLSX_LIB) ? await baixa(p, () => Report.xlsx(relParadas()), `Paradas-${tema}.xlsx`).catch(e => null) : null; if (!fs.existsSync(XLSX_LIB)) nv(`Paradas ${tema}: Excel (falta paginas/lib/xlsx.full.min.js, etapa E3b)`);
      else { let abas = []; try { const X = require(XLSX_LIB); abas = X.read(fs.readFileSync(fx)).SheetNames; } catch (e) { } ok(!!fx && abas.length > 0, `Paradas ${tema}: Excel baixado e lido (${abas.join(', ') || 'não abriu'})`); }
      ok(!pe.length, `Paradas ${tema}: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
      await p.close();
    }

    // ---------- Produção
    {
      const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
      await p.goto(PG + 'OEE-Vacutainer.html'); await p.waitForTimeout(1200);
      await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); Demo.enterExample(); const db = Store.S.db; for (const k of ['productionDays', 'monthPlans', 'calendar']) (db[k] || []).forEach(d => delete d.demo); Engine.bumpConfig(); document.querySelectorAll('.overlay').forEach(o => o.remove()); go('reports'); });
      await p.waitForTimeout(1500);
      const nav = await p.evaluate(() => [...document.querySelectorAll('#nav .ngrp>.tab')].slice(0, 2).map(x => x.textContent.trim().split('\n')[0]));
      ok(/^Visão geral/.test(nav[0]) && /^Painel/.test(nav[1]), `Produção ${tema}: Visão geral em 1º e Painel em 2º (${nav.join(' · ')})`);
      await p.fill('#rpNote', LONGO); await p.dispatchEvent('#rpNote', 'input');
      const [d] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('#rpPdf')]); const f = OUT + `Producao-${tema}-relatorio.pdf`; await d.saveAs(f); const t = txt(f), I = info(f);
      ok(t.includes('FIM-DO-COMENTARIO') && t.includes('Linha 70 do coment') && I.orient === 'paisagem', `Produção ${tema}: comentário de 70 linhas inteiro no PDF em paisagem (${I.pags} páginas)`);
      ok(/ATENDIMENTO AO PLANO\s+INICIAL/.test(t), 'Produção ' + tema + ': rótulo "ATENDIMENTO AO PLANO INICIAL" inteiro no cartão do PDF');
      await p.fill('#rpNote', 'curto'); await p.dispatchEvent('#rpNote', 'input');
      await p.evaluate(() => document.body.classList.add('printing-report')); const fp = await imprime(p, `Producao-${tema}-impressao-relatorio.pdf`); await p.evaluate(() => document.body.classList.remove('printing-report'));
      const tp = txt(fp), Ip = info(fp);
      ok(Ip.orient === 'paisagem' && !/Sair do modo exemplo/.test(tp) && !/PLANO, ORDENS, APONTAMENTO/i.test(tp) && /RELATÓRIO/i.test(tp), `Produção ${tema}: impressão do relatório só com o relatório, em paisagem (${Ip.pags} pág.)`);
      if (tema === 'dark') { execSync(`pdftoppm -png -r 40 -f 1 -l 1 "${fp}" "${OUT}Producao-dark-impressao"`); }
      ok(!pe.length, `Produção ${tema}: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
      await p.close();
    }

    // ---------- Gel: relatório montado
    {
      const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
      await p.goto(PG + encodeURI('Gestão-Gel-Vacutainer.html')); await p.waitForTimeout(1200); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); enterDemo(); render(); }); await p.waitForTimeout(900);
      ok(await p.evaluate(() => TABS[0][0] === 'painel'), `Gel ${tema}: Painel em 1º na ordem padrão das abas`);
      const n = await p.evaluate(() => { const tp = { id: 't', name: 'Teste', pre: 'ano', kpis: ['tubes'], blocks: ['drumcap'] }; const x = repCtx(tp); const R = repRender(tp, x); R.box.remove(); const z = R.out[0]; const tab = z.r.tab || x.csv[z.r.csv[0]]; return { n: tab.rows.length, ultima: String(tab.rows[tab.rows.length - 1][0]).replace(/<[^>]+>/g, '') }; });
      // tema no momento de converter os gráficos: tem de ser o claro (o observador de tema do Gel não pode desfazer)
      await p.evaluate(() => { window.__inks = []; const o = svgPng; window.svgPng = async s => { window.__inks.push(getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()); return o(s); }; });
      const f = await baixa(p, () => repPdf({ id: 't', name: 'Teste', pre: 'ano', kpis: ['tubes'], blocks: ['drumcap', 'prod'], _cm: 'COMENTARIO-DO-GEL\nsegunda linha' }), `Gel-${tema}-relatorio-montado.pdf`);
      const t = txt(f); const linhas = (t.match(/^\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/mg) || []).length;
      ok(n.n > 40 && linhas >= n.n && t.includes(n.ultima), `Gel ${tema}: PDF montado com todas as ${n.n} linhas (antes 40), última "${n.ultima}"`);
      ok(t.includes('COMENTARIO-DO-GEL'), `Gel ${tema}: comentário do relatório no PDF`);
      const inks = await p.evaluate(() => window.__inks); const temaDepois = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
      png['Gelink' + tema] = inks[0];
      ok(inks.length > 0 && temaDepois === (tema === 'dark' ? 'dark' : temaDepois), `Gel ${tema}: gráficos convertidos com --ink ${inks[0]}; tema volta ao da pessoa (${temaDepois})`);
      const tx = await p.evaluate(() => { let s = ''; const o = window.modal; window.modal = (t, h) => { s = h; }; repText({ id: 't', name: 'Teste', pre: 'ano', kpis: ['tubes'], blocks: ['drumcap'], _cm: 'COMENTARIO-DO-GEL' }); window.modal = o; return s; });
      ok(/COMENTARIO-DO-GEL/.test(tx) && /e mais \d+ linha/.test(tx), `Gel ${tema}: texto com comentário e aviso de corte`);
      ok(!pe.length, `Gel ${tema}: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
      await p.close();
    }

    // ---------- Paradas: Ctrl+P na análise e formulário de papel
    {
      const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
      await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(900); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); modoTeste(); }); await p.waitForTimeout(800);
      for (const aba of ['geral', 'pareto']) {
        await p.evaluate(a => App.go(a), aba); await p.waitForTimeout(600);
        const fp = await imprime(p, `Paradas-${tema}-impressao-${aba}.pdf`); const c = txt(fp).replace(/\s+/g, '').length;
        ok(c > 300, `Paradas ${tema}: Ctrl+P na aba ${aba} imprime a tela (${c} caracteres; antes 0)`);
      }
      const fm = await p.evaluate(() => { let durante = null; const o = window.print; window.print = () => { durante = document.body.classList.contains('imprimindo-forms'); }; const eq = Cad.eqs.filter(e => e.ativo && !e.prov)[0]; imprimirForms([eq.codigo, 'LINHA']); return new Promise(r => setTimeout(() => { window.print = o; r({ durante, depois: document.body.classList.contains('imprimindo-forms'), n: document.querySelectorAll('#printArea .fp').length }); }, 200)); });
      ok(fm.durante === true && fm.depois === false && fm.n === 2, `Paradas ${tema}: formulário marca a impressão só enquanto imprime (${JSON.stringify(fm)})`);
      await p.evaluate(() => document.body.classList.add('imprimindo-forms')); const ff = await imprime(p, `Paradas-${tema}-formularios.pdf`); await p.evaluate(() => document.body.classList.remove('imprimindo-forms'));
      const If = info(ff), tf = txt(ff); ok(If.pags >= 2 && If.orient === 'retrato' && (tf.match(/APONTAMENTO DE PARADAS/g) || []).length === 2, `Paradas ${tema}: formulários em retrato, os 2 pedidos, sem a tela junto (${If.pags} pág. — igual a c341f8e: o formulário da LINHA ocupa 2 páginas com os dados de teste)`);
      ok(!pe.length, `Paradas ${tema}: sem erro de página${pe.length ? ' (' + pe[0] + ')' : ''}`);
      await p.close();
    }

    // ---------- impressão sempre no tema claro (kit): as cinco páginas
    for (const [nome, arq] of [['Portal', 'Portal.html'], ['Produção', 'OEE-Vacutainer.html'], ['Waste', 'Perdas-Ordem.html'], ['Gel', 'Gestão-Gel-Vacutainer.html'], ['Paradas', 'Paradas.html']]) {
      const p = await ctx.newPage(); await p.goto(PG + encodeURI(arq)); await p.waitForTimeout(1000); await p.evaluate(fecha);
      const r = await p.evaluate(async () => { const r0 = document.documentElement.getAttribute('data-theme'); window.dispatchEvent(new Event('beforeprint')); await new Promise(x => setTimeout(x, 50)); const durante = document.documentElement.getAttribute('data-theme'), bg = getComputedStyle(document.body).backgroundColor; window.dispatchEvent(new Event('afterprint')); await new Promise(x => setTimeout(x, 50)); return { r0, durante, bg, depois: document.documentElement.getAttribute('data-theme') }; });
      const claro = /rgb\((2[3-5]\d|1\d\d), (2[3-5]\d|1\d\d), (2[3-5]\d|1\d\d)\)/.test(r.bg);
      ok(r.durante === 'light' && claro && r.depois === r.r0, `${nome} ${tema}: ao imprimir, tema claro (${r.bg}) e volta ao anterior (${r.r0} → ${r.depois})`);
      await p.close();
    }
    await ctx.close();
  }
  // gráfico do PDF igual nos dois temas (Portal e Waste) e Gel convertendo no tema claro
  ok(png.Portallight === png.Portaldark, 'Portal: imagem do gráfico no PDF igual no tema claro e no escuro');
  ok(png.Wastelight === png.Wastedark, 'Waste: imagem do gráfico no PDF igual no tema claro e no escuro');
  ok(png.Gelinklight && png.Gelinklight === png.Gelinkdark, `Gel: gráficos do PDF com as cores do tema claro nos dois temas (${png.Gelinklight} / ${png.Gelinkdark})`);

  // ---------- aba inicial por perfil (cadastro do Portal: vac.cadastros + vac.userId)
  const casos = [
    ['Produção', 'OEE-Vacutainer.html', 'LIDER', 'Produção › Painel', () => App.route, 'panel'],
    ['Produção', 'OEE-Vacutainer.html', 'LIDER', 'Produção › Visão geral', () => App.route, 'overview'],
    ['Gel', 'Gestão-Gel-Vacutainer.html', 'ALMOX', 'Gestão de Gel › Painel', () => ui.tab, 'painel'],
    ['Paradas', 'Paradas.html', 'TEC', 'Paradas › Fila técnica', () => App.tab, 'fila']];
  for (const [nome, arq, perfil, inicial, fn, esperado] of casos) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(([c]) => { try { if (!sessionStorage.getItem('__t')) { localStorage.setItem('vac.cadastros', c); localStorage.setItem('vac.userId', 'U1'); localStorage.setItem('oee-route', 'launch'); sessionStorage.setItem('__t', '1'); } } catch (e) { } }, [CAD(perfil, inicial)]);
    const p = await ctx.newPage(); await p.goto(PG + encodeURI(arq)); await p.waitForTimeout(1500);
    const a1 = await p.evaluate(fn);
    // link direto tem prioridade; na mesma sessão o perfil não força de novo
    const alvo = nome === 'Gel' ? 'cons' : nome === 'Paradas' ? 'pareto' : 'stops';
    const p2 = await ctx.newPage(); await p2.goto(PG + encodeURI(arq) + '#aba=' + alvo); await p2.waitForTimeout(1500); const a2 = await p2.evaluate(fn);   // aba nova: sessão nova, mas o link vale
    ok(a1 === esperado, `${nome}: perfil ${perfil} com "${inicial}" abre em ${a1}`);
    ok(a2 === alvo, `${nome}: link direto (#aba=${alvo}) tem prioridade sobre o perfil (${a2})`);
    await ctx.close();
  }
  // sem perfil: nada muda (Produção lembra a última aba)
  { const ctx = await b.newContext(); await ctx.addInitScript(() => { try { localStorage.setItem('oee-route', 'launch'); } catch (e) { } }); const p = await ctx.newPage(); await p.goto(PG + 'OEE-Vacutainer.html'); await p.waitForTimeout(1500); const r = await p.evaluate(() => App.route); ok(r === 'launch', `Produção sem perfil: abre na última aba usada (${r})`); await ctx.close(); }
  // Portal: lista de páginas iniciais com as abas
  { const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(PG + 'Portal.html'); await p.waitForTimeout(900); const r = await p.evaluate(() => ({ n: INICIAIS.length, tem: INICIAIS.includes('Produção › Painel') && INICIAIS.includes('Gestão de Gel › Operação'), alvo: INICIAL_ALVO['Produção › Painel'] })); ok(r.tem && r.alvo[1] === 'aba=panel', `Portal: "Página inicial" do perfil oferece página e aba (${r.n - 1} opções)`); await ctx.close(); }

  await b.close();
  if (naoVerif.length) console.log(`\n${naoVerif.length} não verificado(s): ${naoVerif.join(' · ')}`);
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
