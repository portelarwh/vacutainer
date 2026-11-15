# Preparação da plataforma para evolução visual

Revisão de 15/11/2026, a partir da main 920860c. Produto na pasta `nova-plataforma/` do mesmo repositório; não foi criado um repositório independente.

## Conclusão

A fundação está preparada para Codex e o outro agente continuarem as melhorias. Isso não declara concluído o redesenho de cada tela nem a homologação na linha. A plataforma permanece integrada aos nove motores atuais, sem mudar fórmulas, classificação de perdas, permissões ou estruturas das bases.

O ponto de entrada obrigatório é [COMECE-AQUI.md](../COMECE-AQUI.md). Ele informa o papel dos documentos, componentes existentes, build e divisão de trabalho. [PLANO-DE-MELHORIAS.md](../PLANO-DE-MELHORIAS.md) organiza as próximas jornadas; [PENDENCIAS-DOCUMENTAIS.md](../PENDENCIAS-DOCUMENTAIS.md) registra conflitos históricos que não devem virar novas regras por interpretação dos agentes.

## Correções e preparação entregues

- Referência de marca fornecida preservada integralmente em [BD_Dashboard_Brand_Guidelines.md](../BD_Dashboard_Brand_Guidelines.md); SHA-256 `58c769247f93fe02a2fe3413500004037b4f110dccdc86268ea36528a9e76674`.
- Uma folha de tokens BD em `src/design/brand.css`, compartilhada pela casca, nove módulos e relatório comum. Azul/navy identificam o produto; verde/vermelho continuam indicando resultado e estado.
- Ajustes de tipografia com fallback offline, contraste, foco, hierarquia, espaçamento, alinhamento numérico, navegação e responsividade da casca. CSS de layout reformatado para facilitar manutenção.
- Tema do módulo acompanha a casca por um atributo de apresentação próprio. A preferência antiga do Gel não disputa o mesmo atributo; impressão retorna ao tema claro e restaura o tema após imprimir.
- Node 22 indicado, verificação de documentos e paleta disponível por `check:setup`, testes visuais no CI e comando `build:capturar` para atualizar o guia após mudanças visuais.
- Guia auxiliar da plataforma atualizado; guia operacional antigo preservado até o corte. HTMLs e manifesto gerados pelo build, sem edição manual.

A casca passou a 1.0.1. `src/core/data.ts`, autenticação, contratos e motores não foram alterados. Fontes e HTMLs dos motores têm conteúdo idêntico à referência; o hash do pacote continua `b30ed051363b8b5f15bfad2e0778eaa97b76f1ba8a33c9e0029d37aa48410360`. O manifesto registra c3b3896 como último commit em fontes/páginas porque esse commit atualiza apenas o gerador auxiliar do guia. O hash permite distinguir essa proveniência de uma mudança de motor.

## Verificação executada

Somente demonstração fictícia e bases fictícias em OPFS. Nenhuma base operacional foi lida ou gravada.

| Verificação | Resultado e evidência |
|---|---|
| Regressão da raiz | 67 suítes passaram: [parte 1](evidencias/raiz-1.log), [2](evidencias/raiz-2.log), [3](evidencias/raiz-3.log), [4](evidencias/raiz-4.log). |
| Suíte completa da plataforma | [Passou](evidencias/plataforma.log): 42 testes unitários, contratos dos nove módulos, 75 abas, gravação/releitura em oito bases preenchidas, versões futuras, sessão, conta própria, 315 comparações de permissão e inicialização nativa. |
| Marca e temas | [Antes](evidencias/marca-antes.log) falhava por ausência dos tokens; [depois](evidencias/marca-depois.log) passou em 390, 768 e 1440 px, nos temas claro/escuro, casca e nove motores. Confere foco, contraste dos papéis de texto/estado, relatório com os mesmos dados da tela e ausência de requisições externas. |
| Build repetível | [Dois builds idênticos](evidencias/reprodutibilidade.log), incluindo os artefatos gerados. SHA-256 do Plataforma.html: `4526d91ea36b22b5aea41f20cab5d74b2fccb970eee08b202c82b1384d73200a`. |
| Documentos/configuração | `npm run check:setup --prefix nova-plataforma` confere as dez cores da referência, importações compartilhadas e referências Markdown locais. |

Os testes de navegador usam o mesmo HTML distribuído, servido por HTTP local de teste. O ambiente gerenciado bloqueia a abertura direta por file://; esse resultado não comprova a abertura na pasta corporativa. As capturas automatizadas são produzidas em `testes-saida/marca/` e não são artefatos distribuídos.

## Ainda pendente

- Revisão detalhada de gráficos, tabelas, formulários e relatórios de cada motor. Tokens compartilhados não eliminam todos os estilos específicos nem certificam acessibilidade completa.
- Fontes FS Albert Pro oficiais instaladas/licenciadas e arquivos oficiais do logotipo. Sem esses arquivos, usa-se fallback local e o ícone existente do aplicativo. O Maxwell não foi consultado; a referência anexada é uma adaptação do PPTX.
- Validação das jornadas por perfil e dos requisitos técnicos em aberto de OSM, MES, AM/TPM e Projetos. Nenhuma regra foi inventada para preencher essas lacunas.
- Chrome/Edge corporativos por file://, SMB, duas estações, impressora/PDF e Outlook reais: **NÃO VERIFICADO**. Seguir [CORTE.md](../CORTE.md) antes da substituição na linha.

## Continuação por qualquer agente

Leia o índice e o Design System; investigue a tela atual; combine a propriedade dos arquivos compartilhados e entregue uma jornada por branch. Comece pelas consultas de exports. Preserve valores, filtros, IDs, eventos, fontes, permissões e gravação. Atualize capturas e execute os testes aplicáveis. Os planos históricos não autorizam modificar cálculo ou dado sem autorização explícita do responsável.
