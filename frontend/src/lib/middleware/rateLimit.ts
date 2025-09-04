interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    
    if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
      // Reset or create new entry
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: rateLimitStore[key].resetTime,
      };
    }
    
    if (rateLimitStore[key].count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitStore[key].resetTime,
      };
    }
    
    rateLimitStore[key].count++;
    return {
      allowed: true,
      remaining: config.maxRequests - rateLimitStore[key].count,
      resetTime: rateLimitStore[key].resetTime,
    };
  };
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
});

export const adminRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for admin operations
});
