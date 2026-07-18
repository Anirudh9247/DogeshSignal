import { PlanType } from "../plans/subscription";
import { supabase, handleSupabaseCall } from "./supabaseClient";

export interface User {
  id: string;
  fullName: string;
  email: string;
  plan: PlanType;
}

export async function login(data: any) {
  const supabaseLogin = async () => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user || !authData.session) {
      throw new Error(error?.message || "Invalid Credentials");
    }

    // Fetch user profile from Supabase Database
    const { data: profile, error: dbErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (dbErr) throw dbErr;

    const userObj = {
      id: authData.user.id,
      email: authData.user.email || data.email,
      plan: (profile?.plan as PlanType) || PlanType.SNIFF,
      createdAt: profile?.created_at || new Date().toISOString(),
    };

    return {
      data: {
        token: authData.session.access_token,
        user: userObj,
      },
    };
  };

  const mockLogin = async () => {
    // Simulate network delay for mock auth
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem("dogesh_registered_users") || "[]");
    const found = users.find((u: any) => u.email === data.email && u.password === data.password);
    
    if (!found) {
      throw new Error("Invalid Credentials");
    }
    
    const userObj = {
      id: found.id,
      email: found.email,
      plan: found.plan || PlanType.SNIFF,
      createdAt: found.createdAt || new Date().toISOString()
    };
    
    return {
      data: {
        token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
        user: userObj
      }
    };
  };

  return handleSupabaseCall(supabaseLogin, mockLogin, "Login operation failed");
}

export async function register(data: any) {
  const supabaseRegister = async () => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error || !authData.user) {
      throw new Error(error?.message || "Registration Failed");
    }

    return {
      data: {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email || data.email,
          plan: PlanType.SNIFF,
        },
      },
    };
  };

  const mockRegister = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem("dogesh_registered_users") || "[]");
    if (users.some((u: any) => u.email === data.email)) {
      throw new Error("User already exists");
    }
    
    const newUser = {
      id: "usr-" + Date.now().toString().slice(-6),
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      plan: PlanType.SNIFF,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem("dogesh_registered_users", JSON.stringify(users));
    
    return {
      data: {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          plan: newUser.plan
        }
      }
    };
  };

  return handleSupabaseCall(supabaseRegister, mockRegister, "Registration operation failed");
}

export async function signInWithProvider(provider: "google" | "twitter" | "linkedin") {
  const supabaseOAuth = async () => {
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === "google" ? {
          access_type: "offline",
          prompt: "consent",
        } : undefined
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: {
        token: "",
        user: null as any
      }
    };
  };

  const mockOAuth = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser = {
      id: `usr-${provider}-${Date.now().toString().slice(-6)}`,
      fullName: `Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `mock.${provider}@example.com`,
      plan: PlanType.SNIFF,
      createdAt: new Date().toISOString()
    };
    
    // Save to mock database in localStorage
    const users = JSON.parse(localStorage.getItem("dogesh_registered_users") || "[]");
    if (!users.some((u: any) => u.email === mockUser.email)) {
      users.push({
        ...mockUser,
        password: "Password123!"
      });
      localStorage.setItem("dogesh_registered_users", JSON.stringify(users));
    }
    
    return {
      data: {
        token: `mock-${provider}-token-${Math.random().toString(36).substring(2)}`,
        user: mockUser
      }
    };
  };

  return handleSupabaseCall(supabaseOAuth, mockOAuth, `OAuth with ${provider} failed`);
}
