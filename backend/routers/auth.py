from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Any
from schemas import Farmer, Expert, UserStatus
from datetime import datetime
from db_firebase import FirebaseDatabase
import base64

router = APIRouter()
db_farmers = FirebaseDatabase("farmers")
db_experts = FirebaseDatabase("experts")

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

# --- Helper ---
def normalize_phone(phone: Any) -> str:
    if not phone:
        return ""
    p = str(phone).strip().replace("+88", "").replace("-", "").replace(" ", "")
    return p.lstrip("0")

# --- Farmer Auth Endpoints ---

@router.post("/auth/check-status/")
async def check_status(req: PhoneRequest):
    farmers = db_farmers.load()
    print(f"DEBUG: Checking status for {req.phone}")
    
    req_phone_norm = normalize_phone(req.phone)
    
    # Robust matching
    farmer = next((f for f in farmers if normalize_phone(f.get("farmerPhoneNumber")) == req_phone_norm), None)
    
    if farmer:
        print(f"DEBUG: Found farmer {farmer.get('farmerName')}")
        # Check if password exists and is not null/empty
        is_password_set = bool(farmer.get("farmerPassword"))
        return {"exists": True, "is_password_set": is_password_set}
    
    print("DEBUG: Farmer not found")
    return {"exists": False, "is_password_set": False}

@router.post("/auth/otp/send/")
async def send_otp_farmer(req: PhoneRequest):
    return {"message": "OTP sent successfully", "otp": "1234"}

@router.post("/auth/otp/verify/")
async def verify_otp_farmer(req: VerifyOtpRequest):
    if req.code == "1234":
        farmers = db_farmers.load()
        req_phone_norm = normalize_phone(req.phone)
        farmer_data = next((f for f in farmers if normalize_phone(f.get("farmerPhoneNumber")) == req_phone_norm), None)
        
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
        farmerNID=req.get("nid", ""),
        farmerProfilePicture=req.get("profilePicture", ""),
        isSmartPhoneUser=req.get("isSmartPhoneUser", True),
        createTime=datetime.now().isoformat()
    )
    
    db_farmers.add(new_farmer.dict())
    
    return {
        "message": "Registration successful. Please login."
    }

@router.post("/auth/login/")
async def login_farmer(req: LoginRequest):
    farmers = db_farmers.load()
    req_phone_norm = normalize_phone(req.phone)
    farmer_data = next((f for f in farmers if normalize_phone(f.get("farmerPhoneNumber")) == req_phone_norm), None)
    
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

@router.get("/profile/")
async def get_profile(id: str):
    farmers = db_farmers.load()
    # Normalize ID comparison
    try:
        f_id = int(id)
    except:
        f_id = id
        
    farmer_data = next((f for f in farmers if f.get("farmerID") == f_id or str(f.get("farmerID")) == str(f_id)), None)
    
    if farmer_data:
        return farmer_data
    raise HTTPException(status_code=404, detail="User not found")

@router.patch("/profile/")
async def update_profile(profile_data: dict):
    print(f"DEBUG: update_profile called with {profile_data}")
    # In a real app, we'd get the user ID from the token dependency.
    # Here, we'll expect the frontend to send the ID or we'll look it up via phone if provided.
    # Let's assume the frontend sends the user ID in the body for this mock
    
    farmer_id = profile_data.get("id") or profile_data.get("farmerID")
    if not farmer_id:
        raise HTTPException(status_code=400, detail="Farmer ID is required")
        
    # We need to find the key in Firebase.
    # Since we are using FirebaseDatabase wrapper, let's use the update method IF we knew the key.
    # Or cleaner: load all, find matching ID, update that specific item.
    
    farmers = db_farmers.load()
    # Find index and object
    target_idx = -1
    target_farmer = None
    
    # Check if ID is int or str in DB
    # The new farmers from JSON likely have int IDs.
    try:
        f_id = int(farmer_id)
    except:
        f_id = farmer_id # Fallback
        
    for i, f in enumerate(farmers):
        if f.get("farmerID") == f_id or str(f.get("farmerID")) == str(f_id):
            target_idx = i
            target_farmer = f
            break
            
    if target_farmer:
        # Update fields
        # Mappings: name->farmerName, etc.
        if "name" in profile_data: target_farmer["farmerName"] = profile_data["name"]
        if "division" in profile_data: target_farmer["farmerDivision"] = profile_data["division"]
        if "district" in profile_data: target_farmer["farmerDistrict"] = profile_data["district"]
        if "upazila" in profile_data: target_farmer["farmerUpazila"] = profile_data["upazila"]
        if "address" in profile_data: target_farmer["farmerAddress"] = profile_data["address"]
        # Allow updating other fields directly if keys match
        for k, v in profile_data.items():
            if k.startswith("farmer"):
                target_farmer[k] = v
                
        # Save back using the wrapper's update logic would be best if we had the key.
        # But our wrapper .update(key, val, new_data) uses query.
        # db_farmers.update("farmerID", f_id, target_farmer)
        
        # Let's try that:
        success = db_farmers.update("farmerID", f_id, target_farmer)
        if success:
            return {
                "message": "Profile updated successfully",
                "user": target_farmer
            }
        
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/profile/avatar/")
async def upload_avatar(
    file: UploadFile = File(...),
    farmer_id: str = Form(...) # We need to identify who to update
):
    # 1. Read file
    contents = await file.read()
    
    # 2. Check size (2MB limit for example)
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 2MB.")
        
    # 3. Convert to Base64
    base64_encoded = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"
    data_uri = f"data:{mime_type};base64,{base64_encoded}"
    
    # 4. Update in DB
    farmers = db_farmers.load()
    target_idx = -1
    target_farmer = None
    
    # Match ID similar to update_profile logic
    try:
        f_id = int(farmer_id)
    except:
        f_id = farmer_id 
        
    for i, f in enumerate(farmers):
        if f.get("farmerID") == f_id or str(f.get("farmerID")) == str(f_id):
            target_idx = i
            target_farmer = f
            break
            
    if target_farmer:
        target_farmer["farmerProfilePicture"] = data_uri
        
        # Use our updated update logic
        success = db_farmers.update("farmerID", f_id, target_farmer)
        if success:
             return {
                "message": "Avatar uploaded successfully",
                "url": data_uri # Frontend can display this immediately
            }
            
    raise HTTPException(status_code=404, detail="User not found")

