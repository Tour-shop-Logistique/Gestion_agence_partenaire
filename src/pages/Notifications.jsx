import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Megaphone, CheckCheck, RefreshCw, Radio } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import soundNotification from "../utils/soundNotification";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  announcementReceived,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsStatus,
} from "../store/slices/notificationsSlice";

const Notifications = () => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const status = useSelector(selectNotificationsStatus);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Réception temps réel : le backoffice envoie une annonce, elle apparaît
  // immédiatement sans que l'agence ait besoin de rafraîchir la page.
  useWebSocket(currentUser?.agence_id, {
    onAnnouncementCreated: (data) => {
      dispatch(announcementReceived(data));
      showToast("📢 Nouvelle annonce du backoffice", "info");
      soundNotification.playSuccess();
    },
  });

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <div className="space-y-4 sm:space-y-8 max-w-[1600px] mx-auto px-3 sm:px-6 pb-6 sm:pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Annonces</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Communications officielles envoyées par le backoffice
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => dispatch(fetchNotifications())}
            disabled={status === "loading"}
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-2 ${status === "loading" ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>

        <div className="relative p-3 sm:p-4 space-y-3">
          {status === "loading" && notifications.length === 0 ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.lu && handleMarkAsRead(n.id)}
                className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden cursor-pointer active:scale-[0.99] ${
                  n.lu
                    ? "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    : "border-indigo-200 hover:border-indigo-300 hover:shadow-md ring-1 ring-indigo-100"
                }`}
              >
                <div className="p-3.5 flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      n.lu ? "bg-slate-50" : "bg-indigo-50"
                    }`}
                  >
                    <Megaphone className={`w-4 h-4 ${n.lu ? "text-slate-400" : "text-indigo-600"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.lu ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>
                        {n.titre}
                      </p>
                      {!n.lu && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-2">
                      {format(new Date(n.date), "dd MMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-xl text-center border border-slate-100">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Radio className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-sm font-bold text-slate-700">Aucune annonce pour le moment</p>
              <p className="text-xs text-slate-400 mt-1">
                Les communications du backoffice apparaîtront ici en temps réel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
