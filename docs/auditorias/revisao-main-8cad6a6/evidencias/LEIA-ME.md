**Evidências da revisão de 8cad6a6 — 08/11/2026**

Os 192 arquivos versionados foram copiados de uma worktree limpa do commit para `/workspace/verificacao-main-8cad6a6`. O manifesto inicial guarda seus hashes. A aplicação original permaneceu intacta. Dados de teste não são bases da rede real.

| Arquivo | Conteúdo |
|---|---|
| manifesto-inicial.json | SHA e hashes dos arquivos antes da revisão |
| executar-suites.py / suites.json / t*.log | 16 suítes originais, seus resultados, tempos, checagens e logs |
| adaptador-browser.cjs | Chromium do ambiente e substituição externa de file:// por HTTP local |
| verificar-adicional.cjs / verificacao-adicional.json / .log | AT-01–09, incluindo repetição para as duas páginas quando aplicável |
| verificar-fluxos.cjs / fluxos.json / .log | AT-10–12, janela de reconferência de operações e carga XLSX offline |
| verificar-telas-novas.cjs / telas-novas.json / .log | 56 cenas de abas/detalhe/formulário, duas larguras e dois temas |
| build.json | Três geradores em cópia separada e lista de diferenças vazia |
| capturas/ e form-*-390.png | Capturas dos testes atuais para inspeção visual |
| verificacao-final.json | Conferência de integridade e resumo do escopo efetivamente executado |

Os códigos de saída das suítes originais indicam aprovação segundo os critérios delas. A contagem 656 é de linhas `ok`, não uma contagem de bugs ou de casos de teste independentes. O teste tpg só imprime resultados e erros de execução. tmeta não foi executado por ausência do pacote Node xlsx.

Os scripts adicionais são scripts de reprodução: o campo `defeito_reproduzido:true` significa que o comportamento descrito ocorreu. Código zero significa que o script concluiu, não aprovação do produto. Eles gravam JSON/log e alteram somente armazenamento temporário de navegador com dados fictícios. O script de fluxo usa um link javascript benigno que apenas atribui 1 a uma variável para demonstrar AT-11; não transmite dados nem acessa arquivos reais.

O adaptador é externo aos testes do repositório. Seleciona `/usr/bin/chromium` com no-sandbox no executor isolado e serve os mesmos arquivos por HTTP local, necessário pelo bloqueio de file:// neste navegador. Isso não faz parte da implantação do sistema. Parte das suítes já serve arquivos por HTTP e simula pastas via OPFS.

Para reproduzir neste ambiente:

```sh
python /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/executar-suites.py
node --require /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/adaptador-browser.cjs /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/verificar-adicional.cjs
node --require /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/adaptador-browser.cjs /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/verificar-fluxos.cjs
node --require /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/adaptador-browser.cjs /workspace/auditoria-vacutainer-atual-8cad6a6/evidencias/verificar-telas-novas.cjs
```

Em outro ambiente, ajuste uma cópia dos caminhos absolutos, Node/Playwright e Chromium; use o código do SHA informado e uma pasta separada. Os resultados são substituídos numa nova execução, portanto preserve os originais da revisão. O runner usa GIT_DIR apenas para testes que consultam versões históricas; nunca executa mutações Git.

Os builds foram executados em `/tmp/vac-build-check-8cad6a6`, separadamente das suítes, para que os testes não verificassem um HTML diferente do publicado. Não se executou instalação de dependências nem se forneceu a biblioteca SheetJS ausente. A falha offline está registrada como dependência E3b, não como descoberta de ausência na pasta real.

R-01 foi verificado na função de retenção. Não houve teste físico de duas estações nem reprodução de corrida tardia em uma pasta SMB. Use o roteiro de homologação para isso.
