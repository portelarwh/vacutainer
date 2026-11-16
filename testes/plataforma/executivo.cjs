// Jornadas reais no HTML único; somente demonstração e OPFS fictícios.
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../../scripts/html.cjs');
(async()=>{
 const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(fs.readFileSync(H.FILE))});let browser;
 try {
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
  const output=path.join(__dirname,'../saida/plataforma/executivo');fs.mkdirSync(output,{recursive:true});
  for(const width of [390,768,1440,1920])for(const theme of ['light','dark']) {
   const context=await browser.newContext({viewport:{width,height:width===390?844:1080},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],remote=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:'))remote.push(r.url())});
   await context.addInitScript(theme=>{localStorage.setItem('vac.platform.demo.theme',theme);window.print=()=>{}},theme);
   await page.goto('http://127.0.0.1:'+server.address().port+'/?demo=1');await page.getByRole('heading',{name:'Resultado da fábrica',exact:true}).waitFor();await page.locator('.executive-metrics .metric-value').filter({hasText:'881.000'}).waitFor();await context.setOffline(true);
   const metric=label=>page.locator('.executive-metrics .metric').filter({has:page.locator('.metric-label',{hasText:label})});
   assert.equal(await page.locator('.executive-metrics .metric').count(),4);
   assert.match(await metric('Produção boa').innerText(),/937\.000/);assert.match(await metric('Scrap informado').innerText(),/8\.610/);assert.match(await metric('Paradas registradas').innerText(),/369/);
   assert.match(await page.locator('.safety-strip').innerText(),/1 QN informada/);assert.doesNotMatch(await page.locator('.safety-strip').innerText(),/QN aberta/);
   assert.equal(await page.locator('.priority-table tbody tr').count(),3);assert.equal(await page.locator('.executive-details').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'resumo sem rolagem horizontal '+width);
   assert.ok(await page.locator('.metric-value').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=36),'indicador legível '+width);
   await page.screenshot({path:path.join(output,theme+'-'+width+'.png'),fullPage:true});
   const openMetric=page.getByRole('button',{name:'Abrir OEE publicado',exact:true});
   assert.ok(await openMetric.evaluate(e=>e.getBoundingClientRect().height>=44),'card inteiro clicável');
   await openMetric.focus();assert.ok(await openMetric.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2),'foco visível no indicador');
   if(width===1440 && theme==='light') {
    await openMetric.press('Enter');const iframe=page.locator('iframe[title="Módulo Produção"]');await iframe.waitFor();const f=await(await iframe.elementHandle()).contentFrame();await f.waitForFunction(()=>vacPagina.pronto());
    await f.locator('#selDate').waitFor();assert.equal(await f.locator('#selDate').inputValue(),await page.evaluate(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}));
    await page.evaluate(()=>location.hash='#/inicio');await page.getByRole('heading',{name:'Resultado da fábrica',exact:true}).waitFor();
    await page.getByRole('button',{name:'Ver hora a hora',exact:true}).click();
    await f.waitForFunction(()=>App.route==='hourly');
    assert.equal(await f.evaluate(()=>App.sel.date),await page.evaluate(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}));
    await page.evaluate(()=>location.hash='#/inicio');await page.getByRole('heading',{name:'Resultado da fábrica',exact:true}).waitFor();

   }

   await page.getByRole('button',{name:'Detalhado',exact:true}).click();assert.equal(await page.locator('.executive-details tbody tr').count(),1);assert.ok(await page.locator('.priority-table tbody tr').count()>3);
   await page.getByRole('button',{name:'Resumo',exact:true}).click();assert.equal(await page.locator('.executive-details').count(),0);
   await page.getByRole('combobox',{name:'Turno',exact:true}).selectOption('T2');assert.match(await metric('Produção boa').innerText(),/432\.000/);assert.match(await metric('Scrap informado').innerText(),/5\.383/);assert.match(await page.locator('.safety-strip').innerText(),/0 acidente/);
   await page.getByRole('combobox',{name:'Turno',exact:true}).selectOption('');
   // O relatório executivo carrega o mesmo recorte e as mesmas unidades do dashboard.
   const popupPromise=page.waitForEvent('popup');await page.locator('.heading-actions').getByRole('button',{name:'Exportar resumo',exact:true}).click();const report=await popupPromise;await report.waitForLoadState('domcontentloaded');
   const reportRows=await report.locator('tbody tr').allTextContents();assert.ok(reportRows.some(r=>r.includes('881.000 peças')));assert.ok(reportRows.some(r=>r.includes('8.610 peças')));assert.ok(reportRows.some(r=>r.includes('369 min')));assert.ok(reportRows.some(r=>r.includes('1 QN informada')));await report.close();
   if(width>760)await page.getByRole('group',{name:'Períodos de consulta'}).getByRole('button',{name:'Personalizado',exact:true}).click();else await page.getByRole('combobox',{name:'Período',exact:true}).selectOption('custom');
   await page.locator('input[aria-label="De"]').fill('2025-01-01');
   await page.locator('input[aria-label="Até"]').fill('2025-01-02');assert.match(await metric('Paradas registradas').innerText(),/—/);assert.doesNotMatch(await page.locator('.safety-strip').innerText(),/0 acidente/);assert.match(await page.locator('.safety-strip').innerText(),/Não informado/);
   await page.locator('input[aria-label="De"]').fill('2025-01-03');await page.getByText('A data inicial deve ser anterior ou igual à data final.',{exact:true}).waitFor();assert.equal(await page.locator('.heading-actions').getByRole('button',{name:'Exportar resumo',exact:true}).isDisabled(),true);
   assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);console.log('ok executivo '+width+' '+theme+': números, SQDCP, detalhe, filtros, cobertura, impressão e offline');await context.close();
  }
  // Nove módulos: tipografia consistente e operações continuam acessíveis.
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/?demo=1');
  for(const m of H.registry()) {
   await page.evaluate(id=>location.hash='#/'+id,m.id);const iframe=page.locator('iframe[title="Módulo '+m.name+'"]');await iframe.waitFor();const f=await(await iframe.elementHandle()).contentFrame();await f.waitForFunction(()=>vacPagina.pronto());
   assert.ok(await f.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize)>=15),m.id+' corpo de texto legível');
   assert.equal(await f.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bd-blue').trim()),'#044ED7');
   const input=f.locator('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):visible,select:visible').first();
   if(await input.count())assert.ok(await input.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=15),m.id+' campo legível');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),m.id+' não alarga a plataforma');
   await page.screenshot({path:path.join(output,'modulo-'+m.id+'.png')});
  }
  await context.close();console.log('ok nove módulos com paleta preservada, texto e campos legíveis');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
