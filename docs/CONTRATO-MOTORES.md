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

