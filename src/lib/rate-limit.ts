// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;    // Max requests per window
  windowMs: number;       // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000  // 1 minute
};

/**
 * Rate limiter middleware
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns null if allowed, NextResponse if rate limited
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): NextResponse | null {
  // Get IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    // First request from this IP
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return null;
  }
  
  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return null;
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return NextResponse.json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter
    }, { 
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString()
      }
    });
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return null;
}