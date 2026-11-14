// Substituições estruturais de código nunca podem falhar silenciosamente.
export function replaceOnce(source:string,pattern:RegExp,replacement:(match:string)=>string){
 const scan=new RegExp(pattern.source,pattern.flags.replace(/[gy]/g,'')+'g');const count=[...source.matchAll(scan)].length;
 if(count!==1)throw new Error(`Trecho de integração deve existir exatamente uma vez; encontrado ${count}.`);
 return source.replace(pattern,replacement);
}
