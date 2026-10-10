---
title: "Heading Annotations"
description: "Render a field's value as an H1–H6 heading with @Text(container = …)."
---

## Headings with `@Text`

To show a `String` field's value as a heading instead of an input, annotate it with `@Text` and
pick the heading level as its `container`:

```java
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.data.TextContainer;

public class ProductForm {
    @Text(container = TextContainer.h2)
    String basicInfo = "Basic Information";

    String name;
    String description;

    @Text(container = TextContainer.h2)
    String pricingInfo = "Pricing";

    double price;
    String currency;
}
```

`TextContainer` offers `h1` … `h6`, `p` (the default), `div` and `span`; `@Text(size = …)` and
`@Text(noMargins = true)` tune the size and spacing. See [`@Text`](../metadata/#text).

:::note
The 3.0 alphas had `@H1` … `@H5` annotations for this. Nothing ever read them, so they were
removed — use `@Text(container = TextContainer.hN)`.
:::
