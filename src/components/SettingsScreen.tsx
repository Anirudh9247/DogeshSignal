import React from "react";
import { Sliders } from "lucide-react";
import { PlanType, UserProfile } from "../plans/subscription";
import { useAuth } from "../context/AuthContext";
import { AccountSection } from "./settings/AccountSection";
import { SubscriptionSection } from "./settings/SubscriptionSection";
import { PreferencesSection } from "./settings/PreferencesSection";

interface SettingsScreenProps {
  theme: "light" | "dark" | "system";
  toggleTheme: () => void;
  textSize: "sm" | "md" | "lg";
  setTextSize: (size: "sm" | "md" | "lg") => void;
  onClearHistory: () => void;
  user: UserProfile | null;
  onLogin: (email: string, password?: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password?: string) => Promise<boolean>;
  onLogout: () => void;
  onUpgradePlan: (plan: PlanType) => void;
  localHistoryCount: number;
  onImportHistory: () => void;
  onSkipImport: () => void;
  usageCount: number;
  usageLimit: number;
  showImportPrompt: boolean;
}

export function SettingsScreen({
  theme,
  toggleTheme,
  textSize,
  setTextSize,
  onClearHistory,
  user,
  onLogout,
  onUpgradePlan,
  localHistoryCount,
  onImportHistory,
  onSkipImport,
  usageCount,
  usageLimit,
  showImportPrompt
}: SettingsScreenProps) {
  const { token } = useAuth();

  const titleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const mutedClass = theme === "dark" ? "text-slate-400" : "text-slate-500";

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
      <div className="border-b border-slate-150 dark:border-slate-900 pb-5">
        <h2 className={`text-xl font-extrabold tracking-tight ${titleClass}`}>Settings & Preferences</h2>
        <p className={`text-xs ${mutedClass} mt-1`}>
          Choose the view and notification style that feels best for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="settings_panel_view">
        
        {/* LEFT COLUMN: PREFERENCES & ACTIONS */}
        <div className="lg:col-span-6 space-y-6">
          <PreferencesSection
            theme={theme}
            toggleTheme={toggleTheme}
            textSize={textSize}
            setTextSize={setTextSize}
            onClearHistory={onClearHistory}
          />
        </div>

        {/* RIGHT COLUMN: ACCOUNT & BILLING STATUS */}
        <div className="lg:col-span-6 space-y-6" id="settings_status_hub">
          <AccountSection
            theme={theme === "system" ? "dark" : theme}
            user={user}
            usageCount={usageCount}
            usageLimit={usageLimit}
            localHistoryCount={localHistoryCount}
            showImportPrompt={showImportPrompt}
            onImportHistory={onImportHistory}
            onSkipImport={onSkipImport}
          />

          {user && (
            <SubscriptionSection
              theme={theme === "system" ? "dark" : theme}
              user={user}
              onUpgradePlan={onUpgradePlan}
              onLogout={onLogout}
              token={token}
            />
          )}
        </div>

      </div>
    </div>
  );
}
