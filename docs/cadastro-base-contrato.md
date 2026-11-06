# Cadastro base · contrato `vacutainer-cadastros.json`

01/11/2026 · versão 1 do contrato (atualizado em 03/11/2026: Portal 1.1 implementa a aba Cadastros; Portal 1.4 troca a fonte da BOM para a CS12 multinível; **Portal 1.6** acrescenta os campos do Paradas nos códigos de parada, os tipos `componentes` e `modosFalha`, a matriz código × máquina e parâmetros do Paradas). Vale para Portal (dono e único editor), OEE, Gestão de Gel, Perdas e as próximas páginas (Manutenção). Complementa a "Arquitetura de integração" e o "Portal e padrão comum".

## 1. Decisões

1. **Pasta única**: todos os HTML, todas as bases, o cadastro, `lib/`, `Logo.png` e `00. Backups/` na mesma pasta. O acesso é dado uma vez à pasta; todas as páginas leem tudo dela.
2. **Entrada pelo Portal** (atalho do Windows para `Portal.html` em qualquer lugar; nunca cópia do HTML). Cada página continua abrindo sozinha (favorito, TV, link) e funciona igual.
3. **Um cadastro base para todos**: `vacutainer-cadastros.json`, editado **só** na aba Cadastros do Portal. As outras páginas **leem** e mostram em modo consulta, com "Editar no Portal".
4. **Edição com senha**: sem a senha, o Portal também só mostra. A senha é uma trava contra edição por engano, não uma proteção forte (ver § 7).
5. **O que é de uma página só fica nela**, preso ao código do cadastro (ex.: meta de OEE por família no OEE; meta de gel por tubo no Gel se não vier da BOM).

## 2. Pasta

```
Vacutainer/                                ← única pasta escolhida (pela página que abrir primeiro)
  Portal.html          portal-base.json         (configuração do Portal, comentários de relatório)
  OEE-Vacutainer.html  oee-vacutainer-base.json
  Gestão-Gel-Vacutainer.html  fifo-base.json
  Perdas-Ordem.html    perdas-base.json
  Modelo-Pagina.html
  vacutainer-cadastros.json                ← cadastro base (só o Portal grava)
  Logo.png
  lib/   xlsx.full.min.js (SheetJS 0.20.3) · jspdf.umd.min.js · jspdf.plugin.autotable.min.js
  Equipamentos/<código>/                   ← fotos e documentos dos equipamentos (§ 3.2, decidido em 02/11/2026)
  00. Backups/
     Cadastros/  Portal/  OEE/  Gel/  Perdas/   ← cada página só lista e restaura os próprios backups
```

- Nomes de arquivo fixos (as páginas se acham pelo nome). A página do Gel é **`Gestão-Gel-Vacutainer.html`** (antes `controle-fifo-gel.html`; o Portal 1.1.1 aceita os dois, prefere o novo e compara sem acento, porque o Windows pode gravar o "ã" de outro jeito). `vac.sistemas` passa a ter caminhos simples (`OEE-Vacutainer.html`).
- **Migração** da estrutura com subpastas: mover HTML e base de cada módulo para a raiz, mover os backups de cada um para `00. Backups/<Módulo>/`. As páginas aceitam por um tempo também o local antigo (procuram na raiz e, se não acharem, na subpasta) e avisam "base em local antigo".
- **Portal 1.1 (feito)**: procura cada base primeiro na pasta principal, depois na subpasta guardada e por fim em qualquer subpasta de 1 nível (ignora `00. *`, `lib`, `Equipamentos`). Base achada em subpasta: pílula "local antigo" no cartão do módulo e no topo, pendência na lista e o quadro **Configuração › Pasta única** diz o que mover e para onde. Módulo achado na raiz grava o caminho simples em `vac.sistemas`. Backups do Portal em `00. Backups/Portal/`.
- Acesso: a pasta escolhida fica guardada no navegador e é compartilhada entre as páginas abertas da pasta; o navegador pode pedir um clique de confirmação por página (regra do navegador).

## 3. Estrutura do arquivo

