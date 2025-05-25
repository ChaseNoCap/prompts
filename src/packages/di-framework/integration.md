# DI Framework Integration Guide

```xml
<integration_context package="di-framework">
  <integrates_with>
    <package name="ALL_PACKAGES">
      <interaction>Provides base DI utilities and interfaces</interaction>
      <dependency_type>foundation</dependency_type>
    </package>
    <package name="logger">
      <interaction>Uses ILogger interface and DI container</interaction>
      <dependency_type>consumer</dependency_type>
    </package>
    <package name="cache">
      <interaction>Uses @injectable decorator and container patterns</interaction>
      <dependency_type>consumer</dependency_type>
    </package>
    <package name="event-system">
      <interaction>Provides container event integration</interaction>
      <dependency_type>peer</dependency_type>
    </package>
    <package name="test-helpers">
      <interaction>Uses TestContainerBuilder for test setup</interaction>
      <dependency_type>consumer</dependency_type>
    </package>
    <package name="test-mocks">
      <interaction>Provides mock binding capabilities</interaction>
      <dependency_type>consumer</dependency_type>
    </package>
  </integrates_with>
  
  <used_by>
    <application>h1b-visa-analysis</application>
    <application>markdown-compiler</application>
    <package>All packages in monorepo</package>
  </used_by>
  
  <patterns>
    <pattern>Foundation package - all others depend on it</pattern>
    <pattern>Interface-first design with IResult, IDisposable</pattern>
    <pattern>Type-safe token creation and registration</pattern>
    <pattern>Test isolation with TestContainerBuilder</pattern>
    <pattern>Event-driven container operations (optional)</pattern>
  </patterns>
  
  <injection_points>
    <injection token="ALL_SERVICE_TOKENS" interface="Various">
      <purpose>All services use DI framework tokens and containers</purpose>
    </injection>
  </injection_points>
</integration_context>
```

## Integration Overview

The di-framework package serves as the **foundational layer** for dependency injection across the entire H1B monorepo. Every other package depends on it directly or indirectly, making it the most critical integration point in the system.

## Foundation Pattern

As the foundation package, di-framework provides:

### Core DI Infrastructure
- **Token Creation**: All packages use `createToken()` for type-safe service identifiers
- **Container Building**: Main application uses `ContainerBuilder` for setup
- **Base Interfaces**: All packages implement `IResult`, `IDisposable`, `IInitializable`
- **Testing Utilities**: All packages use `TestContainerBuilder` in tests

### Architecture Integration

```typescript
// Main application container setup
import { ContainerBuilder, createTokens } from 'di-framework';
import { LOGGER_TOKENS } from 'logger';
import { CACHE_TOKENS } from 'cache';

const TYPES = createTokens('app', {
  IReportGenerator: 'Report generation service',
  IDependencyChecker: 'Dependency validation service'
});

const container = await new ContainerBuilder()
  .addBinding(LOGGER_TOKENS.ILogger, WinstonLogger)
  .addBinding(CACHE_TOKENS.ICache, MemoryCache)
  .addBinding(TYPES.IReportGenerator, ReportGenerator)
  .addBinding(TYPES.IDependencyChecker, DependencyChecker)
  .build();
```

## Package-Specific Integrations

### Logger Package Integration
```typescript
// logger package uses di-framework patterns
import { createToken, IResult } from 'di-framework';

export const ILogger = createToken<ILogger>('ILogger');

@injectable()
export class WinstonLogger implements ILogger {
  async log(message: string): Promise<IResult<void>> {
    try {
      // Winston logging implementation
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
```

### Cache Package Integration
```typescript
// cache package uses DI and interfaces
import { createTokens, IDisposable, IInitializable } from 'di-framework';

export const CACHE_TOKENS = createTokens('cache', {
  ICache: 'Caching service',
  ICacheStrategy: 'Cache strategy implementation'
});

@injectable()
export class MemoryCache implements ICache, IDisposable {
  async dispose(): Promise<void> {
    // Cleanup cache resources
    this.cache.clear();
  }
}
```

### Event System Integration
```typescript
// Event system provides optional container integration
import { ContainerBuilder } from 'di-framework';
import { EventBus } from 'event-system';

const eventBus = new EventBus();

const container = await new ContainerBuilder()
  .enableEventSystem(eventBus)
  .addBinding(IService, ServiceImpl)
  .build();

// Container events are automatically emitted
eventBus.on('container.resolution.*', (event) => {
  console.log('Container event:', event.type);
});
```

### Test Package Integration
```typescript
// test-helpers uses TestContainerBuilder
import { TestContainerBuilder } from 'di-framework';
import { MockLogger } from 'test-mocks';

export class TestSetup {
  static async createTestContainer() {
    return await TestContainerBuilder.createIsolated()
      .mock(ILogger, new MockLogger())
      .snapshot()
      .build();
  }
}
```

## Setup and Configuration

### Main Application Setup
```typescript
// src/core/container/container.ts
import { ContainerBuilder, createTokens } from 'di-framework';

// Define application tokens
export const TYPES = createTokens('h1b', {
  IReportGenerator: 'Report generation service',
  IDependencyChecker: 'Dependency checking service'
});

// Build container with all services
export const containerPromise = (async () => {
  return await new ContainerBuilder()
    // Core services
    .addBinding(LOGGER_TOKENS.ILogger, WinstonLogger)
    .addBinding(CACHE_TOKENS.ICache, MemoryCache)
    .addBinding(FILE_TOKENS.IFileSystem, NodeFileSystem)
    
    // Application services
    .addBinding(TYPES.IReportGenerator, ReportGenerator)
    .addBinding(TYPES.IDependencyChecker, DependencyChecker)
    
    // Optional: Enable event system
    .enableEventSystem(eventBus)
    .build();
})();
```

