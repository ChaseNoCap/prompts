# Event System Package API Reference

<api_overview>
The event-system package exports interfaces, classes, decorators, and utilities for event-driven debugging and testing. The main entry points are the IEventBus interface, decorators (@Emits, @Traces), and the TestEventBus for testing.
</api_overview>

## Core Interfaces

<interface name="IEventBus">
<description>
Main event bus interface for emitting and subscribing to events. Provides pub/sub functionality with wildcard support.
</description>

<method_group name="Event Emission">
<method signature="emit(event: BaseEvent): void">
<description>Emits an event to all registered listeners</description>
<param name="event" type="BaseEvent">Event object containing type, payload, and metadata</param>
<returns>void</returns>
</method>

<method signature="emitAsync(event: BaseEvent): Promise<void>">
<description>Asynchronously emits an event, useful for async listeners</description>
<param name="event" type="BaseEvent">Event object to emit</param>
<returns>Promise that resolves when all listeners have processed</returns>
</method>
</method_group>

<method_group name="Event Subscription">
<method signature="on(eventType: string, handler: EventHandler): () => void">
<description>Subscribes to events of a specific type or wildcard pattern</description>
<param name="eventType" type="string">Event type to listen for (supports wildcards: *, service.*)</param>
<param name="handler" type="EventHandler">Function to handle matching events</param>
<returns>Unsubscribe function to remove the listener</returns>
<example>
const unsubscribe = eventBus.on('report.*', (event) => {
  console.log(`Report event: ${event.type}`);
});
// Later: unsubscribe();
</example>
</method>

<method signature="once(eventType: string, handler: EventHandler): () => void">
<description>Subscribes to first occurrence of event type, then auto-unsubscribes</description>
<param name="eventType" type="string">Event type to listen for once</param>
<param name="handler" type="EventHandler">Function to handle the event</param>
<returns>Unsubscribe function (callable before event fires)</returns>
</method>

<method signature="off(eventType: string, handler: EventHandler): void">
<description>Removes a specific event handler</description>
<param name="eventType" type="string">Event type the handler was registered for</param>
<param name="handler" type="EventHandler">Handler function to remove</param>
<returns>void</returns>
</method>
</method_group>

<method_group name="Utility Methods">
<method signature="removeAllListeners(eventType?: string): void">
<description>Removes all listeners for a specific event type or all events</description>
<param name="eventType" type="string" optional="true">Event type to clear (omit to clear all)</param>
<returns>void</returns>
</method>

<method signature="listenerCount(eventType: string): number">
<description>Gets count of listeners for specific event type</description>
<param name="eventType" type="string">Event type to count listeners for</param>
<returns>Number of registered listeners</returns>
</method>
</method_group>
</interface>

<interface name="IEventEmitter">
<description>
Interface for objects that can emit events. Implemented by services using the event system.
</description>
<properties>
<property name="_eventBus" type="IEventBus | undefined" optional="true">
Internal event bus reference injected via setEventBus()
</property>
</properties>
</interface>

<interface name="BaseEvent">
<description>
Standard event structure emitted by all services
</description>
<properties>
<property name="type" type="string">Event type identifier (e.g., 'report.generation.started')</property>
<property name="payload" type="any" optional="true">Event-specific data payload</property>
<property name="timestamp" type="number">Unix timestamp when event was emitted</property>
<property name="source" type="string" optional="true">Source service/class that emitted the event</property>
<property name="metadata" type="Record<string, any>" optional="true">Additional metadata (trace info, etc.)</property>
</properties>
<example>
{
  type: 'markdown.compile.completed',
  payload: { sourceLength: 1024, outputLength: 2048 },
  timestamp: 1703001234567,
  source: 'MarkdownCompiler',
  metadata: { duration: 145, threshold: 500 }
}
</example>
</interface>

## Classes

<class name="EventBus">
<description>
Production implementation of IEventBus with full pub/sub functionality
</description>
<implements>IEventBus</implements>
<decorator>@injectable()</decorator>

<constructor signature="constructor()">
<description>Creates a new EventBus instance with empty listener registry</description>
</constructor>

