from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime
from schemas import AdviceReport, SourceType
from db import JSONDatabase

router = APIRouter()
db_advice = JSONDatabase("advice_reports")

# --- Endpoints ---

@router.get("/expert-advice/", response_model=List[dict])
async def get_advice(field: Optional[int] = None):
    # Filter for Expert sources
    reports = db_advice.load()
    expert_reports = [r for r in reports if r.get("sourceType") == SourceType.EXPERT]
    
    if field:
        return [r for r in expert_reports if r.get("fieldId") == field]
    return expert_reports

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
async def get_ai_consultations():
    reports = db_advice.load()
    return [r for r in reports if r.get("sourceType") == SourceType.AI]
