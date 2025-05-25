#!/usr/bin/env tsx

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

interface PackageInfo {
  name: string;
  path: string;
  type: 'package' | 'application';
}

/**
 * Scans the packages directory to find all packages
 */
async function scanProjectPackages(): Promise<PackageInfo[]> {
  const packagesDir = join(process.cwd(), '../');
  const packages: PackageInfo[] = [];
  
  try {
    const entries = await readdir(packagesDir);
    
    for (const entry of entries) {
      const entryPath = join(packagesDir, entry);
      const entryStats = await stat(entryPath);
      
      if (entryStats.isDirectory() && entry !== 'prompts') {
        // Check if it has package.json OR if it's a workspace package (has src/ directory)
        try {
          // Try package.json first
          await stat(join(entryPath, 'package.json'));
        } catch {
          // No package.json, check if it's a workspace package (has src/)
          try {
            await stat(join(entryPath, 'src'));
          } catch {
            // Neither package.json nor src/, not a package
            continue;
          }
        }
        
        // Determine type based on directory structure and content
        const type = await determinePackageType(entryPath, entry);
        
        packages.push({
          name: entry,
          path: entryPath,
          type
        });
      }
    }
  } catch (error) {
    console.error('Error scanning packages directory:', error);
  }
  
  // Also check for the main application (h1b-visa-analysis root)
  try {
    const rootDir = join(process.cwd(), '../../');
    const rootPackageJson = join(rootDir, 'package.json');
    await stat(rootPackageJson);
    
    // Check if it has src/ directory to confirm it's the main app
    try {
      await stat(join(rootDir, 'src'));
      packages.push({
        name: 'h1b-visa-analysis',
        path: rootDir,
        type: 'application'
      });
    } catch {
      // No src/, not the main app
    }
  } catch {
    // No package.json in root
  }
  
  return packages;
}

/**
 * Determines if a package is a core package or application
 */
async function determinePackageType(packagePath: string, packageName: string): Promise<'package' | 'application'> {
  // Known applications
  const applications = ['h1b-visa-analysis', 'markdown-compiler', 'report-components', 'prompts-shared'];
  
  if (applications.includes(packageName)) {
    return 'application';
  }
  
  // Check if it's in the main src directory (would indicate it's the main app)
  if (packagePath.includes('h1b-visa-analysis/src')) {
    return 'application';
  }
  
  return 'package';
}

/**
 * Scans the prompts directory to find existing prompt packages
 */
async function scanPromptPackages(): Promise<Set<string>> {
  const promptPackages = new Set<string>();
  
  // Scan packages directory
  const packagesDir = join(process.cwd(), 'src/packages');
  try {
    const entries = await readdir(packagesDir);
    entries.forEach(entry => {
      promptPackages.add(`src/packages/${entry}`);
    });
  } catch (error) {
    console.log('Packages directory not found or empty');
  }
  
  // Scan applications directory  
  const applicationsDir = join(process.cwd(), 'src/applications');
  try {
    const entries = await readdir(applicationsDir);
    entries.forEach(entry => {
      promptPackages.add(`src/applications/${entry}`);
    });
  } catch (error) {
    console.log('Applications directory not found or empty');
  }
  
  return promptPackages;
}

/**
 * Validates that prompt structure matches project structure
 */
async function validatePromptStructure(): Promise<void> {
  console.log('🔍 Validating prompt structure...\n');
  
  const projectPackages = await scanProjectPackages();
  const promptPackages = await scanPromptPackages();
  
  let missingCount = 0;
  let foundCount = 0;
  
  console.log('📦 Project packages found:');
  for (const pkg of projectPackages) {
    const expectedPath = pkg.type === 'package' 
      ? `src/packages/${pkg.name}`
      : `src/applications/${pkg.name}`;
      
    const hasPrompts = promptPackages.has(expectedPath);
    
    if (hasPrompts) {
      console.log(`✅ ${pkg.name} (${pkg.type}) → ${expectedPath}`);
      foundCount++;
    } else {
      console.log(`❌ ${pkg.name} (${pkg.type}) → Missing: ${expectedPath}`);
      missingCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${foundCount} packages with prompts`);
  console.log(`   Missing: ${missingCount} packages without prompts`);
  console.log(`   Total: ${projectPackages.length} packages`);
  
  // Check for orphaned prompt directories
  console.log(`\n🔍 Checking for orphaned prompt directories...`);
  const projectNames = new Set(projectPackages.map(p => p.name));
  let orphanedCount = 0;
  
  for (const promptPath of promptPackages) {
    const pathParts = promptPath.split('/');
    const packageName = pathParts[pathParts.length - 1];
    
    if (!projectNames.has(packageName)) {
      console.log(`⚠️  Orphaned prompt directory: ${promptPath}`);
      orphanedCount++;
    }
  }
  
  if (orphanedCount === 0) {
    console.log(`✅ No orphaned prompt directories found`);
  } else {
    console.log(`❌ Found ${orphanedCount} orphaned prompt directories`);
  }
  
  // Validation result
  console.log(`\n🎯 Validation Result:`);
  if (missingCount === 0 && orphanedCount === 0) {
    console.log(`✅ All packages have corresponding prompts and no orphaned directories`);
    process.exit(0);
  } else {
    console.log(`❌ Validation failed:`);
    if (missingCount > 0) {
      console.log(`   - ${missingCount} packages missing prompts`);
    }
    if (orphanedCount > 0) {
      console.log(`   - ${orphanedCount} orphaned prompt directories`);
    }
    process.exit(1);
  }
}

/**
 * Creates missing prompt directories with basic structure
 */
async function createMissingPrompts(): Promise<void> {
  console.log('🏗️  Creating missing prompt directories...\n');
  
  const projectPackages = await scanProjectPackages();
  const promptPackages = await scanPromptPackages();
  
  for (const pkg of projectPackages) {
    const expectedPath = pkg.type === 'package' 
      ? `src/packages/${pkg.name}`
      : `src/applications/${pkg.name}`;
      
    if (!promptPackages.has(expectedPath)) {
      const fullPath = join(process.cwd(), expectedPath);
      
      try {
        // Create directory
        await import('fs/promises').then(fs => fs.mkdir(fullPath, { recursive: true }));
        
        // Copy templates (if they exist)
        console.log(`✅ Created: ${expectedPath}`);
      } catch (error) {
        console.error(`❌ Failed to create ${expectedPath}:`, error);
      }
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--create') || args.includes('-c')) {
    await createMissingPrompts();
  }
  
  await validatePromptStructure();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}