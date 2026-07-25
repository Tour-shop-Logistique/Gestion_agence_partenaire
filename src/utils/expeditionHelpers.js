/**
 * 🛠️ HELPERS POUR LES EXPÉDITIONS
 * Fonctions utilitaires réutilisables
 */

export const getStatusLabel = (status) => {
    const labels = {
        'en_attente': 'En attente',
        'accepted': 'Acceptée',
        'refused': 'Refusée',
        'en_cours_enlevement': 'En enlèvement',
        'en_cours_depot': 'Dépôt en cours',
        'recu_agence_depart': 'Reçu Agence Départ',
        'en_transit_entrepot': 'Transit Entrepôt',
        'depart_expedition_succes': 'En Transit (Air/Mer)',
        'arrivee_expedition_succes': 'Arrivée Destination',
        'recu_agence_destination': 'Reçu Agence Dest.',
        'en_cours_livraison': 'En livraison',
        'termined': 'Terminée',
        'delivered': 'Terminée'
    };
    
    return labels[status] || status?.replace(/_/g, ' ') || 'Inconnu';
};

export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short' 
    });
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
