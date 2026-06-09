import React from 'react';

/**
 * Composant de fond ornamental réutilisable
 * Motifs géométriques marocains répétitifs pour toutes les pages
 */
const OrnamentalBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Fond de base avec dégradé subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
            
            {/* Pattern ornamental répétitif principal */}
            <div className="absolute inset-0 opacity-[0.12]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        {/* Pattern de base - motif ornemental petit et répétitif */}
                        <pattern id="main-ornamental-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            {/* Forme centrale en losange */}
                            <path d="M30,12 L36,30 L30,48 L24,30 Z" fill="#4f46e5" opacity="0.3"/>
                            
                            {/* Courbes ornementales autour */}
                            <path d="M30,12 Q24,18 30,24 Q36,18 30,12" fill="none" stroke="#14b8a6" strokeWidth="1.2" opacity="0.5"/>
                            <path d="M30,36 Q24,42 30,48 Q36,42 30,36" fill="none" stroke="#14b8a6" strokeWidth="1.2" opacity="0.5"/>
                            <path d="M12,30 Q18,24 24,30 Q18,36 12,30" fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.5"/>
                            <path d="M36,30 Q42,24 48,30 Q42,36 36,30" fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.5"/>
                            
                            {/* Petits cercles décoratifs */}
                            <circle cx="30" cy="30" r="4" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.4"/>
                            <circle cx="30" cy="12" r="2" fill="#14b8a6" opacity="0.6"/>
                            <circle cx="30" cy="48" r="2" fill="#14b8a6" opacity="0.6"/>
                            <circle cx="12" cy="30" r="2" fill="#6366f1" opacity="0.6"/>
                            <circle cx="48" cy="30" r="2" fill="#6366f1" opacity="0.6"/>
                            
                            {/* Mini motifs dans les coins */}
                            <path d="M15,15 L18,18 L15,21 L12,18 Z" fill="#f59e0b" opacity="0.3"/>
                            <path d="M45,15 L48,18 L45,21 L42,18 Z" fill="#f59e0b" opacity="0.3"/>
                            <path d="M15,45 L18,48 L15,51 L12,48 Z" fill="#f59e0b" opacity="0.3"/>
                            <path d="M45,45 L48,48 L45,51 L42,48 Z" fill="#f59e0b" opacity="0.3"/>
                            
                            {/* Lignes décoratives subtiles */}
                            <line x1="30" y1="24" x2="30" y2="36" stroke="#4f46e5" strokeWidth="0.6" opacity="0.3"/>
                            <line x1="24" y1="30" x2="36" y2="30" stroke="#4f46e5" strokeWidth="0.6" opacity="0.3"/>
                        </pattern>

                        {/* Pattern secondaire pour variation */}
                        <pattern id="secondary-ornamental-pattern" x="30" y="30" width="60" height="60" patternUnits="userSpaceOnUse">
                            {/* Étoile à 8 branches */}
                            <g transform="translate(30, 30)">
                                <path d="M0,-15 L4,-4 L15,0 L4,4 L0,15 L-4,4 L-15,0 L-4,-4 Z" fill="#14b8a6" opacity="0.25"/>
                                <circle cx="0" cy="0" r="4" fill="#f59e0b" opacity="0.3"/>
                            </g>
                            
                            {/* Spirales décoratives */}
                            <path d="M30,18 Q27,21 30,24" fill="none" stroke="#4f46e5" strokeWidth="0.8" opacity="0.4"/>
                            <path d="M30,36 Q33,39 30,42" fill="none" stroke="#4f46e5" strokeWidth="0.8" opacity="0.4"/>
                            
                            {/* Points décoratifs */}
                            <circle cx="20" cy="20" r="1.5" fill="#6366f1" opacity="0.5"/>
                            <circle cx="40" cy="20" r="1.5" fill="#6366f1" opacity="0.5"/>
                            <circle cx="20" cy="40" r="1.5" fill="#6366f1" opacity="0.5"/>
                            <circle cx="40" cy="40" r="1.5" fill="#6366f1" opacity="0.5"/>
                        </pattern>
                    </defs>
                    
                    {/* Application du pattern sur toute la surface */}
                    <rect width="100%" height="100%" fill="url(#main-ornamental-pattern)"/>
                </svg>
            </div>

            {/* Overlay avec le pattern secondaire (décalé) pour plus de richesse */}
            <div className="absolute inset-0 opacity-[0.08]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="url(#secondary-ornamental-pattern)"/>
                </svg>
            </div>

            {/* Étoile marocaine décorative - Coin supérieur droit */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-[0.10]">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(200, 200)">
                        <path d="M0,-80 L16,-16 L80,0 L16,16 L0,80 L-16,16 L-80,0 L-16,-16 Z" 
                              fill="#4f46e5" stroke="#6366f1" strokeWidth="2"/>
                        <circle cx="0" cy="0" r="30" fill="#6366f1" opacity="0.4"/>
                        
                        {/* Mini étoiles autour */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x = Math.cos(rad) * 110;
                            const y = Math.sin(rad) * 110;
                            return (
                                <g key={i} transform={`translate(${x}, ${y})`}>
                                    <path d="M0,-12 L4,-4 L12,0 L4,4 L0,12 L-4,4 L-12,0 L-4,-4 Z" 
                                          fill="#14b8a6" opacity="0.6"/>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Étoile marocaine décorative - Coin inférieur gauche */}
            <div className="absolute -bottom-24 -left-24 w-[350px] h-[350px] opacity-[0.09] rotate-45">
                <svg viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(175, 175)">
                        <path d="M0,-70 L14,-14 L70,0 L14,14 L0,70 L-14,14 L-70,0 L-14,-14 Z" 
                              fill="#14b8a6" stroke="#10b981" strokeWidth="2"/>
                        <circle cx="0" cy="0" r="25" fill="#10b981" opacity="0.4"/>
                        
                        {/* Mini cercles autour */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x = Math.cos(rad) * 95;
                            const y = Math.sin(rad) * 95;
                            return (
                                <circle key={i} cx={x} cy={y} r="8" fill="#f59e0b" opacity="0.5"/>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Cercles géométriques - Côté droit milieu */}
            <div className="absolute top-1/2 -translate-y-1/2 right-10 w-[200px] h-[200px] opacity-[0.08]">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#4f46e5" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="65" fill="none" stroke="#6366f1" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#14b8a6" strokeWidth="2.5"/>
                    <circle cx="100" cy="100" r="15" fill="#f59e0b" opacity="0.4"/>
                </svg>
            </div>

            {/* Petites étoiles décoratives dispersées - Gauche */}
            <div className="absolute top-1/4 left-1/4 w-[150px] h-[150px] opacity-[0.12]">
                <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                    {[...Array(6)].map((_, i) => {
                        const x = (i % 3) * 60 + 25;
                        const y = Math.floor(i / 3) * 60 + 25;
                        return (
                            <g key={i} transform={`translate(${x}, ${y})`}>
                                <path d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" 
                                      fill="#f59e0b" opacity="0.7"/>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Motif grille subtile sur toute la page */}
            <div className="absolute inset-0 opacity-[0.025]" 
                 style={{
                     backgroundImage: `
                         linear-gradient(to right, #4f46e5 1px, transparent 1px),
                         linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
                     `,
                     backgroundSize: '60px 60px'
                 }}
            />

            {/* Vignette subtile pour donner de la profondeur */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-100/20" />
        </div>
    );
};

export default OrnamentalBackground;
