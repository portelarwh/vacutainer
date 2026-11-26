# H01 · Plano para unificar o código repetido (auditoria 26/11/2026)

**Situação medida:** 132 nomes de topo aparecem em mais de um bloco (336 KB redundantes): `esc` ×8, `Store` ×7, `TV` ×4, `Busca`, `VacEntrar`, `renderSysNav`, `DEFAULT_SYSTEMS`, `PAGE`. Cada motor é uma página com `<script>` próprio e carrega o kit (`comum/interface`, `comum/bases`) por cópia, o que o cabeçalho "igual em todas as páginas" já avisa.

**Decisão do responsável (26/11/2026):** unificar. Regra: nenhuma fórmula, base ou contrato muda; cada etapa é só mover código idêntico para o kit.

## Etapas (da menos para a mais arriscada)
1. **Funções puras idênticas** (`esc`, `escAttr`, formatadores): provar identidade byte a byte entre as cópias (`scripts/auditoria/estrutura.cjs`), manter uma no kit e apagar as outras. Teste: `base-limpa`, `prod-numeros` e a varredura de HTML escapado.
2. **Constantes de cadastro** (`DEFAULT_SYSTEMS`, `PAGE`): ler do cadastro/kit em vez de repetir.
3. **Componentes de tela** (`TV`, `Busca`, `VacEntrar`, `renderSysNav`): extrair para `comum/interface` com o mesmo contrato `vacPagina`; uma página por vez, com `padrao-visual` para conferir.
4. **`Store`** (7 cópias): só depois de um teste de contrato que compare as sete; é a etapa de maior risco (gravação, filas, backup: contratos 3 e 9).

## Pré-requisito técnico
Um mecanismo de injeção do kit em cada página no carregamento (hoje cada cópia é literal). Desenhar primeiro e provar com uma página (Gel) antes das demais.

## Não feito ainda
Nenhuma linha de código foi movida neste lote; o objetivo foi medir, ordenar e fixar a regra. Primeira entrega sugerida: etapa 1, em PR próprio.
