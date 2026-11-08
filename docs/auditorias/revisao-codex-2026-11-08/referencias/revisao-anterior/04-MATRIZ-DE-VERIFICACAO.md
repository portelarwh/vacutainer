**Vacutainer — matriz para revisão independente**

Referência: commit `e0435136359847e07a2a775a1d7eea31371495b8`. A consulta ao `main` remoto nesta consolidação retornou o mesmo SHA. Escopo atual: inspeção e documentos novos externos ao repositório, sem implementação.

**1. Proveniência das conclusões**

| Informação | Tipo de evidência | Limite |
|---|---|---|
| F01–F10 do diagnóstico | Código e cenários sintéticos executados na etapa anterior | Verificar representatividade das simulações, caminho do HTML gerado e abrangência das conclusões |
| F11 | Biblioteca ausente no checkout e carregamento em página nova com navegador offline | Não comprova ausência do arquivo na pasta de rede real, que não foi acessada |
| Oito suítes existentes sem erros | Logs em `referencias/diagnostico-inicial/evidencias/` | Executadas antes; usam adaptação HTTP local/Chromium. Não reexecutadas nesta consolidação |
| Gel monitora pasta | Inspeção estática de `fsWatch`, configuração e timer | Não houve nova homologação de leitura automática na rede real |
| Waste tem pasta, mas importação acionada pelo usuário | Inspeção estática de `renderEntrada`, `readFile` e timer `syncNow` | Delimitado ao fluxo de entrada encontrado; não inferir garantia sobre todos os caminhos sem conferir |
| MES atual usa catálogo/lote/caixas | Leitura de `ServerData.parseCsv` e fluxos de sugestões | Não equivale a um motor genérico de TAGs/estados por equipamento |
| Planner OSM/KAS/OEE, TAGs e TPM detalhado | Necessidades do usuário e propostas técnicas | Não implementados nem validados com amostras reais |

**2. Arquivos a confrontar**

Para localizar na cópia `codigo-analisado-e043513.zip`, os caminhos abaixo são relativos à raiz do projeto. Não editar o HTML gerado da Produção nem rodar o build na árvore original para fazer a revisão.

| Item | Arquivo / ponto de partida | Pergunta crítica |
|---|---|---|
| F01 | `fontes/producao/OEE-base-2.0.html:1618`; `fontes/producao/build.py:58`; `fontes/producao/ordens_tela.js:26` | O leitor auxiliar distingue ausência de erro? A base real pode ser sobrescrita com conteúdo local antigo? Quais cópias de recuperação poderiam existir? |
| F02 | `fontes/producao/ordens_tela.js:40` | Há confirmação efetiva depois da escrita? Qual tratamento para colisão na mesma competência ou em competências diferentes? |
| F03 | `fontes/producao/ordens_tela.js:38` | Substituição continua com backup falho? Nomes de backup podem colidir? Separar backup crítico de rotina diária já discutida |
| F04 | `fontes/producao/OEE-base-2.0.html:1616` e linha 1620 | A segunda chave `readBackup` substitui a primeira no HTML distribuído? Listagem e botões passam `legacy`? |
| F05 | `paginas/Perdas-Ordem.html:919` e linha 2188 | Meta usada em painel, tendências e relatório respeita cada competência? Regra de mês parcial está definida? |
| F06 | `paginas/Perdas-Ordem.html:1587`, linha 1608; `fontes/producao/ordens_tela.js:64` | Quais leitores aceitam versão incompatível? Não generalizar a falha aos leitores que já têm proteção |
| F07 | `paginas/Perdas-Ordem.html:1590` | A ordem repetida em competências distintas perde informação? Há regra de preferência ou dependência da ordem do array? |
| F08 | `paginas/Perdas-Ordem.html:1617`; `fontes/producao/OEE-base-2.0.html:7790` | O lote está na chave ou no valor de `dayLot`? O contrato publicado já cobre todos os dias necessários? |
| F09 | `paginas/Perdas-Ordem.html:1640`, linha 1787 | Quais links perdem ordem/dia/LP? O destino já aceita o parâmetro? Quais filtros a rota preserva? |
| F10 | `paginas/Perdas-Ordem.html:780` e linha 783; `paginas/Gestão-Gel-Vacutainer.html:880` e linha 1272 | Conferir versão exibida, exportada, detectada pelo Portal e gravada; não corrigir bases antigas artificialmente |
| F11 | `paginas/lib/`; `paginas/Perdas-Ordem.html:1043` e leitores equivalentes | A distribuição limpa é autossuficiente sem CDN? O teste realmente começa sem biblioteca/cache? |
| IMP | `paginas/Gestão-Gel-Vacutainer.html:1629`, linha 1664 e linha 7227 | Pasta, intervalo, identidade do arquivo, risco de importação e dependência de página aberta |
| IMP | `paginas/Perdas-Ordem.html:2301`, linha 2465; `fontes/producao/OEE-base-2.0.html:8201`; `paginas/Paradas.html:1421` | Distinguir timer de base e timer de ingestão; examinar formatos e política por fonte |
| MES | `fontes/producao/OEE-base-2.0.html:3144` e linha 7670 | O que o MES atual já faz? O que é inferência por caixa/lote e o que é medição de estado? |
| Conciliação | `paginas/Paradas.html:696` | Limites da deduplicação aproximada atual e compatibilidade com o modelo futuro |
| TAG/TPM/Planner | `fontes/modelo/gerar_paginas.py:12`; `docs/osm-arquitetura.md`; `docs/plano-evolucao-plataforma.md:276` | Distinguir abas planejadas de persistência real; identificar propostas antigas substituídas pelas novas decisões |

