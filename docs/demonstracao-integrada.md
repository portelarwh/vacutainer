# Demonstração integrada

Entrega de 09/11/2026, a partir de `8f952ba`. Antes, sete páginas tinham exemplos independentes; Projetos só mostrava as abas planejadas. Agora todas têm uma entrada comum **▶ Demonstração** na barra superior.

## Como experimentar

1. Copie os HTML de `paginas/`, incluindo **Demonstracao.html**, para a mesma pasta. Não é necessário conectar bases para demonstrar.
2. Abra o Portal (ou outra página) no Chrome/Edge atualizado e clique em **▶ Demonstração**. Também pode abrir `Demonstracao.html` diretamente.
3. Navegue pela barra escura. A faixa roxa identifica o cenário fictício em todas as páginas. Crie ações, consulte ordens, explore relatórios e volte às outras páginas.
4. **Reiniciar** restaura o cenário de todas as páginas. **Sair da demonstração** volta ao arquivo pelo qual você entrou.

As alterações do exemplo duram enquanto esse arquivo de demonstração permanecer aberto. Recarregar, fechar ou abrir outra guia começa uma demonstração nova. Downloads que você pedir continuam sendo arquivos locais: os números apresentados são fictícios. Bibliotecas opcionais de Excel/PDF mantêm as dependências existentes em `lib/`; não foram acrescentadas bibliotecas remotas.

## O que está integrado

- Ordem **100234567**, lote **6275187** e LP **40178250001** como referências para a ficha comum e a busca Ctrl K.
- Produção, plano, perdas, gel e paradas com dados sintéticos.
- Parada **DEMO-EV-1**, uma ação do Planner e uma OS relacionadas por referências.
- Ação encaminhada de Paradas para Iniciativas, persistida no cenário, aparece no Portal e na ficha da ordem depois de navegar.
- Cadastro, usuário e preferências próprios do exemplo. A edição do cadastro pelo Portal fica no cenário.
- **Projetos** participa da navegação e da ficha comum; suas abas continuam explicitamente em construção. Não foram inventados projetos, procedimentos técnicos de AM/TPM, regras MES ou importações de OSM ainda não implementados.

Não é uma homologação dos equipamentos, números ou regras da linha. Os exemplos locais antigos continuam disponíveis como funções para os testes legados; os botões de entrada da interface passam a abrir a demonstração comum.

## Implementação e isolamento

`paginas/Demonstracao.html` reúne as oito páginas reais, comprimidas, e as apresenta uma por vez. O cenário compartilhado vive na memória do documento principal. Assim a navegação também funciona abrindo o arquivo diretamente (`file://`), sem depender de armazenamento compartilhado entre arquivos, de servidor ou de API. Os dados não são enviados à rede.

O kit é instalado antes do código de cada página. Durante a demonstração, o `localStorage` da página aponta para o cenário, as aberturas do IndexedDB recebem um prefixo exclusivo e o seletor de pasta real fica indisponível. O início demonstrativo ocorre antes da leitura dos handles e bases operacionais. Os modos de edição existentes (`teste`, `exemplo` e backend de memória do Gel) são reutilizados. As cópias isoladas de preferências no IndexedDB podem permanecer no navegador, sem serem usadas pela próxima sessão. Cada módulo publica apenas seus próprios dados; consultas de outros módulos usam seus `exports`, como na operação normal. Cadastros são editados pelo Portal.

Não é uma barreira de segurança para código arbitrário executado no console. É isolamento do fluxo normal do sistema, verificado por teste com sentinelas e instrumentação das APIs de arquivo e IndexedDB.

### Fontes e geração

- `fontes/kit/kit_demo.js`: cenário, armazenamento isolado, entrada/saída, navegação e faixa comum.
- `fontes/kit/demo_cenario.json`: somente dados fictícios, baseados nos geradores locais existentes. Datas são deslocadas para o dia da demonstração.
- `fontes/demo/demonstracao.html`: documento que apresenta as páginas e mantém a sessão.
- `fontes/demo/gerar_demo.py`: empacotamento determinístico; não inclui o próprio pacote entre as páginas.
- Adaptadores de inicialização/publicação em cada página; Produção exclusivamente por `fontes/producao/`; Projetos pelo modelo.

Na raiz do repositório, depois de alterar fontes ou páginas:

```sh
python fontes/kit/aplicar_kit21.py
python fontes/producao/build.py
python fontes/modelo/gerar_paginas.py
python fontes/demo/gerar_demo.py
node testes/tdemo.js
```

**O empacotamento da demonstração deve ser o último build.** Se atualizar uma página sem refazê-lo, o exemplo continuará apresentando a versão anterior embutida. O pacote também deve ser copiado durante a atualização da pasta da linha.

## Validação

`testes/tdemo.js` percorre as oito páginas pelo menu, consulta a ficha da ordem, entra em uma aba de Projetos, encaminha uma ação de Paradas para o Planner e a reencontra no Portal e na ficha. Confere a navegação pela busca, a conservação da ação ao voltar, reinício, saída, entrada nas oito páginas e larguras de 1440/390 px.

O teste compara o armazenamento real antes/depois, preserva uma pendência sintética no IndexedDB, registra os nomes de bancos abertos e instrumenta acessos a arquivos. A comparação ignora apenas os sinais temporários `vac.aba.*`, removidos normalmente quando a página operacional é fechada. Os resultados e limites da execução desta entrega ficam em `docs/auditorias/demonstracao-2026-11-09.md`.
