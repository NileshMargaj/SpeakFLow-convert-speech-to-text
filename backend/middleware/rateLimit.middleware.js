// Simple in-memory rate limiter (no external dependencies)
// Note: This resets when the server restarts.

const store = new Map();

function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return (req, res, next) => {
    const email = req.user?.email || req.user?.id || "anonymous";
    const key = `${email}:${req.originalUrl}`;

    const now = Date.now();

    const entry = store.get(key);

    if (!entry) {
      store.set(key, { count: 1, start: now });
      return next();
    }

    // If window expired, reset
    if (now - entry.start >= windowMs) {
      store.set(key, { count: 1, start: now });
      return next();
    }

    // Still in window
    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - entry.start)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${retryAfterSeconds}s`,
        retryAfterSeconds,
      });
    }

    store.set(key, entry);
    return next();
  };
}

export default rateLimit;

