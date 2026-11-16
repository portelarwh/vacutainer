import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import helpers from '../../scripts/html.cjs';
import {verify,updateMetadata} from '../../scripts/verificar.mjs';
const app=helpers.current();
test('fonte única monta os mesmos oito motores operacionais e preserva os nove IDs',()=>{
  const before=JSON.parse(readFileSync('testes/bases/consolidacao-motores.json','utf8'));
  assert.equal([...app.sources.keys()].filter(k=>k.startsWith('motor/')).length,9);
  // consolidacao-motores.json é o registro do dia da consolidação (mesmos IDs e arquivos de antes).
  // Depois dela os motores evoluem: cada motor montado tem de bater com o hash do manifesto incorporado.
  const manifesto=JSON.parse(app.text('dados/manifesto'));
  assert.deepEqual(Object.keys(before).sort(),[...app.sources.keys()].filter(k=>k.startsWith('motor/')).map(k=>k.slice(6)).sort());
  for(const [id,record]of Object.entries(before)){const m=manifesto.files.find(f=>f.id===id);assert.ok(m,id);assert.equal(helpers.registry().find(r=>r.id===id).file,record.file,id);
    assert.equal(createHash('sha256').update(app.assemble('motor/'+id)).digest('hex'),m.sha256,id)}
  for(const folder of ['paginas','fontes','nova-plataforma'])assert.equal(existsSync(path.join(helpers.ROOT,folder)),false);
});
test('texto de código e HTML interno preservam & e fechamento de textarea',()=>{
  const original='A &amp; B & C </textarea> <script>"<&"</script>';
  const document='<textarea data-vac-source="teste" spellcheck="false">'+helpers.encode(original)+'</textarea>';
  assert.equal(helpers.parse(document).get('teste'),original);
});
test('fragmentos ausentes, cíclicos ou duplicados são rejeitados',()=>{
  assert.throws(()=>helpers.assemble(new Map([['a','@@vac:b@@']]),'a'),/ausente/);
  assert.throws(()=>helpers.assemble(new Map([['a','@@vac:b@@'],['b','@@vac:a@@']]),'a'),/circular/);
  const block='<textarea data-vac-source="a" spellcheck="false">A</textarea>';
  assert.throws(()=>helpers.parse(block+block),/duplicada/);
});
test('metadados e dependências escondidas não passam como HTML válido',()=>{
  const changed=helpers.fromHtml(app.html.replace('data-vac-source="motor/gel"','data-vac-source="motor/gel-ausente"'));
  assert.throws(()=>verify(changed),/ausente/);
  assert.throws(()=>verify(helpers.fromHtml(app.html.replace('<head>','<head><script src="Portal.html"></script>'))),/externo/);
});
test('atualização de metadados recusa JavaScript quebrado e não reescreve o arquivo',()=>{
  const before=readFileSync(helpers.FILE,'utf8');
  const broken=helpers.fromHtml(app.html.replace('data-vac-source="modulo/main" spellcheck="false">','data-vac-source="modulo/main" spellcheck="false">const = ;'));
  assert.throws(()=>updateMetadata(broken),/JavaScript inválido/);
  assert.equal(readFileSync(helpers.FILE,'utf8'),before);
});
