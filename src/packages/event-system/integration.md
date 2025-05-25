# Event System Package Integration Guide

<integration_overview>
The event-system package provides an opt-in debugging and testing infrastructure that integrates seamlessly with dependency injection. Services can emit events automatically through decorators, while tests can capture and assert on these events without mocking internals.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="inversify" type="production">
Used for @injectable decorator on EventBus class and DI integration patterns
</dependency>

<dependency name="vitest" type="development">
Test framework used in examples and TestEventBus assertions
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="di-framework" type="registered">
<description>
EventBus is registered as optional singleton in DI container, allowing services to optionally inject it for debugging
</description>
<code>
// In container configuration
import { EventBus } from 'event-system';

container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
  .to(EventBus)
  .inSingletonScope()
  .when(() => process.env.NODE_ENV !== 'production');
</code>
</integration>

<integration package="test-helpers" type="provider">
<description>
TestEventBus is commonly provided by test helpers for consistent test setup across services
</description>
<code>
// In TestContainer
export class TestContainer {
  private eventBus = new TestEventBus();
  
  build(): Container {
    const container = new Container();
    container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
      .toConstantValue(this.eventBus);
    return container;
  }
  
  getEventBus(): TestEventBus {
    return this.eventBus;
  }
}
</code>
</integration>

<integration package="logger" type="consumer">
<description>
Logger service can optionally emit events for important log entries, enabling test verification of logging behavior
</description>
<code>
@injectable()
export class WinstonLogger implements ILogger {
  constructor(@inject(TYPES.IEventBus) @optional() eventBus?: IEventBus) {
    if (eventBus) setEventBus(this, eventBus);
  }
  
  @Emits('logger.error')
  error(message: string, error?: Error): void {
    this.winston.error(message, { error });
  }
}
</code>
</integration>

<integration package="cache" type="consumer">
<description>
Cache decorators emit events for cache hits/misses, enabling cache effectiveness monitoring
</description>
<code>
@Cacheable({
  key: (id: string) => `user:${id}`,
  ttl: 300,
  eventBus: container.get&lt;IEventBus&gt;(TYPES.IEventBus)
})
async getUser(id: string): Promise&lt;User&gt; {
  // Emits cache.hit or cache.miss events
  return this.fetchUser(id);
}
</code>
</integration>

<integration package="report-generator" type="consumer">
<description>
ReportGenerator emits detailed events for report generation workflow, enabling progress tracking and debugging
</description>
<code>
@injectable()
export class ReportGenerator {
  constructor(
    @inject(TYPES.IEventBus) @optional() eventBus?: IEventBus
  ) {
    if (eventBus) setEventBus(this, eventBus);
  }
  
  @Emits('report.generation', {
    payloadMapper: ([data]) => ({ 
      templateCount: data.templates.length,
      hasComponents: !!data.components 
    })
  })
  @Traces({ threshold: 5000 })
  async generateReport(data: ReportData): Promise&lt;void&gt; {
    // Report generation logic
  }
}
</code>
</integration>

<integration package="file-system" type="consumer">
<description>
File system operations can emit events for I/O monitoring and debugging file access patterns
</description>
<code>
@injectable()
export class NodeFileSystem implements IFileSystem {
  constructor(@inject(TYPES.IEventBus) @optional() eventBus?: IEventBus) {
    if (eventBus) setEventBus(this, eventBus);
  }
  
  @Emits('fs.write', {
    payloadMapper: ([path, data]) => ({ 
      path, 
      size: data.length 
    })
  })
  async writeFile(path: string, data: string): Promise&lt;void&gt; {
    // File write implementation
  }
}
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Optional Event Bus Injection">
<description>
Make event bus optional so services work without it in production
</description>
<implementation>
import { injectable, inject, optional } from 'inversify';
import type { IEventBus } from 'event-system';
import { setEventBus } from 'event-system';

