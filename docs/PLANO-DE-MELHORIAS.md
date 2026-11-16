# Plano de melhorias · UX da nova plataforma

Base preparada em 15/11/2026. O objetivo desta rodada é uma fundação consistente para as próximas entregas, preservando os motores. A lista abaixo diferencia o que existe de funções que ainda serão desenhadas e validadas.

## Fundação desta rodada

- Referência de marca no repositório, documentação com escopo e responsabilidades explícitos.
- Tokens institucionais e funcionais compartilhados pela casca e pelos nove módulos incorporados.
- Cores com contraste verificado, tipografia com fallback offline, foco e controles de leitura confortável na casca.
- 16/11/2026: contraste renderizado medido também nos nove módulos, nos dois temas (`testes/plataforma/contraste.cjs`, nenhum texto abaixo de 4,5:1); letra mínima de 11 px e área de toque na casca; gráfico "Ritmo da produção" legível em 390 px; Ctrl K com foco na busca; rótulo curto nos comandos dos módulos.
- Temas claro/escuro preservados; a adaptação escura é técnica, não um tema corporativo certificado.
- Os hashes dos motores permitem verificar que cálculos, formulários e estruturas não foram reescritos.

## Próximas entregas

| Ordem | Entrega | Investigar/reutilizar | Aceite |
|---|---|---|---|
| 1 | Visão da linha: resumo gerencial e aprofundamento | Metric, BarChart, cards e filtros existentes | Mesmos números e fontes; hierarquia situação → meta → desvio → ação; ausência nunca vira zero. |
| 2 | Jornada do operador na Produção | Telas atuais do motor, abas e botões já acessíveis | Apontar/fechar/consultar hora a hora preservando IDs, eventos, regras de turno e permissão; testes das referências existentes. |
| 3 | Tabelas, filtros e gráficos equivalentes | Componentes e parsers já existentes; séries publicadas | Período/unidade/fonte explícitos; rótulos legíveis; seleção por teclado; preservar escopo do filtro e arredondamento. |
| 4 | Ficha da ordem/lote/equipamento | vacPagina.abrirOrdem e vacFicha; Modal já existente | Navegação contextual sem inventar relações nem perder zeros, fonte ou contexto; validar o escopo dos identificadores. |
| 5 | Planner e equipamentos | Kanban, OS e vínculos atuais | Status com texto e cor, prioridade clara, mesmos responsáveis, prazos, eventos e histórico. |
| 6 | Relatórios, SQDCP e Outlook | Geradores existentes e peças do kit | Mesmos números, filtros e fontes; SQDCP continua uma A4 paisagem; testar impressão, PDF e texto/imagem. |

Cada linha precisa de diagnóstico da tela antes da implementação. Não significa que todas as funcionalidades estejam prontas ou que precisem ser reescritas em React. Comece por telas que só leem exports; formulários só migram quando houver paridade demonstrada.

## Dependências e pontos em aberto

- Confirmar fontes corporativas instaladas/licenciadas e fornecer os arquivos oficiais do logotipo para as variantes clara/escura. Nenhum logotipo BD será redesenhado.
- Conferir o material corporativo vigente no Maxwell quando disponível.
- Validar jornadas por perfil com os usuários antes de mudar o que cada um vê ou pode fazer.
- OSM, MES, conteúdo técnico AM/TPM, 5S e Projetos continuam dependendo das amostras e decisões já registradas.
- Microparadas 5/10 minutos, conciliação e critérios de madrugada não são resolvidos por decisões de layout.
- Gráficos e relatórios dos motores ainda têm cores específicas e densidades próprias. A camada de tokens não significa revisão individual nem certificação de acessibilidade de todas as telas.
- Homologação em Chrome/Edge corporativo, file://, SMB, duas estações, impressora e Outlook permanece pendente.

## Validação por entrega

1. Fixar os valores e cenários de referência antes de mexer na tela.
2. Verificar temas, 390/768/1440 px, teclado, foco, modais, mensagens e ausência de dados.
3. Preservar verde/vermelho quando representam resultado versus meta; aplicar azul à identidade e a séries neutras.
4. Verificar contratos, navegação e gravação/releitura apenas em dados fictícios.
5. Atualizar capturas/documentação e conferir o build único offline.
6. Apresentar o que foi verificado e o que depende de ambiente real.
