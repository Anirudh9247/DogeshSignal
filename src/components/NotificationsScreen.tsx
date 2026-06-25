import React from "react";
import { 
  Bell, 
  Trash2, 
  Clock, 
  X, 
  AlertTriangle, 
  Info, 
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { SystemNotification } from "../types";

interface NotificationsScreenProps {
  theme: "light" | "dark";
  notifications: SystemNotification[];
  markAllRead: () => void;
  dismissNotif: (id: string) => void;
  clearAllNotifs: () => void;
}

export function NotificationsScreen({
  theme,
  notifications,
  markAllRead,
  dismissNotif,
  clearAllNotifs
}: NotificationsScreenProps) {
  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl"
    : "bg-white border border-slate-200 shadow-md";
  const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const mutedClass = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const labelClass = "text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase";

  // Strict 3-level Urgency Mapping
  const getUrgencyStyles = (severity: string) => {
    const sev = (severity || "").toUpperCase();
    if (sev === "CRITICAL") {
      return {
        border: "border-l-4 border-l-rose-500 border-rose-500/10 dark:border-rose-500/20",
        icon: <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />,
        bgColor: "bg-rose-500/5",
        label: "Critical"
      };
    } else if (sev === "WARNING" || sev === "HIGH" || sev === "MEDIUM") {
      return {
        border: "border-l-4 border-l-amber-500 border-amber-500/10 dark:border-amber-500/20",
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        bgColor: "bg-amber-500/5",
        label: "Warning"
      };
    } else {
      return {
        border: "border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800",
        icon: <Info className="w-4 h-4 text-slate-400" />,
        bgColor: "bg-slate-500/5",
        label: "Info"
      };
    }
  };

  return (
    <div className="space-y-6 my-2 text-left" id="notifications_screen_view">
      
      {/* Premium Informational Hint Banner */}
      <div className={`p-4 rounded-xl flex items-start gap-3 border ${
        theme === "dark" ? "bg-orange-950/10 border-orange-500/10" : "bg-orange-50/50 border-orange-200/50"
      }`}>
        <HelpCircle className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
          <strong>Privacy Hint:</strong> All notifications are saved locally on this browser and are completely private by default.
        </p>
      </div>

      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight ${titleClass}`}>Notifications</h2>
          <p className={`text-xs ${mutedClass} mt-1`}>
            Stay informed with recent analysis alerts and boundary guidelines.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 hover:bg-slate-500/5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 transition-all cursor-pointer text-slate-650 dark:text-slate-300 font-mono text-[10.5px]"
            >
              Mark all read
            </button>
            <button
              onClick={clearAllNotifs}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-505/15 text-rose-500 rounded-xl text-xs font-bold tracking-wide border border-rose-500/10 transition-all cursor-pointer font-mono text-[10.5px]"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-5 ${bgCardClass}`} id="notifications_empty_state">
          <div className="relative flex items-center justify-center my-3">
            <span className="absolute inset-0 rounded-full bg-orange-500/5 scale-[2.2] animate-ping opacity-25 pointer-events-none" />
            <span className="absolute inset-2 rounded-full bg-amber-500/5 scale-[1.5] animate-pulse opacity-30 pointer-events-none" />
            <Bell className="w-10 h-10 text-orange-500/80 relative" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className={`font-extrabold text-sm ${titleClass}`}>No new notifications</h3>
            <p className={`text-xs ${mutedClass} leading-relaxed`}>
              You are beautifully clear. No safety advisories, feature releases, or critical warnings are waiting for your attention.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              🛡️ All clear
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-3.5" id="notifications_list_feed">
          {notifications.map((notif) => {
            const urgency = getUrgencyStyles(notif.severity);
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-xl border relative group transition-all text-left flex gap-3.5 items-start ${bgCardClass} ${urgency.border} ${
                  notif.isRead ? "opacity-60" : "shadow-xs border-orange-500/10"
                }`}
              >
                {/* Visual indicator / icon based on urgency level */}
                <div className={`p-2 rounded-xl ${urgency.bgColor} shrink-0`}>
                  {urgency.icon}
                </div>

                {/* Notification Info */}
                <div className="flex-grow min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-orange-500">
                      [{urgency.label}] • {notif.category}
                    </span>
                    
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-mono whitespace-nowrap">{notif.time}</span>
                    </div>
                  </div>

                  <h4 className={`font-extrabold text-xs leading-snug tracking-tight pr-6 ${titleClass}`}>
                    {notif.title}
                  </h4>
                  <p className={`text-[11.5px] leading-relaxed font-sans mt-0.5 ${mutedClass}`}>
                    {notif.description}
                  </p>
                </div>

                {/* Dismiss Action */}
                <button
                  onClick={() => dismissNotif(notif.id)}
                  className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
