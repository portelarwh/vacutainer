# Fronteira entre casca e motores

As regras continuam nas fontes de cada motor. O build da raiz aplica `fontes/kit/kit_v21.js`, que publica `window.vacPagina` nos nove HTML. A casca usa esse contrato; não executa eval nem consulta Store, Cad, FS ou nomes privados.

| Operação | Contrato |
|---|---|
| `pendente()` | Booleano; erro, conexão em andamento e rascunho não concluído bloqueiam troca de pasta. |
| `conectado()` | Só retorna verdadeiro depois de concluir a conexão/leitura. |
| `conectar(dir)` | Usa o handle nativo escolhido pela casca; não escolhe outra pasta. |
| `ir(aba, hash?, contexto?)` | Delega à navegação existente, preservando ficha/ordem/lote e os filtros do motor. |
| `abas()` | Publica rotas e rótulos do próprio motor; a casca não mantém uma segunda lista. |
| `abrirOrdem(numero)` | Abre a ficha pelo código textual, sem converter zeros à esquerda. |
| `comandos()/comando(id)` | Reaproveita os comandos existentes do cabeçalho, incluindo Voltar, relatório, backup e TV. |
| `info()` | Versão e situação da base; autorização de impressão. |
| `atualizar()/imprimir()` | Releitura e impressão pelo próprio motor. |
| `autenticar()/sessao()` | Delega ao vacLogin; a casca não fabrica sessão nem escolhe identidade numa lista. |
| `descartar()` | Encerra timers e observers antes de retirar o iframe. O callback ref tem identidade estável entre renders. |

Antes de conectar, a casca confere as versões nas localizações reconhecidas. Portal também confere o cadastro geral; Produção também confere ordens-base. Base mais nova impede escrita. Os handles continuam nativos, inclusive no IndexedDB; a proteção da File System Access API é instalada no realm do motor.

Cada pasta recebe um escopo persistente por isSameEntry. Reservas, cópias pendentes e a fila vacFila são conferidas mesmo sem um módulo aberto. A checagem é repetida depois do seletor de pasta. Falha de leitura bloqueia a troca. Eventos publicados aos módulos usam as chaves canônicas, sem o prefixo de isolamento.

O empacotador não modifica os HTML. A inserção estrutural da ponte usa replaceOnce e falha caso a âncora esteja ausente ou duplicada. O verificador descomprime os motores, confere hash/tamanho e rejeita dependências externas.

Essas proteções são controles do aplicativo, sem substituir permissões de arquivo da rede. Não constituem comprovação de concorrência segura em SMB: essa homologação continua obrigatória antes do corte.
