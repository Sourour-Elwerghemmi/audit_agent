import React from 'react';
import { Search } from 'lucide-react';

export default function LoadingScreen({ businessName, location }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Search className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Résultats pour : {businessName}, {location}
          </h2>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-900">
            Analyse en<br />
            <span className="text-orange-500">cours...</span>
          </h3>
          
          <div className="text-gray-600 space-y-2">
            <p>Nous collectons vos données publiques, évaluons votre fiche</p>
            <p>Google Business et générons votre rapport personnalisé.</p>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: '70%',
                animation: 'progress 3s ease-in-out infinite'
              }}
            />
          </div>
          
          <p className="text-gray-500 text-sm">
            Génération des recommandations...
          </p>
        </div>
        
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}