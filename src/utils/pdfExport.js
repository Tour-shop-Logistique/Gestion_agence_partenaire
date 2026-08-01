import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

/**
 * Export des colis à réceptionner en PDF
 * @param {Array} colis - Liste des colis à exporter
 * @param {Object} options - Options d'export
 */
export const exportColisAReceptionnerPDF = (colis, options = {}) => {
  const {
    agenceName = 'Agence Partenaire',
    title = 'Liste des colis à réceptionner',
    includeReceivedColis = false
  } = options;

  // Filtrer les colis selon les options
  let filteredColis = colis;
  
  if (!includeReceivedColis) {
    // Exporter uniquement les colis "à récupérer" :
    // - arrivés au backoffice (is_received_by_backoffice = true)
    // - non réceptionnés par l'agence destination (is_received = false)
    filteredColis = colis.filter(c => 
      c.is_received_by_backoffice === true && c.is_received === false
    );
  }

  if (filteredColis.length === 0) {
    throw new Error('Aucun colis à exporter');
  }

  // Créer le document PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuration des couleurs
  const primaryColor = [79, 70, 229]; // Indigo-600
  const secondaryColor = [241, 245, 249]; // Slate-100

  // En-tête du document
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Logo/Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(agenceName, 15, 15);

  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text(title, 15, 25);

  // Date et heure de génération
  const now = new Date();
  const dateStr = format(now, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  doc.setFontSize(10);
  doc.text(`Généré le ${dateStr}`, 15, 33);

  // Statistiques en haut
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(15, 45, 180, 20, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total de colis à réceptionner : ${filteredColis.length}`, 20, 52);
  
  const totalPoids = filteredColis.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Poids total : ${totalPoids.toFixed(2)} kg`, 20, 59);

  // Tableau des colis
  const tableData = filteredColis.map((item, index) => [
    index + 1,
    item.code_colis || '-',
    item.designation || 'Sans désignation',
    `${parseFloat(item.poids || 0).toFixed(2)} kg`,
    item.expedition?.reference || '-',
    item.expedition?.pays_depart || '-',
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Code Colis', 'Désignation', 'Poids', 'Expédition', 'Pays Départ']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59], // slate-800
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 35, fontStyle: 'bold', textColor: primaryColor },
      2: { cellWidth: 55 },
      3: { halign: 'right', cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { cellWidth: 40 }
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${data.pageNumber} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      doc.text(
        agenceName,
        15,
        pageHeight - 10
      );
    }
  });

  // Instructions en bas de la première page si l'espace le permet
  const finalY = doc.lastAutoTable.finalY;
  const pageHeight = doc.internal.pageSize.height;
  
  if (finalY < pageHeight - 40) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(15, finalY + 10, 180, 25, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14); // amber-900
    doc.setFont(undefined, 'bold');
    doc.text(' Instructions :', 20, finalY + 17);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('• Vérifiez chaque colis lors de la réception', 20, finalY + 23);
    doc.text('• Scannez le code colis pour une réception rapide', 20, finalY + 28);
    doc.text('• Contactez le support en cas de problème', 20, finalY + 33);
  }

  // Générer le nom du fichier
  const fileName = `colis-a-receptionner-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`;

  // Sauvegarder le PDF
  doc.save(fileName);

  return {
    success: true,
    fileName,
    count: filteredColis.length,
    totalPoids
  };
};

/**
 * Export des colis sélectionnés en PDF (pour un bon de réception)
 * @param {Array} selectedColis - Liste des colis sélectionnés
 * @param {Object} options - Options d'export
 */
export const exportBonReceptionPDF = (selectedColis, options = {}) => {
  const {
    agenceName = 'Agence Partenaire',
    receiverName = '',
    receiverSignature = false
  } = options;

  if (selectedColis.length === 0) {
    throw new Error('Aucun colis sélectionné');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [79, 70, 229];

  // En-tête
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('BON DE RÉCEPTION', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(agenceName, 105, 25, { align: 'center' });

  // Informations de réception
  const now = new Date();
  const dateStr = format(now, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Date de réception : ${dateStr}`, 15, 45);
  
  if (receiverName) {
    doc.text(`Réceptionné par : ${receiverName}`, 15, 52);
  }

  // Tableau des colis
  const tableData = selectedColis.map((item, index) => [
    index + 1,
    item.code_colis || '-',
    item.designation || 'Sans désignation',
    `${parseFloat(item.poids || 0).toFixed(2)} kg`,
    item.expedition?.reference || '-',
    '☐' // Case à cocher pour validation manuelle
  ]);

  autoTable(doc, {
    startY: receiverName ? 60 : 55,
    head: [['#', 'Code Colis', 'Désignation', 'Poids', 'Expédition', 'Vérifié']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 60 },
      3: { halign: 'right', cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { halign: 'center', cellWidth: 15, fontSize: 12 }
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY;

  // Résumé
  const totalPoids = selectedColis.reduce((sum, c) => sum + parseFloat(c.poids || 0), 0);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Total : ${selectedColis.length} colis - ${totalPoids.toFixed(2)} kg`, 15, finalY + 10);

  // Zone de signature si demandée
  if (receiverSignature) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(120, finalY + 40, 190, finalY + 40);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Signature du réceptionnaire', 155, finalY + 45, { align: 'center' });
  }

  const fileName = `bon-reception-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);

  return {
    success: true,
    fileName,
    count: selectedColis.length
  };
};
