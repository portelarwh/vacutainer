from pathlib import Path
import re, html
from urllib.parse import quote
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, LongTable, TableStyle, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

root=Path(__file__).resolve().parents[1]
fontdir=Path('/usr/share/fonts/truetype/dejavu')
for name,file in [('DejaVu','DejaVuSans.ttf'),('DejaVu-Bold','DejaVuSans-Bold.ttf'),('DejaVu-Oblique','DejaVuSans-Oblique.ttf'),('DejaVuMono','DejaVuSansMono.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(fontdir/file)))
pdfmetrics.registerFontFamily('DejaVu',normal='DejaVu',bold='DejaVu-Bold',italic='DejaVu-Oblique',boldItalic='DejaVu-Bold')
styles=getSampleStyleSheet()
body=ParagraphStyle('TextoVac',fontName='DejaVu',fontSize=9,leading=13,spaceAfter=7,textColor=colors.HexColor('#25354a'))
head=ParagraphStyle('TituloVac',parent=body,fontName='DejaVu-Bold',fontSize=12,leading=16,spaceBefore=14,spaceAfter=9,keepWithNext=True,textColor=colors.HexColor('#163b59'))
sub=ParagraphStyle('SubVac',parent=head,fontSize=10,leading=14,spaceBefore=10)
cell=ParagraphStyle('CelulaVac',parent=body,fontSize=8,leading=11,spaceAfter=0)
cellhead=ParagraphStyle('CabCelulaVac',parent=cell,fontName='DejaVu-Bold',textColor=colors.white)
sha='e0435136359847e07a2a775a1d7eea31371495b8'
def link_dest(dest):
 if dest.startswith('https://'): return dest
 if dest.startswith('/workspace/vacutainer/'):
  value=dest[len('/workspace/vacutainer/'):]
  m=re.match(r'^(.*?):(\d+)$',value)
  if m: value,line=m.groups()
  else: line=None
  return 'https://github.com/portelarwh/vacutainer/blob/'+sha+'/'+quote(value,safe='/')+('#L'+line if line else '')
 return None

def inline(text):
 links=[]
 def save(m):
  label,dest=m.groups(); url=link_dest(dest)
  val='<link href="'+html.escape(url,quote=True)+'" color="#175889">'+html.escape(label)+'</link>' if url else html.escape(label)
  links.append(val);return f'ZZLINK{len(links)-1}ZZ'
 text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',save,text)
 text=html.escape(text)
 text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
 text=re.sub(r'`([^`]+)`',r'<font name="DejaVuMono" size="8">\1</font>',text)
 for i,v in enumerate(links): text=text.replace(f'ZZLINK{i}ZZ',v)
 return text

story=[]
lines=(root/'01-PARECER-COMPARATIVO.md').read_text().splitlines()
width=A4[0]-88

def diagram():
 d=Drawing(width,190)
 def box(x,y,w,h,label,fill):
  d.add(Rect(x,y,w,h,rx=5,ry=5,fillColor=colors.HexColor(fill),strokeColor=colors.HexColor('#9eb1c5'),strokeWidth=.6))
  textlines=label.split('\n')
  for i,t in enumerate(textlines):d.add(String(x+w/2,y+h/2+(len(textlines)-1)*6-i*12,t,textAnchor='middle',fontName='DejaVu',fontSize=8,fillColor=colors.HexColor('#18324c')))
 def arrow(x1,y1,x2,y2):
  d.add(Line(x1,y1,x2,y2,strokeColor=colors.HexColor('#637e99'),strokeWidth=.8))
  d.add(Polygon([x2,y2,x2-3,y2+5,x2+3,y2+5],fillColor=colors.HexColor('#637e99'),strokeColor=None))
 box(width/2-110,145,220,30,'Busca por ordem, lote ou LP','#e9f1f7')
 arrow(width/2,145,width/2,130)
 box(width/2-110,95,220,35,'Ficha integrada da ordem','#d5e7f3')
 labels=['Produção\ne SAP','Waste e\nmateriais','Gel e\nbarris LP','Paradas e\nequipamentos','Ações, iniciativas\ne projetos']
 bw=(width-24)/5
 for i,l in enumerate(labels):
  x=i*(bw+6)
  arrow(width/2,95,x+bw/2,55)
  box(x,10,bw,45,l,'#f3f6f9')
 return d

i=0
while i<len(lines):
 line=lines[i].strip()
 if not line:i+=1;continue
 if line.startswith('```'):
  language=line[3:];i+=1
  while i<len(lines) and not lines[i].startswith('```'):i+=1
  if language=='mermaid': story.extend([diagram(),Spacer(1,8)])
  i+=1;continue
 if line.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   parts=[c.strip() for c in lines[i].strip().strip('|').split('|')]
   if not all(re.fullmatch(r':?-+:?',p) for p in parts): rows.append(parts)
   i+=1
  n=len(rows[0]); widths={3:[.22,.42,.36],4:[.17,.24,.29,.30]}.get(n,[1/n]*n)
  table=LongTable([[Paragraph(inline(t),cellhead if j==0 else cell) for t in row] for j,row in enumerate(rows)],colWidths=[width*v for v in widths],repeatRows=1,hAlign='LEFT')
  table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#234b6b')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#f1f5f9'),colors.white]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,0),.5,colors.HexColor('#234b6b')),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#d8e2ec'))]))
  story.extend([table,Spacer(1,9)]);continue
 if line.startswith('**') and line.endswith('**'):
  ismain=bool(re.match(r'\*\*\d+\.',line))
  story.append(Paragraph(inline(line),head if ismain or i==0 else sub));i+=1;continue
 if line.startswith('- '):
  bullet=ParagraphStyle('Lista',parent=body,leftIndent=10,firstLineIndent=-8,spaceAfter=5)
  story.append(Paragraph('• '+inline(line[2:]),bullet));i+=1;continue
 paragraph=[line];i+=1
 while i<len(lines) and lines[i].strip() and not lines[i].startswith(('|','- ','```','**')):
  paragraph.append(lines[i].strip());i+=1
 story.append(Paragraph(inline(' '.join(paragraph)),body))

def page_footer(c,doc):
 c.saveState();c.setStrokeColor(colors.HexColor('#cbd5e1'));c.line(44,35,A4[0]-44,35)
 c.setFont('DejaVu',7);c.setFillColor(colors.HexColor('#65748b'))
 c.drawString(44,23,'Vacutainer · Análise comparada de 08/11/2026 · commit e043513')
 c.drawRightString(A4[0]-44,23,str(doc.page));c.restoreState()

doc=SimpleDocTemplate(str(root/'01-PARECER-COMPARATIVO.pdf'),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=40,bottomMargin=48,title='Parecer comparativo · Vacutainer',author='Revisão do repositório portelarwh/vacutainer')
doc.build(story,onFirstPage=page_footer,onLaterPages=page_footer)
print(root/'01-PARECER-COMPARATIVO.pdf')
