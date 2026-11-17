# Linha 360° · Piloto de consulta

Linha 360° 1.2.0. Primeira entrega derivada de [linha-360-especificacao.md](linha-360-especificacao.md). **Não é o MVP da especificação** (§16.6): é uma tela de validação, somente leitura, para responder a uma pergunta:

> Ao selecionar um ponto da linha, a pessoa entende as perdas e as pendências daquele ponto sem procurar em várias abas?

O resultado decide o próximo investimento (ver "Depois do piloto").

## Como abrir

A aba não aparece na navegação. Abre só por link:

- na plataforma: `Plataforma.html#/linha?tab=piloto` (com a demonstração: `Plataforma.html?demo=1#/linha?tab=piloto`);
- no módulo isolado (testes): `#aba=piloto`.

As quatro abas atuais (Visão da linha, Pessoas e postos, Checklists, Configuração) não mudam e continuam sendo o padrão.

## Escopo

| Item | Regra |
|---|---|
| Mapa | A planta, os pontos e a seleção que já existem (`plantaHtml`, `pontos()`). |
| Ficha do ponto | Paradas, OS abertas e atrasadas, ações abertas, checklists ligados ao ponto e pessoas do posto. |
| Números | Os mesmos da Visão da linha (`numeros()`); nenhum cálculo, indicador ou total novo. |
| Contexto temporal | Cada bloco diz o seu recorte: "no período" (paradas; obedecem a período, turno e ordem), "agora" (OS e ações abertas; não obedecem aos filtros), "previstos agora" (checklists do dia e do turno atual) e "cadastro" (pessoas do posto). |
| Dados ausentes | Fonte não lida aparece como "sem dados", nunca como zero; ponto sem equipamento vinculado e paradas fora da planta são ditos na tela. Cada fonte mostra quando foi gerada. |
| Pessoas | A mesma visibilidade que a aba Pessoas e postos tem hoje; nenhuma regra nova. Pessoa pelo ID do cadastro (contrato 8). |
| Navegação | Os atalhos que já existem para o módulo dono (Paradas, Equipamentos, Iniciativas, Produção). O que for gravado lá segue as permissões e os fluxos de lá. |
| Persistência | Nenhuma. O piloto não chama `Store.commit`, `Store.save`, `Store.reload` nem `lerExt`, e não escreve em base, fila, cache ou preferências. |

Fora do piloto: upload ou troca da planta, editor de mapa e de polígonos, movimentação de equipamentos, arrastar registros, criar ou editar registros na tela, problemas, competências, OEE por equipamento, rascunho e publicação, migração de base.

## O que já existia e o piloto não muda

- A inicialização do módulo pode gravar sozinha (fila pendente, ou resumo `exports` de outro dia). Isso acontece em qualquer aba e não é causado pelo piloto. Por isso o teste mede o estado **depois** da inicialização.
- Sem sessão, ou com perfil sem ação de escrita em Equipamentos (a Linha 360° usa as permissões de Equipamentos), a casca recusa essa gravação e o módulo mostra "Sessão ou perfil não permite gravar". É o comportamento atual em todas as abas.
- Quando a janela do módulo ganha foco (primeiro clique dentro dele, volta de outra aba ou janela), o kit comum relê os dados (`vacAoVoltar`) e, com a mesma regra da inicialização, pode regravar o resumo do dia. Vale para todas as abas; o piloto não muda isso.
- O botão Sincronizar do cabeçalho é da página, não do piloto, e continua relendo e gravando como antes.

## Desvios conhecidos da especificação

- §3.8: a consulta deveria mostrar só a versão publicada do mapa. A Linha 360° não tem versões; o piloto lê o layout vigente.
- §17.2: coordenadas continuam em % do desenho (a especificação recomenda 0–1; a conversão é direta).
- §4: a unidade do mapa continua sendo o ponto da planta (com 0 a n equipamentos do cadastro), não o equipamento posicionado.
- §12.2: não há permissão específica para dados de pessoas; vale a regra atual.

## Critérios de aceite

1. A aba só abre por link; as quatro abas atuais e o contrato de abas (`vacPagina.abas()`) não mudam.
2. Abrir, usar e fechar o piloto não acrescenta, remove nem processa nada: arquivos da pasta (bases, backups, logs, preferências), fila do módulo, fila durável e armazenamento do navegador idênticos ao estado depois da inicialização; nenhuma chamada de gravação, releitura ou sincronização.
3. Vale para perfil que grava, perfil só de consulta e sem sessão; o piloto não gera aviso de erro.
4. O estado das abas atuais (ponto, camada, filtros, zoom) é preservado.
5. Os números da ficha coincidem com os da Visão da linha no mesmo período, turno e ordem.
6. Fonte ausente: "sem dados", nunca zero, na ficha, nos marcadores e na lista.
7. Checklists previstos agora: mesma regra da aba Checklists (dia, turno atual, semana).
8. Pessoas: nome atual pelo ID; texto sem ID continua como texto.
9. Demonstração e dados reais não se misturam.
10. Regressão: `npm run build`, `npm run test:unit`, `npm test`, `npm run test:plataforma`.
11. Validação com pessoas (abaixo).

Teste automático: `testes/plataforma/linha-piloto.cjs` (pasta fictícia em OPFS, demonstração e módulo isolado).

## Validação com pessoas

Responsável funcional e 3 a 5 pessoas-chave (liderança, manutenção, qualidade): **a registrar aqui antes da sessão**.

Três tarefas, medidas primeiro na Visão da linha atual (linha de base) e depois no piloto, sobre a mesma cópia de pasta autorizada:

1. achar o ponto com mais tempo parado no período;
2. dizer o que está aberto naquele ponto (OS, ações, checklists);
3. chegar ao registro de origem de uma pendência.

Registrar tempo, erros e por onde a pessoa navegou. Registrar também a parcela de paradas fora da planta (§20.3). A medição é manual, fora da plataforma: o piloto não grava nada.

## Depois do piloto

| O que a validação mostrar | Próximo investimento |
|---|---|
| A pessoa ainda sai para outros módulos para achar o registro | Registros vinculados ao ponto (decidir antes o que é "Problema" e quem é o dono). |
| A pessoa não consegue ligar equipamento e ponto | Posicionamento individual de equipamentos. |
| O mapa atual já responde | O editor espacial (rascunho, publicação, versões) pode esperar. |

Os botões de gravação da Linha 360° já seguem o perfil (plataforma 1.7.1: lançar para checklist e posto, configurar para planta e cadastro de checklist), ainda com a permissão do módulo Equipamentos. Um bloco que crie registros novos pela Linha pode exigir permissão própria. Rascunho e publicação fazem parte do MVP da especificação; tirá-los do MVP é decisão de escopo ainda não tomada.
