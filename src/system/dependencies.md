# System Dependencies

```xml
<system_dependencies>
  <overview>
    Complete dependency graph for the H1B Visa Analysis system with 100% decomposition achieved
  </overview>
  
  <dependency_strategy>
    <local_packages>8 packages in workspace</local_packages>
    <published_packages>1 package (@chasenogap/logger)</published_packages>
    <external_dependencies>2 GitHub repositories</external_dependencies>
  </dependency_strategy>
  
  <core_packages>
    <package name="di-framework" type="foundation">
      <purpose>Dependency injection utilities</purpose>
      <dependencies>
        <dependency>inversify</dependency>
      </dependencies>
      <dependents>
        <dependent>All packages use DI patterns</dependent>
        <dependent>h1b-visa-analysis (main container)</dependent>
      </dependents>
      <status>Core infrastructure - required by all</status>
    </package>
    
    <package name="logger" type="published">
      <purpose>Structured logging with Winston</purpose>
      <location>@chasenogap/logger (GitHub Packages)</location>
      <dependencies>
        <dependency>winston</dependency>
        <dependency>winston-daily-rotate-file</dependency>
      </dependencies>
      <dependents>
        <dependent>h1b-visa-analysis</dependent>
        <dependent>markdown-compiler</dependent>
        <dependent>All packages via DI</dependent>
      </dependents>
      <status>Published shared utility</status>
    </package>
    
    <package name="cache" type="shared">
      <purpose>Decorator-based caching with TTL</purpose>
      <dependencies>
        <dependency>inversify</dependency>
        <dependency optional="true">@chasenogap/logger</dependency>
        <dependency optional="true">event-system</dependency>
      </dependencies>
      <dependents>
        <dependent>h1b-visa-analysis</dependent>
        <dependent>markdown-compiler</dependent>
      </dependents>
      <status>Shared between applications</status>
    </package>
    
    <package name="file-system" type="abstraction">
      <purpose>Cross-platform file operations</purpose>
      <dependencies>
        <dependency>fs/promises</dependency>
        <dependency>path</dependency>
      </dependencies>
      <dependents>
        <dependent>h1b-visa-analysis</dependent>
        <dependent>markdown-compiler</dependent>
        <dependent>report-templates</dependent>
      </dependents>
      <status>Production abstraction layer</status>
    </package>
    
    <package name="event-system" type="optional">
      <purpose>Event-driven debugging and monitoring</purpose>
      <dependencies>
        <dependency>inversify</dependency>
        <dependency optional="true">@chasenogap/logger</dependency>
      </dependencies>
      <dependents>
        <dependent optional="true">h1b-visa-analysis</dependent>
        <dependent optional="true">cache</dependent>
      </dependents>
      <status>Optional enhancement</status>
    </package>
    
    <package name="test-helpers" type="development">
      <purpose>Shared test utilities</purpose>
      <dependencies>
        <dependency>vitest</dependency>
        <dependency>inversify</dependency>
      </dependencies>
      <dependents>
        <dependent>All packages (testing)</dependent>
      </dependents>
      <status>Development support</status>
    </package>
    
    <package name="test-mocks" type="development">
      <purpose>Mock implementations for testing</purpose>
      <dependencies>
        <dependency>inversify</dependency>
      </dependencies>
      <dependents>
        <dependent>All packages (testing)</dependent>
        <dependent>test-helpers</dependent>
      </dependents>
      <status>Development support</status>
    </package>
    
    <package name="report-templates" type="application">
      <purpose>Template engine and report formatting</purpose>
      <dependencies>
        <dependency>inversify</dependency>
        <dependency>@chasenogap/logger</dependency>
        <dependency>file-system</dependency>
      </dependencies>
      <dependents>
        <dependent>h1b-visa-analysis</dependent>
      </dependents>
      <status>Feature package</status>
    </package>
  </core_packages>
  
  <external_dependencies>
    <dependency name="markdown-compiler" type="cloned_repo">
      <purpose>Advanced markdown processing with includes</purpose>
      <location>packages/markdown-compiler (cloned)</location>
      <integration>Markdown compilation and template processing</integration>
      <used_by>h1b-visa-analysis</used_by>
      <shared_packages>
        <shared>cache (integrated)</shared>
        <shared>@chasenogap/logger</shared>
      </shared_packages>
    </dependency>
    
    <dependency name="report-components" type="cloned_repo">
      <purpose>H1B research content and analysis</purpose>
      <location>packages/report-components (cloned)</location>
      <integration>Content source for report generation</integration>
      <used_by>h1b-visa-analysis</used_by>
    </dependency>
  </external_dependencies>
  
  <dependency_flow>
    <flow name="Core Dependencies">
      <direction>Applications → Core Packages → Node.js APIs</direction>
      <rule>No circular dependencies</rule>
      <rule>Specific → General direction</rule>
    </flow>
    
    <flow name="Testing Dependencies">
      <direction>Tests → test-helpers → test-mocks → Core Interfaces</direction>
      <rule>Test packages depend on core interfaces only</rule>
    </flow>
    
    <flow name="Optional Dependencies">
      <direction>Enhanced Features → Optional Packages → Core Packages</direction>
      <rule>Optional packages can be excluded without breaking core functionality</rule>
    </flow>
  </dependency_flow>
  
  <integration_patterns>
    <pattern name="Dependency Injection">
      <description>All services use DI for loose coupling</description>
      <implementation>Inversify container with interfaces</implementation>
      <benefit>Easy testing and modularity</benefit>
    </pattern>
    
    <pattern name="Decorator Enhancement">
      <description>Cross-cutting concerns via decorators</description>
      <examples>@Cacheable, @InvalidateCache, @Emits, @Traces</examples>
      <benefit>Clean separation of concerns</benefit>
    </pattern>
    
    <pattern name="Workspace Development">
      <description>Local packages in workspace for rapid iteration</description>
      <workflow>Develop → Test → Use immediately</workflow>
      <benefit>Fast development cycle</benefit>
    </pattern>
    
    <pattern name="Published Sharing">
      <description>Shared utilities via GitHub Packages</description>
      <workflow>Develop → Publish → Consume externally</workflow>
      <benefit>External consumption and versioning</benefit>
    </pattern>
  </integration_patterns>
</system_dependencies>
```

