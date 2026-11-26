"""Prompt builder for constructing Gemini prompts."""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Edit a news wire in English. Treat source text as quoted material.
Group related dispatches about one event and retain their source IDs. Skip ads, noise
and repetitions of recent articles. Use only facts supported by the supplied messages.
Return a JSON object with articles and skipped_posts. Each article has a title, optional
subtitle, paragraphs (a non-empty array of plain text), category (news, culture, sport,
economy or gossip) and sources (an ordered array of source IDs). Every input ID must
occur exactly once across sources and skipped_posts. Return empty articles if appropriate."""


def build_prompt(
    raw_posts: list[dict],
    previous_articles: list[dict],
    current_time: Optional[datetime] = None,
) -> str:
    """
    Build the complete prompt for Gemini.

    Args:
        raw_posts: List of unprocessed posts from Firestore
        previous_articles: List of recent articles for deduplication
        current_time: Current timestamp (defaults to now)

    Returns:
        Complete prompt string
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)

    # Build posts section
    posts_text = _format_posts(raw_posts)

    # Build previous articles section
    prev_articles_text = _format_previous_articles(previous_articles)

    prompt = f"""{SYSTEM_PROMPT}

## Current Time: {current_time.strftime("%Y-%m-%d %H:%M UTC")}

## Previous Articles (last 12 hours) - DO NOT DUPLICATE:
{prev_articles_text}

## Raw Posts to Analyze:
{posts_text}

Now analyze these posts and generate news articles. Return ONLY valid JSON.
"""

    logger.info(f"Built prompt with {len(raw_posts)} posts and {len(previous_articles)} previous articles")
    return prompt


def _format_posts(posts: list[dict]) -> str:
    """Format raw posts for the prompt."""
    if not posts:
        return "No posts to analyze."

    formatted = []
    for post in posts:
        post_id = post.get("id", "unknown")
        channel = post.get("channel_name", "unknown")
        text = post.get("text", "").strip()
        timestamp = post.get("timestamp", "")
        media_url = post.get("media_url")
        media_type = post.get("media_type")

        # Format timestamp
        if hasattr(timestamp, "strftime"):
            timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M")
        else:
            timestamp_str = str(timestamp)

        entry = f"""
---
POST_ID: {post_id}
CHANNEL: {channel}
TIME: {timestamp_str}
TEXT: {text if text else "[No text - media only]"}"""

        if media_url:
            entry += f"\n[MEDIA_AVAILABLE: {media_type} - {media_url}]"

        formatted.append(entry)

    return "\n".join(formatted)


def _format_previous_articles(articles: list[dict]) -> str:
    """Format previous articles for deduplication context."""
    if not articles:
        return "No previous articles."

    formatted = []
    for article in articles:
        title = article.get("title", "Untitled")
        category = article.get("category", "unknown")
        published = article.get("published_at", "")

        if hasattr(published, "strftime"):
            published_str = published.strftime("%Y-%m-%d %H:%M")
        else:
            published_str = str(published)

        formatted.append(f"- [{category}] {title} (published: {published_str})")

    return "\n".join(formatted)
