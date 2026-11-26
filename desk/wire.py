"""Replay and live transports share the original newsroom's Telethon parser."""
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import Message, PeerChannel

from telegram_client import parse_message


def normalize(message, channel, username):
    raw = parse_message(message, channel, username)
    return {key: raw[key] for key in ("message_id", "channel_id", "channel_name", "text", "timestamp")}



def from_file(path):
    items = json.loads(Path(path).read_text())
    for item in items:
        date = (datetime.fromisoformat(item["date"]) if item.get("date")
                else datetime.now(timezone.utc) - timedelta(minutes=item.get("minutes_ago", 0)))
        message = Message(id=item["id"], peer_id=PeerChannel(item["channel_id"]),
                          date=date, message=item["message"], post=True)
        yield normalize(message, item["channel_id"], item["channel"]), item.get("image")


async def fetch_channels(db, save):
    client = TelegramClient(StringSession(os.environ["TELEGRAM_SESSION"]),
                            int(os.environ["TELEGRAM_API_ID"]), os.environ["TELEGRAM_API_HASH"])
    channels = [name.strip() for name in os.environ["TELEGRAM_CHANNELS"].split(",") if name.strip()]
    if not channels:
        raise ValueError("Configure at least one source channel")
    await client.connect()
    try:
        if not await client.is_user_authorized():
            raise RuntimeError("The supplied session is not authorized")
        for name in channels:
            entity = await client.get_entity(name)
            if not getattr(entity, "username", None):
                raise ValueError("Choose a channel with a public source permalink")
            row = db.execute("SELECT cursor FROM channels WHERE id=?", (entity.id,)).fetchone()
            if row is None:
                messages = list(reversed(await client.get_messages(entity, limit=50)))
            else:
                messages = [m async for m in client.iter_messages(entity, min_id=row[0], reverse=True, limit=100)]
            for message in messages:
                if isinstance(message, Message) and message.message:
                    raw = normalize(message, entity.id, entity.username)
                    image = None
                    if message.photo:
                        directory = Path(os.environ.get("NEWS_DATA", "/data")) / "photos"
                        directory.mkdir(exist_ok=True)
                        name = f"{entity.id}-{message.id}.jpg"
                        file = directory / name
                        temp = directory / (name + ".part")
                        with temp.open("wb") as output:
                            await client.download_media(message, file=output, thumb=-1)
                        temp.replace(file)
                        image = "/media/" + name
                    save(db, raw, image, demo=False)
                db.execute("""INSERT INTO channels VALUES (?,?) ON CONFLICT(id) DO UPDATE
                              SET cursor=max(cursor,excluded.cursor)""", (entity.id, message.id))
                db.commit()
    finally:
        await client.disconnect()
