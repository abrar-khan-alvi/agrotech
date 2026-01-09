from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime
from schemas import AdviceReport, SourceType
from db_firebase import FirebaseDatabase

router = APIRouter()
db_advice = FirebaseDatabase("advice_reports")

# --- Endpoints ---

@router.get("/expert-advice/", response_model=List[dict])
async def get_advice(field: Optional[int] = None):
    # Filter for Expert sources
    reports = db_advice.load()
    expert_reports = [r for r in reports if r.get("sourceType") == SourceType.EXPERT]
    
    if field:
        expert_reports = [r for r in expert_reports if r.get("fieldId") == field]
        
    # Map to frontend interface
    mapped_reports = []
    for r in expert_reports:
        # Construct advice object from the list of advices or raw string
        # Frontend expects 'advice' to be an object with problemSummary, diagnosis, etc.
        # But mock data has strict structure. We'll map "evidence" to problemSummary
        # and list of actions to recommendation
        
        advice_list = r.get("advices", [])
        recommendation = ", ".join([a.get("action", "") for a in advice_list])
        
        advice_obj = {
            "problemSummary": r.get("evidence", "Issue detected"),
            "diagnosis": r.get("riskType", "Unknown issue"),
            "recommendation": recommendation,
            "urgency": r.get("severity", "medium"),
            "followUp": True
        }
        
        mapped_reports.append({
            "id": r.get("reportId"),
            "expert": r.get("sourceId"), # Use sourceId as expert ID
            "field": r.get("fieldId"), 
            "advice": advice_obj,
            "created_at": r.get("createdAt")
        })
        
    return mapped_reports

@router.post("/expert-advice/")
async def post_advice(report_data: dict):
    # Accept dict to avoid validation issues on strict Enums if necessary, but ideally use Schema
    reports = db_advice.load()
    
    # Assign ID
    report_data["reportId"] = len(reports) + 1
    report_data["createdAt"] = datetime.now().isoformat()
    
    db_advice.add(report_data)
    return report_data

@router.get("/ai-consultations/", response_model=List[dict])
@router.get("/ai-consultations/", response_model=List[dict])
async def get_ai_consultations(field_id: Optional[int] = None):
    reports = db_advice.load()
    ai_reports = [r for r in reports if r.get("sourceType") == SourceType.AI]
    
    if field_id:
        ai_reports = [r for r in ai_reports if r.get("fieldId") == field_id]
    
    # Map to frontend interface
    mapped_reports = []
    for r in ai_reports:
        mapped_reports.append({
            "id": r.get("reportId"),
            "field": r.get("fieldId"),
            "advice": r.get("advices"), # Map advices array to 'advice' prop
            "input_data": r.get("evidence"),
            "created_at": r.get("createdAt") # Map to snake_case
        })
        
    return mapped_reports
