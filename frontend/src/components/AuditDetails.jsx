import React from 'react';

export default function AuditDetails({ audit, onBack }) {
  const normalize = (lst) => {
    if (!lst) return [];
    if (!Array.isArray(lst)) {
      if (typeof lst === 'object' && lst !== null) {
        return Object.entries(lst).map(([key, value]) => ({
          titre: key,
          description: typeof value === 'string' ? value : JSON.stringify(value)
        }));
      }
      return [{ titre: String(lst), description: '' }];
    }

    return lst.map(item => {
      if (typeof item === 'string') return { titre: item, description: '' };
      if (item && typeof item === 'object') {
        return {
          titre: item.title || item.titre || item.name || 'Sans titre',
          description: item.description || item.desc || '',
          priority: item.priority
        };
      }
      return { titre: String(item), description: '' };
    });
  };

  const normalizeStrengthsWeaknesses = (data) => {
    if (!data) return [];

    if (typeof data === 'string') {
      return data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => ({ titre: line, description: '' }));
    }

    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') {
          return { titre: item, description: '' };
        }
        if (item && typeof item === 'object') {
          return {
            titre: item.title || item.titre || item.name || item.text || item.content || 'Sans titre',
            description: item.description || item.desc || item.details || '',
            priority: item.priority
          };
        }
        return { titre: String(item), description: '' };
      }).filter(item => item.titre && item.titre !== 'Sans titre');
    }

    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => ({
        titre: key,
        description: typeof value === 'string' ? value : JSON.stringify(value)
      }));
    }

    return [];
  };

  const renderList = (list, emptyMessage = "Aucune donnée disponible.") => {
    if (!list || !list.length) {
      return (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          {emptyMessage}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map((item, idx) => (
          <div key={idx} style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            position: 'relative'
          }}>
            {item.priority && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor:
                  item.priority === 'high' ? '#fee2e2' :
                  item.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                color:
                  item.priority === 'high' ? '#dc2626' :
                  item.priority === 'medium' ? '#d97706' : '#16a34a'
              }}>
                {item.priority === 'high' ? 'Urgent' :
                 item.priority === 'medium' ? 'Important' : 'Planifié'}
              </div>
            )}

            <h4 style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#0f172a',
              margin: '0 0 6px 0',
              paddingRight: item.priority ? '80px' : '0'
            }}>
              {item.titre}
            </h4>

            {item.description && (
              <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!audit) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px'
          }}>
            Aucun audit sélectionné.
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF6B00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  console.log('Audit data:', audit);
  console.log('All audit keys:', Object.keys(audit));
  
  const possibleStrengthsKeys = ['strengths', 'forces', 'points_forts', 'strong_points', 'avantages'];
  const possibleWeaknessesKeys = ['weaknesses', 'faiblesses', 'points_faibles', 'weak_points', 'inconvenients'];
  
  let strengthsData = null;
  let weaknessesData = null;
  
  for (const key of possibleStrengthsKeys) {
    if (audit[key]) {
      strengthsData = audit[key];
      console.log(`Forces trouvées sous la clé: ${key}`, strengthsData);
      break;
    }
  }
  
  for (const key of possibleWeaknessesKeys) {
    if (audit[key]) {
      weaknessesData = audit[key];
      console.log(`Faiblesses trouvées sous la clé: ${key}`, weaknessesData);
      break;
    }
  }
  
  if (!strengthsData || !weaknessesData) {
    console.log('Recherche dans les autres structures...');
    const reco = audit.recommendations || audit.recommandations || {};
    if (reco.strengths || reco.forces) {
      strengthsData = reco.strengths || reco.forces;
      console.log('Forces trouvées dans recommandations:', strengthsData);
    }
    if (reco.weaknesses || reco.faiblesses) {
      weaknessesData = reco.weaknesses || reco.faiblesses;
      console.log('Faiblesses trouvées dans recommandations:', weaknessesData);
    }
  }

  const strengths = normalizeStrengthsWeaknesses(strengthsData);
  const weaknesses = normalizeStrengthsWeaknesses(weaknessesData);

  const rawRecommendations = audit.recommendations || audit.recommandations || {};
  const shortTerm = normalize(rawRecommendations.short_term || []);
  const midTerm = normalize(rawRecommendations.mid_term || []);
  const longTerm = normalize(rawRecommendations.long_term || []);
  const recommendations = (!shortTerm.length && !midTerm.length && !longTerm.length)
    ? normalize(rawRecommendations)
    : [];

  console.log('Strengths normalized:', strengths);
  console.log('Weaknesses normalized:', weaknesses);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'Inter, sans-serif' 
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#0f172a', 
              margin: '0 0 4px 0' 
            }}>
              {audit.name || 'Audit sans nom'}
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                Score: <strong style={{ color: '#0f172a' }}>{audit.score || 'N/A'}</strong>
              </span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {audit.created_at ? new Date(audit.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
              </span>
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF6B00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Points forts */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#0f172a', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#16a34a' }}>✓</span>
                Points forts
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              {renderList(strengths, "Aucun point fort détecté")}
            </div>
          </div>

          {/* Points faibles */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#0f172a', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#dc2626' }}>⚠</span>
                Points faibles
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              {renderList(weaknesses, "Aucun point faible détecté")}
            </div>
          </div>
        </div>

        {/* Plan d'action */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#0f172a', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#3b82f6' }}>💡</span>
              Plan d'action
            </h2>
          </div>
          
          <div style={{ padding: '24px' }}>
            {(shortTerm.length || midTerm.length || longTerm.length) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {shortTerm.length > 0 && (
                  <div>
                    <h2 style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#0f172a', 
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                       Court terme 
                    </h2>
                    {renderList(shortTerm)}
                  </div>
                )}
                
                {midTerm.length > 0 && (
                  <div>
                    <h2 style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#0f172a', 
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                       Moyen terme
                    </h2>
                    {renderList(midTerm)}
                  </div>
                )}
                
                {longTerm.length > 0 && (
                  <div>
                    <h2 style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#0f172a', 
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Long terme
                    </h2>
                    {renderList(longTerm)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#7c3aed', 
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                   Recommandations générales ({recommendations.length})
                </h2>
                {renderList(recommendations, "Aucune recommandation disponible")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}