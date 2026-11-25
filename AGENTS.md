# Orientações obrigatórias · Vacutainer

O aplicativo inteiro está em **Plataforma.html**, na raiz. Esse é o arquivo executável e a única fonte editável do produto. Não existe outro projeto nem uma pasta de páginas para alimentar um build. A única exceção, autorizada pelo responsável em 20/11/2026, é a pasta [CELULAR](CELULAR/LEIAME.md): o app de celular "Meu Turno", independente, que não lê nem grava as bases da plataforma.

Antes de alterar, leia [COMECE-AQUI](docs/COMECE-AQUI.md), [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md), [ARQUITETURA](docs/ARQUITETURA.md), [ARQUITETURA-REQUISITOS](docs/ARQUITETURA-REQUISITOS.md), [REGRAS_DE_NEGOCIO](docs/REGRAS_DE_NEGOCIO.md), [CLAUDE.md](CLAUDE.md) e as diretrizes aplicáveis à tarefa. Investigue componentes e consumidores antes de criar outra implementação. Mudança de aparência de uma página segue a skill [padrao-visual](.claude/skills/padrao-visual/SKILL.md) (modelo: Produção › Visão geral e Lançamento), com a varredura `node scripts/varredura-visual.mjs`.

As fontes estão nos blocos `textarea[data-vac-source]` do próprio HTML. O atributo identifica o componente: `modulo/App`, `css/brand`, `motor/oee`, `comum/interface`, etc. São conteúdo local, nunca URLs. O carregador `vacCarregador` monta módulos ES por importmap/blob e documentos internos por srcdoc. Não recrie paginas/, fontes/, nova-plataforma/, snapshots paralelos ou geradores por substituição de trechos.

Preserve fórmulas, classificação de perdas, contratos, códigos textuais, vigências imutáveis, sessão e permissões. A consolidação de arquivos foi autorizada pelo responsável; ela não autoriza mudar significado de dados ou regras de negócio. Cada módulo grava apenas suas bases; os demais leem exports compatíveis. Testes somente com dados fictícios.

Base limpa (24/11/2026): não se escreve compatibilidade com base, cadastro ou export de versão anterior; versão diferente bloqueia a gravação. Base de versão anterior fica só para consulta ("Base de versão anterior. Comece uma base nova nesta pasta."), export de versão anterior não é usado ("Dados de <página> em versão anterior") e a pessoa é sempre o ID guardado, nunca o nome de um registro sem ID. Dados históricos necessários chegam ao formato atual só por migrador pontual de uso único, fora do caminho normal (CLAUDE.md, contrato 10). O que saiu está em [BASE-LIMPA](docs/BASE-LIMPA.md); onde o bloqueio já vale também está no contrato 10.

Uma mudança no bloco comum alcança todos os módulos. Coordene a edição do HTML único com o outro agente por branches e commits pequenos; não use formatação automática do arquivo inteiro. Use o ID do bloco para localizar alterações. Não edite bibliotecas de terceiros como código do produto.

Após editar um motor ou biblioteca, execute `npm run atualizar:metadados`. Execute `npm run build`, testes pertinentes e a regressão completa quando houver integração compartilhada. Os utilitários de scripts/ e testes/ leem o próprio HTML; não são necessários para executá-lo. `.test-cache/` e saídas de teste nunca entram no Git.

Toda versão nova da plataforma ganha uma entrada em **Administração › Novidades** (`NOVIDADES`, motor/portal), a mais recente primeiro: frases curtas, sem detalhe técnico, marcadas como novo, melhoria ou correção (pedido do responsável, 20/11/2026). O teste `novidades` reprova se a versão da plataforma não for a primeira entrada.

Ao concluir, informe alteração, propósito, testes, impactos, documentação e limites. Não declare homologação em file:// corporativo, SMB, duas estações ou Outlook com base apenas em Chromium/OPFS local. Pendências: [PENDENCIAS.md](PENDENCIAS.md). Decisões históricas: [registro](docs/DECISOES-HISTORICAS.md); item recusado só volta com fato novo.
