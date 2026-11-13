/* ----- vac-cabecalho v2.1 · 05/11/2026 (igual em todas as páginas; não editar só numa) -----
   1) ← Voltar ao lado do título: volta para a tela anterior (aba da página ou página anterior), igual ao botão voltar do navegador.
      As abas da página entram no histórico do navegador: clique numa aba = nova entrada; voltar = clica de novo na aba anterior.
      A página pode definir vacNavAtual() → {attr,val,sub} quando a aba atual não é o botão marcado (ex.: Produção).
   2) Ao voltar para a página (troca de aba/janela, ← Voltar, página restaurada), chama vacAoVoltar() se a página definir,
      para reler o que outras páginas gravaram sem precisar de F5. */
/* kit v2.1 · 10/11/2026: a lista de páginas guardada neste navegador (vac.sistemas, gravada pelo Portal) pode ter o nome antigo
   ("Iniciativas", antes da 1.1.0) ou a marca "futuro" de quando Equipamentos e Iniciativas ainda não existiam: aí o item some da barra
   ou aparece com o nome velho. Corrige uma vez e redesenha a barra. Ocultar em Portal › Módulos e a permissão do perfil continuam valendo. */
(() => {
  try {
    const L = JSON.parse(localStorage.getItem('vac.sistemas') || 'null'); if (!Array.isArray(L)) return;
    let mudou = false;
    for (const x of L) {
      if (!x || typeof x !== 'object') continue;
      if (x.id === 'inic' && (!x.nome || x.nome === 'Iniciativas')) { x.nome = 'Iniciativas / Ações'; mudou = true; }
      if ((x.id === 'inic' || x.id === 'equip') && x.futuro) { x.futuro = false; mudou = true; }
    }
    if (mudou) { localStorage.setItem('vac.sistemas', JSON.stringify(L)); setTimeout(() => { try { if (typeof renderSysNav === 'function') renderSysNav(); } catch (e) { } }, 0); }
  } catch (e) { }
})();
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
/* kit v2.1 · E2 (08/11/2026): "hoje" no dia local do computador (antes, sem data, valia o dia em UTC: às 22h de Brasília já era amanhã).
   Os leitores abaixo usam a data do fato quando recebem uma; vacHoje() é só o padrão quando não recebem. */
function vacHoje() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function vacCambio(data, moeda = 'USD') {
  const c = typeof vacCad === 'function' ? vacCad() : null, m = c && (c.cambio || []).find(x => String(x.codigo).toUpperCase() === moeda && x.ativo !== false); if (!m) return null;
  const d = String(data || '').slice(0, 10) || vacHoje();
  const v = (m.vigencias || []).filter(x => x.de <= d && (!x.ate || x.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0];
  return v && +v.cotacao > 0 ? { cotacao: +v.cotacao, de: v.de, ate: v.ate || null } : null;
}
/* kit v2.1 · leituras do cadastro geral (cópia vac.cadastros), iguais em todas as páginas */
const vacVig = (vs, data) => { const d = String(data || '').slice(0, 10) || vacHoje(); return (vs || []).filter(v => v.de <= d && (!v.ate || v.ate >= d)).sort((a, b) => a.de < b.de ? 1 : -1)[0] || null; };
function vacParam(k) { const c = typeof vacCad === 'function' ? vacCad() : null; return c && c.parametros ? c.parametros[k] ?? null : null; }
/* turnos vigentes numa data: [{codigo, nome, inicio, fim, dias, ativo, pausas}] (fim em 24 h+) */
function vacTurnosEm(data) { const c = typeof vacCad === 'function' ? vacCad() : null; return (c && c.turnos || []).filter(t => t.ativo !== false).map(t => { const v = vacVig(t.vigencias, data); return v ? { codigo: t.codigo, nome: t.nome, ...v } : null; }).filter(Boolean); }
/* preço vigente de um material: {preco, moeda, porUnidade, de} */
function vacPrecoEm(material, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.precos || []).find(p => String(p.material) === String(material)); const v = it ? vacVig(it.vigencias, data) : null; return v && +v.preco > 0 ? { preco: +v.preco, moeda: v.moeda || 'USD', porUnidade: v.porUnidade || 'kg', de: v.de } : null; }
/* meta da área vigente: {valor, alerta, unidade, sentido, periodo, de} */
function vacMetaArea(codigo, data) { const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.metasArea || []).find(m => m.codigo === codigo && m.ativo !== false); const v = it ? vacVig(it.vigencias, data) : null; return v && v.valor != null ? { valor: +v.valor, alerta: v.alerta != null ? +v.alerta : null, unidade: it.unidade, sentido: it.sentido, periodo: it.periodo, de: v.de } : null; }
/* kit v2.1 · E2 (08/11/2026): meta da área de um mês (AAAA-MM), pela vigência de cada dia (regra 3). Duas vigências no mesmo mês =
   média ponderada pelos dias de cada uma (só os dias cobertos por vigência). null se nenhum dia do mês tem vigência.
   Volta {valor, ponderada, partes:[{de, valor, dias}], diasCobertos, diasMes, unidade, sentido, periodo}. */
function vacMetaAreaMes(codigo, per) {
  const c = typeof vacCad === 'function' ? vacCad() : null; const it = c && (c.metasArea || []).find(m => m.codigo === codigo && m.ativo !== false);
  if (!it || !/^\d{4}-\d{2}$/.test(String(per || ''))) return null;
  const [y, mo] = String(per).split('-').map(Number), n = new Date(y, mo, 0).getDate(), partes = new Map(); let soma = 0, dias = 0;
  for (let d = 1; d <= n; d++) {
    const v = vacVig(it.vigencias, per + '-' + String(d).padStart(2, '0')); if (!v || v.valor == null || v.valor === '' || !isFinite(+v.valor)) continue;
    soma += +v.valor; dias++; let p = partes.get(v.de); if (!p) partes.set(v.de, p = { de: v.de, valor: +v.valor, dias: 0 }); p.dias++;
  }
  if (!dias) return null; const P = [...partes.values()];
  return { valor: soma / dias, ponderada: P.length > 1, partes: P, diasCobertos: dias, diasMes: n, unidade: it.unidade, sentido: it.sentido, periodo: it.periodo };
}
/* link para uma tela do Portal (Administração) */
function vacPortalHref(h) { const port = (typeof systems === 'function' ? systems() : []).find(s => s.id === 'portal') || { id: 'portal', html: 'Portal.html' }; return typeof sysHref === 'function' ? sysHref(port, h) : 'Portal.html#' + h; }
/* Fase 3 do briefing (IMP-06): Portal › Importação é o lugar único das importações; as abas "Importar" das páginas levam para a subseção da página */
function vacImportacaoHref(sec) { return vacPortalHref('importacao' + (sec ? '/' + sec : '')); }
function vacIrImportacao(sec) { const h = vacImportacaoHref(sec); if (typeof vacDemo !== 'undefined' && vacDemo.ativo && vacDemo.ir) vacDemo.ir(h); else location.href = h; }
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
/* kit v2.1 · situação da página (07/11/2026, docs/paginas-construcao.md): 'construcao' | 'atualizacao' | null (estável).
   Vale, nesta ordem: Portal › Configuração do Portal › Módulos (vac.sistemas[].estado) > PAGE.estado do HTML > DEFAULT_SYSTEMS.
   Mostra um selo na barra do sistema (ponto colorido; o texto aparece ao passar o mouse), uma pílula ao lado da versão, uma faixa abaixo das abas da página atual e o selo no Ctrl K. */
const VAC_ESTADO = { construcao: { rot: 'em construção', cls: 'none' }, atualizacao: { rot: 'em atualização', cls: 'info' } };
function vacEstadoDe(id) {
  const L = typeof systems === 'function' ? systems() : [], s = L.find(x => x.id === id) || {};
  const pg = typeof PAGE !== 'undefined' && PAGE && PAGE.id === id ? PAGE : {};
  const d = (typeof DEFAULT_SYSTEMS !== 'undefined' ? DEFAULT_SYSTEMS : []).find(x => x.id === id) || {};
  const e = s.estado !== undefined ? s.estado : pg.estado !== undefined ? pg.estado : d.estado;
  return VAC_ESTADO[e] ? { estado: e, ...VAC_ESTADO[e], nota: s.estadoNota || pg.estadoNota || d.estadoNota || '' } : null;
}
(function () {
  const esc2 = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arq = h => String(h || '').split('#')[0].split('/').pop();
  const sisDoLink = a => { const h = a.getAttribute('href') || ''; const L = typeof systems === 'function' ? systems() : [];
    if (typeof PAGE !== 'undefined' && PAGE.id === 'portal' && h === '#geral') return L.find(s => s.id === 'portal');
    return L.find(s => s.html && arq(s.html) === arq(h) && arq(h)); };
  const selos = () => {
    document.querySelectorAll('#sysNav a, #sysOutros .vmenu-l a').forEach(a => {
      const s = sisDoLink(a), e = s ? vacEstadoDe(s.id) : null, v = a.querySelector('.vest');
      if (!e) { if (v) v.remove(); return; }
      if (v && v.dataset.e === e.estado) return; if (v) v.remove();
      a.insertAdjacentHTML('beforeend', `<span class="vest" data-e="${e.estado}" role="img" aria-label="${esc2(e.rot)}" title="${esc2(e.rot + (e.nota ? ' · ' + e.nota : ''))}"></span>`);
    });
  };
  const oculta = id => { try { const d = localStorage.getItem('vac.estadoOculto.' + id); return d && Date.now() - new Date(d).getTime() < 7 * 864e5; } catch (e) { return false; } };
  const pagina = () => {
    if (typeof PAGE === 'undefined' || !PAGE) return; const e = vacEstadoDe(PAGE.id);
    const ver = document.getElementById('appVer'); let p = document.getElementById('vacEstPill');
    if (!e) { if (p) p.remove(); } else if (ver) {
      if (!p) { ver.insertAdjacentHTML('afterend', '<span class="pill" id="vacEstPill"></span>'); p = document.getElementById('vacEstPill'); }
      p.className = 'pill ' + e.cls; p.textContent = e.rot; p.title = e.nota || '';
    }
    let f = document.getElementById('vacEstFaixa'); const nav = document.querySelector('nav.vtabs');
    if (!e || (e.estado === 'atualizacao' && oculta(PAGE.id))) { if (f) f.remove(); return; }
    const ver2 = typeof vacPortalHref === 'function' ? vacPortalHref('versoes') : 'Portal.html#versoes';
    const html = e.estado === 'construcao'
      ? `<b>Página em construção.</b> Ainda não grava dados; mostra o que vai ter.${e.nota ? ' ' + esc2(e.nota) : ''}`
      : `<b>Página em atualização.</b> Ela funciona normalmente; algumas telas ainda vão mudar.${e.nota ? ' ' + esc2(e.nota) : ''} <a href="${esc2(ver2)}">Ver o que muda ↗</a><button type="button" class="vestx" title="Esconder por 7 dias" aria-label="Esconder aviso">✕</button>`;
    if (!f) { const box = document.createElement('div'); box.id = 'vacEstFaixa'; (nav || document.querySelector('.vpage') || document.body.firstElementChild).insertAdjacentElement('afterend', box); f = box; }
    if (f.dataset.e !== e.estado || f.dataset.n !== e.nota) { f.dataset.e = e.estado; f.dataset.n = e.nota; f.className = 'vestfaixa ' + e.estado; f.innerHTML = `<div class="wrap">${html}</div>`;
      const x = f.querySelector('.vestx'); if (x) x.onclick = () => { try { localStorage.setItem('vac.estadoOculto.' + PAGE.id, new Date().toISOString()); } catch (er) { } f.remove(); }; }
  };
  const busca = () => {
    if (typeof Busca === 'undefined' || !Busca || Busca._vacEst) return; Busca._vacEst = 1; const f0 = Busca.itens;
    Busca.itens = function () { const R = f0.apply(this, arguments) || []; for (const x of R) { if (x.tipo !== 'Ir para' || !x.href) continue;
      const s = (typeof systems === 'function' ? systems() : []).find(s => s.html && arq(s.html) === arq(x.href) && !String(x.href).includes('#'));
      const e = s && vacEstadoDe(s.id); if (e && !String(x.sub || '').includes(e.rot)) x.sub = (x.sub ? x.sub + ' · ' : '') + e.rot; } return R; };
  };
  function vacEstadoRender() { try { selos(); pagina(); busca(); } catch (e) { console.warn('vacEstadoRender', e); } }
  window.vacEstadoRender = vacEstadoRender;
  const ini = () => {
    vacEstadoRender();
    for (const id of ['sysNav', 'sysOutros']) { const el = document.getElementById(id); if (el) new MutationObserver(() => requestAnimationFrame(selos)).observe(el, { childList: true }); }
  };
  window.addEventListener('storage', e => { if (e.key === 'vac.sistemas' || (e.key || '').startsWith('vac.estadoOculto')) vacEstadoRender(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ini, 0)); else setTimeout(ini, 0);
})();
/* kit v2.1 · texto seguro para CSV (07/11/2026): texto que começa com = + - @ (ou tab/retorno) vira fórmula ao abrir o CSV no Excel.
   Recebe um prefixo ' (o Excel mostra o texto como está). Número escrito como texto (-1.234 · -12,5 · -3%) não é mexido, e
   valores number continuam número. Usado por Waste, Gel e Produção (cada página mantém o próprio formato de número e aspas). */
function vacCsvTexto(v) { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) && !/^[+-]?[\d.,\s]+%?$/.test(s) ? "'" + s : s; }
/* kit v2.1 · E3 (08/11/2026): número de texto, estrito (o texto inteiro precisa ser número; "12a" não vira 12).
   Volta number, null (vazio) ou NaN (inválido). Regras por campo/fonte:
   · vírgula sozinha = decimal (1,5); várias vírgulas = milhar em grupos de 3; com vírgula e ponto, o último é o decimal (1.234,5 · 1,234.5);
   · ponto sozinho: ponto:'decimal' (padrão; 1.234 = 1,234) ou ponto:'milhar' (1.234 = 1234 quando tem 3 dígitos depois; 1.5 = 1,5);
   · sinal no fim (15-, negativo do SAP) só com sap:true; espaços entre dígitos são ignorados (4 500,0).
   Códigos nunca passam por aqui (regra 4). */
function vacNumero(v, { ponto = 'decimal', sap = false } = {}) {
  if (v == null) return null; if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  let s = String(v).replace(/\u2212/g, '-').replace(/[\s\u00a0\u202f]+/g, ''); if (!s) return null;
  let neg = false; if (sap && /^\d[\d.,]*-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (/^[+-]/.test(s)) { if (s[0] === '-') neg = !neg; s = s.slice(1); }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  const g3 = (t, sep) => t.split(sep).slice(1).every(x => x.length === 3) && t.split(sep)[0].length > 0;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc >= 0 && ld >= 0) { const dec = lc > ld ? ',' : '.', mil = dec === ',' ? '.' : ','; const p = s.split(dec); if (p.length !== 2 || p[1].includes(mil) || !g3(p[0], mil)) return NaN; s = p[0].split(mil).join('') + '.' + p[1]; }
  else if (lc >= 0) { const p = s.split(','); if (p.length === 2) s = p[0] + '.' + p[1]; else if (g3(s, ',')) s = p.join(''); else return NaN; }
  else if (ld >= 0) { const p = s.split('.'); if (p.length === 2 && !(ponto === 'milhar' && p[1].length === 3)) { /* decimal */ } else if (g3(s, '.')) s = p.join(''); else return NaN; }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN; const n = parseFloat(s); return Number.isFinite(n) ? (neg ? -n : n) : NaN;
}
/* kit v2.1 · E4 (08/11/2026): quem lê o exports de outra página confere a versão antes de usar (regra 1). Sem número (base antiga)
   ou até a versão conhecida → usa; versão mais nova → não usa e avisa (não alimenta números com estrutura desconhecida).
   Campos novos opcionais entram na mesma versão (regra 6) e quem não conhece ignora. */
function vacExportsOk(ex, conhecida = 1) {
  if (!ex || typeof ex !== 'object') return { ok: false, versao: null, motivo: 'a base não tem o bloco exports' };
  const v = ex.exportsVersion; if (v == null || +v <= conhecida) return { ok: true, versao: v == null ? null : +v, motivo: '' };
  return { ok: false, versao: +v, motivo: `exports na versão ${v}; esta página só conhece até a ${conhecida}: atualize esta página` };
}
/* kit v2.1 · UX-04 (Fase 7 do briefing, D8): pílula única "Cadastro rev N", sempre visível, igual em todas as páginas.
   rev = revisão do cadastro geral do Portal (vacutainer-cadastros.json) que esta página está usando. Compara com a cópia mais
   nova que alguma página já leu neste computador (localStorage 'vac.cadastros'): se esta estiver atrás, mostra "desatualizada"
   (a página foi aberta antes da última gravação no Portal). o = { fonte: 'pasta'|'copia'|'teste'|…, revAt, revBy, portal:true }. */
