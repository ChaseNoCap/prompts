# Logger Package Integration Guide

<integration_overview>
The logger package serves as the foundation for observability across the monorepo. As a published GitHub package (@chasenogap/logger), it provides consistent structured logging that integrates with all services through dependency injection while maintaining zero coupling to other packages.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="winston" type="production">
Core logging framework providing transports, formatting, and log levels
</dependency>

<dependency name="winston-daily-rotate-file" type="production">
Transport for daily rotating log files with automatic cleanup
</dependency>

<dependency name="inversify" type="production">
Used for @injectable() decorator to enable DI integration
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="di-framework" type="registered">
<description>
Logger is registered as singleton in DI container for shared logging across all services
</description>
<code>
import { WinstonLogger } from '@chasenogap/logger';

// In container configuration
container.bind&lt;ILogger&gt;(TYPES.ILogger)
  .to(WinstonLogger)
  .inSingletonScope();

// Or with configuration
container.bind&lt;ILogger&gt;(TYPES.ILogger)
  .toDynamicValue(() => WinstonLogger.createDefault())
  .inSingletonScope();
</code>
</integration>

<integration package="all-services" type="injected">
<description>
Every service in the monorepo injects ILogger for consistent logging
</description>
<code>
@injectable()
export class AnyService {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}
  
  async doWork(): Promise&lt;void&gt; {
    this.logger.info('Starting work', { operation: 'doWork' });
    // Service logic
  }
}
</code>
</integration>

<integration package="test-mocks" type="mocked">
<description>
MockLogger provides test implementation with assertion helpers
</description>
<code>
import { MockLogger } from 'test-mocks';

const mockLogger = new MockLogger();
container.rebind&lt;ILogger&gt;(TYPES.ILogger)
  .toConstantValue(mockLogger);

// Test assertions
expect(mockLogger.hasLogged('error', 'Connection failed')).toBe(true);
expect(mockLogger.getCallsByLevel('warn')).toHaveLength(2);
</code>
</integration>

<integration package="event-system" type="consumer">
<description>
Logger can be enhanced to emit events for important log entries
</description>
<code>
@injectable()
export class EventAwareLogger extends WinstonLogger {
  constructor(
    @inject(TYPES.IEventBus) @optional() private eventBus?: IEventBus
  ) {
    super();
  }
  
  error(message: string, error?: Error, ...args: any[]): void {
    super.error(message, error, ...args);
    
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'logger.error',
        payload: { message, error, context: args[0] },
        timestamp: Date.now()
      });
    }
  }
}
</code>
</integration>

<integration package="h1b-visa-analysis" type="configured">
<description>
Main application configures logger based on environment
</description>
<code>
// In application startup
const logger = WinstonLogger.createDefault();
logger.child({ 
  service: 'h1b-analysis',
  version: packageJson.version 
});

container.bind&lt;ILogger&gt;(TYPES.ILogger)
  .toConstantValue(logger);
</code>
</integration>

<integration package="file-system" type="optional">
<description>
Logger can use IFileSystem for custom log file management
</description>
<code>
class CustomFileTransport {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem
  ) {}
  
  async log(info: LogInfo): Promise&lt;void&gt; {
    const logPath = this.fs.join('logs', `${info.level}.log`);
    const entry = JSON.stringify(info) + '\n';
    await this.fs.writeFile(logPath, entry, { flag: 'a' });
  }
}
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Request-Scoped Logging">
<description>
Create child loggers with request context for tracing
</description>
<implementation>
// Express middleware
export function requestLogger(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Create request-scoped logger
    req.logger = logger.child({
      requestId: req.id || generateId(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Log request
    req.logger.info('Incoming request');
    
    // Log response
    const startTime = Date.now();
    res.on('finish', () => {
      req.logger.info('Request completed', {
        statusCode: res.statusCode,
        duration: Date.now() - startTime
      });
    });
    
    next();
  };
}

// Usage
app.use(requestLogger(container.get&lt;ILogger&gt;(TYPES.ILogger)));

// In route handlers
app.get('/api/data', (req, res) => {
  req.logger.info('Fetching data');
  // Request ID automatically included in all logs
});
</implementation>
</pattern>

<pattern name="Service Context Logging">
<description>
Add persistent service context to all logs from a service
</description>
<implementation>
@injectable()
export abstract class BaseService {
  protected logger: ILogger;
  
  constructor(
    @inject(TYPES.ILogger) baseLogger: ILogger
  ) {
    // Add service context
    this.logger = baseLogger.child({
      service: this.constructor.name,
      layer: 'service'
    });
  }
}

@injectable()
export class UserService extends BaseService {
  async createUser(data: UserData): Promise&lt;User&gt; {
    this.logger.info('Creating user', { email: data.email });
    
    try {
      const user = await this.repository.create(data);
      this.logger.info('User created', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('User creation failed', error as Error, {
        email: data.email
      });
      throw error;
    }
  }
}
</implementation>
</pattern>

<pattern name="Operation Tracking">
<description>
Track long-running operations with structured logging
</description>
<implementation>
export function trackOperation(logger: ILogger) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const operationId = generateId();
      const opLogger = logger.child({
        operation: propertyKey,
        operationId
      });
      
      opLogger.info('Operation started', {
        args: args.length > 0 ? 'provided' : 'none'
      });
      
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        opLogger.info('Operation completed', {
          duration: Date.now() - startTime,
          success: true
        });
        
        return result;
      } catch (error) {
        opLogger.error('Operation failed', error as Error, {
          duration: Date.now() - startTime,
          success: false
        });
        throw error;
      }
    };
  };
}

