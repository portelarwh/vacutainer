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