function vacCadPilula(rev, o = {}) {
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AJ = 'Revisão do cadastro geral do Portal (vacutainer-cadastros.json) que esta página está usando. Cada gravação no Portal soma 1. Todas as páginas devem mostrar o mesmo número; se esta estiver atrás, ela foi aberta antes da última mudança no Portal: clique em ↻ Sincronizar ou recarregue (F5). Não é a revisão da base da própria página.';
  if (rev == null) return `<span class="pill none" data-vac-cadrev="" title="${e('Cadastro do Portal ainda não lido nesta página (pasta sem vacutainer-cadastros.json ou não conectada). ' + AJ)}">Cadastro: não lido</span>`;
  let ult = null; try { const c = JSON.parse(localStorage.getItem('vac.cadastros') || 'null'); if (c && c.rev != null && isFinite(+c.rev)) ult = +c.rev; } catch (x) { }
  const atras = !o.portal && ult != null && +rev < ult, copia = o.fonte && o.fonte !== 'pasta' && o.fonte !== 'teste';
  const cls = atras ? 'warn' : copia ? 'warn' : o.portal ? 'ok' : 'info';
  const quando = o.revAt ? ` Gravada em ${String(o.revAt).slice(8, 10)}/${String(o.revAt).slice(5, 7)} ${String(o.revAt).slice(11, 16)}${o.revBy ? ' por ' + o.revBy : ''}.` : '';
  const tit = (atras ? `Desatualizada: já existe a rev ${ult} neste computador. ` : '') + (copia ? 'Lida da cópia local (a pasta não respondeu). ' : '') + AJ + quando;
  return `<span class="pill ${cls}" data-vac-cadrev="${e(rev)}" title="${e(tit)}">Cadastro rev ${e(rev)}${atras ? ' · desatualizada' : ''}${copia ? ' · cópia local' : ''} <span class="vac-ib" aria-hidden="true">ⓘ</span></span>`;
}

/* kit v2.1 · E5 (08/11/2026): ficha da ordem, do lote e da LP · índice da busca (Ctrl K) · link #ficha=ordem/<n>.
   A ficha SÓ mostra o que cada página publica no exports (regra 1: não recalcula, não lê a estrutura interna).
   Lê as bases da pasta conectada (a página define vacPastaAtual() → pasta ou null), cada uma só quando muda (data e tamanho do
   arquivo). Sem pasta ou com erro de leitura, usa a última cópia lida neste computador (IndexedDB "vac-ficha"), sempre com a data.
   Abre por: busca (Ctrl K), clique em elemento com data-vac-ordem / data-vac-lote / data-vac-lp, vacFicha.abrir(tipo, código)
   ou o link <página>#ficha=ordem/<n> (também lote/<x> e lp/<x>). O ← Voltar do navegador fecha a ficha e mantém a tela. */