# --- Expert Auth Endpoints ---

# --- Expert Auth Endpoints ---

@router.post("/experts/auth/check-status/")
async def check_expert_status(req: PhoneRequest):
    experts = db_experts.load()
    print(f"DEBUG: Checking expert status for {req.phone}")
    
    req_phone_norm = normalize_phone(req.phone)
    expert = next((e for e in experts if normalize_phone(e.get("expertPhoneNumber")) == req_phone_norm), None)
    
    if expert:
        is_password_set = bool(expert.get("expertPassword"))
        return {"exists": True, "hasPassword": is_password_set}
    return {"exists": False}

@router.post("/experts/auth/otp/send/")
async def send_otp_expert(req: PhoneRequest):
    return {"message": "OTP sent successfully", "otp": "5678"}

@router.post("/experts/auth/otp/verify/")
async def verify_otp_expert(req: VerifyOtpRequest):
    if req.code == "5678":
        # In this flow, OTP is primarily for new users registration
        return {
            "message": "OTP Verified",
            "phone": req.phone
        }
    raise HTTPException(status_code=400, detail="Invalid OTP")

@router.post("/experts/auth/register/")
async def register_expert(req: dict):
    experts = db_experts.load()
    
    # Generate ID
    # If list is empty, start at 1. If not, max + 1.
    new_id = 1
    if experts:
        ids = [int(e.get("expertID", 0)) for e in experts if str(e.get("expertID", "0")).isdigit()]
        if ids:
            new_id = max(ids) + 1
            
    # Create Expert object
    try:
        new_expert = Expert(
            expertID=new_id,
            expertName=req.get("expertName", "New Expert"),
            expertDivision=req.get("expertDivision", ""),
            expertDistrict=req.get("expertDistrict", ""),
            expertUpazila=req.get("expertUpazila", ""),
            expertAddress=req.get("expertAddress", ""),
            expertPhoneNumber=req.get("expertPhoneNumber", ""),
            expertEmail=req.get("expertEmail", ""),
            expertProfilePicture=req.get("expertProfilePicture"),
            expertNID=req.get("expertNID"),
            expertDigitalCertificate=req.get("expertDigitalCertificate"),
            expertBio=req.get("expertBio"),
            expertPassword=req.get("expertPassword"), # Critical
            createTime=datetime.now().isoformat(),
            status=UserStatus.OFFLINE
        )
        
        db_experts.add(new_expert.dict())
        
        return {
            "message": "Registration successful",
            "expertID": new_id
        }
    except Exception as e:
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/experts/auth/login/")
async def login_expert(req: LoginRequest):
    experts = db_experts.load()
    req_phone_norm = normalize_phone(req.phone)
    
    expert = next((e for e in experts if normalize_phone(e.get("expertPhoneNumber")) == req_phone_norm), None)
    
    if expert:
        stored_password = expert.get("expertPassword")
        if stored_password and stored_password == req.password:
             return {
                "access": MOCK_TOKENS["access"],
                "refresh": MOCK_TOKENS["refresh"],
                "uid": expert.get("expertID"),
                "phone": expert.get("expertPhoneNumber"),
                "name": expert.get("expertName"),
                "role": "expert"
            }
    
    raise HTTPException(status_code=400, detail="Invalid credentials")

# --- Common ---

@router.post("/token/refresh/")
async def refresh_token(req: dict):
    return {"access": "brand_new_mock_access_token"}
