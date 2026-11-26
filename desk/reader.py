import json
import re
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from newsroom import DATA


class Reader(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlsplit(self.path)
        if re.fullmatch(r"/media/\d+-\d+\.jpg", url.path):
            photo = DATA / "photos" / url.path.split("/")[-1]
            if photo.is_file():
                self.respond(200, photo.read_bytes(), "image/jpeg")
            else:
                self.send_error(404)
            return
        db = sqlite3.connect(f"file:{DATA / 'news.db'}?mode=ro", uri=True)
        db.row_factory = sqlite3.Row
        try:
            if url.path == "/articles":
                params = parse_qs(url.query)
                category = params.get("category", [None])[0]
                limit = min(200, max(1, int(params.get("limit", [40])[0])))
                rows = db.execute("""SELECT * FROM articles WHERE (? IS NULL OR category=?)
                                     ORDER BY published_at DESC,slug LIMIT ?""", (category, category, limit))
                value = [dict(r) for r in rows]
            elif url.path.startswith("/articles/"):
                row = db.execute("SELECT * FROM articles WHERE slug=?", (url.path.split("/")[-1],)).fetchone()
                value = dict(row) if row else None
            elif url.path.startswith("/source/"):
                row = db.execute("SELECT channel,message,stamp,text FROM raw_posts WHERE id=? AND demo=1",
                                 (url.path.split("/")[-1],)).fetchone()
                value = dict(row) if row else None
            else:
                self.send_error(404)
                return
            self.respond(200 if value is not None else 404, json.dumps(value).encode(), "application/json")
        except ValueError:
            self.send_error(400)
        finally:
            db.close()

    def respond(self, status, data, mime):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def serve():
    ThreadingHTTPServer(("0.0.0.0", 8000), Reader).serve_forever()
