# Auditoria técnica do Vacutainer em 28/11/2026

Base auditada: `portelarwh/vacutainer`, `main`, commit `13eaa6e1b96bab27e3e82aabb45bbe96df8caf8f`, Plataforma 1.8.105. A revisão abrangeu os nove motores, a casca, os componentes comuns, as ferramentas incorporadas, Operação, Manutenção e a publicação do app da linha. As referências de linha apontam para esse commit.

Os riscos de maior impacto são perda silenciosa de alterações, distorção dos consolidados de Produção e Waste e exposição de nomes nas amostras para compartilhamento. As provas usaram dados fictícios e funções do produto, com armazenamento ou relógio simulados quando necessário.

## Achados de prioridade alta

| ID | Área e defeito | Evidência e impacto |
| --- | --- | --- |
| A01 | Gel perde edição concorrente na mesma aba | A gravação captura a fila antes de reler o arquivo. Se encontra uma revisão externa, recarrega o estado e reaplica só a captura inicial. Em simulação, a segunda edição entrou após a captura. As duas gravações ficaram sem essa edição e a fila terminou vazia. `Plataforma.html:26434–26452` |
| A02 | Administração grava após falha na releitura final | Na execução isolada de `_commit`, a primeira leitura funcionou e a segunda lançou erro. O gravador foi chamado e a pendência foi limpa. Uma revisão externa entre as leituras pode ser sobrescrita. `Plataforma.html:4308–4323` |
| A03 | Produção em branco vira zero nos consolidados | Com um dia fictício sem quantidade boa informada, o diário publicou `semLancamento`, mas o mensal incluiu o dia com produção e OEE zero, scrap de 100% e 1.020 minutos de perda. Turno e catálogo também publicaram zeros. O contrato prevê excluir o dia do consolidado. `Plataforma.html:12284–12319`, `docs/CONTRATO-MOTORES.md:105` |
| A04 | Desfazer importação intermediária duplica versões no Waste | Após A → B → C para a mesma ordem, desfazer B deixou A e C vigentes. Na prova isolada, a lista ativa passou de C = 30 para A = 10 e C = 30. A agregação soma as duas. `Plataforma.html:24081`, `24117–24121`, `25127–25136` |
| A05 | Export do Waste mistura moedas sem câmbio | Com R$ 100 e US$ 100 sem taxa, o mensal publicou MUV de 200 em BRL. A tela avisa sobre a taxa ausente, mas o export não carrega esse aviso. `Plataforma.html:24088–24090`, `24186–24190`, `25250–25252` |
| A06 | Leitura atrasada pode reaplicar estado da pasta anterior | Pela leitura do fluxo, uma atualização de A pode terminar depois da troca para B e repor fontes e cadastro de A. A configuração do runtime pode então combinar a pasta B com o cadastro de A ao avaliar acesso. A ocorrência em uso real depende da ordem de conclusão das leituras. `Plataforma.html:56257–56285`, `56470–56478`, `57826–57856` |
| A07 | Comparar importação preserva nomes na amostra | Uma coluna de contato desconhecida preservou um nome fictício com “Manter descrições” desmarcado. A conferência ficou verde, pois busca certos códigos com dígitos. A prova observou apenas a saída local da ferramenta. `Plataforma.html:56005–56010`, `56048–56070` |

## Demais achados

