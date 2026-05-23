---
title: "ProgressBar"
---

An indeterminate or determinate progress indicator.

## Basic usage

```java
// Indeterminate (animated, unknown duration)
ProgressBar.builder().build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Use cases

```java
// Shown while a background job is running
ProgressBar.builder()
    .style("width: 100%;")
    .build()
```

## Tip

`ProgressBar` is typically shown conditionally during a long operation. Use a state variable to control its visibility and re-render the component tree via a `State` return value once the operation completes.

```java
boolean loading = false;

@Override
public Form component(HttpRequest httpRequest) {
    var content = new ArrayList<Component>();
    if (loading) content.add(ProgressBar.builder().build());
    content.add(mainContent);
    return Form.builder().content(content).build();
}

@Override
public Object handleAction(String actionId, HttpRequest request) {
    loading = true;
    runLongOperation();
    loading = false;
    return new State(this);
}
```
