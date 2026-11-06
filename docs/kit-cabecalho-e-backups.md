# Kit · cabeçalho comum (vac-cabecalho v1) e backups por módulo

02/11/2026 · referência pronta no **Portal 1.3** (decidido: opção 2 "barra do sistema + cabeçalho da página", bloco copiado em cada HTML). Vale para OEE, Gestão de Gel, Perdas e as próximas páginas. Complementa "Portal e padrão comum" e "Cadastro base · contrato".

**Como usar:** no chat de cada página, anexe o HTML atual e peça: *"Aplique o kit `claude/kit-cabecalho-e-backups.md` nesta página (seções 1 a 6, parte da página na seção 7). Mudanças pontuais, sem reescrever o que funciona; apresente a arquitetura antes."*

**Pronto quando**, no Portal › Configuração › Versões das páginas, a linha da página mostrar: **Cabeçalho v1**, versão identificada, **Último backup em `00. Backups/<Módulo>/`**, e nenhum aviso de "local antigo".

## 1. O que muda na tela

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ [logo] SISTEMAS · LINHA VACUTAINER   PORTAL  OEE  GEL  PERDAS  CADASTROS   [Buscar… Ctrl K]  Usuário  ◐ │  ← faixa escura, igual em todas, fixa no topo
├───────────────────────────────────────────────────────────────────────────────────┤
│ OEE  PRODUÇÃO E OEE  v2.5   ● Base na pasta · rev 41  Cadastro rev 7  …        ↻ Sincronizar ⛁ Backup ▣ TV │  ← faixa branca da página
│ OPERAÇÃO  VISÃO GERAL  LANÇAMENTO …   ANÁLISE …   GESTÃO …                                          │  ← abas da página
└───────────────────────────────────────────────────────────────────────────────────┘
```

- **Faixa escura** (igual em todas, não muda de página para página): logo (`Logo.png`), "Sistemas · Linha Vacutainer" (vai para o Portal), páginas como abas na ordem **Portal · OEE · Gel · Perdas · Cadastros** (a atual destacada; links na **mesma aba do navegador**, para parecer um sistema só), **busca Ctrl K**, usuário (`vac.user`) e tema (`vac.theme`). Fica fixa ao rolar.
- **Faixa branca da página**: título curto em caixa alta, subtítulo, **versão** (clicável: abre `Portal.html#versoes`), pílulas de status da página (base na pasta/rev, gravação pendente, cadastro rev N, modo de teste…) e os botões **Sincronizar · Backup · TV**.
- **Abas da página**: as mesmas de hoje, com os grupos (ex.: Operação · Análise · Planejamento · Gestão), no estilo comum.
- **Busca Ctrl K**: uma janela só, igual em todas. Mostra primeiro os itens da página (`PAGE.busca(q)`), depois "Ir para" (outras páginas, Cadastros, Versões) e as abas da página. ↑ ↓ Enter Esc. Substitui a busca própria que a página tiver no topo.
- Tema escuro: a faixa escura fica mais escura; o resto segue os tokens da página. Celular: o nome some, a busca vira só o ícone, nada de rolagem lateral.
- Acabamento V1.90 (cantos 10 px, sombra, KPIs em cartão): quem já tem (Gel V1.90, OEE) mantém; quem não tem copia o bloco da seção 3.

## 2. HTML (substitui o topo atual e a barra de abas da página)

Apague o topo antigo (título, barra Sistemas, busca, botões) e a `<nav>` das abas, e cole no lugar, logo depois do `<body>` (e da faixa do modo de teste, se houver). Mantenha **os mesmos ids**: o JS da página e o núcleo usam `#stBase`, `#stUser`, `#appVer`, `#btnSync`, `#btnBackup`, `#btnTV`, `#btnTheme`, `#nav`, `#brandLogo`, `#sysNav`. Se a página usava outros ids para os mesmos botões, troque as referências no JS para estes.

