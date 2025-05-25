# Test Mocks Package API Reference

<api_overview>
The test-mocks package exports mock implementations of common interfaces (ILogger, IFileSystem, ICache) along with event-aware variants. Each mock provides state tracking, assertion helpers, and reset capabilities for isolated testing.
</api_overview>

## Mock Logger

<class name="MockLogger">
<description>
Mock implementation of ILogger interface with call tracking and assertion helpers
</description>
<implements>ILogger</implements>
<decorator>@injectable()</decorator>

<constructor signature="constructor()">
<description>Creates a new MockLogger instance with empty call history</description>
</constructor>

<method_group name="Logging Methods">
<method signature="debug(message: string, ...args: any[]): void">
<description>Records a debug level log call</description>
<param name="message" type="string">Log message</param>
<param name="args" type="any[]" variadic="true">Additional context arguments</param>
</method>

<method signature="info(message: string, ...args: any[]): void">
<description>Records an info level log call</description>
<param name="message" type="string">Log message</param>
<param name="args" type="any[]" variadic="true">Additional context arguments</param>
</method>

<method signature="warn(message: string, ...args: any[]): void">
<description>Records a warning level log call</description>
<param name="message" type="string">Log message</param>
<param name="args" type="any[]" variadic="true">Additional context arguments</param>
</method>

<method signature="error(message: string, error?: Error, ...args: any[]): void">
<description>Records an error level log call</description>
<param name="message" type="string">Error message</param>
<param name="error" type="Error" optional="true">Error object</param>
<param name="args" type="any[]" variadic="true">Additional context arguments</param>
</method>

<method signature="child(context: Record<string, any>): ILogger">
<description>Creates a child logger that merges context with parent</description>
<param name="context" type="Record<string, any>">Context to add to child logger</param>
<returns>New MockLogger instance with merged context</returns>
</method>
</method_group>

<method_group name="Assertion Helpers">
<method signature="hasLogged(level: LogLevel, message: string): boolean">
<description>Checks if a specific message was logged at given level</description>
<param name="level" type="LogLevel">Log level to check ('debug' | 'info' | 'warn' | 'error')</param>
<param name="message" type="string">Message to search for (partial match)</param>
<returns>True if message was logged at level</returns>
<example>
expect(logger.hasLogged('error', 'Connection failed')).toBe(true);
</example>
</method>

<method signature="getCallsByLevel(level: LogLevel): LogCall[]">
<description>Gets all log calls for a specific level</description>
<param name="level" type="LogLevel">Log level to filter by</param>
<returns>Array of log calls for that level</returns>
<example>
const errors = logger.getCallsByLevel('error');
expect(errors).toHaveLength(2);
expect(errors[0].message).toContain('Database error');
</example>
</method>

<method signature="getCallsMatching(pattern: RegExp): LogCall[]">
<description>Gets all log calls matching a regex pattern</description>
<param name="pattern" type="RegExp">Pattern to match against messages</param>
<returns>Array of matching log calls</returns>
<example>
const dbLogs = logger.getCallsMatching(/database|connection/i);
</example>
</method>

<method signature="getAllCalls(): LogCall[]">
<description>Gets all recorded log calls</description>
<returns>Array of all log calls in order</returns>
</method>

<method signature="clear(): void">
<description>Clears all recorded log calls</description>
</method>
</method_group>

<interface name="LogCall">
<description>Structure of a recorded log call</description>
<properties>
<property name="level" type="LogLevel">Log level of the call</property>
<property name="message" type="string">Log message</property>
<property name="timestamp" type="number">Unix timestamp when logged</property>
<property name="args" type="any[]" optional="true">Additional arguments passed</property>
<property name="error" type="Error" optional="true">Error object if provided</property>
<property name="context" type="Record<string, any>" optional="true">Context from child loggers</property>
</properties>
</interface>
</class>

## Mock File System

<class name="MockFileSystem">
<description>
In-memory file system implementation for testing file operations
</description>
<implements>IFileSystem</implements>
<decorator>@injectable()</decorator>

<constructor signature="constructor()">
<description>Creates empty in-memory file system</description>
</constructor>

<method_group name="File Operations">
<method signature="readFile(path: string, encoding?: BufferEncoding): Promise<string>">
<description>Reads a file from the mock file system</description>
<param name="path" type="string">File path to read</param>
<param name="encoding" type="BufferEncoding" optional="true">Encoding (default: 'utf-8')</param>
<returns>Promise resolving to file contents</returns>
<throws>FileSystemError with code 'ENOENT' if file doesn't exist</throws>
</method>

<method signature="writeFile(path: string, data: string, encoding?: BufferEncoding): Promise<void>">
<description>Writes a file, creating parent directories as needed</description>
<param name="path" type="string">File path to write</param>
<param name="data" type="string">Content to write</param>
<param name="encoding" type="BufferEncoding" optional="true">Encoding (default: 'utf-8')</param>
<returns>Promise resolving when write completes</returns>
</method>

