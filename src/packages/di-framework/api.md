# DI Framework API Reference

```xml
<package_api name="di-framework">
  <exports>
    <interfaces>
      <interface name="IResult" category="core">
        <purpose>Consistent error handling pattern across packages</purpose>
        <generic_type>T</generic_type>
        <properties>
          <property name="success" type="boolean">Indicates operation success</property>
          <property name="data" type="T" optional="true">Result data when successful</property>
          <property name="error" type="Error" optional="true">Error when unsuccessful</property>
        </properties>
      </interface>
      
      <interface name="IDisposable" category="lifecycle">
        <purpose>Resource cleanup pattern</purpose>
        <methods>
          <method name="dispose" return_type="Promise<void>">
            <description>Cleanup resources</description>
          </method>
        </methods>
      </interface>
      
      <interface name="IInitializable" category="lifecycle">
        <purpose>Service initialization pattern</purpose>
        <methods>
          <method name="initialize" return_type="Promise<void>">
            <description>Initialize the service</description>
          </method>
        </methods>
      </interface>
      
      <interface name="IOptions" category="configuration">
        <purpose>Base configuration pattern</purpose>
        <generic_type>T</generic_type>
        <properties>
          <property name="enabled" type="boolean" optional="true">Enable/disable feature</property>
          <property name="config" type="T" optional="true">Feature configuration</property>
        </properties>
      </interface>
      
      <interface name="IContainerMiddleware" category="advanced">
        <purpose>Container resolution interception</purpose>
        <methods>
          <method name="intercept" return_type="any">
            <parameters>
              <parameter name="context" type="interfaces.Context">Resolution context</parameter>
              <parameter name="serviceIdentifier" type="ServiceIdentifier">Service being resolved</parameter>
              <parameter name="next" type="() => any">Next middleware function</parameter>
            </parameters>
            <description>Intercept and modify resolution behavior</description>
          </method>
        </methods>
      </interface>
    </interfaces>
    
    <classes>
      <class name="ContainerBuilder" category="core">
        <purpose>Fluent API for building DI containers</purpose>
        <constructor>
          <parameter name="options" type="ContainerBuilderOptions" optional="true">Builder configuration</parameter>
        </constructor>
        <methods>
          <method name="addBinding" return_type="ContainerBuilder">
            <parameters>
              <parameter name="token" type="ServiceIdentifier">Service token</parameter>
              <parameter name="implementation" type="Constructor">Implementation class</parameter>
            </parameters>
            <description>Bind token to implementation</description>
          </method>
          <method name="addModule" return_type="ContainerBuilder">
            <parameters>
              <parameter name="module" type="ContainerModule">Inversify module</parameter>
            </parameters>
            <description>Add container module</description>
          </method>
          <method name="addMiddleware" return_type="ContainerBuilder">
            <parameters>
              <parameter name="middleware" type="IContainerMiddleware">Middleware function</parameter>
            </parameters>
            <description>Add resolution middleware</description>
          </method>
          <method name="enableEventSystem" return_type="ContainerBuilder">
            <parameters>
              <parameter name="eventBus" type="IEventBus">Event bus instance</parameter>
            </parameters>
            <description>Enable event emission for resolutions</description>
          </method>
          <method name="build" return_type="Promise<Container>">
            <description>Build and configure the container</description>
          </method>
        </methods>
      </class>
      
      <class name="TestContainerBuilder" category="testing">
        <purpose>Test-specific container building with mocking</purpose>
        <static_methods>
          <method name="createIsolated" return_type="TestContainerBuilder">
            <description>Create isolated test container</description>
          </method>
        </static_methods>
        <methods>
          <method name="mock" return_type="TestContainerBuilder">
            <parameters>
              <parameter name="token" type="ServiceIdentifier">Service token</parameter>
              <parameter name="mock" type="any">Mock implementation</parameter>
            </parameters>
            <description>Add mock binding</description>
          </method>
          <method name="snapshot" return_type="TestContainerBuilder">
            <description>Save container state for restoration</description>
          </method>
          <method name="restore" return_type="TestContainerBuilder">
            <description>Restore to snapshot state</description>
          </method>
          <method name="build" return_type="Promise<Container>">
            <description>Build test container</description>
          </method>
        </methods>
      </class>
      
      <class name="BaseError" category="errors">
        <purpose>Structured error base class for DI scenarios</purpose>
        <extends>Error</extends>
        <constructor>
          <parameter name="message" type="string">Error message</parameter>
          <parameter name="code" type="string" optional="true">Error code</parameter>
          <parameter name="context" type="any" optional="true">Additional context</parameter>
        </constructor>
        <properties>
          <property name="code" type="string">Error code</property>
          <property name="context" type="any">Error context</property>
        </properties>
      </class>
      
      <class name="TokenFactory" category="tokens">
        <purpose>Factory for creating type-safe tokens</purpose>
        <static_methods>
          <method name="create" return_type="Symbol">
            <parameters>
              <parameter name="identifier" type="string">Token identifier</parameter>
            </parameters>
            <description>Create a new service token</description>
          </method>
          <method name="createNamespaced" return_type="Record<string, Symbol>">
            <parameters>
              <parameter name="namespace" type="string">Token namespace</parameter>
              <parameter name="tokens" type="Record<string, string>">Token definitions</parameter>
            </parameters>
            <description>Create namespaced token collection</description>
          </method>
        </static_methods>
      </class>
    </classes>
    
    <functions>
      <function name="createToken" category="tokens">
        <purpose>Create type-safe service token</purpose>
        <generic_type>T</generic_type>
        <parameters>
          <parameter name="identifier" type="string">Token identifier</parameter>
        </parameters>
        <return_type>Symbol</return_type>
        <usage_example>
          <![CDATA[
          const IUserService = createToken<IUserService>('IUserService');
          ]]>
        </usage_example>
      </function>
      
      <function name="createTokens" category="tokens">
        <purpose>Create namespaced token collection</purpose>
        <parameters>
          <parameter name="namespace" type="string">Token namespace</parameter>
          <parameter name="definitions" type="Record<string, string>">Token definitions</parameter>
        </parameters>
        <return_type>Record<string, Symbol></return_type>
        <usage_example>
          <![CDATA[
          const TOKENS = createTokens('user', {
            IUserService: 'User service',
            IUserRepository: 'User repository'
          });
          ]]>
        </usage_example>
      </function>
    </functions>
  </exports>
</package_api>
```

