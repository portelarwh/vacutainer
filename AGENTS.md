# Orientações para agentes · Vacutainer

O produto novo está em **nova-plataforma/**, dentro deste mesmo repositório. A pasta depende das fontes dos motores na raiz; não é um repositório independente.

Antes de trabalhar no produto, leia:

1. [nova-plataforma/AGENTS.md](nova-plataforma/AGENTS.md).
2. [Índice e escopo dos documentos](nova-plataforma/docs/COMECE-AQUI.md).
3. As diretrizes de design, arquitetura e proteção das regras indicadas nesse índice.
4. [CLAUDE.md](CLAUDE.md) para propriedade dos motores, builds e contratos existentes.

Reutilize componentes e investigue consumidores antes de alterar. Motores, fórmulas, critérios de agregação, permissões, vigências e estruturas de dados não podem ser alterados sem autorização explícita. Não use bases reais nos testes desta preparação.

A marca compartilhada da plataforma é definida em `nova-plataforma/src/design/brand.css`. A mesma folha chega à casca e aos módulos incorporados. Os HTML gerados não são o local de edição do layout do produto.

O histórico de auditorias e os planos antigos não substituem decisões vigentes. Quando houver conflito, identifique o escopo e a decisão aplicável; não escolha uma nova regra de negócio por conta própria.
