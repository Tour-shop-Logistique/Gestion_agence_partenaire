import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_transparent.png";
import heroImg from "../assets/background.jpg";
import AuthPanel from "../components/auth/AuthPanel";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  // null = panneau fermé, sinon la vue initiale à afficher ("login" ou
  // "register") - un seul panneau dont la vue bascule en interne (mot de
  // passe oublié, vérification email, etc.) plutôt qu'une pile de modales
  // ouvertes les unes par-dessus les autres, aligné sur le backoffice.
  const [authView, setAuthView] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Image d'arrière-plan pour toute la page */}
      <div className="fixed inset-0 z-0">
        <img
          src={heroImg}
          alt="Logistique maritime"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60"></div>
      </div>

      {/* Header avec fond transparent/translucide */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
        }`}>
        <div className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Tour Shop" className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setAuthView("login")}
              className="text-sm sm:text-base text-white hover:text-blue-400 px-2 py-1 transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => setAuthView("register")}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Inscription
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-start z-10">
        {/* Contenu centré */}
        <div className="relative z-10 w-full px-4 pb-4 sm:pb-8 pt-24 sm:pt-32 lg:pt-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Gérez vos Expéditions <br />
              <span className="inline-flex items-center">
                en toute
                <span className="text-blue-400 relative ml-2">
                  Simplicité
                  <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" fill="none">
                    <path d="M2 5C20 8 40 2 60 5C80 8 98 3 98 3" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6 sm:mb-8">
              Plateforme complète de gestion d'expéditions pour les agences.
              Suivez vos colis, gérez vos clients et optimisez vos opérations
              depuis une seule interface.
            </p>
          </div>
        </div>

        {/* Section d'introduction détaillée */}
        <div className="w-full max-w-6xl mx-auto px-6 py-4 sm:py-4 lg:py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 hover:bg-white/15 transition-all">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-blue-400">Gestion des Expéditions</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-200">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Suivi en temps réel de vos colis
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Gestion des statuts d'expédition
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Notifications automatiques aux clients
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Gestion de la Clientèle</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Base de données clients centralisée
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Historique des expéditions par client
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Communication facilitée
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Optimisation & Rapports</h3>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Tableaux de bord analytiques
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Rapports de performance détaillés
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Optimisation des coûts d'expédition
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Panneau d'authentification - une vue à la fois, jamais de modale
          empilée par-dessus une autre (voir AuthPanel). La clé sur authView
          force le remontage du panneau à chaque ouverture, pour repartir de
          la vue initiale demandée (login/register) plutôt que de garder la
          vue où l'utilisateur s'était arrêté la fois précédente. */}
      {authView && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setAuthView(null)}></div>
          <div className="relative w-full max-w-lg px-4">
            <button
              onClick={() => setAuthView(null)}
              className="absolute -top-10 right-4 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthPanel key={authView} initialView={authView} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
