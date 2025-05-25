# Test Mocks Package Overview

<package_purpose>
The test-mocks package provides focused, interface-compliant mock implementations of common services for testing. It enables isolated unit testing by replacing real dependencies with controllable test doubles that track interactions and support assertions, while maintaining the exact same API contracts.
</package_purpose>

## Key Features

<feature_list>
<feature name="Interface-Compliant Mocks">
All mocks implement the exact interfaces (ILogger, IFileSystem, ICache) used in production, ensuring tests remain valid when dependencies change.
</feature>

<feature name="Built-in Assertion Helpers">
Each mock includes specialized assertion methods like hasLogged(), exists(), getCacheHits() that make test verification more expressive and maintainable.
</feature>

<feature name="State Tracking">
Mocks track all operations with timestamps, arguments, and results, enabling detailed verification of interaction patterns and call sequences.
</feature>

<feature name="Event-Aware Variants">
Optional event emission for all mocks enables integration testing scenarios where event flow verification is important.
</feature>

<feature name="Resettable State">
All mocks provide clear() or reset() methods to ensure clean state between tests, preventing test pollution and flaky behavior.
</feature>

<feature name="Minimal Dependencies">
Only depends on inversify for DI decorators, keeping the package lightweight and focused on its single responsibility.
</feature>
</feature_list>

## Common Use Cases

<use_cases>
<use_case name="Unit Testing with Isolated Dependencies">
<description>
Replace real services with mocks to test components in isolation.
</description>
<example>
const mockLogger = new MockLogger();
const mockFileSystem = new MockFileSystem();

const service = new DataProcessor(mockLogger, mockFileSystem);
await service.processFile('input.txt');

expect(mockLogger.hasLogged('info', 'Processing file: input.txt')).toBe(true);
expect(mockFileSystem.exists('output.txt')).toBe(true);
</example>
</use_case>

<use_case name="Verifying Logging Behavior">
<description>
Assert that services log appropriate messages at correct levels.
</description>
<example>
const logger = new MockLogger();
const service = new PaymentService(logger);

await service.processPayment({ amount: 100 });

const errors = logger.getCallsByLevel('error');
expect(errors).toHaveLength(0);

const infoCalls = logger.getCallsByLevel('info');
expect(infoCalls[0].message).toContain('Payment processed');
expect(infoCalls[0].context).toMatchObject({ amount: 100 });
</example>
</use_case>

<use_case name="Testing File Operations">
<description>
Simulate file system operations without touching the real file system.
</description>
<example>
const fs = new MockFileSystem();

// Seed test data
fs.seed({
  '/config/app.json': '{"name": "test-app"}',
  '/data/users.csv': 'id,name\n1,Alice\n2,Bob'
});

const config = await configLoader.load(fs);
expect(config.name).toBe('test-app');

// Verify writes
expect(fs.getFiles()).toContain('/logs/app.log');
</example>
</use_case>

<use_case name="Cache Behavior Testing">
<description>
Test cache hit/miss scenarios and TTL expiration.
</description>
<example>
const cache = new MockCache();
const service = new UserService(cache, userRepo);

// First call - cache miss
const user1 = await service.getUser('123');
expect(cache.getStats().misses).toBe(1);

// Second call - cache hit
const user2 = await service.getUser('123');
expect(cache.getStats().hits).toBe(1);
expect(cache.getHitRate()).toBe(0.5); // 1 hit, 1 miss

// Simulate expiration
cache.simulateExpiration('user:123');
const user3 = await service.getUser('123');
expect(cache.getStats().misses).toBe(2);
</example>
</use_case>

<use_case name="Event Flow Testing">
<description>
Verify services emit expected events during operations.
</description>
<example>
const mockLogger = new EventAwareMockLogger();
const eventBus = new TestEventBus();
mockLogger.enableEventEmission(eventBus);

await mockLogger.error('Database connection failed');

const events = eventBus.getEmittedEvents();
expect(events).toContainEqual(
  expect.objectContaining({
    type: 'logger.error.completed',
    payload: { message: 'Database connection failed' }
  })
);
</example>
</use_case>
</use_cases>

## Integration Example

<integration_example>
<description>
Complete test setup using mocks with dependency injection:
</description>
<code>
import { Container } from 'inversify';
import { MockLogger, MockFileSystem, MockCache } from 'test-mocks';
import { beforeEach, it, expect } from 'vitest';
import { ReportGenerator } from '../src/ReportGenerator';

describe('ReportGenerator', () => {
  let container: Container;
  let mockLogger: MockLogger;
  let mockFileSystem: MockFileSystem;
  let mockCache: MockCache;
  let generator: ReportGenerator;

  beforeEach(() => {
    // Create mocks
    mockLogger = new MockLogger();
    mockFileSystem = new MockFileSystem();
    mockCache = new MockCache();

    // Configure container
    container = new Container();
    container.bind&lt;ILogger&gt;(TYPES.ILogger).toConstantValue(mockLogger);
    container.bind&lt;IFileSystem&gt;(TYPES.IFileSystem).toConstantValue(mockFileSystem);
    container.bind&lt;ICache&gt;(TYPES.ICache).toConstantValue(mockCache);
    container.bind&lt;ReportGenerator&gt;(ReportGenerator).toSelf();

    // Get service instance
    generator = container.get&lt;ReportGenerator&gt;(ReportGenerator);

    // Seed file system with templates
    mockFileSystem.seed({
      '/templates/report.html': '&lt;h1&gt;{{title}}&lt;/h1&gt;',
      '/config/report.json': '{"outputDir": "/reports"}'
    });
  });

  it('should generate report using cached data when available', async () => {
    // Setup cache hit
    const cachedData = { title: 'Cached Report', generated: Date.now() - 1000 };
    mockCache.set('report:latest', cachedData, 3600);

    await generator.generateReport();

    // Verify cache was used
    expect(mockCache.getStats().hits).toBe(1);
    expect(mockLogger.hasLogged('info', 'Using cached report data')).toBe(true);

    // Verify file was written
    expect(mockFileSystem.exists('/reports/output.html')).toBe(true);
    const content = mockFileSystem.readFileSync('/reports/output.html');
    expect(content).toContain('Cached Report');
  });

  it('should regenerate report when cache misses', async () => {
    await generator.generateReport();

    // Verify cache miss
    expect(mockCache.getStats().misses).toBe(1);
    expect(mockLogger.hasLogged('info', 'Cache miss, generating fresh report')).toBe(true);

    // Verify cache was populated
    expect(mockCache.has('report:latest')).toBe(true);
  });
});
</code>
</integration_example>

## Design Philosophy

<design_principles>
<principle name="Single Responsibility">
Each mock has one job: implement its interface for testing. No business logic or complex behavior.
</principle>

<principle name="Interface Fidelity">
Mocks implement real interfaces exactly, ensuring tests remain valid as production code evolves.
</principle>

<principle name="Explicit State Management">
All state is explicitly managed with clear() methods, preventing hidden test dependencies.
</principle>

<principle name="Test-First API">
APIs designed for common test scenarios with built-in assertions and state inspection methods.
</principle>

<principle name="Minimal Coupling">
Mocks don't depend on each other or external packages beyond core DI framework.
</principle>
</design_principles>