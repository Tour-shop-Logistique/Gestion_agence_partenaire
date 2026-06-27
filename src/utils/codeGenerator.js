/**
 * Utilitaire de génération de codes structurés pour les colis
 * Structure: CODE_AGENCE-JJMM-NUMERO
 * Exemple: AGC001-2412-0008 (8ème colis du 24 décembre)
 */

/**
 * Génère un code de colis structuré et lisible
 * @param {Object} options - Options de génération
 * @param {string} options.codeAgence - Code de l'agence (ex: "AGC-001" ou "AGC001")
 * @param {number} options.numeroColis - Numéro séquentiel du colis (ex: 8 pour le 8ème colis)
 * @param {Date} options.date - Date de création du colis (optionnel, défaut: Date actuelle)
 * @returns {string} Code du colis (ex: "AGC001-2412-0008")
 */
export const generateColisCode = ({ codeAgence, numeroColis, date = new Date() }) => {
    if (!codeAgence || !numeroColis) {
        console.warn('⚠️ Code agence ou numéro de colis manquant pour la génération du code');
        return `COLIS-${Date.now()}`;
    }

    // Nettoyer le code agence (enlever les tirets et espaces, mettre en majuscules)
    const cleanCodeAgence = codeAgence.replace(/[-\s]/g, '').toUpperCase();
    
    // Formater la date en JJMM (jour sur 2 chiffres + mois sur 2 chiffres)
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const dateFormatted = `${jour}${mois}`;
    
    // Formater le numéro de colis sur 4 chiffres
    const numeroFormatted = String(numeroColis).padStart(4, '0');
    
    // Générer le code final
    const code = `${cleanCodeAgence}-${dateFormatted}-${numeroFormatted}`;
    
    return code;
};

/**
 * Génère plusieurs codes de colis pour une expédition avec plusieurs colis
 * @param {Object} options - Options de génération
 * @param {string} options.codeAgence - Code de l'agence
 * @param {number} options.nombreColis - Nombre de colis dans l'expédition
 * @param {number} options.numeroDepart - Numéro de départ pour la séquence (optionnel, défaut: 1)
 * @param {Date} options.date - Date de création (optionnel, défaut: Date actuelle)
 * @returns {Array<string>} Tableau des codes de colis générés
 */
export const generateMultipleColisCode = ({ 
    codeAgence, 
    nombreColis, 
    numeroDepart = 1, 
    date = new Date() 
}) => {
    const codes = [];
    
    for (let i = 0; i < nombreColis; i++) {
        const numeroColis = numeroDepart + i;
        codes.push(generateColisCode({ codeAgence, numeroColis, date }));
    }
    
    return codes;
};

/**
 * Parse un code de colis pour extraire ses composants
 * @param {string} code - Code de colis (ex: "AGC001-2412-0008")
 * @returns {Object|null} Objet contenant les composants ou null si invalide
 */
export const parseColisCode = (code) => {
    if (!code) return null;
    
    // Pattern: CODEAGENCE-JJMM-NUMERO
    const regex = /^([A-Z0-9]+)-(\d{4})-(\d{4})$/;
    const match = code.match(regex);
    
    if (!match) return null;
    
    const [, codeAgence, dateStr, numero] = match;
    const jour = parseInt(dateStr.substring(0, 2), 10);
    const mois = parseInt(dateStr.substring(2, 4), 10);
    
    return {
        codeAgence,
        jour,
        mois,
        numero: parseInt(numero, 10),
        dateStr
    };
};

/**
 * Récupère le prochain numéro de colis disponible pour une date donnée
 * Cette fonction doit être utilisée avec les données du backend
 * @param {Array<string>} existingCodes - Liste des codes existants pour la date
 * @param {string} codeAgence - Code de l'agence
 * @param {Date} date - Date pour laquelle on cherche le prochain numéro
 * @returns {number} Prochain numéro disponible
 */
export const getNextColisNumber = (existingCodes = [], codeAgence, date = new Date()) => {
    const cleanCodeAgence = codeAgence.replace(/[-\s]/g, '').toUpperCase();
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const datePrefix = `${cleanCodeAgence}-${jour}${mois}-`;
    
    // Filtrer les codes pour la même agence et la même date
    const todayCodes = existingCodes
        .filter(code => code && code.startsWith(datePrefix))
        .map(code => {
            const parsed = parseColisCode(code);
            return parsed ? parsed.numero : 0;
        })
        .filter(num => num > 0);
    
    // Trouver le numéro maximum et ajouter 1
    const maxNumber = todayCodes.length > 0 ? Math.max(...todayCodes) : 0;
    return maxNumber + 1;
};

/**
 * Valide un code de colis
 * @param {string} code - Code à valider
 * @returns {boolean} True si le code est valide
 */
export const isValidColisCode = (code) => {
    return parseColisCode(code) !== null;
};

/**
 * Formate un code de colis pour l'affichage (ajoute des espaces pour la lisibilité)
 * @param {string} code - Code de colis (ex: "AGC001-2412-0008")
 * @returns {string} Code formaté (ex: "AGC001 - 24/12 - 0008")
 */
export const formatColisCodeDisplay = (code) => {
    const parsed = parseColisCode(code);
    if (!parsed) return code;
    
    const { codeAgence, jour, mois, numero } = parsed;
    return `${codeAgence} - ${String(jour).padStart(2, '0')}/${String(mois).padStart(2, '0')} - ${String(numero).padStart(4, '0')}`;
};
