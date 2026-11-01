---
title: "Master-detail view (MasterDetailView + @DetailPart)"
description: "One record screen: an always-visible master pane and a button bar that shows one detail part at a time, without reloading the master."
---

`MasterDetailView` is an archetype for a **record screen made of parts**: the **master** pane — what
must stay in sight (a booking's header, an order's status) — is always shown, and a **button bar**
picks one of several **detail parts** (the guest, the folios, the items…) to show beside or below it.
Switching parts re-renders only what changed; the master never reloads and nothing navigates away.

It is a different thing from [Master-detail (Process + Steps)](/java-user-manual/build/master-detail/),
which embeds a child CRUD inside a parent page. Use `MasterDetailView` when the "detail" is several
views of the **same** record, not a list of children.

## Declare it

Extend `MasterDetailView`, declare each section as a field, and mark the detail parts with
`@DetailPart`. Fields without it make up the master pane. Populate the fields in `load`:

```java
@UI("/master-detail")
@Title("Order")
@Zones({@Zone(name = "master", width = "60%"), @Zone(name = "detail", width = "40%")})
public class OrderScreen extends MasterDetailView {

  @Section(value = "Order", zone = "master")
  @Inline
  OrderSection order = new OrderSection();

  @DetailPart(label = "Customer", order = 0)
  @Section(value = "Customer", zone = "detail")
  @Inline
  CustomerSection customer = new CustomerSection();

  @DetailPart(label = "Items", order = 1)
  @Section(value = "Items", zone = "detail")
  @Inline
  ItemsSection items = new ItemsSection();

  @Override
  protected void load(HttpRequest httpRequest) {
    // read the record (e.g. from a route parameter) and fill the sections
  }

  @PlainText
  public static class OrderSection {
    public String reference = "ORD-001";
    public String status = "Open";
  }

  @PlainText
  public static class CustomerSection {
    public String name = "Acme Corp";
    public String email = "acme@example.com";
  }

  @PlainText
  public static class ItemsSection {
    public String summary = "3 items";
    public String total = "1450.75";
  }
}
```

- `@Zones` lays the master and the detail parts side by side (one zone each). Leave it out and they
  stack vertically.
- The button bar is the page toolbar: one button per `@DetailPart`, ordered by `order`, the selected
  one shown as primary.
- `load(HttpRequest)` runs on every render, so it is where the record is read — from the route, the
  state, a service. The sections are fields of the screen, so their values travel in its state like
  any form's.

## `@DetailPart`

| Attribute | Default | Meaning |
|---|---|---|
| `label` | the field name | The button caption. |
| `key` | the field name | The part's stable key: it appears in the route (`…/__md/<key>`) and the button's action id. Set it when you rename a field but want old links to keep working. |
| `order` | `0` | The button's position in the bar (lower first). |

`@DetailPart` is composable like the other field annotations: it can sit on a
[semantic annotation](/java-ui-definition/annotations/semantic-annotations/) of your own.

## What you can override

| Method | Default | Use it to |
|---|---|---|
| `load(HttpRequest)` | — (required) | Fill the master and detail sections. |
| `title(HttpRequest)` | the class's `@Title`, else its name | Name the page after the record (`"Order " + id`). |
| `header(HttpRequest)` | nothing | Put components above the two panes, full width — a summary strip of the loaded record. Called after `load`, so it can read the fields. |
| `noSelection()` | show the first part | Return `NoSelection.EMPTY` to show only the button bar until the user picks a part. |

## How it behaves

- The selected part is part of the **route** (`/orders/7/__md/items`), so a reload or a shared link
  opens the same part, and the route the screen was opened with (its `:id` and so on) is kept.
- Only the selected part is rendered; the others are not sent to the browser.
- The page type is `detail` (see [page types](/ux/page-types/)).

The [check-in demo](https://github.com/miguelperezcolom/mateu/blob/master/demo/demo-admin-panel/src/main/java/io/mateu/mdd/demoadminpanel/infra/in/ui/checkin/CheckInScreen.java)
(`demo-admin-panel`) is a full example with a reservation master and guest, cardex and folio parts.
