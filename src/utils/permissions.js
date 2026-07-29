/**
 * Miroir client de app/Support/Permissions/PageResourceMap.php (contexte
 * agence) — correspondance entre les anciennes clés de page (utilisées par
 * Sidebar/PageGuard pour le filtrage menu/route) et les ressources
 * granulaires qu'elles recouvrent.
 */
export const PAGE_RESOURCE_MAP = {
  dashboard: ["dashboard"],
  demandes: ["demandes"],
  expeditions: ["expeditions"],
  colis: ["colis"],
  colis_a_receptionner: ["colis_a_receptionner"],
  retrait_colis: ["retrait_colis"],
  comptabilite: ["comptabilite"],
  transactions: ["transactions"],
  tarifs_simples: ["tarifs_simples"],
  tarifs_groupage: ["tarifs_groupage"],
  communication: ["communication"],
  agents: ["agents"],
  agency_profile: ["agency_profile"],
};

/**
 * Check fin : l'utilisateur possède-t-il la permission "resource.action" ?
 * Admin d'agence = toujours vrai. Agent sans rôle assigné = toujours vrai
 * (même sémantique que le backend, User::hasPermission()).
 */
export function hasPermission(user, isAdmin, permissionKey) {
  if (isAdmin || !user?.role_id) return true;
  const permissions = user?.role_details?.permissions || [];
  return permissions.includes(permissionKey);
}

/**
 * Check large : l'utilisateur a-t-il au moins une permission sur une
 * ressource mappée à cette page ? Dérivé de hasPermission(), pour le
 * filtrage menu/route (Sidebar, PageGuard).
 */
export function canAccessPage(user, isAdmin, pageKey) {
  if (isAdmin || !pageKey) return true;
  if (!user?.role_id) return true;

  const permissions = user?.role_details?.permissions || [];
  const resources = PAGE_RESOURCE_MAP[pageKey] || [];

  return permissions.some((key) => {
    const resource = key.split(".")[0];
    return resources.includes(resource);
  });
}
