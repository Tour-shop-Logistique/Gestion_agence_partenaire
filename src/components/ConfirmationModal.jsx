import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmation",
    message = "Êtes-vous sûr de vouloir effectuer cette action ?",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    type = "danger", // 'danger', 'info', 'success'
    isLoading = false,
    children
}) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-600 bg-red-100',
                    button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
                    border: 'border-red-100'
                };
            case 'success':
                return {
                    icon: 'text-emerald-600 bg-emerald-100',
                    button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                    border: 'border-emerald-100'
                };
            default:
                return {
                    icon: 'text-indigo-600 bg-indigo-100',
                    button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                    border: 'border-indigo-100'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.icon}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {message}
                    </p>
                    {children && (
                        <div className="mt-4">
                            {children}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${colors.button}`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
