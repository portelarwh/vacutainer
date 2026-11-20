# Proposta LANC-03 · aba Lançamento por modo (hora a hora, por turno, dia) e scrap por turno ou diário

Pedido do responsável (20/11/2026). **Ainda não implementado.** Muda a interface da aba Lançamento da Produção (`motor/oee`, LANC-02, cartões `lc-*`/`tl-*`). Os números, as fórmulas e as permissões continuam iguais (contrato 6), O modo "Dia" foi decidido como "só no dia" (item 4), sem rateio entre turnos ou horas.

## 1. Cabeçalho do dia (uma linha, sem repetição)

- À esquerda: `Terça-feira, 17/11/2026`, o chip de situação (Em produção, Pendente de conferência, Sem produção ou Fechado, vindo de `day.status` e da pendência) e o texto discreto "Semana 47 · seg–sáb · Linha".
- Sai o bloco Linha/máquina + Calendário: a linha já está no seletor da barra.
- À direita: **Fechar dia** (botão principal; com o dia fechado vira **Reabrir**) e **⋮ Mais ações**.
- Abaixo, duas pílulas (controle segmentado):
  - **Lançamento:** Hora a hora (padrão) · Por turno · Dia.
  - **Scrap:** Por turno · Diário.

## 2. Menu "⋮ Mais ações"

- Botão `aria-haspopup="menu"` + `div[role=menu]`. Fecha com Esc, com clique fora e depois de escolher; ↑/↓ navega.
- Grupos:
  - **Ações do dia:** Pendente de conferência (`#dPend`), Dia sem produção (`#dOff`/`#offDay`), Mover para outro dia (`#dMove`), Enviar relatório (`#dEnviar`).
  - **Correções:** Restaurar intervalos padrão (`#dRestore`), Reaplicar metas vigentes (a ação que já existe), Editar cards, Metas dos próximos meses.
  - **Consulta:** Histórico de alterações (auditoria do dia).
  - **Zona de risco**, separada e em vermelho: Excluir dia (`#dDel`).
- Só aparece o que vale para a situação do dia.
- **Regra técnica:** os itens mantêm os mesmos IDs e handlers. Assim `VAC_PODE_MAPA.oee` e `vacTravas` (travas por perfil) continuam funcionando. Os itens ficam no DOM, escondidos quando o menu está fechado.

## 3. Pílula Lançamento: o que cada modo mostra

| Modo | Cartão de cada turno | Usa |
|---|---|---|
| **Hora a hora** (padrão) | Indicadores do turno (tempo, meta, produzido, OEE), tabela das horas, paradas e hora extra | `iv.good` por intervalo (como hoje) |
| **Por turno** | Indicadores, um campo "Produção do turno" e as paradas do turno; o hora a hora fica oculto | `TotalTurno` (lançar o total do turno, que já existe) |
| **Dia** | Um bloco "Produção do dia" com tempo, meta e campo de produção e paradas do dia; turnos e horas ficam ocultos | **Novo**: ver item 4 |

- **Onde guardar o modo:** em `day.modoLanc` (`'hh' | 'turno' | 'dia'`), uma propriedade nova e aditiva; sem ela vale `'hh'`. O modo é por dia e fica na auditoria.
- **Trocar de modo com dados lançados:** pede confirmação e diz o que acontece, por exemplo "o total do turno é apagado e as horas voltam a abrir", reaproveitando a troca que já existe no `TotalTurno`. Nunca apaga sem confirmar.
- **Avisos que não se perdem:** sugestões do servidor e alertas (hora extra, meia-noite) continuam aparecendo em qualquer modo.

## 4. Modo "Dia": decidido, só no dia (opção b, responsável, 20/11/2026)

**Princípio:** o tipo de reporte vale só para o nível em que foi feito. Nada é dividido nem estimado para um nível mais fino. Ratear a produção do dia entre turnos ou horas inventaria números e contaminaria o cálculo real dos dias lançados hora a hora ou por turno.

