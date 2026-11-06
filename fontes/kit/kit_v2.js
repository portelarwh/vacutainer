/* ----- vac-cabecalho v2 · acréscimos de 05/11/2026 (iguais em todas as páginas; não editar só numa) -----
   Menu "Outros ▾" (vac.sistemas com grupo:'outros' + links de vac.links), ⚙ Administração (Portal.html#admin),
   nomes exibidos novos (Produção, Waste, Gestão de Gel), entrar pelo ID (usuários do cadastro: cópia vac.cadastros),
   barra filtrada pela permissão "ver" do perfil e semáforo comum (parametros do cadastro).
   A página pode definir vacAoTrocarUsuario(nome) para atualizar o próprio estado quando a pessoa entra. */
const VAC_NOMES_V2={oee:{OEE:'Produção'},perdas:{Perdas:'Waste'},gel:{Gel:'Gestão de Gel'}};
const VAC_OUTROS_V2=['maquinas','manut'],vacEhOutros=s=>s.grupo==='outros'||VAC_OUTROS_V2.includes(s.id);
const vacNomeSis=s=>(s&&VAC_NOMES_V2[s.id]&&VAC_NOMES_V2[s.id][s.nome])||(s&&s.nome)||'';
function vacCad(){if(typeof Cad!=='undefined'&&Cad&&Cad.D)return Cad.D;try{return JSON.parse(localStorage.getItem('vac.cadastros')||'null')}catch(e){return null}}
function vacUsuario(c=vacCad()){let id='';try{id=localStorage.getItem('vac.userId')||''}catch(e){}return id&&c?(c.usuarios||[]).find(u=>String(u.codigo)===String(id))||null:null}
function vacPerfil(c=vacCad()){const u=vacUsuario(c);return u&&c?(c.perfis||[]).find(p=>p.codigo===u.perfil)||null:null}
/* permissão do perfil na página (sem perfil, sem cadastro ou sem a página no perfil = pode) */
function vacPode(mod,fn='ver'){const p=vacPerfil();if(!p||!p.permissoes||!p.permissoes[mod])return true;return p.permissoes[mod][fn]!==false}
/* semáforo comum: 'ok' | 'warn' | 'crit' | 'none' em relação à meta (inverso: menor é melhor, ex.: scrap, waste) */
function vacSemaforo(v,meta,{inverso=false}={}){if(v==null||meta==null||!isFinite(v)||!isFinite(meta)||!meta)return'none';const c=vacCad(),P=(c&&c.parametros)||{};
 const vd=(+P.semaforoVerdePct||100)/100,am=(+P.semaforoAmareloPct||90)/100,r=inverso?(v<=0?Infinity:meta/v):v/meta;return r>=vd?'ok':r>=am?'warn':'crit'}
