import asyncio
import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from telethon.tl.types import Message, PeerChannel
import editor
import newsroom
import wire


class DeskTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.enterContext(patch.object(newsroom, "DATA", Path(tmp.name)))
        self.db = newsroom.connect()
        self.addCleanup(self.db.close)

    def test_two_channels_and_duplicate(self):
        row, image = next(wire.from_file(newsroom.EXAMPLES / "bulletin.json"))
        with self.db:
            for channel in (41, 41, 42):
                newsroom.save(self.db, {**row, "channel_id": channel}, image, demo=True)
        self.assertEqual(newsroom.edit(self.db), 2)
        self.assertEqual(newsroom.edit(self.db), 0)
        self.assertEqual(self.db.execute("SELECT count(DISTINCT slug) FROM articles").fetchone()[0], 2)

    def test_editor_failure_leaves_messages_pending(self):
        row, image = next(wire.from_file(newsroom.EXAMPLES / "bulletin.json"))
        with self.db:
            newsroom.save(self.db, row, image, demo=True)
        with patch.dict(os.environ, EDITOR_MODE="gemini"), patch.object(editor, "generate", side_effect=TimeoutError):
            with self.assertRaises(TimeoutError):
                newsroom.edit(self.db)
        self.assertEqual(self.db.execute("SELECT processed FROM raw_posts").fetchone()[0], 0)
        self.assertEqual(newsroom.edit(self.db), 1)

    def test_poll_and_resume(self):
        def message(number):
            return Message(id=number, peer_id=PeerChannel(45), date=datetime.now(timezone.utc),
                           message=f"Dispatch {number}\nA note on paper & ink.", post=True)
        client = AsyncMock()
        client.get_entity.return_value = SimpleNamespace(id=45, username="example_wire")
        client.get_messages.return_value = [message(9), message(8)]
        async def updates(entity, min_id, reverse, limit):
            self.assertEqual((min_id, reverse), (9, True))
            yield message(10)
        client.iter_messages = updates
        config = {"TELEGRAM_SESSION": "", "TELEGRAM_API_ID": "1", "TELEGRAM_API_HASH": "", "TELEGRAM_CHANNELS": "example_wire"}
        with patch.dict(os.environ, config), patch.object(wire, "TelegramClient", return_value=client):
            for _ in range(2):
                asyncio.run(wire.fetch_channels(self.db, newsroom.save))
                newsroom.edit(self.db)
        self.assertEqual(self.db.execute("SELECT cursor FROM channels").fetchone()[0], 10)
        self.assertEqual(self.db.execute("SELECT count(*) FROM articles").fetchone()[0], 3)
        html = self.db.execute("SELECT content_html FROM articles WHERE title='Dispatch 10'").fetchone()[0]
        self.assertIn("https://t.me/example_wire/10", html)
        self.assertIn("paper &amp; ink", html)

    def test_editor_validates_cluster_and_skips(self):
        article = {"title": "Open edition", "paragraphs": ["New proofs today."], "category": "news", "sources": ["a","b"]}
        posts = dict.fromkeys("abc")
        self.assertEqual(editor.validate({"articles": [article], "skipped_posts": ["c"]}, posts), [article])
        for invalid in ([], ["b"], ["d"], ["a","c"]):
            with self.assertRaises(ValueError):
                editor.validate({"articles": [article], "skipped_posts": invalid}, posts)


if __name__ == "__main__":
    unittest.main()
