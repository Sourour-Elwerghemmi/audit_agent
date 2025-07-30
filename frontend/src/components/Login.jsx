import { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function Login({ onLogin, onSwitchToRegister, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentative de connexion avec:', { email, password: '***' });
      
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      console.log('Status de réponse:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMsg("Aucun compte associé à cet email. Veuillez créer un compte pour continuer");
        } else {
          setErrorMsg(`Erreur serveur: ${response.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      
      const accessToken = data.access_token;

      if (!accessToken) {
        setErrorMsg("Token non reçu du serveur");
        setIsLoading(false);
        return;
      }

      // ✅ STOCKER LE TOKEN DANS LOCALSTORAGE
      localStorage.setItem('accessToken', accessToken);
      console.log('Token stocké dans localStorage:', accessToken.substring(0, 20) + '...');

      // Optionnel: stocker les infos utilisateur si disponibles
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // On appelle onLogin avec email, nom extrait de l'email, et le token JWT
      onLogin({ email, name: email.split('@')[0], token: accessToken });

    } catch (error) {
      setErrorMsg("Erreur réseau, veuillez réessayer.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        
        {/* Header moderne */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#FF6B00',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              <MapPin style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Connexion 
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              disabled={isLoading}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
              disabled={isLoading}
            />
          </div>
          {errorMsg && (
            <div style={{ 
              color: '#dc2626', 
              fontWeight: '600', 
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              {errorMsg}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF6B00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.3s',
            }}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#6b7280' }}>
          <button
            onClick={onBackToLanding}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
            disabled={isLoading}
          >
            ← Retour à l'accueil
          </button>
          <p>
            Pas encore de compte ?{' '}
            <button
              onClick={onSwitchToRegister}
              style={{ 
                color: '#FF6B00', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: '600' 
              }}
              disabled={isLoading}
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}