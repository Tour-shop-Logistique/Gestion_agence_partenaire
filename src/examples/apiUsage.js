// Exemples d'utilisation de l'API Agence Partenaire
// Ce fichier montre comment utiliser les différentes fonctions API

import apiService, { validateEmail, validatePassword, formatPrice } from '../utils/api';

// ===== EXEMPLE 1: ENREGISTREMENT D'UN NOUVEL UTILISATEUR =====

export const exampleRegister = async () => {
  try {
    // Données de l'utilisateur à enregistrer
    const userData = {
      name: "Côte d'Ivoire Express",
      email: "contact@cotedivoire-express.ci",
      password: "MotDePasse123",
      location: "Abidjan, Côte d'Ivoire",
      hours: "Lun-Ven: 8h-18h, Sam: 9h-15h",
      phone: "+225 27 22 49 50 00",
      address: "Zone 4, Marcory, Abidjan, Côte d'Ivoire",
      description: "Spécialiste de l'exportation de textiles et produits manufacturés vers l'Europe et l'Afrique"
    };

    console.log('🚀 Tentative d\'enregistrement...');
    
    // Appeler la fonction d'enregistrement
    const result = await apiService.register(userData);
    
    if (result.success) {
      console.log('✅ Enregistrement réussi !');
      console.log('Utilisateur créé:', result.user);
      console.log('Message:', result.message);
      
      // L'utilisateur est maintenant connecté automatiquement
      console.log('Token stocké:', apiService.getAuthToken());
      
      return result;
    } else {
      console.error('❌ Échec de l\'enregistrement');
      console.error('Erreur:', result.error);
      console.error('Message:', result.message);
      
      return result;
    }
  } catch (error) {
    console.error('💥 Erreur lors de l\'enregistrement:', error);
    throw error;
  }
};

// ===== EXEMPLE 2: CONNEXION D'UN UTILISATEUR =====

export const exampleLogin = async (email, password) => {
  try {
    console.log('🔐 Tentative de connexion...');
    
    const result = await apiService.login(email, password);
    
    if (result.success) {
      console.log('✅ Connexion réussie !');
      console.log('Utilisateur connecté:', result.user);
      console.log('Message:', result.message);
      
      return result;
    } else {
      console.error('❌ Échec de la connexion');
      console.error('Erreur:', result.error);
      console.error('Message:', result.message);
      
      return result;
    }
  } catch (error) {
    console.error('💥 Erreur lors de la connexion:', error);
    throw error;
  }
};

// ===== EXEMPLE 3: CRÉATION D'UN TARIF =====

export const exampleCreateTariff = async () => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!apiService.isAuthenticated()) {
      throw new Error('Utilisateur non connecté');
    }

    const tariffData = {
      destination: "France",
      weight: "0-5kg",
      price: 45000,
      currency: "FCFA",
      deliveryTime: "3-5 jours",
      description: "Export express de textiles vers l'Europe",
      serviceType: "Express",
      productType: "Textiles"
    };

    console.log('💰 Création d\'un nouveau tarif...');
    
    const result = await apiService.createTariff(tariffData);
    
    console.log('✅ Tarif créé avec succès !');
    console.log('Tarif:', result);
    
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la création du tarif:', error);
    throw error;
  }
};

// ===== EXEMPLE 4: MISE À JOUR DU PROFIL =====

export const exampleUpdateProfile = async () => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!apiService.isAuthenticated()) {
      throw new Error('Utilisateur non connecté');
    }

    const profileData = {
      name: "Côte d'Ivoire Express - Mise à jour",
      location: "Abidjan, Côte d'Ivoire",
      hours: "Lun-Ven: 8h-18h, Sam: 9h-15h, Dim: 10h-14h",
      phone: "+225 27 22 49 50 01",
      address: "Zone 4, Marcory, Abidjan, Côte d'Ivoire",
      description: "Spécialiste de l'exportation de textiles, produits manufacturés et cosmétiques vers l'Europe, l'Afrique et l'Asie"
    };

    console.log('👤 Mise à jour du profil...');
    
    const result = await apiService.updateAgencyProfile(profileData);
    
    console.log('✅ Profil mis à jour avec succès !');
    console.log('Profil mis à jour:', result);
    
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// ===== EXEMPLE 5: VALIDATION DES DONNÉES =====

