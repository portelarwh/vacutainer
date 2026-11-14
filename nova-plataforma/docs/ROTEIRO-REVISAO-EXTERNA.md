# Roteiro de auditoria externa · Nova plataforma

Publicação: branch `codex/nova-plataforma-unificada`, criada sobre a main `7c3f064fbc17227827172a78e393864646ed7deb`.

Pedido do responsável: avaliação técnica independente, com verificação de qualidade, completude e oportunidades de melhoria. Esta publicação disponibiliza a implementação e este roteiro para revisão; não substitui o aplicativo em uso.

## Objetivo e contexto

Avalie a pasta `nova-plataforma/` do repositório `portelarwh/vacutainer`. A plataforma deve funcionar sem API e sem servidor interno:

- Um único `Plataforma.html`, aberto pelo Chrome/Edge.
- Bases JSON e backups na pasta compartilhada.
- Fonte organizada em TypeScript, React e Vite, extensível a novos módulos.
- Cadastros e regras mantidos no Portal.
- Integração por ordem, equipamento, data e turno.

A entrega atual reconstrói a interface principal e incorpora os motores existentes em ambientes `iframe/srcdoc`. **Não é uma reescrita integral das telas e motores em React.** Avalie se essa escolha atende à necessidade, suas limitações e a ordem recomendada de conversão para componentes nativos. Não recomende reescrita só por preferência tecnológica.

Não aceite automaticamente afirmações da documentação nem trate a abertura de uma aba como prova de completude.

## Material e origem

Leia primeiro, nesta pasta:

- [README](../README.md)
- [Arquitetura](ARQUITETURA.md)
- [Validação e limites](VALIDACAO.md)

Implementação:

- `src/App.tsx`
- `src/core/runtime.ts`
- `src/core/data.ts`
- `src/core/modules.ts`
- `src/components/ModuleFrame.tsx`
- `src/components/ui.tsx`
- `src/style.css`

Build:

- `scripts/package-engines.mjs`
- `scripts/check-build.mjs`
- `src/generated/manifest.json`
- `package.json`, `package-lock.json`, `vite.config.ts` e `vendor/`

Artefato: [dist/Plataforma.html](../dist/Plataforma.html).

Os motores agora vêm da árvore atual após o build da raiz, incluindo Linha 360°. Verifique `src/generated/manifest.json`: commit de compilação, último commit das fontes, arquivos sujos, versões e SHA-256. Não aceite o snapshot antigo 0769376 como prova de paridade.

Leia a correção da revisão em [pr76/ACOMPANHAMENTO.md](pr76/ACOMPANHAMENTO.md) e o [roteiro de corte](CORTE.md). O produto passa a ser a plataforma única; os HTML em paginas/ são fontes e referências dos testes. O corte continua pendente de homologação.

## 1. Completude funcional

Verifique jornadas completas:

- Importar → conferir prévia → gravar → reler.
- Registrar produção, parada e scrap.
- Criar, alterar e acompanhar uma ação.
- Abrir uma ordem e navegar entre seus vínculos.
- Consultar equipamentos, OS e TAGs.
- Gerar relatórios, Excel, PDF e impressão.
- Navegar preservando formulários e alterações pendentes.

Procure comandos que ficaram inacessíveis ao ocultar os cabeçalhos e menus antigos. Diferencie funcionalidade nova, funcionalidade preservada pelo motor antigo, integração parcial e pendência real. Projetos não deve ser considerado funcional só porque seu esqueleto abre.

## 2. Persistência e isolamento

Confira:

- Conexão dos módulos à pasta selecionada e uso de `00. Bases`.
- Namespace de cache, IndexedDB e preferências.
- Troca de pasta, inclusive pastas homônimas.
- Restauração da conexão após recarregar.
- Falhas de leitura, JSON inválido e versões desconhecidas.
- Pendências, rascunhos, fechamento do navegador e recuperação.
- Gravação simultânea e confirmação por releitura.
- Autoria após troca de usuário.
- Isolamento entre demonstração e operação real.

A integração conserva os mecanismos originais ou cria caminhos que os contornam? Há casos em que uma edição pendente não é identificada? Existe alguma hipótese de escrever na pasta errada?

## 3. Dados, cálculos e períodos

Confira ausência versus zero, códigos textuais, OEE sem média simples de taxas, janela realmente aplicada e filtro de turno correspondente ao indicador/tela. Verifique cobertura, atualização e coerência entre painel, relatório e fonte.

Waste continua mensal; estoque e fila são posições atuais. Não devem parecer históricos diários. Não invente atribuição de madrugada, jornada ampliada ou fórmula de “OEE real”; identifique decisões ainda necessárias.

## 4. Runtime e arquitetura

Analise criticamente:

- Ponte entre aplicativo e módulos.
- `eval`, serialização de funções e substituições de texto.
- Links, hashes, histórico, Ctrl K e `window.open`.
- Acesso ao sistema de arquivos dentro dos frames.
- Bibliotecas compartilhadas e execução offline.
- Memória com vários módulos abertos.
- Timers, listeners e observadores sem descarte.
- Erros capturados que possam ficar escondidos.
- Facilidade de acrescentar um módulo nativo em React.

Sugira simplificações concretas que reduzam risco e manutenção.

## 5. Interface e acessibilidade

Teste desktop e tela estreita, nos dois temas: hierarquia, legibilidade, rolagem do aplicativo/módulos, teclado, foco/fechamento de diálogos, contraste, estados de carregamento, mensagens de erro, Resumo/Detalhado, nomes, filtros e unidades.

Avalie o uso por operador, liderança, PCP, qualidade e manutenção. Não use apenas a captura inicial como evidência.

## 6. Build e distribuição

Confira se o HTML é independente de CDN, arquivos JS/CSS externos e servidor em produção; versões/licenças; reprodução do build; compilação da pasta isolada sem histórico Git; suficiência do verificador de dependências externas.

## Testes a reproduzir

Na pasta `nova-plataforma/`:

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run test:abas
npm run test:pasta
```

Configure `CHROMIUM_PATH` quando necessário. Os testes usam Chromium/Playwright; nenhum precisa de bases reais da linha.

Resultados registrados anteriormente, a conferir:

- Oito testes de contratos aprovados.
- Oito módulos e 59 abas navegados.
- Ação criada no formulário e preservada após navegação.
- Busca e ficha de ordem.
- Conexão das sete bases em pasta OPFS de teste.
- Gravação e releitura pelo motor da Produção.
- Sem requisições a serviços externos nos fluxos testados.

**Limite importante:** o Chromium do ambiente retornou `ERR_BLOCKED_BY_ADMINISTRATOR` para `file://`. A automação entregou o mesmo HTML por HTTP local e desligou a rede após a carga. Isso não comprova abertura direta pela pasta Windows nem concorrência em rede SMB. Não marque esses itens como aprovados sem executá-los.

## Entrega esperada

Produza Markdown com:

1. Parecer geral: atende, atende parcialmente ou não atende ao objetivo.
2. Achados por severidade e prioridade.
3. Para cada achado: problema, impacto, arquivo/função/linha, reprodução/evidência, correção, alternativa mais simples e critério de aceite.
4. Funcionalidades ausentes ou apenas parcialmente integradas.
5. Melhorias de interface e manutenção.
6. Plano de entregas pequenas, ordenadas por dependência e risco.
7. Separação entre bloqueadores de uso, melhorias recomendadas e itens futuros.

Nesta etapa, revise sem alterar arquivos, fazer commits ou publicar. Preserve o sistema atual e não migre bases reais.
