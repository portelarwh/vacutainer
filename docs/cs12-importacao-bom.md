# Importação da lista técnica · CS12 multinível

03/11/2026 · **feito no Portal 1.4** (ajustes na 1.4.2) (Cadastros › Importar do SAP › Lista técnica (CS12)). Complementa o "Cadastro base · contrato" (§ 3.2 bom, § 4.1 importação). Base: especificação "Importação de lista técnica multinível do SAP" (CS12, visualização Estrutura multinível) e o exemplo de lista dinâmica enviado por Pedro (dados fictícios, PF900100).

## 1. Decisão

- **Fonte da BOM do cadastro: só a CS12 "Estrutura multinível"** (lista copiada, .txt, .xlsx/.csv). **A importação pela CS03 saiu do Portal** (decidido em 03/11/2026). Colagem que parece CS03 (sem coluna de nível) mostra: *"O arquivo parece ter sido extraído da CS03. Para cadastrar uma Lista Técnica completa, exporte a estrutura multinível pela transação CS12."* e não grava.
- **Vigência a partir de hoje** (a BOM muda cerca de 1 vez por ano), sem pedir motivo; a data pode ser trocada na tela.
- **Materiais de todos os níveis** entram em Materiais, com `tipoSAP` (ROH, HALB…).
- **CK86 / CK13N**: não entram na BOM. Servem (opcional, depois) para o **custo padrão por material com vigência**, que explica o efeito preço da KKBC.

## 2. Formato da lista dinâmica (visto no exemplo)

```
Material            PF900100
Cent./Util./Alt:    9001 / 1 / 01
Denominação         KIT COLETA ALPHA 12X80 4.0 TAMPA AZUL
Qtd.base      (UN ) 10.000
Qtd.requer.   (UN ) 10.000
|Ní|Item|ID objeto|Texto breve objeto|Dep.|TMat|SM|UMB|Qtd.(UMC)|UM|ItRefCo|B|MatConIt|L|Rel.p/cálc|ProbEmpr|
| 1|0010|SA900110 |TUBO PLASTICO …   |2013|HALB|50|UN |  10.000 |UN|  5,00 | |        |X|X         |      0 |
…  (todos os itens de nível 1 primeiro)
| 1|    |SA900110 |TUBO PLASTICO …   |    |    |  |   |         |  |  0,00 | |        | |          |      0 |   ← marcador de ramo
| 2|0010|MP910001 |RESINA … TIPO A   |2011|ROH |50|KG |  34,500 |KG|  3,00 |1|        |X|X         |    100 |
| 2|0011|MP910002 |RESINA … TIPO B   |2011|ROH |50|KG |         |KG|  3,00 |1|        |X|X         |      0 |   ← alternativo
```

Pontos que a especificação não previa:
1. **Marcador de ramo**: depois de todos os itens de nível 1, cada semiacabado aparece de novo numa linha **sem número de item e sem quantidade**, seguida dos filhos. Essa linha **não é componente**: só define o pai dos níveis seguintes.
2. **Alternativos sem quantidade**: o principal tem `ProbEmpr` 100 e quantidade; os alternativos têm 0 e quantidade vazia, na mesma posição (`0010`, `0011`, `0012`…). Quantidade vazia num alternativo não é erro.
3. **Unidades**: `UMB` = unidade básica do material; `UM` = unidade da quantidade (ex.: UMB L e quantidade em ML). Guardar as duas; converter só quando a conversão é conhecida (ML↔L, G↔KG).
4. **`ItRefCo`** traz um percentual por item que parece o **refugo do componente**; a quantidade (`Qtd.(UMC)`) vem **sem** ele. A KKBC real do 360056 confirma o padrão (tampa 1.315.440 / 1.260.000 = 1,044 → refugo 4,4 %). **A confirmar** com uma CS12 real (§ 5).
5. **Status do material (`SM`)** diferente dos demais (ex.: 80 com os outros em 50): alerta.
6. **Data da explosão** não aparece na lista: usa a data da lista (1ª linha), só como informação.
7. **Divisor**: consumo por 1.000 = quantidade ÷ **Qtd.requer.** × 1.000.

## 3. Como é gravado no cadastro (Portal 1.4)