```
{
  "schema": "vac-cadastros", "schemaVersion": 1,
  "rev": 12, "revBy": "Pedro", "revAt": "2026-11-01T07:30:00-03:00", "revId": "r…", "appVersion": "Portal 1.1",
  "seguranca": { "senhaHash": "…", "salt": "…", "alteradaEm": "…", "alteradaPor": "…", "editores": ["Pedro", "…"], "trocar": true },
  "linhas":       [ … ], "familias": [ … ], "catalogos": [ … ], "materiais": [ … ], "bom": [ … ],
  "equipamentos": [ … ], "componentes": [ … ], "turnos": [ … ], "paradas": [ … ], "modosFalha": [ … ],
  "parametros":   { "fusoHorario": "America/Sao_Paulo", "unidade": "BD Curitiba", "setor": "Vacutainer",
                    "limiteMicroMin": 10, "acoesPadrao": ["Trocou peça", "Ajustou", …] },
  "auditoria":    [ { "em", "por", "acao", "tipo": "catalogos", "codigo": "360060", "campo", "antes", "depois", "motivo", "origem" } ]
}
```

Campos acrescentados em 02/11/2026 (compatíveis com a versão 1; quem não usa ignora):
- `revId`: identificador único de cada gravação. Quem grava relê o arquivo e confere o `revId`; se outra pessoa gravou a mesma `rev` ao mesmo tempo, as alterações são reaplicadas (§ 4).
- `seguranca.trocar`: `true` enquanto a senha inicial não foi trocada. Some na troca.
- `auditoria.acao`: `criação | edição | inativação | reativação | importação | senha | restauração | desbloqueio`. `tipo` também pode ser `seguranca`, `parametros` ou `*` (cadastro inteiro). `origem` = de onde veio (ex.: "SAP CS12 colado em 03/11/2026", nome do backup restaurado). Na auditoria da senha, `antes`/`depois` do hash e do salt ficam como "(oculto)".
- A auditoria guarda as últimas 20.000 linhas; o histórico completo fica nos backups.

### 3.1 Regras gerais

- **Chave = código**, único no tipo e **imutável** (catálogo `360060`, equipamento `EQ01`, parada `FME`, turno `T1`, material = código SAP). Nunca id interno. Trocar um código = inativar o antigo e criar o novo (com `substituidoPor` no antigo e `substitui` no novo; no Portal: ficha › "Substituir código…").
- **Nada se apaga**: sai de uso = `"ativo": false` (com `inativadoEm`). Históricos das páginas continuam achando o código. A BOM não tem `ativo` próprio: segue o catálogo.
- **Vigência** para o que muda com o tempo: lista `vigencias` com `de` (AAAA-MM-DD) e `ate` (null = em aberto), sem sobreposição. Quem lê escolhe a vigência da **data do fato** (dia de produção, data da ordem), nunca a de hoje.
- Datas em AAAA-MM-DD; data e hora em ISO com fuso; quantidades em unidades base (peças, kg, g) com a unidade explícita.
- Campos desconhecidos são ignorados por quem lê (e preservados pelo Portal ao editar). Mudar o significado de um campo = `schemaVersion` 2.

### 3.2 Tipos

**linhas** · `{ codigo:"VAC", nome, unidade, setor, ativo }`

**familias** · `{ codigo:"EDTA", nome, cor, ativo }`

**catalogos**
```
{ codigo:"360060", nome:"Tubo 13x100mm Hemogard 5ml SST (Silica + Gel)", familia:"SST", linha:"VAC",
  formato:"13x100", volumeMl:5, aditivo:"Sílica + gel", cor:"#b52f6d", codigoSAP:"NS360060",
  ativo:true,
  vigencias:[{ de:"2025-01-01", ate:null, pphNominal:72000, tubosPorCaixa:1000, caixasPorLote:900 }] }
```
- `pphNominal` = capacidade técnica (peças/h). `tubosPorCaixa` substitui o parâmetro único do OEE (caixa do servidor → peças). `caixasPorLote` = tamanho padrão do lote (ex.: 1.260 no 360056, 900 no 360060).
- **PPH (decidido em 02/11/2026)**: ver § 8.

**materiais** · `{ codigo:"<SAP>", nome, unidade:"kg|g|un|m|l|ml|…", tipo:"gel|rolha|tubo|etiqueta|caixa|aditivo|outro", tipoSAP:"ROH|HALB|…", ativo }`
- `tipoSAP` (03/11/2026) = tipo de material do SAP (coluna TMat da CS12); `tipo` continua sendo a classificação da linha.
- Quais materiais entram: § 8.