const vacFicha = (() => {
  const FONTES = [
    { id: 'oee', nome: 'Produção', base: 'oee-vacutainer-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [], cob: ex.porOrdemCobertura || null, lotes: ex.lotes || [], porDiaTurno: ex.porDiaTurno || [], porDiaCatalogo: ex.porDiaCatalogo || [], trechos: ex.trechos || [], trocas: ex.trocas || [], paradasEventos: ex.paradasEventos || [] }) },   /* Fase 4: ficha do trecho */   /* Fase 4 · 4d: o Gel lê os turnos da Produção */
    { id: 'ordens', nome: 'SAP (Produção › Ordens)', sis: 'oee', base: 'ordens-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [] }) },
    { id: 'perdas', nome: 'Waste', base: 'perdas-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [], acoesLegado: ex.acoesLegado || null }) },   /* Fase 6: Iniciativas traz as ações antigas */
    { id: 'gel', nome: 'Gestão de Gel', base: 'fifo-base.json', pega: ex => ({ ordens: ex.ordens || [], cob: ex.ordensCobertura || null, porDiaGel: ex.porDiaGel || [] }) },   /* Fase 4 · 4e */
    { id: 'paradas', nome: 'Paradas', base: 'paradas-base.json', pega: ex => ({ porOrdem: ex.porOrdem || [], eventos: (ex.eventos || []).filter(e => e && e.ordem), todos: (ex.eventos || []).filter(e => e && e.dia).map(e => ({ id: e.id, dia: e.dia, turno: e.turno, inicio: e.inicio, minutos: e.minutos, equipamento: e.equipamento, codigo: e.codigo, descricao: e.descricao, ordem: e.ordem, lote: e.lote, ordemFonte: e.ordemFonte || null, eventoId: e.eventoId || null })) }) },
    { id: 'inic', nome: 'Iniciativas / Ações', base: 'iniciativas-base.json', pega: ex => ({ acoes: ex.acoes || [] }) },
    { id: 'portal', nome: 'Portal', base: 'portal-base.json', pega: ex => ({ acoesReuniao: ex.acoesReuniao || [] }) }];   /* pauta automática: Iniciativas cria as ações da Reunião diária */
  const S = { dados: {}, idx: null, carregando: null, aberto: null, empilhado: false };
  const e2 = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tx = v => String(v ?? '').trim();
  const nk = v => { const s = tx(v); return /^\d+$/.test(s) ? s.replace(/^0+(?=\d)/, '') : s.toUpperCase(); };   // só para comparar; o código mostrado é o original (regra 4)
  const semAc = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nf = (n, d = 0) => n == null || !Number.isFinite(+n) ? '—' : (+n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dt = s => { const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(tx(s)); return m ? `${m[3]}/${m[2]}${m[4] ? ' ' + m[4] + ':' + m[5] : '/' + m[1]}` : (s ? tx(s) : '—'); };
  const dth = iso => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d)) return dt(iso); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const mes = s => { const m = /^(\d{4})-(\d{2})/.exec(tx(s)); return m ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m[2] - 1] + '/' + m[1] : tx(s); };
  const F = id => FONTES.find(f => f.id === id);
  const D = id => (S.dados[id] && S.dados[id].d) || null;
  const naoAchou = e => typeof vacNaoAchou === 'function' ? vacNaoAchou(e) : !!e && e.name === 'NotFoundError';
  /* IndexedDB: última cópia lida de cada base (só o que a ficha usa) */
  const idbAbre = () => new Promise((ok, no) => { const r = indexedDB.open('vac-ficha', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const idbGet = async k => { const db = await idbAbre(); return new Promise((ok, no) => { const q = db.transaction('f').objectStore('f').get(k); q.onsuccess = () => { db.close(); ok(q.result); }; q.onerror = () => { db.close(); no(q.error); }; }); };
  const idbSet = async (k, v) => { const db = await idbAbre(); return new Promise((ok, no) => { const t = db.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = () => { db.close(); ok(); }; t.onerror = () => { db.close(); no(t.error); }; }); };
  const pasta = () => { let d = null; try { d = typeof vacPastaAtual === 'function' ? vacPastaAtual() : null; } catch (e) { } return d && !d.__vacRaiz && typeof vacRaiz === 'function' ? vacRaiz(d) : d; };
  function carregar(forcar) {
    if (S.carregando) return S.carregando;
    S.carregando = (async () => {
      if(vacDemo.ativo){for(const f of FONTES){const ex=vacDemo.exports(f.id);S.dados[f.id]=ex?{estado:'pasta',pasta:'Demonstração',geradoEm:ex.geradoEm,d:f.pega(ex)}:{estado:'ausente'}}S.idx=null;return}
      const dir = pasta();
      /* AT-08 · trocou de pasta na mesma aba: o que a ficha tem em memória e o índice da busca são da pasta anterior; relê tudo.
         NV-03: a cópia do IndexedDB guarda a identidade comprovada da origem, não só o nome final. */
      if (dir) { let mesma = false; try { mesma = !!S.pasta && await dir.isSameEntry(S.pasta); } catch (e) { } if (S.pasta && !mesma) { S.dados = {}; S.idx = null; } S.pasta = dir; }
      const nomeP = dir ? String(dir.name || '') : '';
      let origem = ''; if(dir) { try { origem = await vacOrigemPasta(dir); } catch(e) { } }
      for (const f of FONTES) {
        const atual = S.dados[f.id];
        try {
          if (!dir) throw { semPasta: true };
          let fh; try { fh = await dir.getFileHandle(f.base); } catch (e) { if (naoAchou(e)) { S.dados[f.id] = { estado: 'ausente' }; continue; } throw e; }
          const arq = await fh.getFile();
          if (!forcar && atual && atual.estado === 'pasta' && atual.mod === arq.lastModified && atual.tam === arq.size) continue;
          const j = JSON.parse(await arq.text()), ex = j && j.exports, v = typeof vacExportsOk === 'function' ? vacExportsOk(ex) : { ok: !!ex };
          if (!v.ok) { S.dados[f.id] = { estado: ex ? 'versao' : 'semexports', motivo: v.motivo || 'a base ainda não publica o resumo (exports)' }; continue; }
          const x = { estado: 'pasta', mod: arq.lastModified, tam: arq.size, lidoEm: new Date().toISOString(), geradoEm: ex.geradoEm || null, pasta: nomeP, origem, d: f.pega(ex) };
          S.dados[f.id] = x; try { await idbSet(f.id, x); } catch (e) { }
        } catch (e) {
          let c = atual && atual.d ? atual : null; if (!c) { try { c = await idbGet(f.id); } catch (x) { } } if (c && dir && (!origem || !c.origem || c.origem !== origem)) c = null;   // cópia de outra pasta não vale para esta
          const motivo = e && e.semPasta ? 'pasta da rede não conectada nesta página' : `não consegui ler ${f.base} (${(e && (e.name || e.message)) || e})`;
          S.dados[f.id] = c && c.d ? { ...c, estado: 'cache', motivo } : { estado: e && e.semPasta ? 'sempasta' : 'erro', motivo };
        }
      }
      S.idx = null;
    })().finally(() => { S.carregando = null; });
    return S.carregando;
  }
  /* índice da busca: o que existe de verdade nos exports e no cadastro (não adivinha pelo número de dígitos) */
  function indice() {
    if (S.idx) return S.idx;
    const I = { ordem: new Map(), lote: new Map(), lp: new Map() };
    const reg = (tipo, cod, info) => { const k = nk(cod); if (!k) return null; let x = I[tipo].get(k); if (!x) I[tipo].set(k, x = { k, cod: tx(cod), ordens: new Set(), lotes: new Set(), cats: new Set(), datas: [], fontes: new Set() }); if (info) { if (info.o && ![...x.ordens].some(o => nk(o) === nk(info.o))) x.ordens.add(tx(info.o).replace(/^0+(?=\d)/, '')); if (info.l) x.lotes.add(tx(info.l)); if (info.c) x.cats.add(tx(info.c)); if (info.d && /^\d{4}-\d{2}-\d{2}/.test(tx(info.d))) x.datas.push(tx(info.d).slice(0, 10)); if (info.f) x.fontes.add(info.f); } return x; };
    const ord = (o, f, l, c, d) => { reg('ordem', o, { l, c, d, f }); if (l) reg('lote', l, { o, c, d, f }); };
    for (const o of (D('oee') || {}).porOrdem || []) ord(o.ordem, 'Produção', o.lote, o.catalogo, o.inicioReal || o.inicio || o.mes);
    for (const l of (D('oee') || {}).lotes || []) reg('lote', l.lote, { c: l.catalogo, d: l.inicio, f: 'Produção' });
    for (const o of (D('ordens') || {}).porOrdem || []) { ord(o.ordem, 'SAP', null, null, o.dataPrincipal); for (const l of o.lotes || []) ord(o.ordem, 'SAP', l, null, null); }
    for (const o of (D('perdas') || {}).porOrdem || []) ord(o.ordem, 'Waste', o.lote, o.catalogo, o.per);
    for (const o of (D('gel') || {}).ordens || []) { ord(o.ordem, 'Gel', o.lote, o.catalogo, o.inicio); for (const p of o.lps || []) reg('lp', p, { o: o.ordem, l: o.lote, f: 'Gel' }); }
    for (const o of (D('paradas') || {}).porOrdem || []) ord(o.ordem, 'Paradas', null, null, o.de);
    return (S.idx = I);
  }
  function buscar(q) {
    const k = nk(q), ks = semAc(q).trim(); if (k.length < 2) return [];
    const I = indice(), R = [];
    const rank = c => c === k ? 0 : c.startsWith(k) ? 1 : 2;
    const top = (m, n) => [...m.values()].filter(x => x.k.includes(k)).sort((a, b) => rank(a.k) - rank(b.k) || a.k.length - b.k.length || a.k.localeCompare(b.k)).slice(0, n);
    const per = x => { const d = x.datas.filter(Boolean).sort(); return d.length ? (d[0] === d[d.length - 1] ? dt(d[0]) : dt(d[0]) + ' a ' + dt(d[d.length - 1])) : ''; };
    for (const x of top(I.lote, 6)) R.push({ tipo: 'Lote', txt: x.cod, sub: [x.ordens.size ? 'ordem ' + [...x.ordens].join(', ') : '', x.cats.size ? 'catálogo ' + [...x.cats].join(', ') : '', per(x)].filter(Boolean).join(' · '), go: () => abrir('lote', x.cod), r: rank(x.k) });
    for (const x of top(I.ordem, 8)) R.push({ tipo: 'Ordem', txt: x.cod, sub: [x.lotes.size ? 'lote ' + [...x.lotes].join(', ') : '', x.cats.size ? 'catálogo ' + [...x.cats].join(', ') : '', [...x.fontes].join(' · ')].filter(Boolean).join(' · '), go: () => abrir('ordem', x.cod), r: rank(x.k) });
    for (const x of top(I.lp, 5)) R.push({ tipo: 'LP', txt: x.cod, sub: 'barril de gel · ordem ' + [...x.ordens].join(', '), go: () => abrir('lp', x.cod), r: rank(x.k) });
    const C = typeof vacCad === 'function' ? vacCad() : null, href = h => typeof vacPortalHref === 'function' ? vacPortalHref(h) : 'Portal.html#' + h;
    if (C) {
      for (const c of (C.catalogos || []).filter(c => c.ativo !== false && (nk(c.codigo).includes(k) || semAc(c.nome).includes(ks))).slice(0, 5)) R.push({ tipo: 'Catálogo', txt: tx(c.codigo) + (c.nome ? ' · ' + c.nome : ''), sub: 'cadastro do Portal', href: href('cadastros/catalogos/' + encodeURIComponent(c.codigo)), r: nk(c.codigo) === k ? 0 : 2 });
      for (const e of (C.equipamentos || []).filter(e => e.ativo !== false && (nk(e.codigo).includes(k) || semAc(e.nome).includes(ks) || (e.apelidos || []).some(a => semAc(a).includes(ks)))).slice(0, 5)) {
        const ap = (e.apelidos || []).find(a => semAc(a).includes(ks));
        R.push({ tipo: 'Equipamento', txt: tx(e.codigo) + (e.nome ? ' · ' + e.nome : ''), sub: (ap ? `apelido “${ap}” · ` : '') + 'ficha do equipamento', href: typeof vacEquipHref === 'function' ? vacEquipHref(e.codigo) : (() => { const s = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'equip'); return s && !s.futuro && (typeof vacEstadoDe !== 'function' || (vacEstadoDe('equip') || {}).estado !== 'construcao') && typeof sysHref === 'function' ? sysHref(s, 'eq=' + encodeURIComponent(e.codigo)) : href('cadastros/equipamentos/' + encodeURIComponent(e.codigo)); })(), r: nk(e.codigo) === k ? 0 : 2 });
      }
    }
    return R.sort((a, b) => a.r - b.r);
  }
  /* ---------- painel ---------- */
  const sysHrefDe = (id, hash) => { try { const s = (typeof systems === 'function' ? systems() : []).find(x => x.id === id); if (!s) return null; if (typeof PAGE !== 'undefined' && PAGE.id === id) return '#' + hash; return typeof sysHref === 'function' ? sysHref(s, hash) : s.html + '#' + hash; } catch (e) { return null; } };
  const linkAbrir = (id, hash, rot) => { const h = sysHrefDe(id, hash); return h ? `<a class="vf-abrir" href="${e2(h)}" data-vf-ir>${e2(rot)} ›</a>` : ''; };
  function fonteTxt(id) {
    const x = S.dados[id], f = F(id); if (!x) return 'lendo…';
    if (x.estado === 'pasta') return `exports ${f.id === 'ordens' ? 'de Produção › Ordens' : 'de ' + f.nome} · gerado ${dth(x.geradoEm)}`;
    if (x.estado === 'cache') return `<span class="vf-cache">cópia lida em ${dth(x.lidoEm)}</span> · ${e2(x.motivo)}`;
    return e2(x.motivo || '');
  }
  const okFonte = id => S.dados[id] && (S.dados[id].estado === 'pasta' || S.dados[id].estado === 'cache');
  const vazio = (id, txt) => okFonte(id) ? txt : (S.dados[id] ? ({ ausente: `${F(id).base} ainda não existe na pasta.`, sempasta: 'Pasta da rede não conectada nesta página (e ainda sem cópia lida neste computador).' }[S.dados[id].estado] || S.dados[id].motivo || 'Sem dado.') : 'Lendo…');
  const bloco = (titulo, id, link, corpo, semDado) => `<section class="vf-bl${semDado ? ' off' : ''}"><h3>${e2(titulo)}${link || ''}</h3>${semDado ? `<p class="vf-vz">${e2(semDado)}</p>` : corpo}<div class="vf-fonte">${fonteTxt(id)}</div></section>`;
  const dl = pares => `<dl class="vf-dl">${pares.filter(Boolean).map(([a, b]) => `<div><dt>${e2(a)}</dt><dd>${b}</dd></div>`).join('')}</dl>`;
  const tab = (cab, linhas) => linhas.length ? `<div class="vf-tw"><table class="vf-t"><tr>${cab.map(c => `<th${/^#/.test(c) ? ' class="n"' : ''}>${e2(c.replace(/^#/, ''))}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map((c, i) => `<td${/^#/.test(cab[i]) ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>` : '';
  const modo = () => { try { return localStorage.getItem('vac.ficha.modo') === 'det' ? 'det' : 'res'; } catch (e) { return 'res'; } };
  const fora = (cob, datas, rot) => { if (!cob) return ''; const de = tx(cob.de || cob.desde); const d = (datas || []).filter(Boolean).sort()[0]; return de && d && d.slice(0, de.length) < de ? ` A ordem é de antes da janela que ${rot} publica (desde ${de.length === 7 ? mes(de) : dt(de)}): sem dado não quer dizer zero.` : ''; };
  function htmlOrdem(cod) {
    const k = nk(cod), m = a => (a || []).filter(x => nk(x.ordem) === k), det = modo() === 'det';
    const oee = m((D('oee') || {}).porOrdem).sort((a, b) => tx(a.mes).localeCompare(tx(b.mes))), sap = m((D('ordens') || {}).porOrdem).sort((a, b) => tx(a.competencia).localeCompare(tx(b.competencia)));
    const ws = m((D('perdas') || {}).porOrdem).sort((a, b) => tx(a.per).localeCompare(tx(b.per))), gel = m((D('gel') || {}).ordens), par = m((D('paradas') || {}).porOrdem), ev = m((D('paradas') || {}).eventos);
    const ac = ((D('inic') || {}).acoes || []).filter(a => (a.vinculos || []).some(v => v.tipo === 'ordem' && nk(v.cod) === k));
    const lotes = new Set([...oee.map(o => o.lote), ...ws.map(o => o.lote), ...gel.map(o => o.lote), ...sap.flatMap(o => o.lotes || [])].filter(Boolean).map(tx));
    const cat = [...oee, ...ws, ...gel].map(o => tx(o.catalogo)).find(Boolean) || '', C = typeof vacCad === 'function' ? vacCad() : null;
    const catNome = cat && C ? ((C.catalogos || []).find(c => tx(c.codigo) === cat) || {}).nome || '' : '';
    const comps = [...new Set([...sap.map(o => o.competencia), ...ws.map(o => o.per)].filter(Boolean))].sort();
    const datas = [...oee.map(o => o.inicioReal || o.inicio || o.mes), ...sap.map(o => o.dataPrincipal), ...ws.map(o => o.per), ...par.map(o => o.de)].filter(Boolean).map(tx);
    const stSap = sap.length ? sap[sap.length - 1].status : '';
    const nada = !oee.length && !sap.length && !ws.length && !gel.length && !par.length;
    const H = [];
    // Produção
    { const u = oee[oee.length - 1];
      const corpo = u ? dl([['Planejado', nf(u.qtd)], ['Produzido', nf(u.produzido)], ['Atingimento', u.qtd ? nf(100 * u.produzido / u.qtd, 1) + '%' : '—'], ['Início real', dt(u.inicioReal)], ['Fim real', dt(u.fimReal)], ['Dias do lote', (u.diasLote || []).length ? nf(u.diasLote.length) + ((u.retrabalhoDias || []).length ? ` (${u.retrabalhoDias.length} retrabalho)` : '') : '—']])
        + (oee.length > 1 ? `<p class="vf-nota">No plano de ${oee.map(o => mes(o.mes)).join(', ')}; números do plano mais recente.</p>` : `<p class="vf-nota">Plano de ${mes(u.mes)}.</p>`)
        + (det ? tab(['Plano', 'Lote', '#Planejado', '#Produzido', 'Início real', 'Fim real'], oee.map(o => [mes(o.mes), e2(o.lote || '—'), nf(o.qtd), nf(o.produzido), dt(o.inicioReal), dt(o.fimReal)])) + ((u.diasLote || []).length ? `<p class="vf-nota">Dias do lote: ${u.diasLote.map(d => (u.retrabalhoDias || []).includes(d) ? `<b>${dt(d)}</b>` : dt(d)).join(', ')}${(u.retrabalhoDias || []).length ? ' (em negrito: retrabalho)' : ''}</p>` : '') : '') : '';
      H.push(bloco('Produção', 'oee', u ? linkAbrir('oee', 'ordem=' + encodeURIComponent(cod), 'Abrir em Produção') : '', corpo, u ? '' : vazio('oee', 'Ordem fora dos planos do mês da Produção.' + fora((D('oee') || {}).cob, datas, 'a Produção')))); }
    // Paradas
    { const p = par[0];
      const corpo = p ? dl([['Eventos', nf(p.eventos)], ['Minutos', nf(p.minutos, p.minutos % 1 ? 1 : 0)], ['Período', p.de === p.ate ? dt(p.de) : dt(p.de) + ' a ' + dt(p.ate)], ['Equipamentos', e2((p.equipamentos || []).join(', ') || '—')]])
        + (det ? (ev.length ? tab(['Dia', 'Turno', 'Equip.', 'Código', '#Min', 'Descrição'], ev.slice().sort((a, b) => tx(a.dia).localeCompare(tx(b.dia))).map(e => [dt(e.dia), e2(e.turno || ''), e2(e.equipamento || ''), e2(e.codigo || ''), nf(e.minutos, e.minutos % 1 ? 1 : 0), e2(e.descricao || '')])) + '<p class="vf-nota">Lista com os eventos dos últimos 90 dias publicados pelo Paradas.</p>' : '<p class="vf-nota">Os eventos desta ordem são de antes dos 90 dias que o Paradas publica em lista.</p>') : '') : '';
      H.push(bloco('Paradas', 'paradas', p ? linkAbrir('paradas', 'ordem=' + encodeURIComponent(cod), 'Abrir em Paradas') : '', corpo, p ? '' : vazio('paradas', 'Nenhuma parada apontada com esta ordem.'))); }
    // Waste
    { const s = (f) => ws.reduce((a, o) => a + (+o[f] || 0), 0), u = ws[ws.length - 1];
      const corpo = u ? dl([['Perda', 'R$ ' + nf(s('perda'))], ['Desvio líquido', 'R$ ' + nf(s('desvio'))], ['Nível', e2(u.nivel || '—')], ['Causa', e2(u.causa || '—')], ['Comentários', nf(s('comentarios'))], ['Ações abertas', nf(s('acoesAbertas'))]])
        + (ws.length > 1 ? `<p class="vf-nota">Soma de ${ws.length} competências (${ws.map(o => mes(o.per)).join(', ')}).</p>` : `<p class="vf-nota">Competência ${mes(u.per)}.</p>`)
        + (det ? tab(['Competência', '#Custo meta', '#Custo real', '#Desvio', '#Perda', 'Nível'], ws.map(o => [mes(o.per), nf(o.custoMeta), nf(o.custoReal), nf(o.desvio), nf(o.perda), e2(o.nivel || '')])) : '') : '';
      H.push(bloco('Waste', 'perdas', u ? linkAbrir('perdas', 'ordem=' + encodeURIComponent(cod), 'Abrir em Waste') : '', corpo, u ? '' : vazio('perdas', 'Ordem sem KKBC importada no Waste.'))); }
    // Gel
    { const g = gel[0];
      const corpo = g ? dl([['Gel baixado', g.consumoKg == null ? '—' : nf(g.consumoKg, 1) + ' kg'], ['g por tubo', g.gPorTubo == null ? '—' : nf(g.gPorTubo, 3) + (g.metaG ? ' · meta ' + nf(g.metaG, 3) : '')], ['Scrap de gel', g.scrapKg == null ? '—' : nf(g.scrapKg, 2) + ' kg (estimado)'], ['Barris (LP)', nf((g.lps || []).length)]])
        + (det && (g.lps || []).length ? `<p class="vf-nota">LPs: ${g.lps.map(l => `<a href="#" data-vac-lp="${e2(l)}" class="mono">${e2(l)}</a>`).join(', ')}</p>` : '') : '';
      H.push(bloco('Gestão de Gel', 'gel', g ? linkAbrir('gel', 'ordem=' + encodeURIComponent(cod), 'Abrir em Gestão de Gel') : '', corpo, g ? '' : vazio('gel', 'Sem registro desta ordem no Gel.' + fora((D('gel') || {}).cob, datas, 'o Gel')))); }
    // SAP
    { const u = sap[sap.length - 1];
      const corpo = u ? dl([['Status', e2(u.status || '—')], ['Tipo (COOIS)', e2((u.coois && u.coois.tipo) || '—')], ['Materiais', nf((u.materiais || []).length)], ['Pendências', nf((u.pendencias || []).length)], ['Início (COOIS)', dt(u.coois && u.coois.dIni)], ['Fim (COOIS)', dt(u.coois && u.coois.dFim)]])
        + (det ? tab(['Competência', 'Status', 'Data', 'Lotes', 'Pendências'], sap.map(o => [mes(o.competencia), e2(o.status || ''), dt(o.dataPrincipal), e2((o.lotes || []).join(', ')), e2((o.pendencias || []).join('; ') || '—')])) : '') : '';
      H.push(bloco('SAP (MB51 / COOIS)', 'ordens', u ? '<span class="pill">só leitura</span>' : '', corpo, u ? '' : vazio('ordens', 'Ordem sem MB51/COOIS importado em Produção › Ordens.'))); }
    // Ações (Iniciativas; o Waste já conta as dele acima)
    if (okFonte('inic') || ac.length) H.push(bloco('Ações ligadas', 'inic', linkAbrir('inic', 'ordem=' + encodeURIComponent(cod), 'Abrir em Iniciativas'),
      ac.map(a => `<p class="vf-ac"><span class="pill">${e2(a.status || '')}</span> ${e2(a.titulo || '')}${a.responsavel ? ' · ' + e2(a.responsavel) : ''}${a.prazo ? ' · vence ' + dt(a.prazo) : ''}</p>`).join(''), ac.length ? '' : 'Nenhuma ação ligada a esta ordem.'));
    const cab = `<div class="vf-t1"><span class="vf-tp">Ordem</span><h2 class="mono">${e2(cod)}</h2>${stSap ? `<span class="pill">${e2(stSap)}</span>` : ''}</div>
      <div class="vf-ids">${cat ? `<span>Catálogo <b>${e2(cat)}</b>${catNome ? ' · ' + e2(catNome) : ''}</span>` : ''}${lotes.size ? `<span>Lote${lotes.size > 1 ? 's' : ''} ${[...lotes].map(l => `<a href="#" data-vac-lote="${e2(l)}"><b>${e2(l)}</b></a>`).join(' ')}</span>` : ''}${comps.length ? `<span>Competência${comps.length > 1 ? 's' : ''} <b>${comps.map(mes).join(' ')}</b></span>` : ''}</div>`;
    return { cab, corpo: (nada && Object.keys(S.dados).length ? `<p class="vf-aviso">Esta ordem não aparece em nenhuma página (ou a pasta não está conectada). Confira o número.</p>` : '') + H.join('') };
  }
  function htmlLote(cod) {
    const I = indice(), x = I.lote.get(nk(cod)), L = (D('oee') || {}).lotes || [], l = L.find(y => nk(y.lote) === nk(cod));
    const ords = x ? [...x.ordens] : [];
    const corpo = (l ? bloco('Servidor (Produção)', 'oee', linkAbrir('oee', 'lote=' + encodeURIComponent(cod), 'Abrir em Produção › Lotes'), dl([['Catálogo', e2(l.catalogo || '—')], ['Peças', nf(l.pecas)], ['Início', dt(l.inicio)], ['Fim', dt(l.fim)], ['Situação', e2(l.situacao || '—')], ['Dias de retrabalho', nf((l.retrabalhoDias || []).length)]]) + (l.obs ? `<p class="vf-nota">${e2(l.obs)}</p>` : ''), '') : '')
      + `<section class="vf-bl"><h3>Ordens do lote</h3>${ords.length ? ords.map(o => `<p><a href="#" data-vac-ordem="${e2(o)}" class="mono">${e2(o)}</a> <span class="vf-nota">abre a ficha da ordem</span></p>`).join('') : '<p class="vf-vz">Nenhuma ordem ligada a este lote nos exports.</p>'}</section>`;
    return { cab: `<div class="vf-t1"><span class="vf-tp">Lote</span><h2 class="mono">${e2(cod)}</h2></div><div class="vf-ids">${x && x.cats.size ? `<span>Catálogo <b>${e2([...x.cats].join(', '))}</b></span>` : ''}</div>`, corpo };
  }
  function htmlLp(cod) {
    const os = ((D('gel') || {}).ordens || []).filter(o => (o.lps || []).some(p => nk(p) === nk(cod)));
    const corpo = bloco('Gestão de Gel', 'gel', linkAbrir('gel', 'lp=' + encodeURIComponent(cod), 'Abrir em Gestão de Gel'),
      os.length ? tab(['Ordem', 'Lote', '#Gel baixado (kg)', 'Período'], os.map(o => [`<a href="#" data-vac-ordem="${e2(o.ordem)}" class="mono">${e2(o.ordem)}</a>`, e2(o.lote || '—'), nf(o.consumoKg, 1), o.inicio ? dt(o.inicio) + (o.fim ? ' a ' + dt(o.fim) : '') : '—'])) : '', os.length ? '' : vazio('gel', 'Nenhuma ordem com baixa deste barril nos 150 dias que o Gel publica.'));
    return { cab: `<div class="vf-t1"><span class="vf-tp">LP (barril de gel)</span><h2 class="mono">${e2(cod)}</h2></div>`, corpo };
  }
  /* Fase 4 (13/11/2026) · ficha do trecho: tudo o que aconteceu entre dois horários (AAAA-MM-DDTHH:MM/AAAA-MM-DDTHH:MM), só com os exports:
     trechos do MES (lotes, ordens, catálogos, caixas no trecho, proporcionais ao tempo), trocas de lote, paradas do Paradas (pelo início) e
     da Produção (as que não casaram com o Paradas), ações das ordens. Mostra a multiplicidade (um trecho com dois lotes mostra os dois). */
  const intervalo = cod => { const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/.exec(tx(cod)); return m && m[1] < m[2] ? { de: m[1], ate: m[2] } : null; };
  const minE = s => Date.parse(s + ':00Z') / 60000;
  function htmlIntervalo(cod) {
    const I = intervalo(cod); if (!I) return { cab: '<div class="vf-t1"><span class="vf-tp">Trecho</span><h2>—</h2></div>', corpo: '<p class="vf-aviso">Horário inválido.</p>' };
    const P = D('oee') || {}, a = minE(I.de), b = minE(I.ate), dentro = ts => ts && ts >= I.de && ts < I.ate;
    const T = (P.trechos || []).filter(t => t.ini < I.ate && t.fim >= I.de).map(t => { const t0 = minE(t.ini), t1 = minE(t.fim), dur = Math.max(1, t1 - t0 + 1), ov = Math.max(0, Math.min(t1 + 1, b) - Math.max(t0, a)); return { ...t, cx: Math.round((t.caixas || 0) * ov / dur) }; });
    const lotes = [...new Set(T.map(t => t.lote))], ords = [...new Set(T.map(t => t.ordem).filter(Boolean))], tro = (P.trocas || []).filter(x => dentro(x.em));
    const ts = e => e.dia && e.inicio ? e.dia + 'T' + String(e.inicio).padStart(5, '0').slice(0, 5) : null;
    const par = ((D('paradas') || {}).todos || []).filter(e => dentro(ts(e))), usados = new Set(par.map(e => e.eventoId).filter(Boolean));
    const pro = (P.paradasEventos || []).filter(e => dentro(e.ini) && !usados.has(String(e.id)));
    const ac = ((D('inic') || {}).acoes || []).filter(x => ords.some(o => (x.vinculos || []).some(v => v.tipo === 'ordem' && nk(v.cod) === nk(o)) || nk(x.ordem) === nk(o)));
    const H = [], semP = !S.dados.oee || S.dados.oee.estado === 'ausente';
    H.push(bloco('Produção (MES)', 'oee', linkAbrir('oee', 'dia=' + I.de.slice(0, 10), 'Abrir o dia na Produção'),
      T.length ? dl([['Lotes', nf(lotes.length)], ['Ordens', nf(ords.length)], ['Caixas no trecho', nf(T.reduce((s, t) => s + t.cx, 0))]]) + tab(['Lote', 'Ordem', 'Catálogo', '#Caixas no trecho', 'Trecho do MES'], T.map(t => [`<a href="#" data-vac-lote="${e2(t.lote)}" class="mono">${e2(t.lote)}</a>`, t.ordem ? `<a href="#" data-vac-ordem="${e2(t.ordem)}" class="mono">${e2(t.ordem)}</a>` : '—', e2(t.catalogo || '—'), nf(t.cx), dt(t.ini) + ' a ' + dt(t.fim).slice(-5)]))
        + (lotes.length > 1 ? `<p class="vf-nota">Mais de um lote neste trecho${tro.length ? ': troca às ' + tro.map(x => x.em.slice(11, 16) + ' (' + e2(x.de) + ' → ' + e2(x.para) + ')').join(', ') : ''}.</p>` : '')
        + '<p class="vf-fonte">Caixas proporcionais ao tempo de cada trecho do MES dentro do horário.</p>' : '', T.length ? '' : vazio('oee', semP ? 'Sem o resumo da Produção.' : 'Nenhuma caixa do MES neste horário (ou fora dos 60 dias publicados).')));
    H.push(bloco('Paradas', 'paradas', linkAbrir('paradas', 'aba=eventos', 'Abrir no Paradas'),
      par.length || pro.length ? tab(['Início', 'Equip.', 'Código', '#Min', 'Ordem', 'Origem'], par.map(e => [e2(e.inicio || ''), e2(e.equipamento || ''), e2(e.codigo || ''), nf(e.minutos, e.minutos % 1 ? 1 : 0), e2(e.ordem || '—'), 'Paradas' + (e.eventoId ? ' · também na Produção' : '')])
        .concat(pro.map(e => [e2(e.inicio || ''), e2(e.equipamento || ''), e2(e.codigo || ''), nf(e.minutos), e2(e.ordem || '—'), 'só na Produção']))) : '', par.length || pro.length ? '' : 'Nenhuma parada com início neste horário.'));
    if (okFonte('inic') || ac.length) H.push(bloco('Ações das ordens do trecho', 'inic', '', ac.map(x => `<p class="vf-ac"><span class="pill">${e2(x.status || '')}</span> ${e2(x.titulo || '')}${x.responsavel ? ' · ' + e2(x.responsavel) : ''}</p>`).join(''), ac.length ? '' : 'Nenhuma ação ligada às ordens deste trecho.'));
    return { cab: `<div class="vf-t1"><span class="vf-tp">Trecho</span><h2>${e2(dt(I.de))} – ${e2(I.ate.slice(0, 10) === I.de.slice(0, 10) ? I.ate.slice(11, 16) : dt(I.ate))}</h2></div><div class="vf-ids">${lotes.length ? `<span>Lote${lotes.length > 1 ? 's' : ''} ${lotes.map(l => `<b>${e2(l)}</b>`).join(' ')}</span>` : ''}${ords.length ? `<span>Ordem${ords.length > 1 ? 's' : ''} ${ords.map(o => `<b>${e2(o)}</b>`).join(' ')}</span>` : ''}</div>`, corpo: H.join('') };
  }
  function render() {
    const a = S.aberto; if (!a) return; let el = document.getElementById('vacFicha');
    if (!el) {
      el = document.createElement('div'); el.id = 'vacFicha'; el.className = 'vficha-fundo'; el.innerHTML = '<aside class="vficha" role="dialog" aria-modal="true" aria-label="Ficha"></aside>'; document.body.appendChild(el);
      el.addEventListener('click', e => { if (e.target === el) fechar(); });
    }
    const h = a.tipo === 'lote' ? htmlLote(a.cod) : a.tipo === 'lp' ? htmlLp(a.cod) : a.tipo === 'intervalo' ? htmlIntervalo(a.cod) : htmlOrdem(a.cod), md = modo();
    const asd = el.querySelector('.vficha'), rol = asd.scrollTop;
    asd.innerHTML = `<header class="vf-cab">${h.cab}<div class="vf-acoes"><span class="vf-seg" role="group" aria-label="Nível de detalhe"><button type="button" data-vf-modo="res" class="${md === 'res' ? 'on' : ''}">Resumo</button><button type="button" data-vf-modo="det" class="${md === 'det' ? 'on' : ''}">Detalhado</button></span><span class="vf-sp"></span>${S.carregando ? '<span class="vf-nota">lendo as bases…</span>' : ''}${a.tipo === 'ordem' && typeof vacNovaAcaoHref === 'function' ? `<a class="vf-b" href="${e2(vacNovaAcaoHref({ titulo: '', origem: { tipo: 'ficha', ref: 'ordem|' + a.cod, resumo: 'Ficha da ordem ' + a.cod, link: link(a.tipo, a.cod) }, vinculos: [{ tipo: 'ordem', cod: a.cod }] }))}" target="_blank" rel="noopener" title="Abre Iniciativas com a ordem já ligada">+ Abrir ação</a>` : ''}<button type="button" class="vf-b" data-vf-link title="Copia o endereço que abre esta ficha">Copiar link</button><button type="button" class="vf-b" data-vf-fechar aria-label="Fechar a ficha" title="Fechar (Esc)">✕</button></div></header><div class="vf-corpo">${h.corpo}</div>`;
    asd.scrollTop = rol;
  }
  function abrir(tipo, cod, op = {}) {
    cod = tx(cod); if (!cod) return; tipo = ['ordem', 'lote', 'lp', 'intervalo'].includes(tipo) ? tipo : 'ordem';
    S.aberto = { tipo, cod };
    if (op.hist !== false) { try { if (history.state && history.state.vacFicha) history.replaceState({ ...history.state, vacFicha: { tipo, cod } }, ''); else { history.pushState({ ...(history.state || {}), vacFicha: { tipo, cod } }, ''); } S.empilhado = true; } catch (e) { } }
    render(); document.addEventListener('keydown', esc, true);
    const p = carregar(); render(); p.then(render, render);
  }
  function fechar(op = {}) {
    if (!S.aberto) return; S.aberto = null; const el = document.getElementById('vacFicha'); if (el) el.remove(); document.removeEventListener('keydown', esc, true);
    if (op.hist !== false && history.state && history.state.vacFicha) { try { history.back(); } catch (e) { } }
  }
  function esc(e) { if (e.key === 'Escape' && S.aberto && !document.querySelector('.vbusca')) { e.stopPropagation(); fechar(); } }
  const link = (tipo, cod) => vacDemo.atualHref('ficha=' + tipo + '/' + encodeURIComponent(cod));
  function avisa(m) { try { if (typeof toast === 'function') return toast(m); } catch (e) { } console.info(m); }
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-vac-ordem],[data-vac-lote],[data-vac-lp],[data-vf-modo],[data-vf-link],[data-vf-fechar],[data-vf-ir]'); if (!t) return;
    if (t.hasAttribute('data-vf-ir')) { const h = t.getAttribute('href') || ''; if (h.startsWith('#')) { e.preventDefault(); fechar({ hist: false }); try { if (history.state && history.state.vacFicha) history.replaceState({ ...history.state, vacFicha: null }, ''); } catch (x) { } if (location.hash === h) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; } else fechar({ hist: false }); return; }
    e.preventDefault(); e.stopPropagation();
    if (t.hasAttribute('data-vf-modo')) { try { localStorage.setItem('vac.ficha.modo', t.getAttribute('data-vf-modo')); } catch (x) { } return render(); }
    if (t.hasAttribute('data-vf-fechar')) return fechar();
    if (t.hasAttribute('data-vf-link')) { const u = link(S.aberto.tipo, S.aberto.cod); try { navigator.clipboard.writeText(u).then(() => avisa('Link da ficha copiado.'), () => prompt('Copie o link da ficha:', u)); } catch (x) { prompt('Copie o link da ficha:', u); } return; }
    if (t.hasAttribute('data-vac-ordem')) return abrir('ordem', t.getAttribute('data-vac-ordem'));
    if (t.hasAttribute('data-vac-lote')) return abrir('lote', t.getAttribute('data-vac-lote'));
    if (t.hasAttribute('data-vac-lp')) return abrir('lp', t.getAttribute('data-vac-lp'));
  }, true);
  window.addEventListener('popstate', e => { const f = e.state && e.state.vacFicha; if (f) abrir(f.tipo, f.cod, { hist: false }); else if (S.aberto) fechar({ hist: false }); });
  const rota = () => { const m = /^#ficha=(ordem|lote|lp|intervalo)\/(.+)$/.exec(location.hash || ''); if (!m) return; let c = m[2]; try { c = decodeURIComponent(c); } catch (e) { } try { history.replaceState(history.state, '', location.href.split('#')[0]); } catch (e) { } abrir(m[1], c); };
  window.addEventListener('hashchange', rota);
  /* busca: ordem, lote, LP, catálogo e equipamento entram na busca comum (Ctrl K) de todas as páginas */
  const ligaBusca = () => {
    if (typeof Busca === 'undefined' || !Busca || Busca._vacFicha) return; Busca._vacFicha = 1;
    const fi = Busca.itens, fa = Busca.abrir;
    Busca.itens = function (q) { let P = []; try { P = buscar(q || ''); } catch (e) { console.warn('vacFicha.buscar', e); } const R = fi.apply(this, arguments) || []; const vist = new Set(P.map(x => x.tipo + '|' + x.txt)); return P.concat(R.filter(x => !vist.has(x.tipo + '|' + x.txt))).slice(0, 40); };
    Busca.abrir = function () { const r = fa.apply(this, arguments); try { const i = document.getElementById('vbQ'); if (i) i.placeholder = 'Ordem, lote, LP, catálogo, equipamento ou página…'; } catch (e) { }
      carregar().then(() => { if (Busca.el) { const i = document.getElementById('vbQ'); Busca.lista(i ? i.value : ''); } }); return r; };
  };
  const ini = () => { ligaBusca(); rota(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ini, 0)); else setTimeout(ini, 0);
  /* Fase 4 · 4d: o que foi lido de uma página (estado, geradoEm, d), para quem precisa do exports de outra (ex.: o Gel lê a Produção) */
  const dados = id => S.dados[id] || null;
  return { abrir, fechar, carregar, buscar, indice, dados, _S: S, FONTES };
})();
/* botão "Ficha" para as páginas porem ao lado de um número de ordem (abre a ficha comum) */
function vacFichaBotao(ordem, tipo = 'ordem') { const v = String(ordem ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); return `<button type="button" class="vficha-bt" data-vac-${tipo}="${v}" title="Ficha: tudo sobre ${tipo === 'lp' ? 'o barril' : 'a ' + tipo} ${v} em todas as páginas">Ficha</button>`; }
/* kit v2.1 · E8 (08/11/2026): link para abrir uma ação em Iniciativas (Planner) a partir de outra página, sem gravar lá (regra 1).
   d = {titulo, descricao, origem:{tipo, ref, resumo, link, foto:{…}}, vinculos:[{tipo, cod}]}. Iniciativas abre o formulário
   preenchido, mostra as ações abertas parecidas e só cria depois da confirmação. Use referências, não listas grandes (URL curta). */
function vacNovaAcaoHref(d) {
  const h = 'nova=' + encodeURIComponent(JSON.stringify(d || {}));
  if (typeof PAGE !== 'undefined' && PAGE.id === 'inic') return '#' + h;
  let s = null; try { s = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'inic'); } catch (e) { }
  return s && typeof sysHref === 'function' ? sysHref(s, h) : 'Iniciativas.html#' + h;
}
function vacNovaAcaoBotao(d, rot = '+ Ação no Planner', cls = 'b sm') { const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); return `<a class="${e(cls)}" href="${e(vacNovaAcaoHref(d))}" target="_blank" rel="noopener" title="Abre Iniciativas com a ação preenchida (você confere antes de criar)">${e(rot)}</a>`; }
/* endereço desta página com uma rota (para o "reconsultar" da ação) */
function vacAquiHref(hash) { return vacDemo.ativo ? vacDemo.paginas[PAGE.id] + (hash ? '#' + hash : '') : location.href.split('#')[0].split('/').pop() + (hash ? '#' + hash : ''); }

