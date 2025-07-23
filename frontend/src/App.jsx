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
    setCurrentPage(user ? 'dashboard' : 'landing');
  };
  const handleViewSettings = () => setCurrentPage('profile-settings');
  const handleViewReports = () => setCurrentPage('reports');
  const handleViewAuditDetails = () => setCurrentPage('audit-details');
  const handleProfileUpdateSuccess = (updatedUserData) => {
    setUser(prev => ({
      ...prev,
      ...updatedUserData
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
      />
    );
  }

  if (currentPage === 'reports') {
    return <ReportsList onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'audit-details') {
    return <AuditDetails onBack={() => setCurrentPage('dashboard')} />;
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

  if (currentPage === 'loading') {
    return <LoadingScreen businessName={companyInfo?.name} location={companyInfo?.location} />;
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <button
          onClick={handleBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{user ? 'Retour au tableau de bord' : 'Retour à l\'accueil'}</span>
        </button>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-gray-700 font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleConfirmLogout}
              className="text-gray-600 hover:text-red-600"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-8 text-orange-500 text-center max-w-600px">
        {currentPage === 'form' ? 'Lancez votre audit' : 'Audit Report'}
      </h1>

      {currentPage === 'form' && (
        <div className="w-full max-w-md">
          <AuditForm
            onSuccess={handleSuccess}
            onLoading={handleLoading}
            user={user}
          />
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Contactez-nous</p>
            <p className="text-gray-500">contact@agentlocalai.com</p>
          </div>
        </div>
      )}

      {currentPage === 'results' && result && companyInfo && (
        <AuditResults
          result={result}
          businessName={companyInfo.name}
          location={companyInfo.location}
          onNewAudit={handleNewAudit}
        />
      )}
    </main>
  );
}