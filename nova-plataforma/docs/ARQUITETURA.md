# Arquitetura implementada e contratos

## Distribuição

Uma aplicação React compilada com TypeScript/Vite. `vite-plugin-singlefile` incorpora JS e CSS. O verificador do build rejeita referências externas de scripts e folhas de estilo. O resultado é `dist/Plataforma.html`.

A árvore atual dos motores fica comprimida, com SHA-256 por motor no manifesto. As bibliotecas são comprimidas separadamente, sem oito cópias no arquivo. A execução carrega cada área sob demanda, em `srcdoc` com a origem herdada do aplicativo. Não são necessárias páginas HTML externas.

O carregador insere bibliotecas como texto de elementos script, evitando problemas de parsing de `</script>` e caracteres de código de páginas do Excel. JSON usado na fronteira HTML é escapado.

## Responsabilidade dos dados

O shell lê somente `exports`, revisão e identificação da base; lê o cadastro geral para identificação, perfis e turnos. Não grava JSON operacional. Cada motor conserva suas transações, filas, auditoria, vigências e backups. Não há uma segunda implementação de gravação que concorra com esses mecanismos.

A pasta é escolhida uma vez no aplicativo e oferecida aos módulos na conexão. A aplicação usa um namespace próprio de cache, IndexedDB e preferências para cada pasta. Não altera o cache das páginas antigas. Trocar de pasta é bloqueado se algum motor sinaliza gravação pendente. Um navegador fechado antes de gravar continua dependendo da recuperação implementada no próprio motor.

Em modo real, painel não conectado mostra ausência, não o cenário de demonstração. Falha de leitura retira os resultados antigos do painel. Esquema/exports incompatível não é reinterpretado como base vazia.

## Navegação

O registro em `modules.ts` define módulo, arquivo de origem, nome e grupo. As abas e comandos vêm do contrato `vacPagina` do motor, sem lista paralela na casca. Rotas do aplicativo usam `#/modulo?tab=aba`. Links operacionais são encaminhados para a área correspondente; hashes de ficha, nova ação, reunião, ordem, lote e LP são preservados.

As áreas abertas permanecem montadas, evitando descarte automático de rascunho. A barra do aplicativo e as abas principais são únicas. Os comandos operacionais de cabeçalho (nova ação, OS, sincronizar, backup e TV) são preservados no espaço do módulo.

## Cálculo e períodos

O shell soma quantidades publicadas apenas dentro da janela e do turno selecionados. Não recalcula OEE nem faz média aritmética das taxas. Uma taxa aparece quando há uma taxa publicada para o mesmo recorte; outras janelas encaminham ao cálculo completo da Produção.

Waste continua mensal. Estoque e fila são posições publicadas; não são transformados em histórico diário. Metas e segurança/QN completas permanecem nos relatórios específicos do motor.

## Evolução

Um novo módulo precisa de registro, contrato de exports, política de gravação e testes. Pode nascer diretamente em componentes React; não precisa de novo HTML de distribuição. A fronteira de compatibilidade permite converter telas antigas gradualmente, retirando seu motor empacotado quando o fluxo tiver paridade de cálculo, importação, persistência e relatórios.

A primeira entrega não altera o modelo de gravação para arquivos por estação. Não declara ausência de conflitos em rede. Alterações em produtividade dos turnos e atribuição de madrugada precisam das decisões de negócio já solicitadas.

## Correções PR76

O build da plataforma primeiro compila a raiz; o empacotador lê os nove HTML atuais, sem transformações textuais e sem fallback de snapshot. A casca usa a sessão vacLogin e as permissões por ação do vacTravas. Antes da conexão, a versão é conferida; a escrita é protegida no realm do motor sem tornar os handles não clonáveis no IndexedDB. Os escopos de todas as pastas são preservados e a troca consulta reservas e fila durável. O plano de corte está em CORTE.md; nenhuma troca foi executada na pasta real.


## Camada visual compartilhada

A identidade do produto novo está em `src/design/brand.css`, importado pela casca e como texto pela ponte de apresentação dos módulos. A folha adapta os tokens existentes do kit, preservando os motores empacotados. Não é um novo armazenamento ou motor de cálculo. `src/style.css` cuida do layout da casca. Critérios de cor de resultado, como verde/vermelho no SQDCP, permanecem os mesmos.

A arquitetura desejada está em [ARQUITETURA-v1.md](ARQUITETURA-v1.md); o ponto de entrada para os agentes é [COMECE-AQUI.md](COMECE-AQUI.md). Esta preparação não altera os contratos de base, autenticação, cálculo ou persistência.
