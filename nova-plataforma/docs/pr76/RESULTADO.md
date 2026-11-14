# Resultado da revisão PR76

**Pronto para homologação; corte não executado.** A plataforma é o produto único. Foram corrigidos os itens 1 a 8, preparados guia e roteiro do item 9 e aplicados A3/A4, M1, M3, M6, I1 e M5. Nenhuma base real foi acessada. Nenhum motor foi reescrito em React e nenhuma regra de negócio pendente foi criada.

## Origem da entrega

Artefato: `nova-plataforma/dist/Plataforma.html`. Motores e fontes compilados no commit **38b342340fb9e0d2f908b0109a358d0017937546**, com `dirtySources: []` no manifesto. Inclui os nove módulos, com Linha 360°. O snapshot 0769376 foi eliminado do build.

## Commits por item

| Item | Commit inicial | Resultado |
|---|---|---|
| 1 | 1e418de | Motores da árvore atual, depois do build da raiz; manifesto e hashes. |
| 2 | 26ee3cb | Versão futura impede escrita; inclui arquivos auxiliares. |
| 3 | 76bc81f | Sessão vacLogin e vacTravas; sem seleção de identidade sem senha. |
| 4 | dd9bae5 | Contrato vacPagina sem eval na ponte; consulta de pendência falha fechada. |
| 5 | 8f80a53 | Abas e comandos publicados pelo motor; sem lista paralela. |
| 6 | 6e33b3b | Identidade persistente das pastas e consulta da fila durável. |
| 7 | 3635374 | Portal e relatórios usam sev 1 urgente, sev 2 atenção. |
| 8 | 3047cf8 | CI mantém quatro partes da raiz e acrescenta a plataforma; bases fictícias atuais. |
| 9 | 5daedc8 | Guia, demonstração do produto e roteiro de corte/retorno; não executado. |
| A3/A4 | 93a100c | Rolagem unificada e filtro do próprio motor na Produção. |
| M1 | 145523d | Cadastro e eventos canônicos compartilhados. |
| M3 | 84f7af1 | Bibliotecas sob demanda, configuração em effect e descarte. |
| M6 | cd82fa7 | Verificação dentro dos motores comprimidos. |
| I1 | fbf6c72 | Tokens oficiais do Design System. |
| M5 | da91327 | Ctrl+P e botão imprimem o módulo ativo. |

bf562b8 compartilha a mesma SheetJS local com os testes da raiz. 38b3423 fecha os ajustes encontrados na validação: conexão anunciada após leitura, modais longos, descarte antes da perda do ref, navegação interna, proteção dos arquivos auxiliares e testes adicionais.

## Testes e evidências

- **31 testes unitários da plataforma:** passaram.
- **75 abas dos nove motores:** navegadas sem erro de rota/JavaScript; rotas comparadas com a casca.
- **Oito módulos com base:** abrir, gravar e reler preservou todas as chaves de exports e appVersion. Produção preservou suas 29 chaves atuais. Escrita recusada em oito bases futuras e sem sessão válida.
- **Integração:** A → B → A preservou escopo, preferências e fila; troca bloqueada sem módulo aberto; falha de consulta também bloqueou. Oito motores descartaram timers/observers ao trocar de pasta.
- **Login/permissões:** tlogin e tpermissoes passaram dentro da plataforma. Ctrl+P e botão imprimiram o módulo ativo.
- **Offline/layout:** ação fictícia persistiu durante a navegação; ficha da ordem, importações, relatórios, temas e 390 px passaram. Sem erros de JavaScript ou requisições externas.
- **67 testes da raiz:** todos têm execução aprovada via HTTP local. Na parte 3, Meta falhou inicialmente por falta de fs no adapter Node da distribuição SheetJS; após a correção, o reteste passou. Os logs originais e o reteste foram preservados.

Arquivos: [evidências](evidencias/LEIA-ME.md), [acompanhamento por item](ACOMPANHAMENTO.md), [validação](../VALIDACAO.md), [contrato público](../CONTRATO-MOTORES.md).

## NÃO VERIFICADO

Abertura file:// no Chrome/Edge corporativo, pasta SMB e concorrência entre duas estações. O Chromium deste ambiente bloqueia file:// por política; a validação de navegador usou o mesmo HTML por HTTP local, sem alterar essa política. Impressora física e Outlook corporativo também dependem de conferência na estação.

A aprovação desses pontos e o aceite do responsável são condições para executar [o corte](../CORTE.md). Não retirar os HTML da pasta real antes disso. A conversão para React fica para outra rodada, por tela e com paridade comprovada.
