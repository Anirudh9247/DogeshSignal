import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DogeshLogo } from "./BrandSystem";
import { 
  Sun, 
  Moon, 
  Menu, 
  X,
  Bell,
  Clock,
  Settings,
  Shield,
  Layers
} from "lucide-react";
import { SystemNotification } from "../types";

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  notifications: SystemNotification[];
  markAllRead: () => void;
  dismissNotif: (id: string) => void;
  clearAllNotifs: () => void;
  onScanCTA: () => void;
  isAlreadyOnScanScreen: boolean;
}

export function Navbar({
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
  notifications,
  onScanCTA,
  isAlreadyOnScanScreen
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Grouped logically: Marketing/Discover links vs Core Utility App Tasks
  const marketingTabs = [
    { id: "landing", label: "Product" },
    { id: "how-it-works", label: "How it works" }
  ];

  const appTabs = [
    { id: "workspace", label: "Analyze message" },
    { id: "history", label: "History" },
    { id: "notifications", label: "Notifications" },
    { id: "settings", label: "Settings" }
  ];

  const textTitleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const bgCardClass = theme === "dark"
    ? "bg-slate-900/70 border-slate-800/80"
    : "bg-white border-slate-200 shadow-sm";

  return (
    <header 
      className={`sticky top-0 z-40 transition-colors duration-255 border-b ${
        theme === "dark" 
          ? "bg-slate-950/80 border-slate-900/60 text-slate-100" 
          : "bg-white/95 border-slate-150 text-slate-900 shadow-3xs"
      } backdrop-blur-md`}
      id="app_header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => {
            setActiveTab("landing");
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="nav_brand"
        >
          <div className="w-8.5 h-8.5 rounded-lg bg-orange-500 flex items-center justify-center shadow-xs group-hover:scale-[1.03] transition-all">
            <DogeshLogo className="w-6.5 h-6.5" animate={unreadCount > 0} />
          </div>
          <div className="text-left">
            <span className={`font-sans font-extrabold tracking-tight text-sm sm:text-base leading-none block ${textTitleClass}`}>
              Dogesh Signal
            </span>
            <span className="text-[10px] font-sans font-bold tracking-wider text-orange-500 dark:text-orange-400 block leading-none mt-1 uppercase">
              Instinct Radar
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          
          {/* Discover/Marketing block links */}
          <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-5">
            {marketingTabs.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer py-1 block ${
                    isActive
                      ? "text-orange-500 font-bold"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Primary Utility Tabs */}
          <nav className="flex items-center gap-2">
            {appTabs.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border relative ${
                    isActive
                      ? theme === "dark"
                        ? "bg-slate-900 text-orange-500 border-orange-500/20"
                        : "bg-slate-100 text-slate-950 border-slate-200 shadow-3xs"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === "notifications" && (
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 450, damping: 20 }}
                          className="bg-rose-500 text-white rounded-full text-[8.5px] font-mono px-1.5 py-0.5 font-bold shrink-0 inline-block"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Right utility panel */}
        <div className="flex items-center gap-2.5">
          
          {/* Primary CTA button matching Solid Signal Orange style list rules */}
          {!isAlreadyOnScanScreen && (
            <button
              onClick={() => {
                onScanCTA();
                setIsMobileMenuOpen(false);
              }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-sans font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer border-none"
              id="nav_cta_scan_message"
            >
              <span>Analyze message</span>
            </button>
          )}

          {/* Theme Toggle option */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-850" 
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-3xs"
            }`}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
            id="theme_controller"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Secure indicator light */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">Local</span>
          </div>

          {/* Mobile Nav Trigger (Enlarged tap targets, beautiful vector) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl border cursor-pointer flex items-center justify-center ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-650 shadow-3xs"
            }`}
            id="mobile_menu_trigger"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* 2. MOBILE NAVIGATION DROP-DOWN (Large targets, direct plain English) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
            } px-4 py-5 space-y-4`}
            id="mobile_nav_container"
          >
            {/* Saliant Primary action at top of mobile dropdown */}
            {!isAlreadyOnScanScreen && (
              <button
                onClick={() => {
                  onScanCTA();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-450 text-slate-950 font-bold font-mono text-xs uppercase tracking-widest rounded-xl shadow-md text-center flex items-center justify-center gap-2 border-none transition-colors"
              >
                <span>Analyze message</span>
              </button>
            )}

            {/* Structured responsive links */}
            <div className="space-y-1.5">
              
              <span className="text-[8.5px] font-mono font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block pl-3 pb-1 pt-2">
                Discover
              </span>
              {marketingTabs.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-900 text-orange-500 font-extrabold border border-slate-200 dark:border-slate-800"
                        : "text-slate-400 hover:bg-slate-500/5"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              <span className="text-[8.5px] font-mono font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block pl-3 pb-1 pt-3">
                Core App Tools
              </span>
              {appTabs.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-orange-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-400 hover:bg-slate-500/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.id === "notifications" && unreadCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black ${
                        isActive ? "bg-slate-950 text-orange-500" : "bg-rose-500 text-white"
                      }`}>
                        {unreadCount} NEW
                      </span>
                    )}
                  </button>
                );
              })}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
