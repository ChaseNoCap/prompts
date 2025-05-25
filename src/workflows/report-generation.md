# Report Generation Workflow

```xml
<workflow name="report_generation">
  <overview>
    Complete flow for generating H1B analysis reports using decomposed package architecture
  </overview>
  
  <triggers>
    <trigger type="git_push">Push to main branch</trigger>
    <trigger type="manual">Manual workflow dispatch</trigger>
    <trigger type="dependency">Dependency repository updates</trigger>
    <trigger type="scheduled">Scheduled generation (if configured)</trigger>
  </triggers>
  
  <steps>
    <step order="1" name="Initialization">
      <actions>
        <action>Initialize DI container with all services</action>
        <action>Load environment configuration</action>
        <action>Setup logging with operation context</action>
        <action>Validate system dependencies</action>
      </actions>
      <outputs>
        <output>Configured service container</output>
        <output>Logger instance with operation ID</output>
        <output>Environment validation results</output>
      </outputs>
    </step>
    
    <step order="2" name="Dependency Check">
      <description>Verify all required dependencies are available</description>
      <validations>
        <validation required="true" service="DependencyChecker">markdown-compiler available</validation>
        <validation required="true" service="DependencyChecker">report-components accessible</validation>
        <validation required="false" service="DependencyChecker">Cache service operational</validation>
      </validations>
      <error_handling>
        <on_failure>Log detailed error and exit with code 1</on_failure>
        <retry_logic>3 attempts with exponential backoff</retry_logic>
      </error_handling>
    </step>
    
    <step order="3" name="Content Loading">
      <description>Load and validate content from dependency repositories</description>
      <substeps>
        <substep order="3.1">
          <name>Load Context</name>
          <source>packages/prompts (this package)</source>
          <cache_strategy>@Cacheable with 1-hour TTL</cache_strategy>
        </substep>
        <substep order="3.2">
          <name>Load H1B Content</name>
          <source>packages/report-components</source>
          <validation>Markdown file structure and completeness</validation>
        </substep>
        <substep order="3.3">
          <name>Initialize Compiler</name>
          <source>packages/markdown-compiler</source>
          <configuration>Template processing and include resolution</configuration>
        </substep>
      </substeps>
    </step>
    
    <step order="4" name="Template Preparation">
      <description>Prepare report templates using report-templates package</description>
      <actions>
        <action>Load template registry from report-templates</action>
        <action>Initialize MarkdownReportBuilder</action>
        <action>Prepare template context with metadata</action>
        <action>Validate template structure and completeness</action>
      </actions>
      <caching>
        <strategy>Template compilation results cached</strategy>
        <ttl>3600 seconds (1 hour)</ttl>
        <invalidation>On template file changes</invalidation>
      </caching>
    </step>
    
    <step order="5" name="Report Generation">
      <description>Execute the core report generation process</description>
      <substeps>
        <substep order="5.1">
          <name>Apply Context to Content</name>
          <description>Process H1B content with structured prompts</description>
          <integration>prompts + report-components</integration>
        </substep>
        <substep order="5.2">
          <name>Compile Markdown</name>
          <description>Process markdown with includes and templates</description>
          <service>markdown-compiler</service>
          <features>Include resolution, template processing, recursion detection</features>
        </substep>
        <substep order="5.3">
          <name>Format with Templates</name>
          <description>Apply report templates for final formatting</description>
          <service>report-templates (MarkdownReportBuilder)</service>
          <output_format>Structured markdown report</output_format>
        </substep>
      </substeps>
      <monitoring>
        <events>@Emits report generation events</events>
        <performance>@Traces execution time</performance>
        <logging>Detailed operation logging</logging>
      </monitoring>
    </step>
    
    <step order="6" name="Output Generation">
      <description>Write generated report to output location</description>
      <actions>
        <action>Create dist/ directory if needed</action>
        <action>Write formatted report to dist/h1b-report.md</action>
        <action>Generate metadata file with generation details</action>
        <action>Update last-generated timestamp</action>
      </actions>
      <file_operations>
        <service>file-system package</service>
        <validation>Output file integrity and completeness</validation>
      </file_operations>
    </step>
    
    <step order="7" name="Cleanup and Logging">
      <description>Finalize operation and cleanup resources</description>
      <actions>
        <action>Log generation completion with metrics</action>
        <action>Clear temporary caches if needed</action>
        <action>Dispose of DI container resources</action>
        <action>Emit completion events</action>
      </actions>
      <metrics>
        <metric>Total execution time</metric>
        <metric>Cache hit/miss ratios</metric>
        <metric>File I/O operations count</metric>
        <metric>Memory usage peak</metric>
      </metrics>
    </step>
  </steps>
  
  <integration_points>
    <integration service="ReportGenerator" role="orchestrator">
      <description>Main service coordinating the entire workflow</description>
      <dependencies>All core services via DI</dependencies>
    </integration>
    
    <integration service="DI Container" role="service_provider">
      <description>Provides all services through dependency injection</description>
      <packages>di-framework for container utilities</packages>
    </integration>
    
    <integration service="Logger" role="observability">
      <description>Structured logging throughout the workflow</description>
      <features>Child loggers with operation context</features>
    </integration>
    
    <integration service="Cache" role="performance">
      <description>Caches compiled templates and processed content</description>
      <strategies>@Cacheable decorators, TTL-based expiration</strategies>
    </integration>
    
    <integration service="Event System" role="debugging">
      <description>Optional event emission for debugging and monitoring</description>
      <events>Workflow stages, performance metrics, error conditions</events>
    </integration>
    
    <integration service="File System" role="storage">
      <description>Abstracted file operations for cross-platform compatibility</description>
      <operations>Content loading, report writing, metadata persistence</operations>
    </integration>
  </integration_points>
  
  <error_handling>
    <strategy name="Graceful Degradation">
      <description>Continue with reduced functionality when non-critical services fail</description>
      <examples>Cache failures, event system unavailable</examples>
    </strategy>
    
    <strategy name="Detailed Logging">
      <description>Comprehensive error logging with context</description>
      <includes>Stack traces, operation state, dependency status</includes>
    </strategy>
    
    <strategy name="Clean Failure">
      <description>Proper cleanup and resource disposal on critical failures</description>
      <exit_codes>Meaningful exit codes for different failure types</exit_codes>
    </strategy>
  </error_handling>
  
  <performance_optimization>
    <caching>
      <templates>Compiled templates cached for 1 hour</templates>
      <content>Processed content cached per session</content>
      <dependencies>Dependency validation results cached</dependencies>
    </caching>
    
    <parallel_processing>
      <content_loading>Load prompts and content concurrently</content_loading>
      <template_preparation>Parallel template compilation</template_preparation>
    </parallel_processing>
    
    <resource_management>
      <memory>Efficient memory usage with streaming where possible</memory>
      <file_handles>Proper file handle cleanup</file_handles>
      <di_container>Resource disposal on completion</di_container>
    </resource_management>
  </performance_optimization>
</workflow>
```

