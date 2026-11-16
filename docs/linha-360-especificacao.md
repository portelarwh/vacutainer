# Especificação Funcional — Linha 360°

## 1. Visão geral

A **Linha 360°** será a central visual e operacional para gestão integrada da linha produtiva.

A funcionalidade deverá representar espacialmente a linha, suas áreas produtivas, equipamentos e postos de trabalho, permitindo relacionar diretamente ao mapa:

- Equipamentos;
- Áreas produtivas;
- Pessoas e força de trabalho;
- Conhecimento por equipamento;
- Checklists;
- Problemas e anomalias;
- Ordens de serviço;
- Ações;
- Paradas;
- Indicadores de desempenho;
- OEE por equipamento;
- Riscos de segurança;
- Desvios de qualidade.

A Linha 360° não deverá funcionar apenas como um desenho estático da planta. Ela deverá ser uma interface interativa para consultar, cadastrar, localizar, relacionar e analisar informações operacionais.

O mapa deverá permitir que o usuário identifique rapidamente:

- Onde estão os principais problemas da linha;
- Quais equipamentos apresentam maior impacto operacional;
- Quais áreas concentram mais falhas, ações ou apontamentos;
- Quais equipamentos estão abaixo da meta de OEE;
- Onde existem ordens de serviço, ações ou checklists pendentes;
- Quais pessoas estão posicionadas em cada equipamento ou área;
- Qual é o nível de conhecimento das pessoas em cada máquina;
- Onde existem lacunas de conhecimento ou cobertura operacional;
- Quais pontos da linha exigem priorização.

## 1.1 Objetivo principal

Transformar a representação da linha em uma ferramenta ativa de gestão, permitindo que Operação, Manutenção, Qualidade, Engenharia e Supervisão utilizem a mesma visão para acompanhar o desempenho e priorizar ações.

## 1.2 Princípios da solução

A funcionalidade deverá seguir os seguintes princípios:

1. **Visão espacial:** as informações devem estar relacionadas à localização real na linha.

2. **Interatividade:** o usuário poderá selecionar, arrastar, soltar, cadastrar e consultar elementos diretamente no mapa.

3. **Integração:** equipamentos, pessoas, problemas, ordens de serviço, checklists e indicadores deverão utilizar os cadastros e registros já existentes na plataforma.

4. **Rastreabilidade:** alterações no mapa, vínculos e posicionamentos deverão manter histórico.

5. **Gestão visual:** situações críticas deverão ser identificadas rapidamente por cores, ícones, mapas de calor e indicadores.

6. **Múltiplas perspectivas:** o mesmo mapa poderá ser utilizado para analisar operação, manutenção, qualidade, segurança, pessoas, competências, OEE e perdas.

7. **Simplicidade de uso:** o mapa deverá permitir ações rápidas sem exigir que o usuário navegue por várias páginas.

8. **Dados sob demanda:** a visão inicial deverá ser limpa, exibindo informações detalhadas apenas quando o usuário selecionar um elemento ou ativar uma camada de análise.

## 2. Estrutura da tela

A aba **Linha 360°** deverá ser organizada para manter o mapa como elemento principal, sem sobrecarregar a visualização com informações desnecessárias.

A estrutura será dividida em quatro regiões:

### 2.1 Barra superior

A barra superior deverá conter:

- Seleção da linha;
- Seleção do período;
- Seleção do turno;
- Modo de visualização;
- Filtros;
- Pesquisa global;
- Botão **Adicionar**;
- Botão **Editar mapa**;
- Botão **Tela cheia**;
- Botão para abrir a legenda;
- Indicador da última atualização dos dados.

O botão **Editar mapa** deverá ficar visível somente para usuários com permissão de alteração do layout.

### 2.2 Painel lateral esquerdo

O painel lateral esquerdo deverá funcionar como uma biblioteca de componentes disponíveis para utilização no mapa.

Deverá conter:

- Equipamentos cadastrados;
- Pessoas;
- Checklists;
- Problemas;
- Ordens de serviço;
- Ações;
- Pontos de inspeção;
- Pontos de segurança;
- Pontos de qualidade;
- Áreas produtivas.

Os elementos poderão ser pesquisados, filtrados e arrastados para o mapa.

O painel deverá permitir recolhimento para ampliar o espaço disponível para o mapa.

### 2.3 Área central

A área central será o principal ambiente da Linha 360° e deverá apresentar:

- Imagem ou desenho da linha;
- Áreas produtivas demarcadas;
- Equipamentos posicionados;
- Pessoas vinculadas;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Pontos de inspeção;
- Indicadores por equipamento;
- Mapa de calor;
- Alertas operacionais.

A área central deverá permitir:

- Zoom;
- Movimentação do mapa;
- Seleção de elementos;
- Arrastar e soltar;
- Centralização automática de resultados pesquisados;
- Exibição progressiva de detalhes conforme o nível de zoom;
- Utilização em tela cheia.

### 2.4 Painel lateral direito

O painel lateral direito será contextual e deverá ser aberto quando o usuário selecionar um elemento do mapa.

Dependendo do item selecionado, deverá apresentar:

- Identificação;
- Status;
- Indicadores;
- Histórico;
- Problemas relacionados;
- Ordens de serviço;
- Ações;
- Checklists;
- Pessoas relacionadas;
- Competências;
- Documentos;
- Fotos;
- Atalhos para lançamento de novos registros.

O painel deverá permitir consultar e executar ações sem retirar o usuário da Linha 360°.

### 2.5 Resumo de gestão

A parte superior do mapa poderá apresentar cards compactos com os principais indicadores da linha:

- OEE da linha;
- Equipamentos abaixo da meta;
- Quantidade de problemas abertos;
- Problemas críticos;
- Ordens de serviço abertas;
- Ordens de serviço vencidas;
- Ações vencidas;
- Checklists atrasados;
- Minutos de parada;
- Área mais crítica;
- Equipamento com maior perda;
- Equipamentos sem cobertura adequada de conhecimento.

Os cards deverão responder aos filtros aplicados na tela.

### 2.6 Comportamento visual

A interface deverá seguir estas regras:

1. O mapa deverá ocupar a maior parte da tela.

2. Os painéis laterais deverão ser recolhíveis.

3. As informações detalhadas deverão aparecer somente sob demanda.

4. A tela não deverá exibir simultaneamente todos os problemas, pessoas, indicadores, checklists e ordens de serviço.

5. O usuário deverá escolher quais camadas deseja visualizar.

6. Itens localizados no mesmo ponto deverão ser agrupados visualmente.

7. A legenda deverá permanecer acessível em todos os modos de visualização.

8. O modo de consulta deverá ser separado do modo de edição do mapa.

9. O sistema deverá manter os filtros e o nível de zoom enquanto o usuário consulta diferentes elementos.

10. A interface deverá funcionar adequadamente em desktop e tablet.

## 3. Criação e desenho das áreas produtivas

A Linha 360° deverá permitir que usuários autorizados criem e editem áreas produtivas diretamente sobre o mapa.

### 3.1 Formas de iniciar o mapa

O sistema deverá permitir três formas de criação:

1. **Carregar uma imagem da planta**
   - Utilizar arquivo PNG ou JPG como plano de fundo;
   - A imagem deverá servir apenas como referência visual;
   - Os equipamentos, áreas e registros deverão ser elementos independentes sobre a imagem.

2. **Carregar um mapa existente**
   - Utilizar uma configuração criada anteriormente;
   - Manter equipamentos, áreas e coordenadas já cadastrados.

3. **Criar mapa em branco**
   - Permitir a construção manual da linha sem imagem de fundo.

### 3.2 Método principal de desenho

O método padrão para criação das áreas deverá ser o desenho de polígonos por pontos.

Funcionamento esperado:

1. O usuário seleciona **Editar mapa**;
2. Seleciona a opção **Criar área**;
3. Clica no primeiro ponto do mapa;
4. Continua clicando para definir o perímetro;
5. Cada clique cria um novo vértice;
6. Uma linha deverá conectar visualmente os pontos;
7. Ao clicar novamente no primeiro ponto, o polígono deverá ser fechado;
8. Também deverá existir a opção **Fechar área**;
9. Após o fechamento, o sistema deverá abrir o formulário de cadastro da área.

Durante o desenho, o sistema deverá permitir:

- Desfazer o último ponto;
- Cancelar o desenho;
- Reposicionar os pontos antes da confirmação;
- Aplicar zoom sem perder os pontos já criados;
- Exibir uma prévia da área que está sendo formada.

### 3.3 Cadastro da área

Após fechar o polígono, solicitar:

- Nome da área;
- Código da área;
- Tipo de área;
- Linha relacionada;
- Responsável;
- Cor de identificação;
- Descrição opcional;
- Status;
- Meta de OEE, quando aplicável.

Exemplos de tipos de área:

- Preparação;
- Processo;
- Inspeção;
- Embalagem;
- Utilidades;
- Alimentação de materiais;
- Área restrita;
- Segurança;
- Armazenamento temporário.

### 3.4 Identificação automática dos equipamentos

Após a criação ou alteração do polígono, o sistema deverá identificar automaticamente os equipamentos posicionados dentro dos limites da área.

O sistema deverá apresentar uma confirmação, por exemplo:

> Foram identificados 8 equipamentos dentro desta área. Confirme os equipamentos que deverão ser vinculados.

O usuário poderá:

- Confirmar todos os equipamentos;
- Desmarcar equipamentos;
- Adicionar equipamentos próximos;
- Manter equipamentos sem área definida;
- Transferir equipamentos vinculados a outra área.

O vínculo automático deverá considerar a coordenada central do equipamento.

Quando um equipamento estiver parcialmente sobre duas áreas, o sistema deverá solicitar que o usuário escolha a área principal.

### 3.5 Alteração do perímetro

Após a criação, usuários autorizados poderão:

- Selecionar a área;
- Mover um vértice;
- Adicionar um vértice entre dois pontos;
- Remover um vértice;
- Mover o polígono completo;
- Alterar nome, tipo ou cor;
- Duplicar a área;
- Bloquear a área contra edição;
- Inativar a área.

Quando o perímetro for alterado, o sistema deverá informar:

- Equipamentos que entraram na área;
- Equipamentos que saíram da área;
- Equipamentos que ficaram sobrepostos;
- Registros abertos potencialmente afetados.

As alterações somente deverão ser aplicadas após confirmação do usuário.

### 3.6 Formas auxiliares de desenho

Além do polígono por pontos, o sistema poderá disponibilizar:

- Retângulo;
- Quadrado;
- Círculo;
- Linha ou corredor;
- Desenho livre.

O polígono por pontos deverá permanecer como método padrão por permitir representar áreas industriais irregulares com maior precisão.

### 3.7 Sobreposição de áreas

Por padrão, áreas produtivas do mesmo nível não deverão se sobrepor.

Quando houver sobreposição, o sistema deverá:

1. Destacar visualmente a região conflitante;
2. Informar quais áreas estão envolvidas;
3. Impedir a publicação até que o conflito seja resolvido.

A sobreposição poderá ser permitida apenas para camadas de natureza diferente, por exemplo:

- Área produtiva;
- Zona de segurança;
- Rota de circulação;
- Área de risco;
- Área de armazenamento temporário.

Cada área deverá possuir um campo de categoria ou camada para controlar essa regra.

### 3.8 Salvamento e publicação

Durante a edição, o sistema deverá:

- Salvar alterações automaticamente como rascunho;
- Permitir desfazer e refazer;
- Informar alterações ainda não publicadas;
- Permitir descartar o rascunho;
- Permitir publicar uma nova versão do mapa.

Somente a versão publicada deverá aparecer para os usuários no modo de consulta.

Cada publicação deverá registrar:

- Número da versão;
- Data e hora;
- Usuário responsável;
- Descrição da alteração;
- Áreas criadas, alteradas ou inativadas;
- Equipamentos reposicionados ou transferidos.
## 4. Equipamentos e posicionamento no mapa

Os equipamentos utilizados na Linha 360° deverão utilizar o cadastro de equipamentos já existente na plataforma.

A Linha 360° não deverá criar um cadastro paralelo de máquinas. Ela deverá armazenar apenas as informações necessárias para representar e posicionar cada equipamento no mapa.

### 4.1 Biblioteca de equipamentos

No modo **Editar mapa**, o painel lateral deverá apresentar:

- Equipamentos já posicionados;
- Equipamentos ainda não posicionados;
- Equipamentos inativos;
- Equipamentos sem área definida;
- Equipamentos vinculados a outras linhas, quando o usuário tiver permissão para visualizá-los.

A biblioteca deverá permitir pesquisa e filtro por:

- Código;
- Nome;
- Linha;
- Área produtiva;
- Tipo;
- Status;
- Posição atual no mapa.

Cada equipamento deverá possuir uma identificação visual clara, contendo no mínimo:

- Código;
- Nome;
- Tipo;
- Status de posicionamento.

### 4.2 Posicionamento por arrastar e soltar

O usuário deverá conseguir arrastar um equipamento da biblioteca e soltá-lo em um ponto específico do mapa.

Ao soltar o equipamento, o sistema deverá gravar:

- Identificador do equipamento;
- Linha;
- Área produtiva;
- Coordenada horizontal;
- Coordenada vertical;
- Largura;
- Altura;
- Rotação;
- Ordem no processo;
- Data e hora da alteração;
- Usuário responsável.

Se o equipamento for solto dentro de uma área produtiva, o sistema deverá sugerir automaticamente o vínculo com essa área.

Exemplo:

> O equipamento foi posicionado dentro da área Embalagem. Deseja vinculá-lo a essa área?

Se o equipamento for solto fora de qualquer área, o sistema deverá permitir seu posicionamento com o status **Sem área definida**.

### 4.3 Posicionamento por formulário

Além do arrastar e soltar, o posicionamento deverá poder ser realizado por formulário.

O formulário deverá permitir selecionar:

- Equipamento;
- Linha;
- Área;
- Posição horizontal;
- Posição vertical;
- Largura;
- Altura;
- Rotação;
- Ordem no processo.

Após salvar, o mapa deverá centralizar e destacar o equipamento posicionado.

### 4.4 Representação visual

O equipamento poderá ser representado por:

- Ícone padronizado;
- Foto real;
- Miniatura personalizada;
- Bloco com nome e código;
- Símbolo técnico definido para o tipo de equipamento.

A representação deverá apresentar, de forma compacta:

- Código ou nome curto;
- Status atual;
- OEE, quando a camada de desempenho estiver ativa;
- Quantidade de alertas ativos;
- Indicador de parada, quando aplicável.

A representação não deverá exibir todas as informações simultaneamente. Os detalhes completos serão apresentados no painel lateral direito.

### 4.5 Estados visuais

O estado operacional poderá ser representado por borda, halo ou marcador:

- Verde: operando normalmente;
- Amarelo: condição de atenção;
- Laranja: perda ou impacto relevante;
- Vermelho: parado ou em situação crítica;
- Azul: manutenção planejada;
- Cinza: sem informação, sem comunicação ou fora de operação.

As cores deverão ser acompanhadas por ícones ou textos curtos. O entendimento do estado não poderá depender somente da cor.

### 4.6 Edição do equipamento no mapa

No modo de edição, usuários autorizados poderão:

- Mover o equipamento;
- Redimensionar;
- Girar;
- Alterar o ícone;
- Alterar a imagem;
- Ajustar a ordem visual;
- Bloquear a posição;
- Transferir para outra área;
- Remover a representação do mapa.

Remover um equipamento do mapa não deverá excluir seu cadastro nem seu histórico.

### 4.7 Equipamentos dentro de áreas

Quando um equipamento for movido de uma área para outra, o sistema deverá:

1. Identificar a nova área;
2. Informar o vínculo atual;
3. Sugerir a transferência;
4. Exibir os registros abertos associados;
5. Solicitar confirmação antes da alteração.

Os registros históricos deverão permanecer vinculados à área válida na data em que ocorreram.

Os registros ainda abertos deverão permitir:

- Manter o vínculo anterior;
- Transferir para a nova área;
- Ser revisados individualmente.

### 4.8 Equipamentos sobrepostos

O sistema deverá identificar quando dois ou mais equipamentos ocuparem a mesma posição ou apresentarem sobreposição relevante.

Quando isso ocorrer, deverá:

- Destacar o conflito;
- Identificar os equipamentos envolvidos;
- Permitir reposicionamento;
- Impedir a publicação enquanto houver sobreposição não confirmada.

A sobreposição poderá ser aceita somente quando um equipamento representar um componente interno ou parte de outro equipamento.

### 4.9 Agrupamentos e equipamentos compostos

O sistema deverá permitir representar:

- Linha completa;
- Célula produtiva;
- Equipamento principal;
- Módulo;
- Componente;
- Posto de trabalho;
- Ponto de medição.

Um equipamento composto poderá possuir elementos internos selecionáveis.

Exemplo:

- Linha Vacutainer;
- Módulo de formação;
- Aplicador de etiqueta;
- Câmera de inspeção;
- Embaladora;
- Paletizador.

A hierarquia deverá permitir visualizar o indicador consolidado e, quando disponível, os dados individuais de cada componente.

### 4.10 Interação no modo de consulta

No modo de consulta:

- Um clique deverá selecionar o equipamento;
- O painel lateral direito deverá apresentar os detalhes;
- Um duplo clique poderá abrir a página completa do equipamento;
- O menu de contexto deverá oferecer atalhos para novos registros;
- A pesquisa deverá centralizar o equipamento no mapa;
- O equipamento selecionado deverá ficar visualmente destacado.

O menu de contexto deverá permitir:

- Abrir detalhes;
- Criar problema;
- Criar ordem de serviço;
- Criar ação;
- Associar checklist;
- Vincular pessoa;
- Consultar OEE;
- Consultar histórico;
- Visualizar documentos;
- Visualizar registros relacionados.
## 5. Registros vinculados ao mapa

A Linha 360° deverá permitir criar, posicionar e consultar registros operacionais diretamente no mapa.

Os registros deverão continuar utilizando os módulos e bases existentes na plataforma. A Linha 360° armazenará apenas o vínculo espacial e apresentará atalhos para criação, consulta e atualização.

### 5.1 Tipos de registro

O mapa deverá permitir vincular:

- Checklist;
- Problema;
- Anomalia;
- Ordem de serviço;
- Ação;
- Parada;
- Desvio de qualidade;
- Risco de segurança;
- Ponto de inspeção;
- Melhoria sugerida;
- Observação;
- Foto;
- Documento.

Cada registro poderá ser relacionado a:

- Linha;
- Área produtiva;
- Equipamento;
- Componente do equipamento;
- Posto de trabalho;
- Ponto livre do mapa.

### 5.2 Criação por arrastar e soltar

O painel lateral deverá disponibilizar registros existentes e opções para criação de novos registros.

O usuário poderá arrastar um item e soltá-lo sobre:

- Um equipamento;
- Uma área;
- Um componente;
- Um ponto livre do mapa;
- Outro registro existente.

Ao soltar o item, o sistema deverá identificar automaticamente o contexto e preencher:

- Linha;
- Área;
- Equipamento, quando aplicável;
- Componente, quando aplicável;
- Coordenada horizontal;
- Coordenada vertical;
- Data e hora;
- Usuário responsável pelo lançamento.

Antes de salvar, o sistema deverá abrir um formulário curto para preenchimento dos dados obrigatórios específicos do registro.

### 5.3 Comportamento conforme o local

#### Registro solto sobre um equipamento

O registro deverá ser vinculado automaticamente:

- Ao equipamento;
- À área produtiva do equipamento;
- À linha;
- À coordenada do equipamento.

#### Registro solto dentro de uma área

O registro deverá ser vinculado:

- À área produtiva;
- À linha;
- À coordenada selecionada.

O equipamento poderá permanecer vazio quando o evento não estiver relacionado a uma máquina específica.

#### Registro solto fora das áreas

O sistema deverá permitir o salvamento como:

- Ponto geral da linha;
- Registro sem área definida;
- Registro temporário aguardando classificação.

#### Registro solto sobre outro registro

O sistema deverá perguntar se existe uma relação entre os itens.

Exemplo:

> Deseja vincular este problema à ordem de serviço selecionada?

As relações permitidas deverão incluir:

- Problema originou ordem de serviço;
- Problema originou ação;
- Checklist identificou problema;
- Desvio originou investigação;
- Parada está relacionada ao problema;
- Ordem de serviço tratou o problema;
- Ação eliminou ou reduziu a ocorrência.

### 5.4 Criação por formulário

O arrastar e soltar não deverá ser obrigatório.

O botão **Adicionar** deverá permitir criar um registro por formulário convencional.

O formulário deverá conter os campos de localização:

- Linha;
- Área;
- Equipamento;
- Componente;
- Ponto do mapa;
- Coordenada;
- Abrangência do registro.

O usuário poderá selecionar a localização pelo mapa ou pelos campos do formulário.

Após salvar, o registro deverá aparecer automaticamente na posição correspondente.

### 5.5 Vinculação de registros existentes

O usuário deverá conseguir pesquisar um registro existente e vinculá-lo ao mapa.

Exemplos:

- Arrastar uma ordem de serviço existente para um equipamento;
- Vincular um checklist já cadastrado a um posto;
- Posicionar uma ação aberta na área afetada;
- Associar um problema existente ao ponto correto da linha.

A vinculação ao mapa não deverá duplicar o registro original.

O sistema deverá armazenar:

- Tipo do registro;
- Identificador do registro de origem;
- Linha;
- Área;
- Equipamento;
- Componente;
- Coordenada;
- Data da vinculação;
- Usuário responsável pela vinculação.

### 5.6 Checklists

O usuário deverá conseguir:

- Criar um checklist específico;
- Selecionar um checklist existente;
- Arrastá-lo para um equipamento, área ou ponto;
- Definir frequência;
- Definir responsáveis;
- Definir turno;
- Definir data de início;
- Definir prazo;
- Consultar execuções anteriores.

Os checklists deverão apresentar os estados:

- Previsto;
- Disponível para execução;
- Em andamento;
- Concluído;
- Concluído com reprovação;
- Atrasado;
- Suspenso.

Quando um item do checklist for reprovado, o usuário deverá poder criar imediatamente:

- Problema;
- Ação;
- Ordem de serviço;
- Desvio de qualidade.

O registro criado deverá herdar a localização do checklist.

### 5.7 Problemas e anomalias

Ao criar um problema pelo mapa, o formulário deverá solicitar no mínimo:

- Título;
- Descrição;
- Categoria;
- Criticidade;
- Data e hora;
- Status;
- Responsável;
- Evidência opcional;
- Impacto inicial;
- Origem do registro.

O sistema deverá permitir classificar o impacto em:

- Segurança;
- Qualidade;
- Produção;
- OEE;
- Custo;
- Manutenção;
- Ergonomia;
- Meio ambiente.

O problema deverá permanecer visível no mapa enquanto estiver aberto, conforme os filtros e camadas selecionados.

### 5.8 Ordens de serviço

O usuário deverá conseguir:

- Criar uma solicitação de manutenção pelo mapa;
- Vincular uma ordem de serviço existente;
- Consultar o número da ordem;
- Consultar status;
- Consultar prioridade;
- Consultar responsável;
- Consultar prazo;
- Consultar histórico;
- Visualizar o problema que originou a ordem.

Quando houver integração com outro sistema, o registro deverá armazenar o identificador externo sem duplicar a ordem de serviço.

### 5.9 Ações

As ações poderão ser criadas a partir de:

- Problema;
- Checklist;
- Ordem de serviço;
- Desvio;
- Reunião;
- Análise de perda;
- Registro independente.

Cada ação deverá apresentar:

- Descrição;
- Responsável;
- Prazo;
- Status;
- Criticidade;
- Origem;
- Evidência de conclusão;
- Resultado esperado;
- Resultado obtido.

Ações vencidas deverão possuir destaque visual específico.

### 5.10 Representação visual dos registros

Os registros deverão ser representados por ícones distintos.

Exemplo:

- Checklist: prancheta;
- Problema: alerta;
- Ordem de serviço: ferramenta;
- Ação: alvo ou tarefa;
- Qualidade: escudo ou selo;
- Segurança: triângulo de risco;
- Parada: símbolo de pausa;
- Documento: arquivo;
- Foto: câmera.

A cor deverá representar criticidade ou status, sem substituir o ícone.

Quando houver vários registros próximos, o sistema deverá agrupá-los.

Exemplo de agrupamento:

- 12 ocorrências;
- 3 críticas;
- 4 ordens de serviço abertas;
- 2 checklists atrasados.

Ao aumentar o zoom ou selecionar o grupo, os registros deverão ser apresentados individualmente.

### 5.11 Movimentação e correção de vínculo

Usuários autorizados poderão reposicionar um registro no mapa.

Antes da alteração, o sistema deverá apresentar:

- Localização atual;
- Nova localização;
- Área atual;
- Nova área;
- Equipamento atual;
- Novo equipamento.

A mudança deverá manter histórico e não poderá alterar silenciosamente os dados originais.

### 5.12 Menu de contexto

Ao selecionar um ponto, área ou equipamento, o menu deverá permitir:

- Criar problema;
- Criar ordem de serviço;
- Criar ação;
- Associar checklist;
- Registrar desvio de qualidade;
- Registrar risco de segurança;
- Adicionar foto;
- Adicionar observação;
- Vincular registro existente;
- Consultar registros relacionados.

### 5.13 Rastreabilidade

Toda criação, vinculação, movimentação ou remoção de um registro no mapa deverá registrar:

- Usuário;
- Data e hora;
- Ação realizada;
- Localização anterior;
- Nova localização;
- Registro de origem;
- Motivo da alteração, quando aplicável.

Remover o registro do mapa não deverá excluir o registro original
## 6. Mapa de calor e análise de criticidade

A Linha 360° deverá possuir um mapa de calor real, capaz de representar visualmente a concentração e o impacto dos eventos na linha.

O mapa de calor não deverá considerar apenas a quantidade de falhas. O usuário deverá escolher qual indicador deseja analisar, permitindo diferenciar locais com muitas ocorrências simples de locais com poucas ocorrências de grande impacto.

### 6.1 Modos de análise

O mapa de calor deverá permitir análise por:

- Quantidade de ocorrências;
- Minutos de parada;
- Perda estimada de produção;
- Perda de OEE;
- Frequência de falhas;
- Recorrência;
- Criticidade;
- Custo estimado;
- Quantidade de ordens de serviço abertas;
- Quantidade de ordens de serviço vencidas;
- Quantidade de ações abertas;
- Quantidade de ações vencidas;
- Checklists atrasados;
- Itens de checklist reprovados;
- Não conformidades;
- Scrap;
- Perda de velocidade;
- Riscos de segurança;
- Desvios de qualidade;
- Apontamentos por turno;
- Backlog de manutenção;
- Tempo médio de reparo;
- Tempo médio entre falhas.

### 6.2 Níveis espaciais

O mapa de calor deverá ser visualizado nos seguintes níveis:

#### Por área produtiva

O polígono completo da área deverá receber uma intensidade visual de acordo com o indicador selecionado.

#### Por equipamento

Cada equipamento deverá receber uma intensidade visual individual.

#### Por ponto específico

Os registros deverão gerar regiões de calor ao redor das coordenadas em que foram lançados.

#### Por componente

Quando existir detalhamento interno do equipamento, o mapa poderá destacar componentes específicos.

O usuário deverá conseguir alternar entre os níveis sem sair da tela.

### 6.3 Métodos de cálculo

O mapa deverá possuir três métodos principais de cálculo.

#### Quantidade

Representa o número total de registros no período selecionado.

Exemplo:

- Equipamento A: 15 falhas;
- Equipamento B: 5 falhas.

#### Impacto

Representa o impacto acumulado dos registros.

O impacto poderá ser calculado por:

- Minutos de parada;
- Unidades não produzidas;
- Quantidade de scrap;
- Valor financeiro;
- Perda de OEE;
- Horas de manutenção;
- Tempo de indisponibilidade.

Exemplo:

- Equipamento A: 15 falhas e 40 minutos de parada;
- Equipamento B: 5 falhas e 300 minutos de parada.

Na visão por impacto, o Equipamento B deverá apresentar maior intensidade.

#### Índice ponderado de criticidade

O índice deverá combinar diferentes fatores em uma única pontuação.

Modelo inicial sugerido:

Índice de criticidade =
(quantidade de ocorrências × peso da quantidade)
+ (minutos de parada × peso da parada)
+ (criticidade do evento × peso da criticidade)
+ (recorrência × peso da recorrência)
+ (ações vencidas × peso das pendências)
+ (impacto no OEE × peso do OEE)

Os pesos deverão ser configuráveis pela administração.

O sistema deverá exibir quais fatores contribuíram para a pontuação, evitando apresentar um índice sem explicação.

### 6.4 Criticidade dos eventos

Para o cálculo ponderado, cada evento deverá possuir um nível de criticidade:

- Nível 1: baixo;
- Nível 2: moderado;
- Nível 3: alto;
- Nível 4: crítico;
- Nível 5: extremo.

A criticidade poderá considerar:

- Segurança;
- Qualidade;
- Impacto na produção;
- Duração;
- Recorrência;
- Custo;
- Impacto regulatório;
- Quantidade de pessoas afetadas;
- Risco de parada total da linha.

Os critérios deverão ser configuráveis conforme o tipo de registro.

### 6.5 Escala visual

A escala padrão deverá utilizar:

- Verde: intensidade baixa;
- Amarelo: intensidade moderada;
- Laranja: intensidade alta;
- Vermelho: intensidade crítica;
- Vinho ou vermelho escuro: intensidade extrema;
- Cinza: sem dados suficientes.

A legenda deverá apresentar os intervalos numéricos usados no cálculo.

Exemplo:

- Verde: 0 a 20;
- Amarelo: 21 a 40;
- Laranja: 41 a 60;
- Vermelho: 61 a 80;
- Vinho: acima de 80.

Os intervalos poderão ser:

- Fixos;
- Configurados manualmente;
- Calculados automaticamente com base na distribuição dos dados;
- Comparados com metas ou limites definidos.

A visualização não deverá depender exclusivamente das cores. O sistema deverá utilizar valores, padrões, ícones ou textos de apoio.

### 6.6 Normalização dos dados

Para evitar interpretações incorretas, o mapa deverá permitir normalizar o indicador por:

- Horas de operação;
- Quantidade produzida;
- Número de turnos;
- Quantidade de equipamentos da área;
- Quantidade de pessoas;
- Número de checklists previstos;
- Período disponível para operação.

Exemplo:

Uma área com 20 falhas em 500 horas de operação poderá apresentar desempenho melhor que uma área com 10 falhas em 100 horas.

O usuário deverá visualizar se o mapa está exibindo:

- Valor absoluto;
- Taxa normalizada;
- Percentual;
- Índice ponderado.

### 6.7 Filtros do mapa de calor

O mapa deverá responder aos filtros de:

- Data;
- Hora;
- Turno;
- Linha;
- Área;
- Equipamento;
- Categoria;
- Tipo de registro;
- Status;
- Criticidade;
- Responsável;
- Origem;
- Tipo de perda;
- Tipo de competência;
- Faixa de OEE.

Ao alterar um filtro, deverão ser atualizados:

- Mapa;
- Legenda;
- Cards;
- Rankings;
- Totais;
- Painel de detalhes.

### 6.8 Comparação entre períodos

O usuário deverá conseguir comparar:

- Turno atual com turno anterior;
- Turno A com turno B;
- Semana atual com semana anterior;
- Mês atual com mês anterior;
- Período antes e depois de uma intervenção;
- Área com outra área;
- Equipamento com equipamento semelhante;
- Quantidade de falhas com impacto das falhas.

A comparação deverá exibir:

- Valor do período atual;
- Valor do período de comparação;
- Diferença absoluta;
- Diferença percentual;
- Tendência de aumento ou redução.

### 6.9 Ranking de criticidade

O sistema deverá apresentar rankings vinculados ao mapa:

- Áreas mais críticas;
- Equipamentos com maior impacto;
- Pontos com mais recorrência;
- Equipamentos com maior perda de OEE;
- Equipamentos com mais minutos de parada;
- Áreas com mais ações vencidas;
- Equipamentos com mais ordens de serviço abertas;
- Pontos com mais checklists reprovados.

Ao selecionar um item do ranking, o mapa deverá:

1. Centralizar o local;
2. Aplicar destaque visual;
3. Abrir o painel de detalhes;
4. Apresentar os registros que formaram o resultado.

### 6.10 Detalhamento do resultado

Ao selecionar uma região de calor, o painel lateral deverá exibir:

- Indicador analisado;
- Valor total;
- Quantidade de registros;
- Período;
- Comparação com o período anterior;
- Principais categorias;
- Principais causas;
- Registros críticos;
- Ações abertas;
- Ordens de serviço relacionadas;
- Responsáveis;
- Tendência;
- Contribuição de cada item para o resultado.

O usuário deverá conseguir acessar os registros de origem que formaram o mapa de calor.

### 6.11 Atualização dos dados

O mapa deverá informar:

- Data e hora da última atualização;
- Fonte dos dados;
- Período considerado;
- Indicadores sem atualização;
- Equipamentos sem dados;
- Possíveis falhas de integração.

Dados ausentes não deverão ser interpretados como resultado igual a zero.

### 6.12 Salvamento de visualizações

O usuário deverá conseguir salvar uma configuração contendo:

- Indicador;
- Método de cálculo;
- Nível espacial;
- Filtros;
- Período;
- Escala;
- Comparação;
- Camadas visíveis.

Exemplos de visualizações salvas:

- Perdas de OEE por equipamento;
- Falhas críticas dos últimos 30 dias;
- Ordens de serviço vencidas;
- Checklists reprovados por área;
- Riscos de segurança por ponto;
- Recorrência de paradas por turno.

As visualizações poderão ser pessoais ou compartilhadas, conforme a permissão do usuário.
## 7. OEE por equipamento e desempenho operacional

A Linha 360° deverá permitir visualizar o desempenho individual dos equipamentos diretamente no mapa.

O sistema deverá diferenciar claramente:

- OEE calculado individualmente para o equipamento;
- OEE consolidado de um agrupamento ou célula;
- OEE geral da linha;
- Equipamentos sem medição própria;
- Equipamentos que não participam do cálculo de OEE.

O OEE geral da linha não deverá ser apresentado como se fosse o resultado individual de cada equipamento.

### 7.1 Indicadores por equipamento

Quando houver dados disponíveis, cada equipamento deverá apresentar:

- OEE atual;
- Meta de OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Estado operacional;
- Tendência;
- Diferença em relação à meta;
- Data e hora da última atualização.

Exemplo de apresentação compacta:

VACT01  
OEE: 72,4%  
Meta: 80,0%  
Diferença: -7,6 pontos percentuais

### 7.2 Exibição compacta no mapa

A visualização inicial deverá ser simples e conter apenas:

- Código ou nome curto do equipamento;
- Percentual de OEE;
- Cor da situação;
- Seta de tendência;
- Ícone de alerta, quando aplicável.

As informações detalhadas deverão ser apresentadas somente quando o equipamento for selecionado.

O usuário poderá ativar ou desativar a camada **OEE por equipamento**.

### 7.3 Classificação visual do OEE

A classificação deverá considerar a meta cadastrada para cada equipamento.

Regra visual sugerida:

