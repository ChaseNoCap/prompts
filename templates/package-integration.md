# {{PACKAGE_NAME}} Integration Guide

```xml
<integration_context package="{{PACKAGE_NAME}}">
  <integrates_with>
    {{#INTEGRATIONS}}
    <package name="{{NAME}}">
      <interaction>{{INTERACTION}}</interaction>
      <dependency_type>{{TYPE}}</dependency_type>
    </package>
    {{/INTEGRATIONS}}
  </integrates_with>
  
  <used_by>
    {{#CONSUMERS}}
    <{{TYPE}}>{{NAME}}</{{TYPE}}>
    {{/CONSUMERS}}
  </used_by>
  
  <patterns>
    {{#PATTERNS}}
    <pattern>{{PATTERN}}</pattern>
    {{/PATTERNS}}
  </patterns>
  
  <injection_points>
    {{#INJECTION_POINTS}}
    <injection token="{{TOKEN}}" interface="{{INTERFACE}}">
      <purpose>{{PURPOSE}}</purpose>
    </injection>
    {{/INJECTION_POINTS}}
  </injection_points>
</integration_context>
```

## Integration Overview

<!-- High-level description of how this package integrates -->

## Dependencies

### Direct Dependencies

<!-- List and describe direct dependencies -->

### Peer Dependencies

<!-- List and describe peer dependencies -->

### Optional Dependencies

<!-- List and describe optional dependencies -->

## Consumers

### Applications

<!-- List applications that use this package -->

### Packages

<!-- List other packages that depend on this -->

## Integration Patterns

### Dependency Injection

<!-- Describe DI patterns if applicable -->

### Event Integration

<!-- Describe event system integration if applicable -->

### Service Integration

<!-- Describe service-level integration patterns -->

## Setup and Configuration

### Installation

```bash
# Installation commands
```

### Configuration

```typescript
// Configuration examples
```

### Initialization

```typescript
// Initialization patterns
```

## Common Integration Scenarios

<!-- Document common ways this package is integrated -->

## Troubleshooting

<!-- Common integration issues and solutions -->