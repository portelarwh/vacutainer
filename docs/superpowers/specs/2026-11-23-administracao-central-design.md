# Administração central: desenho

Data: 23/11/2026 · Pedido do responsável · Caminho escolhido: **A** (reorganizar por assunto dentro de `Plataforma.html`, sem HTML novo).

## 1. Intenção

Quando as páginas separadas (Produção, Gestão de Gel, Waste, Paradas…) viraram um arquivo só, as configurações foram juntadas de forma resumida. O detalhe se perdeu e o mesmo dado passou a existir em mais de um lugar. Exemplo do responsável: no Gel antigo havia uma cadeia clara:

**formato do tubo com vigência** (peso de cada componente) → **composições** calculadas (Tubo completo, Tubo + gel, Tubo + gel + spray, Gel puro, Barril) → **equipamentos / locais de descarte** que usam uma composição → **scrap** lançado no local certo.

Hoje essa cadeia existe no código, mas espalhada: o formato está em Administração › Parâmetros › Gestão de Gel, os descartes dentro da ficha de cada equipamento e o gel de cada produto dentro da ficha do catálogo. Além disso, o Gel ainda guarda uma cópia própria de parte disso.

O que o responsável quer:
- **tudo o que é configuração ou cadastro** (item, produto, catálogo, formatos, turnos, metas, paradas, motivos, pessoas, parâmetros) fica **na Administração**, no detalhe e organizado por assunto;
- **todas as páginas, atuais e futuras, só leem** o que sai da Administração; nenhuma página guarda cópia nem tem tela para editar cadastro;
- **o código fica limpo**: cada passo remove o caminho antigo, sem conviver com duas versões.

## 2. Objetivos, não objetivos e o que seria fracasso

**Objetivos**
1. Uma fonte única de cadastro e configuração, gravada só pela Administração.
2. A Administração organizada por assunto, com cada cadeia inteira numa tela (ex.: Gel: formato → composições → locais de descarte), recuperando o detalhe das páginas antigas.
3. Um leitor único e comum (`vacCad`, em `comum/bases`) que todas as páginas usam: lista, item por código e **valor vigente na data do fato**.
4. As páginas param de copiar o cadastro para a própria base. Com isso somem CadSync, "Trazer configurações", `S.config`/`S.catalogs` de cadastro no Gel e os avisos de "só nesta página".
5. Um teste de contrato que reprova qualquer página que grave ou guarde cadastro fora da Administração.

**Não objetivos**
- HTML novo ou reescrita das páginas de processo (Produção, Gel, Waste, Paradas…): elas só passam a ler de outro lugar.
- Mudar fórmulas, a interpretação de turnos e madrugada, ou a classificação de paradas. Os parâmetros mudam de lugar, não de efeito.
- Redesenho visual geral. A Administração nova segue a skill `padrao-visual`.

**Seria fracasso, mesmo funcionando**
- O mesmo dado editável em dois lugares, ou uma página mostrando valor que não veio da Administração.
- Camadas de compatibilidade que ficam "por enquanto" (leitor antigo e novo convivendo, campos com dois nomes).
- Detalhe do sistema antigo perdido de novo (ex.: composição resumida a um número).

## 3. Restrições

- Continua um arquivo único (`Plataforma.html`), com blocos `data-vac-source`, `npm run atualizar:metadados` e os testes de `npm test` e `test:plataforma`.
- Contratos do CLAUDE.md continuam valendo: vigências gravadas são imutáveis (desativa e cria nova); leitura pela data do fato; códigos como texto; pessoa = ID; gravação com releitura, backup, fila e confirmação; base mais nova que o código impede escrita.
- **Liberado pelo responsável (23/11/2026):** mudar a estrutura das bases de cadastro e de configuração sem preservar dados antigos. A plataforma ainda não foi compartilhada e os dados atuais podem ser importados de novo. Isso autoriza a exceção ao contrato 7 ("estruturas de base") **só para cadastro e configuração**. Lançamentos, eventos e fórmulas não mudam.
- Os testes rodam sem internet. O cenário de demonstração (`dados/cenario`) é refeito a cada mudança de formato (`node scripts/cenario-demo.cjs --gravar`).

## 4. Caminhos considerados

