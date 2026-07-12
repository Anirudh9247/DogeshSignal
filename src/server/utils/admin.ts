/**
 * admin.ts — Admin / tester bypass helpers
 *
 * Reads ADMIN_EMAILS (comma-separated) from the environment.
 * Admin accounts get shield_annual entitlements with unlimited usage,
 * no payment verification, and full feature access.
 *
 * To add/remove admins: edit ADMIN_EMAILS in .env (no code changes needed).
 */

const ADMIN_SET: Set<string> = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

/**
 * Returns true if the given email belongs to a whitelisted admin / tester account.
 * Comparison is case-insensitive.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_SET.has(email.trim().toLowerCase());
}
