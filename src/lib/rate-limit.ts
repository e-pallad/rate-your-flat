interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 5 },
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the rightmost IP — the one added by our trusted proxy,
    // not the leftmost which is client-supplied and trivially spoofable.
    const parts = forwarded.split(",");
    const ip = parts[parts.length - 1].trim();
    if (ip) return ip;
  }
  // No forwarded header (direct connection or first hop).
  // Return a per-request random ID so unknown-IP clients never share
  // a rate-limit bucket, avoiding a denial-of-service via bucket exhaustion.
  return `unknown-${crypto.randomUUID()}`;
}

/**
 * Simple CSRF check: custom API routes require the `x-requested-with`
 * header to be present. Browsers never send this header for cross-origin
 * simple requests, so its presence proves the call was made by our own
 * JavaScript (fetch / XMLHttpRequest) rather than a cross-site form POST.
 *
 * Returns true when the request passes the check, false when it should
 * be rejected (caller should return 403).
 */
export function checkCsrf(req: Request): boolean {
  return req.headers.get("x-requested-with") === "XMLHttpRequest";
}
