# File System Package Integration Guide

<integration_overview>
The file-system package serves as the foundation for all file I/O operations across the monorepo. It integrates seamlessly with the dependency injection framework and provides a consistent, testable interface for services that need file access.
</integration_overview>

## Package Dependencies

<dependencies>
<dependency name="inversify" type="production">
Used for @injectable decorator on NodeFileSystem implementation
</dependency>

<dependency name="@types/node" type="development">
TypeScript definitions for Node.js fs and path modules
</dependency>
</dependencies>

## Integration Points

<integration_matrix>
<integration package="di-framework" type="injected">
<description>
NodeFileSystem is registered as a singleton in the DI container using the TYPES.IFileSystem token
</description>
<code>
container.bind&lt;IFileSystem&gt;(TYPES.IFileSystem)
  .to(NodeFileSystem)
  .inSingletonScope();
</code>
</integration>

<integration package="test-mocks" type="mocked">
<description>
MockFileSystem implementation provided for unit testing, maintaining in-memory file system state
</description>
<code>
import { MockFileSystem } from 'test-mocks';

const mockFs = new MockFileSystem();
mockFs.addFile('/config/app.json', '{"name": "test"}');
container.rebind&lt;IFileSystem&gt;(TYPES.IFileSystem)
  .toConstantValue(mockFs);
</code>
</integration>

<integration package="logger" type="consumer">
<description>
Logger package uses IFileSystem for reading configuration files and managing log file paths
</description>
<code>
// In logger configuration
const configPath = this.fs.resolve('./config/logger.json');
if (await this.fs.exists(configPath)) {
  const config = await this.fs.readFile(configPath);
  // Apply configuration
}
</code>
</integration>

<integration package="report-generator" type="consumer">
<description>
Main ReportGenerator service uses IFileSystem for all report output operations
</description>
<code>
@injectable()
export class ReportGenerator {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem
  ) {}

  async generateReport(): Promise&lt;void&gt; {
    const outputPath = this.fs.join('dist', 'reports', 'h1b-report.html');
    await this.fs.writeFile(outputPath, reportContent);
  }
}
</code>
</integration>

<integration package="dependency-checker" type="consumer">
<description>
DependencyChecker service uses IFileSystem to verify package.json files and check directory existence
</description>
<code>
async checkDependency(name: string): Promise&lt;boolean&gt; {
  const packagePath = this.fs.join('packages', name, 'package.json');
  if (!await this.fs.exists(packagePath)) {
    return false;
  }
  const content = await this.fs.readFile(packagePath);
  const pkg = JSON.parse(content);
  return pkg.name === expectedName;
}
</code>
</integration>
</integration_matrix>

## Common Integration Patterns

<pattern name="Service with File I/O">
<description>
Standard pattern for services that need file system access
</description>
<implementation>
import { injectable, inject } from 'inversify';
import type { IFileSystem } from 'file-system';
import type { ILogger } from '@chasenogap/logger';
import { TYPES } from '../constants/injection-tokens.js';

