# Produção 2.4.20 · SQDCP, segurança e QN por turno

Entrega de 09/11/2026. Base: main em `6e0233f`. O quadro e seus registros pertencem à Produção; continuam funcionando com os HTML e bases na pasta, sem servidor/API.

## Uso

1. Em **Apontamento → Lançamento**, cada turno tem **Segurança e qualidade do turno**. O mesmo bloco aparece em **Lançar meu turno**, a tela do operador.
2. Responda separadamente se houve acidente e QN (*Quality Notification*): **Não informado**, **Não houve**, **Sim**. Em Sim, informe quantidade, referências e resumo operacional, quando disponíveis.
3. **Salvar segurança e qualidade** registra as respostas com autor, data e auditoria. Na tela do operador, **Concluir turno** exige ambas as respostas e salva o formulário antes da conferência. O fechamento pela liderança mostra alertas para registros antigos/importados sem resposta.
4. Em **Gestão → SQDCP**, escolha referência, linha e turno. A operação normal inicia no dia anterior; a demonstração usa o dia do cenário.
5. O quadro tem **5 colunas × 5 posições**. **Configurar posição** escolhe indicador, título, período, modelo da folha, meta, sentido, unidade e observação. A configuração fica na base e vale nas outras estações que a leem.
6. **Prévia / imprimir** mostra uma posição como uma folha A4 paisagem. Na impressão do navegador, mantenha A4, paisagem, escala 100% e desative seus cabeçalhos/rodapés. Também pode escolher Salvar como PDF.

A coluna P pode representar **Pessoas** ou **Produtividade**. A configuração tem ajuda com explicação e exemplo. Os filtros da referência ficam na tela; definições do quadro e valores manuais ficam na base.

## Indicadores

| Pilar | Dados disponíveis |
|---|---|
| S | Acidentes por turno/período, cobertura e sequência de dias confirmados sem acidente; ações de origem OSM publicadas por Iniciativas |
| Q | QNs, scrap em peças e percentual, Qualidade do OEE |
| D | Produção boa, atendimento à meta operacional, OEE, paradas apontadas |
| C | Desvio de Waste por competência; gel disponível na posição atual |
| P | Ações abertas/atrasadas; medidas de produção quando usado como Produtividade |
| Todos | Indicador manual: presença, treinamento ou custo ainda sem fonte automática |

Presença, treinamentos, acidentes anteriores ao sistema e custo diário não foram inventados nem inferidos de outras medidas. O indicador manual é uma **fotografia na referência**, sem somar pessoas ou taxas entre dias. Quem pode lançar tem **Registrar valor**, mesmo sem poder configurar o quadro.

Fontes externas são consultadas somente por `exports`. Waste informa competência/fechamento; Gel e ações indicam posição atual e atualização da base. Não são apresentados como históricos diários. Para outra linha sem cobertura publicada, o resultado fica não informado. Trocar de pasta invalida o cache antes de desenhar os indicadores.

## Regras dos registros

- **Ausência não é zero.** Bases antigas, campos apagados e turnos não respondidos permanecem Não informado. Não houve é zero explícito.
- Em Sim, a quantidade é um inteiro positivo. Referências ficam como texto: `00001234` mantém os zeros.
- Uma **QN com o mesmo número** reportada em vários turnos/dias conta uma vez no período. Sem número, a contagem é provisória. O CSV mantém o detalhe reportado em cada turno para conciliação.
- Acidentes somam as novas ocorrências de cada turno; não se deve repetir um acidente anterior como nova ocorrência.
- O quadro mostra a cobertura. Uma ocorrência conhecida fica fora da meta mesmo com outro turno pendente. Um período parcial nunca aparece como integralmente seguro.
- **Dias confirmados sem acidente** verifica até 365 dias consecutivos, interrompendo em lacuna, ausência de turnos confirmados ou acidente. Não equivale a contador corporativo com histórico anterior.
- Turnos programados sem produção são excluídos da cobertura, salvo respostas explícitas. Um dia sem lançamento usa os turnos previstos para identificar pendências. Lançamentos existentes conservam seus turnos registrados.
- Registros fechados exigem reabertura. As alterações passam pelo `Store.mutate`, auditoria e persistência normais.
- Reimportar o RELATÓRIO preserva segurança/QN. Se um turno desaparecer da planilha, o registro S/Q permanece separado, sem trazer de volta a produção antiga.

## Impressão e relatórios