- Verde: resultado igual ou acima da meta;
- Amarelo: até 5 pontos percentuais abaixo da meta;
- Laranja: entre 5,1 e 10 pontos percentuais abaixo da meta;
- Vermelho: mais de 10 pontos percentuais abaixo da meta;
- Cinza: sem dados disponíveis;
- Azul: equipamento não aplicável ao cálculo de OEE.

Os limites deverão ser configuráveis pela administração.

A cor deverá ser acompanhada pelo valor numérico e pelo status textual.

### 7.4 Equipamentos sem OEE próprio

Quando não existir medição individual, o sistema deverá exibir uma das seguintes situações:

- OEE individual não disponível;
- OEE herdado da linha;
- OEE herdado da célula;
- Equipamento fora do cálculo;
- Integração indisponível;
- Dados ainda não configurados.

Quando for exibido um valor herdado, a origem deverá aparecer claramente.

Exemplo:

> OEE: 76,8% — valor herdado da Linha Vacutainer.

O valor herdado não deverá ser utilizado em comparações individuais sem identificação.

### 7.5 Componentes do OEE

Ao selecionar um equipamento, o painel lateral deverá apresentar:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Meta;
- Diferença em relação à meta;
- Tendência;
- Período analisado;
- Tempo programado;
- Tempo operando;
- Tempo parado;
- Quantidade produzida;
- Quantidade aprovada;
- Quantidade rejeitada;
- Ciclo ideal ou velocidade de referência.

Os componentes deverão indicar qual fator está provocando a maior perda.

Exemplo:

> Principal impacto atual: Performance, com perda estimada de 8,4 pontos percentuais.

### 7.6 Histórico e tendência

O usuário deverá conseguir visualizar o histórico do equipamento por:

- Hora;
- Turno;
- Dia;
- Semana;
- Mês;
- Período personalizado.

O histórico deverá permitir analisar:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Meta;
- Média do período;
- Melhor resultado;
- Pior resultado;
- Tendência;
- Variação em relação ao período anterior.

### 7.7 Perdas do equipamento

O detalhamento deverá apresentar as principais perdas relacionadas ao equipamento:

- Paradas planejadas;
- Paradas não planejadas;
- Falhas;
- Setup;
- Espera;
- Falta de material;
- Bloqueio;
- Ociosidade;
- Microparadas;
- Redução de velocidade;
- Scrap;
- Retrabalho;
- Rejeições de qualidade.

As perdas deverão ser classificadas conforme a estrutura definida nos módulos de produção e paradas da plataforma.

### 7.8 Pareto de perdas

Ao selecionar um equipamento, o sistema deverá permitir abrir um Pareto contendo:

- Categoria da perda;
- Motivo;
- Duração;
- Quantidade de ocorrências;
- Percentual acumulado;
- Impacto estimado no OEE;
- Impacto estimado na produção.

O usuário deverá conseguir selecionar uma perda do Pareto e localizar no mapa os registros relacionados.

### 7.9 Relação entre OEE e registros operacionais

O painel do equipamento deverá relacionar o desempenho com:

- Problemas abertos;
- Ordens de serviço abertas;
- Ações abertas;
- Checklists reprovados;
- Paradas recentes;
- Desvios de qualidade;
- Pessoas posicionadas;
- Cobertura de conhecimento;
- Alterações realizadas no equipamento.

O objetivo é permitir que o usuário compreenda não apenas o valor do OEE, mas também os fatores que podem estar influenciando o resultado.

### 7.10 Comparação entre equipamentos

O usuário deverá conseguir selecionar dois ou mais equipamentos para comparar:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Minutos de parada;
- Quantidade de falhas;
- MTTR;
- MTBF;
- Scrap;
- Produção;
- Ações abertas;
- Ordens de serviço abertas.

A comparação deverá informar quando os equipamentos não forem equivalentes ou utilizarem critérios diferentes de cálculo.

### 7.11 Comparação com a linha e com a área

Para cada equipamento, o sistema deverá apresentar:

- Resultado individual;
- Média da área produtiva;
- Média da linha;
- Meta individual;
- Diferença para a área;
- Diferença para a linha;
- Diferença para a meta.

A comparação deverá respeitar o mesmo período, turno e filtros.

### 7.12 Atualização e fonte dos dados

O painel deverá informar:

- Fonte dos dados;
- Data e hora da última atualização;
- Período utilizado no cálculo;
- Status da integração;
- Registros incompletos;
- Possíveis inconsistências;
- Indisponibilidade de dados.

Dados ausentes não deverão ser considerados como zero.

Quando houver falha de integração, o sistema deverá manter o último valor válido identificado como desatualizado.

### 7.13 Alertas de desempenho

O sistema deverá permitir configurar alertas para:

- OEE abaixo da meta;
- Queda relevante em relação ao período anterior;
- Disponibilidade baixa;
- Performance baixa;
- Qualidade baixa;
- Aumento de paradas;
- Aumento de microparadas;
- Crescimento de scrap;
- Equipamento sem atualização;
- Divergência de cálculo;
- Perda recorrente.

Os alertas deverão aparecer no equipamento e no resumo de gestão da Linha 360°.

### 7.14 Navegação para análise detalhada

A partir do equipamento, o usuário deverá conseguir:

- Abrir o histórico completo;
- Consultar as paradas;
- Consultar o Pareto;
- Abrir problemas relacionados;
- Consultar ordens de serviço;
- Abrir ações;
- Visualizar checklists;
- Consultar documentos técnicos;
- Visualizar pessoas habilitadas;
- Criar um novo registro.

Essas ações deverão ser realizadas pelo painel lateral ou por atalhos, sem exigir que o usuário perca o contexto atual do mapa.
## 8. Força de trabalho e conhecimento por equipamento

A Linha 360° deverá permitir visualizar e gerenciar a força de trabalho vinculada às áreas, postos e equipamentos.

A funcionalidade deverá responder:

- Quem está alocado em cada área ou equipamento;
- Quem está disponível no turno;
- Quem possui conhecimento para operar cada máquina;
- Qual é o nível de conhecimento de cada pessoa;
- Onde existem lacunas de cobertura;
- Quais equipamentos dependem de uma única pessoa;
- Quais habilitações estão vencidas ou próximas do vencimento.

A alocação operacional e a matriz de conhecimentos deverão ser tratadas como informações diferentes.

- **Alocação:** indica onde a pessoa está trabalhando em determinado período.
- **Conhecimento:** indica em quais atividades e equipamentos a pessoa está habilitada.

### 8.1 Cadastro das competências

O sistema deverá permitir vincular uma pessoa a um equipamento por tipo de competência.

Tipos mínimos:

- Operação;
- Setup;
- Limpeza;
- Inspeção;
- Ajuste;
- Manutenção autônoma;
- Manutenção técnica;
- Qualidade;
- Segurança;
- Investigação de falhas;
- Treinamento de outras pessoas.

Uma pessoa poderá possuir níveis diferentes para o mesmo equipamento.

Exemplo:

- Operação: nível 4;
- Setup: nível 3;
- Limpeza: nível 4;
- Manutenção autônoma: nível 2;
- Manutenção técnica: nível 0.

### 8.2 Escala de conhecimento

Utilizar a seguinte escala:

- **Nível 0 — Sem conhecimento:** não treinado ou não autorizado;
- **Nível 1 — Em treinamento:** iniciou a capacitação;
- **Nível 2 — Habilitado com acompanhamento:** executa com suporte;
- **Nível 3 — Habilitado:** executa de forma autônoma;
- **Nível 4 — Especialista:** domina a atividade e apoia outras pessoas;
- **Nível 5 — Instrutor:** autorizado a avaliar, treinar e certificar.

A administração deverá poder alterar os nomes dos níveis sem modificar sua ordem.

### 8.3 Dados da competência

Cada vínculo deverá registrar:

- Pessoa;
- Equipamento;
- Componente, quando aplicável;
- Tipo de competência;
- Nível;
- Status;
- Data da avaliação;
- Avaliador;
- Data de validade;
- Treinamento relacionado;
- Evidência ou certificado;
- Observação;
- Restrições;
- Data da última utilização prática;
- Necessidade de reciclagem.

Estados possíveis:

- Não iniciado;
- Em treinamento;
- Aguardando avaliação;
- Habilitado;
- Vencimento próximo;
- Vencido;
- Suspenso;
- Inativo.

### 8.4 Regras de validade

O sistema deverá permitir definir validade por:

- Tipo de competência;
- Equipamento;
- Treinamento;
- Exigência de segurança;
- Exigência de qualidade;
- Regra interna.

Alertas mínimos:

- Vencimento em até 90 dias;
- Vencimento em até 60 dias;
- Vencimento em até 30 dias;
- Competência vencida;
- Evidência ausente;
- Avaliação pendente.

Uma competência vencida não deverá ser considerada cobertura válida.

### 8.5 Alocação da força de trabalho

O usuário autorizado deverá conseguir alocar uma pessoa:

- Na linha;
- Em uma área;
- Em um equipamento;
- Em um posto de trabalho;
- Em uma atividade temporária;
- Como apoio a mais de um equipamento.

A alocação poderá ser realizada por:

- Arrastar e soltar;
- Formulário;
- Escala importada;
- Integração com sistema de turnos;
- Cópia da alocação do turno anterior;
- Modelo de equipe predefinido.

Ao alocar uma pessoa, registrar:

- Linha;
- Área;
- Equipamento ou posto;
- Turno;
- Data e hora inicial;
- Data e hora final;
- Função;
- Tipo de alocação;
- Responsável pela alocação.

### 8.6 Validação antes da alocação

Ao posicionar uma pessoa em um equipamento, o sistema deverá verificar:

- Nível de competência requerido;
- Nível atual da pessoa;
- Validade da competência;
- Restrições;
- Disponibilidade;
- Conflito com outra alocação;
- Exigência de acompanhamento.

Exemplos de alertas:

> A pessoa está em treinamento e exige acompanhamento de um profissional nível 3 ou superior.

> A habilitação para setup está vencida.

> A pessoa já está alocada em outro equipamento no mesmo período.

O sistema deverá diferenciar:

- **Bloqueio:** alocação não permitida;
- **Alerta:** alocação permitida mediante justificativa;
- **Informação:** condição apresentada sem impedir a alocação.

### 8.7 Requisitos mínimos por equipamento

Cada equipamento deverá permitir definir a cobertura mínima necessária.

Exemplo:

- Dois operadores com Operação nível 3 ou superior;
- Uma pessoa com Setup nível 3 ou superior;
- Uma pessoa com Manutenção Autônoma nível 2 ou superior;
- Um especialista nível 4 disponível na área;
- Um instrutor nível 5 disponível no turno.

Os requisitos poderão variar por:

- Turno;
- Produto;
- Processo;
- Estado operacional;
- Tipo de atividade;
- Situação de setup;
- Manutenção planejada.

### 8.8 Cobertura de conhecimento

O sistema deverá calcular a cobertura comparando:

- Competências exigidas;
- Pessoas disponíveis;
- Pessoas alocadas;
- Validade das habilitações;
- Nível mínimo;
- Quantidade mínima de pessoas.

Estados sugeridos:

- **Cobertura adequada:** todos os requisitos atendidos;
- **Cobertura parcial:** operação possível com alerta;
- **Cobertura insuficiente:** requisito obrigatório não atendido;
- **Dependência crítica:** apenas uma pessoa atende ao requisito;
- **Sem cadastro:** requisitos ou competências não configurados.

### 8.9 Modo visual de competências

A Linha 360° deverá possuir a camada **Pessoas e competências**.

Nesse modo, cada equipamento deverá apresentar:

- Verde: cobertura adequada;
- Amarelo: cobertura parcial;
- Vermelho: cobertura insuficiente;
- Roxo: dependência crítica de uma única pessoa;
- Cinza: requisitos ou competências não cadastrados.

Ao selecionar um equipamento, exibir:

- Pessoas alocadas;
- Pessoas habilitadas no turno;
- Especialistas disponíveis;
- Pessoas em treinamento;
- Competências ausentes;
- Habilitações próximas do vencimento;
- Requisitos mínimos;
- Percentual de cobertura.

### 8.10 Consulta por pessoa

Ao selecionar uma pessoa, o mapa deverá destacar:

- Equipamentos em que está habilitada;
- Tipo de competência;
- Nível;
- Validade;
- Equipamento em que está alocada;
- Equipamentos em que pode atuar como apoio;
- Competências em treinamento;
- Competências vencidas.

O usuário deverá conseguir alternar entre:

- Visualização por equipamento;
- Visualização por pessoa;
- Visualização por competência;
- Visualização por turno.

### 8.11 Matriz de conhecimento

A Linha 360° deverá disponibilizar uma matriz contendo:

- Pessoas nas linhas;
- Equipamentos ou competências nas colunas;
- Nível de conhecimento nas células;
- Status de validade;
- Filtros por área, turno, função e competência.

A matriz deverá permitir identificar:

- Equipamentos sem pessoas habilitadas;
- Pessoas com múltiplas competências;
- Dependência de especialistas;
- Necessidades de treinamento;
- Competências vencidas;
- Sucessores potenciais;
- Cobertura entre turnos.

### 8.12 Plano de desenvolvimento

A partir das lacunas identificadas, o sistema deverá permitir criar:

- Necessidade de treinamento;
- Plano de capacitação;
- Avaliação prática;
- Reciclagem;
- Acompanhamento;
- Ação de desenvolvimento.

O plano deverá poder ser relacionado a:

- Pessoa;
- Equipamento;
- Competência;
- Nível atual;
- Nível desejado;
- Responsável pelo treinamento;
- Instrutor;
- Prazo;
- Evidência de conclusão.

### 8.13 Indicadores de pessoas e competências

Indicadores mínimos:

- Cobertura geral da linha;
- Cobertura por turno;
- Equipamentos sem operador habilitado;
- Equipamentos com dependência crítica;
- Competências vencidas;
- Competências próximas do vencimento;
- Pessoas em treinamento;
- Planos de capacitação atrasados;
- Quantidade de especialistas;
- Quantidade de instrutores;
- Percentual de polivalência;
- Percentual de atendimento aos requisitos mínimos.

### 8.14 Histórico e rastreabilidade

O sistema deverá manter histórico de:

- Alterações de nível;
- Avaliações;
- Aprovações;
- Suspensões;
- Vencimentos;
- Renovações;
- Evidências anexadas;
- Alocações;
- Transferências;
- Exceções autorizadas;
- Justificativas;
- Responsáveis pelas alterações.

A atualização de uma competência não deverá apagar avaliações anteriores.

### 8.15 Permissões

As permissões deverão separar:

- Consultar competências;
- Alocar pessoas;
- Criar treinamento;
- Registrar avaliação;
- Aprovar habilitação;
- Suspender competência;
- Alterar requisitos mínimos;
- Consultar evidências;
- Exportar matriz de conhecimento.

Dados pessoais deverão ser limitados ao necessário para a gestão operacional. Informações pessoais não relacionadas à atividade não deverão aparecer na Linha 360°.
## 9. Modos de visualização e camadas

A Linha 360° deverá utilizar um único mapa com diferentes modos de visualização.

Cada modo deverá controlar as informações, os indicadores e as camadas exibidas, evitando a criação de páginas separadas para análises relacionadas à mesma linha.

### 9.1 Seletor de modo

A barra superior deverá possuir um seletor com os seguintes modos:

- Visão geral;
- Operação;
- OEE e perdas;
- Problemas;
- Manutenção;
- Checklists;
- Pessoas e competências;
- Qualidade;
- Segurança;
- Edição do mapa.

Ao trocar de modo, o sistema deverá manter, sempre que aplicável:

- Linha selecionada;
- Período;
- Turno;
- Área;
- Nível de zoom;
- Posição atual do mapa;
- Equipamento selecionado.

### 9.2 Visão geral

A Visão geral deverá apresentar um resumo equilibrado da situação da linha.

Exibir prioritariamente:

- Status dos equipamentos;
- OEE da linha;
- Equipamentos abaixo da meta;
- Problemas críticos;
- Ordens de serviço prioritárias;
- Ações vencidas;
- Checklists atrasados;
- Áreas com maior criticidade;
- Alertas de cobertura de conhecimento.

A Visão geral não deverá exibir todos os registros simultaneamente. Deverá priorizar exceções e situações que exigem atenção.

### 9.3 Operação

O modo Operação deverá apresentar:

- Estado atual dos equipamentos;
- Equipamentos produzindo;
- Equipamentos parados;
- Equipamentos bloqueados;
- Equipamentos ociosos;
- Paradas em andamento;
- Pessoas alocadas;
- Alertas operacionais;
- Ritmo ou velocidade atual, quando disponível;
- Produção realizada;
- Meta de produção;
- Desvios do turno.

Os estados operacionais deverão respeitar a classificação oficial definida pelo módulo de produção.

### 9.4 OEE e perdas

O modo OEE e perdas deverá apresentar:

- OEE por equipamento;
- Meta;
- Disponibilidade;
- Performance;
- Qualidade;
- Tendência;
- Perda de OEE;
- Principais perdas;
- Equipamentos abaixo da meta;
- Mapa de calor por impacto;
- Ranking de equipamentos com maior perda.

O usuário deverá conseguir alternar entre:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Minutos de parada;
- Perda estimada de produção;
- Scrap;
- Perda de velocidade.

### 9.5 Problemas

O modo Problemas deverá apresentar:

- Problemas abertos;
- Problemas críticos;
- Problemas recorrentes;
- Anomalias;
- Ações vinculadas;
- Responsáveis;
- Prazos;
- Mapa de calor;
- Ranking por área e equipamento.

Filtros rápidos:

- Todos;
- Críticos;
- Sem responsável;
- Sem ação;
- Vencidos;
- Recorrentes;
- Abertos há mais tempo.

### 9.6 Manutenção

O modo Manutenção deverá apresentar:

- Ordens de serviço abertas;
- Ordens vencidas;
- Manutenções planejadas;
- Equipamentos em manutenção;
- Equipamentos aguardando peça;
- Backlog;
- MTTR;
- MTBF;
- Falhas recorrentes;
- Prioridade;
- Responsável técnico.

Filtros rápidos:

- Corretiva;
- Preventiva;
- Preditiva;
- Emergencial;
- Planejada;
- Aguardando peça;
- Aguardando execução;
- Vencida.

### 9.7 Checklists

O modo Checklists deverá apresentar:

- Checklists previstos;
- Disponíveis para execução;
- Em andamento;
- Concluídos;
- Reprovados;
- Atrasados;
- Suspensos;
- Próximos do vencimento.

O usuário deverá conseguir filtrar por:

- Tipo;
- Frequência;
- Turno;
- Responsável;
- Área;
- Equipamento;
- Resultado;
- Situação.

Ao selecionar um checklist reprovado, o painel deverá apresentar:

- Itens reprovados;
- Evidências;
- Problemas criados;
- Ações criadas;
- Ordens de serviço relacionadas.

### 9.8 Pessoas e competências

O modo Pessoas e competências deverá apresentar:

- Pessoas alocadas;
- Pessoas disponíveis;
- Cobertura por equipamento;
- Lacunas de conhecimento;
- Dependência crítica;
- Pessoas em treinamento;
- Competências vencidas;
- Competências próximas do vencimento;
- Requisitos não atendidos.

O usuário deverá poder alternar entre:

- Cobertura por equipamento;
- Equipamentos por pessoa;
- Competência específica;
- Turno;
- Função;
- Nível de conhecimento.

### 9.9 Qualidade

O modo Qualidade deverá apresentar:

- Desvios de qualidade;
- Não conformidades;
- Rejeições;
- Scrap;
- Retrabalho;
- Pontos de inspeção;
- Checklists de qualidade;
- Investigações abertas;
- Ações corretivas;
- Equipamentos com maior impacto em qualidade.

Filtros rápidos:

- Crítico;
- Aberto;
- Recorrente;
- Sem investigação;
- Sem ação;
- Produto;
- Lote;
- Tipo de defeito.

### 9.10 Segurança

O modo Segurança deverá apresentar:

- Riscos identificados;
- Condições inseguras;
- Incidentes;
- Quase acidentes;
- Pontos críticos;
- Áreas restritas;
- Rotas de circulação;
- Inspeções pendentes;
- Ações de segurança;
- Bloqueios ativos.

Filtros rápidos:

- Risco crítico;
- Ação vencida;
- Sem responsável;
- Área restrita;
- Bloqueio;
- Inspeção pendente.

### 9.11 Edição do mapa

O modo Edição do mapa deverá ser separado dos modos de consulta.

Somente usuários autorizados deverão acessá-lo.

Nesse modo, permitir:

- Criar e editar áreas;
- Posicionar equipamentos;
- Alterar dimensões e rotação;
- Configurar imagem de fundo;
- Criar pontos fixos;
- Ajustar camadas;
- Resolver sobreposições;
- Salvar rascunho;
- Publicar versão.

Os indicadores operacionais poderão permanecer visíveis apenas como referência, sem permitir alteração acidental dos respectivos registros.

### 9.12 Controle de camadas

Cada modo deverá possuir camadas que podem ser ativadas ou desativadas.

Camadas mínimas:

- Áreas produtivas;
- Equipamentos;
- Nomes dos equipamentos;
- Pessoas;
- OEE;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Paradas;
- Qualidade;
- Segurança;
- Pontos de inspeção;
- Mapa de calor;
- Rotas de circulação;
- Áreas restritas;
- Legenda.

O sistema deverá definir uma combinação padrão de camadas para cada modo.

### 9.13 Regras contra poluição visual

Para manter a leitura do mapa:

1. Exibir somente as camadas relevantes ao modo selecionado.

2. Agrupar registros próximos.

3. Reduzir detalhes quando o zoom estiver distante.

4. Ampliar detalhes progressivamente conforme o zoom.

5. Ocultar nomes sobrepostos.

6. Destacar somente os elementos compatíveis com os filtros.

7. Exibir detalhes completos no painel lateral.

8. Permitir uma opção temporária chamada **Mostrar somente críticos**.

9. Limitar indicadores permanentes sobre os equipamentos.

10. Manter a legenda sincronizada com as camadas ativas.

### 9.14 Salvamento de preferências

O usuário deverá conseguir salvar:

- Modo padrão;
- Camadas visíveis;
- Filtros;
- Linha;
- Turno;
- Indicador do mapa de calor;
- Nível de zoom;
- Cards do resumo;
- Rankings apresentados.

As preferências poderão ser:

- Pessoais;
- Compartilhadas com uma equipe;
- Definidas como padrão por perfil;
- Definidas como padrão da linha.

### 9.15 Atualização das informações

Cada modo deverá informar:

- Horário da última atualização;
- Dados em tempo real;
- Dados com atraso;
- Integrações indisponíveis;
- Informações sem atualização;
- Filtros aplicados.

Quando os dados de uma camada estiverem indisponíveis, o sistema deverá indicar a indisponibilidade em vez de ocultar silenciosamente a camada.
## 10. Pesquisa, filtros e interações no mapa

A Linha 360° deverá permitir que o usuário localize rapidamente áreas, equipamentos, pessoas e registros sem precisar navegar por outros módulos.

As interações deverão preservar o contexto do mapa, mantendo sempre que possível:

- Linha selecionada;
- Período;
- Turno;
- Filtros;
- Camadas ativas;
- Nível de zoom;
- Posição do mapa;
- Elemento selecionado.

### 10.1 Pesquisa global

A barra superior deverá possuir um campo de pesquisa global.

A pesquisa deverá localizar:

- Área produtiva;
- Código do equipamento;
- Nome do equipamento;
- Componente;
- Pessoa;
- Número da ordem de serviço;
- Problema;
- Ação;
- Checklist;
- Ponto de inspeção;
- Categoria;
- Lote;
- Produto;
- Documento;
- Registro relacionado.

A pesquisa deverá aceitar correspondência:

- Exata;
- Parcial;
- Por código;
- Por nome;
- Por palavra-chave;
- Por identificação externa.

### 10.2 Resultado da pesquisa

Os resultados deverão ser agrupados por tipo.

Exemplo:

- Equipamentos;
- Pessoas;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Áreas;
- Documentos.

Cada resultado deverá apresentar as informações mínimas para identificação.

Exemplo para equipamento:

- Código;
- Nome;
- Linha;
- Área;
- Status.

Exemplo para ordem de serviço:

- Número;
- Equipamento;
- Status;
- Prioridade;
- Data de abertura.

### 10.3 Localização automática

Ao selecionar um resultado, o sistema deverá:

1. Ativar a camada necessária;
2. Ajustar o zoom;
3. Centralizar o elemento no mapa;
4. Destacar visualmente o elemento;
5. Abrir o painel lateral de detalhes;
6. Manter o resultado destacado até o usuário fechar ou selecionar outro item.

Quando o registro não possuir localização no mapa, o sistema deverá informar:

> Este registro ainda não está vinculado a uma localização na Linha 360°.

Usuários autorizados deverão poder vincular o registro diretamente a partir dessa mensagem.

### 10.4 Filtros principais

A tela deverá disponibilizar filtros para:

- Linha;
- Área produtiva;
- Equipamento;
- Componente;
- Data inicial;
- Data final;
- Hora;
- Turno;
- Produto;
- Lote;
- Tipo de registro;
- Categoria;
- Status;
- Criticidade;
- Responsável;
- Pessoa;
- Tipo de competência;
- Nível de conhecimento;
- Faixa de OEE;
- Tipo de perda;
- Origem do registro;
- Registros abertos;
- Registros vencidos;
- Registros críticos.

### 10.5 Filtros rápidos

Cada modo de visualização deverá possuir filtros rápidos adequados ao contexto.

Exemplos:

#### Visão geral

- Somente críticos;
- Vencidos;
- Sem responsável;
- Abaixo da meta;
- Sem cobertura de conhecimento.

#### Operação

- Produzindo;
- Parado;
- Bloqueado;
- Ocioso;
- Sem informação.

#### Manutenção

- OS corretiva;
- OS preventiva;
- OS vencida;
- Aguardando peça;
- Em execução.

#### Pessoas e competências

- Cobertura insuficiente;
- Dependência crítica;
- Competência vencida;
- Em treinamento;
- Sem cadastro.

Os filtros rápidos deverão funcionar em conjunto com os filtros avançados.

### 10.6 Aplicação dos filtros

Ao aplicar um filtro, o sistema deverá atualizar simultaneamente:

- Elementos do mapa;
- Mapa de calor;
- Cards;
- Rankings;
- Totais;
- Lista de registros;
- Painel de detalhes;
- Legenda;
- Comparações;
- Indicadores.

A tela deverá apresentar claramente os filtros ativos.

Cada filtro ativo deverá aparecer como um marcador removível.

Exemplo:

- Turno: 1º turno;
- Área: Embalagem;
- Status: Aberto;
- Criticidade: Alta e crítica;
- Período: Últimos 30 dias.

### 10.7 Limpeza dos filtros

O sistema deverá permitir:

- Remover um filtro individual;
- Limpar todos os filtros;
- Retornar aos filtros padrão do modo;
- Restaurar a última configuração utilizada;
- Aplicar uma visualização salva.

Antes de limpar filtros que alterem significativamente a análise, o sistema poderá solicitar confirmação.

### 10.8 Seleção simples

Ao clicar uma vez em um elemento:

- O elemento deverá ser destacado;
- O painel lateral deverá ser aberto;
- Os registros relacionados poderão ser destacados;
- Os demais elementos poderão ter sua intensidade visual reduzida.

A seleção deverá funcionar para:

- Área;
- Equipamento;
- Pessoa;
- Problema;
- Ordem de serviço;
- Ação;
- Checklist;
- Ponto de inspeção;
- Região do mapa de calor.

### 10.9 Seleção múltipla

O sistema deverá permitir selecionar mais de um elemento utilizando:

- Tecla modificadora;
- Caixa de seleção;
- Seleção por área;
- Lista de resultados;
- Ranking.

A seleção múltipla poderá ser utilizada para:

- Comparar equipamentos;
- Comparar áreas;
- Analisar vários problemas;
- Vincular checklist;
- Aplicar ação em lote;
- Exportar dados;
- Avaliar cobertura de pessoas;
- Criar agrupamento.

Ações em lote deverão apresentar confirmação antes da execução.

### 10.10 Duplo clique

O duplo clique deverá executar a ação principal do elemento.

Exemplos:

- Equipamento: abrir análise completa;
- Área: aproximar e enquadrar o polígono;
- Pessoa: abrir competências;
- Problema: abrir registro completo;
- Ordem de serviço: abrir detalhes;
- Checklist: abrir execução ou histórico;
- Grupo de registros: expandir os itens.

A ação deverá ser consistente em toda a plataforma.

### 10.11 Menu de contexto

Ao clicar com o botão direito, ou utilizar o botão de opções em tablet, o sistema deverá apresentar ações relacionadas ao elemento.

#### Equipamento

- Abrir detalhes;
- Criar problema;
- Criar ordem de serviço;
- Criar ação;
- Associar checklist;
- Vincular pessoa;
- Consultar OEE;
- Consultar perdas;
- Abrir documentos;
- Visualizar histórico.

#### Área

- Abrir resumo;
- Criar registro;
- Visualizar equipamentos;
- Visualizar pessoas;
- Ativar mapa de calor;
- Consultar problemas;
- Consultar ordens de serviço;
- Consultar indicadores.

#### Ponto livre

- Criar problema;
- Criar observação;
- Criar ponto de inspeção;
- Registrar risco;
- Adicionar foto;
- Vincular registro existente.

#### Pessoa

- Consultar competências;
- Visualizar alocação;
- Realocar;
- Criar necessidade de treinamento;
- Visualizar habilitações;
- Consultar histórico.

As opções deverão respeitar as permissões do usuário.

### 10.12 Arrastar e soltar

O sistema deverá fornecer retorno visual durante o arrastar e soltar.

O usuário deverá identificar:

- Elemento sendo movimentado;
- Pontos válidos para soltar;
- Área de destino;
- Equipamento de destino;
- Ação que será executada;
- Restrições;
- Possíveis conflitos.

Estados visuais sugeridos:

- Verde: destino válido;
- Amarelo: permitido com confirmação;
- Vermelho: destino inválido;
- Cinza: local sem vínculo definido.

Nenhuma alteração deverá ser concluída sem que o usuário compreenda o vínculo criado.

### 10.13 Agrupamento de registros

Quando vários registros estiverem próximos, o sistema deverá criar agrupamentos visuais.

O agrupamento deverá apresentar:

- Quantidade total;
- Quantidade crítica;
- Tipos de registro;
- Indicador de vencimento;
- Maior criticidade;
- Registro mais antigo.

Ao selecionar o agrupamento, o usuário poderá:

- Aproximar o mapa;
- Expandir os registros;
- Abrir uma lista;
- Aplicar filtros;
- Consultar o resumo.

### 10.14 Navegação e zoom

O mapa deverá permitir:

- Zoom pela roda do mouse;
- Controles de aproximação e afastamento;
- Movimento por arraste;
- Enquadrar toda a linha;
- Centralizar a área selecionada;
- Retornar à posição inicial;
- Tela cheia;
- Mini mapa de navegação, quando necessário.

O zoom deverá controlar o nível de detalhe:

#### Zoom distante

Exibir:

- Áreas;
- Status gerais;
- Mapa de calor;
- Indicadores consolidados.

#### Zoom intermediário

Exibir:

- Equipamentos;
- Código ou nome curto;
- Status;
- Indicadores principais;
- Agrupamentos de registros.

#### Zoom próximo

Exibir:

- Componentes;
- Pessoas;
- Registros individuais;
- Pontos de inspeção;
- Detalhes adicionais.

### 10.15 Linha do tempo

A Linha 360° deverá permitir navegar no tempo para consultar a condição da linha em um período anterior.

A linha do tempo deverá permitir:

- Selecionar data;
- Selecionar hora;
- Selecionar turno;
- Avançar ou retroceder;
- Reproduzir evolução do período;
- Comparar dois momentos;
- Retornar à situação atual.

A consulta histórica deverá considerar:

- Estado dos equipamentos;
- Eventos registrados;
- Pessoas alocadas;
- Áreas vigentes;
- Posicionamento válido dos equipamentos;
- OEE;
- Paradas;
- Problemas;
- Ordens de serviço;
- Checklists;
- Mapa de calor.

O sistema deverá deixar claro quando o usuário estiver visualizando dados históricos.

### 10.16 Atalhos de teclado

No desktop, poderão ser disponibilizados:

- `Esc`: cancelar ação ou fechar painel;
- `Ctrl + Z`: desfazer alteração no modo de edição;
- `Ctrl + Shift + Z`: refazer;
- `Ctrl + F`: abrir pesquisa;
- `Delete`: remover elemento selecionado do mapa, mediante confirmação;
- `+`: aproximar;
- `-`: afastar;
- `F`: enquadrar toda a linha;
- `L`: abrir controle de camadas.

Os atalhos deverão aparecer em uma tela de ajuda.

### 10.17 Interações em tablet

No tablet, ações dependentes do botão direito deverão ser substituídas por:

- Pressionar e segurar;
- Botão de opções;
- Barra de ações contextual;
- Gestos compatíveis com toque.

O sistema deverá suportar:

- Pinça para zoom;
- Arraste com um dedo;
- Seleção por toque;
- Pressionar e segurar;
- Painéis laterais adaptados;
- Botões com área de toque adequada.

### 10.18 Prevenção de alterações acidentais

O sistema deverá:

- Separar consulta e edição;
- Bloquear arraste no modo de consulta;
- Solicitar confirmação para movimentações relevantes;
- Permitir desfazer;
- Salvar rascunhos durante edição;
- Alertar antes de sair com alterações não publicadas;
- Manter histórico;
- Exigir justificativa para exceções críticas.

O usuário não deverá conseguir mover equipamentos, áreas ou pessoas acidentalmente durante uma consulta normal.
## 11. Painel de gestão e indicadores

A Linha 360° deverá possuir um painel de gestão integrado ao mapa.

O painel deverá consolidar os principais indicadores operacionais e permitir que o usuário identifique rapidamente:

- Situação atual da linha;
- Principais perdas;
- Áreas críticas;
- Equipamentos que exigem atenção;
- Pendências;
- Riscos;
- Lacunas de conhecimento;
- Prioridades de atuação.

Os indicadores deverão responder aos filtros aplicados e permitir navegação direta para os elementos do mapa que formaram o resultado.

### 11.1 Estrutura do painel

O painel deverá ser composto por:

- Cards de indicadores;
- Alertas prioritários;
- Rankings;
- Tendências;
- Resumo por área;
- Resumo por equipamento;
- Lista de pendências;
- Atalhos para análise detalhada.

O usuário poderá recolher o painel para ampliar o mapa.

### 11.2 Cards principais

Cards mínimos:

- OEE da linha;
- Meta de OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Produção realizada;
- Meta de produção;
- Minutos de parada;
- Equipamentos abaixo da meta;
- Equipamentos parados;
- Problemas abertos;
- Problemas críticos;
- Ordens de serviço abertas;
- Ordens de serviço vencidas;
- Ações abertas;
- Ações vencidas;
- Checklists atrasados;
- Checklists reprovados;
- Scrap;
- Desvios de qualidade;
- Riscos de segurança;
- Cobertura de conhecimento;
- Equipamentos sem cobertura adequada.

Cada card deverá apresentar:

- Nome do indicador;
- Valor atual;
- Meta ou limite;
- Diferença;
- Tendência;
- Comparação com período anterior;
- Cor de situação;
- Data e hora da atualização.

### 11.3 Comportamento dos cards

