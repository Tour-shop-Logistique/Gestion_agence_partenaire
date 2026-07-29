import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, Package, AlertTriangle, CheckCircle2, Megaphone } from "lucide-react";
import {
  selectNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../store/slices/notificationsSlice";
import {
  selectInAppNotifications,
  notificationRead,
  allNotificationsRead,
} from "../store/slices/inAppNotificationsSlice";

const ICONS_BY_ACTION = {
  assigned: Package,
  received_by_backoffice: Package,
  blocked: AlertTriangle,
  unblocked: CheckCircle2,
};

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const announcements = useSelector(selectNotifications);
  const inAppNotifications = useSelector(selectInAppNotifications);

  const merged = useMemo(() => {
    const fromAnnouncements = announcements.map((a) => ({
      id: a.id,
      source: "announcement",
      title: a.titre,
      message: a.message,
      read: a.lu,
      createdAt: a.date,
      link: "/notifications",
      icon: Megaphone,
    }));
    const fromInApp = inAppNotifications.map((n) => ({
      id: n.id,
      source: "inapp",
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      link: n.link,
      icon: ICONS_BY_ACTION[n.action] || Bell,
    }));
    return [...fromAnnouncements, ...fromInApp].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [announcements, inAppNotifications]);

  const handleRowClick = (item) => {
    if (!item.read) {
      if (item.source === "announcement") {
        dispatch(markNotificationAsRead(item.id));
      } else {
        dispatch(notificationRead(item.id));
      }
    }
    onClose?.();
    if (item.link) navigate(item.link);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
    dispatch(allNotificationsRead());
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        {merged.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {merged.length === 0 ? (
          <div className="py-10 text-center px-4">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Aucune notification pour le moment</p>
          </div>
        ) : (
          merged.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.source}-${item.id}`}
                onClick={() => handleRowClick(item)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  !item.read ? "bg-indigo-50/50" : ""
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">{item.title}</span>
                    {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">{item.message}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">{timeAgo(item.createdAt)}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
