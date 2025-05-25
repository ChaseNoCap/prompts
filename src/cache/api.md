# Cache Package API Reference

```xml
<package_api name="cache">
  <exports>
    <interface name="ICache">
      <purpose>Core caching interface for storage operations</purpose>
      <methods>
        <method name="get" return_type="Promise<T | undefined>">
          <parameters>
            <parameter name="key" type="string" optional="false">Cache key</parameter>
          </parameters>
          <description>Retrieves cached value by key</description>
        </method>
        <method name="set" return_type="Promise<void>">
          <parameters>
            <parameter name="key" type="string" optional="false">Cache key</parameter>
            <parameter name="value" type="T" optional="false">Value to cache</parameter>
            <parameter name="ttl" type="number" optional="true">Time to live in seconds</parameter>
          </parameters>
          <description>Stores value in cache with optional TTL</description>
        </method>
        <method name="delete" return_type="Promise<boolean>">
          <parameters>
            <parameter name="key" type="string" optional="false">Cache key to remove</parameter>
          </parameters>
          <description>Removes key from cache, returns true if existed</description>
        </method>
        <method name="clear" return_type="Promise<void>">
          <parameters></parameters>
          <description>Clears all cached entries</description>
        </method>
      </methods>
    </interface>
    
    <class name="MemoryCache">
      <purpose>In-memory cache implementation with TTL and LRU eviction</purpose>
      <decorators>
        <decorator>@injectable</decorator>
      </decorators>
    </class>
    
    <decorator name="@Cacheable">
      <purpose>Caches method return values with configurable TTL and keys</purpose>
      <parameters>
        <parameter name="ttl" type="number" required="false">Time to live in seconds (default: 300)</parameter>
        <parameter name="key" type="string" required="false">Cache key template (default: method name + args hash)</parameter>
        <parameter name="condition" type="function" required="false">Conditional caching function</parameter>
      </parameters>
      <usage_example>
        <![CDATA[
        @Cacheable({ ttl: 3600, key: 'data-${id}' })
        async fetchData(id: string): Promise<Data> {
          return await apiCall(id);
        }
        ]]>
      </usage_example>
    </decorator>
    
    <decorator name="@InvalidateCache">
      <purpose>Invalidates cached entries when method is called</purpose>
      <parameters>
        <parameter name="target" type="string | string[]" required="true">Method name(s) to invalidate</parameter>
        <parameter name="keyPattern" type="string" required="false">Key pattern for selective invalidation</parameter>
      </parameters>
      <usage_example>
        <![CDATA[
        @InvalidateCache('fetchData')
        async updateData(id: string, data: Data): Promise<void> {
          await saveData(id, data);
        }
        ]]>
      </usage_example>
    </decorator>
  </exports>
</package_api>
```

## Public API

### Interfaces

#### ICache<T>
Core caching interface that all cache implementations must follow.

```typescript
interface ICache<T = any> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}
```

### Classes

#### MemoryCache
In-memory cache implementation with TTL support and LRU eviction.

```typescript
@injectable()
class MemoryCache<T = any> implements ICache<T> {
  constructor(
    @inject(TYPES.ILogger) logger?: ILogger,
    maxSize = 1000,
    defaultTtl = 300
  );
}
```

### Decorators

#### @Cacheable(options?)
Caches method return values automatically.

**Options:**
- `ttl?: number` - Time to live in seconds (default: 300)
- `key?: string` - Cache key template with parameter interpolation
- `condition?: (args: any[]) => boolean` - Conditional caching function

**Key Templates:**
- Use `${paramName}` for parameter interpolation
- Example: `'user-${userId}-profile'`

#### @InvalidateCache(target, options?)
Invalidates cached entries when the decorated method is called.

**Parameters:**
- `target: string | string[]` - Method name(s) to invalidate
- `options.keyPattern?: string` - Pattern for selective invalidation

### Functions

#### clearCache(instance?, methodName?)
Utility function to manually clear cache entries.

```typescript
function clearCache(instance?: any, methodName?: string): Promise<void>
```

## Usage Examples

### Basic Usage

```typescript
import { Cacheable, InvalidateCache, ICache } from 'cache';

@injectable()
class UserService {
  @Cacheable({ ttl: 1800 }) // 30 minutes
  async getUser(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }
  
  @InvalidateCache('getUser')
  async updateUser(id: string, user: User): Promise<void> {
    await this.userRepository.update(id, user);
  }
}
```

### Advanced Usage

```typescript
class DataService {
  @Cacheable({ 
    ttl: 3600,
    key: 'report-${type}-${year}',
    condition: (args) => args[1] >= 2020 // Only cache recent years
  })
  async generateReport(type: string, year: number): Promise<Report> {
    return await this.reportGenerator.create(type, year);
  }
  
  @InvalidateCache(['generateReport'], { keyPattern: 'report-*' })
  async clearAllReports(): Promise<void> {
    // Clears all report caches
  }
}
```

### Direct Cache Usage

```typescript
@injectable()
class CacheAwareService {
  constructor(
    @inject(TYPES.ICache) private cache: ICache
  ) {}
  
  async getData(key: string): Promise<Data> {
    const cached = await this.cache.get(key);
    if (cached) return cached;
    
    const data = await this.fetchData(key);
    await this.cache.set(key, data, 600); // 10 minutes
    return data;
  }
}
```

## Configuration

### DI Container Setup

```typescript
import { MemoryCache } from 'cache';
import { TYPES } from './constants/injection-tokens';

container.bind<ICache>(TYPES.ICache).to(MemoryCache).inSingletonScope();
```

### Cache Size Limits

```typescript
const cache = new MemoryCache(logger, 5000, 1800); // max 5000 entries, 30min default TTL
```

## Error Handling

All cache operations handle errors gracefully:
- Failed cache reads return `undefined`
- Failed cache writes log warnings but don't throw
- TTL expiration is handled automatically
- Memory pressure triggers LRU eviction

## Best Practices

1. **Use appropriate TTL values** - Balance freshness vs performance
2. **Design cache keys carefully** - Use parameter interpolation for dynamic keys  
3. **Consider cache invalidation** - Invalidate when data changes
4. **Monitor cache hit rates** - Use logger integration for insights
5. **Handle cache misses gracefully** - Always have fallback logic
6. **Use conditional caching** - Cache only when beneficial