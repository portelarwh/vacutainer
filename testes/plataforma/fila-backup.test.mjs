import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import helpers from '../../scripts/html.cjs';

const common=helpers.current().text('comum/bases');
function memoryStorage(values={}) {
  const data=new Map(Object.entries(values));
  return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
}
function lockService() {
  let tail=Promise.resolve();
  return {request(_key,run){const pending=tail.then(run);tail=pending.catch(()=>{});return pending;}};
}
function code(name) {
  const match=common.match(new RegExp('const '+name+' = \\(\\(\\) => \\{[\\s\\S]*?\\n\\}\\)\\(\\);'));
  assert.ok(match,name+' ausente do código do produto');return match[0]+';'+name;
}
function pessoa(cadastro) {
  return vm.runInNewContext(code('vacPessoa'),{vacCad:()=>cadastro,localStorage:memoryStorage()});
}
function station({id='estacao-a',storage=memoryStorage({'vac.backup.estacao':id,'vac.userId':id}),locks=lockService(),clock={value:Date.parse('2026-11-16T12:00:00Z')}}={}) {
  class Clock extends Date {constructor(...args){super(...(args.length?args:[clock.value]));}static now(){return clock.value;}}
  return vm.runInNewContext(code('vacBackupRegistro'),{localStorage:storage,navigator:locks?{locks}:{},crypto:{randomUUID},Date:Clock,PAGE:{versao:'ficticia'},vacNaoAchou:e=>e?.name==='NotFoundError',console});
}
function folder(initial={}) {
  const data=new Map(Object.entries(initial)),reads=[],writes=[];
  const dir={
    async getFileHandle(name,options){
      if(!data.has(name)){if(!options?.create)throw new DOMException('Ausente','NotFoundError');data.set(name,'');}
      return {
        async getFile(){const snapshot=data.get(name);reads.push(name);return {text:async()=>snapshot};},
        async createWritable(){let next;return {write:async value=>{next=String(value);},close:async()=>{data.set(name,next);writes.push(name);}};}
      };
    },
    async *entries(){for(const name of [...data.keys()])yield [name,{kind:'file',name}];}
  };
  return {dir,data,reads,writes,rows:()=>[...data.values()].flatMap(text=>text.trim()?text.trim().split('\n').map(JSON.parse):[])};
}