### Package Integration Pattern
```typescript
// Each package follows this pattern
import { createTokens, injectable } from 'di-framework';

// 1. Define package tokens
export const PACKAGE_TOKENS = createTokens('package', {
  IService: 'Package service interface'
});

// 2. Implement with @injectable
@injectable()
export class ServiceImpl implements IService {
  constructor(
    @inject(LOGGER_TOKENS.ILogger) private logger: ILogger
  ) {}
}

// 3. Export for container binding
export { ServiceImpl };
```

## Testing Integration

### Test Setup Pattern
```typescript
// tests/setup.ts
import { TestContainerBuilder } from 'di-framework';
import { MockLogger, MockCache, MockFileSystem } from 'test-mocks';

export async function createTestContainer() {
  return await TestContainerBuilder.createIsolated()
    .mock(LOGGER_TOKENS.ILogger, new MockLogger())
    .mock(CACHE_TOKENS.ICache, new MockCache())
    .mock(FILE_TOKENS.IFileSystem, new MockFileSystem())
    .snapshot()
    .build();
}
```

### Individual Test Integration
```typescript
// service.test.ts
describe('MyService', () => {
  let container: Container;
  let service: IMyService;
  
  beforeEach(async () => {
    container = await createTestContainer();
    container.bind(TYPES.IMyService).to(MyService);
    service = container.get(TYPES.IMyService);
  });
  
  afterEach(() => {
    container.unbindAll();
  });
});
```

## Advanced Integration Scenarios

### Middleware Integration
```typescript
// Performance monitoring middleware
const performanceMiddleware: IContainerMiddleware = {
  intercept: (context, serviceIdentifier, next) => {
    const start = performance.now();
    const result = next();
    const duration = performance.now() - start;
    
    // Log slow resolutions
    if (duration > 100) {
      console.warn(`Slow resolution: ${String(serviceIdentifier)} (${duration}ms)`);
    }
    
    return result;
  }
};

const container = await new ContainerBuilder()
  .addMiddleware(performanceMiddleware)
  .build();
```

### Module-Based Integration
```typescript
// Create reusable modules
import { ContainerModule } from 'inversify';

export const loggerModule = new ContainerModule((bind) => {
  bind(LOGGER_TOKENS.ILogger).to(WinstonLogger).inSingletonScope();
});

export const cacheModule = new ContainerModule((bind) => {
  bind(CACHE_TOKENS.ICache).to(MemoryCache).inSingletonScope();
});

// Use in container
const container = await new ContainerBuilder()
  .addModule(loggerModule)
  .addModule(cacheModule)
  .build();
```

## Common Integration Scenarios

### Service Layer Integration
```typescript
@injectable()
export class ReportGenerator implements IReportGenerator {
  constructor(
    @inject(LOGGER_TOKENS.ILogger) private logger: ILogger,
    @inject(CACHE_TOKENS.ICache) private cache: ICache,
    @inject(FILE_TOKENS.IFileSystem) private fileSystem: IFileSystem
  ) {}
  
  async generateReport(): Promise<IResult<string>> {
    try {
      this.logger.info('Starting report generation');
      // Implementation
      return { success: true, data: 'report content' };
    } catch (error) {
      this.logger.error('Report generation failed', error);
      return { success: false, error: error as Error };
    }
  }
}
```

### Factory Pattern Integration
```typescript
// For complex object creation
@injectable()
export class ServiceFactory {
  constructor(
    @inject(LOGGER_TOKENS.ILogger) private logger: ILogger
  ) {}
  
  createService(config: ServiceConfig): IService {
    return new ServiceImpl(config, this.logger);
  }
}
```

## Troubleshooting Integration Issues

### Common Problems

1. **Missing reflect-metadata Import**
```typescript
// Must be imported before any decorators
import 'reflect-metadata';
import { injectable, inject } from 'di-framework';
```

2. **Circular Dependencies**
```typescript
// Use lazy injection
@injectable()
export class ServiceA {
  @lazyInject(TOKENS.IServiceB) private serviceB!: IServiceB;
}
```

3. **Token Conflicts**
```typescript
// Use namespaced tokens
const USER_TOKENS = createTokens('user', {
  IService: 'User service'
});

const ORDER_TOKENS = createTokens('order', {
  IService: 'Order service'  // No conflict
});
```

4. **Test Isolation Issues**
```typescript
// Always use createIsolated()
const testContainer = TestContainerBuilder.createIsolated()
  .mock(IService, mockService)
  .build();
```

## Integration Benefits

The di-framework integration provides:

- **Type Safety**: All service resolutions are type-safe
- **Testability**: Easy mocking and isolation in tests
- **Consistency**: Standardized patterns across packages
- **Flexibility**: Support for advanced scenarios with middleware
- **Performance**: Optional monitoring and optimization
- **Debugging**: Event system integration for troubleshooting

This foundation enables the entire monorepo to maintain loose coupling while providing strong integration points for cross-package communication and shared functionality.