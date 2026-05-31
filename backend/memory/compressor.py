import groq
import os
from dotenv import load_dotenv
from db.client import get_recent_sessions, update_memory

load_dotenv()

_client = groq.Groq(api_key=os.environ.get("GROQ_API_KEY"))


def compress_sessions(founder_id: str):
    sessions = get_recent_sessions(founder_id, limit=10)
    if not sessions:
        return

    all_summaries = "\n\n".join(
        f"Session {i + 1}:\n{s.get('summary', '')}\nDecisions: {s.get('key_decisions', '')}"
        for i, s in enumerate(sessions)
    )

    prompt = f"""Compress these founder journey sessions into a single 150-word digest.

Preserve:
- Key decisions and why they were made
- Major turning points
- Recurring themes and patterns
- Current trajectory

Sessions:
{all_summaries}

Return plain text only. No headers. No markdown."""

    response = _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
    )

    digest = response.choices[0].message.content.strip()
    update_memory(founder_id, digest)
