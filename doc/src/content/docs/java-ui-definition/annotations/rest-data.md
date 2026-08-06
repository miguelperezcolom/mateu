---
title: "@RestData — load a screen's data from a REST endpoint"
description: "A screen whose initial field values are fetched client-side from an arbitrary, non-Mateu REST endpoint on entry."
---

`@RestData` loads a screen's **initial data** from an **arbitrary (non-Mateu) REST endpoint**,
fetched **client-side on entry**: when the view mounts the renderer calls the URL directly — no Mateu
server mediating — then merges the object at `resultPath` in the JSON response into the **form
state**, so the fields arrive populated.

It is the screen-data surface of decoupling the Mateu UI from the Mateu backend — after
[`@RestOptions`](./rest-options) (select options), [`@RestListing`](./rest-listing) (listing rows)
and [`@RestAction`](./rest-action) (button calls). It is exactly `@RestAction`'s merge, triggered
**on load** instead of on click.

**Target:** `TYPE` (and `ANNOTATION_TYPE`, so it composes as a [semantic annotation](./semantic-annotations)).

## Example

```java
@UI("/profile")
@RestData(url = "https://api.example.com/me", resultPath = "profile")
public class Profile {
  String name;
  String email;
}
```

Given a response `{ "profile": { "name": "Ada Lovelace", "email": "ada@example.com" } }`, opening
`/profile` fills the **Name** and **Email** fields — no button, no server round-trip.

## Attributes

| Attribute    | Default | Meaning |
|--------------|---------|---------|
| `url`        | —       | The endpoint URL. Supports `${state.x}` interpolation (against the fields' initial values). |
| `method`     | `GET`   | The HTTP method. |
| `headers`    | `{}`    | Request headers as `"Name: Value"` strings (values interpolated). |
| `body`       | `""`    | A request body template (interpolated) for non-`GET` methods. |
| `resultPath` | `""`    | A dot path to the object in the response to merge into the form state; blank merges the whole response object. |

## How it works

`@RestData` reuses the `@RestAction` machinery: the view advertises a synthetic `__restdata__` action
carrying the `RestDataSource` descriptor plus an `OnLoad` trigger that fires it. When the view mounts,
the trigger runs the action client-side — interpolating the url/headers/body against the state,
`fetch`ing the endpoint and merging `resultPath` into the form state. No new wire types; every
renderer that already runs OnLoad triggers and `@RestAction` gets it for free. The endpoint must be
reachable from the browser (CORS-friendly for cross-origin APIs).

`url` interpolation lets the request depend on a route parameter seeded into the state (e.g.
`url = "https://api.example.com/users/${state.id}"`).

## Other backends

Mateu.NET and the Python backend emit the same synthetic `__restdata__` action + OnLoad trigger:

```csharp
// .NET
[UI("profile"), RestData("https://api.example.com/me", ResultPath = "profile")]
public class Profile { public string? Name { get; set; } public string? Email { get; set; } }
```

```python
# Python
@ui("profile")
@rest_data(url="https://api.example.com/me", result_path="profile")
class Profile:
    name: str = ""
    email: str = ""
```
