# DI Framework Package Overview

```xml
<package_overview name="di-framework">
  <metadata>
    <version>1.0.0</version>
    <coverage>84%</coverage>
    <size>~689 lines</size>
    <status>stable</status>
  </metadata>
  
  <purpose>
    Provides dependency injection utilities and base interfaces for the H1B monorepo - a thin, focused wrapper around Inversify
  </purpose>
  
  <features>
    <feature>Type-safe token creation and registry</feature>
    <feature>Fluent API container building with ContainerBuilder</feature>
    <feature>Common interfaces (IResult, IDisposable, IInitializable, IOptions)</feature>
    <feature>Testing support with TestContainerBuilder</feature>
    <feature>Structured error classes for DI scenarios</feature>
    <feature>Container middleware and event system integration</feature>
    <feature>Performance monitoring for resolutions</feature>
    <feature>Custom decorators beyond Inversify defaults</feature>
  </features>
  
  <usage_example>
    <![CDATA[
    import { ContainerBuilder, createToken, TestContainerBuilder } from 'di-framework';
    
    // Type-safe token creation
    const IUserService = createToken<IUserService>('IUserService');
    
    // Fluent container building
    const container = await new ContainerBuilder()
      .addBinding(IUserService, UserService)
      .addModule(databaseModule)
      .enableEventSystem(eventBus)
      .build();
    
    // Testing with isolation
    const testBuilder = TestContainerBuilder.createIsolated()
      .mock(IUserService, mockUserService)
      .snapshot();
    ]]>
  </usage_example>
  
  <dependencies>
    <dependency>inversify</dependency>
    <dependency>reflect-metadata</dependency>
  </dependencies>
  
  <exports>
    <export type="interface">IResult, IDisposable, IInitializable, IOptions</export>
    <export type="class">ContainerBuilder, TestContainerBuilder, BaseError</export>
    <export type="function">createToken, createTokens</export>
    <export type="utility">TokenFactory</export>
  </exports>
  
  <consumers>
    <consumer>ALL packages in the monorepo (foundation)</consumer>
    <consumer>h1b-visa-analysis (main container)</consumer>
    <consumer>test-helpers (testing patterns)</consumer>
    <consumer>test-mocks (mock implementations)</consumer>
  </consumers>
</package_overview>
```

## Key Features

The di-framework package serves as the **foundation** for dependency injection throughout the H1B monorepo:

### Core DI Utilities
- **Token Management**: Type-safe token creation with `createToken()` and `createTokens()`
- **Container Building**: Fluent API with `ContainerBuilder` for clean container setup
- **Common Interfaces**: Standardized patterns for `IResult`, `IDisposable`, `IInitializable`
- **Testing Support**: `TestContainerBuilder` with isolation and mocking capabilities

### Advanced Features
- **Container Middleware**: Intercept and modify resolution behavior
- **Event System Integration**: Optional event emission for debugging
- **Performance Monitoring**: Track resolution times and metrics
- **Error Handling**: Structured error classes for DI scenarios

## Architecture

The package follows a **thin wrapper** philosophy around Inversify:

### Design Principles
1. **Stay Focused**: Only DI utilities, no business logic
2. **Stay Thin**: Minimal abstraction over Inversify
3. **Type Safety**: Everything must be type-safe
4. **Testing First**: Built-in testing utilities
5. **Zero Coupling**: Only depends on inversify and reflect-metadata

### File Structure
```
src/
├── interfaces/       # Core interfaces (IResult, IDisposable, etc.)
├── tokens/          # Token creation and registry
├── container/       # Container building utilities
├── decorators/      # Custom decorators
├── testing/         # Test-specific utilities
├── errors/          # Base error classes
└── index.ts         # Public API
```

## Integration Points

As the **foundation package**, di-framework integrates with:

- **All packages**: Every package uses DI patterns from this foundation
- **Main application**: Provides the main DI container setup
- **Testing packages**: Supplies testing utilities and mock integration
- **Optional packages**: Supports event system and performance monitoring

## Current Status

- **Version**: 1.0.0 (stable and production-ready)
- **Coverage**: 84% test coverage (exceeds minimum targets)
- **Size**: ~689 lines (well within 1000 line limit)
- **State**: Core infrastructure - required by all packages
- **Repository**: Available for publishing to GitHub Packages

## Usage Patterns

### Basic Token Creation
```typescript
// Always use createToken for type safety
const IService = createToken<IService>('IService');

// Group related tokens
const TOKENS = createTokens('module', {
  ILogger: 'Logging service',
  ICache: 'Caching service',
});
```

### Container Building
```typescript
// Use the builder for cleaner setup
const container = await new ContainerBuilder()
  .addBinding(token, implementation)
  .addModule(myModule)
  .enableEventSystem(eventBus)
  .build();
```

### Testing Patterns
```typescript
// Always use TestContainerBuilder in tests
const builder = TestContainerBuilder.createIsolated()
  .mock(ILogger, mockLogger)
  .snapshot(); // Save state for restoration
```

### Advanced Features
```typescript
// Container middleware for logging
const loggingMiddleware: IContainerMiddleware = {
  intercept: (context, serviceIdentifier, next) => {
    console.log(`Resolving: ${String(serviceIdentifier)}`);
    return next();
  }
};

// Event-driven container with performance monitoring
const container = await new ContainerBuilder({
  enableEventSystem: true,
  enablePerformanceMonitoring: true
})
  .addMiddleware(loggingMiddleware)
  .build();
```

## Common Issues and Solutions

1. **Missing decorators**: Ensure `reflect-metadata` is imported first
2. **Token conflicts**: Use namespaced tokens with `createTokens()`
3. **Circular dependencies**: Use factory pattern or lazy injection
4. **Test isolation**: Always use `TestContainerBuilder.createIsolated()`

## Development Notes

- **Foundation role**: All other packages depend on this one
- **Stability requirement**: Changes must be backward compatible
- **Testing priority**: High test coverage essential due to foundational nature
- **Type safety**: All APIs must maintain strict TypeScript typing
- **Minimal dependencies**: Only inversify and reflect-metadata allowed

The di-framework package successfully demonstrates **focused responsibility** - providing exactly what's needed for DI without scope creep, while maintaining the flexibility to support advanced features when needed.