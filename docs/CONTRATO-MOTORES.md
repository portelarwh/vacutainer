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
| `comandos()/comando(id)` | Reaproveita os comandos existentes do cabeçalho, incluindo Voltar, relatório, backup e TV. |
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