Cada catálogo continua com `bom.vigencias[]` (formato completo no contrato § 3.2). Dentro da vigência:
- `itens` = **só o nível 1** (o que a ordem consome, comparável à KKBC): `item`, `material`, `qtdPorMilheiro` (na `unidade` = UM), `unidadeBasica`, `perdaPadraoPct` = ItRefCo, `alternativoDe`, `ordem`, `quantidadeOriginalTexto`, `extras`.
- `estrutura` = níveis 2 em diante, com `nivel` e `pai`, quantidade **por 1.000 do produto acabado**.
- Na vigência: `fonte:"CS12"`, `centro`, `utilizacao`, `alternativa`, `quantidadeBase`, `quantidadeRequerida`, `dataExplosao`, `origem`.
- **Quem lê usa só `itens`**; somar `itens` + `estrutura` conta o semiacabado e os insumos dele duas vezes.
- Nova importação = **nova vigência a partir de hoje** (ou da data escolhida), com comparação item a item (chave pai + nível + item + material): novo, sai da BOM, alterado (quantidade, unidade, UMB, alternativo, refugo), igual. Lista igual à vigente não grava.
- Colunas sem campo próprio (`Dep.`, `TMat`, `SM`, `Rel.p/cálc`, `B`, `MatConIt`, `L`…) ficam em `extras` do item.
- Ficha da BOM no Portal: nível 1 editável (com Item, UMB e Refugo %) e **Estrutura · níveis 2+** só para consulta; lista de BOMs com Fonte, Itens N1 e Estrutura.
- Fase seguinte (não feita): semiacabados (`HALB`) com BOM própria, para medir perda na preparação (ex.: solução K2EDTA).

## 4. Leitor (no Portal 1.4; ajustes da 1.4.2)

**Ajustes depois do 1º teste com uma CS12 real (Portal 1.4.2, 03/11/2026):**
- **Títulos parecidos**: se a linha de títulos não tiver o nome exato, o leitor aceita títulos parecidos (quantidade: começa com "Qtd" ou "Quant", menos base/requerida/total/planejada; item: "Item"/"Pos"; descrição: "Texto"/"Denominação"/"Descrição"; UMB; UM/"Unid"; refugo: contém "ref"; probabilidade: contém "prob").
- **Sem coluna de quantidade = um erro só** ("Coluna de quantidade não encontrada", com os títulos lidos); o catálogo não entra e não aparece um aviso por item.
- **SM comparado com a maioria** dos itens da lista (antes: com o primeiro item).
- **Data da explosão**: deixou de ser aviso (a vigência usa a data da tela).
- **Item sem quantidade (ou 0)** que não é alternativo: aviso "Sem quantidade" e entra sem consumo previsto.
- **Prévia**: guia "Como ler" (ⓘ e legenda Erro / Aviso / Info); por catálogo, contagem de erros e avisos e um grupo recolhível por tipo (erros abertos, avisos fechados), cada um com ⓘ explicando o que é e o que fazer. Tipos: coluna de quantidade, cabeçalho incompleto, catálogo não encontrado, níveis da estrutura, valor inválido, regras do cadastro (erros); sem quantidade, SM diferente da maioria, alternativo a conferir, ramo sem componente, linha repetida, coluna opcional (avisos); informação.


Integração no Portal: arquivo `.xlsx`/`.csv` vira o mesmo texto (linhas de cabeçalho com espaços, tabela com `|`, números das células em formato brasileiro); várias listas coladas são separadas em blocos pela linha `Material …`; o catálogo é o Material do cabeçalho sem `NS`. Testado com uma lista no formato do exemplo: 6 itens de nível 1, 5 de nível 2, 2 marcadores de ramo, pais e alternativos corretos, gravação com backup e conferência de rev.

