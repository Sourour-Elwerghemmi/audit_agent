export default function ConfirmationPage({ onBackToDashboard }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      padding: '40px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '600px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '24px',
        }}>
          Vos informations personnelles ont été mises à jour avec succès !
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#475569',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}>
          Vous pouvez continuer à utiliser l'application normalement.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onBackToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FF6B00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#e05d00',
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}