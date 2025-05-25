# CLAUDE.md - Central Prompt Repository

## Package Identity

**I am the central prompt repository for the H1B Visa Analysis monorepo.**

This package contains structured prompts that mirror the project architecture, providing AI systems with contextual understanding of:
- System architecture and relationships
- Package purposes and integrations  
- Workflow processes and patterns
- Development guidelines and status

## Core Concept

<concept>
  <principle>Central prompts repo → Mirrors project structure → Each folder maps to a package/component → Built-in system awareness</principle>
  <benefits>
    <benefit>Single source of truth for all prompts</benefit>
    <benefit>Structure conveys relationships</benefit>
    <benefit>Easy navigation and discovery</benefit>
    <benefit>Version controlled prompt evolution</benefit>
  </benefits>
</concept>

## Package Structure

```
prompts/
├── src/
│   ├── system/           # System-wide prompts
│   ├── packages/         # Mirrors actual package structure
│   ├── applications/     # Main application contexts
│   └── workflows/        # Cross-cutting workflows
├── scripts/              # Automation tools
├── templates/            # Templates for new prompts
└── README.md            # Usage documentation
```

## Package Mapping

### Core Infrastructure Packages
- **logger** → `src/packages/logger/` - Structured logging prompts
- **di-framework** → `src/packages/di-framework/` - Dependency injection patterns  
- **cache** → `src/packages/cache/` - Caching strategy prompts
- **file-system** → `src/packages/file-system/` - File operations prompts
- **event-system** → `src/packages/event-system/` - Event-driven patterns

### Testing Packages
- **test-helpers** → `src/packages/test-helpers/` - Test utility prompts
- **test-mocks** → `src/packages/test-mocks/` - Mock implementation prompts

### Application/Template Packages  
- **report-templates** → `src/packages/report-templates/` - Template engine prompts
- **h1b-visa-analysis** → `src/applications/h1b-visa-analysis/` - Main app prompts
- **markdown-compiler** → `src/applications/markdown-compiler/` - Compiler prompts
- **report-components** → `src/applications/report-components/` - Content prompts

## Usage Patterns

### Context Loading
```typescript
import { getSystemPrompts, getPackagePrompts, getWorkflowPrompts } from 'prompts';

// Load system understanding
const systemContext = getSystemPrompts();

// Load specific package context
const cacheContext = getPackagePrompts('cache');

// Load workflow understanding  
const reportWorkflow = getWorkflowPrompts()['report-generation'];
```

### Progressive Loading Strategy
1. **System Level** → Overall architecture and principles
2. **Package Level** → Specific package details and APIs
3. **Feature Level** → Implementation specifics and patterns

## Automation

- **validate-structure.ts** - Ensures prompts match project packages
- **update-status.ts** - Keeps package status current
- **build-context.ts** - Builds context for AI loading

## Key Principles

1. **Mirror Reality** - Prompt structure matches project structure
2. **Progressive Detail** - System → Package → Specific features  
3. **Living Documentation** - Scripts keep status current
4. **Simple Access** - Just markdown files with simple API
5. **Built-in Awareness** - Structure itself conveys relationships
6. **XML Structure** - Use XML for clear, parseable context

## Current Status

- **Version**: 1.0.0
- **Structure**: Mirrors 8 packages + 3 applications
- **Automation**: Structure validation and status updates
- **Integration**: Central prompt loading for AI systems

This package serves as the definitive source for AI context about the H1B monorepo structure and relationships.