/* ===== vacGel · conta do gel comum (Fase 4 · 4b do briefing de 09/11/2026) =====
   A mesma conta na Gestão de Gel e na Produção (Registrar scrap e Teórico × Real), sem cópia divergente.
   Funções puras: recebem os parâmetros (formatos, perdas, gel do catálogo, descarte do equipamento) e devolvem números.
   A Gestão de Gel chama com os dados dela (que desde a 2.17 vêm do Portal); a Produção chama com o cadastro do Portal (vacGel.ctx()).
   Estruturas iguais às do Gel: formatos [{from,tara,taraP,sobra,f:{'100':{tubo,gel,adit,tr},'75':{…}}}], processo [{from,g,pT,pB,pP}],
   gel do catálogo {fmt, vig:[{from,gTubo,bomKg,bomBase,tol}]}, equipamento {tara, descs:[{id,comp,cat,mots}]}. */
const vacGel = (() => {
  const FMT_DEF = { from: '2000-01-01', tara: 75, taraP: 5, f: { '100': { tubo: 4.779, gel: 0.834, adit: 0.020, tr: 2.30 }, '75': { tubo: 3.560, gel: 0.834, adit: 0.015, tr: 2.30 } } };
  const PROC_DEF = { from: '', g: 0.98, pT: 2.2406, pB: 0.7352, pP: 0.5252 };
  const COMPS = { completo: { l: 'Tubo completo', parts: ['tubo', 'tr', 'gel', 'adit'], cap: 1 }, tubogel: { l: 'Tubo + gel', parts: ['tubo', 'gel'] }, spray: { l: 'Tubo + gel + spray', parts: ['tubo', 'gel', 'adit'] }, gel: { l: 'Gel puro', parts: ['gel'] }, barril: { l: 'Barril (sobra)', parts: ['gel'] } };
  const SCAT = { T: 'Tubos', B: 'Barril', P: 'Purga' };
  const ord = L => (L || []).slice().sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : 0);
  /* vigência dos formatos na data (a 1ª, se a data for anterior a todas) */
  function fmtAt(fmts, date) { const L = ord(fmts && fmts.length ? fmts : [FMT_DEF]); let v = L[0]; for (const x of L) if (x.from <= date) v = x; return v; }
  function procAt(params, date) { const L = ord(params).filter(p => p.from <= date); return L.length ? { ...PROC_DEF, ...L[L.length - 1] } : { ...PROC_DEF }; }
  function sobraAt(fmts, date) { const L = ord(fmts && fmts.length ? fmts : [FMT_DEF]).filter(x => x.from <= date && x.sobra != null && x.sobra !== ''); return L.length ? +L[L.length - 1].sobra : null; }
  const taraP = FM => FM && FM.taraP != null && FM.taraP !== '' ? +FM.taraP : 5;
  /* vigências do gel do catálogo (aceita o cadastro antigo: gTubo/bom no próprio catálogo) */
  function vigList(cg) { if (!cg) return []; const L = cg.vig && cg.vig.length ? cg.vig : (cg.gTubo || cg.bomG || cg.bomKg ? [{ from: '2000-01-01', gTubo: cg.gTubo || null, bomG: cg.bomG || null, bomPct: cg.bomPct || 106, bomKg: cg.bomKg || null, bomBase: cg.bomBase || 10000, tol: cg.tol ?? 6 }] : []); return ord(L); }
  function vigAt(cg, date) { const L = vigList(cg); if (!L.length) return {}; let v = L[0]; for (const x of L) if (x.from <= date) v = x; return v; }
  /* gel por tubo: o do catálogo; senão o do formato; senão o de processo */
  function gelPorTubo(cg, date, fmts, params) { const v = vigAt(cg, date); if (+v.gTubo) return +v.gTubo; const F = fmtAt(fmts, date).f[(cg && cg.fmt) || '100']; return F && +F.gel ? +F.gel : procAt(params, date).g; }
  function bomVals(v) { if (+v.bomKg) return { kg: +v.bomKg, base: +v.bomBase || 10000, tol: v.tol != null && v.tol !== '' ? +v.tol : 6 }; if (+v.bomG) { const p = +(v.bomPct || 106); return { kg: +v.bomG * p / 100 * 10, base: 10000, tol: p - 100 }; } return { kg: null, base: +v.bomBase || 10000, tol: v.tol != null && v.tol !== '' ? +v.tol : 6 }; }
  /* BOM do catálogo na data: permitido (com a tolerância) e meta (sem); sem BOM, estimada pelo gel do formato + tolerância */
  function bom(cg, date, fmts, params) { const b = bomVals(vigAt(cg, date)); let allowed, est = false; if (b.kg) allowed = b.kg * 1000 / b.base; else { const F = fmtAt(fmts, date).f[(cg && cg.fmt) || '100']; allowed = (F && +F.gel ? +F.gel : procAt(params, date).g) * (1 + b.tol / 100); est = true; } return { ...b, allowed, meta: allowed / (1 + b.tol / 100), lim: 100 + b.tol, est }; }
  /* uma pesagem: peso bruto da balança (kg) → gel líquido, tubos e materiais. desc = {comp, cat}; taraEq = embalagem própria do equipamento */
  function pesagem({ desc, taraEq, kg, nb, cg, date, fmts, params }) {
    if (!desc) return null; const FM = fmtAt(fmts, date), F = FM.f[(cg && cg.fmt) || '100'] || FM.f['100'], g = gelPorTubo(cg, date, fmts, params);
    const tara = desc.cat === 'P' ? taraP(FM) : taraEq != null && taraEq !== '' ? +taraEq : +FM.tara || 0, net = Math.max(0, (+kg || 0) * 1000 - tara);
    const comp = COMPS[desc.comp] || COMPS.gel;
    if (desc.comp === 'gel') return { scat: desc.cat, comp: desc.comp, tara, gross: +kg || 0, gel: net / 1000, n: 0, tubo: 0, tamp: 0, rolha: 0, etq: 0, adit: 0 };
    if (desc.comp === 'barril') { const n0 = +nb || 0, kr = +kg || 0, gel = kr > 0 ? kr : n0 * (sobraAt(fmts, date) || 0); return { scat: desc.cat, comp: desc.comp, gross: gel, gel, nb: n0, est: !(kr > 0), n: 0, tubo: 0, tamp: 0, rolha: 0, etq: 0, adit: 0 }; }
    const w = { tubo: +F.tubo || 0, gel: g, adit: +F.adit || 0, tr: +F.tr || 0 }, unit = comp.parts.reduce((s, k) => s + w[k], 0) || 1, n = net / unit;
    return { scat: desc.cat, comp: desc.comp, tara, gross: +kg || 0, unit, n, gel: n * g / 1000, tubo: n * w.tubo / 1000, tamp: comp.cap ? n : 0, rolha: comp.cap ? n : 0, etq: comp.cap ? n : 0, adit: comp.parts.includes('adit') ? n * w.adit / 1000 : 0, trKg: comp.cap ? n * w.tr / 1000 : 0 };
  }
  /* teórico de gel de uma produção: tubos bons por catálogo → gel nos tubos ÷ (1 − perdas teóricas); por categoria T/B/P */
  function teorico({ tubosPorCat, date, cg, fmts, params }) {
    const P = procAt(params, date); let gelBons = 0; for (const [cat, t] of Object.entries(tubosPorCat || {})) gelBons += (+t || 0) * gelPorTubo(cg(cat), date, fmts, params) / 1000;
    const perda = ((+P.pT || 0) + (+P.pB || 0) + (+P.pP || 0)) / 100, teo = gelBons / Math.max(.01, 1 - perda);   /* igual ao prodCalc do Gel */
    return { gelBons, teo, sTeo: { T: teo * (+P.pT || 0) / 100, B: teo * (+P.pB || 0) / 100, P: teo * (+P.pP || 0) / 100 }, perdas: P };
  }
  /* contexto a partir do cadastro do Portal (Produção) */
  function ctx(c) {
    c = c || (typeof vacCad === 'function' ? vacCad() : null); const G = (c && c.parametros && c.parametros.gel) || {};
    const cat = cod => { const k = (c && c.catalogos || []).find(x => x && String(x.codigo) === String(cod)); if (!k) return null; const g = k.gel || {}; const f = g.fmt || (/75/.test(k.formato || '') ? '75' : /100/.test(k.formato || '') ? '100' : null); return { ...g, fmt: f || '100' }; };
    const eq = cod => { const e = (c && c.equipamentos || []).find(x => x && String(x.codigo) === String(cod)); return e && e.gel ? { codigo: e.codigo, nome: e.nome, ativo: e.ativo !== false, tara: e.gel.tara, descs: e.gel.descs || [] } : null; };
    const equips = () => (c && c.equipamentos || []).filter(e => e && e.gel && e.ativo !== false && (e.gel.descs || []).length).map(e => eq(e.codigo));
    const gelMats = new Set((c && c.materiais || []).filter(m => m && m.tipo === 'gel').map(m => String(m.codigo)));
    const usaGel = cod => { const k = cat(cod); if (k && (k.vig || []).length) return true; if (!gelMats.size) return false; const b = (c && c.bom || []).find(x => x && String(x.catalogo) === String(cod)); return !!b && (b.vigencias || []).some(v => (v.itens || []).concat(v.estrutura || []).some(i => gelMats.has(String(i.material)))); };
    return { fmts: G.formatos || [], params: G.processo || [], motivos: G.motivos || [], corte: G.registroPelaProducaoDesde || null, cat, eq, equips, usaGel };
  }
  return { FMT_DEF, PROC_DEF, COMPS, SCAT, fmtAt, procAt, sobraAt, taraP, vigList, vigAt, gelPorTubo, bomVals, bom, pesagem, teorico, ctx };
})();

