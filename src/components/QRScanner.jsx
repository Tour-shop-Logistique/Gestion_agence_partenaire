import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, QrCodeIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ isOpen, onClose, onScan }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [manualCode, setManualCode] = useState('');
    const [lastScanned, setLastScanned] = useState(null);
    const html5QrCodeRef = useRef(null);
    const lastScannedRef = useRef(null);
    const scanCooldownRef = useRef(null);

    useEffect(() => {
        if (isOpen && !scanning) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async () => {
        try {
            setError(null);
            setScanning(true);

            // Créer l'instance du scanner
            html5QrCodeRef.current = new Html5Qrcode("qr-reader");

            // Configuration du scanner
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            // Démarrer le scanner
            await html5QrCodeRef.current.start(
                { facingMode: "environment" }, // Caméra arrière
                config,
                (decodedText) => {
                    // QR code scanné avec succès
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Erreur de scan (normal, se produit continuellement)
                    // On ne fait rien ici pour éviter de polluer la console
                }
            );
        } catch (err) {
            console.error("Erreur lors du démarrage du scanner:", err);
            setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions ou utilisez la saisie manuelle.");
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && scanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
            } catch (err) {
                console.error("Erreur lors de l'arrêt du scanner:", err);
            }
            setScanning(false);
        }
    };

    const handleScanSuccess = (decodedText) => {
        // Empêcher les scans multiples du même code
        const now = Date.now();
        
        // Si c'est le même code que le dernier scan et moins de 2 secondes se sont écoulées, ignorer
        if (lastScannedRef.current?.code === decodedText && 
            lastScannedRef.current?.timestamp && 
            (now - lastScannedRef.current.timestamp) < 2000) {
            return; // Ignorer ce scan (cooldown de 2 secondes)
        }
        
        // Enregistrer ce scan
        lastScannedRef.current = {
            code: decodedText,
            timestamp: now
        };
        
        // Afficher le code scanné temporairement
        setLastScanned(decodedText);
        setTimeout(() => setLastScanned(null), 2000);
        
        // Extraire le code colis du QR code et notifier
        onScan(decodedText);
        
        // Ne PAS arrêter le scanner pour permettre les scans multiples
        // Le scanner continue de fonctionner après le cooldown
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScan(manualCode.trim());
            setManualCode('');
            onClose();
        }
    };

    const handleClose = () => {
        stopScanner();
        setManualCode('');
        setError(null);
        setLastScanned(null);
        // Réinitialiser les références de scan
        lastScannedRef.current = null;
        if (scanCooldownRef.current) {
            clearTimeout(scanCooldownRef.current);
            scanCooldownRef.current = null;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <QrCodeIcon className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Scanner un colis
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* Scanner Area */}
                        <div className="relative">
                            <div 
                                id="qr-reader" 
                                className="w-full rounded-lg overflow-hidden border-2 border-gray-200"
                                style={{ minHeight: '300px' }}
                            />
                            {error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <div className="text-center p-4">
                                        <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-red-600 mb-2">{error}</p>
                                        <p className="text-xs text-gray-500">
                                            Utilisez la saisie manuelle ci-dessous
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                                <strong>Instructions :</strong> Placez le QR code du reçu devant la caméra. 
                                Le code sera automatiquement détecté et le colis sera sélectionné dans la liste.
                                <br />
                                <strong className="mt-1 inline-block">Scanner multiple :</strong> Vous pouvez scanner plusieurs colis sans fermer cette fenêtre.
                                <br />
                                <strong className="mt-1 inline-block text-amber-700">⏱️ Cooldown :</strong> Attendez 2 secondes entre chaque scan du même colis.
                            </p>
                        </div>

                        {/* Indicateur de dernier scan */}
                        {lastScanned && (
                            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                    <p className="text-sm font-bold text-green-800">
                                        ✓ Code scanné : <span className="font-mono">{lastScanned}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Manual Input */}
                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Ou saisissez le code manuellement :
                            </p>
                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="Code colis (ex: COL001)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!manualCode.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Valider
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
