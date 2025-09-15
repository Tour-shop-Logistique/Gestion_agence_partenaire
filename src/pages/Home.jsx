import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_blanc_shop.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-secondary-700 to-secondary-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-col items-center">
                <img 
                  src={logo} 
                  alt="Tour Shop" 
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Tour Shop</h2>
              </div>
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-sm font-medium mt-2">
                <span className="mr-2">🇨🇮</span>
                Leader de l'exportation ivoirienne
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Dashboard de Gestion</span>
              <span className="block text-primary-400">des Agences Partenaires</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
              Plateforme complète de gestion pour les agences d'exportation ivoiriennes. Gérez vos agents, tarifs, demandes clients et développez votre activité. 
              Textiles, produits manufacturés, cosmétiques, artisanat et plus encore vers le monde entier.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <div className="text-3xl font-bold text-primary-400">150+</div>
                <div className="text-sm text-gray-200">Agences ivoiriennes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-primary-400">45+</div>
                <div className="text-sm text-gray-200">Pays de destination</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-3xl font-bold text-primary-400">25k+</div>
                <div className="text-sm text-gray-200">Expéditions/mois</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-primary-400">98%</div>
                <div className="text-sm text-gray-200">Satisfaction client</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="bg-blue-500 text-white hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 shadow-md">
                  📝 Inscription gratuite
                </button>
              </Link>
              <Link to="/login">
                <button className="border-2 border-white text-white hover:bg-white hover:text-secondary-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                  🔐 Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Solutions complètes pour l'exportation ivoirienne
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              De la gestion des tarifs au suivi des expéditions, nous accompagnons les entreprises ivoiriennes 
              dans leur développement international.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestion des agents</h3>
              <p className="text-gray-600 mb-6">Administrez votre équipe d'agents avec des rôles et permissions personnalisables pour optimiser votre organisation.</p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Création de comptes agents
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Gestion des rôles (Admin/Manager/Agent)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi des performances
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Communication interne
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestion des demandes clients</h3>
              <p className="text-gray-600 mb-6">Traitez et suivez toutes les demandes d'exportation de vos clients avec un système de chat intégré.</p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Suivi des statuts
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Chat en temps réel
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Notifications automatiques
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Historique complet
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestion des tarifs</h3>
              <p className="text-gray-600 mb-6">Configurez et gérez vos tarifs d'exportation vers toutes les destinations internationales.</p>
              <ul className="text-left space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Tarification flexible
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Destinations multiples
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Types de transport
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Calculs automatiques
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-700 to-secondary-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à développer vos exportations ?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Rejoignez plus de 150 entreprises ivoiriennes qui exportent déjà avec succès
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md transform hover:scale-105">
                📝 Commencer gratuitement
              </button>
            </Link>
            <Link to="/tariffs">
              <button className="border-2 border-white text-white hover:bg-white hover:text-secondary-800 px-8 py-3 rounded-lg font-semibold transition-colors">
                💰 Voir les tarifs
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
