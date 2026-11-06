"""Reaplica o bloco do cabeçalho comum v2.1 (fontes/kit/kit_v21.js), o catálogo de sistemas (fontes/kit/sistemas.js:
const DEFAULT_SYSTEMS=[...]) e o padrão visual comum (fontes/kit/kit_visual.css, <style id="vac-visual"> no fim do <head>)
nas páginas que não são montadas por build.
Uso (na raiz do projeto): python fontes/kit/aplicar_kit21.py
A Produção pega o kit_v21.js ao rodar fontes/producao/build.py."""
import os,re
RAIZ=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
k=open(os.path.join(RAIZ,'fontes','kit','kit_v21.js'),encoding='utf-8').read()
sis=open(os.path.join(RAIZ,'fontes','kit','sistemas.js'),encoding='utf-8').read().strip()
PAD=re.compile(r'const DEFAULT_SYSTEMS=\[.*?\];',re.S)
vis=open(os.path.join(RAIZ,'fontes','kit','kit_visual.css'),encoding='utf-8').read().strip()
VIS=re.compile(r'<style id="vac-visual">.*?</style>\n?',re.S)
def visual(s,nome):
    # padrão visual comum: último <style> do <head>, para valer sobre o CSS da página
    s=VIS.sub('',s)
    bloco='<style id="vac-visual">\n'+vis+'\n</style>\n'
    if s.count('\n</head>\n')==1: return s.replace('\n</head>\n','\n'+bloco+'</head>\n')
    ancora='<!-- vac-cabecalho v2 · barra do sistema'   # página sem </head> explícito (Gel): logo antes do cabeçalho comum
    if s.count(ancora)!=1: raise SystemExit('ERRO: nem </head> nem o início do vac-cabecalho achados exatamente 1 vez em '+nome)
    return s.replace(ancora,bloco+ancora)
for nome in ['Portal.html','Perdas-Ordem.html','Paradas.html','Gestão-Gel-Vacutainer.html']:
    fn=os.path.join(RAIZ,'paginas',nome); s=open(fn,encoding='utf-8').read()
    i=s.index('<script>\n/* ----- vac-cabecalho v2.1'); j=s.index('\n</script>',i)
    s=s[:i]+'<script>\n'+k+s[j:]
    if len(PAD.findall(s))!=1: raise SystemExit('ERRO: DEFAULT_SYSTEMS não achado exatamente 1 vez em '+nome)
    s=PAD.sub(lambda m:sis,s); s=visual(s,nome); open(fn,'w',encoding='utf-8').write(s); print('ok',nome)
