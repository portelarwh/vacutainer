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

## Rolagem, gráficos e pasta 1.6.0 (17/11/2026)

Plataforma 1.6.0, Waste 1.12.13, Administração 1.9.45. Nenhum número, filtro, cálculo ou base mudou.

- Tela pulando para o topo: a faixa de abas da casca (`ModuleTabs`) usava `scrollIntoView` na aba ativa a cada mudança de tamanho, o que rolava a página inteira até as abas; agora só a faixa rola, na horizontal. O quadro do módulo (`host.resize`) só encolhe depois de 700 ms com o conteúdo menor (redesenho, sincronização) e, ao fechar janela/login, devolve a tela à posição de antes. Importações do Portal rola até a seção do link uma vez, não a cada redesenho.
- `vacGrade` (comum/interface): arrastar pelo ⠿ também entre grupos (`prefs.__mov[cartão] = grupo`; a página redesenhando a grade de origem não duplica o cartão), com rolagem automática perto da borda; gráfico sempre cabe no cartão (sem a largura mínima que gerava rolagem lateral); `data-vg-larg` define a largura padrão; pílula Exibição (`<span data-vg-exibir="área">`, `prefs.__oculto`), por computador.
- Waste: Pareto por componente e por catálogo viram cartões do grupo B (metade cada, por padrão); Exibição em 04 Análises; Comparativos mostra só as ordens do grupo escolhido (a lista de todas as ordens fica em Visão geral › 05).
- Pasta: o handle já ficava salvo; ao reabrir, o Chrome pede permissão de novo. O botão vira "Reconectar pasta" e pede a permissão da pasta lembrada (`requestPermission`), sem abrir o seletor. "Permitir em todas as visitas", quando o Chrome oferece, evita o pedido nas próximas vezes.
