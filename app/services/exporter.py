from typing import Dict, List, Union
from fpdf import FPDF
from datetime import datetime
from pathlib import Path
import unicodedata
import os

def normalize_text(text: str) -> str:
    """Normalise le texte pour FPDF avec une approche plus robuste"""
    if not text:
        return ""
    
    # Remplacements spécifiques pour les caractères français
    replacements = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'ç': 'c', 'Ç': 'C',
        'ñ': 'n', 'Ñ': 'N',
        'œ': 'oe', 'Œ': 'OE',
        'æ': 'ae', 'Æ': 'AE',
        ''': "'", ''': "'", '"': '"', '"': '"',
        '…': '...', '–': '-', '—': '-'
    }
    
    # Appliquer les remplacements
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Encoder/décoder pour nettoyer
    try:
        # Essayer l'encodage latin-1 direct
        text.encode('latin-1')
        return text
    except UnicodeEncodeError:
        # Si ça échoue, nettoyer plus agressivement
        clean_text = ""
        for char in text:
            try:
                char.encode('latin-1')
                clean_text += char
            except UnicodeEncodeError:
                if ord(char) < 128:
                    clean_text += char
                else:
                    clean_text += '?'
        return clean_text

def safe_get_text(item: Union[str, dict], key: str = "titre") -> str:
    """Extrait le texte d'un item de manière sécurisée"""
    if isinstance(item, str):
        return normalize_text(item)
    elif isinstance(item, dict):
        text = item.get(key) or item.get("title") or ""
        return normalize_text(str(text))
    return ""

def wrap_text(text: str, max_length: int = 80) -> List[str]:
    """Découpe le texte en lignes de longueur maximale"""
    if not text:
        return [""]
    
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        if len(current_line + " " + word) <= max_length:
            if current_line:
                current_line += " " + word
            else:
                current_line = word
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    return lines if lines else [""]

class SafePDF(FPDF):
    """Extension de FPDF avec des méthodes sécurisées"""
    
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
    
    def safe_cell(self, w, h, txt="", ln=0, align='', border=0):
        """Cell sécurisée qui gère les textes longs"""
        try:
            txt = normalize_text(str(txt))
            # Limiter la longueur du texte pour éviter les débordements
            if len(txt) > 100:
                txt = txt[:97] + "..."
            self.cell(w, h, txt, border=border, ln=ln, align=align)
        except Exception as e:
            # Supprimer le message de debug
            self.cell(w, h, "Erreur affichage", border=border, ln=ln, align=align)
    
    def safe_multi_cell(self, w, h, txt="", align='L', border=0):
        """Multi_cell sécurisée qui gère les textes longs"""
        try:
            txt = normalize_text(str(txt))
            
            # Si le texte est trop long, le découper
            if len(txt) > 500:
                txt = txt[:497] + "..."
            
            # Vérifier qu'on a assez d'espace horizontal
            if w == 0:
                w = self.w - self.r_margin - self.l_margin
            
            # S'assurer qu'on a au moins 20mm d'espace
            if w < 20:
                w = 20
            
            # Découper en lignes si nécessaire
            lines = wrap_text(txt, max(50, int(w * 2)))  # Ajuster selon la largeur
            
            for line in lines:
                if line.strip():
                    self.multi_cell(w, h, line, border=border, align=align)
                    
        except Exception as e:
            # Supprimer le message de debug
            # En cas d'erreur, utiliser cell simple
            try:
                self.cell(w, h, "Description disponible", border=border, ln=1, align=align)
            except:
                pass  # Ignorer si même cell échoue

