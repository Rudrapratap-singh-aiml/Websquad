"""StayServe local server (Python 3 standard library only). Run: python server.py -> http://localhost:8000
Saves guests, staff and requests into the JSON files in /data."""
import json, os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
ROOT = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(ROOT, 'data'); KEYS = ('guests', 'staff', 'requests')
def rd(n):
    with open(os.path.join(D, n + '.json'), encoding='utf-8') as f: return json.load(f)
def wr(n, v):
    with open(os.path.join(D, n + '.json'), 'w', encoding='utf-8') as f: json.dump(v, f, indent=2)
class H(SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def js(s, code, obj):
        b = json.dumps(obj).encode(); s.send_response(code); s.send_header('Content-Type', 'application/json'); s.send_header('Content-Length', str(len(b))); s.end_headers(); s.wfile.write(b)
    def do_GET(s):
        if s.path == '/api/db': return s.js(200, {k: rd(k) for k in KEYS})
        super().do_GET()
    def do_POST(s):
        p = s.path.split('/')
        if len(p) != 4 or p[1] != 'api' or p[2] != 'save' or p[3] not in KEYS: return s.js(403, {'error': 'not allowed'})
        data = json.loads(s.rfile.read(int(s.headers.get('Content-Length', 0))))
        if p[3] in ('guests', 'staff'):  # same email can never register twice (any mobile); staff IDs unique
            em = [u['email'].lower() for u in data]
            if len(em) != len(set(em)): return s.js(409, {'error': 'duplicate email id'})
            if p[3] == 'staff' and len({u['empId'] for u in data}) != len(data): return s.js(409, {'error': 'duplicate employee id'})
        wr(p[3], data); s.js(200, {'ok': True})
if __name__ == '__main__':
    print('StayServe running at http://localhost:8000  (Ctrl+C to stop)'); ThreadingHTTPServer(('', 8000), H).serve_forever()
