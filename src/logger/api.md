# Logger Package API Reference

<api_overview>
The logger package provides a comprehensive logging solution with structured logging, context propagation, and multiple output targets. It exports the ILogger interface, WinstonLogger implementation, and configuration utilities for consistent logging across the monorepo.
</api_overview>

## Core Interfaces

<interface name="ILogger">
<description>
Main logging interface defining standard log levels and context management
</description>

<method_group name="Logging Methods">
<method signature="debug(message: string, ...args: any[]): void">
<description>Logs debug-level messages for detailed troubleshooting</description>
<param name="message" type="string">Log message</param>
<param name="args" type="any[]" variadic="true">Additional context data</param>
<example>
logger.debug('Processing request', { requestId: '123', userId: 'abc' });
</example>
</method>

<method signature="info(message: string, ...args: any[]): void">
<description>Logs informational messages about normal operations</description>
<param name="message" type="string">Log message</param>
<param name="args" type="any[]" variadic="true">Additional context data</param>
<example>
logger.info('Server started', { port: 3000, environment: 'production' });
</example>
</method>

<method signature="warn(message: string, ...args: any[]): void">
<description>Logs warning messages for potentially problematic situations</description>
<param name="message" type="string">Warning message</param>
<param name="args" type="any[]" variadic="true">Additional context data</param>
<example>
logger.warn('API rate limit approaching', { current: 950, limit: 1000 });
</example>
</method>

<method signature="error(message: string, error?: Error, ...args: any[]): void">
<description>Logs error messages with optional error objects</description>
<param name="message" type="string">Error description</param>
<param name="error" type="Error" optional="true">Error object with stack trace</param>
<param name="args" type="any[]" variadic="true">Additional context data</param>
<example>
logger.error('Database connection failed', error, { 
  host: 'db.example.com',
  retryCount: 3 
});
</example>
</method>
</method_group>

<method_group name="Context Management">
<method signature="child(context: Record<string, any>): ILogger">
<description>Creates a child logger with additional persistent context</description>
<param name="context" type="Record<string, any>">Context to add to all child logger calls</param>
<returns>New ILogger instance with merged context</returns>
<example>
const requestLogger = logger.child({ 
  requestId: req.id,
  userId: req.user.id 
});

requestLogger.info('Processing payment'); 
// Includes requestId and userId automatically
</example>
</method>
</method_group>
</interface>

<interface name="ILoggerConfig">
<description>
Configuration options for logger initialization
</description>
<properties>
<property name="level" type="LogLevel" optional="true">Minimum log level (default: 'info')</property>
<property name="format" type="'json' | 'simple' | 'pretty'" optional="true">Output format (default: 'json')</property>
<property name="transports" type="ITransportConfig[]" optional="true">Output destinations</property>
<property name="defaultMeta" type="Record<string, any>" optional="true">Default context for all logs</property>
<property name="silent" type="boolean" optional="true">Disable all output (for testing)</property>
</properties>
</interface>

<interface name="ITransportConfig">
<description>
Configuration for individual log output destinations
</description>
<properties>
<property name="type" type="'console' | 'file' | 'http'">Transport type</property>
<property name="level" type="LogLevel" optional="true">Override minimum level for this transport</property>
<property name="format" type="'json' | 'simple' | 'pretty'" optional="true">Override format</property>
<property name="options" type="any" optional="true">Transport-specific options</property>
</properties>
</interface>

## Classes

<class name="WinstonLogger">
<description>
Production implementation using Winston with daily file rotation and structured logging
</description>
<implements>ILogger</implements>
<decorator>@injectable()</decorator>

<constructor signature="constructor(config?: ILoggerConfig)">
<param name="config" type="ILoggerConfig" optional="true">Logger configuration</param>
<description>Creates logger with console and file transports by default</description>
</constructor>

<method_group name="Configuration">
<method signature="static createDefault(): WinstonLogger">
<description>Creates logger with default production settings</description>
<returns>Configured WinstonLogger instance</returns>
<example>
const logger = WinstonLogger.createDefault();
// Console output + daily rotating files in ./logs
</example>
</method>

<method signature="static createForTest(): WinstonLogger">
<description>Creates silent logger for testing</description>
<returns>Logger that produces no output</returns>
</method>

<method signature="setLevel(level: LogLevel): void">
<description>Changes minimum log level at runtime</description>
<param name="level" type="LogLevel">New minimum level</param>
</method>

<method signature="addTransport(config: ITransportConfig): void">
<description>Adds new output destination</description>
<param name="config" type="ITransportConfig">Transport configuration</param>
</method>
</method_group>

<method_group name="Winston-Specific Features">
<method signature="profile(id: string): void">
<description>Start or end a profiling timer</description>
<param name="id" type="string">Profiler identifier</param>
<example>
logger.profile('db-query');
const results = await db.query(sql);
logger.profile('db-query'); // Logs duration
</example>
</method>

<method signature="query(options: QueryOptions): Promise<QueryResult>">
<description>Query logs from file transport</description>
<param name="options" type="QueryOptions">Query parameters</param>
<returns>Matching log entries</returns>
<example>
const logs = await logger.query({
  from: new Date() - 24 * 60 * 60 * 1000,
  until: new Date(),
  level: 'error'
});
</example>
</method>
</method_group>
</class>

<class name="LoggerFactory">
<description>
Factory for creating configured logger instances
</description>

<method signature="static create(config: ILoggerConfig): ILogger">
<description>Creates logger with specified configuration</description>
<param name="config" type="ILoggerConfig">Logger configuration</param>
<returns>Configured logger instance</returns>
</method>

