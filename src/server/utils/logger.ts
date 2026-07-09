export function logEvent(level: "INFO" | "WARN" | "ERROR", message: string, context?: any) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...context }));
}
