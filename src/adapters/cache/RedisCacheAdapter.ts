import Redis from "ioredis";
import { ICacheAdapter } from "./type";
import { config } from "../../config";

class RedisCacheAdapter implements ICacheAdapter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: config.cache.redis.HOST,
      port: Number(config.cache.redis.PORT),
      password: config.cache.redis.AUTH,
    });

    this.redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = Number(config.cache.CACHE_EXPIRE_TIME)
  ): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

export default new RedisCacheAdapter();
