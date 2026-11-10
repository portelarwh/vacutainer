# Briefing 09/11/2026 · Fase 0 (respostas e bugs) e proposta da Fase 1

Resposta ao "Briefing de alterações — Plataforma de Gestão de Produção" (versão final consolidada).
Cada item cita o ID do briefing. Nada da Fase 1 em diante foi implementado: esta é a proposta para aprovação.

**Feito nesta entrega:** POR-04 (Portal 1.9.5). **Respondido sem código:** seção 10 inteira e POR-09.
**Bloqueado por decisão do usuário:** ARQ-09 e as regras de turno (D1–D9, no fim do documento).

---

## 1. Respostas da seção 10

### 1.1 POR-01 · O que é "Onde é usado / ligações" (ficha do cadastro, Portal)

É a lista dos registros do cadastro que apontam para o registro aberto. Sai da função `cadUsos()` no `Portal.html`, que procura nos outros tipos quem usa o código. Cada item é um botão que abre a ficha daquele registro. O bloco só aparece se houver pelo menos uma ligação.

| Ficha aberta | O que aparece em "Onde é usado / ligações" |
|---|---|
| Equipamento | componentes desse equipamento (`EQ01-C01`…) e códigos de parada cuja matriz inclui o equipamento ("Máquinas onde aparece") |
| Linha | catálogos, equipamentos e turnos da linha |
| Família | catálogos da família |
| Catálogo | BOM do catálogo e, se for preparação de aditivo, o material e as BOMs que o consomem |
| Material | catálogo de preparação equivalente e BOMs que usam o material (inclusive como alternativo) |
| Turno / Perfil | usuários daquele turno / perfil |

Para que serve: antes de desativar ou mudar um registro, mostra o que será afetado. Exemplo: desativar o equipamento `EQ03` mexe nos códigos de parada que só aparecem no formulário dele.

O que ele **não** mostra: lançamentos das outras páginas (paradas apontadas, ordens, scrap do Gel). Isso fica na base de cada página, e o Portal não varre bases alheias (regra 1 do `CLAUDE.md`). Proposta para o ⓘ da tela: *"Registros do cadastro que usam este código. Não inclui lançamentos das páginas (paradas, ordens, gel). Confira aqui antes de desativar."* Entra junto com UX-01 (Fase 7) ou antes, se você quiser.

### 1.2 POR-03 · Código de parada × Modo de falha

| | Código de parada (`paradas`) | Modo de falha (`modosFalha`) |
|---|---|---|
| Pergunta que responde | **Por que a linha parou?** Em que pilar do OEE a perda entra | **Como a peça falhou?** |
| Quem aponta | operador, na hora da parada (Produção / formulário do Paradas) | técnico ou engenharia, depois, na **parte técnica** da parada (Paradas › evento) |
| Exemplo | `FME` · falha mecânica, pilar D | `MF03` · desgaste, no componente `EQ02-C04` (rolamento) |
| Entra no OEE? | sim: define D, P, Q ou U (`pilar`, `classe`) | não: serve para análise de confiabilidade (MTBF, Pareto de falhas, plano de manutenção) |
| Obrigatório? | sim, em toda parada | só faz sentido em quebra (houve troca ou conserto de peça) |

Na prática, uma parada tem **um** código (a categoria da perda). Se for quebra, ela ganha também componente + modo de falha + ação executada. Exemplo: código `FME` (falha mecânica) → componente "rolamento do cabeçote" → modo "desgaste" → ação "troca". O texto de ajuda na tela (`AJUDA_CAMPO['modosFalha.nome']`) já diz "Como a peça falhou… Usado no Paradas", mas não faz o contraste. Proposta: colocar o quadro acima, resumido, no ⓘ das duas categorias (Fase 7, UX-01).

### 1.3 POR-06 · Já existe resumo por período?

Sim, em três lugares, mas **nenhum na Visão Geral do Portal**:

1. **Produção › Visão Geral / Paradas / Histórico**: barra de filtros com "Período rápido": Semana atual, Semana anterior, 7 dias, 30 dias, Mês atual, Mês anterior e Ano fiscal, além de datas livres. Não tem "Hoje" nem "Ontem" como botão.
2. **Produção › Painel**: os mesmos períodos, mais "Personalizado".
3. **Portal › Reunião diária**: escolha de **um dia** (‹ › e calendário) e do recorte (dia inteiro ou um turno). Tem "Ontem", mas não semana nem mês.

