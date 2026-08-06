---
title: "@RestAction — call a REST endpoint from a button"
description: "A button that calls an arbitrary, non-Mateu REST endpoint client-side and applies the response."
---

`@RestAction` makes a button call an **arbitrary (non-Mateu) REST endpoint** **client-side** instead
of dispatching to the Mateu server: the renderer calls the URL directly — no Mateu server mediating —
with the interpolated body, then applies the response: it shows `successMessage` as a toast and,
when `resultPath` is set, merges the object at that path in the JSON response into the **form state**
(so bound fields refresh).

It is the action surface of decoupling the Mateu UI from the Mateu backend — after
[`@RestOptions`](./rest-options) (select options) and [`@RestListing`](./rest-listing) (listing rows).

**Target:** `METHOD` (and `ANNOTATION_TYPE`, so it composes as a [semantic annotation](./semantic-annotations)).
Put it on a method that is **also** a `@Button`/`@Toolbar` (which renders the clickable button).

## Example

A "Look up address" button that fills fields from a postal-code API:

```java
@UI("/checkout")
public class Checkout {

  String zip = "28001";
  String street;
  String city;

  @Button @Label("Look up address")
  @RestAction(
      url = "https://api.example.com/zip/${state.zip}",
      resultPath = "address",            // merge {street, city} from the response into the form
      successMessage = "Address found")
  public void lookup() {}                // never executed — the call is client-side
}
```

Given a response `{ "address": { "street": "Gran Vía 1", "city": "Madrid" } }`, clicking the button
fills the **Street** and **City** fields and shows an "Address found" toast.

## Attributes

| Attribute        | Default  | Meaning |
|------------------|----------|---------|
| `url`            | —        | The endpoint URL. Supports `${state.x}` interpolation. |
| `method`         | `POST`   | The HTTP method. |
| `headers`        | `{}`     | Request headers as `"Name: Value"` strings (values interpolated). |
| `body`           | `""`     | A request body template (interpolated), e.g. `{"name": "${state.name}"}`. |
| `successMessage` | `""`     | A toast shown on a 2xx response (interpolated); blank shows none. |
| `resultPath`     | `""`     | A dot path to the object in the response to merge into the form state; blank merges nothing (fire-and-toast). |

## How it works

`@RestAction` travels on the wire as `Action.restAction` (a `RestActionDto` = a `RestDataSource`
descriptor + `successMessage` + `resultPath`). When the button is clicked, the renderer validates the
form (the action is validation-required like any button), then — instead of POSTing to Mateu —
interpolates the url/headers/body against the live state, `fetch`es the endpoint, merges
`resultPath` into the form state and shows the toast. A non-2xx response shows a failure toast. The
endpoint must be reachable from the browser (CORS-friendly for cross-origin APIs).

## Other backends

Mateu.NET and the Python backend emit the same `restAction` descriptor. *(Port pending — see the
parity table.)*