/* ===== kit v2.1 · UX-02 (briefing 09/11/2026): guia por aba =====
   Botão "?" no cabeçalho (ao lado do tema) e F1 abrem um painel com o guia DA ABA ABERTA: para que serve, cada campo (o que é,
   como preencher, exemplo), o passo a passo das tarefas e as dúvidas comuns. "Mostrar na tela" numera os campos na própria tela
   (①②③ ligados aos itens do guia): fica visual sem depender de prints, que envelhecem a cada mudança de layout.
   Conteúdo: cada página define window.VAC_GUIA[PAGE.id][<aba>] = { titulo, para, campos:[{sel, nome, o, como, ex}],
   passos:[[título, [passo, …]]], duvidas:[[pergunta, resposta]] }. A aba atual vem de vacGuiaAba() (se a página definir) ou do
   botão marcado nas abas (#nav). Aba sem guia mostra "em preparação" e lembra do ⓘ dos campos. Nada é gravado. */
const vacGuia = (() => {
  const S = { aberto: false, mostrar: false, aba: null, marcas: [], t: null };
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pag = () => (typeof PAGE !== 'undefined' && PAGE.id) || '';
  function aba() {
    if (typeof vacGuiaAba === 'function') { try { const v = vacGuiaAba(); if (v) return String(v); } catch (x) { } }
    const on = document.querySelector('#nav .on[data-t],#nav .on[data-tab],#nav .on[data-route],#nav [data-t][aria-current=page],#nav [aria-selected=true][data-tab],[role=tab][aria-selected=true]');
    return on ? (on.getAttribute('data-t') || on.getAttribute('data-tab') || on.getAttribute('data-route') || '') : '';
  }
  const guia = a => { const G = (window.VAC_GUIA || {})[pag()] || {}; return G[a] || null; };
  function css() {
    if (document.getElementById('vacGuiaCss')) return;
    const st = document.createElement('style'); st.id = 'vacGuiaCss';
    st.textContent = `#vacGuia{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);z-index:900;background:var(--surface,#fff);color:var(--ink,#1c2430);border-left:1px solid var(--line,#ccd);box-shadow:-8px 0 24px rgba(0,0,0,.18);display:flex;flex-direction:column;font:14px/1.45 var(--f-body,system-ui,sans-serif)}
#vacGuia header{display:flex;gap:8px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line,#ccd)}#vacGuia header h2{margin:0;font-size:16px;flex:1;font-family:var(--f-display,inherit)}
#vacGuia .vg-b{border:1px solid var(--line,#ccd);background:var(--surface-2,transparent);color:inherit;border-radius:8px;padding:4px 10px;cursor:pointer;font:inherit;font-size:13px}#vacGuia .vg-b[aria-pressed=true]{background:var(--accent,#235f91);color:var(--on-fill,#fff);border-color:var(--accent,#235f91)}
#vacGuia .vg-c{overflow:auto;padding:12px 14px 40px;flex:1}#vacGuia h3{font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#667);margin:16px 0 6px}
#vacGuia .vg-para{background:var(--accent-soft,rgba(35,95,145,.1));border-radius:8px;padding:8px 10px}#vacGuia ol.vg-cp{list-style:none;margin:0;padding:0}#vacGuia ol.vg-cp li{display:grid;grid-template-columns:26px 1fr;gap:8px;padding:8px 6px;border-bottom:1px solid var(--line,#ccd);border-radius:6px;cursor:pointer}
#vacGuia ol.vg-cp li:hover,#vacGuia ol.vg-cp li.vg-on{background:var(--surface-2,rgba(0,0,0,.04))}#vacGuia .vg-n,.vg-marca{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--accent,#235f91);color:var(--on-fill,#fff);font:700 12px/1 var(--f-body,system-ui)}
#vacGuia .vg-n.off{background:var(--muted,#889)}#vacGuia .vg-k{font-size:12px;color:var(--muted,#667)}#vacGuia .vg-ex{font-size:12.5px;margin-top:2px}#vacGuia .vg-ex b{font-weight:600}#vacGuia ol.vg-ps{margin:4px 0 8px;padding-left:20px}#vacGuia ol.vg-ps li{margin:3px 0}
#vacGuia details{border:1px solid var(--line,#ccd);border-radius:8px;padding:6px 10px;margin:6px 0}#vacGuia summary{cursor:pointer;font-weight:600}
.vg-marca{position:fixed;z-index:899;box-shadow:0 0 0 2px var(--surface,#fff);cursor:pointer;transform:translate(-40%,-40%)}.vg-alvo{outline:3px solid var(--accent,#235f91)!important;outline-offset:2px;transition:outline-color .3s}
@media print{#vacGuia,.vg-marca,#vacGuiaBtn{display:none!important}}`;
    document.head.appendChild(st);
  }
  function botao() {
    if (document.getElementById('vacGuiaBtn')) return; const t = document.getElementById('btnTheme'); if (!t) return;
    t.insertAdjacentHTML('beforebegin', '<button type="button" class="vic" id="vacGuiaBtn" title="Guia desta aba: para que serve, cada campo e o passo a passo (F1)" aria-label="Guia desta aba">?</button>');
    document.getElementById('vacGuiaBtn').onclick = () => alternar();
  }
  const visivel = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden');
  const alvo = c => { if (!c.sel) return null; try { return [...document.querySelectorAll(c.sel)].find(visivel) || null; } catch (x) { return null; } };
  function limparMarcas() { S.marcas.forEach(m => m.remove()); S.marcas = []; }
  function posicionar() {
    const g = guia(S.aba); if (!S.aberto || !S.mostrar || !g) { limparMarcas(); return; }
    const C = g.campos || []; if (S.marcas.length !== C.length) { limparMarcas(); C.forEach((c, i) => { const m = document.createElement('span'); m.className = 'vg-marca'; m.textContent = i + 1; m.title = c.nome; m.onclick = () => focar(i, false); document.body.appendChild(m); S.marcas.push(m); }); }
    C.forEach((c, i) => { const el = alvo(c), m = S.marcas[i]; if (!el) { m.style.display = 'none'; return; } const r = el.getBoundingClientRect(); const fora = r.bottom < 0 || r.top > innerHeight || r.left > innerWidth - Math.min(420, innerWidth); m.style.display = fora ? 'none' : ''; m.style.left = Math.max(8, r.left) + 'px'; m.style.top = Math.max(8, r.top) + 'px'; });
    const P = document.getElementById('vacGuia'); if (P) P.querySelectorAll('.vg-n[data-i]').forEach(n => { const c = C[+n.dataset.i]; n.classList.toggle('off', !!(c && c.sel) && !alvo(c)); n.title = c && c.sel && !alvo(c) ? 'Não aparece nesta tela agora (depende do dia, do filtro ou do que já foi lançado)' : ''; });
  }
  function focar(i, rolarTela) {
    const g = guia(S.aba); if (!g) return; const c = (g.campos || [])[i]; const P = document.getElementById('vacGuia');
    if (P) { P.querySelectorAll('li[data-i]').forEach(l => l.classList.toggle('vg-on', +l.dataset.i === i)); const li = P.querySelector(`li[data-i="${i}"]`); if (li) li.scrollIntoView({ block: 'nearest' }); }
    const el = c && alvo(c); if (!el) return; if (rolarTela) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('vg-alvo'); setTimeout(() => el.classList.remove('vg-alvo'), 1600);
  }
  function html(a, g) {
    const nome = (typeof PAGE !== 'undefined' && (PAGE.tituloCurto || PAGE.titulo)) || '';
    if (!g) return `<header><h2>Guia · ${e(nome)}</h2><button type="button" class="vg-b" data-vgx aria-label="Fechar">✕</button></header><div class="vg-c"><p class="vg-para">O guia desta aba ainda está em preparação.</p><p>Enquanto isso, o <b>ⓘ</b> ao lado de cada campo e título explica o que ele é, com um exemplo.</p>${Object.keys((window.VAC_GUIA || {})[pag()] || {}).length ? `<h3>Abas com guia nesta página</h3><ul>${Object.entries(window.VAC_GUIA[pag()]).map(([k, x]) => `<li>${e(x.titulo || k)}</li>`).join('')}</ul>` : ''}</div>`;
    const C = g.campos || [];
    return `<header><h2>Guia · ${e(g.titulo || a)}</h2>${C.some(c => c.sel) ? `<button type="button" class="vg-b" data-vgm aria-pressed="${S.mostrar}" title="Numera os campos na tela">Mostrar na tela</button>` : ''}<button type="button" class="vg-b" data-vgx aria-label="Fechar">✕</button></header>
<div class="vg-c">${g.para ? `<p class="vg-para">${g.para}</p>` : ''}
${C.length ? `<h3>Campos e botões</h3><ol class="vg-cp">${C.map((c, i) => `<li data-i="${i}" title="${c.sel ? 'Clique para ver na tela' : ''}"><span class="vg-n" data-i="${i}">${i + 1}</span><div><b>${e(c.nome)}</b><div>${c.o || ''}</div>${c.como ? `<div class="vg-ex"><b>Como preencher:</b> ${c.como}</div>` : ''}${c.ex ? `<div class="vg-ex"><b>Exemplo:</b> ${c.ex}</div>` : ''}</div></li>`).join('')}</ol>` : ''}
${(g.passos || []).length ? `<h3>Passo a passo</h3>${g.passos.map(([t, L]) => `<details open><summary>${e(t)}</summary><ol class="vg-ps">${L.map(p => `<li>${p}</li>`).join('')}</ol></details>`).join('')}` : ''}
${(g.duvidas || []).length ? `<h3>Dúvidas comuns</h3>${g.duvidas.map(([q, r]) => `<details><summary>${e(q)}</summary><p>${r}</p></details>`).join('')}` : ''}
<p class="vg-k" style="margin-top:18px">F1 abre e fecha este guia. Os números ① ② ③ aparecem na tela com "Mostrar na tela".</p></div>`;
  }
  function render() {
    css(); let P = document.getElementById('vacGuia'); if (!S.aberto) { if (P) P.remove(); limparMarcas(); return; }
    S.aba = aba(); const g = guia(S.aba);
    if (!P) { P = document.createElement('aside'); P.id = 'vacGuia'; P.setAttribute('role', 'complementary'); P.setAttribute('aria-label', 'Guia desta aba'); document.body.appendChild(P); }
    P.innerHTML = html(S.aba, g); limparMarcas();
    P.querySelector('[data-vgx]').onclick = () => fechar();
    const m = P.querySelector('[data-vgm]'); if (m) m.onclick = () => { S.mostrar = !S.mostrar; try { localStorage.setItem('vac.guiaMostrar', S.mostrar ? '1' : ''); } catch (x) { } m.setAttribute('aria-pressed', S.mostrar); posicionar(); };
    P.querySelectorAll('li[data-i]').forEach(l => l.onclick = () => focar(+l.dataset.i, true));
    posicionar();
  }
  function abrir() { S.aberto = true; try { S.mostrar = localStorage.getItem('vac.guiaMostrar') === '1'; } catch (x) { } render(); clearInterval(S.t); S.t = setInterval(() => { if (!S.aberto) return; if (aba() !== S.aba) render(); else posicionar(); }, 500); }
  function fechar() { S.aberto = false; clearInterval(S.t); render(); const b = document.getElementById('vacGuiaBtn'); if (b) b.focus(); }
  function alternar() { S.aberto ? fechar() : abrir(); }
  addEventListener('keydown', ev => { if (ev.key === 'F1') { ev.preventDefault(); alternar(); } else if (ev.key === 'Escape' && S.aberto && !document.querySelector('.modal.on,.mod-bg,[role=dialog]:not(#vacGuia)')) fechar(); });
  addEventListener('scroll', () => { if (S.aberto && S.mostrar) posicionar(); }, true); addEventListener('resize', () => { if (S.aberto && S.mostrar) posicionar(); });
  const ini = () => { botao(); setTimeout(botao, 800); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ini); else ini();
  return { abrir, fechar, alternar, aba, guia: () => guia(aba()), _S: S };
})();

/* ===== kit v2.1 · datas sempre em DD/MM/AAAA (homologação de 10/11/2026) =====
   O campo de data nativo do navegador mostra a data no idioma do Windows/Chrome (em inglês: MM/DD/YYYY). Em todas as páginas, cada
   <input type="date"> e "datetime-local" ganha um campo de texto DD/MM/AAAA (com hh:mm no datetime) e o botão do calendário; o campo
   original fica escondido e continua com o valor no formato interno (AAAA-MM-DD), então o código da página não muda: lê .value, recebe
   "input" e "change" e pode mudar .value por código (o texto acompanha). A Produção tem o mesmo componente próprio (DateFields).
   O que se importa (CSV, SAP, Forms) continua lido pelo formato do arquivo; isto é só a tela. */
