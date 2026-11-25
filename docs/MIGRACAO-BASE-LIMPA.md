# Roteiro do corte: migração pontual da base limpa

Uso único. A ferramenta fica em **Saúde dos dados › Ferramentas locais › Migração pontual (uso único)**. Ela leva os dados da main ao formato da base limpa. Sai da plataforma depois do corte aceito. Desenho: `docs/superpowers/specs/2026-11-25-migrador-pontual-design.md`.

Nada disto foi homologado em SMB. H01 e H02 (PENDENCIAS.md) seguem pendentes. Faça primeiro um ensaio numa cópia da pasta. A cópia do ensaio também precisa ser **conectada na plataforma** (mesmo navegador), senão a ferramenta não acha o escopo e não grava. Registre a duração do ensaio (do clique em Aplicar ao "Concluído") e o tamanho do registro em `00. Backups/Migracao`: serve de estimativa para a janela real.

## O que a ferramenta exige

- Um navegador onde a pasta **já foi conectada na plataforma** (mesmo perfil do navegador). Sem isso ela não acha o escopo da pasta e não grava.
- Login de quem **edita todos os assuntos da Administração**. Quem tem um assunto só em "ver" não consegue aplicar.
- Web Locks só coordenam abas do **mesmo navegador** e só a Administração e o Waste os usam. A ferramenta **não vê outras estações**. A Produção não avisa abas abertas: feche todas.

## Carimbo de versão do Waste e do Gel (M1b)

A main não gravava `schemaVersion` em `perdas-base.json` (Waste) nem em `fifo-base.json` (Gestão de Gel). Depois do bloqueio de versão anterior (bloco 2), uma base sem `schemaVersion` abre só para consulta. Por isso o item **M1b** acrescenta `schemaVersion: 1` nesses dois arquivos (e só isso: o resto não muda). Sem a migração, Waste e Gel abririam bloqueados na pasta real. Arquivo com outra versão ou de outro tipo vira exceção `M1b-versao` ou `M1b-estrutura`. Ordens (`ordens-base.json`) já grava a versão na main e não precisa de carimbo.

## Antes do corte

- [ ] **Janela combinada.** Todos os demais gravadores parados: outras estações, outras abas, celulares que importam turno. Fechar todas as abas da Produção.
- [ ] **Backup integral verificado** da pasta inteira, aberto e conferido (copiar, abrir um arquivo, comparar tamanhos). Guarde fora da pasta.
- [ ] **Vigência de perdas teóricas do gel** cadastrada em Administração › Gel, com a data mais antiga necessária. A main usava valores fixos; sem vigência a plataforma não mostra teórico.
- [ ] **M6 em cada estação.** A tela lista as filas antigas do navegador em que roda; ela só enxerga o navegador atual. Em cada estação, abra a versão atual (main) e deixe a fila ser enviada. O histórico de importação da main sozinho não prova que a estação passou por ela. Registre uma linha por estação:

| Estação | Navegador/perfil | Data e hora | Quem | Filas encontradas | Enviadas (sim/não) |
|---|---|---|---|---|---|
| | | | | | |

## Corte

1. Conecte a pasta na plataforma e entre com a conta que edita a Administração.
2. Abra a ferramenta e leia a prévia (contagens por item e por arquivo).
3. Decida **toda exceção** (pessoa, "Sem responsável" ou "Deixar como está"). A gravação recusa com exceção pendente. As exceções são decisão do responsável. Exceção **sem opção** ("Sem opção: corrija a causa") não tem decisão: a gravação fica bloqueada até a causa ser corrigida no arquivo (ou o módulo ser aberto uma vez) e a prévia ser refeita.
4. Baixe o relatório CSV e guarde-o junto do backup. Evidência: nome do arquivo e quem decidiu.
5. Confirme a janela, digite **MIGRAR** e aplique. Cada arquivo é relido, tem backup e é conferido depois.
6. **Interrompeu?** Use **Retomar** (continua sem duplicar) ou **Restaurar** (digite **RESTAURAR**; volta os arquivos pelos backups). Nunca refaça a prévia por cima de um registro incompleto. O resultado da retomada aparece no quadro "Resultado" da aplicação.
7. Registro em **concluído parcial** ou arquivo **não tocado**: a migração não gravou aquele arquivo porque outra pessoa o mudou depois da prévia. Refaça a prévia desse arquivo (depois de fechar o registro) e aplique de novo; não restaure por cima.

Os backups da migração ficam em `00. Backups/Migracao/<módulo>/antes-da-migracao-<data>.json`. A retenção do contrato 9 não os apaga. Copie para fora antes de qualquer limpeza. O registro fica em `00. Backups/Migracao/registro-<data-hora>.json`.

## Depois do corte

