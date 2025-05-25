import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROMPTS_DIR = join(__dirname);

/**
 * Interface for system-level prompts
 */
export interface SystemPrompts {
  architecture: string;
  dependencies: string;
  workflows: string;
  progress: string;
}

/**
 * Interface for package-level prompts
 */
export interface PackagePrompts {
  overview: string;
  api: string;
  integration: string;
  status: string;
}

/**
 * Interface for workflow prompts
 */
export interface WorkflowPrompts {
  [workflowName: string]: string;
}

/**
 * Loads all prompts from the system directory
 */
export function getSystemPrompts(): Partial<SystemPrompts> {
  return loadPromptDirectory('system') as Partial<SystemPrompts>;
}

/**
 * Loads all prompts for a specific package
 */
export function getPackagePrompts(packageName: string): Partial<PackagePrompts> {
  return loadPromptDirectory(`packages/${packageName}`) as Partial<PackagePrompts>;
}

/**
 * Loads all workflow prompts
 */
export function getWorkflowPrompts(): WorkflowPrompts {
  return loadPromptDirectory('workflows') as WorkflowPrompts;
}

/**
 * Loads all prompts for a specific application
 */
export function getApplicationPrompts(applicationName: string): Partial<PackagePrompts> {
  return loadPromptDirectory(`applications/${applicationName}`) as Partial<PackagePrompts>;
}

/**
 * Gets a specific prompt file by path
 */
export function getPrompt(path: string): string {
  try {
    const fullPath = join(PROMPTS_DIR, path);
    return readFileSync(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load prompt: ${path}. ${error}`);
  }
}

/**
 * Checks if a prompt file exists
 */
export function hasPrompt(path: string): boolean {
  try {
    const fullPath = join(PROMPTS_DIR, path);
    return statSync(fullPath).isFile();
  } catch {
    return false;
  }
}

/**
 * Lists all available packages with prompts
 */
export function listPackages(): string[] {
  try {
    const packagesDir = join(PROMPTS_DIR, 'packages');
    return readdirSync(packagesDir).filter(item => {
      const itemPath = join(packagesDir, item);
      return statSync(itemPath).isDirectory();
    });
  } catch {
    return [];
  }
}

/**
 * Lists all available applications with prompts
 */
export function listApplications(): string[] {
  try {
    const appsDir = join(PROMPTS_DIR, 'applications');
    return readdirSync(appsDir).filter(item => {
      const itemPath = join(appsDir, item);
      return statSync(itemPath).isDirectory();
    });
  } catch {
    return [];
  }
}

/**
 * Lists all available workflows
 */
export function listWorkflows(): string[] {
  try {
    const workflowsDir = join(PROMPTS_DIR, 'workflows');
    return readdirSync(workflowsDir)
      .filter(item => {
        const itemPath = join(workflowsDir, item);
        return statSync(itemPath).isFile() && extname(item) === '.md';
      })
      .map(item => item.replace('.md', ''));
  } catch {
    return [];
  }
}

/**
 * Gets all available prompt paths
 */
export function getAllPromptPaths(): string[] {
  const paths: string[] = [];
  
  // System prompts
  try {
    const systemDir = join(PROMPTS_DIR, 'system');
    readdirSync(systemDir).forEach(file => {
      if (extname(file) === '.md') {
        paths.push(`system/${file}`);
      }
    });
  } catch {
    // Directory doesn't exist
  }
  
  // Package prompts
  try {
    const packagesDir = join(PROMPTS_DIR, 'packages');
    readdirSync(packagesDir).forEach(packageName => {
      const packageDir = join(packagesDir, packageName);
      if (statSync(packageDir).isDirectory()) {
        readdirSync(packageDir).forEach(file => {
          if (extname(file) === '.md') {
            paths.push(`packages/${packageName}/${file}`);
          }
        });
      }
    });
  } catch {
    // Directory doesn't exist
  }
  
  // Application prompts
  try {
    const appsDir = join(PROMPTS_DIR, 'applications');
    readdirSync(appsDir).forEach(appName => {
      const appDir = join(appsDir, appName);
      if (statSync(appDir).isDirectory()) {
        readdirSync(appDir).forEach(file => {
          if (extname(file) === '.md') {
            paths.push(`applications/${appName}/${file}`);
          }
        });
      }
    });
  } catch {
    // Directory doesn't exist
  }
  
  // Workflow prompts
  try {
    const workflowsDir = join(PROMPTS_DIR, 'workflows');
    readdirSync(workflowsDir).forEach(file => {
      if (extname(file) === '.md') {
        paths.push(`workflows/${file}`);
      }
    });
  } catch {
    // Directory doesn't exist
  }
  
  return paths.sort();
}

/**
 * Helper function to load all prompts in a directory
 */
function loadPromptDirectory(dir: string): Record<string, string> {
  const prompts: Record<string, string> = {};
  
  try {
    const dirPath = join(PROMPTS_DIR, dir);
    const files = readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = join(dirPath, file);
      const stats = statSync(filePath);
      
      if (stats.isFile() && extname(file) === '.md') {
        const key = file.replace('.md', '');
        try {
          prompts[key] = readFileSync(filePath, 'utf-8');
        } catch (error) {
          console.warn(`Failed to load prompt file: ${filePath}`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to load prompt directory: ${dir}`, error);
  }
  
  return prompts;
}

/**
 * Context builder for progressive loading
 */
export class ContextBuilder {
  private context: Record<string, any> = {};
  
  /**
   * Load system-level context
   */
  loadSystem(): this {
    this.context.system = getSystemPrompts();
    return this;
  }
  
  /**
   * Load package-specific context
   */
  loadPackage(packageName: string): this {
    if (!this.context.packages) {
      this.context.packages = {};
    }
    this.context.packages[packageName] = getPackagePrompts(packageName);
    return this;
  }
  
  /**
   * Load application-specific context
   */
  loadApplication(applicationName: string): this {
    if (!this.context.applications) {
      this.context.applications = {};
    }
    this.context.applications[applicationName] = getApplicationPrompts(applicationName);
    return this;
  }
  
  /**
   * Load workflow context
   */
  loadWorkflows(): this {
    this.context.workflows = getWorkflowPrompts();
    return this;
  }
  
  /**
   * Load specific workflow
   */
  loadWorkflow(workflowName: string): this {
    if (!this.context.workflows) {
      this.context.workflows = {};
    }
    
    try {
      this.context.workflows[workflowName] = getPrompt(`workflows/${workflowName}.md`);
    } catch (error) {
      console.warn(`Failed to load workflow: ${workflowName}`, error);
    }
    
    return this;
  }
  
  /**
   * Build and return the complete context
   */
  build(): Record<string, any> {
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
export const buildSystemContext = () => createContextBuilder().loadSystem().build();
export const buildPackageContext = (packageName: string) => 
  createContextBuilder().loadPackage(packageName).build();
export const buildWorkflowContext = () => createContextBuilder().loadWorkflows().build();
export const buildFullContext = () => 
  createContextBuilder()
    .loadSystem()
    .loadWorkflows()
    .build();

// Types are already exported above - no need to re-export