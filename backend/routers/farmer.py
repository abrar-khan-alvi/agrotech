from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime
from schemas import Field, IoTData
from db import JSONDatabase

router = APIRouter()
db_fields = JSONDatabase("fields")
db_iot = JSONDatabase("iot_data")

# --- Endpoints ---

@router.get("/fields/", response_model=List[dict]) # Return dicts as they come from JSON
async def get_fields():
    return db_fields.get_all()

@router.post("/fields/", response_model=Field)
async def create_field(field_data: dict):
    fields = db_fields.load()
    
    new_field = Field(
        fieldID=len(fields) + 1,
        farmerID=1, # Hardcoded for now (mock user 1)
        fieldName=field_data.get("fieldName", "New Field"),
        fieldCoordinates=field_data.get("fieldCoordinates", []),
        fieldArea=field_data.get("fieldArea", 0.0),
        fieldCropName=field_data.get("fieldCropName", "Unknown"),
        fieldCropHarvestTime=field_data.get("fieldCropHarvestTime", datetime.now().isoformat()),
        createTime=datetime.now().isoformat()
    )
    
    db_fields.add(new_field.dict())
    return new_field

@router.get("/iot/", response_model=Optional[dict])
async def get_iot(field_id: Optional[str] = None):
    iot_list = db_iot.load()
    if not iot_list:
        return None
    # Just return first mock data for simplicity or filter if field_id provided
    return iot_list[0]
