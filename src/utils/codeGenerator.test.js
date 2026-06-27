/**
 * Tests pour le générateur de codes
 * Pour exécuter: npm test codeGenerator.test.js
 */

import {
    generateColisCode,
    generateFactureCode,
    generateMultipleColisCode,
    parseColisCode,
    parseFactureCode,
    getNextColisNumber,
    getNextFactureNumber,
    isValidColisCode,
    isValidFactureCode,
    formatColisCodeDisplay,
    formatFactureCodeDisplay
} from './codeGenerator';

describe('Générateur de Codes - Colis', () => {
    test('Génère un code de colis correct', () => {
        const date = new Date(2024, 11, 24); // 24 décembre 2024
        const code = generateColisCode({
            codeAgence: 'AGC-001',
            numeroColis: 8,
            date
        });
        
        expect(code).toBe('AGC001-2412-0008');
    });

    test('Nettoie le code agence correctement', () => {
        const date = new Date(2024, 11, 24);
        const code1 = generateColisCode({
            codeAgence: 'AGC-001',
            numeroColis: 1,
            date
        });
        const code2 = generateColisCode({
            codeAgence: 'AGC 001',
            numeroColis: 1,
            date
        });
        const code3 = generateColisCode({
            codeAgence: 'agc001',
            numeroColis: 1,
            date
        });
        
        expect(code1).toBe('AGC001-2412-0001');
        expect(code2).toBe('AGC001-2412-0001');
        expect(code3).toBe('AGC001-2412-0001');
    });

    test('Formate correctement les numéros avec des zéros', () => {
        const date = new Date(2024, 11, 24);
        const code1 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 1,
            date
        });
        const code2 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 999,
            date
        });
        const code3 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 10000,
            date
        });
        
        expect(code1).toBe('AGC001-2412-0001');
        expect(code2).toBe('AGC001-2412-0999');
        expect(code3).toBe('AGC001-2412-10000');
    });

    test('Gère correctement les différentes dates', () => {
        const date1 = new Date(2024, 0, 1); // 1er janvier
        const date2 = new Date(2024, 11, 31); // 31 décembre
        
        const code1 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 1,
            date: date1
        });
        const code2 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 1,
            date: date2
        });
        
        expect(code1).toBe('AGC001-0101-0001');
        expect(code2).toBe('AGC001-3112-0001');
    });
});

describe('Générateur de Codes - Factures', () => {
    test('Génère un code de facture correct', () => {
        const date = new Date(2024, 11, 24);
        const code = generateFactureCode({
            codeAgence: 'AGC-001',
            numeroFacture: 156,
            date
        });
        
        expect(code).toBe('FACT-AGC001-2024-0156');
    });

    test('Gère différentes années', () => {
        const date1 = new Date(2023, 0, 1);
        const date2 = new Date(2025, 0, 1);
        
        const code1 = generateFactureCode({
            codeAgence: 'AGC001',
            numeroFacture: 1,
            date: date1
        });
        const code2 = generateFactureCode({
            codeAgence: 'AGC001',
            numeroFacture: 1,
            date: date2
        });
        
        expect(code1).toBe('FACT-AGC001-2023-0001');
        expect(code2).toBe('FACT-AGC001-2025-0001');
    });
});

describe('Génération Multiple', () => {
    test('Génère plusieurs codes de colis', () => {
        const date = new Date(2024, 11, 24);
        const codes = generateMultipleColisCode({
            codeAgence: 'AGC001',
            nombreColis: 3,
            numeroDepart: 5,
            date
        });
        
        expect(codes).toHaveLength(3);
        expect(codes[0]).toBe('AGC001-2412-0005');
        expect(codes[1]).toBe('AGC001-2412-0006');
        expect(codes[2]).toBe('AGC001-2412-0007');
    });

    test('Génère avec numéro de départ par défaut', () => {
        const date = new Date(2024, 11, 24);
        const codes = generateMultipleColisCode({
            codeAgence: 'AGC001',
            nombreColis: 2,
            date
        });
        
        expect(codes[0]).toBe('AGC001-2412-0001');
        expect(codes[1]).toBe('AGC001-2412-0002');
    });
});

describe('Parsing des Codes', () => {
    test('Parse un code de colis correctement', () => {
        const parsed = parseColisCode('AGC001-2412-0008');
        
        expect(parsed).toEqual({
            codeAgence: 'AGC001',
            jour: 24,
            mois: 12,
            numero: 8,
            dateStr: '2412'
        });
    });

    test('Parse un code de facture correctement', () => {
        const parsed = parseFactureCode('FACT-AGC001-2024-0156');
        
        expect(parsed).toEqual({
            codeAgence: 'AGC001',
            annee: 2024,
            numero: 156
        });
    });

    test('Retourne null pour un code invalide', () => {
        expect(parseColisCode('INVALID')).toBeNull();
        expect(parseColisCode('')).toBeNull();
        expect(parseColisCode(null)).toBeNull();
        expect(parseFactureCode('INVALID')).toBeNull();
    });
});