Ao selecionar um card, o sistema deverá:

1. Ativar o modo de visualização correspondente;
2. Aplicar os filtros necessários;
3. Destacar no mapa os elementos que formam o indicador;
4. Atualizar os rankings;
5. Abrir a lista detalhada;
6. Manter disponível a opção de retornar à visão anterior.

Exemplo:

Ao selecionar **Ordens de serviço vencidas**, o mapa deverá exibir somente os equipamentos, áreas e pontos com ordens vencidas.

### 11.4 Alertas prioritários

O painel deverá destacar situações que exigem atuação imediata.

Exemplos:

- Equipamento crítico parado;
- OEE significativamente abaixo da meta;
- Problema crítico sem responsável;
- Ordem de serviço emergencial vencida;
- Ação crítica vencida;
- Checklist crítico não executado;
- Risco de segurança aberto;
- Equipamento sem operador habilitado;
- Dependência de uma única pessoa;
- Falha de atualização dos dados;
- Aumento anormal de perdas.

Cada alerta deverá apresentar:

- Tipo;
- Criticidade;
- Localização;
- Horário;
- Responsável;
- Prazo;
- Status;
- Ação recomendada;
- Link para o item de origem.

### 11.5 Priorização dos alertas

Os alertas deverão ser ordenados considerando:

- Criticidade;
- Impacto;
- Urgência;
- Tempo em aberto;
- Recorrência;
- Risco;
- Prazo;
- Dependências;
- Impacto no OEE;
- Impacto na produção.

A regra de priorização deverá ser configurável.

O sistema deverá exibir os fatores que fizeram o alerta receber determinada prioridade.

### 11.6 Rankings

Rankings mínimos:

- Áreas com maior criticidade;
- Equipamentos com maior perda de OEE;
- Equipamentos com mais minutos de parada;
- Equipamentos com mais falhas;
- Problemas mais recorrentes;
- Ordens de serviço mais antigas;
- Ações vencidas há mais tempo;
- Checklists com mais reprovações;
- Áreas com mais desvios de qualidade;
- Pontos com maior risco de segurança;
- Equipamentos com menor cobertura de conhecimento;
- Equipamentos com dependência crítica de pessoas.

Cada ranking deverá permitir:

- Ordenação;
- Filtro;
- Seleção do período;
- Seleção do indicador;
- Acesso aos registros de origem;
- Localização do item no mapa.

### 11.7 Resumo por área

Para cada área produtiva, apresentar:

- OEE, quando aplicável;
- Equipamentos operando;
- Equipamentos parados;
- Minutos de parada;
- Quantidade de problemas;
- Problemas críticos;
- Ordens de serviço abertas;
- Ações vencidas;
- Checklists atrasados;
- Scrap;
- Desvios de qualidade;
- Riscos de segurança;
- Pessoas alocadas;
- Cobertura de conhecimento;
- Índice de criticidade.

Ao selecionar uma área, o mapa deverá enquadrar o polígono e abrir o detalhamento.

### 11.8 Resumo por equipamento

Para cada equipamento, apresentar:

- Status;
- OEE;
- Meta;
- Disponibilidade;
- Performance;
- Qualidade;
- Produção;
- Minutos de parada;
- Problemas abertos;
- Ordens de serviço abertas;
- Ações abertas;
- Checklists pendentes;
- Pessoas alocadas;
- Cobertura de conhecimento;
- Última atualização.

### 11.9 Tendências

O painel deverá apresentar tendências para:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Produção;
- Paradas;
- Scrap;
- Problemas;
- Ordens de serviço;
- Checklists;
- Cobertura de conhecimento.

Períodos disponíveis:

- Hora;
- Turno;
- Dia;
- Semana;
- Mês;
- Período personalizado.

Toda tendência deverá apresentar:

- Valor atual;
- Valor anterior;
- Diferença absoluta;
- Diferença percentual;
- Meta;
- Direção da tendência.

A cor da tendência deverá considerar se o aumento ou a redução é favorável para aquele indicador.

### 11.10 Lista de pendências

A lista deverá consolidar:

- Problemas sem responsável;
- Problemas sem ação;
- Ordens de serviço vencidas;
- Ações vencidas;
- Checklists atrasados;
- Avaliações de competência pendentes;
- Treinamentos atrasados;
- Competências vencidas;
- Registros sem localização;
- Equipamentos sem área;
- Equipamentos sem dados;
- Inconsistências de integração.

A lista deverá permitir:

- Atribuir responsável;
- Definir prazo;
- Alterar prioridade;
- Abrir detalhes;
- Localizar no mapa;
- Filtrar;
- Exportar;
- Executar ações em lote, conforme permissão.

### 11.11 Comparação entre períodos

O painel deverá permitir comparar:

- Turno atual com turno anterior;
- Dia atual com dia anterior;
- Semana atual com semana anterior;
- Mês atual com mês anterior;
- Período antes e depois de uma ação;
- Resultado atual com a meta.

A comparação deverá utilizar o mesmo critério, fonte e período equivalente.

Quando a comparação não for válida, o sistema deverá informar o motivo.

### 11.12 Atualização e qualidade dos dados

O painel deverá informar:

- Última atualização;
- Fonte dos dados;
- Indicadores atualizados;
- Indicadores desatualizados;
- Integrações indisponíveis;
- Dados incompletos;
- Equipamentos sem dados;
- Regras de cálculo utilizadas.

Dados ausentes não deverão ser tratados como zero.

Indicadores desatualizados deverão possuir marcação visual e horário do último dado válido.

### 11.13 Personalização do painel

O usuário deverá conseguir:

- Reordenar cards;
- Ocultar cards;
- Fixar indicadores;
- Selecionar rankings;
- Definir período padrão;
- Salvar filtros;
- Salvar a configuração;
- Restaurar o padrão.

A administração poderá definir:

- Painel padrão da linha;
- Painel padrão por perfil;
- Indicadores obrigatórios;
- Cards que não podem ser removidos;
- Limites e metas oficiais.

### 11.14 Exportação e compartilhamento

O painel deverá permitir exportar:

- Imagem da visão atual;
- PDF;
- Planilha;
- Lista de registros;
- Resumo por área;
- Resumo por equipamento;
- Indicadores do período.

A exportação deverá registrar:

- Linha;
- Período;
- Turno;
- Filtros;
- Data e hora;
- Usuário;
- Fonte;
- Última atualização.

Também deverá ser possível gerar um link interno que preserve:

- Linha;
- Modo;
- Filtros;
- Elemento selecionado;
- Período;
- Camadas ativas.

O acesso ao link deverá respeitar as permissões do usuário.
## 12. Permissões, governança e rastreabilidade

A Linha 360° deverá possuir controle de acesso por perfil e por tipo de ação.

As permissões deverão distinguir claramente:

- Consulta de informações;
- Criação de registros;
- Atualização de registros;
- Posicionamento de pessoas;
- Edição do mapa;
- Alteração de áreas;
- Publicação de versões;
- Administração das regras.

O acesso a uma informação não deverá conceder automaticamente permissão para alterá-la.

### 12.1 Perfis de acesso

A solução deverá considerar, no mínimo, os seguintes perfis:

#### Visualizador

Poderá:

- Consultar o mapa;
- Aplicar filtros;
- Alternar modos de visualização;
- Consultar áreas e equipamentos;
- Abrir detalhes;
- Consultar indicadores permitidos;
- Utilizar pesquisa;
- Visualizar registros autorizados.

Não poderá:

- Criar registros;
- Alterar posicionamentos;
- Editar áreas;
- Publicar versões;
- Alterar competências;
- Alocar pessoas.

#### Operador

Poderá:

- Executar checklists;
- Criar problemas;
- Registrar anomalias;
- Inserir observações;
- Adicionar fotos;
- Consultar equipamentos;
- Consultar documentos operacionais;
- Atualizar registros próprios, conforme regra;
- Informar ocorrência em um ponto do mapa.

Não poderá alterar a estrutura oficial do mapa.

#### Líder ou supervisor

Poderá:

- Consultar todos os dados operacionais permitidos;
- Criar problemas, ações e checklists;
- Definir responsáveis;
- Atualizar prioridades;
- Posicionar ou realocar pessoas;
- Consultar competências;
- Autorizar exceções operacionais;
- Corrigir vínculos de localização;
- Acompanhar pendências;
- Consultar indicadores da linha.

A edição estrutural do mapa dependerá de permissão adicional.

#### Manutenção

Poderá:

- Criar solicitação de manutenção;
- Vincular ordem de serviço;
- Atualizar informações de manutenção;
- Consultar equipamentos;
- Consultar problemas relacionados;
- Visualizar documentos técnicos;
- Adicionar evidências;
- Atualizar status permitido;
- Consultar histórico de falhas;
- Consultar MTTR e MTBF.

#### Qualidade

Poderá:

- Criar desvios;
- Registrar não conformidades;
- Vincular produto e lote;
- Criar ações;
- Consultar checklists de qualidade;
- Consultar rejeições e scrap;
- Registrar investigação;
- Adicionar evidências;
- Atualizar registros de qualidade permitidos.

#### Segurança

Poderá:

- Registrar riscos;
- Registrar condições inseguras;
- Criar pontos de inspeção;
- Criar ações;
- Definir áreas restritas;
- Consultar bloqueios;
- Adicionar evidências;
- Atualizar registros de segurança permitidos.

#### Gestor de competências

Poderá:

- Consultar a matriz de conhecimento;
- Registrar avaliações;
- Alterar níveis;
- Aprovar habilitações;
- Suspender competências;
- Criar planos de treinamento;
- Atualizar validade;
- Anexar evidências;
- Definir requisitos mínimos, quando autorizado.

#### Editor do mapa

Poderá:

- Alterar imagem de fundo;
- Criar e editar áreas;
- Posicionar equipamentos;
- Ajustar dimensões e rotação;
- Criar pontos fixos;
- Resolver sobreposições;
- Salvar rascunhos;
- Preparar uma versão para publicação.

Não deverá publicar uma versão sem a permissão específica de publicação.

#### Publicador do mapa

Poderá:

- Revisar alterações;
- Comparar versões;
- Aprovar ou rejeitar rascunhos;
- Publicar nova versão;
- Restaurar versão anterior;
- Registrar justificativa da publicação.

#### Administrador

Poderá:

- Configurar permissões;
- Configurar perfis;
- Definir regras de negócio;
- Definir escalas e limites;
- Configurar integrações;
- Gerenciar camadas;
- Configurar pesos do mapa de calor;
- Configurar alertas;
- Gerenciar versões;
- Consultar logs;
- Executar correções administrativas permitidas.

### 12.2 Permissões específicas

Além dos perfis, o sistema deverá possuir permissões específicas para:

- Visualizar Linha 360°;
- Visualizar OEE;
- Visualizar dados de pessoas;
- Visualizar competências;
- Visualizar documentos;
- Criar problema;
- Criar ordem de serviço;
- Criar ação;
- Criar checklist;
- Executar checklist;
- Registrar desvio de qualidade;
- Registrar risco de segurança;
- Vincular registro existente;
- Corrigir localização;
- Posicionar pessoa;
- Alocar pessoa;
- Alterar competência;
- Aprovar competência;
- Editar mapa;
- Editar áreas;
- Posicionar equipamentos;
- Publicar mapa;
- Restaurar versão;
- Exportar dados;
- Compartilhar visualização;
- Administrar configurações.

As permissões deverão ser combináveis para atender funções específicas sem necessidade de criar novos perfis completos.

### 12.3 Escopo das permissões

As permissões deverão poder ser limitadas por:

- Unidade;
- Planta;
- Linha;
- Área;
- Turno;
- Tipo de equipamento;
- Tipo de registro;
- Função;
- Módulo;
- Período.

Exemplo:

Uma liderança poderá alterar a alocação de pessoas somente na linha sob sua responsabilidade.

### 12.4 Separação entre consulta e edição

O sistema deverá possuir dois estados claramente identificados:

#### Modo de consulta

- Não permite movimentar áreas ou equipamentos;
- Não permite alterar dimensões;
- Não permite editar polígonos;
- Não permite reposicionar registros acidentalmente;
- Mantém disponíveis as ações operacionais autorizadas.

#### Modo de edição

- Exige permissão específica;
- Apresenta ferramentas de desenho;
- Permite movimentação estrutural;
- Salva alterações como rascunho;
- Não altera a versão publicada até a publicação formal.

A entrada no modo de edição deverá ser visualmente evidente.

### 12.5 Fluxo de publicação do mapa

A publicação deverá seguir:

1. Editor realiza as alterações;
2. Sistema salva o conteúdo como rascunho;
3. Sistema executa validações automáticas;
4. Editor envia para revisão;
5. Publicador revisa as diferenças;
6. Publicador aprova ou rejeita;
7. Se aprovado, uma nova versão é publicada;
8. A versão anterior permanece disponível no histórico.

A administração poderá permitir publicação direta em ambientes ou linhas de menor criticidade.

### 12.6 Validações antes da publicação

Antes de publicar, verificar:

- Áreas sem nome;
- Polígonos inválidos;
- Áreas produtivas sobrepostas;
- Equipamentos sobrepostos;
- Equipamentos fora do mapa;
- Equipamentos sem área;
- Equipamentos duplicados;
- Registros sem origem;
- Pontos fixos inválidos;
- Imagem de fundo ausente;
- Vínculos inconsistentes;
- Alterações que afetem registros abertos;
- Camadas obrigatórias desativadas.

O sistema deverá separar:

- Erros que impedem publicação;
- Alertas que exigem confirmação;
- Informações que não impedem publicação.

### 12.7 Histórico de versões

Cada versão deverá registrar:

- Número da versão;
- Status;
- Data de criação;
- Data de publicação;
- Usuário editor;
- Usuário publicador;
- Motivo da alteração;
- Resumo das modificações;
- Áreas criadas;
- Áreas alteradas;
- Áreas inativadas;
- Equipamentos movimentados;
- Equipamentos adicionados;
- Equipamentos removidos do mapa;
- Imagem de fundo alterada;
- Pontos fixos alterados;
- Validações realizadas.

### 12.8 Comparação entre versões

O usuário autorizado deverá conseguir comparar duas versões.

A comparação deverá destacar:

- Posição anterior e atual dos equipamentos;
- Perímetros alterados;
- Áreas criadas ou removidas;
- Alterações na imagem de fundo;
- Pontos adicionados ou removidos;
- Mudanças de vínculos;
- Configurações modificadas.

As diferenças deverão ser apresentadas visualmente no mapa e também em uma lista.

### 12.9 Restauração de versão

O sistema deverá permitir restaurar uma versão anterior.

A restauração deverá:

1. Criar um novo rascunho com base na versão escolhida;
2. Não apagar o histórico posterior;
3. Exigir justificativa;
4. Executar novamente as validações;
5. Exigir nova publicação.

A versão anterior não deverá substituir diretamente a versão atual sem rastreabilidade.

### 12.10 Auditoria das ações

Deverão ser auditadas:

- Criação e alteração de áreas;
- Movimentação de equipamentos;
- Alteração da imagem de fundo;
- Posicionamento de pessoas;
- Alteração de competências;
- Criação de registros pelo mapa;
- Vinculação de registros;
- Correção de localização;
- Remoção de elementos do mapa;
- Alteração de permissões;
- Alteração de regras;
- Publicação;
- Restauração;
- Exportação de dados;
- Exceções autorizadas.

### 12.11 Informações do log

Cada evento de auditoria deverá registrar:

- Usuário;
- Data e hora;
- Tipo de ação;
- Módulo;
- Registro afetado;
- Valor anterior;
- Novo valor;
- Linha;
- Área;
- Equipamento;
- Origem da alteração;
- Justificativa, quando necessária;
- Identificador da sessão ou transação;
- Resultado da operação.

### 12.12 Consulta da auditoria

Usuários autorizados deverão poder filtrar o histórico por:

- Data;
- Usuário;
- Linha;
- Área;
- Equipamento;
- Tipo de ação;
- Tipo de registro;
- Versão;
- Resultado;
- Origem;
- Criticidade.

O histórico deverá permitir localizar no mapa o elemento relacionado à alteração.

### 12.13 Regras para exclusão

Registros integrados não deverão ser excluídos diretamente pela Linha 360°.

Quando o usuário remover um elemento do mapa:

- O cadastro original deverá permanecer;
- O histórico deverá permanecer;
- O vínculo espacial poderá ser encerrado;
- A data final de validade deverá ser registrada;
- O motivo poderá ser obrigatório;
- Registros dependentes deverão ser verificados.

Quando a exclusão definitiva for permitida pelo módulo de origem, deverá exigir permissão específica e confirmação.

### 12.14 Vigência dos vínculos

Os vínculos espaciais deverão possuir período de vigência.

Exemplos:

- Equipamento na área A até determinada data;
- Equipamento transferido para a área B;
- Pessoa alocada durante um turno;
- Área válida em uma versão específica;
- Checklist vinculado a um posto durante determinado período.

Dados históricos deverão utilizar o vínculo válido na data do evento.

### 12.15 Proteção dos dados de pessoas

A Linha 360° deverá apresentar somente os dados pessoais necessários para a gestão operacional.

Poderão ser exibidos:

- Nome;
- Identificação funcional autorizada;
- Função;
- Turno;
- Área;
- Alocação;
- Competências profissionais;
- Status das habilitações.

Não deverão ser apresentados dados pessoais sem relação com a operação.

O acesso às evidências e certificados deverá possuir permissão específica.

### 12.16 Falhas e tentativas não autorizadas

O sistema deverá registrar:

- Tentativas de acesso sem permissão;
- Tentativas de alteração bloqueadas;
- Falhas de publicação;
- Erros de integração;
- Alterações não concluídas;
- Conflitos de versão;
- Operações rejeitadas.

A mensagem ao usuário deverá explicar a restrição sem expor informações sensíveis.

### 12.17 Conflito de edição

Quando dois usuários editarem o mesmo mapa:

- O sistema deverá informar que existe outra edição ativa;
- As alterações não deverão ser sobrescritas silenciosamente;
- O usuário deverá visualizar quem está editando;
- Conflitos deverão ser apresentados para resolução;
- A publicação deverá utilizar controle de versão.

Para alterações estruturais, o sistema poderá permitir somente um editor ativo por versão.

### 12.18 Responsabilidades administrativas

A administração deverá definir:

- Proprietário funcional da Linha 360°;
- Responsável pelo mapa de cada linha;
- Responsável pela publicação;
- Responsável pelas regras de competência;
- Responsável pelos indicadores;
- Responsável pelas integrações;
- Frequência de revisão do mapa;
- Frequência de revisão das permissões;
- Prazo de retenção do histórico;
- Regras de contingência.

Essas responsabilidades deverão ser documentadas e revisadas periodicamente.
## 13. Integrações, fontes de dados e atualização

A Linha 360° deverá funcionar como uma camada integrada de visualização e interação.

A funcionalidade não deverá duplicar cadastros, indicadores ou registros já existentes na plataforma ou em sistemas externos. Sempre que possível, deverá utilizar as fontes oficiais e manter apenas os vínculos necessários para representação espacial.

### 13.1 Princípio de fonte oficial

Cada informação apresentada deverá possuir uma fonte oficial definida.

Exemplos:

- Equipamentos: cadastro oficial de equipamentos;
- Pessoas: cadastro oficial de usuários ou colaboradores;
- Turnos e escalas: módulo de força de trabalho;
- Produção: módulo de produção;
- Paradas: módulo de apontamentos ou sistema supervisório;
- OEE: motor oficial de cálculo de OEE;
- Ordens de serviço: módulo de manutenção ou sistema externo;
- Checklists: módulo de checklists;
- Problemas: módulo de problemas e anomalias;
- Ações: módulo de planos de ação;
- Qualidade: módulo de qualidade;
- Competências: matriz oficial de conhecimento;
- Documentos: repositório oficial de documentos;
- Metas: cadastro oficial de metas e parâmetros.

A Linha 360° deverá registrar a origem de cada informação apresentada.

### 13.2 Dados mantidos pela Linha 360°

A Linha 360° deverá armazenar diretamente apenas os dados específicos da representação espacial e da experiência da página.

Exemplos:

- Coordenadas dos equipamentos;
- Dimensões e rotação;
- Polígonos das áreas;
- Imagem de fundo;
- Pontos fixos;
- Vínculos espaciais;
- Configuração das camadas;
- Visualizações salvas;
- Preferências do usuário;
- Histórico das versões do mapa;
- Configurações do mapa de calor;
- Agrupamentos visuais;
- Vigência dos posicionamentos.

Dados operacionais não deverão ser copiados sem necessidade.

### 13.3 Integração com equipamentos

A integração com o cadastro de equipamentos deverá fornecer:

- Identificador único;
- Código;
- Nome;
- Tipo;
- Linha;
- Área cadastrada;
- Status;
- Papel no processo;
- Hierarquia;
- Equipamento principal;
- Componentes;
- Foto;
- Documentos técnicos;
- Status de atividade.

Quando um equipamento for inativado no cadastro oficial, a Linha 360° deverá:

1. Manter o histórico;
2. Identificar o equipamento como inativo;
3. Impedir novos registros incompatíveis;
4. Permitir sua retirada do mapa;
5. Preservar os eventos anteriores.

### 13.4 Integração com produção

A integração com Produção deverá fornecer, quando disponível:

- Estado operacional;
- Ordem de produção;
- Produto;
- Lote;
- Meta;
- Quantidade produzida;
- Quantidade aprovada;
- Quantidade rejeitada;
- Ritmo atual;
- Velocidade de referência;
- Turno;
- Início e fim da produção;
- Tempo programado;
- Tempo produtivo.

Os estados operacionais deverão seguir a classificação oficial da plataforma, por exemplo:

- Produzindo;
- Parado;
- Bloqueado;
- Ocioso.

A Linha 360° não deverá criar uma classificação paralela para esses estados.

### 13.5 Integração com paradas

A integração com o módulo de paradas deverá fornecer:

- Identificador do evento;
- Equipamento;
- Início;
- Fim;
- Duração;
- Categoria;
- Motivo;
- Estado;
- Turno;
- Produto;
- Lote;
- Responsável pelo apontamento;
- Origem;
- Impacto;
- Registro relacionado.

Paradas abertas deverão ser atualizadas enquanto estiverem em andamento.

Correções realizadas no módulo de origem deverão ser refletidas na Linha 360°.

### 13.6 Integração com OEE

A integração com o cálculo de OEE deverá fornecer:

- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Meta;
- Período;
- Nível do cálculo;
- Equipamento;
- Célula;
- Linha;
- Fonte;
- Data e hora do processamento;
- Status do cálculo.

O sistema deverá indicar se o valor é:

- Individual do equipamento;
- Consolidado do agrupamento;
- Herdado da célula;
- Herdado da linha;
- Calculado em tempo real;
- Consolidado após fechamento do período.

A Linha 360° não deverá recalcular o OEE utilizando lógica diferente da fonte oficial.

### 13.7 Integração com manutenção

A integração com Manutenção deverá fornecer:

- Número da ordem de serviço;
- Identificador externo;
- Equipamento;
- Tipo de manutenção;
- Prioridade;
- Status;
- Descrição;
- Solicitante;
- Responsável;
- Data de abertura;
- Prazo;
- Data de conclusão;
- Motivo da falha;
- Serviço realizado;
- Peças utilizadas;
- Tempo de reparo;
- Problema de origem.

Quando a ordem estiver em sistema externo, a Linha 360° deverá armazenar apenas:

- Identificador externo;
- Vínculo espacial;
- Dados necessários para apresentação;
- Data da última sincronização.

### 13.8 Integração com checklists

A integração com Checklists deverá fornecer:

- Identificador;
- Nome;
- Tipo;
- Frequência;
- Área;
- Equipamento;
- Responsável;
- Turno;
- Data prevista;
- Data de execução;
- Status;
- Resultado;
- Itens reprovados;
- Evidências;
- Problemas gerados;
- Ações geradas;
- Ordens de serviço geradas.

A execução deverá ocorrer no módulo oficial ou em um formulário integrado aberto pela Linha 360°.

### 13.9 Integração com problemas e ações

A integração deverá permitir:

- Criar problema pelo mapa;
- Consultar problema;
- Atualizar campos autorizados;
- Vincular equipamento;
- Vincular área;
- Vincular ordem de serviço;
- Criar ação;
- Consultar ação;
- Consultar prazo;
- Consultar responsável;
- Consultar evidências;
- Encerrar vínculo espacial sem excluir o registro.

Problemas e ações deverão manter o mesmo identificador utilizado em seus módulos de origem.

### 13.10 Integração com pessoas e turnos

A integração deverá fornecer:

- Identificador funcional;
- Nome;
- Função;
- Turno;
- Área;
- Disponibilidade;
- Ausência;
- Alocação prevista;
- Alocação atual;
- Restrições operacionais autorizadas;
- Status ativo ou inativo.

Somente os dados necessários à gestão da linha deverão ser disponibilizados.

Ausências e informações pessoais sensíveis não deverão ser detalhadas no mapa além do necessário para indicar disponibilidade operacional.

### 13.11 Integração com competências

A integração com a matriz de conhecimento deverá fornecer:

- Pessoa;
- Equipamento;
- Tipo de competência;
- Nível;
- Status;
- Validade;
- Avaliador;
- Treinamento;
- Evidência;
- Restrição;
- Necessidade de reciclagem.

Quando não existir um módulo oficial de competências, a Linha 360° poderá utilizar uma estrutura própria temporária, desde que definida como fonte oficial até a implantação do módulo definitivo.

### 13.12 Integração com qualidade

A integração com Qualidade deverá fornecer, quando aplicável:

- Desvio;
- Não conformidade;
- Defeito;
- Produto;
- Lote;
- Equipamento;
- Área;
- Quantidade rejeitada;
- Scrap;
- Retrabalho;
- Criticidade;
- Investigação;
- Responsável;
- Status;
- Ações;
- Evidências.

Informações restritas deverão respeitar as permissões do módulo de origem.

### 13.13 Integração com documentos

A Linha 360° deverá permitir relacionar documentos a:

- Linha;
- Área;
- Equipamento;
- Componente;
- Ponto de inspeção;
- Checklist;
- Problema;
- Ordem de serviço.

Exemplos:

- Procedimento operacional;
- Instrução de trabalho;
- Manual técnico;
- Desenho;
- Diagrama;
- Plano de manutenção;
- Documento de segurança;
- Formulário;
- Certificado.

A página deverá abrir sempre a versão vigente do documento e identificar quando existir uma nova versão.

### 13.14 Frequência de atualização

A frequência deverá ser definida por tipo de dado.

Referência inicial:

- Estado do equipamento: tempo real ou até 1 minuto;
- Parada em andamento: tempo real ou até 1 minuto;
- Produção: entre 1 e 5 minutos;
- OEE operacional: entre 1 e 5 minutos;
- Ordem de serviço: entre 5 e 15 minutos;
- Problemas e ações: após alteração ou até 5 minutos;
- Checklists: após execução ou até 5 minutos;
- Pessoas e alocação: após alteração ou até 5 minutos;
- Competências: após aprovação ou atualização;
- Documentos: conforme publicação;
- Dados históricos consolidados: conforme processamento oficial.

Esses intervalos deverão ser configuráveis conforme a capacidade de cada integração.

### 13.15 Atualização manual

O usuário deverá poder solicitar atualização manual dos dados.

A ação deverá:

- Atualizar somente as fontes necessárias;
- Informar o início da atualização;
- Informar o resultado;
- Manter os últimos dados válidos durante o processamento;
- Não duplicar registros;
- Identificar fontes que não responderam.

O botão de atualização não deverá executar recarga completa da página quando não for necessário.

### 13.16 Status da integração

Cada fonte deverá possuir um status:

- Disponível;
- Atualizando;
- Atrasada;
- Parcialmente disponível;
- Indisponível;
- Não configurada;
- Com erro.

O painel deverá informar:

- Fonte;
- Última comunicação;
- Última atualização válida;
- Quantidade de registros processados;
- Erro, quando aplicável;
- Próxima tentativa;
- Responsável técnico, quando definido.

### 13.17 Tratamento de dados desatualizados

Quando uma fonte estiver desatualizada:

- Manter o último dado válido;
- Marcar o dado como desatualizado;
- Exibir a data e hora do último valor;
- Não apresentar o valor como atual;
- Impedir decisões automáticas que dependam de informação atualizada;
- Registrar o incidente de integração.

Exemplo:

> OEE desatualizado. Último processamento válido: 15/11/2026 às 14:32.

### 13.18 Tratamento de dados ausentes

Dados ausentes não deverão ser convertidos automaticamente em zero.

O sistema deverá diferenciar:

- Valor igual a zero;
- Dado não disponível;
- Dado não aplicável;
- Integração não configurada;
- Falha de processamento;
- Período sem produção;
- Equipamento sem medição individual.

Essa diferenciação deverá ser mantida em cards, gráficos, mapas de calor e exportações.

### 13.19 Identificadores e prevenção de duplicidade

Cada entidade deverá possuir um identificador único e estável.

A integração deverá prevenir:

- Equipamento duplicado;
- Pessoa duplicada;
- Ordem de serviço duplicada;
- Problema duplicado;
- Evento de parada duplicado;
- Checklist duplicado;
- Vínculo espacial duplicado.

Quando existirem identificadores internos e externos, ambos deverão ser armazenados.

### 13.20 Sincronização e conflitos

Quando o mesmo registro for alterado na Linha 360° e no módulo de origem:

- O módulo oficial deverá prevalecer nos campos sob sua responsabilidade;
- A Linha 360° deverá manter os dados espaciais sob sua responsabilidade;
- Conflitos deverão ser registrados;
- O usuário deverá ser informado quando uma alteração não puder ser aplicada;
- Nenhuma atualização deverá sobrescrever silenciosamente uma informação mais recente.

### 13.21 Monitoramento das integrações

A administração deverá possuir uma visão contendo:

- Integrações configuradas;
- Status;
- Última execução;
- Duração;
- Registros processados;
- Registros rejeitados;
- Erros;
- Tentativas;
- Taxa de sucesso;
- Tempo desde a última atualização válida.

Deverão existir alertas para:

- Integração interrompida;
- Aumento de erros;
- Dados atrasados;
- Divergência de identificadores;
- Registros rejeitados;
- Tempo de processamento acima do esperado;
- Ausência de dados em equipamento ativo.

### 13.22 Contingência

Quando uma integração estiver indisponível, o sistema deverá:

1. Manter o mapa acessível;
2. Preservar a última informação válida;
3. Identificar os dados desatualizados;
4. Permitir registros manuais autorizados, quando aplicável;
5. Armazenar operações pendentes;
6. Sincronizar as operações após o retorno;
7. Evitar duplicidade durante a sincronização;
8. Registrar todas as ações realizadas em contingência.

Registros manuais de contingência deverão ser identificados pela origem e pelo usuário responsável.
## 14. Requisitos técnicos, desempenho e experiência do usuário

A Linha 360° deverá manter uma experiência fluida mesmo quando o mapa apresentar grande quantidade de equipamentos, áreas, pessoas, registros e indicadores.

A solução deverá priorizar:

- Rapidez de carregamento;
- Interações responsivas;
- Clareza visual;
- Estabilidade;
- Escalabilidade;
- Segurança;
- Compatibilidade com desktop e tablet;
- Funcionamento em diferentes níveis de zoom;
- Tratamento adequado de falhas;
- Preservação do trabalho do usuário.

### 14.1 Arquitetura da página

A Linha 360° deverá separar:

- Dados operacionais;
- Dados espaciais;
- Configurações do mapa;
- Preferências do usuário;
- Histórico de versões;
- Camadas visuais;
- Estado temporário da interface.

A alteração visual do mapa não deverá modificar diretamente os registros operacionais sem utilizar os fluxos e validações correspondentes.

O carregamento da página deverá ocorrer progressivamente:

1. Estrutura principal;
2. Mapa e áreas;
3. Equipamentos;
4. Indicadores essenciais;
5. Camadas selecionadas;
6. Registros complementares;
7. Informações detalhadas sob demanda.

A página não deverá aguardar o carregamento de todas as integrações para exibir o mapa.

### 14.2 Desempenho esperado

Metas iniciais recomendadas:

- Exibir a estrutura principal em até 2 segundos;
- Exibir mapa, áreas e equipamentos em até 4 segundos;
- Responder a clique ou seleção em até 300 milissegundos;
- Aplicar filtros simples em até 2 segundos;
- Abrir o painel lateral em até 1 segundo;
- Reposicionar elementos sem travamentos perceptíveis;
- Atualizar camadas sem recarregar toda a página;
- Manter navegação fluida durante zoom e movimentação;
- Informar operações que levem mais de 2 segundos;
- Permitir cancelamento de operações longas, quando aplicável.

As metas deverão ser medidas em ambiente corporativo e com volume de dados representativo.

### 14.3 Volume inicial de referência

A solução deverá ser projetada para suportar, por linha:

- Até 100 áreas ou polígonos;
- Até 500 equipamentos e componentes;
- Até 300 pessoas disponíveis;
- Até 5.000 registros visíveis no período selecionado;
- Até 50.000 registros históricos consultados por filtro;
- Até 20 camadas configuráveis;
- Até 10 usuários simultâneos editando ou consultando;
- Histórico de versões do mapa;
- Indicadores em múltiplos períodos.

Quando o volume ultrapassar esses limites, o sistema deverá manter a usabilidade por meio de:

- Agrupamento;
- Paginação;
- Carregamento sob demanda;
- Agregação por área;
- Agregação por equipamento;
- Limitação temporal;
- Simplificação visual conforme o zoom.

Os limites definitivos deverão ser validados por testes de carga.

### 14.4 Renderização do mapa

Para preservar o desempenho:

- Somente elementos visíveis deverão ser detalhados;
- Registros próximos deverão ser agrupados;
- Elementos fora da área visível poderão ser descarregados temporariamente;
- Polígonos deverão utilizar geometria simplificada quando o zoom estiver distante;
- Imagens deverão utilizar tamanho otimizado;
- Indicadores detalhados deverão ser carregados sob demanda;
- Animações deverão ser limitadas;
- Atualizações frequentes deverão evitar recriar o mapa completo.

O sistema deverá manter precisão suficiente para seleção, posicionamento e identificação dos elementos.

### 14.5 Controle de zoom e detalhe

A quantidade de informação deverá variar conforme o zoom.

#### Zoom distante

Exibir:

- Limites das áreas;
- Cor geral da criticidade;
- Estado consolidado;
- Mapa de calor;
- Indicadores gerais.

#### Zoom intermediário

Exibir:

- Equipamentos;
- Código ou nome curto;
- Status;
- OEE resumido;
- Agrupamentos de registros;
- Cobertura de conhecimento.

#### Zoom próximo

Exibir:

- Componentes;
- Pessoas;
- Registros individuais;
- Pontos de inspeção;
- Ícones detalhados;
- Informações adicionais;
- Controles de edição, quando autorizados.

A transição entre os níveis deverá ser progressiva e não deverá alterar a posição atual do usuário.

### 14.6 Responsividade

A interface deverá possuir comportamento específico para:

- Monitor corporativo;
- Notebook;
- Tablet na horizontal;
- Tablet na vertical;
- Tela ampla de gestão.

No tablet:

