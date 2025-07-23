import json
import logging
import os
from typing import Any, Dict, List

from dotenv import load_dotenv
import google.generativeai as genai
import requests

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY manquant dans .env")

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_TOKENS", 4096))

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

logger = logging.getLogger(__name__)

def check_website_exists(url: str) -> bool:
    if not url:
        print("DEBUG: URL vide ou None")
        return False

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        r = requests.head(url, timeout=5, allow_redirects=True)
        print(f"DEBUG: URL testée : {url} - Status code : {r.status_code}")
        return r.status_code < 400
    except requests.RequestException as e:
        print(f"DEBUG: Erreur requête HTTP pour {url} : {e}")
        return False

def _normalize_list(lst: List[Any]) -> List[Dict[str, str]]:
    if not isinstance(lst, list):
        return []

    normalized = []
    for item in lst:
        if isinstance(item, dict):
            title = item.get("title") or item.get("titre") or ""
            desc = item.get("description", "")
        elif isinstance(item, str):
            title = item
            desc = ""
        else:
            title = str(item)
            desc = ""
        if title.strip() or desc.strip():
            normalized.append({"title": title.strip(), "description": desc.strip()})
    return normalized

def _filter_invalid_weaknesses(weaknesses: List[Dict[str, str]], review_count: int) -> List[Dict[str, str]]:
    """Filtre les faiblesses invalides concernant l'absence d'avis quand des avis existent"""
    if review_count == 0:
        return weaknesses
    
    # Mots-clés à rechercher pour identifier les faiblesses liées à l'absence d'avis
    keywords_to_filter = [
        # Français
        "absence d'avis", "zéro avis", "pas d'avis", "aucun avis", "manque d'avis",
        "peu d'avis", "insuffisant d'avis", "absence de retours", "manque de retours",
        "pas de retours", "aucun retour", "zéro retour", "nombre d'avis faible",
        "avis insuffisants", "retours insuffisants", "évaluations insuffisantes",
        "pas d'évaluations", "aucune évaluation", "manque d'évaluations",
        "absence d'évaluations", "nombre d'évaluations faible", "reviews insuffisants",
        "pas de reviews", "aucun review", "manque de reviews", "absence de reviews",
        "commentaires insuffisants", "pas de commentaires", "aucun commentaire",
        "manque de commentaires", "absence de commentaires", "témoignages insuffisants",
        "pas de témoignages", "aucun témoignage", "manque de témoignages",
        "absence de témoignages", "feedback insuffisant", "pas de feedback",
        "aucun feedback", "manque de feedback", "absence de feedback",
        "avis clients", "retours clients", "évaluations clients",
        # Variantes avec 0 et zéro
        "0 avis", "0 retour", "0 évaluation", "0 commentaire", "0 témoignage",
        "zero avis", "zero retour", "zero évaluation", "zero commentaire",
        # Phrases complètes communes
        "absence totale d'avis", "manque total d'avis", "aucun avis client",
        "pas d'avis client", "zéro avis client", "0 avis client"
    ]
    
    filtered_weaknesses = []
    for weakness in weaknesses:
        title_lower = weakness["title"].lower()
        description_lower = weakness["description"].lower()
        combined_text = f"{title_lower} {description_lower}"
        
        # Vérifier si cette faiblesse mentionne l'absence d'avis
        is_about_missing_reviews = any(
            keyword in combined_text for keyword in keywords_to_filter
        )
        
        # Vérification supplémentaire pour les patterns avec "avis"
        if not is_about_missing_reviews and "avis" in combined_text:
            # Vérifier les patterns comme "absence... avis", "zéro... avis", etc.
            negative_words = ["absence", "zéro", "zero", "0", "aucun", "pas", "manque", "sans"]
            for neg_word in negative_words:
                if neg_word in combined_text and "avis" in combined_text:
                    # Vérifier si les mots sont proches
                    words = combined_text.split()
                    for i, word in enumerate(words):
                        if neg_word in word:
                            # Chercher "avis" dans les 5 mots suivants
                            for j in range(i+1, min(i+6, len(words))):
                                if "avis" in words[j]:
                                    is_about_missing_reviews = True
                                    break
                            if is_about_missing_reviews:
                                break
                    if is_about_missing_reviews:
                        break
        
        if not is_about_missing_reviews:
            filtered_weaknesses.append(weakness)
        else:
            print(f"DEBUG: Faiblesse filtrée (avis présents: {review_count}): {weakness['title']}")
    
    return filtered_weaknesses