Três modelos: **resultado e evolução**, **calendário mensal**, **desvios e ações**. Cada impressão contém uma posição e uma única A4 paisagem, com título, referência, número, meta, situação e fonte. Cor acompanha texto; não é o único sinal.

A síntese de desvios limita a folha a cinco itens e 100 caracteres por campo, com indicação explícita. A observação tem até 300 caracteres e há espaço para responsável/prazo manuscritos. O detalhamento completo permanece nos registros e CSV.

Os registros também alimentam:

- passagem de turno e relatórios diário, semanal e mensal: bloco **Segurança e QN por turno** e resumo automático;
- CSV/Excel da Produção: tabela **Segurança e QN**;
- **CSV · Segurança e QN** do quadro: mês até a referência;
- `exports.sqdcp`: janela declarada de 120 dias, turnos e consolidação diária para os outros módulos.

## Contrato e fontes

Campos opcionais, compatíveis com `schemaVersion:1` e `exportsVersion:1`:

- `productionDays[].shifts[].sqdcp`: `{acidente, qn, por, em}`. Evento: `{resposta:'sim'|'nao', quantidade, numeros:[], resumo}`; ausente/nulo é desconhecido.
- `productionDays[].sqdcpTurnos`: preservação por `shiftId` durante substituição por importação.
- `sqdcp.quadros[linha]`: significado de P e definições por posição S0…P4.
- `sqdcp.manuais[linha][posição|data|turno]`: valor, nota, autor e data.
- `exports.sqdcp`: `versao`, `de`, `ate`, `turnos`, `porDia`; cobertura, quantidade, referências e contagem provisória.

Código em `fontes/producao/`: `sqdcp_modelo.js` (regras puras), `sqdcp.js` (tela/documentos), `sqdcp.css`, `sqdcp_impressao.css`, `sqdcp_build.py` (substituições exatas). A base `OEE-base-2.0.html` permanece imutável.

```sh
python fontes/producao/build.py
python fontes/demo/gerar_demo.py
node testes/tsqdcp.js
```

Reconstrua a demonstração por último. Respostas sintéticas são geradas somente no cenário demonstrativo; bases reais não são preenchidas automaticamente.

## Validação e próximos itens

`testes/tsqdcp.js` verifica formulário, QN repetida, cobertura, bases antigas, conclusão, permissões/fechamento, relatórios, reimportação, gravação/releitura em OPFS, troca de pasta e layout 1440/390 px. Gera os três PDFs e confere A4, uma página e conteúdo dentro da folha, inclusive seis semanas e textos longos.

- [ ] Confirmar com a gestora os indicadores de cada posição e suas metas.
- [ ] Integrar presença/treinamentos a fonte validada; hoje há registro manual.
- [ ] Definir histórico oficial para contador corporativo de dias sem acidente e categorias, se necessários.
- [ ] Ampliar scrap por máquina na Produção e conciliar com pesagens do Gel sem dupla contagem.
- [ ] Homologar na estação/impressora da linha e com duas estações na pasta real. Testes usam dados fictícios e pasta simulada.

## Produção 2.4.33 · 10/11/2026 · PRD-09

Gráfico da folha em barras por dia (verde atingiu a meta, vermelho não atingiu, âmbar parcial, azul sem meta), com linha só para a meta e a tendência. Detalhes: `docs/briefing-2026-11-09-fase0-fase1.md` § 10.

## Produção 2.4.58 · SQDCP – Gestão Diária, layout novo (12/11/2026)

Especificação do usuário ("Especificação de melhorias — SQDCP Gestão Diária"). Mudou só a apresentação. Armazenamento (`db.sqdcp.quadros[linha].slots`, `manuais`), configuração das posições, fontes, CSV e folha A4 continuam os mesmos.

### Mapa (antes de mudar)
- **Tela:** `renderQuadro`/`montar` em `fontes/producao/sqdcp.js`; CSS em `sqdcp.css`.
- **Cálculo:** `relatorio(key)` → `dados()` (Produção pelo `Engine.periodResult`; Waste, Gel e Iniciativas pelo `exports`, lidos uma vez em `carregarFontes`).
- **Configuração:** `editar(key)` → `Actions.setSQDCPVaga`; coluna P → `setSQDCPP`.
- **Valor manual:** `registrarManual` → `setSQDCPManual`.
- **Folha:** `folha`/`htmlImpressao`/`previa`/`imprimir` com `sqdcp_impressao.css`.
- **CSV:** `Exporter.csv(M.tabela(...))`.
- **Build:** `sqdcp_build.py`.

