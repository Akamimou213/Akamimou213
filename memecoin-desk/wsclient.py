"""Minimal RFC 6455 websocket client on the standard library (text frames, ping/pong, proxy-aware).

Enough for the two feeds the desk reads: PumpPortal (pump.fun launches and migrations) and Solana
RPC `logsSubscribe` (Raydium pool creation). No compression, no fragmentation of outgoing frames.
"""
import base64
import json
import os
import socket
import ssl
import struct
import urllib.parse


class WSClosed(Exception):
    pass


class WebSocket:
    def __init__(self, url, timeout=30):
        u = urllib.parse.urlparse(url)
        self.host, self.port = u.hostname, u.port or (443 if u.scheme == "wss" else 80)
        path = (u.path or "/") + (f"?{u.query}" if u.query else "")
        raw = self._connect(timeout)
        if u.scheme == "wss":
            ctx = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE"))
            raw = ctx.wrap_socket(raw, server_hostname=self.host)
        self.sock = raw
        key = base64.b64encode(os.urandom(16)).decode()
        req = (f"GET {path} HTTP/1.1\r\nHost: {self.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
               f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\nUser-Agent: trench-desk/1.0\r\n\r\n")
        self.sock.sendall(req.encode())
        head = self._read_headers()
        if " 101 " not in head.split("\r\n", 1)[0]:
            raise WSClosed(f"handshake failed: {head.splitlines()[0] if head else 'no response'}")
        self.buf = b""

    def _connect(self, timeout):
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        no = [h.strip() for h in (os.environ.get("NO_PROXY") or os.environ.get("no_proxy") or "").split(",") if h.strip()]
        if proxy and not any(self.host.endswith(h.lstrip(".")) for h in no):
            p = urllib.parse.urlparse(proxy)
            s = socket.create_connection((p.hostname, p.port or 80), timeout=timeout)
            auth = ""
            if p.username:
                tok = base64.b64encode(f"{urllib.parse.unquote(p.username)}:{urllib.parse.unquote(p.password or '')}".encode()).decode()
                auth = f"Proxy-Authorization: Basic {tok}\r\n"
            s.sendall(f"CONNECT {self.host}:{self.port} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\n{auth}\r\n".encode())
            resp = b""
            while b"\r\n\r\n" not in resp:
                chunk = s.recv(4096)
                if not chunk:
                    raise WSClosed("proxy closed the tunnel")
                resp += chunk
            if b" 200" not in resp.split(b"\r\n", 1)[0]:
                raise WSClosed(f"proxy refused: {resp.split(b'\r\n', 1)[0].decode(errors='replace')}")
            return s
        return socket.create_connection((self.host, self.port), timeout=timeout)

    def _read_headers(self):
        data = b""
        while b"\r\n\r\n" not in data:
            chunk = self.sock.recv(4096)
            if not chunk:
                break
            data += chunk
        head, _, rest = data.partition(b"\r\n\r\n")
        self._pending = rest
        return head.decode(errors="replace")

    def _recv_exact(self, n):
        while len(self._pending) < n:
            chunk = self.sock.recv(65536)
            if not chunk:
                raise WSClosed("connection closed")
            self._pending += chunk
        out, self._pending = self._pending[:n], self._pending[n:]
        return out

    def _send_frame(self, opcode, payload):
        mask = os.urandom(4)
        n = len(payload)
        head = bytes([0x80 | opcode])
        if n < 126:
            head += bytes([0x80 | n])
        elif n < 65536:
            head += bytes([0x80 | 126]) + struct.pack(">H", n)
        else:
            head += bytes([0x80 | 127]) + struct.pack(">Q", n)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        self.sock.sendall(head + mask + masked)

    def send_json(self, obj):
        self._send_frame(0x1, json.dumps(obj).encode())

    def recv(self):
        """Next text message (str). Answers pings; raises WSClosed on close."""
        message = b""
        while True:
            b1, b2 = self._recv_exact(2)
            fin, op, n = b1 & 0x80, b1 & 0x0F, b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._recv_exact(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._recv_exact(8))[0]
            mask = self._recv_exact(4) if b2 & 0x80 else None
            data = self._recv_exact(n)
            if mask:
                data = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
            if op == 0x9:
                self._send_frame(0xA, data)
                continue
            if op == 0xA:
                continue
            if op == 0x8:
                raise WSClosed("server closed")
            message += data
            if fin:
                return message.decode(errors="replace")

    def close(self):
        try:
            self._send_frame(0x8, b"")
            self.sock.close()
        except OSError:
            pass