| Caminho | Como | Troca | Decisão |
|---|---|---|---|
| **A. Reorganizar por assunto no arquivo atual** | inventário → fonte única + leitor comum → refazer a Administração assunto por assunto; ao fim de cada assunto, a página correspondente deixa de ter cópia | mantém login, backup, filas e auditoria que funcionam; cada passo é testado e entregue | **escolhido**, com a condição de não poluir o código |
| B. HTML novo começando pela Administração | arquivo novo, módulos refeitos um a um | começo limpo, mas dois sistemas por muito tempo e todos os 9 módulos refeitos | descartado: custo e período com dados divididos |
| C. Módulo de Administração novo no mesmo arquivo | Administração escrita do zero, grava o mesmo cadastro | mais limpa que A, mas refaz login, backup, auditoria e filas | vira recurso pontual: se a tela de um assunto não tiver conserto, só aquele assunto é refeito do zero |

## 5. Decisões de como (chamadas minhas, a conferir)

1. **Fonte única:** `vacutainer-cadastros.json`, dono Portal/Administração, ganha o **formato v2**: nomes em português, um nome por campo, vigências no mesmo formato em todos os tipos (`de`, `ate`, `motivo`, `por`). Parâmetros e configurações que hoje ficam em `parametros.*`, `settings.*` (Produção) e `S.config` (Gel) passam a ser seções nomeadas por assunto.
2. **Leitor único `vacCad`** (em `comum/bases`), a única porta de leitura das páginas:
   - `vacCad.lista(tipo, {ativos, data})`, `vacCad.item(tipo, codigo)`, `vacCad.vigente(tipo, codigo, data)`, `vacCad.param(caminho, data)`;
   - derivados calculados num lugar só, por exemplo `vacCad.gel.composicao(formato, comp, data)`, que dá os gramas por tubo de cada composição a partir dos componentes vigentes;
   - avisa quando o cadastro falta ou tem versão incompatível; nunca devolve zero no lugar de ausência (contrato 1).
3. **Páginas sem cópia:** lançamentos e eventos guardam só o **código** (e a data do fato). O valor é lido pela vigência. Onde um número precisa ficar congelado no fechamento (relatório já emitido), ele é gravado como **resultado** do fechamento, não como cópia do cadastro.
4. **Administração por assunto** (ordem do menu):
   1. **Planta e linha:** unidade, setor, fuso, linhas, calendário de produção.
   2. **Produto:** famílias, catálogos (tubo e preparação), materiais, BOM, gel do produto (gel aplicado, BOM SAP, tolerância).
   3. **Gel:** formatos do tubo com vigência (componentes) → composições (calculadas, visíveis) → embalagem, folha da purga, sobra do barril → locais de descarte por equipamento (composição, categoria, motivos aceitos, ordem no registro).
   4. **Equipamentos:** equipamentos, componentes, modos de falha, dados técnicos, de-para MES.
   5. **Turnos e metas:** turnos por vigência (pausas, dias, pedaço final), metas de OEE, meta do dia, hora extra.
   6. **Paradas e perdas:** códigos de parada (com edição em lote e importação), motivos de abono e de "sem produção", motivos de waste/MUV e de gel.
   7. **Pessoas e acesso:** usuários, perfis, permissões, layout padrão.
   8. **Sistema:** parâmetros de cálculo (semáforo, microparada, parada longa), servidor/MES, backup, programas de melhoria, TV, páginas e versões.
5. **Código limpo:** cada etapa entra num PR que **remove o caminho antigo na mesma entrega** (tela, cópia, sincronização e campos velhos). Não fica leitor duplo nem campo com dois nomes. A cada etapa, o teste de contrato fica mais rígido.
6. **Dados atuais:** um importador de uso único na Administração ("Importar das bases atuais") lê o cadastro atual e as cópias das páginas e monta o formato v2, com prévia. Ele sai do código na etapa final. Se o responsável preferir recadastrar, o importador pode nem ser feito.
7. **Referência do detalhe perdido:** as páginas antigas estão no histórico do Git (ex.: `paginas/Gestão-Gel-Vacutainer.html`) e no HTML do Gel de 12–13/11 do responsável. Cada assunto começa comparando a tela antiga com a atual, item por item.