| ID | Área | Comportamento e referência |
| --- | --- | --- |
| A08 | Produção | Com um equipamento `MEDIDOR` de papel OEE, o cadastro deriva `mac_medidor` e dispensa o ponto virtual. O lançamento ainda grava `mac_line`, que pode ficar sem referência e sem a meta específica. `Plataforma.html:8892–8896`, `9717–9720`, `13243` |
| A09 | Gel | A fila principal vazia faz a conexão pular a reserva `fsPending.reserva`. A gravação também trata a ausência de um arquivo anteriormente carregado como estado inalterado e pode recriá-lo da cópia local. `Plataforma.html:26424–26438`, `26714` |
| A10 | Paradas | Uma atualização concorrente pode fazer a aplicação descartar linhas do lote. A gravação confirma a operação inteira e a mensagem usa a contagem da prévia. `Plataforma.html:32701–32710`, `32787–32795`, `33806–33813` |
| A11 | Equipamentos | A reaplicação da fila valida o ID, mas deixa duas vigências da mesma TAG com a mesma data. A vigência selecionada passou a depender da ordem das operações na simulação. `Plataforma.html:732`, `34230`, `34473` |
| A12 | Linha 360° | O commit troca o ID de conclusão do checklist pelo ID da operação. O comando “Desfazer a marcação” entra na fila sem remover a conclusão. `Plataforma.html:35538`, `35644`, `36721` |
| A13 | Iniciativas | Campos CSV com vírgula entre aspas deslocam as colunas. O importador também aceita 31/02 e trata repetições dentro do lote como novas. O formulário de ação usa um seletor único para equipamentos, embora Linha 360° envie vários vínculos. `Plataforma.html:34956–34960`, `34981–35003`, `36393` |
| A14 | Escopos | Dois registros concorrentes da mesma pasta geraram escopos diferentes para a mesma pasta e só um ficou persistido. O par pasta e escopo também é escrito em operações separadas. `Plataforma.html:58463–58473` |
| A15 | Casca | Um export contendo `porOrdem: [null]` foi aceito e quebrou a busca executada durante a renderização. A casca também aceitou export sem versão e encontrou uma base presente só na raiz. Uma cópia antiga na raiz colocou em somente leitura um cenário com base canônica válida em `00. Bases`. `Plataforma.html:56487`, `57470–57486`, `57536–57590`, `57645–57652` |
| A16 | Abertura de módulo | A proteção de pasta aguarda operações sem prazo antes de criar o iframe. Se essa etapa falhar, o botão de nova tentativa chama a conexão sem que o iframe tenha sido criado. Evidência por leitura do fluxo. `Plataforma.html:57209–57217`, `57955–57979` |
| A17 | Datas da casca | Com o relógio em 28/11/2026 às 01h UTC, ainda era dia 27 na planta em São Paulo. “Ontem” retornou dia 27, em vez de dia 26. `Plataforma.html:56234`, `57600–57621` |
| A18 | Verificar pasta | Um cadastro com formato zero e versão atual de app recebeu OK. Um arquivo contendo JSON `null` gerou exceção e encerrou a varredura inteira. `Plataforma.html:55625–55643`, `55735–55736` |
| A19 | Linha no celular | Um pacote só de Operação liberou Manutenção com opções de exemplo. Importar a revisão 10 substituiu a revisão 20 armazenada e seus metadados. As metas por turno ficam ocultas quando o pacote do dia não tem plano mensal. `CELULAR/linha.html:66–69`, `106`, `113–128` |
| A20 | Meu Turno | O fluxo genérico de reabertura pode selecionar outro turno ativo. O cadastro diário armazenado também oferece ordens e lotes sem conferir o dia. Na prova da fórmula, zero bons e dez descartados retornou percentual ausente, em vez de 100%. `CELULAR/index.html:2448–2453`, `2491–2501`, `2526–2528`, `2575`, `2610` |
| A21 | Persistência móvel | Erros de gravação local são ignorados em caminhos que mostram sucesso. A transação de foto registra conclusão, mas não propaga falha ou abortamento, o que pode deixar o fluxo pendurado. Evidência por leitura do código. `CELULAR/index.html:2411`, `2458`, `2537`, `2559`, `2676`, `CELULAR/manutencao.html:2401–2405`, `2470` |
| A22 | App publicado | Com respostas simuladas, a ativação removeu o cache de outro app na mesma origem, uma resposta 503 foi gravada e um recurso offline recebeu HTML. O gatilho de publicação também omite `scripts/html.cjs`, dependência direta da montagem. `scripts/celular-site.mjs:11`, `40–44`, `.github/workflows/app-linha.yml:8` |

## Verificação

- Build, reprodutibilidade, lint, regras de lint, 79 testes unitários, suíte do Meu Turno e geração do site passaram localmente.
- As quatro partições de regras do CI no commit auditado somaram 69 suítes aprovadas. A suíte da plataforma interrompeu em `testes/plataforma/entrada.cjs:47`, aguardando o iframe da Administração. O teste passou isoladamente. [Execução do CI](https://github.com/portelarwh/vacutainer/actions/runs/46097598444) · [Job da plataforma](https://github.com/portelarwh/vacutainer/actions/runs/46097598444/job/140832439757)
- Os 27 testes posteriores à interrupção foram executados localmente. Vinte e seis passaram de primeira. `lancamento-unificado.cjs:30` encontrou dois cartões onde esperava três e passou em nova execução isolada.
- A evidência de persistência e navegador cobre Chromium local, OPFS e simulações. A homologação em SMB, com duas estações, Outlook corporativo e celulares físicos permanece pendente.
