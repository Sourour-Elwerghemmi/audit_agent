import React from 'react';
import { MapPin, Brain, FileText, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage({ onStartAudit, onLogin, onRegister }) {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-orange-500" />,
      title: "Analyse IA",
      description: "Données locales décryptées instantanément"
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-500" />,
      title: "Plan d'action",
      description: "Recommandations concrètes et prioritisées"
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      title: "Résultats rapides",
      description: "Audit complet en moins d'une minute"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Agent Local AI</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onLogin}
                className="px-4 py-2 text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={onRegister}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section centré */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
            Visibilité locale
            <br />
            <span className="text-orange-500">optimisée</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Analysez votre fiche Google Business avec l'IA. 
            Obtenez un plan d'action clair et personnalisé en moins d'une minute.
          </p>
          <br></br>
          <button
            onClick={onStartAudit}
            className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Démarrer l'audit gratuit</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <br></br><br></br>        
        {/* Visualisation moderne */}
        <div className="mb-20">
          <div className="relative max-w-4xl mx-auto">
            <div className="p-8 h-80 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Analyse en temps réel</h3>
                <p className="text-gray-600">Visualisation intelligente de vos données</p>
              </div>
            
              {/* Points animés simplifiés */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
              <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
        
        {/* Features minimalistes */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer épuré */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm">
              <a href="#contact" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</a><br></br>
              <a href="#privacy" className="text-gray-500 hover:text-gray-900 transition-colors">Confidentialité</a>
            </div>
            <p className="text-gray-400 text-sm">© 2025 Agent Local AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}