Os números de linha são do commit fixo. Se forem usados outros commits, localizar símbolos e citar o SHA efetivamente examinado.

**3. Casos para desafiar o fluxo por arquivos**

São cenários de verificação propostos. Não foram executados nesta etapa, salvo quando já cobertos e documentados nos logs históricos.

| Caso | Resultado esperado para o desenho futuro |
|---|---|
| Relatório sendo escrito quando o timer dispara | Não importar conteúdo parcial como pacote válido |
| Nome temporário ou arquivo `~$` | Ignorar sem bloquear o arquivo real |
| Mesmo conteúdo renomeado | Não duplicar fatos |
| Mesmo nome com conteúdo corrigido | Identificar revisão e atualizar cobertura correta, com histórico |
| Arquivo incremental atrasado | Não descartá-lo apenas porque há um arquivo mais recente |
| Extrato parcial sem registro que existia antes | Não inferir exclusão ou fechamento |
| Data de extração mais nova e cobertura mais antiga | Mostrar cobertura real; não confundir atualização do arquivo com atualização dos fatos |
| Falha ao ler/gravar/reler a base | Não marcar importado nem dar sucesso falso; permitir retomada |
| Duas estações importando o mesmo pacote | Detectar/reconciliar conflito e evitar duplicata, sem depender de suposição de trava absoluta |
| Computador suspenso/aba sem permissão | Indicar atraso/necessidade de autorização e retomar ao retornar |
| Todos os navegadores fechados | Nenhuma promessa de processamento; exportador externo é etapa independente |
| Fontes diferentes na mesma pasta | Não escolher arquivo de outro módulo só por ser o mais recente |

**4. Casos para OSM, KAS, OEE e Planner**

| Caso | O que verificar |
|---|---|
| Mesma OSM em duas extrações | Uma identidade oficial e trabalho local preservado |
| OSM oficial muda texto/risco/status | Origem atualiza; impacto no tratamento local aparece sem apagar histórico |
| OSM some de extrato filtrado | Ação não é cancelada nem apagada |
| OSM oficial encerrada, ação local aberta | Dois estados visíveis e política explícita; sem falso envio de atualização ao oficial |
| Atribuição A → B → A | Tempo de cada trecho contado para o responsável correto; idade total não fica com o último dono |
| Ação sem dono depois de transferência | Tempo sem responsável aparece separadamente |
| Espera, novo prazo, conclusão e reabertura | Relógios e prazo original mantidos, segundo regra definida |
| Importação de observação muito antiga | Defasagem de importação distinta da idade da ação local |
| Abrir ação de OEE a partir de Pareto já tratado | Oferecer vínculo a ação existente e preservar evidência/filtros |
| Uma iniciativa KAS/OEE tem várias ações | Não considerar iniciativa eficaz apenas porque uma tarefa terminou |
| Prioridade de segurança versus impacto financeiro | Não reduzir risco de segurança por comparação inadequada de valores |
| Mesmo ganho atribuído a KAS, OEE e Projeto | Benefício validado único, com vínculos e método |

