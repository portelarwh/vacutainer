**Vacutainer — ordem recomendada após a revisão de 8cad6a6**

Este é um plano proposto, não implementação. O diagnóstico e os aceites detalhados estão em [01-DIAGNOSTICO-ATUAL.md](01-DIAGNOSTICO-ATUAL.md). Os IDs AT pertencem a esta revisão. Etapas E pertencem ao plano único anterior. P1 protege alterações/recuperação; P2 melhora confiabilidade e jornadas; P3 é refinamento.

**1. Primeira entrega: proteger o trabalho nas páginas novas**

Eu aprovaria primeiro C1 e C2 abaixo, seguidas de homologação da pasta. As demais correções podem ser pequenas entregas focadas. Os tamanhos são relativos: P = pequeno, M = médio; não são promessa de prazo.

| Recorte futuro | IDs / objetivo | Fontes e dependências | Risco / validação |
|---|---|---|---|
| C1 — alterações e recuperação, P1/M | AT-01/02: fila durável entre abas e base desaparecida sem reinício silencioso | Iniciativas e Equipamentos. Preservar base/formato e operações existentes | Perder operação antiga na transição. Testar fila anterior, duas abas, falha local, falta de rede, base removida, reabertura e retomada. Não descartar a fila antiga antes de confirmar migração |
| C2 — validação, P2/P | AT-03/11: schema próprio suportado e protocolos de origem seguros | Validadores nas duas páginas; links em Iniciativas. Não requer material de negócio | Bloquear legado legítimo ou links de pasta. Fixtures de cada formato suportado; zero escritas em versão desconhecida; links internos/HTTPS/arquivo válidos e javascript/data recusados |
| C3 — atualização da tela/publicação, P2/P | AT-04/10: retomar após virar o dia e trocar a pessoa no Portal | Iniciativas, Equipamentos, Portal; mecanismo atual de gravação | Gravação concorrente e formulário em edição. Testar virada local, aba suspensa, permissão perdida, fila pendente e troca real pelo Entrar |
| C4 — identidade/contexto da consulta, P2/M | AT-05/08/12: rota inicial, pasta do cache e chave de ordem | Equipamentos/Iniciativas; fonte do kit, aplicar_kit21 e build da Produção | Regressão nas oito páginas. Links antigos, códigos como texto, pastas com metadados iguais e ordem com/sem zeros |
| C5 — reunião e reconsulta, P2/M | AT-06/07/09: indisponível versus zero, todas as ordens e filtros reproduzíveis | Portal, Paradas; contratos aditivos quando necessário | Alterar interpretação de histórico. Mesmos números em tela/PDF/texto; múltiplas ordens; fonte sem cobertura; abrir link em estação limpa |
| C6 — cobertura dos testes/distribuição, P2/P | Rótulos corretos de falta de dependência; telas novas com exemplo na suíte visual; validar download Excel de verdade | Testes e documentação; E3b para testar Excel com biblioteca da linha | Falso positivo. Ausência vira “não verificado/dependência ausente”, nunca aprovação incondicional. Manter fontes/HTMLs gerados iguais |

C2 pode ser separado em dois PRs se a regra de legado exigir discussão. C3–C5 podem avançar independentemente após os contratos serem definidos. Não é necessário reabrir todas as persistências nem fundir geradores para esses reparos.

**Critério para ampliar o uso:** C1 concluída, formatos/links seguros, recuperação verificada e cenários principais da pasta real registrados. As pendências de contexto/relatório devem ficar corrigidas ou claramente restringidas no piloto. Não anunciar “duas estações sem perda” com base apenas no teste de releitura rápida.

**2. Homologação que falta**

Usar [03-HOMOLOGACAO-PASTA-REAL.md](03-HOMOLOGACAO-PASTA-REAL.md). Os quatro pontos informados pelo responsável estão contemplados: bases novas em 00. Bases, Área dos usuários, ação criada no Paradas e duas estações.

Acrescentei duas abas offline, retorno depois de 30 minutos, base que some, leitura sem internet, restauração e virada do dia. A necessidade de teste ampliado vem dos achados reproduzidos e dos limites da persistência por arquivos, não de uma exigência de servidor.

**3. Material/decisão que continua necessário**

