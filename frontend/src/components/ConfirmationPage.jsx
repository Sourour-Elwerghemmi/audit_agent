import { CheckCircle, Home } from 'lucide-react';

export default function ConfirmationPage({ onBackToDashboard }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl text-center">
          
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-800 mb-4 leading-tight">
            Informations mises à jour avec succès !
          </h1>
          
          {/* Description */}
          <p className="text-slate-600 mb-8 leading-relaxed">
            Vos informations personnelles ont été sauvegardées.
            Vous pouvez maintenant continuer à utiliser l'application.
          </p>
          
          {/* Action Button */}
          <button
            onClick={onBackToDashboard}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          
        </div>
      </div>
    </div>
  );
}