A Visão Geral do Portal mostra os `kpis` que cada página publica no `exports`, **cada um com o período que a página escolheu** (ver POR-09). Por isso ainda não dá para ter um seletor ali: a Visão Geral não recalcula (regra 1). O caminho para isso está no item 2.2.

### 1.4 POR-07 · "Fotografar números" (Portal › Reunião diária)

Grava os seis números da tela naquele instante (OEE, produzido, paradas, gel disponível, waste e ações), com data, hora e quem gravou, **junto da pauta daquele dia e recorte**, no `portal-base.json › reunioes`. Abaixo dos cards aparece a linha "Fotografia de dd/mm hh:mm por Fulano: OEE 74,2% · …".

Para que serve: os números das páginas mudam depois da reunião (lançamento atrasado, reimportação do SAP, scrap reclassificado). A fotografia registra **com que números a decisão foi tomada**. Não altera nenhuma base, não substitui os números atuais e pode ser tirada de novo (a nova sobrescreve a anterior daquela pauta). Proposta para UX-01: deixar o ⓘ com essa explicação (hoje só existe o `title` do botão).

### 1.5 POR-10 · Por que o CSV com produção antes das 06:00 não alimenta os turnos

A hipótese do briefing está certa, com um detalhe que explica quando a produção **some**.

1. A Produção trabalha em **minutos desde 00:00 da data operacional** (`fontes/producao/OEE-base-2.0.html`, `U.toMin`): o Turno C de 31/10 vai de 1367 (22:47) a 1800 (06:00 de 01/11). As caixas de 01/11 às 03:00 pertencem ao **dia operacional 31/10**, e não a 01/11.
2. O CSV do servidor (`ServerData`) não "entra" num turno por si só. Na sugestão do dia (`daySuggest`), as caixas são contadas **só dentro dos intervalos dos turnos lançados naquele dia** (`countWindow(base + iv.start, base + iv.end)`).
3. Se o Turno C **não está no dia** (desativado, sem vigência, fora dos dias da semana da vigência ou marcado "sem produção"), as caixas de 22:47 a 06:00 não caem em intervalo nenhum. Elas ficam na base (`server.segments`), mas não viram produção de turno. Aparecem só como "caixas fora dos turnos lançados" nas divergências.
4. Um caso que pega: o cadastro novo de turno no Portal vem com `dias: [1..6]` (segunda a sábado). Com isso, o C de **domingo** não existe, e a madrugada de domingo para segunda (que é dia operacional de domingo) fica sem turno.

Correção: entra na Fase 2, junto com TUR-01. A regra de reatribuição decide para qual turno produtivo vão as caixas fora de janela, em vez de deixá-las sem turno. Antes disso é preciso responder D1 (item 4).

### 1.6 UX-04 · "Cadastro rev XXX"

**(a) O que é:** o número da **revisão do cadastro geral** (`vacutainer-cadastros.json › rev`). Cada gravação feita no Portal (qualquer mudança em turno, catálogo, meta, parada…) soma 1. Junto vão `revId` (identificador único), `revAt` (quando) e `revBy` (quem).

**(b) De onde vem e quando muda:** só o Portal grava esse arquivo. As outras páginas leem quando abrem, quando você clica em ↻ Sincronizar ou quando volta para a aba (`vacAoVoltar`). A Produção, ao ver uma rev nova, aplica o cadastro na própria base (`CadSync`) e avisa "Cadastro do Portal (rev N) aplicado".

**(c) Por que difere entre as páginas:** há três causas, nesta ordem de probabilidade:

1. **Hora em que cada página leu.** Uma aba aberta de manhã continua mostrando a rev da manhã até reler. Se você gravar no Portal às 10h, as abas abertas antes mostram a rev antiga.
2. **Fonte diferente.** O Paradas mostra "· cópia local" quando não conseguiu ler da pasta e usou a cópia do navegador (`localStorage['vac.cadastros']`), que é a última que **qualquer** página gravou ali.
3. **Confusão com outro número.** O selo de situação da Produção mostra "Base conectada · **rev 412**". Esse é o `databaseVersion` da **base da própria Produção**, que sobe a cada lançamento. Não tem relação com o "Cadastro rev 7" ao lado. Gel, Waste e as outras páginas também têm a "rev" da própria base.

**(d) Indica problema?** Só no caso 1 com a diferença persistindo depois de reler (↻), ou no caso 2 ("cópia local"), que quer dizer que a página não conseguiu ler o arquivo na pasta. No caso 3 não há problema nenhum.

