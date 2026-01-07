from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from schemas import Farmer, Expert, UserStatus
from datetime import datetime
from db import JSONDatabase

router = APIRouter()
db_farmers = JSONDatabase("farmers")
db_experts = JSONDatabase("experts")

# --- Models ---
class PhoneRequest(BaseModel):
    phone: str

class VerifyOtpRequest(BaseModel):
    phone: str
    code: str

class LoginRequest(BaseModel):
    phone: str
    password: str

# --- Mock Data ---
MOCK_TOKENS = {
    "access": "mock_access_token_12345",
    "refresh": "mock_refresh_token_67890",
    "pre_auth_token": "mock_pre_auth_token_abcde"
}

# --- Farmer Auth Endpoints ---

@router.post("/auth/check-status/")
async def check_status(req: PhoneRequest):
    farmers = db_farmers.load()
    farmer = next((f for f in farmers if f["farmerPhoneNumber"] == req.phone), None)
    
    if farmer:
        # Check if password exists and is not null/empty
        is_password_set = bool(farmer.get("farmerPassword"))
        return {"exists": True, "is_password_set": is_password_set}
    
    return {"exists": False, "is_password_set": False}

@router.post("/auth/otp/send/")
async def send_otp_farmer(req: PhoneRequest):
    return {"message": "OTP sent successfully", "otp": "1234"}

@router.post("/auth/otp/verify/")
async def verify_otp_farmer(req: VerifyOtpRequest):
    if req.code == "1234":
        farmers = db_farmers.load()
        farmer_data = next((f for f in farmers if f["farmerPhoneNumber"] == req.phone), None)
        
        if farmer_data:
            return {
                "action": "login",
                "access": MOCK_TOKENS["access"],
                "refresh": MOCK_TOKENS["refresh"],
                "user": farmer_data,
                "message": "Login successful"
            }
        else:
            return {
                "action": "register",
                "message": "OTP Verified. Redirecting to registration.",
                "pre_auth_token": "mock_pre_auth_token_xyz"
            }
    return {"message": "Invalid OTP"}, 400

@router.post("/auth/register/")
async def register_farmer(req: dict):
    farmers = db_farmers.load()
    new_id = len(farmers) + 1
    
    # Create persistent mocked user
    # In real app, proper validation required
    new_farmer = Farmer(
        farmerID=new_id,
        farmerName=req.get("name", "New Farmer"),
        farmerPhoneNumber=req.get("phone", ""),
        farmerDivision=req.get("division", ""),
        farmerDistrict=req.get("district", ""),
        farmerUpazila=req.get("upazila", ""),
        farmerAddress=req.get("address", ""),
        farmerPassword=req.get("password", ""), # Save password
        createTime=datetime.now().isoformat()
    )
    
    db_farmers.add(new_farmer.dict())
    
    return {
        "access": MOCK_TOKENS["access"],
        "refresh": MOCK_TOKENS["refresh"],
        "user": new_farmer.dict(),
        "message": "Registration successful"
    }

@router.post("/auth/login/")
async def login_farmer(req: LoginRequest):
    farmers = db_farmers.load()
    farmer_data = next((f for f in farmers if f["farmerPhoneNumber"] == req.phone), None)
    
    # Match password from DB
    if farmer_data:
        stored_password = farmer_data.get("farmerPassword")
        if stored_password and stored_password == req.password:
             return {
                "access": MOCK_TOKENS["access"],
                "refresh": MOCK_TOKENS["refresh"],
                "user": farmer_data
            }
    
    raise HTTPException(status_code=400, detail="Invalid credentials")

# --- Expert Auth Endpoints ---

@router.post("/experts/auth/otp/send/")
async def send_otp_expert(req: PhoneRequest):
    return {"message": "OTP sent successfully", "otp": "5678"}

@router.post("/experts/auth/otp/verify/")
async def verify_otp_expert(req: VerifyOtpRequest):
    if req.code == "5678":
        experts = db_experts.load()
        expert_data = next((e for e in experts if e["expertPhoneNumber"] == req.phone), None)
        
        # If expert doesn't exist in mock DB, create a dummy or just return basic info for now (register flow)
        uid = str(expert_data["expertID"]) if expert_data else "new_expert"

        return {
            "token": MOCK_TOKENS["access"],
            "uid": uid,
            "phone": req.phone
        }
    raise HTTPException(status_code=400, detail="Invalid OTP")

@router.post("/experts/auth/register/")
async def register_expert(req: dict):
    # Ignoring detailed register implementation for expert for brevity, but pattern is same
    pass

@router.post("/experts/auth/login/")
async def login_expert(req: LoginRequest):
    # Simple mock login
    pass

# --- Common ---

@router.post("/token/refresh/")
async def refresh_token(req: dict):
    return {"access": "brand_new_mock_access_token"}
