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
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">

            {/* --- SIMPLE HEADER - Responsive --- */}
            <PageHeader
                title="Tarifs Groupage"
                subtitle="Optimisez vos expéditions groupées par type et mode de transport"
            />

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
