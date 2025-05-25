#!/usr/bin/env tsx

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

interface PackageMetadata {
  name: string;
  version: string;
  path: string;
  type: 'package' | 'application';
  dependencies: string[];
  devDependencies: string[];
  coverage?: CoverageData;
  size?: SizeData;
  lastUpdate: string;
  state: 'stable' | 'development' | 'experimental' | 'deprecated';
}

interface CoverageData {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface SizeData {
  totalLines: number;
  sourceLines: number;
  testLines: number;
}

/**
 * Scans for all packages in the project
 */
async function scanAllPackages(): Promise<PackageMetadata[]> {
  const packages: PackageMetadata[] = [];
  
  // Scan packages directory
  const packagesDir = join(process.cwd(), '../');
  try {
    const entries = await readdir(packagesDir);
    
    for (const entry of entries) {
      if (entry === 'prompts') continue;
      
      const entryPath = join(packagesDir, entry);
      const entryStats = await stat(entryPath);
      
      if (entryStats.isDirectory()) {
        const metadata = await getPackageMetadata(entryPath, entry, 'package');
        if (metadata) {
          packages.push(metadata);
        }
      }
    }
  } catch (error) {
    console.error('Error scanning packages directory:', error);
  }
  
  // Scan for main application
  try {
    const rootDir = join(process.cwd(), '../../');
    const rootMetadata = await getPackageMetadata(rootDir, 'h1b-visa-analysis', 'application');
    if (rootMetadata) {
      packages.push(rootMetadata);
    }
  } catch (error) {
    console.warn('Could not scan root application:', error);
  }
  
  return packages;
}

/**
 * Gets metadata for a specific package
 */
async function getPackageMetadata(packagePath: string, packageName: string, type: 'package' | 'application'): Promise<PackageMetadata | null> {
  try {
    // Check if it's a valid package (has package.json or src/)
    let hasPackageJson = false;
    let hasSrc = false;
    
    try {
      await stat(join(packagePath, 'package.json'));
      hasPackageJson = true;
    } catch {}
    
    try {
      await stat(join(packagePath, 'src'));
      hasSrc = true;
    } catch {}
    
    if (!hasPackageJson && !hasSrc) {
      return null;
    }
    
    // Read package.json if it exists
    let packageData: any = {};
    if (hasPackageJson) {
      try {
        const packageJsonContent = await readFile(join(packagePath, 'package.json'), 'utf-8');
        packageData = JSON.parse(packageJsonContent);
      } catch (error) {
        console.warn(`Failed to read package.json for ${packageName}:`, error);
      }
    }
    
    // Get version (default to 1.0.0 if not in package.json)
    const version = packageData.version || '1.0.0';
    
    // Get dependencies
    const dependencies = Object.keys(packageData.dependencies || {});
    const devDependencies = Object.keys(packageData.devDependencies || {});
    
    // Get last update (last commit date)
    const lastUpdate = await getLastCommitDate(packagePath);
    
    // Get coverage data
    const coverage = await getCoverageData(packagePath);
    
    // Get size data
    const size = await getSizeData(packagePath);
    
    // Determine state
    const state = determinePackageState(packageData, coverage, lastUpdate);
    
    return {
      name: packageName,
      version,
      path: packagePath,
      type,
      dependencies,
      devDependencies,
      coverage,
      size,
      lastUpdate,
      state
    };
  } catch (error) {
    console.error(`Error getting metadata for ${packageName}:`, error);
    return null;
  }
}

/**
 * Gets the last commit date for a package
 */
async function getLastCommitDate(packagePath: string): Promise<string> {
  try {
    const result = execSync(
      `git log -1 --format=%ci -- .`,
      { cwd: packagePath, encoding: 'utf-8' }
    );
    return new Date(result.trim()).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Gets coverage data for a package
 */
async function getCoverageData(packagePath: string): Promise<CoverageData | undefined> {
  try {
    // Look for coverage-final.json
    const coveragePath = join(packagePath, 'coverage', 'coverage-final.json');
    const coverageContent = await readFile(coveragePath, 'utf-8');
    const coverageData = JSON.parse(coverageContent);
    
    // Calculate totals across all files
    let statements = 0, branches = 0, functions = 0, lines = 0;
    let statementsCovered = 0, branchesCovered = 0, functionsCovered = 0, linesCovered = 0;
    
    for (const filePath in coverageData) {
      const fileData = coverageData[filePath];
      statements += fileData.s ? Object.keys(fileData.s).length : 0;
      branches += fileData.b ? Object.keys(fileData.b).length : 0;
      functions += fileData.f ? Object.keys(fileData.f).length : 0;
      lines += fileData.l ? Object.keys(fileData.l).length : 0;
      
      if (fileData.s) {
        statementsCovered += Object.values(fileData.s).filter((v: any) => v > 0).length;
      }
      if (fileData.b) {
        branchesCovered += Object.values(fileData.b).flat().filter((v: any) => v > 0).length;
      }
      if (fileData.f) {
        functionsCovered += Object.values(fileData.f).filter((v: any) => v > 0).length;
      }
      if (fileData.l) {
        linesCovered += Object.values(fileData.l).filter((v: any) => v > 0).length;
      }
    }
    
    return {
      statements: statements > 0 ? Math.round((statementsCovered / statements) * 100) : 0,
      branches: branches > 0 ? Math.round((branchesCovered / branches) * 100) : 0,
      functions: functions > 0 ? Math.round((functionsCovered / functions) * 100) : 0,
      lines: lines > 0 ? Math.round((linesCovered / lines) * 100) : 0
    };
  } catch {
    // No coverage data available
    return undefined;
  }
}

/**
 * Gets size data for a package
 */
async function getSizeData(packagePath: string): Promise<SizeData | undefined> {
  try {
    const srcPath = join(packagePath, 'src');
    const testsPath = join(packagePath, 'tests');
    
    const sourceLines = await countLinesInDirectory(srcPath);
    const testLines = await countLinesInDirectory(testsPath);
    
    return {
      totalLines: sourceLines + testLines,
      sourceLines,
      testLines
    };
  } catch {
    return undefined;
  }
}

/**
 * Counts lines of code in a directory
 */
async function countLinesInDirectory(dirPath: string): Promise<number> {
  try {
    const result = execSync(
      `find "${dirPath}" -name "*.ts" -o -name "*.js" | xargs wc -l | tail -1`,
      { encoding: 'utf-8' }
    );
    const lines = parseInt(result.trim().split(/\s+/)[0]) || 0;
    return lines;
  } catch {
    return 0;
  }
}

/**
 * Determines the state of a package based on various factors
 */
function determinePackageState(packageData: any, coverage?: CoverageData, lastUpdate?: string): 'stable' | 'development' | 'experimental' | 'deprecated' {
  // Check version for experimental (0.x.x)
  if (packageData.version?.startsWith('0.')) {
    return 'experimental';
  }
  
  // Check for deprecated keyword
  if (packageData.deprecated) {
    return 'deprecated';
  }
  
  // Check coverage and recent activity for stability
  const hasCoverage = coverage && coverage.statements > 80;
  const isRecent = lastUpdate && (Date.now() - new Date(lastUpdate).getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
  
  if (hasCoverage && packageData.version && !packageData.version.includes('dev')) {
    return 'stable';
  }
  
  return 'development';
}

/**
 * Finds dependents of a package
 */
async function findDependents(packageName: string, allPackages: PackageMetadata[]): Promise<string[]> {
  const dependents: string[] = [];
  
  for (const pkg of allPackages) {
    if (pkg.dependencies.includes(packageName) || 
        pkg.devDependencies.includes(packageName) ||
        pkg.dependencies.includes(`@chasenogap/${packageName}`)) {
      dependents.push(pkg.name);
    }
  }
  
  return dependents;
}

/**
 * Updates the status file for a package
 */
async function updatePackageStatus(packageMetadata: PackageMetadata, allPackages: PackageMetadata[]): Promise<void> {
  const { name, version, coverage, size, lastUpdate, state, dependencies, devDependencies } = packageMetadata;
  
  // Find dependents
  const dependents = await findDependents(name, allPackages);
  
  // Determine prompt directory
  const promptDir = packageMetadata.type === 'package' ? 'packages' : 'applications';
  const statusPath = join(process.cwd(), 'src', promptDir, name, 'status.md');
  
  // Generate status content using XML structure
  const statusContent = `# ${name} Status

\`\`\`xml
<package_status name="${name}">
  <metadata>
    <version>${version}</version>
    <last_update>${lastUpdate}</last_update>
    <state>${state}</state>
    <maturity>${state === 'stable' ? 'production' : state}</maturity>
  </metadata>
  
  <metrics>
    <coverage>
      <statements>${coverage?.statements || 0}%</statements>
      <branches>${coverage?.branches || 0}%</branches>
      <functions>${coverage?.functions || 0}%</functions>
      <lines>${coverage?.lines || 0}%</lines>
    </coverage>
    
    <size>
      <total_lines>${size?.totalLines || 0}</total_lines>
      <source_lines>${size?.sourceLines || 0}</source_lines>
      <test_lines>${size?.testLines || 0}</test_lines>
    </size>
  </metrics>
  
  <dependencies>
    <production>
${dependencies.map(dep => `      <dependency>${dep}</dependency>`).join('\n')}
    </production>
    
    <development>
${devDependencies.map(dep => `      <dependency>${dep}</dependency>`).join('\n')}
    </development>
  </dependencies>
  
  <dependents>
${dependents.map(dep => `    <dependent type="${packageMetadata.type}">${dep}</dependent>`).join('\n')}
  </dependents>
</package_status>
\`\`\`

## Current Status

- **Version**: ${version}
- **State**: ${state}
- **Last Updated**: ${lastUpdate}
- **Maturity**: ${state === 'stable' ? 'Production' : state.charAt(0).toUpperCase() + state.slice(1)}

## Metrics

### Test Coverage
${coverage ? `- **Statements**: ${coverage.statements}%
- **Branches**: ${coverage.branches}%  
- **Functions**: ${coverage.functions}%
- **Lines**: ${coverage.lines}%` : '- **Coverage**: Not available'}

### Package Size
${size ? `- **Total Lines**: ${size.totalLines}
- **Source Lines**: ${size.sourceLines}
- **Test Lines**: ${size.testLines}` : '- **Size**: Not calculated'}

## Dependencies

### Production Dependencies
${dependencies.length > 0 ? dependencies.map(dep => `- ${dep}`).join('\n') : '- None'}

### Development Dependencies  
${devDependencies.length > 0 ? devDependencies.map(dep => `- ${dep}`).join('\n') : '- None'}

## Dependents

${dependents.length > 0 ? dependents.map(dep => `- **${dep}** (${packageMetadata.type})`).join('\n') : '- No dependents found'}

## Performance Notes

${size && size.sourceLines < 1000 ? '✅ Package size is within target (<1000 lines)' : size && size.sourceLines >= 1000 ? '⚠️ Package size exceeds 1000 lines target' : '- Size analysis not available'}
${coverage && coverage.statements >= 90 ? '✅ Excellent test coverage (≥90%)' : coverage && coverage.statements >= 80 ? '✅ Good test coverage (≥80%)' : coverage ? '⚠️ Test coverage below 80%' : '- Coverage data not available'}

*Status updated: ${new Date().toISOString().split('T')[0]}*`;

  try {
    await writeFile(statusPath, statusContent, 'utf-8');
    console.log(`✅ Updated status for ${name}`);
  } catch (error) {
    console.error(`❌ Failed to update status for ${name}:`, error);
  }
}

/**
 * Main function to update all package statuses
 */
async function updateAllStatuses(): Promise<void> {
  console.log('🔄 Updating package statuses...\n');
  
  const packages = await scanAllPackages();
  
  if (packages.length === 0) {
    console.log('❌ No packages found to update');
    return;
  }
  
  console.log(`📦 Found ${packages.length} packages to update:`);
  packages.forEach(pkg => {
    console.log(`   - ${pkg.name} (${pkg.type})`);
  });
  console.log('');
  
  // Update status for each package
  for (const pkg of packages) {
    await updatePackageStatus(pkg, packages);
  }
  
  console.log(`\n✅ Updated status files for ${packages.length} packages`);
  
  // Generate summary
  const summary = {
    total: packages.length,
    stable: packages.filter(p => p.state === 'stable').length,
    development: packages.filter(p => p.state === 'development').length,
    experimental: packages.filter(p => p.state === 'experimental').length,
    withCoverage: packages.filter(p => p.coverage).length,
    highCoverage: packages.filter(p => p.coverage && p.coverage.statements >= 90).length
  };
  
  console.log('\n📊 Summary:');
  console.log(`   Total packages: ${summary.total}`);
  console.log(`   Stable: ${summary.stable}`);
  console.log(`   Development: ${summary.development}`);
  console.log(`   Experimental: ${summary.experimental}`);
  console.log(`   With coverage data: ${summary.withCoverage}`);
  console.log(`   High coverage (≥90%): ${summary.highCoverage}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run update-status [options]

Options:
  --help, -h    Show this help message
  
Description:
  Updates status.md files for all packages with current metrics including:
  - Version and last update date
  - Test coverage percentages
  - Package size metrics
  - Dependencies and dependents
  - Package state (stable/development/experimental)
    `);
    return;
  }
  
  await updateAllStatuses();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}