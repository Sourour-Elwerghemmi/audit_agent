import { useState } from 'react';
import ConfirmationPage from './ConfirmationPage';

export default function ProfileSettings({ user, onBack, onUpdateSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      const updateData = {
        current_password: currentPassword,
        nom: nom.trim() || null,
        prenom: prenom.trim() || null,
        email: email.trim(),
      };

      const passwordChanged = !!newPassword;
      if (newPassword) {
        updateData.new_password = newPassword;
      }

      console.log('Données envoyées:', updateData);
      console.log('Mot de passe modifié:', passwordChanged);

      // Récupération du token depuis localStorage
      const authToken = localStorage.getItem('accessToken');

      if (!authToken) {
        setErrorMsg("Session expirée, veuillez vous reconnecter");
        setIsLoading(false);
        return;
      }

      console.log('Token récupéré:', authToken.substring(0, 20) + '...');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Status de réponse:', response.status);

      if (response.status === 401) {
        setErrorMsg("Mot de passe actuel incorrect");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Erreur serveur:', errorData);
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      console.log('Utilisateur mis à jour:', updatedUser);

      // ✅ SI LE MOT DE PASSE A ÉTÉ CHANGÉ, OBTENIR UN NOUVEAU TOKEN
      if (passwordChanged) {
        console.log('🔄 Mot de passe modifié, récupération d\'un nouveau token...');
        
        try {
          const loginResponse = await fetch('/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: email.trim(),
              password: newPassword,
            }),
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const newToken = loginData.access_token;
            
            if (newToken) {
              // Mettre à jour le token dans localStorage
              localStorage.setItem('accessToken', newToken);
              console.log('✅ Nouveau token obtenu et stocké:', newToken.substring(0, 20) + '...');
              
              // Mettre à jour les données utilisateur avec le nouveau token
              const mergedUserData = {
                ...updatedUser,
                nom: nom.trim() || null,
                prenom: prenom.trim() || null,
                email: email.trim(),
                token: newToken // Ajouter le nouveau token
              };
              
              localStorage.setItem('user', JSON.stringify(mergedUserData));
              console.log('✅ Données utilisateur mises à jour avec nouveau token');
              
              // Passer les nouvelles données au parent
              if (onUpdateSuccess) {
                onUpdateSuccess(mergedUserData);
              }
            } else {
              console.error('❌ Nouveau token non reçu');
              setErrorMsg("Erreur lors de la récupération du nouveau token");
              setIsLoading(false);
              return;
            }
          } else {
            console.error('❌ Échec de la récupération du nouveau token');
            setErrorMsg("Erreur lors de la récupération du nouveau token");
            setIsLoading(false);
            return;
          }
        } catch (tokenError) {
          console.error('❌ Erreur lors de la récupération du token:', tokenError);
          setErrorMsg("Erreur lors de la récupération du nouveau token");
          setIsLoading(false);
          return;
        }
      } else {
        // ✅ PAS DE CHANGEMENT DE MOT DE PASSE, JUSTE METTRE À JOUR LES DONNÉES
        const existingUserData = JSON.parse(localStorage.getItem('user') || '{}');
        
        const mergedUserData = {
          ...existingUserData,
          ...updatedUser,
          nom: nom.trim() || null,
          prenom: prenom.trim() || null,
          email: email.trim(),
        };

        localStorage.setItem('user', JSON.stringify(mergedUserData));
        console.log('✅ Données utilisateur mises à jour dans localStorage:', mergedUserData);

        if (onUpdateSuccess) {
          onUpdateSuccess(mergedUserData);
        }
      }

      setSuccessMsg("Profil mis à jour avec succès !");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setShowConfirmation(true);
      }, 1500);

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
          <h3 style={styles.title}>
            <span style={{color: '#FF6B00', marginRight: '8px'}}>●</span>
            Modifier le profil
          </h3>
          <button onClick={onBack} style={styles.backBtn} disabled={isLoading}>
            ⬅ Retour
          </button>
        </div>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Prénom</label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Votre prénom"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              style={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          <div style={styles.separator}>
            <h3 style={styles.sectionTitle}>
              <span style={{color: '#FF6B00', marginRight: '8px'}}>●</span>
              Modification du mot de passe
            </h3>
            <p style={styles.sectionDesc}>Laissez vide si vous ne souhaitez pas changer de mot de passe</p>
          </div>

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
            <label style={styles.label}>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe (optionnel)"
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
              disabled={isLoading}
            />
          </div>

          {errorMsg && <div style={styles.errorMsg}>❌ {errorMsg}</div>}
          {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}

          <button 
            onClick={handleSubmit} 
            style={styles.submitBtn} 
            disabled={isLoading}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
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
    fontSize: '22px',
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
    gap: '20px',
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
  separator: {
    marginTop: '20px',
    marginBottom: '10px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  sectionDesc: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    fontStyle: 'italic',
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
    marginTop: '10px',
  },
};