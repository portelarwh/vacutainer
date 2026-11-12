import sys
import json
import os
AQUI=os.path.dirname(os.path.abspath(__file__)); RAIZ=os.path.normpath(os.path.join(AQUI,'..','..'))
os.chdir(AQUI)
src=os.path.join(AQUI,'OEE-base-2.0.html'); out=os.path.join(RAIZ,'paginas','OEE-Vacutainer.html')
s=open(src,encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    c=s.count(a)
    if c!=cnt: raise SystemExit(f'ERRO ({c}x): {a[:90]!r}')
    s=s.replace(a,b)
from parada_tempo_build import aplicar as aplicar_parada_tempo
aplicar_parada_tempo(R)
from sqdcp_build import aplicar as aplicar_sqdcp
aplicar_sqdcp(R)
# Demonstração integrada: antes de ler preferências, handles e caches da operação real.
R("async function boot() {\n  await loadPrefs(); applyTheme();", """async function boot() {
  if(vacDemo.ativo){await loadPrefs();applyTheme();bindGlobal();Charts.bind();Store.S.user='Pessoa de demonstração';Store.enterExample(vacDemo.ler('oee'));
    vacDemo.registrar('oee',()=>({...db(),exports:Exports.build(db())}),d=>{Store.S.db=Model.ensure(d);Engine.bumpConfig()},()=>renderNow());Store.on(e=>{if(e==='data')vacDemo.publicar('oee')});
    App.sel.lineId='line_vac';App.filters.lineId='line_vac';App.filters.from=U.today();App.filters.to=U.today();App.op=location.hash==='#turno';if(App.op)App.route='shift';else applyHash();vacDemo.publicar('oee');renderNow();return}
  await loadPrefs(); applyTheme();""")
R("const i = root.querySelector('#exIn'); if (i) i.onclick = () => run(() => Demo.enterExample());", "const i = root.querySelector('#exIn'); if (i) i.onclick = () => vacDemo.entrar();")
R("else if (act === 'exitex') { Store.exitExample();", "else if (act === 'exitex') { if(vacDemo.ativo)return vacDemo.sair();Store.exitExample();")
R("vacDemo.publicar('oee');renderNow();return}", "Sqdcp.demo();vacDemo.publicar('oee');renderNow();return}")
R("else location.href=x.href", "else vacDemo.ir(x.href)")
R("location.href=sysHref(port,'versoes')", "vacDemo.ir(sysHref(port,'versoes'))")
R('<button class="btn primary" id="uOk">Usar este nome</button>', '<button class="btn primary" id="uOk">Usar este nome</button><button class="btn" data-vdemo-entrar onclick="vacDemo.entrar()">Demonstração do sistema</button>')
R('<button class="btn ghost" id="wLocal">Começar só neste navegador</button>', '<button class="btn ghost" id="wLocal">Começar só neste navegador</button><button class="btn" data-vdemo-entrar onclick="vacDemo.entrar()">Demonstração do sistema</button>')
R('Abre uma <b>cópia em memória</b> da base com cerca de 3 semanas de dados fictícios (hora a hora, paradas, scrap, dias fechados e abertos), para treinar ou demonstrar. Nada é gravado na pasta da rede nem no navegador: ao sair, tudo volta exatamente como estava.', 'Abre a <b>demonstração integrada do sistema</b>, com produção, perdas, gel, paradas, equipamentos e ações fictícias relacionadas. Você pode editar o exemplo e navegar entre as páginas. As bases reais ficam preservadas; fechar ou recarregar a demonstração descarta as alterações fictícias.')
R("const APP_VERSION = '2.0.1';","const APP_VERSION = '2.4.66';")
# 2.4.65 · kit: cartões reorganizáveis (alça que arrasta no Chrome/Edge, barra também nos cartões sem gráfico da grade, setas apagadas na ponta)
# 2.4.45 · login comum do kit (vacLogin): o "Quem está usando?" só aparece quando o login não vale (demonstração, teste, TV)
R("function askUser(first) {\n  const known","function askUser(first) {\n  if (typeof vacLogin !== 'undefined' && !vacLogin.dispensado()) return vacLogin.abrir({ trocar: !!vacLogin.sessao() });\n  const known")
R("  if (!Store.S.user) askUser({ then: () => { if (!dir && !cache) welcome(); } });",
  "  if (!Store.S.user) { if (typeof vacLogin !== 'undefined' && !vacLogin.dispensado()) { if (!dir && !cache) welcome(); } else askUser({ then: () => { if (!dir && !cache) welcome(); } }); }")
# 2.4.30 · Fase 5 · 5a (D6): porDia e porDiaTurno com a capacidade (cap) e a meta decimal (metaDec): o Portal soma qualquer período sem média de médias
R("porDia.push({ dia: d.date, oee: r4(r.oee), oeeMeta: r4(r.oeeTarget), boa: n0(r.good), scrap: n0(r.scrap), metaOp: n0(r.metaOp),", "porDia.push({ dia: d.date, oee: r4(r.oee), oeeMeta: r4(r.oeeTarget), boa: n0(r.good), scrap: n0(r.scrap), metaOp: n0(r.metaOp), cap: n0(r.cap), metaDec: n0(r.metaDec),")
R("porDiaTurno.push({ dia: d.date, turno: sr.ps.snap.code || sr.ps.snap.name, oee: r4(sr.r.oee), boa: n0(sr.r.good), scrap: n0(sr.r.scrap),", "porDiaTurno.push({ dia: d.date, turno: sr.ps.snap.code || sr.ps.snap.name, oee: r4(sr.r.oee), oeeMeta: r4(sr.r.oeeTarget), boa: n0(sr.r.good), scrap: n0(sr.r.scrap), cap: n0(sr.r.cap), metaDec: n0(sr.r.metaDec), metaOp: n0(sr.r.metaOp),")
# 2.4.25 · junção com a main: a correção da duração da parada (PR #24, parada_tempo_build.py) saiu lá como 2.4.21;
#          a numeração desta linha (2.4.21–2.4.24) seguiu em paralelo. A 2.4.25 tem as duas.
# 2.4.21 · ARQ-09 (briefing 09/11/2026, opção a): sem "Modo exemplo" próprio nas Configurações; para apresentar, a Demonstração integrada
#          (botão do topo). Store.enterExample continua: é o que a Demonstração e os testes usam por dentro.
R("['auditoria', 'Auditoria'], ['demo', 'Modo exemplo'], ['ajuda', 'Ajuda e aceite']","['auditoria', 'Auditoria'], ['ajuda', 'Ajuda e aceite']")
R("<p><b>Modo exemplo.</b> Você está numa cópia com dados fictícios. Nada é gravado na base da pasta; ao sair, tudo volta como estava.</p><button class=\"btn sm primary\" data-act=\"exitex\">Sair do modo exemplo</button>","<p><b>Demonstração.</b> Você está numa cópia com dados fictícios. Nada é gravado na base da pasta; ao sair, tudo volta como estava.</p><button class=\"btn sm primary\" data-act=\"exitex\">Sair da demonstração</button>")
R("'exemplo': ['rule', 'Modo exemplo']","'exemplo': ['rule', 'Demonstração']")
R("toast('Você saiu do modo exemplo.')","toast('Você saiu da demonstração.')")
R("toast('Modo exemplo: nada do que você fizer será gravado.')","toast('Demonstração: nada do que você fizer será gravado.')")
# 2.4.22 · ARQ-06 (briefing 09/11/2026): unidade, rótulo e arredondamento da meta vêm do Portal (parametros.producao);
#          o arredondamento tem vigência (D7): cada dia usa o valor da própria data. Sem vigência, vale settings.roundingUnit (como antes).
R("const ServerData = (() => {", """/* 2.4.22 · ARQ-06 · arredondamento da meta na data (vigências do Portal em settings.roundingVig) */
function roundAt(st, date) {
  const L = Array.isArray(st && st.roundingVig) ? st.roundingVig : null;
  if (L && L.length && date) { const v = L.filter(x => x && x.de && x.de <= date && +x.valor > 0).sort((a, b) => a.de < b.de ? 1 : -1)[0]; if (v) return +v.valor; }
  return +(st && st.roundingUnit) || 1;
}
const ServerData = (() => {""")
R("const ru = +st.roundingUnit || 1;", "const ru = roundAt(st, day.date);")
R("const st = db.settings, ru = +st.roundingUnit || 1;", "const st = db.settings, ru = roundAt(st, date);")
R("perHour: U.ceilTo(rt.pph * rt.oee, +d.settings.roundingUnit || 1)", "perHour: U.ceilTo(rt.pph * rt.oee, roundAt(d.settings, wk))")
# ARQ-06 · exibição das quantidades: preferência comum do computador (vac.qtd, Portal › Parâmetros › Neste computador)
R("const DISP = () => App.prefs.qtyDisplay === 'abs' ? 1 : UNIT();", "const vacQtd = () => { try { const v = localStorage.getItem('vac.qtd'); if (v === 'abs' || v === 'unit') return v; } catch (e) { } return App.prefs.qtyDisplay; };\nconst DISP = () => vacQtd() === 'abs' ? 1 : UNIT();")
R("const unitLbl = () => App.prefs.qtyDisplay === 'abs' ? 'un' :", "const unitLbl = () => vacQtd() === 'abs' ? 'un' :")
# 2.4.24 · Fase 2 do briefing (TUR-01..04, POR-10): turno não produtivo, habilitação no dia e produção fora dos turnos (fontes/producao/turnos_np.js)
R("  function activeShiftsAt(db, date, lineId, wd) {\n    return db.shifts.filter(s => !s.deleted && s.status !== 'inativo' && (!lineId || !s.lineId || s.lineId === lineId))\n      .map(s => ({ shift: s, v: shiftVersionAt(s, date, wd) })).filter(x => x.v)",
  "  /* 2.4.24 · TUR-01: vigência não produtiva (productive:false) fica fora, a não ser com incluirNP */\n  function activeShiftsAt(db, date, lineId, wd, incluirNP) {\n    return db.shifts.filter(s => !s.deleted && s.status !== 'inativo' && (!lineId || !s.lineId || s.lineId === lineId))\n      .map(s => ({ shift: s, v: shiftVersionAt(s, date, wd) })).filter(x => x.v && (incluirNP || x.v.productive !== false))")
R("    for (const { shift, v } of activeShiftsAt(db, date, opts.shiftLineId || lineId, opts.asWeekday)) {",
  "    for (const { shift, v } of activeShiftsAt(db, date, opts.shiftLineId || lineId, opts.asWeekday, !!opts.only).filter(x => !opts.only || x.shift.id === opts.only)) {   /* 2.4.24 · TUR-02: opts.only monta só um turno (habilitar no dia) */")
R("    if (day.scrapMode === 'day') { dayAgg.scrap = +day.scrapDay || 0;",
  "    /* 2.4.24 · TUR-01/04, POR-10: produção fora dos turnos reatribuída (OEE reportado); o real fica em foraTurno */\n    const ft = ForaTurno.aplicar(db, day, shiftRes, dayAgg);\n    if (ft && ft.pecas) M('info', `${U.fmt(ft.pecas)} peça(s) produzida(s) fora dos turnos produtivos contam neste dia (OEE reportado). Veja o quadro \"Turnos não produtivos e produção fora de turno\".`);\n    if (day.scrapMode === 'day') { dayAgg.scrap = +day.scrapDay || 0;")
R("    return { day, flat, shifts: shiftRes, r: dayR, agg: dayAgg, officialDaily, comp, msgs, events: evRes };",
  "    if (ft) { ft.real = ft.realDia ? finalize(ft.realDia, st) : null; }\n    return { day, flat, shifts: shiftRes, r: dayR, agg: dayAgg, officialDaily, comp, msgs, events: evRes, foraTurno: ft };")
R("    h += SrvUI.dayCard(day, res);\n", "    h += SrvUI.dayCard(day, res);\n    h += ForaTurnoUI.card(day, res);   /* 2.4.24 · TUR-02/03/04 */\n    h += GelDia.card(day, res);   /* 2.4.29 · GEL-04 */\n")
R("metasModal(); }\n    bindDayBar(root); bindNoDay(root);\n    const day = curDay(); if (!day || Engine.isOffDay(db(), day)) return;\n    SrvUI.bindDay(root, day);", "metasModal(); }\n    bindDayBar(root); bindNoDay(root);\n    const day = curDay(); if (!day || Engine.isOffDay(db(), day)) return;\n    SrvUI.bindDay(root, day); ForaTurnoUI.mount(root, day); GelTurno.mount(root, day, Engine.computeDay(db(), day));")
R("async function boot() {\n", open(os.path.join(AQUI,'turnos_np.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
# 2.4.28 · Fase 4 · 4c (GEL-03 / PRD-10, G1): Registrar scrap de gel no turno (Lançamento e tela do turno); gravado em ps.gelScrap; exports porDiaTurno[].gel
R("async function boot() {\n", open(os.path.join(AQUI,'gel_turno.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
# 2.4.31 · Fase 5 · 5b (PRD-01, D9): Painel e Visão Geral numa aba só (fontes/producao/visao_geral.js); Hoje e Ontem nos períodos rápidos
R("async function boot() {\n", open(os.path.join(AQUI,'visao_geral.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
# 2.4.32 · Fase 5 · 5c (PRD-07): Segurança e Qualidade no relatório do dia e na passagem de turno, com opção "só performance" (fontes/producao/relatorio_sq.js)
R("async function boot() {\n", open(os.path.join(AQUI,'relatorio_sq.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
R(" gráficos como imagem no e-mail</label>", " gráficos como imagem no e-mail</label>${R.type === 'day' || R.type === 'shift' ? `<label class=\"chk\" title=\"Desmarcado: relatório só de performance\"><input type=\"checkbox\" id=\"rpSQ\" ${RelSQ.incluir() ? 'checked' : ''}> incluir Segurança e Qualidade</label>` : ''}")
R("    q('#rpImg').onchange = e => { App.prefs.rpImg = e.target.checked; savePrefs(); };", "    q('#rpImg').onchange = e => { App.prefs.rpImg = e.target.checked; savePrefs(); };\n    { const sq = q('#rpSQ'); if (sq) sq.onchange = e => { App.prefs.rpSQ = e.target.checked; savePrefs(); R.summary = null; re(); }; }")
R("if (!p.view) p.view = 'mine';", "if (!p.view) p.view = 'padrao';")
R("  const v = App.views[App.route];", "  if (App.route === 'panel') { App.route = 'overview'; try { localStorage.setItem('oee-route', 'overview'); } catch (e) { } if (VisaoGeral.naPadrao()) Panel.st().view = 'mine'; }   /* 2.4.31 · PRD-01: o Painel abre na Visão Geral */\n  const v = App.views[App.route];")
R("<div class=\"seg\">${[['wk', 'Semana atual'], ['pwk', 'Semana anterior'], ['7', '7 dias'], ['30', '30 dias'], ['mtd', 'Mês atual'], ['pm', 'Mês anterior'], ['fy', 'Ano fiscal']]",
  "<div class=\"seg\">${[['d0', 'Hoje'], ['d1', 'Ontem'], ['wk', 'Semana'], ['mtd', 'Mês'], ['pwk', 'Semana anterior'], ['pm', 'Mês anterior'], ['7', '7 dias'], ['30', '30 dias'], ['fy', 'Ano fiscal']]")
R("    if (k === '7') { App.filters.from = U.addDays(t, -6); App.filters.to = t; }", "    if (k === 'd0') { App.filters.from = t; App.filters.to = t; }\n    if (k === 'd1') { App.filters.from = U.addDays(t, -1); App.filters.to = U.addDays(t, -1); }\n    if (k === '7') { App.filters.from = U.addDays(t, -6); App.filters.to = t; }")
R("const PN_PRES = [['mtd', 'Mês atual'], ['pm', 'Mês anterior'], ['wk', 'Semana atual'],", "const PN_PRES = [['d0', 'Hoje'], ['d1', 'Ontem'], ['wk', 'Semana'], ['mtd', 'Mês'], ['pm', 'Mês anterior'],")
R("    if (k === '30') return [U.addDays(t, -29), t];\n    if (k === 'mtd') return [U.monthStart(t), t];", "    if (k === 'd0') return [t, t];\n    if (k === 'd1') return [U.addDays(t, -1), U.addDays(t, -1)];\n    if (k === '30') return [U.addDays(t, -29), t];\n    if (k === 'mtd') return [U.monthStart(t), t];")
R("    h += `<div class=\"section grid g2\">${res.shifts.map(sr => shiftBlock(day, sr)).join('')}</div>`;", "    h += `<div class=\"section grid g2\">${res.shifts.map(sr => shiftBlock(day, sr, res)).join('')}</div>`;")
R("function shiftBlock(day, sr) {", "function shiftBlock(day, sr, res) {")
R("      <label class=\"kvrow\"><input type=\"checkbox\" data-shoff=\"${ps.id}\"", "      ${res ? GelTurno.bloco(day, sr, res) : ''}\n      <label class=\"kvrow\"><input type=\"checkbox\" data-shoff=\"${ps.id}\"")
R("        <label class=\"f chk wide\"><input type=\"checkbox\" data-shoff=\"${ps.id}\"", "        ${GelTurno.bloco(day, sr, res)}\n        <label class=\"f chk wide\"><input type=\"checkbox\" data-shoff=\"${ps.id}\"")
R("    const ps = day.shifts.find(p => p.shiftId === O.shiftId); if (!ps) return;\n    const cat = root.querySelector('#opCat');", "    const ps = day.shifts.find(p => p.shiftId === O.shiftId); if (!ps) return;\n    GelTurno.mount(root, day, Engine.computeDay(d, day));\n    const cat = root.querySelector('#opCat');")
R("motivo: sr.ps.off ? (sr.ps.offReason || '') : undefined, status: sr.ps.status });", "motivo: sr.ps.off ? (sr.ps.offReason || '') : undefined, status: sr.ps.status, extraMin: n0(sr.agg.extraMin || 0), gel: GelTurno.exp(sr.ps, d.date) });")
# 2.4.26 · Fase 3 do briefing (IMP-04): o exports publica as importações (o que, quando, período coberto) para o Portal › Importação
# 2.4.26 · IMP-05/06: o Portal abre a tela certa: #aba=ordens&sub=mb51|coois|lista|conc|hist e #aba=config&sec=importacao
R("  const [k, v] = h.split('='); if (!v) return false;\n  const d = db();",
  "  if (h.includes('&')) { const q = new URLSearchParams(h), ab = q.get('aba'); if (ab && ROUTES.some(r => r[0] === ab)) { App.route = ab; const sb = q.get('sub'), sc = q.get('sec');\n    if (ab === 'ordens' && sb && typeof Ord !== 'undefined' && ['mb51', 'coois', 'lista', 'conc', 'hist'].includes(sb)) Ord.sub = sb;\n    if (ab === 'config' && sc && typeof CFG_SECS !== 'undefined' && CFG_SECS.some(x => x[0] === sc)) App.cfgSec = sc;\n    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } return true; } }\n  const [k, v] = h.split('='); if (!v) return false;\n  const d = db();")
R("    const cad = cadastros(db);\n    return { exportsVersion: 1, geradoEm: U.nowIso(), cadastros: cad, modulo: 'oee',",
  "    const cad = cadastros(db);\n    const TIPO_IMP = { metas: 'META_OEE', 'histórico': 'RELATORIO', paradas: 'PARADAS_XLSM', planos: 'PLANOS_PCP' };\n    const importacoes = [...(db.imports || []).filter(i => i && !i.period && TIPO_IMP[i.kind]).map(i => ({ tipo: TIPO_IMP[i.kind], em: i.at, por: i.by || null, arquivo: i.source || null })),\n      ...((db.server || {}).imports || []).map(i => ({ tipo: 'MES', em: i.at, por: i.by || null, arquivo: i.file || null, de: i.from || null, ate: i.to || null }))].sort((a, b) => a.em < b.em ? 1 : -1).slice(0, 400);\n    return { exportsVersion: 1, geradoEm: U.nowIso(), cadastros: cad, modulo: 'oee', importacoes,")
# 2.4.17 · C2–C6: kit com a ficha por pasta (AT-08) e a contagem da fila durável para o Portal (C5)
# 2.4.16 · C1: kit com a fila durável (vacFila), formato da base (vacFormatoBase), link seguro (vacLinkSeguro) e trava da 2ª aba
# 2.4.15 · E11: kit (busca leva o equipamento à ficha em Equipamentos; bases de Iniciativas e Equipamentos em 00. Bases)
# 2.4.14 · E8: Paradas › Eventos filtrados por um item do Pareto → "+ Ação no Planner" (Iniciativas), com a fotografia e o link; a Produção não grava lá
R("${list ? '<button class=\"btn sm\" id=\"stClr\">Limpar filtro</button>' : ''}",
  "${list ? '<button class=\"btn sm\" id=\"stClr\">Limpar filtro</button>' : ''}${list && typeof vacNovaAcaoBotao === 'function' ? vacNovaAcaoBotao(oeeAcaoPlanner(S.dim, S.pick, list.events), '+ Ação no Planner', 'btn sm') : ''}")

# 2.4.13 · E5: ficha da ordem comum (kit): botão Ficha na ordem do SAP e vacPastaAtual() em ordens_tela.js
# 2.4.11 · E1: FolderBackend tinha duas chaves readBackup; a segunda (sem o local antigo) vencia e os backups soltos em 00. Backups/ não eram lidos
R("    async readBackup(name) { const bd = await this.backupDir(); const fh = await bd.getFileHandle(name); return (await fh.getFile()).text(); }\n  };","  };")
# 2.4.10 · sair da TV redesenha a tela de baixo: a TV limpa o registro dos gráficos (Charts.reset) e a dica e o clique da tela paravam até trocar de aba
R("    if (this.prevTheme) document.documentElement.setAttribute('data-theme', this.prevTheme); else applyTheme();\n    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }\n  },",
  "    if (this.prevTheme) document.documentElement.setAttribute('data-theme', this.prevTheme); else applyTheme();\n    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }\n    { const y = window.scrollY; try { renderNow(); } catch (e) { console.warn(e); } window.scrollTo(0, y); }   // 2.4.10 · gráficos voltam a responder\n  },")
# 2.4.10 · CSV: mesma regra das outras páginas (kit vacCsvTexto). Antes, número escrito como texto que começa com "-" (ex.: -12,5) também ganhava o prefixo '
R("    if (/^[=+\\-@\\t\\r]/.test(s)) s = \"'\" + s;","    s = typeof vacCsvTexto === 'function' ? vacCsvTexto(s) : (/^[=+\\-@\\t\\r]/.test(s) ? \"'\" + s : s);")
# 2.4.9 · kit: situação das páginas (selo na barra; docs/paginas-construcao.md)
# 2.4.8 · relatório em PDF: comentário longo continua na página seguinte (antes o que passava do fim da folha se perdia)
R("  if (c.note && c.note.trim()) { doc.setFillColor(227, 236, 245); const L = c.note.split(/\\n+/).filter(s => s.trim()).reduce((n, s) => n + doc.splitTextToSize(T(s), W - 6).length, 0); doc.rect(m, y - 1, W, L * 4.2 + 4, 'F'); y += 1.5; doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...ACC); doc.text('COMENTÁRIO', m + 3, y + 2); y += 4.5; for (const ln of c.note.split(/\\n+/).filter(s => s.trim())) { const LL = doc.splitTextToSize(T(ln), W - 6); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(LL, m + 3, y + 3); y += LL.length * 4.2; } y += 3; }",
  "  if (c.note && c.note.trim()) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); const LN = c.note.split(/\\n+/).filter(s => s.trim()).flatMap(s => doc.splitTextToSize(T(s), W - 6)); let first = true; while (LN.length) { const room = Math.max(1, Math.floor((PH - m - 6 - y - (first ? 7 : 2.5)) / 4.2)); const P = LN.splice(0, room); doc.setFillColor(227, 236, 245); doc.rect(m, y - 1, W, P.length * 4.2 + (first ? 8.5 : 4), 'F'); if (first) { doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...ACC); doc.text('COMENTÁRIO', m + 3, y + 3.5); y += 4.5; } doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(P, m + 3, y + 3, { lineHeightFactor: 4.2 / (9.5 * 0.3528) }); y += P.length * 4.2 + 3; first = false; if (LN.length) { doc.addPage(); head(false); } } y += 1; }")
# 2.4.8 · cartões do PDF: rótulo em até 2 linhas (antes "ATENDIMENTO AO PLANO INICIAL" saía "ATENDIMENTO AO PLANO")
R("    const cols = Math.min(7, M.kpis.length), gap = 2, bw = (W - gap * (cols - 1)) / cols, bh = 19;",
  "    const cols = Math.min(7, M.kpis.length), gap = 2, bw = (W - gap * (cols - 1)) / cols; doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); const dy = M.kpis.some(k => doc.splitTextToSize(T(k.l.toUpperCase()), bw - 4).length > 1) ? 2.6 : 0, bh = 19 + dy;")
R("doc.text(doc.splitTextToSize(T(k.l.toUpperCase()), bw - 4).slice(0, 1), x0 + 2, y + 4);","doc.text(doc.splitTextToSize(T(k.l.toUpperCase()), bw - 4).slice(0, 2), x0 + 2, y + 4, { lineHeightFactor: 1.15 });")
R("doc.text(v, x0 + 2, y + 10.5);","doc.text(v, x0 + 2, y + 10.5 + dy);")
R("doc.text(T(k.u), x0 + 3 + vw, y + 10.5);","doc.text(T(k.u), x0 + 3 + vw, y + 10.5 + dy);")
R(".slice(0, 2), x0 + 2, y + 13.5);",".slice(0, 2), x0 + 2, y + 13.5 + dy);")
# 2.4.8 · imprimir o relatório: só o relatório (sem cabeçalho da página nem faixa de exemplo) e em A4 paisagem, como o PDF
R("@media print{body.printing-report main>*:not(.rp-doc){display:none!important}",
  "@media print{body.printing-report>*:not(main),body.printing-report main>*:not(.rp-doc){display:none!important}body.printing-report .rp-doc{page:relatorio}@page relatorio{size:A4 landscape;margin:10mm}")
# 2.4.8 · aba por link (#aba=overview) e aba inicial do perfil (Portal › Perfis/Usuários), só na 1ª abertura da sessão
R("  if (k === 'pend') { App.route = 'pend';","  if (k === 'aba' && ROUTES.some(r => r[0] === v)) { App.route = v; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } return true; }\n  if (k === 'pend') { App.route = 'pend';")
R("  App.op = location.hash === '#turno'; if (App.op) App.route = 'shift'; else applyHash();",
  "  { const ai = typeof vacAbaInicial === 'function' ? vacAbaInicial('oee') : null; if (ai) try { history.replaceState(null, '', '#' + ai); } catch (e) { } }\n  App.op = location.hash === '#turno'; if (App.op) App.route = 'shift'; else applyHash();")
# 2.4.7 · B04: só "não encontrado" é base ausente; erro de leitura (rede, permissão, JSON) não oferece criar base nova por cima
R("const exists = await be.read().catch(() => null);","const exists = await be.read().catch(e => (typeof vacNaoAchou === 'function' && vacNaoAchou(e)) ? null : Promise.reject(e));")
# 2.4.6 · bases em 00. Bases (kit vac-bases): a pasta da base passa por vacRaiz (as 7 bases ficam em 00. Bases; Logo, backups e o resto na raiz)
R("function FolderBackend(dir) {\n  return {\n    kind: 'pasta', ","function FolderBackend(dir) {\n  dir = typeof vacRaiz === 'function' ? vacRaiz(dir) : dir;   // 2.4.6 · bases em 00. Bases\n  return {\n    kind: 'pasta', ")
# e a Produção move as dela (oee-vacutainer-base e ordens-base) ao conectar com permissão de gravação
R("    if (S.access === 'none') { S.mode = 'local'; setStatus('reconectar'); emit('need-permission'); return 'permission'; }\n    const ext = await readExternal();",
  "    if (S.access === 'none') { S.mode = 'local'; setStatus('reconectar'); emit('need-permission'); return 'permission'; }\n    if (S.access === 'readwrite' && backend.dir && typeof vacMoverBases === 'function') { try { vacAvisoBases(await vacMoverBases(backend.dir, [[BASE_FILE, BACKUP_DIR + '/' + MODULE_BK], ['ordens-base.json', BACKUP_DIR + '/Ordens']])); } catch (e) { console.warn('bases', e); } }\n    const ext = await readExternal();")
# 2.4.5 · vac-visual (V07): no modo exemplo, o aviso "Dados de demonstração carregados" repetia o do modo exemplo (e Remover não grava nada ali)
R("  if (!App.op && Demo.present()) h += `<div class=\"banner demo\"><p><b>Dados de demonstração carregados.","  if (!App.op && Demo.present() && S.mode !== 'exemplo') h += `<div class=\"banner demo\"><p><b>Dados de demonstração carregados.")
# 2.4.5 · vac-visual: no card com estado (borda e ícone do semáforo), o valor usa a mesma cor do estado; sem estado, abaixo da meta continua vermelho
R(".kpi .v.below,.tv .bk .v.below{color:var(--crit)}",".kpi .v.below,.tv .bk .v.below{color:var(--crit)}\n.kpi.k-ok .v.below,.kpi.k-warn .v.below,.kpi.k-crit .v.below{color:var(--kc)}")
# 2.4.3 · F01: a releitura confere a identidade da gravação (saveId), não só o número da versão;
# duas gravações simultâneas geram o mesmo databaseVersion e a de quem perdeu não pode ser dada como salva
R("        next.databaseVersion = (extV || 0) + 1;\n","        next.databaseVersion = (extV || 0) + 1;\n        next.saveId = U.uid('sv');   // 2.4.3 · identidade desta gravação\n")
R("        if (!check || check.db.databaseVersion !== next.databaseVersion) throw new Error('A gravação não foi confirmada na releitura do arquivo.');",
  "        if (!check || check.db.databaseVersion !== next.databaseVersion) throw new Error('A gravação não foi confirmada na releitura do arquivo.');\n"
  "        if (check.db.saveId !== next.saveId) {   // outra pessoa gravou a mesma versão ao mesmo tempo: continua pendente e reaplica sobre a versão dela\n"
  "          await savePending(); setStatus('pendente', 'Outra pessoa gravou ao mesmo tempo: suas alterações serão reaplicadas sobre a versão dela.'); flushSoon(); return;\n"
  "        }")
R("  $('#nav').innerHTML = visibleRoutes().map(([k, l]) => { const g = ROUTE_GROUP[k] || ''; const sep","  if (typeof renderNavGrupos === 'function') { renderNavGrupos(); renderBanner(); return; }\n  $('#nav').innerHTML = visibleRoutes().map(([k, l]) => { const g = ROUTE_GROUP[k] || ''; const sep")
R("    <span title=\"${esc(S.mode === 'pasta' ? 'Pasta ' + (S.backend && S.backend.name) : S.mode === 'arquivo' ? 'Arquivo ' + (S.fileName || '') : 'Somente neste navegador')}\">Última gravação <b>${d ? U.brDT(d.lastModifiedAt) : '—'}</b>${d ? ' por ' + esc(d.lastModifiedBy || '—') : ''}</span>`;","    <span class=\"pill none\" title=\"${esc((S.mode === 'pasta' ? 'Pasta ' + (S.backend && S.backend.name) : S.mode === 'arquivo' ? 'Arquivo ' + (S.fileName || '') : 'Somente neste navegador') + (d ? ' · última gravação ' + U.brDT(d.lastModifiedAt) + ' por ' + (d.lastModifiedBy || '—') : ''))}\">${d ? U.brDT(d.lastModifiedAt).slice(0, 5) + ' ' + U.brDT(d.lastModifiedAt).slice(-5) : '—'}</span>`;")
R("const PAGE = { id: 'oee', titulo: 'OEE · Linha Vacutainer', tituloCurto: 'OEE', subtitulo: 'Produção e OEE',","const PAGE = { id: 'oee', titulo: 'Produção · Linha Vacutainer', tituloCurto: 'Produção', subtitulo: 'Plano, ordens, apontamento e OEE',")
R("    async readSibling(name) { try { const fh = await dir.getFileHandle(name); return await (await fh.getFile()).text(); } catch (e) { return null; } },",
  "    async readSibling(name) { try { const fh = await dir.getFileHandle(name); return await (await fh.getFile()).text(); } catch (e) { return null; } },\n    // 2.1 · outra base da mesma pasta (ordens-base.json) e backup em 00. Backups/<sub>\n    async writeSibling(name, text) { const fh = await dir.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(text); await w.close(); },\n    async backupSub(sub, name, text) { const r = await this.backupRoot(); const d = await r.getDirectoryHandle(sub, { create: true }); const fh = await d.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(text); await w.close(); return name; },")
# 2.4.11 · E1: leitura estrita do arquivo de ordens (null só quando não existe; erro de rede/permissão sobe e nada é gravado por cima)
R("    async writeSibling(name, text) {","    async readSiblingStrict(name) { try { const fh = await dir.getFileHandle(name); return await (await fh.getFile()).text(); } catch (e) { if (typeof vacNaoAchou === 'function' ? vacNaoAchou(e) : (e && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError'))) return null; throw e; } },\n    async writeSibling(name, text) {")
# 2.4.12 · E4: exports.porOrdem com histórico (até 24 meses) e os dias de cada lote (chave "dia|lote" do servidor), com a cobertura declarada.
# O bloco "ordens" (mês atual e anterior) continua igual para quem já lê
R("    // lotes do servidor (últimos 150 dias): retrabalho, situação e observação, para Perdas e Gel\n",
  "    // 2.4.12 · E4: ordens dos planos dos últimos 24 meses (ficha da ordem e Waste), com os dias de cada lote no servidor\n"
  "    const diasPorLote = new Map(); for (const [k, v] of Object.entries((db.server || {}).dayLot || {})) { const i = k.indexOf('|'); if (i < 0) continue; const lot = k.slice(i + 1).trim(); if (!lot) continue; let a = diasPorLote.get(lot); if (!a) diasPorLote.set(lot, a = []); a.push({ dia: k.slice(0, i), tipo: (v && v.kind) || null }); }\n"
  "    const porOrdem = [], mIni = shiftMonth(today, -23);\n"
  "    for (let i = 23; i >= 0; i--) {\n"
  "      const m = shiftMonth(today, -i), p = Engine.planFor(db, m, LINE); if (!p || !(p.orders || []).length) continue;\n"
  "      const G = Engine.orderProgress(db, p).byOrder;\n"
  "      for (const o of p.orders) {\n"
  "        const g = G.get(o.id) || {}, c = (db.catalogs || []).find(x => x.id === o.catalogId), lot = o.lot ? String(o.lot).trim() : '', dl = lot ? (diasPorLote.get(lot) || []) : [];\n"
  "        porOrdem.push({ mes: m, ordem: String(o.order), lote: lot || null, catalogo: c ? c.code : (o.code || null), qtd: n0(o.qty), qtdReal: o.qtyReal == null ? null : n0(o.qtyReal), inicio: o.start || null, fim: o.end || null, inicioReal: o.startReal || g.firstAt || null, fimReal: o.endReal || g.doneAt || null, produzido: n0(g.produced || 0),\n"
  "          diasLote: dl.map(x => x.dia).sort(), retrabalhoDias: dl.filter(x => x.tipo === 'retrabalho').map(x => x.dia).sort() });\n"
  "      }\n"
  "    }\n"
  "    const porOrdemCobertura = { de: mIni, ate: mk, meses: 24, ordens: porOrdem.length, fonte: 'Plano do mês (PCP) e servidor (dias do lote)' };\n"
  "    // 2.4.60 · regra da linha: cada ordem tem um lote e cada lote tem uma ordem. Conflito não bloqueia nada: vira pendência (atenção) e vai no exports\n"
  "    const ordemLote = typeof vacOrdemLote === 'function' ? vacOrdemLote(porOrdem) : { ordens: [], lotes: [] };\n"
  "    for (const x of ordemLote.ordens.slice(0, 20)) pendencias.push({ sev: 2, tipo: 'ordemLote', txt: `Ordem ${x.ordem} aparece com ${x.lotes.length} lotes (${x.lotes.join(', ')}): cada ordem tem um só lote; conferir o plano`, link: 'plano=' + x.mes });\n"
  "    for (const x of ordemLote.lotes.slice(0, 20)) pendencias.push({ sev: 2, tipo: 'ordemLote', txt: `Lote ${x.lote} aparece em ${x.ordens.length} ordens (${x.ordens.join(', ')}): cada lote tem uma só ordem; conferir o plano`, link: 'plano=' + x.mes });\n"
  "    // lotes do servidor (últimos 150 dias): retrabalho, situação e observação, para Perdas e Gel\n")
R("planoMes, ordens, lotes, pendencias, kpis };","planoMes, ordens, porOrdem, porOrdemCobertura, ordemLote, lotes, pendencias, kpis };")
svc=open('ordens_servico.js',encoding='utf-8').read().replace("if (typeof module !== 'undefined') module.exports = OrdensSAP;\n","")
tela=open('ordens_tela.js',encoding='utf-8').read()
css="""<style>
/* Produção 2.1 · Ordens (MB51 + COOIS) */
.ord-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}.ord-bar .f{min-width:0}
.ord-st{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-left:auto}
.ord-sub{margin-top:12px;flex-wrap:wrap}
.ord-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.ord-k{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:10px 0}
.ord-kc{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:8px 10px;background:var(--surface);display:flex;flex-direction:column;gap:2px}
.ord-kc span{font-size:12px;color:var(--muted)}.ord-kc b{font-size:20px;font-family:var(--f-display,inherit)}
.ord-kc.ok{border-left-color:var(--ok)}.ord-kc.warn{border-left-color:var(--warn)}.ord-kc.crit{border-left-color:var(--crit)}
.ord-prev{outline:2px dashed color-mix(in srgb,var(--info) 50%,transparent);outline-offset:-2px}
.ord-fh{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:10px}.ord-fh>div{display:flex;flex-direction:column;gap:3px}
.note{border:1px solid var(--line);border-left:4px solid var(--info);border-radius:8px;padding:8px 12px;margin:8px 0;background:color-mix(in srgb,var(--info) 6%,var(--surface))}
.note.w{border-left-color:var(--warn);background:color-mix(in srgb,var(--warn) 8%,var(--surface))}.note.e{border-left-color:var(--crit);background:color-mix(in srgb,var(--crit) 8%,var(--surface))}
.warn-t{color:var(--warn)}
.nitem .cnt{font-family:var(--f-body);font-size:11px;background:var(--pend);color:#fff;border-radius:99px;padding:0 6px;margin-left:8px}
.ord-per{margin-top:8px}.ord-per-q{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.ord-per-q .btn.on{background:var(--accent,#1f6feb);color:#fff;border-color:transparent}
.ord-mat{text-decoration:none;color:var(--accent,#1f6feb)}.ord-mat:hover{text-decoration:underline}
.ord-st-sap{display:inline-flex;flex-wrap:wrap;gap:3px;cursor:help}
.sst{font:600 11px/1 var(--f-mono,monospace);padding:3px 5px;border-radius:5px;border:1px solid transparent;background:#e8eef9;color:#1d4ed8}
.sst.exec{background:#e0f2f1;color:#0f766e}.sst.ok{background:#e6f4ea;color:#15803d}.sst.fim{background:#d7eedd;color:#14532d}
.sst.calc{background:#efe7fb;color:#6d28d9}.sst.lote{background:#eceff3;color:#475569}.sst.desc{background:#fff6d6;color:#92400e;border-color:#f2d27a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .sst{filter:brightness(.8) saturate(1.2)}}
:root[data-theme="dark"] .sst{filter:brightness(.8) saturate(1.2)}
.ord-sap{display:flex;flex-wrap:wrap;gap:4px;align-items:center;cursor:pointer;min-width:160px}
.ngrp>.tab .nl{display:flex;gap:6px;align-items:center}
#main tr.click{cursor:pointer}
/* 2.2 · cabeçalho em grupos com menu (sem rolagem) */
#nav.ngrupos{overflow:visible;flex-wrap:nowrap;gap:0}
.ngrp{position:relative;display:flex}
.ngrp>.tab{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1.05}
.ngrp.tem>.tab::after{content:'▾';font-size:10px;opacity:.6;position:absolute;right:4px;top:50%;transform:translateY(-50%)}
.ngrp.tem>.tab{padding-right:18px}
.ngrp .natual{display:block;font-size:10.5px;letter-spacing:.04em;text-transform:none;font-weight:500;color:var(--accent);margin-top:1px}
.nmenu{display:none;position:absolute;top:100%;left:0;z-index:80;min-width:220px;background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 28px rgba(0,0,0,.18);padding:6px}
.ngrp.tem:hover>.nmenu,.ngrp.tem:focus-within>.nmenu{display:flex;flex-direction:column}
.nitem{all:unset;display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:14px;color:var(--ink)}
.nitem:hover,.nitem:focus-visible{background:var(--surface-2,rgba(0,0,0,.05))}.nitem.on{color:var(--accent);font-weight:600}
.ngrp.on>.tab{color:var(--accent)}
@media(max-width:760px){#nav.ngrupos{overflow-x:auto}.ngrp .natual{display:none}}
</style>
"""
kit21=open(os.path.join(RAIZ,'fontes','kit','kit_v21.js'),encoding='utf-8').read()
kit21=kit21.rstrip('\n')+'\n'+open(os.path.join(RAIZ,'fontes','kit','kit_ds.js'),encoding='utf-8').read().strip('\n')   # Design System
# catálogo de sistemas único (fontes/kit/sistemas.js), igual nas 5 páginas
import re as _re
_sis=open(os.path.join(RAIZ,'fontes','kit','sistemas.js'),encoding='utf-8').read().strip()
_pad=_re.compile(r'const DEFAULT_SYSTEMS=\[.*?\];',_re.S)
if len(_pad.findall(s))!=1: raise SystemExit('ERRO: DEFAULT_SYSTEMS não achado exatamente 1 vez')
s=_pad.sub(lambda m:_sis,s)
# padrão visual comum (fontes/kit/kit_visual.css): último <style> do <head>, igual nas 5 páginas
_vis=open(os.path.join(RAIZ,'fontes','kit','kit_visual.css'),encoding='utf-8').read().strip()
_vis=_vis+'\n'+open(os.path.join(RAIZ,'fontes','kit','kit_ds.css'),encoding='utf-8').read().strip()   # Design System
if s.count('\n</head>\n')!=1: raise SystemExit('ERRO: </head> (linha própria) não achado exatamente 1 vez')
_bas=open(os.path.join(RAIZ,'fontes','kit','kit_bases.js'),encoding='utf-8').read().strip()
_demo=open(os.path.join(RAIZ,'fontes','kit','kit_demo.js'),encoding='utf-8').read()
_cenario=json.load(open(os.path.join(RAIZ,'fontes','kit','demo_cenario.json'),encoding='utf-8'))
_bas=_demo.replace('@@VAC_DEMO_CENARIO@@',json.dumps(_cenario,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))+'\n'+_bas   # bases em 00. Bases (antes do código da página)
s=s.replace('\n</head>\n','\n<style id="vac-visual">\n'+_vis+'\n</style>\n<script id="vac-bases">\n'+_bas+'\n</script>\n</head>\n')
sync=open(os.path.join(AQUI,'cad_sync.js'),encoding='utf-8').read()
R("S.cadastro = c && c.schema === 'vac-cadastros' ? { rev: c.rev, revAt: c.revAt, revBy: c.revBy } : null; }","S.cadastro = c && c.schema === 'vac-cadastros' ? { rev: c.rev, revAt: c.revAt, revBy: c.revBy } : null; S.cadDoc = S.cadastro ? c : null; S.cadDocAusente = false; if (S.cadDoc && typeof CadSync !== 'undefined') setTimeout(() => CadSync.talvez(), 0); }")
# 2.4.3 · arquivo do cadastro sumiu: mantém a última cópia (travas continuam; destravar deixaria editar o que a próxima sincronização apagaria) e avisa na faixa
R("if (!t) { S.cadastro = null; return null; }","if (!t) { S.cadastro = null; S.cadDocAusente = !!S.cadDoc; return null; }")
R("// cadastro base do Portal na mesma pasta: só a revisão, para a pílula do cabeçalho (o OEE ainda usa os próprios cadastros)","// cadastro base do Portal na mesma pasta: guarda o documento e aplica na base quando a revisão muda (CadSync, Produção 2.4)")
R("</script>\n</body>","</script>\n"+css+"<script>\n'use strict';\n"+svc+"\n"+tela+"\n"+sync+"\n</script>\n<script>\n"+kit21+"\n</script>\n</body>")
R('<th class="n">Diferença</th><th>Situação</th></tr></thead>','<th class="n">Diferença</th><th>Situação</th><th title="O que o MB51/COOIS (oficial) diz desta ordem: data principal, saldo, lote, tipo, KKBC no Waste">SAP</th></tr></thead>')
R("data-accrow=\"${o.id}\">✓ Aceitar apurado</button>` : ''}</td></tr>`; }).join('')}</tbody>","data-accrow=\"${o.id}\">✓ Aceitar apurado</button>` : ''}</td><td>${typeof ordSapCel === 'function' ? ordSapCel(o) : ''}</td></tr>`; }).join('')}</tbody>")
# 2.4.37 · OEE real (início e fim espelhados), 3 indicadores no dia e na Visão Geral, caixas e trocas por turno, Editar cards (fontes/producao/oee_build.py)
from oee_build import aplicar as aplicar_oee
# 2.4.36 · UX-02: guia por aba (componente vacGuia do kit; conteúdo em fontes/producao/guia.js)
R("async function boot() {\n", open(os.path.join(AQUI,'guia.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
# 2.4.35 · CSV do MES: catálogo e lote registrados antes da 1ª caixa pertencem a ela; caixa 0 não conta (fontes/producao/mes_build.py)
# 2.4.63 · 1ª linha do relatório diário com caixa > 0 = última caixa do relatório anterior: não conta de novo (mesmo arquivo)
from mes_build import aplicar as aplicar_mes
aplicar_mes(R)
# 2.4.34 · Fase 7 do briefing: PRD-05, PRD-06, UX-01, UX-04 (fontes/producao/fase7.js, fase7_build.py)
from fase7_build import aplicar as aplicar_fase7
aplicar_fase7(R)
aplicar_oee(R)
from vg_build import aplicar as aplicar_vg   # 2.4.38 · Visão Geral e Hora a hora (fontes/producao/vg_hh.js)
aplicar_vg(R)
from card_build import aplicar as aplicar_card   # 2.4.41 · cartão do turno, scrap por máquina, OEE real no Painel (fontes/producao/turno_card.js)
aplicar_card(R)
from plano_build import aplicar as aplicar_plano   # 2.4.42 · Plano do mês com fora de turno, ordenação das tabelas de ordens
aplicar_plano(R)
# 2.4.46 · layout novo do turno no Lançamento (mockup aprovado em 11/11/2026; fontes/producao/turno_layout.js)
R("async function boot() {\n", open(os.path.join(AQUI,'turno_layout.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
R("    h += `<div class=\"section grid g2\">${res.shifts.map(sr => shiftBlock(day, sr, res)).join('')}${OeeReal.cardsNP(day, res)}</div>`;",
  "    { const np = OeeReal.cardsNP(day, res); h += `<div class=\"section tl-list\">${res.shifts.map(sr => TurnoUI.bloco(day, sr, res)).join('')}${np ? `<div class=\"grid g2\">${np}</div>` : ''}</div>`; }")
# 2.4.47 · Lançamento: servidor, lotes do dia, turno não produtivo e produção fora do turno no layout novo (fontes/producao/lanc_layout.js)
R("async function boot() {\n", open(os.path.join(AQUI,'lanc_layout.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
R("    h += SrvUI.dayCard(day, res);\n    h += ForaTurnoUI.card(day, res);   /* 2.4.24 · TUR-02/03/04 */\n",
  "    h += LancUI.bloco(day, res);   /* 2.4.47 · layout novo (antes: SrvUI.dayCard + ForaTurnoUI.card) */\n")
R("  const main = $('#main');\n  const ts = tabState(App.route);", "  const main = $('#main'); main.dataset.rota = App.route;   /* 2.4.47 · estilo do layout novo só no Lançamento (lanc_layout.js) */\n  const ts = tabState(App.route);")
# 2.4.48 · recolher o Cabeçalho do dia (App.prefs.cabFold, por computador)
R("    h += `<section class=\"card\"><header><h3>Cabeçalho do dia</h3>",
  "    h += `<section class=\"card${App.prefs.cabFold ? ' cab-fold' : ''}\" id=\"cabDia\"><header><button type=\"button\" class=\"btn xs ghost cab-tg\" id=\"cabTg\" aria-expanded=\"${!App.prefs.cabFold}\" aria-controls=\"cabDia\" title=\"${App.prefs.cabFold ? 'Mostrar' : 'Recolher'} o cabeçalho do dia (vale neste computador)\">${App.prefs.cabFold ? '▸ Mostrar' : '▾ Recolher'}</button><h3>Cabeçalho do dia</h3>")
R("    { const mb = root.querySelector('#dayMetas'); if (mb) mb.onclick = () => metasModal();",
  "    { const cf = root.querySelector('#cabTg'); if (cf) cf.onclick = () => { App.prefs.cabFold = !App.prefs.cabFold; savePrefs(); render(); }; }\n    { const mb = root.querySelector('#dayMetas'); if (mb) mb.onclick = () => metasModal();")
# 2.4.49 · Visão Geral padrão organizada (docs/ux/UX_Wireframe_Visao_Geral_OEE_Vacutainer.md; fontes/producao/vg_layout.js)
R("async function boot() {\n", open(os.path.join(AQUI,'vg_layout.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
# 2.4.51 · unidade em todos os gráficos ("Valores em …") e eixo em % sem rótulos repetidos (fontes/producao/graf_build.py)
from graf_build import aplicar as aplicar_graf
aplicar_graf(R)
# 2.4.52 · Hora a hora com a produção fora do turno no turno que a recebe e "Dia (24 h)"; Ordens produzidas sem MB51 (fontes/producao/hh24.js)
R("async function boot() {\n", open(os.path.join(AQUI,'hh24.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
R("      for (const f of fs) {\n        const iv = f.iv;\n", "      const _fr = HHPs.fora(day, res, ps); h += _fr.antes;   /* 2.4.52: produção fora do turno que conta neste turno */\n      for (const f of fs) {\n        const iv = f.iv;\n")
R("</tr>`;\n      }\n    }\n    const r = res.r;\n", "</tr>`;\n      }\n      h += _fr.depois;\n    }\n    const r = res.r;\n")
R("    h += `<div class=\"tw\"><table class=\"hh\"><thead>", "    if (HHPs.id(day) === 'dia') h += HHPs.dia24(day, res); else {   /* 2.4.52: Dia (24 h) */\n    h += `<div class=\"tw\"><table class=\"hh\"><thead>")
R("    h += HHPs.npHtml(day, res);   /* 2.4.38 */\n", "    h += HHPs.npHtml(day, res);   /* 2.4.38 */\n    }\n")
R("    h += `<section class=\"card section\"><header><h3>Atendimento hora a hora</h3>", "    if (HHPs.id(day) !== 'dia') h += `<section class=\"card section\"><header><h3>Atendimento hora a hora</h3>")
# Ordens produzidas: sem MB51, os lotes do MES (não conciliados); com MB51, os lotes que ainda não estão nele
R("    const cs = ordPer(); if (!cs.length) return `<section class=\"card section\"><p>Nenhum MB51 importado em ${esc(ordPerTxt(cs))}.</p><button class=\"btn primary\" data-osub=\"mb51\">Importar MB51</button></section>`;",
  "    const cs = ordPer(); if (!cs.length) return `<section class=\"card section\"><p>Nenhum MB51 importado em ${esc(ordPerTxt(cs))}: abaixo, os lotes produzidos (MES) com a ordem do plano, ainda <b>não conciliados</b>.</p><button class=\"btn primary\" data-osub=\"mb51\">Importar MB51</button></section>` + OrdMes.html('Lotes produzidos · ' + ordPerTxt(cs), false);   /* 2.4.52 */")
R("<p class=\"small muted\">Mostrando 600; use os filtros.</p>' : ''}</section>`;\n  },\n  vConc(c) {",
  "<p class=\"small muted\">Mostrando 600; use os filtros.</p>' : ''}</section>` + OrdMes.html('Lotes do MES ainda não conciliados', true);   /* 2.4.52 */\n  },\n  vConc(c) {")
# 2.4.54 · Hora a hora: o aviso "O servidor tem dados deste dia… O lançamento confere com o servidor." sai; fica só quando há sugestão para revisar
R("""    return `<div class="banner info" style="margin:0 0 10px"><p>O servidor tem dados deste dia (o valor "srv" ao lado de cada hora). ${n ? `${n} sugestão(ões) para conferir.` : 'O lançamento confere com o servidor.'} ${n ? '<button type="button" class="btn xs primary" id="srvRev">Revisar sugestões</button>' : ''}</p></div>`;""",
  """    if (!n) return '';
    return `<div class="banner info" style="margin:0 0 10px"><p>${n} sugestão(ões) do servidor para conferir. <button type="button" class="btn xs primary" id="srvRev">Revisar sugestões</button></p></div>`;""")
# 2.4.56 · Lançamento no layout novo (proposta visual do usuário; fontes/producao/lanc_v2.js)
R("async function boot() {\n", open(os.path.join(AQUI,'lanc_v2.js'),encoding='utf-8').read() + "\nasync function boot() {\n")
R("    SrvUI.bindDay(root, day); ForaTurnoUI.mount(root, day); GelTurno.mount(root, day, Engine.computeDay(db(), day)); TurnoCard.ligar(root, day);",
  "    SrvUI.bindDay(root, day); ForaTurnoUI.mount(root, day); GelTurno.mount(root, day, Engine.computeDay(db(), day)); TurnoCard.ligar(root, day); LancV2.montar(root, day);")
# 2.4.59 · todos os gráficos hora a hora com a lógica de Apontamento › Hora a hora (fontes/producao/hh_comum.js + hh_comum_build.py)
from hh_comum_build import aplicar as aplicar_hh_comum
aplicar_hh_comum(R)
# 2.4.64 · fechar turno e dia com turno desabilitado no dia; botões acesos quando o turno fecha ou o hora a hora fica completo (fontes/producao/fecha_build.py)
from fecha_build import aplicar as aplicar_fecha
aplicar_fecha(R)
# 2.4.66 · e-mail do turno e do dia (medidor do OEE reportado, acumulado do dia, itens escolhidos; fontes/producao/email_dia.js)
from email_build import aplicar as aplicar_email
aplicar_email(R)
open(out,'w',encoding='utf-8',newline='\n').write(s);print('ok')   # newline: no Windows o padrão gravaria CRLF
