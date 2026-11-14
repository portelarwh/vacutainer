import type {Directory} from './data';
export function compareVersions(a:string,b:string){
 const parts=(v:string)=>{if(!/^\d+(\.\d+)*$/.test(v))throw new Error('Versão inválida: '+v);return v.split('.').map(Number)};
 const x=parts(a),y=parts(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)>(y[i]||0)?1:-1}return 0;
}
export async function protectFolder(root:Directory,file:string,version:string,canWrite:()=>boolean=()=>true){
 let newer='',readOnly=false;
 // Conferir ambas as localizações antes de qualquer migração automática do kit.
 for(const baseDir of [null,'00. Bases']){try{
  const dir=baseDir?await root.getDirectoryHandle(baseDir):root;
  const base=JSON.parse(await(await(await dir.getFileHandle(file)).getFile()).text());
  const v=base.appVersion||base.exports?.appVersion;
  if(v&&compareVersions(String(v),version)>0){readOnly=true;newer=String(v)}
 }catch(e){if((e as Error).name!=='NotFoundError')throw e}}
 const reason=readOnly?`Base ${newer} mais nova que o motor ${version}. Somente leitura; atualize a plataforma.`:'';
 const cache=new WeakMap<object,any>();
 function wrap(handle:any):any{if(cache.has(handle))return cache.get(handle);
  const guard=()=>{if(readOnly||!canWrite())throw new DOMException(reason||'Sessão ou perfil não permite gravar.','NotAllowedError')};
  const proxy=new Proxy(handle,{get(target,key){
   if(key==='createWritable'||key==='removeEntry'||key==='remove'||key==='move')return async(...args:any[])=>{guard();const value=await target[key](...args);if(key!=='createWritable')return value;return new Proxy(value,{get(s,k){const v=s[k];return typeof v==='function'?(...a:any[])=>{guard();return v.apply(s,a)}:v}})};
   if(key==='getDirectoryHandle'||key==='getFileHandle')return async(name:string,options?:{create?:boolean})=>{if(options?.create)guard();return wrap(await target[key](name,options))};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});cache.set(handle,proxy);return proxy;
 }
 return{folder:wrap(root) as Directory,readOnly,reason};
}
