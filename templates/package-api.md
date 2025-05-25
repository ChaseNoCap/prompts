# {{PACKAGE_NAME}} API Reference

```xml
<package_api name="{{PACKAGE_NAME}}">
  <exports>
    {{#INTERFACES}}
    <interface name="{{NAME}}">
      <purpose>{{PURPOSE}}</purpose>
      <methods>
        {{#METHODS}}
        <method name="{{NAME}}" return_type="{{RETURN_TYPE}}">
          <parameters>
            {{#PARAMETERS}}
            <parameter name="{{NAME}}" type="{{TYPE}}" optional="{{OPTIONAL}}">{{DESCRIPTION}}</parameter>
            {{/PARAMETERS}}
          </parameters>
          <description>{{DESCRIPTION}}</description>
        </method>
        {{/METHODS}}
      </methods>
    </interface>
    {{/INTERFACES}}
    
    {{#CLASSES}}
    <class name="{{NAME}}">
      <purpose>{{PURPOSE}}</purpose>
      <decorators>
        {{#DECORATORS}}
        <decorator>{{NAME}}</decorator>
        {{/DECORATORS}}
      </decorators>
    </class>
    {{/CLASSES}}
    
    {{#DECORATORS}}
    <decorator name="{{NAME}}">
      <purpose>{{PURPOSE}}</purpose>
      <parameters>
        {{#PARAMETERS}}
        <parameter name="{{NAME}}" type="{{TYPE}}" required="{{REQUIRED}}">{{DESCRIPTION}}</parameter>
        {{/PARAMETERS}}
      </parameters>
      <usage_example>
        <![CDATA[
        {{EXAMPLE}}
        ]]>
      </usage_example>
    </decorator>
    {{/DECORATORS}}
  </exports>
</package_api>
```

## Public API

### Interfaces

<!-- Document all public interfaces -->

### Classes

<!-- Document all public classes -->

### Functions

<!-- Document all public functions -->

### Decorators

<!-- Document all decorators if applicable -->

### Types

<!-- Document all public types -->

## Usage Examples

### Basic Usage

```typescript
// Basic usage example
```

### Advanced Usage

```typescript
// Advanced usage example
```

## Configuration

<!-- Document any configuration options -->

## Error Handling

<!-- Document error handling patterns -->

## Best Practices

<!-- List best practices for using this package -->