from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from db.client import save_session, get_session_count
from memory.summarizer import summarize_session
from memory.compressor import compress_sessions

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class SessionSaveRequest(BaseModel):
    founder_id: str
    messages: List[Message]


@router.post("/session/save")
async def save_session_endpoint(request: SessionSaveRequest):
    real_messages = [m for m in request.messages if m.role != "system"]
    if len(real_messages) < 2:
        return {"status": "skipped", "reason": "Not enough messages"}

    try:
        summary = summarize_session([m.dict() for m in real_messages])
        save_session(request.founder_id, summary)

        count = get_session_count(request.founder_id)
        if count > 7:
            compress_sessions(request.founder_id)

        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
