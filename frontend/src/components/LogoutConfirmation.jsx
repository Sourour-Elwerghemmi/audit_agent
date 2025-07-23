export default function LogoutConfirmation({ onLogout, onReturnHome }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-bold text-orange-500 mb-2">AuditFlow</h1>
        <p className="text-lg mb-6 text-gray-600">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onLogout}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            Confirmer la déconnexion
          </button>
          <button
            onClick={onReturnHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-md transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}