```html
<!-- vac-cabecalho v1 · barra do sistema (igual em todas) + cabeçalho da página + abas -->
<header class="vsuite"><div class="wrap">
  <img id="brandLogo" class="vlogo brandLogo" alt="Logo" hidden><a class="vnm" id="vacNome" href="Portal.html">Sistemas · Linha Vacutainer</a>
  <nav class="vapps" id="sysNav" aria-label="Sistemas da linha"></nav>
  <span class="sp"></span>
  <button type="button" class="vbtn-busca" id="vacBusca" title="Buscar (Ctrl K)">⌕ <span>Buscar…</span> <kbd>Ctrl K</kbd></button>
  <span class="vuser" id="stUser"></span>
  <button type="button" class="vic" id="btnTheme" title="Tema claro, escuro ou automático" aria-label="Alternar tema">◐</button>
</div></header>
<div class="vpage"><div class="wrap">
  <h1 id="vacTitulo">OEE</h1><span class="rule" id="vacSub"></span><span class="ver" id="appVer" title="Versões das páginas"></span>
  <span id="stBase"></span><span class="sp"></span>
  <span class="vacts"><button class="b sm" id="btnSync" title="Gravar pendências e reler a base">↻ Sincronizar</button><button class="b sm" id="btnBackup" title="Criar backup agora">⛁ Backup</button><button class="b sm" id="btnTV" title="Modo TV">▣ TV</button></span>
</div></div>
<nav class="vtabs" aria-label="Abas da página"><div class="wrap"><div class="tabs" id="nav"><!-- as abas da página continuam aqui, como hoje: <button data-t="…">…</button> --></div></div></nav>
<!-- fim vac-cabecalho v1 -->
```

## 3. CSS (cole no fim do `<style>`)

Usa os tokens que todas as páginas já têm (`--surface`, `--line`, `--ink`, `--muted`, `--accent`, `--accent-soft`, `--f-display`, `--f-body`, `--f-mono`). Os estilos de `.wrap`, `.pill`, `.b`/`.btn`, `nav .tabs` e `nav button` continuam os da página.

