---
title: "@RestOptions — external REST options"
description: "Fill a select's options from an arbitrary, non-Mateu REST endpoint fetched client-side."
---

`@RestOptions` fills a field's select options from an **arbitrary (non-Mateu) REST endpoint**,
fetched **client-side**: the renderer calls the URL directly — no Mateu server mediating — navigates
to the array in the JSON response, and maps each item into an option. The field renders as a select.

It is the first surface of decoupling the Mateu UI from the Mateu backend: a Mateu form talking to
any REST API.

**Target:** `FIELD` (and `ANNOTATION_TYPE`, so it composes as a [semantic annotation](./semantic-annotations)).

## Example

```java
@UI("/rest-options")
public class RestOptionsForm {

  @RestOptions(
      url = "https://restcountries.com/v3.1/all?fields=cca2,name",
      itemsPath = "",            // the response root is already the array
      valuePath = "cca2",
      labelPath = "name.common") // dot paths navigate nested JSON
  String country;
}
```

## Attributes

| Attribute    | Default   | Meaning |
|--------------|-----------|---------|
| `url`        | —         | The endpoint URL. Supports `${state.x}` interpolation, so the request can depend on other field values. |
| `method`     | `GET`     | The HTTP method. |
| `headers`    | `{}`      | Request headers as `"Name: Value"` strings (values interpolated) — e.g. an `Authorization` bearer token. |
| `body`       | `""`      | A request body template (interpolated) for non-`GET` methods. |
| `itemsPath`  | `""`      | A dot path to the array inside the response (`data.countries`); blank means the response root **is** the array. |
| `valuePath`  | `value`   | A dot path within each item to the option value. |
| `labelPath`  | `label`   | A dot path within each item to the option label. |

A primitive array element becomes its own value and label; a missing `valuePath`/`labelPath` falls
back to the other side, so half-specified mappings still render.

## How it works

`@RestOptions` travels on the wire as `FormFieldDto.optionsSource` (a `RestDataSource` descriptor:
`url`, `method`, `headers`, `body`, `itemsPath`, `valuePath`, `labelPath`). The renderer interpolates
the url/headers/body against the live field state, `fetch`es the endpoint, and shapes the JSON into
the select's options — a pure client-side call, so the endpoint must be reachable from the browser
(CORS-friendly for cross-origin APIs; same-origin needs nothing).

## Interpolation and dependent options

Because `url`/`headers`/`body` support `${state.x}`, a select can depend on another field. The
options refetch whenever the interpolated url changes:

```java
@RestOptions(url = "/api/cities?country=${state.country}", valuePath = "id", labelPath = "name")
String city;
```

:::note
This is the **options** surface. Consuming external endpoints for listing rows, form data and
button actions reuses the same `RestDataSource` descriptor and is on the roadmap.
:::