**bom** (lista técnica por catálogo, com vigência; **fonte: CS12 "Estrutura multinível"**, decidido em 03/11/2026)
```
{ catalogo:"360056", vigencias:[{ de:"2026-11-03", ate:null, origem:"SAP CS12 colado em 03/11/2026 por Pedro",
    fonte:"CS12", centro:"2101", utilizacao:"1", alternativa:"01", quantidadeBase:1000, quantidadeRequerida:1000, dataExplosao:"2026-11-03",
    itens:[ { item:"0030", material:"18631AAB", qtdPorMilheiro:1000, unidade:"un", unidadeBasica:"un", alternativoDe:null, perdaPadraoPct:4.4,
              ordem:3, quantidadeOriginalTexto:"1.000", extras:{ "TMat":"ROH", "SM":"50", … } } ],
    estrutura:[ { nivel:2, pai:"SA900110", item:"0010", material:"MP910001", qtdPorMilheiro:34.5, unidade:"kg", unidadeBasica:"kg",
                  alternativoDe:null, perdaPadraoPct:3, ordem:7, quantidadeOriginalTexto:"34,500", extras:{…} } ] }] }
```
- **`itens` = só o nível 1**: o que a ordem consome (mesmo significado de antes; é o que se compara com a KKBC). `qtdPorMilheiro` = quantidade ÷ **Qtd.requer.** × 1.000, na `unidade` (UM do componente); `unidadeBasica` = UMB do material; `perdaPadraoPct` = ItRefCo (refugo do componente; a quantidade vem sem ele); `item` sempre texto (`"0010"`).
- **`estrutura` = níveis 2 em diante** (insumos dos semiacabados), com `nivel` e `pai`; quantidade **por 1.000 do produto acabado** (nunca dividida pela quantidade do pai).
- **Quem lê usa só `itens`.** Somar `itens` + `estrutura` conta o semiacabado e os insumos dele duas vezes.
- **Alternativos**: mesmo pai e mesma posição (0010/0011…); `alternativoDe` aponta para o principal (maior ProbEmpr) e o alternativo pode vir **sem quantidade** (`qtdPorMilheiro:null`).
- **Item sem quantidade (ou com 0) na CS12** que não é reconhecido como alternativo (Portal 1.4.1): entra com `qtdPorMilheiro` vazio ou 0 = **sem consumo previsto**, com aviso amarelo na prévia para conferir. Quem lê trata vazio/0 como "sem consumo".
- Colunas sem campo próprio (Dep., TMat, SM, Rel.p/cálc, B, MatConIt, L…) ficam em `extras`.
- BOMs anteriores (manual, carga do Gel) não têm `fonte`, `item` nem `estrutura` e continuam válidas.
- Importação: § 4.1; o SAP manda no que vem dele.

**equipamentos**
```
{ codigo:"EQ01", nome:"Tullip A", linha:"VAC", posicao:1, tipo:"equipamento|linha", papel:"oee|equipamento",
  fabricante, modelo, numeroSerie, ano, dados:{ "velocidadeNominal":"…", … },
  foto:"Equipamentos/EQ01/foto.jpg",
  documentos:[{ nome:"Manual Tullip", arquivo:"Equipamentos/EQ01/manual.pdf", tipo:"manual|documento|desenho|imagem|outro", data:"2026-11-02" }],
  ativo:true }
```
- `tipo:"linha"` = a **linha inteira** (código `LINHA`, posição 0): troca de lote, falta de material, reunião… Não entra como coluna da matriz nem tem formulário de máquina; os códigos de Linha/Liderança vão no formulário da LINHA (Portal 1.6).
- Equipamentos da linha (03/11/2026): `LINHA` Linha Vacutainer · `EQ01` Tullip A · `EQ02` Tullip B · `EQ03` Gel dispensor · `EQ04` Metro · `EQ05` Evacuator · `EQ06` Cap Placer · `EQ07` Packout · `EQ08` Silica spray coater · `EQ09` Kallfass · `EQ10` Tray Loader · `EQ11` Transporte de bandejas · `EQ12` Etiquetagem. Nomes do histórico do Forms sem cadastro (ex.: 3 Hours Delay, EDTA spray coater) entram pelo "Trazer das páginas" com código `EQ13…` sugerido.
- `posicao` = ordem na linha (base para Manutenção e mapa da linha). `dados` livre (chave → valor) para os dados técnicos.
- `foto` e `documentos[].arquivo` = caminho **relativo à pasta principal** (decidido em 02/11/2026, § 8). O arquivo nunca entra no JSON.

