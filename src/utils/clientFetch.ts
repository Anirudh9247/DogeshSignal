export const clientFetch = async (
  url: string,
  options: RequestInit = {},
  retries = 2,
  delayMs = 1500
): Promise<Response> => {
  const timeoutMs = 25000; // 25 seconds timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Render cold starts can cause temporary 502/503/504 gateway states
    if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0) {
      console.warn(`Server returned status ${response.status}. Retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
      return clientFetch(url, options, retries - 1, delayMs * 2);
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The server might be taking too long to start up.");
    }

    if (retries > 0) {
      console.warn(`Fetch error: ${err.message || err}. Retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
      return clientFetch(url, options, retries - 1, delayMs * 2);
    }
    
    throw err;
  }
};