def analyze_data(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        name = data.get("name", "Inconnu")
        location = data.get("location", "Inconnue")
        reviews = data.get("reviews", [])
        review_count = len(reviews)
        website = data.get("website")

        site_ok = check_website_exists(website)
        print(f"DEBUG: Site web {'valide' if site_ok else 'invalide ou inaccessible'} pour URL: {website}")

        if not site_ok:
            return {
                "score": 0,
                "strengths": [],
                "weaknesses": [],
                "recommendations": {
                    "short_term": [],
                    "mid_term": [],
                    "long_term": [],
                },
                "message": "Site web non fourni ou inaccessible, analyse impossible."
            }

        review_texts = []
        for r in reviews[:3]:
            content = r.get("text") or r.get("content") or ""
            if content:
                review_texts.append(content[:200].replace('\n', ' '))
        reviews_summary = "\n".join(f"- {txt}" for txt in review_texts) if review_texts else "Aucun avis client disponible."

        system_prompt = f"""
Tu es un expert SEO local. Tu dois répondre UNIQUEMENT avec un JSON valide dans ce format exact :

{{
  "score": 85,
  "forces": [
    {{"title": "Titre de la force", "description": "Description détaillée"}},
    {{"title": "Autre force", "description": "Autre description"}}
  ],
  "faiblesses": [
    {{"title": "Titre de la faiblesse", "description": "Description détaillée"}}
  ],
  "recommandations": {{
    "short_term": [
      {{"title": "Action immédiate", "description": "Ce qu'il faut faire maintenant"}}
    ],
    "mid_term": [
      {{"title": "Action à moyen terme", "description": "Ce qu'il faut faire dans 3-6 mois"}}
    ],
    "long_term": [
      {{"title": "Action à long terme", "description": "Ce qu'il faut faire dans 6-12 mois"}}
    ]
  }}
}}

RÈGLES CRITIQUES :
1. CE COMMERCE A {review_count} AVIS CLIENTS - C'EST UN FAIT ABSOLU
2. INTERDICTION TOTALE de mentionner l'absence, le manque ou l'insuffisance d'avis
3. INTERDICTION de utiliser les mots: "zéro avis", "aucun avis", "pas d'avis", "absence d'avis", "manque d'avis"
4. Si des avis existent ({review_count} > 0), concentre-toi sur: optimisation technique, contenu local, concurrence, structure du site
5. Évite toute référence négative aux avis clients quand ils existent

FOCUS SUR : SEO technique, contenu local, Google My Business, concurrence, mots-clés locaux, structure du site.

Réponds UNIQUEMENT avec ce JSON, rien d'autre.
"""

        user_prompt = (
            f"Analyse ce commerce local pour le SEO :\n"
            f"- Nom: {name}\n"
            f"- Localisation: {location}\n"
            f"- Site web: {website}\n"
            f"- Nombre d'avis: {review_count}\n"
            f"- Extraits d'avis:\n{reviews_summary}\n"
            f"Donne 2-3 forces, 2-3 faiblesses, et 2-3 recommandations par période."
        )
        print(f"DEBUG: Prompt envoyé à Gemini:\n{user_prompt}")
        print(f"DEBUG: Nombre d'avis détecté: {review_count}")

        resp = model.generate_content(
            [system_prompt, user_prompt],
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": MAX_OUTPUT_TOKENS,
                "response_mime_type": "application/json"
            }
        )
        if not resp.candidates or not resp.candidates[0].content.parts:
            raise RuntimeError("Réponse vide de Gemini")

        raw_json = resp.candidates[0].content.parts[0].text
        print(f"DEBUG: Réponse brute de Gemini:\n{raw_json}")

        parsed = json.loads(raw_json)

        forces = _normalize_list(parsed.get("forces", []))
        faiblesses = _normalize_list(parsed.get("faiblesses", []))

        # Filtrage amélioré des faiblesses invalides
        faiblesses = _filter_invalid_weaknesses(faiblesses, review_count)

        recommandations_raw = parsed.get("recommandations", {})
        recommandations = {
            "short_term": _normalize_list(recommandations_raw.get("short_term", [])),
            "mid_term": _normalize_list(recommandations_raw.get("mid_term", [])),
            "long_term": _normalize_list(recommandations_raw.get("long_term", [])),
        }

        result = {
            "score": int(parsed.get("score", 0)),
            "strengths": forces,
            "weaknesses": faiblesses,
            "recommendations": recommandations,
        }
        print(f"DEBUG: Résultat final (après filtrage des faiblesses): {result}")
        print(f"DEBUG: Nombre de faiblesses après filtrage: {len(faiblesses)}")
        return result

    except Exception as e:
        logger.error("Analyse Gemini échouée : %s", e, exc_info=True)
        print(f"DEBUG: Erreur dans analyze_data: {e}")
        raise RuntimeError(f"Erreur lors de l'analyse : {e}") from e
        