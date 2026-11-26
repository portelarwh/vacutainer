# Auditoria completa da plataforma · lado do agente de desenvolvimento (26/11/2026)

Base: `main` em `e22cb92` (plataforma 1.8.71). Roteiro seguido: [roteiro-auditoria](2026-11-26-roteiro-auditoria.md). Tabela completa: [auditoria-agente-dev.csv](2026-11-26-auditoria-agente-dev.csv). Scripts para reproduzir: `scripts/auditoria/`.
Esta é a análise **A**. A análise **B** (contraparte) ainda não foi entregue; a análise comum vem depois (seção 8).

## 1. Resumo executivo
1. **Nenhum erro crítico de cálculo foi provado.** Em mais de 700 cenários aleatórios (zero, nulo, extremos, turno de madrugada com intervalos além de 24:00, intervalo invertido, parada na virada, hora extra, refugo enorme ou negativo, texto no lugar de número) o motor não lançou exceção, não produziu NaN nem Infinity, e a identidade OEE = D × P × Q se manteve. A exportação do Excel reconcilia com a tela.
2. **O ponto fraco do motor é o que ele faz com dado impossível:** em vez de limitar, calcula e só avisa por texto. Com produção acima da capacidade o OEE chega a 72.906%; com um refugo digitado com dígitos a mais a Performance chega a 170.665%; com uma parada maior que o turno a Disponibilidade fica negativa (-2,98%) e a Performance, -2471%; refugo negativo é aceito (Qualidade 100,11%); intervalo invertido é ignorado em silêncio. Também soma paradas sobrepostas em duplicidade. (A01 a A03, A08 a A10)
3. **O parâmetro "Fuso horário" não é aplicado:** "hoje" e os turnos usam o relógio e o fuso do navegador, ao contrário do que a ajuda diz. (A04, Alta)
4. **Segurança de HTML está boa** (escape consistente, nenhum eval ou javascript:). O ponto sensível é o modelo: perfis e PIN existem só no cliente, e o hash do PIN de 6 dígitos mora num arquivo compartilhado. A segurança real é a permissão da pasta. (B02)
5. **A arquitetura é a maior dívida técnica, não um risco imediato:** 336 KB de código repetido entre blocos (8 cópias de `esc`, 7 de `Store`) e funções com mais de mil linhas.
6. **Não foi provado:** pasta de rede e duas estações, abertura do arquivo de 7,3 MB em rede, PDF e CSV dos outros módulos, importações com arquivos reais.

## 2. Como foi feito
- **Automático, arquivo inteiro:** extração dos 48 blocos (7,2 MB de código), ESLint por bloco, referências cruzadas entre blocos, código repetido, funções grandes, `catch` vazios, varredura por AST de texto livre interpolado sem `esc()` dentro de `innerHTML`, buscas de APIs de risco.
- **Por prova:** testes de propriedade do motor no navegador (Playwright), os casos extremos isolados, tela × Excel, tempo de abertura e DOM, capturas em desktop e celular.
- Um nome indefinido só conta como bug se não houver definição em nenhum outro bloco (os blocos compartilham globais). Resultado: 988 avisos `no-undef` viram **zero** realmente indefinidos.

## 3. Números da varredura
| Medida | Valor |
|---|---|
| Arquivo | 7,3 MB; maiores blocos: motor/oee 1,7 MB (14.920 linhas), motor/gel 963 KB, biblioteca/xlsx 693 KB, motor/portal 677 KB |
| Nomes de topo repetidos em mais de um bloco | 132 (336 KB redundantes) |
| Funções acima de 4 KB | 240; maiores: `Actions` 1.068 linhas, `Engine` 734, `Sqdcp` 600, `vacFicha` 322 |
| Símbolos sem nenhuma referência | 31 mortos (mais 146 com uso parcial) |
| `catch` vazios | 370 |
| Igualdade frouxa (`==`) | mais de 800 |
| Interpolações de texto livre sem `esc()` em HTML | 20 candidatas; todas já dentro de `esc()` |
| Testes existentes | 71 suítes `testes/*.js` + 92 de `testes/plataforma/*.cjs` (6.236 linhas) |
| Abertura de um módulo (local, demonstração) | 0,5 a 0,9 s; 1,2 a 1,6 mil nós de DOM |

## 4. Pontos fortes (provados)
Motor robusto a entradas ruins sem quebrar; identidade OEE = D×P×Q; tela e Excel do mesmo `Engine`; auditoria com nome, ID, antes e depois; escape de HTML e neutralização de fórmula no CSV/Excel; um módulo carregado por vez; contratos protegidos por testes (`base-limpa`, `prod-numeros`, `primeiro-uso`).

