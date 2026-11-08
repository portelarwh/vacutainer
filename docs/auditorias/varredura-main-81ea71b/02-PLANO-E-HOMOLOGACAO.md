# Próximas etapas propostas

Referência de código: `81ea71bb82cc62f08360684c7ce1a5df54697202`. Este é um plano para avaliação e aprovação, não uma implementação executada. Os achados e as evidências estão em [01-VARREDURA.md](01-VARREDURA.md).

## Entregas sugeridas

| Ordem | Corte de PR sugerido | Por que vem aqui | Risco principal | Validação de saída |
|---|---|---|---|---|
| 1 | NV-01 e NV-03: identidade da origem local | Evitar enviar alterações e cópias à base errada; os dois problemas compartilham a necessidade de distinguir pastas | Migração descartar pendências antigas ou interpretar cópia/backup como nova origem | S01 e S03 deixam de reproduzir; mesma pasta offline continua útil; legado sem origem não é enviado silenciosamente; três módulos testados |
| 2 | NV-02: reserva da edição entre abas do Portal/Waste | Evitar perda do snapshot pendente durante operações simultâneas | Trava permanente, recusa com mensagem de sucesso, fluxo que ignora a guarda | S02 deixa de reproduzir; mais de duas abas, lentidão, erro, fechamento e reabertura; cadastro/configuração/notas/ações/importação; modo de teste |
| 3 | NV-04: reserva em contingência | Proteger a recuperação quando o IndexedDB falha | Uma aba com IDB recuperado apaga a reserva de outra | S04 deixa de reproduzir; testar Iniciativas, Equipamentos e Paradas, falha parcial e recuperação mista |
| 4 | NV-05: saúde dos dados com escopo completo | Dar ao responsável uma leitura fiel antes da homologação | Contagem enganosa ou leitura que escreve na base alheia | S05 deixa de reproduzir; incluir snapshots, cadastro, filas e reservas; desconhecido não aparece como zero; conferir também relatório |
| 5 | Homologação H, sem ampliar funcionalidade | Validar o comportamento na pasta, navegador e estações reais | Confundir testes OPFS com garantia de rede | Roteiro abaixo preenchido com resultado, data, versões e evidências |

Os cortes 1 e 2 são P1; devem preceder a ampliação do uso concorrente. Podem ser preparados independentemente, mas a validação integrada vem depois dos dois. Se for preferível um único PR de estabilização, manter estes grupos separados em commits e critérios de aceite. Não juntar importadores ou reforma visual nesta correção.

Mudanças no kit entram por `fontes/kit/` e `aplicar_kit21.py`; mudanças em Produção entram por `fontes/producao/` e build. Rodar os testes pertinentes após cada corte; ao final executar a suíte comum e comparar os três builds. Uma reprodução deve passar a demonstrar o comportamento correto, sem trocar a expectativa apenas para aceitar o resultado atual.

## Homologação na pasta real

Usar inicialmente uma cópia de homologação identificada, com backup conferido. Os testes desta auditoria usaram dados fictícios e não tocaram o compartilhamento da fábrica.

| Caso | Procedimento | Resultado exigido |
|---|---|---|
| H1, instalação | Conferir versão de todos os HTMLs e dependências; abrir com Chrome/Edge corporativo; conectar a pasta | Versões compatíveis, permissão válida e bases próprias em `00. Bases`; nenhuma duplicata ambígua na raiz |
| H2, recuperação local | Criar alteração, interromper a disponibilidade da pasta, fechar/reabrir e reconectar | Pendência identificada e recuperável, sem mensagem falsa de gravação e sem perda |
| H3, duas abas | Editar simultaneamente em cada módulo, incluindo Portal/Waste e falha de leitura | Bloqueio ou recuperação demonstrada; nenhuma das alterações desaparece; liberação de trava correta |
| H4, duas estações | Duas pessoas alteram a mesma base ao mesmo tempo e conferem em uma terceira leitura | Alterações de ambas preservadas ou conflito explícito recuperável; registrar o que aconteceu após salvar, recarregar e fechar |
| H5, colisão tardia | Manter a estação que gravou sem retornar à página; provocar gravação concorrente e voltar depois | Documentar o alcance efetivo da recuperação de 24 h/2.000 operações; não declarar transação atômica a partir do teste básico |
| H6, origem | Trocar entre duas pastas, inclusive com o mesmo nome final, com e sem leitura disponível | Sem contaminação de bases; cópia exibida corresponde à origem; pendência antiga não é perdida |
| H7, base indisponível | Remover/renomear temporariamente uma base conhecida e depois devolvê-la | Zero recriação automática por cima; recuperação explícita; cópia local preservada |
| H8, pessoas e fila | Completar Área; criar ações por responsável e por área; alternar usuário em duas abas | Minha fila/Minha equipe corretas sem confundir pessoas de nomes iguais; pendências atualizadas |
| H9, fluxo integrado | Em Paradas, selecionar período/filtros, criar ação e OS relacionadas e consultar a ordem | Origem, vínculos, fotografia, filtros e retorno coerentes; cada página grava só a própria base |
| H10, virada do dia | Manter páginas abertas, retornar no dia seguinte e conferir a reunião por turno | Data e exports atualizados quando aplicável; fora da cobertura aparece “sem dado” |
| H11, relatórios | Comparar tela e PDF/Excel com filtros fixos e biblioteca local disponível | Totais, recortes, origem e data conferidos; nenhum item pulado descrito como aprovado |
| H12, backup | Conferir arquivo criado e restaurar uma cópia em pasta de homologação; reabrir com diário local recente | Resultado conhecido, sem reaplicação surpresa; procedimento de restauração documentado |
| H13, usabilidade | Operador e liderança executam uma tarefa real sem orientação contínua | Identificam o próximo passo, a origem e o estado de gravação; anotar dificuldades antes de reformar telas |

Não há evidência nesta varredura de execução de H1–H13 na pasta real. A validação com duas estações depende desse ambiente; o agente pode preparar casos e orientar a execução, mas não deve inventar o resultado.

## Próximo incremento depois da estabilização

Escolher a etapa com material disponível: E3b quando chegar a biblioteca, E7 quando houver amostra OSM, E9 depois de definir a coleta, E10c depois das jornadas, E12 com relatórios/regras MES, E13 com padrões técnicos e E15 com escopo. A fila de ações já existente deve receber os desdobramentos do diagnóstico da produção/paradas; não construir um segundo Planner.

Manter como registro principal `docs/auditorias/registro-decisoes.md`, `CLAUDE.md` e o plano único existente. Esta pasta acrescenta as evidências NV-01–NV-05; não substitui decisões anteriores nem aprova alterações de produto.
