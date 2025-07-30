from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict
from datetime import datetime

class GPS(BaseModel):
    latitude: float
    longitude: float

class BusinessData(BaseModel):
    name: str
    address: str
    website: Optional[str] = None
    phone: Optional[str] = None
    rating: float
    review_count: int
    photos: List[str]
    place_id: Optional[str] = None
    gps_coordinates: Optional[GPS] = None
    category: Optional[str] = None

class AuditRequest(BaseModel):
    name: str
    location: str

class ActionItem(BaseModel):
    title: str
    description: str
    priority: str

class DetailItem(BaseModel):
    titre: str
    description: str

class RecommendationsByPeriod(BaseModel):
    short_term: List[DetailItem]
    mid_term: List[DetailItem]
    long_term: List[DetailItem]

class AuditOut(BaseModel):
    id: int
    name: str
    location: str
    score: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    recommandations: dict
    strengths: List[DetailItem] = []
    weaknesses: List[DetailItem] = []

    class Config:
        orm_mode = True
        from_attributes = True

class AuditResponse(BaseModel):
    id: Optional[int] = None
    api_key: Optional[str] = None
    business_data: BusinessData
    score: int
    strengths: List[DetailItem]
    weaknesses: List[DetailItem]
    recommendations: RecommendationsByPeriod
    short_term: List[ActionItem]
    mid_term: List[ActionItem]
    long_term: List[ActionItem]
    pdf_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class StoredAudit(BaseModel):
    id: int
    api_key: str
    name: str
    location: str
    score: int
    strengths: List[DetailItem]
    weaknesses: List[DetailItem]
    recommendations: Dict[str, List[DetailItem]]
    created_at: datetime
    updated_at: Optional[datetime] = None
    business_info: Optional[dict] = None
    user_id: Optional[int] = None

class AuditListResponse(BaseModel):
    audits: List[AuditOut]
    total: int
    page: int
    per_page: int

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    nom: Optional[str] = None
    prenom: Optional[str] = None

class UserLogin(UserBase):
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    nom: Optional[str]
    prenom: Optional[str]
    statut_compte: Optional[str]
    plan_abonnement: Optional[str]
    limite_audits: Optional[int]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UpdateProfile(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: str  
    new_password: Optional[str] = None
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Le nouveau mot de passe doit contenir au moins 8 caractères')
        return v
    
    @validator('nom', 'prenom')
    def validate_names(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None 
        return v.strip() if v else v

class UserProfile(BaseModel):
    id: int
    email: EmailStr
    nom: Optional[str]
    prenom: Optional[str]
    name: str  
    
    class Config:
        orm_mode = True
        from_attributes = True
