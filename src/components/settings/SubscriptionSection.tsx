import React, { useState } from "react";
import { CreditCard, LogOut } from "lucide-react";
import { PlanType, UserProfile, PLAN_ENTITLEMENTS, PLAN_IDS, PLAN_AMOUNTS } from "../../plans/subscription";
import toast from "react-hot-toast";

interface SubscriptionSectionProps {
  theme: "light" | "dark";
  user: UserProfile | null;
  onUpgradePlan: (plan: PlanType) => void;
  onLogout: () => void;
  token: string | null;
}

export function SubscriptionSection({
  theme,
  user,
  onUpgradePlan,
  onLogout,
  token
}: SubscriptionSectionProps) {
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  if (!user) return null;

  const activePlan = user.plan;
  const entitlements = PLAN_ENTITLEMENTS[activePlan];

  const handleUpgrade = async (tier: "guard" | "shield", cycle: "monthly" | "yearly") => {
    setIsSimulatingPayment(true);
    const targetPlan = (tier === "guard"
      ? (cycle === "monthly" ? PlanType.GUARD_MONTHLY : PlanType.GUARD_ANNUAL)
      : (cycle === "monthly" ? PlanType.SHIELD_MONTHLY : PlanType.SHIELD_ANNUAL)) as PlanType;
    try {
      const response = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: targetPlan,
          interval: cycle
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to initialize subscription checkout.");
      }

      const orderData = await response.json();
      
      const options = {
        key: orderData.keyId,
        subscription_id: orderData.subscriptionId,
        name: "Dogesh Signal",
        description: `${targetPlan.toUpperCase()} Plan Subscription`,
        image: "https://ai.google.dev/static/site-assets/images/share-ais-513315318.png",
        handler: async function (checkoutResponse: any) {
          setIsSimulatingPayment(true);
          try {
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: checkoutResponse.razorpay_payment_id,
                razorpay_subscription_id: checkoutResponse.razorpay_subscription_id,
                razorpay_signature: checkoutResponse.razorpay_signature,
                planType: targetPlan
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success(`${targetPlan.toUpperCase()} subscription activated successfully!`);
              onUpgradePlan(targetPlan);
            } else {
              toast.error(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification failed:", err);
            toast.error("An error occurred during verification.");
          } finally {
            setIsSimulatingPayment(false);
          }
        },
        prefill: {
          email: user.email
        },
        theme: {
          color: "#F97316"
        },
        modal: {
          ondismiss: function () {
            setIsSimulatingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Upgrade checkout failed:", err);
      toast.error(err?.message || "Failed to initialize payment checkout.");
      setIsSimulatingPayment(false);
    }
  };

  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl"
    : "bg-white border border-slate-200 shadow-md";

  return (
    <div className={`p-6 rounded-2xl space-y-4.5 ${bgCardClass}`} id="cloud_sync_sub_card">
      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-200 dark:border-slate-800">
        <CreditCard className="w-4.5 h-4.5 text-orange-500" />
        <h3 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-850 dark:text-slate-200">
          Cloud Sync & Subscription
        </h3>
      </div>

      <div className="space-y-4 text-left">
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Account:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Subscription:</span>
            <span className="font-bold text-orange-500 uppercase font-mono">{user.plan}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Profile ID:</span>
            <span className="font-mono text-[9px] text-slate-400 truncate max-w-[150px]">{user.id}</span>
          </div>
        </div>

        {user.plan !== PlanType.SHIELD_MONTHLY && user.plan !== PlanType.SHIELD_ANNUAL && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-900/60 space-y-2.5">
            <div className="flex justify-between items-center pb-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Upgrade Subscription
              </span>
              <div className="p-0.5 bg-slate-200 dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-850 flex select-none">
                {(["monthly", "yearly"] as const).map((cycle) => {
                  const isActive = billingCycle === cycle;
                  return (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`px-2 py-0.5 rounded-md transition-all text-[8px] font-mono uppercase font-bold cursor-pointer border-none ${
                        isActive
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-transparent"
                      }`}
                    >
                      {cycle}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {isSimulatingPayment ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col items-center justify-center space-y-2 text-center">
                <span className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Connecting to Razorpay...
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {user.plan === PlanType.SNIFF && (
                  <button
                    onClick={() => handleUpgrade("guard", billingCycle)}
                    className="flex-grow py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-955 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                    <span>Guard ({billingCycle === "monthly" ? `USD ${(PLAN_AMOUNTS[PlanType.GUARD_MONTHLY] / 100).toFixed(2)}/mo` : `USD ${(PLAN_AMOUNTS[PlanType.GUARD_ANNUAL] / 100).toFixed(2)}/yr`})</span>
                  </button>
                )}
                <button
                  onClick={() => handleUpgrade("shield", billingCycle)}
                  className="flex-grow py-2 px-3 bg-orange-500 hover:bg-orange-450 text-slate-950 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                  <span>Shield ({billingCycle === "monthly" ? `USD ${(PLAN_AMOUNTS[PlanType.SHIELD_MONTHLY] / 100).toFixed(2)}/mo` : `USD ${(PLAN_AMOUNTS[PlanType.SHIELD_ANNUAL] / 100).toFixed(2)}/yr`})</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-900/60 flex justify-between items-center">
          {entitlements.features["history.cloud"] ? (
            <span className="text-[9.5px] font-mono text-emerald-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud active
            </span>
          ) : (
            <span className="text-[9.5px] font-mono text-amber-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5 select-none">
              🔒 Local active
            </span>
          )}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 rounded-lg font-mono text-[9.5px] uppercase font-bold border border-rose-500/10 cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
