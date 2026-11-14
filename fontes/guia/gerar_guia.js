// Guia do produto único. Sem conexão a bases, capturas de dados ou navegador.
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'nova-plataforma/src/generated/manifest.json'),'utf8'));
let html=fs.readFileSync(path.join(__dirname,'guia_modelo.html'),'utf8');
const token='@@REVISAO@@';if(html.split(token).length!==2)throw new Error('Marcador de revisão deve existir exatamente uma vez.');
html=html.replace(token,manifest.revision.slice(0,7));fs.writeFileSync(path.join(root,'Guia de instalação.html'),html);console.log('Guia atualizado para Plataforma.html · '+manifest.revision.slice(0,7));
