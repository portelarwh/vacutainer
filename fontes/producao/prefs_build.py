# Produção 2.4.72 · Fase 5 (13/11/2026): as preferências de layout da Produção vão no arquivo da pessoa (vacPrefs do kit).
# Vão: abas, Editar cards, blocos recolhidos (cabeçalho, Visão Geral, Lançamento, Hora a hora), grupos da Visão Geral, Mais indicadores,
# Meu painel (panel/panelLayout), colunas de meta, OEE real no Painel, imagem/SQ do relatório e itens do e-mail.
# Ficam no computador: tema (é o vac.theme comum), unidade (qtyDisplay) e TV (tvView, tvTheme).


def aplicar(R):
    R("const savePrefs = U.debounce(() => { IDB.set('prefs', U.clone(App.prefs)).catch(() => { }); }, 300);",
      """const savePrefs = U.debounce(() => { IDB.set('prefs', U.clone(App.prefs)).catch(() => { }); if (typeof vacPrefs !== 'undefined') vacPrefs.mudou(); }, 300);
/* 2.4.72 · Fase 5: preferências de layout no arquivo da pessoa (vacPrefs do kit) */
const PREFS_PESSOA = ['tabs', 'kcOff', 'cabFold', 'vgFold', 'lcFold', 'hhFold', 'vgGrupo', 'moreKpi', 'panel', 'panelLayout', 'showMetaCols', 'pnOeeReal', 'rpImg', 'rpSQ', 'mailLay'];
{ const reg = () => { if (typeof vacPrefs !== 'undefined') vacPrefs.registrar('oee', {   /* o kit vem num <script> depois deste: registra quando a página termina de carregar */
  ler: () => { const o = {}; for (const k of PREFS_PESSOA) if (App.prefs[k] !== undefined) o[k] = App.prefs[k]; return o; },
  aplicar: o => { for (const k of PREFS_PESSOA) { if (o && o[k] !== undefined) App.prefs[k] = U.clone(o[k]); else delete App.prefs[k]; } IDB.set('prefs', U.clone(App.prefs)).catch(() => { }); }
}); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reg); else reg(); }""")