<notes>
- Supports wildcard patterns: '*' matches all events, 'service.*' matches service.started, service.completed, etc.
- Thread-safe for concurrent event emission
- Listeners execute synchronously in registration order
- Errors in listeners don't affect other listeners
</notes>
</class>

<class name="TestEventBus">
<description>
Test implementation of IEventBus that captures events for assertion
</description>
<extends>EventBus</extends>

<constructor signature="constructor()">
<description>Creates TestEventBus with event capture enabled</description>
</constructor>

<method_group name="Event Capture">
<method signature="getEmittedEvents(): BaseEvent[]">
<description>Returns all events emitted since creation or last clear</description>
<returns>Array of captured events in emission order</returns>
</method>

<method signature="clearEmittedEvents(): void">
<description>Clears the captured events array</description>
<returns>void</returns>
</method>

<method signature="getEmittedEventTypes(): string[]">
<description>Returns unique event types that have been emitted</description>
<returns>Array of unique event type strings</returns>
</method>
</method_group>

<method_group name="Assertion API">
<method signature="expectEvent(eventType: string): EventAssertion">
<description>Creates assertion chain for verifying event emission</description>
<param name="eventType" type="string">Event type to assert on</param>
<returns>EventAssertion object for chaining assertions</returns>
<example>
testBus.expectEvent('report.generation.completed')
  .toHaveBeenEmitted()
  .withPayload({ success: true })
  .times(1);
</example>
</method>

<method signature="expectNoEvent(eventType: string): void">
<description>Asserts that no events of given type were emitted</description>
<param name="eventType" type="string">Event type that should not exist</param>
<throws>Error if event type was emitted</throws>
</method>
</method_group>
</class>

<class name="EventAssertion">
<description>
Fluent assertion API returned by TestEventBus.expectEvent()
</description>

<method signature="toHaveBeenEmitted(): EventAssertion">
<description>Asserts the event was emitted at least once</description>
<returns>this for chaining</returns>
<throws>Error if event was not emitted</throws>
</method>

<method signature="withPayload(expectedPayload: any): EventAssertion">
<description>Asserts event was emitted with matching payload</description>
<param name="expectedPayload" type="any">Expected payload (deep equality)</param>
<returns>this for chaining</returns>
<throws>Error if no event matches payload</throws>
</method>

<method signature="times(count: number): EventAssertion">
<description>Asserts event was emitted exactly N times</description>
<param name="count" type="number">Expected emission count</param>
<returns>this for chaining</returns>
<throws>Error if count doesn't match</throws>
</method>

<method signature="afterEvent(precedingEventType: string): EventAssertion">
<description>Asserts event was emitted after another event type</description>
<param name="precedingEventType" type="string">Event that should have occurred first</param>
<returns>this for chaining</returns>
<throws>Error if ordering is incorrect</throws>
</method>
</class>

## Decorators

<decorator name="@Emits">
<description>
Method decorator that automatically emits events for method execution lifecycle
</description>
<signature>@Emits(eventPrefix: string, options?: EmitsOptions)</signature>

<parameters>
<param name="eventPrefix" type="string">Base event name (e.g., 'report.generation')</param>
<param name="options" type="EmitsOptions" optional="true">Configuration options</param>
</parameters>

<options_interface name="EmitsOptions">
<property name="payloadMapper" type="(args: any[]) => any" optional="true">
Function to transform method arguments into event payload
</property>
<property name="includeResult" type="boolean" optional="true">
Include method result in completed event payload (default: false)
</property>
<property name="includeError" type="boolean" optional="true">
Include error details in error event payload (default: true)
</property>
</options_interface>

<events_emitted>
<event name="${eventPrefix}.started">Emitted when method execution begins</event>
<event name="${eventPrefix}.completed">Emitted when method completes successfully</event>
<event name="${eventPrefix}.error">Emitted when method throws an error</event>
</events_emitted>

<example>
class ReportService {
  @Emits('report.generation', {
    payloadMapper: (args) => ({ 
      reportType: args[0], 
      options: args[1] 
    }),
    includeResult: true
  })
  async generateReport(type: string, options: any): Promise<Report> {
    // Implementation
    return report;
  }
}

