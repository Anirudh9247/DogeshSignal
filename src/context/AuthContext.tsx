import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, PlanType } from "../plans/subscription";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUserPlan: (plan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          plan: profile.plan as PlanType,
          createdAt: profile.created_at,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          fetchUserProfile(session.user.id).finally(() => {
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
          await fetchUserProfile(session.user.id);
        } else {
          setToken(null);
          setUser(null);
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
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setIsInitializing(false);
    }
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("dogesh_auth_token", newToken);
    if (!isSupabaseConfigured()) {
      localStorage.setItem("dogesh_mock_user", JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("dogesh_auth_token");
    localStorage.removeItem("dogesh_mock_user");
    setToken(null);
    setUser(null);
  };

  const updateUserPlan = async (plan: PlanType) => {
    if (user) {
      if (isSupabaseConfigured()) {
        await fetchUserProfile(user.id);
      } else {
        const updatedUser = { ...user, plan };
        localStorage.setItem("dogesh_mock_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    }
  };

  if (isInitializing) {
    return null; // Prevent flash of login screen during initialization
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUserPlan }}>
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