```css
/* ===== vac-cabecalho v1 · barra do sistema + cabeçalho da página (igual em todas as páginas; não editar só numa) ===== */
:root{--vs-bg:#15222f;--vs-ink:#ffffff;--vs-mut:#aab8c6;--vs-line:rgba(255,255,255,.16);--vs-hl:#86b6e6;--sh:0 1px 2px rgba(16,24,40,.06),0 2px 6px rgba(16,24,40,.06)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--vs-bg:#0a1016;--vs-line:rgba(255,255,255,.12);--sh:0 1px 2px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.25)}}
:root[data-theme="dark"]{--vs-bg:#0a1016;--vs-line:rgba(255,255,255,.12);--sh:0 1px 2px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.25)}
.vsuite{position:sticky;top:0;z-index:40;background:var(--vs-bg);color:var(--vs-mut);border-bottom:1px solid var(--vs-line)}
.vsuite .wrap{display:flex;align-items:center;gap:6px 14px;min-height:46px;flex-wrap:wrap}
.vsuite .vlogo{height:28px;width:auto;max-width:120px;object-fit:contain;flex:none;background:#fff;border-radius:6px;padding:2px 4px}
.vsuite .vnm{font-family:var(--f-display);font-weight:700;font-size:14.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--vs-ink);white-space:nowrap;text-decoration:none}
.vapps,nav.vapps{background:none;border-bottom:0}
.vapps{display:flex;align-self:stretch;overflow-x:auto;scrollbar-width:none;min-width:0}
.vapps a{display:flex;align-items:center;padding:0 14px;font-family:var(--f-display);font-weight:600;font-size:14.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--vs-mut);text-decoration:none;border-bottom:3px solid transparent;white-space:nowrap}
.vapps a:hover{color:var(--vs-ink);background:rgba(255,255,255,.05)}
.vapps a.cur{color:var(--vs-ink);border-bottom-color:var(--vs-hl);background:rgba(255,255,255,.07)}
.vapps a.off{opacity:.45}
.vsuite .sp,.vpage .sp{flex:1}
.vbtn-busca{display:flex;align-items:center;gap:8px;min-width:240px;border:1px solid var(--vs-line);border-radius:8px;background:rgba(255,255,255,.07);color:var(--vs-mut);padding:5px 10px;font-size:13px;cursor:pointer;text-align:left}
.vbtn-busca:hover{background:rgba(255,255,255,.12);color:var(--vs-ink)}
.vbtn-busca kbd{margin-left:auto;font-family:var(--f-mono);font-size:11px;border:1px solid var(--vs-line);border-radius:4px;padding:0 5px}
.vsuite .vuser{font-size:12.5px;white-space:nowrap}.vsuite .vuser b,.vsuite .vuser a{color:var(--vs-ink)}
.vsuite .vic{border:1px solid var(--vs-line);border-radius:8px;background:transparent;color:var(--vs-ink);padding:3px 10px;cursor:pointer}
.vsuite .vic:hover{background:rgba(255,255,255,.1)}
.vpage{background:var(--surface)}
.vpage .wrap{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;padding-block:10px 6px}
.vpage h1{font-family:var(--f-display);font-weight:700;font-size:24px;letter-spacing:.02em;margin:0;text-transform:uppercase;white-space:nowrap}
.vpage .rule{font-family:var(--f-display);font-size:13px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.vpage .ver{font-family:var(--f-mono);font-size:11.5px;color:var(--accent);text-decoration:underline dotted;cursor:pointer;white-space:nowrap}
.vpage #stBase{display:inline-flex;flex-wrap:wrap;gap:4px 6px;align-items:center;color:var(--muted);font-size:12.5px}
.vpage #stBase b{color:var(--ink)}
.vpage .vacts{display:flex;gap:6px;flex-wrap:wrap}
.vpage .vacts .b{border-radius:8px}
nav.vtabs{background:var(--surface);border-bottom:1px solid var(--line);box-shadow:var(--sh)}
/* busca (Ctrl K) */
.vbusca{position:fixed;inset:0;z-index:300;background:rgba(10,20,35,.45);display:flex;justify-content:center;align-items:flex-start;padding:70px 12px}
.vbusca .bx{background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.3);width:min(680px,100%);overflow:hidden}
.vbusca input{width:100%;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:14px 16px;font-size:16px;background:var(--surface);outline:none}
.vbusca ul{list-style:none;margin:0;padding:6px;max-height:60vh;overflow:auto}
.vbusca li{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:8px;cursor:pointer}
.vbusca li.on,.vbusca li:hover{background:var(--accent-soft)}
.vbusca li .tp{font-family:var(--f-display);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);min-width:96px}
.vbusca li .tx{flex:1;min-width:0}.vbusca li .sb{font-size:12px;color:var(--muted)}
.vbusca .vz{padding:14px 16px;color:var(--muted);font-size:13px}
.vbusca .rod{border-top:1px solid var(--line);padding:6px 12px;font-size:11.5px;color:var(--muted)}
@media(max-width:900px){.vsuite .vnm{display:none}.vbtn-busca{min-width:0}.vbtn-busca span{display:none}}
@media(max-width:600px){.vpage h1{font-size:20px}.vpage .rule{display:none}.vsuite .vuser{display:none}}
@media print{.vsuite,nav.vtabs,.vpage .vacts{display:none!important}}
/* ===== fim vac-cabecalho v1 ===== */
```

Acabamento V1.90 (só se a página ainda não tiver):

```css
/* acabamento V1.90 (cantos, sombra, KPIs em cartão) */
:root{--r:10px}
.card,.mod,.tw,.filters,.cadbar,.cadside{box-shadow:var(--sh)}
button.b,label.b,a.b{border-radius:8px}
.kpis{gap:12px;background:none;border:0;overflow:visible}
.kpi{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:var(--r);box-shadow:var(--sh)}
.kpi:has(.v.bad){border-left-color:var(--crit)}.kpi:has(.v.good){border-left-color:var(--ok)}
```

## 4. JS do cabeçalho (cole no script, perto do núcleo; substitui o `renderSysNav` e a busca do topo da página)