```js
/* ===== Leitor de referência · CS12 "Estrutura multinível" (claude/cs12-importacao-bom.md § 4; lógica sem mudança) =====
   Entrada: texto da lista. Saída: { cab, itens, marcadores, erros, alertas }.
   - cabeçalho: Material, Cent./Util./Alt, Denominação, Qtd.base (UN), Qtd.requer. (UN), data da lista (1ª linha);
   - colunas achadas pelo nome; desconhecidas ficam em "extras" de cada linha;
   - linha SEM número de item = marcador de ramo (repete o semiacabado antes dos filhos): só define o pai, não é componente;
   - pai = paiPorNivel[N-1]; nível que pula (1 → 3) é erro;
   - alternativos: mesmo pai, mesma posição (item 0010/0011/0012…), um com ProbEmpr > 0 (principal) e os outros 0 sem quantidade;
   - quantidade por 1.000 do produto = qtd ÷ Qtd.requer. × 1.000 (na unidade do componente, UM);
   - códigos (material, item, centro, utilização, alternativa) sempre texto; números no formato do SAP em português (1.234,56). */
function parseCS12(txt){
 const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[.\-\/_:()#|*\[\]]/g,' ').replace(/\s+/g,' ').trim();
 const num=s=>{s=String(s??'').trim();if(!s)return null;let neg=false;if(/-$/.test(s)){neg=true;s=s.slice(0,-1)}s=s.replace(/\./g,'').replace(',','.');if(!/^-?\d+(\.\d+)?$/.test(s))return NaN;const n=+s;return neg?-n:n};
 const COLS={nivel:['ni','nivel','nv','niv'],item:['item','n item','no item','n° item','nº item'],componente:['id objeto','n componente','no componente','componente','objeto'],
  descricao:['texto breve objeto','texto breve','denominacao','descricao'],deposito:['dep','deposito'],tipoMaterial:['tmat','tipo material'],statusMaterial:['sm','status material'],
  umb:['umb','um basica','um bas'],qtd:['qtd umc','qtd componente','qtd compon','quantidade componente','qtd'],um:['um','um compon','um componente','umc'],
  refugoPct:['itrefco','refugo comp','refugo componente','ref comp','refugo','refcomp'],prob:['probempr','probabilidade','prob','pro'],relCalculo:['rel p calc','rel calc','relevante calculo'],
  grupoAlt:['grupo de item','grupo alt','grp alt','altit','grupo alternativo']};
 const lines=String(txt).replace(/\r/g,'').split('\n');const cab={},itens=[],marcadores=[],erros=[],alertas=[];let cols=null,head=[],ordem=0;
 const pai=[];const conv={ML:{L:1/1000},L:{ML:1000},G:{KG:1/1000},KG:{G:1000}};
 lines.forEach((ln,i)=>{const t=ln.trim();const L=i+1;if(!t||/^[-=|+_\s]+$/.test(t)||/^<br>$/i.test(t))return;let m;
  if(!cab.dataLista&&(m=t.match(/^(\d{2})\.(\d{2})\.(\d{4})\b/)))cab.dataLista=`${m[3]}-${m[2]}-${m[1]}`;
  if(!t.startsWith('|')){
   if((m=t.match(/^Material\s+(\S+)/i))){cab.material=m[1];return}
   if((m=t.match(/^Cent[^:]*:\s*(\S+)\s*\/\s*(\S+)\s*\/\s*(\S+)/i))){cab.centro=m[1];cab.utilizacao=m[2];cab.alternativa=m[3];return}
   if((m=t.match(/^(Denomina[cç][aã]o|Texto breve)\s+(.+)$/i))){cab.descricao=m[2].trim();return}
   if((m=t.match(/^Qtd\.?\s*base\s*\(\s*(\S+)\s*\)\s*([\d.,]+)/i))){cab.unidadeBase=m[1];cab.quantidadeBaseTexto=m[2];cab.quantidadeBase=num(m[2]);return}
   if((m=t.match(/^Qtd\.?\s*requer\.?\s*\(\s*(\S+)\s*\)\s*([\d.,]+)/i))){cab.unidadeRequerida=m[1];cab.quantidadeRequeridaTexto=m[2];cab.quantidadeRequerida=num(m[2]);return}
   if((m=t.match(/^Data\s+(?:de\s+)?(?:explos[aã]o|validade)?\s*:?\s*(\d{2})\.(\d{2})\.(\d{4})/i)))cab.dataExplosao=`${m[3]}-${m[2]}-${m[1]}`;
   return}
  const c=ln.split('|');c.shift();if(c.length&&!c[c.length-1].trim())c.pop();const cells=c.map(x=>x.trim());
  if(!cols){const nh=cells.map(norm);const f={};for(const[k,al]of Object.entries(COLS)){const j=nh.findIndex((h,jj)=>al.includes(h)&&!Object.values(f).includes(jj));if(j>=0)f[k]=j}
   if(f.nivel!=null&&f.componente!=null){cols=f;head=cells;
    const falta=['item','descricao','qtd','um'].filter(k=>cols[k]==null);if(falta.length)alertas.push({linha:L,campo:'cabeçalho',valor:falta.join(', '),erro:'Coluna não encontrada',acao:'Conferir o layout da CS12'})}
   return}
  const g=k=>cols[k]!=null?cells[cols[k]]??'':'';
  const nivelTxt=g('nivel'),nivel=parseInt(nivelTxt,10),comp=g('componente'),item=g('item');
  if(!comp&&!nivelTxt)return;
  if(!(nivel>=1)){erros.push({linha:L,campo:'Nível',valor:nivelTxt,erro:'Nível inválido',acao:'Corrigir a estrutura ou validar o arquivo'});return}
  /* marcador de ramo: sem item e sem quantidade → só abre o ramo do semiacabado */
  if(!item&&!g('qtd')){if(nivel>1&&!pai[nivel-1]){erros.push({linha:L,campo:'Nível',valor:nivel,erro:`Não existe um nível ${nivel-1} anterior`,acao:'Corrigir a estrutura'});return}
   if(!itens.some(x=>x.componente===comp&&x.nivel===nivel))alertas.push({linha:L,campo:'Componente',valor:comp,erro:'Ramo aberto para um material que não aparece antes como componente desse nível',acao:'Conferir a exportação'});
   pai[nivel]=comp;pai.length=nivel+1;marcadores.push({linha:L,nivel,componente:comp});return}
  if(!cab.material){erros.push({linha:L,campo:'Material',valor:'',erro:'Linha antes do cabeçalho (Material)',acao:'Copiar a lista inteira'});return}
  pai[0]=cab.material;
  if(!pai[nivel-1]){erros.push({linha:L,campo:'Nível',valor:nivel,erro:`Não existe um nível ${nivel-1} anterior`,acao:'Corrigir a estrutura ou validar o arquivo'});return}
  const r={ordemOriginal:++ordem,linha:L,nivel,numeroItem:item,materialPai:pai[nivel-1],componente:comp,descricaoComponente:g('descricao'),
   quantidadeOriginalTexto:g('qtd'),quantidadeComponente:null,unidadeComponente:g('um'),unidadeBasicaComponente:g('umb'),
   deposito:g('deposito'),tipoMaterial:g('tipoMaterial'),statusMaterial:g('statusMaterial'),refugoPct:null,prob:null,relCalculo:g('relCalculo'),extras:{},statusValidacao:'Validado'};
  head.forEach((h,j)=>{if(!Object.values(cols).includes(j)&&h)r.extras[h]=cells[j]??''});
  for(const[k,src]of[['quantidadeComponente','qtd'],['refugoPct','refugoPct'],['prob','prob']]){const v=g(src);if(!v)continue;const n=num(v);
   if(Number.isNaN(n)){erros.push({linha:L,campo:src,valor:v,erro:'Valor não numérico',acao:'Corrigir o valor'});return}r[k]=n}
  if(r.quantidadeComponente!=null&&r.quantidadeComponente<0){erros.push({linha:L,campo:'Quantidade',valor:r.quantidadeOriginalTexto,erro:'Quantidade negativa',acao:'Corrigir a quantidade'});return}
  if(!r.componente)erros.push({linha:L,campo:'Componente',valor:'',erro:'Código vazio',acao:'Conferir a linha'});
  if(!r.unidadeComponente&&r.quantidadeComponente!=null)erros.push({linha:L,campo:'Unidade',valor:'vazio',erro:'Unidade obrigatória',acao:'Informar a unidade'});
  if(r.statusMaterial&&itens.length&&r.statusMaterial!==(itens[0]||{}).statusMaterial)alertas.push({linha:L,campo:'Status do material (SM)',valor:r.statusMaterial,erro:'Status diferente dos demais',acao:'Conferir se o material está liberado'});
  r.chave=[cab.material,cab.centro,cab.utilizacao,cab.alternativa,r.materialPai,r.nivel,r.numeroItem,r.componente].join('|');
  if(itens.some(x=>x.chave===r.chave))alertas.push({linha:L,campo:'Linha',valor:r.componente,erro:'Linha repetida (mesma chave)',acao:'Conferir a exportação'});
  pai[nivel]=comp;pai.length=nivel+1;itens.push(r)});
 /* alternativos: mesmo pai e mesma posição (dezena do item); principal = maior ProbEmpr */
 const grupos=new Map();for(const r of itens){const pos=Math.floor((parseInt(r.numeroItem,10)||0)/10);const k=r.materialPai+'|'+r.nivel+'|'+pos;(grupos.get(k)||grupos.set(k,[]).get(k)).push(r)}
 for(const g of grupos.values()){if(g.length<2)continue;const pr=g.slice().sort((a,b)=>(b.prob??-1)-(a.prob??-1)||(b.quantidadeComponente??-1)-(a.quantidadeComponente??-1))[0];
  const temProb=g.some(x=>x.prob!=null);for(const r of g){r.grupoAlternativo=pr.numeroItem;if(r!==pr){r.alternativoDe=pr.componente;if(!temProb||r.quantidadeComponente)r.statusValidacao='Requer validação de alternativa'}else r.principal=true}}
 const Q=cab.quantidadeRequerida||cab.quantidadeBase;
 for(const r of itens){if(r.quantidadeComponente==null){if(!r.alternativoDe)alertas.push({linha:r.linha,campo:'Quantidade',valor:'vazio',erro:'Componente sem quantidade e sem ser alternativo',acao:'Conferir na CS12'});continue}
  if(Q){r.qtdPorMilheiro=r.quantidadeComponente/Q*1000;r.unidadeMilheiro=r.unidadeComponente;
   const f=conv[(r.unidadeComponente||'').toUpperCase()]?.[(r.unidadeBasicaComponente||'').toUpperCase()];r.qtdPorMilheiroUMB=r.unidadeComponente===r.unidadeBasicaComponente?r.qtdPorMilheiro:f?r.qtdPorMilheiro*f:null;
   if(r.refugoPct!=null)r.qtdMetaPorMilheiro=r.qtdPorMilheiro*(1+r.refugoPct/100)}}
 const val=[];for(const k of['material','centro','utilizacao','alternativa','descricao'])if(!cab[k])val.push(k);if(!(cab.quantidadeBase>0))val.push('quantidadeBase');if(!cab.unidadeBase)val.push('unidadeBase');
 if(val.length)erros.unshift({linha:0,campo:'Cabeçalho',valor:val.join(', '),erro:'Campo do cabeçalho não encontrado',acao:'Copiar a lista inteira da CS12'});
 if(!itens.some(x=>x.nivel===1))erros.push({linha:0,campo:'Estrutura',valor:'',erro:'Nenhum componente de nível 1',acao:'Conferir a exportação'});
 if(cab.quantidadeBase&&cab.quantidadeRequerida&&cab.quantidadeBase!==cab.quantidadeRequerida)alertas.push({linha:0,campo:'Qtd.requer.',valor:cab.quantidadeRequerida,erro:'Quantidade requerida diferente da base: o consumo por 1.000 usa a requerida',acao:'Nenhuma'});
 if(!cab.dataExplosao)alertas.push({linha:0,campo:'Data da explosão',valor:cab.dataLista||'',erro:'A lista não traz a data da explosão; usando a data da lista',acao:'Confirmar a data na prévia'});
 return{cab,itens,marcadores,erros,alertas}}
/* CS03 colada por engano: sem coluna de nível e com cabeçalho de lista técnica de um nível */
function pareceCS03(txt){const t=String(txt);return !/\|\s*N[ií]v?\w*\s*\|/i.test(t)&&/\|\s*(Item|Pos\.?)\s*\|/i.test(t)&&/Componente|ID objeto/i.test(t)}
function arvoreCS12(R){const filhos=new Map();for(const r of R.itens)(filhos.get(r.materialPai)||filhos.set(r.materialPai,[]).get(r.materialPai)).push(r);
 const out=[`${R.cab.material} - ${R.cab.descricao||''}`];const walk=(p,pre)=>{const fs=filhos.get(p)||[];fs.forEach((r,i)=>{const ult=i===fs.length-1;
  out.push(`${pre}${ult?'└─':'├─'} ${r.componente} - ${r.descricaoComponente}${r.alternativoDe?'  (alternativo de '+r.alternativoDe+')':''}`);if(filhos.has(r.componente)&&r.nivel<9)walk(r.componente,pre+(ult?'   ':'│  '))})};walk(R.cab.material,'');return out.join('\n')}

```

## 5. Conferência com a meta da KKBC

Rodar a CS12 do **360056** com Qtd.requer. **1.260.000** e comparar com a KKBC da ordem 110831563:

| Componente | KKBC Qtd.teór. | Por tubo | Refugo implícito |
|---|---|---|---|
| Rolha 8001401 | 1.299.060 | 1,031 | 3,1 % |
| Tubo PET 17976AAB | 1.297.800 | 1,030 | 3,0 % |
| Tampa 18631AAB | 1.315.440 | 1,044 | 4,4 % |
| Etiqueta tubo 700043071 | 1.360.800 | 1,080 | 8,0 % |

Se `Qtd.(UMC) × (1 + ItRefCo/100)` bater com a coluna da KKBC, a CS12 é a mesma base da meta e o refugo padrão pode ser mostrado na página de Perdas.

## 6. Depois, na página de Perdas (não muda agora)

Quando Perdas ler o cadastro (pendência do contrato § 9): KKBC × `itens` do nível 1 → consumido fora da estrutura, previsto e não consumido, refugo padrão por item e "perda acima do refugo padrão".
