from typing import Dict
from fpdf import FPDF
from datetime import datetime
from pathlib import Path
import unicodedata
import os

def normalize_text(text: str) -> str:
    """Normalise le texte pour éviter les caractères non supportés par FPDF"""
    replacements = {
        'œ': 'oe', 'Œ': 'OE', 'æ': 'ae', 'Æ': 'AE', 'ç': 'c', 'Ç': 'C',
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'ý': 'y', 'ÿ': 'y', 'Ý': 'Y', 'Ÿ': 'Y', 'ñ': 'n', 'Ñ': 'N',
        '\'': "'", '"': '"', '…': '...', '–': '-', '—': '-'
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    try:
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        text.encode('latin-1')
        return text
    except UnicodeEncodeError:
        return ''.join(c for c in text if ord(c) < 128)

def export_to_pdf(report: Dict) -> str:
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        title = normalize_text(f"Audit Google Business - {report['business_data']['name']}")
        pdf.cell(200, 10, txt=title, ln=1, align='C')
        
        date_text = normalize_text(f"Généré le {datetime.now().strftime('%d/%m/%Y')}")
        pdf.cell(200, 10, txt=date_text, ln=1, align='C')
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(200, 10, txt="1. Données de l'entreprise", ln=1)
        pdf.set_font("Arial", size=12)
        
        data = report['business_data']
        pdf.cell(200, 10, txt=normalize_text(f"Nom: {data['name']}"), ln=1)
        pdf.cell(200, 10, txt=normalize_text(f"Adresse: {data['address']}"), ln=1)
        pdf.cell(200, 10, txt=normalize_text(f"Note: {data['rating']}/5 ({data['review_count']} avis)"), ln=1)
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(200, 10, txt="2. Diagnostic", ln=1)
        pdf.set_font("Arial", size=12)
        
        pdf.cell(200, 10, txt=normalize_text(f"Score global: {report['score']}/100"), ln=1)
        
        pdf.cell(200, 10, txt="Points forts:", ln=1)
        for strength in report['strengths']:
            if isinstance(strength, dict):
                text = strength.get("titre", "")
            else:
                text = str(strength)
            pdf.multi_cell(180, 10, txt=normalize_text(f"- {text}"))
        
        pdf.cell(200, 10, txt="Points faibles:", ln=1)
        for weakness in report['weaknesses']:
            if isinstance(weakness, dict):
                text = weakness.get("titre", "")
            else:
                text = str(weakness)
            pdf.multi_cell(180, 10, txt=normalize_text(f"- {text}"))
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(200, 10, txt="3. Plan d'action", ln=1)
        pdf.set_font("Arial", size=12)
        
        term_labels = {
            'court_terme': 'Court terme',
            'moyen_terme': 'Moyen terme',
            'long_terme': 'Long terme'
        }
        
        for term in ['court_terme', 'moyen_terme', 'long_terme']:
            if term in report and report[term]:
                pdf.cell(200, 10, txt=term_labels[term] + ':', ln=1)
                for action in report[term]:
                    if isinstance(action, str):
                        action = {"titre": action, "description": ""}
                    titre = action.get("titre", "")
                    description = action.get("description", "")
                    title_text = normalize_text(f"- {titre} ({term_labels[term]})")
                    pdf.cell(200, 10, txt=title_text, ln=1)
                    if description.strip():
                        pdf.multi_cell(180, 10, txt=normalize_text(description))
                    pdf.ln(2)
        # Création du dossier reports si inexistant
        Path("reports").mkdir(exist_ok=True)
        
        safe_name = normalize_text(report['business_data']['name'])
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"reports/audit_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        pdf.output(filename)
        return filename
        
    except Exception as e:
        raise Exception(f"PDF generation error: {str(e)}")
        