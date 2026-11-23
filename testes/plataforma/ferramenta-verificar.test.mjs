import helpers from '../../scripts/html.cjs';
// A ferramenta ferramentas/Verificar-pasta.html usa as mesmas versões do pacote da plataforma e as mesmas pastas de backup das páginas.
import {test} from 'node:test';import assert from 'node:assert/strict';
const html=helpers.current().text('ferramenta/verificar'),manifest=helpers.manifest();
test('Verificar pasta: versões de referência iguais às do pacote da plataforma',()=>{
 const versoes=Function('return '+html.match(/const VERSOES = (\{[^}]*\})/)[1])();
 for(const f of manifest.files.filter(f=>f.id!=='projetos'))assert.equal(versoes[f.id],f.version,'versão de '+f.id);
});
test('Verificar pasta: pastas de backup iguais às declaradas pelas páginas',()=>{
 const pagina={portal:'Portal.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',linha:'Linha-360.html'};
 for(const [mod,arq] of Object.entries(pagina)){
  const dir=helpers.engine(arq).match(/backupDir\s*:\s*['"]00\. Backups\/([^'"]+)/)[1];
  assert.ok(new RegExp("mod: '"+mod+"'[^}]*bk: '"+dir+"'").test(html),mod+' deveria usar 00. Backups/'+dir);
 }
});
