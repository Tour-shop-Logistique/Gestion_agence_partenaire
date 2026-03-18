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
    const transportAmount = parseFloat(expedition.montant_base) || 0;
    const totalAPayer = (parseFloat(expedition.montant_expedition) || 0) + totalFraisEmballage;
    const prestationAmount = parseFloat(expedition.montant_prestation) || 0;

    const date = expedition.created_at ? new Date(expedition.created_at) : new Date();
    const referenceSuffix = expedition.reference ? expedition.reference.slice(-3) : String(expedition.id || '000').slice(-3).padStart(3, '0');
    const invoiceNumber = `FACT-${date.getFullYear()}-${referenceSuffix}`;
    const logoSrc = agency?.logo || CompanyLogo;
    const isPaid = expedition.statut_paiement === 'paye';

    return (
        <div ref={ref} className="p-10 bg-white text-slate-900 font-sans relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                <img src={logoSrc} alt="" className="w-2/3 object-contain grayscale" />
            </div>

            {/* Content Container (z-10 for overlapping watermark) */}
            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <img src={logoSrc} alt="Logo" className="h-16 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold uppercase tracking-tighter">{agency?.nom_agence || agency?.name || 'VOTRE AGENCE'}</h1>
                        {agency?.adresse && <p className="text-xs font-bold text-slate-500 uppercase">{agency.adresse}</p>}
                        <p className="text-xs font-bold text-slate-500 uppercase">{agency?.ville || ''}{agency?.ville && agency?.pays ? ', ' : ''}{agency?.pays || ''}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Tél: {agency?.telephone || agency?.telephone_agence || '00 00 00 00'}</p>
                        {agency?.email && <p className="text-xs font-bold text-slate-500">{agency.email}</p>}
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="bg-slate-900 text-white px-5 py-2.5 mb-3 inline-block rounded-tl-xl rounded-br-xl shadow-md">
                            <h2 className="text-xl font-black uppercase tracking-widest">FACTURE</h2>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">N° {invoiceNumber}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Éditée le {format(date, 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                        {expedition.reference && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Réf: {expedition.reference}</p>}

                        {/* Payment Status Stamp */}
                        <div className={`mt-4 px-4 py-1.5 border-2 inline-block transform -rotate-6 ${isPaid ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'}`}>
                            <span className="text-lg font-black uppercase tracking-widest leading-none">
                                {isPaid ? 'PAYÉ' : 'EN ATTENTE'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Partners Info */}
                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center mb-4 border-b border-slate-200 pb-2">
                            <div className="w-2 h-4 bg-indigo-600 mr-2 rounded-sm"></div>
                            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">EXPÉDITEUR / FACTURÉ À</h3>
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight text-slate-800">{expedition.expediteur?.nom_prenom || expedition.expediteur_nom_prenom}</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">{expedition.expediteur?.telephone || expedition.expediteur_telephone}</p>
                        <p className="text-xs font-medium text-slate-500 mt-2">{expedition.expediteur?.adresse || expedition.expediteur_adresse}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{expedition.expediteur?.ville || expedition.expediteur_ville}, {expedition.expediteur?.pays || expedition.expediteur_pays || expedition.pays_depart}</p>
                    </div>
                    <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center mb-4 border-b border-slate-200 pb-2">
                            <div className="w-2 h-4 bg-blue-600 mr-2 rounded-sm"></div>
                            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">DESTINATAIRE LIEE</h3>
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight text-slate-800">{expedition.destinataire?.nom_prenom || expedition.destinataire_nom_prenom}</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">{expedition.destinataire?.telephone || expedition.destinataire_telephone}</p>
                        <p className="text-xs font-medium text-slate-500 mt-2">{expedition.destinataire?.adresse || expedition.destinataire_adresse}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{expedition.destinataire?.ville || expedition.destinataire_ville}, {expedition.destinataire?.pays || expedition.destinataire_pays || expedition.pays_destination}</p>
                    </div>
                </div>

                {/* Shipment Details Table (Modernized) */}
                <div className="mb-8">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        DÉTAILS DES PRESTATIONS
                        <div className="flex-1 h-[2px] bg-slate-100"></div>
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/80 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                                    <th className="px-4 py-3">Désignation</th>
                                    <th className="px-4 py-3 text-center">Qté</th>
                                    <th className="px-4 py-3 text-center">Poids (kg)</th>
                                    <th className="px-4 py-3 text-center">Dimensions</th>
                                    <th className="px-4 py-3 text-right">Montant (CFA)</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold">
                                {expedition.colis?.map((c, i) => (
                                    <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-900 uppercase tracking-tight">{c.designation || 'Colis'}</p>
                                            {c.category?.nom && <p className="text-[9px] text-indigo-600 uppercase tracking-widest mt-0.5">{c.category.nom}</p>}
                                            {c.articles?.length > 0 && (
                                                <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 line-clamp-1">({c.articles.join(', ')})</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500">1</td>
                                        <td className="px-4 py-3 text-center font-mono text-slate-700">{parseFloat(c.poids).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center text-slate-500 text-[10px] tracking-tighter">
                                            {c.longueur || 0}x{c.largeur || 0}x{c.hauteur || 0} cm
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-900">
                                            {parseFloat(c.montant_colis_total || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end mb-10">
                    <div className="w-1/2 rounded-xl border border-slate-200 p-5 bg-slate-50/50 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 z-0"></div>

                        <div className="relative z-10 space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                <span className="uppercase tracking-widest">Total Fret / Transport</span>
                                <span className="font-mono">{transportAmount.toLocaleString()} CFA</span>
                            </div>
                            {totalFraisEmballage > 0 && (
                                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                    <span className="uppercase tracking-widest">Frais d'emballage</span>
                                    <span className="font-mono">{totalFraisEmballage.toLocaleString()} CFA</span>
                                </div>
                            )}
                            {prestationAmount > 0 && (
                                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                    <span className="uppercase tracking-widest">Frais de prestation agence</span>
                                    <span className="font-mono">{prestationAmount.toLocaleString()} CFA</span>
                                </div>
                            )}

                            <div className="h-px bg-slate-200 my-4"></div>

                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Total Net À Payer</span>
                                <div className="text-right">
                                    <span className="text-xl font-black font-mono text-indigo-700 leading-none block">
                                        {totalAPayer.toLocaleString()} CFA
                                    </span>
                                    {isPaid && expedition.mode_paiement && (
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block mt-1">
                                            Réglé par {expedition.mode_paiement}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info & QR Code */}
                <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-10 break-inside-avoid">
                    <div className="col-span-2">


                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conditions Générales</h4>
                        <p className="text-[8px] text-slate-400 leading-relaxed font-medium">
                            Les marchandises sont transportées aux risques et périls de l'expéditeur sauf déclaration de valeur. Toute réclamation doit être faite à la réception du colis. Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de perte ou d'avarie, notre responsabilité est strictement limitée à la valeur déclarée ou au barème en vigueur. La signature du bordereau de remise vaut acceptation pleine et entière de nos conditions générales de transport.
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                        <QRCodeSVG value={`https://tracking.tousshop.com/track/${expedition.reference || expedition.id}`} size={90} level="H" />
                        <p className="text-[9px] font-black mt-3 text-slate-900 tracking-[0.3em]">SCAN TO TRACK</p>
                        <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Généré par TOUS SHOP LOGISTICS</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ReceiptA4;