- Painéis deverão ocupar espaço controlado;
- Botões deverão possuir área adequada para toque;
- Ações de botão direito deverão possuir alternativa;
- Arrastar e soltar deverá funcionar por toque;
- Zoom deverá funcionar por gesto de pinça;
- Informações essenciais deverão permanecer acessíveis;
- A edição estrutural poderá ser limitada quando a precisão não for suficiente.

O uso em celular poderá ser limitado à consulta resumida e criação de apontamentos simples, caso não seja possível manter uma boa experiência completa.

### 14.7 Acessibilidade

A Linha 360° deverá seguir práticas atuais de acessibilidade, utilizando como referência a WCAG 2.2 nível AA.

Requisitos mínimos:

- Contraste adequado;
- Navegação por teclado;
- Foco visível;
- Textos alternativos;
- Tooltips acessíveis;
- Rótulos nos campos;
- Mensagens de erro compreensíveis;
- Uso de ícones além das cores;
- Compatibilidade com leitores de tela nas funções principais;
- Escala de texto sem quebra da interface;
- Alternativa textual para informações exclusivamente espaciais.

O mapa de calor não deverá depender somente da percepção de cores.

### 14.8 Consistência visual

A Linha 360° deverá seguir o padrão visual da plataforma.

Manter consistência em:

- Cores;
- Tipografia;
- Ícones;
- Botões;
- Cards;
- Campos;
- Filtros;
- Painéis laterais;
- Estados de carregamento;
- Mensagens;
- Tabelas;
- Gráficos;
- Modais.

Novos padrões visuais deverão ser documentados antes de serem reutilizados em outros módulos.

### 14.9 Estados da interface

Todos os componentes deverão possuir estados definidos.

Exemplos:

- Carregando;
- Carregado;
- Vazio;
- Sem resultado;
- Sem permissão;
- Sem configuração;
- Sem conexão;
- Desatualizado;
- Com erro;
- Parcialmente disponível;
- Em edição;
- Com alteração não salva;
- Bloqueado;
- Inativo.

A ausência de informação não deverá resultar em área vazia sem explicação.

### 14.10 Mensagens de carregamento

Durante operações longas, informar:

- O que está sendo processado;
- Progresso, quando disponível;
- Tempo estimado, quando confiável;
- Possibilidade de cancelamento;
- Resultado da operação.

Exemplos:

- Carregando equipamentos;
- Atualizando indicadores;
- Calculando mapa de calor;
- Validando áreas;
- Publicando nova versão;
- Sincronizando ordens de serviço.

A atualização de uma camada não deverá bloquear toda a página quando não for necessário.

### 14.11 Tratamento de erros

As mensagens de erro deverão informar:

- O que não foi concluído;
- Qual dado ou funcionalidade foi afetado;
- Se o trabalho do usuário foi preservado;
- Qual ação pode ser executada;
- Se será realizada nova tentativa;
- Como registrar suporte, quando necessário.

Evitar mensagens genéricas como:

> Ocorreu um erro.

Preferir:

> Não foi possível carregar as ordens de serviço. O mapa e os demais dados permanecem disponíveis. Tente atualizar a camada de Manutenção.

### 14.12 Recuperação de falhas

Em caso de falha, o sistema deverá:

- Preservar o rascunho;
- Evitar perda de pontos desenhados;
- Manter alterações locais temporariamente;
- Permitir nova tentativa;
- Evitar duplicidade;
- Informar o que foi ou não salvo;
- Registrar o erro;
- Restaurar o último estado válido.

Durante a criação de uma área, uma falha de comunicação não deverá apagar o polígono antes de o usuário poder tentar salvar novamente.

### 14.13 Salvamento automático

No modo de edição, o sistema deverá salvar automaticamente o rascunho:

- Após alteração relevante;
- Em intervalo configurável;
- Antes de atualização da página;
- Antes de troca de modo;
- Antes de encerrar a sessão, quando possível.

A interface deverá informar:

- Salvando;
- Salvo;
- Alterações pendentes;
- Falha ao salvar;
- Último salvamento válido.

O salvamento automático não deverá publicar o mapa.

### 14.14 Sessão e concorrência

Quando a sessão estiver próxima de expirar:

- Informar o usuário;
- Preservar o rascunho;
- Permitir renovação da sessão;
- Evitar perda de trabalho;
- Bloquear publicação sem autenticação válida.

Quando outro usuário alterar o mesmo elemento:

- Informar o conflito;
- Exibir a alteração mais recente;
- Permitir comparação;
- Impedir sobrescrita silenciosa;
- Solicitar decisão do usuário autorizado.

### 14.15 Segurança técnica

A solução deverá:

- Validar permissões no servidor;
- Não depender apenas de ocultação visual;
- Validar todos os identificadores;
- Validar arquivos enviados;
- Limitar tamanho e tipo dos anexos;
- Proteger contra conteúdo malicioso;
- Registrar ações críticas;
- Controlar exportações;
- Aplicar expiração de sessão;
- Proteger dados em trânsito;
- Restringir informações sensíveis;
- Evitar exposição de detalhes técnicos em mensagens de erro.

Toda integração deverá utilizar autenticação e autorização compatíveis com os padrões corporativos vigentes.

### 14.16 Upload da imagem da planta

O upload deverá aceitar inicialmente:

- PNG;
- JPG;
- JPEG.

Regras recomendadas:

- Tamanho máximo inicial de 15 MB;
- Resolução máxima configurável;
- Compressão automática quando necessária;
- Validação de tipo real do arquivo;
- Bloqueio de arquivos corrompidos;
- Geração de miniatura;
- Preservação do arquivo original autorizado;
- Registro do usuário e da data do envio.

Se a planta estiver em PDF, o sistema deverá orientar a conversão ou possuir fluxo controlado para convertê-la em imagem.

### 14.17 Upload de fotos e evidências

Fotos e evidências deverão:

- Respeitar os limites do módulo de origem;
- Possuir identificação do registro;
- Registrar autor e data;
- Permitir descrição;
- Permitir visualização sem download, quando autorizado;
- Utilizar miniaturas;
- Manter o arquivo original;
- Respeitar permissões;
- Ser verificadas antes do armazenamento.

A Linha 360° não deverá criar uma biblioteca paralela de anexos quando já existir repositório oficial.

### 14.18 Compatibilidade

A aplicação deverá ser validada, no mínimo, nas versões corporativas suportadas de:

- Microsoft Edge;
- Google Chrome;
- Tablets corporativos utilizados na operação.

Funcionalidades críticas deverão possuir comportamento equivalente nos navegadores suportados.

Diferenças conhecidas deverão ser documentadas.

### 14.19 Observabilidade

A solução deverá registrar indicadores técnicos como:

- Tempo de carregamento;
- Tempo de resposta;
- Erros por operação;
- Falhas de integração;
- Usuários simultâneos;
- Quantidade de elementos renderizados;
- Tempo de cálculo do mapa de calor;
- Tempo de aplicação dos filtros;
- Publicações concluídas;
- Publicações com falha;
- Conflitos de edição;
- Uso por modo de visualização.

Esses dados deverão apoiar melhoria contínua e diagnóstico de problemas.

### 14.20 Testes técnicos

A implementação deverá possuir testes para:

- Desenho de polígonos;
- Fechamento de áreas;
- Identificação de equipamentos dentro da área;
- Arrastar e soltar;
- Cálculo das coordenadas;
- Regras de sobreposição;
- Filtros;
- Mapa de calor;
- Permissões;
- Histórico;
- Publicação;
- Restauração;
- Integrações;
- Dados ausentes;
- Falhas de comunicação;
- Conflitos de edição;
- Responsividade;
- Acessibilidade;
- Desempenho.

Os testes deverão utilizar volumes próximos do cenário real, evitando validar apenas mapas com poucos elementos.

### 14.21 Critérios técnicos de conclusão

A solução somente deverá ser considerada tecnicamente pronta quando:

1. O mapa carregar dentro das metas definidas;
2. As interações principais permanecerem fluidas;
3. Os dados espaciais forem preservados corretamente;
4. As permissões forem verificadas no servidor;
5. Os erros possuírem tratamento adequado;
6. O rascunho sobreviver a falhas recuperáveis;
7. As integrações não gerarem duplicidades;
8. Os dados ausentes estiverem diferenciados de zero;
9. A experiência em tablet estiver validada;
10. Os testes de carga, segurança, acessibilidade e regressão estiverem aprovados.
    ## 15. Critérios de aceite funcional

A Linha 360° será considerada funcionalmente aprovada quando os critérios desta seção forem atendidos e validados pelos usuários responsáveis.

Os critérios deverão ser utilizados para:

- Refinamento técnico;
- Planejamento da implementação;
- Criação dos testes;
- Homologação;
- Aceite da entrega;
- Prevenção de interpretações diferentes sobre o escopo.

### 15.1 Acesso e carregamento inicial

A funcionalidade será aceita quando:

1. O usuário autorizado conseguir acessar a Linha 360°;
2. A linha padrão for carregada corretamente;
3. O mapa publicado for apresentado;
4. As áreas e os equipamentos forem carregados;
5. O sistema informar a última atualização dos dados;
6. Os modos de visualização permitidos estiverem disponíveis;
7. Os filtros padrão forem aplicados;
8. As camadas respeitarem o modo selecionado;
9. O usuário sem permissão receber uma mensagem adequada;
10. Uma falha em uma integração não impedir a abertura completa do mapa.

### 15.2 Criação do mapa

A funcionalidade será aceita quando o usuário autorizado conseguir:

1. Criar um mapa em branco;
2. Carregar uma imagem da planta;
3. Ajustar posição e escala da imagem;
4. Substituir a imagem sem excluir automaticamente os elementos posicionados;
5. Salvar a configuração como rascunho;
6. Visualizar alterações antes da publicação;
7. Descartar alterações ainda não publicadas;
8. Publicar uma nova versão;
9. Consultar a versão publicada;
10. Restaurar uma versão anterior por meio de um novo rascunho.

### 15.3 Desenho de áreas por pontos

A criação de áreas será aceita quando:

1. O usuário selecionar a opção **Criar área**;
2. Cada clique criar um novo ponto;
3. Os pontos forem conectados visualmente;
4. O usuário conseguir fechar a área clicando no primeiro ponto;
5. O usuário também conseguir utilizar o comando **Fechar área**;
6. O sistema impedir o fechamento de um polígono inválido;
7. O usuário conseguir desfazer o último ponto;
8. O usuário conseguir cancelar o desenho;
9. O desenho permanecer disponível durante o zoom e a movimentação do mapa;
10. O formulário da área abrir após o fechamento do polígono.

### 15.4 Cadastro e edição de áreas

A área será considerada corretamente cadastrada quando:

1. Possuir nome;
2. Possuir código, quando obrigatório;
3. Possuir categoria ou tipo;
4. Estiver vinculada à linha;
5. Possuir cor definida;
6. Possuir polígono válido;
7. Possuir status;
8. Registrar o usuário responsável pela criação;
9. Registrar data e hora;
10. Ficar disponível no rascunho do mapa.

A edição será aceita quando o usuário autorizado conseguir:

- Mover um ponto;
- Adicionar um ponto;
- Remover um ponto;
- Mover a área completa;
- Alterar nome;
- Alterar cor;
- Alterar tipo;
- Duplicar;
- Bloquear;
- Inativar.

### 15.5 Equipamentos localizados dentro da área

A associação automática será aceita quando:

1. O sistema identificar os equipamentos posicionados dentro do polígono;
2. A validação utilizar a coordenada central do equipamento;
3. O sistema apresentar a lista antes de criar os vínculos;
4. O usuário conseguir confirmar todos;
5. O usuário conseguir remover itens da seleção;
6. O usuário conseguir incluir equipamento próximo;
7. Equipamentos parcialmente sobrepostos forem identificados;
8. O sistema solicitar definição da área principal em caso de conflito;
9. A associação for registrada somente após confirmação;
10. A alteração do perímetro recalcular os equipamentos afetados.

### 15.6 Posicionamento de equipamentos

O posicionamento será aceito quando:

1. O equipamento existente aparecer na biblioteca;
2. O usuário conseguir arrastá-lo para o mapa;
3. O sistema registrar as coordenadas;
4. O sistema identificar a área de destino;
5. O usuário conseguir confirmar ou alterar a área sugerida;
6. O equipamento permanecer na posição após salvar e recarregar;
7. O usuário conseguir redimensionar;
8. O usuário conseguir girar;
9. O usuário conseguir reposicionar;
10. O equipamento puder ser removido do mapa sem exclusão do cadastro original.

### 15.7 Prevenção de conflitos espaciais

A validação será aceita quando:

1. Áreas produtivas do mesmo nível não puderem ser publicadas com sobreposição não resolvida;
2. A região sobreposta for destacada;
3. Os elementos envolvidos forem identificados;
4. Equipamentos sobrepostos forem sinalizados;
5. O sistema diferenciar erro, alerta e informação;
6. O usuário conseguir corrigir o conflito;
7. Sobreposições permitidas entre camadas diferentes forem preservadas;
8. A publicação for bloqueada somente nos conflitos definidos como impeditivos.

### 15.8 Criação de registros pelo mapa

A criação será aceita quando o usuário conseguir criar pelo mapa:

- Problema;
- Ordem de serviço ou solicitação;
- Ação;
- Checklist;
- Desvio de qualidade;
- Risco de segurança;
- Observação;
- Foto;
- Ponto de inspeção.

Ao criar um registro, o sistema deverá:

1. Identificar a linha;
2. Identificar a área;
3. Identificar o equipamento, quando aplicável;
4. Registrar a coordenada;
5. Abrir o formulário adequado;
6. Exigir os campos obrigatórios;
7. Salvar no módulo oficial;
8. Exibir o item no mapa;
9. Manter o mesmo identificador do módulo de origem;
10. Registrar a criação na auditoria.

### 15.9 Arrastar e soltar registros

O arrastar e soltar será aceito quando:

1. O usuário conseguir arrastar um registro existente;
2. Os destinos válidos forem destacados;
3. Destinos inválidos forem bloqueados;
4. O sistema diferenciar equipamento, área e ponto livre;
5. O contexto do destino for preenchido automaticamente;
6. O vínculo for apresentado antes da confirmação;
7. O registro não for duplicado;
8. O posicionamento permanecer após recarregar;
9. A movimentação posterior manter histórico;
10. A remoção do mapa não excluir o registro original.

### 15.10 Criação por formulário

A criação convencional será aceita quando:

1. O botão **Adicionar** estiver disponível para o usuário autorizado;
2. O usuário conseguir selecionar o tipo de registro;
3. O formulário apresentar os campos de localização;
4. O usuário conseguir selecionar a localização pelo mapa;
5. O usuário conseguir selecionar linha, área e equipamento pelos campos;
6. A localização selecionada for validada;
7. O registro aparecer no ponto correto após salvar;
8. Os campos obrigatórios respeitarem as regras do módulo de origem.

### 15.11 Checklists

A funcionalidade será aceita quando:

1. Um checklist existente puder ser vinculado a área, equipamento ou ponto;
2. Um novo checklist puder ser criado;
3. Frequência, turno, prazo e responsáveis puderem ser definidos;
4. O status estiver visível no mapa;
5. Checklists atrasados possuírem destaque;
6. Itens reprovados puderem gerar problema;
7. Itens reprovados puderem gerar ação;
8. Itens reprovados puderem gerar ordem de serviço;
9. O registro criado herdar a localização;
10. O histórico de execução puder ser consultado.

### 15.12 Mapa de calor

O mapa de calor será aceito quando:

1. O usuário conseguir ativar e desativar a camada;
2. O usuário conseguir escolher o indicador;
3. O usuário conseguir selecionar quantidade;
4. O usuário conseguir selecionar impacto;
5. O usuário conseguir selecionar índice ponderado;
6. A legenda informar os intervalos;
7. Os valores responderem aos filtros;
8. O sistema diferenciar zero de ausência de dados;
9. O usuário conseguir visualizar por área;
10. O usuário conseguir visualizar por equipamento;
11. O usuário conseguir visualizar por ponto;
12. O detalhamento informar os registros que formaram o resultado.

### 15.13 Normalização do mapa de calor

A normalização será aceita quando:

1. O usuário conseguir visualizar o valor absoluto;
2. O usuário conseguir selecionar uma taxa disponível;
3. O sistema informar o denominador utilizado;
4. O período for equivalente;
5. A legenda for atualizada;
6. Rankings utilizarem o mesmo critério do mapa;
7. Comparações incompatíveis forem bloqueadas ou informadas;
8. O método escolhido aparecer no título ou na legenda.

### 15.14 OEE por equipamento

A visualização será aceita quando:

1. Equipamentos com OEE próprio exibirem o valor individual;
2. A meta estiver disponível;
3. Disponibilidade, Performance e Qualidade puderem ser consultadas;
4. A diferença para a meta estiver correta;
5. A tendência estiver disponível;
6. O valor herdado estiver claramente identificado;
7. Equipamento sem medição própria não receber automaticamente o OEE da linha como valor individual;
8. Dados ausentes não aparecerem como zero;
9. A fonte e a última atualização estiverem disponíveis;
10. O equipamento puder ser localizado pelo ranking de perda.

### 15.15 Pessoas e alocação

A alocação será aceita quando:

1. O usuário autorizado conseguir selecionar uma pessoa;
2. A pessoa puder ser arrastada para área, equipamento ou posto;
3. O sistema verificar disponibilidade;
4. O sistema verificar conflito de horário;
5. O sistema verificar competência mínima;
6. Alertas forem exibidos antes da confirmação;
7. A alocação for registrada por período e turno;
8. A pessoa aparecer no mapa;
9. Uma realocação manter histórico;
10. Dados pessoais não necessários não forem exibidos.

### 15.16 Conhecimento por equipamento

A gestão de competências será aceita quando:

1. Uma pessoa puder receber competência por equipamento;
2. A competência puder ser separada por tipo;
3. O nível puder variar de 0 a 5;
4. Avaliador e data forem registrados;
5. A validade puder ser configurada;
6. Evidências puderem ser relacionadas;
7. Competências vencidas não forem consideradas cobertura válida;
8. O histórico de avaliações for preservado;
9. O usuário conseguir consultar equipamentos por pessoa;
10. O usuário conseguir consultar pessoas por equipamento.

### 15.17 Cobertura mínima

O cálculo será aceito quando:

1. Cada equipamento puder possuir requisitos mínimos;
2. Os requisitos puderem variar por competência;
3. A quantidade mínima de pessoas puder ser definida;
4. O nível mínimo puder ser definido;
5. Pessoas disponíveis forem consideradas;
6. Pessoas alocadas forem identificadas;
7. Competências vencidas forem excluídas;
8. O sistema diferenciar cobertura adequada, parcial e insuficiente;
9. Dependência de uma única pessoa for identificada;
10. O usuário conseguir acessar o detalhamento da lacuna.

### 15.18 Pesquisa global

A pesquisa será aceita quando:

1. Localizar área;
2. Localizar equipamento por código ou nome;
3. Localizar pessoa;
4. Localizar problema;
5. Localizar ordem de serviço;
6. Localizar ação;
7. Localizar checklist;
8. Agrupar resultados por tipo;
9. Centralizar o resultado no mapa;
10. Abrir o painel de detalhes;
11. Informar quando o item ainda não possuir localização;
12. Permitir vinculação quando o usuário possuir autorização.

### 15.19 Filtros

Os filtros serão aceitos quando:

1. Linha, período e turno puderem ser selecionados;
2. Área e equipamento puderem ser selecionados;
3. Status, criticidade e responsável puderem ser aplicados;
4. Filtros ativos estiverem visíveis;
5. Um filtro individual puder ser removido;
6. Todos os filtros puderem ser limpos;
7. Mapa, cards e rankings forem atualizados em conjunto;
8. O painel de detalhes respeitar os filtros;
9. O usuário conseguir salvar uma combinação de filtros;
10. O sistema conseguir restaurar o padrão.

### 15.20 Modos e camadas

A funcionalidade será aceita quando:

1. Os modos definidos estiverem disponíveis conforme a permissão;
2. Cada modo ativar suas camadas padrão;
3. O usuário conseguir ativar ou desativar camadas;
4. A troca de modo preservar o contexto aplicável;
5. O mapa evitar a exibição simultânea excessiva de elementos;
6. Registros próximos forem agrupados;
7. O detalhamento aumentar conforme o zoom;
8. A legenda acompanhar as camadas ativas;
9. A indisponibilidade de uma camada for informada;
10. As preferências puderem ser salvas.

### 15.21 Painel de gestão

O painel será aceito quando:

1. Os cards mínimos estiverem disponíveis;
2. Os valores responderem aos filtros;
3. Cada card apresentar atualização e tendência;
4. A seleção de um card filtrar o mapa;
5. Rankings permitirem localizar os itens;
6. Alertas prioritários apresentarem origem;
7. Pendências puderem ser abertas;
8. O usuário conseguir retornar à visão anterior;
9. Dados desatualizados estiverem identificados;
10. A configuração do painel puder ser personalizada conforme a permissão.

### 15.22 Histórico e versões

O controle de versões será aceito quando:

1. Alterações estruturais forem salvas como rascunho;
2. A versão publicada permanecer disponível durante a edição;
3. O sistema registrar editor;
4. O sistema registrar publicador;
5. O sistema registrar motivo;
6. Duas versões puderem ser comparadas;
7. Diferenças forem exibidas no mapa;
8. Uma versão anterior puder ser utilizada para criar novo rascunho;
9. Nenhum histórico for apagado na restauração;
10. A publicação executar validações.

### 15.23 Permissões

As permissões serão aceitas quando:

1. Um visualizador não conseguir editar o mapa;
2. Um operador conseguir criar apenas registros autorizados;
3. Um editor conseguir alterar o rascunho;
4. Um editor sem permissão de publicação não conseguir publicar;
5. Um publicador conseguir revisar e publicar;
6. Dados de competências respeitarem permissão específica;
7. Exportações respeitarem o perfil;
8. O servidor validar todas as permissões;
9. Tentativas bloqueadas forem auditadas;
10. A interface não apresentar ações indisponíveis sem necessidade.

### 15.24 Rastreabilidade

A auditoria será aceita quando registrar:

- Usuário;
- Data e hora;
- Ação;
- Registro afetado;
- Linha;
- Área;
- Equipamento;
- Valor anterior;
- Novo valor;
- Origem;
- Justificativa, quando necessária;
- Resultado da operação.

O histórico deverá ser pesquisável pelos usuários autorizados.

### 15.25 Integrações e qualidade dos dados

As integrações serão aceitas quando:

1. Cada informação possuir fonte definida;
2. Identificadores forem estáveis;
3. Registros não forem duplicados;
4. Alterações do módulo oficial forem refletidas;
5. Dados espaciais permanecerem sob responsabilidade da Linha 360°;
6. Falhas de integração não apagarem o último dado válido;
7. Dados desatualizados forem marcados;
8. Dados ausentes forem diferenciados de zero;
9. O usuário conseguir consultar a última atualização;
10. Operações de contingência forem sincronizadas sem duplicidade.

### 15.26 Desktop e tablet

A experiência será aceita quando:

1. As funções principais operarem em desktop;
2. Consulta, zoom e seleção operarem em tablet;
3. Arrastar e soltar funcionar por toque;
4. Botões possuírem tamanho adequado;
5. O menu de contexto possuir alternativa para toque;
6. Os painéis se adaptarem à tela;
7. A interface não exigir rolagem horizontal desnecessária;
8. O mapa puder ser usado em tela cheia;
9. Funções não suportadas no tablet forem claramente informadas;
10. A criação rápida de registros permanecer disponível.

### 15.27 Desempenho

O desempenho será aceito quando:

1. A estrutura inicial carregar dentro da meta definida;
2. Áreas e equipamentos forem apresentados dentro da meta;
3. Clique e seleção não apresentarem atraso perceptível;
4. Zoom e movimentação permanecerem fluidos;
5. Filtros não recarregarem toda a página sem necessidade;
6. Registros forem agrupados em grandes volumes;
7. Operações longas apresentarem andamento;
8. O usuário puder continuar utilizando partes não afetadas;
9. Os testes de carga forem executados com volume representativo;
10. Os resultados forem registrados e aprovados.

### 15.28 Acessibilidade

A acessibilidade será aceita quando:

1. As funções essenciais puderem ser acessadas por teclado;
2. O foco estiver visível;
3. As cores possuírem contraste suficiente;
4. Informações críticas não dependerem somente da cor;
5. Campos possuírem rótulos;
6. Mensagens de erro forem compreensíveis;
7. O mapa possuir alternativa textual para informações essenciais;
8. Ícones possuírem descrição;
9. A ampliação do texto não quebrar as funções principais;
10. Os testes de acessibilidade forem executados.

### 15.29 Recuperação de falhas

A recuperação será aceita quando:

1. Falhas de rede não apagarem o rascunho;
2. Pontos desenhados puderem ser recuperados;
3. O sistema informar o que foi salvo;
4. O usuário conseguir tentar novamente;
5. A nova tentativa não duplicar registros;
6. O último estado válido permanecer disponível;
7. Conflitos de edição forem informados;
8. Sobrescritas silenciosas não ocorrerem;
9. Erros técnicos forem registrados;
10. O usuário receber orientação objetiva.

### 15.30 Homologação final

A homologação deverá envolver representantes de:

- Operação;
- Supervisão;
- Manutenção;
- Qualidade;
- Segurança;
- Engenharia;
- Gestão de pessoas ou treinamento;
- Tecnologia da informação;
- Administração da plataforma.

A entrega será considerada aprovada quando:

1. Os cenários prioritários forem executados;
2. Os critérios obrigatórios forem atendidos;
3. Erros impeditivos estiverem resolvidos;
4. Riscos residuais estiverem documentados;
5. Responsáveis pelas informações estiverem definidos;
6. Permissões estiverem validadas;
7. Integrações críticas estiverem funcionando;
8. Usuários-chave estiverem treinados;
9. O plano de suporte estiver definido;
10. O aceite funcional estiver registrado.
    ## 16. Fases de implementação e priorização

A implementação da Linha 360° deverá ser realizada em fases para reduzir risco, permitir validações intermediárias e evitar que funcionalidades avançadas sejam construídas antes da estabilização da base espacial.

Cada fase deverá ser validada antes do início da fase seguinte.

---

### 16.1 Fase 1 — Mapa e estrutura espacial

#### Objetivo

Criar a base visual e estrutural necessária para representar a linha, suas áreas e seus equipamentos.

#### Escopo

- Abrir a aba Linha 360°;
- Carregar uma imagem da planta;
- Criar mapa em branco;
- Navegar pelo mapa;
- Aplicar zoom;
- Utilizar modo tela cheia;
- Criar áreas por pontos;
- Fechar o polígono clicando no primeiro ponto;
- Criar áreas por comando de fechamento;
- Editar os pontos do polígono;
- Nomear e classificar áreas;
- Definir cores;
- Identificar equipamentos dentro da área;
- Posicionar equipamentos por arrastar e soltar;
- Posicionar equipamentos por formulário;
- Mover, redimensionar e girar equipamentos;
- Salvar alterações como rascunho;
- Publicar uma versão;
- Consultar histórico básico de versões.

#### Resultado esperado

Ao final da Fase 1, deverá existir um mapa navegável contendo:

- Imagem ou fundo da linha;
- Áreas produtivas;
- Equipamentos posicionados;
- Vínculos entre equipamentos e áreas;
- Separação entre consulta e edição;
- Rascunho e versão publicada.

#### Fora do escopo desta fase

- Mapa de calor avançado;
- Competências;
- Alocação de pessoas;
- Cálculo de cobertura;
- Comparações avançadas;
- Recomendações automáticas;
- Inteligência preditiva.

---

### 16.2 Fase 2 — Registros operacionais no mapa

#### Objetivo

Transformar o mapa em uma interface ativa para lançamento e consulta de informações operacionais.

#### Escopo

- Criar problema pelo mapa;
- Vincular problema existente;
- Criar ordem de serviço ou solicitação;
- Vincular ordem de serviço existente;
- Criar ação;
- Vincular ação existente;
- Criar e posicionar checklist;
- Vincular checklist existente;
- Criar observação;
- Adicionar foto;
- Criar ponto de inspeção;
- Criar desvio de qualidade;
- Criar risco de segurança;
- Posicionar registros por arrastar e soltar;
- Posicionar registros por formulário;
- Agrupar registros próximos;
- Exibir painel lateral de detalhes;
- Criar menu de contexto;
- Implementar pesquisa global;
- Aplicar filtros básicos.

#### Resultado esperado

Ao final da Fase 2, o usuário deverá conseguir:

- Selecionar um equipamento;
- Consultar registros relacionados;
- Criar um registro no local selecionado;
- Arrastar um registro existente para o mapa;
- Localizar problemas, ordens de serviço e checklists;
- Navegar até o ponto correspondente;
- Consultar informações sem sair da Linha 360°.

#### Dependências

- Cadastros oficiais disponíveis;
- Identificadores únicos;
- Formulários dos módulos de origem;
- Regras de permissão;
- Estrutura básica de auditoria.

---

### 16.3 Fase 3 — OEE, indicadores e mapa de calor

#### Objetivo

Transformar os registros e indicadores em uma visão visual de desempenho e criticidade.

#### Escopo

- Exibir OEE por equipamento;
- Exibir meta;
- Exibir Disponibilidade, Performance e Qualidade;
- Diferenciar OEE próprio de OEE herdado;
- Mostrar tendência;
- Mostrar status operacional;
- Criar mapa de calor por quantidade;
- Criar mapa de calor por impacto;
- Criar índice ponderado de criticidade;
- Exibir mapa de calor por área;
- Exibir mapa de calor por equipamento;
- Exibir mapa de calor por ponto;
- Criar rankings;
- Criar cards;
- Criar resumo por área;
- Criar resumo por equipamento;
- Comparar períodos;
- Salvar visualizações.

#### Resultado esperado

Ao final da Fase 3, o usuário deverá conseguir responder:

- Qual área está mais crítica;
- Qual equipamento está gerando maior impacto;
- Onde estão concentradas as perdas;
- Qual equipamento está abaixo da meta;
- Qual componente do OEE está provocando a perda;
- Quais registros formaram o resultado;
- Como o período atual se compara ao anterior.

#### Dependências

- Fonte oficial de OEE;
- Metas cadastradas;
- Paradas vinculadas aos equipamentos;
- Dados de produção;
- Critérios de criticidade;
- Regras de normalização;
- Qualidade mínima dos dados.

---

### 16.4 Fase 4 — Pessoas, alocação e competências

#### Objetivo

Incorporar a força de trabalho e o conhecimento técnico à gestão espacial da linha.

#### Escopo

- Visualizar pessoas disponíveis;
- Alocar pessoa em linha, área, equipamento ou posto;
- Realocar pessoa;
- Registrar vigência da alocação;
- Cadastrar competência por equipamento;
- Cadastrar competência por tipo;
- Utilizar níveis de 0 a 5;
- Registrar avaliação e validade;
- Exibir competências vencidas;
- Definir requisitos mínimos por equipamento;
- Calcular cobertura;
- Identificar lacunas;
- Identificar dependência crítica;
- Criar matriz de conhecimento;
- Consultar equipamentos por pessoa;
- Consultar pessoas por equipamento;
- Criar necessidade de treinamento;
- Criar plano de desenvolvimento.

#### Resultado esperado

Ao final da Fase 4, o sistema deverá permitir identificar:

- Quem está em cada equipamento;
- Quem pode operar cada máquina;
- Quem pode realizar setup;
- Onde falta cobertura;
- Onde existe dependência de uma única pessoa;
- Quais pessoas estão em treinamento;
- Quais competências estão vencidas;
- Quais treinamentos devem ser priorizados.

#### Dependências

- Cadastro oficial de pessoas;
- Estrutura de turnos;
- Regras de competência;
- Avaliadores definidos;
- Requisitos mínimos por equipamento;
- Permissões para dados de pessoas.

---

### 16.5 Fase 5 — Gestão avançada e inteligência operacional

#### Objetivo

Utilizar os dados integrados para priorização, comparação e suporte à tomada de decisão.

#### Escopo

- Comparar áreas;
- Comparar equipamentos semelhantes;
- Comparar turnos;
- Comparar antes e depois de uma intervenção;
- Correlacionar problemas, ordens de serviço, OEE e competências;
- Identificar recorrências;
- Identificar concentração anormal de eventos;
- Criar alertas avançados;
- Criar recomendações de priorização;
- Criar visualização histórica;
- Reproduzir evolução no tempo;
- Criar indicadores de efetividade das ações;
- Criar análises de risco operacional;
- Criar visão executiva;
- Gerar relatórios programados.

#### Resultado esperado

Ao final da Fase 5, a Linha 360° deverá apoiar decisões como:

- Qual equipamento deve ser tratado primeiro;
- Qual perda apresenta maior impacto;
- Qual ação produziu resultado;
- Qual área está aumentando sua criticidade;
- Qual turno precisa de reforço;
- Qual treinamento reduz maior risco operacional;
- Onde existe recorrência sem solução definitiva.

#### Condição para iniciar

A Fase 5 somente deverá começar após:

- Estabilização das integrações;
- Validação da qualidade dos dados;
- Uso consistente das fases anteriores;
- Definição dos responsáveis;
- Validação das regras de cálculo;
- Existência de histórico suficiente.

---

### 16.6 Produto mínimo viável

O produto mínimo viável deverá incluir as Fases 1 e 2.

O MVP deverá permitir:

1. Carregar ou criar o mapa;
2. Criar áreas por pontos;
3. Fechar e editar polígonos;
4. Identificar equipamentos dentro das áreas;
5. Posicionar equipamentos;
6. Salvar rascunho;
7. Publicar uma versão;
8. Selecionar equipamentos;
9. Criar problemas;
10. Vincular ordens de serviço;
11. Posicionar checklists;
12. Criar ações;
13. Criar registros por formulário;
14. Posicionar registros por arrastar e soltar;
15. Pesquisar equipamentos e registros;
16. Aplicar filtros básicos;
17. Consultar detalhes pelo painel lateral;
18. Manter histórico das alterações.

O MVP deverá ser validado com usuários reais antes da implementação das funcionalidades avançadas.

---

### 16.7 Protótipo inicial

Antes do desenvolvimento definitivo, criar um protótipo contendo:

- Uma linha produtiva;
- Uma imagem de fundo;
- Duas áreas desenhadas por pontos;
- Cinco equipamentos;
- Um equipamento parcialmente sobre duas áreas;
- Um problema;
- Uma ordem de serviço;
- Uma ação;
- Um checklist;
- Um ponto de inspeção;
- Um painel lateral;
- Pesquisa;
- Filtros;
- Um exemplo simplificado de mapa de calor;
- Uma pessoa alocada;
- Uma competência cadastrada.

O protótipo deverá testar principalmente:

- Clareza visual;
- Facilidade para desenhar áreas;
- Facilidade para posicionar equipamentos;
- Compreensão do arrastar e soltar;
- Quantidade de informações exibidas;
- Organização dos painéis;
- Leitura do mapa;
- Navegação em desktop e tablet.

---

### 16.8 Ordem técnica recomendada

Utilizar a seguinte ordem de construção:

