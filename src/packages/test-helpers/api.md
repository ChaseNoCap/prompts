# Test Helpers Package API Reference

<api_overview>
The test-helpers package exports utilities for test setup, fixture management, async testing, and configuration sharing. All exports are designed to work with any test framework while providing first-class TypeScript support.
</api_overview>

## Container Utilities

<class name="TestContainerBuilder">
<description>
Builder for creating test containers with automatic mock injection and cleanup tracking
</description>

<constructor signature="constructor()">
<description>Creates a new TestContainerBuilder instance</description>
</constructor>

<method_group name="Configuration">
<method signature="withMocks(mockTypes: MockType[]): TestContainerBuilder">
<description>Configures which mocks to inject into the container</description>
<param name="mockTypes" type="MockType[]">Array of mock types: 'logger', 'fileSystem', 'cache', 'eventBus'</param>
<returns>Builder instance for chaining</returns>
<example>
builder.withMocks(['logger', 'fileSystem'])
</example>
</method>

<method signature="withBindings(configure: (container: Container) => void): TestContainerBuilder">
<description>Adds custom bindings to the container</description>
<param name="configure" type="(container: Container) => void">Function to configure additional bindings</param>
<returns>Builder instance for chaining</returns>
</method>

<method signature="withOptions(options: Partial<ITestContainerOptions>): TestContainerBuilder">
<description>Sets container options</description>
<param name="options" type="Partial<ITestContainerOptions>">Container configuration options</param>
<returns>Builder instance for chaining</returns>
</method>
</method_group>

<method_group name="Building">
<method signature="build(): ITestContainer">
<description>Builds the configured test container</description>
<returns>Test container with mocks and cleanup tracking</returns>
</method>
</method_group>
</class>

<interface name="ITestContainer">
<description>
Test container with integrated mocks and utilities
</description>
<properties>
<property name="container" type="Container">Inversify container instance</property>
<property name="mocks" type="TestMocks">Object containing all configured mocks</property>
<property name="cleanup" type="() => void">Function to clean up container and mocks</property>
</properties>
</interface>

<function name="createTestContainer">
<description>
Creates a test container with specified mocks
</description>
<signature>createTestContainer(options?: ITestContainerOptions): ITestContainer</signature>
<param name="options" type="ITestContainerOptions" optional="true">Container configuration</param>
<returns>Configured test container</returns>
<example>
const { container, mocks } = createTestContainer({
  useMocks: ['logger', 'fileSystem']
});
</example>
</function>

<function name="setupTest">
<description>
One-line test setup with automatic cleanup registration
</description>
<signature>setupTest(options?: ITestSetupOptions): ITestSetup</signature>
<param name="options" type="ITestSetupOptions" optional="true">Setup configuration</param>
<returns>Test setup object with container, mocks, and cleanup</returns>
<example>
const { container, mocks, cleanup } = setupTest({
  useMocks: ['logger', 'cache'],
  autoCleanup: true
});
</example>
</function>

## Fixture Management

<class name="FixtureManager">
<description>
Manages test fixtures and temporary directories with automatic cleanup
</description>

<constructor signature="constructor(baseDir: string, options?: IFixtureOptions)">
<param name="baseDir" type="string">Base directory for resolving fixture paths</param>
<param name="options" type="IFixtureOptions" optional="true">Configuration options</param>
</constructor>

<method_group name="Loading Fixtures">
<method signature="loadJSON<T>(relativePath: string): Promise<T>">
<description>Loads and parses a JSON fixture file</description>
<param name="relativePath" type="string">Path relative to base directory</param>
<returns>Parsed JSON content with type T</returns>
<throws>Error if file not found or invalid JSON</throws>
</method>

<method signature="loadText(relativePath: string): Promise<string>">
<description>Loads a text fixture file</description>
<param name="relativePath" type="string">Path relative to base directory</param>
<returns>File contents as string</returns>
</method>

<method signature="loadFixtures(pattern: string): Promise<Map<string, string>>">
<description>Loads multiple fixtures matching a glob pattern</description>
<param name="pattern" type="string">Glob pattern for matching files</param>
<returns>Map of relative paths to file contents</returns>
</method>
</method_group>

