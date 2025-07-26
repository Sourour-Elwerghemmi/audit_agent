# models_db.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()

class AccountStatus(enum.Enum):
    actif = "actif"
    suspendu = "suspendu"
    supprimé = "supprimé"

class SubscriptionPlan(enum.Enum):
    gratuit = "gratuit"
    premium = "premium"

class AuditStatus(enum.Enum):
    en_cours = "en_cours"
    terminé = "terminé"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    nom = Column(String)
    prenom = Column(String)
    statut_compte = Column(Enum(AccountStatus), default=AccountStatus.actif)
    plan_abonnement = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.gratuit)
    limite_audits = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)

    audits = relationship("Audit", back_populates="user")
    sessions = relationship("Session", back_populates="user")

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    recommandations = Column(JSON)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    api_key = Column(String, nullable=True)

    user = relationship("User", back_populates="audits")
    business_info = relationship("BusinessInfo", back_populates="audit", uselist=False)

class BusinessInfo(Base):
    __tablename__ = "business_info"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    website = Column(String(500))
    phone = Column(String(50))
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    place_id = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String(255))
    photos = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    audit = relationship("Audit", back_populates="business_info")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="sessions")