function vacNomeUsuario(){try{return(typeof user==='function'&&user())||localStorage.getItem('vac.user')||''}catch(e){return''}}
function renderSysNav(){const el=$('#sysNav');if(!el)return;const cur=vacAtual(),port=systems().find(s=>s.id==='portal')||{id:'portal',html:'Portal.html'};
 const vis=systems().filter(s=>!s.oculto&&!s.futuro&&(vacPode(s.id)||s.id===PAGE.id)),href=s=>PAGE.id==='portal'&&s.id==='portal'?'#geral':sysHref(s);
 el.innerHTML=vis.filter(s=>!vacEhOutros(s)).map(s=>`<a href="${esc(href(s))}" class="${s.id===cur?'cur':''}"${s.id===cur?' aria-current="page"':''}${s.sub?` title="${esc(s.sub)}"`:''}>${esc(vacNomeSis(s))}</a>`).join('');
 const o=$('#sysOutros');if(o){let lk=[];try{lk=JSON.parse(localStorage.getItem('vac.links')||'[]')||[]}catch(e){}const ex=vis.filter(vacEhOutros);
  o.innerHTML=ex.length||lk.length?`<details class="vmenu"><summary>Outros</summary><div class="vmenu-l">${ex.map(s=>`<a href="${esc(href(s))}">${esc(vacNomeSis(s))}</a>`).join('')}${lk.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nome)} ↗</a>`).join('')}</div></details>`:'';
  const d=o.querySelector('details');if(d&&!o._wired){o._wired=1;document.addEventListener('click',e=>{const dd=o.querySelector('details');if(dd&&!dd.contains(e.target))dd.open=false})}}
 const ad=$('#btnAdmin');if(ad&&ad.tagName==='A')ad.href=sysHref(port,'admin');
 const me=systems().find(s=>s.id===PAGE.id),nm=cur==='cadastros'?'Administração':(me&&vacNomeSis(me))||PAGE.tituloCurto||PAGE.titulo.split('·')[0].trim();
 const t=$('#vacTitulo');if(t)t.textContent=nm;const sb=$('#vacSub');if(sb)sb.textContent=cur==='cadastros'?'Cadastros e configuração':(PAGE.subtitulo||'');
 const n=$('#vacNome');if(n)n.href=PAGE.id==='portal'?'#geral':sysHref(port);document.title=nm+' · Linha Vacutainer';
 if(PAGE.id!=='portal')vacUserRender()}
function vacUserRender(){const el=$('#stUser');if(!el||PAGE.id==='portal')return;const nm=vacNomeUsuario(),p=vacPerfil();let id='';try{id=localStorage.getItem('vac.userId')||''}catch(e){}
 el.innerHTML=nm?`<a href="#" id="vacUserA" title="${esc((id?'ID '+id+' · ':'')+(p?'perfil '+p.nome+' · ':'')+'clique para trocar de usuário')}" style="color:inherit;text-decoration:none"><b>${esc(nm)}</b>${p?` <span style="opacity:.75;font-size:12px">· ${esc(p.nome)}</span>`:''}</a>`:'<a href="#" id="vacUserA" style="color:inherit"><b>Entrar</b></a>';
 $('#vacUserA').onclick=e=>{e.preventDefault();VacEntrar.abrir()}}
/* entrar pelo ID: lê os usuários da cópia do cadastro; o 1º acesso (cadastro de nome + ID) é feito no Portal */
const VacEntrar={el:null,
 abrir(){if(PAGE.id==='portal'&&typeof Entrar!=='undefined')return Entrar.abrir();this.fechar();const c=vacCad();let id0='';try{id0=localStorage.getItem('vac.userId')||''}catch(e){}
  const d=document.createElement('div');d.className='vbusca';d.innerHTML=`<div class="bx vent" role="dialog" aria-label="Entrar"><h3>Entrar</h3><p class="small">Digite seu ID (matrícula). Seu nome fica registrado em tudo o que você alterar, em todas as páginas.</p>
  <input id="veId" placeholder="ID / matrícula" value="${esc(id0)}" autocomplete="off"><div id="veMsg" class="small"></div>
  <div class="vrow"><button type="button" class="b p" id="veOk">Entrar</button>${vacNomeUsuario()?'<button type="button" class="b" id="veSair">Sair</button>':''}<button type="button" class="b" id="veX">Cancelar</button></div>${c?'':'<p class="small" style="opacity:.75">Sem a cópia do cadastro neste navegador: abra o Portal pela pasta uma vez para carregar os usuários.</p>'}</div>`;
  document.body.appendChild(d);this.el=d;d.onclick=e=>{if(e.target===d)this.fechar()};const i=d.querySelector('#veId');i.focus();i.select();
  i.onkeydown=e=>{if(e.key==='Enter')this.id(i.value);if(e.key==='Escape')this.fechar()};d.querySelector('#veOk').onclick=()=>this.id(i.value);d.querySelector('#veX').onclick=()=>this.fechar();
  const sa=d.querySelector('#veSair');if(sa)sa.onclick=()=>{try{['vac.user','vac.userId','vac.perfil'].forEach(k=>localStorage.removeItem(k))}catch(e){}this.aviso('');this.fechar()}},
 fechar(){if(this.el){this.el.remove();this.el=null}},
 id(v){v=String(v||'').trim();const m=this.el.querySelector('#veMsg');if(!v){m.textContent='Digite o ID.';return}const c=vacCad(),u=c&&(c.usuarios||[]).find(x=>String(x.codigo)===v);
  if(u&&u.ativo===false){m.innerHTML='<span style="color:var(--crit)">Este ID está inativo no cadastro. Fale com o administrador.</span>';return}
  if(u){try{localStorage.setItem('vac.user',u.nome);localStorage.setItem('vac.userId',u.codigo);localStorage.setItem('vac.perfil',u.perfil||'')}catch(e){}this.aviso(u.nome);this.fechar();return}
  const port=systems().find(s=>s.id==='portal')||{html:'Portal.html'};
  m.innerHTML=`<p>O ID <b>${esc(v)}</b> não está no cadastro. O <b>primeiro acesso</b> (nome + ID) é feito no Portal.</p><div class="vrow"><a class="b p" href="${esc(sysHref(port,'entrar'))}">Fazer o 1º acesso no Portal</a></div>
  <p style="margin-top:8px">Ou use só um nome neste navegador:</p><div class="vrow"><input id="veNome" placeholder="Seu nome" style="flex:1"><button type="button" class="b" id="veNomeOk">Usar este nome</button></div>`;
  m.querySelector('#veNomeOk').onclick=()=>{const n=m.querySelector('#veNome').value.trim();if(n.length<2)return;try{localStorage.setItem('vac.user',n);localStorage.removeItem('vac.userId');localStorage.removeItem('vac.perfil')}catch(e){}this.aviso(n);this.fechar()}},
 aviso(nome){try{if(typeof vacAoTrocarUsuario==='function')vacAoTrocarUsuario(nome)}catch(e){console.warn(e)}window.dispatchEvent(new CustomEvent('vac:usuario',{detail:{nome}}));renderSysNav();vacUserRender()}};
window.addEventListener('storage',e=>{if(['vac.user','vac.userId','vac.cadastros','vac.links'].includes(e.key)){try{renderSysNav();vacUserRender()}catch(x){}}});
