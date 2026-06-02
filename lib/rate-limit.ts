import { Ratelimit } from "@upstash/ratelimit";
import type { Duration } from "@upstash/ratelimit";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRedis } from "@/lib/redis";

type LocalBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  prefix: string;
  limit: number;
  window: Duration;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const localBuckets = new Map<string, LocalBucket>();
const upstashLimiters = new Map<string, Ratelimit>();
const RATE_LIMIT_TIMEOUT_MS = 1_500;

function durationToMilliseconds(duration: Duration): number {
  const match = duration.match(/^(\d+)\s?(ms|s|m|h|d)$/);

  if (!match) {
    return 60_000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "ms") return value;
  if (unit === "s") return value * 1_000;
  if (unit === "m") return value * 60_000;
  if (unit === "h") return value * 3_600_000;
  return value * 86_400_000;
}

function localRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = `${options.prefix}:${identifier}`;
  const resetWindow = durationToMilliseconds(options.window);
  const bucket = localBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const reset = now + resetWindow;
    localBuckets.set(key, { count: 1, resetAt: reset });

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset,
    };
  }

  bucket.count += 1;
  const remaining = Math.max(options.limit - bucket.count, 0);

  return {
    success: bucket.count <= options.limit,
    limit: options.limit,
    remaining,
    reset: bucket.resetAt,
  };
}

function getUpstashLimiter(options: RateLimitOptions): Ratelimit | null {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  const key = `${options.prefix}:${options.limit}:${options.window}`;
  const existing = upstashLimiters.get(key);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.limit, options.window),
    prefix: `imagiene:${options.prefix}`,
    analytics: false,
  });
  upstashLimiters.set(key, limiter);

  return limiter;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new Error("Rate limit service timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(options);

  if (!limiter) {
    return localRateLimit(identifier, options);
  }

  try {
    const result = await withTimeout(limiter.limit(identifier), RATE_LIMIT_TIMEOUT_MS);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Rate limit service unavailable; falling back to local limiter.");
    }

    return localRateLimit(identifier, options);
  }
}

export function getRateLimitIdentifier(request: NextRequest, scope = "ip"): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return `${scope}:${forwardedFor || realIp || "unknown"}`;
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const result = await rateLimit(identifier, options);

  if (result.success) {
    return null;
  }

  const retryAfter = Math.max(Math.ceil((result.reset - Date.now()) / 1_000), 1);

  return NextResponse.json(
    {
      error: {
        message: "Too many requests",
        details: {
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        },
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}