```js
/* ===== vac-cabecalho v1 · JS (igual em todas as páginas) =====
   A página define em PAGE: id ('portal'|'oee'|'gel'|'perdas'), titulo, subtitulo, versao e, se quiser,
   busca(q) → [{tipo, txt, sub, href | go()}] com os itens dela (dia, ordem, lote, LP, catálogo…).
   Usa: systems(), sysHref(), esc(), user(), setUser(), cycleTheme(), Logo.apply() do núcleo comum. */
const VAC_CAB_VERSAO=1;
function vacAtual(){return PAGE.id==='portal'&&typeof App!=='undefined'&&App.tab==='cad'?'cadastros':PAGE.id}
function renderSysNav(){const el=$('#sysNav');if(!el)return;const cur=vacAtual(),port=systems().find(s=>s.id==='portal')||{id:'portal',html:'Portal.html'};
 const L=systems().filter(s=>!s.oculto&&!s.futuro).map(s=>({id:s.id,nome:s.nome,href:PAGE.id==='portal'&&s.id==='portal'?'#geral':sysHref(s)}));
 L.push({id:'cadastros',nome:'Cadastros',href:PAGE.id==='portal'?'#cadastros':sysHref(port,'cadastros')});
 el.innerHTML=L.map(x=>`<a href="${esc(x.href)}" class="${x.id===cur?'cur':''}"${x.id===cur?' aria-current="page"':''}>${esc(x.nome)}</a>`).join('');
 const t=$('#vacTitulo');if(t){t.textContent=cur==='cadastros'?'Cadastros':(PAGE.tituloCurto||PAGE.titulo.split('·')[0].trim())}const s=$('#vacSub');if(s)s.textContent=cur==='cadastros'?'Cadastro base da linha':(PAGE.subtitulo||'');
 const n=$('#vacNome');if(n)n.href=PAGE.id==='portal'?'#geral':sysHref(port);document.title=(cur==='cadastros'?'Cadastros':(PAGE.tituloCurto||PAGE.titulo.split('·')[0].trim()))+' · Linha Vacutainer'}
/* busca: páginas, abas da página e o que a página oferecer em PAGE.busca(q) */
const Busca={el:null,i:0,R:[],
 abrir(q=''){if(this.el)return;const d=document.createElement('div');d.className='vbusca';d.innerHTML='<div class="bx" role="dialog" aria-label="Buscar"><input id="vbQ" placeholder="Buscar nesta página ou ir para outra…" autocomplete="off"><ul id="vbL"></ul><div class="rod">↑ ↓ escolher · Enter abrir · Esc fechar</div></div>';
  document.body.appendChild(d);this.el=d;d.onclick=e=>{if(e.target===d)this.fechar()};const inp=d.querySelector('#vbQ');inp.value=q;inp.oninput=()=>{this.i=0;this.lista(inp.value)};
  inp.onkeydown=e=>{if(e.key==='ArrowDown'){this.i=Math.min(this.R.length-1,this.i+1);this.marca();e.preventDefault()}else if(e.key==='ArrowUp'){this.i=Math.max(0,this.i-1);this.marca();e.preventDefault()}else if(e.key==='Enter'){this.ir(this.R[this.i])}else if(e.key==='Escape'){this.fechar()}};
  inp.focus();this.lista(q)},
 fechar(){if(this.el){this.el.remove();this.el=null}},
 itens(q){const n=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();const k=n(q).trim();const R=[];
  const port=systems().find(s=>s.id==='portal')||{html:'Portal.html'};
  systems().filter(s=>!s.oculto&&!s.futuro).forEach(s=>R.push({tipo:'Ir para',txt:s.nome,sub:s.html,href:PAGE.id==='portal'&&s.id==='portal'?'#geral':sysHref(s)}));
  R.push({tipo:'Ir para',txt:'Cadastros',sub:'cadastro base no Portal',href:PAGE.id==='portal'?'#cadastros':sysHref(port,'cadastros')},{tipo:'Ir para',txt:'Versões das páginas',sub:'Portal › Configuração',href:PAGE.id==='portal'?'#versoes':sysHref(port,'versoes')});
  $$('#nav [data-t]').forEach(b=>R.push({tipo:'Aba',txt:b.textContent.trim(),go:()=>b.click()}));
  let P=[];try{P=k&&PAGE.busca?PAGE.busca(k)||[]:[]}catch(e){console.warn(e)}
  const F=R.filter(x=>!k||n(x.txt+' '+(x.sub||'')).includes(k));return(k?P.concat(F):F).slice(0,40)},
 lista(q){this.R=this.itens(q);const ul=this.el.querySelector('#vbL');ul.innerHTML=this.R.length?this.R.map((x,j)=>`<li data-j="${j}" class="${j===this.i?'on':''}"><span class="tp">${esc(x.tipo)}</span><span class="tx">${esc(x.txt)}${x.sub?`<div class="sb">${esc(x.sub)}</div>`:''}</span></li>`).join(''):'<div class="vz">Nada encontrado.</div>';
  ul.onclick=e=>{const li=e.target.closest('li');if(li)this.ir(this.R[+li.dataset.j])}},
 marca(){this.el.querySelectorAll('#vbL li').forEach((li,j)=>{li.classList.toggle('on',j===this.i);if(j===this.i)li.scrollIntoView({block:'nearest'})})},
 ir(x){if(!x)return;this.fechar();if(x.go)x.go();else if(x.href){if(x.href.startsWith('#')){if(location.hash===x.href)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=x.href}else location.href=x.href}}};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();Busca.el?Busca.fechar():Busca.abrir()}});
function wireCabecalho(){const b=$('#vacBusca');if(b)b.onclick=()=>Busca.abrir();const v=$('#appVer');if(v&&!v.onclick){const port=systems().find(s=>s.id==='portal')||{html:'Portal.html'};v.onclick=()=>{if(PAGE.id==='portal')irVersoes();else location.href=sysHref(port,'versoes')}}}
/* ===== fim vac-cabecalho v1 · JS ===== */
```

