import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ScoreDisplay({ score = 83, businessName, location }) {
  // Fonctions utilitaires inchangées
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Bon - Potentiel d\'amélioration à court terme';
    if (score >= 60) return 'Moyen - Améliorations recommandées';
    return 'Faible - Optimisation urgente requise';
  };

  return (
    <div className="mb-8 text-center max-w-2xl mx-auto">
      {/* En-tête - Style simplifié */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Résultats pour : {businessName}, {location}
      </h2>
      
      {/* Affichage du score - Structure conservée mais sans arrière-plan */}
      <div className="space-y-4">
        <p className="text-gray-600">Score général</p>
        <div className={`text-7xl font-bold ${getScoreColor(score)}`}>
          {score} / 100
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <CheckCircle className="w-5 h-5 text-green-500" />
          {getScoreMessage(score)}
        </div>
      </div>
    </div>
  );
}