<method_group name="Temporary Directories">
<method signature="createTempDir(): Promise<string>">
<description>Creates a temporary directory with crypto-random name</description>
<returns>Path to created directory</returns>
<example>
const tempDir = await fixtures.createTempDir();
// Returns: /tmp/test-7f3a9b2c/
</example>
</method>

<method signature="createTempDirWithFixtures(files: Record<string, any>): Promise<string>">
<description>Creates temp directory populated with specified files</description>
<param name="files" type="Record<string, any>">Object mapping paths to contents</param>
<returns>Path to created directory</returns>
<example>
const dir = await fixtures.createTempDirWithFixtures({
  'config.json': { debug: true },
  'data/users.csv': 'id,name\n1,Alice'
});
</example>
</method>

<method signature="cleanup(): Promise<void>">
<description>Manually cleans up all created temp directories</description>
<returns>Promise that resolves when cleanup is complete</returns>
</method>
</method_group>

<method_group name="Utilities">
<method signature="getFixturePath(relativePath: string): string">
<description>Resolves a fixture path relative to base directory</description>
<param name="relativePath" type="string">Relative path to resolve</param>
<returns>Absolute path to fixture</returns>
</method>

<method signature="exists(relativePath: string): Promise<boolean>">
<description>Checks if a fixture file exists</description>
<param name="relativePath" type="string">Path to check</param>
<returns>True if file exists</returns>
</method>
</method_group>
</class>

## Async Utilities

<function name="waitFor">
<description>
Waits for a condition to become true with configurable timeout
</description>
<signature>waitFor(condition: () => boolean | Promise<boolean>, options?: WaitForOptions): Promise<void></signature>
<param name="condition" type="() => boolean | Promise<boolean>">Function that returns true when condition is met</param>
<param name="options" type="WaitForOptions" optional="true">Wait configuration</param>
<throws>TimeoutError if condition not met within timeout</throws>
<example>
await waitFor(() => service.isReady, {
  timeout: 5000,
  interval: 100,
  message: 'Service startup timeout'
});
</example>
</function>

<interface name="WaitForOptions">
<properties>
<property name="timeout" type="number" optional="true">Maximum wait time in ms (default: 5000)</property>
<property name="interval" type="number" optional="true">Check interval in ms (default: 100)</property>
<property name="message" type="string" optional="true">Custom timeout error message</property>
</properties>
</interface>

<function name="measureTime">
<description>
Measures execution time of an async operation
</description>
<signature>measureTime<T>(operation: () => Promise<T>): Promise<MeasureResult<T>></signature>
<param name="operation" type="() => Promise<T>">Async function to measure</param>
<returns>Result with value and duration</returns>
<example>
const { result, duration } = await measureTime(
  () => complexOperation()
);
console.log(`Operation took ${duration}ms`);
</example>
</function>

<interface name="MeasureResult">
<properties>
<property name="result" type="T">Return value of the operation</property>
<property name="duration" type="number">Execution time in milliseconds</property>
</properties>
</interface>

<function name="delay">
<description>
Creates a promise that resolves after specified milliseconds
</description>
<signature>delay(ms: number): Promise<void></signature>
<param name="ms" type="number">Milliseconds to wait</param>
<returns>Promise that resolves after delay</returns>
</function>

<function name="retry">
<description>
Retries an operation with exponential backoff
</description>
<signature>retry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T></signature>
<param name="operation" type="() => Promise<T>">Operation to retry</param>
<param name="options" type="RetryOptions" optional="true">Retry configuration</param>
<returns>Result of successful operation</returns>
<throws>Last error if all attempts fail</throws>
<example>
const data = await retry(
  () => fetchFromAPI(),
  { attempts: 3, delay: 1000, backoff: 2 }
);
</example>
</function>

<interface name="RetryOptions">
<properties>
<property name="attempts" type="number" optional="true">Maximum retry attempts (default: 3)</property>
<property name="delay" type="number" optional="true">Initial delay between attempts in ms (default: 1000)</property>
<property name="backoff" type="number" optional="true">Backoff multiplier (default: 2)</property>
<property name="onRetry" type="(error: Error, attempt: number) => void" optional="true">Callback on each retry</property>
</properties>
</interface>

