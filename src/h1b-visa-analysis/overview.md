# H1B Visa Analysis Application Overview

```xml
<application_overview name="h1b-visa-analysis">
  <metadata>
    <version>1.0.0</version>
    <type>primary_application</type>
    <role>orchestrator</role>
    <status>production</status>
  </metadata>
  
  <purpose>
    Main report generator application that orchestrates H1B analysis report creation using decomposed packages
  </purpose>
  
  <features>
    <feature>Report generation workflow orchestration</feature>
    <feature>Dependency injection container management</feature>
    <feature>GitHub Actions integration for automated reports</feature>
    <feature>Structured logging throughout operations</feature>
    <feature>Cache-optimized performance</feature>
    <feature>Event-driven debugging support</feature>
  </features>
  
  <architecture>
    <pattern>Dependency injection with Inversify</pattern>
    <pattern>Service-oriented with clear interfaces</pattern>
    <pattern>Decorator-based cross-cutting concerns</pattern>
    <pattern>Event-driven debugging (optional)</pattern>
  </architecture>
  
  <dependencies>
    <core_packages>
      <package>di-framework</package>
      <package>@chasenocap/logger</package>
      <package>cache</package>
      <package>file-system</package>
      <package>event-system</package>
      <package>test-helpers</package>
      <package>test-mocks</package>
      <package>report-templates</package>
    </core_packages>
    
    <external_dependencies>
      <dependency>prompts-shared</dependency>
      <dependency>markdown-compiler</dependency>
      <dependency>report-components</dependency>
    </external_dependencies>
  </dependencies>
  
  <services>
    <service name="ReportGenerator" interface="IReportGenerator">
      <purpose>Main orchestrator for report generation workflow</purpose>
      <decorators>@injectable, @Cacheable, @Emits, @Traces</decorators>
    </service>
    
    <service name="DependencyChecker" interface="IDependencyChecker">
      <purpose>Validates availability of external dependencies</purpose>
      <decorators>@injectable</decorators>
    </service>
  </services>
  
  <consumers>
    <consumer type="github_actions">Automated report generation</consumer>
    <consumer type="developer">Local development and testing</consumer>
    <consumer type="ci_cd">Continuous integration pipeline</consumer>
  </consumers>
</application_overview>
```

## Application Overview

The H1B Visa Analysis application serves as the primary orchestrator for generating comprehensive H1B analysis reports. It demonstrates successful package decomposition by integrating all 8 decomposed packages to create a cohesive report generation system.

## Key Features

### Report Generation Orchestration
- Coordinates the entire report generation workflow
- Integrates content from multiple external dependencies
- Applies templates for structured output formatting
- Handles errors gracefully with comprehensive logging

### Package Integration Showcase
The application demonstrates how decomposed packages work together:

- **DI Framework**: Provides service container and dependency injection
- **Logger**: Structured logging with operation context
- **Cache**: Performance optimization with decorator-based caching
- **File System**: Cross-platform file operations
- **Event System**: Optional debugging and monitoring
- **Test Helpers**: Development and testing utilities
- **Test Mocks**: Isolated testing scenarios
- **Report Templates**: Professional report formatting

### External Dependency Management
- **prompts-shared**: AI development workflows and context management
- **markdown-compiler**: Advanced markdown processing with includes
- **report-components**: H1B research content and analysis

## Architecture

The application follows a service-oriented architecture with dependency injection:

```typescript
@injectable()
export class ReportGenerator implements IReportGenerator {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.IDependencyChecker) private dependencyChecker: IDependencyChecker,
    @inject(TYPES.ICache) private cache: ICache,
    @inject(TYPES.IFileSystem) private fileSystem: IFileSystem
  ) {}

  @Cacheable({ ttl: 3600 })
  @Emits('report.generation')
  @Traces({ threshold: 1000 })
  async generateReport(): Promise<IResult<string>> {
    // Orchestrates entire workflow
  }
}
```

## Workflow Integration

The application orchestrates a sophisticated workflow:

1. **Initialization**: Setup DI container and services
2. **Dependency Validation**: Check external repository availability
3. **Content Loading**: Fetch content from dependencies
4. **Template Processing**: Apply report templates
5. **Report Generation**: Compile and format final report
6. **Output**: Write structured report to dist/

## Current Status

- **Decomposition**: 100% complete (8/8 packages integrated)
- **Architecture**: Service-oriented with DI
- **Testing**: Comprehensive unit and E2E tests
- **Documentation**: Full CLAUDE.md coverage
- **Automation**: GitHub Actions integration
- **Performance**: Cache-optimized with monitoring

## Development Notes

- Entry point: `src/index.ts` with public API exports
- Main services: `src/services/` with injectable implementations
- Container setup: `src/core/container/` with pre-configured DI
- Interfaces: `src/core/interfaces/` for TypeScript contracts
- Testing: `tests/` with both unit and E2E coverage

The application represents the successful culmination of package decomposition principles, demonstrating how modular architecture enables maintainable, testable, and scalable report generation systems.