@injectable()
export class MyService {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.IEventBus) @optional() eventBus?: IEventBus
  ) {
    if (eventBus) {
      setEventBus(this, eventBus);
      this.logger.debug('Event bus connected to MyService');
    }
  }
}
</implementation>
</pattern>

<pattern name="Conditional Event Emission">
<description>
Enable event emission only in development/test environments
</description>
<implementation>
// Container configuration
export function configureContainer(): Container {
  const container = new Container();
  
  // Only bind EventBus in non-production
  if (process.env.NODE_ENV !== 'production') {
    container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
      .to(EventBus)
      .inSingletonScope();
  }
  
  return container;
}

// Service automatically gets undefined in production
@injectable()
export class ProductionSafeService {
  constructor(
    @inject(TYPES.IEventBus) @optional() eventBus?: IEventBus
  ) {
    // Only sets if eventBus is provided
    if (eventBus) setEventBus(this, eventBus);
  }
}
</implementation>
</pattern>

<pattern name="Test Setup with Events">
<description>
Standard test setup pattern with event assertion support
</description>
<implementation>
import { TestEventBus } from 'event-system';
import { Container } from 'inversify';
import { beforeEach, afterEach, it, expect } from 'vitest';

describe('ServiceWithEvents', () => {
  let container: Container;
  let eventBus: TestEventBus;
  let service: MyService;

  beforeEach(() => {
    container = new Container();
    eventBus = new TestEventBus();
    
    // Bind test event bus
    container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
      .toConstantValue(eventBus);
    
    // Setup other dependencies
    container.bind&lt;MyService&gt;(MyService).toSelf();
    
    service = container.get&lt;MyService&gt;(MyService);
  });

  afterEach(() => {
    eventBus.clearEmittedEvents();
  });

  it('should emit expected events', async () => {
    await service.doWork('input');
    
    eventBus.expectEvent('work.started')
      .toHaveBeenEmitted()
      .withPayload({ input: 'input' });
      
    eventBus.expectEvent('work.completed')
      .toHaveBeenEmitted()
      .times(1);
  });
});
</implementation>
</pattern>

<pattern name="Cross-Service Event Flow">
<description>
Testing event flow between multiple services
</description>
<implementation>
describe('Integration Flow', () => {
  let eventBus: TestEventBus;
  let checker: DependencyChecker;
  let generator: ReportGenerator;

  beforeEach(() => {
    eventBus = new TestEventBus();
    const container = createTestContainer(eventBus);
    
    checker = container.get&lt;DependencyChecker&gt;(TYPES.IDependencyChecker);
    generator = container.get&lt;ReportGenerator&gt;(TYPES.IReportGenerator);
    
    // Subscribe generator to checker events
    eventBus.on('dependencies.check.completed', async (event) => {
      if (event.payload.allPresent) {
        await generator.generateReport(event.payload.data);
      }
    });
  });

  it('should trigger report generation after dependency check', async () => {
    await checker.checkDependencies();
    
    // Verify event sequence
    eventBus.expectEvent('dependencies.check.started')
      .toHaveBeenEmitted();
      
    eventBus.expectEvent('dependencies.check.completed')
      .toHaveBeenEmitted()
      .withPayload({ allPresent: true });
      
    eventBus.expectEvent('report.generation.started')
      .toHaveBeenEmitted()
      .afterEvent('dependencies.check.completed');
  });
});
</implementation>
</pattern>

## Migration Guide

<migration_steps>
<step number="1" title="Add Event Bus to Service">
<from>
@injectable()
export class MyService {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}
  
  async processData(data: any): Promise&lt;Result&gt; {
    this.logger.info('Processing data');
    const result = await this.transform(data);
    this.logger.info('Processing complete');
    return result;
  }
}
</from>
<to>
import { Emits, setEventBus } from 'event-system';

