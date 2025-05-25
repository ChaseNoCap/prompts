# File System Package API Reference

<api_overview>
The file-system package exports interfaces, classes, and types for file and path operations. The main entry point is the IFileSystem interface, with NodeFileSystem as the production implementation.
</api_overview>

## Core Interfaces

<interface name="IFileSystem">
<description>
Main interface defining all file system operations. This is the primary abstraction that services depend on.
</description>

<method_group name="File Operations">
<method signature="readFile(filePath: string, encoding?: BufferEncoding): Promise<string>">
<description>Reads a file as text with specified encoding (defaults to UTF-8)</description>
<param name="filePath" type="string">Absolute or relative path to the file</param>
<param name="encoding" type="BufferEncoding" optional="true">Character encoding (default: 'utf-8')</param>
<returns>Promise resolving to file contents as string</returns>
<throws>FileSystemError with code 'ENOENT' if file doesn't exist</throws>
</method>

<method signature="writeFile(filePath: string, data: string, encoding?: BufferEncoding): Promise<void>">
<description>Writes text to a file, creating parent directories if needed</description>
<param name="filePath" type="string">Path where file should be written</param>
<param name="data" type="string">Content to write</param>
<param name="encoding" type="BufferEncoding" optional="true">Character encoding (default: 'utf-8')</param>
<returns>Promise resolving when write completes</returns>
<throws>FileSystemError with code 'EACCES' if permission denied</throws>
</method>

<method signature="deleteFile(filePath: string): Promise<void>">
<description>Deletes a file</description>
<param name="filePath" type="string">Path to file to delete</param>
<returns>Promise resolving when deletion completes</returns>
<throws>FileSystemError with code 'ENOENT' if file doesn't exist</throws>
</method>

<method signature="exists(path: string): Promise<boolean>">
<description>Checks if a file or directory exists</description>
<param name="path" type="string">Path to check</param>
<returns>Promise resolving to true if exists, false otherwise</returns>
</method>
</method_group>

<method_group name="Directory Operations">
<method signature="createDirectory(dirPath: string, options?: { recursive?: boolean }): Promise<void>">
<description>Creates a directory, optionally creating parent directories</description>
<param name="dirPath" type="string">Path to directory to create</param>
<param name="options" type="{ recursive?: boolean }" optional="true">Creation options</param>
<returns>Promise resolving when directory is created</returns>
<throws>FileSystemError with code 'EEXIST' if directory exists and recursive is false</throws>
</method>

<method signature="removeDirectory(dirPath: string, options?: { recursive?: boolean }): Promise<void>">
<description>Removes a directory, optionally removing contents</description>
<param name="dirPath" type="string">Path to directory to remove</param>
<param name="options" type="{ recursive?: boolean }" optional="true">Removal options</param>
<returns>Promise resolving when directory is removed</returns>
<throws>FileSystemError with code 'ENOTEMPTY' if directory has contents and recursive is false</throws>
</method>

<method signature="listDirectory(dirPath: string): Promise<string[]>">
<description>Lists all entries in a directory</description>
<param name="dirPath" type="string">Path to directory to list</param>
<returns>Promise resolving to array of entry names (not full paths)</returns>
<throws>FileSystemError with code 'ENOTDIR' if path is not a directory</throws>
</method>
</method_group>

<method_group name="File Information">
<method signature="getStats(path: string): Promise<IFileStats>">
<description>Gets detailed information about a file or directory</description>
<param name="path" type="string">Path to get stats for</param>
<returns>Promise resolving to IFileStats object</returns>
<throws>FileSystemError with code 'ENOENT' if path doesn't exist</throws>
</method>

<method signature="isFile(path: string): Promise<boolean>">
<description>Checks if path points to a file</description>
<param name="path" type="string">Path to check</param>
<returns>Promise resolving to true if path is a file, false otherwise</returns>
</method>

<method signature="isDirectory(path: string): Promise<boolean>">
<description>Checks if path points to a directory</description>
<param name="path" type="string">Path to check</param>
<returns>Promise resolving to true if path is a directory, false otherwise</returns>
</method>
</method_group>

<method_group name="Path Operations">
<method signature="join(...paths: string[]): string">
<description>Joins path segments using platform-specific separator</description>
<param name="paths" type="string[]" variadic="true">Path segments to join</param>
<returns>Joined path string</returns>
<example>fs.join('src', 'services', 'report.ts') // 'src/services/report.ts' on Unix</example>
</method>

<method signature="resolve(...paths: string[]): string">
<description>Resolves path segments to absolute path</description>
<param name="paths" type="string[]" variadic="true">Path segments to resolve</param>
<returns>Absolute path string</returns>
<example>fs.resolve('..', 'config') // '/Users/name/project/config'</example>
</method>

<method signature="dirname(path: string): string">
<description>Gets directory name from path</description>
<param name="path" type="string">Path to get directory from</param>
<returns>Directory portion of path</returns>
<example>fs.dirname('/home/user/file.txt') // '/home/user'</example>
</method>

