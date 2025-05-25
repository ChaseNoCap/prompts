# {{PACKAGE_NAME}} Status

```xml
<package_status name="{{PACKAGE_NAME}}">
  <metadata>
    <version>{{VERSION}}</version>
    <last_update>{{LAST_UPDATE}}</last_update>
    <state>{{STATE}}</state>
    <maturity>{{MATURITY}}</maturity>
  </metadata>
  
  <metrics>
    <coverage>
      <statements>{{COVERAGE_STATEMENTS}}%</statements>
      <branches>{{COVERAGE_BRANCHES}}%</branches>
      <functions>{{COVERAGE_FUNCTIONS}}%</functions>
      <lines>{{COVERAGE_LINES}}%</lines>
    </coverage>
    
    <size>
      <total_lines>{{TOTAL_LINES}}</total_lines>
      <source_lines>{{SOURCE_LINES}}</source_lines>
      <test_lines>{{TEST_LINES}}</test_lines>
    </size>
    
    <complexity>
      <cyclomatic>{{CYCLOMATIC_COMPLEXITY}}</cyclomatic>
      <maintainability>{{MAINTAINABILITY_INDEX}}</maintainability>
    </complexity>
  </metrics>
  
  <dependencies>
    <production>
      {{#PROD_DEPENDENCIES}}
      <dependency>{{NAME}}@{{VERSION}}</dependency>
      {{/PROD_DEPENDENCIES}}
    </production>
    
    <development>
      {{#DEV_DEPENDENCIES}}
      <dependency>{{NAME}}@{{VERSION}}</dependency>
      {{/DEV_DEPENDENCIES}}
    </development>
  </dependencies>
  
  <dependents>
    {{#DEPENDENTS}}
    <dependent type="{{TYPE}}">{{NAME}}</dependent>
    {{/DEPENDENTS}}
  </dependents>
  
  <issues>
    {{#KNOWN_ISSUES}}
    <issue severity="{{SEVERITY}}">{{DESCRIPTION}}</issue>
    {{/KNOWN_ISSUES}}
  </issues>
</package_status>
```

## Current Status

- **Version**: {{VERSION}}
- **State**: {{STATE}}
- **Last Updated**: {{LAST_UPDATE}}
- **Maturity**: {{MATURITY}}

## Metrics

### Test Coverage
- **Statements**: {{COVERAGE_STATEMENTS}}%
- **Branches**: {{COVERAGE_BRANCHES}}%  
- **Functions**: {{COVERAGE_FUNCTIONS}}%
- **Lines**: {{COVERAGE_LINES}}%

### Package Size
- **Total Lines**: {{TOTAL_LINES}}
- **Source Lines**: {{SOURCE_LINES}}
- **Test Lines**: {{TEST_LINES}}

### Code Quality
- **Cyclomatic Complexity**: {{CYCLOMATIC_COMPLEXITY}}
- **Maintainability Index**: {{MAINTAINABILITY_INDEX}}

## Dependencies

### Production Dependencies
<!-- List production dependencies -->

### Development Dependencies  
<!-- List development dependencies -->

## Dependents

### Applications
<!-- List applications that depend on this package -->

### Packages
<!-- List other packages that depend on this -->

## Recent Changes

<!-- List recent significant changes -->

## Known Issues

<!-- List any known issues or limitations -->

## Roadmap

<!-- Future plans and roadmap items -->

## Performance Notes

<!-- Any performance considerations or benchmarks -->