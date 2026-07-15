/**
 * Cache global pour les détails des expéditions du dashboard
 * Persiste entre les navigations et démontages de composants
 */

class ExpeditionsCache {
    constructor() {
        this.lastLoadedIds = null;
        this.cachedExpeditions = null;
        this.timestamp = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        // Log l'état initial
        console.log('🔧 ExpeditionsCache initialisé');
    }

    /**
     * Génère une clé unique basée sur les IDs des expéditions
     */
    generateKey(expeditions) {
        if (!expeditions || expeditions.length === 0) return null;
        return expeditions
            .slice(0, 5)
            .map(exp => exp.id)
            .join('-');
    }

    /**
     * Vérifie si le cache est valide
     */
    isValid(key) {
        if (!this.lastLoadedIds || !this.cachedExpeditions) {
            return false;
        }

        // Vérifier si la clé correspond
        if (this.lastLoadedIds !== key) {
            console.log('🔄 Clé différente:', {
                ancienne: this.lastLoadedIds?.substring(0, 50) + '...',
                nouvelle: key?.substring(0, 50) + '...'
            });
            return false;
        }

        // Vérifier si le cache n'est pas expiré
        if (this.timestamp) {
            const now = Date.now();
            const elapsed = now - this.timestamp;
            const minutesElapsed = Math.floor(elapsed / 60000);
            
            if (elapsed > this.CACHE_DURATION) {
                console.log(`⏰ Cache expiré (${minutesElapsed} minutes écoulées)`);
                return false;
            }
            
            console.log(`⏱️ Cache valide (${minutesElapsed} minute(s) écoulée(s))`);
        }

        return true;
    }

    /**
     * Récupère les données du cache
     */
    get(key) {
        if (this.isValid(key)) {
            console.log(`✅ Cache HIT - ${this.cachedExpeditions?.length || 0} expédition(s) retournée(s)`);
            return this.cachedExpeditions;
        }
        console.log('❌ Cache MISS - Chargement nécessaire');
        return null;
    }

    /**
     * Stocke les données dans le cache
     */
    set(key, expeditions) {
        this.lastLoadedIds = key;
        this.cachedExpeditions = expeditions;
        this.timestamp = Date.now();
        console.log(`💾 ${expeditions?.length || 0} expédition(s) mise(s) en cache`);
    }

    /**
     * Vide le cache
     */
    clear() {
        const hadCache = this.cachedExpeditions !== null;
        this.lastLoadedIds = null;
        this.cachedExpeditions = null;
        this.timestamp = null;
        if (hadCache) {
            console.log('🗑️ Cache vidé (nouvelle expédition ou refresh dashboard)');
        }
    }
    
    /**
     * Obtient des informations sur l'état du cache
     */
    getStats() {
        return {
            hasCache: this.cachedExpeditions !== null,
            expeditionsCount: this.cachedExpeditions?.length || 0,
            ageMinutes: this.timestamp ? Math.floor((Date.now() - this.timestamp) / 60000) : null,
            key: this.lastLoadedIds
        };
    }
}

// Instance singleton du cache
export const expeditionsCache = new ExpeditionsCache();

// Exposer le cache dans window pour le debug en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.expeditionsCache = expeditionsCache;
    console.log('💡 Cache disponible en console: window.expeditionsCache.getStats()');
}