**componentes** (Portal 1.6; por equipamento, base do MTBF por componente)
```
{ codigo:"EQ02-C07", equipamento:"EQ02", nome:"Rolo de pressão da herma",
  sistema:"mecânico|elétrico|pneumático|hidráulico|automação|visão|ferramental|outro", criticidade:"A|B|C", materialSAP:null, ativo:true }
```
- Código = `<equipamento>-C<nn>` (sugerido pelo Portal com o próximo número do equipamento), imutável; o equipamento também não muda depois de criado.
- Portal: lista geral, seção "Componentes" na ficha do equipamento (com "+ Componente") e importação colada (Importar › Componentes: equipamento por código ou nome, nome, sistema, criticidade, material SAP; mesmo nome no mesmo equipamento é ignorado).

**turnos**
```
{ codigo:"T1", nome:"1º Turno", linha:"VAC", cor:"#2f6db5",
  vigencias:[{ de:"2025-01-01", ate:null, inicio:"06:00", fim:"14:30", dias:[1,2,3,4,5,6], ativo:true,
               pausas:[{ inicio:"12:00", fim:"12:30", desconta:true, dias:null }] }] }
```
- `dias`: 0 = domingo … 6 = sábado.
- Fim depois da meia-noite em formato 24 h+ (`"30:00"` = 06:00 do dia seguinte); o turno pertence ao dia em que começa.
- **O OEE continua guardando no dia lançado a cópia do turno usado** (mudar o cadastro nunca muda dias já lançados).

**paradas** (códigos de parada)
```
{ codigo:"FME", numero:"801", nome:"Falha mecânica", categoria:"Quebra", subcategoria:"Mecânica", cor, macro:null,
  pilar:"D", classe:"fixa", ondeAponta:"Máquina", equipamentos:["EQ01","EQ02"],
  planejada:false, descontaPlanejado:false, afetaD:true, afetaP:false, afetaQ:false, pareto:true,
  exigeTrocaPeca:true, exigeComponente:false, temporario:false,
  exigeObservacao:false, exigeHorario:false, exigeCatalogoAnterior:false, exigeCatalogoSeguinte:false,
  guia:{ descricao, exemplo, naoUsarQuando, regra }, ativo:true }
```
- Inclui `RTB · Retrabalho (fora do OEE)`: desconta do planejado, fora do Pareto (a carga inicial cria se o OEE não tiver).
- **Campos do Paradas (Portal 1.6, pedido `claude/portal-pedido-paradas.md`)**; todos opcionais, quem não usa ignora:
  - `numero`: texto de **3 dígitos**, único; no Portal é preenchido uma vez e depois trava (é o que vai no formulário; trocar = "Substituir código…"). A **centena é o grupo**: 0 Outros · 1 Utilização · 2 Planejado/engenharia · 3 Partida · 4 Organização · 5 Setup · 6 Consumíveis · 7 Parou sem trocar peça · 8 Quebra · 9 Perdas sem parada. Centena incoerente com a categoria = só **aviso** na Conferência (não bloqueia e não vira pendência).
  - `pilar`: `U | D | P | Q | P ou D`. `classe`: `fixa | porDuracao | calculada | emPecas` (`porDuracao`: abaixo de `parametros.limiteMicroMin` = microparada/P; a partir dele = parada operacional/D). `ondeAponta`: `Máquina | Linha | Linha + máquina | Liderança | Manutenção`. `macro`: agrupamento do BD (texto livre).
  - `equipamentos` = **matriz código × máquina**: em que formulário de máquina o código aparece. **Ausente ou `null` = todas** (inclusive as cadastradas depois); lista = só essas. Só códigos de equipamento existentes. Ao marcar todas as máquinas na matriz, o Portal grava `null`.
  - `exigeTrocaPeca` (grupo 8, quebra), `exigeComponente`, `temporario` (OUT e NDI: comentário e revisão obrigatórios).
  - `guia`: textos do Guia (Paradas), do ⓘ do OEE e do verso do formulário. `null` quando vazio.
- Validações bloqueantes: `numero` com 3 dígitos e único; `pilar`, `classe` e `ondeAponta` dentro das listas; `equipamentos` lista de códigos existentes.

**modosFalha** (Portal 1.6; lista global curta) · `{ codigo:"MF01", nome:"Desgaste", ativo:true }`

