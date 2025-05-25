# Report Templates Package Overview

<package_purpose>
The report-templates package provides a fluent API for building structured reports with a template engine for dynamic content rendering. It enables consistent report generation through reusable templates, a builder pattern for report construction, and a registry system for template management.
</package_purpose>

## Key Features

<feature_list>
<feature name="Template Engine">
Simple yet powerful template engine supporting variable substitution, conditional rendering, and loops for dynamic content generation from structured data.
</feature>

<feature name="Markdown Report Builder">
Fluent API for constructing markdown-formatted reports with sections, headers, tables, lists, and code blocks in a type-safe, composable manner.
</feature>

<feature name="Template Registry">
Centralized management of report templates with versioning support, allowing template reuse and consistent formatting across different report types.
</feature>

<feature name="Minimal Dependencies">
Zero production dependencies beyond TypeScript interfaces, keeping the package lightweight and focused on template rendering.
</feature>

<feature name="Type-Safe Builder Pattern">
Strongly typed builder methods ensure valid report structure at compile time, preventing runtime formatting errors.
</feature>

<feature name="100% Test Coverage">
Comprehensive test suite ensures reliability and serves as documentation for all template features and builder patterns.
</feature>
</feature_list>

## Common Use Cases

<use_cases>
<use_case name="Building Structured Reports">
<description>
Create well-formatted reports with consistent structure using the fluent builder API.
</description>
<example>
const report = new MarkdownReportBuilder()
  .title('H1B Visa Analysis Report')
  .subtitle('Q4 2024 Analysis')
  .section('Executive Summary')
    .paragraph('This report analyzes H1B visa trends...')
    .bulletList([
      'Total applications: 500,000',
      'Approval rate: 85%',
      'Top employers: Tech companies'
    ])
  .section('Detailed Analysis')
    .table({
      headers: ['Company', 'Applications', 'Approvals'],
      rows: [
        ['Google', '10,000', '9,500'],
        ['Microsoft', '8,000', '7,200']
      ]
    })
  .build();
</example>
</use_case>

<use_case name="Dynamic Template Rendering">
<description>
Render templates with variable substitution and conditional content based on data.
</description>
<example>
const template = `
# {{title}}

{{#if showSummary}}
## Summary
Total records: {{stats.total}}
Success rate: {{stats.successRate}}%
{{/if}}

{{#each companies}}
- {{name}}: {{count}} applications
{{/each}}
`;

const rendered = templateEngine.render(template, {
  title: 'H1B Report',
  showSummary: true,
  stats: { total: 1000, successRate: 85 },
  companies: [
    { name: 'TechCorp', count: 100 },
    { name: 'DataInc', count: 80 }
  ]
});
</example>
</use_case>

<use_case name="Template Registry Management">
<description>
Store and retrieve commonly used templates for consistent report formatting.
</description>
<example>
const registry = new TemplateRegistry();

// Register templates
registry.register('monthly-summary', monthlyTemplate);
registry.register('quarterly-analysis', quarterlyTemplate);
registry.register('annual-report', annualTemplate);

// Use registered template
const template = registry.get('quarterly-analysis');
const report = templateEngine.render(template, quarterlyData);
</example>
</use_case>

<use_case name="Composable Report Sections">
<description>
Build complex reports by composing reusable sections and components.
</description>
<example>
function createStatsSection(builder: MarkdownReportBuilder, stats: Stats) {
  return builder
    .section('Statistics')
    .paragraph(`Analysis period: ${stats.startDate} to ${stats.endDate}`)
    .codeBlock(JSON.stringify(stats.summary, null, 2), 'json');
}

function createChartSection(builder: MarkdownReportBuilder, chartData: ChartData) {
  return builder
    .section('Visualizations')
    .image(chartData.url, chartData.title)
    .paragraph(chartData.description);
}

// Compose sections
const report = new MarkdownReportBuilder()
  .title('Comprehensive Analysis');
  
createStatsSection(report, statsData);
createChartSection(report, chartData);

const output = report.build();
</example>
</use_case>

<use_case name="Format-Agnostic Templates">
<description>
Design templates that can be rendered to different output formats.
</description>
<example>
interface IReportBuilder {
  title(text: string): this;
  section(name: string): this;
  paragraph(text: string): this;
  build(): string;
}

// Same template logic, different output
class HtmlReportBuilder implements IReportBuilder {
  build(): string {
    return `<html><body>${this.content}</body></html>`;
  }
}

class MarkdownReportBuilder implements IReportBuilder {
  build(): string {
    return this.sections.join('\n\n');
  }
}

// Template works with any builder
function createReport(builder: IReportBuilder, data: any) {
  return builder
    .title(data.title)
    .section('Overview')
    .paragraph(data.summary)
    .build();
}
</example>
</use_case>
</use_cases>

## Integration Example

<integration_example>
<description>
Complete integration showing template engine, builder, and registry working together:
</description>
<code>
import { TemplateEngine, MarkdownReportBuilder, TemplateRegistry } from 'report-templates';

class ReportGenerator {
  private templateEngine = new TemplateEngine();
  private registry = new TemplateRegistry();

  constructor() {
    // Register standard templates
    this.registry.register('header', '# {{title}}\n*Generated: {{date}}*\n');
    this.registry.register('stats', '**Total**: {{total}} | **Rate**: {{rate}}%');
  }

  async generateReport(data: ReportData): Promise<string> {
    // Start with template header
    const header = this.templateEngine.render(
      this.registry.get('header'),
      { title: data.title, date: new Date().toISOString() }
    );

    // Build main content
    const builder = new MarkdownReportBuilder()
      .raw(header)
      .section('Executive Summary')
      .paragraph(data.summary);

    // Add statistics
    if (data.stats) {
      const statsContent = this.templateEngine.render(
        this.registry.get('stats'),
        data.stats
      );
      builder.section('Statistics').raw(statsContent);
    }

    // Add detailed sections
    data.sections.forEach(section => {
      builder
        .section(section.title)
        .paragraph(section.content);
        
      if (section.data) {
        builder.table({
          headers: Object.keys(section.data[0]),
          rows: section.data.map(row => Object.values(row))
        });
      }
    });

    return builder.build();
  }
}
</code>
</integration_example>

## Design Philosophy

<design_principles>
<principle name="Fluent Interface">
Builder pattern with method chaining creates readable, self-documenting report construction code.
</principle>

<principle name="Separation of Concerns">
Template engine handles rendering, builder handles structure, registry handles storage - each with single responsibility.
</principle>

<principle name="Zero Dependencies">
No external dependencies keeps the package lightweight and reduces potential security vulnerabilities.
</principle>

<principle name="Type Safety">
Full TypeScript support ensures compile-time validation of report structure and template data.
</principle>

<principle name="Extensibility">
Interface-based design allows custom builders and template engines while maintaining compatibility.
</principle>
</design_principles>