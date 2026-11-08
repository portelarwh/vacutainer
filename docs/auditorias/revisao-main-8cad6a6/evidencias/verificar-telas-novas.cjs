const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT='/workspace/verificacao-main-8cad6a6',OUT=__dirname;
(async()=>{
 const b=await chromium.launch(),R=[],errors=[];
 for(const width of [1440,390])for(const theme of ['light','dark'])for(const name of ['Iniciativas.html','Equipamentos.html']){
  const c=await b.newContext({viewport:{width,height:900},locale:'pt-BR'});
  await c.addInitScript(t=>localStorage.setItem('vac.theme',t),theme);
  const p=await c.newPage();p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push({name,width,theme,message:e.message}));
  await p.goto('file://'+ROOT+'/paginas/'+encodeURI(name)+'#teste');await p.waitForTimeout(650);
  const tabs=name==='Iniciativas.html'?['acoes','kas','osm','s5','config']:['equip','os','tags','am','config'];
  for(const tab of tabs){
   await p.evaluate(tab=>ir(tab),tab);await p.waitForTimeout(80);
   const m=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,conteudo:document.querySelector('#main').innerText.length}));
   R.push({name,width,theme,tab,...m});
  }
  await p.evaluate(name=>{if(name==='Iniciativas.html'){App.tab='acoes';App.sel=Store.data.acoes[0]?.id}else{App.tab='os';App.osSel=Store.data.os[0]?.id}render()},name);await p.waitForTimeout(100);
  R.push({name,width,theme,tab:'detalhe',...await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,conteudo:document.querySelector('#main').innerText.length}))});
  await p.evaluate(name=>name==='Iniciativas.html'?formAcao(null):formOS(null),name);await p.waitForTimeout(80);
  R.push({name,width,theme,tab:'formulario',...await p.evaluate(()=>{const r=document.querySelector('.mod').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth-innerWidth,modal:{left:r.left,right:r.right,width:innerWidth,role:document.querySelector('.mod').getAttribute('role')}}})});
  if(width===390&&theme==='light')await p.screenshot({path:path.join(OUT,(name==='Iniciativas.html'?'form-acao':'form-os')+'-390.png'),fullPage:true});
  await c.close();
 }
 fs.writeFileSync(path.join(OUT,'telas-novas.json'),JSON.stringify({commit:'8cad6a66816b174c17df39823c31b799ea9b5ce8',cenas:R,erros:errors},null,2));
 console.log(JSON.stringify({cenas:R.length,erros:errors,overflow:R.filter(x=>x.overflow>1),modalFora:R.filter(x=>x.modal&&(x.modal.left<0||x.modal.right>x.modal.width))},null,2));await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
