# Base limpa, carga por tabela e páginas sem cópia: desenho

Data: 24/11/2026 · Pedido do responsável · Aguardando aprovação · Continua o desenho [Administração central](2026-11-23-administracao-central-design.md) (o bloco 1 já entrou: PR #148 e o ajuste do PR #149).

## 1. Intenção

O responsável vai **apagar as bases e começar limpo**. Ele mesmo recadastra tudo na Administração, usando o que conseguir exportar das bases de hoje. Com isso:

- o código deixa de contornar dados antigos: sem leitores de formatos anteriores, migrações, importadores de uso único, sincronizações, valores de fábrica que escondem ausência e cópias de cadastro nas páginas. Isso vale também para o que o bloco 1 deixou;
- a Administração ganha **carga por tabela** para cada cadastro, com arquivo .xlsx/.csv ou com a tabela **copiada do Excel e colada** direto na plataforma. Assim, recadastrar é colar e conferir;
- a Produção, o Gel, o Waste, o Paradas, os Equipamentos e a Linha 360° passam a só ler o cadastro (`vacCad`), sem guardar cópia.

Em resumo: **um código liso, sem caminhos de versão, e a Administração como única fonte**, preenchida rapidamente por tabela.

## 2. Objetivos, não objetivos e fracasso

**Objetivos**
1. Nenhuma linha de compatibilidade com base, cadastro ou export de versão anterior, em nenhum bloco.
2. Todo cadastro da Administração pode ser carregado e atualizado por tabela (arquivo ou colagem), com prévia, e exportado no mesmo formato.
3. Nenhuma página guarda ou edita cadastro. O teste de contrato reprova cópia e tela de cadastro fora da Administração.
4. Sem cadastro, a página mostra o aviso de onde cadastrar e não calcula. Nunca aparece valor de fábrica nem zero.
5. Os números do motor (OEE, scrap, gel, waste) ficam iguais no cenário de demonstração antes e depois de cada bloco.

**Não objetivos**
- Mudar fórmulas, a interpretação de madrugada e turnos, a classificação de paradas, OSM/MES/AM/TPM ou Projetos (contrato 7).
- Importar as bases de hoje. Não existe "converter a base antiga": o responsável recadastra.
- Carga por tabela de dados do dia a dia (lançamentos, plano do mês, ordens). Só cadastro e configuração.
- Redesenho visual geral. As telas novas seguem a skill `padrao-visual`.

**Seria fracasso, mesmo funcionando**
- Qualquer `if` que trate "base antiga", "formato 1", "sem campo novo, usa o velho" ou nome sem ID.
- Um valor de fábrica aparecendo numa conta porque o cadastro faltou.
- A carga por tabela gravar sem prévia, apagar o que não veio na tabela ou alterar vigência já gravada.
- A Produção ou outra página mostrar um cadastro que não veio do `vacCad`.

## 3. Restrições

- Arquivo único `Plataforma.html`, com blocos `data-vac-source`, `npm run atualizar:metadados` e as suítes `npm test` (71) e `test:plataforma`.
- Continuam valendo os contratos 1 a 6, 8 e 9 do `CLAUDE.md`: dono único do cadastro; vigências imutáveis; leitura pela data do fato; códigos como texto; gravação com releitura, backup, fila e confirmação; Sev 1 e Sev 2; layout não muda números; pessoa = ID; backup diário.
- **Liberado pelo responsável (24/11/2026):** a base recomeça limpa. As estruturas das bases e do cadastro podem mudar sem preservar nada. As regras do `CLAUDE.md` que só existem por causa de dados antigos saem. Exemplos:
  - "registro antigo só com nome", no contrato 8;
  - o `registro-backup.log` legado, no contrato 9;
  - as normalizações de formatos anteriores.

  As normalizações SAP de dados que **entram** pelas importações do SAP continuam, porque tratam dado novo, não base antiga.
- Uma base ou um cadastro com versão anterior à do código **não abre para gravar**. A página mostra: "Base de versão anterior. Comece uma base nova nesta pasta." Base mais nova que o código continua bloqueada (contrato 4).
- Os testes rodam sem internet. O cenário `dados/cenario` é refeito a cada mudança de formato.

## 4. Caminhos considerados

**Ordem de trabalho.** Escolhida a **A, Produção primeiro**, em lugar de B, por assunto. O motivo é que a queixa do responsável e o maior risco de divergência estão na Produção. Com a base limpa, a ordem ficou: limpar tudo primeiro, depois a Produção, depois as outras páginas, depois Pessoas e Sistema.

**Como a Produção deixa de copiar** (escolhido pelo responsável: caminho 1):

| Caminho | Como | Troca | Decisão |
|---|---|---|---|
| **1. Tabelas do motor montadas na memória** | A Produção monta `lines`, `machines`, `families`, `catalogs`, `shifts`, `targets`, `downtimeCodes`, `calendar` e as configurações a partir do `vacCad` a cada leitura do cadastro, com IDs derivados do código. Nada disso é gravado na base. | O motor do OEE não muda; a prova de números iguais é direta. | **Escolhido** |
| 2. Motor lendo `vacCad` direto | Trocar as dezenas de leituras de `db.*` por `vacCad.*` | Mais limpo no papel, mas mexe no coração do cálculo em muitos pontos (risco ao contrato 7) | Descartado |
| 3. Manter a cópia gravada, só leitura | O `CadSync` continua | Barato, mas mantém a cópia | Descartado: contraria o objetivo 3 |

**Carga por tabela:**

| Caminho | Troca | Decisão |
|---|---|---|
| **Um importador genérico guiado pela definição do tipo** (`CAD_T` e as definições do Gel e dos parâmetros), estendendo o "Exportar para editar / Importar planilha" dos códigos de parada (`ParLote`, 1.9.81) | Uma tela e um código para todos os tipos; um tipo novo já nasce com carga | **Escolhido** |
| Um importador por tipo | Mais liberdade por tela, mas código repetido 20 vezes | Descartado |

## 5. Os blocos

Cada bloco entra num PR próprio. Cada um tem versão nova, Novidades, PENDENCIAS, cenário refeito, teste de contrato mais rígido e números iguais no cenário.

### Bloco 2 · Base limpa e carga por tabela

**Sai do código, em todos os blocos:**
- **Do bloco 1:** o importador de uso único (`ImportarV1`, a faixa `#cadV1`, a tela `importarV1`, a trava do formato 1 em `Cad.ops`), o `admNivelTransicao` e a regra de transição de perfis sem `assuntos`. A permissão passa a ser só o que está gravado no perfil. O `legado` dos locais de gel sai, e também o nome de reserva quando ele serve só para registro antigo.
- **"Trazer configurações das páginas"** (`TrazCfg` e a tela).
- Migrações e leituras de formato anterior em todos os motores, por exemplo:
  - `vigList` do gel com `gTubo` solto no catálogo;
  - `bomPct` antigo;
  - versões antigas de base aceitas com conversão.
  
  Todo `schemaVersion` aceita só a versão atual.
- **Valores de fábrica que mascaram ausência:** saem os do gel (`PROC_DEF`/`GEL_PROC_DEF`), cuja tela já existe. Os outros (`TAGS_PADRAO`, `DEFAULT_CAUSAS`, `DEFAULT_TIPOS`, remanescente e bomba do Gel, tamanho padrão do lote) saem no bloco em que a configuração deles chega à Administração (chamada 8 da seção 7). Sem cadastro, a página mostra o aviso e não calcula.
  
  **Ficam** os valores que são semente de uma base nova, oferecidos por botão e nunca usados em silêncio. É o caso de "Criar os perfis padrão" (`DEFAULT_PERFIS`).
- **Os testes de migração e de importação v1**, que saem junto com o código que testavam. Cada remoção de teste é listada no PR com o motivo.

**Entra:**
- **Carga por tabela** em cada cadastro da Administração: linhas, famílias, catálogos, materiais, BOM, equipamentos, componentes, modos de falha, turnos, códigos de parada, calendário, preços, câmbio, metas de OEE, metas da área, metas de OSM, programas, usuários, perfis, formatos do gel e locais de descarte.
  - **Entrada:**
    1. arquivo `.xlsx` ou `.csv`;
    2. **colar** a tabela copiada do Excel ou do Google Planilhas, com `Ctrl+V` numa área da tela. O texto vem separado por tabulação, e a primeira linha são os títulos.
  - **Modelo:** "⇩ Baixar modelo / Exportar para editar" gera a planilha com os títulos certos e uma aba "Campos" com o nome de cada coluna, o tipo e os valores aceitos. Aceita título técnico (`codigo`) ou rótulo da tela ("Código").
  - **Vigência:** cada linha da tabela é uma vigência (colunas `de` e `ate` e os campos dela). Itens com várias vigências repetem o código em várias linhas.
  - **Prévia antes de gravar:** cada linha aparece como novo, alterado (campo a campo, antes → depois), igual ou com erro, com o motivo. Só o que for marcado é gravado.
  - **Regras da prévia:**
    - nada é apagado: item fora da tabela não muda;
    - inativar só pela coluna `ativo`;
    - vigência já gravada nunca muda: a linha que tenta mudá-la vira erro, com o motivo "crie uma vigência nova";
    - referência a outro cadastro (família do catálogo, equipamento do local de gel, linha do turno) é validada contra o cadastro e contra as linhas novas da mesma carga;
    - pessoa só por ID (contrato 8).
  - **Gravação:** passa pelo `Cad.ops` de sempre (permissão por assunto, auditoria com motivo "carga por tabela", fila, releitura, backup).
  - **Ordem sugerida na tela Sistema › Carga por tabela**, que lista todos os tipos com o número de itens: planta e linha → produto → equipamentos → gel → turnos e metas → paradas e perdas → pessoas. A ordem existe porque uns tipos referenciam outros.
- **Aviso de base de versão anterior** em cada motor e no cadastro, com o texto da seção 3.
- `CLAUDE.md`, `AGENTS.md` e `docs/CONTRATO-MOTORES.md` dizem que **não se escreve compatibilidade com base antiga**, e as regras que só existiam por isso saem.

### Bloco 3 · Produção sem cópia (caminho 1)

- **Sai o `CadSync`.** Um montador (`ProdCad`) gera, só na memória e a cada leitura do cadastro, as tabelas que o motor já usa.
  - Os IDs são derivados do código e, se houver, da vigência: `line_<código>`, `fam_<código>`, `mac_<código>`, `cat_<código>_<de>`, `sh_<código>` com versões `sv_<código>_<de>_<dias>`, `dc_<código>` e `tg_<escopo>_<de>`.
  - Os lançamentos gravam esses IDs. Como eles são determinísticos, nenhum índice é guardado.
- A base da Produção deixa de conter `lines`, `machines`, `families`, `catalogs`, `shifts`, `targets`, `downtimeCodes`, a marca de calendário vinda do cadastro e `settings.*` de cadastro. Fica só o que se lança e planeja.
- **Configurações que ainda moram na Produção:**
  - **vão para a Administração:**
    - Planta e linha: unidade, setor, fuso, calendário aplicável, dias de trabalho do plano e descrição da linha;
    - Sistema › Parâmetros de cálculo: cobertura mínima, divergência máxima, modo da Performance, premissa de perda de velocidade, unidade de lançamento, casas decimais;
    - Equipamentos › Tags: o Mapa de tags;
    - Paradas e perdas › Listas: os Problemas de QN;
    - Turnos e metas › Hora extra: o máximo de hora extra;
  - **ficam na Produção como preferência:** abas, aparência e TV;
  - **ficam como infraestrutura:** base de dados, pasta, backup e importação.
- O Plano do mês passa a só ler o calendário (decisão 11 do inventário).
- **Prova:** o teste `prod-numeros` grava, antes da troca, o OEE, a disponibilidade, a performance, a qualidade, as paradas, o hora a hora, o SQDCP e os relatórios do cenário. Depois da troca, os números têm de ser iguais.

### Bloco 4 · Gel, Waste, Paradas, Equipamentos e Linha 360° sem cópia

- **Gel:** saem `S.catalogs` (gel por catálogo, BOM, formato, lote, velocidade), `S.config.prices`, `shifts`, `abDefault` e `abMotivos`. Lê catálogos, preços, câmbio, turnos e abonos por `vacCad`.
  - Ritmo e indicador relativo de scrap passam a ter tela na Administração › Gel. Hoje não têm tela e usam valor embutido.
  - As regras do estoque (modo da fila, barris, cabeçotes, remanescente, bomba, vencimentos) vão para Administração › Gel › Regras do estoque (decisão 2).
- **Waste:** `config.tipos` vira Produto › Materiais (tipos). Causas, limites, regra de sinal, KKBC, grupos de custo e moeda vão para Paradas e perdas › Waste. A regra de sinal não muda (contrato 7).
- **Paradas:** de-para de máquina e de tipo, matriz, microparada, parada longa e horas por dia vão para Paradas e perdas e Sistema › Parâmetros de cálculo, um valor só para todas as páginas. O código de parada ganha vigência e descrição (decisão 7).
- **Equipamentos:** TAGs e de-para MES ficam em Equipamentos. Os padrões AM/TPM ficam na página (decisão 6, TPM intocado).
- **Linha 360°:** a definição (pontos, equipamentos de cada ponto, postos, checklists) vai para a Administração. A posição na planta, as áreas e as fotos continuam como desenho na Linha 360° (decisão 1).
- Prova de números iguais por página: gel, waste e paradas.

### Bloco 5 · Pessoas e Sistema

- **Uma logo:** Sistema › Marca, com a pasta `Marca/` como fonte. Saem as quatro cópias (decisão 14).
- **Um semáforo, uma parada longa e um limite de microparada** em Sistema › Parâmetros de cálculo. A meta de OEE pode ter semáforo próprio, como hoje.
- Vocabulários fixos (status, prioridade e origem de ações; causas e tipos do Waste) viram listas editáveis da Administração (decisão 8).
- Preferências (abas, tema, TV, exibição) separadas de cadastro em todas as páginas. O nome do usuário vem do login.
- Teste de contrato no modo final: busca no código não acha cópia nem tela de cadastro fora da Administração.

## 6. Decidido pelo responsável

- Base apagada e recomeço limpo; o responsável recadastra tudo (24/11/2026).
- Nenhuma compatibilidade com versões anteriores, revisitando também o bloco 1 (24/11/2026).
- Ordem: limpeza → Produção → outras páginas → Pessoas e Sistema (24/11/2026).
- Produção: caminho 1, tabelas montadas na memória (24/11/2026).
- Carga por tabela para os cadastros, por arquivo ou por tabela colada do Excel (24/11/2026).
- **Recadastro só depois do bloco 5** (24/11/2026). Até lá os blocos 2 a 5 mudam o formato do cadastro e das bases livremente, sem compatibilidade entre eles. Os testes usam o cenário de demonstração ou pastas descartáveis. O tempo não é restrição; o que importa é a plataforma limpa.
- As 14 decisões do inventário (`docs/CONFIGURACOES.md`, 23/11/2026) continuam valendo, menos as que tratavam de dado antigo (10 e 12 perdem o objeto).

## 7. Chamadas minhas (a conferir)

1. A carga por tabela nunca apaga e nunca muda vigência gravada. Inativar é pela coluna `ativo`.
2. A colagem aceita texto separado por tabulação (Excel e Google Planilhas), com a primeira linha de títulos, técnicos ou rótulos.
3. Base de versão anterior não abre para gravar. A mensagem pede uma base nova, sem conversão.
4. Os IDs da Produção são derivados do código. Por isso nenhum índice fica gravado.
5. `DEFAULT_PERFIS` fica como semente por botão. Os outros valores de fábrica saem.
6. A tela Sistema › Carga por tabela mostra a ordem sugerida e o número de itens de cada tipo.
7. O nome de reserva do local de gel no registro de scrap fica. Ele é a regra "quem grava guarda o nome ao lado do ID", útil quando um local é excluído do cadastro, e não compatibilidade. O `legado` sai.
8. **Valor de fábrica sai no bloco em que a configuração dele chega à Administração**, e não antes. No bloco 2 saem só os padrões cuja tela já existe na Administração (gel: `PROC_DEF`/`GEL_PROC_DEF`). `TAGS_PADRAO` sai no bloco 3. `DEFAULT_CAUSAS`/`DEFAULT_TIPOS` e os padrões do estoque do Gel saem no bloco 4. Assim nenhuma função fica parada entre blocos.
9. **Código de cadastro é imutável depois de criado e nunca é reaproveitado.** Na Administração, o código não se edita. Item desativado continua ocupando o código. Caracteres aceitos: letras, números, `-`, `_` e `.`. É o que garante os IDs derivados da Produção sem índice.
10. **Parâmetros duplicados unificados:** no cenário, o valor único é o que a Produção usa hoje. Se outra página usava outro valor, a diferença nos números dela é a única exceção aceita na prova, listada no PR com o antes e o depois.
11. **Referência dos números iguais:** antes de cada bloco, o cenário recebe no cadastro, como vigência explícita, os valores que hoje vêm de padrão embutido. A referência é gravada com o código atual sobre esse cenário, e o código novo tem de dar igual.
12. **Usuários por tabela:** a carga cria e atualiza dados da pessoa (ID, nome, perfil, turno, área). Nunca grava senha. A pessoa define a senha no primeiro acesso, pela transação restrita de conta própria (contrato 4).
13. **Export de outro motor com versão anterior:** quem lê não bloqueia. Avisa "dados de <página> em versão anterior" e não usa o dado, porque ausência não é zero (contrato 1). Ele é a regra "quem grava guarda o nome ao lado do ID", útil quando um local é excluído do cadastro, e não compatibilidade. O `legado` sai.

## 8. Fica para quem constrói

- O nome exato de cada coluna e o texto da aba "Campos" de cada tipo, a partir de `CAD_T` e das definições do Gel e dos parâmetros.
- A lista exata das migrações e leituras antigas a remover, por busca no código, conferida contra este desenho.
- O desenho das telas novas (carga por tabela; campos que vêm da Produção), seguindo `padrao-visual`.
- Os testes de cada bloco, escritos antes da mudança e falhando primeiro.
