const VISITOR_KEY = 'portfolio_visitor_id';

/**
 * Get or create a unique visitor ID stored in localStorage.
 * This persists across sessions but resets if the user clears browser data.
 */
export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || generateFallbackId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked (private mode on some browsers)
    return generateFallbackId();
  }
}

function generateFallbackId() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}
