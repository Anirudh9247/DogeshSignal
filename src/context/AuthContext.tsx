import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, PlanType } from "../plans/plans";

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

  useEffect(() => {
    const savedToken = localStorage.getItem("dogesh_auth_token");
    const savedUser = localStorage.getItem("dogesh_mock_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("dogesh_auth_token", newToken);
    localStorage.setItem("dogesh_mock_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("dogesh_auth_token");
    localStorage.removeItem("dogesh_mock_user");
    setToken(null);
    setUser(null);
  };

  const updateUserPlan = (plan: PlanType) => {
    if (user) {
      const updatedUser = { ...user, plan };
      localStorage.setItem("dogesh_mock_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
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
