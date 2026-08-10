import { useEffect } from "react";
import TarifSimpleComponent from "../components/tarifSimple";
import { useTarifs } from "../hooks/useTarifs";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import PageHeader from "../components/ui/PageHeader";

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
            <div className="border-b border-slate-200 pb-4 sm:pb-6">
                <PageHeader
                    title="Tarifs Simples"
                    subtitle="Gérez vos tarifs d'expédition standard par zones et indices"
                />
            </div>

            {/* --- DYNAMIC CONTENT --- */}
            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <TarifSimpleComponent />
            </main>

        </div>
    );
};

export default TarifsSimples;
