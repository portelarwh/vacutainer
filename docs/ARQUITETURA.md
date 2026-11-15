# Arquitetura implementada · arquivo único

## Fonte executável

Plataforma.html é simultaneamente o arquivo de distribuição e a fonte editável. Ele contém blocos nomeados em textareas ocultos: módulos JavaScript ES2022, CSS, documentos dos motores, bibliotecas e cenário fictício. O carregador cria URLs blob locais e um importmap para os módulos. Os documentos operacionais são montados em srcdoc sob demanda, na origem do aplicativo. Não são consultados arquivos HTML externos.

Blocos comum/* e css/kit são compartilhados por referências internas @@vac:ID@@; a montagem é estrita, rejeitando fragmento ausente ou ciclo. A extração inicial reproduziu os nove motores byte por byte. A única adaptação posterior dentro de motor/portal trata leitura de versões/páginas em construção e bibliotecas pelo pacote interno, em lugar dos arquivos antigos. Não altera fórmulas ou modelo de base.

A fonte não contém os arquivos comerciais de fontes/logos. Marca/ é opcional e há fallback offline. React/ReactDOM, Zod, SheetJS, jsPDF e AutoTable são código local incorporado com licenças preservadas.

## Dados e responsabilidade

A casca consulta exports compatíveis e cadastro geral, sem gravar bases operacionais. Cada motor conserva sua fila, transação, auditoria, backups, vigências e importadores. Portal é o único dono do cadastro. Base mais nova impede escrita; sem sessão válida, consulta. A transação de senha/autocadastro continua restrita à conta própria.

Pasta escolhida uma vez; handles permanecem nativos e clonáveis. Cache, IndexedDB, filas e preferências têm escopo por pasta. A → B → A preserva o escopo. A janela de pendências oferece conferir ou trocar explicitamente, preservando fila durável no escopo anterior; rascunho não salvo segue o aviso existente.

Não se altera schema, localização de JSON, cálculo de turno/madrugada ou gravação concorrente para executar esta consolidação. Nenhuma base real foi usada. Ensaios locais não homologam SMB.

## Navegação e código incorporado

O registro modulo/core/modules mantém IDs e aliases de nomes antigos para interpretar links já gravados. Esses nomes são compatibilidade de rota, não dependência de arquivos. A casca usa vacPagina para abas, comandos, ordem, estado, impressão e pendência. O adaptador de navegação também captura atribuições diretas a location.href para rotas internas.

vacCodigo oferece aos motores consulta somente de leitura ao código incorporado: contem(id), texto(id), biblioteca(nome). O Portal usa essa interface para planejados e versões. Ela não fornece handles nem altera autorização de dados. As ferramentas de conferir pasta e comparar importação abrem em janela a partir do próprio HTML, pelo painel Saúde dos dados.

Áreas abertas permanecem montadas para preservar rascunhos; descarte encerra timers e observers. Os módulos internos conservam seus documentos e escopos de execução para manter paridade, sem páginas de distribuição independentes.

## Metadados e manutenção

dados/manifesto registra versão, SHA-256 e tamanho de cada motor montado, além do hash de motores e bibliotecas. sourceRevision indica a revisão anterior que originou a consolidação, não o commit atual do HTML; sourceMode é single-html. A revisão que um arquivo contém não pode ser o hash Git desse próprio arquivo. O hash do HTML completo é calculado pelo verificador e registrado no CI.

npm run atualizar:metadados calcula os metadados, valida a versão candidata inteira e só então substitui o arquivo por renomeação de temporário. npm run build apenas verifica fonte, sintaxe, imports, hashes, documentação e ausência das árvores antigas. Não há produto gerado duplicado nem fontes fora do HTML. Repetir a verificação não modifica o arquivo.

scripts/ é infraestrutura genérica de inspeção e teste. testes/ extrai módulos para .test-cache/ ignorado pelo Git e serve motores isolados apenas para regressão; não recria páginas no disco nem participa da execução operacional. Os testes do produto abrem o mesmo HTML único, inclusive copiado sozinho para um diretório vazio.
