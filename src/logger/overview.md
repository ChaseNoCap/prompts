# Logger Package Overview

```xml
<package_overview name="logger">
  <metadata>
    <version>1.0.0</version>
    <coverage>90%+</coverage>
    <size>~300 lines</size>
    <status>published</status>
  </metadata>
  
  <purpose>
    Structured logging with Winston, published to GitHub Packages as @chasenocap/logger
  </purpose>
  
  <features>
    <feature>Winston-based structured logging</feature>
    <feature>Daily rotating file logs</feature>
    <feature>Console output with colorization</feature>
    <feature>Child logger support with context</feature>
    <feature>JSON format for structured data</feature>
    <feature>Environment-based log levels</feature>
  </features>
  
  <usage_example>
    <![CDATA[
    import { createLogger, ILogger } from '@chasenocap/logger';
    
    const logger = createLogger('my-service');
    
    logger.info('Service started', { port: 3000, env: 'production' });
    logger.error('Database connection failed', error);
    
    // Child logger with context
    const requestLogger = logger.child({ requestId: '123', userId: 'user-456' });
    requestLogger.info('Processing request');
    ]]>
  </usage_example>
  
  <dependencies>
    <dependency>winston</dependency>
    <dependency>winston-daily-rotate-file</dependency>
  </dependencies>
  
  <exports>
    <export type="interface">ILogger</export>
    <export type="function">createLogger</export>
    <export type="class">WinstonLogger</export>
  </exports>
  
  <consumers>
    <consumer>h1b-visa-analysis</consumer>
    <consumer>markdown-compiler</consumer>
    <consumer>all packages (via DI)</consumer>
  </consumers>
</package_overview>
```

## Key Features

The logger package provides enterprise-grade logging capabilities:

- **Structured logging** with Winston for consistent log format
- **Daily rotation** to manage log file sizes
- **Multiple transports** (console + file) with different formats
- **Child loggers** for request/operation context
- **Environment awareness** for appropriate log levels
- **JSON output** for structured data analysis

## Architecture

Published as external package to GitHub Packages:

- **Factory pattern**: `createLogger()` for easy instantiation
- **Interface-based**: `ILogger` for dependency injection
- **Transport configuration**: Console (colorized) + rotating files
- **Context propagation**: Child loggers maintain parent context

## Integration Points

As a published package, logger integrates with:

- **All local packages** via dependency injection
- **External consumers** via GitHub Packages registry
- **File system** for log storage in `logs/` directory
- **Process environment** for configuration

## Current Status

- **Version**: 1.0.0 (published to GitHub Packages)
- **Coverage**: 90%+ test coverage
- **Size**: ~300 lines (lightweight implementation)
- **State**: Production-ready and stable
- **Distribution**: Published as `@chasenocap/logger`

## Usage Patterns

### Basic Logging
```typescript
const logger = createLogger('service-name');
logger.info('Operation completed', { duration: 150, success: true });
```

### Contextual Logging  
```typescript
const requestLogger = logger.child({ 
  requestId: req.id, 
  userId: req.user?.id 
});
requestLogger.info('User action', { action: 'update_profile' });
```

### Error Logging
```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
}
```

## Development Notes

- Published to GitHub Packages for external consumption
- Used by both h1b-visa-analysis and markdown-compiler
- Follows singleton pattern for consistent log formatting
- Automatically creates `logs/` directory structure
- Log files rotate daily with 14-day retention