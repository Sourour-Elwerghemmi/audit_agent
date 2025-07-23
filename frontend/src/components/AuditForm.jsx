import { useState } from 'react';

export default function AuditForm({ onSuccess, onLoading, user }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onLoading) onLoading();
    setLoading(true);
    setError('');

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
      };

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, location }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (data.message || data.error) {
        const message = data.message || data.error;
        setError(message.includes("inaccessible") 
          ? "⚠️ Le site web est inexistant ou inaccessible. Veuillez vérifier l'URL."
          : message);
        onSuccess(null);
        return;
      }

      onSuccess({
        ...data,
        name,
        location,
        recommendations: data.recommendations || {},
      });

    } catch (err) {
      setError(err.message);
      onSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      margin: '0 auto',
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '8px',
            textAlign: 'left',
          }}>
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Saisissez le nom de votre entreprise"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '8px',
            textAlign: 'left',
          }}>
            Ville ou adresse
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Saisissez votre ville ou adresse"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#FF6B00',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          {loading ? 'Analyse en cours...' : 'Lancer l\'audit'}
        </button>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            padding: '12px',
            color: '#B91C1C',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
