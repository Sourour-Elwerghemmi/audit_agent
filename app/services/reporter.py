import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict
from fpdf import FPDF
from datetime import datetime
import unicodedata
import re

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY manquant")

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-pro")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(model_name=MODEL_NAME)

logger = logging.getLogger(__name__)

def _parse_json(text: str) -> Dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        first, last = text.find('{'), text.rfind('}')
        if first == -1 or last == -1 or last <= first:
            logger.error("Impossible d'extraire JSON du texte: %s", text)
            return {}
        try:
            return json.loads(text[first:last+1])
        except json.JSONDecodeError as e:
            logger.error("JSON mal formé après extraction: %s", e)
            return {}

def generate_action_plan(analysis: Dict) -> Dict:
    try:
        example_json = {
            "short_term": [
                {"titre": "Améliorer la fiche Google", "description": "Ajouter des photos récentes et optimisées."}
            ],
            "mid_term": [
                {"titre": "Collecter plus d'avis", "description": "Mettre en place une stratégie d'incitation aux avis clients."}
            ],
            "long_term": [
                {"titre": "Optimiser le SEO local", "description": "Créer du contenu ciblé pour la région et les services."}
            ]
        }

        prompt = (
            "En te basant sur l'analyse JSON ci-dessous, génère un plan d'action au format JSON STRICT.\n"
            "Format attendu EXACTEMENT comme l'exemple :\n"
            f"{json.dumps(example_json, ensure_ascii=False, indent=2)}\n\n"
            f"ANALYSE : {json.dumps(analysis, ensure_ascii=False)}\n\n"
            "Ne retourne rien d'autre que ce JSON."
        )

        resp = model.generate_content(prompt)
        plan = _parse_json(resp.text)

        def sanitize_list(lst):
            if not isinstance(lst, list):
                return []
            result = []
            for item in lst:
                titre = item.get("titre") or item.get("title") or ""
                description = item.get("description") or ""
                if titre:
                    result.append({"titre": titre, "description": description})
            return result

        return {
            "short_term": sanitize_list(plan.get("short_term", [])),
            "mid_term": sanitize_list(plan.get("mid_term", [])),
            "long_term": sanitize_list(plan.get("long_term", []))
        }

    except Exception as e:
        logger.error("Génération plan d'action échouée : %s", e, exc_info=True)
        return {"short_term": [], "mid_term": [], "long_term": []}

def normalize_text(text: str) -> str:
    """Normalise le texte pour le PDF en gérant les caractères Unicode"""
    if not text:
        return ""
    
    # Convertir en string si ce n'est pas déjà le cas
    text = str(text)
    
    # Remplacements spécifiques pour les caractères problématiques
    replacements = {
        # Caractères arabes et spéciaux
        '،': ',',  # Virgule arabe
        '؟': '?',  # Point d'interrogation arabe
        '؛': ';',  # Point-virgule arabe
        '٪': '%',  # Pourcentage arabe
        
        # Caractères français
        'œ': 'oe', 'Œ': 'OE', 'æ': 'ae', 'Æ': 'AE', 'ç': 'c', 'Ç': 'C',
        'à': 'a', 'À': 'A', 'á': 'a', 'Á': 'A', 'â': 'a', 'Â': 'A',
        'ã': 'a', 'Ã': 'A', 'ä': 'a', 'Ä': 'A', 'å': 'a', 'Å': 'A',
        'é': 'e', 'É': 'E', 'è': 'e', 'È': 'E', 'ê': 'e', 'Ê': 'E',
        'ë': 'e', 'Ë': 'E', 'í': 'i', 'Í': 'I', 'ì': 'i', 'Ì': 'I',
        'î': 'i', 'Î': 'I', 'ï': 'i', 'Ï': 'I', 'ó': 'o', 'Ó': 'O',
        'ò': 'o', 'Ò': 'O', 'ô': 'o', 'Ô': 'O', 'õ': 'o', 'Õ': 'O',
        'ö': 'o', 'Ö': 'O', 'ø': 'o', 'Ø': 'O', 'ú': 'u', 'Ú': 'U',
        'ù': 'u', 'Ù': 'U', 'û': 'u', 'Û': 'U', 'ü': 'u', 'Ü': 'U',
        'ý': 'y', 'Ý': 'Y', 'ÿ': 'y', 'Ÿ': 'Y', 'ñ': 'n', 'Ñ': 'N',
        
        # Guillemets et apostrophes
        '"': '"', '"': '"', ''': "'", ''': "'", '«': '"', '»': '"',
        
        # Tirets
        '–': '-', '—': '-', '−': '-',
        
        # Autres caractères spéciaux
        '…': '...', '€': 'EUR', '°': 'deg', '²': '2', '³': '3',
    }
    
    # Appliquer les remplacements
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    # Normaliser les caractères Unicode restants (décomposition puis recomposition)
    try:
        # Décomposer les caractères accentués
        text = unicodedata.normalize('NFD', text)
        # Supprimer les accents en gardant seulement les caractères ASCII
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        # Recomposer
        text = unicodedata.normalize('NFC', text)
    except Exception as e:
        logger.warning(f"Erreur lors de la normalisation Unicode: {e}")
    
    # Supprimer ou remplacer les caractères non-ASCII restants
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    
    # Nettoyer les espaces multiples
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

class MinimalAuditPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=30)
        
        self.primary = (0, 0, 0)        
        self.secondary = (100, 100, 100) 
        self.light_gray = (220, 220, 220) 
        self.very_light_gray = (245, 245, 245) 
        self.white = (255, 255, 255)
        
        self.accent = (255, 102, 0)      
        
        self.set_margins(25, 25, 25)

    def header(self):
        self.ln(15)

    def footer(self):
        self.set_y(-25)
        self.set_draw_color(*self.light_gray)
        self.set_line_width(0.3)
        self.line(25, self.get_y() - 8, self.w - 25, self.get_y() - 8)
        
        self.set_font("Arial", "", 10)
        self.set_text_color(*self.secondary)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def safe_cell(self, w, h, txt='', border=0, ln=0, align='', fill=False, link=''):
        """Version sécurisée de cell() qui normalise le texte"""
        try:
            normalized_txt = normalize_text(txt)
            self.cell(w, h, normalized_txt, border, ln, align, fill, link)
        except Exception as e:
            logger.warning(f"Erreur lors de l'écriture du texte: {e}, texte: {repr(txt)}")
            # Fallback: essayer avec un texte simplifié
            try:
                fallback_txt = ''.join(c for c in str(txt) if ord(c) < 128)
                self.cell(w, h, fallback_txt, border, ln, align, fill, link)
            except:
                self.cell(w, h, "[Texte non affichable]", border, ln, align, fill, link)

    def safe_multi_cell(self, w, h, txt, border=0, align='L', fill=False):
        """Version sécurisée de multi_cell() qui normalise le texte"""
        try:
            normalized_txt = normalize_text(txt)
            self.multi_cell(w, h, normalized_txt, border, align, fill)
        except Exception as e:
            logger.warning(f"Erreur lors de l'écriture du texte multi-ligne: {e}, texte: {repr(txt)}")
            # Fallback: essayer avec un texte simplifié
            try:
                fallback_txt = ''.join(c for c in str(txt) if ord(c) < 128)
                self.multi_cell(w, h, fallback_txt, border, align, fill)
            except:
                self.multi_cell(w, h, "[Texte non affichable]", border, align, fill)

    def add_section_title(self, title: str):
        """Titre de section minimaliste"""
        self.ln(15)
        self.set_font("Arial", "B", 16)
        self.set_text_color(*self.primary)
        normalized_title = normalize_text(title)
        self.safe_cell(0, 10, normalized_title, ln=True)
        
        self.set_draw_color(*self.accent)
        self.set_line_width(2)
        title_width = self.get_string_width(normalized_title)
        self.line(self.l_margin, self.get_y() + 2, self.l_margin + title_width, self.get_y() + 2)
        self.ln(10)

    def company_info_section(self, data: Dict):
        """Section informations entreprise épurée"""
        nom = normalize_text(data.get("nom", "N/A"))
        adresse = normalize_text(data.get("adresse", "N/A"))
        site_web = normalize_text(data.get("site_web", "N/A"))
        note = data.get("note", "N/A")
        nb_avis = data.get("nb_avis", 0)

        self.set_font("Arial", "B", 24)
        self.set_text_color(*self.primary)
        self.safe_cell(0, 15, nom, ln=True, align="C")
        self.ln(5)
        
        # Informations en tableau simple
        info_data = [
            ("Adresse", adresse),
            ("Site web", site_web),
            ("Note Google", f"{note}/5 ({nb_avis} avis)" if isinstance(note, (int, float)) else f"{note} ({nb_avis} avis)")
        ]
        
        for label, value in info_data:
            self.set_font("Arial", "B", 11)
            self.set_text_color(*self.secondary)
            self.safe_cell(40, 8, f"{label}:")
            
            self.set_font("Arial", "", 11)
            self.set_text_color(*self.primary)
            self.safe_cell(0, 8, value, ln=True)
        
        self.ln(5)

    def score_section(self, data: Dict):
        """Section score épurée"""
        score = data.get("score")
        if score is None:
            return
            
        self.add_section_title("SCORE GLOBAL")
        
        self.set_font("Arial", "B", 48)
        self.set_text_color(*self.accent)
        self.safe_cell(0, 20, f"{score}", align="C", ln=True)
        
        self.set_font("Arial", "", 14)
        self.set_text_color(*self.secondary)
        self.safe_cell(0, 8, "/ 100", align="C", ln=True)
        
        self.ln(10)
        bar_width = 120
        bar_height = 8
        x_center = (self.w - bar_width) / 2
        
        self.set_fill_color(*self.very_light_gray)
        self.rect(x_center, self.get_y(), bar_width, bar_height, "F")
        
        self.set_fill_color(*self.accent)
        progress_width = (score / 100) * bar_width
        if progress_width > 0:
            self.rect(x_center, self.get_y(), progress_width, bar_height, "F")
        
        self.ln(20)

    def simple_list_section(self, items, title):
        """Section liste simple et élégante avec descriptions complètes"""
        self.add_section_title(title)
        
        if not items:
            self.set_font("Arial", "I", 11)
            self.set_text_color(*self.secondary)
            self.safe_cell(0, 8, "Aucun element identifie", ln=True)
            self.ln(10)
            return
        
        for i, item in enumerate(items, 1):
            titre = normalize_text(item.get("titre", ""))
            desc = normalize_text(item.get("description", ""))
            
            self.set_font("Arial", "B", 10)
            self.set_text_color(*self.white)
            self.set_fill_color(*self.secondary)
            self.safe_cell(6, 6, str(i), align="C", fill=True)
            
            self.set_x(self.l_margin + 10)
            self.set_font("Arial", "B", 12)
            self.set_text_color(*self.primary)
            self.safe_cell(0, 6, titre, ln=True)
            
            if desc:
                self.set_font("Arial", "", 10)
                self.set_text_color(*self.secondary)
                self.set_x(self.l_margin + 10)
                available_width = self.w - self.l_margin - self.r_margin - 10
                self.safe_multi_cell(available_width, 5, desc)
            
            self.ln(8)

    def action_plan_section(self, data: Dict):
        """Plan d'action épuré avec descriptions complètes"""
        self.add_section_title("PLAN D'ACTION")
        
        sections = [
            ("short_term", "Actions immediates", ""),
            ("mid_term", "Actions a moyen terme", ""), 
            ("long_term", "Actions a long terme", "")
        ]
        
        for key, label, timeline in sections:
            items = data.get(key, [])
            if not items:
                continue
                
            self.ln(8)
            self.set_font("Arial", "B", 14)
            self.set_text_color(*self.primary)
            self.safe_cell(120, 8, label)
            
            self.set_font("Arial", "I", 10)
            self.set_text_color(*self.secondary)
            self.safe_cell(0, 8, timeline, align="R", ln=True)
            
            self.set_draw_color(*self.light_gray)
            self.set_line_width(0.5)
            self.line(self.l_margin, self.get_y() + 2, self.w - self.r_margin, self.get_y() + 2)
            self.ln(8)
            
            for i, item in enumerate(items, 1):
                titre = normalize_text(item.get("titre", ""))
                desc = normalize_text(item.get("description", ""))
                
                self.set_font("Arial", "B", 12)
                self.set_text_color(*self.accent)
                self.safe_cell(8, 6, f"{i}.")
                
                self.set_font("Arial", "B", 11)
                self.set_text_color(*self.primary)
                self.safe_cell(0, 6, titre, ln=True)
                
                if desc:
                    self.set_font("Arial", "", 10)
                    self.set_text_color(*self.secondary)
                    self.set_x(self.l_margin + 8)
                   
                    available_width = self.w - self.l_margin - self.r_margin - 8
                    self.safe_multi_cell(available_width, 5, desc)
                
                self.ln(6)
            
            self.ln(5)

    def add_generation_info(self):
        """Informations de génération en bas de première page"""
        now = datetime.now()
        self.set_font("Arial", "", 9)
        self.set_text_color(*self.secondary)
        self.safe_cell(0, 6, normalize_text(f"Rapport genere le {now.strftime('%d/%m/%Y a %H:%M')}"), 
                      ln=True, align="R")
        self.ln(10)

def generate_pdf_report(data: Dict, filepath: str):
    """Génère le rapport PDF avec design minimaliste"""
    try:
        pdf = MinimalAuditPDF()
        pdf.add_page()
        # Sections du rapport
        pdf.add_generation_info()
        pdf.company_info_section(data)
        pdf.score_section(data)
        pdf.simple_list_section(data.get("forces", []), "POINTS FORTS")
        pdf.simple_list_section(data.get("faiblesses", []), "POINTS A AMELIORER")
        pdf.action_plan_section(data)
        
        pdf.output(filepath)
        logger.info(f"Rapport PDF minimaliste généré avec succès: {filepath}")
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du PDF: {e}", exc_info=True)
        raise RuntimeError(f"Impossible de générer le PDF: {str(e)}")  