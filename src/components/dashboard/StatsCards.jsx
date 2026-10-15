import React from "react";
import { getCountryName } from "../../utils/countries";

const DEST_COLORS = [
    { ring: 'bg-indigo-500',  text: 'text-indigo-600',  badge: 'bg-indigo-50'  },
    { ring: 'bg-violet-500',  text: 'text-violet-600',  badge: 'bg-violet-50'  },
    { ring: 'bg-sky-500',     text: 'text-sky-600',     badge: 'bg-sky-50'     },
    { ring: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50' },
    { ring: 'bg-amber-500',   text: 'text-amber-600',   badge: 'bg-amber-50'   },
];

const TYPE_COLORS = [
    { bar: 'bg-indigo-500',  pill: 'bg-indigo-50 text-indigo-700'  },
    { bar: 'bg-violet-500',  pill: 'bg-violet-50 text-violet-700'  },
    { bar: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700'},
    { bar: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700'    },
    { bar: 'bg-rose-500',    pill: 'bg-rose-50 text-rose-700'      },
];

const CardShell = ({ title, subtitle, children }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="p-4 sm:p-5">
            {children}
        </div>
    </div>
);

const StatsCards = ({ logistics }) => {
    return (
        <>
            {/* Top Destinations */}
            <CardShell title="Top Destinations" subtitle="Ce mois">
                {logistics.top_destinations && logistics.top_destinations.length > 0 ? (
                    <div className="space-y-2">
                        {logistics.top_destinations.slice(0, 5).map((dest, index) => {
                            const c = DEST_COLORS[index] ?? DEST_COLORS[0];
                            return (
                                <div key={index} className="flex items-center gap-3 group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                                    <div className={`w-7 h-7 rounded-full ${c.ring} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        <span className="text-[11px] font-bold text-white">{index + 1}</span>
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                                        {getCountryName(dest.code_pays) || dest.pays}
                                    </span>
                                    <span className={`text-xs font-bold ${c.text} ${c.badge} px-2 py-0.5 rounded-full tabular-nums`}>
                                        {dest.total} exp.
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 text-center py-8">Aucune donnée disponible</p>
                )}
            </CardShell>

            {/* Volume par Type */}
            <CardShell title="Volume par Type" subtitle="Répartition ce mois">
                {logistics.volume_par_type && logistics.volume_par_type.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {(() => {
                            const maxTotal = Math.max(...logistics.volume_par_type.map(v => v.total), 1);
                            return logistics.volume_par_type.map((vol, index) => {
                                const c = TYPE_COLORS[index % TYPE_COLORS.length];
                                const pct = Math.round((vol.total / maxTotal) * 100);
                                return (
                                    <div key={index} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                {vol.type}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-slate-900 tabular-nums">{vol.total}</span>
                                                <span className={`text-[10px] font-bold ${c.pill} px-1.5 py-0.5 rounded-full`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`${c.bar} h-2 rounded-full transition-all duration-500 ease-out`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 text-center py-8">Aucune donnée disponible</p>
                )}
            </CardShell>
        </>
    );
};

export default StatsCards;

