import { logEvent } from "./logger";

export async function fetchWithRetry(url: string, options: any, retries = 3, delay = 1000): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && res.status >= 500 && retries > 0) {
      throw new Error(`Server error ${res.status}`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      logEvent("WARN", `Fetch to ${url} failed. Retrying in ${delay}ms...`, { error: String(err) });
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}
