import RedisCacheAdapter from "../adapters/cache/RedisCacheAdapter";
import { ICacheAdapter } from "../adapters/cache/type";

class CacheFactory {
  private static instance: ICacheAdapter;

  public static getCacheAdapter(): ICacheAdapter {
    if (!this.instance) {
      // this.instance = RedisCacheAdapter;
    }
    return this.instance;
  }
}

export default CacheFactory;
