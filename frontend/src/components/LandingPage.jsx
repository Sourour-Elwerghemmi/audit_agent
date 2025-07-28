import React from 'react';
import { MapPin, Brain, FileText, Zap } from 'lucide-react';

export default function LandingPage({ onStartAudit, onLogin, onRegister }) {
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-orange-500" />,
      title: "Analyse IA",
      description: "Données locales décryptées en temps réel"
    },
    {
      icon: <FileText className="w-12 h-12 text-orange-500" />,
      title: "Plan d'action clair",
      description: "Priorités définies, actions simples à suivre"
    },
    {
      icon: <Zap className="w-12 h-12 text-orange-500" />,
      title: "Résultats immédiats",
      description: "Audit sans inscription, prêt en moins d'une minute"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">Agent Local AI</span>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8 mr-4">
                <a href="#contact" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
                <a href="#cgu" className="text-gray-500 hover:text-gray-900 transition-colors">CGU</a>
                <a href="#privacy" className="text-gray-500 hover:text-gray-900 transition-colors">Politique de confidentialité</a>
              </nav>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onLogin}
                  className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors border border-gray-300 rounded-md hover:border-orange-500"
                >
                  Se connecter
                </button>
                <button
                  onClick={onRegister}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors shadow-sm"
                >
                  Créer un compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Visibilité locale{' '}
              <span className="text-orange-500">optimisée</span>
              <br />
              IA simple
              <br />
              Résultats{' '}
              <span className="text-orange-500">rapides</span>
            </h1>

            <div className="space-y-4">
              <p className="text-xl text-gray-600 leading-relaxed">
                Analyse intelligente de votre fiche Google Business
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                Un plan d'action clair 
              </p>
            </div>

            <button
              onClick={onStartAudit}
              className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              <span>DÉMARRER L'AUDIT</span>
            </button>
          </div>

          {/* Right Content - Carte sans dots */}
          <div className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-80 w-full bg-white rounded-2xl relative overflow-hidden flex items-center justify-center">
              {/* Contenu centré */}
              <div className="z-10">
                <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Analyse Géolocalisée</h3>
                <p className="text-gray-600">Données locales en temps réel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-8">
              <a href="#contact" className="text-gray-500 hover:text-orange-500 transition-colors">Contact</a>
              <a href="#cgu" className="text-gray-500 hover:text-orange-500 transition-colors">CGU</a>
              <a href="#privacy" className="text-gray-500 hover:text-orange-500 transition-colors">Politique de confidentialité</a>
            </div>
            <p className="text-gray-500">© 2025 Agent Local AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
