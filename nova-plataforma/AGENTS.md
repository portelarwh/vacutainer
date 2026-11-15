# AGENTS.md — Vacutainer

## Regras obrigatórias
Antes de qualquer alteração:
1. Leia este arquivo, docs/COMECE-AQUI.md e os documentos relevantes da pasta docs.
2. Analise a implementação existente e seus impactos.
3. Reutilize componentes, gráficos e padrões já aprovados.
4. Preserve os cálculos de OEE, produção, perdas e paradas.
5. Não modifique regras de negócio sem autorização explícita.
6. Mantenha a rastreabilidade por ordem e lote em todos os módulos.
7. Padronize gráficos equivalentes, filtros e interações.
8. Priorize dashboards modernos, claros, responsivos e personalizáveis.
9. Evite componentes duplicados e correções isoladas em várias páginas.
10. Execute os testes disponíveis e informe limitações.
11. Atualize a documentação quando um novo padrão for aprovado.

## Documentos de referência
- docs/DESIGN_SYSTEM.md — layout, dashboards, gráficos, componentes e UX.
- docs/BD_Dashboard_Brand_Guidelines.md — referência de marca fornecida pelo responsável.
- docs/ARQUITETURA-v1.md — requisitos desejados; não substitui a arquitetura implementada.
- docs/ARQUITETURA.md — integração, dados, ordem e lote.
- docs/REGRAS_DE_NEGOCIO.md — indicadores e cálculos.

Se um documento não existir, informe sua ausência; não invente seu conteúdo.

## Ao finalizar cada tarefa
Informe os arquivos modificados, testes realizados, possíveis impactos e documentação atualizada.

## Preparação visual e cooperação
Aplique a marca por src/design/brand.css, compartilhado entre casca e motores incorporados. Não duplique paleta por página. Preserve cores funcionais e classificações existentes; o gráfico SQDCP continua verde/vermelho conforme a meta.

Consulte docs/PLANO-DE-MELHORIAS.md e docs/PENDENCIAS-DOCUMENTAIS.md antes de retomar propostas antigas. Execute npm run check:setup, os testes relevantes e o build. Trabalhe numa branch a partir da main atual e coordene arquivos compartilhados com o outro agente. Nunca edite src/generated/ ou dist/ manualmente.
