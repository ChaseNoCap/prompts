# File System Package Overview

<package_purpose>
The file-system package provides a unified, testable abstraction layer over Node.js file and path operations. It enables platform-independent file I/O with consistent error handling and automatic directory creation, designed for dependency injection and easy mocking in tests.
</package_purpose>

## Key Features

<feature_list>
<feature name="Testable Abstraction">
Single interface (IFileSystem) that can be easily mocked for unit testing, eliminating direct fs module dependencies in application code.
</feature>

<feature name="Async-First Design">
All file operations return Promises, providing a modern async/await API that integrates seamlessly with TypeScript async workflows.
</feature>

<feature name="Automatic Directory Creation">
writeFile() automatically creates parent directories, preventing common ENOENT errors and simplifying file creation workflows.
</feature>

<feature name="Platform-Independent Paths">
Built-in path operations (join, resolve, normalize) handle platform differences, ensuring code works correctly on Windows, macOS, and Linux.
</feature>

<feature name="Consistent Error Handling">
FileSystemError class wraps native errors with additional context (code, path), making error handling more predictable and debuggable.
</feature>

<feature name="UTF-8 Default">
Text operations default to UTF-8 encoding, following modern standards while still allowing custom encodings when needed.
</feature>
</feature_list>

## Common Use Cases

<use_cases>
<use_case name="Reading Configuration Files">
<description>
Load JSON, YAML, or text configuration files with proper error handling and path resolution.
</description>
<example>
const configPath = fs.resolve('./config/app.json');
const content = await fs.readFile(configPath);
const config = JSON.parse(content);
</example>
</use_case>

<use_case name="Writing Output Files">
<description>
Generate reports, logs, or processed data with automatic directory creation.
</description>
<example>
const outputPath = fs.join(outputDir, 'reports', 'daily.html');
await fs.writeFile(outputPath, htmlContent); // Creates reports/ if needed
</example>
</use_case>

<use_case name="Directory Traversal">
<description>
Scan directories for files matching patterns or building file trees.
</description>
<example>
const files = await fs.listDirectory('./src');
for (const file of files) {
  const filePath = fs.join('./src', file);
  if (await fs.isFile(filePath) && file.endsWith('.ts')) {
    // Process TypeScript file
  }
}
</example>
</use_case>

<use_case name="Safe File Operations">
<description>
Check existence before operations, handle missing files gracefully.
</description>
<example>
if (await fs.exists(tempFile)) {
  await fs.deleteFile(tempFile);
}

// Or with error handling
try {
  const data = await fs.readFile(inputFile);
} catch (error) {
  if (error instanceof FileSystemError && error.code === 'ENOENT') {
    // Handle missing file
  }
}
</example>
</use_case>
</use_cases>

## Integration Example

<integration_example>
<description>
Typical service integration using dependency injection:
</description>
<code>
import { injectable, inject } from 'inversify';
import type { IFileSystem } from 'file-system';
import { TYPES } from '../constants/injection-tokens.js';

@injectable()
export class ReportGenerator {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem
  ) {}

  async generateReport(data: any): Promise<void> {
    const reportPath = this.fs.join('dist', 'reports', 'output.html');
    const html = this.renderReport(data);
    
    // Writes file and creates dist/reports/ if needed
    await this.fs.writeFile(reportPath, html);
  }
}
</code>
</integration_example>

## Design Philosophy

<design_principles>
<principle name="Single Responsibility">
Focuses solely on file and path operations, no business logic or data transformation.
</principle>

<principle name="Dependency Inversion">
Services depend on IFileSystem interface, not concrete implementation, enabling testing and flexibility.
</principle>

<principle name="Fail-Fast with Context">
Operations fail immediately with descriptive errors including operation type, error code, and file path.
</principle>

<principle name="Zero Configuration">
Works out-of-the-box with sensible defaults (UTF-8, auto-create directories) while allowing customization.
</principle>
</design_principles>