from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration MySQL
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "audit_db")

# URL de connexion MySQL
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
)

# Création du moteur SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Mettre à True pour voir les requêtes SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fonction pour obtenir une session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        