# Plano · app da linha no celular (ideias futuras, 27/11/2026)

Pedido do responsável (27/11/2026): um app só com os módulos Operação e Manutenção, dados indo da plataforma para o celular por QR, base sempre atualizada e mensagem do WhatsApp ajustável. Não é prioridade imediata; o responsável está testando os apps atuais. Este plano organiza as etapas; nenhuma muda os contratos (o app continua sem acesso às bases; só a plataforma grava).

## Situação hoje
- Dois arquivos: `CELULAR/index.html` (Meu Turno) e `CELULAR/manutencao.html` (Manutenção), blocos `celular/meu-turno` e `celular/manutencao` do `Plataforma.html`.
- A Administração gera cada arquivo com o cadastro do dia embutido; mudou o cadastro, gera e reenvia.
- Saída: WhatsApp (`wa.me`, só texto; imagem + texto pelo compartilhar), PDF e volta para a plataforma por QR (webcam) ou `.mt.json`.
- A mensagem do WhatsApp é montada em `txtWA` (Meu Turno), fixa no código.

## Decisões do responsável (27/11/2026)
- Os celulares são **dos operadores** (aparelho pessoal).
- Nomes e IDs das pessoas **podem** ficar no celular (como hoje).
- A TI **aceita** uma página pública **só com o código** (sem nenhum dado da empresa).
- Em aberto: se há iPhone entre os operadores (o app aberto como arquivo no iPhone precisa do Safari; a página publicada resolve isso).

## Fases
1. **Mensagem do WhatsApp editável (1 PR). Feito na plataforma 1.8.101 (Meu Turno 0.5):** ver CELULAR/LEIAME, teste `app-cel-whats`. Administração › Apps de celular › Modelo da mensagem, com marcadores (`{linha}`, `{turno}`, `{data}`, `{operador}`, `{producao}`, `{plano}`, `{aderencia}`, `{paradas}`, `{scrap}`, `{hora_a_hora}`) e prévia; o modelo vai embutido no app gerado; sem modelo, a mensagem de hoje. O rodapé do app mostra a data do cadastro embutido.
2. **Um app só com dois módulos (2 a 3 PRs). Feito na plataforma 1.8.102 (Linha no celular 0.1, Meu Turno 0.6, Manutenção 0.2):** lançador `CELULAR/linha.html` que abre um módulo por vez (cada um com as próprias variáveis e dados); ver CELULAR/LEIAME, teste `app-cel-linha`. "Linha no celular": início com Operação e Manutenção; cadastro, QR, visual e configuração compartilhados; dados de cada módulo separados no celular (prefixos `mt.` e `mm.` mantidos, histórico preservado). A Administração gera um arquivo só. Os testes `mt-celular`, `man-celular` e `test:celular` continuam valendo.
3. **Plataforma → celular por QR (2 PRs). Feito na plataforma 1.8.103 (Linha no celular 0.2), parte do cadastro:** Enviar cadastro ao celular (QR ou arquivo) e Atualizar cadastro no Linha.html; ver CELULAR/LEIAME, teste `app-cel-qr`. **Feito na 1.8.104 (Linha no celular 0.3, Meu Turno 0.7):** pacote do dia com os quatro itens pedidos pelo responsável em 28/11/2026 (ordens e lotes, plano e meta, ações abertas, resumo de ontem); teste `app-cel-dia`. Fase 3 concluída. A plataforma mostra uma sequência de QR; o app lê pela câmera: atualização do cadastro (sem reenviar o arquivo), pacote do dia (plano, ordens e lotes, pendências e ações) e um relatório resumido de um dia. Cerca de 2 KB por QR, em partes; fotos e históricos longos ficam no arquivo `.json`. Testar antes se a câmera funciona com o app aberto direto do arquivo no Chrome do Android; se não, o caminho é o arquivo pelo WhatsApp em "Receber".
4. **Base sempre atualizada. Feito na plataforma 1.8.105 (Linha no celular 0.4):** `scripts/celular-site.mjs` e o workflow `.github/workflows/app-linha.yml` (publica no GitHub Pages quando o responsável ligar: Source = GitHub Actions e a variável `PUBLICAR_APP_LINHA` = `sim`, ou Run workflow); ver CELULAR/LEIAME, teste `app-cel-site`. Com o aceite da TI: o **código** publicado como página (ex.: GitHub Pages) e instalável no celular (funciona sem internet e se atualiza sozinho); os **dados** nunca vão para a página: entram pelo QR da fase 3 (ou arquivo). Como os aparelhos são pessoais, o app guarda só o necessário (cadastro do dia, turnos do próprio operador) e oferece "Apagar meus dados".

Ordem sugerida: 1 → 2 → 3 → 4. Cada fase em PR próprio, com teste novo e entrada em NOVIDADES.
