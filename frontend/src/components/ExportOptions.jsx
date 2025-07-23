import React, { useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';

export default function ExportOptions({ pdfUrl, onNewAudit }) {
  const [showReadyMessage, setShowReadyMessage] = useState(false);

  const handleExportPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfUrl.split('/').pop() || 'rapport.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowReadyMessage(true);

      setTimeout(() => {
        setShowReadyMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="rounded-lg p-8 max-w-2xl mx-auto">
      <div className="flex justify-center gap-6">
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors min-w-[200px]"
        >
          <FileText className="w-5 h-5" />
          <span>Télécharger le rapport PDF</span>
        </button>

        <button
          onClick={onNewAudit}
          className="flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors min-w-[200px]"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Relancer un audit</span>
        </button>
      </div>

      {showReadyMessage && (
        <div className="mt-10 flex justify-center items-center text-green-600 text-xl font-semibold">
          <span>Le rapport est en cours de téléchargement . . .</span>
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-1">Contactez-nous</p>
        <p className="text-gray-500">contact@agentlocalai.com</p>
      </div>
    </div>
  );
}