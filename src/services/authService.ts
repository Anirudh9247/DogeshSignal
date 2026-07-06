import { PlanType } from "../plans/plans";

export interface User {
  id: string;
  fullName: string;
  email: string;
  plan: PlanType;
}

export async function login(data: any) {
  // Simulate network delay
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
}

export async function register(data: any) {
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
}
