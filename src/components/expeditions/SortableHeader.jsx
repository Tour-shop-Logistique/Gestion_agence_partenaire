import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * 🔄 EN-TÊTE TRIABLE
 * Composant d'en-tête de colonne avec tri
 */

const SortableHeader = ({ label, sortKey, currentSort, onSort, className = '' }) => {
    const isActive = currentSort.key === sortKey;
    const direction = currentSort.direction;

    const handleClick = () => {
        if (isActive) {
            // Toggle direction
            onSort(sortKey, direction === 'asc' ? 'desc' : 'asc');
        } else {
            // New sort
            onSort(sortKey, 'asc');
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 hover:text-indigo-600 transition-colors group ${className}`}
        >
            <span>{label}</span>
            <div className="flex flex-col">
                <ChevronUpIcon 
                    className={`w-3 h-3 -mb-1 transition-all ${
                        isActive && direction === 'asc' 
                            ? 'text-indigo-600' 
                            : 'text-slate-300 group-hover:text-slate-400'
                    }`} 
                />
                <ChevronDownIcon 
                    className={`w-3 h-3 -mt-1 transition-all ${
                        isActive && direction === 'desc' 
                            ? 'text-indigo-600' 
                            : 'text-slate-300 group-hover:text-slate-400'
                    }`} 
                />
            </div>
        </button>
    );
};

export default SortableHeader;
