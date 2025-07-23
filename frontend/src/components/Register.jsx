import { useState } from 'react';

export default function Register({ onRegister, onSwitchToLogin, onBackToLanding }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      onRegister({
        email: formData.email,
        name: formData.email.split('@')[0]
      });

    } catch {
      setError("Erreur réseau ou serveur, veuillez réessayer.");
    } finally {
      setIsLoading(false);
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
      marginTop: '60px',
    }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '30px',
        color: '#1f2937', // gris foncé
      }}>
        Inscription
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="email" style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '8px',
            textAlign: 'left',
            color: '#374151' // gris moyen
          }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '8px',
            textAlign: 'left',
            color: '#374151'
          }}>
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Créez un mot de passe"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '8px',
            textAlign: 'left',
            color: '#374151'
          }}>
            Confirmez le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            color: '#b91c1c',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff6b00',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '10px',
            opacity: isLoading ? 0.6 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
            transition: 'background-color 0.3s ease',
          }}
        >
          {isLoading ? 'Inscription en cours...' : "S'inscrire"}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
        <button
          onClick={onBackToLanding}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            marginBottom: '12px',
            textDecoration: 'underline',
          }}
        >
          ← Retour à l'accueil
        </button>
        <p>
          Vous avez déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b00',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'underline',
            }}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
