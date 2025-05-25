# Report Templates Package API Reference

<api_overview>
The report-templates package exports a template engine, report builders, and a template registry system. The main exports are TemplateEngine for rendering, MarkdownReportBuilder for report construction, and TemplateRegistry for template management.
</api_overview>

## Core Interfaces

<interface name="ITemplateEngine">
<description>
Interface for template rendering engines that process templates with data
</description>

<method signature="render(template: string, data: any): string">
<description>Renders a template string with provided data</description>
<param name="template" type="string">Template string with placeholders</param>
<param name="data" type="any">Data object for variable substitution</param>
<returns>Rendered string with substitutions applied</returns>
<example>
engine.render('Hello {{name}}!', { name: 'World' }); // "Hello World!"
</example>
</method>

<method signature="compile(template: string): CompiledTemplate">
<description>Pre-compiles a template for repeated use</description>
<param name="template" type="string">Template string to compile</param>
<returns>Compiled template function</returns>
<example>
const compiled = engine.compile('Hi {{name}}');
compiled({ name: 'Alice' }); // "Hi Alice"
compiled({ name: 'Bob' }); // "Hi Bob"
</example>
</method>
</interface>

<interface name="IReportBuilder">
<description>
Interface for report builders that construct structured documents
</description>

<method signature="title(text: string): this">
<description>Sets the main title of the report</description>
<param name="text" type="string">Title text</param>
<returns>Builder instance for chaining</returns>
</method>

<method signature="subtitle(text: string): this">
<description>Sets a subtitle or secondary heading</description>
<param name="text" type="string">Subtitle text</param>
<returns>Builder instance for chaining</returns>
</method>

<method signature="section(name: string): this">
<description>Starts a new section with heading</description>
<param name="name" type="string">Section heading</param>
<returns>Builder instance for chaining</returns>
</method>

<method signature="paragraph(text: string): this">
<description>Adds a paragraph of text</description>
<param name="text" type="string">Paragraph content</param>
<returns>Builder instance for chaining</returns>
</method>

<method signature="build(): string">
<description>Finalizes and returns the built report</description>
<returns>Complete report as string</returns>
</method>
</interface>

<interface name="ITemplateRegistry">
<description>
Interface for managing named templates
</description>

<method signature="register(name: string, template: string): void">
<description>Registers a template with a name</description>
<param name="name" type="string">Template identifier</param>
<param name="template" type="string">Template content</param>
</method>

<method signature="get(name: string): string">
<description>Retrieves a registered template</description>
<param name="name" type="string">Template identifier</param>
<returns>Template content</returns>
<throws>Error if template not found</throws>
</method>

<method signature="has(name: string): boolean">
<description>Checks if a template is registered</description>
<param name="name" type="string">Template identifier</param>
<returns>True if template exists</returns>
</method>

<method signature="remove(name: string): boolean">
<description>Removes a registered template</description>
<param name="name" type="string">Template identifier</param>
<returns>True if template was removed</returns>
</method>

<method signature="list(): string[]">
<description>Lists all registered template names</description>
<returns>Array of template identifiers</returns>
</method>
</interface>

## Classes

<class name="TemplateEngine">
<description>
Default implementation of template engine with Handlebars-like syntax
</description>
<implements>ITemplateEngine</implements>

<constructor signature="constructor(options?: TemplateEngineOptions)">
<param name="options" type="TemplateEngineOptions" optional="true">Configuration options</param>
</constructor>