**Proposta (validar):**
- Só **uma** pílula com o mesmo texto em todas as páginas, vinda do kit (`kit_v21.js`), e não três implementações diferentes: "Cadastro **rev 7**" com ⓘ: *"Versão do cadastro do Portal que esta página está usando. Sobe a cada gravação no Portal."*
- Ela compara com a última rev conhecida (a maior entre o arquivo e a cópia local) e, se esta página estiver atrás, vira **⚠ desatualizada · rev 6 de 7 · Atualizar**.
- O "rev N" da base própria sai do selo de situação e fica só no clique (detalhes da base), para não competir com o do cadastro.
- Se você preferir esconder: a pílula só aparece quando há problema (desatualizada ou cópia local).

### 1.7 PRD-01 · Proposta: Painel + Visão Geral → só "Visão Geral" (Produção)

As duas não são iguais por dentro:

| | Visão Geral (`overview`) | Painel (`panel`) |
|---|---|---|
| Montagem | fixa | configurável (indicadores, blocos, ordem, largura) |
| Visões | uma | "Meu painel" (navegador), visões compartilhadas (base), modelo "Diretoria mensal" |
| Extras | — | Apresentar (TV), "usar no botão TV", Imprimir/PDF |

Proposta:
1. Mantém **uma aba "Visão Geral"** no grupo Análise. Ela passa a usar o motor do Painel, com a montagem atual da Visão Geral como **visão padrão** ("Visão Geral · padrão", só leitura, sempre existe).
2. No topo, um seletor de visão: Padrão · Diretoria mensal · visões compartilhadas · Meu painel. Ao lado, o botão **Personalizar**, que abre o editor de hoje do Painel.
3. Apresentar/TV e Imprimir ficam na Visão Geral.
4. A rota `panel` continua aceita e redireciona para `overview` com a visão escolhida (links antigos e `App.prefs.tvView` não quebram). As visões já gravadas na base não mudam.
5. É só tela: não muda base nem cálculo de OEE (os dois já usam `Engine.periodResult`). Entra na Fase 5.

Preciso confirmar: a Visão Geral padrão fica igual à atual ou já nasce com o seletor Hoje/Ontem/Semana/Mês (POR-06)?

---

## 2. Bugs da Fase 0

### 2.1 POR-04 · Lista lateral da Configuração para de rolar · **corrigido (Portal 1.9.5)**

- **Causa:** a lista lateral (`.cadside`, usada em Cadastros e em ⚙ Administração › Configuração) é `position: sticky` sem limite de altura. Ela tem cerca de 1.120 px e uma tela comum tem uns 700 px úteis. Presa no topo, a parte de baixo ficava fora da tela e só aparecia no fim da página ou depois de redesenhar.
- **Correção (CSS + 3 linhas de JS):** `max-height: calc(100vh - 84px); overflow-y: auto; overscroll-behavior: contain`. A lista rola por dentro. A posição dessa rolagem é guardada e devolvida a cada clique (`cadSideTop`), porque a lista é redesenhada a cada clique. No celular (≤ 860 px) a lista continua sem limite, como antes.
- **Conferido** (Playwright, 1366×700): o último item ("Segurança") fica visível, a rolagem interna se mantém depois do clique (505 → 505), sem erro de página e sem rolagem horizontal em 390 px. `tvisual`, `tvigencias`, `tconstrucao` e `tdemo` passaram. A demonstração foi regerada.

### 2.2 POR-09 · Relatório e TV misturando meses · **causa explicada, correção depende de decisão**

Não é um erro de conta. **Cada card mostra o período que a página dona escolheu** no `exports.kpis`, e o Portal reproduz sem recalcular (regra 1):

| Página | Período dos indicadores que publica |
|---|---|
| Produção | mês atual (OEE, produção) e série diária |
| Waste | **última competência fechada** (a KKBC é mensal, então no começo do mês é o mês anterior) e série por mês |
| Paradas | "Parada no mês" do mês atual |
| Gel | "agora" (estoque, cobertura) |

Na TV da Produção, "Principais paradas · 7 dias" e "Tendência semanal" (8 semanas) são **janelas móveis** e atravessam a virada do mês de propósito.

