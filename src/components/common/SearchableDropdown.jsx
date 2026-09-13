import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Retire les accents pour que "suede" trouve "Suède" - NFD decompose les
// caracteres accentues en (lettre de base + marque diacritique), qu'on
// supprime ensuite via la plage Unicode des marques combinantes.
const stripAccents = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Composant Dropdown avec recherche
 * @param {Array} options - Liste des options [{id, label}]
 * @param {Function} onSelect - Callback quand une option est sélectionnée
 * @param {String} placeholder - Texte du placeholder
 * @param {String} className - Classes CSS additionnelles
 */
const SearchableDropdown = ({ options = [], onSelect, placeholder = "Sélectionner...", className = "", buttonClassName = "h-9 text-xs", id, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuPos, setMenuPos] = useState(null);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filtrer les options selon le terme de recherche, insensible aux
    // accents (ex: "suede" doit trouver "Suède").
    const filteredOptions = options.filter(option =>
        stripAccents(option.label.toLowerCase()).includes(stripAccents(searchTerm.toLowerCase()))
    );

    // Le menu se rend via un portail (document.body), en position fixed
    // calculée depuis le bouton - sans ça, un ancêtre avec overflow-hidden
    // (ex: une carte de formulaire) tronque le menu au lieu de le laisser
    // flotter par-dessus le reste de la page (bug rencontré et corrigé).
    // Toujours ouvert vers le HAUT (bottom du menu ancré au-dessus du
    // bouton), comportement préexistant conservé.
    const updateMenuPos = () => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        setMenuPos({
            bottom: window.innerHeight - rect.top + 4,
            left: rect.left,
            width: rect.width,
        });
    };

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        if (!isOpen) return;

        updateMenuPos();

        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target)
                && menuRef.current && !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', updateMenuPos, true);
        window.addEventListener('resize', updateMenuPos);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updateMenuPos, true);
            window.removeEventListener('resize', updateMenuPos);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
                id={id}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between px-3 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors disabled:bg-slate-50 disabled:text-slate-900 disabled:cursor-default disabled:hover:border-slate-300 ${buttonClassName}`}
            >
                <span className="text-slate-500">{placeholder}</span>
                {!disabled && (
                    <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {/* Dropdown menu - S'ouvre vers le HAUT */}
            {isOpen && !disabled && menuPos && createPortal(
                <div
                    ref={menuRef}
                    className="fixed bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col"
                    // z-index élevé pour rester visible même utilisé à
                    // l'intérieur d'un modal (un menu en portail sous un
                    // modal serait invisible sans jamais lever d'erreur).
                    style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, zIndex: 10050 }}
                >
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableDropdown;
