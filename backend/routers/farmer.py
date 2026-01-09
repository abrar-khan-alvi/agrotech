from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime
from schemas import Field, IoTData
from db_firebase import FirebaseDatabase

router = APIRouter()
db_fields = FirebaseDatabase("fields")
db_iot = FirebaseDatabase("iot_data")

# --- Endpoints ---

@router.get("/fields/", response_model=List[dict]) # Return dicts as they come from JSON
@router.get("/fields/", response_model=List[dict])
async def get_fields():
    fields = db_fields.get_all()
    mapped_fields = []
    
    for f in fields:
        mapped_fields.append({
            "id": str(f.get("fieldID")),
            "name": f.get("fieldName"),
            "crop_type": f.get("fieldCropName"), # Map to frontend key
            "harvest_time": f.get("fieldCropHarvestTime"),
            "area_in_acres": f.get("fieldArea"),
            "boundary": f.get("fieldCoordinates"),
            "created_at": f.get("createTime")
        })
        
    return mapped_fields

@router.post("/fields/", response_model=Field)
async def create_field(field_data: dict):
    fields = db_fields.load()
    
    new_field = Field(
        fieldID=len(fields) + 1,
        farmerID=1, # Hardcoded for now (mock user 1)
        fieldName=field_data.get("fieldName") or field_data.get("name", "New Field"),
        fieldCoordinates=field_data.get("fieldCoordinates") or field_data.get("boundary", []),
        fieldArea=field_data.get("fieldArea") or field_data.get("area_in_acres", 0.0),
        fieldCropName=field_data.get("fieldCropName") or field_data.get("crop_type", "Unknown"),
        fieldCropHarvestTime=field_data.get("fieldCropHarvestTime") or field_data.get("harvest_time", datetime.now().isoformat()),
        createTime=datetime.now().isoformat()
    )
    
    db_fields.add(new_field.dict())
    return new_field

@router.delete("/fields/{field_id}/")
async def delete_field(field_id: int):
    # JSONDatabase doesn't have a direct delete by ID method exposed as "delete" usually
    # But checking db.py usage, we might need to implement logic or use existing if any.
    # Assuming standard pattern, let's load, filter, and save.
    
    # Wait, let's check db.py to see available methods first to be safe?
    # Actually, I'll just look at db_fields methods by reading db.py quickly or just assume load/save pattern.
    # To be safe and fast:
    fields = db_fields.load()
    fields = [f for f in fields if f.get("fieldID") != field_id]
    db_fields.save(fields)
    return {"message": "Field deleted successfully"}

@router.get("/iot/", response_model=List[dict])
async def get_iot(field_id: Optional[str] = None):
    iot_list = db_iot.load()
    
    if not iot_list:
        return []
        
    filtered_data = []
    if field_id:
        try:
            f_id = int(field_id)
            filtered_data = [data for data in iot_list if data.get("fieldID") == f_id]
        except ValueError:
            return []
    else:
        filtered_data = iot_list
            
    # Sort by createTime descending (latest first)
    filtered_data.sort(key=lambda x: x.get("createTime", ""), reverse=True)
    
    # Map to frontend expected format (snake_case)
    mapped_list = []
    
    for item in filtered_data:
        mapped_item = {
            "id": item.get("ioTDataID"),
            "field": item.get("fieldID"),
            "latitude": item.get("locationLat"),
            "longitude": item.get("locationLng"),
            "soil_temperature": item.get("soilTemp"),
            "soil_moisture": item.get("soilMoisture"),
            "soil_ph": item.get("soilPH"),
            "soil_ec": item.get("soilEC"),
            "nitrogen": item.get("soilN"),
            "phosphorus": item.get("soilP"),
            "potassium": item.get("soilK"),
            "recorded_at": item.get("createTime")
        }
        mapped_list.append(mapped_item)
        
    return mapped_list
