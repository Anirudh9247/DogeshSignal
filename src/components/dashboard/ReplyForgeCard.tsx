import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, Copy } from "lucide-react";
import { AnalysisResult } from "../../types/analysis";
import toast from "react-hot-toast";

interface ReplyForgeCardProps {
  theme: "light" | "dark";
  result: AnalysisResult;
  advancedRepliesAllowed: boolean;
}

export function ReplyForgeCard({
  theme,
  result,
  advancedRepliesAllowed
}: ReplyForgeCardProps) {
  const [activeReplyTone, setActiveReplyTone] = useState<"Professional" | "Direct" | "Supportive">("Professional");
  const [editedReplyText, setEditedReplyText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const repliesMap = {
    Professional: result.replies?.professional,
    Direct: result.replies?.bold,
    Supportive: result.replies?.supportive
  };

  useEffect(() => {
    if (result) {
      setEditedReplyText(repliesMap[activeReplyTone] || "");
    }
  }, [activeReplyTone, result]);

  const handleCopyReplyText = (text: string, tone: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(tone);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl transition-all duration-200"
    : "bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md";

  return (
    <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4 relative overflow-hidden`} id="card_suggested_reply">
      {!advancedRepliesAllowed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <span className="text-3xl mb-2">🔒</span>
          <h4 className="text-sm font-sans font-extrabold text-slate-100 tracking-wide uppercase">
            Suggested Replies Locked
          </h4>
          <p className="text-[11px] text-slate-400 max-w-xs mt-1.5 leading-relaxed">
            Unlock professional, bold, and supportive response suggestions to protect your boundaries.
          </p>
          <button
            onClick={() => {
              toast("Please navigate to Settings & Preferences to upgrade your plan!");
            }}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-650 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-lg border-none cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Suggested reply
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-sans font-semibold">Editable draft</span>
      </div>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
        Choose a tone, then edit the reply to fit your situation.
      </p>

      {/* Tone option tabs */}
      <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 font-sans text-xs select-none flex">
        {(["Professional", "Direct", "Supportive"] as const).map((tone) => {
          const isActive = activeReplyTone === tone;
          return (
            <button
              key={tone}
              onClick={() => setActiveReplyTone(tone)}
              className={`flex-grow text-center py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-xs font-semibold ${
                isActive 
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800 shadow-3xs" 
                  : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tone}
            </button>
          );
        })}
      </div>

      {/* Editable Text Area */}
      <div className={`p-4 rounded-xl border space-y-4 relative ${
        theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
      }`}>
        <textarea
          value={editedReplyText}
          onChange={(e) => setEditedReplyText(e.target.value)}
          className={`w-full min-h-[110px] rounded-xl border p-3.5 text-xs outline-none focus:border-orange-500/50 transition-all font-sans leading-relaxed resize-y ${
            theme === "dark" 
              ? "bg-slate-950/40 border-slate-855 text-slate-200 focus:bg-slate-950" 
              : "bg-white border-slate-250 text-slate-800 focus:bg-white"
          }`}
          placeholder="Choose a tone above..."
        />

        {/* Customization Helpers */}
        <div className="flex flex-wrap gap-1.5 pt-1.5 select-none font-sans">
          <button
            onClick={() => setEditedReplyText(prev => prev + "\n\nBest regards,\n[Your Name]")}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            + Add Signature
          </button>
          <button
            onClick={() => {
              const sentences = editedReplyText.split(". ");
              if (sentences.length > 2) {
                setEditedReplyText(sentences.slice(0, 2).join(". ") + (sentences[1].endsWith(".") ? "" : "."));
              }
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            ⚡ Make Shorter
          </button>
          <button
            onClick={() => setEditedReplyText(prev => prev + "\n\nLet me know if we can schedule a quick call to align on this.")}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            📅 Ask for Call
          </button>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-900/60 font-sans">
          <button
            onClick={() => handleCopyReplyText(editedReplyText, activeReplyTone)}
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-655 text-slate-950 font-sans font-semibold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 border-none shadow-sm"
          >
            {copiedKey === activeReplyTone ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-950" />
                <span>Copy reply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