Correção proposta, em duas etapas:
1. **Imediata (Fase 0, se você aprovar):** cada indicador do Relatório e da TV do Portal ganha a etiqueta do período, como já é feito na Reunião diária ("mês 11/2026", "competência 10/2026", "agora"). O Relatório separa os blocos "Mês atual" e "Último fechamento". Não muda contrato.
2. **Definitiva (Fase 5, POR-06/08):** o `exports` de cada página passa a publicar **séries por dia** (opcional, `exportsVersion` compatível) e o Portal soma qualquer período: turno, ontem, semana, mês ou personalizado. O mesmo seletor vale para a TV. O Waste continua por competência, porque não existe Waste diário na KKBC, e a etiqueta deixa isso claro.

---

## 3. Proposta de arquitetura · Fase 1 (Portal como fonte única)

### 3.1 O que já existe (ponto de partida real)

O briefing parte de "cadastros duplicados", mas boa parte já foi centralizada nas versões Portal 1.8 / Produção 2.4:

| Domínio | Hoje |
|---|---|
| Turnos, catálogos, linhas/famílias/máquinas, códigos de parada, metas de OEE, parâmetros comuns | **Já são do Portal.** A Produção aplica pelo `CadSync` quando a rev muda, e as abas de Configuração ficam **só leitura** com "Editar no Portal". Só quando o Portal tem o domínio **vazio** a Produção usa o cadastro local. |
| Paradas, Equipamentos, Iniciativas | já leem o cadastro do Portal (`vacCad()`) |
| **Gestão de Gel** | **ainda tem cadastro próprio** (Catálogos, Equipamentos da linha, Formatos de tubo, Aparência, turnos) · pendência registrada |
| Usuário atual, exibição de quantidades (`entryUnit`, `unitLabel`, `roundingUnit`) | locais (navegador / base da Produção) |

Por isso, ARQ-01 a ARQ-04 **já estão quase cumpridos na regra**. O que falta é (i) **tirar as telas locais** que ainda aparecem (mesmo travadas), (ii) **apagar o caminho "domínio vazio no Portal → usa o local"** e (iii) **resolver o PRD-04**.

### 3.2 ⚠ Conflito com o princípio "vínculo, nunca cópia" · decisão D0

A Produção **copia** o cadastro do Portal para a própria base (`CadSync`), com auditoria, e as outras páginas leem uma **cópia** em `localStorage`. Isso é de propósito, e eu recomendo **manter a cópia como cache somente leitura, ligada por código**:

- **Integridade histórica:** o OEE de março precisa do PPH, das pausas e do horário do turno **que valiam em março**. As vigências do Portal já são imutáveis (regra 3), mas a base da Produção precisa ser autossuficiente para reabrir um mês e reimprimir o mesmo número.
- **Resiliência:** com a pasta da rede fora do ar, a Produção segue lançando, e o operador não para.
- **Regra 1:** cada página só grava na própria base. Ler o JSON do Portal a cada cálculo deixaria todo OEE dependente da rede.

Como fica:
- A **referência** é sempre o **código do Portal** (`T1`, `100123`, `FME`, `EQ01`). Os ids internos da Produção (`sh_t1`, `cat_…`) passam a ser só técnicos, cada um com `portalCodigo`.
- A cópia **nunca é editável**: some a tela, não só o botão.
- O critério de aceite da seção 1 é atendido: mudar no Portal reflete em todas as páginas na próxima leitura, e não há onde editar fora do Portal.

Se você exigir vínculo **sem nenhuma cópia**, o custo é alto: OEE e histórico passam a depender da pasta da rede o tempo todo, e é preciso reescrever o motor de cálculo da Produção (contra a regra 6).

### 3.3 Modelo de dados (aditivo, `schemaVersion 1` compatível)

Só campos **novos e opcionais** em `vacutainer-cadastros.json`:

```jsonc
// turnos[].vigencias[] (ARQ-01 + TUR-01)
{ "de": "2026-12-01", "ate": null, "inicio": "22:47", "fim": "06:00", "dias": [0,1,2,3,4,5,6],
  "ativo": true,
  "produtivo": false,            // NOVO · TUR-01 · ausente = true (comportamento de hoje)
  "pausas": [...], "regraPedacoFinal": 30, "intervalos": [] }

// parametros (ARQ-06) · agrupados por página
"parametros": {
  "paradaLongaMin": 10, ...,                       // comuns (já existem)
  "producao": {                                    // NOVO
    "unidadeLancamento": 1000, "rotuloUnidade": "mil", "arredondamentoMeta": 1000,
    "servidor": { "pecasPorCaixa": 1000, "paradaSemCaixaMin": 10, "limiteTrocaMin": 240, "toleranciaHora": 2 } },
  "gel": { "formatos": [...], "aparencia": {...}, "locais": [...] }   // NOVO · ARQ-05
}

// equipamentos[] (ARQ-07)
{ "codigo": "EQ07", "nome": "Dosadora de gel 1", "papel": "equipamento",
  "categoria": "gel",            // NOVO · "Equipamento – Gel"; ausente = linha
  "gel": { "cabecotes": 2, "capacidadeKg": 200 } }   // NOVO · campos que hoje são do Gel (lógica do gel intacta)
```

