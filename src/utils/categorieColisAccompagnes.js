// La catégorie système "Colis Accompagnés" (une par backoffice) est
// identifiée par is_default côté backend, jamais par son nom : le nom peut
// être saisi avec une autre casse (ex: "COLIS ACCOMPAGNÉS"). Le nom
// normalisé (sans accents ni casse) ne sert que de repli si is_default
// n'est pas renvoyé par l'API.
const normaliser = (texte) =>
    (texte || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

export const estCategorieColisAccompagnes = (category) =>
    !!category && (category.is_default === true || normaliser(category.nom) === 'colis accompagnes');

export const estProduitColisAccompagnes = (produit) => estCategorieColisAccompagnes(produit?.category);
