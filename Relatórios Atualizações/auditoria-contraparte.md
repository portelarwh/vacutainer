# Auditoria independente · Vacutainer

**Autoria** auditoria-contraparte · **Versão** 1.8.71 · **Revisão da main** a9d28b5d0c781017569f0f5978928f26ecef5da1

**SHA-256 de Plataforma.html** e3e6f70bd4a24bea9cd5e43a77f2482c236a98f5f6534635b1f1113bd2cef6ea

## Resumo executivo

- A varredura cobriu A a L e encontrou 40 achados provados, dos quais 7 críticos, e 4 suspeitas.
- Produção em branco e produção zero geraram o mesmo resumo publicado. O contador de dados ausentes fica no motor.
- Ensaios isolados reproduziram sobrescrita no Gel e na Administração, perda por concorrência no Waste e descarte de pendências na restauração de Paradas.
- A comparação de relatórios confirmou unidade enganosa no Excel, descaracterização de identificador e filtro de família que não recorta os eventos publicados.
- Foram 22 cenários dirigidos de cálculo e 52 estados capturados, em dois tamanhos e temas.
- A autorização de primeiro uso foi validada em pasta fictícia. Uma gravação interrompida revelou um caminho incompleto de recuperação.
- A revisão serve para demonstração e consulta assistida. Escrita operacional e relatórios oficiais dependem de correções, regressão e homologação.

## Mapa da arquitetura

