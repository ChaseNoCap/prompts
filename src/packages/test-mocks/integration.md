# Test Mocks Package Integration Guide

<integration_overview>
The test-mocks package provides the foundation for testing across the monorepo by offering interface-compliant mock implementations. It integrates primarily with test-helpers for simplified setup and with the DI framework for dependency injection in tests.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="inversify" type="production">
Used for @injectable() decorator to make mocks DI-compatible
</dependency>

<dependency name="@types/node" type="development">
TypeScript definitions for Node.js path and fs modules used in MockFileSystem
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="test-helpers" type="consumed-by">
<description>
test-helpers imports and configures mocks, providing simplified setup functions
</description>
<code>
// In test-helpers TestContainerBuilder
import { MockLogger, MockFileSystem, MockCache } from 'test-mocks';

private configureMocks(mockTypes: MockType[]) {
  if (mockTypes.includes('logger')) {
    this.mocks.logger = new MockLogger();
    this.container.bind&lt;ILogger&gt;(TYPES.ILogger)
      .toConstantValue(this.mocks.logger);
  }
  // Configure other mocks...
}
</code>
</integration>

<integration package="di-framework" type="compatible">
<description>
All mocks are decorated with @injectable() for seamless DI container integration
</description>
<code>
// Direct container usage
import { Container } from 'inversify';
import { MockLogger } from 'test-mocks';

const container = new Container();
container.bind&lt;ILogger&gt;(TYPES.ILogger).to(MockLogger);
// or as constant value
container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(new MockLogger());
</code>
</integration>

<integration package="logger" type="implements">
<description>
MockLogger implements the ILogger interface exactly, ensuring test validity
</description>
<code>
// MockLogger matches ILogger interface
export class MockLogger implements ILogger {
  debug(message: string, ...args: any[]): void { }
  info(message: string, ...args: any[]): void { }
  warn(message: string, ...args: any[]): void { }
  error(message: string, error?: Error, ...args: any[]): void { }
  child(context: Record&lt;string, any&gt;): ILogger { }
}
</code>
</integration>

<integration package="file-system" type="implements">
<description>
MockFileSystem provides in-memory implementation of IFileSystem interface
</description>
<code>
// MockFileSystem matches IFileSystem interface
export class MockFileSystem implements IFileSystem {
  async readFile(path: string, encoding?: BufferEncoding): Promise&lt;string&gt; { }
  async writeFile(path: string, data: string): Promise&lt;void&gt; { }
  async exists(path: string): Promise&lt;boolean&gt; { }
  // All other IFileSystem methods...
}
</code>
</integration>

<integration package="cache" type="implements">
<description>
MockCache implements ICache interface with statistics tracking
</description>
<code>
// MockCache matches ICache interface
export class MockCache implements ICache {
  async get&lt;T&gt;(key: string): Promise&lt;T | null&gt; { }
  async set&lt;T&gt;(key: string, value: T, ttl?: number): Promise&lt;void&gt; { }
  async has(key: string): Promise&lt;boolean&gt; { }
  // Plus test-specific methods like getStats()
}
</code>
</integration>

<integration package="event-system" type="optional">
<description>
Event-aware mock variants can emit events when integrated with event bus
</description>
<code>
import { EventAwareMockLogger } from 'test-mocks';
import { TestEventBus } from 'event-system';

const logger = new EventAwareMockLogger();
const eventBus = new TestEventBus();
logger.enableEventEmission(eventBus);

// Now logger operations emit events
logger.error('Test error');
eventBus.expectEvent('logger.error.completed').toHaveBeenEmitted();
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Direct Mock Usage">
<description>
Using mocks directly without DI container for simple unit tests
</description>
<implementation>
import { MockLogger, MockFileSystem } from 'test-mocks';

describe('FileProcessor', () => {
  it('should log file operations', async () => {
    const logger = new MockLogger();
    const fs = new MockFileSystem();
    
    // Seed test data
    fs.addFile('/input.txt', 'test content');
    
    const processor = new FileProcessor(logger, fs);
    await processor.process('/input.txt');
    
    expect(logger.hasLogged('info', 'Processing file: /input.txt')).toBe(true);
    expect(fs.exists('/output.txt')).toBe(true);
  });
});
</implementation>
</pattern>

