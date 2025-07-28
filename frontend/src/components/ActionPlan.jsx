import React from 'react';
import { Target } from 'lucide-react';

export default function ActionPlan({ recommendations = [] }) {
  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500">Aucune recommandation disponible.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          Plan d'action stratégique
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <h4 className="font-semibold text-slate-800 mb-2">
                {rec.titre || rec.title}
              </h4>
              <p className="text-slate-600 text-sm">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}