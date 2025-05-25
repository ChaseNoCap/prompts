# Report Templates Package Integration Guide

<integration_overview>
The report-templates package provides the presentation layer for the monorepo, offering template rendering and report building capabilities. It integrates with the main application to format analysis results and can work with any data source through its flexible template engine.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="TypeScript" type="production">
Core language for type definitions and interfaces
</dependency>

<dependency name="None" type="production">
Zero runtime dependencies - completely self-contained
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="h1b-visa-analysis" type="consumed-by">
<description>
Main application uses report-templates to format analysis output into readable reports
</description>
<code>
import { MarkdownReportBuilder, TemplateEngine } from 'report-templates';

@injectable()
export class ReportGenerator {
  private builder = new MarkdownReportBuilder();
  private engine = new TemplateEngine();
  
  async generateReport(data: AnalysisData): Promise<string> {
    return this.builder
      .title('H1B Visa Analysis Report')
      .section('Summary')
      .paragraph(this.engine.render(summaryTemplate, data))
      .build();
  }
}
</code>
</integration>

<integration package="di-framework" type="compatible">
<description>
Template services can be registered in DI container for dependency injection
</description>
<code>
// Register template services
container.bind&lt;ITemplateEngine&gt;(TYPES.ITemplateEngine)
  .to(TemplateEngine)
  .inSingletonScope();

container.bind&lt;IReportBuilder&gt;(TYPES.IReportBuilder)
  .to(MarkdownReportBuilder)
  .inTransientScope();

container.bind&lt;ITemplateRegistry&gt;(TYPES.ITemplateRegistry)
  .to(TemplateRegistry)
  .inSingletonScope();
</code>
</integration>

<integration package="file-system" type="consumer">
<description>
Report templates can be loaded from file system for dynamic template management
</description>
<code>
class FileTemplateLoader {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem,
    @inject(TYPES.ITemplateRegistry) private registry: ITemplateRegistry
  ) {}
  
  async loadTemplates(dir: string): Promise<void> {
    const files = await this.fs.listDirectory(dir);
    
    for (const file of files.filter(f => f.endsWith('.hbs'))) {
      const name = this.fs.basename(file, '.hbs');
      const content = await this.fs.readFile(this.fs.join(dir, file));
      this.registry.register(name, content);
    }
  }
}
</code>
</integration>

<integration package="logger" type="optional">
<description>
Template rendering can be logged for debugging template issues
</description>
<code>
class LoggingTemplateEngine extends TemplateEngine {
  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    options?: TemplateEngineOptions
  ) {
    super(options);
  }
  
  render(template: string, data: any): string {
    this.logger.debug('Rendering template', { 
      templateLength: template.length,
      dataKeys: Object.keys(data) 
    });
    
    try {
      const result = super.render(template, data);
      this.logger.debug('Template rendered successfully', { 
        outputLength: result.length 
      });
      return result;
    } catch (error) {
      this.logger.error('Template rendering failed', error as Error);
      throw error;
    }
  }
}
</code>
</integration>

<integration package="cache" type="optional">
<description>
Compiled templates can be cached for improved performance
</description>
<code>
class CachedTemplateEngine extends TemplateEngine {
  constructor(
    @inject(TYPES.ICache) private cache: ICache
  ) {
    super();
  }
  
  async render(template: string, data: any): Promise<string> {
    const cacheKey = `template:${this.hash(template)}`;
    
    let compiled = await this.cache.get&lt;CompiledTemplate&gt;(cacheKey);
    if (!compiled) {
      compiled = this.compile(template);
      await this.cache.set(cacheKey, compiled, 3600); // 1 hour TTL
    }
    
    return compiled(data);
  }
}
</code>
</integration>

<integration package="markdown-compiler" type="complementary">
<description>
Report templates generates markdown that can be further processed by markdown-compiler
</description>
<code>
// Report templates generates markdown
const markdown = new MarkdownReportBuilder()
  .title('Analysis Report')
  .section('Data')
  .table({ headers: ['Metric', 'Value'], rows: data })
  .build();