describe('Prochain Numéro', () => {
    test('Retourne 1 si aucun code existant', () => {
        const date = new Date(2024, 11, 24);
        const next = getNextColisNumber([], 'AGC001', date);
        
        expect(next).toBe(1);
    });

    test('Retourne le prochain numéro correct', () => {
        const date = new Date(2024, 11, 24);
        const existingCodes = [
            'AGC001-2412-0001',
            'AGC001-2412-0002',
            'AGC001-2412-0005'
        ];
        const next = getNextColisNumber(existingCodes, 'AGC001', date);
        
        expect(next).toBe(6); // Max est 5, donc prochain est 6
    });

    test('Ignore les codes d\'autres dates', () => {
        const date = new Date(2024, 11, 24);
        const existingCodes = [
            'AGC001-2412-0001',
            'AGC001-2312-0005', // 23 décembre (date différente)
            'AGC001-2412-0002'
        ];
        const next = getNextColisNumber(existingCodes, 'AGC001', date);
        
        expect(next).toBe(3); // Ignore le code du 23/12
    });

    test('Ignore les codes d\'autres agences', () => {
        const date = new Date(2024, 11, 24);
        const existingCodes = [
            'AGC001-2412-0001',
            'AGC002-2412-0010', // Autre agence
            'AGC001-2412-0002'
        ];
        const next = getNextColisNumber(existingCodes, 'AGC001', date);
        
        expect(next).toBe(3); // Ignore le code de AGC002
    });

    test('Prochain numéro de facture', () => {
        const date = new Date(2024, 11, 24);
        const existingCodes = [
            'FACT-AGC001-2024-0001',
            'FACT-AGC001-2024-0002',
            'FACT-AGC001-2024-0156'
        ];
        const next = getNextFactureNumber(existingCodes, 'AGC001', date);
        
        expect(next).toBe(157);
    });
});

describe('Validation des Codes', () => {
    test('Valide un code de colis correct', () => {
        expect(isValidColisCode('AGC001-2412-0008')).toBe(true);
        expect(isValidColisCode('XYZ999-0101-9999')).toBe(true);
    });

    test('Invalide un code de colis incorrect', () => {
        expect(isValidColisCode('INVALID')).toBe(false);
        expect(isValidColisCode('AGC001-24-8')).toBe(false);
        expect(isValidColisCode('')).toBe(false);
        expect(isValidColisCode(null)).toBe(false);
    });

    test('Valide un code de facture correct', () => {
        expect(isValidFactureCode('FACT-AGC001-2024-0156')).toBe(true);
        expect(isValidFactureCode('FACT-XYZ999-2023-9999')).toBe(true);
    });

    test('Invalide un code de facture incorrect', () => {
        expect(isValidFactureCode('INVALID')).toBe(false);
        expect(isValidFactureCode('AGC001-2024-156')).toBe(false);
        expect(isValidFactureCode('FACT-AGC001-24-156')).toBe(false);
    });
});

describe('Formatage pour Affichage', () => {
    test('Formate un code de colis pour l\'affichage', () => {
        const formatted = formatColisCodeDisplay('AGC001-2412-0008');
        expect(formatted).toBe('AGC001 - 24/12 - 0008');
    });

    test('Retourne le code original si invalide', () => {
        const formatted = formatColisCodeDisplay('INVALID');
        expect(formatted).toBe('INVALID');
    });

    test('Formate un code de facture pour l\'affichage', () => {
        const formatted = formatFactureCodeDisplay('FACT-AGC001-2024-0156');
        expect(formatted).toBe('FACT AGC001 / 2024 / 0156');
    });
});

describe('Cas Limites', () => {
    test('Gère les paramètres manquants', () => {
        const code1 = generateColisCode({
            codeAgence: '',
            numeroColis: 1
        });
        expect(code1).toContain('COLIS-');

        const code2 = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: null
        });
        expect(code2).toContain('COLIS-');
    });

    test('Utilise la date actuelle par défaut', () => {
        const code = generateColisCode({
            codeAgence: 'AGC001',
            numeroColis: 1
        });
        
        const now = new Date();
        const jour = String(now.getDate()).padStart(2, '0');
        const mois = String(now.getMonth() + 1).padStart(2, '0');
        
        expect(code).toContain(`${jour}${mois}`);
    });
});
