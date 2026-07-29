import { useState } from "react";
import { CurrencyEuroIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const DEFAULT_RATE = '655.957';
const STORAGE_KEY = 'exchange_rate_cfa_eur';

/**
 * Affiche le taux de conversion EUR → CFA et permet de le modifier
 * (même clé de stockage que le sélecteur du header global)
 */
const ExchangeRateWidget = () => {
    const [rate, setRate] = useState(localStorage.getItem(STORAGE_KEY) || DEFAULT_RATE);
    const [tempRate, setTempRate] = useState(rate);
    const [showModal, setShowModal] = useState(false);

    const handleOpen = () => {
        setTempRate(rate);
        setShowModal(true);
    };

    const handleSave = () => {
        const parsed = parseFloat(tempRate);
        if (isNaN(parsed) || parsed <= 0) {
            alert('Veuillez entrer un taux valide');
            return;
        }
        localStorage.setItem(STORAGE_KEY, tempRate);
        setRate(tempRate);
        setShowModal(false);
        window.location.reload(); // Recharger pour appliquer le nouveau taux partout
    };

    const handleReset = () => setTempRate(DEFAULT_RATE);

    return (
        <>
            <button
                onClick={handleOpen}
                className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
                <CurrencyEuroIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    1€ = {parseFloat(rate).toLocaleString('fr-FR')} CFA
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-40" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-56 h-56 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-40" />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <CurrencyEuroIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Taux de conversion</h3>
                                        <p className="text-xs text-slate-500 font-medium">Euro vers CFA</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Taux actuel</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            1 € = {parseFloat(rate).toLocaleString('fr-FR')} <span className="text-lg text-indigo-600">CFA</span>
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <ArrowPathIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 flex items-center justify-between">
                                        <span>Nouveau taux (1 Euro =)</span>
                                        <button
                                            onClick={handleReset}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 normal-case"
                                        >
                                            Réinitialiser
                                        </button>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={tempRate}
                                            onChange={(e) => setTempRate(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all duration-300 pr-20"
                                            placeholder="655.957"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 rounded-xl shadow-sm">
                                            <span className="text-xs font-bold text-white">CFA</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-1">
                                        Le taux par défaut est <span className="font-semibold text-slate-700">655.957 CFA</span>. Ce taux sera utilisé pour toutes les conversions dans l'application.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-6 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 border-2 border-slate-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-[1.5] py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExchangeRateWidget;