**parametros** (Portal 1.6, editados em Cadastros › Segurança › Parâmetros gerais)
- `limiteMicroMin` (min): limite da microparada para os códigos `classe:"porDuracao"`. O Paradas propõe **10** (revisão out/2024 do OEE Definition and Guidelines); o Performance Code de set/2023 diz 5. **Confirmar no documento vigente** antes de mudar: muda a classificação dos eventos daqui para a frente.
- `acoesPadrao`: lista de textos de "ação tomada" que o Paradas oferece.

## 4. Quem escreve: Portal (feito no Portal 1.1, 02/11/2026)

- Aba **Cadastros**: Resumo (contagens, conferência, últimas alterações, alterações não gravadas) e uma lista por tipo (linhas, famílias, catálogos, materiais, BOM, equipamentos, turnos, códigos de parada) com busca em qualquer campo, filtro Ativos / Inativos / Todos e exportação para Excel. Clique abre a **ficha**: campos, vigências (linha do tempo, vigente hoje / futura / encerrada), "onde é usado", histórico (auditoria do item). Mais: Importar do SAP, Auditoria, Backups, Segurança. Sem senha: só leitura.
- **Editar**: "Desbloquear edição" pede a senha. Vale para aquela aba do navegador (`sessionStorage`) e expira com 30 min sem uso (qualquer clique ou tecla conta como uso). "Bloquear" volta na hora. Até a senha inicial ser trocada, a edição fica travada.
- Ficha: código só na criação (depois, "Substituir código…"); "Nova vigência a partir de" fecha a vigência anterior no dia anterior; Inativar / Reativar; motivo obrigatório para inativar, substituir código e mudar o que valeu antes de hoje.
- **Gravação segura**: cada alteração vira uma operação (`acao, tipo, codigo, item | mudancas {campo: {antes, depois}}, motivo`) numa fila guardada no navegador. Para gravar, o Portal (1) relê o arquivo; (2) reaplica a fila sobre a versão mais nova, conferindo campo a campo que o `antes` ainda bate (se outra pessoa mudou outros campos ou outros itens, aplica sem perguntar e avisa); (3) faz o backup da versão da pasta em `00. Backups/Cadastros/vacutainer-cadastros_AAAA-MM-DD_HHhMMmSSs_revN.json`; (4) grava `rev + 1` com `revBy`, `revAt`, `revId` novo e as linhas de auditoria; (5) relê para conferir o `revId`; se outra pessoa gravou a mesma rev ao mesmo tempo, reaplica de novo. Só tira da fila o que foi conferido: **uma alteração feita durante a gravação nunca é dada como salva** (entra na volta seguinte; o selo só mostra "salvo" com a fila vazia).
- **Conflito**: só quando a mesma informação foi mudada pelos dois (o `antes` não bate), quando o item sumiu ou quando o código já existe com outros dados. A tela mostra campo, valor na pasta, de → para, e cada alteração recebe "Aplicar a minha" ou "Descartar a minha"; o resto da fila grava em seguida.
- Sem a pasta, a fila fica no navegador ("N alterações não gravadas") e grava quando a pasta responder (Sincronizar, a cada 60 s e ao voltar para a aba).
- Importações com prévia: lista técnica (CS12), materiais do SAP e componentes (colados); carga inicial e "Trazer das páginas" (§ 6).
- **Matriz de paradas** (Portal 1.6, Cadastros › Matriz de paradas, `#cadastros/matriz`): grade código × máquina com os códigos ativos cujo `ondeAponta` contém "Máquina" (opção de mostrar os demais), filtro por grupo (centena), coluna "todas", total de códigos por máquina e "Salvar matriz" (uma `edição` de `equipamentos` por código alterado, motivo "matriz de paradas"). Colunas = equipamentos ativos, exceto `LINHA`/`tipo:"linha"`. A ficha do código tem a mesma escolha em "Máquinas onde aparece".
- **Formulários de apontamento**: o Portal não monta o formulário; abre o Paradas. Ficha do equipamento › **"Imprimir formulário"** → `Paradas.html#formulario=<código>`; lista de equipamentos e matriz › **"Imprimir todos os formulários"** → `Paradas.html#aba=forms`. Desabilitado enquanto `Paradas.html` não estiver na pasta.
- Validações (na ficha, na importação e na Conferência): código único, catálogo com 6 dígitos, vigências sem sobreposição, família/linha/material/catálogo referenciados existentes, cor `#RRGGBB`, turno com fim depois do início (24 h+), pausas válidas, BOM sem item repetido (item + material), quantidade vazia, 0 ou positiva (negativa ou texto é erro), alternativo presente na mesma lista, e na `estrutura`: pai existente no nível de cima e material cadastrado.
- Links de entrada: `Portal.html#cadastros`, `#cadastros/<tipo>` e `#cadastros/<tipo>/<código>` (ex.: `#cadastros/catalogos/360060`, `#cadastros/equipamentos/EQ01`); também `#cadastros/importar|auditoria|backups|seguranca`. Código inexistente: abre a lista filtrada e avisa.
- Pendências do cadastro no Portal (Visão geral, Pendências, TV): cadastro não criado, alterações não gravadas, conflito, senha inicial não trocada, problemas da Conferência (sem os avisos), base de módulo em local antigo e, desde o 1.6, "N códigos do catálogo proposto do Paradas ainda não cadastrados" (quando o `exports.cadastros` do Paradas tiver código que o cadastro não tem).
- Modo de teste do Portal: cadastro fictício só na memória; senha `teste`.