**5. Casos temporais e de OEE para MES**

| Caso | O que verificar |
|---|---|
| Intervalos adjacentes | Limites não contam o mesmo instante duas vezes |
| Um manual cobre vários eventos MES | Conciliação vários-para-vários sem descartar evidência |
| Sobreposição parcial com durações divergentes | União/interseção e excedentes explícitos; nenhuma soma cega |
| Apenas MES / apenas manual | Acrescentar/preservar com origem, cobertura e política de validação |
| Manual tem só duração dentro da hora | Não atribuir início/fim exatos fictícios |
| Evento cruza meia-noite, turno ou ordem | Preservar evento original e recortar por janela sem perda/duplicata |
| Evento começa antes do extrato e termina dentro dele | Obter estado/fronteira anterior ou marcar incerteza |
| Evento aberto no fim da cobertura | Exibir aberto; não prolongar estado conhecido indefinidamente |
| Duas TAGs conflitantes da mesma máquina | Precedência/regras versionadas e explicação; sem estados sobrepostos na faixa consolidada |
| TAG sem qualidade/falha de comunicação | Sem dados, não produção/parada presumida |
| Contador acumulado reseta ou muda escala | Não criar perda/produção falsa; registrar revisão/regra |
| Máquina bloqueada e outra parada | Distinguir efeito local e impacto real da linha |
| Duas máquinas param simultaneamente | Somatório de minutos-máquina separado de tempo da linha |
| Arquivo repetido ou evento corrigido/cancelado | Mesma identidade, revisão e decisão preservada/reavaliada |
| Nova regra de TAG entra em vigor | Resultado antigo identifica regra usada; reprocessamento é explícito |
| Evento conciliado retorna pela exportação do OEE | Não reimportar como origem nova: impedir ciclo de realimentação |
| Fonte tardia afeta turno fechado | Divergência/reabertura controlada, sem mudar indicador silenciosamente |
| Exportações limitadas a período recente | Cronologia/ordem antiga não aparece como zero ou inexistente sem aviso |

O tempo total de produção deve ter fórmula explícita. Tempo no estado Produzindo, tempo operacional e tempo ideal de produção não são automaticamente a mesma medida. A fonte pode fornecer só estado e contador, sem qualidade/refugo necessários ao OEE completo.

**6. Casos para TPM/AM e checklists**

| Caso | O que verificar |
|---|---|
| Revisão de checklist/padrão após execução | Histórico mantém itens e limites usados no momento |
| Item não conforme | Pode abrir anomalia com equipamento, responsável e encaminhamento |
| Item não aplicável | Motivo e efeito no cumprimento do plano explícitos |
| Center Line fora de faixa | Comparação usa padrão aprovado/vigente, sem inventar faixa técnica |
| Lubrificação/CILT ainda sem detalhes | Necessidade permanece registrada, sem procedimentos fictícios |
| Anomalia gera OS e ação de melhoria | Relações preservadas; ciclos e fechamento não se duplicam |

**7. Forma do parecer esperado**

1. Estado do código e SHA efetivamente examinado.
2. Resumo das conclusões, com discordâncias relevantes do diagnóstico anterior.
3. Tabela F01–F11: confirmado/parcial/refutado/não verificável, evidência, impacto e recomendação.
4. Avaliação de viabilidade por grupos de IDs do backlog, separando pedido do usuário e proposta técnica.
5. Correções ao modelo de dados/contratos, cálculos temporais e responsabilidade de módulos, sempre dentro da restrição por arquivos.
6. Dependências e amostras que faltam, sem inventar regras de negócio.
7. Sequência sugerida de entregas com critérios de aceite, sem implementação.

Se houver impossibilidade de executar um teste, registrar o bloqueio real e o que foi apenas inspecionado. Não usar ausência de reprodução como prova de ausência do defeito. Não usar um documento histórico como prova de que a implementação está entregue.
