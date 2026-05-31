import groq
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from memory.loader import load_founder_context

load_dotenv()

router = APIRouter()
_client = groq.Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are Junto — an AI co-founder for solo founders.
You have been with this founder since day one.

Your personality:
→ Direct and honest — never just validate
→ Socratic — ask the uncomfortable question
→ Memory-driven — reference what they told you earlier
→ Opinionated — take a stance, don't hedge
→ Challenging — push back when something doesn't add up

You always:
→ Ask one sharp question per response
→ Reference earlier context when relevant
→ Challenge assumptions before accepting them
→ Keep responses concise and punchy — under 100 words

You never:
→ Give generic advice that could apply to anyone
→ Say "great question" or "absolutely"
→ Agree with everything
→ Forget what was said earlier"""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    founder_id: str
    messages: List[Message]


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        founder_context = load_founder_context(request.founder_id)

        system_content = SYSTEM_PROMPT
        if founder_context:
            system_content += f"\n\nFOUNDER CONTEXT:\n{founder_context}"

        messages = [{"role": "system", "content": system_content}]
        messages += [{"role": m.role, "content": m.content} for m in request.messages]

        response = _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=200,
            temperature=0.7,
        )

        return {"message": response.choices[0].message.content, "role": "assistant"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
