from fastapi import APIRouter
from typing import List
from schemas import Expert
from db import JSONDatabase

router = APIRouter()
db_experts = JSONDatabase("experts")
db_consultations = JSONDatabase("consultations")

# --- Endpoints ---

@router.get("/expert/profile/", response_model=dict)
async def get_profile():
    # Return first expert as "logged in" user
    experts = db_experts.load()
    return experts[0] if experts else {}

@router.patch("/expert/profile/", response_model=dict)
async def update_profile(data: dict):
    experts = db_experts.load()
    if not experts:
        return {}
        
    current_expert = experts[0] # Mock logged in user
    current_expert.update(data)
    
    # Save back (update logic needed in DB or just overwrite list)
    # The DB utility update method
    db_experts.update("expertID", current_expert["expertID"], current_expert)
    
    return current_expert

@router.get("/consultations/")
async def get_consultations():
    return db_consultations.load()

@router.patch("/consultations/{id}/")
async def update_consultation(id: int, data: dict):
    consultations = db_consultations.load()
    target = next((c for c in consultations if c["id"] == id), None)
    
    if target:
        target.update(data)
        db_consultations.update("id", id, target)
        return target
    return {"error": "Not found"}

@router.get("/experts/", response_model=List[dict])
async def get_all_experts():
    return db_experts.load()

@router.get("/experts/{id}/", response_model=dict)
async def get_expert_detail(id: int):
    experts = db_experts.load()
    target = next((e for e in experts if e["expertID"] == id), None)
    return target if target else {}
