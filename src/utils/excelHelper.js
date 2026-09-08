import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Helpers d'export Excel génériques (miroir du backoffice-app :
 * src/utils/excelHelper.js), utilisés par ExportButton.jsx - filet de
 * sécurité pour reconstituer manuellement une configuration (agents/rôles,
 * tarifs affichés) en cas d'incident, indépendamment des sauvegardes serveur.
 *
 * `columns` : tableau de { header, key } - header = libellé de colonne,
 * key = clé lue dans chaque ligne de `rows`. `rows` doit être un tableau
 * d'objets déjà aplatis (valeurs primitives uniquement, pas d'objets
 * imbriqués) - chaque page appelante résout ses champs relationnels avant
 * de construire `rows`.
 */

const rowsToAoa = (columns, rows) => {
  const header = columns.map((c) => c.header);
  const body = rows.map((row) => columns.map((c) => row[c.key] ?? ''));
  return [header, ...body];
};

/**
 * Génère et télécharge un classeur Excel à un seul onglet.
 */
export const exportToExcel = (columns, rows, filename, sheetName = 'Données') => {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsToAoa(columns, rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31)); // Excel limite les noms d'onglet à 31 caractères
  XLSX.writeFile(workbook, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