| Camada | Blocos e fluxo |
|---|---|
| Entrada e casca | HTML exterior, modulo/main, modulo/App e modulo/components/*. Import map e recursos embutidos montam a navegação React. |
| Integração | modulo/core/modules, runtime, compatibility, data, auth, scopes e permissoes. Fornecem pasta, sessão, contexto e navegação; cada motor roda em documento próprio e expõe vacPagina. |
| Kit comum | comum/bases, comum/interface, comum/visual, comum/cabecalho-css, comum/formularios-css e css/kit. Os motores incorporam os fragmentos @@vac:ID@@. |
| Operação | motor/oee mantém Produção, OEE, SQDCP, ordens e timeline; motor/perdas mantém Waste/MUV; motor/gel mantém FIFO e consumo; motor/paradas mantém eventos de máquina. |
| Gestão | motor/equip mantém equipamentos e OS; motor/inic mantém iniciativas e ações; motor/linha mantém planta, vínculos e formulários; motor/projetos é área em construção. |
| Administração | motor/portal mantém os cadastros e portal-base. A criação inicial do cadastro em pasta vazia é a exceção restrita do contrato 4; ProdCad incorpora referências da Administração em memória. |
| Persistência | File System Access grava JSON por domínio. IndexedDB e armazenamento local atendem filas, handles e preferências. Os módulos publicam exports que a casca e outros motores consomem. |
| Recursos e ferramentas | recurso/*, dados/manifesto e dados/cenario; bibliotecas locais em biblioteca/* e vendor/*. Os apps celular/* são independentes. ferramenta/* concentra diagnósticos locais. |

## Método e execução

Foram lidos CLAUDE.md, AGENTS.md, docs/COMECE-AQUI.md e o roteiro antes da análise. Trabalhei numa revisão isolada da main com bases fictícias. Arquivos auditoria-agente-dev e scripts/auditoria ficaram fora das leituras e provas. O produto permaneceu idêntico ao commit auditado.

| Comando | Resultado observado |
|---|---|
| npm ci | código 0. 88 pacotes instalados a partir do lockfile. |
| npm run lint | código 0. O lint normal cobre os scripts e testes do repositório. |
| npm run test:unit | código 0. 79 testes, zero falha registrada. |
| NODE_OPTIONS="--require $PWD/testes/http-local.cjs" npm test | código 0. 69 suíte(s): 68 passou · 1 passou com item não verificado · 0 não verificada(s) · 0 falhou. |
| npm run test:plataforma | Primeira execução com código 1; o iframe de Paradas foi removido antes de contentFrame, em testes/plataforma/pasta.cjs:14. Repetição usando o lançador padrão com código 0. |
| npm run test:reprodutibilidade | código 0. Duas verificações produziram o mesmo hash do HTML. |
| node testes/plataforma/contraste.cjs | código 0. 83 estados por tema; 8 ocorrências por tema sobre fundos sem medição. |

Node 24.22.3 no ambiente de auditoria. Provas independentes no Chromium 153.0.8010.12 com HTTP local e OPFS. A Visão da linha e a aba Lançamento também abriram em file:// offline, sem pedidos HTTP, com o Chromium empacotado. A execução padrão do projeto pode escolher o Chromium gerenciado. H01 e H02 dependem da configuração corporativa.

### Varredura automática

Extraí e inventariei 48 blocos. A validação da decodificação apresentou 48 textareas lidos no Chromium, 0 divergências com a extração. O ESLint independente processou 56 unidades JavaScript, incluindo scripts clássicos, módulos, bibliotecas e casca. O marcador JSON da demonstração em comum/bases foi neutralizado apenas no texto recebido pelo lint, mantendo as linhas. CSS, níveis de dados e bibliotecas foram classificados no inventário.

As oito regras usadas foram no-undef, no-unused-vars, no-dupe-keys, no-redeclare, no-unreachable, no-self-assign, no-constant-condition e eqeqeq. Os 1.721 avisos de nomes indefinidos no código próprio foram cruzados com definições globais e vínculos do carregador. Os candidatos restantes eram vacCodigo, disponibilizado em modulo/core/runtime:219, e nomes UMD protegidos por verificações de presença. Usos entre scripts, bibliotecas e iframes foram considerados antes de promover um aviso a achado. A prova de código morto foi seletiva e conferiu referências do símbolo no produto.

A análise coletou bytes, linhas e corpos repetidos. Foram 7,738 nós de função indexados, 2,760 nomes de definição no catálogo e 101 grupos de corpos idênticos com pelo menos cinco linhas em mais de um bloco. Bibliotecas incorporadas e cópias deliberadas foram mantidas no inventário e avaliadas pelo papel, sem classificar cada ocorrência como defeito. A busca de innerHTML, insertAdjacentHTML, interpolação, localStorage/sessionStorage, eval, new Function, document.write, anexos, downloads e catches vazios serviu de triagem. A análise sintática localizou 2176 interpolações em expressões diretamente ligadas a destinos HTML, 628 com chamada direta a uma função conhecida de escape. O restante inclui números, fragmentos constantes, renderização já preparada e expressões que exigem rastrear a origem. Foram triados 17 nomes de função com uma única menção textual em toda a fonte. A classificação se baseia no contexto de cada campo e nas guardas observadas.

### Propriedades da Produção em Chromium

Os cenários foram executados no Engine do iframe de Produção via page.evaluate. Cada caso confirmou as entradas observadas pela lógica, com intervalos reais no cenário sintético. ∅ representa ausência ou valor que o JSON não representa no caso de overflow. Usei capacidade de 100 peças/h e arredondamento de meta unitário. Verifiquei resultado bruto e reprocessamento, somas dos componentes do dia e dos turnos, e 45 identidades aplicáveis de D × P × Q com tolerância relativa de 10⁻⁹. Todas as identidades aplicáveis coincidiram, mas dois componentes negativos também podem satisfazer a identidade. O motor admite Performance superior a 100% como diagnóstico e emite aviso em motor/oee:1056 e 1103–1104.

| Cenário | Resultado no dia | D, P ou Q fora de [0,1] | Finitude | Reprocessamento |
|---|---|---|---|---|
| base | boa 150, refugo 16, cap. 300, meta 240, OEE 0.5 | Sem desvio aplicável | Sim | Igual |
| zero | boa 0, refugo 0, cap. 300, meta 240, OEE 0 | Sem desvio aplicável | Sim | Igual |
| zero-com-refugo | boa 0, refugo 16, cap. 300, meta 240, OEE 0 | Sem desvio aplicável | Sim | Igual |
| nulo-hora | boa 0, refugo 16, cap. 300, meta 240, OEE 0; 3 ausentes | Sem desvio aplicável | Sim | Igual |
| nulo-dia | boa 0, refugo 0, cap. 300, meta 240, OEE 0; 1 ausentes | Sem desvio aplicável | Sim | Igual |
| zero-tempo | boa 2, refugo 0, cap. 0, meta 0, OEE ∅ | Sem desvio aplicável | Sim | Igual |
| zero-meta | boa 150, refugo 16, cap. 300, meta 0, OEE 0.5 | Sem desvio aplicável | Sim | Igual |
| produção-extrema | boa 1000100, refugo 16, cap. 300, meta 240, OEE 3333.66667 | dia/P=3333.72, T1/P=5000.25 | Sim | Igual |
| refugo-extremo | boa 150, refugo 1000006, cap. 300, meta 240, OEE 0.5 | dia/P=3333.853333333333, T1/P=5000.450000000001 | Sim | Igual |
| refugo-negativo | boa 150, refugo -44, cap. 300, meta 240, OEE 0.5 | dia/Q=1.4150943396226414, T1/Q=2.25 | Sim | Igual |
| overflow-finito | boa ∅, refugo 16, cap. 300, meta 240, OEE ∅ | dia/Q=NaN, T1/Q=NaN | 18 campos não finitos | Igual |
| extra | boa 170, refugo 16, cap. 400, meta 320, OEE 0.425 | Sem desvio aplicável | Sim | Igual |
| parada-programada | boa 150, refugo 16, cap. 266.66667, meta 214, OEE 0.5625 | Sem desvio aplicável | Sim | Igual |
| parada-nao-programada | boa 150, refugo 16, cap. 300, meta 240, OEE 0.5 | Sem desvio aplicável | Sim | Igual |
| parada-duplicada | boa 150, refugo 16, cap. 300, meta 240, OEE 0.5 | dia/D=-0.3333333333333333, dia/P=-1.6600000000000001, T1/D=-1, T1/P=-0.5 | Sim | Igual |
| abono-por-turno | boa 150, refugo 16, cap. 250, meta 200, OEE 0.6 | Sem desvio aplicável | Sim | Igual |
| turno-nao-produtivo-programado | boa 90, refugo 16, cap. 200, meta 160, OEE 0.45 | Sem desvio aplicável | Sim | Igual |
| turno-nao-produtivo-imprevisto | boa 90, refugo 16, cap. 300, meta 240, OEE 0.3 | Sem desvio aplicável | Sim | Igual |
| meta-hora | boa 150, refugo 16, cap. 300, meta 240, OEE 0.5 | Sem desvio aplicável | Sim | Igual |
| meta-apos-config | boa 150, refugo 16, cap. 300, meta 180, OEE 0.5 | Sem desvio aplicável | Sim | Igual |
| virada-turno | boa 40, refugo 4, cap. 100, meta 80, OEE 0.4; dia seguinte 150 peças | Sem desvio aplicável | Sim | Igual |
| virada-com-parada | boa 30, refugo 5, cap. 50, meta 40, OEE 0.6; dia seguinte 120 peças | dia/P=1.05, noturno/P=1.05 | Sim | Igual |

O quadro de hora a hora aplicou a meta importada de 70 peças no primeiro intervalo e fechou o dia em 240. A alteração controlada da meta produziu 180. A hora extra acrescentou um intervalo de 60 min. A parada programada reduziu o tempo líquido para 160 min. A não programada manteve 180 min líquidos e acrescentou 20 min à perda de Disponibilidade. O abono rateou 30 min. Na virada, 40 peças ficaram no dia inicial e 60 se somaram às 90 do dia seguinte. A parada de 20 min dividiu-se em 10 min por lado. A soma dos turnos foi ajustada pelas entradas e saídas da madrugada. No modo Dia, resultados por turno são não aplicáveis. As somas de produção, scrap, tempo, capacidade e metas coincidiram nos casos aplicáveis, com exceção do overflow.

## Achados por frente

## A · Cálculo e operação de chão de fábrica

### A01 · Produção ausente vira zero numérico no resumo publicado

- **Onde** motor/oee:1242–1245, 1269–1270, 1317–1320, 4308–4316
- **Evidência** No Chromium, três intervalos com good=null chegaram ao cálculo (goodMissing=3). No modo Dia, good=null chegou com goodMissing=1. Exports.build publicou boa=0 e oee=0 em ambos, sem transportar goodMissing. O controle com zero explícito produziu um objeto porDia idêntico ao do caso nulo-hora, mantendo os demais dados do cenário. O aviso local não acompanha esses campos. Viola a distinção do contrato 1 para consumidores dos exports.
- **Classificação** Crítica · esforço M · benefício Alto · Provado · Correção Crítica

### A02 · Refugo negativo aceito pelo motor produz Qualidade acima de 100%

- **Onde** motor/oee:1024–1035, 1277–1281
- **Evidência** Teste no motor com -50 no refugo do T1 e 6 no T2 trouxe scrap total -44, Q=141,51% no dia e Q=225% no T1. O resumo publicou scrap=-44. A prova injeta o valor na base fictícia em memória e não demonstra que um formulário normal o aceite.
- **Classificação** Alta · esforço M · benefício Alto · Provado · Correção Importante

### A03 · Paradas duplicadas podem deixar Disponibilidade e Performance negativas apesar do aviso

- **Onde** motor/oee:1029–1035, 1167–1169, 1339–1344
- **Evidência** Duas ocorrências duplicadas em cada uma de duas horas, numa base sintética, foram somadas em aMin=240 sobre 180 min líquidos. D=-33,33% e P=-166% no dia. O motor emitiu alerta de duplicidade e manteve os indicadores no resultado. O export mensal também publicou D=-0,3333 e P=-1,66. A prova é do cálculo sobre entrada inconsistente, sem afirmar que o formulário aceite duplicatas.
- **Classificação** Alta · esforço M · benefício Alto · Provado · Correção Importante

### A04 · Agregação de entradas finitas extremas produz Infinity e NaN

- **Onde** motor/oee:991–993, 1026–1043, 1242–1245, 1265–1270
- **Evidência** Duas quantidades finitas Number.MAX_VALUE chegaram a dois intervalos. O motor retornou Infinity em good/processed e NaN em Q, entre 18 campos derivados não finitos. O valor é fora da escala industrial. A reprodução cobre robustez no motor e não confirma aceitação pelo formulário.
- **Classificação** Média · esforço P · benefício Médio · Provado · Correção Importante

## B · Integridade e persistência

### B01 · Falha transitória de leitura no Gel permite sobrescrever uma revisão remota com cache antigo

- **Onde** motor/gel:973–978, 1005–1018
- **Evidência** Com OPFS e dados fictícios, o navegador carregou rev 1, o arquivo foi atualizado para rev 8 e uma leitura recebeu NotAllowedError transitório. fsReadBase devolveu null; a gravação normal substituiu a rev 8 pela rev 2, perdeu a alteração remota e limpou a fila sem erro. Reproduzido em Chromium, sem SMB.
- **Classificação** Crítica · esforço M · benefício Alto · Provado · Correção Crítica

### B02 · Sincronização de pendência da Administração grava sobre uma base de schema incompatível

- **Onde** motor/portal:635–653, 655–666
- **Evidência** Após falha de leitura simulada, uma alteração ficou pendente. Foi colocada no mesmo caminho uma base fictícia schema 99, com a mesma revisão e um campo novo. O sync de pendências gravou schema 1, apagou o campo novo e zerou a pendência. O caminho compara revisão/data sem validar o schema encontrado.
- **Classificação** Crítica · esforço M · benefício Alto · Provado · Correção Crítica

### B03 · Waste perde alteração externa feita entre releitura e gravação

- **Onde** motor/perdas:756–760, 790–809; comum/bases:525–549
- **Evidência** Uma segunda escrita OPFS foi intercalada após a pré-leitura, antes da gravação local. O arquivo final manteve a meta local 123, apagou a causa externa e limpou a pendência. Simulação determinística da janela entre operações de arquivo. Web Lock do navegador não cobre um gravador de outro contexto de armazenamento ou estação.
- **Classificação** Crítica · esforço G · benefício Alto · Provado · Correção Crítica

### B04 · Restauração de Paradas normaliza backup sem versão e descarta fila pendente

- **Onde** motor/paradas:378–385, 456–459
- **Evidência** Em OPFS fictício, um backup sem schemaVersion foi aceito; completar atribuiu versão 1, a base ficou na rev 8 e a operação pend-ficticia deixou de aparecer na fila durável após o espelhamento. Com backup v1 o descarte da fila também ocorreu. O ensaio chama a rotina de restauração e mede o estado persistido.
- **Classificação** Crítica · esforço M · benefício Alto · Provado · Correção Crítica

### B05 · Status local de backup mistura duas pastas e indica recuperação na pasta errada

- **Onde** comum/bases:307, 319–320, 355–359, 373–390
- **Evidência** Duas pastas OPFS, no mesmo navegador. Após falha de B, a consulta de A mostrou a falha de B. Depois de um sucesso em A, a consulta de B apareceu recuperada com o arquivo a2.json. A chave de cache contém somente o módulo, sem escopo da pasta.
- **Classificação** Alta · esforço M · benefício Alto · Provado · Correção Importante

### B06 · Ordens deixa de publicar falha de backup diário ao completar gravação

- **Onde** motor/oee:14195–14209
- **Evidência** A prova injetou falha transitória em backupSub no backup diário de Ordens. A base foi à rev 6 e a pendência foi limpa. vacBackupRegistro.ler('ordens') devolveu zero eventos. O ramo de substituição de competência tem guarda própria e não foi objeto deste achado.
- **Classificação** Alta · esforço P · benefício Alto · Provado · Correção Importante

## C · Rastreabilidade

### C01 · Trilha de edição de Waste e Administração guarda o nome do autor sem ID estável

- **Onde** motor/perdas:799–801; motor/portal:645–647; motor/oee:1888–1891
- **Evidência** As duas rotinas gravam audit.push com t, u, a e d; não incluem ID do autor. O motor de Produção grava userId no mesmo tipo de evento. Dois autores com o mesmo nome, ou um autor após renomeação, não podem ser distinguidos pela linha de auditoria dessas bases. Contrato 8 para responsáveis e atribuição de eventos devem ser tratados como requisitos distintos.
- **Classificação** Média · esforço M · benefício Alto · Provado · Correção Importante

### C02 · Histórico ativo é cortado por contagem de eventos

- **Onde** motor/perdas:801; motor/portal:647; motor/oee:14205–14206
- **Evidência** Waste e Administração removem as entradas anteriores às últimas 3.000 e Ordens mantém 5.000. É um limite direto da lista ativa; a auditoria não verificou um histórico arquivado e consultável que cubra a mesma janela. Isso limita reconstruir sequência de eventos a partir apenas da base corrente.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

## D · Segurança

As checagens locais cobriram escape de texto, CSV e a autorização de primeiro uso. O problema de recuperação do bootstrap está em E02. Não houve comprovação de execução de conteúdo ativo ou violação das guardas de segurança.

Suspeitas desta frente na seção seguinte · D01, D02, D03.

## E · Bugs e confiabilidade

### E01 · Cancelar o seletor de arquivo da Produção deixa a operação pendente

- **Onde** motor/oee:4762–4764, 4926, 6342–6344, 6540, 9238
- **Evidência** Em Chromium, o input suporta o evento cancel. No teste com um evento cancel sintético, a promessa de pickFile continuou pendente, mesmo após 200 ms. A função aguarda apenas change. Os chamadores ficam aguardando indefinidamente após cancelamento, embora não se tenha medido travamento da página e um novo clique possa abrir outro seletor.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

### E02 · Interromper a primeira gravação após criar o arquivo bloqueia a recuperação pela própria plataforma

- **Onde** motor/portal:614–615, 2043–2048, 2077–2082, 2098–2107, 2300–2304; modulo/core/runtime:344–352
- **Evidência** Teste de falha simulada no Chromium, com pasta OPFS realmente vazia: a operação normal criou 00. Bases e o handle do arquivo, a falha induzida interrompeu o fluxo antes da escrita e ficou um JSON de zero bytes com uma operação pendente. Releitura classificou o cadastro como erro e nova tentativa de gravar falhou com Unexpected end of JSON input. O primeiro uso não criou backup anterior e a tela para arquivo ilegível orienta restaurar um backup. A recuperação exige intervenção na pasta.
- **Classificação** Alta · esforço M · benefício Alto · Provado · Correção Importante

## F · Relatórios e exportações

### F01 · Excel pode exibir uma quantidade decimal como porcentagem

- **Onde** motor/oee:1826, 4539–4546, 9036–9057, 11254–11261
- **Evidência** Prova no modelo Hora a hora com demonstração e unidade fictícia de 90.000 peças, em memória. Para 45.000 peças de 06:00–07:00 de 19/11/2026, o HTML do modelo mostra Produção boa 0,5 e o XLSX contém valor 0,5, formato 0.0% e apresentação 50.0%. Em uma prova sintética diretamente na prévia, um campo Min de 0,5 também aparece como 0,5 no PDF e 50.0% no XLSX, inclusive no total. O exportador aplica a formatação pela magnitude sem considerar a unidade da coluna.
- **Classificação** Crítica · esforço M · benefício Alto · Provado · Correção Crítica

### F02 · Excel perde zeros à esquerda de códigos e converte identificadores em números

- **Onde** motor/oee:9038, 9045–9052, 11262–11277; CLAUDE.md, contratos 2 e 5
- **Evidência** No mesmo teste com prévia fictícia clonada, Código 00123 ficou 00123 na prévia e no texto extraído do PDF. O XLSX gerado contém na célula F2 um número 123, formato General. A conversão é feita por forma do texto e é usada também em outras tabelas de Relatórios, incluindo Lotes do MES com as colunas Lote, Catálogo e Ordem. A perda de zeros quebra a igualdade textual usada na rastreabilidade.
- **Classificação** Alta · esforço M · benefício Alto · Provado · Correção Importante

### F03 · Lista de paradas da Produção mantém registros de outra família mesmo com o filtro ativo

- **Onde** motor/oee:11189–11202, 11221, 11262–11268, 11280–11283
- **Evidência** Em demo, Produção › Relatórios › Tabelas › Lista de paradas, período 01–30/11/2026. O único evento FME de 19/11/2026 (07:00–07:30) tinha catálogo da família SST. Selecionar EDTA pelo filtro manteve aquela linha e o total 30 min. O PDF traz o subtítulo família EDTA junto da linha FME e total 30. O XLSX traz E2=30, F2=FME, E3=30. A tabela verifica turno e catálogo, mas não família.
- **Classificação** Crítica · esforço P · benefício Alto · Provado · Correção Crítica

Suspeitas desta frente na seção seguinte · F04.

## G · Desempenho

### G01 · Primeira abertura dos motores maiores domina a latência local

- **Onde** modulo/core/runtime:14–27, 574–612; motor/oee; motor/perdas; motor/gel
- **Evidência** Em Chromium 153, três ciclos de troca por rota sem cliques e com dados demo, 2 vCPU compartilhando a carga das suítes. Produção a 1440 px levou 3,236 s no primeiro ciclo e 1,115 s no terceiro. Em 390 px, 4,604 s e 1,276 s. A prova mede tempo até vacPagina.pronto(), desde a troca de rota, e compara os ciclos da sessão. Não atribui a diferença ao viewport nem extrapola para as estações.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

### G02 · Ciclos de navegação retêm nós e listeners após coleta forçada

- **Onde** modulo/App:742; modulo/core/runtime:237–285, 539–577
- **Evidência** Após 12 ciclos Produção → Waste → Gel → Visão da linha em desktop e coleta forçada a cada retorno, CDP mediu 125.434 → 129.895 nós e 948 → 1.058 listeners, com aumento de 10 listeners por ciclo após o primeiro. Documentos e iframes ficaram em 6 e 3. A medição prova o crescimento no recorte. Um perfil de heap ainda é necessário para atribuir a retenção e estimar o impacto em sessões longas.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

### G03 · Consolidado de Produção percorre vizinhos por busca linear para cada dia

- **Onde** motor/oee:1119–1127, 1449–1460, 1487
- **Evidência** Engine.periodResult em Chromium com três intervalos por dia e três repetições. Medianas com 30, 365 e 730 dias: cálculo inicial 9,1 / 201,8 / 1.004,9 ms. A repetição com cache levou 0,9 / 119,4 / 367,9 ms. Verificado boa=150×dias e capacidade=300×dias. O cache ainda busca vizinhos em productionDays por dia; a estação local também executava suítes, então os tempos são comparativos.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

## H · Estrutura técnica e arquitetura

### H01 · A navegação ativa do cabeçalho repete o mesmo corpo de função nos nove motores.

- **Onde** motor/portal:549 · motor/oee:5119 · motor/perdas:1770 · motor/gel:1271 · motor/paradas:1063 · motor/equip:137 · motor/inic:140 · motor/linha:351 · motor/projetos:99
- **Evidência** O hash do corpo de renderSysNav (11 linhas) coincide nos nove blocos. Os corpos de VacEntrar.abrir e VacEntrar.id (7 linhas cada) também coincidem, embora o entorno tenha variantes. Cada correção de navegação precisa ser replicada entre documentos separados. Uma eventual extração deve preservar a restrição de versão própria de Produção, o contrato vacPagina, os IDs e aliases de rota.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

### H02 · A casca e os motores mantêm duas implementações da regra base de permissões.

- **Onde** comum/bases:4–10 · modulo/core/permissoes:1–7 · modulo/core/auth:11–14 · testes/plataforma/permissoes-paridade.cjs:2–3
- **Evidência** Ambas as cópias mantêm o alias linha → equip e a mesma decisão por perfil. A casca importa a versão ES, e os motores montam a versão clássica do kit. Há regressão de paridade para nove módulos e sete ações usando o Portal como consumidor do kit. A regra coincide hoje, mas uma mudança de política exige atualizar as duas fontes e preservar as travas específicas de cada motor.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

### H03 · Os dois parsers de Meta OEE FY27 reconhecem famílias diferentes em quadros hora a hora.

- **Onde** motor/portal:3011,3030–3037,3088–3089 · motor/oee:3285,3334–3352,6542–6545,14737–14742,14762–14772
- **Evidência** A mesma planilha fictícia com título 'FX1 – Outubro/26', família FX1 no cadastro, PPH 200, OEE 50% e meta 100 é lida pelo Portal e rejeitada pela Produção com 'Nenhuma meta reconhecida'. O controle FX funciona em ambos. A expressão do Portal aceita dígitos no código e a da Produção aceita só letras. No fluxo com cadastro central, pasta ou demonstração, a Produção troca o botão da importação por um atalho à Administração, confirmado no demo em Chromium; o teste de parser é isolado e não demonstra erro de gravação ou impacto no uso padrão. Vincular ao PERF-01 existente e fixar a paridade antes de unificar ou retirar o caminho antigo.
- **Classificação** Média · esforço M · benefício Médio · Provado · Melhoria

### H04 · Administração e Waste repetem partes do gerador de relatórios sob o mesmo contrato de documento.

- **Onde** motor/portal:712,726,739,756 · motor/perdas:2134,2148,2161,2178 · PENDENCIAS.md:90
- **Evidência** Os corpos de Report.html, open, pdf e xlsx são idênticos na extração AST, com 11, 9, 17 e 5 linhas. Os motores já usam vacPdf e vacEmail para partes do formato. A coincidência de código evidencia duplicação, enquanto filtros, dados brutos e auxiliares locais precisam de prova de equivalência antes de unificar, conforme REL-03.
- **Classificação** Baixa · esforço M · benefício Médio · Provado · Melhoria

### H05 · O contrato de execução depende de nomes globais implícitos entre scripts de cada iframe.

- **Onde** modulo/core/runtime:151–158,215–228 · comum/interface:119,1702–1729 · motor/portal:2247 · Plataforma.html:58688–58718
- **Evidência** A casca carrega módulos ES por importmap. Cada motor roda em um srcdoc próprio, com scripts clássicos do kit e do motor. A análise lexical identifica 358 declarações de nível superior nos três scripts de Produção (302, 3 e 53) e 415 no script principal do Portal, antes de inserir os blocos comuns. O preâmbulo cria vacCodigo por W.vacCodigo, invisível à heurística estática de membros de window, embora comum/interface e Portal o consumam. Em Chromium, Engine e vacCodigo foram acessíveis dentro do iframe da Produção. parent.Engine retornou undefined. Um lint por documento montado com globais do contrato declaradas pode sinalizar nomes ausentes e evitar buscar uma definição em um iframe irmão; o caminho de integração entre casca e motores já é vacPagina.
- **Classificação** Baixa · esforço M · benefício Médio · Provado · Melhoria

## I · Qualidade de código

### I01 · O objeto de ícones comuns declara ampliar duas vezes.

- **Onde** comum/interface:1773,1785
- **Evidência** ESLint no-dupe-keys acusa a segunda entrada. Um teste do objeto original confirma que a segunda propriedade prevalece e que os dois SVGs são idênticos. Uma futura alteração só na primeira definição ficaria sem efeito.
- **Classificação** Baixa · esforço P · benefício Baixo · Provado · Melhoria

### I02 · As nove cópias de renderSysNav_v1 ficaram sem consumidores.

- **Onde** motor/portal:503 · motor/oee:5077 · motor/perdas:1728 · motor/gel:1229 · motor/paradas:1023 · motor/equip:97 · motor/inic:100 · motor/linha:311 · motor/projetos:59
- **Evidência** A busca pelo símbolo em todo Plataforma.html dá nove ocorrências, todas declarações. A busca pelo símbolo nos testes, scripts acessíveis e documentação também deu zero. O código ativo chama renderSysNav sem sufixo. As versões antigas confundem buscas e tornam uma alteração de cabeçalho mais difícil de localizar.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

### I03 · O painel do Waste ainda inicializa um resumo removido e recalcula valores exclusivos dele.

- **Onde** motor/perdas:270–273,356,1390–1398
- **Evidência** O ramo if(false) impede o resumo de renderizar. vMat e vScr desse escopo são calculados a cada renderPainel e só aparecem no ramo inalcançável. O código ainda esconde o contêiner e esvazia seu HTML. A lista mat e semEstr seguem usadas nos indicadores e pertencem ao fluxo ativo; o relatório possui agregações próprias.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

### I04 · A troca de data na Linha do tempo atribui a propriedade de turno a ela mesma.

- **Onde** motor/oee:7808–7814
- **Evidência** ESLint no-self-assign marca S.shiftId = S.shiftId no onChange. A atribuição é inócua e o evento também grava App.sel.date e redesenha. O reset de turno só está explícito no botão de limpar. A autoatribuição pode ser retirada sem decidir outro comportamento do filtro.
- **Classificação** Baixa · esforço P · benefício Baixo · Provado · Melhoria

### I05 · A casca concentra 825 linhas de estado, efeitos e renderização em App.

- **Onde** modulo/App:55–879 · motor/oee:905–1638,2173–3240,13246–13845
- **Evidência** Espree mede 825 linhas de App, que reúne navegação, pasta, sessão, filtros e renderização. Na Produção, as funções externas autoexecutáveis de Engine, Actions e Sqdcp medem 734, 1.068 e 600 linhas; elas contêm funções internas e o número mede a fronteira de composição. A manutenção deve começar pelo comportamento que vier a mudar, com teste que fixe a saída conforme o gatilho em docs/DECISOES-HISTORICAS.md:271.
- **Classificação** Baixa · esforço G · benefício Médio · Provado · Melhoria

### I06 · A checagem lint padrão omite o JavaScript do aplicativo entregue.

- **Onde** eslint.config.mjs:1–3,31–38 · package.json:20–21 · comum/interface:1785
- **Evidência** O próprio eslint.config.mjs delimita npm run lint à infraestrutura. A extração independente de 56 unidades analisou o código incorporado e acusou a chave duplicada em comum/interface, a autoatribuição da Linha do tempo e o ramo constante do Waste. Integrar regras objetivas na validação da fonte canônica ajudaria a manter visibilidade sobre regressões, com configuração por escopo e sem confundir definições compartilhadas e alertas do lint.
- **Classificação** Média · esforço M · benefício Alto · Provado · Melhoria

### I07 · A instrução na importação da Produção ainda manda localizar SheetJS ao lado do HTML ou na internet.

- **Onde** motor/oee:6529 · modulo/core/runtime:272–289,609–613 · docs/ARQUITETURA.md:7–11
- **Evidência** A mensagem é parte de Cfg.importacao.render e foi confirmada na tela em Chromium. O runtime converte a tentativa de anexar script XLSX em carregamento de biblioteca incorporada, e loadLibrary lê o recurso xlsx do próprio HTML. A instrução antiga orienta uma ação desnecessária, especialmente na estação sem internet.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

## J · UX

### J02 · O foco sai do diálogo de metas da Produção durante a navegação por teclado.

- **Onde** Plataforma.html · motor/oee:4729–4741 (modal) e 7151 (metasModal)
- **Evidência** Na demonstração, entrar em Produção → Lançar meu turno → Metas dos próximos meses. O diálogo aria-modal inicia com foco em Fechar no rodapé. Pressionar Tab leva o foco ao body da casca, enquanto o diálogo permanece aberto. Após mais Tabs, a navegação alcança links e botões da casca. Tab seguido de Escape manteve o diálogo aberto. Reproduzido no Chromium a 390 × 844 nos dois temas. O modal fornece foco inicial e devolução de foco, mas não contém a tabulação.
- **Classificação** Média · esforço M · benefício Alto · Provado · Correção Importante

### J03 · Ao confirmar a produção por hora, a tabela volta à esquerda e recorta o próximo campo em foco.

- **Onde** Plataforma.html · motor/oee:4801–4819 (renderNow) e 7101–7116 (commit e Enter/↓)
- **Evidência** Na demonstração, em Produção → Lançar meu turno com registro por hora, clicar no primeiro campo Produção boa, trocar o valor por 1 e pressionar Enter. Em 390 × 844, clicar deslocou a tabela de 918 px em 64 px para mostrar o campo de 110 px inteiro. O valor atualizado foi exibido e o foco avançou de 14:30–15:00 para 15:00–16:00, mas a tabela recriada voltou a scrollLeft=0. A coluna fica recortada em cerca de 63 px: borda direita do campo em x=417,6, limite do cartão em x=355. Reproduzido em claro e escuro. A renderização troca main.innerHTML e restaura o foco com preventScroll=true.
- **Classificação** Média · esforço M · benefício Alto · Provado · Correção Importante

## K · Layout e design

### K01 · Os rótulos brancos das barras de Gestão de Gel perdem contraste no tema escuro.

- **Onde** Plataforma.html · motor/gel:270 (.chart text.blbl), 5953–5955 (barLbl) e 5993–5994 (barras e rótulos de dbTime)
- **Evidência** Na demonstração, Gestão de Gel → Visão Geral → OEE por dia, modo Colunas. O texto branco #FFFFFF fica integralmente dentro da barra rosa #FFABAC no tema escuro. Com as cores computadas no Chromium, o contraste é 1,80:1, abaixo de 4,5:1 para texto normal. Em Produção × plano, os dois rótulos brancos sobre barras azuis dão 1,92:1 e 2,81:1 no escuro. A medição comparou o fill do texto com o do retângulo imediatamente anterior e verificou o encaixe geométrico do rótulo na barra.
- **Classificação** Média · esforço P · benefício Alto · Provado · Correção Importante

### K02 · O gráfico OEE por dia da Gestão de Gel reduz rótulos para cerca de 2,5 px no celular.

- **Onde** Plataforma.html · motor/gel:419 (.dbchart), 5981–5993 (SVG e textos) e 6065 (OEE com viewBox de 1.440 px)
- **Evidência** Na demonstração, Gestão de Gel → Visão Geral → OEE por dia. Em uma janela de 390 px, a largura disponível de 324 px reduz o SVG com viewBox de 1.440 px a uma escala de 0,225. O rótulo da barra de 11 px aparece com cerca de 2,48 px. As capturas nos dois temas mostram os eixos e o número da barra ilegíveis nesse tamanho. A legenda e a opção CSV continuam disponíveis.
- **Classificação** Média · esforço M · benefício Alto · Provado · Correção Importante

### K03 · Descrições dos cartões da Central de importações ficam em 11 px no celular.

- **Onde** Plataforma.html · css/style:957–958 (.import-row p)
- **Evidência** Abrir Central de importações a 390 px. O texto “Catálogos, lista técnica, ritmos, turnos e metas vigentes.” aparece com font-size computado de 11 px em ambos os temas, abaixo do piso visual de 12 px documentado em docs/DESIGN_SYSTEM.md e .claude/skills/padrao-visual/SKILL.md. As descrições ajudam a escolher o importador.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

## L · Roadmap

### L01 · O plano ainda prevê a coleta automática por pasta após a decisão de manter a importação manual.

- **Onde** docs/PLANO-DE-MELHORIAS.md:35–36 · PENDENCIAS.md:15 · docs/DECISOES-HISTORICAS.md:650
- **Evidência** A decisão de 21/11 encerrou E9 e manteve a importação manual, sem estação coletora. A seção ativa do plano inclui E9 como dependência e orienta preparar a coleta depois da definição da estação. Atualizar a sequência evita voltar a financiar um trabalho encerrado.
- **Classificação** Média · esforço P · benefício Médio · Provado · Correção Importante

### L02 · A lista oficial ainda pede autorizações que aparecem como concedidas nas linhas seguintes.

- **Onde** PENDENCIAS.md:20–22
- **Evidência** BLOCO-3B lista abono padrão, mapa de tags da Linha do tempo, descrição e vigência do código de parada e logo único em 'Falta decidir/autorizar'. CARGA-TAB marca o abono na Administração, e CONTRATO7-AUT registra as outras três autorizações de 26/11 e pede conferência. A decisão sobre DEFAULT_CAUSAS/DEFAULT_TIPOS do Paradas deve permanecer distinta dos padrões do Waste.
- **Classificação** Média · esforço P · benefício Médio · Provado · Correção Importante

### L03 · O estado de REL-01 aparece encerrado e parcial na mesma lista de pendências.

- **Onde** PENDENCIAS.md:15,63,83 · docs/PLANO-DE-MELHORIAS.md:17
- **Evidência** A abertura inclui REL-01 nos itens concluídos sem nada a fazer e retirados. A tabela ainda inclui REL-01 / REL-02 como Parcial e aponta homologação dos formatos e do Outlook junto de H05; o plano agrupa os três. Explicitar o estado de cada ID evita reabrir a implementação concluída de REL-01 ou perder a homologação que segue pendente.
- **Classificação** Baixa · esforço P · benefício Médio · Provado · Melhoria

## Suspeitas e o que falta provar

### D01 · A abertura de anexos de equipamento não separa arquivos ativos da origem da plataforma

- **Onde** motor/portal:1995–2002, 2761–2762, 2776, 2858–2862
- **Evidência** A ficha aceita documentos sem limite de tipo, copia os bytes de arquivos de até 80 MB e abre o Blob resultante em nova aba, sem isolamento explícito nem restrição a formatos passivos. A confirmação exige caracterizar como Chrome/Edge corporativo trata tipos ativos nesse fluxo e contexto de origem; a auditoria não executou conteúdo ativo.
- **Classificação** Alta · esforço P · benefício Alto · Suspeita · Correção Importante

### D02 · Sessão e bloqueio após erros dependem do armazenamento do navegador

- **Onde** comum/interface:990–1019, 1045–1056, 1085–1087; modulo/core/auth:2–14; motor/portal:2037
- **Evidência** O fluxo deriva PBKDF2-SHA256 com sal e 150 mil iterações, para PIN de seis dígitos. A cópia local mantém o verificador de senha; a casca identifica a sessão por dados locais e valida senha apenas na entrada. O limite de cinco erros é local. Se o controle precisar de assegurar autoria diante de acesso ao perfil do navegador ou de leitura direta da pasta, a arquitetura atual tem uma fronteira de confiança insuficiente. Nenhuma adulteração ou tentativa de recuperação de senha foi executada.
- **Classificação** Alta · esforço G · benefício Alto · Suspeita · Evolução

### D03 · Escritas normais em fluxo aberto têm cobertura diferente das duas exceções sem permissão comum

- **Onde** modulo/core/runtime:45–52, 344–381; modulo/core/compatibility:29–57
- **Evidência** A revisão da casca mostra que safeFolder usa o resultado de protectFolder para atualizar a política, mas retorna o handle original. O invólucro do motor verifica a permissão antes de abrir um stream normal e o devolve diretamente. O stream de cadastro inicial e conta própria revalida a política em write e close. Falta caracterizar perda de sessão ou mudança de perfil durante uma gravação operacional em curso; a revisão não executou alteração sem sessão.
- **Classificação** Média · esforço M · benefício Médio · Suspeita · Correção Importante

### F04 · Lotes do MES exibe filtro de turno sem aplicar o recorte ao total

- **Onde** motor/oee:11195, 11221, 11269–11283
- **Evidência** O cabeçalho anuncia o turno selecionado, mas a tabela agrupa os segmentos por lote e acumula caixas e produção depois de aplicar data, dia da semana, catálogo e família. A seleção de turno não entra no laço. Falta provar com segmentos fictícios em turnos diferentes e pactuar como atribuir caixas de um lote que atravessa turnos.
- **Classificação** Alta · esforço M · benefício Alto · Suspeita · Correção Importante

## Cobertura das suítes e lacunas

Resultados com ressalva na suíte de motores

- passou*  tnv (43 s) · NV01-identidade-por-handle-persistido {"id":"NV01-identidade-por-handle-persistido","naoVerificado":true,"motivo":"o navegador caiu no meio do caso (Chromium deste ambiente)"}

A repetição isolada de tnv.js retornou código 0. NV01-identidade-por-handle-persistido continuou sem verificação por queda do Chromium.

Ocorrências na repetição de plataforma

- NÃO VERIFICADO file:// bloqueado pela política do Chromium do ambiente; usando transporte HTTP local para o mesmo arquivo.

- **Persistência e rastreabilidade.** Leitura dos nove motores, versão, fila, backups, confirmação, proprietário de escrita e identificação. A suíte e os ensaios em OPFS cobrem conexão, reabertura e falhas selecionadas. Faltam SMB real, duas estações, desconexão física durante gravação, retomada após encerramento forçado do navegador, cotas e retenção corporativa. Web Locks coordenam contextos do mesmo navegador.
- **Segurança e primeiro uso.** Primeiro-uso verifica senha fraca, ID inválido, confirmação, clique duplo, único ADMIN, hash e recusa após cadastro. O teste padrão já contém 00. Bases e não cobre a falha verificada em E02. As verificações de texto e CSV cobrem contextos amostrados. Faltam políticas reais de navegador e ACL, combinações completas de perfil × ação e o comportamento dos formatos de anexo nos destinos corporativos.
- **Relatórios.** Comparei prévia, texto do PDF e XLSX real em Produção. Rel02-formatos cobre o molde de PDF em vários motores. Gel-relatorio verifica integração com Produção, prévia e células amostradas. Trelatorios verifica saídas PDF/Excel de fluxos selecionados. Faltam paridade integral CSV–tela–XLSX–PDF por filtro, grupo e ordenação em todos os motores, Outlook corporativo e impressão física.
- **Desempenho.** HTML de 7.802.558 bytes, motor/oee de 1.752.002 e motor/gel de 994.495 bytes extraídos. Foram medidos tempos de abertura, DOM e heap, e ciclos com coleta forçada. Além dos estados da interface, a prova sintética variou de 30 a 730 dias (G03). Faltam baselines em estações alvo, carga longa com o volume operacional e atribuir a origem do crescimento de G02 por perfil de heap.
- **UX e layout.** 52 capturas de 13 rotas em 1440 e 390 px, claro/escuro, sem erro JavaScript na navegação observada ou rolagem horizontal global no estado de entrada. As rolagens internas de tabelas e mapas foram tratadas como tal. A suíte de contraste amostra fundos sólidos. Faltam gradientes e imagens, vários elementos SVG/canvas, leitor de tela, toque físico, zoom ampliado, impressão e todas as combinações de estado.
- **Cálculo e operação.** Os dados são sintéticos e a matriz usa casos dirigidos. Faltam oráculos aprovados para todo o histórico, combinações exaustivas de alteração de vigência, fechamento e importação, e reconciliação de cada export agregado com todos os registros-fonte. As fórmulas e regras operacionais permaneceram intactas.

### Provas conservadas

O [diretório de evidências](/workspace/scratch/auditoria-contraparte-evidencias) contém scripts, logs e capturas fora do Git. Para reproduzir A, use propriedades.cjs e propriedades.json. Para ESLint e mapa das fontes, use eslint-blocos.cjs e estatica.json. Para G/J/K, visual.cjs, jornadas.cjs, as capturas em prints e as provas específicas de teclado e contraste. Os casos OPFS de B estão em audit-bc-repro.cjs, com os modos gel, portal, waste, paradas, paradasOps, backups e ordens. Os testes de relatório e bootstrap têm scripts independentes no mesmo diretório.

## Priorização e veredito

**Correção Crítica** · F03, A01, B01, B02, B04, F01, B03.

**Correção Importante** · B06, K01, A02, A03, B05, E02, F02, A04, L01, L02, C01, J02, J03, K02.

**Melhoria** · I06, C02, E01, G01, G02, G03, H01, H02, H03, I02, I03, I07, K03, L03, H04, H05, I01, I04, I05.


A ordem usa gravidade × benefício ÷ esforço dentro de cada classe. A sequência prática começa por B01–B04, incluindo o ensaio de recuperação do primeiro uso de E02. A01, F01 e F03 são condições para usar os indicadores como referência oficial. As suspeitas devem voltar para prova antes de serem incorporadas como defeitos confirmados.

**Veredito.** A revisão auditada serve para demonstração e consulta assistida, com conferência independente dos números. Eu não liberaria gravação operacional, restauração de backups ou emissão oficial de indicadores a partir deste SHA. Os ensaios mostraram perda de dados e divergências mensuráveis de cálculo publicado e de relatórios. A liberação deve passar pela correção dos pontos críticos, regressão sobre o novo SHA e H01/H02 no ambiente corporativo. Abertura local por arquivo e simulação OPFS ajudam a repetir os casos; a autorização de uso concorrente depende da prova física.

Na comparação entre auditorias, faça o cruzamento por bloco e função, mais a entrada e o resultado observado. Quando apenas um lado tiver registrado o caso, a resposta deve ser “confirmo”, “não reproduzo” ou “já coberto por <teste>”. Para divergências reexecute a prova sobre o mesmo SHA, preservando a diferença entre motor, interface e arquivo exportado. As perguntas de negócio estão no arquivo separado.
