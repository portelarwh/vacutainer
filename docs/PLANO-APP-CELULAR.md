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
2. **Um app só com dois módulos (2 a 3 PRs).** "Linha no celular": início com Operação e Manutenção; cadastro, QR, visual e configuração compartilhados; dados de cada módulo separados no celular (prefixos `mt.` e `mm.` mantidos, histórico preservado). A Administração gera um arquivo só. Os testes `mt-celular`, `man-celular` e `test:celular` continuam valendo.
3. **Plataforma → celular por QR (2 PRs).** A plataforma mostra uma sequência de QR; o app lê pela câmera: atualização do cadastro (sem reenviar o arquivo), pacote do dia (plano, ordens e lotes, pendências e ações) e um relatório resumido de um dia. Cerca de 2 KB por QR, em partes; fotos e históricos longos ficam no arquivo `.json`. Testar antes se a câmera funciona com o app aberto direto do arquivo no Chrome do Android; se não, o caminho é o arquivo pelo WhatsApp em "Receber".
4. **Base sempre atualizada.** Com o aceite da TI: o **código** publicado como página (ex.: GitHub Pages) e instalável no celular (funciona sem internet e se atualiza sozinho); os **dados** nunca vão para a página: entram pelo QR da fase 3 (ou arquivo). Como os aparelhos são pessoais, o app guarda só o necessário (cadastro do dia, turnos do próprio operador) e oferece "Apagar meus dados".

Ordem sugerida: 1 → 2 → 3 → 4. Cada fase em PR próprio, com teste novo e entrada em NOVIDADES.
