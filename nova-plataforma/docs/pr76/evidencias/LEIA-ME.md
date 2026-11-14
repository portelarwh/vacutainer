# Evidências da execução

Todos os dados são fictícios. Logs preservados, sem editar resultados.

- build-final.log: build da raiz, TypeScript/Vite e inspeção dos nove motores.
- plataforma-final.log: comando npm run test:all completo, código de saída 0; 31 testes unitários, 75 abas, persistência, versão, fila, descarte, login/permissões e offline.
- raiz-parte1.log, raiz-parte2.log e raiz-parte4.log: 17, 17 e 16 suítes aprovadas, respectivamente.
- raiz-parte3.log: 16 aprovadas e Meta falhou na primeira execução. Causa: o bundle de navegador da SheetJS precisa de set_fs no teste Node.
- meta-reteste.log: a suíte Meta passou após configurar fs. Assim, os 67 testes da raiz têm execução aprovada. O log anterior foi mantido para transparência.

A raiz foi exercitada em quatro partes com VAC_TEST_HTTP=1 e o preload testes/http-local.cjs. Isso não substitui file://, SMB nem duas estações. O teste da plataforma também registra explicitamente a abertura file:// como NÃO VERIFICADO neste ambiente.
- unitarios-ci-final.log: 31 testes aprovados novamente após ajustar o CI para instalar o Chromium pela versão de Playwright da própria plataforma (raiz e plataforma têm versões distintas).
