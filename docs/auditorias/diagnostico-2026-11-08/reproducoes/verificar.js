// Reproduções do diagnóstico de 08/11/2026 (commit e043513). Só lê: não grava nada nas páginas nem nas bases.
// Rodar na raiz do repositório:  node docs/auditorias/diagnostico-2026-11-08/reproducoes/verificar.js
// Cada linha diz CONFIRMADO (o achado continua no código) ou NÃO REPRODUZ (já corrigido ou diagnóstico errado).
// Saída também em testes/saida/diagnostico-2026-11-08.json.
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '../../../..') + '/', PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const R = []; const res = (id, confirmado, txt, ev) => { R.push({ id, confirmado, txt, ev }); console.log(`${confirmado ? 'CONFIRMADO ' : 'NÃO REPRODUZ'} ${id} · ${txt}${ev ? '\n             ' + (typeof ev === 'string' ? ev : JSON.stringify(ev)) : ''}`); };
const ler = f => fs.readFileSync(RAIZ + f, 'utf8');
const fecha = () => document.querySelectorAll('.overlay').forEach(o => o.remove());

(async () => {
  // ---------- B1 · Ordens SAP: erro de leitura tratado como arquivo ausente (inspeção de código)
  {
    const build = ler('fontes/producao/build.py'), tela = ler('fontes/producao/ordens_tela.js');
    const engole = /async readSibling\(name\) \{ try \{[^}]*\} catch \(e\) \{ return null; \} \}/.test(build);
    const i = tela.indexOf('async gravar('), g = tela.slice(i, i + 3000);
    const gravaSemTexto = /remoteTxt = await Store\.S\.backend\.readSibling\(ORD_FILE\);\s*if \(remoteTxt\) \{/.test(g) && /writeSibling\(ORD_FILE, txt\)/.test(g);
    const releitura = /readSibling\(ORD_FILE\)[\s\S]{0,400}writeSibling[\s\S]{0,400}readSibling\(ORD_FILE\)/.test(g);
    res('B1', engole && gravaSemTexto, 'readSibling devolve null em QUALQUER erro e Ord.gravar, com null, grava por cima sem mesclar',
      { readSiblingEngoleErro: engole, gravarSegueSemLeitura: gravaSemTexto, onde: 'fontes/producao/build.py (regra readSibling) · fontes/producao/ordens_tela.js Ord.gravar' });
    res('B6', !releitura, 'Ord.gravar não relê o arquivo depois de gravar (regra 10)', { releituraDepoisDeGravar: releitura });
  }
  // ---------- B2 · meta WASTE-MES lida pela data de hoje
  {
    const w = ler('paginas/Perdas-Ordem.html'); const m = /vacMetaArea\('WASTE-MES',\s*([^)]*)\)/.exec(w);
    res('B2', !!m && /todayISO\(/.test(m[1]), 'Waste lê a meta WASTE-MES pela data de hoje, para qualquer mês', m ? m[0] : 'não achado');
  }
  // ---------- B7 · Waste lê a estrutura interna da Produção
  {
    const w = ler('paginas/Perdas-Ordem.html'); const n = (w.match(/monthPlans|server\.dayLot/g) || []).length;
    res('B7', n > 0, 'Waste lê monthPlans/server.dayLot da base da Produção (regra 1)', { ocorrencias: n });
  }

  const b = await chromium.launch();
  // ---------- B3 · Waste com versões diferentes; aviso falso no Portal › Versões
  {
    const p = await b.newPage(); await p.goto(PG + 'Perdas-Ordem.html'); await p.waitForTimeout(900);
    const v = await p.evaluate(() => ({ pagina: PAGE.versao, base: typeof APP_VER !== 'undefined' ? APP_VER : null, tituloNoHtml: null }));
    v.tituloNoHtml = (/<title>[^<]*V(\d[\d.]*)<\/title>/.exec(ler('paginas/Perdas-Ordem.html')) || [])[1] || null;
    res('B3', v.base && v.base !== v.pagina, 'PAGE.versao (tela) ≠ APP_VER (gravado na base e no exports); o Portal › Versões compara os dois e avisa sempre', v);
    await p.close();
  }
  // ---------- B4 · vacVig/vacCambio sem data usam o dia em UTC (às 22h de Brasília já é amanhã)
  {
    const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo' }); const p = await ctx.newPage();
    await p.clock.setFixedTime(new Date('2026-11-30T22:30:00-03:00'));
    await p.goto(PG + 'Paradas.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const vs = [{ de: '2026-11-01', ate: '2026-11-30', valor: 'novembro' }, { de: '2026-12-01', valor: 'dezembro' }]; const v = vacVig(vs); return { horaLocal: new Date().toString().slice(16, 24), vigenciaUsada: v && v.valor }; });
    res('B4', r.vigenciaUsada === 'dezembro', '30/11 às 22:30 (Brasília), vacVig() sem data escolhe a vigência que começa em 01/12', r);
    await ctx.close();
  }
  // ---------- B5 · leitura de número diferente por página
  {
    const V = ['1.234', '15-', '123abc', '1,234.56', '12.345.678', 'R$ 1.234,56']; const out = {};
    for (const [n, a] of [['Waste', 'Perdas-Ordem.html'], ['Gel', 'Gestão-Gel-Vacutainer.html'], ['Paradas', 'Paradas.html']]) {
      const p = await b.newPage(); await p.goto(PG + encodeURI(a)); await p.waitForTimeout(900);
      out[n] = await p.evaluate(V => V.map(v => { const r = parseNum(v); return r == null || Number.isNaN(r) ? 'recusa' : r; }), V); await p.close();
    }
    const tab = Object.fromEntries(V.map((v, i) => [v, { Waste: out.Waste[i], Gel: out.Gel[i], Paradas: out.Paradas[i] }]));
    const difere = V.some((v, i) => out.Gel[i] !== out.Waste[i] || out.Paradas[i] !== out.Waste[i]);
    res('B5', difere, 'parseNum dá resultados diferentes no Waste, Gel e Paradas para a mesma entrada', tab);
  }
  // ---------- C1 · utilitários com implementações diferentes entre páginas
  {
    const crypto = require('crypto'); const fsP = ['Portal.html', 'Perdas-Ordem.html', 'Gestão-Gel-Vacutainer.html', 'Paradas.html', 'OEE-Vacutainer.html'];
    const cont = {};
    for (const nome of ['uid', 'toast', 'addDays', 'parseNum', 'todayISO', 'esc', 'modal']) {
      const h = new Set(); let n = 0;
      for (const f of fsP) { const m = new RegExp('(?:function\\s+' + nome + '\\s*\\(|const\\s+' + nome + '\\s*=)[^\\n]{0,400}').exec(ler('paginas/' + f)); if (m) { n++; h.add(crypto.createHash('md5').update(m[0]).digest('hex')); } }
      cont[nome] = `${h.size} versões em ${n} páginas`;
    }
    res('C1', Object.values(cont).some(x => !x.startsWith('1 ')), 'mesma função auxiliar com implementações diferentes entre páginas', cont);
  }
  // ---------- § 4 · integração por ordem: o que cada página publica hoje
  {
    const ex = {};
    const casos = [['Waste', 'Perdas-Ordem.html', 'enterTest()', 'B.exports||buildExports(B)'],
      ['Paradas', 'Paradas.html', 'modoTeste()', 'Store.data.exports||calcExports(Store.data)']];
    for (const [n, a, ent, get] of casos) {
      const p = await b.newPage(); p.on('dialog', d => d.accept()); await p.goto(PG + encodeURI(a)); await p.waitForTimeout(1000);
      await p.evaluate(`document.querySelectorAll('.overlay').forEach(o=>o.remove());${ent}`); await p.waitForTimeout(1000);
      ex[n] = await p.evaluate(`(()=>{const e=${get};return {chaves:Object.keys(e),porOrdem:Array.isArray(e.porOrdem)?Object.keys(e.porOrdem[0]||{}):null,eventosTemOrdem:Array.isArray(e.eventos)&&e.eventos.length?('ordem' in e.eventos[0]):null}})()`);
      await p.close();
    }
    const oee = ler('fontes/producao/OEE-base-2.0.html'); const so2meses = /for \(const m of \[shiftMonth\(today, -1\), mk\]\)/.test(oee);
    const portalSo1 = /exports na versão \$\{r\.base\.expV\}: este Portal só conhece a 1/.test(ler('paginas/Portal.html'));
    res('§4', true, 'dados por ordem já publicados (Waste porOrdem, Paradas eventos[].ordem); Produção publica ordens só do mês atual e do anterior; Portal só aceita exportsVersion 1',
      { exports: ex, producaoOrdensSo2Meses: so2meses, portalSoAceitaExportsV1: portalSo1 });
  }
  // ---------- § 5 · perfis: permissões existem no cadastro, mas as páginas só usam para a barra
  {
    const usos = {}; for (const f of ['Perdas-Ordem.html', 'Gestão-Gel-Vacutainer.html', 'Paradas.html', 'OEE-Vacutainer.html']) { const t = ler('paginas/' + f); usos[f] = (t.match(/vacPode\('[a-z]+',\s*'(lancar|importar|excluir|configurar|fechar)'/g) || []).length; }
    const total = Object.values(usos).reduce((x, y) => x + y, 0), soOrdens = /podeImportar\(\) \{ return typeof vacPode !== 'function' \|\| vacPode\('oee', 'importar'\)/.test(ler('fontes/producao/ordens_tela.js'));
    res('§5', total <= 1 && soOrdens, 'permissões do perfil quase não usadas na tela: só Produção › Ordens respeita "importar"; lançar, excluir, configurar e fechar não mudam nada nas páginas', usos);
  }
  // ---------- estabilidade: todas as abas, 2 temas, sem erro de JavaScript
  {
    const PAGS = [['Portal', 'Portal.html', 'enterTest()'], ['Produção', 'OEE-Vacutainer.html', "Demo.enterExample()"], ['Waste', 'Perdas-Ordem.html', 'enterTest()'], ['Gel', 'Gestão-Gel-Vacutainer.html', 'enterDemo();render()'], ['Paradas', 'Paradas.html', 'modoTeste()']];
    const erros = []; let abas = 0;
    for (const tema of ['light', 'dark']) {
      const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(t => { try { localStorage.setItem('vac.theme', t); } catch (e) { } }, tema);
      for (const [n, a, ent] of PAGS) {
        const p = await ctx.newPage(); p.on('pageerror', e => erros.push(`${n} ${tema}: ${e.message.slice(0, 120)}`)); p.on('dialog', d => d.accept());
        await p.goto(PG + encodeURI(a)); await p.waitForTimeout(1100); await p.evaluate(`document.querySelectorAll('.overlay').forEach(o=>o.remove());${ent}`); await p.waitForTimeout(900); await p.evaluate(fecha);
        const rotas = await p.evaluate(() => typeof ROUTES !== 'undefined' ? ROUTES.map(r => r[0]) : typeof TABS !== 'undefined' && typeof ui !== 'undefined' ? TABS.map(t => t[0]) : [...document.querySelectorAll('nav.vtabs #nav [data-t]')].map(e => e.dataset.t));
        for (const r of rotas) { await p.evaluate(r => { if (typeof ROUTES !== 'undefined') go(r); else if (typeof TABS !== 'undefined' && typeof ui !== 'undefined') { ui.tab = r; render(); } else { const e = document.querySelector(`nav.vtabs #nav [data-t="${r}"]`); e && e.click(); } }, r).catch(e => erros.push(`${n} ${r}: ${e.message.slice(0, 100)}`)); await p.waitForTimeout(350); abas++; }
        await p.close();
      }
      await ctx.close();
    }
    res('estabilidade', erros.length > 0, `${abas} abas visitadas (5 páginas × 2 temas): ${erros.length ? erros.length + ' erro(s)' : 'nenhum erro de JavaScript'}`, erros.slice(0, 5));
  }
  await b.close();
  fs.mkdirSync(RAIZ + 'testes/saida', { recursive: true }); fs.writeFileSync(RAIZ + 'testes/saida/diagnostico-2026-11-08.json', JSON.stringify(R, null, 1));
  console.log(`\n${R.filter(x => x.confirmado).length} de ${R.length} itens confirmados (estabilidade: "NÃO REPRODUZ" = sem erros, o esperado).`);
})().catch(e => { console.error(e); process.exit(1); });
