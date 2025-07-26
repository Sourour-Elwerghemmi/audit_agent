import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import ExportOptions from './ExportOptions';

export default function AuditResults({ result, businessName, location, onNewAudit, onBackToHome }) {
  if (!result) return null;

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
          color: '#000000',
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
              color: '#000000',
              margin: '0 0 6px 0',
              paddingRight: item.priority ? '80px' : '0'
            }}>
              {item.titre}
            </h4>

            {item.description && (
              <p style={{
                margin: 0,
                color: '#000000',
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

  const strengths = normalizeStrengthsWeaknesses(result.forces || result.strengths);
  const weaknesses = normalizeStrengthsWeaknesses(result.faiblesses || result.weaknesses);
  const shortTerm = normalize(result.short_term || []);
  const midTerm = normalize(result.mid_term || []);
  const longTerm = normalize(result.long_term || []);

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
          <button
            onClick={onBackToHome}
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
        
        {/* Score Display */}
        <div style={{ marginBottom: '32px' }}>
          <ScoreDisplay
            score={result.score || 0}
            businessName={businessName}
            location={location}
          />
        </div>

        {/* Informations de l'entreprise */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid #f97316',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#000000', 
            margin: '0 0 16px 0'
          }}>
            Informations de l'entreprise
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: '0', color: '#000000' }}>
              <strong>Nom :</strong> {result.business_data?.name || 'N/A'}
            </p>
            <p style={{ margin: '0', color: '#000000' }}>
              <strong>Adresse :</strong> {result.business_data?.address || 'N/A'}
            </p>
            <p style={{ margin: '0', color: '#000000' }}>
              <strong>Note :</strong> {result.business_data?.rating ? `${result.business_data.rating} / 5` : 'N/A'}
            </p>
            <p style={{ margin: '0', color: '#000000' }}>
              <strong>Nombre d'avis :</strong> {result.business_data?.review_count || 'N/A'}
            </p>
            <p style={{ margin: '0', color: '#000000' }}>
              <strong>Site web :</strong>{' '}
              {result.business_data?.website ? (
                <a
                  href={result.business_data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#f97316', textDecoration: 'underline' }}
                >
                  {result.business_data.website}
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>

        {/* Points forts */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid #f97316',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 16px 0'
          }}>
            Forces
          </h2>
          {strengths.length ? (
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {strengths.map((s, i) => (
                <li key={i} style={{ color: '#000000' }}>
                  <strong>{s.titre}</strong>
                  {s.description && <p style={{ color: '#000000', marginLeft: '16px', margin: '4px 0 0 16px' }}>{s.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#000000', fontStyle: 'italic', margin: '0' }}>Aucune force détectée</p>
          )}
        </div>

        {/* Points faibles */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid #f97316',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 16px 0'
          }}>
            Faiblesses
          </h2>
          {weaknesses.length ? (
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {weaknesses.map((w, i) => (
                <li key={i} style={{ color: '#000000' }}>
                  <strong>{w.titre}</strong>
                  {w.description && <p style={{ color: '#000000', marginLeft: '16px', margin: '4px 0 0 16px' }}>{w.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#000000', fontStyle: 'italic', margin: '0' }}>Aucun point faible détecté</p>
          )}
        </div>

        {/* Plan d'action */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid #f97316',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 16px 0'
          }}>
            Plan d'action stratégique
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {shortTerm.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#000000', 
                  margin: '0 0 8px 0'
                }}>
                  Court terme
                </h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {shortTerm.map((item, i) => (
                    <li key={i} style={{ color: '#000000' }}>
                      <strong>{item.titre}</strong>
                      {item.description && <p style={{ color: '#000000', margin: '4px 0 0 16px' }}>{item.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {midTerm.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#000000', 
                  margin: '0 0 8px 0'
                }}>
                  Moyen terme
                </h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {midTerm.map((item, i) => (
                    <li key={i} style={{ color: '#000000' }}>
                      <strong>{item.titre}</strong>
                      {item.description && <p style={{ color: '#000000', margin: '4px 0 0 16px' }}>{item.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {longTerm.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#000000', 
                  margin: '0 0 8px 0'
                }}>
                  Long terme
                </h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {longTerm.map((item, i) => (
                    <li key={i} style={{ color: '#000000' }}>
                      <strong>{item.titre}</strong>
                      {item.description && <p style={{ color: '#000000', margin: '4px 0 0 16px' }}>{item.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!shortTerm.length && !midTerm.length && !longTerm.length && (
              <p style={{ color: '#000000', fontStyle: 'italic', margin: '0' }}>
                Aucune recommandation disponible
              </p>
            )}
          </div>
        </div>

        {/* Options d'export */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <ExportOptions pdfUrl={result.pdf_url} onNewAudit={onNewAudit} />
        </div>
      </div>
    </div>
  );
}