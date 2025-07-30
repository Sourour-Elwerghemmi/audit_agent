# exporter.py

from typing import Dict
from datetime import datetime
from pathlib import Path
import unicodedata
import os

from app.services.reporter import generate_pdf_report  # ✅ importer le générateur stylisé

def slugify(value: str) -> str:
    """Nettoie les caractères spéciaux pour un nom de fichier propre"""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return "".join(c if c.isalnum() else "_" for c in value).strip("_")

def export_to_pdf(data: Dict) -> str:
    """Génère le chemin PDF avec `generate_pdf_report()` du reporter"""
    # Extraire les infos nécessaires
    business_data = data.get("business_data", {})
    score = data.get("score", 0)
    strengths = data.get("strengths", [])
    weaknesses = data.get("weaknesses", [])
    short_term = data.get("short_term", [])
    mid_term = data.get("mid_term", [])
    long_term = data.get("long_term", [])

    # Nettoyer le nom de fichier
    name = business_data.get("name", "entreprise")
    safe_name = slugify(name)[:50]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"audit_{safe_name}_{timestamp}.pdf"
    pdf_path = Path("reports") / filename

    # Préparer les données au format attendu par `reporter.py`
    structured_data = {
        "nom": business_data.get("name", "N/A"),
        "adresse": business_data.get("address", "N/A"),
        "site_web": business_data.get("website", "N/A"),
        "note": business_data.get("rating", "N/A"),
        "nb_avis": business_data.get("review_count", 0),
        "score": score,
        "forces": strengths,
        "faiblesses": weaknesses,
        "short_term": short_term,
        "mid_term": mid_term,
        "long_term": long_term,
    }

    # ✅ Appel à la génération du PDF stylisé
    try:
        generate_pdf_report(structured_data, str(pdf_path))
    except Exception as e:
        raise Exception(f"Erreur lors de la génération PDF : {str(e)}")

    # Validation
    if not pdf_path.exists():
        raise Exception("Erreur : le fichier PDF n'a pas été créé.")
    
    file_size = pdf_path.stat().st_size
    if file_size < 1000:
        raise Exception("Erreur : le fichier PDF semble corrompu ou vide.")

    return str(pdf_path)
