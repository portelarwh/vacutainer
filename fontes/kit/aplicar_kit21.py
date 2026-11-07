"""Reaplica o bloco do cabeçalho comum v2.1 (fontes/kit/kit_v21.js), o catálogo de sistemas (fontes/kit/sistemas.js:
const DEFAULT_SYSTEMS=[...]) o padrão visual comum (fontes/kit/kit_visual.css, <style id="vac-visual"> no fim do <head>) e as bases em 00. Bases
(fontes/kit/kit_bases.js, <script id="vac-bases"> logo depois)
nas páginas que não são montadas por build (inclusive as páginas em construção geradas por fontes/modelo/gerar_paginas.py).
Uso (na raiz do projeto): python fontes/kit/aplicar_kit21.py
A Produção pega o kit_v21.js ao rodar fontes/producao/build.py."""
import os,re
RAIZ=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
k=open(os.path.join(RAIZ,'fontes','kit','kit_v21.js'),encoding='utf-8').read()
sis=open(os.path.join(RAIZ,'fontes','kit','sistemas.js'),encoding='utf-8').read().strip()
PAD=re.compile(r'const DEFAULT_SYSTEMS=\[.*?\];',re.S)
vis=open(os.path.join(RAIZ,'fontes','kit','kit_visual.css'),encoding='utf-8').read().strip()
VIS=re.compile(r'<style id="vac-visual">.*?</style>\n?',re.S)
bas=open(os.path.join(RAIZ,'fontes','kit','kit_bases.js'),encoding='utf-8').read().strip()
BAS=re.compile(r'<script id="vac-bases">.*?</script>\n?',re.S)
def visual(s,nome):
    # padrão visual comum: último <style> do <head>, para valer sobre o CSS da página
    s=VIS.sub('',s); s=BAS.sub('',s)
    bloco='<style id="vac-visual">\n'+vis+'\n</style>\n<script id="vac-bases">\n'+bas+'\n</script>\n'   # bases em 00. Bases (antes do código da página)
    if s.count('\n</head>\n')==1: return s.replace('\n</head>\n','\n'+bloco+'</head>\n')
    ancora='<!-- vac-cabecalho v2 · barra do sistema'   # página sem </head> explícito (Gel): logo antes do cabeçalho comum
    if s.count(ancora)!=1: raise SystemExit('ERRO: nem </head> nem o início do vac-cabecalho achados exatamente 1 vez em '+nome+' (nada foi gravado)')
    return s.replace(ancora,bloco+ancora)
# páginas em construção (geradas por fontes/modelo/gerar_paginas.py) recebem o mesmo kit; entram quando existirem
NOVAS=[n for n in ['Equipamentos.html','Iniciativas.html','Projetos.html'] if os.path.exists(os.path.join(RAIZ,'paginas',n))]
# duas fases (07/11/2026): monta e confere todas as páginas na memória; só grava se todas passarem (um ERRO não deixa parte regravada).
# newline='\n': no Windows, o padrão gravaria CRLF e mudaria o arquivo inteiro no diff
saida=[]
for nome in ['Portal.html','Perdas-Ordem.html','Paradas.html','Gestão-Gel-Vacutainer.html']+NOVAS:
    fn=os.path.join(RAIZ,'paginas',nome); s=open(fn,encoding='utf-8',newline='').read()
    i=s.find('<script>\n/* ----- vac-cabecalho v2.1'); j=s.find('\n</script>',i) if i>=0 else -1
    if i<0 or j<0: raise SystemExit('ERRO: bloco do vac-cabecalho v2.1 não achado em '+nome+' (nada foi gravado)')
    s=s[:i]+'<script>\n'+k+s[j:]
    if len(PAD.findall(s))!=1: raise SystemExit('ERRO: DEFAULT_SYSTEMS não achado exatamente 1 vez em '+nome+' (nada foi gravado)')
    s=PAD.sub(lambda m:sis,s); s=visual(s,nome); saida.append((fn,nome,s))
for fn,nome,s in saida:
    open(fn,'w',encoding='utf-8',newline='\n').write(s); print('ok',nome)
