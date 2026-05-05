import React from 'react';

/**
 * Composant Badge avec typographie standardisée
 * 
 * @param {String} variant - Type de badge (success, warning, danger, info, neutral, primary)
 * @param {String} size - Taille (sm, md)
 * @param {String} children - Contenu du badge
 */
const Badge = ({ 
  variant = 'neutral', 
  size = 'md',
  children,
  className = ''
}) => {
  
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
    primary: 'badge-primary'
  };

  const sizes = {
    sm: 'badge-sm',
    md: ''
  };

  const classes = `${variants[variant] || variants.neutral} ${sizes[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

/**
 * Badge de statut avec mapping automatique des couleurs
 */
export const StatusBadge = ({ status, label, size = 'md' }) => {
  const getVariant = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    // Statuts positifs
    if (statusLower.includes('delivered') || 
        statusLower.includes('termined') || 
        statusLower.includes('accepted') ||
        statusLower.includes('validé') ||
        statusLower.includes('payé')) {
      return 'success';
    }
    
    // Statuts d'avertissement
    if (statusLower.includes('attente') || 
        statusLower.includes('pending') ||
        statusLower.includes('en_cours')) {
      return 'warning';
    }
    
    // Statuts négatifs
    if (statusLower.includes('refused') || 
        statusLower.includes('annulé') ||
        statusLower.includes('cancelled') ||
        statusLower.includes('échec')) {
      return 'danger';
    }
    
    // Statuts informatifs
    if (statusLower.includes('transit') || 
        statusLower.includes('livraison') ||
        statusLower.includes('enlevement')) {
      return 'info';
    }
    
    return 'neutral';
  };

  return (
    <Badge variant={getVariant(status)} size={size}>
      {label || status}
    </Badge>
  );
};

/**
 * Badge de type d'expédition
 */
export const TypeBadge = ({ type, size = 'md' }) => {
  const getVariant = (type) => {
    const typeLower = (type || '').toLowerCase();
    
    if (typeLower.includes('simple')) return 'info';
    if (typeLower.includes('aerien')) return 'primary';
    if (typeLower.includes('maritime')) return 'info';
    if (typeLower.includes('afrique')) return 'warning';
    
    return 'neutral';
  };

  const getLabel = (type) => {
    switch (type) {
      case 'simple': return 'Simple';
      case 'groupage_dhd_aerien': return 'DHD Aérien';
      case 'groupage_dhd_maritine': return 'DHD Maritime';
      case 'groupage_afrique': return 'Afrique';
      case 'groupage_ca': return 'CA';
      default: return type || 'Inconnu';
    }
  };

  return (
    <Badge variant={getVariant(type)} size={size}>
      {getLabel(type)}
    </Badge>
  );
};

export default Badge;
