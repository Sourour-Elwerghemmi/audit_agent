import logging
import os
from pathlib import Path
import traceback
from typing import Optional
import uuid
from app.models_db import Audit, BusinessInfo

from app.models_db import User as DBUser

from fastapi import APIRouter, HTTPException, Depends, Query, status
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta
from dotenv import load_dotenv
import google.generativeai as genai

from app.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, get_current_user_optional, verify_password
)
from app.database import get_db
from app.models import (
    AuditRequest, AuditResponse, StoredAudit, AuditListResponse, AuditOut,
    RecommendationsByPeriod, DetailItem, UserCreate, UpdateProfile, UserProfile
)
from app.models_db import User
from app.services.analyzer import analyze_data
from app.services.exporter import export_to_pdf
from app.services.reporter import generate_action_plan
from app.services.scraper import scrape_business_profile
from app.services.db import (
    save_audit_to_db, get_audit_by_id, get_audit_by_api_key,
    get_all_audits, get_audits_by_name, delete_audit, audit_to_dict,
    get_recommendations_structured, get_audits_by_user_id
)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(
    prefix="/api",
    tags=["audit"],
    responses={404: {"description": "Non trouvé"}}
)

logger = logging.getLogger(__name__)


def to_detail_items(lst):
    result = []
    for item in lst or []:
        if isinstance(item, str):
            result.append({"titre": item, "description": ""})
        elif isinstance(item, dict):
            titre = item.get("titre") or item.get("title") or ""
            description = item.get("description", "")
            result.append({"titre": titre, "description": description})
    return result


def to_action_items(lst, priority="medium"):
    result = []
    for item in lst or []:
        if isinstance(item, str):
            result.append({"title": item, "description": "", "priority": priority})
        elif isinstance(item, dict):
            title = item.get("title") or item.get("titre") or ""
            description = item.get("description", "")
            p = item.get("priority") or priority
            result.append({"title": title, "description": description, "priority": p})
    return result


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == user.email)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        nom=user.nom,
        prenom=user.prenom
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "msg": "Utilisateur créé",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": f"{new_user.prenom or ''} {new_user.nom or ''}".strip(),
            "nom": new_user.nom,
            "prenom": new_user.prenom
        }
    }


@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    access_token_expires = timedelta(minutes=1440) 
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": f"{user.prenom or ''} {user.nom or ''}".strip(),
            "nom": user.nom,
            "prenom": user.prenom
        }
    }


@router.put("/user/profile", response_model=UserProfile)
def update_profile(
    profile_data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ✅ Mise à jour du profil utilisateur avec validation complète
    """
    try:
        logger.info(f"Début mise à jour profil pour utilisateur ID: {current_user.id}")
        logger.info(f"Données reçues: nom={profile_data.nom}, prenom={profile_data.prenom}, email={profile_data.email}")
        
        if not verify_password(profile_data.current_password, current_user.hashed_password):
            logger.warning("Mot de passe actuel incorrect")
            raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
        
        if profile_data.email and profile_data.email != current_user.email:
            existing_user = db.query(User).filter(
                User.email == profile_data.email,
                User.id != current_user.id
            ).first()
            if existing_user:
                logger.warning(f"Email {profile_data.email} déjà utilisé par un autre utilisateur")
                raise HTTPException(status_code=400, detail="Cette adresse email est déjà utilisée")
        
        if profile_data.nom is not None:
            current_user.nom = profile_data.nom
            logger.info(f"Nom mis à jour: {profile_data.nom}")
        
        if profile_data.prenom is not None:
            current_user.prenom = profile_data.prenom
            logger.info(f"Prénom mis à jour: {profile_data.prenom}")
        
        if profile_data.email and profile_data.email != current_user.email:
            current_user.email = profile_data.email
            logger.info(f"Email mis à jour: {profile_data.email}")
        
        if profile_data.new_password:
            current_user.hashed_password = get_password_hash(profile_data.new_password)
            logger.info("Mot de passe mis à jour")
        
        db.commit()
        db.refresh(current_user)
        
        logger.info("Profil mis à jour avec succès")
        
        return UserProfile(
            id=current_user.id,
            email=current_user.email,
            nom=current_user.nom,
            prenom=current_user.prenom,
            name=f"{current_user.prenom or ''} {current_user.nom or ''}".strip()
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du profil: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour")

@router.get("/user/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    ✅ Récupération du profil utilisateur
    """
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        nom=current_user.nom,
        prenom=current_user.prenom,
        name=f"{current_user.prenom or ''} {current_user.nom or ''}".strip()
    )


