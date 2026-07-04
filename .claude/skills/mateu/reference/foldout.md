# Foldout record page

Extend `Foldout` (io.mateu.core.infra.declarative.orchestrators.foldout.Foldout) for a
Redwood-style record workspace: a fixed overview panel on the left + lateral fold-out panels.

- **First component field without `@Panel`** → the overview (always visible).
- **Component fields with `@Panel(title, subtitle, icon, open)`** → fold-out panels. Closed
  panels render as a narrow strip with the rotated title; several can be open side by side
  (horizontal scroll on overflow). `open = false` starts folded.

```java
@UI("/booking/:id")
@Title("Booking 2026-08117")
public class BookingFoldout extends Foldout {

    Markdown overview = new Markdown("**Guest:** Jane Smith …", null, null);   // overview

    @Panel(title = "Payments", subtitle = "Charges and refunds")
    Markdown payments = new Markdown("…", null, null);

    @Panel(title = "Occupancy")
    Chart occupancy = Chart.builder().chartType(ChartType.line) /* … */ .build();

    @Panel(title = "Notes", open = false)
    Markdown notes = new Markdown("…", null, null);
}
```

Fluent variant: build `FoldoutLayout.builder().overview(c).panels(List.of(FoldoutPanel.builder()
.title("…").open(false).content(c2).build()))` from `ComponentTreeSupplier`.

Choose `Foldout` for one-object workspaces (reservations, contracts, patient records);
`@Tabs` when categories are mutually exclusive; `MasterDetailView` when panels are alternative
detail parts of a master form.
