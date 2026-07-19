---
title: Waterfall detail
description: A record detail read top-to-bottom as stacked, full-width panels — a composition pattern, not an archetype.
---

**Status:** ✅ Composition pattern (no dedicated archetype needed)

## Intent

Present one record as a vertical cascade of full-width panels — header, key facts, then section after section of related content — so the user scrolls the whole story of the record instead of hunting through tabs. Oracle Fusion calls this the **Waterfall detail** template.

## Solution

The waterfall is a plain `VerticalLayout` of the existing building blocks — an `EntityHeader` for the title/facts strip, then one `Card` (or frameless `@Section`) per topic, often with property lists for the label/value look:

```java
@UI("/contracts")
@Title("Contract CT-2026-018")
public class ContractView implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        var contract = loadContract(httpRequest);
        return VerticalLayout.builder()
                .fullWidth(true)
                .spacing(true)
                .content(List.of(
                        EntityHeader.builder()
                                .title(contract.number())
                                .badges(statusChipsOf(contract))
                                .facts(factsOf(contract))
                                .build(),
                        Card.builder().title(new Text("Terms"))
                                .content(propertyListOf(contract)).build(),
                        Card.builder().title(new Text("Lines"))
                                .content(linesTableOf(contract)).build(),
                        Card.builder().title(new Text("Activity"))
                                .content(new Timeline(contract.events())).build()))
                .build();
    }
}
```

- **Page width**: annotate `@PageWidth(FIXED)` — a waterfall reads best as a centered, capped column (the renderer's inference already defaults to fixed for this content).
- Anchor navigation between sections composes with the `@Toc` sticky sections index.
- Alternating `#FBF9F8` / `#F1EFED` panels (the RDS waterfall look) are a `style`/`cssClasses` touch away on each card.

## When to use it

Use the waterfall for **read-mostly record stories**: contracts, orders, invoices, dossiers. Prefer [item overview](./item-overview) when the record has a strong key-info + tabbed shape, and [general overview](./general-overview) when the user jumps between records of the same type.
