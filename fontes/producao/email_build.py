# Produção 2.4.66 · e-mail do turno e do dia para o Outlook (12/11/2026, pedido do usuário). Módulo: fontes/producao/email_dia.js.
# Só a Passagem de turno e o Relatório do dia usam o e-mail novo; os outros relatórios continuam com o rpOutlookHtml.
import os
AQUI = os.path.dirname(os.path.abspath(__file__))


def aplicar(R):
    R("async function boot() {\n", open(os.path.join(AQUI, 'email_dia.js'), encoding='utf-8').read() + "\nasync function boot() {\n")
    # botão "Itens do e-mail" ao lado do Copiar para Outlook (só turno e dia)
    R("""<button class="btn sm" id="rpOut">Copiar para Outlook</button>""",
      """<button class="btn sm" id="rpOut">Copiar para Outlook</button>${EmailDia.vale(R.type) ? '<button class="btn sm" id="rpItens" title="Escolher e ordenar o que vai no e-mail, com prévia. Fica gravado neste computador.">Itens do e-mail</button>' : ''}""")
    R("""    q('#rpTxt').onclick = () => run(async () => { await rpCopy(null, rpText(cur())); }, 'Texto copiado. Cole no WhatsApp, Teams ou e-mail.');
    q('#rpOut').onclick = () => run(async () => { const c = cur(); const html = await rpOutlookHtml(c, q('#rpImg').checked); await rpCopy(html, rpText(c)); }, 'Copiado. No Outlook, abra um novo e-mail e cole (Ctrl+V).');""",
      """    q('#rpTxt').onclick = () => run(async () => { const c = cur(); await rpCopy(null, EmailDia.vale(R.type) ? EmailDia.texto(c) : rpText(c)); }, 'Texto copiado. Cole no WhatsApp, Teams ou e-mail.');
    q('#rpOut').onclick = () => run(async () => { const c = cur(), novo = EmailDia.vale(R.type) ? await EmailDia.html(c, q('#rpImg').checked) : null;   /* 2.4.66: turno e dia no e-mail novo */
      if (novo) await rpCopy(novo, EmailDia.texto(c)); else await rpCopy(await rpOutlookHtml(c, q('#rpImg').checked), rpText(c)); }, 'Copiado. No Outlook, abra um novo e-mail e cole (Ctrl+V).');
    { const it = q('#rpItens'); if (it) it.onclick = () => EmailDia.abrir(cur, () => q('#rpImg').checked); }""")
