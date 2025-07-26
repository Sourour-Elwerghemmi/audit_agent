import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuditForm from './components/AuditForm';
import LoadingScreen from './components/LoadingScreen';
import AuditResults from './components/AuditResults';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AccountConfirmation from './components/AccountConfirmation';
import LogoutConfirmation from './components/LogoutConfirmation';
import ProfileSettings from './components/ProfileSettings';
import ReportsList from './components/ReportsList';
import AuditDetails from './components/AuditDetails';
import ConfirmationPage from './components/ConfirmationPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [result, setResult] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showProfileUpdateConfirmation, setShowProfileUpdateConfirmation] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  // Fonction utilitaire pour fetch avec token
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    };
    const opts = { ...options, headers };
    return fetch(url, opts);
  };

  const handleStartAudit = () => setCurrentPage('form');

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('account-confirmation');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setCompanyInfo(null);
    setShowLogoutConfirmation(false);
    localStorage.removeItem("accessToken"); // Supprimer le token au logout
    setCurrentPage('landing');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleNewAudit = () => {
    setResult(null);
    setCompanyInfo(null);
    setCurrentPage('form');
  };

  const handleLoading = () => setCurrentPage('loading');

  const handleSuccess = (data) => {
    if (data?.name && data?.location) {
      setCompanyInfo({ name: data.name, location: data.location });
      setTimeout(() => {
        setResult(data);
        setCurrentPage('results');
      }, 4000);
    } else {
      setCurrentPage('form');
    }
  };

  const handleBackToHome = () => {
    setResult(null);
    setCompanyInfo(null);
    setSelectedAudit(null);
    setCurrentPage(user ? 'dashboard' : 'landing');
  };

  const handleViewSettings = () => setCurrentPage('profile-settings');
  const handleViewReports = () => setCurrentPage('reports');

  const handleViewAuditDetails = (audit) => {
    setSelectedAudit(audit);
    setCurrentPage('audit-details');
  };

  // Gérer la mise à jour du profil utilisateur
  const handleProfileUpdateSuccess = (updatedUserData) => {
    console.log('Mise à jour utilisateur reçue:', updatedUserData);
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData,
      name: updatedUserData.name || `${updatedUserData.prenom || ''} ${updatedUserData.nom || ''}`.trim()
    }));
    setShowProfileUpdateConfirmation(true);
  };

  const handleBackToDashboard = () => {
    setShowProfileUpdateConfirmation(false);
    setCurrentPage('dashboard');
  };

  if (currentPage === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentPage('register')}
        onBackToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setCurrentPage('login')}
        onBackToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'dashboard') {
    return showLogoutConfirmation ? (
      <LogoutConfirmation
        onLogout={handleLogout}
        onReturnHome={handleCancelLogout}
      />
    ) : (
      <Dashboard
        user={user}
        onConfirmLogout={handleConfirmLogout}
        onNewAudit={handleNewAudit}
        onViewSettings={handleViewSettings}
        onViewReports={handleViewReports}
        onViewAuditDetails={handleViewAuditDetails}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  if (currentPage === 'audit-details') {
    return (
      <AuditDetails
        audit={selectedAudit}
        onBack={() => setCurrentPage('dashboard')}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  if (currentPage === 'account-confirmation') {
    return <AccountConfirmation onLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'profile-settings') {
    return showProfileUpdateConfirmation ? (
      <ConfirmationPage onBackToDashboard={handleBackToDashboard} />
    ) : (
      <ProfileSettings
        user={user}
        onBack={() => setCurrentPage('dashboard')}
        onUpdateSuccess={handleProfileUpdateSuccess}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  if (currentPage === 'reports') {
    return <ReportsList onBack={() => setCurrentPage('dashboard')} fetchWithAuth={fetchWithAuth} />;
  }

  if (currentPage === 'landing') {
    return (
      <LandingPage
        onStartAudit={handleStartAudit}
        onLogin={() => setCurrentPage('login')}
        onRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'form') {
    return (
      <AuditForm
        user={user}
        onSuccess={handleSuccess}
        onLoading={handleLoading}
        onBack={handleBackToHome}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  if (currentPage === 'loading') {
    return <LoadingScreen businessName={companyInfo?.name} location={companyInfo?.location} />;
  }

  if (currentPage === 'results' && result && companyInfo) {
    return (
      <AuditResults
        result={result}
        businessName={companyInfo.name}
        location={companyInfo.location}
        onNewAudit={handleNewAudit}
        onBackToHome={handleBackToHome}  // <-- passage de la fonction pour bouton retour accueil
      />
    );
  }

  return null;
}