// Usage
class DataProcessor {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}
  
  @trackOperation(this.logger)
  async processLargeDataset(datasetId: string): Promise&lt;void&gt; {
    // Automatically tracked with start, completion, duration
  }
}
</implementation>
</pattern>

<pattern name="Error Context Enhancement">
<description>
Enhance error logging with additional context
</description>
<implementation>
export class ErrorLogger {
  constructor(private logger: ILogger) {}
  
  logError(
    message: string, 
    error: Error, 
    context?: Record&lt;string, any&gt;
  ): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...this.extractErrorMetadata(error)
    };
    
    this.logger.error(message, error, {
      ...context,
      error: errorInfo,
      timestamp: new Date().toISOString()
    });
  }
  
  private extractErrorMetadata(error: any): Record&lt;string, any&gt; {
    const metadata: Record&lt;string, any&gt; = {};
    
    // HTTP errors
    if ('statusCode' in error) {
      metadata.statusCode = error.statusCode;
    }
    
    // Database errors
    if ('code' in error) {
      metadata.errorCode = error.code;
    }
    
    // Validation errors
    if ('validationErrors' in error) {
      metadata.validationErrors = error.validationErrors;
    }
    
    return metadata;
  }
}

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLogger = new ErrorLogger(req.logger);
  
  errorLogger.logError('Unhandled error', error, {
    url: req.url,
    body: req.body,
    query: req.query
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
</implementation>
</pattern>

<pattern name="Performance Logging">
<description>
Log performance metrics for monitoring
</description>
<implementation>
export class PerformanceLogger {
  private timers = new Map&lt;string, number&gt;();
  
  constructor(private logger: ILogger) {}
  
  startTimer(name: string, metadata?: any): void {
    this.timers.set(name, Date.now());
    this.logger.debug('Performance timer started', {
      timer: name,
      ...metadata
    });
  }
  
  endTimer(name: string, metadata?: any): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.logger.warn('Timer not found', { timer: name });
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    this.logger.info('Performance measurement', {
      timer: name,
      duration,
      ...metadata
    });
    
    // Alert on slow operations
    if (duration > 1000) {
      this.logger.warn('Slow operation detected', {
        timer: name,
        duration,
        threshold: 1000
      });
    }
    
    return duration;
  }
}

// Usage
class DatabaseService {
  private perfLogger: PerformanceLogger;
  
  constructor(
    @inject(TYPES.ILogger) logger: ILogger
  ) {
    this.perfLogger = new PerformanceLogger(logger);
  }
  
  async complexQuery(params: QueryParams): Promise&lt;Results&gt; {
    this.perfLogger.startTimer('db.complexQuery', { 
      query: params.type 
    });
    
    try {
      const results = await this.executeQuery(params);
      
      this.perfLogger.endTimer('db.complexQuery', {
        resultCount: results.length
      });
      
      return results;
    } catch (error) {
      this.perfLogger.endTimer('db.complexQuery', {
        error: true
      });
      throw error;
    }
  }
}
</implementation>
</pattern>

## Migration Guide

<migration_steps>
<step number="1" title="Replace Console Logging">
<from>
console.log('Server started on port', port);
console.error('Failed to connect to database:', error);
console.warn('Deprecation warning:', message);
</from>
<to>
import type { ILogger } from '@chasenogap/logger';

constructor(
  @inject(TYPES.ILogger) private logger: ILogger
) {}

this.logger.info('Server started', { port });
this.logger.error('Failed to connect to database', error);
this.logger.warn('Deprecation warning', { message });
</to>
</step>

<step number="2" title="Add Structured Context">
<from>
console.log(`User ${userId} logged in from ${ip} at ${time}`);
console.log(`Processing order ${orderId} for user ${userId}`);
</from>
<to>
this.logger.info('User logged in', {
  userId,
  ip,
  timestamp: time
});

this.logger.info('Processing order', {
  orderId,
  userId,
  orderValue: order.total
});
</to>
</step>

<step number="3" title="Create Service Loggers">
<from>
class MyService {
  private log(message: string) {
    console.log(`[MyService] ${message}`);
  }
}
</from>
<to>
@injectable()
class MyService {
  private logger: ILogger;
  
  constructor(
    @inject(TYPES.ILogger) baseLogger: ILogger
  ) {
    this.logger = baseLogger.child({ 
      service: 'MyService' 
    });
  }
}
</to>
</step>

<step number="4" title="Add Request Context">
<from>
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
</from>
<to>
app.use((req, res, next) => {
  req.logger = logger.child({
    requestId: generateId(),
    method: req.method,
    path: req.path
  });
  
  req.logger.info('Request received');
  next();
});
</to>
</step>
</migration_steps>

## Configuration Best Practices

<best_practices>
<practice name="Use Child Loggers for Context">
<description>Create child loggers instead of passing context in every call</description>
<good>
const userLogger = logger.child({ userId: user.id });
userLogger.info('Profile updated');
userLogger.info('Preferences saved');
userLogger.info('Notification sent');
</good>
<bad>
logger.info('Profile updated', { userId: user.id });
logger.info('Preferences saved', { userId: user.id });
logger.info('Notification sent', { userId: user.id });
</bad>
</practice>

<practice name="Log at Appropriate Levels">
<description>Use correct log levels for different scenarios</description>
<good>
logger.debug('Detailed trace information', { rawData });
logger.info('User logged in', { userId });
logger.warn('Rate limit approaching', { current: 90, max: 100 });
logger.error('Payment failed', error, { orderId });
</good>
<bad>
logger.info('Error occurred', error); // Should be error level
logger.error('User logged in'); // Should be info level
logger.debug('CRITICAL FAILURE'); // Misleading level
</bad>
</practice>

<practice name="Structure Error Logging">
<description>Include error objects properly with context</description>
<good>
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error as Error, {
    operation: 'riskyOperation',
    input: sanitizedInput,
    attempt: retryCount
  });
}
</good>
<bad>
catch (error) {
  logger.error(error.message); // Loses stack trace
  logger.error(JSON.stringify(error)); // Not structured
}
</bad>
</practice>