<method signature="exists(path: string): Promise<boolean>">
<description>Checks if file or directory exists</description>
<param name="path" type="string">Path to check</param>
<returns>Promise resolving to existence boolean</returns>
</method>

<method signature="deleteFile(path: string): Promise<void>">
<description>Deletes a file</description>
<param name="path" type="string">File to delete</param>
<returns>Promise resolving when deleted</returns>
<throws>FileSystemError with code 'ENOENT' if file doesn't exist</throws>
</method>
</method_group>

<method_group name="Directory Operations">
<method signature="createDirectory(path: string, options?: { recursive?: boolean }): Promise<void>">
<description>Creates a directory</description>
<param name="path" type="string">Directory path to create</param>
<param name="options" type="{ recursive?: boolean }" optional="true">Creation options</param>
<returns>Promise resolving when created</returns>
</method>

<method signature="listDirectory(path: string): Promise<string[]>">
<description>Lists directory contents</description>
<param name="path" type="string">Directory to list</param>
<returns>Promise resolving to array of entry names</returns>
<throws>FileSystemError with code 'ENOTDIR' if not a directory</throws>
</method>
</method_group>

<method_group name="Test Helpers">
<method signature="seed(structure: Record<string, string | null>): void">
<description>Seeds file system with initial structure</description>
<param name="structure" type="Record<string, string | null>">Object mapping paths to contents (null for directories)</param>
<example>
fs.seed({
  '/config/app.json': '{"name": "test"}',
  '/logs/': null, // Empty directory
  '/data/users.csv': 'id,name\n1,Alice'
});
</example>
</method>

<method signature="getFiles(): string[]">
<description>Gets all file paths in the mock file system</description>
<returns>Array of file paths</returns>
</method>

<method signature="getDirectories(): string[]">
<description>Gets all directory paths in the mock file system</description>
<returns>Array of directory paths</returns>
</method>

<method signature="readFileSync(path: string): string">
<description>Synchronous file read for test assertions</description>
<param name="path" type="string">File path to read</param>
<returns>File contents</returns>
<throws>Error if file doesn't exist</throws>
</method>

<method signature="addFile(path: string, content: string): void">
<description>Adds a file to the mock file system</description>
<param name="path" type="string">File path</param>
<param name="content" type="string">File content</param>
</method>

<method signature="addDirectory(path: string): void">
<description>Adds a directory to the mock file system</description>
<param name="path" type="string">Directory path</param>
</method>

<method signature="clear(): void">
<description>Clears all files and directories</description>
</method>
</method_group>

<method_group name="Path Operations">
<method signature="join(...paths: string[]): string">
<description>Joins path segments</description>
<param name="paths" type="string[]" variadic="true">Path segments</param>
<returns>Joined path</returns>
</method>

<method signature="resolve(...paths: string[]): string">
<description>Resolves to absolute path</description>
<param name="paths" type="string[]" variadic="true">Path segments</param>
<returns>Absolute path</returns>
</method>

<method signature="dirname(path: string): string">
<description>Gets directory name from path</description>
<param name="path" type="string">Path to process</param>
<returns>Directory portion</returns>
</method>

<method signature="basename(path: string, ext?: string): string">
<description>Gets base name from path</description>
<param name="path" type="string">Path to process</param>
<param name="ext" type="string" optional="true">Extension to remove</param>
<returns>Base name</returns>
</method>
</method_group>
</class>

## Mock Cache

<class name="MockCache">
<description>
In-memory cache implementation with TTL support and statistics tracking
</description>
<implements>ICache</implements>
<decorator>@injectable()</decorator>

<constructor signature="constructor()">
<description>Creates empty cache with statistics tracking</description>
</constructor>

<method_group name="Cache Operations">
<method signature="get<T>(key: string): Promise<T | null>">
<description>Gets value from cache</description>
<param name="key" type="string">Cache key</param>
<returns>Promise resolving to cached value or null</returns>
</method>

<method signature="set<T>(key: string, value: T, ttl?: number): Promise<void>">
<description>Sets value in cache with optional TTL</description>
<param name="key" type="string">Cache key</param>
<param name="value" type="T">Value to cache</param>
<param name="ttl" type="number" optional="true">Time to live in seconds</param>
<returns>Promise resolving when set</returns>
</method>

<method signature="has(key: string): Promise<boolean>">
<description>Checks if key exists and hasn't expired</description>
<param name="key" type="string">Cache key</param>
<returns>Promise resolving to existence boolean</returns>
</method>

<method signature="delete(key: string): Promise<boolean>">
<description>Deletes entry from cache</description>
<param name="key" type="string">Cache key</param>
<returns>Promise resolving to true if deleted</returns>
</method>

<method signature="clear(): Promise<void>">
<description>Clears all cache entries</description>
<returns>Promise resolving when cleared</returns>
</method>
</method_group>

