export default function AccountConfirmation({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-bold text-orange-500 mb-4">
          Votre compte a été créé avec succès !
        </h1>
        <p className="mb-6 text-gray-600">
          Bienvenue dans votre espace d'audit local ! Vous pouvez maintenant vous connecter pour lancer votre premier audit.
        </p>
        <button
          onClick={onLogin}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}