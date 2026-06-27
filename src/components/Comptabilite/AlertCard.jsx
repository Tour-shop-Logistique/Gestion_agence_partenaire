const AlertCard = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-bold text-emerald-700">Tout est en ordre !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Alertes Comptables</h2>
        <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, idx) => {
          const AlertIcon = alert.icon;
          const bgColor = alert.type === 'danger' ? 'bg-red-50' : alert.type === 'warning' ? 'bg-orange-50' : 'bg-blue-50';
          const borderColor = alert.type === 'danger' ? 'border-red-200' : alert.type === 'warning' ? 'border-orange-200' : 'border-blue-200';
          const textColor = alert.type === 'danger' ? 'text-red-700' : alert.type === 'warning' ? 'text-orange-700' : 'text-blue-700';
          const iconColor = alert.type === 'danger' ? 'text-red-600' : alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600';

          return (
            <div key={idx} className={`${bgColor} ${borderColor} border rounded-lg p-3 flex items-center gap-3`}>
              <AlertIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${textColor}`}>{alert.message}</p>
              </div>
              <p className={`text-xs font-bold ${textColor} whitespace-nowrap`}>{alert.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertCard;
