# Entrega N1–N6 · PR #76

Implementada e testada com dados fictícios. Nenhuma base real foi acessada. Formatos das bases preservados; motores continuam nas fontes atuais. N7 fica para o branch do outro agente, depois do merge. Corte e merge não executados.

## Correções

| Item | Commit inicial | Entrega |
|---|---|---|
| N1 | 1faf509 | Conta própria com transação temporária, validação da fila e do documento inteiro, backup e confirmação física por releitura. Consulta não ganha permissão para outros dados. |
| N2 | 21e7b33 | Regra única em fontes/kit/permissoes.mjs, importada pela casca e incorporada nos motores. Ausência/false/true seguem o kit; linha usa equip. |
| N3 | ca9939d | Três arquivos do guia operacional iguais à main 7c3f064. Guia auxiliar separado com capturas reais e procedimento de retorno. |
| N4 | d81bb71 | Oito bases preenchidas pelos adaptadores atuais; comparação integral na conexão e após alteração real, incluindo exports e preservação do histórico. |
| N5 | 258e54c | sourceRevision + enginesSha256; gzip determinístico, dois builds comparados e CI recusando dist desatualizado. |
| N6 | cad2a29 | Indicadores em pílulas, separadores, aviso único e rolagem das abas com indicação lateral e aba ativa visível. |

A suíte completa detectou uma chamada de permissão antes de seu script carregar no Waste/Gel. A correção d0e9c6e incorpora a regra comum no head antes do código dos motores. O commit 352452b fecha rótulos estáveis das abas, histórico completo no CI e o vínculo EQ03 do cenário fictício. Não altera cálculos de produção.

## Artefatos e origem

- Aplicativo: [dist/Plataforma.html](../../../dist/Plataforma.html).
- Guia auxiliar: [dist/Instalacao-Plataforma.html](../../../dist/Instalacao-Plataforma.html).
- Manifesto: [src/generated/manifest.json](../../../src/generated/manifest.json).
- `sourceRevision`: `352452baf24585da35692941579c244132b493b2`; `dirtySources: []`.
- `enginesSha256`: `b30ed051363b8b5f15bfad2e0778eaa97b76f1ba8a33c9e0029d37aa48410360`.
- SHA-256 do aplicativo: `82477f31a943e6e7f6084296b044032cf4efc3e9ccff536a2f43ef840735e452`.

O hash do pacote é calculado sobre engines.json + byte NUL + libraries.json. O commit de publicação de artefatos não muda a identificação das fontes. Checkout raso é recusado; o CI busca histórico completo. As imagens do guia são versionadas e a composição do HTML é determinística; alterações na interface exigem renovar as capturas explicitamente.

## Verificação

| Verificação | Resultado e evidência |
|---|---|
| Suíte atual da raiz | 67 suítes aprovadas, em [parte 1](raiz-parte1.log), [parte 2](raiz-parte2.log), [parte 3](raiz-parte3.log) e [parte 4](raiz-parte4.log). |
| Últimos ajustes de rótulo/vínculo | Design, demonstração e segurança/build [reexecutados e aprovados](raiz-afetados.log). |
| Plataforma completa | [Execução aprovada](plataforma-final.log): 39 testes unitários, contrato nos nove motores e 75 abas navegadas. |
| Preservação das bases | Oito bases preenchidas; comparação do documento inteiro, alteração real, gravação física e releitura. Sessão ausente e oito versões futuras bloqueiam gravação. |
| Login e permissões | Senha/autocadastro do Consulta gravados e relidos; alteração de turno, fila mista e adulteração rejeitadas. 315 comparações da regra comum e suites tlogin/tpermissoes dentro da plataforma. |
| Pasta e recursos | A → B → A conserva escopo/fila/preferências; pendência durável bloqueia troca sem módulo aberto; oito motores descartam recursos. |
| Tela e abertura | 390/1440 px; aviso único, separadores e aba ativa inteira. Nove páginas nativas em consulta e demonstração: 18 aberturas sem erro. Demonstração da plataforma funcional offline. |
| Build | [Dois builds finais com todos os artefatos idênticos](reprodutibilidade-final.log). Guia operacional conferido byte a byte contra a main. |

A automação local usa Chromium e HTTP em 127.0.0.1 para transportar o mesmo HTML, com OPFS fictício nos testes de pasta. Isso não substitui a homologação abaixo.

## Como conferir

Em checkout com histórico completo e dependências instaladas:

```sh
npm run build --prefix nova-plataforma
npm test
npm run test:all --prefix nova-plataforma
npm run test:reprodutibilidade --prefix nova-plataforma
git diff --exit-code nova-plataforma/src/generated/ nova-plataforma/dist/
```

Se o ambiente bloquear file://, a alternativa local da suíte da raiz é `VAC_TEST_HTTP=1 NODE_OPTIONS="--require ./testes/http-local.cjs" npm test`. Não altera a política do navegador.

Para examinar cada correção, leia [LEIA-ME.md](LEIA-ME.md), os testes citados e os logs antes/depois nesta pasta. Contrato: [CONTRATO-MOTORES.md](../../CONTRATO-MOTORES.md). Instalação e retorno: [CORTE.md](../../CORTE.md).

## Não verificado

Abertura direta file:// no Chrome/Edge corporativo, SMB, duas estações simultâneas, perda real de rede/permissão, impressora física e Outlook corporativo. Dependem do ambiente da linha. Nenhuma migração ou homologação em bases reais foi executada.
