import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict
from fpdf import FPDF
from datetime import datetime

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
            "long_term": sanitize_list(plan.get("long_term", [])),
        }

    except Exception as e:
        logger.error("Génération plan d'action échouée : %s", e, exc_info=True)
        return {"short_term": [], "mid_term": [], "long_term": []}

class AuditPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
      
        self.primary_orange = (255, 140, 0)     
        self.light_orange = (255, 200, 100)    
        self.dark_orange = (205, 102, 0)       
        self.very_light_orange = (255, 245, 230)
        self.gray = (128, 128, 128)           
        self.dark_gray = (64, 64, 64)          
        self.light_gray = (240, 240, 240)      

    def header(self):
        
        self.set_fill_color(*self.primary_orange)
        self.rect(0, 0, self.w, 25, "F")
        
        self.set_fill_color(*self.light_orange)
        self.rect(0, 25, self.w, 3, "F")

        self.set_font("Arial", "B", 20)
        self.set_text_color(255, 255, 255)
        self.set_y(8)
        self.cell(0, 12, "AUDIT DE VISIBILITÉ LOCALE", border=0, ln=True, align="C")
        
        self.set_font("Arial", "", 12)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, "Rapport d'analyse et recommandations", border=0, ln=True, align="C")
        self.ln(10)

    def footer(self):
        self.set_y(-20)
        
        self.set_draw_color(*self.primary_orange)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)
        
        self.set_font("Arial", "I", 9)
        self.set_text_color(*self.gray)
        self.cell(0, 6, f"Page {self.page_no()}", align="C", ln=True)
        
        self.set_font("Arial", "B", 9)
        self.set_text_color(*self.dark_orange)
        self.cell(0, 6, "Rapport généré par AgentLocalAI - contact@agentlocalai.com", align="C")

    def company_info_box(self, data: Dict):
        """Boîte d'informations de l'entreprise avec style moderne"""
        nom = data.get("nom", "N/A")
        adresse = data.get("adresse", "N/A")
        site_web = data.get("site_web", "N/A")
        note = data.get("note", "N/A")
        nb_avis = data.get("nb_avis", 0)
        
        self.set_fill_color(*self.very_light_orange)
        box_height = 45
        self.rect(self.l_margin, self.get_y(), self.w - self.l_margin - self.r_margin, box_height, "F")
        
        self.set_draw_color(*self.light_orange)
        self.set_line_width(1)
        self.rect(self.l_margin, self.get_y(), self.w - self.l_margin - self.r_margin, box_height)
        
        y_start = self.get_y() + 5
        
        self.set_y(y_start)
        self.set_font("Arial", "B", 14)
        self.set_text_color(*self.dark_orange)
        self.set_x(self.l_margin + 5)
        self.cell(0, 8, nom[:80] + ("..." if len(nom) > 80 else ""), ln=True)
        
        info_items = [
            ("Adresse:", adresse[:60] + ("..." if len(adresse) > 60 else "")),
            ("Site web:", site_web),
            ("Évaluation:", f"{note} ({nb_avis} avis)" if nb_avis else str(note))
        ]
        
        self.set_font("Arial", "", 10)
        for label, value in info_items:
            self.set_x(self.l_margin + 5)
            self.set_text_color(*self.dark_gray)
            self.cell(25, 6, label, ln=False)
            self.set_text_color(0, 0, 0)
            self.cell(0, 6, value, ln=True)
        
        self.set_y(self.get_y() + box_height - 35 + 8)

    def score_circle(self, score):
        """Cercle de score avec style moderne"""
        if score is None:
            return
            
        center_x = self.w - 40
        center_y = self.get_y() + 20
        radius = 15
        
        self.set_fill_color(*self.light_gray)
        self.set_draw_color(*self.gray)
        self.set_line_width(2)
        
        self.set_fill_color(*self.very_light_orange)
        self.rect(center_x - radius, center_y - radius, radius * 2, radius * 2, "F")
        
        color = self.primary_orange if score >= 70 else (255, 165, 0) if score >= 50 else (255, 69, 0)
        self.set_draw_color(*color)
        self.set_line_width(3)
        self.rect(center_x - radius, center_y - radius, radius * 2, radius * 2)
        
        
        self.set_font("Arial", "B", 16)
        self.set_text_color(*color)
        self.set_xy(center_x - 10, center_y - 5)
        self.cell(20, 10, f"{score}", align="C")
        
       
        self.set_font("Arial", "", 8)
        self.set_text_color(*self.dark_gray)
        self.set_xy(center_x - 10, center_y + 8)
        self.cell(20, 4, "/100", align="C")

    def section_title(self, title, icon=""):
        """Titre de section avec style amélioré"""
        self.ln(5)
        
      
        self.set_fill_color(*self.light_orange)
        title_height = 12
        self.rect(self.l_margin, self.get_y(), self.w - self.l_margin - self.r_margin, title_height, "F")
        
        self.set_font("Arial", "B", 14)
        self.set_text_color(*self.dark_orange)
        self.set_y(self.get_y() + 2)
        self.cell(0, 8, f"{icon} {title}", ln=True, align="L")
        
        
        self.set_draw_color(*self.primary_orange)
        self.set_line_width(2)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(8)

    def diagnostic_summary(self, data: Dict):
        """Résumé du diagnostic avec indicateurs visuels"""
        self.section_title("DIAGNOSTIC GÉNÉRAL", "📊")
        
        score = data.get("score")
        if score is not None:
            
            self.set_font("Arial", "B", 16)
            self.set_text_color(*self.primary_orange)
            self.cell(0, 10, f"Score Global: {score}/100", ln=True, align="C")
            
            bar_width = 120
            bar_height = 8
            x_start = (self.w - bar_width) / 2
            
            
            self.set_fill_color(*self.light_gray)
            self.rect(x_start, self.get_y(), bar_width, bar_height, "F")
           
            progress_width = (score / 100) * bar_width
            color = self.primary_orange if score >= 70 else (255, 165, 0) if score >= 50 else (255, 69, 0)
            self.set_fill_color(*color)
            self.rect(x_start, self.get_y(), progress_width, bar_height, "F")
            
            self.ln(15)

    def write_list_modern(self, items, list_type="default"):
        """Liste avec style moderne et puces personnalisées"""
        if not items:
            self.set_font("Arial", "I", 11)
            self.set_text_color(*self.gray)
            self.cell(0, 7, "Aucun élément à afficher.", ln=True)
            self.ln(3)
            return

        for i, item in enumerate(items, 1):
            titre = item.get("titre", "")
            desc = item.get("description", "")

        
            if i % 2 == 0:
                item_height = 15 + (len(desc) // 80) * 6
                self.set_fill_color(250, 250, 250)
                self.rect(self.l_margin, self.get_y(), self.w - self.l_margin - self.r_margin, item_height, "F")

            
            self.set_font("Arial", "B", 11)
            
            
            if list_type == "forces":
                color = (0, 150, 0)  
                bullet = "✓"
            elif list_type == "faiblesses":
                color = (200, 50, 50)  
                bullet = "✗"
            else:
                color = self.dark_orange
                bullet = f"{i}."
            
            self.set_text_color(*color)
            self.set_x(self.l_margin + 5)
            self.cell(8, 7, bullet, ln=False)
            
            # Titre en gras
            self.set_text_color(*self.dark_gray)
            self.cell(0, 7, titre, ln=True)

            # Description avec retrait
            if desc:
                self.set_font("Arial", "", 10)
                self.set_text_color(0, 0, 0)
                self.set_x(self.l_margin + 15)
                
                # Découpage intelligent du texte
                words = desc.split()
                lines = []
                current_line = ""
                max_chars = 85
                
                for word in words:
                    if len(current_line + " " + word) <= max_chars:
                        current_line += (" " if current_line else "") + word
                    else:
                        if current_line:
                            lines.append(current_line)
                        current_line = word
                
                if current_line:
                    lines.append(current_line)
                
                for line in lines:
                    self.set_x(self.l_margin + 15)
                    self.cell(0, 6, line, ln=True)
            
            self.ln(4)

    def action_plan_section(self, data: Dict):
        """Section plan d'action avec timeline visuelle"""
        self.add_page()
        self.section_title("PLAN D'ACTION STRATÉGIQUE", "🎯")
        
        periods = [
            ("short_term", "Actions à Court Terme", "🚀", (255, 100, 100)),
            ("mid_term", "Actions à Moyen Terme", "📈", (255, 165, 0)),
            ("long_term", "Actions à Long Terme", "🎯", (50, 150, 50))
        ]
        
        for period_key, period_label, icon, color in periods:
            actions = data.get(period_key, [])
            
            # Titre de période avec couleur distinctive
            self.ln(8)
            self.set_fill_color(*color)
            self.rect(self.l_margin, self.get_y(), self.w - self.l_margin - self.r_margin, 10, "F")
            
            self.set_font("Arial", "B", 13)
            self.set_text_color(255, 255, 255)
            self.set_y(self.get_y() + 1)
            self.cell(0, 8, f"{icon} {period_label}", ln=True, align="C")
            self.ln(6)
            
            self.write_list_modern(actions)

def generate_pdf_report(data: Dict, filepath: str):
    """Génération du rapport PDF avec mise en page améliorée"""
    pdf = AuditPDF()
    pdf.add_page()
    
    # Date de génération
    now = datetime.now()
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(*pdf.gray)
    pdf.cell(0, 6, f"Généré le {now.strftime('%d/%m/%Y à %H:%M')}", ln=True, align="R")
    pdf.ln(5)
    
    # Informations de l'entreprise
    pdf.section_title("INFORMATIONS DE L'ENTREPRISE", "🏢")
    pdf.company_info_box(data)
    pdf.ln(10)
    
    # Diagnostic avec score
    pdf.diagnostic_summary(data)
    
    # Points forts
    forces = data.get("forces", [])
    pdf.section_title("POINTS FORTS", "✅")
    pdf.write_list_modern(forces, "forces")
    pdf.ln(5)
    
    # Points faibles
    faiblesses = data.get("faiblesses", [])
    pdf.section_title("POINTS D'AMÉLIORATION", "⚠️")
    pdf.write_list_modern(faiblesses, "faiblesses")
    
    # Plan d'action
    pdf.action_plan_section(data)
    
    try:
        pdf.output(filepath)
        logger.info(f"Rapport PDF généré avec succès: {filepath}")
    except Exception as e:
        logger.error(f"Erreur lors de la génération du PDF: {e}")
        raise
    