1. Modelo de coordenadas;
2. Imagem de fundo;
3. Navegação, zoom e enquadramento;
4. Polígonos;
5. Cadastro de áreas;
6. Posicionamento de equipamentos;
7. Vinculação automática entre equipamento e área;
8. Rascunho;
9. Publicação e versões;
10. Painel de detalhes;
11. Biblioteca de elementos;
12. Arrastar e soltar;
13. Registros no mapa;
14. Pesquisa;
15. Filtros;
16. Camadas;
17. OEE;
18. Mapa de calor;
19. Pessoas;
20. Competências;
21. Cobertura;
22. Comparações;
23. Alertas;
24. Inteligência operacional.

Essa ordem deverá ser ajustada somente quando houver dependência técnica ou operacional documentada.

---

### 16.9 Validação por fase

Cada fase deverá possuir:

- Escopo aprovado;
- Protótipo ou demonstração;
- Critérios de aceite;
- Casos de teste;
- Responsáveis pela validação;
- Registro dos problemas encontrados;
- Correção dos erros impeditivos;
- Aprovação formal;
- Documentação atualizada;
- Treinamento necessário.

Não avançar para a fase seguinte com erros estruturais não resolvidos.

---

### 16.10 Prioridades

Utilizar a seguinte classificação:

#### Prioridade P0 — Obrigatória para funcionamento

- Abrir o mapa;
- Criar áreas;
- Posicionar equipamentos;
- Salvar e publicar;
- Manter os vínculos;
- Garantir permissões;
- Evitar perda de dados.

#### Prioridade P1 — Obrigatória para o MVP

- Criar registros pelo mapa;
- Arrastar e soltar;
- Pesquisa;
- Filtros;
- Painel lateral;
- Histórico;
- Integração com módulos de origem.

#### Prioridade P2 — Gestão de desempenho

- OEE por equipamento;
- Mapa de calor;
- Cards;
- Rankings;
- Comparações;
- Indicadores por área.

#### Prioridade P3 — Pessoas e competências

- Alocação;
- Níveis de conhecimento;
- Requisitos mínimos;
- Cobertura;
- Matriz;
- Treinamentos.

#### Prioridade P4 — Inteligência avançada

- Correlações;
- Recomendações;
- Alertas avançados;
- Análises preditivas;
- Reprodução histórica;
- Relatórios programados.

---

### 16.11 Itens que não deverão bloquear o MVP

Não deverão bloquear a entrega inicial:

- Inteligência artificial;
- Recomendações automáticas;
- Análise preditiva;
- Simulação avançada;
- Reprodução completa da linha do tempo;
- Relatórios executivos avançados;
- Comparação entre várias plantas;
- Aplicativo móvel dedicado;
- Representação tridimensional;
- Realidade aumentada.

Esses itens poderão ser avaliados após a comprovação de uso e valor das funcionalidades principais.

---

### 16.12 Indicadores de sucesso da implantação

Após a implantação, acompanhar:

- Percentual de equipamentos posicionados;
- Percentual de áreas cadastradas;
- Percentual de registros com localização;
- Usuários ativos;
- Frequência de uso;
- Tempo médio para localizar um problema;
- Tempo médio para criar um registro;
- Quantidade de problemas criados pelo mapa;
- Quantidade de ordens vinculadas;
- Redução de registros sem localização;
- Uso do mapa de calor;
- Uso da visão de OEE;
- Cobertura da matriz de conhecimento;
- Redução de equipamentos sem cobertura;
- Satisfação dos usuários.

As metas deverão ser definidas após a medição da situação inicial.
## 17. Modelo de dados da Linha 360°

O modelo de dados deverá separar os cadastros oficiais da plataforma das informações específicas da representação espacial.

A Linha 360° não deverá duplicar equipamentos, pessoas, ordens de serviço, problemas, ações ou checklists. Para essas entidades, deverá armazenar apenas:

- Identificador do registro original;
- Tipo da entidade;
- Posicionamento no mapa;
- Vigência do posicionamento;
- Relacionamentos espaciais;
- Configurações de exibição;
- Histórico das alterações.

Os nomes apresentados nesta seção são referências funcionais. A equipe técnica poderá adaptá-los ao padrão de nomenclatura do sistema, preservando os relacionamentos e as regras descritas.

---

### 17.1 Entidade do mapa

Representa o mapa principal de uma linha.

Campos mínimos:

    LineMap
    - id
    - plantId
    - lineId
    - name
    - description
    - backgroundImageId
    - canvasWidth
    - canvasHeight
    - coordinateSystem
    - scale
    - status
    - publishedVersionId
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Regras:

- Cada linha poderá possuir um ou mais mapas;
- Somente uma versão poderá estar publicada por mapa;
- O mapa poderá existir sem imagem de fundo;
- A largura e a altura deverão formar a referência para as coordenadas;
- As coordenadas não deverão depender diretamente da resolução da tela do usuário.

---

### 17.2 Sistema de coordenadas

O posicionamento deverá utilizar coordenadas relativas ao mapa.

Referência recomendada:

    x: valor entre 0 e 1
    y: valor entre 0 e 1
    width: proporção da largura do mapa
    height: proporção da altura do mapa
    rotation: valor em graus

Exemplo:

    x = 0.35
    y = 0.62

Isso representa uma posição equivalente a:

- 35% da largura do mapa;
- 62% da altura do mapa.

Essa abordagem deverá permitir:

- Redimensionamento da tela;
- Uso em diferentes monitores;
- Uso em tablet;
- Alteração da resolução da imagem;
- Preservação das posições;
- Aplicação consistente de zoom.

Coordenadas em pixels poderão ser utilizadas temporariamente durante a interação, mas deverão ser convertidas para o sistema oficial antes do salvamento.

---

### 17.3 Versão do mapa

Representa um rascunho ou uma publicação.

Campos mínimos:

    MapVersion
    - id
    - mapId
    - versionNumber
    - status
    - changeDescription
    - createdAt
    - createdBy
    - submittedAt
    - submittedBy
    - reviewedAt
    - reviewedBy
    - publishedAt
    - publishedBy
    - sourceVersionId
    - validationStatus

Estados recomendados:

- Draft;
- InReview;
- Rejected;
- Approved;
- Published;
- Archived.

Regras:

- A edição deverá ocorrer sobre uma versão;
- A versão publicada não deverá ser alterada diretamente;
- Alterações deverão gerar um novo rascunho;
- Uma restauração deverá criar uma nova versão;
- O histórico anterior não deverá ser apagado.

---

### 17.4 Área produtiva

Representa uma área desenhada sobre o mapa.

Campos mínimos:

    MapArea
    - id
    - mapVersionId
    - sourceAreaId
    - name
    - code
    - areaType
    - layerType
    - color
    - fillOpacity
    - borderColor
    - borderWidth
    - responsibleUserId
    - oeeTarget
    - status
    - isLocked
    - zIndex
    - validFrom
    - validTo
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

O campo `sourceAreaId` deverá ser utilizado quando a área também existir em outro cadastro oficial.

O campo `layerType` deverá distinguir:

- Área produtiva;
- Área de segurança;
- Rota;
- Corredor;
- Área restrita;
- Armazenamento;
- Área de risco;
- Área auxiliar.

Essa classificação será utilizada para determinar quando uma sobreposição é permitida.

---

### 17.5 Pontos do polígono

Os pontos do polígono deverão ser armazenados em ordem.

Campos mínimos:

    MapAreaPoint
    - id
    - mapAreaId
    - sequence
    - x
    - y
    - createdAt
    - createdBy

Regras:

- O polígono deverá possuir no mínimo três pontos;
- A sequência deverá definir a ordem de conexão;
- O sistema deverá fechar a área entre o último e o primeiro ponto;
- Pontos duplicados deverão ser bloqueados ou tratados;
- Polígonos com autointerseção deverão ser considerados inválidos;
- Alterações deverão permanecer vinculadas à versão correspondente.

Como alternativa, os pontos poderão ser armazenados em uma estrutura geoespacial, desde que seja mantida a ordem e a possibilidade de edição individual.

---

### 17.6 Posicionamento do equipamento

Representa a posição visual de um equipamento cadastrado no sistema oficial.

Campos mínimos:

    EquipmentPosition
    - id
    - mapVersionId
    - equipmentId
    - mapAreaId
    - parentEquipmentPositionId
    - x
    - y
    - width
    - height
    - rotation
    - zIndex
    - iconType
    - iconSource
    - labelPosition
    - processOrder
    - isLocked
    - validFrom
    - validTo
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Regras:

- `equipmentId` deverá apontar para o cadastro oficial;
- Um equipamento não deverá ser duplicado dentro da mesma versão e do mesmo nível;
- O equipamento poderá permanecer sem `mapAreaId`;
- Componentes poderão utilizar `parentEquipmentPositionId`;
- A posição deverá possuir vigência;
- A retirada do mapa deverá encerrar a vigência, não excluir o histórico;
- O sistema deverá preservar posições anteriores.

---

### 17.7 Ponto fixo do mapa

Representa um ponto que não é necessariamente um equipamento.

Exemplos:

- Ponto de inspeção;
- Posto de trabalho;
- Ponto de coleta;
- Painel;
- Área de descarte;
- Saída de emergência;
- Ponto de segurança;
- Local de ferramenta;
- Estação de material.

Campos mínimos:

    MapFixedPoint
    - id
    - mapVersionId
    - mapAreaId
    - pointType
    - name
    - code
    - description
    - x
    - y
    - iconType
    - status
    - validFrom
    - validTo
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

---

### 17.8 Vínculo espacial de registros

Representa a relação entre um registro existente e sua posição no mapa.

Campos mínimos:

    SpatialRecordLink
    - id
    - mapId
    - recordType
    - sourceRecordId
    - externalRecordId
    - lineId
    - mapAreaId
    - equipmentId
    - componentId
    - fixedPointId
    - x
    - y
    - linkageType
    - status
    - validFrom
    - validTo
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Valores de `recordType` poderão incluir:

- Problem;
- WorkOrder;
- Action;
- Checklist;
- Downtime;
- QualityDeviation;
- SafetyRisk;
- InspectionPoint;
- Observation;
- Document;
- Photo.

Valores de `linkageType`:

- Automatic;
- Manual;
- DragAndDrop;
- Form;
- Integration;
- Inherited;
- Imported.

Regras:

- `sourceRecordId` deverá referenciar o identificador oficial;
- O vínculo não deverá duplicar o registro original;
- Um mesmo registro poderá possuir vínculos diferentes quando houver justificativa;
- O mapa deverá identificar qual vínculo é principal;
- A exclusão do vínculo não deverá excluir o registro de origem;
- Movimentações deverão manter histórico.

---

### 17.9 Relacionamento entre registros

Representa conexões entre problemas, ordens, ações, checklists e outros registros.

Campos mínimos:

    RecordRelationship
    - id
    - sourceRecordType
    - sourceRecordId
    - targetRecordType
    - targetRecordId
    - relationshipType
    - description
    - status
    - createdAt
    - createdBy

Tipos de relacionamento:

- Originated;
- DetectedBy;
- TreatedBy;
- RelatedTo;
- CausedBy;
- ResolvedBy;
- Generated;
- ValidatedBy;
- ReopenedBy.

Exemplos:

- Checklist detectou problema;
- Problema originou ordem de serviço;
- Problema originou ação;
- Ordem de serviço tratou problema;
- Ação reduziu perda;
- Parada está relacionada ao problema.

---

### 17.10 Alocação de pessoas

Representa onde a pessoa está trabalhando durante determinado período.

Campos mínimos:

    WorkforceAllocation
    - id
    - personId
    - lineId
    - mapAreaId
    - equipmentId
    - fixedPointId
    - shiftId
    - roleId
    - allocationType
    - startDateTime
    - endDateTime
    - status
    - source
    - justification
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Tipos de alocação:

- Planned;
- Actual;
- Temporary;
- Support;
- Training;
- Replacement;
- Contingency.

Regras:

- A alocação deverá possuir início;
- O fim poderá permanecer aberto durante o turno;
- Conflitos de horário deverão ser identificados;
- Uma pessoa poderá apoiar mais de um equipamento quando permitido;
- A alocação não deverá alterar automaticamente a competência;
- O histórico deverá ser preservado.

---

### 17.11 Competência por equipamento

Representa o conhecimento validado de uma pessoa.

Campos mínimos:

    PersonEquipmentCompetency
    - id
    - personId
    - equipmentId
    - componentId
    - competencyTypeId
    - level
    - status
    - assessedAt
    - assessedBy
    - validFrom
    - validUntil
    - trainingId
    - evidenceId
    - restriction
    - lastPracticalUseAt
    - recyclingRequired
    - notes
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Regras:

- O nível deverá aceitar valores de 0 a 5;
- A competência deverá ser separada por tipo;
- Uma competência vencida não deverá ser considerada cobertura válida;
- Alterações de nível deverão gerar histórico;
- O avaliador deverá possuir permissão;
- Evidências deverão utilizar o repositório oficial;
- Suspensões não deverão apagar as avaliações anteriores.

---

### 17.12 Tipo de competência

Campos mínimos:

    CompetencyType
    - id
    - name
    - description
    - category
    - requiresValidity
    - defaultValidityDays
    - requiresEvidence
    - requiresAssessment
    - status
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Exemplos:

- Operação;
- Setup;
- Limpeza;
- Inspeção;
- Ajuste;
- Manutenção autônoma;
- Manutenção técnica;
- Qualidade;
- Segurança;
- Investigação de falhas;
- Instrutoria.

---

### 17.13 Requisito mínimo do equipamento

Representa a cobertura necessária para operar ou executar determinada atividade.

Campos mínimos:

    EquipmentCompetencyRequirement
    - id
    - equipmentId
    - competencyTypeId
    - minimumLevel
    - minimumPeople
    - shiftId
    - productId
    - activityType
    - operatingState
    - isMandatory
    - validFrom
    - validTo
    - status
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Regras:

- O requisito poderá variar por turno;
- O requisito poderá variar por produto ou atividade;
- Requisitos obrigatórios deverão gerar bloqueio ou alerta configurável;
- A ausência de configuração deverá ser diferente de cobertura insuficiente;
- Requisitos vencidos ou inativos não deverão participar do cálculo.

---

### 17.14 Resultado de cobertura

O resultado poderá ser calculado em tempo real ou armazenado em períodos definidos.

Campos de referência:

    CompetencyCoverageResult
    - id
    - lineId
    - mapAreaId
    - equipmentId
    - shiftId
    - referenceDateTime
    - requiredPeople
    - qualifiedPeople
    - allocatedQualifiedPeople
    - coveragePercentage
    - coverageStatus
    - criticalDependency
    - missingRequirements
    - calculatedAt
    - calculationVersion

Estados:

- Adequate;
- Partial;
- Insufficient;
- CriticalDependency;
- NotConfigured;
- DataUnavailable.

O sistema deverá manter a versão da regra utilizada no cálculo.

---

### 17.15 Configuração do mapa de calor

Campos mínimos:

    HeatmapConfiguration
    - id
    - mapId
    - name
    - indicatorType
    - calculationMethod
    - spatialLevel
    - normalizationType
    - periodType
    - colorScaleId
    - minimumValue
    - maximumValue
    - isShared
    - ownerUserId
    - status
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Métodos de cálculo:

- Count;
- Impact;
- WeightedIndex;
- Rate;
- Percentage.

Níveis espaciais:

- Area;
- Equipment;
- Component;
- Point.

---

### 17.16 Pesos do índice de criticidade

Campos mínimos:

    CriticalityWeight
    - id
    - configurationId
    - factorType
    - weight
    - minimumValue
    - maximumValue
    - status
    - validFrom
    - validTo
    - createdAt
    - createdBy

Fatores possíveis:

- Ocorrência;
- Minutos de parada;
- Criticidade;
- Recorrência;
- Perda de OEE;
- Custo;
- Ação vencida;
- Ordem de serviço vencida;
- Risco de segurança;
- Desvio de qualidade.

O sistema deverá preservar a regra utilizada em cálculos históricos.

---

### 17.17 Visualização salva

Campos mínimos:

    SavedMapView
    - id
    - mapId
    - ownerUserId
    - name
    - description
    - visualizationMode
    - activeLayers
    - filterConfiguration
    - heatmapConfigurationId
    - zoomLevel
    - centerX
    - centerY
    - comparisonConfiguration
    - visibility
    - isDefault
    - createdAt
    - createdBy
    - updatedAt
    - updatedBy

Valores de visibilidade:

- Private;
- Team;
- Line;
- PublicByPermission.

A visualização salva deverá guardar somente a configuração, não uma cópia dos dados operacionais.

---

### 17.18 Preferência do usuário

Campos mínimos:

    UserMapPreference
    - id
    - userId
    - mapId
    - defaultMode
    - defaultShiftId
    - defaultPeriod
    - activeLayers
    - panelConfiguration
    - cardConfiguration
    - rankingConfiguration
    - zoomLevel
    - centerX
    - centerY
    - updatedAt

As preferências pessoais não deverão alterar o padrão oficial da linha.

---

### 17.19 Auditoria

Campos mínimos:

    MapAuditLog
    - id
    - mapId
    - mapVersionId
    - entityType
    - entityId
    - actionType
    - previousValue
    - newValue
    - reason
    - userId
    - dateTime
    - source
    - sessionId
    - transactionId
    - result

A auditoria deverá registrar, no mínimo:

- Criação;
- Atualização;
- Movimentação;
- Redimensionamento;
- Rotação;
- Vinculação;
- Desvinculação;
- Publicação;
- Restauração;
- Aprovação;
- Rejeição;
- Alteração de permissão;
- Exportação;
- Exceção autorizada.

---

### 17.20 Status de integração

Campos mínimos:

    IntegrationStatus
    - id
    - sourceSystem
    - integrationType
    - entityType
    - status
    - lastAttemptAt
    - lastSuccessfulUpdateAt
    - recordsProcessed
    - recordsRejected
    - errorCode
    - errorMessage
    - nextAttemptAt
    - updatedAt

Estados:

- Available;
- Updating;
- Delayed;
- PartiallyAvailable;
- Unavailable;
- NotConfigured;
- Error.

---

### 17.21 Regras de integridade

O modelo deverá garantir:

1. Um equipamento não poderá ser duplicado na mesma versão e no mesmo nível visual;

2. Um ponto de polígono deverá pertencer a uma única área e versão;

3. Uma versão publicada não poderá ser alterada diretamente;

4. Um vínculo espacial deverá apontar para um registro existente ou possuir identificação externa válida;

5. Uma competência deverá possuir pessoa, equipamento, tipo e nível;

6. Uma alocação deverá possuir período válido;

7. Datas finais não poderão ser anteriores às datas iniciais;

8. Registros inativos deverão permanecer disponíveis para consultas históricas;

9. Exclusões lógicas deverão preservar auditoria;

10. Identificadores de origem deverão ser únicos conforme a fonte;

11. Dados ausentes não deverão ser gravados como zero sem validação;

12. Todo cálculo deverá registrar a versão da regra utilizada;

13. Toda publicação deverá referenciar um rascunho validado;

14. Todo posicionamento deverá pertencer a um mapa válido;

15. Mudanças de vínculo deverão encerrar a vigência anterior e criar a nova vigência.

---

### 17.22 Índices e desempenho de consulta

A equipe técnica deverá prever índices para consultas frequentes, principalmente por:

- `mapId`;
- `mapVersionId`;
- `lineId`;
- `mapAreaId`;
- `equipmentId`;
- `personId`;
- `sourceRecordId`;
- `recordType`;
- `status`;
- `shiftId`;
- `validFrom`;
- `validTo`;
- `referenceDateTime`;
- `createdAt`.

As consultas espaciais deverão ser otimizadas para:

- Identificar equipamentos dentro de um polígono;
- Identificar registros dentro de uma área;
- Localizar elementos próximos;
- Detectar sobreposição;
- Agrupar pontos;
- Calcular intensidade por região.

Quando a tecnologia utilizada permitir, deverão ser avaliados recursos nativos de geometria ou dados espaciais.

---

### 17.23 Retenção e histórico

A retenção deverá seguir as regras corporativas aplicáveis.

O modelo deverá preservar:

- Versões publicadas;
- Histórico de posicionamento;
- Histórico das áreas;
- Histórico de vínculos;
- Histórico de alocações;
- Histórico de competências;
- Auditoria;
- Configurações usadas em cálculos;
- Origem das informações.

A inativação de um elemento não deverá remover sua participação em análises históricas correspondentes ao período em que estava ativo.

---

### 17.24 Migração inicial

A implantação deverá prever a migração ou criação inicial de:

- Mapa por linha;
- Imagem de fundo;
- Áreas existentes;
- Equipamentos;
- Associação entre linha e equipamento;
- Posição inicial;
- Pontos fixos;
- Usuários responsáveis;
- Perfis e permissões;
- Metas de OEE;
- Requisitos de competência disponíveis;
- Identificadores dos sistemas de origem.

A migração deverá produzir relatório contendo:

- Registros importados;
- Registros rejeitados;
- Equipamentos sem linha;
- Equipamentos duplicados;
- Equipamentos sem identificação;
- Áreas sem responsável;
- Vínculos não encontrados;
- Dados que exigem correção manual.

Nenhum dado inconsistente deverá ser descartado silenciosamente.
## 18. Fluxos principais de uso e cenários operacionais

Esta seção define como o usuário deverá utilizar a Linha 360° nas principais situações operacionais.

Os fluxos deverão servir como referência para:

- Experiência do usuário;
- Protótipos;
- Desenvolvimento;
- Testes;
- Homologação;
- Treinamento;
- Demonstração da funcionalidade.

---

### 18.1 Criar o mapa inicial da linha

#### Pré-condições

- Usuário com permissão para editar o mapa;
- Linha cadastrada;
- Equipamentos cadastrados;
- Mapa ainda não publicado ou em fase de configuração.

#### Fluxo principal

1. O usuário acessa a Linha 360°;
2. Seleciona a linha;
3. Seleciona **Editar mapa**;
4. O sistema verifica se existe um mapa publicado;
5. O usuário escolhe uma das opções:
   - Carregar imagem da planta;
   - Criar mapa em branco;
   - Utilizar um mapa existente como referência;
6. O sistema cria um novo rascunho;
7. O usuário configura a imagem de fundo, quando aplicável;
8. O usuário cria as áreas produtivas;
9. O usuário posiciona os equipamentos;
10. O sistema executa as validações;
11. O usuário salva o rascunho;
12. O usuário envia para revisão;
13. O publicador revisa;
14. O mapa é publicado.

#### Resultado esperado

- Mapa publicado;
- Áreas válidas;
- Equipamentos posicionados;
- Histórico da publicação;
- Versão anterior preservada, quando existente.

---

### 18.2 Criar uma área produtiva por pontos

#### Pré-condições

- Modo de edição ativo;
- Rascunho disponível;
- Usuário com permissão para editar áreas.

#### Fluxo principal

1. O usuário seleciona **Criar área**;
2. Seleciona a categoria da área;
3. Clica no primeiro ponto;
4. Continua clicando para formar o perímetro;
5. O sistema conecta os pontos;
6. O usuário clica novamente no primeiro ponto;
7. O sistema fecha o polígono;
8. O sistema valida o formato;
9. O formulário da área é aberto;
10. O usuário informa nome, código, tipo e cor;
11. O sistema identifica os equipamentos dentro do polígono;
12. O usuário revisa os equipamentos encontrados;
13. O usuário confirma;
14. A área é salva no rascunho.

#### Fluxos alternativos

- O usuário utiliza o botão **Fechar área**;
- O usuário desfaz o último ponto;
- O usuário move um ponto antes de confirmar;
- O usuário cancela o desenho;
- O sistema identifica autointerseção;
- O sistema identifica sobreposição;
- O usuário corrige o polígono.

#### Resultado esperado

- Área válida;
- Polígono salvo;
- Equipamentos identificados;
- Vínculos pendentes ou confirmados;
- Alteração disponível no rascunho.

---

### 18.3 Alterar o perímetro de uma área

#### Fluxo principal

1. O usuário entra no modo de edição;
2. Seleciona a área;
3. Seleciona **Editar pontos**;
4. Move, adiciona ou remove vértices;
5. O sistema recalcula o polígono;
6. O sistema identifica equipamentos que entraram;
7. O sistema identifica equipamentos que saíram;
8. O sistema identifica registros abertos afetados;
9. O usuário revisa o impacto;
10. O usuário confirma a alteração;
11. O sistema salva no rascunho;
12. A alteração fica pendente de publicação.

#### Resultado esperado

Nenhum equipamento ou registro deverá mudar de área silenciosamente.

---

### 18.4 Posicionar um equipamento por arrastar e soltar

#### Pré-condições

- Equipamento cadastrado;
- Equipamento disponível na biblioteca;
- Usuário no modo de edição.

#### Fluxo principal

1. O usuário pesquisa o equipamento;
2. Arrasta o equipamento para o mapa;
3. As áreas válidas são destacadas;
4. O usuário solta o equipamento;
5. O sistema registra a coordenada;
6. O sistema identifica a área;
7. O sistema sugere o vínculo;
8. O usuário confirma;
9. O usuário ajusta tamanho e rotação, quando necessário;
10. O sistema salva a posição no rascunho.

#### Fluxos alternativos

- Equipamento solto fora de uma área;
- Equipamento sobreposto a outro;
- Equipamento já posicionado;
- Equipamento parcialmente sobre duas áreas;
- Equipamento bloqueado para edição.

#### Resultado esperado

- Equipamento posicionado;
- Área vinculada ou status sem área;
- Sobreposições tratadas;
- Histórico da alteração preservado.

---

### 18.5 Criar um problema diretamente no mapa

#### Pré-condições

- Usuário autorizado a criar problemas;
- Mapa publicado;
- Modo de consulta ativo.

#### Fluxo principal

1. O usuário seleciona um equipamento, área ou ponto;
2. Abre o menu de contexto;
3. Seleciona **Criar problema**;
4. O sistema abre o formulário;
5. Os campos de localização são preenchidos automaticamente;
6. O usuário informa título;
7. Informa descrição;
8. Seleciona categoria;
9. Define criticidade;
10. Adiciona evidências, quando necessário;
11. Define responsável ou fila;
12. Salva o problema;
13. O módulo oficial gera o identificador;
14. O problema aparece no mapa;
15. O painel lateral apresenta o registro.

#### Resultado esperado

- Problema criado no módulo oficial;
- Identificador preservado;
- Localização vinculada;
- Problema visível conforme filtros;
- Auditoria registrada.

---

### 18.6 Arrastar uma ordem de serviço para o equipamento

#### Pré-condições

- Ordem de serviço existente;
- Equipamento posicionado;
- Usuário autorizado a vincular a ordem.

#### Fluxo principal

1. O usuário abre a camada de Manutenção;
2. Pesquisa a ordem de serviço;
3. Arrasta a ordem;
4. Solta sobre o equipamento;
5. O sistema identifica linha, área e equipamento;
6. O vínculo proposto é apresentado;
7. O usuário confirma;
8. O sistema salva o vínculo espacial;
9. A ordem aparece sobre o equipamento;
10. O painel lateral apresenta os detalhes disponíveis.

#### Regras

- A ordem original não deverá ser duplicada;
- O identificador externo deverá ser preservado;
- O vínculo poderá ser removido sem excluir a ordem;
- A movimentação deverá manter histórico.

---

### 18.7 Criar e posicionar um checklist específico

#### Fluxo principal

1. O usuário seleciona um equipamento, área ou posto;
2. Seleciona **Associar checklist**;
3. Escolhe:
   - Selecionar checklist existente;
   - Criar novo checklist;
4. Define frequência;
5. Define data de início;
6. Define turno;
7. Define responsáveis;
8. Define prazo;
9. Confirma a localização;
10. Salva;
11. O checklist aparece no mapa;
12. O sistema agenda as execuções conforme a regra definida.

#### Resultado esperado

- Checklist vinculado;
- Localização definida;
- Agenda criada;
- Responsáveis definidos;
- Status disponível na camada de Checklists.

---

### 18.8 Tratar reprovação de checklist

#### Fluxo principal

1. O usuário executa o checklist;
2. Um item é reprovado;
3. O sistema solicita a classificação da reprovação;
4. O usuário adiciona evidência;
5. O sistema oferece:
   - Criar problema;
   - Criar ação;
   - Criar ordem de serviço;
   - Registrar desvio de qualidade;
6. O usuário seleciona uma opção;
7. O novo registro herda a localização;
8. O novo registro é vinculado ao checklist;
9. O mapa exibe os registros relacionados.

#### Resultado esperado

A reprovação não deverá permanecer apenas como resultado do checklist sem encaminhamento quando a regra exigir tratamento.

---

### 18.9 Consultar o OEE de um equipamento

#### Fluxo principal

1. O usuário seleciona o modo **OEE e perdas**;
2. Ativa a camada **OEE por equipamento**;
3. Seleciona o período;
4. Seleciona o turno;
5. Localiza o equipamento;
6. O mapa apresenta o OEE resumido;
7. O usuário seleciona o equipamento;
8. O painel lateral apresenta:
   - OEE;
   - Meta;
   - Disponibilidade;
   - Performance;
   - Qualidade;
   - Tendência;
   - Principais perdas;
   - Última atualização;
9. O usuário abre o Pareto;
10. Seleciona uma perda;
11. O sistema destaca os registros relacionados.

#### Resultado esperado

O usuário deverá compreender o resultado e seus principais fatores sem navegar por várias páginas.

---

### 18.10 Identificar a área mais crítica

#### Fluxo principal

1. O usuário ativa o mapa de calor;
2. Seleciona o indicador;
3. Seleciona o método:
   - Quantidade;
   - Impacto;
   - Índice ponderado;
4. Seleciona o nível **Área**;
5. Define o período;
6. Aplica filtros;
7. O sistema calcula a intensidade;
8. As áreas são coloridas;
9. O ranking é atualizado;
10. O usuário seleciona a primeira área;
11. O mapa enquadra o polígono;
12. O painel apresenta os fatores do resultado.

#### Resultado esperado

O sistema deverá mostrar:

- Área mais crítica;
- Valor;
- Critério;
- Registros de origem;
- Principais causas;
- Pendências;
- Comparação com o período anterior.

---

### 18.11 Comparar quantidade e impacto das falhas

#### Fluxo principal

1. O usuário seleciona a visualização por quantidade;
2. Identifica os equipamentos com mais ocorrências;
3. Alterna para visualização por impacto;
4. O mapa recalcula as intensidades;
5. O ranking é atualizado;
6. O usuário compara os resultados;
7. Seleciona os equipamentos relevantes;
8. Abre a comparação;
9. Analisa:
   - Quantidade de falhas;
   - Minutos de parada;
   - Perda de produção;
   - Perda de OEE;
   - Criticidade;
   - Recorrência.

#### Resultado esperado

O usuário deverá conseguir diferenciar:

- Equipamento com muitas falhas pequenas;
- Equipamento com poucas falhas de grande impacto;
- Equipamento com problema recorrente;
- Equipamento com maior perda total.

---

### 18.12 Alocar uma pessoa em um equipamento

#### Pré-condições

- Pessoa disponível;
- Equipamento posicionado;
- Requisitos mínimos configurados;
- Competências cadastradas;
- Usuário autorizado.

#### Fluxo principal

1. O usuário abre o modo **Pessoas e competências**;
2. Pesquisa a pessoa;
3. Arrasta a pessoa para o equipamento;
4. O sistema verifica disponibilidade;
5. Verifica conflitos;
6. Verifica competência;
7. Verifica validade;
8. Compara com o requisito mínimo;
9. Apresenta o resultado;
10. O usuário confirma;
11. A alocação é registrada;
12. A pessoa aparece no equipamento.

#### Fluxos alternativos

- Pessoa sem competência;
- Pessoa em treinamento;
- Habilitação vencida;
- Pessoa já alocada;
- Operação permitida com acompanhamento;
- Exceção autorizada com justificativa.

#### Resultado esperado

Nenhuma pessoa deverá ser considerada habilitada apenas por estar posicionada no equipamento.

---

### 18.13 Identificar lacunas de conhecimento

#### Fluxo principal

1. O usuário abre o modo **Pessoas e competências**;
2. Seleciona o turno;
3. Ativa a camada de cobertura;
4. O sistema compara requisitos e pessoas disponíveis;
5. Os equipamentos são classificados;
6. O usuário seleciona um equipamento em vermelho ou roxo;
7. O painel apresenta:
   - Requisitos;
   - Pessoas necessárias;
   - Pessoas habilitadas;
   - Pessoas alocadas;
   - Competências ausentes;
   - Habilitações vencidas;
   - Dependências críticas;
8. O usuário cria uma necessidade de treinamento;
9. Define pessoa, competência, nível desejado e prazo.

#### Resultado esperado

O sistema deverá transformar a lacuna identificada em uma ação de desenvolvimento rastreável.

---

### 18.14 Consultar todos os equipamentos de uma pessoa

#### Fluxo principal

1. O usuário pesquisa uma pessoa;
2. Abre o perfil operacional;
3. Seleciona **Visualizar no mapa**;
4. O sistema destaca os equipamentos relacionados;
5. A intensidade ou o marcador representa o nível;
6. O painel apresenta:
   - Tipo de competência;
   - Nível;
   - Validade;
   - Status;
   - Última avaliação;
7. O usuário filtra por competência;
8. O mapa atualiza os equipamentos.

#### Resultado esperado

O usuário deverá identificar rapidamente em quais equipamentos a pessoa pode operar, realizar setup, ajustar, inspecionar ou treinar.

---

### 18.15 Realocar uma pessoa durante o turno

#### Fluxo principal

1. O líder seleciona a pessoa alocada;
2. Seleciona **Realocar**;
3. Arrasta para outro equipamento;
4. O sistema verifica o novo requisito;
5. Verifica conflito;
6. Verifica impacto da retirada no equipamento anterior;
7. Apresenta:
   - Cobertura anterior;
   - Nova cobertura;
   - Riscos;
8. O líder confirma;
9. O sistema encerra a alocação anterior;
10. Cria a nova alocação;
11. Registra data e hora;
12. Atualiza os dois equipamentos.

#### Resultado esperado

O sistema deverá avaliar tanto o equipamento de destino quanto o equipamento que perdeu a pessoa.

---

### 18.16 Pesquisar e localizar um registro

#### Fluxo principal

1. O usuário utiliza a pesquisa global;
2. Digita código, nome ou número;
3. O sistema agrupa resultados por tipo;
4. O usuário seleciona o resultado;
5. A camada necessária é ativada;
6. O mapa centraliza o ponto;
7. O item recebe destaque;
8. O painel lateral é aberto.

#### Fluxo alternativo

Se o registro não possuir posição:

1. O sistema informa que não existe localização;
2. Um usuário autorizado seleciona **Vincular ao mapa**;
3. Seleciona equipamento, área ou ponto;
4. Confirma;
5. O vínculo é criado.

---

### 18.17 Analisar pendências de uma área

#### Fluxo principal

1. O usuário seleciona uma área;
2. Abre o resumo;
3. Seleciona **Pendências**;
4. O sistema apresenta:
   - Problemas abertos;
   - Problemas sem responsável;
   - Ordens de serviço vencidas;
   - Ações vencidas;
   - Checklists atrasados;
   - Treinamentos pendentes;
   - Competências vencidas;
5. O usuário ordena por prioridade;
6. Seleciona um item;
7. O mapa destaca a localização;
8. O painel apresenta os detalhes.

#### Resultado esperado

As pendências deverão estar relacionadas ao local e aos registros oficiais.

---

### 18.18 Comparar antes e depois de uma ação

#### Fluxo principal