## Public API

### Core Interfaces

#### IResult<T>
Standard result pattern for consistent error handling:

```typescript
interface IResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

// Usage
const result: IResult<User> = await userService.getUser(id);
if (result.success) {
  console.log(result.data); // User
} else {
  console.error(result.error); // Error
}
```

#### IDisposable & IInitializable
Lifecycle management interfaces:

```typescript
interface IDisposable {
  dispose(): Promise<void>;
}

interface IInitializable {
  initialize(): Promise<void>;
}

// Implementation
@injectable()
class DatabaseService implements IInitializable, IDisposable {
  async initialize(): Promise<void> {
    // Connect to database
  }
  
  async dispose(): Promise<void> {
    // Close connections
  }
}
```

### Token Management

#### createToken<T>(identifier: string)
Type-safe token creation:

```typescript
// Create typed tokens
const IUserService = createToken<IUserService>('IUserService');
const ILogger = createToken<ILogger>('ILogger');

// Use in bindings
container.bind(IUserService).to(UserService);
```

#### createTokens(namespace: string, definitions: Record<string, string>)
Namespaced token collections:

```typescript
const USER_TOKENS = createTokens('user', {
  IUserService: 'User business logic',
  IUserRepository: 'User data access',
  IUserValidator: 'User validation'
});

// Usage
container.bind(USER_TOKENS.IUserService).to(UserService);
```

### Container Building

