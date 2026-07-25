/**
 * Bloc de skeleton loading avec effet shimmer (remplace le simple
 * `animate-pulse` gris plat utilisé jusqu'ici pour les états de chargement).
 * Composable : passer une className pour définir la taille/forme (h-4 w-32, rounded-full, etc.)
 */
const Skeleton = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-md bg-slate-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

export default Skeleton;
