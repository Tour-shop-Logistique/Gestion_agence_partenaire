/**
 * Professional Export System for Accounting Module
 * Handles PDF and Excel exports with professional formatting
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Generate unique report number
 * Format: RPT-{agence}-{YYYYMMDD}-{counter}
 */
export const generateReportNumber = (agencyCode = 'ABJ') => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() + 
                  (now.getMonth() + 1).toString().padStart(2, '0') + 
                  now.getDate().toString().padStart(2, '0');
  const counter = now.getHours().toString().padStart(2, '0') + 
                  now.getMinutes().toString().padStart(2, '0');
  return `RPT-${agencyCode}-${dateStr}-${counter}`;
};

/**
 * Format currency for PDF (handles non-breaking spaces)
 */
export const formatCurrencyForPDF = (amount) => {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount || 0);
  return formatted.replace(/\s/g, ' ');
};

/**
 * Format date for reports
 */
export const formatDateForReport = (dateString, includeTime = false) => {
  if (!dateString) return "n/a";
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('fr-FR', options);
};

/**
 * Calculate days difference for unpaid analysis
 */
export const calculateDaysDiff = (dateString) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
