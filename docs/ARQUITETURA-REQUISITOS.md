# REQUISITOS DE ARQUITETURA — VACUTAINER

> Requisitos desejados para a evolução. A implementação atual está em [ARQUITETURA](ARQUITETURA.md); este documento não declara nada como implementado.

## 1. Objetivo
Transformar o Vacutainer em uma plataforma industrial integrada, modular, rastreável e escalável.

Este documento estabelece os requisitos arquiteturais desejados. Não presume que todas as funcionalidades descritas já estejam implementadas.

## 2. Identificadores centrais
Ordem de produção e lote são os principais identificadores de rastreabilidade.

Antes de alterar relacionamentos, verificar como os identificadores são representados no código e se são únicos no contexto apropriado.

## 3. Integração obrigatória
Informações relacionadas a uma ordem ou lote devem estar disponíveis aos módulos autorizados.

Módulos relevantes:
- Portal
- Produção
- OEE
- Paradas
- Perdas
- Equipamentos
- Relatórios
- Projetos
- Iniciativas
- Ações

Não criar armazenamento paralelo sem justificativa técnica e aprovação.

## 4. Fontes de informação
Existem duas fontes principais:
1. Apontamentos manuais dos operadores.
2. Dados reais importados do servidor.

Preservar a origem dos registros.
Permitir conciliação e identificação de divergências.
Não sobrescrever apontamentos sem regra de negócio aprovada.

## 5. Rastreabilidade contextual
Ao selecionar uma ordem, lote ou equipamento, o sistema deve permitir recuperar os registros relacionados, respeitando permissões.

Investigar componentes compartilhados para painéis laterais, consultas e navegação contextual.

## 6. Produção e indicadores
Os registros de caixas e seus horários permitem reconstruir a produção hora a hora.

OEE, eficiência e outros indicadores devem utilizar regras de negócio consistentes.

Não modificar fórmulas ou motores de cálculo sem autorização explícita.

## 7. Portal
A visão gerencial deve permitir consultar:
- Ordem e lote atuais.
- Histórico de produção.
- Início e duração.
- Quantidades e indicadores.
- Paradas e perdas.
- Previsão de término, quando tecnicamente viável.

Estimativas devem ser identificadas como estimativas.

## 8. Trocas de lote
Registrar e analisar intervalos entre a última caixa de um lote e a primeira do seguinte.

Não classificar automaticamente o intervalo como setup sem validar sua causa.

## 9. Equipamentos
Relacionar equipamentos a ordens, lotes, catálogos, paradas, falhas, iniciativas e ações, conforme dados disponíveis.

## 10. Separação de responsabilidades
Manter separadas, quando tecnicamente adequado:
- Camada de dados.
- Regras de negócio.
- Serviços e integração.
- Componentes visuais.
- Preferências dos usuários.
- Autenticação e permissões.

### Fontes modulares e HTML de distribuição

Separar as fontes por responsabilidade e gerar um único `Plataforma.html` com o código e as bibliotecas incorporados para uso offline. Preservar os IDs `data-vac-source`, a ordem de inicialização, o encoding, as licenças e os contratos dos motores na primeira extração. Manter o caminho da raiz durante a transição. Após o aceite do corte, publicar `dist/Plataforma.html` como ativo de release e editar somente as fontes.

O primeiro lote pode extrair `modulo/core/text`, cujo utilitário `replaceOnce` é consumido pela integração da casca. A montagem deve reutilizar a codificação de `scripts/html.cjs`, exigir um único marcador por fonte e falhar antes de substituir o artefato se o template estiver inconsistente. No mesmo lote, encaminhar as escritas de `scripts/bloco.mjs` e a atualização de metadados às fontes correspondentes.

| Blocos da plataforma atual | Fronteira a preservar durante a extração |
|---|---|
| `modulo/App`, `modulo/main`, `modulo/components/*` | Casca, navegação e componentes. A casca consulta os motores pelo contrato `vacPagina`. |
| `modulo/core/*`, `comum/bases`, `comum/interface` | Escopo por pasta, permissões, fila, contrato dos motores e registro de backup. Os três fragmentos `comum/bases`, `comum/interface` e `comum/visual` alcançam os nove motores. |
| `motor/*` | Cálculos, jornadas e bases operacionais por domínio. A Administração é dona do cadastro oficial. Produção grava sua base e a de ordens. Os consumidores leem pelo contrato versionado. |
| `css/*`, `modulo/design/marca`, `recurso/*` | Estilos e ativos. A localização operacional das fontes e logos está no [contrato de marca](MARCA.md). |
| `vendor/*`, `biblioteca/*`, `celular/*`, `ferramenta/*`, `dados/*` | Bibliotecas com licenças, apps móveis autorizados, ferramentas internas, metadados e demonstração fictícia. |

O catálogo de retirada de leitores, aliases e formatos do trabalho de Base limpa está na [PR #149](https://github.com/portelarwh/vacutainer/pull/149). Reconciliar seu estado antes do corte para reaproveitar a implementação e conservar os vínculos históricos. Manter a fila, a releitura, o bloqueio por versão, o backup e a confirmação de gravação até validar seus substitutos.

Gerar duas saídas em diretórios limpos e comparar ambas, byte a byte, com o HTML do commit-base que já incorpore a Base limpa. Rodar os testes de plataforma, motor e abertura offline sobre a saída gerada. Em checkout descartável, reverter o commit de extração e verificar novamente o hash integral do artefato de referência. Registrar a revisão, os hashes e os resultados na [Issue #151](https://github.com/portelarwh/vacutainer/issues/151).

## 11. Escalabilidade
Novos módulos devem reutilizar identificadores, contratos de dados e componentes existentes.

Evitar dependências diretas desnecessárias entre páginas.

## 12. Auditoria antes de alterações
Antes de implementar mudanças estruturais:
1. Identificar onde os dados são criados.
2. Localizar armazenamento e funções.
3. Mapear consumidores e dependências.
4. Verificar impactos em outros módulos.
5. Propor a solução.
6. Obter autorização para mudanças de regras ou estrutura.
7. Validar a integração e possíveis regressões.

## 13. Documentação
Registrar decisões arquiteturais aprovadas.
Não apresentar funcionalidades planejadas como implementadas.
