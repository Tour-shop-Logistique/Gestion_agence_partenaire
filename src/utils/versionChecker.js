/**
 * Utilitaire pour détecter et gérer les mises à jour de l'application
 * Évite les pages blanches causées par des chunks obsolètes en cache
 */

const APP_VERSION_KEY = 'app_version';
const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();

/**
 * Vérifie si une nouvelle version est disponible
 * @returns {boolean} true si une nouvelle version est détectée
 */
export const checkForUpdate = () => {
  const storedVersion = localStorage.getItem(APP_VERSION_KEY);
  
  if (!storedVersion) {
    // Première visite, enregistrer la version
    localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
    return false;
  }
  
  if (storedVersion !== CURRENT_VERSION) {
    console.log('🔄 Nouvelle version détectée:', CURRENT_VERSION);
    return true;
  }
  
  return false;
};

/**
 * Met à jour la version stockée et recharge la page si nécessaire
 * @param {boolean} forceReload - Force le rechargement même si pas de nouvelle version
 */
export const updateVersion = (forceReload = false) => {
  localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
  
  if (forceReload) {
    console.log('🔄 Rechargement de l\'application...');
    window.location.reload(true);
  }
};

/**
 * Vérifie et applique automatiquement les mises à jour
 */
export const autoCheckAndUpdate = () => {
  if (checkForUpdate()) {
    console.log('✨ Mise à jour disponible, rechargement...');
    // Attendre un peu pour ne pas interrompre l'utilisateur brutalement
    setTimeout(() => {
      updateVersion(true);
    }, 1000);
  }
};

/**
 * Nettoie le cache de l'application
 */
export const clearAppCache = async () => {
  try {
    // Nettoyer le cache du service worker si disponible
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🧹 Cache nettoyé');
    }
    
    // Nettoyer le localStorage lié aux chunks
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chunk') || key.includes('vite'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
  }
};

/**
 * Gère les erreurs de chargement de chunks
 */
export const handleChunkLoadError = (error) => {
  const isChunkError = 
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('dynamically imported module') ||
    error?.message?.includes('Importing a module script failed');
    
  if (isChunkError) {
    console.error('❌ Erreur de chargement de chunk:', error);
    
    // Nettoyer le cache et recharger
    clearAppCache().then(() => {
      console.log('🔄 Rechargement après erreur de chunk...');
      window.location.reload(true);
    });
    
    return true;
  }
  
  return false;
};