### Chamadas minhas depois da leitura do revisor (a conferir)

8. **Configuração × dado do dia a dia:** vai para a Administração o que **define** como a linha funciona (cadastros, vigências, parâmetros, metas-padrão, motivos, calendário). O que se **lança ou planeja** no dia a dia continua na página dona: plano do mês, abastecimento e estoque do gel, lançamentos, ordens. Quem planeja não precisa de acesso à Administração.
9. **Permissão por assunto:** cada perfil ganha "pode editar" por assunto da Administração (Gel, Turnos e metas, Paradas e perdas…). Os perfis iniciais repetem o acesso de hoje, então ninguém perde o que já faz. Entra na etapa 1, junto com o menu por assunto.
10. **Códigos não mudam:** o formato v2 muda nomes de campos e a organização, mas não os **códigos** de catálogo, equipamento, turno ou parada, que são códigos do negócio. Por isso os lançamentos existentes não precisam de remapeamento. Valores já gravados em lançamentos e ordens (ex.: `metaG`, `bomG`, `gPorTubo` nas ordens do Gel) ficam como estão: são o resultado daquele momento.
11. **Exports:** cada página exporta só os próprios resultados. Valores de cadastro deixam de viajar nos exports, e quem precisar deles lê por `vacCad`. A versão do export sobe quando um campo sai.
12. **Fechamentos:** nenhuma estrutura nova de "número congelado". Como as vigências são imutáveis, a leitura pela data do fato dá os mesmos números. Comparação da etapa 2: o scrap de gel do cenário com os mesmos gramas e quilos antes e depois.
13. **Apps de celular:** Meu Turno e Manutenção passam a ser gerados a partir do formato v2 na etapa do assunto de que dependem (turnos e pessoas; equipamentos). Os testes `mt-celular` e `man-celular` acompanham.

## 6. Etapas

| Etapa | Entrega | Pronto quando |
|---|---|---|
| **0. Inventário** | `docs/CONFIGURACOES.md`: cada configuração existente (página, campo, onde se edita, quem lê, cópias, o que havia na página antiga) e o destino no formato v2 | o responsável conferiu a lista |
| **1. Fundação** | formato v2 do cadastro, `vacCad` com testes, menu da Administração por assunto (os oito assuntos, ainda apontando para as telas atuais) | testes do leitor passam; nenhuma página mudou de comportamento |
| **2. Gel** (o exemplo do responsável) | tela Gel completa (formato → composições → locais de descarte); Gel e scrap de gel da Produção leem por `vacCad`; somem `S.config`/`S.catalogs` de cadastro no Gel e a parte de gel do "Trazer" | scrap de gel com os mesmos números do antigo no cenário; nenhuma cópia de cadastro no Gel |
| 3. Produto | famílias, catálogos, materiais, BOM, gel do produto | Produção, Gel e Waste leem catálogos só por `vacCad` |
| 4. Equipamentos | equipamentos, componentes, modos de falha | Equipamentos, Linha 360 e Produção sem cópia |
| 5. Turnos e metas | turnos, metas, hora extra, calendário | CadSync da Produção removido |
| 6. Paradas e perdas | códigos, motivos | Paradas e Waste sem cópia |
| 7. Pessoas e sistema | perfis, parâmetros, servidor, TV, backup | `settings.*` de configuração fora das páginas |
| **8. Limpeza** | remove importador, "Trazer configurações", campos v1, avisos de "só nesta página"; teste de contrato no modo final | busca no código não acha cópia nem tela de cadastro fora da Administração |

Cada etapa segue o fluxo de sempre: versão nova, Novidades, PENDENCIAS, testes, cenário refeito, PR e merge. As etapas 0 a 2 são o primeiro bloco. Depois de entregues, o responsável confere antes de seguir.

## 7. Fica para quem constrói

- Nomes exatos dos campos do formato v2 e o desenho de cada tela (seguindo `padrao-visual` e o detalhe das páginas antigas).
- Se a Linha 360 (pontos, áreas, planta) é configuração da Administração ou continua na própria Linha 360 como desenho do mapa. O inventário propõe e o responsável decide.
- A ordem das etapas 3 a 7 pode mudar conforme o que o inventário mostrar sobre dependências.
