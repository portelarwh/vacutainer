import {sessionUser,mayWrite} from './auth';
import {protectFolder} from './compatibility';import manifest from '../generated/manifest.json';import {FILES} from './modules';
import compressed from '../generated/engines.json';import shared from '../generated/libraries.json';import scenario from '../generated/scenario.json';
import {moduleOf,type ModuleId} from './modules';import {today,sourceFrom,type Directory,type Json,type Source} from './data';
export interface EngineStatus{ready:boolean;pending:boolean;connected:boolean;error?:string;readOnly?:boolean}
export interface HostCallbacks {navigate:(id:ModuleId,tab?:string,hash?:string)=>void;demonstrate:()=>void;status:(id:ModuleId,status:EngineStatus)=>void;changed:()=>void;search:()=>void}
const libraries:Record<string,string>={};
async function decode(encoded:string){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
const memory=new Map<string,string>(),textCache=new Map<string,string>();
export const frames=new Map<ModuleId,HTMLIFrameElement>();
let root:Directory|null=null,callbacks:HostCallbacks,session='real',mode=false,cad:Json|null=null;
export function configureRuntime(demo:boolean,folder:Directory|null,identity:string,c:Json|null,cb:HostCallbacks){mode=demo;root=folder;session=identity;cad=c;callbacks=cb;
 const host={search:()=>callbacks.search(),styles:embeddedCss,ir:(href:string)=>navigateHref(href),demonstrar:()=>callbacks.demonstrate(),pasta:async()=>{if(!root)throw new DOMException('Conecte a pasta no cabeçalho da plataforma.','AbortError');return root},safeFolder:async(id:ModuleId)=>{if(!root)throw new Error('Conecte a pasta.');const v=manifest.files.find(f=>f.id===id)!.version;const result=await protectFolder(root,FILES[id],v,()=>mayWrite(scopedStorage(),cad,id));if(result.readOnly)callbacks.status(id,{ready:true,pending:false,connected:false,readOnly:true,error:result.reason});return result.folder},get cadastro(){return cad},get usuario(){return mode?(cad?.usuarios||[]).find((u:Json)=>String(u.codigo)===(localStorage.getItem('vac.platform.demo.user')||'9001'))||null:sessionUser(scopedStorage(),cad)},status:(id:ModuleId,s:EngineStatus)=>callbacks.status(id,s),changed:()=>callbacks.changed(),link:(id:ModuleId,route='')=>appLink(id,route),scope:identity};
 (window as any).vacAppHost=host;
 if(demo)(window as any).vacDemoHost={id:identity,storage:{get length(){return memory.size},key:(i:number)=>[...memory.keys()][i]??null,getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v);if(k.includes('base.'))queueMicrotask(()=>callbacks.changed())},removeItem:(k:string)=>memory.delete(k)},base:location.href,link:appLink,navegar:(id:ModuleId,route:string)=>callbacks.navigate(id,undefined,route),sair:()=>callbacks.demonstrate(),reiniciar:()=>{if(confirm('Reiniciar o cenário fictício de todos os módulos?')){memory.clear();location.reload()}}};
 else delete(window as any).vacDemoHost;
}
export function appLink(id:ModuleId,route=''){return location.href.split('#')[0]+'#/'+id+(route?'?rota='+encodeURIComponent(route):'')}
export function navigateHref(href:string){try{const u=new URL(href,location.href);const file=decodeURIComponent(u.pathname.split('/').pop()||'');const m=Object.keys(compressed).find(id=>moduleOf(id)?.file===file) as ModuleId|undefined;
 if(m){callbacks.navigate(m,undefined,u.hash);return}if(u.hash.startsWith('#/')){location.hash=u.hash;return}if(file==='Demonstracao.html'){callbacks.demonstrate();return}if(u.protocol==='http:'||u.protocol==='https:'||u.protocol==='mailto:')window.open(u.href,'_blank','noopener');}catch{}}
