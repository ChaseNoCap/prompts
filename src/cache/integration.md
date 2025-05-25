# Cache Package Integration Guide

<integration_overview>
The cache package provides caching decorators and implementations that integrate seamlessly with the dependency injection framework. It's designed to be a drop-in performance enhancement for any service, with optional event emission for monitoring cache effectiveness.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="inversify" type="production">
Used for @injectable() decorator on MemoryCache implementation and metadata reflection
</dependency>

<dependency name="reflect-metadata" type="production">
Required for decorator metadata and method parameter extraction
</dependency>

<dependency name="event-system" type="optional-peer">
Optional integration for cache hit/miss event emission
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="di-framework" type="registered">
<description>
MemoryCache is registered as singleton in DI container for shared caching across services
</description>
<code>
import { MemoryCache } from 'cache';

container.bind&lt;ICache&gt;(TYPES.ICache)
  .to(MemoryCache)
  .inSingletonScope();
</code>
</integration>

<integration package="h1b-visa-analysis" type="consumer">
<description>
Main application uses cache decorators to optimize expensive operations
</description>
<code>
@injectable()
export class ReportGenerator {
  @Cacheable({
    key: (reportId: string) => `report:${reportId}`,
    ttl: 3600 // 1 hour
  })
  async generateReport(reportId: string): Promise&lt;Report&gt; {
    // Expensive report generation
    return this.buildReport(reportId);
  }
  
  @InvalidateCache({
    keys: (reportId: string) => [`report:${reportId}`]
  })
  async updateReportData(reportId: string, data: any): Promise&lt;void&gt; {
    // Update data and invalidate cache
  }
}
</code>
</integration>

<integration package="markdown-compiler" type="shared">
<description>
Both h1b-visa-analysis and markdown-compiler share the same cache package for consistency
</description>
<code>
// In markdown-compiler
@injectable()
export class MarkdownCompiler {
  @Cacheable({
    key: (source: string) => `md:${this.hash(source)}`,
    ttl: 7200
  })
  async compile(source: string): Promise&lt;CompiledMarkdown&gt; {
    // Expensive markdown compilation
  }
}
</code>
</integration>

<integration package="event-system" type="optional">
<description>
Cache decorators can emit events when event bus is provided
</description>
<code>
// With event emission
@Cacheable({
  key: (id: string) => `data:${id}`,
  ttl: 300,
  eventBus: container.get&lt;IEventBus&gt;(TYPES.IEventBus)
})
async getData(id: string): Promise&lt;Data&gt; {
  // Emits 'cache.hit' or 'cache.miss' events
}

// Listen to cache events
eventBus.on('cache.*', (event) => {
  logger.info(`Cache ${event.type}`, event.payload);
});
</code>
</integration>

<integration package="test-mocks" type="mocked">
<description>
MockCache provides test implementation with statistics tracking
</description>
<code>
import { MockCache } from 'test-mocks';

const mockCache = new MockCache();
container.rebind&lt;ICache&gt;(TYPES.ICache)
  .toConstantValue(mockCache);

// Test cache behavior
expect(mockCache.getHitRate()).toBeGreaterThan(80);
expect(mockCache.getStats().misses).toBe(1);
</code>
</integration>

<integration package="logger" type="consumer">
<description>
Cache implementation can use logger for debugging cache operations
</description>
<code>
@injectable()
export class MemoryCache implements ICache {
  constructor(
    @inject(TYPES.ILogger) @optional() private logger?: ILogger
  ) {}
  
  async get&lt;T&gt;(key: string): Promise&lt;T | null&gt; {
    const entry = this.store.get(key);
    
    if (this.logger) {
      this.logger.debug('Cache access', { 
        key, 
        hit: !!entry,
        expired: entry ? this.isExpired(entry) : false
      });
    }
    
    return entry?.value ?? null;
  }
}
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Service Method Caching">
<description>
Cache expensive service method results with automatic key generation
</description>
<implementation>
import { Cacheable, InvalidateCache, getCacheKey } from 'cache';

@injectable()
export class DataService {
  @Cacheable({
    key: (userId: string, options?: QueryOptions) => 
      `user:${userId}:${JSON.stringify(options || {})}`,
    ttl: 600 // 10 minutes
  })
  async getUserData(userId: string, options?: QueryOptions): Promise&lt;UserData&gt; {
    // Expensive database query
    return this.db.query(userId, options);
  }
  
  @InvalidateCache({
    keys: (userId: string) => [
      `user:${userId}:*` // Pattern-based invalidation
    ]
  })
  async updateUser(userId: string, data: UpdateData): Promise&lt;void&gt; {
    await this.db.update(userId, data);
    // Cache automatically invalidated
  }
  
  // Manual cache access
  async getCachedUser(userId: string): Promise&lt;UserData | null&gt; {
    const key = getCacheKey(this.getUserData, [userId]);
    return this.cache.get&lt;UserData&gt;(key);
  }
}
</implementation>
</pattern>

