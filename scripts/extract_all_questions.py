import sys,json,re,argparse
from pathlib import Path
import pdfplumber
sys.path.insert(0,'scripts')
from extract_pdf_questions import HEADER,parse_card
parser=argparse.ArgumentParser(description='Extract the whole source PDF in batches of 65')
parser.add_argument('--force',action='store_true',help='Overwrite existing files')
args=parser.parse_args()
root=Path('data/extracted'); root.mkdir(parents=True,exist_ok=True); pdf_path=Path('data/AWS SAA-C03 Dumps.pdf')
current=None; batch=[]; prev=None; completed=0

def flush():
 global batch,completed
 if not batch:return
 first,last=batch[0]['number'],batch[-1]['number']
 qs=[];issues=[]
 for c in batch:
  q,checks=parse_card(c['number'],c['lines'],c['pages']); qs.append(q)
  if checks: issues.append({'question':c['number'],'sourcePages':c['pages'],'issues':checks})
 if True:
  out=root/f'questions-{first:04d}-{last:04d}.json'; report=root/f'questions-{first:04d}-{last:04d}.review.json'
  if not args.force and (out.exists() or report.exists()): raise RuntimeError(f'Output exists: {out}; use --force to replace it')
  out.write_text(json.dumps({'source':pdf_path.name,'batch':(first-1)//65+1,'firstQuestion':first,'lastQuestion':last,'questionCount':len(qs),'questions':qs},ensure_ascii=False,indent=2)+'\n')
  report.write_text(json.dumps({'source':pdf_path.name,'batch':(first-1)//65+1,'issues':issues,'note':'Automated checks do not prove exact text fidelity. Review PDF pages against JSON.'},ensure_ascii=False,indent=2)+'\n')
  print(f'{first}-{last}: {len(qs)} questions, {len(issues)} flagged',flush=True)
 completed+=len(batch);batch=[]

with pdfplumber.open(pdf_path) as pdf:
 for page in pdf.pages:
  for line in (page.extract_text() or '').splitlines():
   m=HEADER.fullmatch(line.strip())
   if m:
    n=int(m.group(1))
    if prev is not None and n!=prev+1:raise ValueError(f'Unexpected marker {prev} -> {n}, page {page.page_number}')
    prev=n
    if current:
     batch.append(current)
     if len(batch)==65:flush()
    current={'number':n,'lines':[],'pages':[page.page_number]}
   elif current:
    current['lines'].append(line)
    if page.page_number not in current['pages']:current['pages'].append(page.page_number)
 if current:batch.append(current)
 flush()
print('TOTAL',completed,flush=True)
