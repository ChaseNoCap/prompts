# test-mocks Status

```xml
<package_status name="test-mocks">
  <metadata>
    <version>0.1.0</version>
    <last_update>2025-05-24</last_update>
    <state>experimental</state>
    <maturity>experimental</maturity>
  </metadata>
  
  <metrics>
    <coverage>
      <statements>100%</statements>
      <branches>95%</branches>
      <functions>100%</functions>
      <lines>0%</lines>
    </coverage>
    
    <size>
      <total_lines>1876</total_lines>
      <source_lines>1757</source_lines>
      <test_lines>119</test_lines>
    </size>
  </metrics>
  
  <dependencies>
    <production>
      <dependency>inversify</dependency>
      <dependency>event-system</dependency>
    </production>
    
    <development>
      <dependency>@types/node</dependency>
      <dependency>@typescript-eslint/eslint-plugin</dependency>
      <dependency>@typescript-eslint/parser</dependency>
      <dependency>eslint</dependency>
      <dependency>eslint-config-prettier</dependency>
      <dependency>eslint-plugin-prettier</dependency>
      <dependency>prettier</dependency>
      <dependency>typescript</dependency>
      <dependency>vitest</dependency>
      <dependency>@vitest/coverage-v8</dependency>
    </development>
  </dependencies>
  
  <dependents>
    <dependent type="package">file-system</dependent>
    <dependent type="package">test-helpers</dependent>
    <dependent type="package">h1b-visa-analysis</dependent>
  </dependents>
</package_status>
```

## Current Status

- **Version**: 0.1.0
- **State**: experimental
- **Last Updated**: 2025-05-24
- **Maturity**: Experimental

## Metrics

### Test Coverage
- **Statements**: 100%
- **Branches**: 95%  
- **Functions**: 100%
- **Lines**: 0%

### Package Size
- **Total Lines**: 1876
- **Source Lines**: 1757
- **Test Lines**: 119

## Dependencies

### Production Dependencies
- inversify
- event-system

### Development Dependencies  
- @types/node
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- eslint
- eslint-config-prettier
- eslint-plugin-prettier
- prettier
- typescript
- vitest
- @vitest/coverage-v8

## Dependents

- **file-system** (package)
- **test-helpers** (package)
- **h1b-visa-analysis** (package)

## Performance Notes

⚠️ Package size exceeds 1000 lines target
✅ Excellent test coverage (≥90%)

*Status updated: 2025-05-25*