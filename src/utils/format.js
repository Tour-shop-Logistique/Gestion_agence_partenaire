export const formatPrice = (amount, currency = 'XOF') => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