## Workflow Overview

The report generation workflow orchestrates the entire H1B analysis report creation process using the decomposed package architecture. The workflow demonstrates how all 8 packages work together to produce the final report.

## Key Integration Points

### Package Orchestration
The workflow showcases the integration of all decomposed packages:

1. **di-framework**: Provides service container and dependency injection
2. **logger**: Structured logging throughout the process  
3. **cache**: Performance optimization with decorator-based caching
4. **file-system**: Cross-platform file operations
5. **event-system**: Optional debugging and monitoring events
6. **test-helpers**: Utilities for testing the workflow
7. **test-mocks**: Mock services for testing scenarios
8. **report-templates**: Final report formatting and structure

### External Dependencies
The workflow integrates with external repositories:

- **prompts-shared**: AI development workflows and context
- **markdown-compiler**: Markdown processing with includes  
- **report-components**: H1B research content and analysis

## Workflow Execution

### Trigger Mechanisms
The workflow can be triggered by:
- Git pushes to main branch (automatic)
- Manual workflow dispatch (on-demand)
- Dependency repository updates (automatic)
- Scheduled execution (configurable)

### Service Coordination
The ReportGenerator service orchestrates all operations:

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
  @Emits('report.generation.started')
  @Traces({ threshold: 1000 })
  async generateReport(): Promise<IResult<string>> {
    // Orchestrates the entire workflow
  }
}
```

## Performance Characteristics

### Caching Strategy
- **Template Compilation**: 1-hour TTL for compiled templates
- **Content Processing**: Session-level caching for processed content
- **Dependency Validation**: Cached validation results

### Monitoring and Observability
- **Structured Logging**: Child loggers with operation context
- **Event Emission**: Optional events for debugging
- **Performance Tracking**: Execution time and resource usage metrics
- **Error Tracking**: Comprehensive error logging with context

## Error Handling

The workflow implements multiple error handling strategies:

1. **Graceful Degradation**: Continue with reduced functionality when possible
2. **Retry Logic**: Exponential backoff for transient failures
3. **Clean Failure**: Proper resource cleanup on critical errors
4. **Detailed Logging**: Comprehensive error context for debugging

## Testing Strategy

The workflow is tested using the decomposed testing packages:

- **test-helpers**: Provides TestContainer and FixtureManager
- **test-mocks**: MockLogger, MockFileSystem, MockCache for isolation
- **Integration Tests**: End-to-end workflow validation
- **Unit Tests**: Individual service testing with mocks

This workflow demonstrates the successful decomposition achievement where all 8 packages work together seamlessly to produce H1B analysis reports.