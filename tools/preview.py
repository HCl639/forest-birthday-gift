"""僅供本機 QA：限定專案素材，支援影片 Range，不會提供其他本機檔案。"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

root=Path(__file__).resolve().parent.parent
allowed={'index.html','style.css','cinematic.css','script.js','geometry.js','enhanced-levels.js'}
allowed.update(str(p.relative_to(root)).replace('\\','/') for p in (root/'assets').glob('*') if p.suffix in {'.mp4','.png','.jpg'})
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(root),**kwargs)
    def do_GET(self):
        name=unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        asset=(root/name).resolve()
        is_asset=asset.parent==(root/'assets').resolve() and asset.suffix in {'.mp4','.png','.jpg'} and asset.is_file()
        if name not in allowed and not is_asset:
            self.send_error(404)
            return
        path=root/name
        match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
        if match:
            size=path.stat().st_size
            start=int(match[1]);end=min(int(match[2]) if match[2] else size-1,size-1)
            if start>=size or end<start:
                self.send_error(416)
                return
            self.send_response(206)
            self.send_header('Content-Type',self.guess_type(str(path)))
            self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length',str(end-start+1))
            self.send_header('Accept-Ranges','bytes')
            self.end_headers()
            with path.open('rb') as file:
                file.seek(start)
                self.wfile.write(file.read(end-start+1))
        else:
            super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        super().end_headers()
ThreadingHTTPServer(('127.0.0.1',8081),Handler).serve_forever()
