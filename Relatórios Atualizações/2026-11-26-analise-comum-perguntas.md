# Perguntas ao responsável · análise comum (26/11/2026)

Lista única, sem repetição, das dúvidas de negócio das duas auditorias. Cada pergunta diz de onde veio (A, B) e qual linha da [tabela comum](2026-11-26-analise-comum.csv) ela destrava.

## Já respondidas em 26/11/2026
| Pergunta original | Resposta | Onde entrou |
|---|---|---|
| Dado impossível: avisar, bloquear a gravação ou marcar como inválido (A1, B2 em parte) | **Bloquear a gravação** | PR #165 (C02, C03); limite de 3x a capacidade a confirmar em P3 |
| Paradas simultâneas somam ou valem uma só (A2) | **Contar uma vez só** | PR #165 (C04) |
| O parâmetro Fuso horário deve valer (A3) | **Sim, o fuso da planta** | PR #165 (C06) |
| Vale unificar o código repetido (A5) | **Sim** | `docs/PLANO-H01-CODIGO-REPETIDO.md` (C38) |
| Modelo de acesso: documentar ou endurecer (A4) | **Documentar** | `docs/MODELO-DE-ACESSO.md`; a pergunta de fundo continua em P1 |

## Respondidas depois da análise comum (26/11/2026)
| # | Resposta | Consequência |
|---|---|---|
| P1 | **Só registrar quem fez**; a permissão da pasta controla o acesso | Mantém `docs/MODELO-DE-ACESSO.md`; C21 sai do roadmap de endurecimento |
| P2 | **Ausente e fora do consolidado**: "sem lançamento"; zero só quando digitarem 0 | C01 a corrigir (exports e Visão da linha precisam carregar a ausência; nada de zero implícito) |
| P3 | **3x serve**; relatório oficial **mostra com aviso** quando a Performance passa de 100% | `LIMITE_X` = 3 confirmado; falta o aviso de divergência de capacidade no relatório |
| P4 | **1 ano, com arquivo histórico consultável** | C18: arquivar o que sai da lista ativa |
| P5 | **Bloquear a restauração até gravar a fila** | C13: restauração recusa com fila pendente |
| P7 | **Pela hora de cada caixa** | C32: o filtro de turno passa a atribuir cada caixa ao seu turno |
| P10 | **Guardar o ID** na trilha do Waste e da Administração | C17: ID ao lado do nome nas entradas novas |
| P11 | **Posso homologar esta semana** (pasta de rede e duas estações) | C16: preparar o roteiro de homologação de duas estações |

Restam abertas: P6 (anexos), P8 (códigos de família FY27) e P9 (celular e Gel).

## Em aberto (ainda sem resposta)
| # | Pergunta | Origem | O que muda conforme a resposta | Linhas |
|---|---|---|---|---|
| P1 | Quem pode ler e gravar na pasta compartilhada e usar o perfil do navegador onde o aplicativo roda? O ID e a senha servem para **registrar quem fez** ou para **impedir** quem não pode? | A4, B5 | Se for só identificação, a documentação atual basta. Se for controle, a segurança precisa sair do cliente (evolução grande). | C21 |
| P2 | Quando a produção de um dia ou turno está **em branco**, como isso aparece na Visão da linha e nos relatórios de período? Um período parcial entra no consolidado? | B1 | Define como exportar a ausência (hoje vira zero) e se o OEE do período considera só o que foi lançado. | C01 |
| P3 | Quando a Performance passa de 100% por divergência de capacidade (sem entrada impossível), o relatório oficial mostra com aviso ou espera conferência? E o limite do lançamento em **3 vezes a capacidade** serve? | B2, A1 | Regra de liberação do relatório e valor da constante `LIMITE_X`. | C02 |
| P4 | Por quanto tempo o histórico de alterações por autor e por registro precisa ficar disponível? | B3 | Define a retenção e se a lista ativa (3.000 ou 5.000 eventos) precisa de um arquivo histórico. | C18 |
| P5 | Ao restaurar um backup com alterações ainda na fila, o operador conclui a gravação antes ou separa a fila para revisão? | B4 | Procedimento da restauração e o que a tela permite. | C13 |
| P6 | Quais formatos de anexo de equipamentos precisam abrir dentro do aplicativo? | B6 | Quais ficam na prévia e quais só baixam. | C24 |
| P7 | Como o relatório **Lotes do MES** atribui as caixas quando o lote atravessa a troca de turno: hora de cada caixa, faixa do segmento ou vínculo explícito? | B7 | Regra do filtro de turno (hoje só o rótulo muda). | C32 |
| P8 | Quais formatos de código de família aparecem nos títulos dos quadros hora a hora da planilha oficial (inclusive com dígitos)? | B8 | Casos de aceite da Meta FY27 e da convergência dos dois leitores. | C42 |
| P9 | Quais perfis lançam o turno e consultam os gráficos de Gestão de Gel pelo celular, e quais aparelhos? | B9 | Jornadas móveis da homologação e larguras a testar. | C51, C52, C53 |
| P10 | A **trilha de auditoria** do Waste e da Administração deve guardar o **ID** da pessoa, como a Produção (contrato 8)? | análise comum (A C01 × B C01) | Se sim, acrescentar o ID ao registro; se não, registrar a exceção no contrato. | C17 |
| P11 | Existe uma pasta de rede real e duas estações para homologar a gravação, e quando? | A B04, lacuna da B | Sem isso, B01 a B04 não saem de "provado em simulação". | C16 |
