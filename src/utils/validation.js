// Utilitaires de validation pour les formulaires

// Validation d'email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'L\'email est requis';
  }
  if (!emailRegex.test(email)) {
    return 'L\'email n\'est pas valide';
  }
  return null;
};

// Validation de mot de passe
export const validatePassword = (password) => {
  if (!password) {
    return 'Le mot de passe est requis';
  }
  if (password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères';
  }
  return null;
};

// Validation de confirmation de mot de passe
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'La confirmation du mot de passe est requise';
  }
  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }
  return null;
};

// Validation de nom d'agence
export const validateAgencyName = (name) => {
  if (!name || !name.trim()) {
    return 'Le nom de l\'agence est requis';
  }
  if (name.trim().length < 2) {
    return 'Le nom de l\'agence doit contenir au moins 2 caractères';
  }
  return null;
};

// Validation de localisation
export const validateLocation = (location) => {
  if (!location || !location.trim()) {
    return 'La localisation est requise';
  }
  return null;
};

// Validation d'horaires
export const validateHours = (hours) => {
  if (!hours || !hours.trim()) {
    return 'Les horaires sont requis';
  }
  return null;
};

// Validation de téléphone
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Le téléphone est requis';
  }
  // Regex basique pour les numéros de téléphone
  const phoneRegex = /^[\+]?[0-9\s\-()]{8,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Le numéro de téléphone n\'est pas valide';
  }
  return null;
};

// Validation d'adresse
export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return 'L\'adresse est requise';
  }
  if (address.trim().length < 10) {
    return 'L\'adresse doit contenir au moins 10 caractères';
  }
  return null;
};

// Validation de prix
export const validatePrice = (price) => {
  if (!price || price === '') {
    return 'Le prix est requis';
  }
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return 'Le prix doit être un nombre positif';
  }
  if (numPrice > 1000) {
    return 'Le prix ne peut pas dépasser 1000€';
  }
  return null;
};

// Validation de destination
export const validateDestination = (destination) => {
  if (!destination) {
    return 'La destination est requise';
  }
  return null;
};

// Validation de poids
export const validateWeight = (weight) => {
  if (!weight) {
    return 'La tranche de poids est requise';
  }
  return null;
};

// Validation de délai de livraison
export const validateDeliveryTime = (deliveryTime) => {
  if (!deliveryTime || !deliveryTime.trim()) {
    return 'Le délai de livraison est requis';
  }
  return null;
};

// Validation complète du formulaire d'inscription
export const validateRegistrationForm = (formData) => {
  const errors = {};

  errors.name = validateAgencyName(formData.name);
  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);
  errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
  errors.location = validateLocation(formData.location);
  errors.hours = validateHours(formData.hours);
  errors.phone = validatePhone(formData.phone);
  errors.address = validateAddress(formData.address);

  // Retirer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) {
      delete errors[key];
    }
  });

  return errors;
};

// Validation complète du formulaire de connexion
export const validateLoginForm = (formData) => {
  const errors = {};

  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);

  // Retirer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) {
      delete errors[key];
    }
  });

  return errors;
};

// Validation complète du formulaire de tarif
export const validateTariffForm = (formData) => {
  const errors = {};

  errors.destination = validateDestination(formData.destination);
  errors.weight = validateWeight(formData.weight);
  errors.price = validatePrice(formData.price);
  errors.deliveryTime = validateDeliveryTime(formData.deliveryTime);

  // Retirer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) {
      delete errors[key];
    }
  });

  return errors;
};

// Validation complète du formulaire de profil
export const validateProfileForm = (formData) => {
  const errors = {};

  errors.name = validateAgencyName(formData.name);
  errors.location = validateLocation(formData.location);
  errors.hours = validateHours(formData.hours);
  errors.phone = validatePhone(formData.phone);
  errors.address = validateAddress(formData.address);

  // Retirer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) {
      delete errors[key];
    }
  });

  return errors;
};

// Fonction utilitaire pour vérifier si un formulaire est valide
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

// Fonction pour nettoyer les données d'un formulaire
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      sanitized[key] = formData[key].trim();
    } else {
      sanitized[key] = formData[key];
    }
  });
  
  return sanitized;
};
