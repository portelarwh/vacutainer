// HTML realmente colocado no ClipboardItem. Só cenário fictício e clipboard interceptado.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),{chromium}=require('playwright'),H=require('../../scripts/html.cjs');
(async()=>{const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(fs.readFileSync(process.env.PLATAFORMA_HTML||H.FILE))});let browser;
 try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());const context=await browser.newContext(),page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/?demo=1');
  const email={area:'Produção',titulo:'Resumo fictício <turno>',linha:'Linha de teste',periodo:'16/11/2026',resumo:[{rot:'Resultado',txt:'881.000 tubos bons'}],kpis:[{nome:'Produção',valor:'881.000',sub:'tubos'}],status:'Adequado'};
  for(const module of H.registry()){
   await page.evaluate(id=>location.hash='#/'+id,module.id);const el=page.locator('iframe[title="Módulo '+module.name+'"]');await el.waitFor();const frame=await(await el.elementHandle()).contentFrame();await frame.waitForFunction(()=>vacPagina.pronto());
   const copied=await frame.evaluate(async d=>{const previous=navigator.clipboard.write;let result;try{navigator.clipboard.write=async items=>{result={html:await(await items[0].getType('text/html')).text(),text:await(await items[0].getType('text/plain')).text()}};await vacEmail.copiar(d);return result}finally{navigator.clipboard.write=previous}},email);
   assert.ok(copied?.html&&copied.text.includes('881.000'),module.id+' preserva HTML e texto simples');assert.ok(!/<script|<style|display:\s*(flex|grid)/i.test(copied.html));
   const target=await context.newPage();
   // Estilo do editor de destino redefine a cor dos divs. Plataforma 1.8.1: cabeçalho claro com texto azul-marinho explícito (o Outlook novo
   // descartava o branco e deixava título preto sobre azul). Legível também se o editor tirar a cor do texto ou o fundo.
   await target.setContent('<style>body{background:#111;color:#111}div{color:#111}</style>'+copied.html);
   const inspect=()=>{const cell=document.querySelector('td[data-vac-cab]');return{bg:cell&&getComputedStyle(cell).backgroundColor,parts:cell?[...cell.querySelectorAll('div')].map(e=>({text:e.textContent,color:getComputedStyle(e).color,inline:e.style.color,legacy:e.querySelector('font')?.getAttribute('color')})):[],plain:document.body.textContent.includes('881.000 tubos bons'),darkBody:[...document.querySelectorAll('td')].some(e=>e.textContent.trim()==='881.000 tubos bons'&&getComputedStyle(e).color==='rgb(16, 47, 85)')}};
   const r=await target.evaluate(inspect);assert.equal(r.bg,'rgb(234, 242, 250)','fundo claro');assert.equal(r.parts.length,3);assert.equal(r.parts[1].color,'rgb(16, 35, 51)',module.id+' título azul-marinho mesmo com estilo do editor');
   const lum=c=>{const v=c.match(/\d+/g).slice(0,3).map(n=>{n/=255;return n<=0.03928?n/12.92:((n+0.055)/1.055)**2.4});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]},ctr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
   for(const part of r.parts){assert.ok(ctr(part.color,r.bg)>=4.5,module.id+' contraste do cabeçalho: '+part.text);assert.equal(part.inline,part.color,module.id+' cor explícita no texto');assert.ok(/^#[0-9A-F]{6}$/i.test(part.legacy||''),module.id+' cor compatível com editor Office')}
   // se o editor tirar a cor do texto (preto) ou o fundo (branco), continua legível
   assert.ok(ctr('rgb(0, 0, 0)',r.bg)>=7&&ctr(r.parts[1].color,'rgb(255, 255, 255)')>=7,module.id+' legível sem a cor do texto ou sem o fundo');
   assert.ok(r.plain&&r.darkBody,'dados e tinta do conteúdo claro preservados');assert.equal(r.parts[1].text,email.titulo,'escapa HTML sem alterar o título');
   // O HTML colado conserva o par de cores ao alternar o tema do destino.
   await target.emulateMedia({colorScheme:'dark'});assert.ok((await target.evaluate(inspect)).parts.every((p,i)=>p.color===r.parts[i].color));
   await target.close();console.log('ok Outlook '+module.id+': clipboard HTML/texto, cabeçalho claro legível e conteúdo preservado');
  }
  await context.close();
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
