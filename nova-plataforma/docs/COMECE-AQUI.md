# Comece aqui · Nova plataforma Vacutainer

Atualização: 15/11/2026. Este é o ponto de entrada para Codex, Claude e os demais colaboradores.

## Produto e limites

A nova plataforma está em `nova-plataforma/` do repositório `portelarwh/vacutainer`. O aplicativo distribuído será `dist/Plataforma.html`. Ela precisa das fontes de `fontes/` e `paginas/` no mesmo checkout para compilar os motores atuais. Não copie só esta pasta para outro repositório esperando o mesmo build.

O uso continua por Chrome/Edge e pasta compartilhada, sem API ou servidor interno. O corte não foi executado. As bases de cada módulo, o cadastro, os cálculos e os contratos existentes são preservados.

## O que consultar e qual é o papel

| Documento | Papel |
|---|---|
| [AGENTS.md](../AGENTS.md) | Procedimento obrigatório para qualquer agente nesta pasta. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Regras de UX, componentes, cores funcionais, acessibilidade e aplicação da marca. |
| [BD_Dashboard_Brand_Guidelines.md](BD_Dashboard_Brand_Guidelines.md) | Referência de marca fornecida pelo responsável, adaptada do Template.pptx. Não é uma verificação do Maxwell. |
| [ARQUITETURA.md](ARQUITETURA.md) | Arquitetura implementada: casca, motores, exports, pasta, build e distribuição. |
| [ARQUITETURA-v1.md](ARQUITETURA-v1.md) | Requisitos desejados para evolução; não declara tudo implementado. O nome v1 não substitui a descrição técnica atual. |
| [REGRAS_DE_NEGOCIO.md](REGRAS_DE_NEGOCIO.md) | Proteção dos indicadores, investigação e autorização antes de mudar cálculos ou dados. Não é um catálogo completo de fórmulas. |
| [CONTRATO-MOTORES.md](CONTRATO-MOTORES.md) | API pública entre casca e motores. |
| [PLANO-DE-MELHORIAS.md](PLANO-DE-MELHORIAS.md) | Próximas entregas de layout, dependências e critérios de aceite. |
| [PENDENCIAS-DOCUMENTAIS.md](PENDENCIAS-DOCUMENTAIS.md) | Ambiguidades conhecidas que não autorizam alterar regras. |
| [CORTE.md](CORTE.md) | Homologação, instalação e retorno ao ponto de corte. |

A precedência é por assunto: marca corporativa vigente no Maxwell prevalece sobre a adaptação do PPTX; a aplicação visual segue o Design System; cálculos e dados continuam nas regras aprovadas e nos motores proprietários. Um documento de marca nunca autoriza mudar a classificação de uma perda ou o cálculo de um indicador. Instrução explícita do responsável tem precedência; registre novas decisões.

As auditorias em docs/auditorias/ e pr76/ são registros datados, não ordens para executar novamente seus planos. Documentos antigos da raiz precisam ser lidos com esse contexto. Não reabra um item recusado sem fato novo.

## Mapa de implementação existente

| Parte | Fonte a investigar antes de criar outra |
|---|---|
| Tokens BD e aliases funcionais | `src/design/brand.css` — importado pela casca e pela ponte dos motores. |
| Layout da casca e responsividade | `src/style.css`; preserva classes dos componentes existentes. |
| Indicadores da casca | `Metric` em `src/App.tsx`; extrair com paridade se uma próxima tela precisar reutilizá-lo. |
| Botão, ícones, selo, modal, vazio e gráfico | `src/components/ui.tsx`: Button, Icon, Badge, Modal, Empty e BarChart. |
| Abas e rolagem da aba ativa | `src/components/ModuleTabs.tsx`. |
| Módulo incorporado e ciclo de vida | `src/components/ModuleFrame.tsx`. |
| Ponte, links, sessão e conexão | `src/core/runtime.ts`; o contrato é vacPagina, não acesso a nomes internos pelo host. |
| Consulta e agregação já existentes | `src/core/data.ts`; não alterar neste lote visual. |
| Páginas e importadores | `src/core/modules.ts`; rótulos de abas vêm dos motores. |
| Motores operacionais | Fontes da raiz conforme o CLAUDE.md; a plataforma não mantém um snapshot antigo. |

Nunca edite `src/generated/` ou dist/ manualmente. São produtos do build. A biblioteca visual legada do kit continua sendo aplicada nos motores; a camada BD da plataforma adapta os tokens sem editar as regras nem as fontes desses motores.

## Ambiente e comandos

Na raiz do repositório, use Node 22 (o mesmo do CI), npm e Python 3.12. O checkout deve ter histórico Git completo.

```sh
npm install
npm ci --prefix nova-plataforma
npm run check:setup --prefix nova-plataforma
npm run dev --prefix nova-plataforma
```

Para compilar e verificar:

```sh
npm run build --prefix nova-plataforma
npm run test:all --prefix nova-plataforma
npm test
npm run test:reprodutibilidade --prefix nova-plataforma
```

Para navegar sem bases reais, abra o endereço mostrado pelo Vite com `?demo=1`. O arquivo .nvmrc desta pasta indica Node 22; o pacote exige Node 22 ou mais recente. Para testes/capturas, instale o Chromium do Playwright nesta pasta (`npx playwright install chromium`), como no CI.

O servidor do Vite é apenas de desenvolvimento. Não entra na implantação. Não acrescente CDN, fonte remota ou servidor necessário para operar o HTML distribuído.

Ao alterar telas, use `npm run build:capturar --prefix nova-plataforma`: ele compila, confere o artefato e renova as capturas reais do guia auxiliar com dados fictícios. O build normal é determinístico e recusa capturas antigas. O guia antigo da raiz permanece preservado até o corte.

## Forma de trabalho entre agentes

- Parta da main atual e use uma branch por entrega. Identifique os arquivos compartilhados antes de editar simultaneamente.
- Combine a propriedade de App.tsx, style.css, brand.css, ui.tsx e runtime.ts para não sobrescrever trabalho do outro agente.
- Uma entrega por jornada/tela; compare os mesmos dados antes e depois.
- Alterações visuais podem mudar cores, espaçamento e tipografia, preservando valores, filtros, seleção, IDs, eventos, permissões e persistência.
- Relate arquivos, testes, impactos, limitações e o que ainda é futuro. Não declare homologação em SMB ou duas estações com base apenas em OPFS.
