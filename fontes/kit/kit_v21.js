/* ----- vac-cabecalho v2.1 · 05/11/2026 (igual em todas as páginas; não editar só numa) -----
   1) ← Voltar ao lado do título: volta para a tela anterior (aba da página ou página anterior), igual ao botão voltar do navegador.
      As abas da página entram no histórico do navegador: clique numa aba = nova entrada; voltar = clica de novo na aba anterior.
      A página pode definir vacNavAtual() → {attr,val,sub} quando a aba atual não é o botão marcado (ex.: Produção).
   2) Ao voltar para a página (troca de aba/janela, ← Voltar, página restaurada), chama vacAoVoltar() se a página definir,
      para reler o que outras páginas gravaram sem precisar de F5. */
(() => {
  if (window.__vacV21) return; window.__vacV21 = 1;
  const SEL = '#nav [data-route],#nav [data-t],#nav [data-tab],[role=tab][data-tab]';
  const ATR = ['data-route', 'data-t', 'data-tab'];
  const doEl = el => { for (const a of ATR) if (el.hasAttribute(a)) return { attr: a, val: el.getAttribute(a), sub: el.getAttribute('data-osub2') || null }; return null; };
  const atual = el => {
    if (typeof vacNavAtual === 'function') { try { const v = vacNavAtual(); if (v) return v; } catch (e) { } }
    if (el) return doEl(el);
    const on = document.querySelector('#nav .on[data-t],#nav button.on,#nav [aria-current=page],#nav [aria-selected=true],[role=tab][data-tab][aria-selected=true]');
    return on ? doEl(on) : null;
  };
  /* páginas que limpam o estado do histórico (replaceState(null…)) não apagam a posição gravada */
  try { const rs = history.replaceState.bind(history); history.replaceState = function (st, t, u) { if (st == null && history.state && history.state.vacNav) st = { vacNav: history.state.vacNav }; return rs(st, t, u); }; } catch (e) { }
  let restaurando = false;
  document.addEventListener('click', e => {
    if (restaurando) return; const el = e.target.closest && e.target.closest(SEL); if (!el) return;
    const antes = atual(null);
    setTimeout(() => {
      const depois = atual(el); if (!depois || JSON.stringify(depois) === JSON.stringify(antes)) return;
      try { if (antes && !(history.state && history.state.vacNav)) history.replaceState({ ...(history.state || {}), vacNav: antes }, ''); history.pushState({ vacNav: depois }, ''); } catch (x) { }
      vacVoltarRender();
    }, 0);
  }, true);
  window.addEventListener('popstate', e => {
    const v = e.state && e.state.vacNav; vacVoltarRender(); if (!v) return;
    const cs = [...document.querySelectorAll(SEL)].filter(x => x.getAttribute(v.attr) === v.val); if (!cs.length) return;
    const el = cs.find(x => (x.getAttribute('data-osub2') || null) === (v.sub || null)) || cs[0];
    restaurando = true; try { el.click(); } finally { setTimeout(() => { restaurando = false; }, 0); }
  });
  function vacVoltarRender() {
    const t = document.getElementById('vacTitulo'); if (!t) return; let b = document.getElementById('vacVoltar');
    if (!b) {
      if (!document.getElementById('vacVoltarCss')) { const st = document.createElement('style'); st.id = 'vacVoltarCss'; st.textContent = '.vvoltar{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-right:10px;border:1px solid var(--line,#d0d7e2);border-radius:8px;background:transparent;color:inherit;font-size:17px;line-height:1;cursor:pointer;vertical-align:middle;flex:none}.vvoltar:hover{background:var(--hover,rgba(127,127,127,.12))}.vvoltar[hidden]{display:none!important}'; document.head.appendChild(st); }
      t.insertAdjacentHTML('beforebegin', '<button type="button" id="vacVoltar" class="vvoltar" title="Voltar para a tela anterior (igual ao voltar do navegador · Alt+←)" aria-label="Voltar">←</button>');
      b = document.getElementById('vacVoltar'); b.onclick = () => history.back();
    }
    b.hidden = history.length < 2;
  }
  window.vacVoltarRender = vacVoltarRender;
  let ult = 0;
  const voltou = () => { if (document.hidden) return; const n = Date.now(); if (n - ult < 1500) return; ult = n; vacVoltarRender(); try { if (typeof vacAoVoltar === 'function') vacAoVoltar(); } catch (e) { console.warn('vacAoVoltar', e); } };
  document.addEventListener('visibilitychange', voltou); window.addEventListener('focus', voltou); window.addEventListener('pageshow', e => { vacVoltarRender(); if (e.persisted) voltou(); });
  setInterval(() => { if (!document.getElementById('vacVoltar')) vacVoltarRender(); }, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vacVoltarRender); else setTimeout(vacVoltarRender, 0);
})();
/* kit v2.1 · câmbio do cadastro geral (Portal › Câmbio): cotação vigente numa data, em R$ por 1 unidade da moeda. null = sem cadastro. */
function vacCambio(data, moeda = 'USD') {
  const c = typeof vacCad === 'function' ? vacCad() : null, m = c && (c.cambio || []).find(x => String(x.codigo).toUpperCase() === moeda && x.ativo !== false); if (!m) return null;
  const d = String(data || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const v = (m.vigencias || []).filter(x => x.de <= d && (!x.ate || x.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0];
  return v && +v.cotacao > 0 ? { cotacao: +v.cotacao, de: v.de, ate: v.ate || null } : null;
}
/* kit v2.1 · leituras do cadastro geral (cópia vac.cadastros), iguais em todas as páginas */
const vacVig = (vs, data) => { const d = String(data || '').slice(0, 10) || new Date().toISOString().slice(0, 10); return (vs || []).filter(v => v.de <= d && (!v.ate || v.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0] || null; };
function vacParam(k) { const c = typeof vacCad === 'function' ? vacCad() : null; return c && c.parametros ? c.parametros[k] ?? null : null; }
/* turnos vigentes numa data: [{codigo, nome, inicio, fim, dias, ativo, pausas}] (fim em 24 h+) */
function vacTurnosEm(data) { const c = typeof vacCad === 'function' ? vacCad() : null; return (c && c.turnos || []).filter(t => t.ativo !== false).map(t => { const v = vacVig(t.vigencias, data); return v ? { codigo: t.codigo, nome: t.nome, ...v } : null; }).filter(Boolean); }
/* preço vigente de um material: {preco, moeda, porUnidade, de} */
function vacPrecoEm(material, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.precos || []).find(p => String(p.material) === String(material)); const v = it ? vacVig(it.vigencias, data) : null; return v && +v.preco > 0 ? { preco: +v.preco, moeda: v.moeda || 'USD', porUnidade: v.porUnidade || 'kg', de: v.de } : null; }
/* meta da área vigente: {valor, alerta, unidade, sentido, periodo, de} */
function vacMetaArea(codigo, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.metasArea || []).find(m => m.codigo === codigo && m.ativo !== false); const v = it ? vacVig(it.vigencias, data) : null; return v && v.valor != null ? { valor: +v.valor, alerta: v.alerta != null ? +v.alerta : null, unidade: it.unidade, sentido: it.sentido, periodo: it.periodo, de: v.de } : null; }
/* link para uma tela do Portal (Administração) */
function vacPortalHref(h) { const port = (typeof systems === 'function' ? systems() : []).find(s => s.id === 'portal') || { id: 'portal', html: 'Portal.html' }; return typeof sysHref === 'function' ? sysHref(port, h) : 'Portal.html#' + h; }
/* kit v2.1 · vac-visual v1 (06/11/2026): abas numa linha só. Quando não cabem, a faixa rola na horizontal, com sombra e seta ‹ › na borda
   que tem mais abas, e a aba ativa fica à vista. A Produção (abas agrupadas com menus, nav.vtabs.nav) não rola. CSS em fontes/kit/kit_visual.css. */
(function () {
  const marcar = () => {
    const nav = document.querySelector('nav.vtabs:not(.nav)'); if (!nav) return; const t = nav.querySelector('.tabs'); if (!t) return;
    const w = nav.querySelector('.wrap');
    if (w && !w.querySelector('.vrola')) {
      w.insertAdjacentHTML('beforeend', '<button type="button" class="vrola e" aria-label="Ver abas anteriores" tabindex="-1">‹</button><button type="button" class="vrola d" aria-label="Ver mais abas" tabindex="-1">›</button>');
      w.querySelector('.vrola.e').onclick = () => { t.scrollLeft -= t.clientWidth * .7; };
      w.querySelector('.vrola.d').onclick = () => { t.scrollLeft += t.clientWidth * .7; };
      t.addEventListener('scroll', () => requestAnimationFrame(estado), { passive: true });
    }
    estado();
  };
  const estado = () => {
    const nav = document.querySelector('nav.vtabs:not(.nav)'); const t = nav && nav.querySelector('.tabs'); if (!t) return;
    const esq = t.scrollLeft > 2, dir = t.scrollLeft + t.clientWidth < t.scrollWidth - 2;
    nav.toggleAttribute('data-mais-esq', esq); nav.toggleAttribute('data-mais-dir', dir);
  };
  const ativaVisivel = () => {
    const t = document.querySelector('nav.vtabs:not(.nav) .tabs'); if (!t || t.scrollWidth <= t.clientWidth) return estado();
    const on = t.querySelector('.on, [aria-selected="true"]'); if (!on) return estado();
    const a = on.offsetLeft - t.offsetLeft, b = a + on.offsetWidth;
    if (a < t.scrollLeft + 24) t.scrollLeft = Math.max(0, a - 40); else if (b > t.scrollLeft + t.clientWidth - 24) t.scrollLeft = b - t.clientWidth + 40;
    estado();
  };
  window.vacAbasRolagem = () => { marcar(); ativaVisivel(); };
  const ini = () => { marcar(); ativaVisivel(); const t = document.querySelector('nav.vtabs:not(.nav) .tabs'); if (t) { new MutationObserver(() => requestAnimationFrame(() => { marcar(); ativaVisivel(); })).observe(t, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-selected'] }); } };
  window.addEventListener('resize', () => requestAnimationFrame(ativaVisivel));   // ao redimensionar, a aba ativa continua à vista
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ini); else setTimeout(ini, 0);
})();
/* kit v2.1 · vac-visual v1: menu "Mais" (details.vmais) sempre dentro da tela. Abre alinhado à direita do botão; se não couber, alinha à esquerda */
document.addEventListener('toggle', e => {
  const d = e.target; if (!d || !d.classList || !d.classList.contains('vmais') || !d.open) return;
  const l = d.querySelector('.vmais-l'); if (!l) return; l.style.left = ''; l.style.right = '';
  const r = l.getBoundingClientRect(); if (r.left < 8) { l.style.right = 'auto'; l.style.left = '0'; }
  const r2 = l.getBoundingClientRect(); if (r2.right > innerWidth - 8) l.style.left = (innerWidth - 8 - r2.width - d.getBoundingClientRect().left) + 'px';
}, true);
/* kit v2.1 · impressão e exportação sempre no tema claro (07/11/2026). vacTemaClaro(true) põe o tema claro e guarda o anterior;
   vacTemaClaro(false) devolve. Ctrl+P e window.print() passam por aqui (beforeprint/afterprint). Páginas que vigiam o tema
   (Gel) não desfazem enquanto data-vac-claro estiver marcado. */
function vacTemaClaro(on) {
  const r = document.documentElement;
  if (on) { if (r.dataset.vacClaro != null) return; r.dataset.vacClaro = r.hasAttribute('data-theme') ? r.getAttribute('data-theme') : '-'; r.setAttribute('data-theme', 'light'); }
  else { const t = r.dataset.vacClaro; if (t == null) return; delete r.dataset.vacClaro; if (t === '-') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t); }
}
window.addEventListener('beforeprint', () => vacTemaClaro(true));
window.addEventListener('afterprint', () => vacTemaClaro(false));
