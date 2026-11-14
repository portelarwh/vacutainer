import {sessionUser,mayWrite} from './auth';
import {protectFolder} from './compatibility';import manifest from '../generated/manifest.json';import {FILES} from './modules';
import compressed from '../generated/engines.json';import shared from '../generated/libraries.json';import scenario from '../generated/scenario.json';
import {moduleOf,type ModuleId,type Tab} from './modules';import {today,sourceFrom,type Directory,type Json,type Source} from './data';
export interface EngineStatus{ready:boolean;pending:boolean;connected:boolean;error?:string;readOnly?:boolean;tabs?:Tab[];commands?:{id:string;label:string;disabled:boolean}[];info?:{versao:string;estado:string}}
export interface HostCallbacks {navigate:(id:ModuleId,tab?:string,hash?:string)=>void;demonstrate:()=>void;status:(id:ModuleId,status:EngineStatus)=>void;changed:()=>void;search:()=>void;cadastro?:(cad:Json)=>void}
const libraries:Record<string,string>={};
async function decode(encoded:string){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
const policies=new Map<string,{readOnly:boolean;reason:string}>();
const memory=new Map<string,string>(),textCache=new Map<string,string>();
export const frames=new Map<ModuleId,HTMLIFrameElement>();
let storageListener:((event:StorageEvent)=>void)|null=null;
let root:Directory|null=null,callbacks:HostCallbacks,session='real',mode=false,cad:Json|null=null;
export function configureRuntime(demo:boolean,folder:Directory|null,identity:string,c:Json|null,cb:HostCallbacks){mode=demo;root=folder;session=identity;cad=c;callbacks=cb;
 const host={library:loadLibrary,storage:(id:ModuleId,key:string,value:string|null,old:string|null)=>publishStorage(id,key,value,old),resize:(id:ModuleId,height:number)=>{const f=frames.get(id);if(f&&Math.abs(f.clientHeight-height)>1)f.style.height=height+'px'},search:()=>callbacks.search(),styles:embeddedCss,ir:(href:string)=>navigateHref(href),demonstrar:()=>callbacks.demonstrate(),pasta:async()=>{if(!root)throw new DOMException('Conecte a pasta no cabeçalho da plataforma.','AbortError');return root},safeFolder:async(id:ModuleId)=>{if(!root)throw new Error('Conecte a pasta.');const v=manifest.files.find(f=>f.id===id)!.version;const result=await protectFolder(root,FILES[id],v,()=>mayWrite(scopedStorage(),cad,id));if(result.readOnly)callbacks.status(id,{ready:true,pending:false,connected:false,readOnly:true,error:result.reason});policies.set(id,{readOnly:result.readOnly,reason:result.reason});return root},canWrite:(id:ModuleId)=>policies.has(id)&&!policies.get(id)!.readOnly&&mayWrite(scopedStorage(),cad,id),policy:(id:ModuleId)=>policies.get(id),get cadastro(){return cad},get usuario(){return mode?(cad?.usuarios||[]).find((u:Json)=>String(u.codigo)===(localStorage.getItem('vac.platform.demo.user')||'9001'))||null:sessionUser(scopedStorage(),cad)},status:(id:ModuleId,s:EngineStatus)=>callbacks.status(id,{...s,...(policies.get(id)?.readOnly?{readOnly:true,error:policies.get(id)!.reason}:{})}),changed:()=>callbacks.changed(),link:(id:ModuleId,route='')=>appLink(id,route),scope:identity};
 (window as any).vacAppHost=host;
 if(demo)(window as any).vacDemoHost={id:identity,storage:{get length(){return memory.size},key:(i:number)=>[...memory.keys()][i]??null,getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v);if(k.includes('base.'))queueMicrotask(()=>callbacks.changed())},removeItem:(k:string)=>memory.delete(k)},base:location.href,link:appLink,navegar:(id:ModuleId,route:string)=>callbacks.navigate(id,undefined,route),sair:()=>callbacks.demonstrate(),reiniciar:()=>{if(confirm('Reiniciar o cenário fictício de todos os módulos?')){memory.clear();location.reload()}}};
 else delete(window as any).vacDemoHost;
 if(storageListener)window.removeEventListener('storage',storageListener);
 storageListener=(event:StorageEvent)=>{const prefix='vac.app.'+session+'.';if(event.key?.startsWith(prefix))publishStorage(null,event.key.slice(prefix.length),event.newValue,event.oldValue)};
 window.addEventListener('storage',storageListener);
 return()=>{if(storageListener)window.removeEventListener('storage',storageListener);storageListener=null};

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
export async function engineHtml(id:ModuleId,route:string):Promise<string>{if(!mode&&root)await (window as any).vacAppHost.safeFolder(id);if(!textCache.has(id)){const bytes=Uint8Array.from(atob(compressed[id]),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));textCache.set(id,await new Response(stream).text())}
 const config={id,route,demo:mode,scope:session};const prelude='<script>('+runtimePrelude.toString()+')('+JSON.stringify(config).replace(/</g,'\\u003c')+');<\/script>';
 return textCache.get(id)!.replace(/<head(?:\s[^>]*)?>/i,m=>m+prelude).replace('</head>','<style>'+embeddedCss+'</style></head>');
}
export function routeEngine(id:ModuleId,tab:string,hash?:string,context?:{from:string;to:string;turno:string}){const w=frames.get(id)?.contentWindow as any;return w?.vacPagina?.ir(tab,hash,context)}
export function openOrder(id:ModuleId,code:string){const w=frames.get(id)?.contentWindow as any;w?.vacPagina?.abrirOrdem(code)}
export function refreshEngine(id:ModuleId){const w=frames.get(id)?.contentWindow as any;return w?.vacPagina?.atualizar()}
export async function connectEngine(id:ModuleId){const w=frames.get(id)?.contentWindow as any;if(!w?.vacPagina)throw new Error('Contrato indisponível.');await w.vacPagina.conectar(await (window as any).vacAppHost.safeFolder(id));}
export function hasPending(){return[...frames.values()].some(f=>{try{const api=(f.contentWindow as any)?.vacPagina;return !api||api.pendente()}catch{return true}})}
const embeddedCss=`
html,body{margin:0!important;padding:0!important;height:auto!important;min-height:0!important;min-width:0!important;font-family:var(--f-body)!important;background:var(--bg)!important}
.vsuite,.vpage,nav.vtabs,#vacDemoBar,#sysNav,#vacGuiaBotao,body>.testbar{display:none!important}
body>header,body>.top,body>.head,body>.sysbar,body>nav,#nav,#vdsTop,#vdsPag{display:none!important}
body main,#main,main.wrap{max-width:none!important;width:auto!important;min-height:0!important;margin:0!important;padding:16px 20px!important}
#vacEngineActions{display:flex;justify-content:flex-end;gap:8px;padding:10px 20px 0}#vacEngineActions .vacts{display:flex;gap:6px;flex-wrap:wrap}body>footer{display:none!important}.card,.mod{border-radius:12px!important;box-shadow:none!important}.filters{border-radius:10px!important}button,input,select,textarea{font-family:inherit!important}
.vlog{align-items:start!important}.vlog .vl-d{max-height:calc(100vh - 32px);overflow-y:auto!important}
#vac-entrada{position:fixed!important;inset:0!important}.banner.demo{display:none!important}
@media(max-width:650px){body main,#main,main.wrap{padding:10px!important}}
`;
// This function is serialized into srcdoc: it must not capture module variables.
function runtimePrelude(config:{id:string;route:string;demo:boolean;scope:string}){
 const W=window as any,host=(parent as any).vacAppHost;W.__vacEmbedded=true;
 let disposed=false;const intervals=new Set<number>(),timeouts=new Set<number>(),observers=new Set<any>();
 const interval=W.setInterval.bind(W),timeout=W.setTimeout.bind(W);
 W.setInterval=(fn:any,ms?:number,...args:any[])=>{const id=interval(fn,ms,...args);intervals.add(id);return id};
 W.setTimeout=(fn:any,ms?:number,...args:any[])=>{let id:number;id=timeout((...a:any[])=>{timeouts.delete(id);if(!disposed)fn(...a)},ms,...args);timeouts.add(id);return id};
 for(const kind of ['MutationObserver','ResizeObserver']){const Original=W[kind];if(Original)W[kind]=class extends Original{constructor(fn:any){super(fn);observers.add(this)}}}
 W.__vacRuntimeDispose=()=>{disposed=true;for(const id of intervals)clearInterval(id);for(const id of timeouts)clearTimeout(id);for(const observer of observers)observer.disconnect();intervals.clear();timeouts.clear();observers.clear()};
 const append=Node.prototype.appendChild;
 Node.prototype.appendChild=function<T extends Node>(node:T):T{
  const script=node as any,src=script.tagName==='SCRIPT'&&script.getAttribute('src');
  const name=src&&(/xlsx(?:\.full)?(?:\.min)?\.js/i.test(src)?'xlsx':/autotable/i.test(src)?'autotable':/jspdf/i.test(src)?'jspdf':null);
  if(name){script.removeAttribute('src');host.library(name).then((code:string)=>{if(disposed)return;script.textContent=code;append.call(this,node);W.vacPagina?.bibliotecaCarregada();script.dispatchEvent(new Event('load'))}).catch(()=>{if(!disposed)script.dispatchEvent(new Event('error'))});return node}
  return append.call(this,node) as T;
 };

 document.addEventListener('DOMContentLoaded',()=>{const style=document.createElement('style');style.textContent=host.styles;document.head.appendChild(style)},{once:true});
 const rawHistory={replace:history.replaceState.bind(history),push:history.pushState.bind(history)};
 for(const [k,fn] of [['replaceState',rawHistory.replace],['pushState',rawHistory.push]] as const)history[k]=function(state:any,title:string,url?:string|URL|null){const text=String(url??''),n=text.indexOf('#');return fn(state,title,'about:srcdoc'+(n<0?'':text.slice(n)))};
 if(config.route)location.hash=config.route.startsWith('#')?config.route:'#'+config.route;
 if(!config.demo){
  const raw=window.localStorage,prefix='vac.app.'+config.scope+'.',methods={getItem(k:string){if(k==='vac.cadastros')return host.cadastro?JSON.stringify(host.cadastro):raw.getItem(prefix+k);return raw.getItem(prefix+k)},setItem(k:string,v:string){const old=raw.getItem(prefix+k);if(old===String(v))return;raw.setItem(prefix+k,String(v));host.storage(config.id,k,String(v),old)},removeItem(k:string){const old=raw.getItem(prefix+k);if(old===null)return;raw.removeItem(prefix+k);host.storage(config.id,k,null,old)},key(i:number){return Object.keys(raw).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length)??null}};
  Object.defineProperty(window,'localStorage',{configurable:true,get:()=>new Proxy(methods,{get:(t,k)=>k==='length'?Object.keys(raw).filter(x=>x.startsWith(prefix)).length:typeof k==='string'&&k in t?(t as any)[k]:methods.getItem(String(k)),set:(_,k,v)=>{methods.setItem(String(k),v);return true}})});
  const op=indexedDB.open.bind(indexedDB),del=indexedDB.deleteDatabase.bind(indexedDB);indexedDB.open=(n:string,v?:number)=>v===undefined?op(prefix+n):op(prefix+n,v);indexedDB.deleteDatabase=(n:string)=>del(prefix+n);
  W.showDirectoryPicker=async()=>structuredClone(await host.safeFolder(config.id));
  // Interceptar no realm do motor preserva handles nativos e sua clonagem no IndexedDB.
  const guard=()=>{if(!host.canWrite(config.id))throw new DOMException(host.policy(config.id)?.reason||'Sessão ou perfil não permite gravar.','NotAllowedError')};
  for(const proto of [W.FileSystemFileHandle?.prototype,W.FileSystemDirectoryHandle?.prototype]){if(!proto)continue;for(const key of ['createWritable','removeEntry','remove','move']){const original=proto[key];if(original)proto[key]=function(...args:any[]){guard();return original.apply(this,args)}}}
  const dp=W.FileSystemDirectoryHandle?.prototype;if(dp)for(const key of ['getFileHandle','getDirectoryHandle']){const original=dp[key];dp[key]=function(name:string,options?:any){if(options?.create&&!host.canWrite(config.id))return original.call(this,name);return original.call(this,name,options)}}
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
 function report(){try{host.status(config.id,{ready:true,pending:pending(),connected:connected(),tabs:api().abas(),commands:api().comandos(),info:api().info()})}catch(e){host.status(config.id,{ready:true,pending:true,connected:false,error:(e as Error).message})}}
 let attempts=0;const timer=setInterval(()=>{if(!ready()){if(++attempts>150){clearInterval(timer);host.status(config.id,{ready:false,pending:false,connected:false,error:'O módulo não concluiu a abertura.'})}return}clearInterval(timer);
  document.documentElement.dataset.theme=(parent.document.documentElement.dataset.theme||'light');
  const resize=()=>{const modal=[...document.querySelectorAll('.vlog,.overlay,.modal.on')].some(e=>e.getClientRects().length>0);host.resize(config.id,Math.ceil(Math.max(360,document.body.getBoundingClientRect().height,modal?Math.min(1000,parent.innerHeight-110):0)))};new ResizeObserver(resize).observe(document.body);resize();
  route('',config.route||undefined);report();
  setInterval(()=>report(),1800);
 },200);
 window.addEventListener('beforeunload',e=>{if(pending()){e.preventDefault();e.returnValue=''}});
}

