import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de secours au prochain rendu
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capturer les erreurs DOM React comme insertBefore
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Gérer spécifiquement les erreurs DOM de React en production
    if (
      error?.message?.includes('insertBefore') ||
      error?.message?.includes('removeChild') ||
      error?.message?.includes('Failed to execute')
    ) {
      console.warn('DOM manipulation error detected, attempting recovery...');
      
      // Incrémenter le compteur de tentatives
      const newRetryCount = this.state.retryCount + 1;
      
      // Si on a essayé moins de 3 fois, tenter une récupération automatique
      if (newRetryCount < 3) {
        setTimeout(() => {
          this.setState({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: newRetryCount
          });
        }, 100);
      }
    }
  }

  handleReload = () => {
    // Nettoyer le state et recharger
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    });
  };

  handleFullReload = () => {
    // Recharger toute la page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI de secours personnalisée
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Une erreur est survenue
              </h2>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Nous avons rencontré un problème lors de l'affichage de cette page. 
              Cela peut être dû à une mise à jour récente de l'application.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <summary className="font-semibold text-slate-700 cursor-pointer">
                  Détails techniques
                </summary>
                <pre className="mt-2 text-slate-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={this.handleFullReload}
                className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
