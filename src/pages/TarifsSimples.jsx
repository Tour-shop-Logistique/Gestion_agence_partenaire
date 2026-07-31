import { useEffect } from "react";
import TarifSimpleComponent from "../components/tarifSimple";
import { useTarifs } from "../hooks/useTarifs";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";

const TarifsSimples = () => {
    const { currentUser } = useAuth();
    const { fetchAgencyTarifs } = useTarifs();

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onTarifsUpdated: (data, meta) => {
                console.log('💲 [TarifsSimples] Tarifs mis à jour:', meta.model);
                if (meta.model === 'TarifSimple') {
                    showToast('⚠️ Les tarifs simples ont été mis à jour par le backoffice', 'warning');
                    // Recharger les tarifs de l'agence
                    fetchAgencyTarifs();
                }
            }
        },
        !!currentUser?.agence_id
    );

    useEffect(() => {
        fetchAgencyTarifs();
    }, [fetchAgencyTarifs]);

    return (
        <div className="space-y-4 sm:space-y-8 px-3 sm:px-6 animate-in fade-in duration-700">

            {/* --- SIMPLE HEADER - Responsive --- */}
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 sm:pb-6">
                <div>
                    <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                        Tarifs Simples
                    </h1>
                    <p className="text-sm text-slate-600">
                        Gérez vos tarifs d'expédition standard par zones et indices
                    </p>
                </div>
            </div>

            {/* --- DYNAMIC CONTENT --- */}
            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <TarifSimpleComponent />
            </main>

        </div>
    );
};

export default TarifsSimples;
