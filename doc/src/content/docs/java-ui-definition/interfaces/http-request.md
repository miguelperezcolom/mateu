---
title: "HttpRequest"
description: "Interface for accessing HTTP request data, headers, state and selected rows in action methods."
---

`HttpRequest` is injected into any backend method that declares it as a parameter. It gives you access to every piece of contextual data available when an action is triggered: URL parameters, request headers, the serialised component state, app-level state, and the rows the user has selected or clicked.

```java
public interface HttpRequest {

    // Core HTTP
    String path();
    String getParameterValue(String name);
    List<String> getParameterValues(String name);
    List<String> getParameterNames();
    String getHeaderValue(String key);
    List<String> getHeaderValues(String key);

    // Path helpers
    default String lastPathItem()          // last segment of path()
    default String penultimatePathItem()   // second-to-last segment

    // Component state
    default String getString(String key)
    default int getInt(String key)
    default double getDouble(String key)
    default List<Map<String, Object>> getListOfMaps(String key)

    // Typed state
    default <T> T getComponentState(Class<T> componentStateType)
    default <T> T getAppState(Class<T> appStateType)
    default <T> T getParameters(Class<T> rowType)

    // Selection
    default <T> List<T> getSelectedRows(Class<T> rowType)
    default <T> List<T> getSelectedRows(String fieldName, Class<T> rowType)
    default <T> T getClickedRow(Class<T> rowType)

    // Low-level attribute store
    Object getAttribute(String key);
    void setAttribute(String key, Object value);
}
```

## Method reference

### Path

| Method | Description |
|---|---|
| `path()` | Full URL path of the current request |
| `lastPathItem()` | Last `/`-delimited segment of the path — typically a resource ID |
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
| `getHeaderValue(key)` | First value of the named request header |
| `getHeaderValues(key)` | All values of a multi-valued header |

### Component state

The component state is the current in-memory form state serialised as a `Map`. The scalar helpers are convenience wrappers around that map.

| Method | Description |
|---|---|
| `getString(key)` | Read a `String` field from the component state map |
| `getInt(key)` | Read an `int` field (handles `Integer`, `Long`, and string-encoded numbers) |
| `getDouble(key)` | Read a `double` field |
| `getListOfMaps(key)` | Read a `List<Map<String, Object>>` field |
| `getComponentState(Class<T>)` | Deserialise the entire component state into a typed object |

### App and action state

| Method | Description |
|---|---|
| `getAppState(Class<T>)` | Deserialise the shared application state into a typed object |
| `getParameters(Class<T>)` | Deserialise the action-level parameters map into a typed object; returns the raw `Map` when `rowType` is `Map.class` |

### Row selection

| Method | Description |
|---|---|
| `getSelectedRows(Class<T>)` | All rows checked in the default grid (`crud_selected_items`) |
| `getSelectedRows(fieldName, Class<T>)` | Rows checked in a named grid field (`{fieldName}_selected_items`) |
| `getClickedRow(Class<T>)` | The single row the user clicked for a row-level action |

### Low-level attribute store

| Method | Description |
|---|---|
| `getAttribute(key)` | Read an arbitrary object stored in the request scope |
| `setAttribute(key, value)` | Store an arbitrary object in the request scope |

## Examples

### Read a header (JWT auth)

This pattern is used in the Changes demo to extract the current user from a Bearer token.

```java
@Toolbar
public CreateReleaseForm createRelease(List<ChangeRow> selectedRows, HttpRequest httpRequest) {
    var auth = httpRequest.getHeaderValue("Authorization");
    var jwt = auth.split(" ")[1];

    String[] chunks = jwt.split("\\.");
    var payload = fromJson(new String(Base64.getUrlDecoder().decode(chunks[1])));
    var user = payload.get("preferred_username").toString();

    return createReleaseForm.withUser(user);
}
```

### Read a URL path segment

```java
@Override
public Component component(HttpRequest httpRequest) {
    var id = httpRequest.lastPathItem();   // e.g. /customers/42  → "42"
    var customer = customerRepository.findById(id).orElseThrow();
    return Form.builder().title(customer.getName()).build();
}
```

### Deserialise typed component state

```java
public record SearchState(String query, String country) {}

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    var state = httpRequest.getComponentState(SearchState.class);
    return searchService.search(state.query(), state.country());
}
```

### Work with selected rows

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

### Read a query parameter

```java
@Override
public Component component(HttpRequest httpRequest) {
    var page = httpRequest.getParameterValue("page");
    return new Text("Page: " + page);
}
```
