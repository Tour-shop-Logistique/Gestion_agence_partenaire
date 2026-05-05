import React from 'react';
import { User, Phone, MapPin, Mail } from 'lucide-react';

/**
 * 👤 FICHE CONTACT CRM STYLE
 * Cartes visuelles pour expéditeur et destinataire
 */
const ContactCard = ({ type, contact, country }) => {
    const isShipper = type === 'shipper';
    
    const config = {
        shipper: {
            title: 'Expéditeur',
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            iconColor: 'text-indigo-600',
            accentColor: 'bg-indigo-600'
        },
        receiver: {
            title: 'Destinataire',
            color: 'blue',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            accentColor: 'bg-blue-600'
        }
    };

    const style = config[type];

    return (
        <div className={`${style.bgColor} border-2 ${style.borderColor} rounded-xl p-6 transition-all hover:shadow-lg`}>
            {/* Header avec avatar */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full ${style.accentColor} flex items-center justify-center shadow-lg`}>
                    <User className="w-7 h-7 text-white" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                        {style.title}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                        {contact.nom_prenom || 'Non renseigné'}
                    </h3>
                </div>
            </div>

            {/* Informations */}
            <div className="space-y-4">
                {/* Téléphone */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${style.bgColor} border ${style.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Phone className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-500 uppercase">Téléphone</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {contact.telephone || 'Non renseigné'}
                        </p>
                    </div>
                </div>

                {/* Email */}
                {contact.email && (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${style.bgColor} border ${style.borderColor} flex items-center justify-center flex-shrink-0`}>
                            <Mail className={`w-5 h-5 ${style.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                            <p className="text-sm font-medium text-slate-700 truncate">
                                {contact.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Localisation */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${style.bgColor} border ${style.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <MapPin className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-500 uppercase">Localisation</p>
                        <p className="text-sm font-bold text-slate-900">
                            {contact.ville || country || 'Non renseigné'}
                        </p>
                    </div>
                </div>

                {/* Adresse complète */}
                {contact.adresse && (
                    <div className="pt-3 border-t border-white/50">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Adresse complète</p>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {contact.adresse}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactCard;
