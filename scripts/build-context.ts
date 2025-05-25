#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { 
  getSystemPrompts, 
  getPackagePrompts, 
  getApplicationPrompts,
  getWorkflowPrompts,
  listPackages,
  listApplications,
  listWorkflows,
  createContextBuilder
} from '../src/index.js';

interface ContextOptions {
  scope: 'system' | 'package' | 'application' | 'workflow' | 'full';
  target?: string;
  format: 'json' | 'markdown' | 'xml';
  output?: string;
  includeMetadata?: boolean;
  minify?: boolean;
}

interface ContextMetadata {
  generated: string;
  scope: string;
  target?: string;
  packages: string[];
  applications: string[];
  workflows: string[];
  totalPrompts: number;
}

/**
 * Builds context based on scope and options
 */
async function buildContext(options: ContextOptions): Promise<{ context: any; metadata: ContextMetadata }> {
  const metadata: ContextMetadata = {
    generated: new Date().toISOString(),
    scope: options.scope,
    target: options.target,
    packages: listPackages(),
    applications: listApplications(),
    workflows: listWorkflows(),
    totalPrompts: 0
  };
  
  let context: any = {};
  
  switch (options.scope) {
    case 'system':
      context = {
        system: getSystemPrompts()
      };
      metadata.totalPrompts = Object.keys(context.system).length;
      break;
      
    case 'package':
      if (!options.target) {
        throw new Error('Package name required for package scope');
      }
      context = {
        package: {
          [options.target]: getPackagePrompts(options.target)
        }
      };
      metadata.totalPrompts = Object.keys(context.package[options.target]).length;
      break;
      
    case 'application':
      if (!options.target) {
        throw new Error('Application name required for application scope');
      }
      context = {
        application: {
          [options.target]: getApplicationPrompts(options.target)
        }
      };
      metadata.totalPrompts = Object.keys(context.application[options.target]).length;
      break;
      
    case 'workflow':
      if (options.target) {
        context = {
          workflow: {
            [options.target]: getWorkflowPrompts()[options.target]
          }
        };
        metadata.totalPrompts = 1;
      } else {
        context = {
          workflows: getWorkflowPrompts()
        };
        metadata.totalPrompts = Object.keys(context.workflows).length;
      }
      break;
      
    case 'full':
      context = createContextBuilder()
        .loadSystem()
        .loadWorkflows()
        .build();
        
      // Add all packages
      for (const packageName of metadata.packages) {
        context = createContextBuilder()
          .loadPackage(packageName)
          .build();
      }
      
      // Add all applications
      for (const appName of metadata.applications) {
        if (!context.applications) context.applications = {};
        context.applications[appName] = getApplicationPrompts(appName);
      }
      
      metadata.totalPrompts = calculateTotalPrompts(context);
      break;
      
    default:
      throw new Error(`Unknown scope: ${options.scope}`);
  }
  
  return { context, metadata };
}

/**
 * Calculates total number of prompts in context
 */
function calculateTotalPrompts(context: any): number {
  let total = 0;
  
  function countPrompts(obj: any): number {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        count++;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += countPrompts(obj[key]);
      }
    }
    return count;
  }
  
  return countPrompts(context);
}

/**
 * Formats context output based on format option
 */
function formatOutput(context: any, metadata: ContextMetadata, options: ContextOptions): string {
  switch (options.format) {
    case 'json':
      const jsonOutput = options.includeMetadata 
        ? { metadata, context }
        : context;
      return options.minify 
        ? JSON.stringify(jsonOutput)
        : JSON.stringify(jsonOutput, null, 2);
        
    case 'xml':
      return formatAsXML(context, metadata, options);
      
    case 'markdown':
      return formatAsMarkdown(context, metadata, options);
      
    default:
      throw new Error(`Unknown format: ${options.format}`);
  }
}

/**
 * Formats context as XML
 */
function formatAsXML(context: any, metadata: ContextMetadata, options: ContextOptions): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  
  if (options.includeMetadata) {
    xml += `<context_export>\n`;
    xml += `  <metadata>\n`;
    xml += `    <generated>${metadata.generated}</generated>\n`;
    xml += `    <scope>${metadata.scope}</scope>\n`;
    if (metadata.target) {
      xml += `    <target>${metadata.target}</target>\n`;
    }
    xml += `    <total_prompts>${metadata.totalPrompts}</total_prompts>\n`;
    xml += `  </metadata>\n`;
    xml += `  <prompts>\n`;
  } else {
    xml += `<prompts>\n`;
  }
  
  function objectToXML(obj: any, indent: string = '    '): string {
    let result = '';
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Handle markdown content with CDATA
        result += `${indent}<${key}><![CDATA[\n${obj[key]}\n]]></${key}>\n`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result += `${indent}<${key}>\n`;
        result += objectToXML(obj[key], indent + '  ');
        result += `${indent}</${key}>\n`;
      }
    }
    return result;
  }
  
  xml += objectToXML(context);
  
  if (options.includeMetadata) {
    xml += `  </prompts>\n`;
    xml += `</context_export>`;
  } else {
    xml += `</prompts>`;
  }
  
  return xml;
}

