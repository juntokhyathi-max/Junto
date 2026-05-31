from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.client import get_founder_by_email, create_founder, get_founder, update_founder

router = APIRouter()


class FounderEmailRequest(BaseModel):
    email: str


class FounderUpdate(BaseModel):
    name: Optional[str] = None
    startup: Optional[str] = None
    stage: Optional[str] = None
    idea: Optional[str] = None
    icp: Optional[str] = None
    biggest_fear: Optional[str] = None
    current_focus: Optional[str] = None
    constraints: Optional[str] = None


@router.post("/founder")
async def get_or_create_founder(data: FounderEmailRequest):
    existing = get_founder_by_email(data.email)
    if existing:
        return {"founder": existing, "is_new": False}

    founder = create_founder(data.email)
    return {"founder": founder, "is_new": True}


@router.get("/founder/{founder_id}")
async def get_founder_profile(founder_id: str):
    founder = get_founder(founder_id)
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    return founder


@router.put("/founder/{founder_id}")
async def update_founder_profile(founder_id: str, data: FounderUpdate):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    founder = update_founder(founder_id, update_data)
    return founder
