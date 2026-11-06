const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const SP=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1100}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'paginas/Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>enterTest());await p.waitForTimeout(400);await p.evaluate(()=>{Lock.on(Cad.D.seguranca.senhaHash);Cad.ui.sec='metasOee';App.show('cad')});await p.waitForTimeout(400);
await p.click('#cadNovo');await p.waitForTimeout(400);await p.screenshot({path:SP+'testes/saida/m18.png'});
await p.click('#fBox .ib >> nth=8');await p.waitForTimeout(300);console.log('ajuda:',await p.evaluate(()=>{const x=document.querySelector('.helpbox,.hb,.ibox,[role=tooltip],.helppop');return x?x.innerText.slice(0,200):document.body.innerText.match(/Meta de OEE em %[^\n]*/)?.[0]||'?'}));
console.log(errs.join('\n')||'sem erros');await b.close()})();
