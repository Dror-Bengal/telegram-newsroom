"""Run from the repository root against a running Compose edition."""
import argparse
import os
from pathlib import Path
import subprocess
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--clean", action="store_true", help="Require the bulletin to be absent before replay")
parser.add_argument("--capture", type=Path, help="Save screenshots to this directory")
args = parser.parse_args()
base = "http://127.0.0.1:" + os.getenv("NEWSROOM_PORT", "18792")
headline = "Night shift opens at the print exchange"


def compose(*args):
    return subprocess.check_output(["docker", "compose", *args], text=True)


def counts():
    query = ("import sqlite3; d=sqlite3.connect('/data/news.db'); "
             "print(d.execute('select count(*) from raw_posts').fetchone()[0],"
             "d.execute('select count(*) from articles').fetchone()[0])")
    return list(map(int, compose("exec", "-T", "desk", "python", "-c", query).split()))


def capture(page, name):
    if args.capture:
        args.capture.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=args.capture / name, animations="disabled")


with sync_playwright() as p:
    browser = p.chromium.launch(channel=os.getenv("BROWSER_CHANNEL") or None)
    page = browser.new_page(viewport={"width": 1440, "height": 980}, timezone_id="UTC")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base, wait_until="networkidle")
    initial = counts()
    if args.clean:
        assert initial == [15, 15], initial
        expect(page.get_by_text(headline, exact=True)).to_have_count(0)

    # The initial illustrated edition travels through the same ingest and editor.
    lead = page.locator("main section").get_by_role("link").first
    expect(lead).to_contain_text("The open press returns")
    assert lead.locator("img").evaluate("(img) => img.complete && img.naturalWidth > 0")
    lead.click()
    expect(page.get_by_role("heading", level=1)).to_have_text("The open press returns for a weekend of two-color prints")
    expect(page.locator(".article-sources")).to_contain_text("Studio Wire · 100")
    for _ in range(2):
        compose("exec", "-T", "desk", "python", "newsroom.py", "replay", "examples/bulletin.json")
    after = counts()
    if args.clean:
        assert after == [16, 16], after

    page.goto(base, wait_until="networkidle")
    flash = page.locator("#bulletins").get_by_role("link").filter(has_text=headline)
    expect(flash).to_have_count(1)
    expect(page.locator(".animate-marquee")).to_contain_text(headline)
    capture(page, "homepage.png")
    flash.click()
    expect(page.get_by_role("heading", level=1)).to_have_text(headline)
    expect(page.locator(".prose")).to_contain_text("Doors open at seven.")
    story = urlsplit(page.url).path
    capture(page, "bulletin.png")
    page.locator(".article-sources a").click()
    expect(page.locator("main")).to_contain_text("Sample Telegram message · #101")
    expect(page.locator("main")).to_contain_text("Doors open at seven.")
    page.goto(base + "/category/culture")
    expect(page.locator("aside")).to_contain_text(headline)
    page.set_viewport_size({"width":390, "height":844})
    page.goto(base)
    page.get_by_role("button", name="Open menu").click()
    page.get_by_role("link", name="News wire", exact=True).last.click()
    expect(page.locator("#bulletins")).to_be_in_viewport()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    browser.close()
    print(f"PASS: {initial} → {after}; ticker, story, illustrated lead, source, category and mobile menu. {story}")
