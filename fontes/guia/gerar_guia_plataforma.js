// Guia auxiliar da plataforma. O guia operacional da raiz permanece intacto até o corte.
// --capturar gera prints reais no Playwright, com dados fictícios e relógio/viewport fixos.
// Sem a opção, compõe deterministicamente o HTML a partir dos prints versionados.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),app=path.join(root,'nova-plataforma'),images=path.join(app,'docs/instalacao');
const args=new Set(process.argv.slice(2));
function inputHash(){const files=['src/App.tsx','src/core/runtime.ts','src/style.css','src/components/ModuleFrame.tsx'];return crypto.createHash('sha256').update(Buffer.concat(files.map(f=>fs.readFileSync(path.join(app,f))))).digest('hex')}
async function capturar(){
 const {chromium}=require('playwright'),options=require('../../nova-plataforma/tests/chromium.cjs');
 const html=fs.readFileSync(path.join(app,'dist/Plataforma.html')),server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});let browser;
 try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(options());const context=await browser.newContext({viewport:{width:1280,height:960},deviceScaleFactor:1,locale:'pt-BR',timezoneId:'America/Sao_Paulo',colorScheme:'light',reducedMotion:'reduce'});const p=await context.newPage();await p.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));fs.mkdirSync(images,{recursive:true});
 const url='http://127.0.0.1:'+server.address().port+'/';await p.goto(url);await p.getByRole('heading',{name:'Sua linha, em um só lugar.'}).waitFor();await p.screenshot({path:path.join(images,'inicio.png'),animations:'disabled',caret:'hide'});
 await p.locator('.sidebar').getByRole('button',{name:'Administração',exact:true}).click();const iframe=p.locator('iframe[title="Módulo Administração"]');await iframe.waitFor();const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>vacPagina.pronto());await frame.evaluate(()=>{Cad.base=cadFix(cadVazio());Cad.base.perfis=clone(DEFAULT_PERFIS);Cad.base.usuarios=[{codigo:'9002',nome:'Pessoa Fictícia',perfil:'CONSULTA',ativo:true}];Cad.recompute();localStorage.setItem('vac.login.forcar','1');vacLogin.abrir()});await frame.locator('#vlId').fill('9002');await frame.locator('#vlId').blur();await p.screenshot({path:path.join(images,'login.png'),animations:'disabled',caret:'hide'});
 fs.writeFileSync(path.join(images,'capturas.json'),JSON.stringify({dados:'ficticios',relogio:'2026-11-15T12:00:00Z',viewport:[1280,960],uiSha256:inputHash()},null,2)+'\n');
 }finally{await browser?.close();server.close()}
}
function compor(){
 const manifest=JSON.parse(fs.readFileSync(path.join(app,'src/generated/manifest.json'),'utf8'));let html=fs.readFileSync(path.join(__dirname,'guia_plataforma.html'),'utf8');
 const replacements={'@@REVISAO@@':manifest.sourceRevision.slice(0,12),'@@PACOTE@@':manifest.enginesSha256.slice(0,12),'@@IMG_INICIO@@':'<img alt="Tela inicial da plataforma, sem base real conectada" src="data:image/png;base64,'+fs.readFileSync(path.join(images,'inicio.png')).toString('base64')+'">','@@IMG_LOGIN@@':'<img alt="Entrada por ID no Portal com dados fictícios" src="data:image/png;base64,'+fs.readFileSync(path.join(images,'login.png')).toString('base64')+'">'};
 for(const [key,value]of Object.entries(replacements)){if(html.split(key).length!==2)throw new Error('Marcador deve existir exatamente uma vez: '+key);html=html.replace(key,value)}
 fs.mkdirSync(path.join(app,'dist'),{recursive:true});fs.writeFileSync(path.join(app,'dist/Instalacao-Plataforma.html'),html);console.log('Guia separado atualizado · Instalacao-Plataforma.html');
}
(async()=>{if(args.has('--capturar'))await capturar();compor()})().catch(e=>{console.error(e.message);process.exitCode=1});