@injectable()
export class DataProcessor {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem,
    @inject(TYPES.ILogger) private logger: ILogger
  ) {}

  async processDataFile(inputPath: string): Promise&lt;ProcessResult&gt; {
    this.logger.info('Processing data file', { path: inputPath });
    
    try {
      // Check file exists
      if (!await this.fs.exists(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      // Read and process
      const content = await this.fs.readFile(inputPath);
      const data = JSON.parse(content);
      const result = this.transform(data);

      // Write output
      const outputPath = inputPath.replace('.json', '-processed.json');
      await this.fs.writeFile(outputPath, JSON.stringify(result, null, 2));

      return { success: true, outputPath };
    } catch (error) {
      this.logger.error('Failed to process data file', error as Error);
      throw error;
    }
  }
}
</implementation>
</pattern>

<pattern name="Configuration Loading">
<description>
Pattern for loading configuration files with fallback to defaults
</description>
<implementation>
export class ConfigLoader {
  constructor(
    private fs: IFileSystem,
    private configDir: string = './config'
  ) {}

  async loadConfig&lt;T&gt;(
    filename: string, 
    defaultConfig: T
  ): Promise&lt;T&gt; {
    const configPath = this.fs.join(this.configDir, filename);
    
    try {
      const content = await this.fs.readFile(configPath);
      return { ...defaultConfig, ...JSON.parse(content) };
    } catch (error) {
      if (error instanceof FileSystemError && error.code === 'ENOENT') {
        // Config doesn't exist, create it with defaults
        await this.fs.createDirectory(this.configDir, { recursive: true });
        await this.fs.writeFile(
          configPath, 
          JSON.stringify(defaultConfig, null, 2)
        );
        return defaultConfig;
      }
      throw error;
    }
  }
}
</implementation>
</pattern>

<pattern name="Output Directory Management">
<description>
Ensuring output directories exist before writing files
</description>
<implementation>
export class OutputManager {
  constructor(
    private fs: IFileSystem,
    private baseOutputDir: string = './dist'
  ) {}

  async prepareOutputPath(relativePath: string): Promise&lt;string&gt; {
    const fullPath = this.fs.join(this.baseOutputDir, relativePath);
    const dir = this.fs.dirname(fullPath);
    
    // Create directory structure if needed
    await this.fs.createDirectory(dir, { recursive: true });
    
    return fullPath;
  }

  async writeOutput(relativePath: string, content: string): Promise&lt;void&gt; {
    const outputPath = await this.prepareOutputPath(relativePath);
    await this.fs.writeFile(outputPath, content);
  }
}
</implementation>
</pattern>

## Testing Integration

<testing_setup>
<description>
Setting up file system mocks for unit tests
</description>
<code>
import { beforeEach, describe, it, expect } from 'vitest';
import { Container } from 'inversify';
import { MockFileSystem } from 'test-mocks';
import type { IFileSystem } from 'file-system';
import { TYPES } from '../constants/injection-tokens.js';

describe('ServiceWithFileIO', () => {
  let container: Container;
  let mockFs: MockFileSystem;

  beforeEach(() => {
    container = new Container();
    mockFs = new MockFileSystem();
    
    // Setup mock file system
    mockFs.addFile('/data/input.json', '{"value": 42}');
    mockFs.addDirectory('/output');
    
    // Bind mock to container
    container.bind&lt;IFileSystem&gt;(TYPES.IFileSystem)
      .toConstantValue(mockFs);
  });

  it('should read input file and write output', async () => {
    const service = container.resolve(MyService);
    
    await service.process('/data/input.json');
    
    // Verify output was written
    expect(mockFs.exists('/output/result.json')).toBe(true);
    const output = mockFs.readFileSync('/output/result.json');
    expect(JSON.parse(output)).toEqual({ value: 42, processed: true });
  });
});
</code>
</testing_setup>

## Migration Guide

<migration_steps>
<step number="1" title="Replace Direct fs Usage">
<from>
import { promises as fs } from 'fs';
import path from 'path';

export class OldService {
  async loadData() {
    const filePath = path.join(process.cwd(), 'data.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }
}
</from>
<to>
import { inject, injectable } from 'inversify';
import type { IFileSystem } from 'file-system';
import { TYPES } from './constants/injection-tokens.js';

@injectable()
export class NewService {
  constructor(
    @inject(TYPES.IFileSystem) private fs: IFileSystem
  ) {}

  async loadData() {
    const filePath = this.fs.join(process.cwd(), 'data.json');
    const content = await this.fs.readFile(filePath);
    return JSON.parse(content);
  }
}
</to>
</step>

<step number="2" title="Update Error Handling">
<from>
try {
  await fs.readFile(path);
} catch (error: any) {
  if (error.code === 'ENOENT') {
    console.log('File not found');
  }
}
</from>
<to>
import { FileSystemError } from 'file-system';

try {
  await this.fs.readFile(path);
} catch (error) {
  if (error instanceof FileSystemError && error.code === 'ENOENT') {
    console.log(`File not found: ${error.path}`);
  }
}
</to>
</step>

<step number="3" title="Update Tests">
<from>
import { vol } from 'memfs';
jest.mock('fs/promises');

beforeEach(() => {
  vol.fromJSON({
    '/test/file.txt': 'content'
  });
});
</from>
<to>
import { MockFileSystem } from 'test-mocks';

beforeEach(() => {
  const mockFs = new MockFileSystem();
  mockFs.addFile('/test/file.txt', 'content');
  
  container.rebind&lt;IFileSystem&gt;(TYPES.IFileSystem)
    .toConstantValue(mockFs);
});
</to>
</step>
</migration_steps>

## Best Practices

<best_practices>
<practice name="Always Use Path Methods">
<description>Use IFileSystem path methods instead of string concatenation for cross-platform compatibility</description>
<good>
const configPath = this.fs.join(baseDir, 'config', 'app.json');
const absolutePath = this.fs.resolve('./relative/path');
</good>
<bad>
const configPath = baseDir + '/config/app.json';  // Breaks on Windows
const absolutePath = process.cwd() + '/relative/path';
</bad>
</practice>

<practice name="Handle FileSystemError Specifically">
<description>Check error types and codes for appropriate error handling</description>
<good>
try {
  await this.fs.readFile(path);
} catch (error) {
  if (error instanceof FileSystemError) {
    switch (error.code) {
      case 'ENOENT':
        return this.handleMissingFile(error.path);
      case 'EACCES':
        throw new Error(`Permission denied: ${error.path}`);
      default:
        throw error;
    }
  }
  throw error;
}
</good>
</practice>

<practice name="Use Recursive Directory Creation">
<description>Always use recursive: true when creating directories to avoid parent directory errors</description>
<good>
await this.fs.createDirectory(outputDir, { recursive: true });
</good>
<bad>
// May fail if parent doesn't exist
await this.fs.createDirectory(outputDir);
</bad>
</practice>

<practice name="Validate Paths Early">
<description>Check file existence before operations to provide better error messages</description>
<good>
if (!await this.fs.exists(inputFile)) {
  throw new Error(`Input file not found: ${inputFile}`);
}
const content = await this.fs.readFile(inputFile);
</good>
</practice>
</best_practices>