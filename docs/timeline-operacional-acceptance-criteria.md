Critérios de Aceite - Timeline Operacional de Produção
CA-01 - Exibição da Timeline Macro

Dado que o usuário acessou a página de produção,

Quando selecionar uma data, turno ou período personalizado,

Então o sistema deve exibir uma timeline horizontal consolidada contendo os estados:

Produzindo
Parada
Bloqueada
Ociosa

E cada estado deve possuir uma cor padronizada.

CA-02 - Filtros Operacionais

Dado que existem registros no sistema,

Quando o usuário alterar qualquer filtro,

Então a timeline deve ser recalculada automaticamente.

Filtros mínimos:

Data
Turno
Período Personalizado
Linha
Máquina
Tipo de Parada
Origem do Registro
CA-03 - Exibição dos KPIs do Período

A página deve exibir obrigatoriamente:

Tempo Total do Período
Tempo Produção Útil
Tempo Parado
Tempo Bloqueado
Tempo Ocioso
% Produção Útil

Os valores devem refletir exatamente o período filtrado.

CA-04 - Cálculo da Produção Útil

Produção Útil deve considerar exclusivamente os períodos classificados como:

Produzindo


Períodos classificados como:

Parada
Bloqueada
Ociosa


não podem compor o cálculo.

CA-05 - Exibição da Timeline por Máquina

Dado que uma linha possui máquinas cadastradas,

Quando forem carregados os dados da timeline,

Então deve ser exibida uma linha temporal individual para cada máquina.

Exemplo:

Tubing

Silica

Packout

Inspeção

Rotulagem


Cada máquina deve apresentar seu histórico operacional de forma independente.

CA-06 - Atualização Automática

A timeline deve ser atualizada automaticamente quando ocorrer:

Cadastro manual de ocorrência
Edição de ocorrência existente
Exclusão de ocorrência
Importação de eventos MES
Atualização de tags de parada

Sem necessidade de atualização manual da página.

CA-07 - Fonte dos Eventos

O sistema deve aceitar eventos oriundos de:

Operador
MES
Tags Automáticas

Todos os eventos devem alimentar a mesma estrutura de timeline.

CA-08 - Exibição dos Detalhes da Ocorrência

Quando o usuário clicar em qualquer bloco da timeline,

Então deve ser aberto um modal ou painel lateral apresentando:

Máquina
Estado
Motivo
Data/Hora Início
Data/Hora Fim
Duração
Origem
Responsável
Comentário
CA-09 - Campo Comentário

Quando existir comentário cadastrado para a ocorrência,

Então ele deve ser exibido integralmente no painel de detalhes.

Exemplo:

Comentário:

Falta de sílica identificada no abastecimento.
Aguardando recebimento do material.

CA-10 - Exibição da Duração da Ocorrência

Toda ocorrência deve apresentar:

Horário de início
Horário de término
Duração calculada

A duração deve ser recalculada automaticamente caso o horário seja alterado.

CA-11 - Consolidação de Eventos

O sistema não deve gerar períodos sobrepostos na timeline.

Caso existam registros para o mesmo intervalo de tempo, deve ocorrer consolidação automática.

Prioridade:

1. Operador validado
2. MES
3. Tags

CA-12 - Reconstrução Completa da Timeline

A timeline deve ser reconstruída integralmente utilizando:

Hora de início
Hora de fim
Estado atribuído

independentemente da origem dos dados.

Não serão permitidos intervalos sem classificação dentro do período analisado.

CA-13 - Tooltip Operacional

Ao posicionar o cursor sobre qualquer bloco da timeline, o sistema deve exibir:

Estado
Máquina
Duração
Início
Término
Motivo

Sem necessidade de clique.

CA-14 - Escalas de Visualização

A timeline deve suportar:

Dia
Turno
Período Personalizado

Sem perda de precisão temporal.

CA-15 - Performance

Para uma consulta contendo:

Até 30 dias
Até 50 máquinas
Até 100.000 eventos

O carregamento completo da timeline deve ocorrer em até:

5 segundos

CA-16 - Responsividade

A visualização deve funcionar corretamente em:

Desktop Full HD
Notebook
Monitor Ultrawide