<method_group name="Statistics">
<method signature="getStats(): CacheStats">
<description>Gets cache statistics</description>
<returns>Object with cache statistics</returns>
<example>
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Entries: ${stats.size}`);
</example>
</method>

<method signature="getHitRate(): number">
<description>Calculates cache hit rate as percentage</description>
<returns>Hit rate (0-100)</returns>
</method>

<method signature="resetStats(): void">
<description>Resets statistics counters to zero</description>
</method>
</method_group>

<method_group name="Test Helpers">
<method signature="simulateExpiration(key: string): void">
<description>Forces a cache entry to expire immediately</description>
<param name="key" type="string">Key to expire</param>
<example>
cache.set('user:123', userData, 3600);
cache.simulateExpiration('user:123');
expect(await cache.has('user:123')).toBe(false);
</example>
</method>

<method signature="setEntryTime(key: string, timestamp: number): void">
<description>Backdates a cache entry for testing TTL</description>
<param name="key" type="string">Cache key</param>
<param name="timestamp" type="number">Unix timestamp to set</param>
</method>

<method signature="getEntries(): Map<string, CacheEntry>">
<description>Gets raw cache entries for inspection</description>
<returns>Map of all cache entries</returns>
</method>
</method_group>

<interface name="CacheStats">
<description>Cache performance statistics</description>
<properties>
<property name="hits" type="number">Number of cache hits</property>
<property name="misses" type="number">Number of cache misses</property>
<property name="sets" type="number">Number of set operations</property>
<property name="deletes" type="number">Number of delete operations</property>
<property name="evictions" type="number">Number of TTL evictions</property>
<property name="size" type="number">Current number of entries</property>
<property name="hitRate" type="number">Hit rate percentage (0-100)</property>
</properties>
</interface>
</class>

## Event-Aware Mocks

<class name="EventAwareMock">
<description>
Base class for mocks that can emit events for debugging
</description>

<method signature="enableEventEmission(eventBus: IEventBus): void">
<description>Enables event emission for this mock</description>
<param name="eventBus" type="IEventBus">Event bus to emit to</param>
</method>

<method signature="disableEventEmission(): void">
<description>Disables event emission</description>
</method>

<method signature="isEventEmissionEnabled(): boolean">
<description>Checks if event emission is enabled</description>
<returns>True if events are being emitted</returns>
</method>
</class>

<class name="EventAwareMockLogger">
<description>
MockLogger variant that emits events for each log operation
</description>
<extends>MockLogger</extends>
<includes>EventAwareMock methods</includes>

<events_emitted>
<event name="logger.debug.completed">Emitted after debug log</event>
<event name="logger.info.completed">Emitted after info log</event>
<event name="logger.warn.completed">Emitted after warn log</event>
<event name="logger.error.completed">Emitted after error log</event>
</events_emitted>

<example>
const logger = new EventAwareMockLogger();
const eventBus = new TestEventBus();
logger.enableEventEmission(eventBus);

logger.error('Connection failed');

eventBus.expectEvent('logger.error.completed')
  .toHaveBeenEmitted()
  .withPayload({ message: 'Connection failed' });
</example>
</class>

<class name="EventAwareMockFileSystem">
<description>
MockFileSystem variant that emits events for file operations
</description>
<extends>MockFileSystem</extends>
<includes>EventAwareMock methods</includes>

<events_emitted>
<event name="fs.read.completed">Emitted after file read</event>
<event name="fs.write.completed">Emitted after file write</event>
<event name="fs.delete.completed">Emitted after file delete</event>
</events_emitted>
</class>

<class name="EventAwareMockCache">
<description>
MockCache variant that emits events for cache operations
</description>
<extends>MockCache</extends>
<includes>EventAwareMock methods</includes>

<events_emitted>
<event name="cache.get.completed">Emitted after cache get (hit or miss)</event>
<event name="cache.set.completed">Emitted after cache set</event>
<event name="cache.delete.completed">Emitted after cache delete</event>
</events_emitted>
</class>

## Usage Examples

<example name="Complete Test Setup">
<code>
import { describe, it, expect, beforeEach } from 'vitest';
import { MockLogger, MockFileSystem, MockCache } from 'test-mocks';

describe('Service Integration', () => {
  let logger: MockLogger;
  let fs: MockFileSystem;
  let cache: MockCache;

  beforeEach(() => {
    logger = new MockLogger();
    fs = new MockFileSystem();
    cache = new MockCache();

    // Seed test data
    fs.seed({
      '/config/app.json': '{"debug": true}',
      '/templates/email.html': '<h1>Hello {{name}}</h1>'
    });
  });

  afterEach(() => {
    logger.clear();
    fs.clear();
    cache.clear();
  });

  it('should cache processed templates', async () => {
    const processor = new TemplateProcessor(logger, fs, cache);
    
    // First call - cache miss
    const result1 = await processor.render('email', { name: 'Alice' });
    expect(cache.getStats().misses).toBe(1);
    expect(logger.hasLogged('info', 'Cache miss for template')).toBe(true);
    
    // Second call - cache hit
    const result2 = await processor.render('email', { name: 'Bob' });
    expect(cache.getStats().hits).toBe(1);
    expect(result1).toBe(result2); // Same cached template
  });
});
</code>
</example>