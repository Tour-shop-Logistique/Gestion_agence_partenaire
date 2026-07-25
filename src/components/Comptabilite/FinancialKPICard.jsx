const FinancialKPICard = ({ label, value, subtitle, color, icon: Icon, indicator }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg border border-slate-200 bg-white shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
      {indicator && <div className={`absolute top-0 left-0 w-1 h-full ${indicator}`} />}
      <div className="flex justify-between items-start mb-1.5 sm:mb-2">
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{label}</p>
        <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${color} opacity-40`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-base sm:text-xl font-bold tabular-nums ${color}`}>
          {formatCurrency(value)}
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">CFA</span>
      </div>
      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 sm:mt-1.5 font-medium line-clamp-1">{subtitle}</p>
    </div>
  );
};

export default FinancialKPICard;
