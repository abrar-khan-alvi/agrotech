from fastapi import APIRouter
from typing import List
from schemas import Expert
# form db import JSONDatabase # Removed
from db_firebase import FirebaseDatabase

router = APIRouter()
db_experts = FirebaseDatabase("experts")
db_consultations = FirebaseDatabase("consultations")


# --- Endpoints ---

from typing import List, Union

@router.get("/expert/profile/", response_model=dict)
async def get_profile(id: Union[int, str] = None):
    # For now, return the first expert or specific if ID provided (mocking session)
    experts = db_experts.load()
    if not experts:
        return {}
    
    if id:
         target = next((e for e in experts if e.get("expertID") == id or str(e.get("expertID")) == str(id)), None)
         return target if target else {}

    # Default to first one if no auth context yet (mock)
    return experts[0] if experts else {}

@router.patch("/expert/profile/", response_model=dict)
async def update_profile(data: dict):
    experts = db_experts.load()
    if not experts:
        return {}
        
    # Mock logged in user - in real app get from token
    # We need to identifying who to update. 
    # Attempt to find by ID in data, or fallback to first
    target_expert = None
    target_id = data.get("expertID")
    
    if target_id:
         target_expert = next((e for e in experts if str(e.get("expertID")) == str(target_id)), None)
    else:
         target_expert = experts[0] # Fallback
         target_id = target_expert.get("expertID")
    
    if target_expert:
        # Status Update Logic
        new_status = None
        if "is_online" in data:
            new_status = "online" if data["is_online"] else "offline"
            del data["is_online"]
            
        # Remove 'status' from data if it exists to prevent stale overwrites from frontend state
        if "status" in data:
            del data["status"]

        # Map Frontend keys to Backend Expert Schema keys
        key_mapping = {
            "name": "expertName",
            "phone": "expertPhoneNumber",
            "email": "expertEmail",
            "division": "expertDivision",
            "district": "expertDistrict",
            "upazila": "expertUpazila",
            "address": "expertAddress",
            "bio": "expertBio",
            "education": "expertQualification", 
            "experience_years": "expertExperience",
            "profile_picture": "expertProfilePicture",
            "avatar": "expertProfilePicture",
            "specialization": "expertSpecialization",
            "title": "expertTitle",
            "affiliation": "expertAffiliation"
        }
        
        for fe_key, be_key in key_mapping.items():
            if fe_key in data:
                data[be_key] = data[fe_key]
                # Remove the frontend key to prevent double storage in DB
                del data[fe_key]

        # Apply updates
        target_expert.update(data)
        
        # CLEANUP: Remove frontend keys from the FINAL object to be saved, 
        # to ensure legacy duplicates are removed from the database.
        # We aggressively clean common frontend keys that might have persisted.
        keys_to_clean = list(key_mapping.keys()) + [
            "rating", "reviews", 
            "id", "password", 
            "nid", "isVerified", "verified", 
            "role"
        ]
        
        for key in keys_to_clean:
            if key in target_expert:
                del target_expert[key]
        
        # Apply strict status update if requested
        if new_status:
            target_expert["status"] = new_status
            
        # Update in Firebase
        # Update in Firebase
        # Using "expertID" as the key to find the record
        db_experts.update("expertID", target_id, target_expert)
        return target_expert
    
    return {}

@router.get("/experts/", response_model=List[dict])
async def get_all_experts():
    experts = db_experts.load()
    mapped_experts = []
    
    for e in experts:
        # Robust handling if fields missing
        mapped_experts.append({
            "id": str(e.get("expertID", "")),
            "user": e.get("expertID"), 
            "name": e.get("expertName", "Unknown"),
            "specialization": e.get("expertSpecialization", "Agronomist"),
            "title": e.get("expertTitle", "Expert"),
            "bio": e.get("expertBio", ""),
            "experience_years": e.get("expertExperience", 0),
            "rating": e.get("expertRating", 0),
            "is_online": e.get("status") == "online",
            "profile_picture": e.get("expertProfilePicture")
        })
        
    return mapped_experts

@router.get("/experts/{id}/", response_model=dict)
async def get_expert_detail(id: int):
    experts = db_experts.load()
    target = next((e for e in experts if e.get("expertID") == id or str(e.get("expertID")) == str(id)), None)
    return target if target else {}

# --- Consultation Endpoints (Firebase) ---

from datetime import datetime

@router.post("/consultations/", response_model=dict)
async def create_consultation(req: dict):
    consultations = db_consultations.load()
    
    # Generate ID
    new_id = len(consultations) + 1
    
    # Construct object
    new_consultation = {
        "id": new_id,
        "expertID": req.get("expert"), # Frontend sends 'expert' (id)
        "fieldID": req.get("field"),
        "issueType": req.get("issue_type"),
        "description": req.get("description"),
        "status": req.get("status", "PENDING"),
        "assignedDate": datetime.now().isoformat(),
        "createTime": datetime.now().isoformat(),
        # Mock Farmer Info (Since we don't have full auth context in this mock payload usually)
        # In real app, get from request.user
        "farmerID": "f123",  # Mock default
        "farmer": {
             "name": "rahim",
             "avatar": "https://i.pravatar.cc/150?u=rahim"
        },
        "field": {
             "crop": "Paddy",
             "location": "North Field"
        }
    }
    
    db_consultations.add(new_consultation)
    return new_consultation

@router.get("/consultations/assignments", response_model=List[dict])
async def get_consultation_assignments(expert_id: Union[int, str] = None):
    """
    Returns a list of consultations assigned to the 'logged in' expert.
    """
    all_consultations = db_consultations.load()
    
    if expert_id:
        # Filter by expert_id (assuming the consultation record has 'expertId' or 'expert_id')
        # DB schema check needed? Assuming 'expertID' based on other schemas, or 'expert_id'.
        # Let's check common.py or just be robust.
        return [c for c in all_consultations if str(c.get("expertID")) == str(expert_id) or str(c.get("expert_id")) == str(expert_id)]
        
    # If no ID provided, return all (fallback for testing) or empty? 
    # Returning all might confuse user again. Let's return empty if no ID to be strict, 
    # OR all if truly mock mode. Let's stick to ALL for backward compat but UI will now send ID.
    return all_consultations

@router.post("/consultations/{id}/accept")
async def accept_consultation(id: str):
    return _update_consultation_status(id, "ACCEPTED")

@router.post("/consultations/{id}/reject")
async def reject_consultation(id: str):
    return _update_consultation_status(id, "REJECTED")

@router.post("/consultations/{id}/complete")
async def complete_consultation(id: str):
    return _update_consultation_status(id, "COMPLETED")

def _update_consultation_status(id: str, status: str):
    consultations = db_consultations.load()
    target = None
    target_idx = -1
    
    # ID matching logic (string vs int)
    for i, c in enumerate(consultations):
        if str(c.get("id")) == str(id):
            target = c
            target_idx = i
            break
            
    if target:
        target["status"] = status
        db_consultations.update("id", id, target)
        return {"message": f"Consultation {status}", "id": id, "status": status}
        
    # If not found, return error or mock success?
    return {"message": "Consultation not found (or mocked success)", "id": id, "status": status}