@injectable()
export class MyService implements IEventEmitter {
  _eventBus?: IEventBus;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.IEventBus) @optional() eventBus?: IEventBus
  ) {
    if (eventBus) setEventBus(this, eventBus);
  }
  
  @Emits('data.process', {
    payloadMapper: ([data]) => ({ size: data.length })
  })
  async processData(data: any): Promise&lt;Result&gt; {
    this.logger.info('Processing data');
    const result = await this.transform(data);
    this.logger.info('Processing complete');
    return result;
  }
}
</to>
</step>

<step number="2" title="Update Tests to Use Events">
<from>
it('should process data', async () => {
  const mockLogger = createMockLogger();
  const service = new MyService(mockLogger);
  
  const result = await service.processData([1, 2, 3]);
  
  expect(result).toEqual({ count: 3 });
  expect(mockLogger.info).toHaveBeenCalledWith('Processing data');
});
</from>
<to>
it('should process data and emit events', async () => {
  const eventBus = new TestEventBus();
  const container = createTestContainer();
  container.bind&lt;IEventBus&gt;(TYPES.IEventBus)
    .toConstantValue(eventBus);
  
  const service = container.get&lt;MyService&gt;(MyService);
  const result = await service.processData([1, 2, 3]);
  
  expect(result).toEqual({ count: 3 });
  
  eventBus.expectEvent('data.process.started')
    .toHaveBeenEmitted()
    .withPayload({ size: 3 });
    
  eventBus.expectEvent('data.process.completed')
    .toHaveBeenEmitted();
});
</to>
</step>

<step number="3" title="Add Performance Tracing">
<from>
async complexOperation(input: string): Promise&lt;string&gt; {
  const start = Date.now();
  const result = await this.slowProcess(input);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    this.logger.warn('Slow operation', { duration });
  }
  
  return result;
}
</from>
<to>
@Traces({ threshold: 1000 })
async complexOperation(input: string): Promise&lt;string&gt; {
  const result = await this.slowProcess(input);
  return result;
}
// Automatically emits trace event with duration when threshold exceeded
</to>
</step>
</migration_steps>

## Best Practices

<best_practices>
<practice name="Make Event Bus Optional">
<description>Always use @optional() decorator to ensure services work without event bus</description>
<good>
constructor(
  @inject(TYPES.IEventBus) @optional() eventBus?: IEventBus
) {
  if (eventBus) setEventBus(this, eventBus);
}
</good>
<bad>
constructor(
  @inject(TYPES.IEventBus) eventBus: IEventBus // Required - fails without it
) {
  setEventBus(this, eventBus);
}
</bad>
</practice>

<practice name="Use Meaningful Event Names">
<description>Follow dot notation with service.action pattern for clear event taxonomy</description>
<good>
@Emits('report.generation')
@Emits('dependency.check')
@Emits('cache.invalidation')
</good>
<bad>
@Emits('generate')  // Too generic
@Emits('rpt_gen')   // Unclear abbreviation
@Emits('REPORT')    // Wrong case convention
</bad>
</practice>

<practice name="Include Relevant Payload Data">
<description>Map method arguments to meaningful payload that aids debugging</description>
<good>
@Emits('file.write', {
  payloadMapper: ([path, content]) => ({
    path,
    size: content.length,
    directory: path.substring(0, path.lastIndexOf('/'))
  })
})
</good>
<bad>
@Emits('file.write', {
  payloadMapper: (args) => args  // Raw arguments not helpful
})
</bad>
</practice>

<practice name="Clear Events in Test Cleanup">
<description>Always clear captured events between tests to prevent interference</description>
<good>
afterEach(() => {
  eventBus.clearEmittedEvents();
  container.unbindAll();
});
</good>
</practice>

<practice name="Use Wildcards for Monitoring">
<description>Subscribe to wildcard patterns for comprehensive debugging</description>
<good>
// Development monitoring
if (process.env.DEBUG) {
  eventBus.on('*', (event) => {
    logger.debug(`[EVENT] ${event.type}`, event.payload);
  });
  
  eventBus.on('*.error', (event) => {
    logger.error(`[ERROR EVENT] ${event.type}`, event.payload);
  });
}
</good>
</practice>
</best_practices>