---
title: "@RestListing — external REST listing rows"
description: "Fill a listing's rows from an arbitrary, non-Mateu REST endpoint fetched client-side."
---

`@RestListing` fills a listing's **rows** from an **arbitrary (non-Mateu) REST endpoint**, fetched
**client-side**: the renderer calls the URL directly — no Mateu server mediating — navigates to the
array in the JSON response, and maps each item into a row by reading each **column by its field
name** (so a `Row(String code, String name)` reads `code`/`name` from each item). The columns come
from the `Listing<Row>`'s Row type as usual.

It is the listing sibling of [`@RestOptions`](./rest-options) — the same decoupling idea, one level
up: a Mateu table talking to any REST API.

**Target:** `TYPE` (and `ANNOTATION_TYPE`, so it composes as a [semantic annotation](./semantic-annotations)).

## Example

```java
@UI("/rest-countries")
@RestListing(url = "/countries.json", itemsPath = "data.countries")
public class RestCountries implements Listing<RestCountries.Row> {

  public record Row(String code, String name, long population) {}

  // Never called — the rows are fetched client-side — so it may return empty.
  @Override public ListingData<Row> search(SearchRequest r, HttpRequest h) {
    return ListingData.of();
  }
}
```

Given a response like `{ "data": { "countries": [ { "code": "ES", "name": "Spain", "population": 47 }, … ] } }`,
the table shows a **Code / Name / Population** grid populated from the endpoint.

## Attributes

| Attribute   | Default | Meaning |
|-------------|---------|---------|
| `url`       | —       | The endpoint URL. Supports `${state.x}` interpolation — including `${searchText}`, `${page}`, `${size}`. |
| `method`    | `GET`   | The HTTP method. |
| `headers`   | `{}`    | Request headers as `"Name: Value"` strings (values interpolated). |
| `body`      | `""`    | A request body template (interpolated) for non-`GET` methods. |
| `itemsPath` | `""`    | A dot path to the array inside the response; blank means the response root **is** the array. |

## How it works

`@RestListing` travels on the wire as `Crudl.rowsSource` (a `RestDataSource` descriptor). When the
listing renderer sees a `rowsSource`, it **skips the server `search` action** and instead fetches the
endpoint client-side on mount and on every search, mapping each JSON item into a row object keyed by
column id.

- **Search** — the free-text query filters the fetched rows **in memory** (case-insensitive, any
  column). The interpolated url also carries `${searchText}`, so an endpoint that supports
  server-side search gets it too — return the already-filtered set and it just works.
- **Pagination** — applied in memory over the fetched rows (`${page}`/`${size}` are likewise
  interpolated into the url for endpoints that page server-side).

The endpoint must be reachable from the browser (CORS-friendly for cross-origin APIs; same-origin
needs nothing). The listing is read-only.

:::note
Rows and [options](./rest-options) are the shipped surfaces of consuming external endpoints. Form/
screen data load and endpoint button actions reuse the same `RestDataSource` descriptor and are on
the roadmap. This surface is currently Java-only; the .NET/Python port is a follow-up.
:::
