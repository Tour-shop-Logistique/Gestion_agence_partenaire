import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CompanyLogo from '../../assets/logo_transparent.png';

const ReceiptThermal = React.forwardRef(({ expedition, colis, agency }, ref) => {
    if (!expedition || !colis) return null;
    
    // Extraction intelligente des informations de l'agence
    const agencyName = agency?.nom_agence || agency?.name || agency?.nom || 'AGENCE';
    const agencyAddress = agency?.adresse || agency?.address || '';
    const agencyPhone = agency?.telephone || agency?.telephone_agence || agency?.phone || agency?.agence?.telephone || 'Non renseigné';
    const agencyEmail = agency?.email || '';
    const logoSrc = agency?.logo || CompanyLogo;

    return (
        <div ref={ref} className="bg-white text-black font-mono p-3" style={{ width: '88mm', fontSize: '12px', lineHeight: '1.4' }}>
            {/* Header with Agency Info */}
            <div className="text-center border-b-2 border-black pb-3 mb-3 flex flex-col items-center">
                <img src={logoSrc} alt="Logo" className="h-12 mb-2 object-contain brightness-0" />
                <h1 className="font-bold text-xl leading-tight uppercase">
                    {agencyName}
                </h1>
                {agencyAddress && <p className="text-xs break-words mt-1">{agencyAddress}</p>}
                <p className="text-xs font-bold mt-0.5">
                    📞 {agencyPhone}
                </p>
                {agencyEmail && <p className="text-[10px] mt-0.5">{agencyEmail}</p>}
            </div>

            {/* Expedition ID and Package Code */}
            <div className="mb-3 bg-black text-white p-2 rounded">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">EXPÉDITION #{expedition.id}</span>
                    <span className="text-xs font-bold bg-white text-black px-2 py-0.5 rounded">{colis.code_colis || 'P-1'}</span>
                </div>
                <p className="text-[10px] mt-1">Date: {new Date(expedition.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(expedition.created_at || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Sender & Receiver */}
            <div className="border-y-2 border-black py-3 mb-3 text-[11px]">
                <div className="mb-3 bg-blue-50 p-2 rounded">
                    <p className="text-[10px] uppercase font-bold text-blue-900 mb-1">📤 EXPÉDITEUR</p>
                    <p className="font-bold text-xs uppercase">{expedition.expediteur?.nom_prenom || expedition.expediteur_nom_prenom}</p>
                    <p className="font-bold text-[11px] mt-0.5">📞 {expedition.expediteur?.telephone || expedition.expediteur_telephone}</p>
                    <p className="text-[10px] mt-0.5">📍 {expedition.expediteur?.ville || expedition.expediteur_ville}, {expedition.expediteur?.pays || expedition.expediteur_pays || expedition.pays_depart}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                    <p className="text-[10px] uppercase font-bold text-green-900 mb-1">📥 DESTINATAIRE</p>
                    <p className="font-bold text-xs uppercase">{expedition.destinataire?.nom_prenom || expedition.destinataire_nom_prenom}</p>
                    <p className="font-bold text-[11px] mt-0.5">📞 {expedition.destinataire?.telephone || expedition.destinataire_telephone}</p>
                    <p className="text-[10px] mt-0.5">📍 {expedition.destinataire?.ville || expedition.destinataire_ville}, {expedition.destinataire?.pays || expedition.destinataire_pays || expedition.pays_destination}</p>
                </div>
            </div>

            {/* Package Details */}
            <div className="mb-3 bg-gray-100 p-2.5 border-2 border-black rounded">
                <p className="text-[10px] font-bold uppercase underline mb-2 text-center">📦 DÉTAILS DU COLIS</p>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-600">Désignation:</span>
                        <span className="text-xs font-bold text-right">{colis.designation || 'Colis'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-600">Poids:</span>
                        <span className="text-xs font-bold">{colis.poids} kg</span>
                    </div>
                    {colis.longueur && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-600">Dimensions:</span>
                            <span className="text-[10px] font-bold">{colis.longueur}×{colis.largeur}×{colis.hauteur} cm</span>
                        </div>
                    )}
                    {expedition.type_expedition && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-600">Type:</span>
                            <span className="text-[10px] font-bold uppercase">{expedition.type_expedition.replace('GROUPAGE_', '').replace('_', ' ')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-3 border-t-2 border-black">
                <QRCodeSVG value={colis.code_colis || String(expedition.id || '0000')} size={140} level="H" />
                <p className="text-xs font-bold mt-3 tracking-wider uppercase">SCAN POUR SUIVRE</p>
                <p className="text-base font-bold mt-1.5 tracking-wide">{colis.code_colis}</p>
                <p className="text-[10px] mt-2 italic font-semibold">Tous Shop Logistics</p>
            </div>

            {/* Padding for thermal cutter */}
            <div className="h-8"></div>
        </div>
    );
});

export default ReceiptThermal;
