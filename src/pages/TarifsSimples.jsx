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
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">

            {/* --- SIMPLE HEADER - Responsive --- */}
            <PageHeader
                title="Tarifs Simples"
                subtitle="Gérez vos tarifs d'expédition standard par zones et indices"
            />

            {/* --- DYNAMIC CONTENT --- */}
            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <TarifSimpleComponent />
            </main>

        </div>
    );
};

export default TarifsSimples;
