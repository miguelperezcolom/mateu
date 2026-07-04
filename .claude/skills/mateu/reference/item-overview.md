# Item overview page

Extend `ItemOverview` (io.mateu.core.infra.declarative.orchestrators.itemoverview) to keep an
item's key info pinned on the left while the rest of the page is tabbed on the right.

- **First component field without `@Panel`** → key-info panel (left, sticky while scrolling).
- **Component fields with `@Panel(title)`** → tabs (label defaults to the field label).
- Override `panelWidth()` (default `"22rem"`).

```java
@UI("/product/:id")
@Title("Ergonomic chair EC-200")
public class ProductOverview extends ItemOverview {

    Markdown keyInfo = new Markdown("### EC-200\n**SKU:** EC-200-BLK · **Price:** 349 €", null, null);

    @Panel(title = "Sales")          Chart sales = Chart.builder()/* … */.build();
    @Panel(title = "Specifications") Markdown specs = new Markdown("…", null, null);
    @Panel(title = "Reviews")        Markdown reviews = new Markdown("…", null, null);
}
```

Read-mostly detail pages → `ItemOverview`. Editable → `AutoEditableView`. Categories visible
simultaneously → `Foldout`. Long single flow with index → `@Toc` + sticky sections.
