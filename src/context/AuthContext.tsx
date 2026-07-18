import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, PlanType, Entitlements, PLAN_ENTITLEMENTS, FeatureKey } from "../plans/subscription";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import { clientFetch } from "../utils/clientFetch";

export interface EntitlementPayload {
  userId: string;
  email: string;
  plan: PlanType;
  status: string;
  features: Record<FeatureKey, boolean>;
  limits: {
    "analysis.daily": number;
    "analysis.monthly": number;
    "cloud_history.saved": number;
    "exports.monthly": number;
    "premium_scenarios.monthly": number;
  };
  usage: {
    analysesToday: number;
    packCreditsRemaining: number;
  };
  mockPaymentsAllowed?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  entitlements: EntitlementPayload | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUserPlan: (plan: PlanType) => void;
  refreshEntitlements: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementPayload | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const getMockEntitlements = (usr: UserProfile | null): EntitlementPayload | null => {
    if (!usr) return null;
    const planEnts = PLAN_ENTITLEMENTS[usr.plan];
    return {
      userId: usr.id,
      email: usr.email,
      plan: usr.plan,
      status: "ACTIVE",
      features: planEnts.features,
      limits: planEnts.limits,
      usage: {
        analysesToday: 0,
        packCreditsRemaining: 0
      }
    };
  };

  const fetchEntitlements = async (authToken: string | null, currentUser: UserProfile | null) => {
    if (!isSupabaseConfigured() || !authToken) {
      setEntitlements(getMockEntitlements(currentUser));
      return;
    }

    try {
      const response = await clientFetch("/api/entitlements", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEntitlements(data);
      } else {
        setEntitlements(getMockEntitlements(currentUser));
      }
    } catch (err) {
      console.error("Error fetching entitlements:", err);
      setEntitlements(getMockEntitlements(currentUser));
    }
  };

  const fetchUserProfile = async (userId: string, authToken: string | null) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (profile) {
        const usrProfile: UserProfile = {
          id: profile.id,
          email: profile.email,
          plan: profile.plan as PlanType,
          createdAt: profile.created_at,
        };
        setUser(usrProfile);
        fetchEntitlements(authToken, usrProfile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const refreshEntitlements = async () => {
    await fetchEntitlements(token, user);
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          fetchUserProfile(session.user.id, session.access_token).finally(() => {
            setIsInitializing(false);
          });
        } else {
          setIsInitializing(false);
        }
      });

      // Listen to auth events
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          setToken(session.access_token);
          await fetchUserProfile(session.user.id, session.access_token);
        } else {
          setToken(null);
          setUser(null);
          setEntitlements(null);
        }
        setIsInitializing(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedToken = localStorage.getItem("dogesh_auth_token");
      const savedUser = localStorage.getItem("dogesh_mock_user");
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setEntitlements(getMockEntitlements(parsedUser));
      }
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (token) {
        refreshEntitlements();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, user]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("dogesh_auth_token", newToken);
    if (!isSupabaseConfigured()) {
      localStorage.setItem("dogesh_mock_user", JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
    fetchEntitlements(newToken, newUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("dogesh_auth_token");
    localStorage.removeItem("dogesh_mock_user");
    setToken(null);
    setUser(null);
    setEntitlements(null);
  };

  const updateUserPlan = async (plan: PlanType) => {
    if (user) {
      if (isSupabaseConfigured()) {
        await fetchUserProfile(user.id, token);
      } else {
        const updatedUser = { ...user, plan };
        localStorage.setItem("dogesh_mock_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEntitlements(getMockEntitlements(updatedUser));
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
        <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold tracking-tight">Initializing Signal...</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            Connecting to secure gateway. Render servers may take up to a minute to wake up on cold starts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, entitlements, login, logout, updateUserPlan, refreshEntitlements }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