<pattern name="Multi-Level Caching">
<description>
Implement different cache strategies for different data types
</description>
<implementation>
@injectable()
export class TieredDataService {
  // Short-lived cache for frequently changing data
  @Cacheable({
    key: (id: string) => `live:${id}`,
    ttl: 60 // 1 minute
  })
  async getLiveData(id: string): Promise&lt;LiveData&gt; {
    return this.api.fetchLive(id);
  }
  
  // Medium-term cache for processed data
  @Cacheable({
    key: (id: string) => `processed:${id}`,
    ttl: 3600 // 1 hour
  })
  async getProcessedData(id: string): Promise&lt;ProcessedData&gt; {
    const live = await this.getLiveData(id);
    return this.processData(live);
  }
  
  // Long-term cache for static data
  @Cacheable({
    key: (type: string) => `static:${type}`,
    ttl: 86400 // 24 hours
  })
  async getStaticData(type: string): Promise&lt;StaticData&gt; {
    return this.db.fetchStatic(type);
  }
}
</implementation>
</pattern>

<pattern name="Conditional Caching">
<description>
Cache based on runtime conditions or results
</description>
<implementation>
interface CacheableOptions {
  key: (...args: any[]) => string;
  ttl?: number;
  condition?: (...args: any[]) => boolean;
  resultCondition?: (result: any) => boolean;
}

@injectable()
export class ConditionalCacheService {
  // Only cache for authenticated users
  @Cacheable({
    key: (userId: string) => `profile:${userId}`,
    ttl: 1800,
    condition: (userId: string) => this.isAuthenticated(userId)
  })
  async getUserProfile(userId: string): Promise&lt;Profile&gt; {
    return this.api.fetchProfile(userId);
  }
  
  // Only cache successful results
  @Cacheable({
    key: (query: string) => `search:${query}`,
    ttl: 300,
    resultCondition: (result: SearchResult) => 
      result.status === 'success' && result.items.length > 0
  })
  async search(query: string): Promise&lt;SearchResult&gt; {
    return this.searchEngine.query(query);
  }
}
</implementation>
</pattern>

<pattern name="Cache Warming">
<description>
Preload cache with commonly accessed data
</description>
<implementation>
@injectable()
export class CacheWarmingService {
  constructor(
    @inject(TYPES.ICache) private cache: ICache,
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}
  
  async warmCache(): Promise&lt;void&gt; {
    this.logger.info('Starting cache warming');
    
    // Warm static data
    const staticTypes = ['countries', 'industries', 'visa-types'];
    await Promise.all(
      staticTypes.map(type => this.warmStaticData(type))
    );
    
    // Warm frequently accessed data
    const topUsers = await this.getTopUsers();
    await Promise.all(
      topUsers.map(userId => this.warmUserData(userId))
    );
    
    this.logger.info('Cache warming completed');
  }
  
  private async warmStaticData(type: string): Promise&lt;void&gt; {
    const data = await this.fetchStaticData(type);
    await this.cache.set(`static:${type}`, data, 86400);
  }
  
  private async warmUserData(userId: string): Promise&lt;void&gt; {
    const profile = await this.fetchUserProfile(userId);
    await this.cache.set(`profile:${userId}`, profile, 3600);
  }
}

// Run on application startup
container.get&lt;CacheWarmingService&gt;(CacheWarmingService).warmCache();
</implementation>
</pattern>

<pattern name="Cache Monitoring">
<description>
Monitor cache effectiveness with events and metrics
</description>
<implementation>
@injectable()
export class CacheMonitor {
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  
  constructor(
    @inject(TYPES.IEventBus) private eventBus: IEventBus,
    @inject(TYPES.ILogger) private logger: ILogger
  ) {
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.eventBus.on('cache.hit', (event) => {
      this.stats.hits++;
      this.logCacheEvent('hit', event.payload);
    });
    
    this.eventBus.on('cache.miss', (event) => {
      this.stats.misses++;
      this.logCacheEvent('miss', event.payload);
    });
    
    this.eventBus.on('cache.evict', (event) => {
      this.stats.evictions++;
      this.logCacheEvent('evict', event.payload);
    });
    
    // Log stats periodically
    setInterval(() => this.logStats(), 60000); // Every minute
  }
  
  private logCacheEvent(type: string, payload: any): void {
    this.logger.debug(`Cache ${type}`, payload);
  }
  
  private logStats(): void {
    const hitRate = this.calculateHitRate();
    this.logger.info('Cache statistics', {
      ...this.stats,
      hitRate: `${hitRate.toFixed(2)}%`
    });
  }
  
  private calculateHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}
</implementation>
</pattern>

## Migration Guide

<migration_steps>
<step number="1" title="Add Cache Decorators">
<from>
@injectable()
export class DataService {
  private cache = new Map&lt;string, any&gt;();
  
