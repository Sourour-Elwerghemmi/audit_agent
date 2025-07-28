import React from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function LoadingScreen({ businessName, location }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-lg mx-auto">
        
        {/* Logo animé */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Analyse en cours
            </h2>
            <p className="text-xl font-semibold text-gray-900">
              {businessName}, {location}
            </p>
          </div>
        </div>
        
        {/* Status */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-gray-900">
              Génération de votre
            </h3>
            <h3 className="text-3xl font-bold text-orange-500">
              rapport personnalisé
            </h3>
          </div>
          
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Nous analysons vos données publiques et évaluons votre présence en ligne 
            pour créer vos recommandations sur mesure.
          </p>
          
          {/* Barre de progression moderne */}
          <div className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: '75%',
                  animation: 'modernProgress 3s ease-in-out infinite'
                }}
              />
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Finalisation...</span>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes modernProgress {
            0% { width: 20%; }
            50% { width: 75%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}