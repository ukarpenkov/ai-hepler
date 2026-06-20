import { Redis } from "ioredis";

export function createRedisClient(url: string) {
  return new Redis(url);
}

export async function closeRedisClient(client: Redis | null) {
  if (client) {
    await client.quit();
  }
}