**O que ele usa da página** (adapte os nomes se a página usar outros): `$`, `$$`, `esc`, `PAGE`, `systems()`, `sysHref()`, `cycleTheme()`, `Logo.apply()`. No início da página chame `wireCabecalho()` (junto do `wireTop`) e, sempre que redesenhar o topo, `renderSysNav()`; o `#appVer` recebe `'v'+versão`.

Se a página não tiver `systems()`/`sysHref()` no formato do núcleo, use estes (lista comum `vac.sistemas` do navegador; o Gel aceita também `url` no lugar de `html`):

```js
const DEFAULT_SYSTEMS=[
 {id:'portal',nome:'Portal',html:'Portal.html',base:'portal-base.json'},
 {id:'oee',nome:'OEE',html:'OEE-Vacutainer.html',base:'oee-vacutainer-base.json'},
 {id:'gel',nome:'Gel',html:'Gestão-Gel-Vacutainer.html',alt:['Gestao-Gel-Vacutainer.html','controle-fifo-gel.html'],base:'fifo-base.json'},
 {id:'perdas',nome:'Perdas',html:'Perdas-Ordem.html',base:'perdas-base.json'},
 {id:'paradas',nome:'Paradas',html:'Paradas.html',base:'paradas-base.json',futuro:true},
 {id:'maquinas',nome:'Máquinas',html:'Maquinas.html',base:'maquinas-base.json',futuro:true},
 {id:'manut',nome:'Manutenção',html:'Manutencao.html',base:'manutencao-base.json',futuro:true},
 {id:'projetos',nome:'Projetos',html:'Projetos.html',base:'projetos-base.json',futuro:true}];
function systems(){try{const s=JSON.parse(localStorage.getItem('vac.sistemas')||'null');if(Array.isArray(s)&&s.length){const ids=new Set(s.map(x=>x.id));return s.concat(DEFAULT_SYSTEMS.filter(d=>!ids.has(d.id)))}}catch(e){}return DEFAULT_SYSTEMS.map(x=>({...x}))}
/* pasta única: todas as páginas na mesma pasta, então o link é só o nome do arquivo */
function sysHref(s,hash=''){return String(s.html||s.url||'').split('/').pop()+(hash?'#'+hash:'')}
```

**Páginas novas (03/11/2026)**: Paradas, Máquinas, Manutenção e Projetos entram na barra sem mudar as outras páginas: a barra vem da lista `vac.sistemas` que o Portal grava (completa, na ordem padrão, com `futuro:true` até o HTML chegar na pasta). A lista acima é só a reserva para navegador que nunca abriu o Portal; atualize na próxima versão de cada página. Detalhes em `claude/paginas-novas.md`.

## 5. Backups por módulo

| Página | `PAGE.backupDir` |
|---|---|
| Portal | `00. Backups/Portal` |
| Paradas · Máquinas · Manutenção · Projetos | `00. Backups/Paradas` · `…/Maquinas` · `…/Manutencao` · `…/Projetos` |
| OEE | `00. Backups/OEE` |
| Gestão de Gel | `00. Backups/Gel` |
| Perdas | `00. Backups/Perdas` |
| Cadastro base (Portal) | `00. Backups/Cadastros` |

