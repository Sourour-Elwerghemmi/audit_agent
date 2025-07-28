import React, { useState } from 'react';
import { FileText, RefreshCw, Download, AlertCircle } from 'lucide-react';

export default function ExportOptions({ pdfUrl, onNewAudit }) {
  const [showReadyMessage, setShowReadyMessage] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExportPDF = async () => {
    if (!pdfUrl) {
      setDownloadError("Aucun fichier PDF disponible");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Construire l'URL de téléchargement
      const downloadUrl = pdfUrl.startsWith('http') 
        ? pdfUrl 
        : `${window.location.origin}/api/export-pdf/${pdfUrl.split('/').pop()}`;

      console.log('🔄 Téléchargement PDF depuis:', downloadUrl);

      // Effectuer la requête de téléchargement
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Le fichier téléchargé n\'est pas un PDF valide');
      }

      // Convertir en blob
      const blob = await response.blob();
      
      // Vérifier la taille du blob
      if (blob.size < 1000) {
        throw new Error('Le fichier PDF semble corrompu (taille trop petite)');
      }

      // Créer l'URL de téléchargement
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Générer un nom de fichier approprié
      const filename = pdfUrl.split('/').pop() || `rapport_audit_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Créer et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL blob
      window.URL.revokeObjectURL(blobUrl);

      // Afficher le message de succès
      setShowReadyMessage(true);
      console.log('✅ PDF téléchargé avec succès:', filename);

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowReadyMessage(false);
      }, 3000);

    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      setDownloadError(`Erreur de téléchargement: ${error.message}`);
      
      // Masquer l'erreur après 5 secondes
      setTimeout(() => {
        setDownloadError(null);
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-lg p-8 max-w-2xl mx-auto">
      <div className="flex justify-center gap-6">
        <button
          onClick={handleExportPDF}
          disabled={!pdfUrl || isDownloading}
          className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors min-w-[200px] ${
            !pdfUrl || isDownloading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isDownloading ? (
            <>
              <Download className="w-5 h-5 animate-spin" />
              <span>Téléchargement...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Télécharger le rapport PDF</span>
            </>
          )}
        </button>

        <button
          onClick={onNewAudit}
          disabled={isDownloading}
          className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors min-w-[200px] ${
            isDownloading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Relancer un audit</span>
        </button>
      </div>

      {/* Message de succès */}
      {showReadyMessage && (
        <div className="mt-6 flex justify-center items-center text-green-600 text-lg font-semibold bg-green-50 p-4 rounded-lg border border-green-200">
          <Download className="w-5 h-5 mr-2" />
          <span>Le rapport PDF a été téléchargé avec succès !</span>
        </div>
      )}
      {/* Message d'erreur */}
      {downloadError && (
        <div className="mt-6 flex justify-center items-center text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-1">Contactez-nous</p>
        <p className="text-gray-500">contact@agentlocalai.com</p>
      </div>
    </div>
  );
}