def export_to_pdf(report: Dict) -> str:
    """Génère un PDF à partir du rapport d'audit"""
    try:
        # Créer le dossier reports si nécessaire
        Path("reports").mkdir(exist_ok=True)
        
        # Initialiser le PDF avec la classe sécurisée
        pdf = SafePDF()
        pdf.add_page()
        
        # En-tête du document
        pdf.set_font("Arial", 'B', 16)
        business_name = report.get('business_data', {}).get('name', 'Entreprise inconnue')
        title = normalize_text(f"Audit Google Business - {business_name}")
        pdf.safe_cell(0, 15, title, ln=1, align='C')
        
        pdf.set_font("Arial", size=10)
        date_text = normalize_text(f"Genere le {datetime.now().strftime('%d/%m/%Y a %H:%M')}")
        pdf.safe_cell(0, 10, date_text, ln=1, align='C')
        pdf.ln(10)
        
        # === 1. INFORMATIONS DE L'ENTREPRISE ===
        pdf.set_font("Arial", 'B', 14)
        pdf.safe_cell(0, 10, "1. INFORMATIONS DE L'ENTREPRISE", ln=1)
        pdf.set_font("Arial", size=11)
        
        business_data = report.get('business_data', {})
        
        # Nom
        name = normalize_text(business_data.get('name', 'Non specifie'))
        pdf.safe_cell(0, 8, f"Nom: {name}", ln=1)
        
        # Adresse
        address = normalize_text(business_data.get('address', 'Non specifiee'))
        if len(address) > 80:
            pdf.safe_cell(0, 8, "Adresse:", ln=1)
            pdf.safe_multi_cell(0, 6, f"  {address}")
        else:
            pdf.safe_cell(0, 8, f"Adresse: {address}", ln=1)
        
        # Site web
        website = business_data.get('website')
        if website:
            website_text = normalize_text(f"Site web: {website}")
            if len(website_text) > 80:
                pdf.safe_cell(0, 8, "Site web:", ln=1)
                pdf.safe_multi_cell(0, 6, f"  {website}")
            else:
                pdf.safe_cell(0, 8, website_text, ln=1)
        
        # Note et avis
        rating = business_data.get('rating', 0)
        review_count = business_data.get('review_count', 0)
        pdf.safe_cell(0, 8, f"Note: {rating}/5 ({review_count} avis)", ln=1)
        
        pdf.ln(10)
        
        # === 2. SCORE ET DIAGNOSTIC ===
        pdf.set_font("Arial", 'B', 14)
        pdf.safe_cell(0, 10, "2. DIAGNOSTIC GENERAL", ln=1)
        pdf.set_font("Arial", size=11)
        
        score = report.get('score', 0)
        pdf.safe_cell(0, 8, f"Score global: {score}/100", ln=1)
        pdf.ln(5)
        
        # Points forts
        pdf.set_font("Arial", 'B', 12)
        pdf.safe_cell(0, 8, "Points forts:", ln=1)
        pdf.set_font("Arial", size=10)
        
        strengths = report.get('strengths', [])
        if strengths:
            for strength in strengths[:10]:  # Limiter à 10 éléments
                text = safe_get_text(strength, "titre")
                if text:
                    # Découper le texte si trop long
                    if len(text) > 70:
                        pdf.safe_cell(0, 6, f"+ {text[:67]}...", ln=1)
                    else:
                        pdf.safe_cell(0, 6, f"+ {text}", ln=1)
        else:
            pdf.safe_cell(0, 6, "  Aucun point fort identifie", ln=1)
        
        pdf.ln(5)
        
        # Points faibles
        pdf.set_font("Arial", 'B', 12)
        pdf.safe_cell(0, 8, "Points faibles:", ln=1)
        pdf.set_font("Arial", size=10)
        
        weaknesses = report.get('weaknesses', [])
        if weaknesses:
            for weakness in weaknesses[:10]:  # Limiter à 10 éléments
                text = safe_get_text(weakness, "titre")
                if text:
                    # Découper le texte si trop long
                    if len(text) > 70:
                        pdf.safe_cell(0, 6, f"- {text[:67]}...", ln=1)
                    else:
                        pdf.safe_cell(0, 6, f"- {text}", ln=1)
        else:
            pdf.safe_cell(0, 6, "  Aucun point faible identifie", ln=1)
        
        pdf.ln(10)
        
        # === 3. PLAN D'ACTION ===
        pdf.set_font("Arial", 'B', 14)
        pdf.safe_cell(0, 10, "3. PLAN D'ACTION", ln=1)
        
        # Mapping des périodes (le code utilise les clés anglaises)
        periods = [
            ('short_term', 'Actions a court terme '),
            ('mid_term', 'Actions a moyen terme '),
            ('long_term', 'Actions a long terme ')
        ]
        
        for period_key, period_label in periods:
            actions = report.get(period_key, [])
            if actions:
                pdf.set_font("Arial", 'B', 12)
                pdf.safe_cell(0, 8, period_label, ln=1)
                pdf.set_font("Arial", size=10)
                
                for i, action in enumerate(actions[:8], 1):  # Limiter à 8 actions par période
                    if isinstance(action, dict):
                        title = action.get('title') or action.get('titre', '')
                        description = action.get('description', '')
                    else:
                        title = str(action)
                        description = ''
                    
                    if title:
                        title_text = normalize_text(f"{i}. {title}")
                        
                        # Gérer les titres longs
                        if len(title_text) > 75:
                            pdf.safe_cell(0, 6, f"{title_text[:72]}...", ln=1)
                        else:
                            pdf.safe_cell(0, 6, title_text, ln=1)
                        
                        # Gérer les descriptions
                        if description and description.strip():
                            desc_text = normalize_text(description)
                            if len(desc_text) > 200:
                                desc_text = desc_text[:197] + "..."
                            
                            # Utiliser multi_cell pour les descriptions avec indentation
                            pdf.safe_multi_cell(0, 5, f"   {desc_text}")
                        
                        pdf.ln(2)
                
                pdf.ln(5)
        
        # === FOOTER ===
        pdf.ln(10)
        pdf.set_font("Arial", 'I', 9)
        pdf.safe_cell(0, 8, "Rapport genere par AgentLocalAI", ln=1, align='C')
        pdf.safe_cell(0, 8, "contact@agentlocalai.com", ln=1, align='C')
        
        # Générer le nom de fichier sécurisé
        safe_name = business_name
        # Nettoyer le nom pour le fichier
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_name = safe_name.replace(' ', '_')[:50]  # Limiter la longueur
        
        filename = f"reports/audit_{safe_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Sauvegarder le PDF
        pdf.output(filename)
        
        # Vérifier que le fichier a été créé
        if not os.path.exists(filename):
            raise Exception("Le fichier PDF n'a pas ete cree")
        
        # Vérifier la taille du fichier
        file_size = os.path.getsize(filename)
        if file_size < 1000:  # Moins de 1KB, probablement corrompu
            raise Exception("Le fichier PDF semble corrompu (taille trop petite)")
        
        return filename
        
    except Exception as e:
        raise Exception(f"Erreur de generation PDF: {str(e)}")
