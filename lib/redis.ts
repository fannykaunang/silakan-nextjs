// src/lib/redis.ts
import "server-only";
import { Redis } from "@upstash/redis";

// Fail-fast kalau env kurang
if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
}

// Reuse instance untuk dev hot-reload & serverless reuse
declare global {
  // eslint-disable-next-line no-var
  var __UPSTASH_REDIS__: Redis | undefined;
}

export const redis =
  global.__UPSTASH_REDIS__ ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

global.__UPSTASH_REDIS__ = redis;

// Guard ekstra (mestinya tak pernah kena karena "server-only")
if (typeof window !== "undefined") {
  throw new Error("Do not import lib/redis in Client Components");
}
