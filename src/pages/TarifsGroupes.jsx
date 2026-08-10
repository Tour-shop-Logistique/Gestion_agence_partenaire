import { useEffect } from "react";
import TarifGroupageComponent from "../components/tarifGroupage";
import { useTarifs } from "../hooks/useTarifs";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import ErrorBoundary from "../components/ErrorBoundary";
import PageHeader from "../components/ui/PageHeader";

const TarifsGroupes = () => {
    const { currentUser } = useAuth();
    const { fetchTarifGroupageAgence } = useTarifs();

    // ========== WEBSOCKET INTEGRATION ==========
    useWebSocket(
        currentUser?.agence_id,
        {
            onTarifsUpdated: (data, meta) => {
                console.log('💲 [TarifsGroupage] Tarifs mis à jour:', meta.model);
                if (meta.model === 'TarifGroupage') {
                    showToast('⚠️ Les tarifs groupage ont été mis à jour par le backoffice', 'warning');
                    // Recharger les tarifs de l'agence
                    fetchTarifGroupageAgence();
                }
            }
        },
        !!currentUser?.agence_id
    );

    useEffect(() => {
        fetchTarifGroupageAgence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-4 sm:space-y-8 px-3 sm:px-6 animate-in fade-in duration-700">

            {/* --- SIMPLE HEADER - Responsive --- */}
            <div className="border-b border-slate-200 pb-4 sm:pb-6">
                <PageHeader
                    title="Tarifs Groupage"
                    subtitle="Optimisez vos expéditions groupées par type et mode de transport"
                />
            </div>

            {/* --- DYNAMIC CONTENT --- */}
            <main className="relative animate-in slide-in-from-bottom-4 duration-500 mt-2">
                <ErrorBoundary>
                    <TarifGroupageComponent />
                </ErrorBoundary>
            </main>

        </div>
    );
};

export default TarifsGroupes;