/**
 * Formats context as Markdown
 */
function formatAsMarkdown(context: any, metadata: ContextMetadata, options: ContextOptions): string {
  let markdown = '';
  
  if (options.includeMetadata) {
    markdown += `# Context Export\n\n`;
    markdown += `**Generated**: ${metadata.generated}\n`;
    markdown += `**Scope**: ${metadata.scope}\n`;
    if (metadata.target) {
      markdown += `**Target**: ${metadata.target}\n`;
    }
    markdown += `**Total Prompts**: ${metadata.totalPrompts}\n\n`;
    markdown += `---\n\n`;
  }
  
  function objectToMarkdown(obj: any, level: number = 1): string {
    let result = '';
    for (const key in obj) {
      const heading = '#'.repeat(Math.min(level, 6));
      if (typeof obj[key] === 'string') {
        result += `${heading} ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n`;
        result += `${obj[key]}\n\n`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result += `${heading} ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n`;
        result += objectToMarkdown(obj[key], level + 1);
      }
    }
    return result;
  }
  
  markdown += objectToMarkdown(context);
  
  return markdown;
}

/**
 * Parses command line arguments
 */
function parseArguments(): ContextOptions {
  const args = process.argv.slice(2);
  const options: ContextOptions = {
    scope: 'system',
    format: 'json',
    includeMetadata: true,
    minify: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--scope':
      case '-s':
        options.scope = args[++i] as any;
        break;
        
      case '--target':
      case '-t':
        options.target = args[++i];
        break;
        
      case '--format':
      case '-f':
        options.format = args[++i] as any;
        break;
        
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
        
      case '--no-metadata':
        options.includeMetadata = false;
        break;
        
      case '--minify':
        options.minify = true;
        break;
        
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }
  
  return options;
}

/**
 * Shows help information
 */
function showHelp(): void {
  console.log(`
Usage: npm run build-context [options]

Options:
  -s, --scope <scope>     Context scope (system|package|application|workflow|full)
  -t, --target <name>     Target name (required for package/application/workflow)
  -f, --format <format>   Output format (json|xml|markdown) [default: json]
  -o, --output <file>     Output file path (stdout if not specified)
      --no-metadata       Exclude metadata from output
      --minify            Minify JSON output
  -h, --help              Show this help message

Examples:
  npm run build-context --scope system --format xml
  npm run build-context --scope package --target cache --format markdown
  npm run build-context --scope workflow --target report-generation
  npm run build-context --scope full --output context.json
  npm run build-context --scope application --target h1b-visa-analysis

Scopes:
  system       - System-wide prompts (architecture, workflows)
  package      - Specific package prompts (requires --target)
  application  - Specific application prompts (requires --target)
  workflow     - Workflow prompts (optional --target for specific workflow)
  full         - Complete context with all prompts

Formats:
  json         - JSON format with optional metadata
  xml          - XML format with CDATA sections for markdown
  markdown     - Formatted markdown document
  `);
}

/**
 * Lists available targets for context building
 */
function listTargets(): void {
  console.log('📦 Available packages:');
  listPackages().forEach(pkg => console.log(`   - ${pkg}`));
  
  console.log('\n🏢 Available applications:');
  listApplications().forEach(app => console.log(`   - ${app}`));
  
  console.log('\n⚡ Available workflows:');
  listWorkflows().forEach(workflow => console.log(`   - ${workflow}`));
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    if (process.argv.includes('--list')) {
      listTargets();
      return;
    }
    
    const options = parseArguments();
    
    // Validate scope and target combinations
    if (['package', 'application'].includes(options.scope) && !options.target) {
      console.error(`Error: --target is required for scope '${options.scope}'`);
      process.exit(1);
    }
    
    console.log(`🔨 Building context...`);
    console.log(`   Scope: ${options.scope}`);
    if (options.target) {
      console.log(`   Target: ${options.target}`);
    }
    console.log(`   Format: ${options.format}`);
    
    const { context, metadata } = await buildContext(options);
    const output = formatOutput(context, metadata, options);
    
    if (options.output) {
      await writeFile(options.output, output, 'utf-8');
      console.log(`✅ Context written to: ${options.output}`);
      console.log(`📊 Total prompts: ${metadata.totalPrompts}`);
    } else {
      console.log('\n' + '='.repeat(50));
      console.log(output);
    }
    
  } catch (error) {
    console.error('❌ Error building context:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}