### O que mudou
- **Cabeçalho em três blocos:**
  - título "SQDCP – Gestão Diária" com o botão **Configurar SQDCP** (lista as 25 posições, com a engrenagem de cada uma);
  - filtros: data com "Dia anterior", linha, turno e coluna P;
  - ações: Atualizar fontes, Exportar CSV e **Modo Reunião**.
  - Os filtros ficam em `Sqdcp.UI`, como antes; atualizar as fontes não muda nenhum.
- **Resumo executivo:** um cartão por pilar, na ordem S Q D C P.
  - Cada cartão usa a 1ª posição configurada do pilar (fora os Blocos do Painel), com o **mesmo resultado** do card. Não há conta paralela.
  - Sem dado: "—" e "Não informado".
- **Cards:**
  - **Conteúdo:** posição (S1…P5), ícone do indicador, nome, valor e unidade, meta com sentido (≥/≤) e situação, nota em até 3 linhas (o texto inteiro fica na dica do mouse).
  - **Botões:** **Prévia / Imprimir** e a **engrenagem** (`button.sqdcp-gear`, com `aria-label` "Configurar posição S 1" e dica) no lugar do botão "Configurar posição". O "Registrar valor" do indicador manual continua.
  - **Tamanho:** altura mínima de 190 px; nas telas largas, as linhas ficam alinhadas entre os pilares (subgrid).
  - **Posição livre:** card tracejado com "＋ Escolher indicador".
- **Cores:**
  - **Pilares (categoria):** S #16803C, Q #1769D2, D #D99A00, C #7935B2 e P #C72D45, no cabeçalho da coluna (`--pillar-color`).
  - **Situação (resultado × meta, pelo `relatorio`):**
    - verde = dentro da meta;
    - vermelho = fora da meta;
    - âmbar = dados parciais;
    - azul = sem meta;
    - cinza = não informado;
    - borda vermelha tracejada = erro na fonte, com "Tentar novamente".
  - **Sem pasta conectada** não é erro: fica "Não informado", com a nota "Conecte a pasta".
  - **Âmbar de "atenção":** não existe porque nenhum indicador tem regra de alerta. Entra quando houver.
- **Modo Reunião (`body.sqdcp-reuniao`):**
  - esconde o cabeçalho geral, as abas, a faixa da demonstração e os controles administrativos;
  - mostra uma barra com referência, linha, turno, horário da atualização e das fontes;
  - S Q D C P ampliam um pilar (as cinco posições lado a lado) e "Todos" volta;
  - Esc, Sair ou trocar de tela saem do modo. Nada é gravado.
- **Peso:** o quadro chama `relatorio(key, true)`, sem a série diária do mês, que só a folha usa. Antes, cada desenho fazia até 31 contas por posição; agora é uma por posição, reaproveitada no resumo.
- **Tema:** o claro usa as cores da especificação (fundo #F3F6FA, azul #123B5D, cantos de 10–12 px, sombra suave); o escuro usa os tokens da plataforma. Classes `sqdcp-*` próprias. `.sq-quadro`, `.sq-coluna` e `.sq-vaga` foram mantidas.
- **Impressão:**
  - a folha A4 de cada posição não mudou (mesma configuração e fonte);
  - na tela, o Ctrl+P do quadro sai só com o resumo e as 25 posições, claro e sem botões.
- **Guia da aba (UX-02):** novo `sqdcp` em `guia.js`.

### Testes
- **`testes/tsqdcp_layout.js` (novo):** referência das 25 posições (título, valor, unidade, meta, estado, nota) gravada **antes** da mudança em `testes/bases/sqdcp-referencia.json`, e iguais depois. Também confere:
  - os três blocos, o resumo igual aos cards, as 25 posições na ordem S Q D C P;
  - a engrenagem acessível, a altura mínima, as cores, a posição livre e "—" (nunca 0);
  - o filtro mantido ao atualizar as fontes;
  - o Modo Reunião (pilar ampliado, Esc, nada gravado);
  - o erro de fonte com Tentar novamente e o Configurar SQDCP;
  - o CSV e a prévia A4;
  - 3 larguras × 2 temas sem rolagem lateral, sem erro no console.
- **`tsqdcp.js`:** continua igual (25 vagas, 5 colunas, linhas alinhadas, configuração, valor manual, A4).

