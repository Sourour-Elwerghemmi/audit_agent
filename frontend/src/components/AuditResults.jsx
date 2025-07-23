import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import ExportOptions from './ExportOptions';

export default function AuditResults({ result, businessName, location, onNewAudit }) {
  if (!result) return null;

  // Normalisation des listes (forces/faiblesses/recommandations)
  const normalize = (lst) => {
    if (!Array.isArray(lst)) return [];
    return lst.map(item => {
      if (typeof item === 'string') return { titre: item, description: '' };
      if (item && typeof item === 'object') {
        return { titre: item.title || item.titre || '', description: item.description || '' };
      }
      return { titre: String(item), description: '' };
    });
  };

  const strengths = normalize(result.forces || result.strengths);
  const weaknesses = normalize(result.faiblesses || result.weaknesses);

  // Recommandations par période
  const shortTerm = normalize(result.short_term || []);
  const midTerm = normalize(result.mid_term || []);
  const longTerm = normalize(result.long_term || []);

  const renderList = (list) => {
    if (!list.length) {
      return <p className="text-gray-500 italic">Aucune recommandation</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-2">
        {list.map((item, i) => (
          <li key={i}>
            <strong>{item.titre}</strong>
            {item.description && <p className="text-gray-700 ml-4">{item.description}</p>}
          </li>
        ))}
      </ul>
    );
  };

  // Cadre orange vif foncé et fond jaune clair pour toutes les sections
  const sectionStyle = {
    backgroundColor: '#fef3c7',      // jaune clair
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1px solid #f97316',     // orange vif foncé
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ScoreDisplay
        score={result.score || 0}
        businessName={businessName}
        location={location}
      />

      {/* Informations de l'entreprise */}
      <section style={sectionStyle}>
        <h2 className="text-xl font-bold mb-4">Informations de l'entreprise</h2>
        <p><strong>Nom :</strong> {result.business_data?.name || 'N/A'}</p>
        <p><strong>Adresse :</strong> {result.business_data?.address || 'N/A'}</p>
        <p><strong>Note :</strong> {result.business_data?.rating ? `${result.business_data.rating} / 5` : 'N/A'}</p>
        <p><strong>Nombre d'avis :</strong> {result.business_data?.review_count || 'N/A'}</p>
        <p>
          <strong>Site web :</strong>{' '}
          {result.business_data?.website ? (
            <a
              href={result.business_data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 underline"
              style={{ color: '#f97316' }} // orange vif
            >
              {result.business_data.website}
            </a>
          ) : 'N/A'}
        </p>
      </section>

      {/* Forces */}
      <section style={sectionStyle}>
        <h2 className="text-xl font-bold text-green-700 mb-4">Forces</h2>
        {strengths.length ? (
          <ul className="list-disc list-inside space-y-2">
            {strengths.map((s, i) => (
              <li key={i}>
                <strong>{s.titre}</strong>
                {s.description && <p className="text-gray-700 ml-4">{s.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucune force détectée</p>
        )}
      </section>

      {/* Faiblesses */}
      <section style={sectionStyle}>
        <h2 className="text-xl font-bold text-red-700 mb-4">Faiblesses</h2>
        {weaknesses.length ? (
          <ul className="list-disc list-inside space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i}>
                <strong>{w.titre}</strong>
                {w.description && <p className="text-gray-700 ml-4">{w.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucun point faible détecté</p>
        )}
      </section>

      {/* Recommandations stratégiques par période */}
      <section style={sectionStyle}>
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Plan d'action stratégiques</h2>

        <div className="mb-6">
          <h5 className="text-lg font-semibold text-yellow-800 mb-2">Court terme</h5>
          {renderList(shortTerm)}
        </div>

        <div className="mb-6">
          <h5 className="text-lg font-semibold text-yellow-800 mb-2">Moyen terme</h5>
          {renderList(midTerm)}
        </div>

        <div>
          <h5 className="text-lg font-semibold text-yellow-800 mb-2">Long terme</h5>
          {renderList(longTerm)}
        </div>
      </section>

      <ExportOptions pdfUrl={result.pdf_url} onNewAudit={onNewAudit} />
    </div>
  );
}