1. O usuário seleciona uma ação concluída;
2. Seleciona **Analisar efetividade**;
3. O sistema identifica a data de conclusão;
4. O usuário define os períodos anterior e posterior;
5. Seleciona o indicador:
   - Falhas;
   - Paradas;
   - OEE;
   - Scrap;
   - Recorrência;
   - Custo;
6. O sistema compara os períodos;
7. Apresenta valores e variações;
8. Exibe os registros associados;
9. O usuário classifica a ação como:
   - Efetiva;
   - Parcialmente efetiva;
   - Sem efeito comprovado;
   - Ainda sem dados suficientes.

#### Resultado esperado

A conclusão da ação não deverá ser considerada automaticamente como evidência de melhora.

---

### 18.19 Publicar uma nova versão do mapa

#### Fluxo principal

1. O editor conclui as alterações;
2. Seleciona **Validar rascunho**;
3. O sistema verifica:
   - Polígonos;
   - Sobreposições;
   - Equipamentos duplicados;
   - Equipamentos sem área;
   - Vínculos inconsistentes;
   - Elementos fora do mapa;
4. O editor corrige erros;
5. Envia para revisão;
6. O publicador compara com a versão atual;
7. Revisa a lista de alterações;
8. Informa o motivo;
9. Aprova;
10. O sistema publica a nova versão;
11. A versão anterior é arquivada;
12. A auditoria é registrada.

#### Resultado esperado

Usuários em modo de consulta deverão visualizar somente a versão publicada.

---

### 18.20 Restaurar uma versão anterior

#### Fluxo principal

1. O usuário autorizado abre o histórico;
2. Seleciona uma versão;
3. Compara com a atual;
4. Seleciona **Criar rascunho a partir desta versão**;
5. Informa a justificativa;
6. O sistema cria um novo rascunho;
7. Executa validações;
8. O usuário revisa;
9. Envia para publicação;
10. A nova versão é publicada.

#### Resultado esperado

A restauração não deverá apagar versões posteriores nem alterar diretamente o mapa publicado.

---

### 18.21 Operação durante falha de integração

#### Fluxo principal

1. Uma fonte deixa de atualizar;
2. O sistema mantém o último dado válido;
3. A camada é marcada como desatualizada;
4. A última atualização é exibida;
5. O usuário continua utilizando as demais funções;
6. Registros manuais autorizados são identificados como contingência;
7. As operações pendentes são armazenadas;
8. A integração retorna;
9. O sistema sincroniza;
10. Duplicidades são verificadas;
11. O status volta ao normal.

#### Resultado esperado

Uma falha isolada não deverá tornar toda a Linha 360° indisponível.

---

### 18.22 Uso em reunião de gestão da linha

#### Fluxo principal

1. O líder abre a Linha 360° em tela cheia;
2. Seleciona o turno ou período;
3. Abre a Visão geral;
4. Revisa:
   - OEE;
   - Produção;
   - Paradas;
   - Problemas críticos;
   - Ordens de serviço;
   - Ações;
   - Checklists;
   - Cobertura de pessoas;
5. Seleciona a área mais crítica;
6. Abre os registros de origem;
7. Define ou atualiza responsáveis;
8. Define prazos;
9. Registra novas ações;
10. Salva uma visualização ou compartilha o link interno.

#### Resultado esperado

A reunião deverá utilizar os registros oficiais e gerar ações claras, responsáveis e prazos diretamente relacionados ao mapa.

---

### 18.23 Uso no início do turno

#### Fluxo principal

1. A liderança seleciona o turno;
2. Consulta o status dos equipamentos;
3. Verifica paradas em andamento;
4. Verifica ordens abertas;
5. Verifica problemas críticos;
6. Verifica checklists previstos;
7. Verifica pessoas disponíveis;
8. Verifica cobertura por equipamento;
9. Realiza ajustes de alocação;
10. Confirma a equipe;
11. Salva o estado inicial do turno, quando aplicável.

#### Resultado esperado

A linha deverá iniciar o turno com os principais riscos, pendências e lacunas identificados.

---

### 18.24 Uso no encerramento do turno

#### Fluxo principal

1. A liderança seleciona o turno encerrado;
2. Revisa:
   - Produção;
   - OEE;
   - Paradas;
   - Problemas;
   - Ordens de serviço;
   - Ações;
   - Checklists;
   - Desvios de qualidade;
   - Riscos de segurança;
3. Identifica registros sem responsável;
4. Identifica registros sem localização;
5. Atualiza pendências;
6. Registra observações para o próximo turno;
7. Gera ou compartilha o resumo;
8. Encerra a passagem de turno.

#### Resultado esperado

O próximo turno deverá receber uma visão objetiva das condições da linha e das pendências em aberto.

---

### 18.25 Regras gerais dos fluxos

Todos os fluxos deverão:

1. Respeitar as permissões;

2. Preservar o contexto do mapa;

3. Evitar navegação desnecessária;

4. Utilizar dados oficiais;

5. Registrar auditoria;

6. Informar o resultado da operação;

7. Preservar o trabalho em caso de falha recuperável;

8. Evitar duplicidade;

9. Diferenciar dado ausente de zero;

10. Manter o vínculo espacial;

11. Preservar o histórico;

12. Funcionar em desktop e, quando aplicável, em tablet;

13. Apresentar alternativas ao arrastar e soltar;

14. Permitir retorno à visualização anterior;

15. Exibir mensagens objetivas em caso de bloqueio ou exceção.
    ## 19. Relatórios, exportações e compartilhamento

A Linha 360° deverá permitir transformar a situação visual da linha em relatórios operacionais, registros de passagem de turno, materiais para reuniões e análises gerenciais.

Os relatórios deverão utilizar os mesmos:

- Dados;
- Indicadores;
- Filtros;
- Períodos;
- Regras de cálculo;
- Permissões;
- Fontes oficiais;
- Critérios de atualização utilizados na tela.

Nenhum relatório deverá apresentar valores diferentes da Linha 360° para o mesmo período, filtro e regra de cálculo.

---

### 19.1 Objetivos

A funcionalidade deverá permitir:

- Registrar a condição da linha em determinado momento;
- Compartilhar problemas e prioridades;
- Apoiar reuniões operacionais;
- Apoiar passagem de turno;
- Apresentar resultados para supervisão e gestão;
- Exportar informações para análises complementares;
- Distribuir relatórios programados;
- Preservar os filtros utilizados;
- Manter rastreabilidade sobre os dados apresentados.

---

### 19.2 Tipos de saída

A Linha 360° deverá permitir gerar:

- Imagem da visão atual;
- Relatório em PDF;
- Planilha em Excel;
- Arquivo CSV;
- Lista de registros;
- Resumo por área;
- Resumo por equipamento;
- Relatório de OEE e perdas;
- Relatório de problemas;
- Relatório de manutenção;
- Relatório de checklists;
- Relatório de pessoas e competências;
- Relatório de passagem de turno;
- Relatório executivo;
- Link interno compartilhável;
- Impressão da tela.

As opções disponíveis deverão respeitar as permissões do usuário.

---

### 19.3 Captura da visão atual

O usuário deverá conseguir exportar a visualização atual do mapa.

A captura deverá considerar:

- Linha selecionada;
- Modo de visualização;
- Período;
- Turno;
- Filtros ativos;
- Camadas visíveis;
- Zoom;
- Área enquadrada;
- Mapa de calor;
- Elementos destacados;
- Legenda;
- Data e hora da geração;
- Data e hora da última atualização dos dados.

O usuário poderá escolher:

- Exportar somente o mapa;
- Exportar mapa e cards;
- Exportar mapa, cards e rankings;
- Exportar a tela completa;
- Exportar a área selecionada.

Informações abertas em painéis laterais deverão ser incluídas somente quando o usuário selecionar essa opção.

---

### 19.4 Exportação em PDF

O PDF deverá possuir estrutura padronizada:

1. Título;
2. Linha;
3. Planta ou unidade;
4. Período;
5. Turno;
6. Filtros;
7. Data e hora da geração;
8. Última atualização dos dados;
9. Mapa;
10. Legenda;
11. Cards principais;
12. Rankings;
13. Pendências;
14. Observações;
15. Fontes dos dados.

O PDF deverá permitir selecionar:

- Orientação retrato;
- Orientação paisagem;
- Tamanho de página;
- Inclusão do mapa;
- Inclusão de indicadores;
- Inclusão de registros detalhados;
- Inclusão de evidências;
- Inclusão de dados de pessoas, conforme permissão.

O conteúdo não deverá ser cortado ou ficar ilegível durante a impressão.

---

### 19.5 Exportação em Excel

A exportação em Excel deverá organizar os dados em abas.

Estrutura recomendada:

#### Aba Resumo

- Linha;
- Período;
- Turno;
- Indicadores;
- Metas;
- Tendências;
- Filtros aplicados;
- Atualização dos dados.

#### Aba Áreas

- Área;
- Tipo;
- Equipamentos;
- OEE;
- Paradas;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Cobertura de conhecimento;
- Índice de criticidade.

#### Aba Equipamentos

- Código;
- Nome;
- Área;
- Status;
- OEE;
- Meta;
- Disponibilidade;
- Performance;
- Qualidade;
- Minutos de parada;
- Problemas;
- Ordens de serviço;
- Cobertura de conhecimento.

#### Aba Registros

- Tipo;
- Identificador;
- Título;
- Linha;
- Área;
- Equipamento;
- Criticidade;
- Status;
- Responsável;
- Data de abertura;
- Prazo;
- Origem;
- Localização no mapa.

#### Aba Pessoas e competências

Disponível somente mediante permissão:

- Pessoa;
- Função;
- Turno;
- Área;
- Equipamento;
- Competência;
- Nível;
- Status;
- Validade;
- Cobertura.

#### Aba Parâmetros

- Período;
- Filtros;
- Regras de cálculo;
- Método do mapa de calor;
- Normalização;
- Fonte;
- Data da atualização;
- Data da exportação.

A exportação deverá manter valores numéricos como números, evitando gravá-los apenas como texto.

---

### 19.6 Exportação em CSV

O CSV deverá ser utilizado para exportações tabulares simples.

O usuário deverá selecionar o conjunto de dados:

- Equipamentos;
- Áreas;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Pessoas;
- Competências;
- Paradas;
- Indicadores;
- Registros espaciais.

O arquivo deverá informar:

- Codificação utilizada;
- Separador;
- Formato de data;
- Unidade dos indicadores;
- Campos exportados;
- Filtros aplicados.

Dados restritos deverão ser removidos conforme a permissão.

---

### 19.7 Relatório de passagem de turno

O relatório deverá apresentar:

- Linha;
- Turno encerrado;
- Próximo turno;
- Responsável pelo preenchimento;
- Produção realizada;
- Meta;
- OEE;
- Disponibilidade;
- Performance;
- Qualidade;
- Principais paradas;
- Problemas críticos;
- Equipamentos indisponíveis;
- Ordens de serviço abertas;
- Ações pendentes;
- Checklists não executados;
- Desvios de qualidade;
- Riscos de segurança;
- Pessoas e cobertura;
- Observações para o próximo turno.

O relatório deverá permitir:

- Preenchimento automático com os dados disponíveis;
- Inclusão de observação manual;
- Definição de prioridade;
- Definição de responsável;
- Confirmação de recebimento pelo próximo turno;
- Consulta do histórico.

O relatório não deverá substituir os registros oficiais. Problemas, ações e ordens deverão estar vinculados aos respectivos módulos.

---

### 19.8 Relatório para reunião de gestão

O relatório da reunião deverá priorizar:

- Resultado do período;
- Comparação com a meta;
- Tendência;
- Área mais crítica;
- Equipamento com maior impacto;
- Principais perdas;
- Problemas recorrentes;
- Problemas críticos;
- Ordens de serviço prioritárias;
- Ações vencidas;
- Checklists reprovados;
- Desvios de qualidade;
- Riscos de segurança;
- Lacunas de conhecimento;
- Decisões;
- Responsáveis;
- Prazos.

Durante a reunião, deverá ser possível criar ou atualizar ações diretamente nos registros oficiais.

O relatório deverá apresentar claramente:

- O que exige decisão;
- O que exige acompanhamento;
- O que está vencido;
- O que melhorou;
- O que piorou;
- Quem é o responsável;
- Qual é o prazo.

---

### 19.9 Relatório executivo

O relatório executivo deverá apresentar uma visão resumida, evitando excesso de detalhes operacionais.

Conteúdo recomendado:

- OEE;
- Produção;
- Perdas;
- Scrap;
- Disponibilidade da linha;
- Principais riscos;
- Áreas críticas;
- Tendência;
- Impacto financeiro, quando disponível;
- Ações prioritárias;
- Evolução das ações;
- Cobertura de conhecimento;
- Comparação entre períodos;
- Principais conclusões.

Os detalhes deverão estar disponíveis por referência ou anexo, sem sobrecarregar a página principal.

---

### 19.10 Relatório de OEE e perdas

O relatório deverá apresentar:

- OEE da linha;
- OEE por equipamento;
- Meta;
- Disponibilidade;
- Performance;
- Qualidade;
- Tendência;
- Pareto de perdas;
- Minutos de parada;
- Microparadas;
- Perda de velocidade;
- Scrap;
- Produção perdida;
- Equipamentos abaixo da meta;
- Principais causas;
- Problemas relacionados;
- Ações relacionadas.

O relatório deverá diferenciar:

- OEE próprio;
- OEE herdado;
- Equipamento sem medição;
- Dado ausente;
- Equipamento fora do cálculo.

---

### 19.11 Relatório de manutenção

O relatório deverá apresentar:

- Equipamentos em manutenção;
- Ordens abertas;
- Ordens vencidas;
- Ordens prioritárias;
- Backlog;
- Falhas recorrentes;
- MTTR;
- MTBF;
- Equipamentos aguardando peças;
- Manutenções planejadas;
- Tempo de indisponibilidade;
- Problemas relacionados;
- Impacto no OEE;
- Responsáveis;
- Prazos.

O usuário deverá conseguir filtrar por:

- Corretiva;
- Preventiva;
- Preditiva;
- Emergencial;
- Planejada;
- Área;
- Equipamento;
- Prioridade;
- Responsável;
- Status.

---

### 19.12 Relatório de checklists

O relatório deverá apresentar:

- Checklists previstos;
- Checklists executados;
- Checklists atrasados;
- Taxa de realização;
- Itens reprovados;
- Problemas gerados;
- Ações geradas;
- Ordens de serviço geradas;
- Áreas com maior reprovação;
- Equipamentos com maior reprovação;
- Responsáveis;
- Frequências;
- Tendência de conformidade.

O relatório deverá permitir acessar os registros originados pelas reprovações.

---

### 19.13 Relatório de pessoas e competências

Disponível somente para usuários autorizados.

O relatório deverá apresentar:

- Pessoas por turno;
- Pessoas por área;
- Pessoas por equipamento;
- Competências por pessoa;
- Competências por equipamento;
- Níveis de conhecimento;
- Competências vencidas;
- Competências próximas do vencimento;
- Equipamentos sem cobertura;
- Dependências críticas;
- Pessoas em treinamento;
- Planos de capacitação;
- Cobertura por turno;
- Polivalência.

O relatório não deverá apresentar informações pessoais sem relação direta com a atividade profissional.

---

### 19.14 Link interno compartilhável

O usuário deverá conseguir gerar um link que preserve:

- Mapa;
- Linha;
- Modo de visualização;
- Período;
- Turno;
- Filtros;
- Camadas;
- Zoom;
- Posição;
- Elemento selecionado;
- Indicador do mapa de calor;
- Comparação ativa.

Ao abrir o link:

1. O sistema deverá verificar a autenticação;
2. Verificar as permissões;
3. Aplicar os filtros permitidos;
4. Ocultar dados não autorizados;
5. Informar quando a visualização não estiver mais disponível;
6. Manter os dados atualizados, salvo quando o link representar uma captura histórica.

O link não deverá permitir acesso público sem autorização específica.

---

### 19.15 Diferença entre link dinâmico e captura histórica

O sistema deverá oferecer dois tipos de compartilhamento.

#### Link dinâmico

Apresenta os dados atualizados conforme:

- Período;
- Filtros;
- Permissões;
- Fontes atuais.

#### Captura histórica

Preserva a condição no momento da geração:

- Valores;
- Mapa;
- Indicadores;
- Versão do mapa;
- Filtros;
- Data e hora;
- Fontes;
- Última atualização.

O tipo deverá ser informado claramente ao usuário.

---

### 19.16 Relatórios programados

Usuários autorizados poderão programar relatórios.

Configurações mínimas:

- Tipo de relatório;
- Linha;
- Período;
- Turno;
- Filtros;
- Formato;
- Frequência;
- Horário;
- Destinatários;
- Data de início;
- Data de término;
- Status.

Frequências possíveis:

- Por turno;
- Diária;
- Semanal;
- Mensal;
- Personalizada.

O sistema deverá registrar:

- Execuções;
- Envios;
- Falhas;
- Destinatários;
- Arquivo gerado;
- Data e hora;
- Usuário responsável pela configuração.

---

### 19.17 Destinatários e permissões

Um relatório não deverá enviar dados que o destinatário não está autorizado a consultar.

O sistema deverá verificar:

- Perfil do destinatário;
- Linha permitida;
- Informações de pessoas;
- Dados de qualidade restritos;
- Dados de segurança restritos;
- Documentos;
- Evidências;
- Indicadores financeiros.

Se um relatório possuir destinatários com permissões diferentes, o sistema deverá:

- Gerar versões adequadas; ou
- Utilizar o nível mais restritivo; ou
- Bloquear a configuração e explicar o conflito.

---

### 19.18 Exportação do mapa de calor

A exportação deverá incluir:

- Indicador;
- Método de cálculo;
- Nível espacial;
- Período;
- Filtros;
- Normalização;
- Escala;
- Intervalos;
- Legenda;
- Fonte;
- Última atualização;
- Valores por área ou equipamento.

Uma imagem do mapa de calor sem legenda, período e indicador não deverá ser considerada uma exportação válida.

---

### 19.19 Evidências e anexos

O usuário poderá optar por incluir evidências nos relatórios detalhados.

Exemplos:

- Fotos;
- Comentários;
- Documentos;
- Imagens do problema;
- Evidência de conclusão;
- Resultado de checklist.

Regras:

- Respeitar permissões;
- Evitar arquivos muito grandes;
- Utilizar miniaturas;
- Identificar o registro de origem;
- Informar quando o anexo não estiver disponível;
- Não duplicar o arquivo no armazenamento.

---

### 19.20 Identificação obrigatória da exportação

Toda exportação deverá registrar e, quando aplicável, apresentar:

- Nome do relatório;
- Linha;
- Planta;
- Período;
- Turno;
- Filtros;
- Usuário que gerou;
- Data e hora;
- Fonte;
- Última atualização;
- Versão do mapa;
- Regra de cálculo;
- Status dos dados;
- Identificador da exportação.

Isso deverá permitir reproduzir ou auditar o resultado.

---

### 19.21 Nomenclatura dos arquivos

Utilizar um padrão consistente.

Exemplo:

    Linha360_[Linha]_[TipoRelatorio]_[Periodo]_[DataGeracao]

Exemplo de arquivo:

    Linha360_Vacutainer_PassagemTurno_2026-11-16_Turno2.pdf

Caracteres inválidos deverão ser removidos automaticamente.

---

### 19.22 Auditoria das exportações

O sistema deverá registrar:

- Usuário;
- Data e hora;
- Tipo de relatório;
- Formato;
- Linha;
- Período;
- Filtros;
- Quantidade de registros;
- Destino;
- Resultado;
- Identificador do arquivo;
- Compartilhamento realizado.

Exportações contendo dados restritos deverão possuir nível de auditoria reforçado.

---

### 19.23 Limites de volume

Quando a exportação ultrapassar o limite definido:

1. O sistema deverá informar o volume;
2. Recomendar redução do período ou aplicação de filtros;
3. Permitir processamento em segundo plano;
4. Informar o andamento;
5. Comunicar a conclusão;
6. Disponibilizar o arquivo por período limitado;
7. Registrar falhas;
8. Evitar travar a tela.

O sistema não deverá gerar arquivos incompletos sem informar o usuário.

---

### 19.24 Falhas na geração

Quando ocorrer falha:

- Informar qual relatório falhou;
- Preservar a configuração;
- Permitir nova tentativa;
- Evitar geração duplicada;
- Registrar o erro;
- Informar se algum arquivo foi criado;
- Impedir o compartilhamento de arquivo incompleto.

---

### 19.25 Impressão

A versão para impressão deverá:

- Remover controles desnecessários;
- Ajustar a orientação;
- Manter título e identificação;
- Incluir filtros;
- Incluir legenda;
- Preservar cores com contraste;
- Manter valores numéricos;
- Evitar cortes;
- Identificar a data de geração;
- Identificar dados desatualizados.

A impressão direta deverá ser considerada uma opção rápida, não substituindo relatórios estruturados.

---

### 19.26 Critérios de aceite

A funcionalidade será aceita quando:

1. O usuário conseguir exportar a visão atual;

2. O mapa exportado preservar os elementos visíveis;

3. A legenda estiver disponível;

4. Os filtros estiverem identificados;

5. O período e o turno estiverem identificados;

6. O PDF estiver legível;

7. O Excel separar os conjuntos de dados em abas;

8. Valores numéricos forem exportados como números;

9. As permissões forem respeitadas;

10. Dados restritos não forem expostos;

11. Links internos preservarem o contexto;

12. Links verificarem autenticação e autorização;

13. Relatórios programados registrarem execução;

14. Falhas de geração forem informadas;

15. Exportações forem auditadas;

16. Dados ausentes forem diferentes de zero;

17. O status de atualização estiver disponível;

18. O relatório de passagem de turno permitir observações e confirmação;

19. O relatório da reunião apresentar responsáveis e prazos;

20. O usuário conseguir acessar os registros de origem quando autorizado.
    ## 20. Riscos, dependências e decisões pendentes

A implementação da Linha 360° dependerá da qualidade dos cadastros, da disponibilidade das integrações, da definição das responsabilidades e da validação das regras operacionais.

Esta seção deverá ser utilizada para:

- Identificar riscos antes do desenvolvimento;
- Evitar decisões técnicas baseadas em premissas não validadas;
- Definir responsáveis;
- Registrar dependências;
- Priorizar ações preparatórias;
- Controlar decisões ainda não concluídas;
- Evitar que pendências sejam tratadas como requisitos já aprovados.

---

### 20.1 Classificação dos riscos

Os riscos deverão ser classificados por:

#### Probabilidade

- Baixa;
- Média;
- Alta.

#### Impacto

- Baixo;
- Médio;
- Alto;
- Crítico.

#### Situação

- Identificado;
- Em análise;
- Com plano de mitigação;
- Em tratamento;
- Monitorado;
- Resolvido;
- Aceito.

#### Prioridade

A prioridade deverá considerar a combinação entre:

- Probabilidade;
- Impacto;
- Proximidade;
- Dependência;
- Capacidade de detecção;
- Possibilidade de recuperação.

---

### 20.2 Risco de baixa qualidade do cadastro de equipamentos

#### Descrição

Equipamentos podem apresentar:

- Código ausente;
- Código duplicado;
- Nome inconsistente;
- Linha incorreta;
- Área não definida;
- Equipamento inativo mantido como ativo;
- Componentes sem hierarquia;
- Diferentes identificadores entre sistemas.

#### Impactos possíveis

- Equipamentos duplicados no mapa;
- Falha de integração;
- OEE relacionado ao equipamento incorreto;
- Ordens de serviço sem vínculo;
- Paradas sem localização;
- Histórico inconsistente;
- Dificuldade para aplicar filtros.

#### Mitigação

- Realizar diagnóstico prévio do cadastro;
- Definir identificador oficial;
- Corrigir duplicidades;
- Definir proprietário do cadastro;
- Criar relatório de inconsistências;
- Bloquear importações sem identificador;
- Manter tabela controlada de correspondência entre sistemas;
- Validar os equipamentos antes do posicionamento no mapa.

#### Responsável sugerido

- Engenharia;
- Manutenção;
- Administração da plataforma;
- Tecnologia da informação.

---

### 20.3 Risco de ausência de vínculo entre eventos e equipamentos

#### Descrição

Problemas, paradas, ordens de serviço, checklists ou ações podem existir sem `equipmentId` ou com identificação incompatível.

#### Impactos possíveis

- Mapa de calor incompleto;
- Indicadores por equipamento incorretos;
- Registros não localizados;
- Pareto parcial;
- Perda de rastreabilidade;
- Comparações inválidas.

#### Mitigação

- Tornar o equipamento obrigatório quando aplicável;
- Permitir registro em área ou ponto quando não houver equipamento;
- Criar fila de registros sem localização;
- Disponibilizar correção manual controlada;
- Criar regras de associação automática;
- Auditar alterações;
- Medir o percentual de registros localizados.

#### Indicador recomendado

    Percentual de registros com localização =
    registros com localização válida / total de registros aplicáveis × 100

Meta inicial sugerida para operação estável:

- Mínimo de 95% para paradas;
- Mínimo de 90% para ordens de serviço;
- Mínimo de 90% para problemas operacionais;
- 100% para checklists criados diretamente pela Linha 360°.

As metas definitivas deverão ser aprovadas pelos responsáveis pelos dados.

---

### 20.4 Risco de OEE por equipamento indisponível

#### Descrição

Alguns equipamentos podem não possuir:

- Ponto de medição;
- Contador de produção;
- Sinal de estado;
- Tempo programado;
- Ciclo ideal;
- Registro de qualidade;
- Regra individual de OEE.

#### Impactos possíveis

- Exibição indevida do OEE da linha como OEE individual;
- Comparações incorretas;
- Equipamentos sem indicador;
- Interpretação errada do desempenho;
- Mapa de calor incompleto.

#### Mitigação

- Classificar a disponibilidade de OEE por equipamento;
- Identificar claramente valores herdados;
- Não substituir dados ausentes por zero;
- Não apresentar OEE geral como individual;
- Criar plano de instrumentação;
- Definir quais equipamentos participam do cálculo;
- Validar as regras de cálculo com Produção e Controladoria;
- Informar a fonte e a última atualização.

#### Classificações recomendadas

- OEE individual disponível;
- OEE consolidado disponível;
- OEE herdado da célula;
- OEE herdado da linha;
- Equipamento fora do cálculo;
- Medição não configurada;
- Dados insuficientes.

---

### 20.5 Risco de mapa visualmente sobrecarregado

#### Descrição

A exibição simultânea de equipamentos, pessoas, problemas, OEE, checklists, ordens de serviço, ações e mapa de calor pode tornar a tela difícil de utilizar.

#### Impactos possíveis

- Perda de leitura;
- Dificuldade para localizar itens;
- Baixa adoção;
- Erros de seleção;
- Desempenho reduzido;
- Rejeição pelo usuário.

#### Mitigação

- Utilizar modos de visualização;
- Utilizar camadas;
- Definir camadas padrão por modo;
- Agrupar registros;
- Ajustar detalhes conforme o zoom;
- Manter painéis recolhíveis;
- Exibir exceções prioritárias;
- Disponibilizar a opção **Mostrar somente críticos**;
- Validar o protótipo com usuários de diferentes áreas.

#### Regra

A visão inicial não deverá tentar mostrar todas as informações disponíveis.

---

### 20.6 Risco de baixa precisão no desenho das áreas

#### Descrição

O usuário pode criar:

- Polígono com poucos pontos;
- Área autointersectada;
- Área fora do mapa;
- Sobreposição não intencional;
- Área que corta equipamentos;
- Área diferente da condição física real.

#### Mitigação

- Exibir prévia;
- Permitir zoom durante o desenho;
- Permitir edição dos pontos;
- Bloquear autointerseção;
- Destacar sobreposição;
- Identificar equipamentos parcialmente cobertos;
- Exigir revisão antes da publicação;
- Manter histórico de versões;
- Permitir bloqueio da área após validação.

---

### 20.7 Risco de movimentação acidental

#### Descrição

Equipamentos, áreas, pessoas ou registros podem ser movimentados involuntariamente durante a consulta.

#### Mitigação

- Separar consulta e edição;
- Bloquear arraste estrutural no modo de consulta;
- Utilizar confirmação;
- Permitir desfazer;
- Salvar em rascunho;
- Exigir publicação;
- Registrar auditoria;
- Bloquear elementos validados;
- Solicitar justificativa para alterações críticas.

---

### 20.8 Risco de interpretação incorreta do mapa de calor

#### Descrição

Uma área com maior quantidade de ocorrências pode ser considerada mais crítica mesmo quando os eventos possuem baixo impacto.

#### Mitigação

- Separar quantidade, impacto e índice ponderado;
- Exibir o método utilizado;
- Exibir legenda;
- Permitir normalização;
- Mostrar registros de origem;
- Exibir fatores da pontuação;
- Comparar valor absoluto e taxa;
- Validar pesos;
- Manter versão das regras;
- Disponibilizar explicação curta no ícone de informação.

#### Regra

Nenhum índice ponderado deverá ser apresentado sem permitir consultar os fatores que formaram o resultado.

---

### 20.9 Risco de pesos inadequados no índice de criticidade

#### Descrição

Pesos definidos sem validação podem priorizar incorretamente equipamentos, áreas ou eventos.

#### Mitigação

- Iniciar com uma versão piloto;
- Comparar o índice com avaliações de especialistas;
- Documentar os pesos;
- Manter versão;
- Limitar alterações a usuários autorizados;
- Simular resultados antes da publicação;
- Revisar após período definido;
- Registrar justificativa para mudanças;
- Não utilizar o índice como único critério de decisão.

---

### 20.10 Risco de competências desatualizadas

#### Descrição

A matriz pode apresentar pessoas como habilitadas mesmo quando:

- A validade expirou;
- A pessoa mudou de função;
- O equipamento foi alterado;
- A avaliação não foi concluída;
- A evidência não existe;
- O treinamento não representa a prática atual.

#### Impactos possíveis

- Cobertura falsa;
- Alocação inadequada;
- Risco de segurança;
- Dependência não detectada;
- Decisão incorreta de treinamento.

#### Mitigação

- Definir validade;
- Criar alertas;
- Exigir avaliador;
- Relacionar evidência;
- Revisar após mudanças relevantes no equipamento;
- Suspender competências quando necessário;
- Medir competências vencidas;
- Definir responsáveis por atualização;
- Não considerar competência vencida como cobertura válida.

---

### 20.11 Risco de exposição indevida de dados de pessoas

#### Descrição

A visualização pode apresentar dados pessoais além do necessário para a gestão operacional.

#### Mitigação

- Exibir somente dados profissionais necessários;
- Restringir evidências;
- Controlar exportações;
- Aplicar permissões por perfil;
- Auditar acessos e exportações;
- Evitar informações pessoais sensíveis;
- Definir prazo de retenção;
- Ocultar dados em links compartilhados quando o usuário não possuir permissão;
- Validar o tratamento conforme as políticas corporativas de privacidade.

---

### 20.12 Risco de baixa adoção

#### Descrição

A solução pode ser tecnicamente completa, mas pouco utilizada por:

- Excesso de complexidade;
- Falta de treinamento;
- Dados pouco confiáveis;
- Lentidão;
- Muitos campos obrigatórios;
- Duplicidade de trabalho;
- Falta de responsáveis;
- Falta de integração com a rotina de gestão.

#### Mitigação

- Iniciar pelo MVP;
- Validar protótipos;
- Utilizar os registros oficiais;
- Reduzir campos manuais;
- Criar atalhos;
- Integrar a Linha 360° às reuniões;
- Treinar usuários-chave;
- Medir uso;
- Coletar feedback;
- Corrigir causas de abandono;
- Definir patrocinador funcional;
- Evitar incluir funções sem benefício operacional comprovado.

---

### 20.13 Risco de lentidão

#### Descrição

Grande quantidade de elementos pode comprometer:

- Carregamento;
- Zoom;
- Filtros;
- Agrupamentos;
- Mapa de calor;
- Exportações.

#### Mitigação

- Carregamento progressivo;
- Consulta por período;
- Agrupamento;
- Simplificação por zoom;
- Renderização apenas de elementos visíveis;
- Índices adequados;
- Cache controlado;
- Processamento em segundo plano;
- Testes com volume real;
- Monitoramento de desempenho;
- Limite de elementos simultâneos.

---

### 20.14 Risco de falha de integração

#### Descrição

Uma ou mais fontes podem deixar de responder ou fornecer dados incompletos.

#### Mitigação

- Manter o último dado válido;
- Marcar como desatualizado;
- Exibir a última atualização;
- Isolar falhas por camada;
- Implementar tentativas controladas;
- Monitorar integrações;
- Registrar erros;
- Permitir contingência;
- Evitar duplicidade na retomada;
- Definir responsável técnico por fonte.

#### Regra

A falha de uma integração não deverá tornar toda a Linha 360° indisponível.

---

### 20.15 Risco de conflito entre fontes

#### Descrição

O mesmo equipamento, pessoa ou registro pode apresentar informações diferentes em sistemas distintos.

#### Mitigação

- Definir fonte oficial por campo;
- Definir precedência;
- Manter identificadores;
- Registrar conflitos;
- Criar fila de tratamento;
- Não sobrescrever silenciosamente;
- Exibir a origem;
- Definir responsável pela resolução;
- Auditar correções manuais.

---

### 20.16 Risco de escopo excessivo

#### Descrição

A Linha 360° envolve mapa, OEE, manutenção, qualidade, segurança, pessoas, competências, relatórios e inteligência operacional.

A tentativa de implementar tudo simultaneamente pode provocar:

- Atraso;
- Complexidade;
- Baixa qualidade;
- Reprocessamento;
- Falta de validação;
- Dificuldade para identificar valor entregue.

#### Mitigação

- Seguir as fases definidas;
- Entregar MVP;
- Validar cada fase;
- Bloquear inclusão não aprovada;
- Manter backlog;
- Definir critérios de entrada e saída;
- Não iniciar inteligência avançada sem dados confiáveis;
- Revisar prioridades periodicamente.

---

### 20.17 Dependências obrigatórias para o MVP

Antes do início do MVP, deverão estar disponíveis:

1. Cadastro oficial de linhas;

2. Cadastro oficial de equipamentos;

3. Identificador único dos equipamentos;

4. Relação inicial entre linha e equipamentos;

5. Usuários e autenticação;

6. Perfis e permissões;

7. Local de armazenamento do mapa;

8. Local de armazenamento da imagem da planta;

9. Estrutura de versões;

10. Estrutura de auditoria;

11. Formulário ou módulo oficial de problemas;

12. Integração ou referência para ordens de serviço;

13. Cadastro ou módulo de checklists;

14. Estrutura de ações;

15. Ambiente de homologação;

16. Responsável funcional;

17. Responsável técnico;

18. Usuários-chave para validação.

---

### 20.18 Dependências para OEE e mapa de calor

Antes da Fase 3, deverão estar definidos:

- Fonte de produção;
- Fonte de paradas;
- Fonte de qualidade;
- Cálculo oficial de OEE;
- Meta por linha;
- Meta por equipamento, quando aplicável;
- Equipamentos com medição individual;
- Critérios de parada;
- Ciclo ideal ou referência;
- Categorias de perda;
- Regras de criticidade;
- Pesos;
- Normalização;
- Períodos;
- Frequência de atualização;
- Responsável pela validação dos valores.

---

### 20.19 Dependências para pessoas e competências

