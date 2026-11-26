"""MTProto message normalization from the original channel scraper."""
from telethon.tl.types import Message, MessageMediaPhoto, MessageMediaDocument


def parse_message(
    message: Message, channel_id: int, channel_name: str
) -> dict:
    """Parse a Telegram message into a structured dict."""
    media_info = _extract_media_info(message)

    return {
        "message_id": message.id,
        "channel_id": channel_id,
        "channel_name": channel_name,
        "text": message.message or "",
        "timestamp": message.date,
        "has_media": message.media is not None,
        "media_type": media_info.get("type"),
        "media_file_id": media_info.get("file_id"),
        "media_mime_type": media_info.get("mime_type"),
        "raw_message": message,  # Keep for media download
    }

def _extract_media_info(message: Message) -> dict:
    """Extract media information from a message."""
    if not message.media:
        return {}

    if isinstance(message.media, MessageMediaPhoto):
        return {
            "type": "image",
            "file_id": message.media.photo.id,
            "mime_type": "image/jpeg",
        }

    if isinstance(message.media, MessageMediaDocument):
        doc = message.media.document
        mime_type = doc.mime_type

        # Determine if video or other document
        if mime_type and mime_type.startswith("video"):
            media_type = "video"
        elif mime_type and mime_type.startswith("image"):
            media_type = "image"
        else:
            media_type = "document"

        return {
            "type": media_type,
            "file_id": doc.id,
            "mime_type": mime_type,
        }

    return {}
