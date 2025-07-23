#!/usr/bin/env python3
"""
Script d'initialisation de la base de données
"""

import os
import sys
import logging
from pathlib import Path

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError
import pymysql

from app.database import MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DB
from app.models_db import Base

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database_if_not_exists():
    """Crée la base de données si elle n'existe pas"""
    try:
        # Connexion sans spécifier la base de données
        connection_url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/"
        engine = create_engine(connection_url)
        
        with engine.connect() as conn:
            # Vérifier si la base de données existe
            result = conn.execute(text(f"SHOW DATABASES LIKE '{MYSQL_DB}'"))
            if not result.fetchone():
                # Créer la base de données
                conn.execute(text(f"CREATE DATABASE {MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                logger.info(f"✅ Base de données '{MYSQL_DB}' créée avec succès")
            else:
                logger.info(f"ℹ️ Base de données '{MYSQL_DB}' existe déjà")
                
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création de la base de données : {e}")
        raise

def create_tables():
    """Crée les tables de l'application"""
    try:
        # Maintenant se connecter à la base de données spécifique
        from app.database import engine
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tables créées avec succès")
        
        # Vérifier que les tables ont été créées
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            logger.info(f"📋 Tables créées : {tables}")
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création des tables : {e}")
        raise

def test_connection():
    """Test de la connexion à la base de données"""
    try:
        from app.database import engine
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            if result.fetchone():
                logger.info("✅ Connexion à la base de données réussie")
                return True
    except Exception as e:
        logger.error(f"❌ Erreur de connexion à la base de données : {e}")
        return False

def main():
    """Fonction principale d'initialisation"""
    logger.info("🔧 Initialisation de la base de données...")
    
    # Charger les variables d'environnement
    load_dotenv()
    
    # Vérifier que les variables d'environnement sont définies
    required_vars = ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_DB']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"❌ Variables d'environnement manquantes : {missing_vars}")
        logger.error("💡 Vérifiez votre fichier .env")
        sys.exit(1)
    
    try:
        # Étape 1 : Créer la base de données
        logger.info("📝 Étape 1 : Création de la base de données...")
        create_database_if_not_exists()
        
        # Étape 2 : Créer les tables
        logger.info("📝 Étape 2 : Création des tables...")
        create_tables()
        
        # Étape 3 : Test de connexion
        logger.info("📝 Étape 3 : Test de connexion...")
        if test_connection():
            logger.info("🎉 Initialisation terminée avec succès !")
            logger.info("💡 Vous pouvez maintenant démarrer l'application avec : uvicorn main:app --reload")
        else:
            logger.error("❌ Échec du test de connexion")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation : {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
    