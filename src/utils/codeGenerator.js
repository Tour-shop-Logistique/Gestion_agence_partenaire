/**
 * Utilitaire de génération de codes structurés pour les colis
 * Structure: PREFIX_TYPE-NUMERO-CODE_AGENCE
 * Exemples:
 * - DHD-AR-001-AGC001 (Aérien)
 * - DHD-MR-001-AGC001 (Maritime)
 * - AF-001-AGC001 (Afrique)
 * - CA-001-AGC001 (Canada)
 * - LD-001-AGC001 (Livraison Domicile)
 */

/**
 * Mapping des types d'expédition vers leurs préfixes
 */
const TYPE_PREFIXES = {
    'AERIEN': 'DHD-AR',
    'MARITIME': 'DHD-MR',
    'AFRIQUE': 'AF',
    'CA': 'CA',
    'LD': 'LD',
    'SIMPLE': 'LD' // SIMPLE = Livraison à domicile
};

/**
 * Génère un code de colis structuré et lisible
 * @param {Object} options - Options de génération
 * @param {string} options.codeAgence - Code de l'agence (ex: "AGC-001" ou "AGC001")
 * @param {number} options.numeroColis - Numéro séquentiel du colis (ex: 8 pour le 8ème colis)
 * @param {string} options.typeExpedition - Type d'expédition (AERIEN, MARITIME, AFRIQUE, CA, LD, SIMPLE)
 * @param {Date} options.date - Date de création du colis (optionnel, défaut: Date actuelle)
 * @returns {string} Code du colis (ex: "DHD-AR-001-AGC001")
 */
export const generateColisCode = ({ 
    codeAgence, 
    numeroColis, 
    typeExpedition = 'SIMPLE',
    date = new Date() 
}) => {
    if (!codeAgence || !numeroColis) {
        console.warn('⚠️ Code agence ou numéro de colis manquant pour la génération du code');
        return `COLIS-${Date.now()}`;
    }

    // Nettoyer le code agence (enlever les tirets et espaces, mettre en majuscules)
    const cleanCodeAgence = codeAgence.replace(/[-\s]/g, '').toUpperCase();
    
    // Normaliser le type d'expédition
    const normalizedType = typeExpedition.toUpperCase();
    
    // Obtenir le préfixe selon le type
    const prefix = TYPE_PREFIXES[normalizedType] || 'DHD-AR';
    
    // Formater le numéro de colis sur 3 chiffres
    const numeroFormatted = String(numeroColis).padStart(3, '0');
    
    // Générer le code final: PREFIX-NUMERO-CODEAGENCE
    const code = `${prefix}-${numeroFormatted}-${cleanCodeAgence}`;
    
    return code;
};

/**
 * Génère plusieurs codes de colis pour une expédition avec plusieurs colis
 * @param {Object} options - Options de génération
 * @param {string} options.codeAgence - Code de l'agence
 * @param {number} options.nombreColis - Nombre de colis dans l'expédition
 * @param {string} options.typeExpedition - Type d'expédition (AERIEN, MARITIME, AFRIQUE, CA, LD)
 * @param {number} options.numeroDepart - Numéro de départ pour la séquence (optionnel, défaut: 1)
 * @param {Date} options.date - Date de création (optionnel, défaut: Date actuelle)
 * @returns {Array<string>} Tableau des codes de colis générés
 */
export const generateMultipleColisCode = ({ 
    codeAgence, 
    nombreColis,
    typeExpedition = 'SIMPLE',
    numeroDepart = 1, 
    date = new Date() 
}) => {
    const codes = [];
    
    for (let i = 0; i < nombreColis; i++) {
        const numeroColis = numeroDepart + i;
        codes.push(generateColisCode({ codeAgence, numeroColis, typeExpedition, date }));
    }
    
    return codes;
};

/**
 * Parse un code de colis pour extraire ses composants
 * @param {string} code - Code de colis (ex: "DHD-AR-001-AGC001")
 * @returns {Object|null} Objet contenant les composants ou null si invalide
 */
export const parseColisCode = (code) => {
    if (!code) return null;
    
    // Pattern: PREFIX-NUMERO-CODEAGENCE
    // Exemples: DHD-AR-001-AGC001, DHD-MR-002-AGC001, AF-001-AGC001
    const regex = /^([A-Z]{2,6}-[A-Z]{2}|[A-Z]{2})-(\d{3})-([A-Z0-9]+)$/;
    const match = code.match(regex);
    
    if (!match) return null;
    
    const [, prefix, numero, codeAgence] = match;
    
    // Déterminer le type d'expédition depuis le préfixe
    let typeExpedition = 'SIMPLE';
    if (prefix === 'DHD-AR') typeExpedition = 'AERIEN';
    else if (prefix === 'DHD-MR') typeExpedition = 'MARITIME';
    else if (prefix === 'AF') typeExpedition = 'AFRIQUE';
    else if (prefix === 'CA') typeExpedition = 'CA';
    else if (prefix === 'LD') typeExpedition = 'LD';
    
    return {
        prefix,
        typeExpedition,
        codeAgence,
        numero: parseInt(numero, 10)
    };
};

/**
 * Récupère le prochain numéro de colis disponible pour un type d'expédition donné
 * Cette fonction doit être utilisée avec les données du backend
 * @param {Array<string>} existingCodes - Liste des codes existants
 * @param {string} codeAgence - Code de l'agence
 * @param {string} typeExpedition - Type d'expédition (AERIEN, MARITIME, etc.)
 * @param {Date} date - Date pour laquelle on cherche le prochain numéro (optionnel)
 * @returns {number} Prochain numéro disponible
 */
export const getNextColisNumber = (existingCodes = [], codeAgence, typeExpedition = 'SIMPLE', date = new Date()) => {
    const cleanCodeAgence = codeAgence.replace(/[-\s]/g, '').toUpperCase();
    const normalizedType = typeExpedition.toUpperCase();
    const prefix = TYPE_PREFIXES[normalizedType] || 'DHD-AR';
    const codePrefix = `${prefix}-`;
    
    // Filtrer les codes pour la même agence, le même type et extraire les numéros
    const typeCodes = existingCodes
        .filter(code => code && code.startsWith(codePrefix) && code.endsWith(`-${cleanCodeAgence}`))
        .map(code => {
            const parsed = parseColisCode(code);
            return parsed ? parsed.numero : 0;
        })
        .filter(num => num > 0);
    
    // Trouver le numéro maximum et ajouter 1
    const maxNumber = typeCodes.length > 0 ? Math.max(...typeCodes) : 0;
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
 * @param {string} code - Code de colis (ex: "DHD-AR-001-AGC001")
 * @returns {string} Code formaté (ex: "DHD-AR / 001 / AGC001")
 */
export const formatColisCodeDisplay = (code) => {
    const parsed = parseColisCode(code);
    if (!parsed) return code;
    
    const { prefix, numero, codeAgence } = parsed;
    return `${prefix} / ${String(numero).padStart(3, '0')} / ${codeAgence}`;
};
