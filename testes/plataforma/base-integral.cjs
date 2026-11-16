const assert=require('node:assert/strict');
// Controles apenas na raiz; campos homônimos dentro dos históricos são dados.
const controls=new Set(['rev','revId','revAt','updatedAt','appVersion','applicationVersion']);   // applicationVersion: carimbo de versão da Produção (o equivalente do appVersion)
function normalize(value,path=[]){if(Array.isArray(value))return value.map((v,i)=>normalize(v,[...path,String(i)]));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!(path.length===0&&controls.has(k))&&!(path.join('.')==='exports'&&k==='geradoEm')).map(([k,v])=>[k,normalize(v,[...path,k])]));return value}
function integral(before,after,label){assert.deepEqual(normalize(JSON.parse(JSON.stringify(after))),normalize(JSON.parse(JSON.stringify(before))),label+' mudou conteúdo fora da alteração esperada')}
function filled(bases){const arrays={oee:'productionDays',perdas:'comments',gel:'lps',paradas:'eventos',equip:'os',inic:'acoes',linha:'pontos'};for(const[id,key]of Object.entries(arrays))assert.ok(bases[id]?.[key]?.length,id+'.'+key+' precisa estar preenchido');assert.ok(bases.portal?.config,'Portal sem configuração');assert.ok(bases.cad?.turnos?.length,'cadastro sem turnos')}
module.exports={normalize,integral,filled};
