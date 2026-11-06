const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const SP=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1100}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'paginas/Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>enterTest());await p.waitForTimeout(400);
for(const [t,fill] of [['metasOee',{codigo:'OEE-LINHA',nome:'Meta da linha','vigencias.0.oeeMetaPct':'72'}],['metasArea',{codigo:'WASTE-MES',nome:'Perda líquida','vigencias.0.valor':'50000'}],['metasOsm',{codigo:'OSM-OPER',nome:'OSM por operador','vigencias.0.quantidade':'4'}],['precos',{material:'10000001','vigencias.0.preco':'12.35'}]]){
 await p.evaluate(t=>{Lock.on(Cad.D.seguranca.senhaHash);Cad.ui.sec=t;App.show('cad')},t);await p.waitForTimeout(300);await p.click('#cadNovo');await p.waitForTimeout(300);
 for(const [k,v] of Object.entries(fill)){const el=await p.$(`#fBox [data-p="${k}"]`);if(!el){console.log('sem campo',k);continue}const tag=await el.evaluate(e=>e.tagName);if(tag==='SELECT')await el.selectOption(v);else{await el.fill(v);await el.dispatchEvent('change')}}
 await p.waitForTimeout(200);const btn=await p.$('#fSave, #fBox button.p');await btn.click();await p.waitForTimeout(800);
 console.log(t,'→',JSON.stringify(await p.evaluate(t=>(Cad.D[t]||[]).map(x=>({k:x.codigo||x.material,v:x.vigencias.map(v=>{const o={...v};delete o.criadoEm;return o})})),t)),'| erro:',await p.$eval('#fErr',e=>e.innerText).catch(()=>''));await p.evaluate(()=>Modal.close(true))}
console.log(errs.join('\n')||'sem erros');await b.close()})();
