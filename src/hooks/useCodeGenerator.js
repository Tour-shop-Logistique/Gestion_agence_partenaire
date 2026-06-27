import { useState, useEffect, useCallback } from 'react';
import { useAgency } from './useAgency';
import {
    generateColisCode,
    generateMultipleColisCode,
    getNextColisNumber,
    formatColisCodeDisplay,
    isValidColisCode
} from '../utils/codeGenerator';

/**
 * Hook personnalisé pour générer des codes de colis structurés
 * @returns {Object} Fonctions et données du générateur de codes
 */
export const useCodeGenerator = () => {
    const { data: agencyData } = useAgency();
    const [codeAgence, setCodeAgence] = useState('');
    const [isReady, setIsReady] = useState(false);

    // Récupérer le code de l'agence depuis les données
    useEffect(() => {
        if (agencyData?.agence?.code_agence) {
            setCodeAgence(agencyData.agence.code_agence);
            setIsReady(true);
        }
    }, [agencyData]);

    /**
     * Génère un code de colis
     * @param {Object} options
     * @param {number} options.numeroColis - Numéro séquentiel du colis
     * @param {Date} options.date - Date de création (optionnel)
     * @returns {string} Code du colis généré
     */
    const genererCodeColis = useCallback(({ numeroColis, date = new Date() }) => {
        if (!codeAgence) {
            console.warn('⚠️ Code agence non disponible, utilisation d\'un code par défaut');
            return `COLIS-${Date.now()}`;
        }
        return generateColisCode({ codeAgence, numeroColis, date });
    }, [codeAgence]);

    /**
     * Génère plusieurs codes de colis pour une expédition
     * @param {Object} options
     * @param {number} options.nombreColis - Nombre de colis à générer
     * @param {number} options.numeroDepart - Numéro de départ (optionnel)
     * @param {Date} options.date - Date de création (optionnel)
     * @returns {Array<string>} Tableau des codes générés
     */
    const genererCodesMultiples = useCallback(({ 
        nombreColis, 
        numeroDepart = 1, 
        date = new Date() 
    }) => {
        if (!codeAgence) {
            console.warn('⚠️ Code agence non disponible');
            return Array(nombreColis).fill(null).map((_, i) => `COLIS-${Date.now()}-${i}`);
        }
        return generateMultipleColisCode({ codeAgence, nombreColis, numeroDepart, date });
    }, [codeAgence]);

    /**
     * Obtient le prochain numéro de colis disponible
     * @param {Array<string>} existingCodes - Codes existants
     * @param {Date} date - Date (optionnel)
     * @returns {number} Prochain numéro disponible
     */
    const obtenirProchainNumeroColis = useCallback((existingCodes = [], date = new Date()) => {
        if (!codeAgence) return 1;
        return getNextColisNumber(existingCodes, codeAgence, date);
    }, [codeAgence]);

    /**
     * Formate un code de colis pour l'affichage
     * @param {string} code - Code à formater
     * @returns {string} Code formaté
     */
    const formaterCodeColisAffichage = useCallback((code) => {
        return formatColisCodeDisplay(code);
    }, []);

    /**
     * Valide un code de colis
     * @param {string} code - Code à valider
     * @returns {boolean} True si valide
     */
    const validerCodeColis = useCallback((code) => {
        return isValidColisCode(code);
    }, []);

    return {
        // État
        codeAgence,
        isReady,
        
        // Générateurs
        genererCodeColis,
        genererCodesMultiples,
        
        // Séquences
        obtenirProchainNumeroColis,
        
        // Formatage
        formaterCodeColisAffichage,
        
        // Validation
        validerCodeColis
    };
};

export default useCodeGenerator;