@router.post("/audit", response_model=AuditResponse)
async def audit_business(
    request: AuditRequest,
    db: Session = Depends(get_db),
    current_user: Optional[DBUser] = Depends(get_current_user_optional)
):
    try:
        if current_user:
            print(f"🟢 Audit lancé par l'utilisateur ID: {current_user.id}")
        else:
            print("🔴 Aucun utilisateur connecté - audit sera anonyme (user_id=None)")

        business_data = scrape_business_profile(request.name, request.location)
        if not business_data:
            raise HTTPException(
                status_code=404,
                detail=f"Aucune entreprise trouvée : '{request.name}' à {request.location}"
            )

        analysis = analyze_data({
            "name": request.name,
            "location": request.location,
            "website": business_data.get("website"),
            "reviews": business_data.get("reviews", [])
        })

        if analysis.get("message"):
            return analysis

        action_plan = generate_action_plan(analysis)

        strengths = to_detail_items(analysis.get("strengths", analysis.get("forces", [])))
        weaknesses = to_detail_items(analysis.get("weaknesses", analysis.get("faiblesses", [])))

        short_term = to_action_items(action_plan.get("short_term", []), priority="short_term")
        mid_term = to_action_items(action_plan.get("mid_term", []), priority="mid_term")
        long_term = to_action_items(action_plan.get("long_term", []), priority="long_term")

        api_key = str(uuid.uuid4())

        new_audit = Audit(
            name=request.name,
            location=request.location,
            score=analysis.get("score", 0),
            recommandations=action_plan,
            user_id=current_user.id if current_user else None,
            api_key=api_key
        )

        db.add(new_audit)
        db.commit()
        db.refresh(new_audit)

        if business_data:
            business_info = BusinessInfo(
                audit_id=new_audit.id,
                name=business_data.get("name", request.name),
                address=business_data.get("address", ""),
                website=business_data.get("website"),
                phone=business_data.get("phone"),
                rating=business_data.get("rating", 0.0),
                review_count=business_data.get("review_count", 0),
                place_id=business_data.get("place_id"),
                latitude=business_data.get("gps_coordinates", {}).get("latitude") if business_data.get("gps_coordinates") else None,
                longitude=business_data.get("gps_coordinates", {}).get("longitude") if business_data.get("gps_coordinates") else None,
                category=business_data.get("category"),
                photos=business_data.get("photos", [])
            )
            db.add(business_info)
            db.commit()

        pdf_path = export_to_pdf({
            "business_data": business_data,
            "score": analysis.get("score", 0),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": [],
            "short_term": short_term,
            "mid_term": mid_term,
            "long_term": long_term,
            "model_used": "gemini-pro"
        })

        recommendations = RecommendationsByPeriod(
            short_term=[DetailItem(**item) for item in to_detail_items(action_plan.get("short_term", []))],
            mid_term=[DetailItem(**item) for item in to_detail_items(action_plan.get("mid_term", []))],
            long_term=[DetailItem(**item) for item in to_detail_items(action_plan.get("long_term", []))]
        )

        return AuditResponse(
            id=new_audit.id,
            api_key=api_key,
            business_data=business_data,
            score=analysis.get("score", 0),
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            short_term=short_term,
            mid_term=mid_term,
            long_term=long_term,
            pdf_url=pdf_path or None,
            created_at=new_audit.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur inattendue : {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Erreur interne : voir logs.")


@router.get("/user/audits", response_model=AuditListResponse)
async def get_user_audits(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"✅ Utilisateur connecté ID: {current_user.id}")
    try:
        audits_query = (
            db.query(Audit)
            .filter(Audit.user_id == current_user.id)
            .order_by(Audit.created_at.desc())
        )

        total = audits_query.count()
        audits = audits_query.offset(skip).limit(limit).all()

        audit_list = []
        for audit in audits:
            audit_out = AuditOut(
                id=audit.id,
                name=audit.name,
                location=audit.location or "Non spécifiée",
                score=audit.score or 0,
                created_at=audit.created_at,
                updated_at=audit.updated_at,
                recommandations=audit.recommandations or {}
            )
            audit_list.append(audit_out)

        return AuditListResponse(
            audits=audit_list,
            total=total,
            page=(skip // limit) + 1,
            per_page=limit
        )

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des audits: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des audits")


@router.get("/audit/{audit_id}", response_model=StoredAudit)
async def get_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = get_audit_by_id(db, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return audit_to_dict(audit)


@router.get("/audit/api/{api_key}", response_model=StoredAudit)
async def get_audit_by_key(api_key: str, db: Session = Depends(get_db)):
    audit = get_audit_by_api_key(db, api_key)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return audit_to_dict(audit)


@router.delete("/audit/{audit_id}")
async def delete_audit_endpoint(audit_id: int, db: Session = Depends(get_db)):
    success = delete_audit(db, audit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return {"message": "Audit supprimé avec succès"}


@router.get("/audit/{audit_id}/recommendations")
async def get_audit_recommendations(audit_id: int, db: Session = Depends(get_db)):
    audit = get_audit_by_id(db, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    recommendations = get_recommendations_structured(audit)
    return recommendations


@router.get("/export-pdf/{filename}")
async def download_pdf(filename: str):
    file_path = Path("reports") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier PDF non trouvé")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        db_status = "OK"
    except Exception as e:
        db_status = f"Error: {str(e)}"
    return {
        "status": "OK",
        "database": db_status,
        "version": "1.0.0"
    }