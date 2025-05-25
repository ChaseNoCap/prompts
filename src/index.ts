import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROMPTS_DIR = join(__dirname);

/**
 * Interface for package-level prompts
 */
export interface PackagePrompts {
  overview?: string;
  api?: string;
  integration?: string;
  status?: string;
}

/**
 * Gets all prompts for a specific package or application
 * @param name The package or application name
 * @returns Object containing all prompt files for that package
 */
export function getPrompts(name: string): PackagePrompts {
  const prompts: PackagePrompts = {};
  
  try {
    const dirPath = join(PROMPTS_DIR, name);
    const files = readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = join(dirPath, file);
      const stats = statSync(filePath);
      
      if (stats.isFile() && extname(file) === '.md') {
        const key = file.replace('.md', '') as keyof PackagePrompts;
        try {
          prompts[key] = readFileSync(filePath, 'utf-8');
        } catch (error) {
          console.warn(`Failed to load prompt file: ${filePath}`, error);
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to load prompts for: ${name}. ${error}`);
  }
  
  return prompts;
}

/**
 * Gets a specific prompt file
 * @param name The package or application name
 * @param file The prompt file name (without .md extension)
 * @returns The prompt content
 */
export function getPrompt(name: string, file: string): string {
  try {
    const fullPath = join(PROMPTS_DIR, name, `${file}.md`);
    return readFileSync(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load prompt: ${name}/${file}. ${error}`);
  }
}

/**
 * Checks if a prompt exists
 * @param name The package or application name
 * @param file Optional specific file to check
 */
export function hasPrompt(name: string, file?: string): boolean {
  try {
    const path = file 
      ? join(PROMPTS_DIR, name, `${file}.md`)
      : join(PROMPTS_DIR, name);
    return statSync(path).isFile() || (!file && statSync(path).isDirectory());
  } catch {
    return false;
  }
}

/**
 * Lists all available packages and applications with prompts
 */
export function listAll(): string[] {
  try {
    return readdirSync(PROMPTS_DIR).filter(item => {
      const itemPath = join(PROMPTS_DIR, item);
      return statSync(itemPath).isDirectory() && !item.startsWith('.');
    }).sort();
  } catch {
    return [];
  }
}

/**
 * Gets all prompt files for a given package/app
 * @param name The package or application name
 * @returns Array of file names (without .md extension)
 */
export function listPromptFiles(name: string): string[] {
  try {
    const dirPath = join(PROMPTS_DIR, name);
    return readdirSync(dirPath)
      .filter(file => {
        const filePath = join(dirPath, file);
        return statSync(filePath).isFile() && extname(file) === '.md';
      })
      .map(file => file.replace('.md', ''));
  } catch {
    return [];
  }
}

/**
 * Context builder for progressive loading
 */
export class ContextBuilder {
  private context: Record<string, PackagePrompts> = {};
  
  /**
   * Load prompts for a specific package or application
   */
  load(name: string): this {
    this.context[name] = getPrompts(name);
    return this;
  }
  
  /**
   * Load prompts for multiple packages/applications
   */
  loadMany(...names: string[]): this {
    for (const name of names) {
      this.load(name);
    }
    return this;
  }
  
  /**
   * Load all available prompts
   */
  loadAll(): this {
    const all = listAll();
    for (const name of all) {
      this.load(name);
    }
    return this;
  }
  
  /**
   * Build and return the complete context
   */
  build(): Record<string, PackagePrompts> {
    return { ...this.context };
  }
  
  /**
   * Clear the context
   */
  clear(): this {
    this.context = {};
    return this;
  }
}

/**
 * Create a new context builder instance
 */
export function createContextBuilder(): ContextBuilder {
  return new ContextBuilder();
}

// Export convenience functions for common patterns
export const getApplicationPrompts = () => getPrompts('h1b-visa-analysis');
export const getSystemPrompts = () => getPrompts('system');
export const getWorkflowPrompts = () => getPrompts('workflows');

// For backward compatibility (will be removed in future)
export const getPackagePrompts = (packageName: string) => getPrompts(packageName);