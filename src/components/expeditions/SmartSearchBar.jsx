import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * 🔍 BARRE DE RECHERCHE INTELLIGENTE
 * Style: Notion / Linear
 * - Recherche instantanée multi-critères
 * - Suggestions
 * - Raccourci clavier (Cmd/Ctrl + K)
 * - Design moderne
 */

const SmartSearchBar = ({ 
    value, 
    onChange, 
    placeholder = "Rechercher une expédition...",
    totalResults = 0 
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Raccourci clavier Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            
            // Escape pour effacer
            if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                onChange('');
                inputRef.current?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onChange]);

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
            {/* Search Container */}
            <div className={`relative flex items-center bg-white border-2 rounded-xl shadow-sm transition-all duration-300 ${
                isFocused 
                    ? 'border-indigo-400 shadow-lg shadow-indigo-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
            }`}>
                {/* Search Icon */}
                <div className="pl-4 pr-3">
                    <MagnifyingGlassIcon className={`w-5 h-5 transition-colors duration-300 ${
                        isFocused ? 'text-indigo-500' : 'text-slate-400'
                    }`} />
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 bg-transparent border-none outline-none"
                />

                {/* Clear Button */}
                {value && (
                    <button
                        onClick={handleClear}
                        className="px-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}

                {/* Keyboard Shortcut Hint */}
                {!isFocused && !value && (
                    <div className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 mr-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <kbd className="text-[10px] font-bold text-slate-400">⌘K</kbd>
                    </div>
                )}

                {/* Results Count */}
                {value && (
                    <div className="px-4 py-1.5 mr-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-xs font-bold text-indigo-600">
                            {totalResults} résultat{totalResults !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Search Tips */}
            {isFocused && !value && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-xl z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">💡 Recherche intelligente</p>
                    <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">REF-</span>
                            <span>Rechercher par référence</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">Nom</span>
                            <span>Expéditeur ou destinataire</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">Pays</span>
                            <span>Départ ou destination</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartSearchBar;
