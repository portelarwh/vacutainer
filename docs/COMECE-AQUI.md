# Comece aqui · plataforma única

15/11/2026. O aplicativo inteiro está em **Plataforma.html, na raiz**, incluindo código editável, componentes, estilos, motores, bibliotecas e ferramentas. Nenhum build procura paginas/, fontes/ ou outro projeto. O arquivo pode ser copiado sozinho para usar o sistema; bases e backups são dados externos obrigatórios para o uso real, não código.

## Índice de referências — leitura proporcional à tarefa

| Documento | Papel |
|---|---|
| [AGENTS](../AGENTS.md) e [CLAUDE](../CLAUDE.md) | Procedimento, mapa do código e contratos protegidos, iguais para os dois agentes. |
| [CODEX](CODEX.md) | Roteamento de modelos, esforço e delegação específicos do Codex. |
| [DESIGN_SYSTEM](DESIGN_SYSTEM.md) | Aplicação visual, componentes, acessibilidade e dashboards. |
| [padrao-visual](../.claude/skills/padrao-visual/SKILL.md) | Modelo de página (Produção › Visão geral e Lançamento) e varredura para adequar outra página. |
| [BD_Dashboard_Brand_Guidelines](BD_Dashboard_Brand_Guidelines.md) | Referência fornecida pelo responsável, preservada integralmente. |
| [MARCA](MARCA.md) | Fontes e logos comerciais opcionais, fora do Git. |
| [ARQUITETURA](ARQUITETURA.md) | Implementação atual em arquivo único. |
| [ARQUITETURA-REQUISITOS](ARQUITETURA-REQUISITOS.md) | Requisitos de evolução; não declara tudo implementado. A lista de módulos ali não manda duplicar Produção/OEE ou Iniciativas/Ações. |
| [REGRAS_DE_NEGOCIO](REGRAS_DE_NEGOCIO.md) | Proteção dos cálculos e critérios para mudar regras. |
| [CONTRATO-MOTORES](CONTRATO-MOTORES.md) | Integração do aplicativo e seus módulos internos. |
| [CONSOLIDACAO](CONSOLIDACAO.md) | O que foi incorporado/removido e como foi validado. |
| [PLANO-DE-MELHORIAS](PLANO-DE-MELHORIAS.md) | Próximas jornadas de layout. |
| [PENDENCIAS](../PENDENCIAS.md) | Lista ativa de material, decisões e homologação. |
| [CORTE](CORTE.md) | Homologação, instalação e retorno. |
| [DECISOES-HISTORICAS](DECISOES-HISTORICAS.md) | Decisões anteriores preservadas; caminhos de fontes no corpo são históricos. |

Consulte apenas as referências e seções pertinentes, conforme AGENTS.md; alterações críticas exigem revisar todos os contratos afetados. Instrução explícita do responsável prevalece. Marca corporativa vigente no Maxwell tem precedência sobre a adaptação do PPTX; diretriz visual não altera classificação ou fórmula. Requisitos desejados não autorizam inventar regras técnicas.

## Como localizar e editar

Use a busca do editor por `data-vac-source="ID"`. O mapa completo está no CLAUDE.md. Blocos de código são JavaScript ES2022; o React já está incorporado e os componentes usam jsx/jsxs. Não há compilação TypeScript ou JSX necessária para abrir o produto.

- Layout e componentes: modulo/App, modulo/components/*, css/style.
- Paleta: css/brand, compartilhada com os módulos internos e impressão.
- Integração e dados da casca: modulo/core/*. Leia contratos antes de alterar.
- Regra operacional: motor/oee, motor/portal, motor/perdas etc., com fragmentos comum/* reutilizados.
- Bibliotecas: vendor/* e biblioteca/*; não são código de negócio e preservam suas licenças.

Dentro dos textareas, `&` é representado como `&amp;` para preservar literalmente o código; o fechamento de um textarea interno aparece como `&lt;/textarea`. Não é mudança de regra ou dado. O verificador e o navegador decodificam uma vez, da mesma maneira. Não formatar todo o HTML automaticamente. Não editar .test-cache/ como fonte.

Para editar sem lidar manualmente com essas representações, use `node scripts/bloco.mjs css/brand > /tmp/marca.css`, edite o conteúdo e aplique `node scripts/bloco.mjs css/brand /tmp/marca.css`. O utilitário atualiza só aquele bloco no HTML, valida e atualiza os metadados. O arquivo temporário é uma ferramenta de edição, nunca outra fonte mantida no repositório. Não comece o bloco com linha vazia; preserve LF, como definido no .gitattributes.

## Verificação e trabalho entre agentes

```sh
npm ci
npx playwright install chromium
npm run atualizar:metadados
npm run build
npm run test:unit
npm test
npm run test:plataforma
npm run test:reprodutibilidade
```

Use Node 22. Playwright é dependência de teste; Python, Vite e TypeScript foram retirados do processo. npm run build confere a fonte executável, sem gerar outro HTML. Para visualizar por HTTP local durante desenvolvimento, npm run dev e http://127.0.0.1:5173/?demo=1. Produção continua por arquivo, sem servidor.

Combine o bloco a editar com o outro agente e use uma branch por entrega. Faça alterações pequenas; Git ainda permite revisar blocos diferentes no mesmo arquivo. Mudança em comum/* exige verificar os nove módulos. Preserve dados, filtros, permissões e rastreabilidade. Nenhuma base real pode ser usada nesta preparação.
