import requests
import os
from dotenv import load_dotenv
from typing import Dict, Optional

load_dotenv()

def scrape_business_profile(name: str, location: str) -> Optional[Dict]:
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        raise ValueError("La clé API SerpAPI n'est pas configurée")
    
    params = {
        "engine": "google_maps",
        "q": f"{name} {location}",
        "api_key": api_key,
        "hl": "fr",
        "type": "search"
    }
    try:
        response = requests.get("https://serpapi.com/search", params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        if data.get("local_results"):
            business = data["local_results"][0]
        elif data.get("place_results"):
            business = data["place_results"]
        else:
            return None  

        return {
            "name": business.get("title"),
            "address": business.get("address"),
            "category": business.get("type", [None])[0] if isinstance(business.get("type"), list) else business.get("type"),
            "website": business.get("website"),
            "phone": business.get("phone"),
            "rating": float(business.get("rating", 0)),
            "review_count": int(business.get("reviews", 0)),
            "photos": [business.get("thumbnail")] if business.get("thumbnail") else [],
            "place_id": business.get("place_id"),
            "gps_coordinates": business.get("gps_coordinates", {})
        }
    except Exception as e:
        raise Exception(f"Erreur lors du scraping: {str(e)}")
