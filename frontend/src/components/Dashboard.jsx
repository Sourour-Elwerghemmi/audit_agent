import { useState, useEffect } from 'react';

export default function Dashboard({ user, onConfirmLogout, onNewAudit, onViewSettings, onViewAuditDetails }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAudits = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ RÉCUPÉRER LE TOKEN DEPUIS LOCALSTORAGE
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('❌ Session expirée, veuillez vous reconnecter');
        return;
      }

      console.log('Récupération des audits avec token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/user/audits', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Status réponse audits:', response.status);

      if (response.status === 401) {
        // Si c'est le premier essai et qu'on a une erreur 401, essayer une fois de plus
        // avec un délai pour laisser le temps au token d'être mis à jour
        if (retryCount === 0) {
          console.log('🔄 Token invalide, tentative de récupération après délai...');
          setTimeout(() => {
            fetchAudits(1); // Retry une seule fois
          }, 1000);
          return;
        } else {
          setError('❌ Session expirée, veuillez vous reconnecter');
          // Optionnel: nettoyer le token invalide
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setAudits([]);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur API audits:', errorData);
        throw new Error(`Erreur lors de la récupération des audits: ${response.status}`);
      }

      const data = await response.json();
      console.log('Audits reçus:', data);
      
      setAudits(data.audits || data || []); // Gérer les différents formats de réponse

    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ VÉRIFIER QU'ON A UN TOKEN PLUTÔT QU'UN USER
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Ajouter un petit délai pour s'assurer que le token est bien mis à jour
      // après une modification de profil
      const timeoutId = setTimeout(() => {
        fetchAudits();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
      setError('Aucun token d\'authentification trouvé');
    }
  }, [user]); // Garder user en dépendance pour recharger si l'utilisateur change

  const filteredAudits = audits.filter((audit) => {
    const searchableFields = [
      audit.name,
      audit.company,
      audit.location,
      audit.nom_entreprise,
    ].filter(Boolean);

    const searchableText = searchableFields.join(' ').toLowerCase();
    return searchableText.includes(searchQuery.toLowerCase());
  });

  const auditsPerPage = 4;
  const totalPages = Math.ceil(filteredAudits.length / auditsPerPage);
  const currentAudits = filteredAudits.slice(
    (currentPage - 1) * auditsPerPage,
    currentPage * auditsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-orange-500">Tableau de bord</h1>
          <div className="flex items-center space-x-4">
            {user && process.env.NODE_ENV === 'development' && (
              <span className="text-sm text-gray-500">
                Connecté: {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.name || user.email || 'Utilisateur'}
              </span>
            )}
            <button 
              onClick={onViewSettings}
              className="text-orange-500 hover:text-orange-700 flex items-center space-x-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Paramètres de profil</span>
            </button>
            <button onClick={onNewAudit} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition">
              Lancer un audit
            </button>
            <button
              onClick={onConfirmLogout}
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-medium px-4 py-2 rounded-md transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise ou localisation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '350px' }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="w-8 h-1 bg-orange-500 mb-8"></div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p><strong>Erreur:</strong> {error}</p>
            <button 
              onClick={() => fetchAudits()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Réessayer
            </button>
            {error.includes('Session expirée') && (
              <button 
                onClick={onConfirmLogout}
                className="mt-2 ml-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Se reconnecter
              </button>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Nom de l'entreprise</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date d'audit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                      <span className="ml-2">Chargement des audits...</span>
                    </div>
                  </td>
                </tr>
              ) : currentAudits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                    {searchQuery ? `Aucun audit trouvé pour "${searchQuery}".` : 'Aucun audit effectué pour le moment.'}
                  </td>
                </tr>
              ) : (
                currentAudits.map((audit, index) => (
                  <tr key={audit.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{audit.name || audit.company || audit.nom_entreprise || 'Entreprise inconnue'}</td>
                    <td className="px-6 py-4">{audit.location || 'Non spécifiée'}</td>
                    <td className="px-6 py-4">
                      {(audit.date || audit.created_at) ? new Date(audit.date || audit.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        style={{ 
                          backgroundColor: 'rgba(249, 115, 22, 0.2)', 
                          color: '#F97316' 
                        }} 
                        className="px-3 py-1 inline-flex text-md leading-5 font-semibold rounded-full"
                      >
                        {audit.score !== undefined && audit.score !== null ? `${audit.score}/100` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onViewAuditDetails(audit)}
                        className="text-orange-600 hover:text-orange-800 font-medium px-3 py-1.5 rounded-md hover:bg-orange-50 transition-colors"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center space-x-4">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Précédent
            </button>
            <span className="text-gray-700">Page {currentPage} sur {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
              disabled={currentPage === totalPages} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
