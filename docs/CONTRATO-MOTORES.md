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

O empacotador não modifica os HTML. A inserção estrutural da ponte usa replaceOnce e falha caso a âncora esteja ausente ou duplicada. O verificador descomprime os motores, confere hash/tamanho e rejeita dependências externas.

Essas proteções são controles do aplicativo, sem substituir permissões de arquivo da rede. Não constituem comprovação de concorrência segura em SMB: essa homologação continua obrigatória antes do corte.

## Troca de pasta com pendência (casca 1.0.2, 15/11/2026)

Antes era só uma mensagem e a troca ficava bloqueada; um módulo parado conectando (por exemplo, esperando confirmação depois de escolher a pasta errada) prendia a pessoa na pasta. Agora a casca abre a janela "Há alterações pendentes nesta pasta", que diz o que está pendente e onde: cada módulo aberto com o motivo (ainda abrindo, conectando à pasta, alteração não gravada ou formulário aberto, não respondeu) e o que está guardado no navegador por módulo (`queueDetail`, em `modulo/core/scopes`; `pendingDetail`, em `modulo/core/runtime`). Falha ao consultar a fila aparece na janela e conta como pendência.

"Voltar e conferir" mantém a pasta. "Trocar mesmo assim" troca: o que está guardado no navegador continua no escopo desta pasta e volta quando ela for conectada de novo; só um formulário aberto e não salvo se perde. Testes: `tests/scopes.test.ts` e `tests/integracao.cjs`.


## Pessoa pelo ID, registro do backup e cenário da demonstração (16/11/2026)

Portal 1.9.40, Produção 2.4.78, Waste 1.12.9, Gel 2.36, Paradas 1.2.12, Equipamentos 1.0.17, Iniciativas 1.1.13, Linha 360° 1.1.4.

- **Pessoa = ID** (`vacPessoa`, em comum/bases). `id(nome, idGuardado)`, `nome(id, nomeGuardado)` (nome atual do cadastro), `mesma(aId, aNome, bId, bNome)` (pelo ID quando os dois têm), `eu()` (sessão), `deTexto(t)` (ID ou nome digitado → `{id, nome}`; fora do cadastro fica só o nome; nome repetido no cadastro fica sem ID). Campos novos, opcionais: Iniciativas `responsavelId`, `apoiosIds`, `criadaPorId` e eventos `deId`/`paraId`; Equipamentos `responsavelId`, `criadaPorId`; Produção `ps.responsibleId`, `day.responsibleId` e `auditLog[].userId`. Os exports de Iniciativas e Equipamentos publicam o nome atual e o ID. Portal › Pendências e ações: Minhas e Minha equipe comparam pelo ID (registro antigo só com nome vale pelo nome).
- **Registro do backup** (`vacBackupRegistro`, em comum/bases): cada módulo registra o backup diário (ok ou falha, erro, pessoa e ID, versão) em `00. Backups/<módulo>/registro-backup.log` (JSON por linha, 50 últimas; extensão .log para não contar como backup) e em `vac.backup.<módulo>` no navegador. Portal › Versões lê os dois: falha mais nova que o último ok = aviso crítico e pendência urgente. Produção: a falha continua impedindo a gravação.
- **Cenário da demonstração**: `node scripts/cenario-demo.cjs --gravar` abre cada módulo em demonstração, aplica pelo código da página os dados fictícios que faltavam (caixas do MES pelo importador, lote confirmado no dia, desvio da KKBC dividido em estrutura/empregado/preço, lote no PCP do Gel, data de leitura da produção pelo Gel) e grava as bases e exports atuais com as datas de volta ao dia de referência.
- **Paradas 1.2.12**: na demonstração a 1ª tela era montada antes do kit carregar (vacLayout); agora espera o documento terminar.
- **Testes sem internet**: `testes/http-local.cjs` atende as bibliotecas pela CDN com os blocos `biblioteca/*` e reprova qualquer outro pedido à internet.

## Contraste, comandos e pessoa pelo ID nos demais módulos (16/11/2026, 2ª entrega)

Produção 2.4.79, Waste 1.12.10, Paradas 1.2.13, Iniciativas 1.1.14, Linha 360° 1.1.5.

- `vacPagina.comandos()` ganha o campo opcional `dica` (o `title` do botão). O `label` passa a ser o texto do botão, ou o `aria-label`, ou o começo do `title`; a casca mostra a explicação longa como dica, não como rótulo.
- `Modal` da casca: depois do `showModal()`, o foco vai para o primeiro campo do conteúdo (Ctrl K cai na busca).
- Contraste: `--on-fill` e `--none-fill` no `css/brand` (seguem o tema da casca); Produção usa `--crit-fill`/`--on-fill` no "Editar scrap" e na pílula crítica; o mapa de calor do Paradas vai de 12% a 50% de intensidade com o texto normal; o cartão atrasado das Iniciativas usa 10% de vermelho. Teste: `testes/plataforma/contraste.cjs`.
- Pessoa pelo ID (campos novos, opcionais): Paradas `tecnico[id].tecnicoId` e `porId` (exports `eventos[].tecnicoId`); Waste `comments[].userId`, `alteradoPorId`, `exclusoes[].porId`; Linha 360° `postos[].pessoasIds` e `feitos[].porId`.
