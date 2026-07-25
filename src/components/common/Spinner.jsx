const SIZE_CLASSES = {
  xs: "w-3.5 h-3.5 border-2",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
  xl: "w-16 h-16 border-4",
};

const COLOR_CLASSES = {
  indigo: "border-indigo-200 border-t-indigo-600",
  slate: "border-slate-200 border-t-slate-600",
  white: "border-white/30 border-t-white",
  current: "border-current/30 border-t-current",
};

/**
 * Spinner canonique de l'app — remplace les ~40 variantes ad hoc
 * (SVG inline, div bordure, double-anneau) dispersées dans le code.
 * À utiliser partout où un indicateur de chargement inline est nécessaire
 * (boutons, tables, headers, cartes).
 */
const Spinner = ({ size = "md", color = "indigo", className = "" }) => (
  <span
    role="status"
    aria-label="Chargement en cours"
    className={`inline-block rounded-full animate-spin ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${COLOR_CLASSES[color] || COLOR_CLASSES.indigo} ${className}`}
  />
);

export default Spinner;
