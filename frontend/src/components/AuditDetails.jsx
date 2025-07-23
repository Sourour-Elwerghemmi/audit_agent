export default function AuditDetails() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">AuditFlow</h1>
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Détails de l'Audit</h2>
        <h3 className="text-lg font-medium mb-4 text-gray-600">Audit pour Acme Corp</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <p><span className="font-semibold">ID AUDIT:</span> #AUDIT-2023-001</p>
            <p><span className="font-semibold">NOM DE L'ENTREPRISE:</span> Acme Corp</p>
            <p><span className="font-semibold">DATE DE L'AUDIT:</span> 2023-10-26</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">SCORE:</span> 92%</p>
            <p><span className="font-semibold">AUDITEUR:</span> Jane Smith</p>
            <p><span className="font-semibold">TYPE D'AUDIT:</span> Conformité Financière</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-2 text-orange-500">Forces</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Système de contrôle interne robuste pour la gestion de trésorerie.</li>
            <li>Forte culture de conformité au sein du département financier.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-lg mb-2 text-orange-500">Faiblesses</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Manque de documentation standardisée pour l'intégration de nouveaux fournisseurs.</li>
            <li>Fréquence insuffisante de révision des contrôles d'accès aux données financières sensibles.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2 text-orange-500">Recommandations</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mettre en œuvre un processus d'approbation des dépenses plus strict avec des reçus numériques obligatoires.</li>
            <li>Mettre à jour le modèle de contrat de fournisseur pour inclure tous les champs requis.</li>
            <li>Effectuer des examens internes trimestriels de la documentation financière.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
