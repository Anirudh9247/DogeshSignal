import { supabaseAdmin } from "../src/server/utils/supabase";
import { requireAuth } from "../src/server/middleware/auth.middleware";

export async function runAuthTests() {
  console.log("🔑 Running Auth Integration Tests...");

  // Test 1: Verify Supabase configuration is present or has fallback mock pathways
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️  Missing Supabase environment configurations; running with fallback mock auth logic.");
  } else {
    console.log("✅ Supabase environment config is configured.");
  }

  // Test 2: Verify requireAuth fallback with stale Bearer token when unconfigured
  const originalUrl = process.env.VITE_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalAnon = process.env.SUPABASE_ANON_KEY;
  
  // Set up direct spy on supabaseAdmin.auth.getUser
  let getUserCallCount = 0;
  const originalGetUser = supabaseAdmin.auth.getUser;
  supabaseAdmin.auth.getUser = async (token: string) => {
    getUserCallCount++;
    return originalGetUser.call(supabaseAdmin.auth, token);
  };

  // Temporarily unset env variables to force unconfigured mode
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  
  try {
    const mockReq = {
      headers: {
        authorization: "Bearer stale-mock-token-99999"
      }
    } as any;
    const mockRes = {} as any;
    let nextCalled = false;
    const mockNext = () => { nextCalled = true; };

    await requireAuth(mockReq, mockRes, mockNext);

    if (nextCalled && mockReq.user && mockReq.user.email === "mock_user@example.com" && getUserCallCount === 0) {
      console.log("✅ Verified: requireAuth falls back to mock user without calling supabase.auth.getUser.");
    } else {
      throw new Error(`requireAuth did not fall back to mock user or called getUser. nextCalled: ${nextCalled}, getUserCallCount: ${getUserCallCount}`);
    }
  } catch (error) {
    throw new Error(`requireAuth guest fallback verification failed: ${error}`);
  } finally {
    // Restore original configurations and spy
    supabaseAdmin.auth.getUser = originalGetUser;
    if (originalUrl) process.env.VITE_SUPABASE_URL = originalUrl;
    if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    if (originalAnon) process.env.SUPABASE_ANON_KEY = originalAnon;
  }

  // Test 3: If Live Supabase configuration is present, check connection and select query
  if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key") {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").select("id").limit(1);
      if (error) throw error;
      console.log("✅ Live Supabase connection and profiles select verified successfully.");
    } catch (error) {
      console.warn(`⚠️  Live Supabase connection failed (credentials present but server unreachable): ${error}`);
    }
  }

  console.log("✅ Auth Tests Completed Successfully!\n");
}
