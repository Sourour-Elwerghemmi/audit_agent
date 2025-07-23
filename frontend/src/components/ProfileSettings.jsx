import { useState, useEffect } from 'react';
import ConfirmationPage from './ConfirmationPage';

export default function ProfileSettings({ user, onBack, onUpdateSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      const nom = user.nom || '';
      const prenom = user.prenom || '';
      const fullNameValue = `${prenom} ${nom}`.trim();
      
      setFullName(fullNameValue);
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg("Veuillez entrer votre mot de passe actuel");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = fullName.trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';

      const token = localStorage.getItem('access_token');
      if (!token) {
        setErrorMsg("Session expirée, veuillez vous reconnecter");
        setIsLoading(false);
        return;
      }

      const updateData = {
        nom: nom,
        prenom: prenom,
        email: email,
        current_password: currentPassword
      };

      if (newPassword) {
        updateData.new_password = newPassword;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      
      setSuccessMsg("Profil mis à jour avec succès !");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onUpdateSuccess) {
        onUpdateSuccess({
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
          name: `${data.prenom || ''} ${data.nom || ''}`.trim()
        });
      } else {
        setTimeout(() => {
          setShowConfirmation(true);
        }, 1500);
      }

    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return <ConfirmationPage onBackToDashboard={onBack} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ Paramètres du profil</h2>
          <button onClick={onBack} style={styles.backBtn} disabled={isLoading}>
            ⬅ Retour
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Informations personnelles</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>🔒 Modifier le mot de passe</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe actuel *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mot de passe actuel"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nouveau mot de passe (optionnel)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (laisser vide si inchangé)"
                style={styles.input}
                disabled={isLoading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                style={styles.input}
                disabled={isLoading || !newPassword}
              />
            </div>
          </section>

          {errorMsg && <div style={styles.errorMsg}>❌ {errorMsg}</div>}
          {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}

          <button type="submit" style={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    maxWidth: '600px',
    width: '100%',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    margin: 0,
    color: '#1e293b',
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  inputGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#475569',
    marginBottom: '8px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorMsg: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  successMsg: {
    padding: '12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#FF6B00',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};