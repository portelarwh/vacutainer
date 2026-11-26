// Bases fictícias geradas pelas factories/exports atuais. Não lê nem grava bases reais.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),generate=require('./generate-fixtures.cjs');
const {integral,filled}=require('./base-integral.cjs');
const files={portal:'portal-base.json',oee:'oee-vacutainer-base.json',perdas:'perdas-base.json',gel:'fifo-base.json',paradas:'paradas-base.json',equip:'equipamentos-base.json',inic:'iniciativas-base.json',linha:'linha360-base.json',cad:'vacutainer-cadastros.json'};
(async()=>{const atual=await generate();filled(atual.bases);const fixture={...atual,bases:structuredClone(require('../bases/consolidacao-referencia.json').bases)};filled(fixture.bases);const html=fs.readFileSync(path.resolve(__dirname,'../../Plataforma.html')),server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});let browser;
 try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
 async function open(bases){const context=await browser.newContext({timezoneId:'UTC'}),page=await context.newPage();await page.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));page.on('dialog',d=>d.dismiss());await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.evaluate(async({bases,files})=>{const root=await(await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio',{create:true}),dir=await root.getDirectoryHandle('00. Bases',{create:true});for(const[id,file]of Object.entries(files)){if(!bases[id])continue;const w=await(await dir.getFileHandle(file,{create:true})).createWritable();await w.write(JSON.stringify(bases[id]));await w.close()}window.fixtureDir=dir;window.showDirectoryPicker=async()=>root;},{bases,files});const conectar=page.locator('.heading-actions').locator('[data-act="connect"]');assert.equal((await conectar.innerText()).trim(),'Conectar pasta da rede','LANC-03: sem pasta, Conectar pasta da rede');await conectar.click();await page.locator('.folder-info strong').filter({hasText:'Somente-Ficticio'}).waitFor();assert.equal((await conectar.innerText()).trim(),'Trocar pasta','com pasta, Trocar pasta');return{page,context}}
 const {page,context}=await open(fixture.bases);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{location.hash='#/oee'});const initialFrame=page.locator('iframe[title="Módulo Produção"]');await initialFrame.waitFor();const initial=await(await initialFrame.elementHandle()).contentFrame();await initial.waitForFunction(()=>window.vacPagina?.conectado());
 const denied=await initial.evaluate(async()=>{try{const dir=await window.showDirectoryPicker(),base=await dir.getDirectoryHandle('00. Bases'),f=await base.getFileHandle('oee-vacutainer-base.json');await f.createWritable();return 'PERMITIU'}catch(e){return e.name}});assert.equal(denied,'NotAllowedError');console.log('ok sem sessão: nenhuma gravação física');
 await page.evaluate(()=>{const prefix='vac.app.'+vacAppHost.scope+'.';localStorage.setItem(prefix+'vac.userId','9099');localStorage.setItem(prefix+'vac.user','Pessoa Fictícia de Verificação');localStorage.setItem(prefix+'vac.sessao',JSON.stringify({id:'9099',ate:Date.now()+3600000}));});
 for(const entry of fixture.manifest.files.filter(f=>f.id!=='projetos')){
  const before=fixture.bases[entry.id];await page.locator('.sidebar').getByRole('button',{name:entry.id==='portal'?'Administração':({oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',paradas:'Paradas',equip:'Equipamentos',inic:'Iniciativas / Ações',linha:'Linha 360°'})[entry.id],exact:true}).click();
  const title=entry.id==='portal'?'Administração':({oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',paradas:'Paradas',equip:'Equipamentos',inic:'Iniciativas / Ações',linha:'Linha 360°'})[entry.id];const iframe=page.locator('iframe[title="Módulo '+title+'"]');await iframe.waitFor();const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>window.vacPagina?.conectado());
  const baseline=await page.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()),files[entry.id]);
  // Base gravada por outra versão: alguns motores regravam ao conectar só para atualizar o resumo (exports) e o carimbo
  // de quem gravou. Os dados têm de continuar iguais; o exports novo tem de ser da versão atual.
  const versaoBase=before.appVersion||before.applicationVersion,atualizou=!!versaoBase&&versaoBase!==entry.version&&JSON.stringify(before.exports)!==JSON.stringify(baseline.exports);
  if(atualizou){const semResumo=b=>({...b,exports:undefined,revBy:undefined});assert.equal((baseline.exports||{}).appVersion||baseline.appVersion,entry.version,entry.id+' exports atualizado na conexão');integral(semResumo(before),semResumo(baseline),entry.id+' conexão (só o resumo atualizado)')}
  else integral(before,baseline,entry.id+' conexão');
  const expected=structuredClone(baseline),text='Alteração fictícia N4 '+entry.id;
  if(entry.id==='oee'){const day=expected.productionDays.find(d=>!d.deleted);day.note=text;day.updatedAt='2026-11-15T12:00:00+00:00';day.updatedBy='Sem nome';day.revision=(day.revision||0)+1;expected.databaseVersion=(expected.databaseVersion||0)+1;expected.lastModifiedAt='2026-11-15T12:00:00+00:00';expected.lastModifiedBy='Sem nome';for(const k of ['unitName','sector','timezone','calendar','users','perfMode','speedLossPremise','coverageMin','divergenceMax','tailMergeMax','pendDaysBack','openHoursAlert','serverBoxQty','serverGapMin','serverHourTol','serverSetupMax','horaExtraMax','planWorkdays','qnProblemas','longStopMin','semaphore','abMotivos','offMotivosProg','offMotivosNP','entryUnit','unitLabel','roundingUnit','roundingVig','continuityMin','foraTurnoDesde'])delete expected.settings[k]}
  else if(entry.id==='portal'){expected.config.notas=expected.config.notas||{};expected.config.notas.n4={texto:text,u:'Pessoa Fictícia de Verificação',t:'2026-11-15T12:00:00.000Z'}}
  else if(entry.id==='perdas')expected.comments[0].texto=text;
  else if(entry.id==='gel')expected.config.notaGeral=text;
  else if(entry.id==='paradas')expected.config.notaN4=text;
  else if(entry.id==='equip')expected.os[0].titulo=text;
  else if(entry.id==='inic')expected.acoes[0].titulo=text;
  else expected.pontos[0].nome=text;
  const reference=await frame.evaluate(async({id,expected,text})=>{
   // Referência calculada ANTES da escrita, sobre a alteração explícita.
   const ex=()=>{
    if(id==='oee'){const x={...expected,settings:db().settings,calendar:db().calendar};for(const k of ['lines','machines','families','catalogs','shifts','targets','downtimeCodes'])x[k]=db()[k];return Exports.build(x)}   // as tabelas de cadastro vêm do cadastro, em memória (não estão no arquivo)
    if(id==='portal')return PAGE.exports(expected);
    if(id==='perdas'){const old=B;try{B=expected;return buildExports()}finally{B=old}}
    if(id==='gel'){const old=snapshotData();try{loadData(expected);return gelExports()}finally{loadData(old)}}
    return calcExports(expected);
   };
   const exportsEsperado=ex();let op=null;
   if(id==='oee'){Actions.setDayField(db().productionDays.find(d=>!d.deleted).id,'note',text);await Store.flush()}
   else if(id==='portal')await Store.commit('Verificação N4',b=>{b.config.notas=expected.config.notas});
   else if(id==='perdas')await commit('Verificação N4',b=>{b.comments[0].texto=text});
   else if(id==='gel'){const ch=newCh();ch.config={notaGeral:text};await fileBackend.commit(ch)}
   else{
    if(id==='paradas')op={k:'cfg',key:'notaN4',v:text};
    else if(id==='equip')op={k:'osc',ac:expected.os[0].id,f:{titulo:text}};
    else if(id==='inic')op={k:'campos',ac:expected.acoes[0].id,f:{titulo:text}};
    else op={k:'ponto',it:{id:expected.pontos[0].id,nome:text}};
    Store.commit(op,{silencio:true});op=JSON.parse(JSON.stringify(Store.queue.at(-1)));clearTimeout(Store.t);await Store.save();
   }
   return{exportsEsperado,op:op?JSON.parse(JSON.stringify(op)):null,writer:id==='gel'?FS_WRITER:null};
  },{id:entry.id,expected,text});
  console.log('gravou operação',entry.id);
  const saved=await page.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()),files[entry.id]);
  expected.exports=reference.exportsEsperado;
  if(entry.id==='oee'){assert.match(saved.saveId,/^sv_/);assert.notEqual(saved.saveId,baseline.saveId);expected.saveId=saved.saveId;
   // base limpa (bloco 3): as tabelas de cadastro e as marcas de calendário do cadastro não vão para o arquivo gravado
   for(const k of ['lines','machines','families','catalogs','shifts','targets','downtimeCodes'])delete expected[k];expected.calendar=(expected.calendar||[]).filter(x=>x.origin!=='portal');
   // db.timeline é bloco aditivo que a própria Linha do tempo completa (TL.store); a gravação da base não o cria (base limpa: Model.ensure não completa campos).
   }
  const auditKey=entry.id==='oee'?'auditLog':['portal','perdas'].includes(entry.id)?'audit':'auditoria';
  if(Array.isArray(saved[auditKey])){
   const previous=baseline[auditKey]||[],added=saved[auditKey].slice(previous.length);
   assert.deepEqual(saved[auditKey].slice(0,previous.length),previous,entry.id+' histórico anterior');
   assert.equal(added.length,1,entry.id+' uma operação auditada');
   if(reference.op){assert.equal(added[0].id,reference.op.id||reference.op.qid);assert.equal(added[0].k||added[0].acao,reference.op.k);assert.equal(added[0].por,reference.op.por)}
   else assert.match(JSON.stringify(added[0]),entry.id==='oee'?/note|setDayField|day-field/:/Verificação N4/);
   expected[auditKey]=[...previous,...added];
  }
  if(['equip','inic'].includes(entry.id)){const list=entry.id==='equip'?expected.os:expected.acoes;list[0].atualizadaEm=reference.op.em}
  if(['paradas','equip','inic','linha'].includes(entry.id))expected.revBy=reference.op.por||'?';
  if(['portal','perdas'].includes(entry.id))expected.updatedBy='Pessoa Fictícia de Verificação';
  if(entry.id==='gel'){expected.revBy=reference.writer;expected.savedAt='2026-11-15T12:00'}
  assert.equal(saved.appVersion,entry.version,entry.id+' appVersion');
  if(entry.id==='oee')assert.equal(saved.applicationVersion,entry.version,'oee applicationVersion');
  integral(expected,saved,entry.id+' abrir → alterar → gravar → reler');
  console.log('ok abrir/gravar/reler '+entry.id+' '+saved.appVersion+' · '+Object.keys(saved.exports).length+' chaves de exports');
  // R02-B: formulários reais conectados à pasta fictícia, escrita pelo motor e releitura física do JSON.
  if(['paradas','perdas','linha'].includes(entry.id)){
   let record;
   if(entry.id==='paradas'){
    record=await frame.evaluate(()=>{const e=Store.data.eventos[0];abrirEvento(e.id);return e.id});await frame.fill('#tTec','9099');await frame.locator('button',{hasText:/^Salvar$/}).last().dispatchEvent('click');
    await frame.evaluate(async()=>{clearTimeout(Store.t);await Store.save()});
   }else if(entry.id==='perdas'){
    await frame.evaluate(()=>commentForm(B.rows[0].ordem,'',null));await frame.fill('#cmTxt','Autoria por ID em OPFS fictício');await frame.locator('#cmSave').evaluate(el=>el.onclick());
    await frame.waitForFunction(()=>B.comments.some(c=>c.texto==='Autoria por ID em OPFS fictício'));
   }else{
    await frame.evaluate(()=>{App.tab='pessoas';render()});const input=frame.locator('#fPosto input[name^="t_"]').first(),name=await input.getAttribute('name');record=await frame.evaluate(()=>App.posto);await input.fill('9099');await frame.evaluate(async()=>{document.getElementById('fPosto').requestSubmit();clearTimeout(Store.t);await Store.save()});record={id:record,turno:name.slice(2)};
   }
   const persisted=await page.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()),files[entry.id]);
   if(entry.id==='paradas'){assert.equal(persisted.tecnico[record].tecnicoId,'9099');assert.equal(persisted.exports.eventos.find(e=>e.id===record).tecnicoId,'9099')}
   else if(entry.id==='perdas')assert.equal(persisted.comments.find(c=>c.texto==='Autoria por ID em OPFS fictício').userId,'9099');
   else{assert.equal(persisted.postos.find(p=>p.id===record.id).pessoasIds[record.turno],'9099');assert.equal(persisted.exports.postos.find(p=>p.id===record.id).pessoasIds[record.turno],'9099')}
   console.log('ok R02-B '+entry.id+': formulário → gravação do motor → ID preservado no arquivo fictício');
  }
 }
 assert.deepEqual(errors,[]);
 await page.evaluate(async()=>{window.disposed=[];for(const frame of document.querySelectorAll('iframe')){const api=frame.contentWindow.vacPagina,previous=api.descartar;api.descartar=()=>{parent.disposed.push(frame.title);previous()}}const other=await(await navigator.storage.getDirectory()).getDirectoryHandle('Outra-Ficticia',{create:true});await other.getDirectoryHandle('00. Bases',{create:true});window.showDirectoryPicker=async()=>other});
 await page.locator('.heading-actions').getByRole('button',{name:'Trocar pasta',exact:true}).click();await page.locator('.folder-info strong').filter({hasText:'Outra-Ficticia'}).waitFor();assert.equal(await page.evaluate(()=>disposed.length),8,'descarte dos oito motores antes de mudar escopo');console.log('ok oito motores descartam timers e observers ao mudar de pasta');
 await context.close();
 // Cada módulo recebe uma base futura. A tentativa de escrita é impedida no File System Access.
 for(const entry of fixture.manifest.files.filter(f=>f.id!=='projetos')){const bases=structuredClone(fixture.bases);bases[entry.id].appVersion='99.0.0';const {page:p,context:c}=await open(bases);await p.evaluate(()=>{const prefix='vac.app.'+vacAppHost.scope+'.';localStorage.setItem(prefix+'vac.userId','9099');localStorage.setItem(prefix+'vac.user','Pessoa Fictícia de Verificação');localStorage.setItem(prefix+'vac.sessao',JSON.stringify({id:'9099',ate:Date.now()+60000}));});await p.evaluate(id=>{location.hash='#/'+id},entry.id);const el=p.locator('iframe').first();await el.waitFor();const f=await(await el.elementHandle()).contentFrame();await f.waitForFunction(()=>window.vacPagina?.pronto());await p.getByText(/mais nova que o motor/).first().waitFor();
  const result=await f.evaluate(async file=>{try{const dir=await window.showDirectoryPicker();const h=await(await dir.getDirectoryHandle('00. Bases')).getFileHandle(file);await h.createWritable();return 'PERMITIU'}catch(e){return e.name}},files[entry.id]);assert.equal(result,'NotAllowedError');assert.equal(await p.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()).appVersion,files[entry.id]),'99.0.0');console.log('ok versão futura sem gravação '+entry.id);await c.close();
 }
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
