# Cache Package Overview

```xml
<package_overview name="cache">
  <metadata>
    <version>1.1.0</version>
    <coverage>94.79%</coverage>
    <size>~400 lines</size>
    <status>stable</status>
  </metadata>
  
  <purpose>
    Provides caching functionality through decorators, shared between h1b-visa-analysis and markdown-compiler
  </purpose>
  
  <features>
    <feature>@Cacheable decorator for method caching</feature>
    <feature>@InvalidateCache decorator for cache invalidation</feature>
    <feature>MemoryCache with TTL support</feature>
    <feature>Integration with logger for operation tracking</feature>
    <feature>Event-aware caching with operation events</feature>
  </features>
  
  <usage_example>
    <![CDATA[
    @injectable()
    class MyService {
      @Cacheable({ ttl: 3600, key: 'data-${id}' })
      async fetchData(id: string): Promise<Data> {
        // Expensive operation cached for 1 hour
        return await expensiveApiCall(id);
      }

      @InvalidateCache('fetchData')
      async updateData(id: string, data: Data): Promise<void> {
        // Clears cache for fetchData
        await saveData(id, data);
      }
    }
    ]]>
  </usage_example>
  
  <dependencies>
    <dependency>inversify</dependency>
    <dependency optional="true">@chasenocap/logger</dependency>
    <dependency optional="true">event-system</dependency>
  </dependencies>
  
  <exports>
    <export type="interface">ICache</export>
    <export type="decorator">@Cacheable</export>
    <export type="decorator">@InvalidateCache</export>
    <export type="class">MemoryCache</export>
    <export type="utility">clearCache</export>
  </exports>
  
  <consumers>
    <consumer>h1b-visa-analysis</consumer>
    <consumer>markdown-compiler</consumer>
  </consumers>
</package_overview>
```

## Key Features

The cache package provides a decorator-based caching solution with the following capabilities:

- **Method-level caching** via `@Cacheable` decorator
- **Cache invalidation** via `@InvalidateCache` decorator  
- **TTL (Time To Live) support** for automatic expiration
- **Configurable cache keys** with parameter interpolation
- **Memory-based storage** with LRU eviction
- **Logger integration** for cache hit/miss tracking
- **Event system integration** for debugging and monitoring

## Architecture

The package follows a decorator pattern with dependency injection:

- **Decorators**: `@Cacheable` and `@InvalidateCache` for method instrumentation
- **Storage**: `MemoryCache` implementation with TTL and LRU
- **Utilities**: Helper functions for cache management
- **Integration**: Logger and event system hooks

## Integration Points

The cache package integrates with:

- **Logger package**: Tracks cache operations and performance
- **Event system**: Emits cache events for debugging
- **DI framework**: Injectable cache instances
- **File system**: Can cache file operations in consuming packages

## Current Status

- **Version**: 1.1.0
- **Coverage**: 94.79% (exceeds 90% target)
- **Size**: ~400 lines (well under 1000 line limit)
- **State**: Stable and production-ready
- **Last Updated**: May 2025

## Usage Patterns

### Basic Caching
```typescript
@Cacheable({ ttl: 300 }) // 5 minutes
async getData(): Promise<Data> {
  return await fetchFromAPI();
}
```

### Parametric Caching
```typescript
@Cacheable({ ttl: 1800, key: 'user-${userId}' })
async getUserData(userId: string): Promise<User> {
  return await userService.fetch(userId);
}
```

### Cache Invalidation
```typescript
@InvalidateCache('getUserData')
async updateUser(userId: string, data: User): Promise<void> {
  await userService.update(userId, data);
}
```

## Development Notes

- Maintains shared state between h1b-visa-analysis and markdown-compiler
- Uses WeakMap for metadata storage to prevent memory leaks
- Supports both sync and async method caching
- Thread-safe for Node.js single-threaded environment
- Event emissions are optional and controlled by feature flags