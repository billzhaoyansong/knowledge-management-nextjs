// In-memory cache implementation with TTL support

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  defaultTTL?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  onEvict?: (key: string, entry: CacheEntry<any>) => void;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL: number;
  private readonly maxSize: number;
  private readonly onEvict?: (key: string, entry: CacheEntry<any>) => void;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.onEvict = options.onEvict;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const actualTTL = ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: actualTTL,
    };

    // Check if cache is at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        const oldEntry = this.cache.get(oldestKey);
        this.cache.delete(oldestKey);
        if (this.onEvict && oldEntry) {
          this.onEvict(oldestKey, oldEntry);
        }
      }
    }

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.onEvict) {
        this.onEvict(key, entry);
      }
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.onEvict) {
        this.onEvict(key, entry);
      }
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    const deleted = this.cache.delete(key);
    
    if (deleted && entry && this.onEvict) {
      this.onEvict(key, entry);
    }

    return deleted;
  }

  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry);
      }
    }
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        cleaned++;
      }
    }

    return cleaned;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    expired: number;
    memoryUsage: number; // Rough estimate
  } {
    const now = Date.now();
    let expired = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      memoryUsage: this.cache.size * 100, // Rough estimate in bytes
    };
  }
}

// Cache key builders
export const buildCacheKey = {
  paper: (slug: string) => `paper:${slug}`,
  papers: (query?: Record<string, any>) => {
    const queryStr = query ? JSON.stringify(query) : '';
    return `papers:${Buffer.from(queryStr).toString('base64')}`;
  },
  book: (slug: string) => `book:${slug}`,
  books: (query?: Record<string, any>) => {
    const queryStr = query ? JSON.stringify(query) : '';
    return `books:${Buffer.from(queryStr).toString('base64')}`;
  },
  section: (slug: string) => `section:${slug}`,
  sections: (bookId: string | number, query?: Record<string, any>) => {
    const queryStr = query ? JSON.stringify(query) : '';
    return `sections:${bookId}:${Buffer.from(queryStr).toString('base64')}`;
  },
  hierarchicalSections: (bookId: string | number) => `hierarchical-sections:${bookId}`,
};

// Default cache instance
export const defaultCache = new MemoryCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 500,
  onEvict: (key, entry) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache evicted: ${key}`);
    }
  },
});

// Cache warming utilities
export interface CacheWarmingOptions {
  papers?: boolean;
  books?: boolean;
  popularContent?: boolean;
}

// Cache invalidation patterns
export const invalidatePattern = (cache: MemoryCache, pattern: string): number => {
  let invalidated = 0;
  const regex = new RegExp(pattern);

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      invalidated++;
    }
  }

  return invalidated;
};

// Specific invalidation helpers
export const invalidateCache = {
  paper: (cache: MemoryCache, slug: string) => {
    cache.delete(buildCacheKey.paper(slug));
    // Also invalidate papers list cache
    invalidatePattern(cache, '^papers:');
  },
  book: (cache: MemoryCache, slug: string) => {
    cache.delete(buildCacheKey.book(slug));
    // Also invalidate books list cache
    invalidatePattern(cache, '^books:');
  },
  section: (cache: MemoryCache, slug: string, bookId?: string | number) => {
    cache.delete(buildCacheKey.section(slug));
    if (bookId) {
      // Invalidate sections for the book
      invalidatePattern(cache, `^sections:${bookId}:`);
      cache.delete(buildCacheKey.hierarchicalSections(bookId));
    }
  },
  all: (cache: MemoryCache) => {
    cache.clear();
  },
};