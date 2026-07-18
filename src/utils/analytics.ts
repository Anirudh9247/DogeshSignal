export interface AnalyticsEvent {
  eventName: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export const trackEvent = (eventName: string, metadata: Record<string, any> = {}) => {
  console.log(`📊 [Analytics Event] ${eventName}`, metadata);
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem("dogesh_analytics_events") || "[]");
    events.push({ eventName, metadata, timestamp: new Date().toISOString() });
    localStorage.setItem("dogesh_analytics_events", JSON.stringify(events.slice(-100))); // keep last 100
  } catch (e) {
    // Ignore storage quota errors or issues silently
  }
};