## 5. Achados por frente (resumo; detalhes na tabela CSV)
**A · Cálculo e operação**
- **A01 (Média)** produção acima da capacidade vira P e OEE absurdos; só aviso.
- **A02 (Média, corrigida)** parada maior que o turno: D e P negativos. A tela (`validateEvent`) já impede isso na digitação; só chega por importação ou dado externo. Reclassificada de Alta.
- **A03 (Média, corrigida em 1.8.73)** paradas sobrepostas somam em duplicidade (a tela já barra sobreposição na digitação; vale para importação) (D de 97,0% para 85,1% no exemplo).
- **A08 (Média)** refugo absurdo infla a Performance (170.665%); **A09 (Baixa)** refugo negativo aceito (Q 100,11%); **A10 (Média)** intervalo invertido ou de duração zero é ignorado em silêncio.
- **A04 (Alta)** fuso horário configurado não é usado.
- A07 (Média, suspeita) falta teste do conjunto: vários dias com madrugada + hora extra + parada na virada, tela × exportação.

**B/C · Integridade e rastreabilidade**
- **B01 (Média)** a guarda de gravação disfarça "negado" de "arquivo não encontrado" (foi o que escondeu o bug do primeiro uso).
- **B02 (Média, suspeita)** modelo de segurança só no cliente; hash do PIN legível por quem lê a pasta.
- **B04 (Alta, suspeita)** SMB e duas estações não provados.
- B03 (Baixa) 370 `catch` vazios; C02 (Baixa) edições seguidas viram um registro só.

**D · Segurança** D01 positivo; D02 sessão em `localStorage`; D03 `document.write` em 3 relatórios (título escapado).

**E–I · Bugs, relatórios, desempenho, arquitetura, código**
E01/E02 baixas (chave duplicada idêntica, auto-atribuição a confirmar); F01 lacuna dos outros módulos; G sem gargalo local, G02 rede não medida; **H01 (Média)** duplicação entre blocos; **H02 (Média)** funções gigantes; H03/H04 acoplamento e globais; I01 código morto; I02 `==` e `catch`.

**J/K · UX e layout** J01 (Média) Lançamento no celular com rolagem horizontal e abas truncadas; J02 mensagens técnicas ao usuário; desktop limpo.

## 6. Roadmap (classes)
- **Correção Crítica:** nenhuma provada.
- **Correção Importante:** A04, A02, A01, A03 (precisam de decisão do responsável, ver seção 7), B01, B04, J01, J02, B02 (decisão de modelo).
- **Melhoria:** B03, C02, D02, D03, E01, E02, F01, G02, H03, I01, I02, J03, K02, A07.
- **Evolução:** H01 (extrair o kit comum e unificar `Store`), H02 (quebrar `Actions`/`Engine`/`Sqdcp`), H04 (módulos com escopo).

## 7. Perguntas de ajuste (dúvidas de negócio)
1. **Dado impossível (A01, A02):** quando a produção passa da capacidade ou a parada passa do turno, o sistema deve (a) continuar calculando e só avisar, como hoje; (b) bloquear a gravação do lançamento; ou (c) mostrar o indicador como "inválido" e não entrar nas médias? Mexe em regra de cálculo (contrato 7).
2. **Paradas simultâneas (A03):** duas paradas no mesmo horário somam ou valem uma só? Por equipamento ou pela linha?
3. **Fuso (A04):** existe estação fora do fuso da planta? O parâmetro deve passar a valer?
4. **Modelo de acesso (B02):** quem tem acesso de leitura e escrita à pasta de rede? O ID e a senha são identificação (registrar quem fez) ou controle (impedir quem não pode)?
5. **Arquitetura (H01):** vale investir em unificar o código repetido, ou cada módulo autônomo é uma escolha de manter?

**Correção da própria auditoria:** a primeira versão do teste de propriedade não exercitava a madrugada nem o refugo (mudava só o snapshot do turno e passava um objeto como refugo). O revisor automático apontou, o script foi corrigido e agora confirma por si que cada cenário chega à condição pretendida; os achados A08 a A10 vieram dessa correção.

## 7b. Decisões do responsável (26/11/2026) e correções feitas
Dado impossível: bloquear a gravação. Paradas simultâneas: contar uma vez. Fuso: usar o da planta. Corrigidos na plataforma 1.8.73 (A01, A03, A04, A08, A09, A10), com os testes `dado-impossivel`, `paradas-simultaneas` e `fuso-planta`. Limite de produção/scrap: 3x a capacidade (constante `LIMITE_X`, ajustável).

## 8. Análise comum com a contraparte (próximo passo)
Quando a contraparte entregar `auditoria-contraparte.md` e `.csv`: juntar as tabelas por lugar (bloco e linha ou função), classificar cada achado como **Convergente**, **Só um viu** ou **Divergente**, rodar a prova nas divergências, e produzir uma tabela única com a coluna "Quem viu" e um roadmap único.