"Usuário atual" **não** vira cadastro: ele é por computador (`vac.user`). Em Portal › Parâmetros ele aparece como **"Neste computador"**, editável ali, e as outras páginas só mostram.

### 3.4 Migração por domínio (ARQ-01 a ARQ-07)

Mesmo procedimento para todos, **sem apagar nada**: (1) prévia no Portal comparando o local com o Portal; (2) você confirma o mapeamento de códigos; (3) o Portal grava o que falta (operações normais, com auditoria e backup); (4) a página passa a ler só do Portal; (5) a tela local some; o dado local fica na base como histórico (`ativo:false` / `origem:'local-migrado'`).

| ID | Ação concreta | Risco / cuidado |
|---|---|---|
| ARQ-01 Turnos | Os campos do Portal já cobrem os da Produção (horário, dias, pausas com código e "desconta", intervalos do Hora a Hora, regra do pedaço final). Faltam só `produtivo` (Fase 2) e a cor. A tela local sai. **PRD-04:** o turno "inativo" na Produção é um turno **local com código diferente** do Portal (ex.: local `TC`, Portal `T3`), que o `CadSync` não toca, ou uma vigência com `ativo:false` / sem o dia da semana. A migração lista os turnos locais sem par no Portal para você mapear. | Lançamentos antigos apontam para o id local: o mapeamento mantém o id e só liga ao código do Portal. |
| ARQ-02 Catálogo | Já sincronizado. Sai a tela e o caminho "Portal vazio → local". Catálogos locais sem par vão para a prévia. | Vigência de PPH: usar a do Portal pela data do fato (já é assim). |
| ARQ-03 Metas OEE | Já é o Portal que manda quando há metas. Sai o fallback local. A Meta FY27 só se importa no Portal (hoje a leitura está duplicada: pendência § C). | — |
| ARQ-04 Paradas | Já sincronizado. Sai a tela. | Códigos locais sem par: na prévia. |
| ARQ-05 Gel › Config. | Catálogos → Portal `catalogos` (o Gel lê por código). Formatos, aparência e locais → `parametros.gel`. Turnos do Gel → Portal `turnos` (mesmos T1/T2/T3). | **Maior risco da fase.** Mexer só na **origem** dos dados, nunca no cálculo (GEL-06). Antes de mudar, criar um teste que fixe o cálculo atual (pendência § C: `openConfig` do Gel). |
| ARQ-06 Parâmetros | Nova categoria no Portal, agrupada por página. A Produção passa a ler `parametros.producao`. | `arredondamentoMeta` muda a meta exibida: precisa de vigência ou vale para tudo? (D7) |
| ARQ-07 Equipamentos | "Equipamentos da linha" do Gel → Portal `equipamentos` com `categoria:'gel'`. Todo campo "equipamento" vira seleção do cadastro. Texto livre antigo fica como está, marcado "fora do cadastro", com botão "ligar a…". | Mapeamento de nomes livres é manual (lista na prévia). |

**Ordem dentro da Fase 1:** ARQ-06 (base para os outros) → ARQ-01 + PRD-04 → ARQ-02/03/04 (só remover telas e fallback) → ARQ-07 → ARQ-05 (Gel, com teste de cálculo antes).

### 3.5 Testes da Fase 1

Testes novos: `testes/tportalfonte.js` cobre mudar turno, catálogo, meta, parada ou equipamento no Portal e verificar o reflexo em cada página; confere também que nenhuma tela fora do Portal tem campo editável desses domínios (critério de aceite); e roda a migração com base local divergente (prévia, mapeamento, histórico preservado). Antes de mexer no Gel entra o `testes/tgelcalc.js`, que fixa os números do cálculo do gel. Depois, `node testes/tudo.js`.

---

## 4. Decisões que preciso de você (não escolhi sozinho)

