"""Stage the same public static files for GitHub Pages and the design preview."""
from pathlib import Path
import json
import re
import shutil
import subprocess
import sys
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'dist'
assert OUT.resolve().parent == ROOT.resolve()
subprocess.run([sys.executable,str(ROOT/'scripts/generate_index.py')],check=True)

# Build the photography index from files uploaded to assets/photos. A photo is
# enough on its own; details.json can optionally provide title, location, date,
# and alt text for any filename.
PHOTO_DIR=ROOT/'assets'/'photos'
PHOTO_DIR.mkdir(parents=True,exist_ok=True)
details_path=PHOTO_DIR/'details.json'
details=json.loads(details_path.read_text(encoding='utf-8')) if details_path.is_file() else {}
photos=[]
for photo in sorted(PHOTO_DIR.iterdir(),key=lambda path:path.name.lower(),reverse=True):
    if photo.suffix.lower() not in {'.jpg','.jpeg','.png','.webp','.avif'}:
        continue
    meta=details.get(photo.name,{})
    stem=re.sub(r'^\d{4}-\d{2}-\d{2}[-_ ]*','',photo.stem)
    fallback_title=re.sub(r'[-_]+',' ',stem).strip().title() or 'Untitled frame'
    photos.append({
        'src':f'assets/photos/{photo.name}',
        'title':meta.get('title',fallback_title),
        'location':meta.get('location',''),
        'date':meta.get('date',''),
        'alt':meta.get('alt',meta.get('title',fallback_title)),
    })
(ROOT/'photos.json').write_text(json.dumps(photos,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
OUT.mkdir(exist_ok=True)
# Removed posts must disappear from repeated builds as well as the index.
for stale in (OUT/'posts').glob('*.md'):
    if not (ROOT/'posts'/stale.name).is_file():
        stale.unlink()
for name in ['index.html','notes.html','post.html','lab.html','photos.html','portfolio.css','portfolio.js','photos.js','field.js','journal.css','style.css','app.js','posts.json','photos.json','CNAME','.nojekyll']:
    shutil.copy2(ROOT/name,OUT/name)
for name in ['assets','posts']:
    shutil.copytree(ROOT/name,OUT/name,dirs_exist_ok=True)
# Existing downloadable resources remain available at their original URL.
resource=ROOT/'download'
if resource.is_dir(): shutil.copytree(resource,OUT/'download',dirs_exist_ok=True)
elif resource.is_file(): shutil.copy2(resource,OUT/'download')
print('Static site ready in dist/')
