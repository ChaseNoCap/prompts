# Event System Package Overview

<package_purpose>
The event-system package provides an event-driven architecture for debugging and testing, enabling services to emit events automatically through decorators. It creates a clean separation between production event emission and test event capturing, making it easy to verify service behavior without coupling to implementation details.
</package_purpose>

## Key Features

<feature_list>
<feature name="Event Bus Architecture">
Central event dispatcher (EventBus) that manages event emission and subscription, enabling loosely coupled communication between components.
</feature>

<feature name="Automatic Event Emission">
@Emits decorator automatically wraps methods to emit started/completed/error events with configurable payload mapping, eliminating boilerplate event code.
</feature>

<feature name="Performance Tracing">
@Traces decorator adds performance monitoring to methods, emitting timing information and warnings for operations exceeding configured thresholds.
</feature>

<feature name="Test Event Capturing">
TestEventBus implementation captures all emitted events during tests, providing fluent assertion API for verifying event emission and payloads.
</feature>

<feature name="Type-Safe Events">
Strongly typed BaseEvent structure with type, payload, timestamp, source, and metadata ensures consistent event handling across the system.
</feature>

<feature name="Zero Production Overhead">
Optional integration pattern - services work normally without event bus, making it purely opt-in for debugging and testing scenarios.
</feature>
</feature_list>

## Common Use Cases

<use_cases>
<use_case name="Service Behavior Verification">
<description>
Test that services emit expected events without mocking internal implementation details.
</description>
<example>
const testBus = new TestEventBus();
const service = new ReportGenerator(logger, fs, testBus);

await service.generateReport(data);

testBus.expectEvent('report.generation.started').toHaveBeenEmitted();
testBus.expectEvent('report.generation.completed')
  .toHaveBeenEmitted()
  .withPayload({ reportPath: '/dist/report.html' });
</example>
</use_case>

<use_case name="Performance Monitoring">
<description>
Track method execution times and identify slow operations in production or development.
</description>
<example>
@Traces({ threshold: 1000 }) // Warn if takes > 1 second
async compileMarkdown(source: string): Promise<string> {
  // Complex markdown compilation
  return compiled;
}
// Emits: markdown.compile.trace with duration and threshold info
</example>
</use_case>

<use_case name="Debugging Complex Workflows">
<description>
Trace execution flow through multiple services by following event emission patterns.
</description>
<example>
// Subscribe to all events in development
eventBus.on('*', (event) => {
  logger.debug(`Event: ${event.type}`, {
    source: event.source,
    payload: event.payload,
    timestamp: event.timestamp
  });
});
</example>
</use_case>

<use_case name="Integration Testing">
<description>
Verify correct integration between services by asserting on cross-service event flows.
</description>
<example>
// Test that DependencyChecker triggers ReportGenerator
await checker.checkDependencies();

testBus.expectEvent('dependencies.check.completed').toHaveBeenEmitted();
testBus.expectEvent('report.generation.started')
  .toHaveBeenEmitted()
  .afterEvent('dependencies.check.completed');
</example>
</use_case>
</use_cases>

## Integration Example

<integration_example>
<description>
Complete service integration with event emission:
</description>
<code>
import { injectable, inject } from 'inversify';
import type { IEventBus } from 'event-system';
import { Emits, Traces, setEventBus } from 'event-system';
import { TYPES } from '../constants/injection-tokens.js';

@injectable()
export class MarkdownCompiler {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.IEventBus) eventBus: IEventBus
  ) {
    // Enable event emission for this instance
    setEventBus(this, eventBus);
  }

  @Emits('markdown.compile', {
    payloadMapper: (source: string) => ({ 
      sourceLength: source.length,
      hasCodeBlocks: source.includes('```')
    })
  })
  @Traces({ threshold: 500 })
  async compile(source: string): Promise<CompiledResult> {
    this.logger.info('Compiling markdown', { length: source.length });
    
    // Method implementation
    const ast = this.parse(source);
    const html = this.render(ast);
    
    return { html, metadata: this.extractMetadata(ast) };
  }
}

// Events emitted automatically:
// - markdown.compile.started: { sourceLength: 1024, hasCodeBlocks: true }
// - markdown.compile.trace: { duration: 245, threshold: 500 }
// - markdown.compile.completed: { sourceLength: 1024, hasCodeBlocks: true }
</code>
</integration_example>

## Design Philosophy

<design_principles>
<principle name="Opt-in Integration">
Services function normally without event bus, making event emission purely additive for debugging and testing scenarios.
</principle>

<principle name="Declarative Event Emission">
Decorators declare event emission intent at method definition, keeping business logic clean and event handling separate.
</principle>

<principle name="Test-First Design">
TestEventBus designed specifically for testing scenarios with rich assertion API, making behavior verification intuitive.
</principle>

<principle name="Minimal Performance Impact">
Event emission only occurs when event bus is injected, zero overhead in production when debugging is disabled.
</principle>

<principle name="Type Safety">
Full TypeScript support ensures event types and payloads are validated at compile time, preventing runtime errors.
</principle>
</design_principles>