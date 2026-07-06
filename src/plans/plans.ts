export enum PlanType {
  SNIFF = "sniff",
  GUARD = "guard",
  SHIELD = "shield"
}

export interface UserProfile {
  id: string;
  email: string;
  plan: PlanType;
  createdAt: string;
}

// Simulated Auth Session Helper for testing the architecture in the client app
export function getMockUser(): UserProfile | null {
  const data = localStorage.getItem("dogesh_mock_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setMockUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem("dogesh_mock_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("dogesh_mock_user");
  }
}

export function isLoggedIn(): boolean {
  return getMockUser() !== null;
}