// Emits:
// - report.generation.started: { reportType: 'monthly', options: {...} }
// - report.generation.completed: { reportType: 'monthly', options: {...}, result: {...} }
// - report.generation.error: { reportType: 'monthly', options: {...}, error: {...} }
</example>
</decorator>

<decorator name="@Traces">
<description>
Method decorator that adds performance tracing to methods
</description>
<signature>@Traces(options?: TraceOptions)</signature>

<parameters>
<param name="options" type="TraceOptions" optional="true">Tracing configuration</param>
</parameters>

<options_interface name="TraceOptions">
<property name="threshold" type="number" optional="true">
Milliseconds threshold for slow operation warning (default: 1000)
</property>
<property name="eventPrefix" type="string" optional="true">
Custom event prefix (default: uses method name)
</property>
</options_interface>

<events_emitted>
<event name="${methodName}.trace">Performance trace with duration and threshold</event>
</events_emitted>

<example>
class DataProcessor {
  @Traces({ threshold: 500 })
  async processLargeDataset(data: any[]): Promise<void> {
    // Complex processing
  }
}

// Emits:
// - processLargeDataset.trace: { 
//     duration: 750, 
//     threshold: 500, 
//     exceeded: true 
//   }
</example>
</decorator>

## Utility Functions

<function name="setEventBus">
<description>
Injects event bus into a service instance to enable event emission
</description>
<signature>setEventBus(instance: IEventEmitter, eventBus: IEventBus): void</signature>
<param name="instance" type="IEventEmitter">Service instance to inject into</param>
<param name="eventBus" type="IEventBus">Event bus to inject</param>
<returns>void</returns>
<example>
constructor(@inject(TYPES.IEventBus) eventBus: IEventBus) {
  setEventBus(this, eventBus);
}
</example>
</function>

## Type Definitions

<type name="EventHandler">
<description>Function signature for event listeners</description>
<signature>type EventHandler = (event: BaseEvent) => void | Promise<void></signature>
</type>

<type name="EventPattern">
<description>Pattern for event type matching (supports wildcards)</description>
<examples>
'*' - matches all events
'report.*' - matches report.started, report.completed, etc.
'*.error' - matches all error events
'report.generation.completed' - exact match
</examples>
</type>

## Usage Examples

<example name="Complete Service Integration">
<code>
import { injectable, inject } from 'inversify';
import type { IEventBus } from 'event-system';
import { Emits, Traces, setEventBus } from 'event-system';

@injectable()
export class DocumentProcessor implements IEventEmitter {
  _eventBus?: IEventBus;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.IEventBus) eventBus: IEventBus
  ) {
    setEventBus(this, eventBus);
  }

  @Emits('document.process', {
    payloadMapper: ([doc]) => ({ 
      id: doc.id, 
      type: doc.type,
      size: doc.content.length 
    })
  })
  @Traces({ threshold: 2000 })
  async processDocument(document: Document): Promise<ProcessedDoc> {
    this.logger.info('Processing document', { id: document.id });
    
    const validated = await this.validate(document);
    const transformed = await this.transform(validated);
    const optimized = await this.optimize(transformed);
    
    return optimized;
  }
}
</code>
</example>

<example name="Testing with TestEventBus">
<code>
import { TestEventBus } from 'event-system';
import { beforeEach, it, expect } from 'vitest';

describe('DocumentProcessor', () => {
  let processor: DocumentProcessor;
  let testBus: TestEventBus;

  beforeEach(() => {
    testBus = new TestEventBus();
    processor = new DocumentProcessor(logger, testBus);
  });

  it('should emit events during processing', async () => {
    const doc = { id: '123', type: 'pdf', content: 'test' };
    
    await processor.processDocument(doc);
    
    // Verify lifecycle events
    testBus.expectEvent('document.process.started')
      .toHaveBeenEmitted()
      .withPayload({ id: '123', type: 'pdf', size: 4 });
      
    testBus.expectEvent('document.process.completed')
      .toHaveBeenEmitted()
      .times(1);
      
    // Verify performance trace
    const traceEvents = testBus.getEmittedEvents()
      .filter(e => e.type === 'processDocument.trace');
    expect(traceEvents[0].metadata.duration).toBeLessThan(2000);
  });
});
</code>
</example>