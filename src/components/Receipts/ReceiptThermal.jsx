import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CompanyLogo from '../../assets/logo_transparent.png';

const ReceiptThermal = React.forwardRef(({ expedition, colis, agency }, ref) => {
    if (!expedition || !colis) return null;

    return (
        <div ref={ref} className="bg-white text-black font-mono p-2" style={{ width: '58mm', fontSize: '11px', lineHeight: '1.3' }}>
            {/* Header with Agency Info */}
            <div className="text-center border-b-2 border-black pb-2 mb-2 flex flex-col items-center">
                <img src={CompanyLogo} alt="Logo" className="h-8 mb-1 object-contain brightness-0" />
                <h1 className="font-bold text-base leading-tight uppercase">{agency?.nom_agence || agency?.name || 'AGENCE'}</h1>
                {agency?.adresse && <p className="text-[9px] break-words">{agency.adresse}</p>}
                <p className="text-[9px] font-bold">{agency?.telephone || agency?.telephone_agence || ''}</p>
                {agency?.email && <p className="text-[8px]">{agency.email}</p>}
            </div>

            {/* Expedition ID and Package Code */}
            <div className="mb-2 bg-black text-white p-1.5">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">EXP #{expedition.id}</span>
                    <span className="text-[10px] font-bold">{colis.code_colis || 'P-1'}</span>
                </div>
                <p className="text-[9px] mt-0.5">Date: {new Date(expedition.created_at || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Sender & Receiver */}
            <div className="border-y border-black py-2 mb-2 text-[9px]">
                <div className="mb-2">
                    <p className="text-[8px] uppercase font-bold">De:</p>
                    <p className="font-bold text-[10px] uppercase truncate">{expedition.expediteur?.nom_prenom || expedition.expediteur_nom_prenom}</p>
                    <p className="font-bold">{expedition.expediteur?.telephone || expedition.expediteur_telephone}</p>
                    <p className="text-[8px]">{expedition.expediteur?.ville || expedition.expediteur_ville}, {expedition.expediteur?.pays || expedition.expediteur_pays || expedition.pays_depart}</p>
                </div>
                <div className="border-t border-dashed border-black pt-2">
                    <p className="text-[8px] uppercase font-bold">À:</p>
                    <p className="font-bold text-[10px] uppercase truncate">{expedition.destinataire?.nom_prenom || expedition.destinataire_nom_prenom}</p>
                    <p className="font-bold">{expedition.destinataire?.telephone || expedition.destinataire_telephone}</p>
                    <p className="text-[8px]">{expedition.destinataire?.ville || expedition.destinataire_ville}, {expedition.destinataire?.pays || expedition.destinataire_pays || expedition.pays_destination}</p>
                </div>
            </div>

            {/* Package Details */}
            <div className="mb-2 bg-gray-100 p-1.5 border border-black">
                <p className="text-[9px] font-bold uppercase underline mb-1">Détails Colis:</p>
                <p className="text-[10px] font-bold truncate">{colis.designation || 'Colis'}</p>
                <div className="flex justify-between mt-1">
                    <span className="text-[11px] font-bold">Poids: {colis.poids} kg</span>
                    {colis.longueur && (
                        <span className="text-[9px]">{colis.longueur}×{colis.largeur}×{colis.hauteur}cm</span>
                    )}
                </div>
                {expedition.type_expedition && (
                    <p className="text-[8px] mt-1 uppercase font-bold">Type: {expedition.type_expedition.replace('GROUPAGE_', '')}</p>
                )}
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-2 border-t-2 border-black">
                <QRCodeSVG value={String(expedition.id || '0000')} size={110} level="H" />
                <p className="text-[9px] font-bold mt-2 tracking-widest uppercase">SCAN TO TRACK</p>
                <p className="text-sm font-bold mt-1">#{expedition.id}</p>
                <p className="text-[8px] mt-1 italic">Tous Shop Logistics</p>
            </div>

            {/* Padding for thermal cutter */}
            <div className="h-6"></div>
        </div>
    );
});

export default ReceiptThermal;
