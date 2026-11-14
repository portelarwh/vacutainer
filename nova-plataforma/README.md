# Nova plataforma Vacutainer · 1.0.0

Aplicativo integrado para Chrome/Edge, distribuído como **um único HTML**, sem servidor ou API interna. Projeto independente na pasta `nova-plataforma/`; não substitui nem modifica as páginas atuais.

## Abrir

Arquivo pronto: [dist/Plataforma.html](dist/Plataforma.html).

[Prévia da interface](docs/imagens/inicio.png).

[Roteiro para a revisão técnica independente](docs/ROTEIRO-REVISAO-EXTERNA.md).

1. Copie **somente `Plataforma.html`** para a pasta da linha, ao lado de `00. Bases/`.
2. Abra pelo Chrome/Edge atualizado. Não é necessário instalar Node, React ou Vite na estação.
3. Clique em **Conectar pasta** e selecione a raiz da linha, não `00. Bases`.
4. Escolha o usuário no avatar. Abra um módulo para usar seus formulários, importação, gravação e relatórios.
5. A primeira conexão de cada módulo conserva as conferências do motor original. Não crie uma base nova se esperava encontrar uma existente.

A visão da linha só consulta resumos publicados (`exports`). Ela não cria, migra ou sobrescreve bases. Não respondido, ausente, incompatível e zero são situações diferentes.

**Explorar sem dados reais:** botão **Explorar demonstração** ou endereço `Plataforma.html?demo=1`. Cenário fictício isolado; alterações ficam na sessão. Sair/recarregar descarta essa sessão. Nenhuma pasta real pode ser conectada dentro da demonstração.

## O que está entregue

- Interface React/TypeScript com navegação única, busca Ctrl K, resumo/detalhado, filtros, ajuda, tema claro/escuro e layout para tela estreita.
- Visão da linha por período, produção publicada, gráfico, pendências e atalhos para os módulos.
- Ficha por número de ordem a partir dos exports, com abertura da ficha operacional do módulo.
- Produção, Waste, Gel, Paradas, Equipamentos, Iniciativas e Administração **operacionais dentro do mesmo arquivo**, com seus formulários e mecanismos de persistência existentes.
- As telas visitadas são mantidas durante a navegação, preservando o contexto e os rascunhos. Troca de pasta/ambiente é recusada quando há alterações pendentes identificadas pelos motores.
- Central de importações com sequência e acesso aos importadores reais; leitura Excel offline com **SheetJS oficial 0.20.3**.
- Relatório comum em HTML, CSV seguro e impressão/Salvar como PDF. Relatórios específicos continuam nos módulos, incluindo SQDCP e segurança/QN.
- Saúde dos dados: disponibilidade, revisão, atualização, fontes incompatíveis e pendências de gravação da sessão.
- jsPDF, AutoTable e SheetJS incorporados, sem CDN em tempo de uso.

## Arquitetura da primeira entrega

Esta entrega integra a plataforma inteira e reconstrói sua apresentação principal; **não é uma reescrita de todos os motores**. As regras existentes de cálculo, importação, vigências, auditoria e gravação são reutilizadas em ambientes internos, apresentados no aplicativo único. Essa decisão evita trocar fórmulas e dados durante uma mudança de interface.

Os motores incorporados vêm da revisão fixa **`0769376e794506a33d1d847ede67b73ea013b59e`** (correção da duração de paradas, PR #24, sobre a main `1aca521`). Alterações não publicadas que já estavam na árvore de trabalho foram preservadas e **não foram incorporadas silenciosamente**.

A main de publicação já contém evoluções posteriores, incluindo Linha 360°, ausentes neste snapshot. Esta é uma entrega para revisão da arquitetura integrada; não presume equivalência com todos os recursos da main atual.

O pacote contém todos os módulos da baseline incorporada. A página atual `paginas/` não é necessária em tempo de uso. `00. Bases/` e os backups continuam separados por domínio, com os formatos originais. Arquivos escolhidos para importar são dados externos à distribuição, como já ocorre hoje.

Projetos permanece com escopo em definição. OSM oficial, regras/amostras SQL do MES, padrões técnicos AM/TPM e decisões de produção fora de turno mantêm as pendências existentes. Esta entrega não inventa conteúdo técnico nem anuncia essas etapas como concluídas.

## Desenvolver

```sh
cd nova-plataforma
npm ci
npm test
npm run build
npm run test:browser
npm run test:abas
npm run test:pasta
```

`npm run dev` é opcional para desenvolvimento. O artefato de produção abre como HTML; **não precisa de servidor na linha**.

- `src/App.tsx`: interface, navegação e jornadas integradas.
- `src/components/`: componentes e ambiente dos módulos.
- `src/core/data.ts`: contratos de leitura, seletores, datas e apresentação.
- `src/core/runtime.ts`: ponte dos módulos, isolamento e navegação.
- `src/core/modules.ts`: registro de módulos e abas; ponto de extensão para novas áreas.
- `scripts/package-engines.mjs`: empacotamento da baseline e bibliotecas compartilhadas.
- `src/generated/`: pacote reproduzível e manifesto da origem.
- `vendor/`: SheetJS oficial e licenças.
- `tests/`: testes de contratos e fluxos de navegador.
- `docs/`: arquitetura, conferência e limites.

Uma cópia independente desta pasta também compila usando o snapshot local verificado, mesmo sem o histórico Git original.

O build não executa os geradores antigos nem edita os HTMLs atuais. Bibliotecas são armazenadas uma vez no pacote e compartilhadas no carregamento; os motores são descomprimidos sob demanda. Tamanho aproximado do HTML: 2,9 MB.

## Antes de substituir o uso atual

Leia [VALIDACAO.md](docs/VALIDACAO.md). A homologação com a pasta de rede e duas estações continua obrigatória. O Chromium gerenciado deste ambiente bloqueia URLs `file://` por política administrativa; os testes do mesmo arquivo usam transporte HTTP local e desligam a rede após a carga. Isso comprova a independência de recursos externos, mas **não substitui a abertura direta no Chrome/Edge da estação Windows**.

A publicação para revisão fica na branch `codex/nova-plataforma-unificada`, criada sobre a main `7c3f064fbc17227827172a78e393864646ed7deb`. Os motores incorporados continuam na baseline fixa indicada acima; não se deve confundir a base do PR com a versão desses motores. Não houve migração das bases reais nem troca dos arquivos em uso.
