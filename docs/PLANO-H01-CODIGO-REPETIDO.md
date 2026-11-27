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

## Andamento
- **Etapa 1, `esc` (plataforma 1.8.88):** o mecanismo de injeção já existia (cada motor inclui `@@vac:comum/bases@@` antes do próprio script). `vacEsc` ficou em `comum/bases` e os nove motores usam `const esc = vacEsc`. Identidade provada no teste `h01-esc` (as três formas antigas e `vacEsc` dão a mesma saída; nenhum motor guarda cópia; em cada página `esc === vacEsc`). Ficaram de fora, por não carregarem o kit: apps de celular, `ferramenta/*` e a casca (`modulo/core/data`).
- **Etapa 1, sistema e pessoa (plataforma 1.8.90):** `VAC_NOMES_V2`, `VAC_OUTROS_V2`/`vacEhOutros`, `vacNomeSis`, `vacUsuario`, `vacPerfil` e `vacNomeUsuario` (linhas idênticas nos nove motores) foram para `comum/bases`, logo depois de `vacCad`; teste `h01-esc` estendido.
- **Etapa 1, semáforo (plataforma 1.8.91):** `vacSemaforo` foi para `comum/bases`. Comparando o corpo inteiro, oito motores tinham a mesma versão e a Produção uma variante que ignorava `parametros.semaforoAmarelo === false` ("Usar amarelo" desmarcado); essa cópia não era chamada em lugar nenhum (só o Waste usa `vacSemaforo`), então a unificação na versão dos oito não muda o comportamento. Ferramenta de comparação: corpo inteiro com casamento de parênteses e chaves (a primeira tentativa comparou só a assinatura por causa do parâmetro desestruturado `{inverso=false}`).
- **Etapa 1, preferências e aviso (plataforma 1.8.92):** `LS_TEXTO`/`LS`, `toast` e `user` eram cinco linhas idênticas em Paradas, Equipamentos, Iniciativas, Linha 360° e Projetos; foram juntas para `comum/bases` como `VAC_LS_TEXTO`, `vacLS`, `vacToast` e `vacUser` (dependem umas das outras), e esses motores usam `const LS=vacLS;` e `toast()`/`user()` como funções que delegam ao kit (continuam globais em `window`, porque há teste que intercepta `window.toast`; um `const` deixaria o nome fora de `window`). Nomes com prefixo porque Administração, Produção, Waste e Gel têm `LS`, `toast` e `user` próprios e diferentes, que ficam como estão. `vacToast` usa `document.querySelector('#toasts')` em vez do `$` do motor. Teste `h01-esc` estendido (gravação e leitura em texto e JSON, valor padrão, aviso normal e de erro).
- **Próximo da etapa 1:** `sysHref` e `vacPode` têm duas variantes (Administração ou Produção diferem): decidir antes se a diferença é intencional; `LS`/`toast`/`user` da Administração, Produção, Waste e Gel são diferentes por desenho e ficam fora.