export const exampleValidation = () => {
  console.log('🔍 Exemples de validation...');
  
  // Validation d'email
  const emails = [
    "test@example.com",
    "invalid-email",
    "user@domain.co.uk",
    "test@.com"
  ];
  
  emails.forEach(email => {
    const isValid = validateEmail(email);
    console.log(`Email "${email}": ${isValid ? '✅ Valide' : '❌ Invalide'}`);
  });
  
  // Validation de mot de passe
  const passwords = [
    "MotDePasse123",
    "password",
    "123456",
    "Password",
    "motdepasse123"
  ];
  
  passwords.forEach(password => {
    const validation = validatePassword(password);
    console.log(`Mot de passe "${password}": ${validation.isValid ? '✅ Valide' : '❌ Invalide'}`);
    if (!validation.isValid) {
      console.log('  Erreurs:', validation.errors);
    }
  });
};

// ===== EXEMPLE 6: FORMATAGE DES PRIX =====

export const examplePriceFormatting = () => {
  console.log('💱 Exemples de formatage de prix...');
  
  const prices = [
    { price: 45000, currency: 'FCFA' },
    { price: 150, currency: 'USD' },
    { price: 120, currency: 'EUR' },
    { price: 250000, currency: 'FCFA' }
  ];
  
  prices.forEach(({ price, currency }) => {
    const formatted = formatPrice(price, currency);
    console.log(`${price} ${currency} → ${formatted}`);
  });
};

// ===== EXEMPLE 7: GESTION COMPLÈTE D'UN CYCLE UTILISATEUR =====

export const exampleCompleteUserCycle = async () => {
  try {
    console.log('🔄 Début du cycle complet utilisateur...');
    
    // 1. Enregistrement
    const registerResult = await exampleRegister();
    if (!registerResult.success) {
      throw new Error('Échec de l\'enregistrement');
    }
    
    // 2. Vérification de l'authentification
    console.log('🔐 Vérification de l\'authentification...');
    console.log('Est authentifié:', apiService.isAuthenticated());
    console.log('Utilisateur actuel:', apiService.getCurrentUser());
    
    // 3. Création d'un tarif
    await exampleCreateTariff();
    
    // 4. Mise à jour du profil
    await exampleUpdateProfile();
    
    // 5. Récupération des tarifs de l'agence
    console.log('📋 Récupération des tarifs de l\'agence...');
    const tariffs = await apiService.getAgencyTariffs();
    console.log('Tarifs de l\'agence:', tariffs);
    
    // 6. Récupération des statistiques
    console.log('📊 Récupération des statistiques...');
    const stats = await apiService.getAgencyStats();
    console.log('Statistiques de l\'agence:', stats);
    
    // 7. Déconnexion
    console.log('🚪 Déconnexion...');
    await apiService.logout();
    console.log('Est authentifié après déconnexion:', apiService.isAuthenticated());
    
    console.log('✅ Cycle complet terminé avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur lors du cycle complet:', error);
    throw error;
  }
};

// ===== EXEMPLE 8: GESTION DES ERREURS =====

export const exampleErrorHandling = async () => {
  try {
    console.log('⚠️ Test de gestion des erreurs...');
    
    // Tentative de connexion avec des identifiants invalides
    const result = await apiService.login('invalid@email.com', 'wrongpassword');
    
    if (!result.success) {
      console.log('❌ Connexion échouée comme attendu');
      console.log('Message d\'erreur:', result.message);
    }
    
  } catch (error) {
    console.log('💥 Erreur capturée:', error.message);
  }
};

// ===== FONCTION D'INITIALISATION POUR LES TESTS =====

export const runAllExamples = async () => {
  console.log('🚀 Démarrage de tous les exemples...');
  
  try {
    // Tests de validation
    exampleValidation();
    examplePriceFormatting();
    
    // Tests d'API (décommenter pour tester avec un vrai backend)
    // await exampleCompleteUserCycle();
    // await exampleErrorHandling();
    
    console.log('✅ Tous les exemples terminés !');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'exécution des exemples:', error);
  }
};

// Export par défaut pour utilisation facile
export default {
  exampleRegister,
  exampleLogin,
  exampleCreateTariff,
  exampleUpdateProfile,
  exampleValidation,
  examplePriceFormatting,
  exampleCompleteUserCycle,
  exampleErrorHandling,
  runAllExamples
};