// Markdown compiler can convert to HTML
const html = await markdownCompiler.compile(markdown, {
  enableToc: true,
  enableHighlighting: true
});
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Template-Driven Reports">
<description>
Use templates to separate report structure from data
</description>
<implementation>
class TemplateBasedReportGenerator {
  private engine = new TemplateEngine();
  private registry = new TemplateRegistry();
  
  constructor() {
    // Register all report templates
    this.registry.registerBulk({
      'executive-summary': `
# Executive Summary

**Report Date**: {{date}}
**Analysis Period**: {{period.start}} - {{period.end}}

## Key Findings
{{#each findings}}
- **{{title}}**: {{description}}
{{/each}}

## Recommendations
{{#each recommendations}}
1. {{this}}
{{/each}}
`,
      'detailed-analysis': `
# Detailed Analysis

{{#each sections}}
## {{name}}

{{content}}

{{#if data}}
| Metric | Value | Change |
|--------|-------|--------|
{{#each data}}
| {{metric}} | {{value}} | {{change}}% |
{{/each}}
{{/if}}

{{/each}}
`
    });
  }
  
  generateExecutiveSummary(data: SummaryData): string {
    return this.engine.render(
      this.registry.get('executive-summary'),
      data
    );
  }
  
  generateDetailedReport(data: DetailedData): string {
    return this.engine.render(
      this.registry.get('detailed-analysis'),
      data
    );
  }
}
</implementation>
</pattern>

<pattern name="Composable Report Sections">
<description>
Build complex reports by composing reusable section builders
</description>
<implementation>
// Define section builders
type SectionBuilder = (builder: MarkdownReportBuilder, data: any) => void;

const headerSection: SectionBuilder = (builder, data) => {
  builder
    .title(data.title)
    .subtitle(data.subtitle)
    .paragraph(`*Generated on ${new Date().toLocaleDateString()}*`)
    .horizontalRule();
};

const statsSection: SectionBuilder = (builder, stats) => {
  builder
    .section('Statistics')
    .bulletList([
      `Total Records: ${stats.total}`,
      `Success Rate: ${stats.successRate}%`,
      `Processing Time: ${stats.duration}ms`
    ]);
};

const tableSection: SectionBuilder = (builder, tableData) => {
  builder
    .section(tableData.title)
    .paragraph(tableData.description)
    .table({
      headers: tableData.headers,
      rows: tableData.rows
    });
};

// Compose report
class ModularReportBuilder {
  private sections: Map&lt;string, SectionBuilder&gt; = new Map([
    ['header', headerSection],
    ['stats', statsSection],
    ['table', tableSection]
  ]);
  
  buildReport(config: ReportConfig, data: any): string {
    const builder = new MarkdownReportBuilder();
    
    // Apply sections in order
    config.sections.forEach(sectionName => {
      const sectionBuilder = this.sections.get(sectionName);
      if (sectionBuilder && data[sectionName]) {
        sectionBuilder(builder, data[sectionName]);
      }
    });
    
    return builder.build();
  }
}
</implementation>
</pattern>

<pattern name="Dynamic Template Loading">
<description>
Load and manage templates from external sources
</description>
<implementation>
interface ITemplateSource {
  load(name: string): Promise&lt;string&gt;;
  list(): Promise&lt;string[]&gt;;
}

class FileSystemTemplateSource implements ITemplateSource {
  constructor(
    private fs: IFileSystem,
    private baseDir: string
  ) {}
  
  async load(name: string): Promise&lt;string&gt; {
    const path = this.fs.join(this.baseDir, `${name}.template`);
    return this.fs.readFile(path);
  }
  
  async list(): Promise&lt;string[]&gt; {
    const files = await this.fs.listDirectory(this.baseDir);
    return files
      .filter(f => f.endsWith('.template'))
      .map(f => this.fs.basename(f, '.template'));
  }
}

