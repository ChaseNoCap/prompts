# Test Helpers Package Overview

<package_purpose>
The test-helpers package provides a comprehensive suite of testing utilities designed to reduce boilerplate and standardize testing patterns across the monorepo. It offers container setup, fixture management, async utilities, and test configuration sharing to make tests more maintainable and expressive.
</package_purpose>

## Key Features

<feature_list>
<feature name="Test Container Builder">
Simplifies dependency injection container setup for tests with automatic mock injection, cleanup tracking, and type-safe resolution of dependencies.
</feature>

<feature name="Fixture Manager">
Manages test data files and temporary directories with automatic cleanup, supporting JSON/text loading, bulk operations, and crypto-random temp paths.
</feature>

<feature name="Async Test Utilities">
Provides utilities for testing asynchronous code including waitFor conditions, promise flushing, delays, retries with backoff, and performance measurement.
</feature>

<feature name="Error Assertion Helpers">
Type-safe error assertions that verify both error type and message, making error testing more reliable and expressive.
</feature>

<feature name="Test Setup Automation">
setupTest() function provides one-line test setup with automatic container configuration, mock injection, and cleanup registration.
</feature>

<feature name="Shared Test Configuration">
Vitest configuration presets ensure consistent test settings, coverage thresholds, and runner options across all packages.
</feature>
</feature_list>

## Common Use Cases

<use_cases>
<use_case name="Quick Test Setup with Mocks">
<description>
Set up a complete test environment with mocked dependencies in a single line.
</description>
<example>
const { container, mocks, cleanup } = setupTest({
  useMocks: ['logger', 'fileSystem', 'eventBus']
});

const service = container.get(MyService);
await service.process();

expect(mocks.logger.info).toHaveBeenCalledWith('Processing started');
expect(mocks.fileSystem.writeFile).toHaveBeenCalled();
// cleanup() called automatically after test
</example>
</use_case>

<use_case name="Loading Test Fixtures">
<description>
Load test data from files with automatic path resolution and cleanup.
</description>
<example>
const fixtures = new FixtureManager(__dirname);

// Load JSON fixture
const testData = await fixtures.loadJSON('data/users.json');

// Create temp directory with fixtures
const tempDir = await fixtures.createTempDirWithFixtures({
  'config.json': { apiKey: 'test-key' },
  'data/users.csv': 'id,name\n1,John'
});

// Automatic cleanup on process exit
</example>
</use_case>

<use_case name="Testing Async Operations">
<description>
Wait for conditions, measure performance, and handle timeouts gracefully.
</description>
<example>
// Wait for condition with timeout
await waitFor(() => service.isInitialized, {
  timeout: 5000,
  interval: 100,
  message: 'Service failed to initialize'
});

// Measure operation time
const { result, duration } = await measureTime(
  () => service.processLargeDataset()
);
expect(duration).toBeLessThan(1000);

// Retry flaky operations
const data = await retry(
  () => fetchDataFromAPI(),
  { attempts: 3, delay: 1000 }
);
</example>
</use_case>

<use_case name="Parameterized Testing">
<description>
Run the same test with different inputs using testEach utility.
</description>
<example>
testEach([
  { input: '', expected: true, name: 'empty string' },
  { input: 'hello', expected: false, name: 'non-empty string' },
  { input: '   ', expected: true, name: 'whitespace only' }
])('isEmpty($name)', ({ input, expected }) => {
  expect(isEmpty(input)).toBe(expected);
});
</example>
</use_case>

<use_case name="Console Output Testing">
<description>
Capture and test console output during test execution.
</description>
<example>
const { restore, getOutput } = suppressConsole();

service.debugOperation(); // Logs to console

const output = getOutput();
expect(output.log[0]).toContain('Debug: operation started');
expect(output.error).toHaveLength(0);

restore(); // Re-enable console
</example>
</use_case>
</use_cases>

## Integration Example

<integration_example>
<description>
Complete test setup showing container configuration, fixture loading, and async testing:
</description>
<code>
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTest, FixtureManager, waitFor, measureTime } from 'test-helpers';
import { MyService } from '../src/MyService';

describe('MyService Integration', () => {
  let fixtures: FixtureManager;
  
  beforeEach(() => {
    fixtures = new FixtureManager(__dirname);
  });

  it('should process data within performance threshold', async () => {
    // Quick setup with mocks
    const { container, mocks } = setupTest({
      useMocks: ['logger', 'fileSystem', 'cache']
    });
    
    // Load test data
    const inputData = await fixtures.loadJSON('fixtures/large-dataset.json');
    
    // Configure mocks
    mocks.cache.get.mockResolvedValue(null); // Force cache miss
    
    // Get service instance
    const service = container.get(MyService);
    
    // Measure processing time
    const { result, duration } = await measureTime(
      () => service.processData(inputData)
    );
    
    // Assertions
    expect(result.recordCount).toBe(1000);
    expect(duration).toBeLessThan(500); // Under 500ms
    
    // Verify side effects
    expect(mocks.fileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('output.json'),
      expect.any(String)
    );
    
    // Wait for async cleanup
    await waitFor(() => service.isCleanedUp);
  });
});
</code>
</integration_example>

## Design Philosophy

<design_principles>
<principle name="Runner Agnostic">
Utilities work with any test framework, not just Vitest, ensuring flexibility and portability.
</principle>

<principle name="Automatic Cleanup">
All resources (containers, fixtures, temp files) are automatically cleaned up, preventing test pollution.
</principle>

<principle name="Type Safety First">
Full TypeScript support with generics and type inference for compile-time safety and better IDE support.
</principle>

<principle name="Minimal Boilerplate">
Common patterns encapsulated in simple functions, reducing repetitive test setup code.
</principle>

<principle name="Clear Separation">
Test utilities separated from mock implementations, allowing independent evolution and cleaner dependencies.
</principle>
</design_principles>