### 4.1 Importação colada do SAP

- Aceita tabulação (copiar do SAP/Excel), `|` (lista do SAP) ou colunas separadas por espaços. Colunas achadas pelo **nome** do cabeçalho; cabeçalho repetido é ignorado; códigos numéricos perdem os zeros à esquerda; números BR ou EUA (automático, ou escolha o formato).
- **Lista técnica: CS12 "Estrutura multinível"** (Portal 1.4, 03/11/2026; é a **única fonte** da BOM do cadastro). Lista dinâmica copiada (Ctrl C), `.txt`, `.xlsx` ou `.csv`; várias listas coladas de uma vez = uma BOM por catálogo. Leitor de referência de `claude/cs12-importacao-bom.md` § 4: cabeçalho (Material, Cent./Util./Alt, Denominação, Qtd.base, Qtd.requer., data da lista), colunas pelo nome, **marcador de ramo** (linha sem item e sem quantidade: só define o pai, não é componente), pai pelo nível, alternativos pela posição. Números no formato do SAP em português (1.234,56); lista com 1,234.56 gera aviso.
  - Catálogo = Material do cabeçalho (`NS360056` → `360056`); se não existir, a prévia pede o catálogo.
  - **Vigência a partir de hoje** (editável), sem motivo: fecha a vigente no dia anterior; mesma data substitui; vigência posterior recusa. Igual à vigente (item a item) = não grava.
  - Prévia por catálogo: cabeçalho, árvore, tabela de todos os níveis com Qtd SAP, UM, UMB, Qtd/1.000, refugo, alternativo e situação **novo / alterado (campo e valor anterior) / igual / sai da BOM** (chave pai + nível + item + material); avisos agrupados por tipo, recolhíveis e com ⓘ: **erros** bloqueiam o catálogo (coluna de quantidade não encontrada, cabeçalho incompleto, catálogo não encontrado, níveis, valor inválido, regras do cadastro); **avisos** não (sem quantidade, SM diferente da maioria, alternativo a conferir, ramo sem componente, linha repetida).
  - Materiais de **todos os níveis** que não existem são criados junto (descrição, UMB, `tipoSAP`, tipo sugerido e editável).
  - Colagem que parece **CS03** (sem coluna de nível): *"O arquivo parece ter sido extraído da CS03. Para cadastrar uma Lista Técnica completa, exporte a estrutura multinível pela transação CS12."* Nada é gravado. A importação pela CS03 saiu do Portal.
  - CK86 / CK13N não entram na BOM (custo padrão por material, depois).
- **Materiais**: Material, Texto breve, UM básica. O SAP manda na descrição e na unidade dos já cadastrados; o tipo é do cadastro.

## 5. Quem lê: OEE, Gel, Perdas e próximas

