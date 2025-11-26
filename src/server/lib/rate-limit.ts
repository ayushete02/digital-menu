/**
 * Simple in-memory rate limiter for development.
 * In production, use Redis or a dedicated rate limiting service.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export type RateLimitConfig = {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
};

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number };

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, email)
 * @param config - Rate limit configuration
 * @returns Result indicating if the request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // First request or expired window
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { success: true };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfter };
  }

  // Increment count
  entry.count += 1;
  return { success: true };
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers used by proxies
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
