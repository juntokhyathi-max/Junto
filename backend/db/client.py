from supabase import create_client, Client
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_KEY"],
        )
    return _client


def get_founder_by_email(email: str) -> Optional[dict]:
    result = get_client().table("founders").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None


def create_founder(email: str) -> dict:
    result = get_client().table("founders").insert({"email": email}).execute()
    return result.data[0]


def get_founder(founder_id: str) -> Optional[dict]:
    result = get_client().table("founders").select("*").eq("id", founder_id).execute()
    return result.data[0] if result.data else None


def update_founder(founder_id: str, data: dict) -> dict:
    result = get_client().table("founders").update(data).eq("id", founder_id).execute()
    return result.data[0]


def save_session(founder_id: str, summary: dict):
    get_client().table("sessions").insert({"founder_id": founder_id, **summary}).execute()


def get_recent_sessions(founder_id: str, limit: int = 5) -> list:
    result = (
        get_client()
        .table("sessions")
        .select("summary, key_decisions, assumptions, action_items, created_at")
        .eq("founder_id", founder_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def get_memory(founder_id: str) -> Optional[str]:
    result = get_client().table("memory").select("digest").eq("founder_id", founder_id).execute()
    return result.data[0]["digest"] if result.data else None


def update_memory(founder_id: str, digest: str):
    get_client().table("memory").upsert({"founder_id": founder_id, "digest": digest}).execute()


def get_session_count(founder_id: str) -> int:
    result = (
        get_client()
        .table("sessions")
        .select("id", count="exact")
        .eq("founder_id", founder_id)
        .execute()
    )
    return result.count or 0
