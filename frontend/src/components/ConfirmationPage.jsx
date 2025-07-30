import { CheckCircle, Home } from 'lucide-react';

export default function ConfirmationPage({ onBackToDashboard }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-sm border-0 text-center">
          
          {/* Success Icon */}
          <div className="mb-6">
            <div className="flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            Profil mis à jour
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Vos informations ont été sauvegardées avec succès.
          </p>
          
          {/* Action Button */}
          <button
            onClick={onBackToDashboard}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            Retour au tableau de bord
          </button>
          
        </div>
      </div>
    </div>
  );
}