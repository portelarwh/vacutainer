/* Demonstração integrada, incorporada em cada HTML pelos builds. Nenhuma dependência de servidor.
   O cenário é fictício; armazenamento e IndexedDB são isolados por sessão de demonstração. */
const vacDemo = (() => {
  const cenario = @@VAC_DEMO_CENARIO@@;
  const paginas = {portal:'Portal.html',oee:'OEE-Vacutainer.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',projetos:'Projetos.html'};
  const clone = x => JSON.parse(JSON.stringify(x));
  const host = (()=>{try{return parent!==window&&parent.vacDemoHost||null}catch(e){return null}})();
  const url = new URL(location.href), pedido = url.searchParams.get('demo');
  const ativo = !!host || (pedido !== null && pedido !== '0');
  const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2);
  const id = host ? host.id : ativo ? (/^[a-zA-Z0-9-]{8,64}$/.test(pedido || '') ? pedido : uid()) : '';
  let real = null, indisponivel = false, saindo = false; const memoria = new Map(), adaptadores = {};
  try { real = host ? host.storage : window.localStorage; } catch(e) { indisponivel = true; }
  const prefixo = 'vac.demo.' + id + '.';
  const lerTexto = k => { try { return real ? real.getItem(k) : memoria.get(k) ?? null; } catch(e) { indisponivel=true; return memoria.get(k) ?? null; } };
  const gravarTexto = (k,v) => { memoria.set(k,v); try { if(real)real.setItem(k,v);else indisponivel=true; } catch(e) { indisponivel=true; } };
  const apagar = k => { memoria.delete(k);try{if(real)real.removeItem(k)}catch(e){indisponivel=true} };
  const hoje = () => {const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  let dia = hoje();
  if(ativo){const guardado=lerTexto(prefixo+'dia');if(/^\d{4}-\d{2}-\d{2}$/.test(guardado||''))dia=guardado;else gravarTexto(prefixo+'dia',dia);}
  const deslocamento = Math.round((Date.parse(dia+'T12:00:00Z')-Date.parse(cenario.referencia+'T12:00:00Z'))/864e5);
  const meses = (Number(dia.slice(0,4))-Number(cenario.referencia.slice(0,4)))*12+Number(dia.slice(5,7))-Number(cenario.referencia.slice(5,7));
  function mover(x){
    if(Array.isArray(x))return x.map(mover);
    if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[mover(k),mover(v)]));
    if(typeof x!=='string')return x;
    if(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(x)){const t=new Date(Date.parse(x.slice(0,10)+'T12:00:00Z')+deslocamento*864e5);return t.toISOString().slice(0,10)+x.slice(10);}
    if(/^\d{4}-\d{2}$/.test(x)){const d=new Date(Number(x.slice(0,4)),Number(x.slice(5,7))-1+meses,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
    return x;
  }
  function ler(mod){const s=lerTexto(prefixo+'base.'+mod);if(s){try{return JSON.parse(s)}catch(e){}}
    return cenario.bases[mod]?mover(cenario.bases[mod]):null;}
  function salvar(mod,base,exports){if(!ativo||saindo)return;const d=clone(base);if(exports)d.exports=exports;gravarTexto(prefixo+'base.'+mod,JSON.stringify(d));}
  const exportsDe = mod => {const d=ler(mod);return d&&d.exports||null};
  function href(h){
    if(host&&h&&!String(h).startsWith('#')){try{const u=new URL(h,host.base),n=decodeURIComponent(u.pathname.split('/').pop()),mod=Object.keys(paginas).find(k=>paginas[k]===n);if(mod)return host.link(mod,u.hash)}catch(e){}return h}
    if(!ativo||saindo||!h||String(h).startsWith('#'))return h;
    try{const u=new URL(h,location.href),a=new URL(location.href),n=decodeURIComponent(u.pathname.split('/').pop());
      if(u.origin===a.origin&&u.pathname.slice(0,u.pathname.lastIndexOf('/'))===a.pathname.slice(0,a.pathname.lastIndexOf('/'))&&Object.values(paginas).includes(n)){u.searchParams.set('demo',id);return u.href;}}
    catch(e){}return h;
  }
  function ir(h){if(host){try{const u=new URL(h,host.base),n=decodeURIComponent(u.pathname.split('/').pop()),mod=Object.keys(paginas).find(k=>paginas[k]===n)||u.searchParams.get('pagina');if(paginas[mod])return host.navegar(mod,u.searchParams.get('rota')||u.hash)}catch(e){}}location.assign(href(h));}
  function atualHref(hash){return host?host.link(PAGE.id,hash?'#'+String(hash).replace(/^#/, ''):''):location.href.split('#')[0]+(hash?'#'+String(hash).replace(/^#/,''):'');}
  function entrar(){if(host)return host.navegar(PAGE.id,location.hash);const u=new URL('Demonstracao.html',location.href),mod=typeof PAGE!=='undefined'?PAGE.id:'portal';u.searchParams.set('pagina',paginas[mod]?mod:'portal');u.searchParams.set('rota',location.hash==='#teste'?'':location.hash);u.searchParams.set('origem',decodeURIComponent(location.pathname.split('/').pop()));location.assign(u.href);}
  function sair(){if(host){saindo=true;return host.sair()}saindo=true;const u=new URL(location.href);u.searchParams.delete('demo');if(u.hash==='#teste')u.hash='';location.replace(u.href);}
  function reiniciar(){if(host)return host.reiniciar();if(!confirm('Reiniciar os dados fictícios desta demonstração?'))return;const u=new URL(location.href);u.searchParams.set('demo',uid());location.replace(u.href);}
  function registrar(mod,lerAtual,aplicar,atualizar){adaptadores[mod]={lerAtual,aplicar,atualizar};const d=ler(mod);if(d)aplicar(d);if(atualizar)atualizar();}
  function publicar(mod){const a=adaptadores[mod];if(ativo&&a){const d=a.lerAtual();if(d)salvar(mod,d);}}
  if(ativo){
    if(!host){url.searchParams.set('demo',id);history.replaceState(history.state,'',url.href);}
    // As preferências/cadastros usados pela página são do cenário. Não altera chaves reais.
    const padrao = {'vac.user':'Pessoa de demonstração','vac.userId':'9001','vac.sistemas':JSON.stringify(Object.entries(paginas).map(([id,html])=>({id,html,nome:({oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',equip:'Equipamentos',inic:'Iniciativas / Ações'})[id]||id[0].toUpperCase()+id.slice(1),futuro:false,estado:id==='projetos'?'construcao':undefined})))};
    const prefsPrefixo=prefixo+'pref.';
    const chaves=()=>{const s=new Set(Object.keys(padrao));try{for(let i=0;real&&i<real.length;i++){const k=real.key(i);if(k.startsWith(prefsPrefixo))s.add(k.slice(prefsPrefixo.length));}}catch(e){}for(const k of memoria.keys())if(k.startsWith(prefsPrefixo))s.add(k.slice(prefsPrefixo.length));return[...s]};
    const metodos={getItem(k){k=String(k);if(k==='vac.cadastros')return JSON.stringify(ler('cad'));return lerTexto(prefsPrefixo+k)??padrao[k]??null},setItem(k,v){k=String(k);v=String(v);gravarTexto(prefsPrefixo+k,v)},removeItem(k){apagar(prefsPrefixo+String(k))},clear(){for(const k of chaves())apagar(prefsPrefixo+k)},key(i){return chaves()[i]??null}};
    const storage=new Proxy({}, {get:(_,k)=>k==='length'?chaves().length:metodos[k]||metodos.getItem(k),set:(_,k,v)=>{metodos.setItem(k,v);return true},ownKeys:chaves,getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true})});
    Object.defineProperty(window,'localStorage',{configurable:true,get:()=>storage});
    const abrir=indexedDB.open.bind(indexedDB),deletar=indexedDB.deleteDatabase.bind(indexedDB);
    indexedDB.open=(n,v)=>v===undefined?abrir(prefixo+n):abrir(prefixo+n,v);
    indexedDB.deleteDatabase=n=>deletar(prefixo+n);
    // Um arquivo demonstrativo nunca conecta o seletor a uma base real.
    window.showDirectoryPicker=async()=>{if(typeof toast==='function')toast('Saia da demonstração para conectar uma pasta real.');throw new DOMException('Demonstração: pasta real não conectada','AbortError')};
    for(const nome of ['replaceState','pushState']){const f=history[nome].bind(history);history[nome]=(s,t,u)=>{if(host&&u!=null){const txt=String(u),i=txt.indexOf('#');return f(s,t,'about:srcdoc'+(i<0?'':txt.slice(i)))}return f(s,t,u==null?u:href(u))};}
  }
  const basesPorArquivo={'portal-base.json':'portal','vacutainer-cadastros.json':'cad','oee-vacutainer-base.json':'oee','ordens-base.json':'ordens','perdas-base.json':'perdas','fifo-base.json':'gel','paradas-base.json':'paradas','equipamentos-base.json':'equip','iniciativas-base.json':'inic'};
  const pasta={name:'Demonstração',kind:'directory',async getFileHandle(nome,op){if(op&&op.create)throw new DOMException('Demonstração somente na memória','NoModificationAllowedError');const mod=basesPorArquivo[nome],d=mod&&ler(mod);if(!d)throw new DOMException('Arquivo fictício ausente','NotFoundError');return{kind:'file',name:nome,async getFile(){return new File([JSON.stringify(mod==='cad'?d:{exports:d.exports||{}})],nome,{type:'application/json',lastModified:Date.now()})}}},async queryPermission(){return'read'},async entries(){return[]}};
  const atualizarExternos=()=>{if(ativo&&!saindo)for(const a of Object.values(adaptadores))if(a.atualizar)a.atualizar()};
  window.addEventListener('storage',e=>{if(ativo&&e.key&&e.key.startsWith(prefixo+'base.'))atualizarExternos()});
  window.addEventListener('focus',()=>{if(!host)atualizarExternos()});
  function montar(){
    if(host)document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||a.hasAttribute('download'))return;try{const u=new URL(a.getAttribute('href'),host.base),mod=u.searchParams.get('pagina');if(u.pathname.endsWith('/Demonstracao.html')&&paginas[mod]){e.preventDefault();e.stopImmediatePropagation();host.navegar(mod,u.searchParams.get('rota')||'')}}catch(x){}},true);
    if(host)document.addEventListener('click',e=>{const a=e.target.closest('a[href]'),h=a&&a.getAttribute('href');if(!e.defaultPrevented&&h&&h.startsWith('#')&&!e.ctrlKey&&!e.metaKey){e.preventDefault();if(location.hash!==h)location.hash=h;else window.dispatchEvent(new HashChangeEvent('hashchange'))}});
    if(ativo){document.body.classList.add('vac-demo');const b=document.createElement('div');b.id='vacDemoBar';b.setAttribute('role','region');b.setAttribute('aria-label','Demonstração do sistema');
      b.innerHTML='<div class="vdemo-wrap"><strong>Demonstração do sistema</strong><span>Dados fictícios · alterações só no cenário</span><button type="button" data-vdemo-reset>Reiniciar</button><button type="button" data-vdemo-sair>Sair da demonstração</button></div>';
      document.body.prepend(b);b.querySelector('[data-vdemo-reset]').onclick=reiniciar;b.querySelector('[data-vdemo-sair]').onclick=sair;
      new ResizeObserver(()=>document.documentElement.style.setProperty('--vdemo-h',b.offsetHeight+'px')).observe(b);
    }else{const alvo=document.querySelector('.vsuite .wrap');if(alvo&&!document.getElementById('vacDemoEntrar')){const b=document.createElement('button');b.id='vacDemoEntrar';b.className='vdemo-entrar';b.type='button';b.title='Explorar todo o sistema com dados fictícios';b.setAttribute('aria-label','Iniciar demonstração do sistema');b.innerHTML='▶ <span>Demonstração</span>';b.onclick=entrar;alvo.appendChild(b);}}
    if(ativo){const marcar=()=>{for(const a of document.querySelectorAll('a[href]')){const h=a.getAttribute('href'),n=href(h);if(n!==h)a.setAttribute('href',n)}};let pend=false;
      new MutationObserver(()=>{if(!pend){pend=true;queueMicrotask(()=>{pend=false;marcar()})}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});marcar();
      document.addEventListener('click',e=>{const a=e.target.closest('#tbSair,#sairTeste,#cSairT,[onclick*="exitTest"],[onclick*="exitDemo"],[data-act="exitDemo"],[data-act="exitex"]');if(a){e.preventDefault();e.stopImmediatePropagation();sair()}},true);
    }
  }
  document.addEventListener('DOMContentLoaded',montar);
  return {ativo,id,prefixo,pasta,paginas,ordem:cenario.ordem,lote:cenario.lote,lp:cenario.lp,ler,salvar,exports:exportsDe,href,ir,atualHref,entrar,sair,reiniciar,registrar,publicar,get indisponivel(){return indisponivel}};
})();
