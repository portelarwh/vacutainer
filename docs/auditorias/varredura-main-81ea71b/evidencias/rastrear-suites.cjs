// Instrumentação externa: registra as saídas sem mudar os testes nem seus resultados.
if(process.argv[1] && process.argv[1].endsWith('/testes/tudo.js')){
 const cp=require('child_process'),fs=require('fs'),path=require('path');
 const original=cp.spawnSync,OUT=__dirname,results=[];
 cp.spawnSync=function(command,args,opts){
  const start=Date.now(),result=original.call(this,command,args,opts);
  if(command===process.execPath && args?.[0]?.endsWith('.js')){
   const name=path.basename(args[0],'.js'),num=results.filter(r=>r.suite===name).length+1;
   const output=String(result.stdout||'')+String(result.stderr||'');
   const log=name+(num>1?'-tentativa'+num:'')+'.log';fs.writeFileSync(path.join(OUT,log),output);
   results.push({suite:name,tentativa:num,exit_code:result.status,segundos:Math.round((Date.now()-start)/100)/10,checagens_ok:(output.match(/^ok\s/gm)||[]).length,falhas:output.split('\n').filter(l=>/^FALHA|^NÃO VERIFICADO/.test(l)),erro:result.error?.message||null,log});
   fs.writeFileSync(path.join(OUT,'suites.json'),JSON.stringify(results,null,2));
  }
  return result;
 };
}
