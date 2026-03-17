export const trackEvent = (eventName, payload = {}) => {
  const timestamp = new Date().toISOString();
  console.log('[Glowbal Analytics]', {
    event: eventName,
    timestamp,
    payload
  });
};