<pattern name="DI Container Integration">
<description>
Using mocks with dependency injection for more complex scenarios
</description>
<implementation>
import { Container } from 'inversify';
import { MockLogger, MockCache } from 'test-mocks';

describe('CachedService', () => {
  let container: Container;
  let mockLogger: MockLogger;
  let mockCache: MockCache;

  beforeEach(() => {
    container = new Container();
    mockLogger = new MockLogger();
    mockCache = new MockCache();
    
    // Bind mocks
    container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
    container.bind&lt;ICache&gt;(TYPES.ICache).toConstantValue(mockCache);
    container.bind&lt;CachedService&gt;(CachedService).toSelf();
  });

  it('should use cache for repeated calls', async () => {
    const service = container.get&lt;CachedService&gt;(CachedService);
    
    await service.getData('key1');
    await service.getData('key1');
    
    expect(mockCache.getStats().hits).toBe(1);
    expect(mockCache.getStats().misses).toBe(1);
  });
});
</implementation>
</pattern>

<pattern name="Mixed Real and Mock Dependencies">
<description>
Combining real implementations with mocks for integration testing
</description>
<implementation>
import { Container } from 'inversify';
import { MockLogger } from 'test-mocks';
import { NodeFileSystem } from 'file-system';
import { MemoryCache } from 'cache';

describe('Integration Test', () => {
  let container: Container;
  let mockLogger: MockLogger;

  beforeEach(() => {
    container = new Container();
    mockLogger = new MockLogger();
    
    // Mix real and mock implementations
    container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
    container.bind&lt;IFileSystem&gt;(TYPES.IFileSystem).to(NodeFileSystem);
    container.bind&lt;ICache&gt;(TYPES.ICache).to(MemoryCache);
  });

  it('should work with real file system', async () => {
    const service = container.get&lt;DataService&gt;(DataService);
    await service.processRealFile('./test-data.json');
    
    // Verify logging happened
    expect(mockLogger.hasLogged('info', 'File processed')).toBe(true);
  });
});
</implementation>
</pattern>

<pattern name="Event-Aware Testing">
<description>
Using event-aware mocks to verify operation sequences
</description>
<implementation>
import { EventAwareMockFileSystem, EventAwareMockCache } from 'test-mocks';
import { TestEventBus } from 'event-system';

describe('Event Flow Testing', () => {
  it('should emit events in correct order', async () => {
    const eventBus = new TestEventBus();
    const fs = new EventAwareMockFileSystem();
    const cache = new EventAwareMockCache();
    
    fs.enableEventEmission(eventBus);
    cache.enableEventEmission(eventBus);
    
    const service = new CachedFileReader(fs, cache);
    
    await service.readWithCache('/config.json');
    
    // Verify event sequence
    const events = eventBus.getEmittedEvents();
    expect(events[0].type).toBe('cache.get.completed');
    expect(events[1].type).toBe('fs.read.completed');
    expect(events[2].type).toBe('cache.set.completed');
  });
});
</implementation>
</pattern>

<pattern name="Stateful Mock Testing">
<description>
Testing scenarios that depend on mock state changes
</description>
<implementation>
describe('Stateful Operations', () => {
  it('should handle cache expiration', async () => {
    const cache = new MockCache();
    const service = new ExpiringDataService(cache);
    
    // Set data with TTL
    await service.cacheData('key1', 'value1', 60); // 60 second TTL
    
    // Verify cached
    expect(await service.getData('key1')).toBe('value1');
    expect(cache.getStats().hits).toBe(1);
    
    // Simulate expiration
    cache.simulateExpiration('key1');
    
    // Verify cache miss after expiration
    expect(await service.getData('key1')).toBeNull();
    expect(cache.getStats().misses).toBe(1);
  });

  it('should create nested directories', async () => {
    const fs = new MockFileSystem();
    const writer = new FileWriter(fs);
    
    await writer.writeReport('/reports/2024/jan/report.html', content);
    
    // Verify directory structure created
    expect(fs.getDirectories()).toContain('/reports/2024/jan');
    expect(fs.exists('/reports/2024/jan/report.html')).toBe(true);
  });
});
</implementation>
</pattern>

## Testing Best Practices with Mocks

