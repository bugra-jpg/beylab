"""Stage the same public static files for GitHub Pages and the design preview."""
from pathlib import Path
import shutil
import subprocess
import sys
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'dist'
assert OUT.resolve().parent == ROOT.resolve()
subprocess.run([sys.executable,str(ROOT/'scripts/generate_index.py')],check=True)
OUT.mkdir(exist_ok=True)
# Removed posts must disappear from repeated builds as well as the index.
for stale in (OUT/'posts').glob('*.md'):
    if not (ROOT/'posts'/stale.name).is_file():
        stale.unlink()
for name in ['index.html','notes.html','post.html','lab.html','portfolio.css','portfolio.js','field.js','journal.css','style.css','app.js','posts.json','CNAME','.nojekyll']:
    shutil.copy2(ROOT/name,OUT/name)
for name in ['assets','posts']:
    shutil.copytree(ROOT/name,OUT/name,dirs_exist_ok=True)
# Existing downloadable resources remain available at their original URL.
resource=ROOT/'download'
if resource.is_dir(): shutil.copytree(resource,OUT/'download',dirs_exist_ok=True)
elif resource.is_file(): shutil.copy2(resource,OUT/'download')
print('Static site ready in dist/')
