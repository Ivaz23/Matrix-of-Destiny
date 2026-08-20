export class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private readonly ttl: number;
  private readonly storageKey: string;

  constructor(storageKey: string, ttlMs: number = 1000 * 60 * 60 * 24) { // Default 24h
    this.storageKey = storageKey;
    this.ttl = ttlMs;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.error("Failed to load cache", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Object.fromEntries(this.cache)));
    } catch (e) {
      console.error("Failed to save cache", e);
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }
    return item.data;
  }

  set(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.saveToStorage();
  }
}
