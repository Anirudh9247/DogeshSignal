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