<method signature="static createFromEnv(): ILogger">
<description>Creates logger based on environment variables</description>
<environment>
- LOG_LEVEL: Minimum log level
- LOG_FORMAT: Output format
- LOG_DIR: Directory for file logs
- NODE_ENV: Affects default settings
</environment>
<returns>Environment-configured logger</returns>
</method>
</class>

## Configuration Examples

<example name="Production Configuration">
<code>
const productionLogger = LoggerFactory.create({
  level: 'info',
  format: 'json',
  defaultMeta: {
    service: 'h1b-analysis',
    version: process.env.npm_package_version
  },
  transports: [
    {
      type: 'console',
      format: 'simple' // Human-readable in console
    },
    {
      type: 'file',
      options: {
        dirname: './logs',
        filename: 'app-%DATE%.log',
        maxSize: '20m',
        maxFiles: '14d'
      }
    },
    {
      type: 'file',
      level: 'error',
      options: {
        dirname: './logs',
        filename: 'error-%DATE%.log'
      }
    }
  ]
});
</code>
</example>

<example name="Development Configuration">
<code>
const devLogger = LoggerFactory.create({
  level: 'debug',
  format: 'pretty', // Colorized output
  transports: [
    {
      type: 'console',
      format: 'pretty'
    }
  ]
});
</code>
</example>

<example name="Structured Logging">
<code>
// Create logger with service context
const logger = WinstonLogger.createDefault().child({
  service: 'user-service',
  environment: process.env.NODE_ENV
});

// Create request-scoped logger
app.use((req, res, next) => {
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Use in request handler
app.post('/users', async (req, res) => {
  req.logger.info('Creating user', { email: req.body.email });
  
  try {
    const user = await createUser(req.body);
    req.logger.info('User created', { userId: user.id });
    res.json(user);
  } catch (error) {
    req.logger.error('User creation failed', error);
    res.status(500).json({ error: 'Internal error' });
  }
});
</code>
</example>

## Type Definitions

<type name="LogLevel">
<description>Available log levels in order of severity</description>
<values>'debug' | 'info' | 'warn' | 'error'</values>
<notes>
- debug: Detailed information for diagnosing problems
- info: General informational messages
- warn: Warning messages for potentially harmful situations  
- error: Error messages for failures
</notes>
</type>

<type name="LogFormat">
<description>Output format options</description>
<values>
- 'json': Structured JSON output for parsing
- 'simple': Plain text with timestamp and level
- 'pretty': Colorized output for development
</values>
</type>

<type name="QueryOptions">
<description>Options for querying log history</description>
<properties>
<property name="from" type="Date" optional="true">Start time for query</property>
<property name="until" type="Date" optional="true">End time for query</property>
<property name="limit" type="number" optional="true">Maximum results</property>
<property name="level" type="LogLevel" optional="true">Filter by level</property>
<property name="fields" type="string[]" optional="true">Fields to include</property>
</properties>
</type>

## Utility Functions

<function name="createLogger">
<description>
Convenience function for creating logger with defaults
</description>
<signature>createLogger(config?: Partial<ILoggerConfig>): ILogger</signature>
<param name="config" type="Partial<ILoggerConfig>" optional="true">Override default configuration</param>
<returns>Configured logger instance</returns>
<example>
import { createLogger } from '@chasenocap/logger';

const logger = createLogger({
  level: 'debug',
  defaultMeta: { component: 'data-processor' }
});
</example>
</function>

<function name="formatError">
<description>
Formats error objects for structured logging
</description>
<signature>formatError(error: Error): ErrorInfo</signature>
<param name="error" type="Error">Error to format</param>
<returns>Structured error information</returns>
<example>
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', formatError(error as Error));
}
</example>
</function>

<function name="redact">
<description>
Redacts sensitive information from log data
</description>
<signature>redact(data: any, fields: string[]): any</signature>
<param name="data" type="any">Data to redact</param>
<param name="fields" type="string[]">Field names to redact</param>
<returns>Data with redacted fields</returns>
<example>
logger.info('User login', redact(userData, ['password', 'ssn']));
// password and ssn fields replaced with '[REDACTED]'
</example>
</function>

## Environment Variables

<environment_variables>
<variable name="LOG_LEVEL">
<description>Sets minimum log level</description>
<values>debug | info | warn | error</values>
<default>info</default>
</variable>

<variable name="LOG_FORMAT">
<description>Sets output format</description>
<values>json | simple | pretty</values>
<default>json in production, pretty in development</default>
</variable>

<variable name="LOG_DIR">
<description>Directory for log files</description>
<default>./logs</default>
</variable>

<variable name="LOG_MAX_FILES">
<description>Maximum days to retain log files</description>
<default>14d</default>
</variable>

<variable name="LOG_MAX_SIZE">
<description>Maximum size per log file</description>
<default>20m</default>
</variable>
</environment_variables>

## Best Practices Examples

<example name="Service-Oriented Logging">
<code>
// Base logger for service
const baseLogger = createLogger({
  defaultMeta: {
    service: 'report-generator',
    version: '1.0.0',
    pid: process.pid
  }
});

// Operation-specific logger
export function createOperationLogger(operation: string) {
  return baseLogger.child({
    operation,
    startTime: new Date().toISOString()
  });
}

// Usage in service method
async function generateReport(data: ReportData) {
  const logger = createOperationLogger('generateReport');
  logger.info('Starting report generation', { 
    reportType: data.type,
    dataSize: data.records.length 
  });
  
  try {
    const report = await processData(data);
    logger.info('Report generated successfully', {
      duration: Date.now() - startTime,
      outputSize: report.size
    });
    return report;
  } catch (error) {
    logger.error('Report generation failed', error as Error, {
      reportType: data.type,
      stage: 'processing'
    });
    throw error;
  }
}
</code>
</example>