const vacDatas = (() => {
  if (typeof DateFields !== 'undefined') return { aplicar() { } };   // Produção: já tem o DateFields
  const P2 = n => String(n).padStart(2, '0');
  const toTxt = (iso, dt) => { if (!iso) return ''; const [d, t] = String(iso).split('T'); const [y, m, dd] = d.split('-'); if (!dd) return ''; return `${dd}/${m}/${y}${dt ? ' ' + (t || '00:00').slice(0, 5) : ''}`; };
  const parse = (txt, dt) => {
    const s = String(txt || '').trim(); if (!s) return '';
    let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s), d, mo, y, h = null, mi = null;
    if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; h = m[4]; mi = m[5]; }
    else { const parts = s.split(/\s+/), ds = parts[0], ts = parts.slice(1).join(''); const g = ds.includes('/') ? ds.split('/') : [ds.slice(0, 2), ds.slice(2, 4), ds.slice(4, 8)];
      d = +g[0]; mo = +g[1]; y = g[2] ? +g[2] : new Date().getFullYear(); if (y < 100) y += 2000;
      let tt = ts; if (!tt && !ds.includes('/') && ds.length > 8) tt = ds.slice(8); if (tt) { const tm = /^(\d{1,2}):?(\d{2})$/.exec(tt); if (tm) { h = tm[1]; mi = tm[2]; } } }
    const o = new Date(y, mo - 1, d); if (!(d >= 1 && mo >= 1 && mo <= 12 && y > 1999 && y < 2100) || o.getMonth() !== mo - 1 || o.getDate() !== d) return null;
    const iso = `${y}-${P2(mo)}-${P2(d)}`; if (!dt) return iso;
    const hh = h == null ? 0 : +h, mm = mi == null ? 0 : +mi; if (hh > 23 || mm > 59) return null; return `${iso}T${P2(hh)}:${P2(mm)}`;
  };
  const mask = (v, dt) => { const n = v.replace(/\D/g, '').slice(0, dt ? 12 : 8); let o = n.slice(0, 2); if (n.length > 2) o += '/' + n.slice(2, 4); if (n.length > 4) o += '/' + n.slice(4, 8); if (dt && n.length > 8) o += ' ' + n.slice(8, 10) + (n.length > 10 ? ':' + n.slice(10, 12) : ''); return o; };
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  function css() { if (document.getElementById('vacDatasCss')) return; const st = document.createElement('style'); st.id = 'vacDatasCss';
    st.textContent = '.vdf{position:relative;display:inline-flex;align-items:center;max-width:100%;vertical-align:middle}.vdf .vdf-t{width:9.2em;font:inherit;font-variant-numeric:tabular-nums;padding-right:28px}.vdf.dt .vdf-t{width:12.4em}.vdf .vdf-t.bad{border-color:var(--crit,#c62828);outline:1px solid var(--crit,#c62828)}.vdf .vdf-b{position:absolute;right:4px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--muted,#667);padding:3px;cursor:pointer;display:flex}.vdf .vdf-s{position:absolute;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;padding:0;pointer-events:none}';
    document.head.appendChild(st); }
  function um(src) {
    if (src.dataset.vdf || src.dataset.dfx || src.closest('.vdf')) return; const dt = src.type === 'datetime-local'; src.dataset.vdf = '1'; css();
    const wrap = document.createElement('span'); wrap.className = 'vdf' + (dt ? ' dt' : '');
    const txt = document.createElement('input'); txt.type = 'text'; txt.dataset.vdfTexto = '1'; txt.className = 'vdf-t ' + (src.className || ''); txt.placeholder = dt ? 'dd/mm/aaaa hh:mm' : 'dd/mm/aaaa'; txt.value = toTxt(src.value, dt); txt.disabled = src.disabled;
    if (src.getAttribute('style')) txt.setAttribute('style', src.getAttribute('style'));
    txt.setAttribute('aria-label', src.getAttribute('aria-label') || src.title || 'Data (dd/mm/aaaa)'); if (src.title) txt.title = src.title;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'vdf-b'; btn.tabIndex = -1; btn.setAttribute('aria-label', 'Abrir calendário'); btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="1.5" y="3" width="13" height="11.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 6.5h13M5 1.5v3M11 1.5v3" stroke="currentColor" stroke-width="1.4"/></svg>';
    src.parentNode.insertBefore(wrap, src); wrap.appendChild(txt); wrap.appendChild(btn); wrap.appendChild(src); src.classList.add('vdf-s'); src.tabIndex = -1;
    let last = desc.get.call(src);
    try { Object.defineProperty(src, 'value', { configurable: true, get() { return desc.get.call(this); }, set(v) { desc.set.call(this, v); last = desc.get.call(this); txt.value = toTxt(last, dt); } }); } catch (e) { }
    const commit = () => { const iso = parse(txt.value, dt); if (iso === null) { txt.classList.add('bad'); txt.title = 'Data inválida: use dd/mm/aaaa' + (dt ? ' hh:mm' : ''); return; } txt.classList.remove('bad'); txt.value = toTxt(iso, dt);
      if (iso !== last) { last = iso; desc.set.call(src, iso); src.dispatchEvent(new Event('input', { bubbles: true })); src.dispatchEvent(new Event('change', { bubbles: true })); } };
    txt.addEventListener('input', e => { if (e.inputType && e.inputType.startsWith('delete')) return; txt.value = mask(txt.value, dt); });
    txt.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    txt.addEventListener('blur', commit);
    src.addEventListener('change', () => { const v = desc.get.call(src); if (v !== last) { last = v; txt.value = toTxt(v, dt); } });
    btn.onclick = () => { try { src.showPicker(); } catch (e) { src.focus(); } };
    new MutationObserver(() => { txt.disabled = src.disabled; }).observe(src, { attributes: true, attributeFilter: ['disabled'] });
  }
  function aplicar(root) { (root || document).querySelectorAll('input[type=date],input[type=datetime-local]').forEach(um); }
  const ini = () => { aplicar(document); new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches('input[type=date],input[type=datetime-local]')) um(n); else if (n.querySelectorAll) aplicar(n); } }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ini); else ini();
  return { aplicar, toTxt, parse };
})();

/* ----- kit v2.1 · login com ID e senha de 6 números (11/11/2026; igual em todas as páginas; não editar só numa) -----
   Pop-up que escurece a página e só fecha com uma entrada válida: ID → nome, função e perfil → senha de 6 números.
   Senha no cadastro (usuarios[].senha = {alg, iter, sal, hash, provisoria, em, por}), PBKDF2-SHA256; só o Portal grava (regra 2):
   criar a senha no 1º acesso, autocadastro (ID fora do cadastro, perfil Consulta) e troca acontecem no Portal (hooks window.vacLoginPortal).
   Sessão neste computador até o fim do turno em que entrou (turnos do Portal; sem turno, 12 h): localStorage vac.sessao.
   5 senhas erradas bloqueiam o ID neste computador por 5 minutos. Sem pop-up: Demonstração, modo TV, modo de teste e testes automáticos
   (navigator.webdriver; o teste do login liga com localStorage vac.login.forcar = '1').
   Identifica quem lança; não é cofre: quem copia o arquivo do cadastro vê a senha embaralhada (ver docs/login.md). */