Antes da Fase 4, deverão estar definidos:

- Cadastro oficial de pessoas;
- Identificador funcional;
- Funções;
- Turnos;
- Disponibilidade;
- Tipos de competência;
- Escala de níveis;
- Validade;
- Avaliadores;
- Evidências;
- Requisitos mínimos por equipamento;
- Regras de bloqueio;
- Regras de exceção;
- Responsável pela matriz;
- Permissões;
- Regras de privacidade.

---

### 20.20 Decisões funcionais pendentes

As decisões abaixo deverão ser validadas antes da implementação correspondente.

#### Decisão 1 — Quantidade de mapas por linha

Definir se:

- Cada linha possuirá somente um mapa;
- A linha poderá possuir mapas por setor;
- A linha poderá possuir mapas por pavimento;
- A linha poderá possuir mapas por estado futuro e atual.

#### Decisão 2 — Fonte inicial da planta

Definir se o padrão será:

- Imagem carregada;
- Mapa em branco;
- Planta técnica convertida;
- Layout criado manualmente.

#### Decisão 3 — Unidade das coordenadas

Recomendação:

- Utilizar coordenadas relativas entre 0 e 1;
- Converter pixels somente durante a interação.

A equipe técnica deverá confirmar a compatibilidade com a tecnologia escolhida.

#### Decisão 4 — Representação do equipamento

Definir o padrão inicial:

- Ícone;
- Foto;
- Bloco;
- Símbolo técnico;
- Combinação configurável.

#### Decisão 5 — OEE por equipamento

Definir:

- Quais equipamentos possuem OEE próprio;
- Quais herdam da linha;
- Quais não participam;
- Como o valor herdado será exibido;
- Quem aprova o cálculo.

#### Decisão 6 — Sistema oficial de ordens de serviço

Definir:

- Sistema de origem;
- Identificador;
- Campos disponíveis;
- Frequência de atualização;
- Possibilidade de criar solicitação pela Linha 360°;
- Campos que poderão ser editados.

#### Decisão 7 — Sistema oficial de pessoas

Definir:

- Fonte;
- Atualização;
- Campos autorizados;
- Turnos;
- Disponibilidade;
- Ausências;
- Restrições de acesso.

#### Decisão 8 — Fonte da matriz de conhecimento

Definir se será:

- Módulo existente;
- Nova estrutura na plataforma;
- Importação temporária de planilha;
- Integração com sistema de treinamento.

#### Decisão 9 — Níveis de competência

Confirmar se a escala de 0 a 5 será adotada integralmente ou adaptada ao método já utilizado pela empresa.

#### Decisão 10 — Requisitos mínimos

Definir:

- Quem cria;
- Quem aprova;
- Como variam por turno;
- Como variam por produto;
- Quando geram bloqueio;
- Quando geram apenas alerta.

#### Decisão 11 — Sobreposição de áreas

Confirmar:

- Quais categorias podem se sobrepor;
- Quais bloqueiam publicação;
- Como tratar equipamento parcialmente em duas áreas.

#### Decisão 12 — Publicação do mapa

Definir se:

- Editor e publicador deverão ser pessoas diferentes;
- Algumas linhas poderão utilizar publicação direta;
- A revisão será obrigatória;
- Existirá aprovação formal.

#### Decisão 13 — Relatórios programados

Definir:

- Ferramenta de envio;
- Formatos;
- Destinatários;
- Retenção;
- Frequência;
- Permissões.

#### Decisão 14 — Uso em tablet

Definir:

- Modelos corporativos;
- Navegadores;
- Resolução;
- Uso com luvas;
- Necessidade de operação offline;
- Funcionalidades que poderão ser limitadas.

#### Decisão 15 — Retenção dos dados

Definir prazos para:

- Versões;
- Auditoria;
- Alocações;
- Competências;
- Exportações;
- Capturas históricas;
- Logs técnicos.

---

### 20.21 Decisões técnicas pendentes

A equipe técnica deverá definir:

- Tecnologia de renderização do mapa;
- Uso de SVG, Canvas ou outra abordagem;
- Biblioteca para desenho de polígonos;
- Biblioteca para arrastar e soltar;
- Estratégia de zoom;
- Armazenamento das geometrias;
- Uso de banco com suporte espacial;
- Estratégia de cache;
- Atualização em tempo real;
- Processamento do mapa de calor;
- Controle de concorrência;
- Armazenamento dos rascunhos;
- Armazenamento das imagens;
- Geração de relatórios;
- Monitoramento;
- Logs;
- Estratégia de testes;
- Compatibilidade com a arquitetura atual.

As escolhas técnicas deverão considerar:

- Licenciamento;
- Segurança;
- Manutenção;
- Suporte;
- Desempenho;
- Compatibilidade;
- Conhecimento da equipe;
- Capacidade de evolução.

---

### 20.22 Registro das decisões

Cada decisão deverá registrar:

    DecisionRecord
    - id
    - title
    - description
    - category
    - optionsConsidered
    - selectedOption
    - justification
    - impact
    - responsible
    - approver
    - decisionDate
    - reviewDate
    - status
    - relatedRequirement
    - relatedRisk

Estados recomendados:

- Pending;
- UnderAnalysis;
- Approved;
- Rejected;
- Superseded;
- ReviewRequired.

Uma decisão alterada não deverá apagar a decisão anterior.

---

### 20.23 Registro dos riscos

Cada risco deverá registrar:

    RiskRecord
    - id
    - title
    - description
    - category
    - probability
    - impact
    - priority
    - owner
    - mitigationPlan
    - contingencyPlan
    - dueDate
    - status
    - relatedPhase
    - relatedRequirement
    - createdAt
    - updatedAt
    - closedAt

Os riscos deverão ser revisados:

- Antes de cada fase;
- Antes da homologação;
- Antes da publicação;
- Após incidentes relevantes;
- Após alterações de integração;
- Após mudanças no processo.

---

### 20.24 Critérios para início do desenvolvimento

O desenvolvimento deverá iniciar quando:

1. O escopo da fase estiver aprovado;

2. Os critérios de aceite estiverem definidos;

3. As fontes oficiais estiverem identificadas;

4. Os responsáveis estiverem definidos;

5. Os riscos críticos possuírem plano de tratamento;

6. As decisões bloqueadoras estiverem concluídas;

7. O protótipo da fase estiver validado, quando aplicável;

8. As permissões estiverem definidas;

9. O ambiente de homologação estiver disponível;

10. Os dados mínimos para teste estiverem preparados.

---

### 20.25 Critérios para avançar entre fases

Uma fase poderá avançar quando:

1. Os critérios obrigatórios estiverem aprovados;

2. Não existirem erros impeditivos;

3. Os riscos críticos estiverem controlados;

4. A qualidade dos dados estiver dentro do limite aceito;

5. Os usuários-chave tiverem validado os fluxos;

6. A documentação estiver atualizada;

7. As integrações necessárias estiverem estáveis;

8. O desempenho estiver aprovado;

9. As permissões estiverem testadas;

10. O responsável funcional autorizar o avanço.

---

### 20.26 Critérios para interrupção ou revisão

A implementação deverá ser interrompida ou revisada quando:

- A fonte oficial não estiver definida;
- O cadastro de equipamentos não possuir identificadores confiáveis;
- O cálculo do indicador não estiver validado;
- Os dados apresentarem divergência relevante;
- A integração gerar duplicidades;
- A solução não atingir desempenho mínimo;
- As permissões expuserem dados indevidos;
- O protótipo não for compreendido pelos usuários;
- O escopo da fase mudar significativamente;
- Um risco crítico não possuir tratamento.

A interrupção deverá gerar:

- Registro do motivo;
- Impacto;
- Responsável;
- Plano de correção;
- Nova previsão;
- Critério para retomada.

---

### 20.27 Responsáveis mínimos

Deverão ser definidos, no mínimo:

- Patrocinador;
- Proprietário funcional da Linha 360°;
- Responsável pela Operação;
- Responsável pela Manutenção;
- Responsável pela Qualidade;
- Responsável pela Segurança;
- Responsável por Pessoas e competências;
- Responsável pelos dados de OEE;
- Responsável pela plataforma;
- Responsável técnico;
- Responsável pelas integrações;
- Responsável pela homologação;
- Responsável pela publicação dos mapas;
- Responsável pelo suporte.

Uma mesma pessoa poderá exercer mais de uma responsabilidade, desde que isso esteja formalmente definido.

---

### 20.28 Matriz de responsabilidade

Para cada entrega, deverá ser definido:

- **Responsável:** executa a atividade;
- **Aprovador:** responde pela decisão final;
- **Consultado:** contribui antes da decisão;
- **Informado:** recebe a comunicação do resultado.

A matriz deverá abranger:

- Cadastro de equipamentos;
- Desenho das áreas;
- Publicação;
- OEE;
- Mapas de calor;
- Competências;
- Requisitos mínimos;
- Permissões;
- Integrações;
- Relatórios;
- Homologação;
- Suporte;
- Revisão dos riscos.

---

### 20.29 Revisão periódica

Após a implantação, realizar revisão periódica para verificar:

- Qualidade dos mapas;
- Equipamentos sem área;
- Registros sem localização;
- Dados de OEE;
- Pesos de criticidade;
- Uso das camadas;
- Relatórios utilizados;
- Competências vencidas;
- Requisitos mínimos;
- Perfis e permissões;
- Integrações;
- Desempenho;
- Riscos;
- Decisões que precisam ser revistas.

Frequência inicial recomendada:

- Semanal durante o piloto;
- Quinzenal durante a estabilização;
- Mensal após a estabilização;
- Revisão extraordinária após mudança relevante no processo.

---

### 20.30 Critério de encerramento das pendências

Uma pendência somente deverá ser encerrada quando:

1. A decisão estiver registrada;

2. O responsável estiver identificado;

3. A opção selecionada estiver documentada;

4. O impacto nos requisitos tiver sido avaliado;

5. O arquivo de especificação tiver sido atualizado;

6. Os critérios de aceite tiverem sido revisados, quando necessário;

7. A equipe técnica tiver sido informada;

8. Os riscos relacionados tiverem sido atualizados;

9. A aprovação necessária estiver registrada;

10. Não restarem ações sem responsável.
    ## 21. Glossário e padronização dos termos

Esta seção define os termos oficiais utilizados na Linha 360°.

Os mesmos nomes deverão ser utilizados de forma consistente em:

- Interface;
- Formulários;
- Banco de dados;
- Integrações;
- Relatórios;
- Critérios de aceite;
- Documentação;
- Treinamentos;
- Mensagens do sistema;
- Testes.

A equipe técnica poderá utilizar nomes internos diferentes no código, mas os termos apresentados ao usuário deverão seguir este glossário.

---

### 21.1 Linha 360°

Ambiente visual e interativo utilizado para representar a linha produtiva, suas áreas, equipamentos, pessoas, registros e indicadores.

A Linha 360° não é apenas um desenho da planta. Ela funciona como uma camada integrada para consulta, criação, localização e análise das informações operacionais.

---

### 21.2 Mapa

Representação visual completa de uma linha produtiva.

O mapa poderá conter:

- Imagem de fundo;
- Áreas;
- Equipamentos;
- Componentes;
- Pessoas;
- Pontos fixos;
- Registros operacionais;
- Indicadores;
- Camadas;
- Mapa de calor.

---

### 21.3 Imagem de fundo

Imagem utilizada apenas como referência visual da planta ou da linha.

A imagem de fundo não deverá conter os vínculos funcionais dos equipamentos, áreas ou registros. Esses elementos deverão existir separadamente sobre o mapa.

---

### 21.4 Área produtiva

Região delimitada no mapa por um polígono e utilizada para agrupar equipamentos, pessoas, registros e indicadores.

Exemplos:

- Preparação;
- Processo;
- Inspeção;
- Embalagem;
- Utilidades;
- Armazenamento;
- Alimentação de materiais.

---

### 21.5 Polígono

Forma geométrica utilizada para representar o limite de uma área.

O polígono será criado por pontos conectados na ordem em que forem inseridos.

A área será concluída quando:

- O usuário clicar novamente no primeiro ponto; ou
- Utilizar a ação **Fechar área**.

---

### 21.6 Ponto ou vértice

Posição individual utilizada para formar o perímetro de um polígono.

O usuário autorizado poderá:

- Criar;
- Mover;
- Adicionar;
- Remover;
- Reordenar, quando tecnicamente permitido.

---

### 21.7 Camada

Conjunto de informações que pode ser ativado ou desativado no mapa.

Exemplos:

- Equipamentos;
- Pessoas;
- OEE;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Segurança;
- Qualidade;
- Mapa de calor.

---

### 21.8 Modo de visualização

Configuração da Linha 360° que organiza as camadas e os indicadores conforme o objetivo da análise.

Modos previstos:

- Visão geral;
- Operação;
- OEE e perdas;
- Problemas;
- Manutenção;
- Checklists;
- Pessoas e competências;
- Qualidade;
- Segurança;
- Edição do mapa.

Um modo de visualização não deverá ser tratado como outro mapa ou outra página independente.

---

### 21.9 Modo de consulta

Estado utilizado para visualizar e analisar o mapa sem permitir alterações estruturais.

No modo de consulta, o usuário poderá executar apenas as ações operacionais autorizadas, como:

- Criar problema;
- Criar ação;
- Executar checklist;
- Consultar equipamento;
- Aplicar filtros;
- Abrir registros.

Áreas e equipamentos não poderão ser movimentados acidentalmente nesse modo.

---

### 21.10 Modo de edição

Estado reservado aos usuários autorizados para alterar a estrutura do mapa.

Permite:

- Criar áreas;
- Editar polígonos;
- Posicionar equipamentos;
- Alterar imagem de fundo;
- Criar pontos fixos;
- Resolver sobreposições;
- Salvar rascunho;
- Preparar uma nova versão.

Alterações realizadas no modo de edição não deverão modificar diretamente a versão publicada.

---

### 21.11 Equipamento

Ativo industrial existente no cadastro oficial e representado visualmente no mapa.

A Linha 360° não deverá criar um cadastro paralelo de equipamentos.

---

### 21.12 Componente

Parte interna, módulo ou subconjunto de um equipamento.

Exemplos:

- Aplicador;
- Sensor;
- Câmera;
- Esteira;
- Cabeçote;
- Impressora;
- Paletizador;
- Módulo de inspeção.

Um componente poderá possuir registros e indicadores próprios quando houver dados disponíveis.

---

### 21.13 Equipamento principal

Equipamento que agrupa um ou mais componentes ou equipamentos subordinados.

O relacionamento deverá ser utilizado para criar hierarquia, não para duplicar os ativos.

---

### 21.14 Ponto fixo

Local cadastrado no mapa que não representa necessariamente um equipamento.

Exemplos:

- Ponto de inspeção;
- Posto de trabalho;
- Ponto de coleta;
- Saída de emergência;
- Estação de material;
- Local de ferramentas;
- Área de descarte.

---

### 21.15 Registro espacial

Vínculo entre um registro oficial e sua localização no mapa.

Exemplos de registros:

- Problema;
- Ordem de serviço;
- Ação;
- Checklist;
- Parada;
- Desvio de qualidade;
- Risco de segurança;
- Observação;
- Documento;
- Foto.

O registro espacial não deverá duplicar o registro original.

---

### 21.16 Ponto livre

Coordenada do mapa que não está necessariamente relacionada a uma área, equipamento ou ponto fixo.

Poderá ser utilizada quando uma ocorrência estiver relacionada ao espaço físico, mas não a uma máquina específica.

---

### 21.17 Arrastar e soltar

Interação utilizada para mover ou vincular elementos no mapa.

Deverá ser possível arrastar e soltar:

- Equipamentos;
- Pessoas;
- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Outros registros autorizados.

Toda ação de arrastar e soltar deverá possuir alternativa por formulário.

---

### 21.18 Vínculo espacial

Relacionamento entre uma entidade e sua localização.

O vínculo poderá conter:

- Linha;
- Área;
- Equipamento;
- Componente;
- Ponto fixo;
- Coordenadas;
- Vigência;
- Origem;
- Usuário responsável.

---

### 21.19 Vigência

Período durante o qual um posicionamento, vínculo, competência, área ou configuração é válido.

A vigência deverá permitir consultar corretamente a condição existente em uma data anterior.

---

### 21.20 Problema

Condição identificada que exige análise, acompanhamento ou tratamento.

Um problema poderá estar relacionado a:

- Segurança;
- Qualidade;
- Produção;
- Manutenção;
- OEE;
- Custo;
- Ergonomia;
- Meio ambiente.

---

### 21.21 Anomalia

Desvio identificado em relação à condição esperada.

A anomalia poderá ser registrada como um tipo de problema ou como uma etapa anterior à abertura formal de um problema, conforme o padrão adotado pela plataforma.

A equipe funcional deverá definir se problema e anomalia serão registros distintos.

---

### 21.22 Ordem de serviço

Registro oficial utilizado para solicitar, planejar, executar e acompanhar uma atividade de manutenção.

A Linha 360° deverá utilizar o identificador do sistema oficial de manutenção.

A abreviação apresentada ao usuário poderá ser **OS**.

---

### 21.23 Ação

Atividade definida para tratar um problema, risco, desvio, perda ou oportunidade.

Uma ação deverá possuir, no mínimo:

- Descrição;
- Responsável;
- Prazo;
- Status;
- Origem.

---

### 21.24 Checklist

Conjunto estruturado de verificações executadas conforme frequência, equipamento, área, ponto, turno ou condição.

Um checklist poderá gerar:

- Problema;
- Ação;
- Ordem de serviço;
- Desvio de qualidade.

---

### 21.25 Parada

Período em que um equipamento ou linha deixa de produzir conforme a condição programada.

A classificação da parada deverá utilizar a estrutura oficial do módulo de Produção ou OEE.

---

### 21.26 Estado operacional

Condição atual do equipamento.

Estados macro recomendados:

- Produzindo;
- Parado;
- Bloqueado;
- Ocioso.

Subestados e motivos deverão ser tratados nas classificações detalhadas do módulo de origem.

---

### 21.27 OEE

Indicador de Eficiência Global do Equipamento, formado pelos componentes:

- Disponibilidade;
- Performance;
- Qualidade.

A Linha 360° deverá exibir o OEE fornecido pela fonte oficial.

---

### 21.28 OEE individual

OEE calculado especificamente para um equipamento com base em seus próprios dados.

Não deverá ser confundido com o OEE consolidado da linha.

---

### 21.29 OEE herdado

Valor de OEE proveniente de uma célula, agrupamento ou linha e apresentado em um equipamento que não possui cálculo individual.

O sistema deverá identificar claramente a origem do valor herdado.

---

### 21.30 Disponibilidade

Componente do OEE que representa a relação entre o tempo em operação e o tempo programado para produção, conforme a regra oficial adotada.

---

### 21.31 Performance

Componente do OEE que representa o desempenho produtivo em relação ao ritmo ou ciclo de referência oficial.

---

### 21.32 Qualidade

Componente do OEE que representa a proporção de unidades aprovadas em relação ao total produzido, conforme a regra oficial adotada.

---

### 21.33 Meta

Valor de referência aprovado para avaliar o desempenho de uma linha, área, equipamento ou indicador.

A meta deverá possuir:

- Fonte;
- Vigência;
- Responsável;
- Nível de aplicação.

---

### 21.34 Perda

Condição que reduz o resultado esperado da linha ou do equipamento.

Exemplos:

- Parada;
- Microparada;
- Redução de velocidade;
- Scrap;
- Retrabalho;
- Setup;
- Espera;
- Bloqueio;
- Ociosidade.

---

### 21.35 Mapa de calor

Representação visual da intensidade de um indicador sobre áreas, equipamentos, componentes ou pontos.

O mapa de calor poderá utilizar:

- Quantidade;
- Impacto;
- Taxa;
- Percentual;
- Índice ponderado.

---

### 21.36 Quantidade

Número absoluto de registros ou eventos encontrados no período.

A quantidade não deverá ser interpretada automaticamente como impacto.

---

### 21.37 Impacto

Efeito acumulado provocado pelos registros.

Poderá ser expresso em:

- Minutos;
- Unidades;
- Percentual;
- Pontos de OEE;
- Custo;
- Scrap;
- Horas de indisponibilidade.

---

### 21.38 Índice ponderado de criticidade

Pontuação calculada pela combinação de diferentes fatores com pesos configurados.

Exemplos de fatores:

- Quantidade;
- Duração;
- Criticidade;
- Recorrência;
- Perda de OEE;
- Custo;
- Pendências vencidas.

O índice deverá permitir consultar os fatores que formaram o resultado.

---

### 21.39 Normalização

Conversão do valor absoluto em uma taxa comparável.

Exemplos:

- Falhas por hora de operação;
- Problemas por equipamento;
- Paradas por turno;
- Reprovações por checklist executado;
- Scrap por quantidade produzida.

---

### 21.40 Criticidade

Classificação da importância e do impacto de um evento.

Escala recomendada:

- Nível 1: baixo;
- Nível 2: moderado;
- Nível 3: alto;
- Nível 4: crítico;
- Nível 5: extremo.

---

### 21.41 Recorrência

Repetição de eventos equivalentes ou relacionados dentro de determinado período.

A regra de recorrência deverá definir:

- Janela de tempo;
- Categoria;
- Equipamento;
- Área;
- Causa;
- Critério de similaridade.

---

### 21.42 Tendência

Direção de evolução de um indicador em comparação com um período anterior ou uma referência.

A tendência poderá indicar:

- Melhora;
- Estabilidade;
- Piora;
- Dados insuficientes.

O aumento não deverá ser sempre classificado como positivo, pois isso depende do indicador.

---

### 21.43 Pessoa disponível

Pessoa considerada apta a receber uma alocação no período, conforme os dados oficiais de turno e disponibilidade.

Disponibilidade não significa automaticamente que a pessoa possui a competência necessária.

---

### 21.44 Alocação

Relação entre uma pessoa e uma linha, área, equipamento, posto ou atividade durante determinado período.

A alocação poderá ser:

- Planejada;
- Real;
- Temporária;
- Apoio;
- Treinamento;
- Substituição;
- Contingência.

---

### 21.45 Competência

Conhecimento ou habilitação profissional de uma pessoa para executar uma atividade em determinado equipamento ou componente.

A competência deverá ser registrada separadamente por tipo.

---

### 21.46 Tipo de competência

Categoria que identifica a atividade para a qual o conhecimento foi avaliado.

Exemplos:

- Operação;
- Setup;
- Limpeza;
- Inspeção;
- Ajuste;
- Manutenção autônoma;
- Manutenção técnica;
- Qualidade;
- Segurança;
- Instrutoria.

---

### 21.47 Nível de conhecimento

Classificação da autonomia e do domínio da pessoa sobre uma competência.

Escala definida:

- Nível 0: sem conhecimento;
- Nível 1: em treinamento;
- Nível 2: habilitado com acompanhamento;
- Nível 3: habilitado;
- Nível 4: especialista;
- Nível 5: instrutor.

---

### 21.48 Pessoa habilitada

Pessoa que possui:

- Competência exigida;
- Nível mínimo;
- Status válido;
- Habilitação vigente;
- Ausência de restrição impeditiva.

Uma pessoa alocada não deverá ser considerada habilitada sem atender a esses requisitos.

---

### 21.49 Especialista

Pessoa com nível 4 em determinada competência.

O especialista poderá apoiar outras pessoas, mas não será automaticamente considerado instrutor ou avaliador.

---

### 21.50 Instrutor

Pessoa com nível 5 e autorização para treinar, acompanhar ou avaliar outras pessoas, conforme as regras definidas.

---

### 21.51 Requisito mínimo

Quantidade e nível de competências necessários para operar um equipamento ou executar determinada atividade.

O requisito poderá variar por:

- Turno;
- Produto;
- Processo;
- Estado operacional;
- Atividade.

---

### 21.52 Cobertura adequada

Situação em que todos os requisitos obrigatórios de competência e quantidade de pessoas foram atendidos.

---

### 21.53 Cobertura parcial

Situação em que a operação possui parte dos requisitos atendidos, mas ainda existem alertas ou necessidades de acompanhamento.

---

### 21.54 Cobertura insuficiente

Situação em que um ou mais requisitos obrigatórios não foram atendidos.

---

### 21.55 Dependência crítica

Situação em que apenas uma pessoa atende a uma competência considerada necessária ou crítica.

Não significa necessariamente que a operação esteja parada, mas indica risco de continuidade.

---

### 21.56 Matriz de conhecimento

Visão estruturada que relaciona:

- Pessoas;
- Equipamentos;
- Tipos de competência;
- Níveis;
- Validade;
- Status.

---

### 21.57 Rascunho

Versão do mapa que contém alterações ainda não publicadas.

O rascunho poderá ser:

- Editado;
- Validado;
- Enviado para revisão;
- Rejeitado;
- Descartado;
- Publicado.

---

### 21.58 Versão publicada

Versão oficial do mapa disponível para consulta pelos usuários.

Uma versão publicada não deverá ser alterada diretamente.

---

### 21.59 Publicação

Processo que transforma um rascunho validado na versão oficial do mapa.

A publicação deverá registrar:

- Versão;
- Data e hora;
- Editor;
- Publicador;
- Justificativa;
- Alterações;
- Validações.

---

### 21.60 Restauração

Criação de um novo rascunho com base em uma versão anterior.

A restauração não deverá apagar ou substituir silenciosamente as versões posteriores.

---

### 21.61 Auditoria

Registro das operações realizadas na Linha 360°.

A auditoria deverá permitir identificar:

- Quem;
- Quando;
- O que;
- Onde;
- Valor anterior;
- Novo valor;
- Motivo;
- Resultado.

---

### 21.62 Fonte oficial

Sistema, módulo ou cadastro definido como responsável por determinada informação.

Exemplos:

- Equipamentos;
- Pessoas;
- OEE;
- Ordens de serviço;
- Produção;
- Paradas;
- Checklists;
- Competências.

Quando duas fontes apresentarem valores diferentes, deverá prevalecer a fonte oficial definida para aquele campo.

---

### 21.63 Dado atual

Informação recebida dentro do intervalo de atualização esperado para sua fonte.

---

### 21.64 Dado desatualizado

Último valor válido disponível, mas fora do intervalo esperado de atualização.

O sistema deverá apresentar o horário do último dado válido.

---

### 21.65 Dado ausente

Informação que não foi recebida ou não está disponível.

Dado ausente não deverá ser tratado como zero.

---

### 21.66 Dado não aplicável

Informação que não se aplica ao elemento analisado.

Exemplo:

Um equipamento que não participa do cálculo de OEE.

---

### 21.67 Integração indisponível

Situação em que a fonte não está acessível ou não conseguiu fornecer os dados esperados.

A indisponibilidade de uma integração deverá afetar somente os dados dependentes dela, sempre que possível.

---

### 21.68 Contingência

Modo controlado de operação utilizado durante falhas de integração ou indisponibilidade parcial.

Registros criados em contingência deverão possuir origem identificada e ser sincronizados posteriormente.

---

### 21.69 Visualização salva

Configuração armazenada contendo:

- Modo;
- Camadas;
- Filtros;
- Zoom;
- Posição;
- Indicador;
- Mapa de calor;
- Comparação.

A visualização salva não deverá duplicar os dados operacionais.

---

### 21.70 Link dinâmico

Link que preserva o contexto da Linha 360°, mas apresenta os dados atualizados no momento em que for aberto.

---

### 21.71 Captura histórica

Registro que preserva a condição e os valores existentes no momento da geração.

Deverá identificar:

- Data;
- Hora;
- Versão do mapa;
- Filtros;
- Fontes;
- Atualização dos dados.

---

### 21.72 Agrupamento visual

Representação utilizada para reunir vários registros próximos e reduzir a poluição visual.

O agrupamento poderá apresentar:

- Quantidade total;
- Quantidade crítica;
- Tipos de registro;
- Pendências;
- Maior criticidade.

---

### 21.73 Painel contextual

Painel lateral aberto quando um elemento do mapa é selecionado.

O conteúdo deverá variar conforme o tipo de elemento:

- Área;
- Equipamento;
- Pessoa;
- Problema;
- Ordem de serviço;
- Checklist;
- Região do mapa de calor.

---

### 21.74 Card

Componente visual compacto utilizado para apresentar um indicador, meta, tendência ou situação.

O card deverá permitir navegar para os elementos que formaram o resultado quando essa relação estiver disponível.

---

### 21.75 Ranking

Lista ordenada de áreas, equipamentos ou registros conforme um indicador.

Exemplos:

- Equipamentos com maior perda;
- Áreas mais críticas;
- Ordens de serviço mais antigas;
- Equipamentos com menor cobertura.

---

### 21.76 Pendência

Registro que exige tratamento, definição, execução, atualização ou encerramento.

Exemplos:

- Problema sem responsável;
- Ação vencida;
- OS vencida;
- Checklist atrasado;
- Competência vencida;
- Registro sem localização.

---

### 21.77 Alerta

Aviso gerado para destacar uma condição que exige atenção.

O alerta poderá ser:

- Informativo;
- Moderado;
- Alto;
- Crítico;
- Impeditivo.

---

### 21.78 Bloqueio

Regra que impede a conclusão de uma operação enquanto uma condição obrigatória não for atendida.

Exemplos:

- Polígono inválido;
- Falta de permissão;
- Publicação com conflito impeditivo;
- Alocação sem requisito obrigatório;
- Registro sem campo obrigatório.

---

### 21.79 Exceção autorizada

Operação permitida fora da regra padrão mediante:

- Permissão específica;
- Justificativa;
- Identificação do responsável;
- Auditoria;
- Prazo ou condição de validade, quando aplicável.

---

### 21.80 Meta de padronização

Antes da homologação, a equipe deverá validar que:

1. Os termos da interface correspondem ao glossário;

2. Não existem nomes diferentes para a mesma funcionalidade;

3. Siglas possuem explicação;

4. Status são utilizados de forma consistente;

5. Os módulos de origem utilizam relações compreensíveis;

6. Mensagens de erro utilizam os termos oficiais;

7. Relatórios utilizam a mesma nomenclatura;

8. Os testes utilizam os mesmos nomes;

9. Os usuários-chave compreendem os termos;

10. Alterações de nomenclatura foram atualizadas em toda a especificação.
11. ## 22. Diretrizes finais para implementação

Esta seção consolida as regras que deverão orientar o uso desta especificação durante o desenvolvimento da Linha 360°.

O documento deverá ser tratado como a referência funcional da aba, mas não significa que todo o escopo deverá ser implementado simultaneamente.

A implementação deverá:

- Seguir as fases definidas;
- Priorizar o produto mínimo viável;
- Reutilizar os módulos existentes;
- Evitar duplicação de dados;
- Manter rastreabilidade;
- Preservar a experiência atual da plataforma;
- Validar cada entrega com usuários reais;
- Documentar decisões e desvios;
- Evitar alterações não relacionadas ao requisito em desenvolvimento.

---

### 22.1 Uso desta especificação

Antes de iniciar uma alteração, o responsável deverá identificar:

1. Qual seção contém o requisito;

2. Qual fase de implementação está relacionada;

3. Qual prioridade foi definida;

4. Quais módulos serão afetados;

5. Quais fontes de dados serão utilizadas;

6. Quais permissões são necessárias;

7. Quais regras de negócio devem ser respeitadas;

8. Quais critérios de aceite precisam ser testados;

9. Quais riscos e decisões pendentes estão relacionados;

10. Quais funcionalidades não deverão ser alteradas.

Não deverá ser necessário reprocessar ou reimplementar toda a especificação para executar uma alteração pontual.

---

### 22.2 Regra para desenvolvimento por requisito

Cada solicitação de desenvolvimento deverá conter:

- Identificador ou título do requisito;
- Seção de referência;
- Objetivo;
- Escopo da alteração;
- Arquivos ou módulos afetados;
- Comportamento esperado;
- Regras de negócio;
- Critérios de aceite;
- Restrições;
- Testes necessários;
- Itens fora do escopo.

Modelo recomendado:

    Implementar: criação de área produtiva por pontos.

    Referência:
    Seção 3 — Criação e desenho das áreas produtivas.
    Seção 15.3 — Critérios de aceite do desenho de áreas.
    Seção 18.2 — Fluxo de criação da área.

    Escopo:
    - Criar pontos por clique;
    - Conectar os pontos;
    - Fechar ao clicar no primeiro ponto;
    - Disponibilizar o botão Fechar área;
    - Permitir desfazer o último ponto;
    - Validar o polígono.

    Não alterar:
    - Cadastro de equipamentos;
    - Mapa de calor;
    - OEE;
    - Competências;
    - Outras páginas da plataforma.

    Testar:
    - Polígono válido;
    - Menos de três pontos;
    - Autointerseção;
    - Cancelamento;
    - Zoom durante o desenho;
    - Fechamento pelo primeiro ponto;
    - Fechamento pelo botão.

---

### 22.3 Regra para alterações pontuais

Quando a solicitação representar uma mudança simples, o desenvolvimento deverá ser limitado ao componente diretamente afetado.

Exemplo:

    Alteração pontual na Linha 360°.

    Arquivo ou componente:
    Componente responsável pela barra superior.

    Alteração:
    Adicionar o botão Criar área.

    Referência:
    Seção 3.2.

    Regras:
    - Mostrar somente no modo de edição;
    - Exigir permissão de edição de áreas;
    - Manter o padrão visual da plataforma;
    - Não alterar outros botões;
    - Não refatorar componentes não relacionados;
    - Executar apenas os testes diretamente afetados.

Não realizar, sem necessidade comprovada:

- Refatoração geral;
- Mudança de arquitetura;
- Renomeação de componentes;
- Alteração de estilos globais;
- Mudança em outros módulos;
- Substituição de bibliotecas;
- Reestruturação do banco;
- Criação de funcionalidades não solicitadas.

---

### 22.4 Regra de não duplicação

Antes de criar uma estrutura, verificar se a plataforma já possui:

- Cadastro;
- Tabela;
- Componente;
- Serviço;
- Formulário;
- API;
- Permissão;
- Indicador;
- Regra;
- Histórico;
- Repositório de documentos;
- Mecanismo de auditoria.

Quando existir uma estrutura oficial:

- Reutilizar;
- Integrar;
- Estender somente quando necessário;
- Manter o identificador original;
- Evitar cópia dos dados;
- Documentar o vínculo.

Uma nova estrutura deverá ser criada somente quando a necessidade não puder ser atendida adequadamente pelo modelo existente.

---

### 22.5 Regra de preservação dos módulos de origem

A Linha 360° deverá funcionar como uma interface integrada.

Ela não deverá substituir silenciosamente:

- Equipamentos;
- Produção;
- Paradas;
- OEE;
- Manutenção;
- Problemas;
- Ações;
- Checklists;
- Qualidade;
- Segurança;
- Pessoas;
- Competências;
- Documentos.

Cada módulo deverá permanecer responsável pelos seus registros oficiais.

A Linha 360° deverá controlar:

- Áreas desenhadas;
- Coordenadas;
- Posicionamentos;
- Vínculos espaciais;
- Configuração do mapa;
- Camadas;
- Visualizações;
- Versões;
- Preferências;
- Histórico espacial.

---

### 22.6 Regra de alteração dos dados

Sempre que uma ação realizada na Linha 360° alterar um registro operacional:

1. Verificar a permissão;

2. Utilizar o serviço ou fluxo oficial;

