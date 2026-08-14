// Lightweight rate limiter for Next.js API Routes to prevent brute-force request flooding
interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const ipTracker = new Map<string, RateLimitTracker>();

export function checkRateLimit(
  ip: string,
  limit: number = 15,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const tracker = ipTracker.get(ip);

  if (!tracker || now > tracker.resetTime) {
    ipTracker.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (tracker.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  tracker.count += 1;
  return { allowed: true, remaining: limit - tracker.count };
}
