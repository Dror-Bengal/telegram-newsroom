"""Optional newsroom editor. Validate full batch coverage before acknowledging input."""
import json
import os
import re
from urllib.request import Request, urlopen

from prompt_builder import build_prompt

CATEGORIES = {"news", "culture", "sport", "economy", "gossip"}


def validate(result, posts):
    drafts = result["articles"]
    seen = list(result["skipped_posts"])
    for draft in drafts:
        if not (isinstance(draft["title"], str) and draft["title"].strip() and draft["category"] in CATEGORIES
                and isinstance(draft["paragraphs"], list) and draft["paragraphs"]
                and all(isinstance(p, str) and p.strip() for p in draft["paragraphs"])
                and isinstance(draft["sources"], list) and draft["sources"]):
            raise ValueError("Invalid article returned by editor")
        if draft.get("subtitle") is not None and not isinstance(draft["subtitle"], str):
            raise ValueError("Invalid subtitle returned by editor")
        seen.extend(draft["sources"])
    if sorted(posts) != sorted(seen):
        raise ValueError("Editor must account for each supplied message exactly once")
    return drafts


def generate(posts, recent):
    raw = [{"id": r["id"], "channel_name": r["channel"], "timestamp": r["stamp"], "text": r["text"]}
           for r in posts.values()]
    model = os.environ["GEMINI_MODEL"]
    if not re.fullmatch(r"[A-Za-z0-9.-]+", model):
        raise ValueError("Invalid model name")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {"contents": [{"parts": [{"text": build_prompt(raw, recent)}]}],
               "generationConfig": {"responseMimeType": "application/json"}}
    req = Request(url, data=json.dumps(payload).encode(),
                  headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    with urlopen(req, timeout=60) as response:
        parts = json.load(response)["candidates"][0]["content"]["parts"]
    return validate(json.loads("".join(p["text"] for p in parts if not p.get("thought"))), posts)
