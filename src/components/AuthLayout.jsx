import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_transparent.png";
import heroImg from "../assets/background.jpg";

const AuthLayout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);

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
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Tour Shop" className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/login" 
              className="text-sm sm:text-base text-white hover:text-blue-400 px-2 py-1 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Inscription
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative min-h-screen flex flex-col items-center justify-start z-10 pt-24 sm:pt-32">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;