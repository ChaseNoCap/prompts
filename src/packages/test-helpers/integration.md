# Test Helpers Package Integration Guide

<integration_overview>
The test-helpers package serves as the foundation for all testing across the monorepo, providing standardized utilities that work with test-mocks for mock implementations. It integrates with the DI framework to simplify container setup and provides runner-agnostic utilities that work with any test framework.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="inversify" type="production">
Used for Container type and DI container manipulation in TestContainerBuilder
</dependency>

<dependency name="test-mocks" type="production">
Provides mock implementations (MockLogger, MockFileSystem, etc.) that test-helpers configures
</dependency>

<dependency name="vitest" type="production">
Test runner integration for configuration sharing and type definitions
</dependency>

<dependency name="@types/node" type="development">
TypeScript definitions for Node.js APIs used in fixture management
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="test-mocks" type="consumer">
<description>
Test-helpers imports and configures mock implementations from test-mocks package
</description>
<code>
import { MockLogger, MockFileSystem, MockCache } from 'test-mocks';

// TestContainerBuilder uses these mocks
private configureMocks(mockTypes: MockType[]) {
  if (mockTypes.includes('logger')) {
    const mockLogger = new MockLogger();
    this.container.bind&lt;ILogger&gt;(TYPES.ILogger)
      .toConstantValue(mockLogger);
    this.mocks.logger = mockLogger;
  }
}
</code>
</integration>

<integration package="di-framework" type="consumer">
<description>
Uses Container and injection tokens from di-framework for test container setup
</description>
<code>
import { Container } from 'inversify';
import { TYPES } from '@h1b/di-framework';

export class TestContainerBuilder {
  private container = new Container();
  
  build(): ITestContainer {
    // Configure container with test doubles
    return { container: this.container, mocks, cleanup };
  }
}
</code>
</integration>

<integration package="event-system" type="provider">
<description>
Commonly configures TestEventBus for services that use event emission
</description>
<code>
import { TestEventBus } from 'event-system';

// In test setup
const eventBus = new TestEventBus();
container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
  .toConstantValue(eventBus);

// Available in returned mocks
return { mocks: { eventBus }, ... };
</code>
</integration>

<integration package="all-packages" type="consumer">
<description>
Every package in the monorepo uses test-helpers for standardized test setup
</description>
<code>
// In any package's test file
import { setupTest, waitFor, FixtureManager } from 'test-helpers';

describe('MyService', () => {
  const { container, mocks } = setupTest({
    useMocks: ['logger', 'fileSystem']
  });
  
  // Test implementation
});
</code>
</integration>

<integration package="vitest" type="configuration">
<description>
Provides shared Vitest configuration for consistent test settings across packages
</description>
<code>
// In package's vitest.config.ts
import { createTestConfig } from 'test-helpers';

export default createTestConfig({
  // Package-specific overrides
});
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Standard Test Setup">
<description>
The most common pattern for setting up tests with mocked dependencies
</description>
<implementation>
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTest } from 'test-helpers';
import { MyService } from '../src/MyService';
import { TYPES } from '../src/constants';

describe('MyService', () => {
  let service: MyService;
  let mocks: any;

  beforeEach(() => {
    const setup = setupTest({
      useMocks: ['logger', 'fileSystem', 'cache']
    });
    
    mocks = setup.mocks;
    service = setup.container.get&lt;MyService&gt;(TYPES.MyService);
  });

  it('should process data with caching', async () => {
    // Configure mock behavior
    mocks.cache.get.mockResolvedValue(null);
    mocks.fileSystem.readFile.mockResolvedValue('test data');
    
    const result = await service.process('input.txt');
    
    // Verify interactions
    expect(mocks.cache.get).toHaveBeenCalledWith('file:input.txt');
    expect(mocks.fileSystem.readFile).toHaveBeenCalledWith('input.txt');
    expect(mocks.cache.set).toHaveBeenCalledWith('file:input.txt', result);
  });
});
</implementation>
</pattern>

