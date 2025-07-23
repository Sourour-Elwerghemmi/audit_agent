import React from 'react';

export default function ActionPlan({ recommendations = [] }) {
  if (!recommendations.length) {
    return <p>Aucune recommandation disponible.</p>;
  }

  return (
    <div>
      <h2>Plan d'action stratégique</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>
            <strong>{rec.titre || rec.title}</strong> : {rec.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
