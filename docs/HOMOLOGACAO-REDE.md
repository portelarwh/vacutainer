# Roteiro de homologação · pasta de rede e duas estações (26/11/2026)

Objetivo: provar em rede real o que a análise comum só provou por simulação (casos C10 a C13 e o resumo em `Relatórios Atualizações/2026-11-26-analise-comum.md`). Todos os testes usam uma **pasta de teste** com a base de demonstração; nunca a pasta de produção.

## Preparação
1. Crie na rede uma pasta nova (ex.: `\\servidor\vacutainer-teste`) e, nela, abra a plataforma pela primeira vez (roteiro [PRIMEIRO-USO](PRIMEIRO-USO.md)). Cadastre duas pessoas de teste (ID A e ID B) com perfil que grave em todos os módulos.
2. Estação 1 e estação 2: Chrome ou Edge, cada uma com a pasta conectada e uma pessoa diferente logada. Anote versão da plataforma e do navegador.
3. Em cada teste, anote: horário, quem fez, o que apareceu na tela e o conteúdo final do arquivo em `00. Bases/`.

## Casos
| # | Cenário | Passos | Esperado | Origem |
|---|---|---|---|---|
| H1 | Gravações alternadas | E1 altera uma nota no Gel; E2 altera outra logo em seguida; repita 10 vezes nos 4 módulos (Gel, Waste, Administração, Paradas) | As duas alterações aparecem nas duas estações; `rev` só sobe; nenhuma perda | C12 |
| H2 | Gravação no mesmo instante | E1 e E2 salvam a mesma tela ao mesmo tempo (combinem a contagem em voz) | Uma vence sem apagar a outra, ou o sistema avisa conflito; nada some em silêncio | C12 |
| H3 | Perda de acesso por instantes | Na E1, desconecte o cabo/Wi-Fi por 10 s durante uma gravação do Gel; reconecte | A alteração fica na fila, aparece "não consegui gravar" e grava depois; o arquivo da E2 não é sobrescrito | C10 |
| H4 | Gravação com a pasta bloqueada | Na E1, abra o arquivo da base em outro programa que o trave; grave no Gel | Aviso claro, fila preservada, sem arquivo vazio ou truncado | C10 |
| H5 | Base de outra versão | Troque `schemaVersion` do arquivo da Administração por 99 (cópia), com uma alteração pendente na E1; conecte | A Administração não sobrescreve; mostra o aviso de versão | C11 |
| H6 | Restauração com fila | Na E1 deixe uma alteração pendente (pasta indisponível) e tente restaurar um backup do Paradas | A restauração é recusada até gravar a fila; backup sem versão também é recusado | C13 |
| H7 | Backup por pasta | Conecte a E1 a duas pastas diferentes, uma com falha de backup forçada | O aviso de falha aparece só na pasta em que ocorreu | C14 |
| H8 | Lentidão | Meça a abertura de cada módulo na E1 e na E2 (cronômetro, do clique até a tela pronta) | Anote os tempos; referência da análise: até 3 s na primeira abertura | C34 |
| H9 | Arquivo histórico | Gere mais de 3.000 eventos na Administração (ou use a base de teste cheia) e confira `00. Backups/<módulo>/historico-auditoria_AAAA-MM.jsonl` | O que saiu da lista ativa está no arquivo do mês; arquivos com mais de 12 meses somem | P4 |

## Critério de aceite
Todos os casos H1 a H7 sem perda de dado e sem arquivo truncado; H8 e H9 registrados. Qualquer perda de dado em H1 a H6 reprova a liberação da gravação compartilhada e abre um achado novo com a evidência (arquivo antes e depois).

## Relatório
Preencha uma linha por caso (data, estações, resultado, evidência) e guarde em `Relatórios Atualizações/AAAA-MM-DD-homologacao-rede.md`.
