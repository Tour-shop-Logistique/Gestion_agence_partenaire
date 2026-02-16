
/**
 * Module utilitaire pour les fonctions de validation et formatage
 */

/**
 * Formater un prix selon la devise
 * @param {number} price - Prix à formater
 * @param {string} currency - Devise (FCFA, USD, EUR)
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = 'FCFA') => {
  const currencyMap = {
    FCFA: 'XOF',
    USD: 'USD',
    EUR: 'EUR',
  };

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyMap[currency] || 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Convertir CFA en EUR
 * @param {number} cfa - Montant en CFA
 * @returns {number} Montant en Euro
 */
export const cfaToEur = (cfa) => {
  const rate = parseFloat(localStorage.getItem('exchange_rate_cfa_eur')) || 655.957;
  return parseFloat(cfa || 0) / rate;
};

/**
 * Formater un prix en double devise (CFA & EUR)
 * @param {number} priceCfa - Prix en CFA
 * @returns {string} Prix formaté
 */
export const formatPriceDual = (priceCfa) => {
  const priceEur = cfaToEur(priceCfa);
  const formattedCfa = new Intl.NumberFormat('fr-FR').format(priceCfa);
  const formattedEur = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(priceEur);

  return `${formattedCfa} CFA (${formattedEur})`;
};


/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider un numéro de téléphone ivoirien
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
export const validatePhone = (phone) => {
  // Format ivoirien: +225 XX XX XX XX XX ou 0X XX XX XX XX
  const phoneRegex = /^(\+225|0)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valider un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid:
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers,
    errors: {
      tooShort: password.length < minLength,
      noUpperCase: !hasUpperCase,
      noLowerCase: !hasLowerCase,
      noNumbers: !hasNumbers,
    },
  };
};

/**
 * Gérer les erreurs API de manière uniforme
 * @param {Error} error - Erreur à traiter
 * @returns {string} Message d'erreur formaté
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    return error.response.data.message || 'Une erreur serveur est survenue';
  } else if (error.request) {
    // Aucune réponse reçue
    return 'Aucune réponse du serveur';
  } else {
    // Erreur lors de la configuration de la requête
    return error.message || 'Erreur de connexion';
  }
};