test('homônimos sem ID não entram na fila de nenhuma das duas pessoas',()=>{
  const p=pessoa({usuarios:[{codigo:'001',nome:'Pessoa Teste'},{codigo:'002',nome:'Pessoa Teste'}]});
  assert.equal(p.id('Pessoa Teste'),'');
  for(const id of ['001','002'])assert.equal(p.mesma('','Pessoa Teste',id,'Pessoa Teste'),false);
  assert.equal(p.mesma('','Nome não cadastrado','','Nome não cadastrado'),false);
  assert.equal(p.mesma('001','Nome antigo','001','Nome novo'),true);
  assert.equal(p.mesma('001','Pessoa Teste','002','Pessoa Teste'),false);
  assert.ok(p.opcoes().includes('value="001" label="Pessoa Teste"'));
  assert.ok(p.opcoes().includes('value="002" label="Pessoa Teste"'));
});
test('registro só com nome não é ligado a ninguém, nem com nome único (base limpa)',()=>{
  const p=pessoa({usuarios:[{codigo:'0001',nome:'Ana Lima'}]});
  assert.equal(p.id('Ana Lima',''),'');assert.equal(p.nome('','Ana Lima'),'Ana Lima');
  assert.equal(p.mesma('','ana lima','0001','Ana Lima'),false);
  assert.equal(p.mesma('0001','Nome antigo','0001','Ana Lima'),true);
  assert.equal(p.mesma('0001','Ana Lima','1','Ana Lima'),false);
  assert.equal(p.mesma('','','0001','Ana Lima'),false);
});
test('duas estações preservam ambos os eventos sem regravar o log da outra',async()=>{
  const f=folder(),a=station({id:'estacao-a'}),b=station({id:'estacao-b'});
  await Promise.all([a.registrar('paradas',{erro:'falha A',dir:f.dir}),b.registrar('paradas',{erro:'falha B',dir:f.dir})]);
  assert.equal(f.rows().length,2);
  assert.equal(new Set(f.writes).size,2);
  const read=await station({id:'consulta-c'}).ler('paradas',f.dir);
  assert.equal(read.aberta,true);assert.equal(read.erroLeitura,'');
});
test('abas da mesma estação serializam escritas no mesmo log',async()=>{
  const storage=memoryStorage({'vac.backup.estacao':'estacao-a'}),locks=lockService(),f=folder();
  const a=station({storage,locks}),b=station({storage,locks});
  await Promise.all([a.registrar('gel',{erro:'primeira falha',dir:f.dir}),b.registrar('gel',{erro:'segunda falha',dir:f.dir})]);
  assert.equal(f.rows().length,2);assert.equal(new Set(f.writes).size,1);
});
test('sem Web Locks, instâncias diferentes continuam sem compartilhar o arquivo de escrita',async()=>{
  const storage=memoryStorage({'vac.backup.estacao':'estacao-a'}),f=folder();
  await Promise.all([station({storage,locks:null}).registrar('gel',{erro:'falha A',dir:f.dir}),station({storage,locks:null}).registrar('gel',{erro:'falha B',dir:f.dir})]);
  assert.equal(f.rows().length,2);assert.equal(new Set(f.writes).size,2);
});
test('leitura consolida só os logs das estações (o registro-backup.log único saiu), sem escrever durante a consulta',async()=>{
  const legacy=JSON.stringify({em:'2026-11-15T12:00:00Z',pagina:'paradas',ok:false,erro:'erro legado'})+'\n';
  const f=folder({'registro-backup.log':legacy}),s=station();
  await s.registrar('paradas',{ok:true,arquivo:'backup-ficticio.json',dir:f.dir});
  const writes=f.writes.length,r=await s.ler('paradas',f.dir);
  assert.equal(r.aberta,false);assert.equal(r.falha,null);assert.equal(r.ok.arquivo,'backup-ficticio.json');
  assert.equal(f.data.get('registro-backup.log'),legacy);assert.equal(f.writes.length,writes);
});
test('falha sem pasta persiste o aviso de registro só local e permite recuperação posterior',async()=>{
  const clock={value:Date.parse('2026-11-16T12:00:00Z')},s=station({clock}),f=folder();
  const result=await s.registrar('equip',{erro:'sem rede',dir:async()=>{throw new DOMException('Offline','NotAllowedError');}});
  assert.equal(result.soLocal,true);
  const local=await s.ler('equip',null);assert.equal(local.aberta,true);assert.equal(local.falha.soLocal,true);
  clock.value+=1000;await s.registrar('equip',{ok:true,dir:f.dir});assert.equal((await s.ler('equip',f.dir)).aberta,false);
});
test('empate de horário entre estações não esconde falha de backup',async()=>{
  const f=folder();await station({id:'estacao-a'}).registrar('gel',{erro:'falha',dir:f.dir});await station({id:'estacao-b'}).registrar('gel',{ok:true,dir:f.dir});
  assert.equal((await station({id:'consulta-c'}).ler('gel',f.dir)).aberta,true);
});
test('cada estação mantém as 50 últimas linhas e o leitor não duplica o cache',async()=>{
  const f=folder(),clock={value:Date.parse('2026-11-16T12:00:00Z')},s=station({clock});
  for(let n=0;n<55;n++){clock.value+=1000;await s.registrar('gel',{ok:true,arquivo:'ficticio-'+n+'.json',dir:f.dir});}
  const r=await s.ler('gel',f.dir);assert.equal(f.rows().length,50);assert.equal(r.registros.length,50);assert.equal(r.ok.arquivo,'ficticio-54.json');
});
test('um registro corrompido gera aviso sem ocultar os outros logs',async()=>{
  const f=folder({'registro-backup-corrompido.log':'não é JSON\n'}),s=station();
  await s.registrar('gel',{erro:'falha válida',dir:f.dir});const r=await s.ler('gel',f.dir);
  assert.equal(r.aberta,true);assert.match(r.erroLeitura,/corrompido/);assert.equal(r.falha.erro,'falha válida');
});