class DynamicTemplateManager {
  private registry = new TemplateRegistry();
  private engine = new TemplateEngine();
  
  constructor(private source: ITemplateSource) {}
  
  async initialize(): Promise&lt;void&gt; {
    const templates = await this.source.list();
    
    for (const name of templates) {
      const content = await this.source.load(name);
      this.registry.register(name, content);
    }
  }
  
  async render(templateName: string, data: any): Promise&lt;string&gt; {
    if (!this.registry.has(templateName)) {
      // Try to load on-demand
      const content = await this.source.load(templateName);
      this.registry.register(templateName, content);
    }
    
    return this.engine.render(this.registry.get(templateName), data);
  }
}
</implementation>
</pattern>

<pattern name="Multi-Format Output">
<description>
Generate reports in multiple formats from same structure
</description>
<implementation>
interface IReportFormatter {
  format(builder: IReportBuilder): string;
}

class MarkdownFormatter implements IReportFormatter {
  format(builder: IReportBuilder): string {
    return builder.build(); // Already markdown
  }
}

class HtmlFormatter implements IReportFormatter {
  format(builder: IReportBuilder): string {
    const markdown = builder.build();
    // Convert markdown to HTML (simplified)
    return markdown
      .replace(/^# (.+)$/gm, '&lt;h1&gt;$1&lt;/h1&gt;')
      .replace(/^## (.+)$/gm, '&lt;h2&gt;$1&lt;/h2&gt;')
      .replace(/^- (.+)$/gm, '&lt;li&gt;$1&lt;/li&gt;')
      .replace(/\n\n/g, '&lt;/p&gt;&lt;p&gt;')
      .replace(/^/, '&lt;p&gt;')
      .replace(/$/, '&lt;/p&gt;');
  }
}

class JsonFormatter implements IReportFormatter {
  format(builder: IReportBuilder): string {
    // Extract structure from builder (would need builder API extension)
    return JSON.stringify({
      sections: this.extractSections(builder),
      metadata: {
        generated: new Date().toISOString(),
        format: 'json'
      }
    }, null, 2);
  }
  
  private extractSections(builder: IReportBuilder): any[] {
    // Implementation would depend on builder internals
    return [];
  }
}

// Usage
class MultiFormatReportGenerator {
  private formatters = new Map&lt;string, IReportFormatter&gt;([
    ['markdown', new MarkdownFormatter()],
    ['html', new HtmlFormatter()],
    ['json', new JsonFormatter()]
  ]);
  
  generate(data: any, format: string = 'markdown'): string {
    const builder = new MarkdownReportBuilder()
      .title(data.title)
      .section('Content')
      .paragraph(data.content);
    
    const formatter = this.formatters.get(format) || this.formatters.get('markdown')!;
    return formatter.format(builder);
  }
}
</implementation>
</pattern>

## Migration Guide

<migration_steps>
<step number="1" title="Replace String Concatenation">
<from>
function generateReport(data: any): string {
  let report = '# ' + data.title + '\n\n';
  report += '## Summary\n';
  report += data.summary + '\n\n';
  
  if (data.items) {
    report += '## Items\n';
    data.items.forEach((item: any) => {
      report += '- ' + item.name + ': ' + item.value + '\n';
    });
  }
  
  return report;
}
</from>
<to>
import { MarkdownReportBuilder } from 'report-templates';

function generateReport(data: any): string {
  const builder = new MarkdownReportBuilder()
    .title(data.title)
    .section('Summary')
    .paragraph(data.summary);
    
  if (data.items) {
    builder
      .section('Items')
      .bulletList(data.items.map(item => `${item.name}: ${item.value}`));
  }
  
  return builder.build();
}
</to>
</step>

<step number="2" title="Extract Templates">
<from>
function formatUserReport(user: User): string {
  return `
# User Report: ${user.name}

**ID**: ${user.id}
**Email**: ${user.email}
**Status**: ${user.isActive ? 'Active' : 'Inactive'}

## Activity
Last login: ${user.lastLogin}
Total sessions: ${user.sessionCount}
`;
}
</from>
<to>
import { TemplateEngine } from 'report-templates';

const userReportTemplate = `
# User Report: {{name}}

**ID**: {{id}}
**Email**: {{email}}
**Status**: {{#if isActive}}Active{{else}}Inactive{{/if}}

## Activity
Last login: {{lastLogin}}
Total sessions: {{sessionCount}}
`;

const engine = new TemplateEngine();

function formatUserReport(user: User): string {
  return engine.render(userReportTemplate, user);
}
</to>
</step>

<step number="3" title="Centralize Templates">
<from>
// Templates scattered across files
const template1 = '...';
const template2 = '...';
// In different modules
</from>
<to>
import { TemplateRegistry } from 'report-templates';

// Centralized template management
export function setupTemplates(): TemplateRegistry {
  const registry = new TemplateRegistry();
  
  registry.registerBulk({
    'user-report': userReportTemplate,
    'summary-report': summaryReportTemplate,
    'detail-section': detailSectionTemplate,
    // All templates in one place
  });
  
  return registry;
}

// Use anywhere
const template = registry.get('user-report');
</to>
</step>
</migration_steps>

## Best Practices

<best_practices>
<practice name="Separate Templates from Logic">
<description>Keep templates in separate files or registry, not inline with code</description>
<good>
// templates/reports.ts
export const templates = {
  summary: `# {{title}}\n{{content}}`,
  detail: `## {{section}}\n{{details}}`
};

// report-generator.ts
import { templates } from './templates/reports';
const output = engine.render(templates.summary, data);
</good>
<bad>
// Mixed concerns
function generateReport(data) {
  const template = `# {{title}}\n{{content}}`; // Template mixed with logic
  return engine.render(template, data);
}
</bad>
</practice>

<practice name="Use Builder for Structure">
<description>Use MarkdownReportBuilder for document structure, templates for content</description>
<good>
const builder = new MarkdownReportBuilder()
  .title('Report')
  .section('Details');

// Use template for complex content
const content = engine.render(detailTemplate, data);
builder.raw(content);
</good>
<bad>
// Everything in templates
const template = `# Report\n## Details\n${complexLogicInTemplate}`;
</bad>
</practice>

<practice name="Validate Template Data">
<description>Validate data before passing to template engine</description>
<good>
interface ReportData {
  title: string;
  items: Array<{ name: string; value: number }>;
}

function renderReport(data: ReportData): string {
  // TypeScript ensures data structure
  return engine.render(reportTemplate, data);
}
</good>
<bad>
function renderReport(data: any): string {
  // No validation - template might fail
  return engine.render(reportTemplate, data);
}
</bad>
</practice>

<practice name="Handle Missing Data Gracefully">
<description>Design templates to handle optional data</description>
<good>
const template = `
# {{title}}

{{#if description}}
{{description}}
{{else}}
*No description available*
{{/if}}

{{#if items.length}}
## Items
{{#each items}}
- {{name}}
{{/each}}
{{/if}}
`;
</good>
<bad>
const template = `
# {{title}}
{{description}} <!-- Might be undefined -->

## Items
{{#each items}} <!-- Might error if items is null -->
- {{name}}
{{/each}}
`;
</bad>
</practice>

<practice name="Precompile Frequent Templates">
<description>Compile templates used repeatedly for better performance</description>
<good>
class ReportService {
  private compiledTemplates = new Map&lt;string, CompiledTemplate&gt;();
  
  constructor(private engine: TemplateEngine) {
    // Precompile on startup
    this.compiledTemplates.set(
      'summary',
      engine.compile(summaryTemplate)
    );
  }
  
  renderSummary(data: any): string {
    return this.compiledTemplates.get('summary')!(data);
  }
}
</good>
</practice>
</best_practices>