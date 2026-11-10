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
R("const APP_VERSION = '2.0.1';","const APP_VERSION = '2.4.22';")
# 2.4.21 · ARQ-09 (briefing 09/11/2026, opção a): sem "Modo exemplo" próprio nas Configurações; para apresentar, a Demonstração integrada
#          (botão do topo). Store.enterExample continua: é o que a Demonstração e os testes usam por dentro.
R("['auditoria', 'Auditoria'], ['demo', 'Modo exemplo'], ['ajuda', 'Ajuda e aceite']","['auditoria', 'Auditoria'], ['ajuda', 'Ajuda e aceite']")
R("<p><b>Modo exemplo.</b> Você está numa cópia com dados fictícios. Nada é gravado na base da pasta; ao sair, tudo volta como estava.</p><button class=\"btn sm primary\" data-act=\"exitex\">Sair do modo exemplo</button>","<p><b>Demonstração.</b> Você está numa cópia com dados fictícios. Nada é gravado na base da pasta; ao sair, tudo volta como estava.</p><button class=\"btn sm primary\" data-act=\"exitex\">Sair da demonstração</button>")
R("'exemplo': ['rule', 'Modo exemplo']","'exemplo': ['rule', 'Demonstração']")
R("toast('Você saiu do modo exemplo.')","toast('Você saiu da demonstração.')")
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
  "    // lotes do servidor (últimos 150 dias): retrabalho, situação e observação, para Perdas e Gel\n")
R("planoMes, ordens, lotes, pendencias, kpis };","planoMes, ordens, porOrdem, porOrdemCobertura, lotes, pendencias, kpis };")
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
# catálogo de sistemas único (fontes/kit/sistemas.js), igual nas 5 páginas
import re as _re
_sis=open(os.path.join(RAIZ,'fontes','kit','sistemas.js'),encoding='utf-8').read().strip()
_pad=_re.compile(r'const DEFAULT_SYSTEMS=\[.*?\];',_re.S)
if len(_pad.findall(s))!=1: raise SystemExit('ERRO: DEFAULT_SYSTEMS não achado exatamente 1 vez')
s=_pad.sub(lambda m:_sis,s)
# padrão visual comum (fontes/kit/kit_visual.css): último <style> do <head>, igual nas 5 páginas
_vis=open(os.path.join(RAIZ,'fontes','kit','kit_visual.css'),encoding='utf-8').read().strip()
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
open(out,'w',encoding='utf-8',newline='\n').write(s);print('ok')   # newline: no Windows o padrão gravaria CRLF