- [ ] **Conferir M5** (botão **Conferir M5** na ferramenta, só leitura; usa `conferirM5`) antes de qualquer limpeza no Waste. As ações originais continuam no Waste; as cópias vão para as Iniciativas. Ação com pessoa sem decisão não é criada e aparece em "faltam" (a tela explica isso); "divergentes" lista título, status, prazo ou responsável diferentes.
- [ ] **Republicar os exports (resumos) de cada módulo.** A migração grava só as bases; **não recalcula os exports** (`exports` dentro de cada `*-base.json`), que é o que os outros módulos leem. Quem republica é o próprio módulo, quando grava. Abrir **não** basta para todos (comprovado no ensaio com a cópia fictícia, `testes/plataforma/migracao-ensaio.cjs`):

  | Módulo | Abrir regrava o resumo? | Para regravar |
  |---|---|---|
  | Administração, Iniciativas, Equipamentos, Linha 360° | Sim, **se** o resumo falta, é de outra versão do módulo **ou foi gerado em outro dia**. Se já foi gerado hoje, **não**. | Abrir com sessão que grava (e permissão da pasta). Se o módulo já gravou hoje: qualquer gravação real dele, ou abrir no dia seguinte. |
  | Produção | Sim, observado com base válida e sem resumo. A regra do mesmo dia não foi provada. | Abrir; ou qualquer lançamento. |
  | Paradas | **Não** (só grava ao abrir se houver fila). | Botão **Sincronizar** (ou qualquer gravação). |
  | Waste | **Não**, nem com Sincronizar. | Qualquer gravação do módulo; a mais neutra é **Salvar configuração** (grava a configuração como está, com uma linha na auditoria). |
  | Gestão de Gel | **Não**, nem com Sincronizar. | Qualquer gravação do módulo (estoque, consumo, scrap). |

  Detalhes que mudam a conferência:
  - Iniciativas, ao abrir, também importa as ações da Reunião diária (Portal) e grava por isso; a primeira reabertura pode alterar a base além do resumo.
  - Sem sessão que grava, o módulo só consulta e não regrava nada.
  - Conferir pelo campo `exports.geradoEm` de cada base (deve ser da data do corte ou depois). Enquanto o resumo é o antigo, o consumidor lê o antigo: na demonstração, o Waste via 5 ações de Iniciativas e passou a ver 6 só depois que Iniciativas republicou. Resumo ausente aparece para o consumidor como "sem exports", nunca como zero.
  - O ensaio não prova a Produção no mesmo dia, nem o comportamento com a base real de qualquer módulo (arquivos reais são maiores e têm mais gravadores).
- [ ] Conferir Reunião diária, Minha fila e o teórico do gel (comparar com o valor anotado antes).
- [ ] Se houve **restauração**: ela baixa a revisão das bases. Estações com fila guardada podem reenviar. Conferir antes de liberar as estações. Uma pasta restaurada volta ao formato da main: esta plataforma deixa de operar nela (mostra "Erro a conferir") até migrar de novo; o que ficou guardado no navegador continua lá.
- [ ] **Gravações feitas depois do corte e a restauração (tudo ou nada).** A restauração **nunca** sobrescreve um arquivo que mudou depois da migração e **não é parcial**: antes de gravar qualquer arquivo ela confere todos; se um deles mudou depois do corte ou não pôde ser lido, recusa a restauração inteira, não grava nada e lista o arquivo ("Restauração recusada, nada foi gravado"). A pasta fica como estava, sem ficar mista. Antes de restaurar: (1) feche a plataforma em todas as estações (com aba aberta a ferramenta também recusa e não grava nada); (2) se algum módulo gravou depois da migração, decida primeiro se quer perder essa gravação; (3) se a restauração foi recusada por um arquivo, guarde uma cópia dele, restaure esse arquivo à mão a partir do backup (`00. Backups/Migracao/<módulo>/antes-da-migracao-<data>.json`) e rode a restauração de novo para os demais, ou migre de novo. Pedir só alguns arquivos continua permitido, desde que nenhum deles tenha mudado.

## Ensaio com dados fictícios

`FASE=exports|restauracao|restauracao-total node testes/plataforma/migracao-ensaio.cjs` monta uma pasta fictícia conectada (OPFS do Chromium), mede prévia, aplicação interrompida depois de uma gravação, retomada, quais operações regravam cada export, restauração recusada com aba viva e com arquivo alterado, restauração total, M5, duração e tamanho do diário, e grava a evidência em `testes/saida/migracao-ensaio-<fase>.json`. Não substitui H01/H02: não é SMB, nem duas estações, nem a fila durável de um módulo (os módulos rodam em quadros de origem opaca, fora do alcance do ensaio).

## Evidências do corte

| Item | Evidência (arquivo, data, quem) |
|---|---|
| Backup integral | |
| Vigência do gel | |
| M6 por estação (tabela acima) | |
| Relatório CSV e decisões | |
| Registro da aplicação | |
| Conferência M5 | |
| Exports republicados (`exports.geradoEm` de cada base, por módulo) | |
| Cópia dos backups da migração fora da pasta | |
