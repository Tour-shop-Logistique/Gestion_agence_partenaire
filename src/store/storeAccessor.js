/**
 * Point d'accès différé au store Redux, pour les modules qui ne peuvent pas
 * l'importer directement sans créer une dépendance circulaire.
 *
 * Cas d'usage : src/utils/apiService.js (méthode handleResponse) a besoin
 * de dispatcher une déconnexion sur un 401, mais store/index.js importe
 * authSlice.js qui importe des fonctions API qui importent apiService.js -
 * un import statique de store/index.js dans apiService.js fermerait ce
 * cycle et casserait l'ordre de chargement des modules ES.
 *
 * store/index.js appelle setStore(store) une fois créé ; apiService.js
 * appelle getStore() au moment de l'usage (jamais au chargement du
 * module), quand le cycle est déjà résolu.
 */
let storeInstance = null;

export function setStore(store) {
  storeInstance = store;
}

export function getStore() {
  return storeInstance;
}
