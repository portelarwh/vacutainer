# Consolidação em um único arquivo

Pedido explícito do responsável, 15/11/2026: eliminar código/arquivos antigos e manter o aplicativo num único HTML. Referência inicial: main ffc9ee8c9883f171e478f15e33c5e938a9cb57a0, incluindo as PRs 76, 77, 80 e 81.

## Entrega

Plataforma.html na raiz é a fonte editável e o aplicativo executável. Não existe geração a partir de uma árvore antiga, home redirecionadora ou pacote comprimido que precise ser extraído para editar as regras. Componentes, estilos, motores e bibliotecas são blocos locais nomeados. O JavaScript da plataforma foi convertido de TypeScript/JSX para JavaScript ES2022 com o mesmo React incorporado; os motores operacionais não foram reimplementados em React.

Os cinco fragmentos comuns retiram cópias idênticas de estilos/kit. O cenário fictício também tem uma única definição, usada pela casca e pelos motores. A montagem inicial recuperou os nove motores byte por byte; o registro de SHA-256 anterior está em testes/bases/consolidacao-motores.json. As oito bases fictícias geradas antes da mudança estão em testes/bases/consolidacao-referencia.json para testar compatibilidade de leitura/gravação.

Apenas o leitor de código do Portal foi adaptado dentro dos motores: páginas em construção, localização do código e verificação de versões/bibliotecas passam a usar vacCodigo, que consulta o próprio HTML. A casca também intercepta rotas antigas acionadas por location.href. Fórmulas, formatos de base, permissões, regras de madrugada, filas, backups e imports não são alterados.

## Removido da árvore ativa

- paginas/, inclusive bibliotecas separadas: conteúdo incorporado e licenças preservadas.
- fontes/: resultado atual dos motores incorporado, sem os antigos geradores Python e substituições incrementais.
- nova-plataforma/: componentes e estilos incorporados; testes e referências necessárias transferidos para a raiz, sem dist ou src duplicados.
- index.html antigo que redirecionava ao Portal.
- ferramentas/ com HTMLs separados: ambas incorporadas e acessíveis por Saúde dos dados.
- Auditorias com snapshots, reproduções e logs antigos repetidos. O registro de decisões foi preservado; histórico completo continua no Git.
- Artefatos e capturas auxiliares de instalação: orientações vigentes em CORTE.md e guia contextual já incorporado. Nenhum segundo HTML é necessário.

Ficam somente o aplicativo, infraestrutura de teste/verificação, documentação vigente, dados fictícios de regressão e licenças. A pasta Marca/ comercial é opcional e não é publicada. Bases e backups reais permanecem externos; não foram acessados.

## Validação

Os testes usam o mesmo HTML e extraem seus blocos para arquivos temporários ignorados apenas quando o Node precisa importar uma função pura. Os ensaios nativos de regressão recebem documentos em memória do próprio aplicativo, não cópias antigas. Testes de build.py/aplicar_kit21 removidos foram substituídos por integridade de blocos, metadados, imports, rejeição de corrupção e atualização segura do arquivo único.

O subcenário B06 que executava via git show o HTML de 38542d0, anterior a 00. Bases, saiu da regressão ativa com esse produto descontinuado. Não se declara esse retorno histórico homologado. A compatibilidade da plataforma atual é exercitada com as bases preenchidas anteriores à consolidação e com bases de versão futura; a volta de produção continua manual e exige aplicativo e bases do mesmo ponto, conforme CORTE.md.

O roteiro cobre as 68 suítes operacionais da main atual, testes unitários úteis, contratos, todas as abas, oito bases preenchidas, sessão/permissão, conta própria, temas e navegação. Um teste adicional copia só o HTML para uma pasta vazia e recusa solicitações de páginas antigas. O resultado final da execução deve constar na PR; saída detalhada fica nos artefatos do CI, não em dezenas de cópias versionadas de logs.

Execução local concluída: 32 testes unitários, as 68 suítes operacionais em quatro partes, contratos dos nove módulos, 74 abas, oito bases anteriores com comparação integral ao gravar/reler, versões futuras sem escrita, 315 comparações de permissão, conta própria, 18 inicializações, seis combinações de tamanho/tema e ferramentas passaram. O teste da Meta OEE foi repetido após trocar o acesso antigo à SheetJS pelo conteúdo incorporado. O ensaio adicional de versões do Portal e o HTML copiado sozinho também passaram; a última repetição inclui atribuição direta a location.href e Ctrl+clique. Verificar duas vezes e reaplicar um bloco sem alteração preservou o HTML byte por byte. O hash final do aplicativo é emitido pelo CI; não depende do Git para abrir ou verificar.

NÃO VERIFICADO nesta rodada: file:// no Chrome/Edge corporativo, SMB, duas estações, perda real de rede/permissão, Outlook/impressora reais e marca vigente no Maxwell. Limpeza do repositório não equivale a homologação ou corte na pasta da linha.

## Continuar o trabalho

[COMECE-AQUI](COMECE-AQUI.md) indica os blocos e comandos. O código está em um arquivo por escolha explícita do responsável: isso aumenta a necessidade de combinar a edição por blocos e revisar diffs pequenos. Não recriar cópias de fonte para contornar conflitos entre agentes.
