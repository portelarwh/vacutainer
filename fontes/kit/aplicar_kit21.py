"""Reaplica o bloco do cabeçalho comum v2.1 (fontes/kit/kit_v21.js) nas páginas que não são montadas por build.
Uso (na raiz do projeto): python fontes/kit/aplicar_kit21.py
A Produção pega o kit_v21.js ao rodar fontes/producao/build.py."""
import os
RAIZ=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
k=open(os.path.join(RAIZ,'fontes','kit','kit_v21.js'),encoding='utf-8').read()
for nome in ['Portal.html','Perdas-Ordem.html','Paradas.html','Gestão-Gel-Vacutainer.html']:
    fn=os.path.join(RAIZ,'paginas',nome); s=open(fn,encoding='utf-8').read()
    i=s.index('<script>\n/* ----- vac-cabecalho v2.1'); j=s.index('\n</script>',i)
    s=s[:i]+'<script>\n'+k+s[j:]; open(fn,'w',encoding='utf-8').write(s); print('ok',nome)
