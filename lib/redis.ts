import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  redisClient ??= new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });

  return redisClient;
}

export function requireRedis(): Redis {
  const client = getRedis();

  if (!client) {
    throw new Error("Upstash Redis credentials are not configured");
  }

  return client;
}
