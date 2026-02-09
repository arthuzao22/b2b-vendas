// Rate limiting using in-memory cache
import { NextRequest, NextResponse } from "next/server";
import { logger } from "../logger";

interface RateLimitConfig {
  limit: number; // Number of requests
  window: number; // Time window in seconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
  return ip;
}

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, identifier?: string): Promise<NextResponse | null> => {
    const clientId = identifier || getClientIdentifier(request);
    const key = `${clientId}:${request.nextUrl.pathname}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + config.window * 1000,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
      
      if (entry.count > config.limit) {
        const resetIn = Math.ceil((entry.resetTime - now) / 1000);
        logger.warn("Rate limit exceeded", { clientId, path: request.nextUrl.pathname });
        
        return NextResponse.json(
          {
            success: false,
            error: "Limite de requisições excedido. Tente novamente em alguns instantes.",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": config.limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": entry.resetTime.toString(),
              "Retry-After": resetIn.toString(),
            },
          }
        );
      }
    }

    // Request is allowed - return null to continue
    return null;
  };
}

/**
 * Rate limiting configurations for different endpoints
 */
export const rateLimitConfigs = {
  login: { limit: 5, window: 60 }, // 5 requests per minute
  register: { limit: 3, window: 60 }, // 3 requests per minute
  api: { limit: 100, window: 60 }, // 100 requests per minute
  general: { limit: 30, window: 60 }, // 30 requests per minute
};

/**
 * Apply rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  config: RateLimitConfig
): NextResponse {
  const clientId = getClientIdentifier(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const entry = rateLimitStore.get(key);

  if (entry) {
    const remaining = Math.max(0, config.limit - entry.count);
    response.headers.set("X-RateLimit-Limit", config.limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", entry.resetTime.toString());
  }

  return response;
}
