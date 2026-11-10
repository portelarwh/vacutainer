/* ===== Produção 2.4.31 · Fase 5 · 5b do briefing (PRD-01, D9): Painel e Visão Geral numa aba só, Visão Geral =====
   - A montagem atual da Visão Geral é a visão "Visão Geral · padrão" (sempre existe, só leitura).
   - O seletor de visão traz também Meu painel, as visões compartilhadas e os modelos (ex.: Diretoria mensal): escolhida uma delas,
     a tela é a do Painel (Personalizar, Imprimir, Apresentar), sem outra aba.
   - O endereço antigo do Painel (#aba=panel, go('panel'), aba inicial "Produção › Painel") continua valendo: abre a Visão Geral
     na visão do Painel (Meu painel, se estava na padrão).
   - Período: Hoje e Ontem entram nos períodos rápidos (com Semana, Mês e as datas livres), aqui e no Painel.
   Entra no script principal pelo build.py (antes do boot). */
const VisaoGeral = {
  PADRAO: 'padrao',
  opcoes() { return [[this.PADRAO, 'Visão Geral · padrão']].concat(Panel.viewOptions()); },
  naPadrao() { const st = Panel.st(); return !st.view || st.view === this.PADRAO; },
  barra() {
    const st = Panel.st();
    return `<div class="filters pn-bar vg-bar"><div class="row">
      <label class="f"><span>Visão ${ib('visaoGeral')}</span><select id="vgView">${this.opcoes().map(([k, l]) => `<option value="${esc(k)}" ${(st.view || this.PADRAO) === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <span class="spacer"></span>
      <button class="btn sm" id="vgPers" title="Abre Meu painel para montar os indicadores e blocos">${I.edit} Personalizar</button><button class="btn sm" id="vgPrint">${I.print} Imprimir</button><button class="btn sm primary" id="vgTv">${I.tv} Apresentar</button></div></div>`;
  },
  wire(root) {
    const s = root.querySelector('#vgView'); if (s) s.onchange = () => { Panel.st().view = s.value; savePrefs(); render(); };
    const p = root.querySelector('#vgPers'); if (p) p.onclick = () => { Panel.st().view = 'mine'; savePrefs(); render(); setTimeout(() => { const b = document.querySelector('#pnEdit'); if (b) b.click(); }, 120); };
    const r = root.querySelector('#vgPrint'); if (r) r.onclick = () => window.print();
    const t = root.querySelector('#vgTv'); if (t) t.onclick = () => TV.open();
  }
};
(() => {
  const O = App.views.overview, P = App.views.panel;
  /* Painel: o seletor de visão dele também volta para a padrão */
  App.views.overview = {
    render() { if (!VisaoGeral.naPadrao()) { const st = Panel.st(); if (!Panel.viewOptions().some(o => o[0] === st.view)) st.view = VisaoGeral.PADRAO; } return VisaoGeral.naPadrao() ? VisaoGeral.barra() + O.render() : P.render(); },
    mount(root) {
      if (VisaoGeral.naPadrao()) { if (O.mount) O.mount(root); VisaoGeral.wire(root); return; }
      if (P.mount) P.mount(root);
      const sel = root.querySelector('#pnView');   // acrescenta a padrão no seletor do Painel
      if (sel && !sel.querySelector(`option[value="${VisaoGeral.PADRAO}"]`)) { const o = document.createElement('option'); o.value = VisaoGeral.PADRAO; o.textContent = 'Visão Geral · padrão'; sel.insertBefore(o, sel.firstChild); }
    }
  };
  App.views.panel = { render() { return App.views.overview.render(); }, mount(root) { return App.views.overview.mount(root); } };
})();
HELP.visaoGeral = ['Visão Geral', [['O que é?', 'A tela de resumo da Produção. "Visão Geral · padrão" é a montagem fixa; as outras visões são as do antigo Painel (Meu painel, visões compartilhadas e modelos como Diretoria mensal), com indicadores e blocos montados por você.'], ['Como personalizo?', '"Personalizar" abre Meu painel em edição: escolha os indicadores do topo e os blocos, a ordem e a largura. Para que todos vejam, salve como visão compartilhada.'], ['E o Painel?', 'Virou parte da Visão Geral (briefing PRD-01). Links e páginas iniciais antigas do Painel abrem aqui.']]];
