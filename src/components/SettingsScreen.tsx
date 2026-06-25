import React, { useState } from "react";
import { 
  Sliders, 
  Trash2, 
  Info, 
  CheckCircle, 
  EyeOff, 
  Bell, 
  ShieldCheck 
} from "lucide-react";

interface SettingsScreenProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  textSize: "sm" | "md" | "lg";
  setTextSize: (size: "sm" | "md" | "lg") => void;
  onClearHistory: () => void;
}

export function SettingsScreen({
  theme,
  toggleTheme,
  textSize,
  setTextSize,
  onClearHistory
}: SettingsScreenProps) {
  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl"
    : "bg-white border border-slate-200 shadow-md";
  const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const mutedClass = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const labelClass = "text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase";

  // Notification Preferences State (simulated on-device state)
  const [allowSoundAlerts, setAllowSoundAlerts] = useState(true);
  const [allowCriticalAdvisories, setAllowCriticalAdvisories] = useState(true);
  const [allowWeeklyDigest, setAllowWeeklyDigest] = useState(false);

  return (
    <div className="space-y-6 my-2 text-left" id="settings_screen_container">
      
      {/* Customization Privacy Hint Banner */}
      <div className={`p-4 rounded-xl flex items-start gap-3 border ${
        theme === "dark" ? "bg-orange-950/10 border-orange-500/10" : "bg-orange-50/50 border-orange-200/50"
      }`}>
        <Sliders className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
          <strong>Privacy Hint:</strong> Change settings to fit your preferences. Your choices are saved in real-time.
        </p>
      </div>

      {/* Header block with helper caption */}
      <div className="border-b border-slate-100 dark:border-slate-900 pb-5">
        <h2 className={`text-xl font-extrabold tracking-tight ${titleClass}`}>Settings & Preferences</h2>
        <p className={`text-xs ${mutedClass} mt-1`}>
          Choose the view and notification style that feels best for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="settings_panel_view">
      
      {/* LEFT COLUMN: PREFERENCES & ACTIONS */}
      <div className="lg:col-span-6 space-y-6">

        {/* Default Settings Status Card */}
        <div className={`p-6 rounded-2xl space-y-4 ${bgCardClass}`} id="settings_preset_default_status">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-150 dark:border-slate-800">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-800 dark:text-slate-205">
              Analysis settings
            </h3>
          </div>
          <div className="space-y-1.5 text-left">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Default settings active</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
              You are running our standard settings, which analyze messages for pressure, vague commitments, and general risk levels.
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-900/40 flex justify-between items-center">
            <span className="text-[9.5px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Standard check active
            </span>
            <button
              onClick={() => {
                setAllowSoundAlerts(true);
                setAllowCriticalAdvisories(true);
                setAllowWeeklyDigest(false);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg font-mono text-[9.5px] uppercase font-bold text-slate-650 dark:text-slate-255 cursor-pointer"
            >
              Reset to defaults
            </button>
          </div>
        </div>
        
        {/* Preference Card: Theme & Typography */}
        <div className={`p-6 rounded-2xl space-y-5 ${bgCardClass}`}>
          
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-150 dark:border-slate-800">
            <Sliders className="w-4.5 h-4.5 text-orange-500" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-800 dark:text-slate-205">
              Personal Preferences
            </h3>
          </div>

          {/* Theme Selector */}
          <div className="flex justify-between items-center py-1">
            <div>
              <h4 className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">Color appearance</h4>
              <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Choose between light and dark appearance.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`px-3.5 py-2 text-[10px] font-mono font-black rounded-lg border transition-all cursor-pointer uppercase ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-850 text-orange-400"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              System: {theme}
            </button>
          </div>

          {/* Text size selection */}
          <div className="flex justify-between items-center py-2.5 border-t border-slate-100 dark:border-slate-900/60">
            <div>
              <h4 className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">Text size scale</h4>
              <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Adjust text size for comfortable readability.</p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-905 font-mono text-[9px] font-bold h-fit shrink-0 select-none">
              {(["sm", "md", "lg"] as const).map((size) => {
                const isActive = textSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase ${
                      isActive 
                        ? "bg-white dark:bg-slate-900 text-orange-500 dark:text-orange-400 border border-slate-200 dark:border-slate-800 shadow-xs" 
                        : "text-slate-400 hover:text-slate-550 dark:hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className={`p-6 rounded-2xl space-y-4.5 ${bgCardClass}`} id="notif_pref_card">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-150 dark:border-slate-800">
            <Bell className="w-4.5 h-4.5 text-orange-500" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-800 dark:text-slate-205">
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            
            {/* Toggle 1 */}
            <div className="flex justify-between items-center py-0.5">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sounds</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Play a sound when a high risk level is found.</p>
              </div>
              <button
                onClick={() => setAllowSoundAlerts(!allowSoundAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                  allowSoundAlerts ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  allowSoundAlerts ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex justify-between items-center py-2.5 border-t border-slate-105 dark:border-slate-900/60">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Advisory notices</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Show notifications for system updates or new safety tips.</p>
              </div>
              <button
                onClick={() => setAllowCriticalAdvisories(!allowCriticalAdvisories)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                  allowCriticalAdvisories ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  allowCriticalAdvisories ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex justify-between items-center py-2.5 border-t border-slate-105 dark:border-slate-900/60">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly tips</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Get a brief weekly list of common pressure patterns.</p>
              </div>
              <button
                onClick={() => setAllowWeeklyDigest(!allowWeeklyDigest)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                  allowWeeklyDigest ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  allowWeeklyDigest ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Database Clear Actions */}
        <div className={`p-6 rounded-2xl space-y-4 ${bgCardClass}`}>
          
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200/10 dark:border-slate-800">
            <Trash2 className="w-4.5 h-4.5 text-rose-500" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-805 dark:text-slate-205">
              Clear data
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205">Clear history</h4>
              <p className="text-[10.5px] text-slate-400 mt-1 font-sans leading-normal">
                Permanently delete all analyzed messages and history stored on this browser.
              </p>
            </div>

            <button
              onClick={onClearHistory}
              className="px-4 py-2.5 bg-rose-505/10 hover:bg-rose-500/15 text-rose-500 hover:text-rose-600 rounded-xl text-xs font-mono font-bold transition-all border border-rose-500/10 cursor-pointer text-center w-full sm:w-auto shrink-0"
              id="clear_history_settings_trigger"
            >
              CLEAR ALL HISTORY
            </button>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: EXPLANATIONS & PRIVACY CODES */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* How scoring works - explanation */}
        <div className={`p-6 rounded-2xl space-y-4.5 ${bgCardClass}`}>
          
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-150 dark:border-slate-800">
            <Info className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-800 dark:text-slate-205 font-mono">
              How risk levels work
            </h3>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
            Our analysis looks for simple patterns in conversational style to help you review a message:
          </p>

          <div className="space-y-4.5 font-medium text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="flex gap-2.5 items-start text-left">
              <span className="text-orange-500 font-mono font-bold">[1]</span>
              <div>
                <strong className={titleClass}>Pressure patterns</strong>
                <p className="text-[10.5px] text-slate-400 font-normal font-sans mt-0.5">Flags messages designed to pressure you or make you feel guilty.</p>
              </div>
            </div>
            
            <div className="flex gap-2.5 items-start text-left border-t border-slate-100 dark:border-slate-900/60 pt-3">
              <span className="text-orange-500 font-mono font-bold">[2]</span>
              <div>
                <strong className={titleClass}>Urgency cues</strong>
                <p className="text-[10.5px] text-slate-400 font-normal font-sans mt-0.5">Flags artificial deadlines that demand an instant answer.</p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start text-left border-t border-slate-100 dark:border-slate-900/60 pt-3">
              <span className="text-orange-500 font-mono font-bold">[3]</span>
              <div>
                <strong className={titleClass}>Commitment check</strong>
                <p className="text-[10.5px] text-slate-400 font-normal font-sans mt-0.5">Highlights vague agreements where responsibilities aren't clear.</p>
              </div>
            </div>
          </div>

          <p className="text-[10.5px] text-slate-405 dark:text-slate-550 italic pt-2 font-sans border-t border-slate-100 dark:border-slate-900 leading-normal">
            *Note: The risk level is for reference only. Use your own best judgment in all decisions.
          </p>

        </div>

        {/* Privacy trust Information */}
        <div className={`p-6 rounded-2xl space-y-4 ${bgCardClass}`} id="privacy_vows_card">
          
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-150 dark:border-slate-855">
            <EyeOff className="w-4.5 h-4.5 text-emerald-500" />
            <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-805 dark:text-slate-205">
              Privacy
            </h3>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
            Your privacy is private by default:
          </p>

          <div className="space-y-3 font-sans text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Private and secure message transit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Messages are processed and analyzed, never saved on external servers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Analysis history is saved only in your own browser's local memory</span>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
);
}
