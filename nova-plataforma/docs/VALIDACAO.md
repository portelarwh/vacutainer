# Validação da entrega · 14/11/2026

## Verificado

| Verificação | Resultado |
|---|---|
| Snapshot independente | Verificado sem o histórico Git original; integridade dos motores conferida por SHA-256 |
| TypeScript estrito e build Vite | Aprovados; somente `dist/Plataforma.html` na distribuição; reconstrução repetida com o mesmo SHA-256 |
| Contratos e seletores | 8 testes aprovados: formato desconhecido, números/listas inválidos, ausência versus zero, OEE sem média de taxas, turno, ordem textual, leitura estrita, CSV e datas |
| Módulos integrados | Oito áreas abertas no mesmo aplicativo |
| Abas | 59 abas navegadas, sem erro de rota ou JavaScript |
| Excel offline | Biblioteca oficial SheetJS 0.20.3 carregada dentro do módulo; sem CDN |
| Navegação e estado | Ação criada pelo formulário real do Planner e preservada ao navegar para outras áreas e voltar |
| Ordem integrada | Busca Ctrl K → ficha da ordem → links dos módulos |
| Central, relatórios e saúde | Seis etapas de importação; relatório com dados publicados; sete bases operacionais na consulta de saúde |
| Layout | 1440 px e 390 px; tema claro/escuro, menu móvel e ausência de rolagem horizontal do aplicativo |
| Modo real sem conexão | Inicia sem abrir/criar bases ou carregar exemplos automaticamente |
| Pasta simulada | Produção, Waste, Gel, Paradas, Equipamentos, Iniciativas e Portal conectados à mesma pasta OPFS de teste |
| Persistência | Observação gravada pelo motor real da Produção e conferida por releitura do JSON na pasta de teste |
| Rede | Navegador desligado da rede após receber o HTML; navegação, módulos e criação de ação funcionam; nenhuma requisição a serviços externos |
| Isolamento da demonstração | Dados na sessão; identidade/tema reais do novo aplicativo preservados ao usar a demonstração |

Comandos:

```sh
npm test
npm run build
npm run test:browser
npm run test:abas
npm run test:pasta
```

Os testes de navegador usam Playwright e Chromium. Neste ambiente, `/usr/bin/chromium` está disponível. Para outra instalação, defina `CHROMIUM_PATH`; o pacote Playwright está fixado nas dependências de desenvolvimento. Se não houver Chromium instalado, execute `npx playwright install chromium` e configure `CHROMIUM_PATH` para o executável.

Imagens locais em `testes-saida/` (fora do Git): início desktop/móvel, Produção e tema escuro. Os testes não acessam a pasta da linha.

## Não verificado: abertura direta pela pasta Windows

O Chromium gerenciado do ambiente retorna **`ERR_BLOCKED_BY_ADMINISTRATOR`** para endereços `file://`. O teste registra **NÃO VERIFICADO** e usa um servidor HTTP local apenas para entregar o mesmo HTML à automação; depois desliga a rede do navegador. O produto distribuído não inclui nem exige esse servidor.

Essa é uma restrição do navegador deste ambiente. Não foi contornada por alteração de política. É necessário conferir a abertura direta no Chrome/Edge da estação Windows antes de substituir o uso atual.

## Roteiro de homologação na linha

1. Copiar o HTML para uma pasta de homologação com cópias das bases e backups.
2. Abrir por duplo clique em Chrome e Edge. Conferir navegação e funcionamento sem internet.
3. Conectar a raiz; conferir leitura de `00. Bases`, revisão do cadastro e identificação do usuário.
4. Abrir todos os módulos; conferir a base correta e compará-la à página atual.
5. Registrar um fato de teste, gravar, reabrir e conferir o arquivo/backup. Testar erro de permissão e perda de conexão.
6. Duas estações: alterar registros diferentes e depois o mesmo registro; conferir reaplicação, conflito, fila e autoria. A pasta OPFS não representa o comportamento da rede SMB.
7. Conferir Excel, PDF, impressora A4, Outlook e caminhos com acentos/documentos de equipamentos.
8. Comparar períodos e turnos, taxas e quantidades. Não aceitar uma taxa calculada com outra janela.

Os formatos das bases foram preservados. Voltar ao aplicativo antigo não exige conversão, mas alterações legítimas feitas nos módulos permanecem nos arquivos; voltar de versão não desfaz esses fatos.

## Limites preservados

- Projetos continua com escopo em definição.
- Importador oficial de OSM, integração SQL/MES, padrões técnicos AM/TPM/5S e decisões de jornada/madrugada não foram inventados.
- As telas operacionais usam os motores existentes. Conversão integral dessas telas para componentes React pode avançar por fluxo, com teste de paridade.
- A gravação conserva o modelo existente. Não há promessa de transações distribuídas ou eliminação de conflitos na pasta da rede.