3. Aplicar as validações do módulo de origem;

4. Preservar o identificador;

5. Registrar a origem da alteração;

6. Atualizar o vínculo espacial;

7. Registrar auditoria;

8. Informar o resultado ao usuário;

9. Atualizar somente as camadas afetadas;

10. Evitar duplicidade.

A Linha 360° não deverá alterar diretamente dados oficiais contornando as regras dos respectivos módulos.

---

### 22.7 Regra para formulários

Todo recurso criado por arrastar e soltar deverá possuir alternativa por formulário.

Os formulários deverão:

- Preencher automaticamente o contexto conhecido;
- Evitar solicitar novamente informações já disponíveis;
- Exibir somente campos relevantes;
- Indicar campos obrigatórios;
- Validar antes do salvamento;
- Preservar o preenchimento em falhas recuperáveis;
- Informar erros de forma objetiva;
- Permitir cancelar sem gerar registro parcial;
- Respeitar o módulo de origem;
- Funcionar em desktop e tablet, quando aplicável.

Exemplo:

Se um problema for criado sobre um equipamento, preencher automaticamente:

- Linha;
- Área;
- Equipamento;
- Coordenada;
- Data e hora;
- Usuário;
- Origem do lançamento.

---

### 22.8 Regra para arrastar e soltar

Toda interação de arrastar e soltar deverá informar:

- O elemento movimentado;
- O destino;
- A ação resultante;
- Se o destino é válido;
- Se existe alerta;
- Se existe bloqueio;
- Qual vínculo será criado;
- Se haverá impacto em registros existentes.

Nenhuma ação deverá ser concluída com significado ambíguo.

Estados recomendados:

- Verde: destino válido;
- Amarelo: exige confirmação;
- Vermelho: destino inválido;
- Cinza: sem vínculo definido.

Após soltar, o sistema deverá apresentar uma confirmação curta quando a ação gerar alteração relevante.

---

### 22.9 Regra para mapa de calor

Toda implementação do mapa de calor deverá informar:

- Indicador;
- Método de cálculo;
- Período;
- Nível espacial;
- Normalização;
- Escala;
- Intervalos;
- Filtros;
- Fonte;
- Última atualização.

O mapa de calor não deverá:

- Utilizar somente quantidade quando o usuário selecionar impacto;
- Tratar dado ausente como zero;
- Ocultar a regra de cálculo;
- Misturar períodos diferentes;
- Comparar valores não equivalentes;
- Utilizar pesos não aprovados;
- Apresentar cor sem legenda;
- Impedir o acesso aos registros de origem.

---

### 22.10 Regra para OEE

A implementação deverá respeitar:

- O cálculo oficial;
- O mesmo período dos filtros;
- A mesma fonte utilizada nos relatórios oficiais;
- A distinção entre OEE individual e consolidado;
- A identificação de valores herdados;
- A diferenciação entre zero, ausência e não aplicável;
- A meta válida no período;
- A última atualização;
- Os componentes Disponibilidade, Performance e Qualidade.

A Linha 360° não deverá criar um cálculo alternativo de OEE sem aprovação funcional.

---

### 22.11 Regra para pessoas e competências

A implementação deverá separar:

- Pessoa disponível;
- Pessoa alocada;
- Pessoa habilitada;
- Pessoa especialista;
- Pessoa instrutora;
- Pessoa em treinamento.

Uma pessoa:

- Não deverá ser considerada habilitada apenas por estar alocada;
- Não deverá ser considerada disponível apenas por possuir competência;
- Não deverá ser considerada cobertura válida com competência vencida;
- Não deverá receber nível automaticamente por tempo de alocação;
- Não deverá ter sua competência alterada sem avaliação autorizada.

As informações pessoais exibidas deverão ser limitadas ao necessário para a gestão operacional.

---

### 22.12 Regra para permissões

Toda ação deverá possuir validação no servidor.

A ocultação de um botão na interface não deverá ser considerada controle de segurança suficiente.

O sistema deverá validar:

- Usuário;
- Perfil;
- Permissão específica;
- Linha;
- Área;
- Tipo de registro;
- Ação;
- Vigência do acesso;
- Restrições.

Tentativas não autorizadas deverão:

- Ser bloqueadas;
- Apresentar mensagem objetiva;
- Ser registradas quando aplicável;
- Não expor dados restritos;
- Não revelar detalhes técnicos.

---

### 22.13 Regra para rastreabilidade

As operações relevantes deverão registrar:

- Usuário;
- Data e hora;
- Entidade;
- Ação;
- Valor anterior;
- Novo valor;
- Linha;
- Área;
- Equipamento;
- Origem;
- Justificativa;
- Resultado;
- Versão;
- Identificador da transação.

A rastreabilidade deverá ser mantida principalmente para:

- Alteração de áreas;
- Movimentação de equipamentos;
- Vínculos espaciais;
- Alocação de pessoas;
- Alteração de competências;
- Publicação;
- Restauração;
- Exceções;
- Exportações;
- Alterações administrativas.

---

### 22.14 Regra para versões

O mapa publicado deverá permanecer imutável.

Toda alteração estrutural deverá ocorrer em um rascunho.

O ciclo padrão será:

1. Criar rascunho;

2. Realizar alterações;

3. Salvar;

4. Validar;

5. Enviar para revisão;

6. Aprovar ou rejeitar;

7. Publicar;

8. Preservar a versão anterior.

A restauração deverá criar um novo rascunho e nunca apagar o histórico existente.

---

### 22.15 Regra para qualidade dos dados

Antes de utilizar um dado em indicadores, verificar:

- Identificador;
- Origem;
- Atualização;
- Vigência;
- Unidade;
- Período;
- Status;
- Consistência;
- Aplicabilidade.

O sistema deverá diferenciar:

- Zero;
- Ausente;
- Não aplicável;
- Desatualizado;
- Com erro;
- Não configurado;
- Em processamento.

Nenhum desses estados deverá ser convertido silenciosamente em outro.

---

### 22.16 Regra para desempenho

As funcionalidades deverão evitar:

- Recarregar toda a página;
- Recalcular dados não afetados;
- Renderizar detalhes fora da área visível;
- Exibir todos os registros simultaneamente;
- Carregar anexos sem solicitação;
- Executar consultas sem filtro temporal quando houver grande volume;
- Bloquear o mapa durante atualização de uma camada isolada.

Utilizar:

- Carregamento progressivo;
- Agrupamento;
- Simplificação conforme o zoom;
- Atualização parcial;
- Cache controlado;
- Processamento em segundo plano;
- Paginação;
- Consulta sob demanda.

---

### 22.17 Regra para experiência do usuário

A interface deverá manter:

- Mapa como elemento principal;
- Painéis recolhíveis;
- Legenda acessível;
- Contexto preservado;
- Mensagens curtas;
- Ações principais visíveis;
- Detalhes sob demanda;
- Padrão visual da plataforma;
- Alternativa ao uso de cores;
- Alternativa ao arrastar e soltar.

Evitar:

- Textos extensos permanentemente visíveis;
- Excesso de cards;
- Muitos ícones ao mesmo tempo;
- Modais desnecessários;
- Navegação para outra página em ações simples;
- Campos redundantes;
- Cores sem significado documentado;
- Informações técnicas para o usuário operacional.

---

### 22.18 Regra para testes

Cada entrega deverá possuir testes diretamente relacionados ao requisito.

Os testes deverão cobrir:

- Fluxo principal;
- Campos obrigatórios;
- Permissões;
- Erros;
- Cancelamento;
- Dados ausentes;
- Dados desatualizados;
- Falha de integração;
- Persistência após recarregar;
- Auditoria;
- Desktop;
- Tablet, quando aplicável;
- Volume representativo;
- Regressão das funções afetadas.

Não deverá ser necessário executar testes sem qualquer relação com a alteração, salvo quando houver risco real de regressão ampla.

---

### 22.19 Regra para documentação das alterações

Toda implementação deverá atualizar, quando aplicável:

- Especificação funcional;
- Critérios de aceite;
- Modelo de dados;
- Fluxos;
- Permissões;
- Integrações;
- Glossário;
- Registro de decisão;
- Registro de risco;
- Documentação técnica;
- Manual do usuário;
- Histórico de versão.

A documentação deverá refletir o comportamento realmente entregue.

---

### 22.20 Regra para divergências

Quando existir divergência entre:

- Especificação;
- Código atual;
- Protótipo;
- Regra do módulo de origem;
- Fonte oficial;
- Solicitação recente;
- Critério de aceite;

Não implementar por suposição.

O responsável deverá:

1. Registrar a divergência;

2. Identificar as opções;

3. Avaliar o impacto;

4. Consultar o proprietário funcional;

5. Registrar a decisão;

6. Atualizar a especificação;

7. Somente então concluir a implementação.

Correções simples e evidentes de interface poderão seguir o padrão existente, desde que não alterem a regra de negócio.

---

### 22.21 Regra para uso de agentes de desenvolvimento

Quando esta especificação for utilizada por um agente de desenvolvimento, fornecer uma solicitação objetiva.

Modelo recomendado:

    Consulte o arquivo:
    docs/linha-360-especificacao.md

    Implemente somente:
    [descrever uma funcionalidade]

    Seções de referência:
    [informar as seções específicas]

    Arquivos ou componentes:
    [informar quando conhecidos]

    Critérios de aceite:
    [listar os critérios diretamente relacionados]

    Restrições:
    - Não alterar outras páginas;
    - Não refatorar componentes não relacionados;
    - Não criar dados simulados na versão final;
    - Não duplicar cadastros;
    - Não alterar a regra oficial do módulo de origem;
    - Executar somente os testes necessários e os testes de regressão diretamente afetados;
    - Informar os arquivos alterados;
    - Informar os testes executados;
    - Informar qualquer bloqueio ou decisão pendente.

    Resultado esperado:
    [descrever de forma objetiva]

O agente não deverá reescrever toda a especificação na resposta.

---

### 22.22 Formato esperado da resposta do agente

O agente deverá responder de forma objetiva contendo:

- Alteração realizada;
- Arquivos alterados;
- Regra aplicada;
- Testes executados;
- Resultado dos testes;
- Limitações;
- Pendências;
- Decisões necessárias.

Formato recomendado:

    Implementação concluída

    Alteração:
    - Desenho de áreas por pontos;
    - Fechamento pelo primeiro ponto;
    - Validação mínima de três pontos.

    Arquivos alterados:
    - [arquivo 1]
    - [arquivo 2]

    Testes:
    - [teste 1]: aprovado
    - [teste 2]: aprovado
    - [teste 3]: aprovado

    Não alterado:
    - Equipamentos;
    - OEE;
    - Mapa de calor;
    - Outras páginas.

    Pendências:
    - Nenhuma.

Respostas extensas, repetição da especificação e explicações genéricas deverão ser evitadas.

---

### 22.23 Conduta quando houver bloqueio

Quando o agente não conseguir concluir a implementação, deverá informar:

- Etapa bloqueada;
- Motivo;
- Evidência encontrada;
- Arquivo ou integração afetada;
- Impacto;
- Decisão necessária;
- Alternativa segura;
- O que foi concluído;
- O que não foi alterado.

O agente não deverá:

- Inventar uma integração;
- Simular dados oficiais sem identificação;
- Criar campos arbitrários;
- Escolher uma regra de negócio crítica sem aprovação;
- Ocultar falhas;
- Informar conclusão sem validação;
- Desabilitar testes para aprovar a entrega.

---

### 22.24 Definição de pronto

Uma funcionalidade será considerada pronta quando:

1. O requisito estiver implementado;

2. Os critérios de aceite estiverem atendidos;

3. As permissões estiverem funcionando;

4. Os dados estiverem persistidos corretamente;

5. A auditoria estiver disponível quando necessária;

6. Os testes diretamente relacionados estiverem aprovados;

7. A regressão afetada estiver validada;

8. O comportamento em falhas estiver tratado;

9. A experiência estiver validada no dispositivo aplicável;

10. A documentação estiver atualizada;

11. Não existirem erros impeditivos;

12. As limitações estiverem registradas;

13. O responsável funcional tiver validado;

14. A entrega estiver disponível no ambiente definido;

15. O histórico da alteração estiver registrado.

---

### 22.25 Escopo final da Linha 360°

A Linha 360° deverá consolidar, em uma única experiência:

- Representação espacial da linha;
- Desenho das áreas por pontos;
- Posicionamento de equipamentos;
- Identificação automática dos equipamentos dentro das áreas;
- Criação e vinculação de registros;
- Arrastar e soltar;
- Formulários alternativos;
- OEE por equipamento;
- Mapa de calor;
- Quantidade, impacto e criticidade;
- Pessoas e alocação;
- Conhecimento por equipamento;
- Cobertura de competências;
- Pesquisa;
- Filtros;
- Modos e camadas;
- Indicadores;
- Rankings;
- Relatórios;
- Histórico;
- Versões;
- Permissões;
- Auditoria;
- Integrações;
- Gestão de riscos e decisões.

A solução deverá permitir que a gestão identifique:

- Onde está o problema;
- Qual é o impacto;
- Qual equipamento está envolvido;
- Quais registros estão relacionados;
- Quem está atuando;
- Quem possui conhecimento;
- Qual ação está aberta;
- Qual é o responsável;
- Qual é o prazo;
- Qual resultado foi obtido.

---

### 22.26 Resultado esperado

Ao final da implementação, a Linha 360° não deverá ser apenas uma imagem da planta.

Ela deverá funcionar como uma central de gestão visual e operacional capaz de conectar:

- Localização;
- Equipamentos;
- Desempenho;
- Perdas;
- Problemas;
- Manutenção;
- Checklists;
- Qualidade;
- Segurança;
- Pessoas;
- Conhecimento;
- Ações;
- Decisões.

A experiência deverá permitir sair de uma visão geral da linha e chegar ao registro específico que formou um indicador, sem perder o contexto espacial.

A Linha 360° deverá apoiar tanto a operação diária quanto a análise gerencial, preservando a mesma fonte de dados, as mesmas regras e a mesma rastreabilidade.
## 23. Checklist final para entrega ao agente de desenvolvimento

Antes de solicitar a implementação da Linha 360°, verificar se este documento contém:

- Visão geral;
- Objetivo;
- Estrutura da tela;
- Criação das áreas;
- Posicionamento dos equipamentos;
- Registros vinculados ao mapa;
- Mapa de calor;
- OEE por equipamento;
- Pessoas e competências;
- Modos de visualização;
- Pesquisa e filtros;
- Painel de gestão;
- Permissões;
- Integrações;
- Requisitos técnicos;
- Critérios de aceite;
- Fases de implementação;
- Modelo de dados;
- Fluxos operacionais;
- Relatórios;
- Riscos;
- Glossário;
- Diretrizes de implementação.

Antes de cada solicitação ao agente, definir:

1. Funcionalidade que deverá ser implementada;
2. Seções desta especificação relacionadas;
3. Arquivos ou componentes afetados;
4. Critérios de aceite aplicáveis;
5. Testes necessários;
6. Elementos que não deverão ser alterados;
7. Dependências;
8. Permissões;
9. Dados necessários;
10. Resultado esperado.

---

## 24. Prompt-base para o agente de desenvolvimento

Utilize o modelo abaixo para solicitar implementações:

    Consulte o arquivo:
    docs/linha-360-especificacao.md

    Objetivo:
    Implementar somente a funcionalidade descrita nesta solicitação.

    Funcionalidade:
    [informar a funcionalidade]

    Seções de referência:
    [informar as seções específicas do arquivo]

    Arquivos ou componentes diretamente relacionados:
    [informar quando conhecidos]

    Comportamento esperado:
    [descrever objetivamente]

    Critérios de aceite:
    [listar somente os critérios relacionados]

    Regras obrigatórias:
    - Reutilizar os cadastros, serviços e componentes existentes;
    - Não duplicar dados oficiais;
    - Respeitar as permissões;
    - Manter auditoria quando aplicável;
    - Preservar o funcionamento atual;
    - Manter o padrão visual da plataforma;
    - Utilizar os dados reais disponíveis;
    - Diferenciar zero, dado ausente, não aplicável e dado desatualizado;
    - Não alterar regras de negócio sem autorização;
    - Implementar alternativa por formulário quando houver arrastar e soltar.

    Restrições:
    - Não alterar outras páginas;
    - Não refatorar componentes não relacionados;
    - Não trocar bibliotecas sem necessidade;
    - Não criar funcionalidades fora do escopo;
    - Não criar dados simulados na versão final;
    - Não reescrever toda a especificação na resposta;
    - Não executar testes sem relação com a alteração, salvo regressão afetada;
    - Não modificar a versão publicada diretamente.

    Testes:
    [listar os testes diretamente relacionados]

    Resultado esperado:
    [descrever o resultado final]

    Ao concluir, responda somente com:
    - Resumo da implementação;
    - Arquivos alterados;
    - Testes executados;
    - Resultado dos testes;
    - Limitações;
    - Pendências ou decisões necessárias.

---

## 25. Prompt inicial recomendado para o protótipo

Utilize o texto abaixo para iniciar o protótipo da Linha 360°:

    Consulte o arquivo:
    docs/linha-360-especificacao.md

    Crie somente o protótipo visual e navegável da Linha 360°.

    Seções principais de referência:
    - Seção 2 — Estrutura da tela;
    - Seção 3 — Criação e desenho das áreas;
    - Seção 4 — Equipamentos;
    - Seção 5 — Registros vinculados;
    - Seção 6 — Mapa de calor;
    - Seção 8 — Pessoas e competências;
    - Seção 9 — Modos de visualização;
    - Seção 10 — Pesquisa, filtros e interações;
    - Seção 16.7 — Protótipo inicial;
    - Seção 18 — Fluxos principais;
    - Seção 21 — Glossário.

    O protótipo deverá conter:
    - Uma linha produtiva;
    - Uma imagem de fundo ou mapa neutro;
    - Duas áreas produtivas desenhadas por pontos;
    - Cinco equipamentos posicionados;
    - Um equipamento parcialmente sobre duas áreas;
    - Um problema;
    - Uma ordem de serviço;
    - Uma ação;
    - Um checklist;
    - Um ponto de inspeção;
    - Uma pessoa alocada;
    - Uma competência cadastrada;
    - Um painel lateral esquerdo;
    - Um painel contextual direito;
    - Barra superior;
    - Pesquisa;
    - Filtros;
    - Controle de camadas;
    - Modo de consulta;
    - Modo de edição;
    - Exemplo visual de OEE por equipamento;
    - Exemplo simplificado de mapa de calor;
    - Exemplo de cobertura de conhecimento.

    Interações mínimas:
    - Zoom;
    - Movimento do mapa;
    - Seleção de equipamento;
    - Abertura do painel contextual;
    - Troca de modo;
    - Ativação de camadas;
    - Aplicação de filtro;
    - Pesquisa e centralização;
    - Arrastar um equipamento;
    - Arrastar um checklist;
    - Criar uma área por pontos;
    - Fechar a área ao clicar no primeiro ponto;
    - Abrir formulário de cadastro da área.

    Objetivo do protótipo:
    Validar a experiência, a organização visual, as interações e a compreensão da Linha 360° antes da implementação definitiva.

    Nesta etapa:
    - Não criar integrações definitivas;
    - Não alterar módulos existentes;
    - Não criar banco de dados definitivo;
    - Não implementar cálculos oficiais de OEE;
    - Não implementar regras definitivas de competência;
    - Não publicar dados simulados como reais;
    - Identificar claramente todo dado demonstrativo.

    Preserve o padrão visual existente da plataforma.

    Ao concluir, informe:
    - Arquivos criados ou alterados;
    - Interações implementadas;
    - Dados demonstrativos utilizados;
    - Limitações do protótipo;
    - Pontos que exigem validação funcional.

---

## 26. Prompt recomendado para implementação do MVP

Após a aprovação do protótipo, utilize:

    Consulte o arquivo:
    docs/linha-360-especificacao.md

    Implemente somente o MVP da Linha 360° conforme a Seção 16.6.

    Escopo obrigatório:
    - Carregar ou criar o mapa;
    - Criar áreas por pontos;
    - Fechar o polígono;
    - Editar os pontos;
    - Identificar os equipamentos dentro das áreas;
    - Posicionar equipamentos;
    - Salvar rascunho;
    - Publicar uma versão;
    - Selecionar equipamentos;
    - Criar problemas;
    - Vincular ordens de serviço;
    - Posicionar checklists;
    - Criar ações;
    - Criar registros por formulário;
    - Posicionar registros por arrastar e soltar;
    - Pesquisar equipamentos e registros;
    - Aplicar filtros básicos;
    - Consultar detalhes no painel lateral;
    - Manter o histórico das alterações.

    Seções de referência:
    - Seção 3 — Áreas produtivas;
    - Seção 4 — Equipamentos;
    - Seção 5 — Registros;
    - Seção 10 — Interações;
    - Seção 12 — Permissões e governança;
    - Seção 13 — Integrações;
    - Seção 14 — Requisitos técnicos;
    - Seção 15 — Critérios de aceite;
    - Seção 16 — Fases e priorização;
    - Seção 17 — Modelo de dados;
    - Seção 18 — Fluxos;
    - Seção 22 — Diretrizes finais.

    Restrições:
    - Não implementar funcionalidades das Fases 3, 4 e 5;
    - Não criar cálculo alternativo de OEE;
    - Não desenvolver inteligência preditiva;
    - Não criar matriz definitiva de competências;
    - Não alterar páginas não relacionadas;
    - Não duplicar cadastros;
    - Não substituir os módulos de origem;
    - Não publicar dados demonstrativos como reais;
    - Não refatorar componentes sem relação direta com o MVP.

    Antes de alterar o código:
    1. Identifique os componentes existentes que poderão ser reutilizados;
    2. Identifique os módulos oficiais;
    3. Identifique as permissões disponíveis;
    4. Identifique as integrações necessárias;
    5. Identifique as decisões pendentes que bloqueiam a implementação;
    6. Apresente somente os bloqueios reais.

    Ao concluir, informe:
    - Funcionalidades implementadas;
    - Arquivos alterados;
    - Estruturas reutilizadas;
    - Estruturas novas;
    - Migrações necessárias;
    - Testes executados;
    - Critérios de aceite atendidos;
    - Critérios ainda pendentes;
    - Limitações;
    - Próximo requisito recomendado.

---

## 27. Sequência recomendada de solicitações ao agente

Após o protótipo, solicite uma funcionalidade por vez, nesta ordem:

### Solicitação 1 — Base do mapa

Implementar:

- Estrutura da página;
- Imagem de fundo;
- Zoom;
- Movimento;
- Enquadramento;
- Tela cheia;
- Coordenadas relativas.

### Solicitação 2 — Desenho das áreas

Implementar:

- Criação por pontos;
- Fechamento do polígono;
- Edição dos pontos;
- Validação;
- Cadastro da área;
- Cor;
- Categoria;
- Rascunho.

### Solicitação 3 — Equipamentos

Implementar:

- Biblioteca;
- Pesquisa;
- Arrastar e soltar;
- Posicionamento;
- Redimensionamento;
- Rotação;
- Bloqueio;
- Persistência.

### Solicitação 4 — Associação equipamento e área

Implementar:

- Identificação dentro do polígono;
- Equipamentos parcialmente sobrepostos;
- Confirmação;
- Transferência;
- Histórico;
- Vigência.

### Solicitação 5 — Versões

Implementar:

- Rascunho;
- Validação;
- Revisão;
- Publicação;
- Comparação;
- Restauração;
- Auditoria.

### Solicitação 6 — Painel contextual

Implementar:

- Seleção;
- Detalhes;
- Abas;
- Atalhos;
- Histórico;
- Fechamento;
- Preservação do contexto.

### Solicitação 7 — Registros no mapa

Implementar:

- Problemas;
- Ordens de serviço;
- Ações;
- Checklists;
- Pontos livres;
- Vínculos espaciais;
- Formulários.

### Solicitação 8 — Arrastar e soltar registros

Implementar:

- Destinos válidos;
- Destinos inválidos;
- Confirmações;
- Correção de vínculo;
- Histórico;
- Alternativa por formulário.

### Solicitação 9 — Pesquisa e filtros

Implementar:

- Pesquisa global;
- Agrupamento dos resultados;
- Centralização;
- Destaque;
- Filtros;
- Marcadores dos filtros ativos;
- Limpeza;
- Visualizações salvas.

### Solicitação 10 — Modos e camadas

Implementar:

- Visão geral;
- Operação;
- Problemas;
- Manutenção;
- Checklists;
- Qualidade;
- Segurança;
- Controle de camadas.

### Solicitação 11 — OEE

Implementar:

- OEE individual;
- Meta;
- Disponibilidade;
- Performance;
- Qualidade;
- Tendência;
- Valores herdados;
- Dados ausentes;
- Fonte;
- Atualização.

### Solicitação 12 — Mapa de calor

Implementar:

- Quantidade;
- Impacto;
- Índice ponderado;
- Área;
- Equipamento;
- Ponto;
- Normalização;
- Legenda;
- Ranking;
- Detalhamento.

### Solicitação 13 — Pessoas

Implementar:

- Pessoas disponíveis;
- Alocação;
- Realocação;
- Turnos;
- Conflitos;
- Vigência;
- Histórico.

### Solicitação 14 — Competências

Implementar:

- Tipos;
- Níveis;
- Validade;
- Avaliação;
- Evidência;
- Requisitos mínimos;
- Cobertura;
- Dependência crítica;
- Matriz.

### Solicitação 15 — Painel de gestão

Implementar:

- Cards;
- Alertas;
- Rankings;
- Resumo por área;
- Resumo por equipamento;
- Pendências;
- Tendências.

### Solicitação 16 — Relatórios

Implementar:

- Visão atual;
- PDF;
- Excel;
- CSV;
- Passagem de turno;
- Reunião de gestão;
- Links internos;
- Auditoria.

### Solicitação 17 — Inteligência operacional

Implementar somente após estabilização:

- Comparações;
- Correlações;
- Efetividade das ações;
- Alertas avançados;
- Recomendações;
- Evolução histórica.

---

## 28. Prompt para alteração simples

Utilize este modelo quando a mudança for pequena:

    Faça uma alteração pontual na Linha 360°.

    Consulte:
    docs/linha-360-especificacao.md

    Arquivo ou componente:
    [informar]

    Alteração:
    [informar uma única alteração]

    Referência:
    [informar a seção]

    Critérios:
    - [critério 1]
    - [critério 2]
    - [critério 3]

    Não alterar:
    - Outros módulos;
    - Outras páginas;
    - Regras não relacionadas;
    - Estilos globais;
    - Estrutura do banco;
    - Dependências;
    - Funcionalidades fora do escopo.

    Execute somente:
    - Testes diretamente afetados;
    - Regressão do componente alterado.

    Responda somente com:
    - Arquivo alterado;
    - Alteração realizada;
    - Testes;
    - Resultado;
    - Pendências.

---

## 29. Prompt para correção de erro

Utilize:

    Corrija somente o erro descrito abaixo na Linha 360°.

    Consulte:
    docs/linha-360-especificacao.md

    Erro:
    [descrever]

    Comportamento atual:
    [descrever]

    Comportamento esperado:
    [descrever]

    Como reproduzir:
    1. [passo]
    2. [passo]
    3. [passo]

    Evidência:
    [mensagem, imagem, log ou resultado]

    Seções de referência:
    [informar]

    Restrições:
    - Identificar a causa raiz;
    - Não aplicar solução temporária sem informar;
    - Não alterar funcionalidades não relacionadas;
    - Não desabilitar validações;
    - Não remover testes;
    - Não esconder o erro;
    - Não modificar dados oficiais;
    - Preservar compatibilidade.

    Testar:
    - Reprodução do erro;
    - Correção;
    - Persistência;
    - Permissões;
    - Regressão do fluxo afetado.

    Responda somente com:
    - Causa identificada;
    - Correção aplicada;
    - Arquivos alterados;
    - Testes executados;
    - Resultado;
    - Risco residual.

---

## 30. Prompt para revisão técnica sem alteração

Utilize:

    Faça uma revisão técnica da implementação atual da Linha 360°.

    Consulte:
    docs/linha-360-especificacao.md

    Escopo da revisão:
    [informar arquivos, componentes ou funcionalidade]

    Verifique:
    - Aderência à especificação;
    - Duplicação de dados;
    - Reutilização dos módulos existentes;
    - Permissões;
    - Auditoria;
    - Persistência;
    - Desempenho;
    - Acessibilidade;
    - Tratamento de erros;
    - Dados ausentes;
    - Integridade dos vínculos;
    - Riscos de regressão;
    - Cobertura de testes.

    Não altere nenhum arquivo.

    Entregue somente:
    - Problemas encontrados;
    - Severidade;
    - Arquivo ou componente;
    - Impacto;
    - Recomendação objetiva;
    - Requisito relacionado;
    - Ordem recomendada para correção.

---

## 31. Prompt para validar uma entrega

Utilize:

    Valide a implementação realizada na Linha 360°.

    Consulte:
    docs/linha-360-especificacao.md

    Funcionalidade:
    [informar]

    Seções de referência:
    [informar]

    Arquivos alterados:
    [informar]

    Valide:
    - Critérios de aceite;
    - Fluxo principal;
    - Fluxos alternativos;
    - Permissões;
    - Persistência;
    - Auditoria;
    - Erros;
    - Cancelamento;
    - Dados ausentes;
    - Registros duplicados;
    - Desktop;
    - Tablet, quando aplicável;
    - Regressão diretamente afetada.

    Não altere o código durante a validação.

    Classifique cada item como:
    - Aprovado;
    - Reprovado;
    - Parcial;
    - Não testado;
    - Não aplicável.

    Informe:
    - Evidência;
    - Resultado;
    - Erros;
    - Severidade;
    - Critérios não atendidos;
    - Recomendação;
    - Condição para aprovação.

---

## 32. Ordem recomendada de validação com as áreas

A validação funcional deverá seguir:

### Operação

Validar:

- Clareza do mapa;
- Estado dos equipamentos;
- Criação de problemas;
- Checklists;
- Alocação;
- Passagem de turno;
- Facilidade de uso.

### Supervisão

Validar:

- Visão geral;
- Filtros;
- Indicadores;
- Rankings;
- Pendências;
- Priorização;
- Gestão das ações.

### Manutenção

Validar:

- Equipamentos;
- Componentes;
- Ordens de serviço;
- Paradas;
- Falhas;
- Documentos técnicos;
- MTTR;
- MTBF.

### Qualidade

Validar:

- Desvios;
- Produto;
- Lote;
- Scrap;
- Rejeições;
- Checklists;
- Investigações;
- Evidências.

### Segurança

Validar:

- Riscos;
- Pontos críticos;
- Áreas restritas;
- Rotas;
- Inspeções;
- Bloqueios;
- Ações.

### Engenharia

Validar:

- Estrutura da linha;
- Áreas;
- Equipamentos;
- Componentes;
- Fluxo de processo;
- Indicadores;
- Alterações no layout.

### Pessoas e treinamento

Validar:

- Tipos de competência;
- Níveis;
- Avaliações;
- Validade;
- Evidências;
- Requisitos mínimos;
- Cobertura;
- Planos de treinamento.

### Tecnologia da informação

Validar:

- Arquitetura;
- Segurança;
- Permissões;
- Integrações;
- Desempenho;
- Logs;
- Monitoramento;
- Continuidade.

---

## 33. Entregáveis finais do projeto

A implementação completa deverá produzir:

- Página Linha 360°;
- Mapa interativo;
- Editor de áreas;
- Biblioteca de equipamentos;
- Biblioteca de registros;
- Painel contextual;
- Pesquisa;
- Filtros;
- Controle de camadas;
- Modos de visualização;
- OEE por equipamento;
- Mapa de calor;
- Pessoas e competências;
- Painel de gestão;
- Relatórios;
- Controle de versões;
- Permissões;
- Auditoria;
- Monitoramento das integrações;
- Documentação técnica;
- Manual do usuário;
- Casos de teste;
- Evidências da homologação;
- Registro das decisões;
- Registro dos riscos;
- Plano de suporte;
- Plano de treinamento;
- Plano de evolução.

---

## 34. Resumo executivo do escopo

A Linha 360° deverá funcionar como a principal interface visual para gestão da linha produtiva.

A solução deverá permitir:

1. Desenhar áreas produtivas por pontos;

2. Posicionar equipamentos;

3. Identificar automaticamente os equipamentos dentro das áreas;

4. Criar e vincular checklists, problemas, ordens de serviço e ações;

5. Utilizar arrastar e soltar ou formulário;

6. Visualizar OEE por equipamento;

7. Diferenciar OEE individual, consolidado, herdado e indisponível;

8. Analisar quantidade, impacto e criticidade;

9. Utilizar mapa de calor por área, equipamento e ponto;

10. Visualizar pessoas e sua alocação;

11. Relacionar conhecimento e competência a cada equipamento;

12. Identificar lacunas e dependências críticas;

13. Pesquisar qualquer elemento e localizá-lo no mapa;

14. Aplicar filtros integrados;

15. Alternar modos e camadas;

16. Acessar indicadores, rankings e pendências;

17. Manter versões do mapa;

18. Controlar permissões;

19. Registrar auditoria;

20. Gerar relatórios e compartilhar visualizações.

---

## 35. Resultado de negócio esperado

A Linha 360° deverá melhorar:

- Velocidade para identificar problemas;
- Clareza sobre a localização das perdas;
- Priorização das ações;
- Integração entre Operação, Manutenção, Qualidade, Segurança e Engenharia;
- Rastreabilidade;
- Gestão da força de trabalho;
- Visibilidade das competências;
- Cobertura operacional;
- Qualidade das reuniões;
- Passagem de turno;
- Uso dos dados de OEE;
- Acompanhamento das ordens de serviço;
- Disciplina na execução de checklists;
- Gestão dos problemas recorrentes;
- Qualidade das decisões.

O resultado não deverá ser medido somente pela quantidade de funcionalidades desenvolvidas.

O sucesso deverá ser medido pela capacidade de:

- Identificar o local do problema;
- Entender seu impacto;
- Encontrar os registros relacionados;
- Definir o responsável;
- Acompanhar o prazo;
- Verificar o resultado;
- Evitar recorrência;
- Garantir pessoas capacitadas;
- Priorizar corretamente os recursos.

---

## 36. Encerramento da especificação

Este documento define a visão funcional completa da Linha 360°.

A implementação deverá ocorrer em fases, começando pela base espacial e pelos registros operacionais.

A primeira entrega deverá priorizar:

- Mapa;
- Áreas;
- Equipamentos;
- Registros;
- Pesquisa;
- Filtros;
- Painel contextual;
- Rascunho;
- Publicação;
- Histórico.

As funcionalidades de OEE, mapa de calor, pessoas, competências e inteligência operacional deverão ser adicionadas somente após a estabilização da base.

Nenhuma funcionalidade deverá ser considerada concluída apenas por estar visualmente disponível.

A conclusão exige:

- Regra funcional validada;
- Integração correta;
- Persistência;
- Permissão;
- Rastreabilidade;
- Tratamento de erros;
- Testes;
- Documentação;
- Aceite dos responsáveis.

A Linha 360° deverá permanecer evolutiva, permitindo incorporar novas análises e integrações sem perder:

- Clareza;
- Desempenho;
- Governança;
- Rastreabilidade;
- Consistência;
- Simplicidade operacional.