| Visão | Dia lançado por **hora** | Dia lançado por **turno** | Dia lançado por **dia** |
|---|---|---|---|
| Dia, semana, mês, período | entra | entra | entra |
| Por turno (OEE, relatório, ranking) | entra | entra | **não entra**; aparece como "lançado por dia" |
| Hora a hora (perfil por hora, gráfico) | entra | **não entra** (o total do turno não vira hora) | **não entra** |

Regras de implementação:

- **Onde guardar:** `day.lancDia = { good, scrap? }`, um bloco novo e aditivo. As paradas do dia ficam em `day.events`, sem `intervalId`/turno e marcadas `nivel:'dia'`. Não se grava produção em `iv.good` nem em `ps.*` nesse modo, para nenhuma visão por turno ou hora a pegar por engano.
- **OEE do dia:** soma a produção, o tempo planejado (com as horas extras de cada turno) e as paradas, e calcula o OEE uma vez sobre essas somas. É o mesmo agregado ponderado de hoje; nunca a média de taxas (contrato 1).
- **Turnos desse dia:** OEE, produzido e atendimento mostram "—" com o selo "lançado por dia". Ausência nunca vira zero (contrato 1), e a meta do turno não entra num denominador por turno.
- **Semana e mês com dias mistos:** o total soma todos os dias. A visão por turno ou por hora mostra uma nota: "N dia(s) lançado(s) por dia não entram nesta visão".
- **Conferir:** os relatórios e gráficos por hora precisam ignorar o período único do `TotalTurno` (turno lançado pelo total), para que ele não seja lido como produção de uma hora.
- **Trocar de modo:** como no item 3, com confirmação. Ao sair do modo Dia, o `lancDia` é apagado (com auditoria) só depois de confirmar.
- **Contrato 7:** nenhuma fórmula nova. O modo Dia só soma os mesmos componentes no nível do dia.

## 5. Pílula Scrap

- **Diário:** o campo "Scrap do dia" (com o responsável) fica abaixo dos turnos; os turnos não pedem scrap. Usa `day.scrapMode = 'day'`, que já existe, e a regra da TUR-07 de somar o scrap que vem do turno da madrugada.
- **Por turno:** cada cartão de turno ganha o campo "Scrap do turno" (`ps.scrap`) logo abaixo dos indicadores; o campo do dia some.
- **Trocar com scrap já lançado:** pede confirmação. O valor do outro modo fica guardado e não é apagado, mas deixa de contar.

## 6. Hora extra por turno

- Cada turno tem o seu "+ Hora extra" (HEX-01). Marcado, vira um selo "Hora extra 05:00–06:00".
- Os indicadores do turno se ajustam: tempo, meta e capacidade (ex.: 510 → 570 min).
- Um turno pode ter hora extra e o outro não. A hora extra aparece:
  - no modo Hora a hora, como a linha "extra" na tabela;
  - no modo Por turno, somada ao tempo do turno;
  - no modo Dia, como os selos dos turnos, porque o tempo do dia soma as horas extras.

## 7. Rodapé e repetições

- O rodapé fica com "Alterações salvas" à esquerda e "Abrir hora a hora" (só no modo Hora a hora) à direita.
- Antes de mexer, inventariar os botões repetidos (Hora a hora no topo e no rodapé, Enviar relatório) e deixar cada ação em um lugar só.

## 8. Testes, versão e entrega

- **Ajustar testes:** `lancamento-unificado`, `enviar-relatorio`, `ajustes-usabilidade`, `semaforo`, `total-turno`, `servidor-dia`, `hora-extra` e `turno-virada`. Onde clicam num item do menu, abrir o menu antes.
- **Teste novo `lancamento-modos`:**
  - as pílulas e o que cada modo mostra ou esconde;
  - a troca com confirmação;
  - scrap diário × por turno;
  - hora extra em um turno só;
  - menu: grupos, Esc e travas por perfil.
- **Versão:** nova versão da Produção e da plataforma, com a entrada em **Administração › Novidades**.
- **Telas:** enviar as telas antes do merge.

## Maquete

A maquete foi enviada ao responsável na conversa de 20/11/2026: hora a hora com scrap por turno, por turno com scrap diário, dia, e o menu Mais ações. Ela não está no repositório.