  async getData(id: string): Promise&lt;Data&gt; {
    // Manual cache check
    if (this.cache.has(id)) {
      const cached = this.cache.get(id);
      if (Date.now() - cached.timestamp < 600000) {
        return cached.data;
      }
    }
    
    // Fetch data
    const data = await this.fetchData(id);
    
    // Manual cache set
    this.cache.set(id, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
}
</from>
<to>
import { Cacheable } from 'cache';

@injectable()
export class DataService {
  @Cacheable({
    key: (id: string) => `data:${id}`,
    ttl: 600 // 10 minutes in seconds
  })
  async getData(id: string): Promise&lt;Data&gt; {
    // Just the business logic
    return this.fetchData(id);
  }
}
</to>
</step>

<step number="2" title="Add Cache Invalidation">
<from>
async updateData(id: string, updates: any): Promise&lt;void&gt; {
  await this.db.update(id, updates);
  
  // Manual cache invalidation
  this.cache.delete(id);
  this.cache.delete(`processed:${id}`);
  // Easy to forget related keys
}
</from>
<to>
import { InvalidateCache } from 'cache';

@InvalidateCache({
  keys: (id: string) => [
    `data:${id}`,
    `processed:${id}`,
    `summary:${id}`
  ]
})
async updateData(id: string, updates: any): Promise&lt;void&gt; {
  await this.db.update(id, updates);
  // All related cache entries automatically invalidated
}
</to>
</step>

<step number="3" title="Replace Custom Cache with ICache">
<from>
class CustomCache {
  private store = new Map();
  
  get(key: string): any {
    return this.store.get(key);
  }
  
  set(key: string, value: any, ttl?: number): void {
    this.store.set(key, { value, expires: Date.now() + (ttl || 0) });
  }
}

// In service
constructor() {
  this.cache = new CustomCache();
}
</from>
<to>
import type { ICache } from 'cache';

// In service
constructor(
  @inject(TYPES.ICache) private cache: ICache
) {}

// Container configuration
import { MemoryCache } from 'cache';
container.bind&lt;ICache&gt;(TYPES.ICache).to(MemoryCache).inSingletonScope();
</to>
</step>
</migration_steps>

## Best Practices

<best_practices>
<practice name="Use Descriptive Cache Keys">
<description>Create cache keys that clearly indicate the cached content</description>
<good>
@Cacheable({
  key: (userId: string, filter: Filter) => 
    `user:${userId}:orders:${filter.status}:${filter.dateRange}`
})
</good>
<bad>
@Cacheable({
  key: (id: string, f: any) => `${id}:${JSON.stringify(f)}` // Unclear
})
</bad>
</practice>

<practice name="Set Appropriate TTLs">
<description>Choose TTL values based on data volatility and business requirements</description>
<good>
// Static data - long TTL
@Cacheable({ key: (type) => `static:${type}`, ttl: 86400 }) // 24 hours

// User data - medium TTL
@Cacheable({ key: (id) => `user:${id}`, ttl: 3600 }) // 1 hour

// Real-time data - short TTL
@Cacheable({ key: (id) => `live:${id}`, ttl: 60 }) // 1 minute
</good>
<bad>
// Same TTL for everything
@Cacheable({ key: (id) => id, ttl: 3600 }) // Not considering data type
</bad>
</practice>

<practice name="Invalidate Related Cache Entries">
<description>Ensure all related cache entries are invalidated together</description>
<good>
@InvalidateCache({
  keys: (userId: string) => [
    `user:${userId}`,
    `user:${userId}:profile`,
    `user:${userId}:settings`,
    `team:*:members` // If user is in teams
  ]
})
async updateUser(userId: string, data: any): Promise&lt;void&gt; {
  // Update user
}
</good>
<bad>
@InvalidateCache({
  keys: (userId: string) => [`user:${userId}`] // Forgets related entries
})
</bad>
</practice>

<practice name="Handle Cache Errors Gracefully">
<description>Don't let cache failures break the application</description>
<good>
async getData(id: string): Promise&lt;Data&gt; {
  try {
    const cached = await this.cache.get&lt;Data&gt;(`data:${id}`);
    if (cached) return cached;
  } catch (error) {
    this.logger.warn('Cache read failed', error as Error);
    // Continue without cache
  }
  
  const data = await this.fetchData(id);
  
  try {
    await this.cache.set(`data:${id}`, data, 3600);
  } catch (error) {
    this.logger.warn('Cache write failed', error as Error);
    // Don't fail the operation
  }
  
  return data;
}
</good>
</practice>

<practice name="Monitor Cache Effectiveness">
<description>Track cache metrics to optimize performance</description>
<good>
// Enable event emission for monitoring
@Cacheable({
  key: (id) => `data:${id}`,
  ttl: 3600,
  eventBus: container.get&lt;IEventBus&gt;(TYPES.IEventBus)
})

// Monitor cache events
eventBus.on('cache.*', (event) => {
  metrics.increment(`cache.${event.type}`, {
    key_prefix: event.payload.key.split(':')[0]
  });
});
</good>
</practice>
</best_practices>