import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict
from fpdf import FPDF

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
    def header(self):
        self.set_fill_color(255, 140, 0)  # orange vif
        self.rect(0, 0, self.w, 20, "F")

        self.set_font("Arial", "B", 18)
        self.set_text_color(255, 255, 255)  # blanc
        self.cell(0, 20, "Rapport d'Audit de Visibilité Locale", border=0, ln=True, align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 9)
        self.set_text_color(128, 128, 128)  # gris clair
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def section_title(self, title, color=(255, 140, 0)):
        self.set_font("Arial", "B", 14)
        self.set_text_color(*color)
        self.cell(0, 8, title, ln=True)
        self.set_draw_color(*color)
        self.set_line_width(0.6)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def write_paragraph(self, text, indent=0):
        self.set_font("Arial", "", 12)
        self.set_text_color(0, 0, 0)
        left_margin = self.l_margin + indent * 4
        self.set_x(left_margin)
        self.multi_cell(self.w - left_margin - self.r_margin, 7, text)
        self.ln(3)

    def write_list(self, items):
        bullet_indent = 8
        text_indent = 12

        for item in items:
            titre = item.get("titre", "")
            desc = item.get("description", "")

            # Puce + titre en gras orange foncé
            self.set_font("Arial", "B", 12)
            self.set_text_color(205, 102, 0)  # orange foncé #CD6600
            self.set_x(self.l_margin + bullet_indent)
            self.cell(5, 7, "•", ln=False)
            self.cell(0, 7, f" {titre}", ln=True)

            # Description en normal noir, indentée
            if desc:
                self.set_font("Arial", "", 12)
                self.set_text_color(0, 0, 0)
                self.set_x(self.l_margin + bullet_indent + text_indent)
                self.multi_cell(self.w - self.l_margin - self.r_margin - bullet_indent - text_indent, 6, desc)
            self.ln(2)

def generate_pdf_report(data: Dict, filepath: str):
    pdf = AuditPDF()
    pdf.add_page()

    score = data.get("score")
    if score is not None:
        pdf.set_font("Arial", "B", 20)
        pdf.set_text_color(255, 140, 0)  # orange vif
        pdf.cell(0, 15, f"Score Audit : {score}/100", ln=True, align="C")
        pdf.ln(8)

    forces = data.get("forces") or []
    pdf.section_title("Forces", color=(255, 165, 79))  # orange clair #FFA54F
    if forces:
        pdf.write_list(forces)
    else:
        pdf.write_paragraph("Aucune force détectée.")

    pdf.ln(8)

    faiblesses = data.get("faiblesses") or []
    pdf.section_title("Faiblesses", color=(255, 140, 0))  # orange vif #FF8C00
    if faiblesses:
        pdf.write_list(faiblesses)
    else:
        pdf.write_paragraph("Aucune faiblesse détectée.")

    pdf.ln(8)

    pdf.section_title("Recommandations stratégiques", color=(255, 165, 0))  # orange doré #FFA500
    for periode, label in [("short_term", "Court terme"), ("mid_term", "Moyen terme"), ("long_term", "Long terme")]:
        recos = data.get(periode) or []
        pdf.set_font("Arial", "B", 13)
        pdf.set_text_color(255, 140, 0)  # orange vif #FF8C00
        pdf.cell(0, 10, label, ln=True)
        pdf.ln(2)

        if recos:
            pdf.write_list(recos)
        else:
            pdf.set_font("Arial", "I", 12)
            pdf.set_text_color(128, 128, 128)
            pdf.cell(0, 7, "Aucune recommandation.", ln=True)

        pdf.ln(6)

    pdf.output(filepath)             