<best_practices>
<practice name="Clear State Between Tests">
<description>Always clear mock state to prevent test pollution</description>
<good>
afterEach(() => {
  mockLogger.clear();
  mockFileSystem.clear();
  mockCache.clear();
  // or mockCache.resetStats() to keep data but reset counters
});
</good>
<bad>
// No cleanup - state leaks between tests
it('test 1', () => { mockLogger.info('test'); });
it('test 2', () => { 
  // mockLogger still has calls from test 1
  expect(mockLogger.getAllCalls()).toHaveLength(0); // Fails!
});
</bad>
</practice>

<practice name="Use Type-Safe Mock References">
<description>Keep typed references to mocks for better IDE support</description>
<good>
let mockLogger: MockLogger;
let mockCache: MockCache;

beforeEach(() => {
  mockLogger = new MockLogger();
  mockCache = new MockCache();
  container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
  container.bind&lt;ICache&gt;(TYPES.ICache).toConstantValue(mockCache);
});

// Full IntelliSense for mock-specific methods
expect(mockLogger.hasLogged('error', 'failed')).toBe(true);
expect(mockCache.getHitRate()).toBeGreaterThan(50);
</good>
<bad>
const mocks = {
  logger: new MockLogger() as any,
  cache: new MockCache() as any
};
// Lost type information for mock-specific methods
</bad>
</practice>

<practice name="Seed Realistic Test Data">
<description>Use seed methods to create realistic test scenarios</description>
<good>
mockFileSystem.seed({
  '/config/app.json': JSON.stringify({ 
    name: 'test-app',
    version: '1.0.0',
    features: { cache: true }
  }),
  '/data/users.csv': 'id,name,email\n1,Alice,alice@test.com\n2,Bob,bob@test.com',
  '/logs/': null // Empty directory
});
</good>
<bad>
mockFileSystem.addFile('/file1.txt', 'test');
mockFileSystem.addFile('/file2.txt', 'test');
// Not representative of real file structure
</bad>
</practice>

<practice name="Verify Interactions, Not Implementation">
<description>Test what your code does with dependencies, not how it does it</description>
<good>
// Test the behavior
await userService.createUser({ name: 'Alice', email: 'alice@test.com' });

expect(mockLogger.hasLogged('info', 'User created')).toBe(true);
expect(mockCache.has('user:alice@test.com')).toBe(true);
</good>
<bad>
// Testing implementation details
expect(mockLogger.getAllCalls()[0].timestamp).toBeLessThan(Date.now());
expect(mockCache.getEntries().size).toBe(1);
</bad>
</practice>

<practice name="Use Assertion Helpers">
<description>Leverage built-in assertion helpers for cleaner tests</description>
<good>
// Clear, readable assertions
expect(logger.hasLogged('error', 'Connection failed')).toBe(true);
expect(cache.getHitRate()).toBeGreaterThan(80);
expect(fs.getFiles()).toContain('/output/report.pdf');
</good>
<bad>
// Manual assertion construction
const errorLogs = logger.getAllCalls().filter(c => c.level === 'error');
const hasConnectionError = errorLogs.some(c => c.message.includes('Connection failed'));
expect(hasConnectionError).toBe(true);
</bad>
</practice>
</best_practices>

## Troubleshooting

<troubleshooting>
<issue name="Mock Not Being Used">
<symptom>Real implementation is being called instead of mock</symptom>
<solution>
Ensure mock is bound before creating service instance:
```typescript
// Correct order
container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
const service = container.get&lt;MyService&gt;(MyService);

// Wrong order
const service = container.get&lt;MyService&gt;(MyService);
container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger); // Too late
```
</solution>
</issue>

<issue name="State Leaking Between Tests">
<symptom>Tests pass individually but fail when run together</symptom>
<solution>
Add proper cleanup in afterEach:
```typescript
afterEach(() => {
  mockLogger.clear();
  mockFileSystem.clear();
  mockCache.clear();
  container.unbindAll(); // Also reset DI container
});
```
</solution>
</issue>

<issue name="Type Errors with Mock Methods">
<symptom>TypeScript doesn't recognize mock-specific methods</symptom>
<solution>
Keep typed references to mocks:
```typescript
let mockLogger: MockLogger; // Not ILogger
mockLogger = new MockLogger();
container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
// Now mockLogger.hasLogged() is available
```
</solution>
</issue>
</troubleshooting>