| # | Item | Pergunta | Minha recomendação |
|---|---|---|---|
| D0 | Princípio-chefe | Aceita "vínculo por código + cópia somente leitura (cache)" em vez de "nenhuma cópia"? (3.2) | Sim |
| D1 | TUR-01 | A madrugada (22:47–06:00) com o C não produtivo é **ao mesmo tempo** "depois do último produtivo" (B do dia D-1) e "antes do primeiro produtivo" (A do dia D). O briefing dá exemplo para os dois lados: 23:30 → B e "antes das 06:00 → A". Onde fica o corte? (a) tudo no **B do dia anterior**, coerente com o dia operacional das 06:00; (b) até 00:00 → B(D-1) e depois → A(D); (c) outro horário de corte. | **(a)**. As opções (b) e (c) passam produção de um **dia operacional para outro** e, no dia 1º, **de um mês para outro**, o que mexe no fechamento mensal e na conciliação com o SAP. |
| D2 | TUR-04 | No **OEE reportado**, as caixas do C vão para o B, mas e o **tempo**? Se o tempo do C não entra (não programado), a performance do B pode passar de 100%. Opções: (a) só as caixas, com performance > 100% sinalizada; (b) caixas + tempo efetivo de produção do C somados ao B. | (b), com o tempo usado vindo da 1ª à última caixa do servidor, ou (a) se a área já reporta assim hoje |
| D3 | TUR-04 | **OEE real do turno C** (não produtivo): qual o tempo planejado? A janela inteira do turno ou só o período com produção? | período com produção (com a janela mostrada à parte) |
| D4 | TUR-02 | Ao habilitar o C no dia, o tempo **todo** da janela do C vira planejado (as horas sem caixa viram parada)? | sim: é o efeito esperado de "turno produtivo" |
| D5 | ARQ-09 | "Remover o Modo Exemplo": (a) só o **botão/entrada** "Modo exemplo" de cada página, mantendo a **Demonstração integrada** (entregue no PR #22) e o modo de teste interno usado pela suíte (`enterTest`, `Demo.enterExample`); ou (b) **tudo**, incluindo a Demonstração. Na opção (b), cerca de 20 testes automatizados precisam ser reescritos com bases sintéticas na pasta. | **(a)** |
| D6 | POR-09 | Aprova a correção imediata (etiqueta de período em cada indicador do Relatório e da TV) e a definitiva na Fase 5? | sim |
| D7 | ARQ-06 | Mudar o arredondamento da meta vale só **daqui para frente** (com vigência) ou muda também a exibição do passado? | com vigência |
| D8 | UX-04 | Pílula única de cadastro com alerta de "desatualizada", ou esconder quando estiver tudo certo? | pílula única, sempre visível |
| D9 | PRD-01 | A Visão Geral unificada já nasce com o seletor Hoje/Ontem/Semana/Mês? | sim, junto com POR-06 na Fase 5 |

Com D0, D5 e D7 respondidas, começo a Fase 1. D1 a D4 são necessárias para a Fase 2 (regras de turno e POR-10).

---

## 5. Entrega · Fase 0 (resto) e Fase 1 (10/11/2026)

Decisões do usuário: **D0** ok (vínculo por código + cópia só de leitura) · **D5** opção (a) · **D7** arredondamento com vigência.
Versões: Portal 1.9.9 · Produção 2.4.23 · Waste 1.8.26 · Gel 2.15. Teste novo: `node testes/tportalfonte.js` (na suíte `tudo.js`).

### O que mudou, por ID

| ID | O que mudou |
|---|---|
| ARQ-09 | Sai a seção **Configurações › Modo exemplo** da Produção, o card "Modo exemplo" do Gel (Backup) e o "Ver exemplo" da base vazia do Gel. No Waste, "Ver com dados de teste" agora abre a Demonstração integrada, e no Portal o card ficou "Demonstração" com ⓘ. Os textos "Modo exemplo" viraram "Demonstração". Por dentro continuam `Store.enterExample`, `enterDemo` e `enterTest`, que a Demonstração e os testes usam. |
| ARQ-06 | **Portal › Cadastros › Regras › Parâmetros** (antes "Parâmetros e semáforo") ganha dois grupos. **Produção** (`parametros.producao`): unidade de lançamento, rótulo e **arredondamento da meta por vigência**. Só se acrescenta vigência de hoje em diante; data no passado é recusada (regra 3). **Neste computador**: usuário atual (Entrar/trocar) e exibição das quantidades (`vac.qtd`), sem senha e sem revisão do cadastro. Na Produção, o CadSync aplica e trava os três campos, cada dia usa o arredondamento da própria data (`roundAt`), e a exibição segue `vac.qtd`. |
| ARQ-01..04 | Com o cadastro do Portal (ou na pasta da rede, ou na Demonstração), **Produção › Configurações › Estrutura, Turnos, Catálogos, Metas e Tipos de parada ficam só consulta, mesmo com o domínio vazio no Portal**. Antes, domínio vazio deixava editar ali, e isso era um cadastro paralelo. O aviso mostra o que o Portal ainda não tem e o que **só existe na Produção**. Sem pasta e sem Portal (modo local dos testes), fica como antes. |
| PRD-04 | **Causa encontrada:** a Produção desativa turno e linha pelo campo `status`, mas a sincronização só mexia em `active`. Um turno desativado na Produção antes de o Portal assumir continuava inativo, mesmo o Portal dizendo ativo. Agora o `status` de linhas, famílias, máquinas, catálogos, tipos de parada e turnos segue o Portal. Outro caso também foi resolvido: um **turno que só existe na Produção** (outro código, ex.: `TC` × `T3`) fica inativo para os dias novos, para não haver turno em dobro. Os dias já lançados não mudam. |
| ARQ-05 | Gel (`GelCad`): o catálogo do Gel é o do Portal com o mesmo número. **Nome, cor, situação e formato vêm do Portal.** Um catálogo do Portal com gel na BOM entra sozinho no Gel. Gel › Configuração › Catálogos não cadastra catálogo novo quando há Portal (dá para "trazer" um do Portal). Ficam no Gel só os dados do gel: BOM de gel, tolerância, g/tubo, lote e velocidade. Turnos e preço do gel já vinham do Portal. |
| ARQ-07 | Portal › Equipamentos ganha a **Categoria** ("Equipamento da linha" / "Equipamento – Gel", com ⓘ). No Gel, o equipamento é **escolhido do Portal** (seleção, não texto livre). O vínculo é por código e, na primeira vez, pelo nome ou pelos "Outros nomes". Nome e situação vêm do Portal; embalagem e descartes continuam no Gel. Equipamento sem vínculo aparece com a pílula "sem vínculo". |
| GEL-06 | Teste de invariância: com catálogos e equipamentos ligados ao Portal, `gelExports()`, gel aplicado, BOM e meta de cada catálogo (hoje e 30 dias atrás) saem **idênticos** aos de antes. |
| POR-01 | ⓘ no título "Onde é usado / ligações" com o texto do item 1.1. |

### Migração (sem perda de histórico)

**Portal › Cadastros › Início › Trazer configurações** (prévia, marcar e incluir; vira operações normais do cadastro, com auditoria e backup) ganha estes grupos:

- **Só na Produção · turnos / catálogos / tipos de parada**: o que a Produção tem e o Portal não, **com o mesmo código**. Vêm as vigências, pausas, intervalos, PPH e regras de apontamento. O turno vem **desmarcado** quando o Portal já tem turnos, porque provavelmente é o mesmo turno com outro código.
- **Só no Gel · catálogos / equipamentos**: catálogos com o mesmo número; equipamentos com o próximo `EQnn` e categoria "Equipamento – Gel". O Gel liga sozinho pelo nome.
- **Parâmetros**: unidade, rótulo e arredondamento da Produção. O arredondamento entra como vigência **desde o primeiro dia lançado**, para não mudar a meta de nenhum dia passado.

Nada é apagado nas páginas. O que não vai para o Portal continua na base de cada página como histórico (só consulta).

### Decisão manual na pasta real (homologação)

1. Abrir **Trazer configurações** e conferir os grupos "Só na Produção" e "Só no Gel". Em especial, **o turno inativo do PRD-04**: se for o mesmo turno de um código do Portal, deixar desmarcado; se for outro turno de verdade, trazer.
2. Depois da próxima revisão do cadastro, conferir na Produção (Configurações › Turnos) se os 3 turnos aparecem ativos.
3. No Gel, conferir a pílula "sem vínculo" em Equipamentos da linha: ligar pelo nome no Portal (Outros nomes) ou trazer.

### D10 · decisão para depois (não bloqueia)

Ainda ficam **no Gel** os parâmetros que só o gel usa: BOM de gel por catálogo (com vigências), gramas por tubo por **formato**, **locais** de estoque, **motivos de descarte**, **parâmetros de processo** e **aparência** (esta é preferência do computador). Pelo ARQ-06 ("campos específicos de uma página ficam no Portal, agrupados por página"), eles iriam para `parametros.gel` no Portal. Recomendo fazer isso **na Fase 4** (Gel dentro da Produção, GEL-02 a GEL-05), porque a tela de registro do gel muda nessa fase. Outra opção para a BOM de gel: o Gel passa a ler a quantidade de gel da **BOM do CS12** que o Portal já tem, em vez de uma BOM própria. Isso muda a fonte de um número que entra na conta e precisa da sua confirmação.

---

## 6. Entrega · Fase 2: regras de turno (10/11/2026)

Respostas do usuário: **D1** depende da continuidade: produção emendada com o fim do B fica no B; sem continuidade, vai para o A, e vice-versa. **D2** performance acima de 100% é aceita. **D3** o tempo planejado do OEE real vai da 1ª à última caixa (MES). **D4** sim.
Versões: Produção 2.4.24 · Portal 1.9.10. Código novo: `fontes/producao/turnos_np.js`, que entra no script principal pelo `build.py`. Teste: `node testes/tturnos.js` (na suíte `tudo.js`).

| ID | O que mudou |
|---|---|
| TUR-01 | No Portal, a vigência do turno ganha **"Turno não produtivo"** (`naoProdutivo`, com ⓘ; vazio = produtivo). Na Produção, um turno ativo e não produtivo **não entra no dia nem no plano**. As caixas do servidor feitas fora dos turnos do dia (na janela do turno não produtivo, ou em horário sem turno) são **reatribuídas só para a apuração**; o registro de cada caixa continua na hora real. **Regra (D1):** a janela é dividida em trechos contínuos. Um trecho fecha quando há um intervalo sem caixa maior que a **continuidade**, que fica em Portal › Parâmetros › Produção; vazio = "Parada sem caixa", 10 min. Trecho emendado com o fim do turno produtivo anterior conta nele. Sem continuidade, conta no próximo turno produtivo, que pode ser o A do dia seguinte. |
| TUR-02 | Em **Lançamento**, o quadro "Turnos não produtivos e produção fora de turno" tem **"Habilitar Turno C neste dia"**. Habilitado, o turno entra no dia com os intervalos e as pausas da vigência. O tempo dele vira planejado (D4), a janela deixa de ser reatribuída e o servidor sugere a produção nos intervalos dele, como em qualquer turno. Para desabilitar, o turno não pode ter produção, scrap nem parada lançada. Dia fechado: reabrir antes. |
| TUR-03 | O mesmo quadro mostra, por trecho: a janela, a 1ª e a última caixa, as caixas, a produção, o OEE real do trecho e **em que turno contou, com o motivo**. Mostra também quanto a produção fora de turno pesa na produção boa reportada. |
| TUR-04 | **OEE reportado** = com a reatribuição. É o resultado oficial: dia, turnos, exports e Portal. **OEE real** = sem a reatribuição. O OEE real de cada trecho usa como tempo planejado o período da 1ª à última caixa (D3). A performance do turno que recebe pode passar de 100% (D2); o alerta de "acima de 100%" continua, e a mensagem do dia explica a origem. |
| POR-10 | A causa está na seção 1.5. A madrugada antes das 06:00 de um dia sem turno C deixa de sumir: entra como janela "fora dos turnos do dia" e segue a mesma regra (normalmente vai para o A, quando não emenda com o B). |

**Para não mudar o passado sem querer:** a reatribuição só vale para dias **a partir de uma data** (Portal › Parâmetros › Produção › "Produção fora de turno vale a partir de"). Vazio = a 1ª vigência marcada como não produtiva. Uma data no passado pede confirmação, porque o OEE dos dias desde então muda, inclusive os fechados. Com os três turnos produtivos e sem buracos entre eles, nada muda.

**Limites (para as próximas fases):**
- A reatribuição usa as caixas do servidor (MES), só de lotes "normais" (retrabalho e lotes ignorados ficam fora, como na sugestão do dia). Sem MES não há o que reatribuir: o lançamento manual só existe em turno do dia.
- A fatia **por catálogo** (filtro de catálogo nos painéis) ainda não inclui a produção reatribuída; o total do dia e dos turnos inclui.
- O quadro está no **Lançamento**. Na **Visão Geral do período** e no **Relatório**, ele entra na Fase 5 (POR-06/08). Os números já chegam nos dois pelo resultado oficial do dia.

**Homologação:** em Portal › Turnos, marcar o C como "Turno não produtivo" a partir de uma data. Conferir em Parâmetros › Produção a continuidade e a data. Depois importar o CSV do MES de uma noite com produção após 22:47 e conferir o quadro do dia: o trecho emendado deve aparecer no B, e o que veio depois de uma parada, no A do dia seguinte.