Com scroll horizontal quando necessário.

CA-17 - Legenda Fixa

A legenda dos estados deve permanecer visível durante toda a navegação.

Estados:

🟩 Produzindo
 🟥 Parada
 🟧 Bloqueada
 ⬜ Ociosa

CA-18 - Consistência dos Dados

A soma dos tempos:

Produzindo
+
Parada
+
Bloqueada
+
Ociosa


deve ser exatamente igual ao período filtrado.

Exemplo:

Turno = 480 min

Produzindo = 360 min
Parada = 60 min
Bloqueada = 40 min
Ociosa = 20 min

Total = 480 min

CA-19 - Rastreabilidade

Todo bloco exibido na timeline deve possuir rastreabilidade para identificar:

Origem do dado
Usuário que registrou
Data/Hora da criação
Última atualização
CA-20 - Critério Final de Aprovação

A implementação será considerada aprovada quando um usuário conseguir responder, apenas utilizando a timeline:

Quanto tempo a linha produziu?
Quanto tempo ficou parada?
Qual máquina gerou a perda?
Qual foi o motivo?
Quando iniciou?
Quando terminou?
Quanto tempo durou?
Quem informou a ocorrência?
Qual comentário foi registrado?
Como as perdas se distribuíram durante o turno, dia ou período consultado?


## Validação (Produção 2.5.0 · 17/11/2026)

Verificação automática em `testes/ttimeline.js` (regras, três origens, tela e volume) e `testes/plataforma/timeline.cjs` (dentro da plataforma, em 1366, 1920 e 3440 px). Dados fictícios.

| Critério | Situação | Como foi verificado |
|---|---|---|
| CA-01 | Atende | Faixa da linha com os quatro estados; quatro cores distintas na legenda |
| CA-02 | Atende | Data, Turno, Período, Linha, Máquina, Tipo de parada, Origem (e Estado); origem, tipo e máquina mudam os tempos |
| CA-03 | Atende | Seis indicadores na tela; turno de 480 min e período de 08:00 a 10:00 conferidos ao minuto |
| CA-04 | Atende | Produção útil = só Produzindo (395 de 480 min no cenário) |
| CA-05 | Atende | Uma faixa por máquina do cadastro, com tempos independentes |
| CA-06 | Atende, com ressalva | Cadastro, edição, exclusão, MES e tag atualizam a tela sem recarregar. De outra estação, a mudança chega na releitura da pasta (60 s) |
| CA-07 | Atende, com ressalva | Operador, MES e tags na mesma estrutura. MES e tags entram por importação de arquivo, não por conexão direta |
| CA-08 | Atende | Modal "Detalhes da Ocorrência" com os nove campos (e linha, código, ordem, lote) |
| CA-09 | Atende | Comentário inteiro, com quebras de linha |
| CA-10 | Atende | Início, fim e duração; mudar o fim de 08:35 para 08:50 leva a duração de 25 para 40 min |
| CA-11 | Atende | Operador validado > MES > tags, intervalo dividido, sem duplicar (60 min, e não 125) |
| CA-12 | Atende | Trechos contínuos do início ao fim do período; sem registro vale o estado padrão |
| CA-13 | Atende | Tooltip com estado, máquina, início, término, duração e motivo |
| CA-14 | Atende | Dia, Turno e Período personalizado; evento de 30 s contado como 0,5 min |
| CA-15 | Atende | 30 dias, 50 máquinas, 100.000 eventos: carregamento em 0,5 s neste ambiente (limite 5 s) |
| CA-16 | Atende | Notebook, Full HD e ultrawide sem rolagem lateral da página; rolagem horizontal dentro da linha do tempo |
| CA-17 | Atende | Legenda visível ao rolar a linha do tempo para os lados e para baixo |
| CA-18 | Atende | Soma dos quatro estados = período, no cenário e em cada uma das 50 faixas do teste de volume |
| CA-19 | Atende | Origem, responsável, criação e última alteração nos detalhes |
| CA-20 | Atende nos testes | As dez perguntas são respondidas pela faixa, pelos detalhes e pela tabela de ocorrências. Falta o aceite do responsável funcional com dados reais |
