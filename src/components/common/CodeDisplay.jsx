import React, { useState } from 'react';
import { formatColisCodeDisplay, formatFactureCodeDisplay } from '../../utils/codeGenerator';
import { toast } from '../../utils/toast';

/**
 * Composant pour afficher un code de colis ou facture avec possibilité de copie
 * @param {Object} props
 * @param {string} props.code - Le code à afficher
 * @param {'colis'|'facture'} props.type - Type de code (défaut: 'colis')
 * @param {boolean} props.showCopyButton - Afficher le bouton de copie (défaut: true)
 * @param {boolean} props.formatted - Utiliser le format lisible (défaut: true)
 * @param {'compact'|'normal'|'large'} props.size - Taille du composant (défaut: 'normal')
 * @param {string} props.className - Classes CSS additionnelles
 */
const CodeDisplay = ({ 
    code, 
    type = 'colis', 
    showCopyButton = true, 
    formatted = true,
    size = 'normal',
    className = '' 
}) => {
    const [copied, setCopied] = useState(false);

    // Formater le code si demandé
    const displayCode = formatted && code
        ? (type === 'colis' ? formatColisCodeDisplay(code) : formatFactureCodeDisplay(code))
        : code;

    // Gérer la copie
    const handleCopy = async () => {
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success('Code copié !');
            
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Erreur lors de la copie:', error);
            toast.error('Impossible de copier le code');
        }
    };

    // Définir les classes selon la taille
    const sizeClasses = {
        compact: 'text-xs px-2 py-1',
        normal: 'text-sm px-3 py-2',
        large: 'text-base px-4 py-3'
    };

    // Couleurs selon le type
    const colorClasses = {
        colis: 'bg-blue-50 border-blue-300 text-blue-800',
        facture: 'bg-purple-50 border-purple-300 text-purple-800'
    };

    if (!code) {
        return (
            <div className={`inline-flex items-center gap-2 border rounded ${sizeClasses[size]} bg-gray-50 border-gray-300 text-gray-400 ${className}`}>
                <span className="font-mono">Aucun code</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 border rounded ${sizeClasses[size]} ${colorClasses[type]} ${className}`}>
            <span className="font-mono font-bold">
                {displayCode}
            </span>
            
            {showCopyButton && (
                <button
                    onClick={handleCopy}
                    className={`transition-colors ${
                        type === 'colis' 
                            ? 'hover:text-blue-900' 
                            : 'hover:text-purple-900'
                    }`}
                    title="Copier le code"
                >
                    {copied ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};

/**
 * Composant pour afficher un code avec un label
 */
export const CodeDisplayWithLabel = ({ 
    code, 
    type = 'colis', 
    label,
    showCopyButton = true,
    size = 'normal',
    className = '' 
}) => {
    const defaultLabel = type === 'colis' ? 'Code du colis' : 'Numéro de facture';
    
    return (
        <div className={className}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
                {label || defaultLabel}
            </label>
            <CodeDisplay 
                code={code} 
                type={type} 
                showCopyButton={showCopyButton}
                size={size}
            />
        </div>
    );
};

/**
 * Composant pour afficher une liste de codes
 */
export const CodeList = ({ 
    codes = [], 
    type = 'colis',
    onCodeClick,
    className = '' 
}) => {
    if (codes.length === 0) {
        return (
            <div className={`text-center p-4 text-gray-500 ${className}`}>
                Aucun code disponible
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {codes.map((code, index) => (
                <div 
                    key={index}
                    onClick={() => onCodeClick && onCodeClick(code)}
                    className={`flex items-center justify-between p-2 bg-white border rounded hover:bg-gray-50 ${
                        onCodeClick ? 'cursor-pointer' : ''
                    }`}
                >
                    <span className="text-sm text-gray-600">#{index + 1}</span>
                    <CodeDisplay 
                        code={code} 
                        type={type}
                        size="compact"
                    />
                </div>
            ))}
        </div>
    );
};

/**
 * Composant Badge pour afficher un code de manière compacte
 */
export const CodeBadge = ({ 
    code, 
    type = 'colis',
    onClick,
    className = '' 
}) => {
    return (
        <span 
            onClick={onClick}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                type === 'colis'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-purple-100 text-purple-800 border border-purple-300'
            } ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
        >
            {code}
        </span>
    );
};

/**
 * Composant pour afficher un code avec QR Code (placeholder pour future intégration)
 */
export const CodeWithQR = ({ 
    code, 
    type = 'colis',
    qrSize = 128,
    className = '' 
}) => {
    return (
        <div className={`flex flex-col items-center gap-3 p-4 bg-white border rounded-lg ${className}`}>
            {/* Placeholder pour QR Code - à intégrer avec qrcode.react */}
            <div 
                className="bg-gray-100 border-2 border-gray-300 flex items-center justify-center"
                style={{ width: qrSize, height: qrSize }}
            >
                <span className="text-xs text-gray-400">QR Code</span>
            </div>
            
            <CodeDisplay 
                code={code} 
                type={type}
                size="normal"
                formatted={false}
            />
        </div>
    );
};

export default CodeDisplay;
