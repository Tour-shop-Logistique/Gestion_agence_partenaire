import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Composant Dropdown avec recherche
 * @param {Array} options - Liste des options [{id, label}]
 * @param {Function} onSelect - Callback quand une option est sélectionnée
 * @param {String} placeholder - Texte du placeholder
 * @param {String} className - Classes CSS additionnelles
 */
const SearchableDropdown = ({ options = [], onSelect, placeholder = "Sélectionner...", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filtrer les options selon le terme de recherche
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus sur l'input de recherche quand le dropdown s'ouvre
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Bouton pour ouvrir le dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors h-9"
            >
                <span className="text-slate-500">{placeholder}</span>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu - S'ouvre vers le HAUT */}
            {isOpen && (
                <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                    {/* Liste des options - EN HAUT */}
                    <div className="max-h-64 overflow-y-auto flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    {option.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-xs text-slate-400 text-center">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>

                    {/* Barre de recherche - EN BAS */}
                    <div className="p-2 border-t border-slate-100 bg-white">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