#### ContainerBuilder
Fluent API for container configuration:

```typescript
const container = await new ContainerBuilder()
  .addBinding(IUserService, UserService)
  .addBinding(ILogger, WinstonLogger)
  .addModule(databaseModule)
  .addMiddleware(loggingMiddleware)
  .enableEventSystem(eventBus)
  .build();
```

#### Advanced Container Options
```typescript
const container = await new ContainerBuilder({
  enableEventSystem: true,
  enablePerformanceMonitoring: true,
  autoBindInjectable: false
})
  .addBinding(IService, ServiceImpl)
  .build();

// Get performance metrics
const metrics = container.getPerformanceMetrics();
console.log('Total resolutions:', metrics.totalResolutions);
```

### Testing Support

#### TestContainerBuilder
Isolated test containers with mocking:

```typescript
describe('UserService', () => {
  let container: Container;
  let userService: IUserService;
  
  beforeEach(async () => {
    container = await TestContainerBuilder.createIsolated()
      .mock(IUserRepository, mockUserRepository)
      .mock(ILogger, mockLogger)
      .addBinding(IUserService, UserService)
      .snapshot()
      .build();
      
    userService = container.get(IUserService);
  });
  
  afterEach(() => {
    container.unbindAll();
  });
});
```

### Middleware Support

#### IContainerMiddleware
Intercept and modify resolution behavior:

```typescript
const performanceMiddleware: IContainerMiddleware = {
  intercept: (context, serviceIdentifier, next) => {
    const start = Date.now();
    const result = next();
    const duration = Date.now() - start;
    
    console.log(`${String(serviceIdentifier)} resolved in ${duration}ms`);
    return result;
  }
};

const container = await new ContainerBuilder()
  .addMiddleware(performanceMiddleware)
  .build();
```

### Error Handling

#### BaseError
Structured error class for DI scenarios:

```typescript
class ServiceNotFoundError extends BaseError {
  constructor(serviceId: string) {
    super(
      `Service not found: ${serviceId}`,
      'SERVICE_NOT_FOUND',
      { serviceId }
    );
  }
}

// Usage
try {
  const service = container.get(unknownToken);
} catch (error) {
  if (error instanceof ServiceNotFoundError) {
    console.log('Service ID:', error.context.serviceId);
  }
}
```

## Configuration Options

### ContainerBuilderOptions
```typescript
interface ContainerBuilderOptions {
  enableEventSystem?: boolean;          // Enable event emission
  enablePerformanceMonitoring?: boolean; // Track resolution metrics
  autoBindInjectable?: boolean;         // Auto-bind @injectable classes
  skipBaseClassChecks?: boolean;        // Skip inheritance validation
  defaultScope?: BindingScopeEnum;      // Default binding scope
}
```

## Best Practices

1. **Always use createToken()** for type-safe tokens
2. **Use TestContainerBuilder.createIsolated()** in tests
3. **Implement IDisposable** for resources that need cleanup
4. **Use IResult<T>** for consistent error handling
5. **Namespace tokens** with createTokens() for related services
6. **Take snapshots** in tests for state restoration

## Integration Examples

### With Event System
```typescript
import { EventBus } from 'event-system';

const eventBus = new EventBus();
const container = await new ContainerBuilder()
  .enableEventSystem(eventBus)
  .addBinding(IService, ServiceImpl)
  .build();

// Listen to resolution events
eventBus.on('container.resolution.completed', (event) => {
  console.log('Service resolved:', event.payload.serviceIdentifier);
});
```

### With Performance Monitoring
```typescript
const container = await new ContainerBuilder({
  enablePerformanceMonitoring: true
})
  .addBinding(IService, ServiceImpl)
  .build();

// Get resolution metrics
const metrics = container.getPerformanceMetrics();
console.log('Slowest resolution:', metrics.slowestResolution);
```

This API provides the foundation for all dependency injection throughout the H1B monorepo, with type safety, testing support, and advanced features for monitoring and debugging.