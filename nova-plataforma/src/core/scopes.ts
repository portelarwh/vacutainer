import {dbGet,dbSet,type Directory} from './data';
export type Scope={handle:Directory;scope:string};
export async function scopeFor(handle:Directory,records:Scope[]){
 for(const entry of records)if(await handle.isSameEntry!(entry.handle))return entry.scope;
 const scope=crypto.randomUUID();records.push({handle,scope});return scope;
}
export async function rememberFolder(handle:Directory){
 const records:Scope[]=await dbGet('scopes')||[];
 // Importa a identidade criada pela primeira plataforma, sem perder sua fila.
 if(!records.length){const old=await dbGet('folder'),scope=await dbGet('scope');if(old&&scope)records.push({handle:old,scope})}
 const scope=await scopeFor(handle,records);await dbSet('scopes',records);await dbSet('folder',handle);await dbSet('scope',scope);return scope;
}
async function pendingRecords(scope:string){
 const prefix='vac.app.'+scope+'.',records:any[]=[];
 for(const info of await indexedDB.databases()){
  if(!info.name?.startsWith(prefix))continue;
  const db=await new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open(info.name!);r.onupgradeneeded=()=>r.transaction?.abort();r.onblocked=()=>no(new Error('Banco bloqueado'));r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
  try{for(const store of [...db.objectStoreNames]){
   if(store!=='ops'&&store!=='kv')continue;
   const keys=store==='ops'?[null]:['pending','cadFila','fsPending.reserva'];
   for(const key of keys){const value=await new Promise<any>((ok,no)=>{const tx=db.transaction(store);const req=key===null?tx.objectStore(store).getAll():tx.objectStore(store).get(key);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});if(Array.isArray(value))records.push(...value);else if(value)records.push(value)}
  }}finally{db.close()}
 }
 return records;
}
export async function queuePending(scope:string,storage:Storage=localStorage,read=pendingRecords){
 try{
  const prefix='vac.app.'+scope+'.';
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;const name=key.slice(prefix.length);
   if(name.startsWith('vac.reserva.'))return true;
   if(/\.fila\.reserva$/.test(name)&&JSON.parse(storage.getItem(key)||'[]').length)return true;
   if(name.startsWith('vac.aba.')){const value=JSON.parse(storage.getItem(key)||'{}');if(value.pend&&Date.now()-(+value.t||0)<20000)return true}
  }
  return(await read(scope)).some(v=>!!v&&(!!v.db||v.p!==false));
 }catch{return true}
}
