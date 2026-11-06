# Evidências visuais

Capturas do commit `142b9c2`, em Chromium, com Barlow, Barlow Condensed e IBM Plex Mono carregadas. Os cabeçalhos estão em 1440 px e sem faixa de demonstração acima da barra. As telas principais usam os exemplos fictícios incorporados.

[Voltar ao diagnóstico](../analise-visual.md) · [Medições](medicoes.json) · [Continuidade do tema](continuidade-tema.json)

## Cabeçalhos — comparação nos dois temas

A largura final de exibição no GitHub pode reduzir as imagens. Abrir cada arquivo permite conferir na resolução original. Os temas nas capturas de Paradas refletem o tema do sistema usado na sessão; a divergência na preferência compartilhada está registrada no JSON de continuidade.

### Portal

**Claro**

![Cabeçalho de Portal, claro](portal-light-header-sem-dados.png)

**Escuro**

![Cabeçalho de Portal, escuro](portal-dark-header-sem-dados.png)

### Produção

**Claro**

![Cabeçalho de Produção, claro](producao-light-header-sem-dados.png)

**Escuro**

![Cabeçalho de Produção, escuro](producao-dark-header-sem-dados.png)

### Waste

**Claro**

![Cabeçalho de Waste, claro](waste-light-header-sem-dados.png)

**Escuro**

![Cabeçalho de Waste, escuro](waste-dark-header-sem-dados.png)

### Gestão de Gel

**Claro**

![Cabeçalho de Gestão de Gel, claro](gel-light-header-sem-dados.png)

**Escuro**

![Cabeçalho de Gestão de Gel, escuro](gel-dark-header-sem-dados.png)

### Paradas

**Claro**

![Cabeçalho de Paradas, claro](paradas-light-header-sem-dados.png)

**Escuro**

![Cabeçalho de Paradas, escuro](paradas-dark-header-sem-dados.png)

## Telas principais — exemplos em 1440 px

### Portal

![Portal, tela principal](portal-light-1440-viewport.png)

### Produção

![Produção, tela principal](producao-light-1440-viewport.png)

### Waste

![Waste, tela principal](waste-light-1440-viewport.png)

### Gestão de Gel

![Gestão de Gel, tela principal](gel-light-1440-viewport.png)

### Paradas

![Paradas, tela principal](paradas-light-1440-viewport.png)

## Gestão de Gel — 390 px

Esta captura mostra a margem externa, a concentração de ações e as abas distribuídas em várias linhas.

![Gestão de Gel em 390 px](gel-light-390.png)

## Continuidade do tema

A reprodução usa o tema do sistema claro. O Portal é colocado em escuro pelo botão da interface. Ao abrir Paradas, o fundo volta ao claro. Ao selecionar escuro em Paradas, a chave é gravada com aspas; o Portal deixa de reconhecer a preferência na volta. Os valores exatos estão em [continuidade-tema.json](continuidade-tema.json).