<method_group name="Rendering">
<method signature="render(template: string, data: any): string">
<description>Renders template with variable substitution and control flow</description>
<supports>
- Variable substitution: {{variable}}
- Nested properties: {{user.name}}
- Conditionals: {{#if condition}}...{{/if}}
- Loops: {{#each array}}...{{/each}}
- Comments: {{! comment }}
</supports>
<example>
const template = `
{{! User greeting template }}
Hello {{user.name}}!
{{#if user.isPremium}}
Thank you for being a premium member!
{{/if}}
`;

engine.render(template, {
  user: { name: 'Alice', isPremium: true }
});
</example>
</method>

<method signature="compile(template: string): CompiledTemplate">
<description>Compiles template into reusable function</description>
<returns>Function that accepts data and returns rendered string</returns>
<performance>Pre-compilation improves performance for repeated renders</performance>
</method>
</method_group>

<method_group name="Helpers">
<method signature="registerHelper(name: string, helper: HelperFunction): void">
<description>Registers a custom helper function</description>
<param name="name" type="string">Helper name</param>
<param name="helper" type="HelperFunction">Helper implementation</param>
<example>
engine.registerHelper('uppercase', (str: string) => str.toUpperCase());
// Usage: {{uppercase name}}
</example>
</method>

<method signature="registerPartial(name: string, partial: string): void">
<description>Registers a reusable template partial</description>
<param name="name" type="string">Partial name</param>
<param name="partial" type="string">Partial template</param>
<example>
engine.registerPartial('header', '# {{title}}\n---');
// Usage: {{> header}}
</example>
</method>
</method_group>
</class>

<class name="MarkdownReportBuilder">
<description>
Fluent builder for creating Markdown-formatted reports
</description>
<implements>IReportBuilder</implements>

<constructor signature="constructor()">
<description>Creates new builder instance with empty content</description>
</constructor>

<method_group name="Structure">
<method signature="title(text: string): this">
<description>Adds H1 heading</description>
<output># {text}</output>
</method>

<method signature="subtitle(text: string): this">
<description>Adds H2 heading</description>
<output>## {text}</output>
</method>

<method signature="section(name: string, level?: number): this">
<description>Adds section with specified heading level</description>
<param name="name" type="string">Section heading</param>
<param name="level" type="number" optional="true">Heading level 1-6 (default: 2)</param>
<output>{"#".repeat(level)} {name}</output>
</method>

<method signature="paragraph(text: string): this">
<description>Adds paragraph with blank line separation</description>
<output>{text}\n</output>
</method>
</method_group>

<method_group name="Lists">
<method signature="bulletList(items: string[]): this">
<description>Adds unordered list</description>
<param name="items" type="string[]">List items</param>
<output>
- item1
- item2
- item3
</output>
</method>

<method signature="numberedList(items: string[]): this">
<description>Adds ordered list</description>
<param name="items" type="string[]">List items</param>
<output>
1. item1
2. item2
3. item3
</output>
</method>

<method signature="taskList(tasks: TaskItem[]): this">
<description>Adds GitHub-style task list</description>
<param name="tasks" type="TaskItem[]">Array of task items with checked status</param>
<output>
- [x] Completed task
- [ ] Pending task
</output>
</method>
</method_group>

<method_group name="Content Elements">
<method signature="table(config: TableConfig): this">
<description>Adds formatted table</description>
<param name="config" type="TableConfig">Table configuration with headers and rows</param>
<example>
builder.table({
  headers: ['Name', 'Count'],
  rows: [['Alice', '10'], ['Bob', '20']],
  alignment: ['left', 'right']
});
// | Name | Count |
// |:-----|------:|
// | Alice|    10 |
// | Bob  |    20 |
</example>
</method>

<method signature="codeBlock(code: string, language?: string): this">
<description>Adds fenced code block</description>
<param name="code" type="string">Code content</param>
<param name="language" type="string" optional="true">Language for syntax highlighting</param>
<output>
```{language}
{code}
```
</output>
</method>

<method signature="blockquote(text: string): this">
<description>Adds blockquote</description>
<param name="text" type="string">Quote content</param>
<output>> {text}</output>
</method>

<method signature="horizontalRule(): this">
<description>Adds horizontal rule separator</description>
<output>---</output>
</method>

<method signature="link(text: string, url: string, title?: string): this">
<description>Adds inline link</description>
<param name="text" type="string">Link text</param>
<param name="url" type="string">Link URL</param>
<param name="title" type="string" optional="true">Link title on hover</param>
<output>[{text}]({url} "{title}")</output>
</method>

<method signature="image(alt: string, url: string, title?: string): this">
<description>Adds image</description>
<param name="alt" type="string">Alt text</param>
<param name="url" type="string">Image URL</param>
<param name="title" type="string" optional="true">Image title</param>
<output>![{alt}]({url} "{title}")</output>
</method>
</method_group>

<method_group name="Raw Content">
<method signature="raw(content: string): this">
<description>Adds raw content without processing</description>
<param name="content" type="string">Raw markdown content</param>
<returns>Builder instance</returns>
</method>

<method signature="newline(count?: number): this">
<description>Adds blank lines</description>
<param name="count" type="number" optional="true">Number of newlines (default: 1)</param>
<returns>Builder instance</returns>
</method>
</method_group>

<method_group name="Building">
<method signature="build(): string">
<description>Generates final markdown document</description>
<returns>Complete markdown string</returns>
</method>

<method signature="reset(): this">
<description>Clears all content and starts fresh</description>
<returns>Builder instance</returns>
</method>
</method_group>
</class>

<class name="TemplateRegistry">
<description>
Manages collection of named templates
</description>
<implements>ITemplateRegistry</implements>

<constructor signature="constructor()">
<description>Creates empty registry</description>
</constructor>

<method_group name="Template Management">
<method signature="register(name: string, template: string): void">
<description>Adds or updates a template</description>
<param name="name" type="string">Unique template identifier</param>
<param name="template" type="string">Template content</param>
<throws>Error if name is empty</throws>
</method>

<method signature="registerBulk(templates: Record<string, string>): void">
<description>Registers multiple templates at once</description>
<param name="templates" type="Record<string, string>">Object mapping names to templates</param>
<example>
registry.registerBulk({
  'header': '# {{title}}',
  'footer': '---\n*Generated on {{date}}*',
  'section': '## {{name}}\n{{content}}'
});
</example>
</method>

<method signature="get(name: string): string">
<description>Retrieves template by name</description>
<param name="name" type="string">Template identifier</param>
<returns>Template content</returns>
<throws>Error if template not found</throws>
</method>

<method signature="getOrDefault(name: string, defaultTemplate: string): string">
<description>Retrieves template with fallback</description>
<param name="name" type="string">Template identifier</param>
<param name="defaultTemplate" type="string">Fallback template</param>
<returns>Template content or default</returns>
</method>
</method_group>

<method_group name="Registry Operations">
<method signature="has(name: string): boolean">
<description>Checks template existence</description>
<param name="name" type="string">Template identifier</param>
<returns>True if template exists</returns>
</method>

<method signature="remove(name: string): boolean">
<description>Deletes a template</description>
<param name="name" type="string">Template identifier</param>
<returns>True if template was removed</returns>
</method>

<method signature="clear(): void">
<description>Removes all templates</description>
</method>

<method signature="list(): string[]">
<description>Gets all template names</description>
<returns>Array of template identifiers</returns>
</method>

<method signature="count(): number">
<description>Gets number of registered templates</description>
<returns>Template count</returns>
</method>
</method_group>

<method_group name="Import/Export">
<method signature="export(): Record<string, string>">
<description>Exports all templates as object</description>
<returns>Object mapping names to templates</returns>
</method>

<method signature="import(templates: Record<string, string>): void">
<description>Imports templates from object</description>
<param name="templates" type="Record<string, string>">Templates to import</param>
</method>
</method_group>
</class>

## Type Definitions

<type name="TemplateEngineOptions">
<description>Configuration options for template engine</description>
<properties>
<property name="strict" type="boolean" optional="true">Throw on missing variables (default: false)</property>
<property name="helpers" type="Record<string, HelperFunction>" optional="true">Initial helper functions</property>
<property name="partials" type="Record<string, string>" optional="true">Initial partials</property>
</properties>
</type>

<type name="CompiledTemplate">
<description>Function returned by template compilation</description>
<signature>type CompiledTemplate = (data: any) => string</signature>
</type>

<type name="HelperFunction">
<description>Custom template helper function</description>
<signature>type HelperFunction = (...args: any[]) => string</signature>
</type>

<type name="TableConfig">
<description>Configuration for markdown tables</description>
<properties>
<property name="headers" type="string[]">Column headers</property>
<property name="rows" type="string[][]">Table data rows</property>
<property name="alignment" type="('left' | 'center' | 'right')[]" optional="true">Column alignments</property>
</properties>
</type>

<type name="TaskItem">
<description>Task list item</description>
<properties>
<property name="text" type="string">Task description</property>
<property name="checked" type="boolean">Completion status</property>
</properties>
</type>

## Usage Examples

<example name="Complete Report Generation">
<code>
import { TemplateEngine, MarkdownReportBuilder, TemplateRegistry } from 'report-templates';

// Setup
const engine = new TemplateEngine({ strict: false });
const registry = new TemplateRegistry();

// Register reusable templates
registry.register('summary-card', `
### {{title}}
**Status**: {{status}}
**Progress**: {{progress}}%

{{#if issues}}
⚠️ Issues:
{{#each issues}}
- {{this}}
{{/each}}
{{/if}}
`);

// Build report
const builder = new MarkdownReportBuilder()
  .title('Project Status Report')
  .subtitle(`Week of ${new Date().toLocaleDateString()}`)
  .section('Overview')
  .paragraph('This report summarizes project progress across all teams.')
  .horizontalRule();

// Add dynamic sections
const teams = [
  { title: 'Backend API', status: 'On Track', progress: 75 },
  { title: 'Frontend UI', status: 'At Risk', progress: 45, issues: ['Designer availability', 'API delays'] },
  { title: 'Documentation', status: 'Completed', progress: 100 }
];

teams.forEach(team => {
  const section = engine.render(registry.get('summary-card'), team);
  builder.raw(section).newline();
});

// Add summary table
builder
  .section('Summary')
  .table({
    headers: ['Team', 'Status', 'Progress'],
    rows: teams.map(t => [t.title, t.status, `${t.progress}%`])
  });

const report = builder.build();
</code>
</example>