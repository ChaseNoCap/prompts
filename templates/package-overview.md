# {{PACKAGE_NAME}} Package Overview

```xml
<package_overview name="{{PACKAGE_NAME}}">
  <metadata>
    <version>{{VERSION}}</version>
    <coverage>{{COVERAGE}}%</coverage>
    <size>{{SIZE}} lines</size>
    <status>{{STATUS}}</status>
  </metadata>
  
  <purpose>
    {{PURPOSE_DESCRIPTION}}
  </purpose>
  
  <features>
    {{#FEATURES}}
    <feature>{{FEATURE}}</feature>
    {{/FEATURES}}
  </features>
  
  <usage_example>
    <![CDATA[
    {{USAGE_EXAMPLE}}
    ]]>
  </usage_example>
  
  <dependencies>
    {{#DEPENDENCIES}}
    <dependency{{#OPTIONAL}} optional="true"{{/OPTIONAL}}>{{DEPENDENCY}}</dependency>
    {{/DEPENDENCIES}}
  </dependencies>
  
  <exports>
    {{#EXPORTS}}
    <export type="{{TYPE}}">{{NAME}}</export>
    {{/EXPORTS}}
  </exports>
  
  <consumers>
    {{#CONSUMERS}}
    <consumer>{{CONSUMER}}</consumer>
    {{/CONSUMERS}}
  </consumers>
</package_overview>
```

## Key Features

<!-- List the main features and capabilities -->

## Architecture

<!-- Describe the package architecture and patterns -->

## Integration Points

<!-- Describe how this package integrates with others -->

## Current Status

- **Version**: {{VERSION}}
- **Coverage**: {{COVERAGE}}%
- **Size**: {{SIZE}} lines
- **State**: {{STATUS}}
- **Last Updated**: {{LAST_UPDATED}}

## Usage Patterns

<!-- Common usage patterns and examples -->

## Development Notes

<!-- Important notes for developers working on this package -->