const vacLogin = (() => {
  const ITER = 150000, MAX_ERR = 5, BLOQ_MS = 5 * 60000, DOZE_H = 12 * 3600000;
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lg = k => { try { return localStorage.getItem(k); } catch (x) { return null; } };
  const ls = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (x) { } };
  const lj = (k, d) => { try { return JSON.parse(lg(k) || 'null') ?? d; } catch (x) { return d; } };
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const iso = (d = new Date()) => { const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); };
  const brh = s => { const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(String(s || '')); return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5] : ''; };
  const ehPortal = () => typeof PAGE !== 'undefined' && PAGE.id === 'portal';
  const hook = () => ehPortal() && window.vacLoginPortal ? window.vacLoginPortal : null;
  const portalHref = h => { try { if (ehPortal()) return '#' + h; const s = (typeof systems === 'function' ? systems() : []).find(x => x.id === 'portal') || { html: 'Portal.html' }; return typeof sysHref === 'function' ? sysHref(s, h) : s.html + '#' + h; } catch (x) { return 'Portal.html#' + h; } };
  /* ---- senha ---- */
  async function hash(pin, sal, iter = ITER) {
    const enc = new TextEncoder(), k = await crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(String(sal)), iterations: iter }, k, 256));
  }
  async function gerar(pin, provisoria, por) {
    const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
    return { alg: 'PBKDF2-SHA256', iter: ITER, sal, hash: await hash(pin, sal, ITER), provisoria: !!provisoria, em: iso(), por: por || '' };
  }
  async function confere(u, pin) { const s = u && u.senha; if (!s || !s.hash || !s.sal) return false; try { return (await hash(pin, s.sal, +s.iter || ITER)) === s.hash; } catch (x) { return false; } }
  /* fraca: não são 6 números, todos iguais ou em sequência */
  const fraca = p => !/^\d{6}$/.test(p) || /^(\d)\1{5}$/.test(p) || '0123456789'.includes(p) || '9876543210'.includes(p);
  function provisoriaNova() { for (;;) { const p = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0'); if (!fraca(p)) return p; } }
  /* ---- cadastro ---- */
  const cad = () => { try { return typeof vacCad === 'function' ? vacCad() : null; } catch (x) { return null; } };
  const usuario = id => { const c = cad(); return c ? (c.usuarios || []).find(u => String(u.codigo) === String(id)) || null : null; };
  const perfilDe = u => { const c = cad(); return c && u ? (c.perfis || []).find(p => p.codigo === u.perfil) || null : null; };
  const funcao = u => [u.especialidade, u.area].filter(Boolean).join(' · ') || (u.turno ? 'Turno ' + u.turno : '');
  /* ---- sessão: até o fim do turno em que entrou ---- */
  function fimSessao(agora = new Date()) {
    const now = agora.getTime(), J = [];
    const dia = d => { const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
    for (const k of [-1, 0, 1]) {
      const d = new Date(agora); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + k);
      let T = []; try { T = typeof vacTurnosEm === 'function' ? vacTurnosEm(dia(d)) : []; } catch (x) { }
      for (const t of T) {
        if (t.naoProdutivo) continue;
        const m = s => { const r = /^(\d{1,2}):(\d{2})/.exec(String(s || '')); return r ? +r[1] * 60 + +r[2] : null; }, a = m(t.inicio), f = m(t.fim);
        if (a == null || f == null) continue;
        const ini = d.getTime() + a * 60000, fim = d.getTime() + (f > a ? f : f + 1440) * 60000; J.push([ini, fim]);
      }
    }
    const dentro = J.filter(([a, f]) => a <= now && now < f).sort((x, y) => y[1] - x[1])[0];
    if (dentro) return dentro[1];
    const prox = J.filter(([a]) => a > now).sort((x, y) => x[0] - y[0])[0];
    return prox ? Math.min(prox[1], now + DOZE_H) : now + DOZE_H;
  }
  function sessao() { const s = lj('vac.sessao', null), id = lg('vac.userId') || ''; return s && s.id && String(s.id) === id && +s.ate > Date.now() ? s : null; }
  function avisar(nome) {
    try { if (typeof vacAoTrocarUsuario === 'function') vacAoTrocarUsuario(nome); } catch (x) { console.warn(x); }
    window.dispatchEvent(new CustomEvent('vac:usuario', { detail: { nome } }));
    try { if (typeof renderSysNav === 'function') renderSysNav(); if (typeof vacUserRender === 'function') vacUserRender(); } catch (x) { }
    try { if (ehPortal()) { if (typeof renderTop === 'function') renderTop(); if (typeof App !== 'undefined' && App.render) App.render(); } } catch (x) { }
  }
  function abrirSessao(u) {
    const ult = lg('vac.login.ultimo.' + u.codigo);
    ls('vac.user', u.nome); ls('vac.userId', String(u.codigo)); ls('vac.perfil', u.perfil || '');
    ls('vac.sessao', JSON.stringify({ id: String(u.codigo), nome: u.nome, em: iso(), ate: fimSessao(), pagina: typeof PAGE !== 'undefined' ? PAGE.id : '' }));
    ls('vac.login.ultimo.' + u.codigo, iso()); const E = lj('vac.login.erros', {}); delete E[u.codigo]; ls('vac.login.erros', JSON.stringify(E));
    avisar(u.nome); return ult;
  }
  function sair() { for (const k of ['vac.sessao', 'vac.user', 'vac.userId', 'vac.perfil']) ls(k, null); avisar(''); fechar(); abrir(); }
  /* ---- quando não aparece ---- */
  function dispensado() {
    try { if (typeof vacDemo !== 'undefined' && vacDemo.ativo) return true; } catch (x) { }
    if (location.hash === '#tv' || document.querySelector('body > .tv, #tvEl, #tv:not([hidden])') || document.body.classList.contains('tv-on')) return true;
    if (lg('vac.login.forcar') === '1') return false;
    if (navigator.webdriver) return true;
    if (location.hash === '#teste') return true;
    try { if (typeof Store !== 'undefined' && Store && (Store.test === true || Store.mode === 'teste')) return true; } catch (x) { }
    try { if (typeof MOD !== 'undefined' && MOD && MOD.teste) return true; } catch (x) { }
    return false;
  }
  /* ---- tentativas ---- */
  const bloqueio = id => { const x = lj('vac.login.erros', {})[id]; return x && x.ate && x.ate > Date.now() ? x.ate : 0; };
  function errou(id) { const E = lj('vac.login.erros', {}), x = E[id] && E[id].ate && E[id].ate <= Date.now() ? { n: 0 } : (E[id] || { n: 0 }); x.n = (x.n || 0) + 1; if (x.n >= MAX_ERR) x.ate = Date.now() + BLOQ_MS; E[id] = x; ls('vac.login.erros', JSON.stringify(E)); return x; }
  /* ---- interface ---- */
  let el = null, modo = {}, inertes = [];
  function css() {
    if (document.getElementById('vacLoginCss')) return; const st = document.createElement('style'); st.id = 'vacLoginCss';
    st.textContent = ':root{--vl-veil:rgba(10,16,22,.62);--vl-bg:#ffffff;--vl-ink:#16202a;--vl-mute:#5a6775;--vl-line:#d3dae1;--vl-in:#f3f5f8;--vl-acc:#1d5fa8;--vl-acc-ink:#fff;--vl-chip:#e9eef3;--vl-crit:#c22a2a;--vl-ok:#19713f;--vl-warn:#8f5a00}' +
      '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--vl-veil:rgba(0,0,0,.68);--vl-bg:#17212b;--vl-ink:#e6ecf2;--vl-mute:#9aa8b6;--vl-line:#2b3846;--vl-in:#0e141a;--vl-acc:#5aa2ec;--vl-acc-ink:#0e141a;--vl-chip:#22303d;--vl-crit:#ff7a7a;--vl-ok:#4dc282;--vl-warn:#f0b34a}}' +
      ':root[data-theme="dark"]{--vl-veil:rgba(0,0,0,.68);--vl-bg:#17212b;--vl-ink:#e6ecf2;--vl-mute:#9aa8b6;--vl-line:#2b3846;--vl-in:#0e141a;--vl-acc:#5aa2ec;--vl-acc-ink:#0e141a;--vl-chip:#22303d;--vl-crit:#ff7a7a;--vl-ok:#4dc282;--vl-warn:#f0b34a}' +
      '.vlog{position:fixed;inset:0;z-index:9000;background:var(--vl-veil);backdrop-filter:blur(3px);display:grid;place-items:center;padding:16px;overflow:auto;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}' +
      '.vlog .vl-d{width:min(430px,100%);background:var(--vl-bg);color:var(--vl-ink);border:1px solid var(--vl-line);border-radius:12px;box-shadow:0 18px 48px rgba(0,0,0,.35);overflow:hidden;font-size:14px;line-height:1.45}' +
      '.vlog .vl-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--vl-line)}.vlog .vl-t{font-weight:700;font-size:17px;line-height:1.25}.vlog .vl-t small{display:block;font-weight:400;font-size:12px;color:var(--vl-mute)}' +
      '.vlog .vl-logo{flex:none;max-height:40px;max-width:110px;object-fit:contain;background:#fff;border-radius:4px;padding:3px}' +
      '.vlog .vl-b{padding:18px;display:grid;gap:12px}.vlog label.vl-l{display:grid;gap:5px;font-weight:600;font-size:13px}' +
      '.vlog input.vl-i,.vlog select.vl-i{font:600 17px ui-monospace,Consolas,monospace;padding:9px 11px;border-radius:6px;border:1px solid var(--vl-line);background:var(--vl-in);color:var(--vl-ink);width:100%}.vlog input.vl-n{font:500 15px system-ui,sans-serif}' +
      '.vlog .vl-pin{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.vlog .vl-pin input{font:600 22px ui-monospace,Consolas,monospace;text-align:center;padding:9px 0;border-radius:6px;border:1px solid var(--vl-line);background:var(--vl-in);color:var(--vl-ink);width:100%;-webkit-text-security:disc}' +
      '.vlog input:focus-visible,.vlog select:focus-visible,.vlog button:focus-visible,.vlog a:focus-visible{outline:2px solid var(--vl-acc);outline-offset:1px}' +
      '.vlog .vl-who{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:8px;background:var(--vl-chip)}.vlog .vl-av{flex:none;width:38px;height:38px;border-radius:50%;background:var(--vl-acc);color:var(--vl-acc-ink);display:grid;place-items:center;font-weight:700}' +
      '.vlog .vl-who b{display:block}.vlog .vl-who span{font-size:13px;color:var(--vl-mute)}.vlog .vl-msg{font-size:13px;min-height:18px}.vlog .vl-msg.e{color:var(--vl-crit)}.vlog .vl-msg.o{color:var(--vl-ok)}.vlog .vl-msg.w{color:var(--vl-warn)}' +
      '.vlog .vl-a{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.vlog .vl-btn{font:600 14px system-ui,sans-serif;padding:9px 16px;border-radius:6px;border:1px solid var(--vl-line);background:var(--vl-bg);color:var(--vl-ink);cursor:pointer;text-decoration:none;display:inline-block}' +
      '.vlog .vl-btn.p{background:var(--vl-acc);border-color:var(--vl-acc);color:var(--vl-acc-ink)}.vlog .vl-btn:disabled{opacity:.45;cursor:not-allowed}.vlog .vl-lk{font:13px system-ui,sans-serif;color:var(--vl-acc);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline}' +
      '.vlog .vl-f{padding:10px 18px;border-top:1px solid var(--vl-line);font-size:12px;color:var(--vl-mute);display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.vlog .vl-s{font-size:12.5px;color:var(--vl-mute)}.vlog .vl-sp{flex:1}';
    document.head.appendChild(st);
  }
  const logoSrc = () => { try { if (typeof Logo !== 'undefined' && Logo.src) { const s = Logo.src(); if (s) return s; } } catch (x) { } return lg('vac.logo') || 'Logo.png'; };
  const nomePagina = () => { try { const me = (typeof systems === 'function' ? systems() : []).find(s => s.id === PAGE.id); return (me && (typeof vacNomeSis === 'function' ? vacNomeSis(me) : me.nome)) || PAGE.tituloCurto || ''; } catch (x) { return ''; } };
  const pinHtml = id => '<div class="vl-pin" id="' + id + '">' + [0, 1, 2, 3, 4, 5].map(i => '<input inputmode="numeric" autocomplete="off" maxlength="1" aria-label="Dígito ' + (i + 1) + '">').join('') + '</div>';
  const pin = id => [...el.querySelectorAll('#' + id + ' input')].map(i => i.value).join('');
  function ligaPin(id, fim) {
    const L = [...el.querySelectorAll('#' + id + ' input')];
    L.forEach((i, k) => {
      i.addEventListener('input', () => { const d = i.value.replace(/\D/g, ''); if (d.length > 1) { d.slice(0, 6 - k).split('').forEach((c, j) => { L[k + j].value = c; }); (L[Math.min(5, k + d.length)]).focus(); } else { i.value = d; if (d && L[k + 1]) L[k + 1].focus(); } if (pin(id).length === 6 && fim) fim(); });
      i.addEventListener('keydown', ev => { if (ev.key === 'Backspace' && !i.value && L[k - 1]) { L[k - 1].focus(); L[k - 1].value = ''; } if (ev.key === 'Enter' && fim) fim(); });
    });
    return L;
  }
  const limpaPin = id => { const L = [...el.querySelectorAll('#' + id + ' input')]; L.forEach(i => i.value = ''); if (L[0]) L[0].focus(); };
  const quem = u => { const p = perfilDe(u), f = funcao(u); return '<div class="vl-who"><div class="vl-av" aria-hidden="true">' + e(String(u.nome || '?').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()) + '</div><div><b>' + e(u.nome) + '</b><span>' + e([f, p ? 'perfil ' + (p.nome || p.codigo) : u.perfil ? 'perfil ' + u.perfil : ''].filter(Boolean).join(' · ')) + '</span></div></div>'; };
  const msg = (t, c) => { const m = el && el.querySelector('#vlMsg'); if (m) { m.className = 'vl-msg ' + (c || ''); m.textContent = t; } };
  function corpo(h) { el.querySelector('.vl-b').innerHTML = h; }
  function fechar() { if (!el) return; el.remove(); el = null; for (const n of inertes) n.inert = false; inertes = []; }
  function abrir(op) {
    modo = op || {}; if (el) fechar(); css();
    el = document.createElement('div'); el.className = 'vlog'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'vlT');
    el.innerHTML = '<div class="vl-d"><div class="vl-h"><div class="vl-t" id="vlT">Sistema de gestão Vacutainer<small>' + e(nomePagina()) + ' · Linha Vacutainer</small></div><img class="vl-logo" alt="Logo" src="' + e(logoSrc()) + '"></div><div class="vl-b"></div>' +
      '<div class="vl-f"><span id="vlSes">Sessão até o fim do turno neste computador</span><span>' + e(typeof PAGE !== 'undefined' ? (nomePagina() + ' ' + (PAGE.versao || '')) : '') + '</span></div></div>';
    const im = el.querySelector('.vl-logo'); im.onerror = () => { im.hidden = true; };
    for (const n of document.body.children) if (!n.inert) { n.inert = true; inertes.push(n); }
    document.body.appendChild(el);
    if (modo.trocar && sessao()) passoConta(); else passoId();
  }
  function semCadastro() {
    const h = hook(); el.dataset.passo = 'semcad';
    corpo('<p>Este computador ainda não tem o cadastro de usuários. ' + (h ? 'Conecte a pasta da rede da linha para conferir o seu ID.' : 'Abra o Portal pela pasta da rede uma vez para trazer o cadastro.') + '</p><div class="vl-msg" id="vlMsg"></div><div class="vl-a">' +
      (h && h.conectar ? '<button type="button" class="vl-btn p" id="vlCon">Conectar pasta</button>' : '<a class="vl-btn p" href="' + e(portalHref('entrar=' + (typeof PAGE !== 'undefined' ? PAGE.id : ''))) + '">Abrir o Portal</a>') +
      '<span class="vl-sp"></span><button type="button" class="vl-lk" id="vlDemo">Ver a demonstração</button></div>');
    const c = el.querySelector('#vlCon'); if (c) c.onclick = async () => { try { await h.conectar(); } catch (x) { msg(String(x.message || x), 'e'); } if (cad()) passoId(); };
    el.querySelector('#vlDemo').onclick = () => { try { vacDemo.entrar(); } catch (x) { } };
  }
  function passoId(aviso) {
    if (!cad()) return semCadastro();
    el.dataset.passo = 'id'; const id0 = modo.trocar ? '' : lg('vac.userId') || '';
    corpo('<label class="vl-l" for="vlId">ID / matrícula<input class="vl-i" id="vlId" autocomplete="off" value="' + e(id0) + '" placeholder="ex.: 104233"></label><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn p" id="vlOk">Continuar</button>' + (modo.trocar && sessao() ? '<button type="button" class="vl-btn" id="vlX">Cancelar</button>' : '') + '<span class="vl-sp"></span><button type="button" class="vl-lk" id="vlDemo">Ver a demonstração</button></div>');
    if (aviso) msg(aviso[0], aviso[1]);
    const i = el.querySelector('#vlId'); i.focus(); i.select();
    const ir = () => { const v = i.value.trim(); if (!v) return msg('Digite o seu ID.', 'e'); if (/[\/#]/.test(v) || v.length > 30) return msg('ID inválido.', 'e'); const u = usuario(v);
      if (u && u.ativo === false) return msg('Este ID está inativo no cadastro. Fale com o administrador.', 'e');
      if (!u) return naoCadastrado(v);
      if (!u.senha || !u.senha.hash) return criarSenha(u, false);
      passoSenha(u); };
    i.onkeydown = ev => { if (ev.key === 'Enter') ir(); }; el.querySelector('#vlOk').onclick = ir;
    const x = el.querySelector('#vlX'); if (x) x.onclick = fechar;
    el.querySelector('#vlDemo').onclick = () => { try { vacDemo.entrar(); } catch (z) { } };
  }
  function irPortal(txt, h) { corpo('<p>' + txt + '</p><div class="vl-a"><a class="vl-btn p" href="' + e(portalHref(h)) + '">Ir para o Portal</a><button type="button" class="vl-lk" id="vlVolta">Voltar</button></div>'); el.querySelector('#vlVolta').onclick = () => passoId(); }
  function naoCadastrado(id) {
    const h = hook();
    if (!h) return irPortal('O ID <b>' + e(id) + '</b> não está no cadastro. O primeiro acesso (nome, ID e senha) é feito no Portal.', 'entrar=' + (typeof PAGE !== 'undefined' ? PAGE.id : ''));
    const T = h.turnos ? h.turnos() : [];
    corpo('<p><b>Primeiro acesso.</b> O ID <b>' + e(id) + '</b> ainda não está cadastrado. Informe seus dados e crie a senha; você entra com o perfil <b>Consulta</b> e o administrador ajusta depois.</p>' +
      '<label class="vl-l">Nome completo<input class="vl-i vl-n" id="vlNome" autocomplete="name"></label>' +
      (T.length ? '<label class="vl-l">Turno<select class="vl-i vl-n" id="vlTurno"><option value="">–</option>' + T.map(t => '<option value="' + e(t.codigo) + '">' + e(t.codigo + ' · ' + (t.nome || '')) + '</option>').join('') + '</select></label>' : '') +
      '<label class="vl-l">Especialidade ou área (opcional)<input class="vl-i vl-n" id="vlEsp" placeholder="ex.: mecânica, qualidade"></label>' +
      '<div class="vl-l">Crie a senha (6 números)' + pinHtml('vlP1') + '</div><div class="vl-l">Repita a senha' + pinHtml('vlP2') + '</div><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn p" id="vlOk">Cadastrar e entrar</button><button type="button" class="vl-lk" id="vlVolta">Voltar</button></div>');
    ligaPin('vlP1', null); ligaPin('vlP2', null); el.querySelector('#vlNome').focus();
    el.querySelector('#vlVolta').onclick = () => passoId();
    el.querySelector('#vlOk').onclick = async () => {
      const nome = el.querySelector('#vlNome').value.trim().replace(/\s+/g, ' '), a = pin('vlP1'), b = pin('vlP2');
      if (nome.length < 3) return msg('Informe o seu nome.', 'e');
      const er = conferirNova(a, b); if (er) return msg(er, 'e');
      const ok = el.querySelector('#vlOk'); ok.disabled = true;
      try { const s = await gerar(a, false, nome), tu = el.querySelector('#vlTurno'), u = { codigo: id, nome, perfil: 'CONSULTA', turno: tu && tu.value || null, especialidade: el.querySelector('#vlEsp').value.trim() || null };
        abrirSessao(u); await h.autocadastro(u, s); entrou(usuario(id) || u, 'Cadastro feito.', null); }
      catch (x) { ok.disabled = false; msg('Não consegui cadastrar: ' + (x.message || x), 'e'); }
    };
  }
  function conferirNova(a, b) { if (a.length < 6) return 'A senha tem 6 números.'; if (fraca(a)) return 'Evite números repetidos ou em sequência (111111, 123456).'; if (a !== b) return 'As duas senhas não são iguais.'; return ''; }
  function criarSenha(u, provisoria) {
    const h = hook();
    if (!h) return irPortal(provisoria ? 'Você entrou com uma senha provisória. Crie a sua senha definitiva no Portal.' : '<b>' + e(u.nome) + '</b>, a sua senha ainda não foi criada. Crie a senha de 6 números no Portal (uma vez só).', 'entrar=' + (typeof PAGE !== 'undefined' ? PAGE.id : ''));
    corpo(quem(u) + '<p>' + (provisoria ? 'Você entrou com a senha provisória. Crie agora a sua senha.' : 'Primeiro acesso: crie a sua senha de 6 números.') + '</p><div class="vl-l">Nova senha' + pinHtml('vlP1') + '</div><div class="vl-l">Repita a senha' + pinHtml('vlP2') + '</div><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn p" id="vlOk">Criar senha e entrar</button><button type="button" class="vl-lk" id="vlVolta">Não sou eu</button></div>');
    const L1 = ligaPin('vlP1', () => { const L2 = el.querySelectorAll('#vlP2 input'); if (L2[0]) L2[0].focus(); }); ligaPin('vlP2', null); L1[0].focus();
    el.querySelector('#vlVolta').onclick = () => passoId();
    el.querySelector('#vlOk').onclick = async () => {
      const a = pin('vlP1'), er = conferirNova(a, pin('vlP2')); if (er) return msg(er, 'e');
      const ok = el.querySelector('#vlOk'); ok.disabled = true;
      try { const s = await gerar(a, false, u.nome); const ult = abrirSessao(u); await h.criarSenha(u, s, provisoria ? 'troca da senha provisória' : '1º acesso: senha criada pela pessoa'); entrou(usuario(u.codigo) || u, 'Senha criada.', ult); }
      catch (x) { ok.disabled = false; msg('Não consegui gravar a senha: ' + (x.message || x), 'e'); }
    };
  }
  function passoSenha(u) {
    corpo(quem(u) + '<div class="vl-l">Senha (6 números)' + pinHtml('vlP1') + '</div><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn p" id="vlOk">Entrar</button><button type="button" class="vl-lk" id="vlVolta">Não sou eu</button><span class="vl-sp"></span><button type="button" class="vl-lk" id="vlEsq">Esqueci a senha</button></div>');
    const ok = el.querySelector('#vlOk'), trava = () => { const b = bloqueio(u.codigo); if (!b) return false; msg(MAX_ERR + ' senhas erradas. Este ID está bloqueado neste computador até ' + new Date(b).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.', 'e'); ok.disabled = true; el.querySelectorAll('#vlP1 input').forEach(i => i.disabled = true); return true; };
    let indo = false;
    const ir = async () => {
      if (indo || trava()) return; const p = pin('vlP1'); if (p.length < 6) return msg('A senha tem 6 números.', 'e');
      indo = true; ok.disabled = true; msg('Conferindo…', '');
      const certo = await confere(u, p); indo = false; ok.disabled = false;
      if (!certo) { const x = errou(u.codigo); limpaPin('vlP1'); if (!trava()) msg('Senha errada. ' + (MAX_ERR - x.n) + ' tentativa(s) antes de bloquear por 5 minutos neste computador.', 'e'); return; }
      if (u.senha.provisoria) return criarSenha(u, true);
      const ult = abrirSessao(u); entrou(u, '', ult);
    };
    ligaPin('vlP1', ir)[0].focus(); ok.onclick = ir; trava();
    el.querySelector('#vlVolta').onclick = () => passoId();
    el.querySelector('#vlEsq').onclick = () => msg('Peça ao administrador uma senha provisória no Portal › Cadastros › Usuários.', 'w');
  }
  function entrou(u, txt, ult) {
    const s = sessao(); fechar();
    try { const t = (txt ? txt + ' ' : '') + 'Bem-vindo, ' + String(u.nome).split(' ')[0] + '.' + (ult ? ' Último acesso neste computador: ' + brh(ult) + '.' : '') + (s ? ' Sessão até ' + new Date(s.ate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.' : '');
      if (typeof toast === 'function') toast(t); } catch (x) { }
    try { if (modo.volta) { const v = (typeof systems === 'function' ? systems() : []).find(x => x.id === modo.volta); if (v && v.id !== 'portal' && typeof sysHref === 'function') location.assign(sysHref(v)); } } catch (x) { }
  }
  function passoConta() {
    const u = usuario(lg('vac.userId')) || { nome: lg('vac.user') || '', codigo: lg('vac.userId') || '' }, s = sessao(), h = hook();
    corpo(quem(u) + '<p class="vl-s">Sessão até ' + e(s ? new Date(s.ate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—') + ' neste computador.</p><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn" id="vlTroca">Trocar usuário</button>' + (h ? '<button type="button" class="vl-btn" id="vlSenha">Trocar minha senha</button>' : '<a class="vl-btn" href="' + e(portalHref('entrar=' + (typeof PAGE !== 'undefined' ? PAGE.id : ''))) + '">Trocar minha senha (Portal)</a>') +
      '<button type="button" class="vl-btn" id="vlLay" title="Apaga as suas escolhas de layout (cartões, grupos recolhidos, itens do e-mail…) e volta ao padrão do seu perfil">Restaurar meu layout</button><button type="button" class="vl-btn" id="vlSair">Sair</button><span class="vl-sp"></span><button type="button" class="vl-btn p" id="vlX">Fechar</button></div>');
    el.querySelector('#vlTroca').onclick = () => { modo.trocar = true; passoId(); };
    el.querySelector('#vlSair').onclick = sair; el.querySelector('#vlX').onclick = fechar;
    { const r = el.querySelector('#vlLay'); if (r) r.onclick = () => { if (confirm('Voltar ao layout padrão do seu perfil? As suas escolhas de cartões, grupos e itens do e-mail serão apagadas (em todos os computadores).') && typeof vacPrefs !== 'undefined') vacPrefs.restaurar(); }; }
    const b = el.querySelector('#vlSenha'); if (b) b.onclick = () => trocarSenha(u);
  }
  function trocarSenha(u) {
    const h = hook(); if (!h) return;
    corpo(quem(u) + '<div class="vl-l">Senha atual' + pinHtml('vlP0') + '</div><div class="vl-l">Nova senha' + pinHtml('vlP1') + '</div><div class="vl-l">Repita a nova senha' + pinHtml('vlP2') + '</div><div class="vl-msg" id="vlMsg"></div>' +
      '<div class="vl-a"><button type="button" class="vl-btn p" id="vlOk">Trocar senha</button><button type="button" class="vl-lk" id="vlVolta">Voltar</button></div>');
    ligaPin('vlP0', null)[0].focus(); ligaPin('vlP1', null); ligaPin('vlP2', null);
    el.querySelector('#vlVolta').onclick = passoConta;
    el.querySelector('#vlOk').onclick = async () => {
      if (u.senha && u.senha.hash) { if (bloqueio(u.codigo)) return msg('Bloqueado por senhas erradas. Tente em alguns minutos.', 'e'); if (!(await confere(u, pin('vlP0')))) { errou(u.codigo); limpaPin('vlP0'); return msg('A senha atual não confere.', 'e'); } }
      const a = pin('vlP1'), er = conferirNova(a, pin('vlP2')); if (er) return msg(er, 'e');
      try { await h.criarSenha(u, await gerar(a, false, u.nome), 'senha trocada pela pessoa'); msg('Senha trocada.', 'o'); setTimeout(passoConta, 900); } catch (x) { msg('Não consegui gravar: ' + (x.message || x), 'e'); }
    };
  }
  /* ---- ciclo: abre quando falta sessão; fecha sozinho se outra aba entrou ---- */
  function checar() {
    if (el) { if (dispensado() || (sessao() && !modo.trocar)) fechar(); else if (el.dataset.passo === 'semcad' && cad()) passoId(); return; }
    if (!dispensado() && !sessao()) abrir();
  }
  function iniciar() { setTimeout(checar, 400); setInterval(checar, 20000); window.addEventListener('storage', ev => { if (['vac.sessao', 'vac.userId', 'vac.cadastros'].includes(ev.key)) setTimeout(checar, 50); }); window.addEventListener('hashchange', () => setTimeout(checar, 50)); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  return { abrir, fechar, sair, sessao, gerar, confere, fraca, provisoriaNova, fimSessao, dispensado, checar, get aberto() { return !!el; } };
})();
/* o "Entrar" antigo do cabeçalho abre o login (trocar usuário, trocar senha, sair) */
try { if (typeof VacEntrar !== 'undefined') VacEntrar.abrir = () => vacLogin.abrir({ trocar: true }); } catch (e) { }

/* ----- kit v2.1 · vacLayout: padrão da Visão Geral (11/11/2026; igual em todas as páginas; não editar só numa) -----
   Peças comuns para montar a tela inicial de cada página na mesma ordem de leitura da Produção (2.4.49):
   sec(n, título, subtítulo) · grupo(chave, nome, pergunta, conteúdo) · estado(classe, texto) · ligar(raiz, página).
   Os estilos estão no kit_visual.css (vk-*). Grupos recolhidos ficam em localStorage vac.grupos.<página> ({chave: 1}); na impressão saem abertos.
   Só apresentação: a página continua calculando os próprios números. */
const vacLayout = (() => {
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = p => { try { const x = JSON.parse(localStorage.getItem('vac.grupos.' + p) || '{}'); return x && typeof x === 'object' ? x : {}; } catch (x) { return {}; } };
  const G = (p, f) => { try { localStorage.setItem('vac.grupos.' + p, JSON.stringify(f)); } catch (x) { } };
  const sec = (n, t, s) => `<div class="vk-sec"><b>${e(n)}</b><h3>${e(t)}</h3>${s ? `<span>${e(s)}</span>` : ''}</div>`;
  const estado = (c, t) => `<span class="vk-st ${e(c)}">${e(t)}</span>`;
  /* html do grupo; o corpo é colocado pela página (string) ou depois, movendo nós para .vk-gb */
  const grupo = (p, k, nome, q, corpo, n) => { const fe = !!F(p)[k], id = 'vkg-' + p + '-' + k;
    return `<section class="vk-grp${fe ? ' fechado' : ''}" data-vk-grupo="${e(k)}"><button type="button" class="vk-gh" aria-expanded="${!fe}" aria-controls="${id}"><span class="seta" aria-hidden="true">${fe ? '▸' : '▾'}</span><span><span class="t">${e(k)} · ${e(nome)}</span><br><span class="q">${e(q || '')}</span></span>${n != null ? `<span class="n">${e(n)}</span>` : ''}</button><div class="vk-gb" id="${id}">${corpo || ''}</div></section>`; };
  function ligar(root, p) {
    (root || document).querySelectorAll('.vk-grp').forEach(g => { const b = g.querySelector(':scope > .vk-gh'); if (!b || b._vk) return; b._vk = 1;
      b.addEventListener('click', () => { const k = g.dataset.vkGrupo, f = F(p), fe = !g.classList.contains('fechado'); g.classList.toggle('fechado', fe); b.setAttribute('aria-expanded', !fe);
        const s = b.querySelector('.seta'); if (s) s.textContent = fe ? '▸' : '▾'; if (fe) f[k] = 1; else delete f[k]; G(p, f); window.dispatchEvent(new CustomEvent('vac:grupo', { detail: { pagina: p, grupo: k, aberto: !fe } })); }); });
  }
  const fechado = (p, k) => !!F(p)[k];
  return { sec, estado, grupo, ligar, fechado };
})();
/* "Mais filtros" no celular: botão .vk-mais dentro de .filters abre e fecha os campos .vk-opt (vacLayout, 11/11/2026) */
document.addEventListener('click', ev => { const b = ev.target.closest('.vk-mais'); if (!b) return; const f = b.closest('.filters'); if (!f) return; const o = f.classList.toggle('vk-aberto'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Menos filtros ▴' : 'Mais filtros ▾'; });
/* D6 (13/11/2026) · permissão por ação na tela, num ponto só do kit. Cada página diz aqui quais botões exigem cada função do perfil
   (Portal › Administração › Perfis: lancar, fechar, importar, excluir, configurar). O que o perfil não pode fica desligado, com o motivo
   no título; o clique também é barrado. Sem usuário identificado, ou perfil sem permissões gravadas, nada muda (vacPode devolve true).
   Identifica, não é cofre (registro 5.4/A07): a proteção real é a permissão da pasta. A Linha 360° segue o módulo Equipamentos. */
const VAC_PODE_MOD = { linha: 'equip' };
const VAC_PODE_TXT = { lancar: 'lançar ou editar', fechar: 'fechar ou reabrir', importar: 'importar', excluir: 'excluir', configurar: 'configurar' };
const VAC_PODE_MAPA = {
  oee: {
    lancar: '#mkDay,#eOk,#eDel,#eClr,#abOk,#abSave,#abDel,#hhExtra,#hhPause,#iSave,#iDel,#dOff,#offDay,#dfOk,#otOk,#pdOff,#pdStart,#opStartProd,#gAdd,#gOk,#dGo,#dMove,#mvOk,#dRestore,#nOk,#rpNoteSave,#ordFill,#plNew,#pdExtra,#pdNorm,#pPasteGo,#aOk',
    fechar: '#dClose,#dReopen,#dPend,#clsOk,#enOk,[data-closeps]',
    importar: '#imMeta,#imPar,#imPlan,#imRel,#imSrv,#ltImp,#mGo,#bImport,#rMap',
    excluir: '#dDel,#hdDel,#hdMv,#dmDel',
    configurar: '#cNew,#dcNew,#brAdd,#pSave,#omSave,#lgDel,#pnSaveAs,#pnDel'
  },
  perdas: {
    lancar: '#acSave,#cmSave',
    importar: '#btnInterp,#btnDoImp,#entGo,#impProx',
    configurar: '#btnSaveCfg,#btnSaveTipos,#btnSaveAlias,#btnResetAlias,#btnSaveCausas,#logoDel,[data-bkr]'
  },
  paradas: {
    lancar: '#evNovo,#aplSug,#acNova,#pAcao,[data-ac]',
    importar: '#impF,#impSalva,[data-undo]',
    configurar: '#cfWipe,#mtzReset,[data-br]'
  },
  gel: {
    lancar: '[data-baixa],[data-hmeas],[data-obs],[data-linedit],[data-unline],[data-online],[data-audit]',
    importar: '[data-act="import"],[data-act="fsNewImport"]',
    excluir: '[data-hmdel]',
    configurar: '[data-bkrs]'
  },
  equip: {
    lancar: '#btNovaOS,#eqOS,#osNova,#eqAn,#apAdd,[data-an2os],[data-st],[data-ed]',
    configurar: '#eqTag,#tagNova,#padNovo,[data-tagv],[data-des]'
  },
  inic: {
    lancar: '#btNova,#kNovo,#osmNova,#pgNova,#s5Nova,#ckAdd,#coAdd,#evAdd,[data-st],[data-tr],[data-pz],[data-ed],[data-ked],[data-kac]',
    importar: '[data-importar],#iaPrev,#mwTrazer',
    configurar: '[data-novoprog]'
  }
};
VAC_PODE_MAPA.linha = VAC_PODE_MAPA.equip;
function vacPodeAqui(fn) { if (typeof vacPode !== 'function' || typeof PAGE === 'undefined' || !PAGE) return true; try { return vacPode(VAC_PODE_MOD[PAGE.id] || PAGE.id, fn); } catch (e) { return true; } }
const vacTravas = (() => {
  let agendado = 0;
  const motivo = fn => { let p = null; try { p = typeof vacPerfil === 'function' ? vacPerfil() : null; } catch (e) { } return `Seu perfil${p && p.nome ? ' (' + p.nome + ')' : ''} não permite ${VAC_PODE_TXT[fn] || fn} nesta página. Quem muda o perfil é o administrador, no Portal.`; };
  function aplicar() {
    agendado = 0; if (typeof PAGE === 'undefined' || !PAGE) return; const M = VAC_PODE_MAPA[PAGE.id]; if (!M) return;
    for (const [fn, sel] of Object.entries(M)) {
      const pode = vacPodeAqui(fn);
      let L = []; try { L = document.querySelectorAll(sel); } catch (e) { continue; }
      L.forEach(el => {
        if (!pode) { if (el.dataset.vacTrava) return; el.dataset.vacTrava = fn; el.dataset.vacTravaTit = el.getAttribute('title') || ''; el.dataset.vacTravaDis = el.disabled ? '1' : ''; el.disabled = true; el.setAttribute('aria-disabled', 'true'); el.title = motivo(fn); el.classList.add('vac-trava'); }
        else if (el.dataset.vacTrava === fn) { el.disabled = el.dataset.vacTravaDis === '1'; el.removeAttribute('aria-disabled'); if (el.dataset.vacTravaTit) el.title = el.dataset.vacTravaTit; else el.removeAttribute('title'); delete el.dataset.vacTrava; delete el.dataset.vacTravaTit; delete el.dataset.vacTravaDis; el.classList.remove('vac-trava'); }
      });
    }
  }
  const agendar = () => { if (!agendado) agendado = setTimeout(aplicar, 0); };
  if (typeof document !== 'undefined') {
    const ligar = () => { aplicar(); try { new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true }); } catch (e) { } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
    // clique barrado também em elemento que não é botão (link, div) e em cliques já em fila
    document.addEventListener('click', ev => { const t = ev.target && ev.target.closest && ev.target.closest('.vac-trava'); if (!t) return; ev.preventDefault(); ev.stopImmediatePropagation(); }, true);
    addEventListener('storage', ev => { if (!ev.key || /^vac\.(userId|cadastros|sessao)/.test(ev.key)) agendar(); });
  }
  return { aplicar, agendar, motivo };
})();
/* Fase 5 (13/11/2026) · preferências da pessoa (layout), decisão do usuário: um arquivo por pessoa, 00. Bases/Preferencias/<ID>.json, gravado
   pelo kit em qualquer página (só a própria pessoa grava o dela; não é base de nenhuma página, então a regra 1 continua valendo).
   Vai no arquivo: largura e ordem dos cartões (vac.grade.*), grupos recolhidos (vac.grupos.*), modo da ficha, tema, as escolhas dos Paretos
   e o que cada página registrar (Produção: Editar cards, blocos recolhidos, itens do e-mail, Meu painel…). Fica no computador: TV e unidade.
   Cada chave leva a hora da mudança; o mais novo vence (a mesma pessoa em dois computadores). Sem pasta, sem usuário, em teste ou na
   demonstração: nada é lido nem gravado (como antes). Padrão do perfil: perfis[].layout no cadastro (o Portal copia de um usuário);
   vale para o que a pessoa nunca mudou. "Restaurar meu layout" (menu da pessoa) apaga as escolhas dela e volta ao padrão do perfil. */
const vacPrefs = (() => {
  const DIR = 'Preferencias', SOLTAS = ['vac.ficha.modo', 'vac.theme', 'vac.waste.pareto', 'vac.waste.paretov', 'vac.paradas.p80'];
  const CHAVE = k => typeof k === 'string' && (/^vac\.(grade|grupos)\./.test(k) || SOLTAS.includes(k));
  const fontes = {}; let tmr = 0, quieto = 0, ultimo = null;
  const L = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { quieto++; try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } finally { quieto--; } } };
  const uid = () => L.get('vac.userId') || '';
  const ativo = () => !!uid() && !(typeof vacDemo !== 'undefined' && vacDemo.ativo) && !(typeof navigator !== 'undefined' && navigator.webdriver && L.get('vac.prefs.forcar') !== '1');
  const pasta = () => { let d = null; try { d = typeof vacPastaAtual === 'function' ? vacPastaAtual() : null; } catch (e) { } return d && d.__vacRaiz ? d.raiz : d; };
  const arq = id => String(id).replace(/[^A-Za-z0-9._-]/g, '_') + '.json';
  const meta = () => { try { return JSON.parse(L.get('vac.prefs.meta.' + uid()) || '{}') || {}; } catch (e) { return {}; } };
  const metaSet = m => L.set('vac.prefs.meta.' + uid(), JSON.stringify(m));
  async function dir(criar) { const d = pasta(); if (!d) return null; try { const b = await d.getDirectoryHandle(VAC_BASES_DIR, { create: !!criar }); return await b.getDirectoryHandle(DIR, { create: !!criar }); } catch (e) { if (!criar && vacNaoAchou(e)) return null; throw e; } }
  async function ler(id) { const d = await dir(false); if (!d) return null; try { const f = await (await d.getFileHandle(arq(id || uid()))).getFile(); const o = JSON.parse(await f.text()); return o && o.schema === 'vac-preferencias' ? o : null; } catch (e) { if (vacNaoAchou(e)) return null; throw e; } }
  async function gravar(o) { const d = await dir(true), tmp = arq(uid()) + '.tmp'; const w = await (await d.getFileHandle(tmp, { create: true })).createWritable(); await w.write(JSON.stringify(o, null, 1)); await w.close();
    try { const fh = await d.getFileHandle(tmp); if (fh.move) { await fh.move(arq(uid())); return; } } catch (e) { }
    const w2 = await (await d.getFileHandle(arq(uid()), { create: true })).createWritable(); await w2.write(JSON.stringify(o, null, 1)); await w2.close(); try { await d.removeEntry(tmp); } catch (e) { } }
  /* valores atuais deste computador: chaves soltas do localStorage + o que cada página registrou ('pagina:<id>') */
  function atuais() { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (CHAVE(k)) o[k] = localStorage.getItem(k); } } catch (e) { }
    for (const [p, f] of Object.entries(fontes)) { try { const v = f.ler(); o['pagina:' + p] = v == null ? null : JSON.stringify(v); } catch (e) { } } return o; }
  function aplicarLocal(k, v) { if (k.startsWith('pagina:')) { const f = fontes[k.slice(7)]; if (f) { try { f.aplicar(v == null ? null : JSON.parse(v)); } catch (e) { console.warn('vacPrefs', k, e); } } } else L.set(k, v); }
  const perfilLay = () => { try { const p = typeof vacPerfil === 'function' ? vacPerfil() : null; return (p && p.layout && p.layout.chaves) || {}; } catch (e) { return {}; } };
  /* marca as mudanças locais desde a última vez (hora de cada chave) */
  function marcar() { const m = meta(), a = atuais(); if (!m.__snap) { m.__snap = a; metaSet(m); return 0; }   /* 1ª vez neste computador: o que já está aqui não ganha do arquivo */
    const ant = m.__snap; const t = new Date().toISOString(); let n = 0;
    for (const k of new Set([...Object.keys(a), ...Object.keys(ant)])) if ((a[k] ?? null) !== (ant[k] ?? null)) { m[k] = t; n++; }
    m.__snap = a; metaSet(m); return n; }
  async function sincronizar(op = {}) {
    if (!ativo() || !pasta()) return { feito: false };
    marcar(); const m = meta(), a = atuais(); let F = null;
    try { F = await ler(); } catch (e) { console.warn('vacPrefs: leitura', e); return { feito: false, erro: String(e.message || e) }; }
    const ch = Object.assign({}, (F && F.chaves) || {}); let aplicou = 0, novas = 0;
    for (const [k, x] of Object.entries(ch)) { const em = m[k] || ''; if (x && x.em > em && (a[k] ?? null) !== (x.v ?? null)) { aplicarLocal(k, x.v ?? null); m[k] = x.em; aplicou++; } }
    for (const k of Object.keys(m)) { if (k === '__snap') continue; const x = ch[k]; if (!x || m[k] > x.em) { ch[k] = { v: a[k] ?? null, em: m[k] }; novas++; } }
    // padrão do perfil para o que a pessoa nunca mudou (não vai para o arquivo dela)
    for (const [k, v] of Object.entries(perfilLay())) if (!ch[k] && !m[k] && (a[k] ?? null) !== (v ?? null)) { aplicarLocal(k, v); aplicou++; }
    m.__snap = atuais(); metaSet(m);
    if (novas) { try { await gravar({ schema: 'vac-preferencias', schemaVersion: 1, usuario: uid(), atualizadoEm: new Date().toISOString(), por: (typeof PAGE !== 'undefined' && PAGE.id) || '', chaves: ch }); } catch (e) { console.warn('vacPrefs: gravação', e); return { feito: false, erro: String(e.message || e), aplicou }; } }
    ultimo = { em: new Date().toISOString(), aplicou, gravou: novas };
    if (aplicou && !op.semRecarregar) { const f = 'vac.prefs.recarregou.' + uid(); let ja = null; try { ja = sessionStorage.getItem(f); } catch (e) { } if (!ja) { try { sessionStorage.setItem(f, '1'); } catch (e) { } location.reload(); } }
    return { feito: true, aplicou, gravou: novas };
  }
  const mudou = () => { if (quieto || !ativo()) return; clearTimeout(tmr); tmr = setTimeout(() => sincronizar({ semRecarregar: true }), 2500); };
  /* página registra o que é dela: ler() → objeto; aplicar(objeto|null) (null = padrão de fábrica) */
  function registrar(pagina, f) { fontes[pagina] = f; }
  async function restaurar() { if (!uid()) return; const m = meta(), a = atuais(), t = new Date().toISOString();
    for (const k of Object.keys(a)) { if (k === 'vac.theme') continue; aplicarLocal(k, null); m[k] = t; }
    m.__snap = atuais(); metaSet(m); for (const [k, v] of Object.entries(perfilLay())) aplicarLocal(k, v);
    if (pasta()) { try { const F = (await ler()) || { chaves: {} }, ch = F.chaves || {}; for (const k of Object.keys(a)) if (k !== 'vac.theme') ch[k] = { v: null, em: t };
      await gravar({ schema: 'vac-preferencias', schemaVersion: 1, usuario: uid(), atualizadoEm: t, por: (typeof PAGE !== 'undefined' && PAGE.id) || '', chaves: ch }); } catch (e) { console.warn('vacPrefs: restaurar', e); } }
    m.__snap = atuais(); metaSet(m); location.reload(); }
  if (typeof Storage !== 'undefined') { const S = Storage.prototype, si = S.setItem, ri = S.removeItem;
    S.setItem = function (k, v) { const r = si.apply(this, arguments); if (this === window.localStorage && CHAVE(k)) mudou(); return r; };
    S.removeItem = function (k) { const r = ri.apply(this, arguments); if (this === window.localStorage && CHAVE(k)) mudou(); return r; }; }
  /* espera a página conectar a pasta (até 1 min) e sincroniza uma vez; depois, a cada mudança e ao voltar para a aba */
  if (typeof document !== 'undefined') { let n = 0; const t = setInterval(() => { n++; if (pasta() && ativo()) { clearInterval(t); sincronizar(); } else if (n > 30) clearInterval(t); }, 2000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar({ semRecarregar: true }); }); }
  return { sincronizar, mudou, registrar, restaurar, ler, CHAVE, get ultimo() { return ultimo; }, _fontes: fontes };
})();