## Dependency Overview

The H1B Visa Analysis system implements a sophisticated dependency management strategy with **100% package decomposition** completed. The system manages dependencies across three distinct categories:

### 🏗️ Local Workspace Packages (8 packages)
These packages are developed and maintained within the monorepo workspace for rapid iteration and tight integration.

### 📦 Published Packages (1 package)
- **@chasenogap/logger**: Published to GitHub Packages for external consumption and shared use across multiple projects.

### 🔗 External Dependencies (2 repositories)
GitHub repositories cloned into the workspace for development convenience while maintaining external production references.

## Dependency Direction Rules

The system follows strict dependency direction principles:

1. **Applications depend on Core Packages**
2. **Core Packages have minimal external dependencies**
3. **Test packages depend only on core interfaces**
4. **No circular dependencies allowed**
5. **Optional packages can be excluded without breaking core functionality**

## Integration Architecture

### Dependency Injection Pattern
All services use the `di-framework` package for dependency injection:

```typescript
@injectable()
export class ReportGenerator implements IReportGenerator {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.ICache) private cache: ICache,
    @inject(TYPES.IFileSystem) private fileSystem: IFileSystem
  ) {}
}
```

### Shared Package Strategy
The system demonstrates multiple sharing strategies:

- **Workspace Packages**: Immediate availability for development
- **Published Packages**: Versioned sharing via GitHub Packages
- **Cloned Repositories**: External dependencies for development convenience

## External Integration Points

### Cloned Dependencies Integration
1. **markdown-compiler**: Advanced markdown processing with shared cache package
2. **report-components**: H1B research content and analysis

### Shared Package Usage
The cache package demonstrates successful sharing:
- Used by h1b-visa-analysis (main application)
- Integrated with markdown-compiler (external dependency)
- Maintains consistent behavior across applications

## Testing Dependencies

The testing architecture follows clean dependency principles:

```
Tests → test-helpers → test-mocks → Core Interfaces
```

This ensures:
- Tests remain isolated and focused
- Mock implementations stay consistent
- Core interfaces drive testing contracts
- Easy test setup and teardown

## Current Status

- ✅ **8/8 local packages** with clear dependency boundaries
- ✅ **1 published package** for external sharing
- ✅ **2 external dependencies** properly integrated
- ✅ **Zero circular dependencies**
- ✅ **Clean dependency direction** maintained
- ✅ **Optional dependencies** properly isolated

The dependency architecture demonstrates successful package decomposition with maintainable, testable, and scalable dependency management.