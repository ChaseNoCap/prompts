# Prompts Package

Central prompt repository for the H1B Visa Analysis monorepo. This package provides structured, XML-enhanced prompts that mirror the project architecture for efficient AI context loading.

## Quick Start

```bash
# Install dependencies
npm install

# Validate structure matches project
npm run validate

# Update package status
npm run update-status

# Build context for AI
npm run build-context
```

## Structure

```
prompts/
├── src/
│   ├── system/           # System-wide architecture and workflows
│   ├── packages/         # Mirrors actual package structure
│   ├── applications/     # Main application contexts
│   └── workflows/        # Cross-cutting workflow processes
├── scripts/              # Automation and validation tools
├── templates/            # Templates for new prompt files
└── dist/                 # Compiled TypeScript output
```

## Usage

### Basic API

```typescript
import { 
  getSystemPrompts, 
  getPackagePrompts, 
  getWorkflowPrompts,
  getPrompt 
} from 'prompts';

// Get system-wide context
const system = getSystemPrompts();
console.log(system.architecture); // System architecture prompt

// Get package-specific context  
const cache = getPackagePrompts('cache');
console.log(cache.overview); // Cache package overview

// Get workflow context
const workflows = getWorkflowPrompts();
console.log(workflows['report-generation']); // Report generation workflow

// Get specific prompt file
const prompt = getPrompt('packages/cache/overview.md');
```

### Context Loading Strategies

#### Progressive Loading
1. **Level 1**: System overview (`CLAUDE.md`)
2. **Level 2**: Package details (`package-catalog.md#package`)  
3. **Level 3**: Implementation specifics (`packages/package/src/`)

#### Task-Based Loading
- **Bug fixes**: Error logs + affected files + related tests
- **Features**: Package API + integration points
- **Packages**: Decomposition guide + templates

## Automation

### Structure Validation
```bash
npm run validate
```
Ensures every project package has corresponding prompts.

### Status Updates  
```bash
npm run update-status
```
Updates package status files with current version, coverage, and dependencies.

### Context Building
```bash
npm run build-context
```
Builds structured context objects for AI systems.

## Contributing

### Adding New Package Prompts

1. Create directory: `src/packages/new-package/`
2. Copy templates: `cp templates/package-*.md src/packages/new-package/`
3. Customize templates with package-specific content
4. Run validation: `npm run validate`

### Template Structure

Each package should have:
- `overview.md` - Purpose, features, status
- `api.md` - How to use the package
- `integration.md` - How it connects with others  
- `status.md` - Version, coverage, dependencies

## XML Structure

Prompts use XML for structured, parseable context:

```xml
<package name="cache">
  <metadata>
    <version>1.1.0</version>
    <coverage>94.79%</coverage>
    <status>stable</status>
  </metadata>
  
  <purpose>
    Provides caching functionality through decorators
  </purpose>
  
  <features>
    <feature>@Cacheable decorator</feature>
    <feature>TTL support</feature>
  </features>
</package>
```

## Benefits

- ✅ **Single Source of Truth**: All prompts centralized
- ✅ **Structure Awareness**: Mirrors project architecture  
- ✅ **Easy Navigation**: Intuitive organization
- ✅ **Version Controlled**: Track prompt evolution
- ✅ **AI-Friendly**: Structured for context loading
- ✅ **XML-Enhanced**: Parseable, semantic structure

## Integration

This package integrates with:
- Main H1B application for context loading
- Documentation system for cross-references
- CI/CD for automated status updates
- Development workflow for prompt maintenance

For detailed implementation guidance, see `/docs/prompt-migration-guide.md`.