<pattern name="Integration Testing with Real Dependencies">
<description>
Mix real and mocked dependencies for integration tests
</description>
<implementation>
import { createTestContainer } from 'test-helpers';
import { NodeFileSystem } from 'file-system';
import { WinstonLogger } from 'logger';

describe('Integration Test', () => {
  const { container, mocks } = createTestContainer({
    useMocks: ['cache'], // Only mock the cache
    configure: (container) => {
      // Use real implementations
      container.bind&lt;IFileSystem&gt;(TYPES.IFileSystem)
        .to(NodeFileSystem);
      container.bind&lt;ILogger&gt;(TYPES.ILogger)
        .to(WinstonLogger);
    }
  });

  it('should work with real file system', async () => {
    const service = container.get&lt;DataProcessor&gt;(TYPES.DataProcessor);
    
    // Real file operations, mocked cache
    await service.processFile('./test-data.json');
    
    expect(mocks.cache.set).toHaveBeenCalled();
  });
});
</implementation>
</pattern>

<pattern name="Fixture-Based Testing">
<description>
Load test data from fixtures and use temporary directories
</description>
<implementation>
import { FixtureManager, setupTest } from 'test-helpers';
import path from 'path';

describe('Report Generator', () => {
  let fixtures: FixtureManager;
  
  beforeEach(() => {
    fixtures = new FixtureManager(__dirname);
  });

  it('should generate report from template', async () => {
    const { container, mocks } = setupTest({
      useMocks: ['fileSystem']
    });
    
    // Load test data
    const template = await fixtures.loadText('fixtures/report-template.html');
    const data = await fixtures.loadJSON('fixtures/report-data.json');
    
    // Create temp output directory
    const outputDir = await fixtures.createTempDir();
    
    // Configure mocks to use fixtures
    mocks.fileSystem.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith('template.html')) return template;
      throw new Error(`File not found: ${path}`);
    });
    
    mocks.fileSystem.writeFile.mockResolvedValue(undefined);
    
    const generator = container.get&lt;ReportGenerator&gt;(TYPES.ReportGenerator);
    await generator.generate(data, outputDir);
    
    expect(mocks.fileSystem.writeFile).toHaveBeenCalledWith(
      path.join(outputDir, 'report.html'),
      expect.stringContaining(data.title)
    );
  });
});
</implementation>
</pattern>

<pattern name="Async Testing Utilities">
<description>
Use async utilities for testing time-dependent or async behavior
</description>
<implementation>
import { waitFor, measureTime, retry, flushPromises } from 'test-helpers';

describe('Async Operations', () => {
  it('should complete initialization', async () => {
    const service = new AsyncService();
    service.initialize(); // Non-blocking
    
    // Wait for initialization
    await waitFor(() => service.isReady, {
      timeout: 3000,
      message: 'Service failed to initialize'
    });
    
    expect(service.status).toBe('ready');
  });

  it('should perform within time limit', async () => {
    const processor = new DataProcessor();
    
    const { result, duration } = await measureTime(
      () => processor.processLargeDataset(testData)
    );
    
    expect(result.recordCount).toBe(10000);
    expect(duration).toBeLessThan(1000); // Under 1 second
  });

  it('should handle flaky API', async () => {
    let attempts = 0;
    const flakyApi = {
      fetch: async () => {
        attempts++;
        if (attempts < 3) throw new Error('Network error');
        return { data: 'success' };
      }
    };
    
    const result = await retry(
      () => flakyApi.fetch(),
      { attempts: 5, delay: 100 }
    );
    
    expect(result.data).toBe('success');
    expect(attempts).toBe(3);
  });
});
</implementation>
</pattern>

## Migration Guide

<migration_steps>
<step number="1" title="Replace Manual Container Setup">
<from>
import { Container } from 'inversify';
import { MockLogger } from './mocks';

