import NodeCache from 'node-cache';

export class CacheManager {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 300) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });

    this.cache.on('expired', (key: string) => {
      console.log(`Cache key expired: ${key}`);
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  delStartWith(startStr: string): number {
    const keys = this.cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(startStr));
    return this.cache.del(keysToDelete);
  }

  flush(): void {
    this.cache.flushAll();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getStats() {
    return this.cache.getStats();
  }

  // Helper method for caching async operations
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      console.log(`Cache hit: ${key}`);
      return cached;
    }

    console.log(`Cache miss: ${key}`);
    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

// Singleton instance
const ttl = parseInt(process.env.CACHE_TTL || '300', 10);
export const cacheManager = new CacheManager(ttl);
