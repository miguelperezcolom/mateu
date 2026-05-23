---
title: "HttpRequest"
---

Provides access to the current HTTP request context — URL parameters, headers, component state, app state, and selected rows. It is passed to every method that Mateu calls on your backend classes.

```java
public interface HttpRequest {
    String path();
    String getParameterValue(String name);
    List<String> getParameterValues(String name);
    String getHeaderValue(String key);
    List<String> getHeaderValues(String key);
    List<String> getParameterNames();
    Object getAttribute(String key);
    void setAttribute(String key, Object value);

    // Component state helpers
    String getString(String key);
    int getInt(String key);
    double getDouble(String key);
    List<Map<String, Object>> getListOfMaps(String key);

    // Row access
    <T> List<T> getSelectedRows(Class<T> rowType);
    <T> List<T> getSelectedRows(String fieldName, Class<T> rowType);
    <T> T getClickedRow(Class<T> rowType);

    // Typed state
    <T> T getParameters(Class<T> type);
    <T> T getAppState(Class<T> appStateType);
    <T> T getComponentState(Class<T> componentStateType);

    // Internal DTO access
    RunActionRqDto runActionRq();
    GetUIRqDto getUiRq();

    // Path helpers
    default String lastPathItem() { ... }
    default String penultimatePathItem() { ... }
}
```

## Common methods

### Path

| Method | Description |
|---|---|
| `path()` | Full URL path of the current request |
| `lastPathItem()` | Last segment of the path (e.g. an ID) |
| `penultimatePathItem()` | Second-to-last segment |

### URL parameters

| Method | Description |
|---|---|
| `getParameterValue(name)` | First value of a URL query parameter |
| `getParameterValues(name)` | All values of a multi-valued query parameter |
| `getParameterNames()` | All parameter names present in the request |

### Headers

| Method | Description |
|---|---|
| `getHeaderValue(key)` | First value of a request header |
| `getHeaderValues(key)` | All values of a multi-valued header |

### Component state

The component state is the current in-memory form state serialised as a map. Use typed accessors for convenience:

| Method | Description |
|---|---|
| `getString(key)` | Reads a string from component state |
| `getInt(key)` | Reads an int from component state |
| `getDouble(key)` | Reads a double from component state |
| `getListOfMaps(key)` | Reads a list of maps from component state |
| `getComponentState(Class<T>)` | Deserialises the entire component state into a typed object |

### App state

| Method | Description |
|---|---|
| `getAppState(Class<T>)` | Deserialises the shared application state into a typed object |

### Selected rows

| Method | Description |
|---|---|
| `getSelectedRows(Class<T>)` | Returns the rows selected in the default grid |
| `getSelectedRows(fieldName, Class<T>)` | Returns rows selected in a named grid field |
| `getClickedRow(Class<T>)` | Returns the row the user clicked (for row-level actions) |

## Examples

### Read a URL path segment

```java
@Route("/customers/{id}")
public class CustomerDetailPage implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        var id = httpRequest.lastPathItem();
        var customer = customerRepository.findById(id).orElseThrow();
        return Form.builder()
            .title(customer.getName())
            .build();
    }
}
```

### Read typed component state

```java
public record SearchState(String query, String country) {}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var state = httpRequest.getComponentState(SearchState.class);
    return searchService.search(state.query(), state.country());
}
```

### Read selected rows

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("export".equals(actionId)) {
        var rows = httpRequest.getSelectedRows(CustomerRow.class);
        exportService.export(rows);
    }
    return null;
}
```

### Read a URL query parameter

```java
@Override
public Component component(HttpRequest httpRequest) {
    var page = httpRequest.getParameterValue("page");
    return new Text("Page: " + page);
}
```