<practice name="Avoid Sensitive Data in Logs">
<description>Never log passwords, tokens, or personal information</description>
<good>
logger.info('User authenticated', {
  userId: user.id,
  method: 'oauth',
  provider: 'google'
});
</good>
<bad>
logger.info('User login', {
  email: user.email,
  password: user.password, // Never log passwords!
  ssn: user.ssn // PII violation
});
</bad>
</practice>

<practice name="Configure for Environment">
<description>Adjust logging based on deployment environment</description>
<good>
// Production
const logger = createLogger({
  level: 'info',
  format: 'json',
  transports: [
    { type: 'console' },
    { type: 'file', options: { dirname: '/var/log/app' } }
  ]
});

// Development
const logger = createLogger({
  level: 'debug',
  format: 'pretty',
  transports: [{ type: 'console' }]
});
</good>
</practice>
</best_practices>

## Troubleshooting

<troubleshooting>
<issue name="No Logs Appearing">
<symptom>Logger methods called but no output visible</symptom>
<solution>
Check log level configuration:
```typescript
// Ensure level allows your logs
logger.setLevel('debug'); // Shows all logs

// Check if logger is silent
const config = { silent: false };

// Verify transport configuration
const logger = createLogger({
  transports: [{ type: 'console' }]
});
```
</solution>
</issue>

<issue name="Log Files Not Rotating">
<symptom>Log files growing indefinitely</symptom>
<solution>
Configure rotation options:
```typescript
{
  type: 'file',
  options: {
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  }
}
```
</solution>
</issue>

<issue name="Performance Impact">
<symptom>Logging causing performance degradation</symptom>
<solution>
1. Reduce debug logging in production
2. Use async transports
3. Avoid logging large objects
4. Sample high-frequency logs:

```typescript
let logCounter = 0;
if (++logCounter % 100 === 0) {
  logger.debug('High frequency event', { count: logCounter });
}
```
</solution>
</issue>
</troubleshooting>