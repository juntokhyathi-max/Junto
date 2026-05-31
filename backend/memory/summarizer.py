import groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

_client = groq.Groq(api_key=os.environ.get("GROQ_API_KEY"))


def summarize_session(messages: list) -> dict:
    conversation = "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in messages
        if m["role"] != "system"
    )

    prompt = f"""Analyze this founder coaching session and extract:

Return ONLY a JSON object with these exact keys:
{{
  "summary": "max 100 words of what was discussed",
  "key_decisions": "bullet points of decisions made",
  "assumptions": "bullet points of beliefs surfaced",
  "action_items": "bullet points of next steps"
}}

No preamble. No markdown. Just the JSON object.

Session:
{conversation}
"""

    response = _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
    )

    text = response.choices[0].message.content.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"summary": text, "key_decisions": "", "assumptions": "", "action_items": ""}