beforeEach(() => {
  const container = new Container();
  const mockLogger = new MockLogger();
  container.bind(TYPES.ILogger).toConstantValue(mockLogger);
  
  // More setup...
});

afterEach(() => {
  // Manual cleanup
});
</from>
<to>
import { setupTest } from 'test-helpers';

beforeEach(() => {
  const { container, mocks, cleanup } = setupTest({
    useMocks: ['logger']
  });
  
  // Automatic cleanup registered
});
</to>
</step>

<step number="2" title="Use Fixture Manager for Test Data">
<from>
import fs from 'fs';
import path from 'path';

const testData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'fixtures', 'test-data.json'),
    'utf-8'
  )
);

const tempDir = fs.mkdtempSync('/tmp/test-');
// Manual cleanup needed
</from>
<to>
import { FixtureManager } from 'test-helpers';

const fixtures = new FixtureManager(__dirname);
const testData = await fixtures.loadJSON('fixtures/test-data.json');
const tempDir = await fixtures.createTempDir(); // Auto-cleanup
</to>
</step>

<step number="3" title="Replace Custom Async Utilities">
<from>
// Custom wait implementation
async function waitForCondition(fn, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Timeout');
}

await waitForCondition(() => service.isReady);
</from>
<to>
import { waitFor } from 'test-helpers';

await waitFor(() => service.isReady, {
  timeout: 5000,
  message: 'Service startup timeout'
});
</to>
</step>

<step number="4" title="Standardize Test Configuration">
<from>
// vitest.config.ts with manual configuration
export default {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist']
    }
  }
};
</from>
<to>
import { createTestConfig } from 'test-helpers';

export default createTestConfig({
  // Only specify overrides
  test: {
    setupFiles: ['./test-setup.ts']
  }
});
</to>
</step>
</migration_steps>

## Best Practices

<best_practices>
<practice name="Use SetupTest for Standard Cases">
<description>Prefer setupTest() over manual container configuration for typical test scenarios</description>
<good>
const { container, mocks } = setupTest({
  useMocks: ['logger', 'fileSystem']
});
</good>
<bad>
const container = new Container();
const logger = new MockLogger();
const fs = new MockFileSystem();
container.bind(TYPES.ILogger).toConstantValue(logger);
container.bind(TYPES.IFileSystem).toConstantValue(fs);
</bad>
</practice>

<practice name="Configure Mocks Before Getting Services">
<description>Set up mock behavior before resolving services from the container</description>
<good>
const { container, mocks } = setupTest({ useMocks: ['cache'] });
mocks.cache.get.mockResolvedValue({ data: 'cached' });

const service = container.get&lt;MyService&gt;(TYPES.MyService);
// Service constructor might check cache
</good>
<bad>
const service = container.get&lt;MyService&gt;(TYPES.MyService);
mocks.cache.get.mockResolvedValue({ data: 'cached' }); // Too late
</bad>
</practice>

<practice name="Use Fixtures for Test Data">
<description>Store test data in fixture files rather than inline for better maintainability</description>
<good>
const fixtures = new FixtureManager(__dirname);
const users = await fixtures.loadJSON('fixtures/users.json');
const template = await fixtures.loadText('fixtures/email-template.html');
</good>
<bad>
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  // ... many more lines
];
</bad>
</practice>

<practice name="Leverage Type Inference">
<description>Let TypeScript infer types from setupTest rather than explicit typing</description>
<good>
const { container, mocks } = setupTest({
  useMocks: ['logger', 'fileSystem']
});
// mocks.logger is typed as MockLogger
// mocks.fileSystem is typed as MockFileSystem
</good>
</practice>

<practice name="Clean Up in AfterEach">
<description>Always clean up test artifacts to prevent test pollution</description>
<good>
let fixtures: FixtureManager;

beforeEach(() => {
  fixtures = new FixtureManager(__dirname);
});

afterEach(async () => {
  await fixtures.cleanup(); // Clean temp directories
});
</good>
</practice>
</best_practices>