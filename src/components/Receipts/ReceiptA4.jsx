import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CompanyLogo from '../../assets/logo_transparent.png';

const ReceiptA4 = React.forwardRef(({ expedition, agency }, ref) => {
    if (!expedition) return null;

    const totalColis = expedition.colis?.length || 0;
    const totalWeight = expedition.colis?.reduce((sum, c) => sum + (parseFloat(c.poids) || 0), 0) || 0;
    const totalFraisEmballage = parseFloat(expedition.frais_emballage) ||
        (expedition.colis?.reduce((sum, c) => sum + (parseFloat(c.prix_emballage) || 0), 0) || 0);
    const totalAPayer = (parseFloat(expedition.montant_expedition) || 0) + totalFraisEmballage;
    const date = expedition.created_at ? new Date(expedition.created_at) : new Date();

    return (
        <div ref={ref} className="p-10 bg-white text-slate-900 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        {agency?.logo ? (
                            <img src={agency.logo} alt="Logo Agence" className="h-16 object-contain" />
                        ) : (
                            <img src={CompanyLogo} alt="Logo Company" className="h-16 object-contain" />
                        )}
                        {agency?.logo && <img src={CompanyLogo} alt="Logo Company" className="h-12 object-contain border-l border-slate-200 pl-4" />}
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-tighter">{agency?.nom_agence || agency?.name || 'VOTRE AGENCE'}</h1>
                    {agency?.adresse && <p className="text-xs font-bold text-slate-500 uppercase">{agency.adresse}</p>}
                    <p className="text-xs font-bold text-slate-500 uppercase">{agency?.ville || ''}{agency?.ville && agency?.pays ? ', ' : ''}{agency?.pays || ''}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Tél: {agency?.telephone || agency?.telephone_agence || '00 00 00 00'}</p>
                    {agency?.email && <p className="text-xs font-bold text-slate-500">{agency.email}</p>}
                </div>
                <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-2 mb-2 inline-block">
                        <h2 className="text-lg font-bold uppercase">REÇU CLIENT</h2>
                    </div>
                    <p className="text-sm font-bold">N°: {expedition.id || '---'}</p>
                    <p className="text-xs font-bold text-slate-500">Date: {format(date, 'dd MMMM yyyy HH:mm', { locale: fr })}</p>
                </div>
            </div>

            {/* Partners Info */}
            <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">EXPÉDITEUR</h3>
                    <p className="text-sm font-bold uppercase">{expedition.expediteur?.nom_prenom || expedition.expediteur_nom_prenom}</p>
                    <p className="text-xs font-bold text-slate-600">{expedition.expediteur?.telephone || expedition.expediteur_telephone}</p>
                    <p className="text-xs text-slate-500 mt-1">{expedition.expediteur?.adresse || expedition.expediteur_adresse}</p>
                    <p className="text-xs text-slate-500">{expedition.expediteur?.ville || expedition.expediteur_ville}, {expedition.expediteur?.pays || expedition.expediteur_pays || expedition.pays_depart}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">DESTINATAIRE</h3>
                    <p className="text-sm font-bold uppercase">{expedition.destinataire?.nom_prenom || expedition.destinataire_nom_prenom}</p>
                    <p className="text-xs font-bold text-slate-600">{expedition.destinataire?.telephone || expedition.destinataire_telephone}</p>
                    <p className="text-xs text-slate-500 mt-1">{expedition.destinataire?.adresse || expedition.destinataire_adresse}</p>
                    <p className="text-xs text-slate-500">{expedition.destinataire?.ville || expedition.destinataire_ville}, {expedition.destinataire?.pays || expedition.destinataire_pays || expedition.pays_destination}</p>
                </div>
            </div>

            {/* Shipment Details */}
            <div className="mb-10">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    DÉTAILS DE L'EXPÉDITION
                    <div className="flex-1 h-px bg-slate-100"></div>
                </h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                            <th className="p-3">Désignation</th>
                            <th className="p-3 text-center">Poids (kg)</th>
                            <th className="p-3 text-center">Dimensions</th>
                            <th className="p-3 text-right">Frais Emb.</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-bold">
                        {expedition.colis?.map((c, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="p-3">
                                    <p className="text-slate-900 uppercase">{c.designation || 'Colis'}</p>
                                    {c.articles?.length > 0 && (
                                        <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">({c.articles.join(', ')})</p>
                                    )}
                                </td>
                                <td className="p-3 text-center">{c.poids} kg</td>
                                <td className="p-3 text-center">{c.longueur || 0}x{c.largeur || 0}x{c.hauteur || 0} cm</td>
                                <td className="p-3 text-right">{c.prix_emballage || 0} CFA</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-900">
                            <td colSpan="3" className="p-3 text-sm font-bold uppercase text-right">TOTAL À PAYER</td>
                            <td className="p-3 text-lg font-mono font-bold text-right text-indigo-600">
                                {totalAPayer.toLocaleString()} CFA
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Info & QR Code */}
            <div className="mt-auto pt-10 border-t border-slate-100 grid grid-cols-3 gap-10">
                <div className="col-span-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conditions Générales</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                        - Les marchandises sont transportées aux risques et périls de l'expéditeur sauf déclaration de valeur.<br />
                        - Toute réclamation doit être faite à la réception du colis.<br />
                        - Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme.
                    </p>
                    <div className="mt-6">
                        <p className="text-[10px] font-bold text-slate-900 uppercase">Signature Agence</p>
                        <div className="h-16 w-32 border border-slate-100 rounded mt-1 bg-slate-50/50"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <QRCodeSVG value={String(expedition.id || '0000')} size={100} level="H" />
                    <p className="text-[10px] font-bold mt-3 text-slate-400 tracking-[0.3em]">SCAN TO TRACK</p>
                    <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase italic">Généré par TOUS SHOP LOGISTICS</p>
                </div>
            </div>
        </div>
    );
});

export default ReceiptA4;
