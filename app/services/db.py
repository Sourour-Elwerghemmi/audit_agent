from sqlalchemy.orm import Session
from app.models_db import Audit, BusinessInfo
import json
import secrets
import string
from typing import Dict, List, Any, Optional

def generate_api_key(length: int = 32) -> str:
    """Génère une clé API unique"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def save_audit_to_db(db: Session, name: str, location: str, score: int, 
                    strengths: List[Dict[str, str]], weaknesses: List[Dict[str, str]], 
                    recommendations: Dict[str, List[Dict[str, str]]],
                    business_data: Optional[Dict[str, Any]] = None,
                    user_id: Optional[int] = None) -> Audit:
    """
    Sauvegarde un audit complet en base de données
    
    Args:
        db: Session SQLAlchemy
        name: Nom de l'entreprise
        location: Localisation
        score: Score de l'audit
        strengths: Liste des forces (listes d'objets)
        weaknesses: Liste des faiblesses (listes d'objets)
        recommendations: Recommandations structurées (dict)
        business_data: Données complètes de l'entreprise
        user_id: ID de l'utilisateur lié à l'audit (optionnel)
    
    Returns:
        Audit: L'audit sauvegardé avec son ID et sa clé API
    """
    
    # Génération d'une clé API unique
    api_key = generate_api_key()
    
    # Vérification de l'unicité de la clé API
    while db.query(Audit).filter(Audit.api_key == api_key).first():
        api_key = generate_api_key()
    
    # Stockage en JSON des listes structurées (forces, faiblesses, recommandations)
    strengths_json = json.dumps(strengths, ensure_ascii=False)
    weaknesses_json = json.dumps(weaknesses, ensure_ascii=False)
    recommendations_json = json.dumps(recommendations, ensure_ascii=False)
    
    # Création de l'audit
    new_audit = Audit(
        api_key=api_key,
        name=name,
        location=location,
        score=score,
        strengths=strengths_json,
        weaknesses=weaknesses_json,
        recommendations=recommendations_json,
        user_id=user_id  # <-- AJOUT de user_id ici
    )
    
    db.add(new_audit)
    db.commit()
    db.refresh(new_audit)
    
    # Sauvegarde des informations business si disponibles
    if business_data:
        save_business_info(db, new_audit.id, business_data)
    
    return new_audit

def save_business_info(db: Session, audit_id: int, business_data: Dict[str, Any]) -> BusinessInfo:
    """
    Sauvegarde les informations business liées à un audit
    """
    gps = business_data.get('gps_coordinates', {})
    
    business_info = BusinessInfo(
        audit_id=audit_id,
        name=business_data.get('name', ''),
        address=business_data.get('address', ''),
        website=business_data.get('website'),
        phone=business_data.get('phone'),
        rating=business_data.get('rating', 0.0),
        review_count=business_data.get('review_count', 0),
        place_id=business_data.get('place_id'),
        latitude=gps.get('latitude') if gps else None,
        longitude=gps.get('longitude') if gps else None,
        category=business_data.get('category'),
        photos=business_data.get('photos', [])
    )
    
    db.add(business_info)
    db.commit()
    db.refresh(business_info)
    return business_info

def get_audit_by_id(db: Session, audit_id: int) -> Optional[Audit]:
    """
    Récupère un audit par son ID
    """
    return db.query(Audit).filter(Audit.id == audit_id).first()

def get_audit_by_api_key(db: Session, api_key: str) -> Optional[Audit]:
    """
    Récupère un audit par sa clé API
    """
    return db.query(Audit).filter(Audit.api_key == api_key).first()

def get_all_audits(db: Session, skip: int = 0, limit: int = 100) -> List[Audit]:
    """
    Récupère tous les audits avec pagination
    """
    return db.query(Audit).offset(skip).limit(limit).all()

def get_audits_by_name(db: Session, name: str) -> List[Audit]:
    """
    Récupère tous les audits pour une entreprise donnée
    """
    return db.query(Audit).filter(Audit.name.ilike(f"%{name}%")).all()

def get_audits_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Audit]:
    """
    Récupère les audits associés à un utilisateur donné avec pagination
    """
    return db.query(Audit).filter(Audit.user_id == user_id).offset(skip).limit(limit).all()

def delete_audit(db: Session, audit_id: int) -> bool:
    """
    Supprime un audit et ses données associées
    """
    audit = get_audit_by_id(db, audit_id)
    if not audit:
        return False
    
    # Suppression des informations business associées
    db.query(BusinessInfo).filter(BusinessInfo.audit_id == audit_id).delete()
    
    # Suppression de l'audit
    db.delete(audit)
    db.commit()
    return True

def audit_to_dict(audit: Audit) -> Dict[str, Any]:
    """
    Convertit un audit DB en dictionnaire pour l'API avec décodage JSON des champs complexes
    """
    # Décodage JSON pour forces, faiblesses, recommandations
    try:
        strengths = json.loads(audit.strengths) if audit.strengths else []
    except (json.JSONDecodeError, TypeError):
        strengths = []
    try:
        weaknesses = json.loads(audit.weaknesses) if audit.weaknesses else []
    except (json.JSONDecodeError, TypeError):
        weaknesses = []
    try:
        recommendations = json.loads(audit.recommendations) if audit.recommendations else {}
    except (json.JSONDecodeError, TypeError):
        recommendations = {}

    result = {
        'id': audit.id,
        'api_key': audit.api_key,
        'name': audit.name,
        'location': audit.location,
        'score': audit.score,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'recommendations': recommendations,
        'created_at': audit.created_at.isoformat() if audit.created_at else None
    }
    
    # Ajout des informations business si disponibles
    if audit.business_info:
        result['business_data'] = {
            'name': audit.business_info.name,
            'address': audit.business_info.address,
            'website': audit.business_info.website,
            'phone': audit.business_info.phone,
            'rating': audit.business_info.rating,
            'review_count': audit.business_info.review_count,
            'place_id': audit.business_info.place_id,
            'latitude': audit.business_info.latitude,
            'longitude': audit.business_info.longitude,
            'category': audit.business_info.category,
            'photos': audit.business_info.photos
        }
    
    return result

def get_recommendations_structured(audit: Audit) -> Dict[str, List[Dict[str, str]]]:
    
    """
    Récupère les recommandations sous forme structurée
    """
    if not audit.recommendations:
        return {
            'short_term': [],
            'mid_term': [],
            'long_term': []
        }
    
    try:
        if isinstance(audit.recommendations, dict):
            return audit.recommendations
        else:
            return json.loads(audit.recommendations)
    except (json.JSONDecodeError, TypeError):
        return {
            'short_term': [],
            'mid_term': [],
            'long_term': []
        }