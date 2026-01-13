from pydantic import BaseModel, Field as PydanticField
from typing import List, Optional, Union, Dict, Any
from enum import Enum
from datetime import datetime

# --- Enums ---
class UserStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"

class UserType(str, Enum):
    EXPERT = "expert"
    FARMER = "farmer"

class ConsultantStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "inprogress"
    COMPLETED = "completed"

class SourceType(str, Enum):
    AI = "AI"
    EXPERT = "EXPERT"

class RiskType(str, Enum):
    FLOOD = "flood"
    SALINITY = "salinity"
    DISEASE = "disease"
    NUTRIENT = "nutrient"
    GENERAL = "general"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Priority(int, Enum):
    FIRST = 1
    SECOND = 2
    THIRD = 3

# --- Shared/Base Models ---

class AdviceAction(BaseModel):
    action: str
    quantity: Optional[str] = None
    unit: Optional[str] = None
    timing: Optional[str] = None
    avoidIf: Optional[str] = None
    priority: Optional[Priority] = 1

class AdviceReport(BaseModel):
    reportId: int
    sourceType: SourceType
    sourceId: Union[str, int] # aiModelVersion OR expertId
    fieldId: int
    riskType: RiskType
    severity: Severity
    confidence: float # 0-1
    advices: List[AdviceAction]
    evidence: Optional[Union[str, Dict[str, Any]]] = None # IoT, satellite, expert observation
    createdAt: Union[str, datetime]

# --- Main Entity Models ---

class Expert(BaseModel):
    expertID: int
    expertName: str
    expertDivision: str
    expertDistrict: str
    expertUpazila: str
    expertAddress: str
    expertPhoneNumber: str
    expertEmail: Optional[str] = None
    expertPassword: Optional[str] = None
    expertProfilePicture: Optional[str] = None
    expertNID: Optional[str] = None
    expertDigitalCertificate: Optional[str] = None
    expertBio: Optional[str] = None
    expertRating: float = 0.0
    status: UserStatus = UserStatus.OFFLINE
    perReportBalance: float = 0.0
    totalBalance: float = 0.0
    createTime: Union[str, datetime]

class Farmer(BaseModel):
    farmerID: int
    farmerName: str
    farmerDivision: str
    farmerDistrict: str
    farmerUpazila: str
    farmerAddress: str
    farmerPhoneNumber: str
    farmerProfilePicture: Optional[str] = None
    farmerNID: Optional[str] = None
    farmerPassword: Optional[str] = None
    isSmartPhoneUser: bool = True
    createTime: Union[str, datetime]

class Field(BaseModel):
    fieldID: int
    farmerID: int # ForeignKey
    fieldName: str
    fieldCoordinates: List[Dict[str, float]] # [{'lat': x, 'lng': y}, ...] 4 points
    fieldArea: float # in acres or decimal
    fieldCropName: str
    fieldCropHarvestTime: Union[str, datetime]
    createTime: Union[str, datetime]

class IoTData(BaseModel):
    ioTDataID: int
    fieldID: int # ForeignKey
    locationLat: float
    locationLng: float
    soilTemp: float
    soilMoisture: float
    soilPH: float
    soilEC: float
    soilN: float
    soilP: float
    soilK: float
    createTime: Union[str, datetime]

class Feedback(BaseModel):
    feedbackId: int
    fromUserId: int
    fromUserType: UserType
    toUserId: int
    toUserType: UserType
    rating: float
    comment: Optional[str] = None
    createdAt: Union[str, datetime]
