const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const fs=require('fs');const SS=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+RAIZ+'paginas/Portal.html#geral');await p.waitForTimeout(600);await p.evaluate(()=>enterTest());await p.waitForTimeout(400);
const txt=fs.readFileSync(RAIZ+'testes/amostras/cs12din.txt','utf8');
const P=await p.evaluate(t=>{const P=parseCS12(t);return{cab:P.cab,erros:P.erros,alertas:P.alertas.map(a=>a.campo+': '+a.erro),itens:P.itens.map(r=>[r.nivel,r.numeroItem,r.materialPai,r.componente,r.descricaoComponente,r.quantidadeOriginalTexto,r.quantidadeComponente,r.unidadeComponente,r.unidadeBasicaComponente,r.qtdPorMilheiro,r.qtdPorMilheiroUMB].join(' | '))}},txt);
console.log(JSON.stringify(P,null,1));
await p.evaluate(()=>{Lock.on(Cad.D.seguranca.senhaHash);location.hash='cs12=17132AAB&nome=SOLUCAO+EDTA&tipo=preparacao&un=L'});await p.waitForTimeout(600);
await p.fill('#iTxt',txt);await p.click('#iLer');await p.waitForTimeout(500);
console.log('resumo:',await p.$eval('#iPrev .vig p.small',e=>e.innerText));
console.log('avisos:',await p.$$eval('#iPrev .vig details.cd summary',a=>a.map(x=>x.innerText.replace(/\n/g,' '))).catch(()=>''), '| pill:',await p.$eval('#iPrev .vh',e=>e.innerText.replace(/\n/g,' ')));
console.log('linhas:',await p.$$eval('#iPrev .vig table tr',a=>a.slice(1).map(x=>x.innerText.replace(/\t/g,' | ').replace(/\n/g,' '))));
await p.screenshot({path:SS+'testes/saida/d1.png',fullPage:true});
const go=await p.$('#iGo');if(go){await go.click();await p.waitForTimeout(1200);console.log('bom gravada:',JSON.stringify(await p.evaluate(()=>{const x=cadItem('bom','17132AAB');return x&&x.vigencias[0].itens})));}
console.log(errs.join('\n')||'sem erros');await b.close()})();