- Lê `vacutainer-cadastros.json` da mesma pasta ao abrir, ao voltar para a aba e a cada releitura periódica (mesma de cada página).
- Guarda uma cópia no navegador (`vac.cadastros`, com `rev`) para abrir sem a pasta; mostra o selo **"Cadastro rev N · DD/MM HH:MM"** e, se estiver usando a cópia, **"cadastro da cópia local"**.
- **Formato da cópia** (o Portal grava a cada leitura e gravação): `localStorage['vac.cadastros']` = o arquivo **sem `auditoria` e sem `seguranca`**, mais `copiaEm`. Quem lê pode usar essa mesma chave como cópia (as páginas abertas pela pasta compartilham o navegador).
- Consulta em modo leitura do que a página usa, com **"Editar no Portal"** (abre `Portal.html#cadastros/<tipo>/<código>`). Nenhuma página grava no cadastro.
- Complemento local preso ao código (o que só aquela página usa). Código que aparece nos dados da página e não existe no cadastro: aviso "código fora do cadastro" (não apaga nada).
- Resolve vigência pela data do fato. Resultados fechados (turno/dia do OEE) guardam os valores usados no fechamento.
- **OEE**: catálogos, famílias, turnos, equipamentos e paradas passam a vir do cadastro (Configurações do OEE fica só leitura + "Editar no Portal"); continuam no OEE as metas de OEE com vigência, pausas e intervalos de cada dia, parâmetros de cálculo e do servidor; `tubosPorCaixa` passa a ser por catálogo. O bloco `exports.cadastros` do OEE vira só espelho para compatibilidade e depois sai. PPH: § 8.
- **Gel**: catálogos e BOM (consumo de gel por milheiro) do cadastro; metas e configurações próprias ficam no Gel.
- **Perdas**: catálogos, materiais e BOM para custo/consumo por ordem.

## 6. Carga inicial e migração

1. Portal: botão **"Criar cadastro a partir das páginas"** (aparece enquanto o arquivo não existe) lê `exports.cadastros` do OEE (linhas, famílias, catálogos, turnos, equipamentos, paradas) e os catálogos/BOM do Gel; mostra a prévia (itens por tipo e origem, conflitos com escolha campo a campo, problemas de conferência, listas por tipo); pede a senha inicial (2×) e os editores; grava `rev 1` e em seguida pede a troca da senha.
   - OEE: catálogo com vários períodos (`validoDe/validoAte`) vira um catálogo com várias vigências (`pph` → `pphNominal`); `tubosPorCaixa` 1.000; `caixasPorLote` preenchido com o padrão (1.260; 900 no 360060 e 360051), para conferir; formato e volume tirados do nome quando possível. Equipamentos na ordem do OEE (`posicao`). Turnos com `pausas: []`. RTB criado se faltar.
   - Gel: lê só o `exports`. Se o Gel publicar `exports.cadastros = { catalogos:[{codigo,nome}], materiais:[…], bom:[formato do § 3.2], gel:{material,nome} }`, usa direto. Até lá, usa `exports.ordens`: catálogos que aparecem nas ordens e a **BOM de gel** pelo `bomG` (g/tubo = kg por 1.000 tubos) da ordem mais recente de cada catálogo; a prévia pede o código SAP do gel e a data de início da vigência. A BOM completa vem depois pela CS12.
   - **Trazer das páginas** (Portal 1.3.1, Cadastros › Resumo): com o cadastro já criado, lê de novo o `exports` do OEE e do Gel e inclui só os itens que ainda não existem (com prévia, escolha item a item, auditoria `importação` com origem "páginas"); o que existe nos dois com valores diferentes aparece só para conferência (o cadastro manda). Também cria a BOM de gel dos catálogos sem BOM.
   - **Catálogo proposto do Paradas** (Portal 1.6, no mesmo "Trazer das páginas"): lê `paradas-base.json › exports.cadastros` (`paradas`, `inativar`, `modosFalha`, `acoesPadrao`, `limiteMicroMin`, `equipamentosVistos`; formato em `claude/portal-pedido-paradas.md` § 2). Prévia por bloco, escolha item a item, auditoria com origem "Paradas (exports.cadastros)":
     - **Código que já existe**: só **completa os campos novos que estão vazios** (`numero`, `macro`, `pilar`, `classe`, `ondeAponta`, `equipamentos`, `exigeTrocaPeca`, `exigeComponente`, `temporario`, `guia`), marcado. Nome, categoria, subcategoria e cor diferentes vêm **desmarcados** (só mudam se marcar). **`planejada`, `descontaPlanejado` e `afetaD/P/Q` dos existentes nunca mudam** (mudariam o OEE histórico; REF, REV e RTB em decisão).
     - **Código novo**: cria com os campos da proposta; `planejada` = grupos 1, 2, 3 e 5; `descontaPlanejado` = só grupo 1.
     - `numero` já usado por outro código: entra sem número (aviso). Máquinas da proposta que não existem em Equipamentos ficam fora da lista (aviso); a lista da proposta é gravada como está (não vira "todas").
     - **inativar** (FQL, LIM, MIC, MPL): `ativo:false`, `inativadoEm` e `substituidoPor`; nada se apaga.
     - Modos de falha novos (marcados); `limiteMicroMin` e `acoesPadrao` marcados se estiverem vazios no cadastro, desmarcados se já tiverem outro valor.
     - `equipamentosVistos` sem equipamento e sem nome parecido no cadastro (compara sem acento/espaço e por prefixo: Kallfas ≈ Kallfass): linhas **desmarcadas** com código `EQnn` sugerido, nome e posição editáveis. `LINHA` com `tipo` diferente de `linha`: opção desmarcada para corrigir.
     - Os códigos de parada que o OEE publica e o Paradas também propõe são tratados só pelo bloco do Paradas.
     - Antes de gravar, o Portal simula o resultado e lista os problemas de conferência para confirmar.
