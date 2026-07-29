---
title: "Fluent components"
---

Mateu supports both **declarative UI** and **fluent components**.

👉 You can mix both approaches freely.

Even inside a declarative page, you can include any component that implements:

```java
io.mateu.uidl.fluent.Component
```

---

## Mixing declarative and fluent

A page does not have to be fully declarative or fully fluent.

You can keep the simplicity of declarative UI for state and actions, and introduce fluent components only where you need more control.

---

## Example: declarative only

```java
package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;

@UI("/simple")
@Style(StyleConstants.CONTAINER)
public class SimplePage {

    String name;

    @Button
    void greet() {}

}
```

![Declarative example](/images/docs/components/simple.png)

This is a fully declarative page:

- `name` becomes a text input
- `greet()` becomes a button
- layout and rendering are inferred automatically

---

## Example: declarative + fluent

```java
package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.fluent.Component;

import java.util.List;

@UI("/mixed")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class MixedPage {

    String name;

    Component stats = new HorizontalLayout(
            Chart.builder()
                    .chartType(ChartType.doughnut)
                    .chartData(ChartData.builder()
                            .labels(List.of("Scrap", "Create release", "Deploy"))
                            .datasets(List.of(ChartDataset.builder()
                                    .label("label 1")
                                    .data(List.of(1d, 2d, 3d))
                                    .build()))
                            .build())
                    .chartOptions(ChartOptions.builder()
                            .maintainAspectRatio(false)
                            .build())
                    .build(),
            new Avatar("Mateu")
    );

    @Button
    void save() {}

}
```

![Mixed example](/images/docs/components/mixed.png)

This page is still declarative, but it embeds fluent components directly.

The `stats` field is a fluent `Component`, so Mateu renders that custom UI block inside the page.

This is the key idea:

- declarative → state, actions, standard structure
- fluent → custom composition where needed

---

## Mental model

- declarative → structure, state, behavior
- fluent → fine-grained UI composition
- both → same rendering engine

---

## When to use fluent components

Use fluent components when:

- you need custom layouts
- you want reusable UI blocks
- you need more control than annotations provide
- you want to introduce charts, cards, avatars, or other richer components inside a standard page

Stay fully declarative when:

- forms are simple
- CRUD is standard
- inferred rendering is enough

---

## Categories of components

### Layout and structure

- [VerticalLayout](/java-ui-definition/components/vertical-layout/)
- [HorizontalLayout](/java-ui-definition/components/horizontal-layout/)
- [FormLayout](/java-ui-definition/components/form-layout/)
- [SplitLayout](/java-ui-definition/components/split-layout/)
- [AccordionLayout](/java-ui-definition/components/accordion-layout/)
- [TabLayout](/java-ui-definition/components/tab-layout/)
- [BoardLayout](/java-ui-definition/components/board-layout/)
- [CarouselLayout](/java-ui-definition/components/carousel-layout/)
- [MasterDetailLayout](/java-ui-definition/components/master-detail-layout/)
- [Scroller](/java-ui-definition/components/scroller/)
- [Container](/java-ui-definition/components/container/)
- [FullWidth](/java-ui-definition/components/full-width/)

### Forms and inputs

- [Form](/java-ui-definition/components/form/)
- [FormField](/java-ui-definition/components/form-field/)
- FormItem
- FormRow
- FormSection
- FormSubSection
- CustomField
- [Button](/java-ui-definition/components/button/)
- MessageInput

### Data display

- [Grid](/java-ui-definition/components/grid/)
- [TreeGrid](/java-ui-definition/components/tree-grid/)
- [VirtualList](/java-ui-definition/components/virtual-list/)
- [Directory](/java-ui-definition/components/directory/)
- [Card](/java-ui-definition/components/card/)
- [Details](/java-ui-definition/components/details/)
- [KPI](/java-ui-definition/components/kpi/)
- [Badge](/java-ui-definition/components/badge/)
- [Chart](/java-ui-definition/components/chart/)
- [Markdown](/java-ui-definition/components/markdown/)
- [Text](/java-ui-definition/components/text/)
- [Image](/java-ui-definition/components/image/)
- [Avatar](/java-ui-definition/components/avatar/)
- AvatarGroup

### Navigation and app structure

- App
- Page
- MenuBar
- [Breadcrumbs](/java-ui-definition/components/breadcrumbs/)
- [Anchor](/java-ui-definition/components/anchor/)
- Tab

### Feedback and overlays

- [Dialog](/java-ui-definition/components/dialog/)
- [ConfirmDialog](/java-ui-definition/components/confirm-dialog/)
- [Notification](/java-ui-definition/components/notification/)
- [Tooltip](/java-ui-definition/components/tooltip/)
- [Popover](/java-ui-definition/components/popover/)
- [ProgressBar](/java-ui-definition/components/progress-bar/)
- [CookieConsent](/java-ui-definition/components/cookie-consent/)

### Rich / specialized

- Bpmn
- [Map](/java-ui-definition/components/map/)
- [MicroFrontend](/java-ui-definition/components/micro-frontend/)
- [Element](/java-ui-definition/components/element/)
- [Icon](/java-ui-definition/components/icon/)

### State and infrastructure

- State
- AppState
- Data
- AppData
- FutureComponent

---

## See also

- [Supported components](/java-ui-definition/supported-components/)