export function demoSources():{sources:Source[];cad:Json}{
 const bases=moveScenario((scenario as any).bases) as Json;
 for(const [key,value] of memory){const m=/base\.(portal|oee|perdas|gel|paradas|equip|inic|cad)$/.exec(key);if(m)try{bases[m[1]]=JSON.parse(value)}catch{}}
 return{sources:(['portal','oee','perdas','gel','paradas','equip','inic'] as ModuleId[]).map(id=>sourceFrom(id,bases[id])),cad:bases.cad};
}
function moveScenario(value:any):any{if(Array.isArray(value))return value.map(moveScenario);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[moveScenario(k),moveScenario(v)]));if(typeof value!=='string')return value;
 const ref=(scenario as any).referencia,h=today(),days=Math.round((Date.parse(h+'T12:00:00Z')-Date.parse(ref+'T12:00:00Z'))/864e5);
 if(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value))return new Date(Date.parse(value.slice(0,10)+'T12:00:00Z')+days*864e5).toISOString().slice(0,10)+value.slice(10);
 if(/^\d{4}-\d{2}$/.test(value)){const n=(+h.slice(0,4)-+ref.slice(0,4))*12+(+h.slice(5,7)-+ref.slice(5,7));const d=new Date(+value.slice(0,4),+value.slice(5,7)-1+n,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}return value;
}
export async function engineHtml(id:ModuleId,route:string):Promise<string>{if(!textCache.has(id)){const bytes=Uint8Array.from(atob(compressed[id]),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));textCache.set(id,await new Response(stream).text())}
 for(const [name,bytes]of Object.entries(shared))if(!libraries[name])libraries[name]=await decode(bytes);
 const libraryScripts='<script>for(const code of '+JSON.stringify(['xlsx','jspdf','autotable'].map(k=>libraries[k])).replace(/</g,'\\u003c')+'){const s=document.createElement("script");s.textContent=code;document.head.appendChild(s)}<\/script>';
 const config={id,route,demo:mode,scope:session};const prelude='<script>('+runtimePrelude.toString()+')('+JSON.stringify(config).replace(/</g,'\\u003c')+');<\/script>';
 return textCache.get(id)!.replace(/<head(?:\s[^>]*)?>/i,m=>m+prelude+libraryScripts).replace('</head>','<style>'+embeddedCss+'</style></head>');
}
export function routeEngine(id:ModuleId,tab:string,hash?:string,context?:{from:string;to:string;turno:string}){const w=frames.get(id)?.contentWindow as any;return w?.__vacBridge?.route(tab,hash,context)}
export function openOrder(id:ModuleId,code:string){const w=frames.get(id)?.contentWindow as any;w?.__vacBridge?.order(code)}
export function refreshEngine(id:ModuleId){const w=frames.get(id)?.contentWindow as any;return w?.__vacBridge?.refresh()}
export function hasPending(){return[...frames.values()].some(f=>{try{const api=(f.contentWindow as any)?.vacPagina;return !api||api.pendente()}catch{return true}})}
const embeddedCss=`
:root{--bg:#f4f6f8!important;--surface:#fff!important;--surface-2:#f4f7f8!important;--ink:#192d35!important;--muted:#667b85!important;--accent:#147c71!important;--line:#dce5e9!important;--r:10px!important;--f-body:Inter,ui-sans-serif,system-ui,sans-serif!important;--f-display:Inter,ui-sans-serif,system-ui,sans-serif!important}
:root[data-theme=dark]{--bg:#12232c!important;--surface:#1b303a!important;--surface-2:#203a46!important;--ink:#e5eff3!important;--muted:#a4b9c4!important;--line:#36515d!important}
html,body{margin:0!important;min-width:0!important;font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;background:var(--bg)!important}
.vsuite,.vpage,nav.vtabs,#vacDemoBar,#sysNav,#vacGuiaBotao,body>.testbar{display:none!important}
body>header,body>.top,body>.head,body>.sysbar,body>nav,#nav{display:none!important}
body main,#main,main.wrap{max-width:none!important;width:auto!important;margin:0!important;padding:16px 20px!important}
#vacEngineActions{display:flex;justify-content:flex-end;gap:8px;padding:10px 20px 0}#vacEngineActions .vacts{display:flex;gap:6px;flex-wrap:wrap}body>footer{display:none!important}.card,.mod{border-radius:12px!important;box-shadow:none!important}.filters{border-radius:10px!important}button,input,select,textarea{font-family:inherit!important}
#vac-entrada{position:fixed!important;inset:0!important}.banner.demo{display:none!important}
@media(max-width:650px){body main,#main,main.wrap{padding:10px!important}}
`;
// This function is serialized into srcdoc: it must not capture module variables.
function runtimePrelude(config:{id:string;route:string;demo:boolean;scope:string}){
 const W=window as any,host=(parent as any).vacAppHost;W.__vacEmbedded=true;
 document.addEventListener('DOMContentLoaded',()=>{const style=document.createElement('style');style.textContent=host.styles;document.head.appendChild(style)},{once:true});
 const rawHistory={replace:history.replaceState.bind(history),push:history.pushState.bind(history)};
 for(const [k,fn] of [['replaceState',rawHistory.replace],['pushState',rawHistory.push]] as const)history[k]=function(state:any,title:string,url?:string|URL|null){const text=String(url??''),n=text.indexOf('#');return fn(state,title,'about:srcdoc'+(n<0?'':text.slice(n)))};
 if(config.route)location.hash=config.route.startsWith('#')?config.route:'#'+config.route;
 if(!config.demo){
  const raw=window.localStorage,prefix='vac.app.'+config.scope+'.',methods={getItem(k:string){if(k==='vac.cadastros')return host.cadastro?JSON.stringify(host.cadastro):null;return raw.getItem(prefix+k)},setItem(k:string,v:string){raw.setItem(prefix+k,String(v));if(k==='vac.sessao'||k==='vac.userId')host.changed()},removeItem(k:string){raw.removeItem(prefix+k)},key(i:number){return Object.keys(raw).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length)??null}};
  Object.defineProperty(window,'localStorage',{configurable:true,get:()=>new Proxy(methods,{get:(t,k)=>k==='length'?Object.keys(raw).filter(x=>x.startsWith(prefix)).length:typeof k==='string'&&k in t?(t as any)[k]:methods.getItem(String(k)),set:(_,k,v)=>{methods.setItem(String(k),v);return true}})});
  const op=indexedDB.open.bind(indexedDB),del=indexedDB.deleteDatabase.bind(indexedDB);indexedDB.open=(n:string,v?:number)=>v===undefined?op(prefix+n):op(prefix+n,v);indexedDB.deleteDatabase=(n:string)=>del(prefix+n);
  W.showDirectoryPicker=()=>host.pasta();
 }
 const api=()=>{const value=W.vacPagina;const required=['pendente','conectado','conectar','ir','abas','abrirOrdem'];if(!value||required.some(k=>typeof value[k]!=='function'))throw new Error('Contrato vacPagina incompleto: '+config.id);return value};
 function pending(){try{return api().pendente()}catch{return true}}
 function connected(){try{return api().conectado()}catch{return false}}
 function ready(){try{return api().pronto()}catch{return false}}
 function route(tab:string,hash?:string,context?:any){return api().ir(tab,hash,context)}
 async function connect(){if(config.demo)return;return api().conectar(await host.safeFolder(config.id))}
 W.__vacBridge={route,pending,ready,connected,connect,refresh:()=>api().atualizar(),order:(code:string)=>api().abrirOrdem(code)};
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();host.search()}},true);
 const nativeOpen=window.open.bind(window);window.open=((url?:string|URL,target?:string,features?:string)=>{if(url&&/\.html(?:[?#]|$)/i.test(String(url))&&!/^blob:|^data:/i.test(String(url))){host.ir(String(url));return null}return nativeOpen(url,target,features)}) as typeof window.open;
 document.addEventListener('click',e=>{const a=(e.target as Element)?.closest?.('a[href]');if(!a||a.hasAttribute('download')||e.ctrlKey||e.metaKey)return;const h=a.getAttribute('href')||'';if(/\.html(?:[?#]|$)/i.test(h)){e.preventDefault();e.stopImmediatePropagation();host.ir(h)}},true);
 let attempts=0;const timer=setInterval(()=>{if(!ready()){if(++attempts>150){clearInterval(timer);host.status(config.id,{ready:false,pending:false,connected:false,error:'O módulo não concluiu a abertura.'})}return}clearInterval(timer);
  document.documentElement.dataset.theme=(parent.document.documentElement.dataset.theme||'light');
  route('',config.route||undefined);host.status(config.id,{ready:true,pending:pending(),connected:connected()});
  setInterval(()=>host.status(config.id,{ready:true,pending:pending(),connected:connected()}),1800);
 },200);
 window.addEventListener('beforeunload',e=>{if(pending()){e.preventDefault();e.returnValue=''}});
}

function scopedStorage(){return{getItem:(key:string)=>localStorage.getItem('vac.app.'+session+'.'+key)}}
export function currentUser(){return mode?(window as any).vacAppHost?.usuario:sessionUser(scopedStorage(),cad)}