<method signature="basename(path: string, ext?: string): string">
<description>Gets base name from path, optionally removing extension</description>
<param name="path" type="string">Path to get base name from</param>
<param name="ext" type="string" optional="true">Extension to remove</param>
<returns>Base name of path</returns>
<example>fs.basename('/home/user/file.txt', '.txt') // 'file'</example>
</method>

<method signature="relative(from: string, to: string): string">
<description>Gets relative path from one location to another</description>
<param name="from" type="string">Starting path</param>
<param name="to" type="string">Destination path</param>
<returns>Relative path string</returns>
<example>fs.relative('/data/src', '/data/dest') // '../dest'</example>
</method>

<method signature="normalize(path: string): string">
<description>Normalizes path by resolving '..' and '.' segments</description>
<param name="path" type="string">Path to normalize</param>
<returns>Normalized path string</returns>
<example>fs.normalize('/users/./john/../jane/') // '/users/jane'</example>
</method>
</method_group>
</interface>

<interface name="IFileStats">
<description>
File or directory statistics returned by getStats()
</description>
<properties>
<property name="size" type="number">Size in bytes</property>
<property name="isFile" type="boolean">True if entry is a file</property>
<property name="isDirectory" type="boolean">True if entry is a directory</property>
<property name="createdAt" type="Date">Creation timestamp</property>
<property name="modifiedAt" type="Date">Last modification timestamp</property>
<property name="accessedAt" type="Date">Last access timestamp</property>
</properties>
</interface>

## Classes

<class name="FileSystemError">
<description>
Custom error class providing additional context for file system operations
</description>
<extends>Error</extends>

<constructor signature="constructor(message: string, code: string, path?: string, originalError?: Error)">
<param name="message" type="string">Human-readable error message</param>
<param name="code" type="string">Error code (e.g., 'ENOENT', 'EACCES')</param>
<param name="path" type="string" optional="true">File path related to error</param>
<param name="originalError" type="Error" optional="true">Original error from fs module</param>
</constructor>

<properties>
<property name="code" type="string">Error code for programmatic handling</property>
<property name="path" type="string | undefined">Path where error occurred</property>
<property name="originalError" type="Error | undefined">Underlying system error</property>
</properties>

<usage_example>
try {
  await fs.readFile('/missing/file');
} catch (error) {
  if (error instanceof FileSystemError) {
    console.log(`Error ${error.code} at ${error.path}: ${error.message}`);
    // Output: Error ENOENT at /missing/file: File not found
  }
}
</usage_example>
</class>

<class name="NodeFileSystem">
<description>
Production implementation of IFileSystem using Node.js fs/promises module
</description>
<implements>IFileSystem</implements>
<decorator>@injectable()</decorator>

<notes>
- Singleton instance registered in DI container
- Automatically injected when IFileSystem is requested
- All methods implement error wrapping with FileSystemError
- Uses fs/promises for async operations
</notes>
</class>

## Type Definitions

<type name="BufferEncoding">
<description>
Node.js buffer encoding types for text operations
</description>
<values>
'utf8' | 'utf-8' | 'ascii' | 'base64' | 'hex' | 'latin1' | 'binary' | 'ucs2' | 'utf16le'
</values>
</type>

## Error Codes

<error_codes>
<code name="ENOENT">File or directory not found</code>
<code name="EEXIST">File or directory already exists</code>
<code name="EACCES">Permission denied</code>
<code name="ENOTDIR">Not a directory</code>
<code name="EISDIR">Is a directory (when file expected)</code>
<code name="ENOTEMPTY">Directory not empty</code>
<code name="EMFILE">Too many open files</code>
<code name="ENOSPC">No space left on device</code>
</error_codes>

## Usage Examples

<example name="Complete File Operations">
<code>
import type { IFileSystem } from 'file-system';

class ConfigManager {
  constructor(private fs: IFileSystem) {}

  async loadConfig(configPath: string): Promise<Config> {
    try {
      // Check if config exists
      if (!await this.fs.exists(configPath)) {
        // Create default config
        const defaultConfig = this.getDefaultConfig();
        await this.saveConfig(configPath, defaultConfig);
        return defaultConfig;
      }

      // Read existing config
      const content = await this.fs.readFile(configPath);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw new Error(`Failed to load config: ${error.message}`);
      }
      throw error;
    }
  }

  async saveConfig(configPath: string, config: Config): Promise<void> {
    const content = JSON.stringify(config, null, 2);
    // Parent directories created automatically
    await this.fs.writeFile(configPath, content);
  }
}
</code>
</example>

<example name="Directory Processing">
<code>
async function processTypeScriptFiles(fs: IFileSystem, srcDir: string): Promise<void> {
  const entries = await fs.listDirectory(srcDir);
  
  for (const entry of entries) {
    const fullPath = fs.join(srcDir, entry);
    const stats = await fs.getStats(fullPath);
    
    if (stats.isDirectory) {
      // Recursively process subdirectories
      await processTypeScriptFiles(fs, fullPath);
    } else if (stats.isFile && entry.endsWith('.ts')) {
      console.log(`Processing ${fullPath} (${stats.size} bytes)`);
      // Process TypeScript file
    }
  }
}
</code>
</example>