function scopedStorage(){return{getItem:(key:string)=>localStorage.getItem('vac.app.'+session+'.'+key)}}
export function currentUser(){return mode?(window as any).vacAppHost?.usuario:sessionUser(scopedStorage(),cad)}

function publishStorage(origin:ModuleId|null,key:string,value:string|null,old:string|null){
 if(key==='vac.cadastros'&&value){try{const next=JSON.parse(value);if(next.schema==='vac-cadastros'&&(!cad||+next.rev>=+cad.rev)&&JSON.stringify(next)!==JSON.stringify(cad)){cad=next;callbacks.cadastro?.(next)}}catch{}}
 for(const [id,frame]of frames){if(id===origin)continue;const win=frame.contentWindow;if(win)win.dispatchEvent(new StorageEvent('storage',{key,newValue:value,oldValue:old}));}
 if(['vac.cadastros','vac.sessao','vac.userId'].includes(key))callbacks.changed();
}

const libraryRequests=new Map<string,Promise<string>>();
function loadLibrary(name:string){if(!Object.hasOwn(shared,name))return Promise.reject(new Error('Biblioteca não incorporada: '+name));if(!libraryRequests.has(name))libraryRequests.set(name,decode((shared as Record<string,string>)[name]));return libraryRequests.get(name)!}