| Etapa | Precisa de quê | O que já dá para preparar | Aceite da entrega futura |
|---|---|---|---|
| E3b — Excel offline | xlsx.full.min.js 0.20.3 da pasta da linha, origem/licença e hash | Inventário e verificação da instalação | Checkout/distribuição limpa importa e exporta Excel offline; versão efetiva verificável |
| E7 — OSM | Amostra descaracterizada com cabeçalho, ID oficial, datas/status e indicação de extrato completo/parcial | Contrato de importação e regras de preservação de ações | Reimportar sem duplicar observação nem apagar responsável, ação ou histórico local. Status oficial separado do local |
| E9 — leitura de pastas | Qual estação coleta cada fonte, disponibilidade e permissões | Núcleo manual/avisar por fonte e testes de pacote estável | Arquivo parcial/corrigido/renomeado não duplica; falha de gravação permite retomar; dois leitores tratados; página fechada não promete coletar |
| E10c — jornadas | Lista curta do que operador, liderança, PCP, qualidade e manutenção fazem diariamente | Proposta de navegação e resumo para validar em piloto | Mesmas fórmulas/filtros em Resumo/Detalhado; foco simplificado, ações permitidas e estado preservado |
| E12 — MES | Amostras SQL por arquivo, formato de eventos/transições, fuso, unidade, ponto oficial e impacto no OEE | Contrato de intervalos e cenários, sem inventar parser de máquina | Conciliação vários-para-vários, cronologia, lacunas e reimportação; dia fechado não muda silenciosamente |
| E13 — AM/TPM/5S | Procedimentos, pontos, faixas, periodicidades e habilitações aprovados | Estrutura de padrão/revisão/execução | Execução guarda a revisão aplicada; não conformidade gera anomalia/OS/ação vinculada; nenhum procedimento inventado |
| E15 — Projetos | Escopo, usuários e método de benefício | Relação com KAS/ações e carteira conceitual | Não transformar toda ação em projeto nem contar o mesmo ganho em mais de uma frente |

**4. Ideias para priorizar depois da estabilização**

| ID | Melhoria | Motivo e menor entrega útil | Depende de material? |
|---|---|---|---|
| EV-01 | Saúde das fontes no Portal | Última leitura/publicação, cobertura, atraso, fila e backup confirmado, reaproveitando Versões/Diagnóstico | Não para o básico |
| EV-02 | Relatório por responsável/equipe | Lista de abertas/atrasadas, tempo por status/responsável e concluídas no recorte; definir coortes e denominadores | Método/recorte a validar; sem SLA presumido |
| EV-03 | ID estável das pessoas | Responsável/apoios com ID e nome histórico; evita fragmentação ao renomear ou homônimos | Política para registros livres e migração |
| EV-04 | Eficácia OEE/KAS | Campo de evidência após concluir e comparação com linha de base validada | Método de ganho, período e avaliador |
| EV-05 | Reunião: ao vivo/foto salva | Escolha explícita do que entra no relatório; fotografia com fontes, revisões e recorte | Não para a estrutura; validar ritual |
| EV-06 | Agenda de OS | Datas e responsáveis das OS já existentes, com visão semanal e filtro por equipamento | Recorrência preventiva espera padrões |
| EV-07 | Resumo no celular | Fila/pauta acessíveis sem percorrer todos os cards; Lista/Minhas com padrão apropriado | Validar com usuários, usando o conteúdo atual |
| EV-08 | Calendário/produção → Gel e Portal | Fechar integrações antigas pendentes, sem criar outro editor de calendário | Fonte/contrato atual permitem começar; premissas de previsão devem ser aprovadas |
| EV-09 | Waste com resumo único | Reduzir repetição e melhorar pauta de perdas sem mudar fórmulas | Não |
| EV-10 | Recuperação das bases novas | Última cópia confirmada, exportar pendência e procedimento de restauração | Política de recuperação a aprovar; não depende de MES |

EV-01/02/05 têm bom retorno para liderança e relatórios; EV-06/07 reduzem esforço diário. São propostas, não pendências que bloqueiam todas as entregas. Eu manteria o número atual de páginas.

**5. Manutenção do código**

- Manter o modelo de HTML autônomo e o comum embutido pelas fontes do kit. Corrigir a fonte comum e gerar as páginas quando a mudança for do kit.
- Novas persistências semelhantes exigem testes de contrato comuns, especialmente de falha e recuperação. Isso pode reduzir o risco de corrigir uma página e esquecer a outra sem reescrever todas as bases.
- Dividir funções extensas quando a próxima alteração exigir, com comportamento fixado por testes. Não há ganho demonstrado em refatorar tudo agora.
- Compartilhar modelo de relatório/adaptadores progressivamente. Resumo executivo, cobertura e origem são regras de conteúdo, não consequência automática de um motor PDF único.
- Documentar versões das dependências e um comando de teste reprodutível quando isso for priorizado. A suíte precisa distinguir problema do sistema, falha do teste e dependência ausente.

**Recomendação de decisão:** autorizar uma rodada de estabilização C1/C2, executar a homologação com responsáveis e, em seguida, concluir C3–C5. Priorizar OSM assim que chegar a amostra; manter MES/TPM/Projetos condicionados às definições reais. O produto já oferece utilidade suficiente para aprender com um piloto, e a prioridade imediata é confiar no trabalho que ele registra.
