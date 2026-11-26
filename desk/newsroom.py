import argparse
import asyncio
import html
import json
import os
import re
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path

from wire import fetch_channels, from_file

DATA = Path(os.getenv("NEWS_DATA", "/data"))
EXAMPLES = Path(__file__).parent / "examples"
CATEGORIES = {"culture", "economy", "news", "sport", "gossip", "technology", "world", "society", "politics"}


def connect():
    DATA.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATA / "news.db", timeout=90)
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE IF NOT EXISTS raw_posts (
            id TEXT PRIMARY KEY, channel TEXT, message INTEGER, text TEXT, stamp TEXT,
            image TEXT, demo INTEGER, processed INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS articles (
            slug TEXT PRIMARY KEY, title TEXT, subtitle TEXT, content_html TEXT, category TEXT,
            primary_media_url TEXT, published_at TEXT);
        CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, cursor INTEGER);
    """)
    return db


def save(db, raw, image, demo):
    text = raw["text"].strip()
    if not text:
        return
    if image and not re.fullmatch(r"/(?:print-[0-5]\.jpg|media/\d+-\d+\.jpg)", image):
        raise ValueError("Unknown edition image")
    source_id = ("demo" if demo else "wire") + f'-{raw["channel_id"]}-{raw["message_id"]}'
    db.execute("""INSERT OR IGNORE INTO raw_posts
                  (id,channel,message,text,stamp,image,demo) VALUES (?,?,?,?,?,?,?)""",
               (source_id, raw["channel_name"], raw["message_id"], text,
                raw["timestamp"].astimezone(timezone.utc).isoformat(), image, int(demo)))


def dispatch(row):
    lines = [line.strip() for line in row["text"].splitlines() if line.strip()]
    category = "news"
    if len(lines) > 1 and lines[-1].startswith("#"):
        tag = lines[-1][1:].lower()
        if tag in CATEGORIES:
            category = tag
            lines.pop()
    return {"title": lines[0][:180], "subtitle": lines[1] if len(lines) > 2 else None,
            "paragraphs": lines[2:] if len(lines) > 2 else lines[1:] or [lines[0]],
            "category": category, "sources": [row["id"]]}


def publish(db, draft, posts):
    sources = [posts[key] for key in draft["sources"]]
    lead = sources[0]
    slug_prefix = re.sub(r"[^a-z0-9]+", "-", draft["title"].lower()).strip("-")[:65] or "dispatch"
    slug = slug_prefix + "-" + lead["id"]
    paragraphs = "".join(f"<p>{html.escape(p)}</p>" for p in draft["paragraphs"])
    links = []
    for source in sources:
        channel = source["channel"]
        if source["demo"]:
            url = "/source/" + source["id"]
        else:
            if not re.fullmatch(r"[A-Za-z0-9_]+", channel):
                raise ValueError("Invalid source channel")
            url = f'https://t.me/{channel}/{source["message"]}'
        links.append(f'<a href="{url}">{html.escape(channel)} · {source["message"]}</a>')
    body = paragraphs + '<div class="article-sources"><p><strong>Source</strong> ' + ", ".join(links) + "</p></div>"
    image = next((r["image"] for r in sources if r["image"]), None)
    db.execute("INSERT INTO articles VALUES (?,?,?,?,?,?,?)",
               (slug, draft["title"], draft.get("subtitle"), body, draft["category"], image,
                max(r["stamp"] for r in sources)))


def edit(db, demo=None):
    # Keep article creation and acknowledgement atomic across workers and retries.
    db.execute("BEGIN IMMEDIATE")
    try:
        rows = db.execute("""SELECT * FROM raw_posts WHERE processed=0 AND (? IS NULL OR demo=?)
                             ORDER BY stamp,id LIMIT 50""", (demo, demo)).fetchall()
        if rows:
            posts = {r["id"]: r for r in rows}
            if os.getenv("EDITOR_MODE", "wire") == "gemini":
                from editor import generate
                recent = [dict(r) for r in db.execute("SELECT title,category,published_at FROM articles ORDER BY published_at DESC LIMIT 50")]
                drafts = generate(posts, recent)
            else:
                drafts = [dispatch(r) for r in rows]
            for draft in drafts:
                publish(db, draft, posts)
            db.executemany("UPDATE raw_posts SET processed=1 WHERE id=?", [(k,) for k in posts])
        db.commit()
        return len(rows)
    except BaseException:
        db.rollback()
        raise


def replay(db, path):
    with db:
        for raw, image in from_file(path):
            save(db, raw, image, demo=True)
    while edit(db, demo=True):
        pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["serve", "replay", "live"])
    parser.add_argument("file", nargs="?")
    args = parser.parse_args()
    db = connect()
    if args.action == "serve":
        if os.getenv("SEED_EDITION", "1") == "1":
            replay(db, EXAMPLES / "edition.json")
        from reader import serve
        serve()
    elif args.action == "replay":
        if not args.file:
            parser.error("replay requires a fixture file")
        replay(db, args.file)
    else:
        while True:
            asyncio.run(fetch_channels(db, save))
            while edit(db, demo=False):
                pass
            time.sleep(60)


if __name__ == "__main__":
    main()
