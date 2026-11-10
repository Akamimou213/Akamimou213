"""Run the Vercel project locally: python3 dev.py  ->  http://127.0.0.1:3000 (static files + api/*.py)."""
import http.server
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
HANDLERS = {}
for fn in os.listdir(os.path.join(ROOT, "api")):
    if fn.endswith(".py"):
        spec = importlib.util.spec_from_file_location(fn[:-3], os.path.join(ROOT, "api", fn))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        HANDLERS["/api/" + fn[:-3]] = mod.handler


class Router(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def do_GET(self):
        path = self.path.split("?")[0]
        # Same page routes as vercel.json: the terminal at /, the paper screen at /trade.
        if path in ("/", "/trade"):
            self.path = "/terminal.html" if path == "/" else "/index.html"
            return super().do_GET()
        if path in HANDLERS:
            HANDLERS[path].do_GET(self)
        elif path.startswith("/api/") or path.startswith("/api/_lib/"):
            self.send_error(404)
        else:
            super().do_GET()

    def log_message(self, *a):
        pass


port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
print(f"Trench (Vercel layout) on http://127.0.0.1:{port}", flush=True)
http.server.ThreadingHTTPServer(("127.0.0.1", port), Router).serve_forever()