<function name="flushPromises">
<description>
Flushes all pending promise callbacks
</description>
<signature>flushPromises(): Promise<void></signature>
<returns>Promise that resolves after all microtasks complete</returns>
<example>
emitter.emit('event');
await flushPromises(); // Ensure all async handlers complete
expect(sideEffect).toBe(true);
</example>
</function>

## Assertion Utilities

<function name="assertThrowsError">
<description>
Type-safe assertion for async error throwing
</description>
<signature>assertThrowsError<T extends Error>(fn: () => Promise<any>, errorType: new (...args: any[]) => T, message?: string | RegExp): Promise<T></signature>
<param name="fn" type="() => Promise<any>">Async function expected to throw</param>
<param name="errorType" type="new (...args: any[]) => T">Expected error constructor</param>
<param name="message" type="string | RegExp" optional="true">Expected error message</param>
<returns>The thrown error for further assertions</returns>
<example>
const error = await assertThrowsError(
  () => service.validate(invalidData),
  ValidationError,
  /Invalid format/
);
expect(error.code).toBe('INVALID_FORMAT');
</example>
</function>

<function name="createSpiedInstance">
<description>
Creates a spy wrapper around class instance methods
</description>
<signature>createSpiedInstance<T>(instance: T): SpiedInstance<T></signature>
<param name="instance" type="T">Instance to spy on</param>
<returns>Instance with all methods wrapped as spies</returns>
<example>
const service = createSpiedInstance(new MyService());
await service.process();
expect(service.process).toHaveBeenCalledOnce();
</example>
</function>

## Test Setup Utilities

<function name="withTestContext">
<description>
Creates a test context with automatic cleanup
</description>
<signature>withTestContext<T>(setup: () => Promise<T> | T, cleanup: (context: T) => Promise<void> | void): () => Promise<T></signature>
<param name="setup" type="() => Promise<T> | T">Setup function returning context</param>
<param name="cleanup" type="(context: T) => Promise<void> | void">Cleanup function</param>
<returns>Function that returns context and auto-registers cleanup</returns>
<example>
const getDb = withTestContext(
  () => createTestDatabase(),
  (db) => db.close()
);

it('should query data', async () => {
  const db = await getDb(); // Cleanup registered automatically
  const results = await db.query('SELECT * FROM users');
  expect(results).toHaveLength(2);
});
</example>
</function>

<function name="testEach">
<description>
Runs parameterized tests with different inputs
</description>
<signature>testEach<T>(cases: T[]): (name: string, fn: (data: T) => void) => void</signature>
<param name="cases" type="T[]">Array of test cases</param>
<returns>Function to define parameterized test</returns>
<example>
testEach([
  { input: 0, expected: 'zero' },
  { input: 1, expected: 'one' },
  { input: -1, expected: 'negative' }
])('numberToWord($input)', ({ input, expected }) => {
  expect(numberToWord(input)).toBe(expected);
});
</example>
</function>

<function name="suppressConsole">
<description>
Temporarily suppresses console output and captures it
</description>
<signature>suppressConsole(): ConsoleCapture</signature>
<returns>Object with restore function and output getters</returns>
<example>
const { restore, getOutput } = suppressConsole();

console.log('Debug message');
console.error('Error message');

const output = getOutput();
expect(output.log).toContain('Debug message');
expect(output.error).toContain('Error message');

restore();
</example>
</function>

<interface name="ConsoleCapture">
<properties>
<property name="restore" type="() => void">Restores original console methods</property>
<property name="getOutput" type="() => ConsoleOutput">Returns captured output</property>
</properties>
</interface>

## Configuration Utilities

<function name="sharedTestConfig">
<description>
Base Vitest configuration for consistent test settings
</description>
<signature>const sharedTestConfig: VitestConfig</signature>
<example>
// vitest.config.ts
import { sharedTestConfig } from 'test-helpers';

export default sharedTestConfig;
</example>
</function>

<function name="createTestConfig">
<description>
Creates extended test configuration
</description>
<signature>createTestConfig(overrides?: Partial<VitestConfig>): VitestConfig</signature>
<param name="overrides" type="Partial<VitestConfig>" optional="true">Configuration to merge with base</param>
<returns>Complete Vitest configuration</returns>
<example>
export default createTestConfig({
  coverage: {
    exclude: ['**/generated/**']
  }
});
</example>
</function>