2. Cada página: lê o cadastro quando existir; enquanto não existir, segue com os dados próprios.
3. Página por página, a edição local desses tipos é desligada (só leitura + "Editar no Portal").
4. Mudança para a pasta única (§ 2) com a fase de transição que aceita o local antigo.

## 7. Senha e segurança

- Senha inicial definida pelo Pedro (não registrada nos documentos nem no código); **trocar no primeiro uso**: o Portal pede a troca logo depois de criar o cadastro e trava a edição até trocar (Cadastros › Segurança › Trocar senha). Senha nova: mínimo 6 caracteres.
- No arquivo fica só o **hash** (SHA-256 de salt + senha, salt aleatório de 16 bytes em hexadecimal, novo a cada troca), nunca a senha; o código das páginas não contém a senha.
- Esqueceu a senha: (a) Backups › "Usar a senha deste backup" volta `senhaHash`/`salt` de um backup; ou (b) Segurança › "Esqueci a senha" (nome + senha nova + digitar REDEFINIR): gera novo salt e grava a senha nova. Os dois ficam na auditoria com o nome de quem fez.
- Limite conhecido: num HTML local, a senha impede edição por engano, não por quem quer burlar (o JSON pode ser editado direto na pasta). Para proteção real: permissão de gravação no `vacutainer-cadastros.json` só para os editores, pelas permissões da pasta de rede (TI). A auditoria + backups dão a rastreabilidade.
- `editores` (lista de nomes, editável em Segurança): quem desbloqueia e não está na lista recebe aviso e fica registrado (`acao: desbloqueio`).

## 8. Decidido em 02/11/2026 (era "em aberto")

- **PPH**: `pphNominal` técnico fica no cadastro, por catálogo e com vigência. A meta do OEE usa o PPH do cadastro (vigência da data do fato), **salvo quando a meta trouxer um PPH próprio**. O dia fechado no OEE guarda o PPH usado e de onde veio (`pphFonte: "cadastro" | "meta"`). Quando o PPH da meta e o do cadastro diferirem mais de 5 %, o OEE mostra uma pendência para conferência. (A parte do OEE é feita no chat do OEE.)
- **Fotos e documentos de equipamento**: arquivos em `Equipamentos/<código>/` na pasta principal; o cadastro guarda só o caminho relativo (`foto`, `documentos[{nome, arquivo, tipo, data}]`). No Portal, a ficha do equipamento envia a foto e anexa documentos (copia o arquivo para a pasta, sem sobrescrever: nome repetido ganha `_2`, `_3`…), abre e tira da lista (o arquivo continua na pasta). Nada em base64 no JSON.
- **Materiais**: entram **só os materiais da BOM da linha** (criados pela importação da CS12, todos os níveis) e os que alguém incluir de propósito (ex.: itens que aparecem na KKBC do Perdas: desmarcar "Só materiais usados na BOM" na importação de materiais). O mestre inteiro do SAP não entra, para não pesar o arquivo sem uso na linha.

## 9. Ainda falta

- Paradas: passar a ler a matriz, componentes, modos de falha e parâmetros do cadastro e travar a edição local ("a matriz vem do cadastro"); publicar `exports.porComponente` para a carga dos componentes digitados pelos técnicos.
- Confirmar `limiteMicroMin` (10 ou 5 min) no documento vigente.
- OEE, Gel e Perdas lerem o cadastro (consulta travada + "Editar no Portal", `tubosPorCaixa` por catálogo, OEE e Gel aceitando a pasta única com o local antigo).
- Gel publicar `exports.cadastros` (§ 6) para a carga trazer catálogos e BOM de gel sem depender das ordens.
- Limpeza automática dos backups antigos do cadastro (hoje um arquivo por gravação, sem limpeza).
