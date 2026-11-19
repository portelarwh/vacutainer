# Fronteira entre casca e motores

As regras estão nos blocos motor/* do Plataforma.html. O bloco compartilhado comum/interface publica window.vacPagina nos nove documentos internos, sem HTMLs externos nem build Python. A casca usa esse contrato; não executa eval nem consulta Store, Cad, FS ou nomes privados.

| Operação | Contrato |
|---|---|
| `pendente()` | Booleano; erro, conexão em andamento e rascunho não concluído contam como pendência na troca de pasta. |
| `conectado()` | Só retorna verdadeiro depois de concluir a conexão/leitura. |
| `conectar(dir)` | Usa o handle nativo escolhido pela casca; não escolhe outra pasta. |
| `ir(aba, hash?, contexto?)` | Delega à navegação existente, preservando ficha/ordem/lote e os filtros do motor. |
| `abas()` | Publica rotas e rótulos do próprio motor; a casca não mantém uma segunda lista. |
| `abrirOrdem(numero)` | Abre a ficha pelo código textual, sem converter zeros à esquerda. |
| `comandos()/comando(id)` | Reaproveita os comandos do cabeçalho: `{id,label,dica,disabled,itens?}`. `itens` contém os comandos dos menus TV/Mais. A casca chama o mesmo ID do item original; descrições não viram rótulos longos. |
| `diagnostico()` | Consulta assíncrona, sem criar pasta/arquivo: nome da base, pasta de backup, fila durável do módulo e registros já disponíveis de backup; erros são informados. |
| `info()` | Versão, indicadores separados em `estado: [{texto,tom}]`, `situacaoPagina` e autorização de impressão. |
| `atualizar()/imprimir()` | Releitura e impressão pelo próprio motor. |
| `pode(modulo,acao)` | Mesma regra pura do kit em permissoes.mjs; linha usa o módulo equip. |
| `executarContaPropria(codigo,operacao)` | Transação restrita de senha/autocadastro no Portal; fila validada, backup e confirmação por releitura, sem liberar outras alterações. |
| `autenticar()/sessao()` | Delega ao vacLogin; a casca não fabrica sessão nem escolhe identidade numa lista. |
| `descartar()` | Encerra timers e observers antes de retirar o iframe. O callback ref tem identidade estável entre renders. |

Antes de conectar, a casca confere as versões nas localizações reconhecidas. Portal também confere o cadastro geral; Produção também confere ordens-base. Base mais nova impede escrita. Os handles continuam nativos, inclusive no IndexedDB; a proteção da File System Access API é instalada no realm do motor.

Cada pasta recebe um escopo persistente por isSameEntry. Reservas, cópias pendentes e a fila vacFila são conferidas mesmo sem um módulo aberto. A checagem é repetida depois do seletor de pasta. Falha de leitura bloqueia a troca. Eventos publicados aos módulos usam as chaves canônicas, sem o prefixo de isolamento.

O carregador monta os documentos a partir dos blocos do próprio HTML. As adaptações estruturais do runtime usam replaceOnce e falham caso a âncora esteja ausente ou duplicada. O verificador monta os motores, confere sintaxe, hash/tamanho e rejeita dependências externas.

Essas proteções são controles do aplicativo, sem substituir permissões de arquivo da rede. Não constituem comprovação de concorrência segura em SMB: essa homologação continua obrigatória antes do corte.

## Troca de pasta com pendência (casca 1.0.2, 15/11/2026)

Antes era só uma mensagem e a troca ficava bloqueada; um módulo parado conectando (por exemplo, esperando confirmação depois de escolher a pasta errada) prendia a pessoa na pasta. Agora a casca abre a janela "Há alterações pendentes nesta pasta", que diz o que está pendente e onde: cada módulo aberto com o motivo (ainda abrindo, conectando à pasta, alteração não gravada ou formulário aberto, não respondeu) e o que está guardado no navegador por módulo (`queueDetail`, em `modulo/core/scopes`; `pendingDetail`, em `modulo/core/runtime`). Falha ao consultar a fila aparece na janela e conta como pendência.

"Voltar e conferir" mantém a pasta. "Trocar mesmo assim" troca: o que está guardado no navegador continua no escopo desta pasta e volta quando ela for conectada de novo; só um formulário aberto e não salvo se perde. Testes: `testes/plataforma/scopes.test.mjs` e `testes/plataforma/integracao.cjs`.


## Pessoa pelo ID, registro do backup e cenário da demonstração (16/11/2026)

Versões desta entrega: casca 1.1.1, Portal 1.9.41, Produção 2.4.79, Waste 1.12.10, Gel 2.37, Paradas 1.2.13, Equipamentos 1.0.18, Iniciativas 1.1.14, Linha 360° 1.1.5 e Projetos 0.1.14.

- **Pessoa = ID** (`vacPessoa`, em comum/bases). `id(nome, idGuardado)`, `nome(id, nomeGuardado)` (nome atual do cadastro), `mesma(aId, aNome, bId, bNome)` (verdadeiro apenas com dois IDs iguais e inequívocos), `eu()` (sessão), `deTexto(t)` (ID ou nome digitado → `{id, nome}`; fora do cadastro fica só o nome; nome repetido no cadastro fica sem ID). Registros antigos com nome único resolvem o ID na leitura, sem migração em lote; nome ambíguo ou não cadastrado nunca decide a comparação. `opcoes()` fornece IDs como valores e nomes como rótulos. Campos opcionais existentes: Iniciativas `responsavelId`, `apoiosIds`, `criadaPorId` e eventos `deId`/`paraId`; Equipamentos `responsavelId`, `criadaPorId`; Produção `ps.responsibleId`, `day.responsibleId` e `auditLog[].userId`. Os exports publicam nome atual e ID. Portal › Sem responsável inclui registros com vínculo a confirmar, preservando nome e origem; Minhas/Minha equipe só reconhecem pessoa pelo ID resolvido.
- **Registro do backup** (`vacBackupRegistro`, em comum/bases): cada módulo aguarda o registro do resultado diário (ok/falha, erro, pessoa/ID e versão). Cada perfil do navegador escreve `00. Backups/<módulo>/registro-backup-<id>.log`, com até 50 linhas; `id` identifica o perfil na pasta, não o equipamento físico. Uma fila e Web Locks serializam abas do mesmo perfil. Sem suporte/permissão a Web Locks, o nome inclui ID de instância para separar escritores. `registrar()` devolve `registroArquivo`, `estacao` e `soLocal`; erro ao escrever o log mantém o resultado no cache local e `erroRegistro`. A extensão .log não conta como backup e nenhuma base JSON muda de formato.
- `ler(pagina, dir)` é somente consulta: consolida logs por estação, o legado `registro-backup.log` e o último ok/falha do navegador, elimina cópias do mesmo evento e devolve `registros`, `ok`, `falha`, `aberta` e `erroLeitura`. Erro de leitura/linha inválida vira aviso, sem esconder outros logs. Falha com horário maior ou igual ao último ok permanece aberta: relógios empatados entre estações não provam recuperação. O Portal mostra aviso crítico e pendência urgente. Sem rede, o registro local não está disponível às outras estações e não é reenviado automaticamente; uma nova tentativa de backup gera outro evento. Produção mantém a regra existente de impedir gravação quando o próprio backup falha.
- **Cenário da demonstração**: `node scripts/cenario-demo.cjs --gravar` abre cada módulo em demonstração, aplica pelo código da página os dados fictícios que faltavam (caixas do MES pelo importador, lote confirmado no dia, desvio da KKBC dividido em estrutura/empregado/preço, lote no PCP do Gel, data de leitura da produção pelo Gel) e grava as bases e exports atuais com as datas de volta ao dia de referência.
- **Paradas 1.2.12**: na demonstração a 1ª tela era montada antes do kit carregar (vacLayout); agora espera o documento terminar.
- **Testes sem internet**: `testes/http-local.cjs` atende as bibliotecas pela CDN com os blocos `biblioteca/*` e reprova qualquer outro pedido à internet.


## Visão executiva 1.2.0 (16/11/2026)

A apresentação consulta os mesmos exports. `executiveView` em modulo/core/data seleciona período/turno e organiza listas para a tela; `productionView` e as regras dos motores permanecem iguais. Nenhum campo foi acrescentado às bases ou aos exports. O hash dos motores é o mesmo da entrega anterior.

Produção por turno vem de porDiaTurno; por dia vem de porDia. OEE só aparece com a taxa já publicada para o recorte, sem média de percentuais. Quantidade consolidada de QN é lida de sqdcp.porDia; entre vários dias não se inventa contagem consolidada. Paradas só recebem total com eventosCobertura compatível e minutos válidos; somar registros não elimina simultaneidade nem determina a perda de OEE. A fila mostra posição atual e atraso publicado; não é filtrada silenciosamente pela data de produção.

Atalhos e impressão continuam usando as rotas e permissões existentes. O painel não abre uma base operacional para recalcular indicadores, nem grava dados para produzir o novo layout. A tipografia é injetada pelo css/brand, também nos documentos dos módulos, com regras de tela separadas da impressão.

## Navegação 1.3.0 (16/11/2026): telas do Portal como abas da casca

- `SHELL_TABS` (modulo/App): páginas da casca com abas. Uma aba com 3º campo mostra o quadro do Portal (motor da Administração) naquela aba, com o cabeçalho e as abas da página da casca: Visão da linha (`resultado`, `situacao`→geral, `pendencias`→fila, `reuniao`→reuniao), Relatórios (`resumo`, `todos`→rel), Importações (`central`, `por-pagina`→imp).
- Administração (`#/portal`) mostra só as abas do Portal que não mudaram de lugar (hoje, `cad`); sem barra quando sobra uma aba.
- Rotas antigas do Portal (`#/portal?tab=fila`, `#/portal?rota=#fila`, `#reuniao=…`, `#importacao/<sec>`, `#rel`, `#geral`) são normalizadas para a página nova (`normalizeRoute`), e o endereço é reescrito. Links dos módulos para o Portal (`vacPortalHref`) continuam valendo.
- `vacPagina.info().aba` (opcional): a tela aberta no módulo (`App.tab`). A casca acompanha quando o Portal troca de aba sozinho (ex.: "Ver todas" vai para Pendências); o estado é publicado a cada 1,8 s e logo depois de um clique.
- Nenhum dado, cálculo, permissão ou gravação mudou: o Portal é o mesmo motor, só mostrado em outro lugar.

## Identidade e consulta de Status — 1.4.0 (16/11/2026)

Extensão autorizada de R02-B, mantendo schemaVersion 1: Paradas acrescenta `tecnicoId` e `porId` na parte técnica e publica técnico/nome atual e ID nos eventos; Waste guarda `userId`, `alteradoPorId`, `excluidoPorId` e o ID do autor de cada versão no histórico do comentário; Linha 360° guarda `pessoasIds[turno]` ao lado de `pessoas[turno]`, publica os dois e registra `porId` na conclusão do checklist. Campos são opcionais e aditivos. Não há migração em lote de bases reais. Texto livre e homônimos sem ID continuam sem associação automática. Editar outro campo preserva o ID escolhido mesmo com nomes iguais.

O Status usa `info()` para estado corrente e `diagnostico()` para consultar registros existentes do próprio módulo. Revisão/publicação das demais bases vêm dos resumos já lidos pela casca. Publicação não comprova importação completa; um log de sucesso não substitui verificar a cópia física. A operação não concede permissão, não calcula indicadores e não grava bases. A nomenclatura visual preserva IDs internos como portal e valores canônicos como paginaInicial=Portal.

## Usabilidade 1.5.0 (17/11/2026)

Plataforma 1.5.0, Produção 2.4.82, Administração 1.9.44.

- `vacLayout` (comum/interface): seções numeradas (`.vk-sec`, e `.vgl-sec` da Visão Geral da Produção) ganham seta própria e uma barra "Recolher tudo / Expandir tudo" (`[data-vk-todos]`); a página que já tem a dela (Gel, `[data-colall]`) usa a dela, e o kit recolhe as seções junto. O kit liga sozinho (observa a tela); estado por pessoa em `vac.grupos.<página>` (chave `sec:<nº>:<título>`). O corpo escondido usa `display:none !important` inline (vence regras de display das próprias páginas) e volta ao original. Na impressão tudo aparece.
- `vacPagina.guia()` abre o guia da aba aberta; o "?" da casca chama quando há módulo na tela.
- Casca: `normalizeRoute` leva `#/oee?tab=equip` para a página Equipamentos. Botões em destaque: `parametros.destaques` = linhas "Página · texto do botão · cor" (laranja, azul, verde, vermelho; laranja com texto azul-marinho pelo contraste); sem configuração, "Produção · Lançar meu turno · laranja"; "nenhum" desliga. Só muda a cor.
- Produção: `exports.atual.catalogoMes` = {mes, planejado, realizado, falta, previsaoFim} — o que falta do catálogo no Plano do mês ÷ ritmo da corrida atual (estimado; sem plano ou sem ritmo, sem previsão). O "Agora na linha" mostra.
- Backups: `parametros.backupDias` (inteiro ≥ 7) e `vacBackupRegistro.limpar(dir)`, chamado pelo registro depois de um backup que deu certo.

## Timeline Operacional — Produção 2.5.0, plataforma 1.7.0 (17/11/2026)

Aba Linha do tempo da Produção (`docs/timeline-operacional.md`). Só leitura de `day.events` e `db.server`; não altera OEE, metas, classificação de paradas, turnos nem exports. Bloco **aditivo** na base da Produção, autorizado pela especificação: `db.timeline = { tagMap[], tagEvents[], comments{}, imports[] }` (base sem o bloco continua válida; `Model.ensure` completa). Vigência do mapa de tags segue o contrato 2 (encerra e cria outra). Comentário, importação de tags e mapa passam por `Store.mutate` (releitura, backup, fila, auditoria). Testes: `testes/ttimeline.js` e `testes/plataforma/timeline.cjs`.

## EQ-ORD · ordem dos equipamentos, gel do formato e lista enxuta · Administração 1.9.51, plataforma 1.8.20 (19/11/2026)

Pedido do responsável (Administração › Cadastros › Equipamentos): reorganizar do primeiro ao último, sendo a Linha a posição 0, arrastando ou digitando a posição (a ocupada empurra as seguintes +1); no equipamento de gel que segue o formato, mostrar esses dados e o link para alterar; tirar da tabela Fabricante/modelo, Comp. e Docs e deixar a foto ao lado do Código MES.
- **Arrastar e soltar** pela alça ⠿ (ponteiro: mouse, toque e caneta; vale para o tablet): os equipamentos **ativos** da mesma linha de produção ficam 1, 2, 3… na ordem nova; a Linha (`tipo` linha ou código `LINHA`) fica 0, no topo e sem alça. Só com a lista mostrando a ordem real (Ativos, sem busca e sem ordenar por coluna). Pede confirmação com a lista do que muda.
- **Posição digitada na ficha**: se o número já é de outro equipamento ativo da mesma linha, ele e os seguintes em sequência andam +1 até o primeiro número livre (os demais não mudam). A posição 0 é recusada para quem não é a Linha. Pede confirmação.
- **Gravação**: uma operação de edição de `posicao` (antes → depois) por equipamento, numa mesma gravação da fila do cadastro: aparece na auditoria e passa pela reaplicação sobre a pasta (mudança concorrente vira conflito, não sobrescreve). Inativos não ocupam posição nem são renumerados. Nenhum campo novo.
- **Ordem da lista**: corrigida a ordenação que mandava a posição 0 para o fim (`+posicao||999`); vale também para a prévia da importação do MES.
- **Equipamento de gel** ("Embalagem própria · vazio = a do formato"): quadro com o formato vigente de Parâmetros › Gestão de Gel (saco da pesagem, folha da purga, sobra do barril e composição por tubo de 100 e 75), ou o padrão quando não há vigência, e "Alterar em Parâmetros › Gestão de Gel ↗" (fecha a ficha, perguntando se há alteração, e abre `#cadastros/parametros/gel`, já no bloco do gel).
- **Tabela**: sem Fabricante/modelo, Comp. e Docs (continuam na ficha); Foto em miniatura ao lado do Código MES (arquivo da pasta; sem pasta, "–"). No Excel a coluna Foto continua "sim"/vazio.
- Teste: `testes/plataforma/equip-ordem.cjs` (demonstração, dados fictícios).

## REL-01 · gel nos relatórios da Produção e "Enviar relatório" na janela do dia · Produção 2.6.15, plataforma 1.8.19 (18/11/2026)

Pedido do responsável: os relatórios da Produção não traziam o consumo nem o scrap de gel (o quadro "Gel · teórico × real" só aparecia na tela do Lançamento); e um botão na janela do dia para enviar o relatório do dia, de um turno, só do gel ou de scrap e perdas, ou levar à aba Relatórios. Decisões: gel como item padrão; Waste por ordem acumulado da competência; telas aprovadas.
- **Gel no relatório e no e-mail (só apresentação, nenhuma conta nova):** "Gel do dia · teórico × real" no Relatório do dia (prévia, PDF, Excel) e no e-mail do dia; "Gel · scrap pesado no turno" na Passagem de turno e no e-mail do turno. Os números são os do quadro da tela (`GelDia.calc`: teórico, scrap pesado Tubos/Barril/Purga, índice, ganho sobre a BOM; barris baixados lidos do exports da Gestão de Gel). Aparece só com catálogo de gel. Item novo "Gel" em "Itens do e-mail", ligado por padrão (quem já tinha a lista gravada recebe o item no fim). Linha do gel no resumo automático e no texto.
- **"Enviar relatório" (janela do dia, ao lado de "Hora a hora"):** pergunta Dia inteiro, Um turno (escolha do turno), Só o gel do dia ou Scrap e perdas; "Copiar para o Outlook" (o mesmo e-mail da aba Relatórios) ou "Abrir na aba Relatórios" (já no tipo, dia e turno). "Só o gel" abre o relatório da própria Gestão de Gel no dia (`#relgel`). "Scrap e perdas": scrap de tubos por turno (Produção), gel do dia e o **Waste (MUV) das ordens que rodaram no dia, por ordem e acumulado da competência** (o Waste não tem valor por dia; o e-mail diz isso). Ordens do dia pela ligação dia ↔ lote (a mesma dos `diasLote` do exports); Waste lido de `perdas-base.json › exports.porOrdem` (competência do mês do dia, ou a mais recente). Só leitura: nada é gravado.
- Teste: `testes/plataforma/enviar-relatorio.cjs` (demonstração, dados fictícios).

## GEL-07 · Gestão de Gel com os números da Produção e relatório completo · Produção 2.6.14, Gestão de Gel 2.42, plataforma 1.8.18 (18/11/2026)

Pedido do responsável: o OEE do Gel deve estar certo e toda a produção deve vir do que foi lançado na Produção; o relatório do Gel deve trazer ordem e lote; a Produção deve abrir o relatório do Gel e das perdas de gel; o relatório do Gel ganha as funções das demais páginas (Copiar para o Outlook etc.).
- **Produção como fonte (decisão do responsável: também os dias antes da data de corte, dentro dos 120 dias do exports):** tubos bons, catálogo e OEE do Gel vêm do `exports` da Produção (`porDiaTurno`: OEE = Σ boa ÷ Σ cap, sem média de taxas; meta ponderada pela capacidade). Sem dado da Produção o OEE fica "—" (ausência não vira zero). Nenhuma fórmula da Produção muda.
- **Proteção de dados (revisão do PR #108):** antes da data de corte, os números da Produção entram só como vista em memória: a base do Gel, o cache local, o backup e os exports continuam com o registro original do dia (scrap, ordens, turnos, responsável), e o scrap da tela vem sempre desse original, por mais que a leitura da Produção se repita. Salvar o dia no Gel grava um registro novo, como antes. A partir do corte, o dia é o da Produção (GEL-02/GEL-06). A meta do OEE é a da Produção nos mesmos dias e turno do OEE mostrado (relatório, registro, painel do dia); painéis sem período próprio usam os últimos 30 dias.
- **Relatório do Gel:** coluna "OP · lote" em Por dia e Pesagens (tela e PDF) e quadro "Ordens e lotes do período" (dias em que o lote rodou, mesma regra do GEL-06). Botões novos: Texto, Copiar para o Outlook (`vacEmail` comum, com comentário), Imprimir e Excel (abas Resumo, Por dia, Por turno, Pesagens, Ordens e lotes).
- **Link direto do Gel:** `#relgel&de=AAAA-MM-DD&ate=AAAA-MM-DD[&foco=perdas]` abre o relatório da própria Gestão de Gel (não uma cópia) no período; `perdas` = indicadores, Paretos por equipamento e motivo, tipo de descarte, equipamento × descarte/motivo e pesagens.
- **Produção:** "Relatório do Gel ↗" e "Perdas de gel ↗" no detalhe do turno com catálogo de gel (dia do turno) e na aba Relatórios (período do tipo escolhido: dia, semana, mês, intervalo).
- **Casca (modulo/core/runtime):** um link entre módulos já adaptado ao endereço da plataforma (`…#/módulo?rota=…`) é aberto pela casca; antes o quadro do módulo abria outra plataforma dentro dele (afetava também o "Editar na Produção ↗" do GEL-06).
- Teste: `testes/plataforma/gel-relatorio.cjs` (demonstração, dados fictícios).

## GEL-06 · scrap de gel lançado na Produção · Produção 2.6.13, Gestão de Gel 2.41, plataforma 1.8.17 (18/11/2026)

Pedido do responsável: o "Registrar scrap" da Gestão de Gel passa para a Produção; na Gestão de Gel fica só a consulta. Usa o que já existia (GEL-02/03/05): o registro do turno (`ps.gelScrap`, base da Produção) vai no `exports.porDiaTurno[].gel` e, a partir de "Gel lido da Produção a partir de" (Administração › Parâmetros › Gestão de Gel), a Gestão de Gel monta o dia com o exports. Nenhuma fórmula, campo ou estrutura de base muda.
- **Produção › Lançamento › detalhe do turno:** botão "Scrap gel" abaixo do "Editar scrap", com o resumo (Tubos · Barril · Purga kg, "sem scrap" ou "sem registro"). Aparece quando o turno produziu catálogo que usa gel; fica desabilitado, com o motivo, sem equipamento de gel na Administração › Equipamentos, antes da data de corte (o dia ainda é da Gestão de Gel) ou com o turno fechado. Mesma regra no "Lançar meu turno".
- **Link direto:** `#dia=AAAA-MM-DD&turno=CÓDIGO` abre o Lançamento do dia com o turno aberto.
- **Gestão de Gel (dias a partir do corte, só consulta):** "Lançado na Produção neste dia" com tubos bons por catálogo, OP e lote (exports.porOrdem); aviso quando o catálogo lançado na Produção não está no cadastro do Gel (antes os tubos sumiam do teórico sem aviso); em cada turno, as pesagens lançadas e "Editar na Produção ↗".
- Teste: `testes/plataforma/gel-producao.cjs` (equipamento de gel e data de corte simulados só na memória).

## KKBC-02 · competência da KKBC amarrada à Produção · Waste 1.12.17, plataforma 1.8.16 (18/11/2026)

A lista da KKBC_ORD copiada do SAP não traz data: antes, todas as ordens recebiam o "Mês de referência" da tela, e um mês errado levava a ordem para a competência errada sem aviso.
- **Regra (só leitura dos exports, nada recalculado, nenhum campo novo nas linhas):** para cada ordem, (1) MB51 (`ordens-base.json › exports.porOrdem.competencia`): o mês da tela vale se for uma das competências da ordem; se ela tem uma só e é outra, vale a do MB51 ("ajustada"); com várias e nenhuma igual, a mais recente, marcada "conferir"; (2) sem MB51, o mês da ordem no Plano do mês (`oee-vacutainer-base.json › exports.porOrdem.mes`), com a mesma regra; (3) sem os dois, o mês da tela.
- **Prévia:** coluna Competência por ordem (com a fonte), aviso "N ordem(ns) com a competência ajustada pela Produção (a tela dizia …)" e a opção "Usar o mês da tela para todas as ordens". O mês da tela só é obrigatório se alguma ordem não tiver MB51 nem plano.
- **Arquivo com a coluna de mês:** vale o mês do arquivo; a prévia só avisa quando ele não é uma das competências da ordem na Produção.
- Teste: `testes/plataforma/kkbc-competencia.cjs` (ordem e lista fictícias).

## TUR-04 · turno com horário diferente no sábado · Administração 1.9.50, Produção 2.6.12, plataforma 1.8.15 (18/11/2026)

Pedido do responsável: no sábado não há revezamento; o turno trabalha 1 h a menos (1º turno 06:00–13:30, 2º 13:30–21:00).
- **Cadastro (`vacutainer-cadastros.json › turnos[].vigencias[]`, sem campo novo):** um turno pode ter **mais de uma linha no mesmo período** (mesmo `de`), cada uma com os próprios `inicio`, `fim`, `dias`, pausas e intervalos. Regra: o mesmo dia da semana não pode estar em duas linhas que se sobrepõem no tempo (`vigErrosTurno`, por dia; antes a regra recusava qualquer sobreposição de datas).
- **Administração › Turnos:** a vigência nova ganha "+ Horário para outros dias" (linha nova com os dias que sobraram, ex.: Sáb). O dia já marcado numa linha fica desabilitado nas outras do mesmo período. "+ Nova vigência" copia todas as linhas do período anterior e encerra todas na véspera. Remover/desativar uma linha que tem irmã no período não mexe no período anterior. A vigência gravada continua imutável (regra 1.7).
- **Leitura comum `vacTurnosEm(data)`:** devolve a linha que tem o dia da semana da data (sem nenhuma, a vigência mais recente, como antes).
- **Produção:** a sincronização casa cada versão pelo início **e** pelos dias (`validFrom` + `weekdays`); o motor já escolhia a versão pelo dia da semana (`shiftVersionAt`). O dia novo de sábado nasce com a janela do sábado, os intervalos do sábado e a meta de cada hora pela fórmula de sempre (PPH × minutos × OEE meta): a meta diária oficial do sábado fica menor sozinha. Dias já lançados guardam o próprio turno (usar "Restaurar intervalos padrão" num sábado futuro já criado).
- Teste: `testes/plataforma/turno-sabado.cjs`.

## Abas agrupadas da Produção · Produção 2.6.11, plataforma 1.8.14 (18/11/2026)

Proposta A aprovada pelo responsável. As telas são as mesmas; só mudam de lugar (nenhum número, filtro, relatório ou export muda).
- **Barra da casca (11 abas):** Lançamento · Pendências · Visão Geral · Resultados · Paradas · Plano do mês · Ordens e lotes · Relatórios · SQDCP · Equipamentos · ⚙ Config.
- **Ordens e lotes** (`ordens`): Ordens produzidas · Ordens (plano do mês) · Conciliação · Histórico de competências · Lotes (MES) · Importar ↗. "Ordens (plano do mês)" e "Lotes (MES)" abrem dentro da aba (`Ord.sub = 'plano' | 'lotes'`, com as views `plan` e `lots` de sempre); antes "Ordens (plano do mês)" saía para o Plano do mês e a barra sumia.
- **Resultados** (`history`): Histórico (dia a dia) · Semanal · Mensal. **Paradas** (`stops`): Análise · Linha do tempo. A escolha fica em `App.prefs.grpSub` (por pessoa).
- A barra de escolha (`GrpAbas.barra`) fica separada no topo da página, fora do cartão de filtros, e sempre à vista.
- **Endereços antigos:** `weekly`, `monthly`, `timeline` e `lots` (go, `?tab=`, `#aba=`) abrem a aba do grupo já na tela certa (`GrpAbas.normalizar`). Guia, tabelas e a atualização automática da Linha do tempo usam a tela aberta (`GrpAbas.rota()`).
- **Casca:** a Produção publica a aba aberta (`App.tab`, lido por `vacPagina.info().aba`) e a casca acompanha o destaque quando a página troca de aba sozinha (só o destaque; não navega de novo).
- **Plano do mês:** a tela usa segunda a sábado quando o plano não tem `workdays` gravado, o mesmo padrão do cálculo (`Engine`); antes a tela quebrava na demonstração.
- Teste: `testes/plataforma/abas-agrupadas.cjs`.

## Ajustes da casca e do Lançamento · Produção 2.6.10, plataforma 1.8.13 (18/11/2026)

- **Sem "Imprimir módulo"** na barra de comandos da casca (pedido do responsável: a impressão certa fica em Relatórios). Ctrl+P continua imprimindo a página ativa.
- **Abas da Produção na casca:** `vacPagina.abas()` passa a publicar as abas visíveis (`visibleRoutes`), não a lista completa de rotas. Saem Painel (= Visão Geral, já escondido na página desde 2.6.3) e Hora a hora (agora no Lançamento); as abas escondidas pela pessoa também deixam de aparecer. Os endereços antigos continuam abrindo.
- **Lançamento:** nenhum turno aberto por padrão; clicar abre o detalhe, clicar de novo fecha, clicar em outro troca. A escolha vale enquanto a página está aberta (`TurnoResumo.sel`, não é mais gravada nas preferências).

## LANC-02 · Lançamento unificado · Produção 2.6.9, plataforma 1.8.12 (18/11/2026)

Layout aprovado pelo responsável: as abas Lançamento e Hora a hora viram uma só (LANÇAMENTO). Nenhum número, fórmula, turno ou export muda; as telas usam o mesmo cálculo (`Engine.computeDay`).
- **Turnos lado a lado:** os cartões de resumo de todos os turnos do dia ficam numa linha, inclusive o turno não produtivo do cadastro (ex.: 3º turno), mesmo sem produção. Clicar abre o detalhe; clicar de novo fecha; outro troca (`App.prefs.lcTurno`, por pessoa).
- **Detalhe do turno:** faixa com catálogo, responsável, produção dentro do turno × meta, tempo planejado, scrap (Editar), paradas, OEE reportado, OEE real e D · P · Q. Embaixo, 1/3 "Uma vez por turno" (Segurança, Qualidade, ABONO/REVEZAMENTO com "Turno sem produção", Observações do turno) e 2/3 o hora a hora do turno (`hhLinhas`/`hhLigar`, as mesmas linhas e o mesmo comportamento da grade do dia: "Produção total do turno" no topo, todas as colunas, "ligado"; lançado pelo total, as horas ficam em cinza e as paradas continuam lançáveis). O gráfico "Atendimento hora a hora" fica embaixo, recolhível (`App.prefs.lcGraf`).
- **3º turno (não produtivo):** o detalhe junta "Habilitar 3º turno neste dia" (TUR-02, sem mudança) e a produção fora do turno, agora só da janela do dia escolhido (antes juntava os trechos dos dias vizinhos). Trechos de outro dia que contam neste dia aparecem numa linha de texto.
- **Faixa de indicadores:** um card "Produção · <turno>" por turno (r.good e r.metaOp do turno, editável em Editar cards). "Produção registrada no servidor" fica ao lado de "Lotes do dia".
- **Hora a hora:** sai da navegação. O endereço continua (links antigos e "Ver o dia inteiro (24 h)" na barra do dia, que abre a visão Dia (24 h)).
- **Responsável sugerido:** com o campo vazio, mostra o responsável mais frequente do mesmo turno (código) nos últimos 10 lançamentos, empate para o mais recente. Só grava quando a pessoa confirma ou altera.
- **Segurança e qualidade:** Segurança em verde (#16803C, escudo) e Qualidade em azul (#1769D2, selo), as cores do SQDCP. Os campos só aparecem com "Sim". Campo opcional novo `sqdcp.qn.problema` (texto até 120, autorizado pelo responsável), escolhido na lista `settings.qnProblemas` (Configurações › Problemas de QN, um por linha); o campo "Resumo operacional" passa a se chamar Observação (mesmo campo `resumo`). Ao salvar, o formulário mostra "✓ Salvo · último registro: quem · quando".
- Teste: `testes/plataforma/lancamento-unificado.cjs` (3º turno não produtivo e dias anteriores fictícios só na memória da página).

## Semáforo sem amarelo e Parâmetros por cartão · plataforma 1.8.10, Administração 1.9.49, Produção 2.6.8 (18/11/2026)

- **Novo parâmetro opcional `parametros.semaforoAmarelo`** (autorizado pelo responsável): `false` = só verde e vermelho; sem o campo, como antes (com amarelo). A regra comum `vacSemaforo` (igual nas nove páginas) usa o verde como início do amarelo quando ele está desligado; a Produção recebe `semaphore.yellow = green` pelo CadSync e esconde "atenção" nas legendas; a Visão da linha esconde "Atenção" na legenda. Metas de OEE com semáforo próprio continuam com as faixas delas.
- **Administração › Parâmetros:** cada cartão (Parâmetros gerais, Semáforo, Produção e Gel) tem o próprio Salvar no topo, e a mensagem aparece logo abaixo dele. O Semáforo ganha "Usar amarelo (atenção)" e a prévia das faixas ao vivo. Com amarelo, ele continua precisando começar abaixo do verde.
- **Avisos flutuantes (toast) dentro da plataforma:** o quadro de cada página tem a altura do conteúdo, e o aviso "fixo embaixo" ficava no fim da rolagem. O runtime da casca reposiciona os avisos fixos ancorados embaixo para a parte visível da tela, acompanhando a rolagem. O texto e a duração não mudam.
- Teste: `testes/plataforma/parametros-semaforo.cjs`.

## Tela de entrada · plataforma 1.8.9 (18/11/2026)

Pedido do responsável: ao abrir, a plataforma só aparece depois do login ou da escolha "Entrar só para consulta".
- **Casca (`modulo/App`):** tela de entrada em três passos: abrindo; sem pasta (Conectar ou Reconectar a pasta da linha); login. Fundo `Marca/login.png` ou `login.svg` desfocado, ou o azul da marca. Botões "Entrar só para consulta" e "Ver a demonstração". Ao entrar, a plataforma abre na página que estava no endereço.
- **O login continua sendo do `vacLogin`** (contrato: a casca não cria sessão). No passo login, a casca abre a Administração atrás da tela e chama `vacAutenticacao.porta(true)` (comum/interface): a Administração mostra só a janela de login, centrada e com o fundo transparente, sobre a tela de entrada. Primeiro acesso, troca de senha, bloqueio por erros e sessão até o fim do turno não mudam.
- **Consulta:** `sessionStorage vac.platform.consulta = 1`, só nesta aba do navegador. `vacAppHost.consulta` informa as páginas, e `vacLogin.dispensado()` não abre a janela de login nelas. Sem sessão, nada é gravado (`vacPodeAqui`), como antes. O login pode ser feito depois, pelo botão da pessoa no alto.
- **Fora da tela:** demonstração e testes automáticos (mesma regra do `vacLogin`: `navigator.webdriver`, salvo `vac.login.forcar = 1`).
- **Revisão do PR #103 (plataforma 1.8.11):** pasta lida sem cadastro válido mostra "Cadastro não encontrado", com "Escolher outra pasta" e "Entrar só para consulta", em vez de ficar em "abrindo". No modo consulta, `vacLogin` só deixa de abrir a janela automática; o login pedido pela pessoa (`vacAutenticacao.abrir` e `vacPagina.autenticar`, com `pedido: true`) continua aberto.
- Teste: `testes/plataforma/entrada.cjs` (pasta e pessoa fictícias; login com ID e senha, consulta, demonstração).

## IMP-01 · conferência das importações por período · Administração 1.9.47, plataforma 1.8.7 (17/11/2026)

- **Exports (campos opcionais, autorizados pelo responsável em 17/11/2026):** cada item de `exports.importacoes` ganha `lidas`, `gravadas`, `duplicadas` e `rejeitadas` (número ou `null` quando o importador não guarda). Só o que já estava gravado na base de cada página; nada é recalculado. Produção 2.6.5 (MES: linhas encontradas, caixas, linhas ignoradas; planilhas: encontradas, novas + atualizadas, repetidas de paradas, inválidas), Paradas 1.2.16 (novas + atualizadas, erros), Gel 2.40 (linhas do relatório), Waste 1.12.16 (importadas, rejeitadas). `exportsVersion` não muda: leitores antigos ignoram os campos.
- **Frequência e prazo por fonte** (Importações › Importação por página › "Frequência e prazo de cada importação"): `portal-base.json › config.importacao = { <fonte>: { freq: 'diaria'|'semanal'|'mensal'|'nao', prazo } }`; sem configuração, o padrão: MES, Forms e LPs diárias com prazo 1; MB51 e COOIS semanais com prazo 1; KKBC_ORD mensal com prazo 10 dias após o fim do mês; plano do PCP mensal até o dia 5. Fonte mensal só aceita mensal ou não obrigatória. Gravação pela fila da Administração, com a edição liberada.
- **Conferência por período** (`impGrade`): Ontem, Últimos 7 dias, Mês atual ou Personalizado (até 62 dias). Grade fonte × dia operacional (06:00–06:00) para as diárias e semanais e competência para as mensais. Estados: coberto, parcial/desatualizado, falta (prazo vencido), no prazo, não obrigatória e sem leitura (página não lida; nunca vira zero nem completo). Resumo de dias completos, parciais e com falta; clique no dia mostra as importações e as contagens. O resumo do dia e a tabela da sequência passam a seguir a frequência configurada.
- **Revisão do PR #101 (Produção 2.6.6, Administração 1.9.48, plataforma 1.8.8):** a Produção publica `planosMeses` (meses com plano do PCP gravado); o plano conta pela competência gravada, não pela data da importação. As contagens do período somam só as importações que cobrem os dias (ou as competências) do período, as mesmas do detalhe do dia.
- Teste: `testes/plataforma/importacoes-periodo.cjs`; `testes/timportacao.js` lê a sequência por `#impSeq`. Cenário da demonstração regravado com os exports novos.

## Piloto incorporado à Visão da linha · Linha 360° 1.3.0, plataforma 1.8.6 (17/11/2026)

O Piloto de consulta (1.2.0) foi retirado a pedido do responsável, por repetir a Visão da linha. A ficha do ponto da Visão da linha (`fichaPonto`) recebeu o que só o piloto tinha: checklists previstos agora (`#fCk`), pessoas do posto por turno (`#fPes`), fontes de cada número (`fontesHtml`, `#fFontes`; página não lida = "sem dados") e a etiqueta do recorte de cada bloco (`secRc`: no período · agora · cadastro). Só leitura, como antes: nada novo é gravado e nenhum número muda. `ir()` leva aba desconhecida (ex.: o link antigo `#/linha?tab=piloto`) para a Visão da linha. Teste: `testes/plataforma/linha-ficha.cjs` (substitui `linha-piloto.cjs`).

## Equipamentos do MES e conexão da Administração · Administração 1.9.46, plataforma 1.8.5 (17/11/2026)

- **Campos novos, opcionais, no cadastro de equipamentos** (autorizados pelo responsável em 17/11/2026): `codigoMes` (Resource Name do MES; prefixo das TAGs; não repete), `departamento`, `centroTrabalho` (Work Center). Equipamento antigo sem eles continua válido. O código EQ continua o identificador.
- **Importar › Equipamentos (MES)** (`EqMes`, `cadImportarEqMes`): cola Resource Name · Description · Department · Work Center · Resource Type. Liga por Código MES, outro nome ou nome igual; "1 - Collection" é o registro LINHA. Parecido pelo nome só vira sugestão ("confira"); empate ou pouco parecido fica para escolher. Description substitui o nome (desmarcável por linha) e o nome anterior vai para Outros nomes (de-para da Paradas). "+ Novo equipamento" recebe o próximo EQ. Nada é apagado; tudo pela fila do cadastro (backup e auditoria, origem "planilha do MES").
- **Editar visível**: botão Editar/Ver em cada linha das listas de cadastro; edição bloqueada mostra o motivo (mesma regra de `Cad.podeEditar`, via `Cad.motivoEdicao`) com "Desbloquear edição" ou "Conectar agora".
- **ADM-01**: a conexão da Administração que falha guarda o motivo (`Store.motivo`: permissão, leitura ou falta de `00. Bases/portal-base.json`) e `vacPagina.conectar` avisa a casca, que mostra "Tentar conexão novamente". O aviso "Sem a pasta da rede" traz o motivo e "Conectar agora". O pedido para criar `portal-base.json` explica que, com backup, restaurar é melhor.
- Teste: `testes/plataforma/equipamentos-mes.cjs`.

## Semáforo só pelas faixas configuradas · Produção 2.6.4, Waste 1.12.15, plataforma 1.8.4 (17/11/2026)

Revisão do PR #98: a cor passa a sair só das faixas do semáforo (Administração › Parâmetros, copiadas para a Produção). Antes, "atingiu a meta" virava verde mesmo com o verde configurado acima de 100% (ex.: verde 110%, 105% da meta saía verde no gráfico e amarelo no cartão). Vale para `Charts.combo` (maior e menor é melhor), OEE do período, OEE do dia, resumo e cartão do turno, `BarChart` da Visão da linha e MUV do Waste (estado e tendência). Meta zero ou negativa: atingiu ou não. Com verde em 100% (padrão) nada muda. Teste: `testes/plataforma/semaforo.cjs`.

## Lançamento mais enxuto · Produção 2.6.3, plataforma 1.8.3 (17/11/2026)

- **Scrap (total)** no topo do Lançamento (`ScrapDia`): `r.scrap` e `r.scrapPct` do cálculo (soma dos turnos ou total diário, mesmo % do card Qualidade). Sem meta de scrap na Produção: card neutro. Nada lançado: "—" (contrato 1); lançamento parcial diz qual turno falta. Entra no Editar cards.
- **OEE do dia** (gráfico por hora) passa a constar no Editar cards (`KC.filtrar(html, extras)`, chave `KC.OEE_DIA`) e pode ser desligado; barras pelo semáforo contra a meta de OEE do dia.
- **Turnos em resumo** (`TurnoResumo`): resumo de cada turno lado a lado (produção × meta, OEE, paradas, scrap, hora a hora); o clicado abre o cartão completo embaixo, clicar no aberto recolhe. Escolha lembrada por dia neste computador (`App.prefs.lcTurno = {date, id}`); sem escolha, abre o turno em lançamento agora ou o primeiro não fechado. Todos os cartões continuam na página (o fechado fica escondido, `section.tl.tr-oculto`); "cartão ↓" abre o turno; impressão abre tudo. Turno não produtivo com caixas segue no cartão próprio abaixo.
- **Cartão do turno** com semáforo de três cores na barra, no % e nas metas de produção e de OEE (lacuna da 1.8.2).
- **Aba Painel** sai da barra: desde a 2.4.31 ela abre a Visão Geral (mesma tela). `#aba=panel` e `go('panel')` continuam abrindo a Visão Geral; visões do Painel seguem dentro dela.
- Só apresentação: números, fórmulas, metas, filtros e bases iguais. Teste: `testes/plataforma/lancamento-183.cjs`.

## Semáforo de três cores · plataforma 1.8.2, Produção 2.6.2, Waste 1.12.14 (17/11/2026)

Indicador com meta segue o semáforo configurado (Produção: `settings.semaphore`, padrão verde ≥ 100 %, atenção ≥ 90 %; demais: `parametros.semaforoVerdePct/semaforoAmareloPct` via `vacSemaforo`): verde na meta, amarelo (atenção) perto dela, vermelho abaixo. Antes, gráficos e alguns cartões eram só verde/vermelho.

- Produção: barras do `Charts.combo` com meta (`metaSem`, também "menor é melhor"), legenda e dica com "atenção"; número dos cartões em amarelo na atenção (`belowCls`); OEE do período (`vgl-oee`); legenda do e-mail.
- Visão da linha: cartões OEE publicado e Produção boa (`semTone`) e gráfico por turno (`BarChart`, prop `semaforo`).
- Waste: estado do MUV e gráfico de tendência com `vacSemaforo(..., {inverso:true})`.
- Só cor: números, metas, fórmulas, filtros e períodos iguais. Fora, por decisão: SQDCP (verde/vermelho por contrato 6), Gel (regra própria dosagem × BOM) e medidores D/P/Q. Teste: `testes/plataforma/semaforo.cjs`.
- Hora a hora: o bloco Produção total do turno passa a quebrar linha (`.tt-box{white-space:normal}`); antes, a tabela sem quebra deixava o campo sobre o título em 1440 px.

## Ajustes de lançamento · Produção 2.6.1, plataforma 1.8.1 (17/11/2026)

- Gráficos hora a hora (`hhChartOpts`, ritmo por hora e gráfico do e-mail do turno): o período de um turno lançado pelo total leva no eixo o código do turno (`snap.code`, ex.: 2T), não a hora de início; com troca de catálogo, `2T 1/2`, `2T 2/2` (`rotuloIv`).
- Janelas da Produção: `.overlay .kv .v` e `.modal .kv .v` voltam a 15 px (a regra de KPI de `css/brand` deixava a categoria da parada com 28 px).
- E-mail (`vacEmail.pecas.cabecalho`, comum/interface): cabeçalho claro com texto azul-marinho; ver `docs/DESIGN_SYSTEM.md` §19.

## Produção total do turno · Produção 2.6.0, plataforma 1.8.0 (17/11/2026)

Para o turno sem hora a hora (sem foto do quadro, servidor fora do ar), o bloco **Produção total do turno** aparece no "Lançar meu turno" e no Hora a hora. Preencher o total bloqueia as horas; lançar uma hora bloqueia o total; apagar o total volta ao hora a hora. Com troca de catálogo, o turno é dividido em **períodos** (hora da troca, catálogo e produção de cada um, com a média por hora).

- **Base (campo novo, opcional, autorizado pelo responsável):** `productionDays[].shifts[].lancamento = { modo: 'total', em, por }`. Sem o campo, o turno é hora a hora, como antes; dias antigos não mudam. Os intervalos do turno viram os períodos (`kind: 'total'`); o catálogo do 1º período é o `initialCatalogId` do turno. `schemaVersion` continua 1.
- **Ações:** `Actions.lancarTotal(dayId, psId, periodos)` e `Actions.voltarHoraAHora(dayId, psId, descartar)`, com auditoria (`field: 'produção total do turno'`). Os períodos precisam cobrir o turno inteiro, sem buraco; da 2ª em diante, com catálogo. Paradas com horário não mudam; paradas só com o tempo vão para o período (ou, na volta, para a hora) que contém a hora em que estavam. Turno ou dia fechado não muda. No modo total, `setIv` (produção e catálogo), `setGoods` (colar), dividir, excluir e mudar horário de intervalo recusam com a mensagem do bloco.
- **Números:** mesmo cálculo de sempre. Produção, capacidade, meta oficial, D, P, Q e OEE iguais aos do turno lançado hora a hora; a meta operacional é arredondada por período e pode ficar um pouco abaixo da soma hora a hora (decisão do responsável). Exports não mudam de chave.
- **Servidor (MES):** sugestões de produção e catálogo não entram num turno lançado pelo total. O Hora a hora e a revisão avisam "existem dados apontados de produção" e oferecem **Trocar o total pelo hora a hora do servidor**: o turno volta às horas e a revisão reabre com as sugestões marcadas para aceitar. `Srv.applyDay` recusa produção em turno pelo total. A prévia da importação lista os dias do arquivo que já têm produção apontada (por hora, pelo total ou resumo), marcando dia ou turno fechado.
- **Teste:** `testes/plataforma/total-turno.cjs` (demonstração). Versão de referência da Produção em `ferramenta/verificar`: 2.6.0. O cenário da demonstração (`dados/cenario`) não foi regenerado: os exports de Produção, Waste e Linha 360° já estavam em versões anteriores e as chaves não mudaram.

## Escala de espaçamento nos demais módulos · plataforma 1.7.5 (17/11/2026)

Mesma regra da Produção nos blocos `<style>` de Administração (237 valores), Waste (153), Gel (370), Paradas (149), Equipamentos (44), Iniciativas (35) e Linha 360° (68). Mantidos: CSS montado no JavaScript, blocos `@media print` e `@page`, e as regras de relatório impresso (`.rep`, `.printarea`). Projetos não tem bloco `<style>`. Fora do `<style>` cada bloco é idêntico; versões dos motores não mudam. Verificado com 212 capturas antes e depois (todas as abas, 1440 e 1024 px, claro e escuro), sem erro nem rolagem lateral.

Testes ajustados nesta etapa: `testes/tsqdcp_layout.js` volta a rodar (navegador da plataforma) e entra em `npm run test:plataforma`; `testes/ttimeline.js` (CA-13) centraliza o gráfico antes de passar o mouse, porque com a página mais compacta o ponto caía sob um aviso no rodapé da janela.

## Escala de espaçamento na Produção · plataforma 1.7.4 (17/11/2026)

`motor/oee`: 340 valores de padding, margin e gap dos blocos `<style>` convertidos para `var(--sp-N,Npx)`. Ficaram como estavam: o CSS montado no JavaScript (vai para relatórios e Outlook, que não leem `var()`), as 95 regras do SQDCP (A4 paisagem) e os 6 blocos `@media print`. Fora do `<style>` o bloco é idêntico. Versão do motor não muda. Verificado: capturas das 17 abas (1440 e 1024 px, claro e escuro) e o teste de layout do SQDCP rodado com o navegador da plataforma (`testes/tsqdcp_layout.js` ainda abre as páginas antigas e não roda sozinho).

## Escala de espaçamento · plataforma 1.7.3 (17/11/2026)

Tokens `--sp-4` … `--sp-32` em `css/brand` (regras em `docs/DESIGN_SYSTEM.md`, seção 11). `css/kit` e `css/style` passaram a usá-los em padding, margin e gap: 438 valores avulsos convertidos para o passo mais próximo; 32 mantidos (0, 1–3 px, acima de 32 px ou com calc). Só apresentação: nenhum ID, evento, cálculo, filtro ou dado muda. `modulo/App` volta a mostrar a versão da plataforma (`VERSION`, que tinha ficado em 1.7.0 nas entregas 1.7.1 e 1.7.2). Módulos (`motor/*`) ainda com os valores antigos; entram em etapas.

## Favicon e ícones · plataforma 1.7.2 (17/11/2026)

- Favicon: `aplicarFavicon` (modulo/design/marca), chamado em `modulo/main`, testa `Marca/favicon.svg` (nome definido pelo responsável) e só então insere `<link id="vacFavicon" rel="icon">`; sem o arquivo, nada é inserido. A marca continua fora do HTML (`docs/MARCA.md`). Teste: `testes/plataforma/favicon.cjs`.
- Ícones: os ⚠ visíveis viraram `vacIcone('alerta','sm')` (Lucide, a biblioteca do kit): prévia de quantidade da Produção (`bindQtyPreview`, mesmo texto e mesmas regras), marcador "srv" do hora a hora e auditoria do Gel. Sem `vacIcone`, volta o ⚠. Mantidos de propósito: 🔒/🔓 do Portal (decisão do responsável); o ⌕ do botão Buscar e o ⚠ do selo de versão dos módulos, que ficam ocultos dentro da plataforma (a casca tem cabeçalho e busca próprios). Versões dos motores não mudaram.

## Permissões da Linha 360° · plataforma 1.7.1 (17/11/2026)

`VAC_PODE_MAPA.linha` (comum/interface) passa a listar os botões da própria Linha 360°; antes apontava para os de Equipamentos, que não existem na página, e nada ficava desligado na tela (a gravação já era barrada pela casca). A permissão continua sendo a do módulo `equip` (`VAC_PODE_MOD`); nenhum perfil ou ação nova no Portal. Opção A do responsável: **lançar** = marcar e desfazer checklist e salvar o posto; **configurar** = editar posições, desenhar e salvar áreas, salvar pontos e equipamentos, cadastrar, editar e desativar checklist. Sem sessão na plataforma, tudo desligado. Teste: `testes/tpermissoes.js` (telas Checklists, Pessoas e postos, Configuração e Piloto).

## Linha 360° 1.2.0 · Piloto de consulta (17/11/2026)

Aba `piloto` do módulo Linha 360° (`docs/linha-360-piloto.md`), aberta só por link (`#/linha?tab=piloto`; no módulo, `#aba=piloto`). Fica fora de `ABAS`: não entra na barra da página, nas abas da casca nem em `vacPagina.abas()`. Somente leitura: usa `numeros()`, `eventos()`, `chkFeito`, `pesNome` e os exports já lidos; não chama `Store.commit`, `save`, `reload` nem `lerExt`, e tem ponto e filtros próprios (as abas atuais não perdem os seus). Não muda base, `schemaVersion`, exports, permissões nem números. Teste: `testes/plataforma/linha-piloto.cjs`. A versão 1.1.5 citada acima é histórica; a anterior a esta entrega era 1.1.7.

## Rolagem, gráficos e pasta 1.6.0 (17/11/2026)

Plataforma 1.6.0, Waste 1.12.13, Administração 1.9.45. Nenhum número, filtro, cálculo ou base mudou.

- Tela pulando para o topo: a faixa de abas da casca (`ModuleTabs`) usava `scrollIntoView` na aba ativa a cada mudança de tamanho, o que rolava a página inteira até as abas; agora só a faixa rola, na horizontal. O quadro do módulo (`host.resize`) só encolhe depois de 700 ms com o conteúdo menor (redesenho, sincronização) e, ao fechar janela/login, devolve a tela à posição de antes. Importações do Portal rola até a seção do link uma vez, não a cada redesenho.
- `vacGrade` (comum/interface): arrastar pelo ⠿ também entre grupos (`prefs.__mov[cartão] = grupo`; a página redesenhando a grade de origem não duplica o cartão), com rolagem automática perto da borda; gráfico sempre cabe no cartão (sem a largura mínima que gerava rolagem lateral); `data-vg-larg` define a largura padrão; pílula Exibição (`<span data-vg-exibir="área">`, `prefs.__oculto`), por computador.
- Waste: Pareto por componente e por catálogo viram cartões do grupo B (metade cada, por padrão); Exibição em 04 Análises; Comparativos mostra só as ordens do grupo escolhido (a lista de todas as ordens fica em Visão geral › 05).
- Pasta: o handle já ficava salvo; ao reabrir, o Chrome pede permissão de novo. O botão vira "Reconectar pasta" e pede a permissão da pasta lembrada (`requestPermission`), sem abrir o seletor. "Permitir em todas as visitas", quando o Chrome oferece, evita o pedido nas próximas vezes.

## Paradas 1.2.17 e Produção 2.6.7

- **Importação Forms.** Cada lote novo guarda as versões anteriores dos eventos atualizados na própria base de Paradas. O desfazer restaura essas versões, remove inclusões do lote e preserva edições posteriores. Lotes antigos com atualizações e sem versões anteriores ficam disponíveis para consulta. O backup é a fonte para recuperar essas versões antigas. O histórico técnico continua pelo ID do evento.
- **Validação diária.** Os filtros localizam dias, e a revisão inclui todos os eventos de cada dia. A validação guarda uma assinatura dos dados conferidos. Mudanças de duração, classificação, quantidade ou composição do dia exigem nova revisão, inclusive nos exports. Validações antigas sem assinatura aparecem como revisão necessária quando há eventos no dia.
- **Programação e indicadores.** A Produção publica `exports.tempoProgramadoTurnos` para os últimos 120 dias, com `dia`, `turno`, `minutosProgramados`, `semProducao` e `fechado`. O campo é aditivo e deriva de `netMin` da Produção. Paradas usa o turno do filtro e explicita a cobertura. Horários estimados vêm da vigência da data. Paradas não programadas mantêm o turno no tempo planejado. O MTTR histórico continua sendo minutos de parada por registro de quebra. Espera e reparo têm médias próprias sobre os registros preenchidos, com contagem de cobertura.
- **Paradas e planos de ação.** Recorrência aplica o mesmo recorte na tela e no relatório e conta as ocorrências agrupadas. Casos com ação do Planner vinculada à recorrência ou a um de seus eventos continuam visíveis sem novas falhas. A comparação mostra ocorrências por 100 horas estimadas de operação nos 30 dias de cada lado da conclusão, excluindo o dia da conclusão. Ela requer turnos de Produção fechados e dias planejados dentro de períodos de importação do Forms sem rejeições. A decisão de eficácia continua registrada em Iniciativas.
- **Conciliação e Pareto.** O Forms continua sendo a fonte de eventos de Paradas. O melhor vínculo Forms × Produção é escolhido por início, duração e código, e empates, concorrência pelo mesmo evento e registros agrupados com candidatos aparecem para conferência. O Pareto calcula o acumulado sobre todos os itens da dimensão antes de limitar as barras exibidas.
