// Fonte e logos oficiais ficam FORA do repositório e do Plataforma.html: numa pasta "Marca" ao lado do arquivo, na rede.
// Com a pasta, a casca e os motores usam a FS Albert Pro e a logo; sem ela, valem Arial e o símbolo em texto (nada quebra).
// Arquivos esperados (os nomes originais do kit de marca): ver docs/MARCA.md.
export const MARCA_DIR='Marca/';
export const MARCA_LOGO={escuro:MARCA_DIR+'BD_1-Color_Reverse_RGB_TransparentBurst.svg',claro:MARCA_DIR+'BD_2-Color_RGB.svg'};
const face=(file:string,weight:string,style:string)=>`@font-face{font-family:"FS Albert Pro";src:local("FSAlbertPro-${file}"),url("${MARCA_DIR}FSAlbertPro-${file}.otf") format("opentype");font-weight:${weight};font-style:${style};font-display:swap}`;
export const marcaCss=face('Regular','300 500','normal')+face('Bold','600 800','normal')+face('Italic','300 500','italic');
export function aplicarMarca(doc:Document=document){if(doc.getElementById('vacMarcaCss'))return;const s=doc.createElement('style');s.id='vacMarcaCss';s.textContent=marcaCss;doc.head.appendChild(s)}
export const marcaUrl=(rel:string)=>{try{return new URL(rel,document.baseURI).href}catch{return rel}};
