"""Local dashboard for the Trench scanner.

  python3 server.py            # then open http://127.0.0.1:8787
  python3 server.py --port 9000

Binds to 127.0.0.1 only. Read-only: no keys, no wallet, no orders.
"""
import argparse
import json
import os
import sys
import traceback
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scanner  # noqa: E402

PLAYBOOK = os.path.join(HERE, "..", "memecoin-audit", "playbook.html")
REPORT = os.path.join(HERE, "..", "memecoin-audit", "report.html")


def _num(q, k, default=None):
    try:
        return float(q[k][0])
    except (KeyError, ValueError, IndexError):
        return default


class H(BaseHTTPRequestHandler):
    server_version = "trench/1.0"

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        b = body if isinstance(body, bytes) else body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _file(self, path, ctype="text/html; charset=utf-8"):
        try:
            with open(path, "rb") as f:
                self._send(200, f.read(), ctype)
        except FileNotFoundError:
            self._send(404, "not found", "text/plain")

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        try:
            if u.path in ("/", "/index.html"):
                return self._file(os.path.join(HERE, "dashboard.html"))
            if u.path == "/playbook":
                return self._file(PLAYBOOK)
            if u.path == "/report":
                return self._file(REPORT)
            if u.path == "/api/scan":
                addr = (q.get("address") or [""])[0].strip()
                chain = (q.get("chain") or [""])[0] or None
                d = scanner.scan(addr, chain, _num(q, "bankroll"), _num(q, "risk", 1.0))
                return self._send(200, json.dumps(d))
            if u.path == "/api/trending":
                chain = (q.get("chain") or ["solana"])[0]
                limit = int(_num(q, "limit", 15))
                candles = (q.get("candles") or ["0"])[0] == "1"
                d = scanner.trending(chain, min(limit, 30), candles, _num(q, "bankroll"), _num(q, "risk", 1.0))
                return self._send(200, json.dumps(d))
            self._send(404, json.dumps({"error": "not found"}))
        except Exception as e:
            traceback.print_exc()
            self._send(500, json.dumps({"error": f"{type(e).__name__}: {e}"}))

    def log_message(self, fmt, *args):
        sys.stderr.write("  " + fmt % args + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8787)
    a = ap.parse_args()
    srv = ThreadingHTTPServer(("127.0.0.1", a.port), H)
    print(f"Trench scanner on http://127.0.0.1:{a.port}  (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
