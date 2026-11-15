// A ferramenta ferramentas/Verificar-pasta.html usa as mesmas versões do pacote da plataforma e as mesmas pastas de backup das páginas.
import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const html=readFileSync('../ferramentas/Verificar-pasta.html','utf8'),manifest=JSON.parse(readFileSync('src/generated/manifest.json','utf8'));
test('Verificar pasta: versões de referência iguais às do pacote da plataforma',()=>{
 const versoes=Function('return '+html.match(/const VERSOES = (\{[^}]*\})/)[1])();
 for(const f of manifest.files.filter(f=>f.id!=='projetos'))assert.equal(versoes[f.id],f.version,'versão de '+f.id);
});
test('Verificar pasta: pastas de backup iguais às declaradas pelas páginas',()=>{
 const pagina={portal:'Portal.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',linha:'Linha-360.html'};
 for(const [mod,arq] of Object.entries(pagina)){
  const dir=readFileSync('../paginas/'+arq,'utf8').match(/backupDir\s*:\s*['"]00\. Backups\/([^'"]+)/)[1];
  assert.ok(new RegExp("mod: '"+mod+"'[^}]*bk: '"+dir+"'").test(html),mod+' deveria usar 00. Backups/'+dir);
 }
});