- **Toda gravação de backup** da página vai para `PAGE.backupDir` (cria a pasta se não existir). Nada novo em `00. Backups/` solto.
- **Nomes** (`<base>` = nome da base sem `.json`):
  - diário automático (primeira gravação do dia): `<base>_AAAA-MM-DD.json`
  - botão Backup: `<base>_AAAA-MM-DD_HHhMM.json`
  - antes de restaurar uma cópia: `<base>_antes-restaurar_AAAA-MM-DD_HHhMM.json`
- **Lista e restauração**: cada página lista só os próprios backups (`PAGE.backupDir`, mais novos primeiro). Os antigos soltos em `00. Backups/` que começam com `<base>_` aparecem na mesma lista com o selo **"local antigo"** (podem ser baixados ou restaurados), mas nada novo é gravado ali. Restaurar sempre grava antes o `_antes-restaurar_`.
- Texto de ajuda e mensagens passam a citar a pasta certa (ex.: "Backup criado: 00. Backups/OEE/…").

```js
/* nomes padrão de backup */
const bkNome=(tipo)=>{const b=PAGE.baseFile.replace(/\.json$/i,''),d=todayISO(),h=new Date().toTimeString().slice(0,5).replace(':','h');
 return tipo==='diario'?`${b}_${d}.json`:tipo==='antes'?`${b}_antes-restaurar_${d}_${h}.json`:`${b}_${d}_${h}.json`};
/* pasta do módulo (cria se faltar): Store.sub(PAGE.backupDir) — no núcleo comum, sub(path) divide por "/" */
```

## 6. Versão da página (para o quadro de Versões do Portal)

- Declarar a versão no HTML: `PAGE = { …, versao:'2.5' }` (preferido), ou constante `APP_VERSION = '2.5'`, ou `V1.90` no `<title>` (Gel).
- Gravar `appVersion` na raiz da base a cada gravação (o Gel já faz).
- Manter o comentário `vac-cabecalho v1` do bloco HTML: é por ele que o Portal sabe qual cabeçalho a página tem. Mudança no cabeçalho = nova versão do kit (v2) aplicada em todas.

## 7. Parte de cada página

| | OEE | Gestão de Gel | Perdas |
|---|---|---|---|
| Arquivo | `OEE-Vacutainer.html` | `Gestão-Gel-Vacutainer.html` | `Perdas-Ordem.html` |
| `PAGE.id` | `oee` | `gel` | `perdas` |
| `tituloCurto` / `subtitulo` | OEE / Produção e OEE | Gel / FIFO, consumo, scrap e saving | Perdas / Perdas por ordem |
| `backupDir` | `00. Backups/OEE` | `00. Backups/Gel` | `00. Backups/Perdas` |
| `PAGE.busca(q)` | dia, ordem, lote, catálogo, tipo de parada, tela (a busca Ctrl K que já existe vira esta função) | LP, lote, ordem, catálogo (a busca do topo V1.90 vira esta função) | ordem, catálogo, ação |
| Pílulas na faixa branca | base/rev, gravação pendente, cadastro, servidor | base/rev, relatório SAP, pendente de baixa | base/rev, OEE/Gel lidos, última KKBC |

`PAGE.busca(q)` recebe o texto já em minúsculas e sem acento e devolve até ~30 itens `{tipo:'Ordem', txt:'110834720 · 360060', sub:'Plano de nov/26', go:()=>…}` (ou `href:'#ordem=…'`).

## 8. Conferência depois de aplicar

- [ ] Abrir a página pela pasta: faixa escura igual à do Portal, página atual destacada, links levam às outras na mesma aba.
- [ ] Cadastros abre `Portal.html#cadastros`; a versão abre `Portal.html#versoes`.
- [ ] Ctrl K: acha itens da página e "Ir para"; Enter abre; Esc fecha.
- [ ] Sincronizar, Backup, TV e tema funcionam como antes.
- [ ] Botão Backup grava em `00. Backups/<Módulo>/`; a lista mostra os da pasta nova e os antigos com "local antigo".
- [ ] Tema escuro e celular (390 px) sem rolagem lateral.
- [ ] Portal › Versões: cabeçalho v1, versão identificada, último backup na pasta certa.
