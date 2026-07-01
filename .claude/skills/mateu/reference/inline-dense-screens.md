# Dense screens: composing sub-forms with `@Inline`, `@Compact`, `@Zones`

For operational screens (check-in, back-office consoles) that pack many fields without
scrolling: a host class composes several **sub-forms**, laid out in columns, condensed.

## `@Inline` — sub-form without its own chrome

`@Inline` on a field drops the title + outlined card Mateu would wrap around a nested field,
so it blends into the host section/tab.

- **On a POJO-typed field:** expands that type's fields directly into the parent `@Section`
  (no extra Card). The parent `@Section` provides the header. `@Toolbar` methods on the POJO
  render on the section's title row; `@Button` methods render below. Class-level annotations
  (`@PlainText`, `@Compact`) are **not** inherited — put them on the POJO.
- **On an embedded orchestrator field** (a `MultiView`/`AutoEditableView`): the inner view
  drops badges/kpis, demotes its title `h2`→`h3`, and (single-section) drops the Card; the
  host `@Section` hides its own title row so the two don't compete. In a `@Tab`, the embedded
  `h3` is the only title — remove `@Title` from the inner model to suppress it.

## Host pattern (the "partial forms" screen)

A screen is a host class whose fields are `@Section @Inline` sub-forms; each sub-form is its
own class. Optionally, one is an editable orchestrator.

```java
@UI("/checkin")
@Compact
@Zones({ @Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%") })
public class CheckInForm {
    @Section(value = "Huéspedes", zone = "left")  @Inline GuestsSection guests;   // POJO
    @Section(value = "Folios",    zone = "right") @Inline FoliosSection folios;   // POJO
    @Section(value = "Info",      zone = "left")  @Inline CardexView cardex;      // editable
}

// a plain sub-form
@PlainText @Compact
class FoliosSection {
    @Stereotype(FieldStereotype.money) @Label("Límite crédito") BigDecimal creditLimit;
    @Toolbar @Label("Introducir cobro") Object addCharge(HttpRequest r) { ... }
}

// an optional orchestrator sub-form (read ⇄ edit on its own)
class CardexView extends AutoEditableView<Cardex> {
    public Cardex load(HttpRequest r) { return repo.get(r); }
    public void persist(Cardex e, HttpRequest r) { repo.save(e); }
}
```

## `@Compact` — high density

Class-level `@Compact` condenses control heights, spacing and label sizes (font stays legible)
and shrinks the responsive column min-width so more columns fit. It cascades through shadow DOM
(CSS custom properties), so every nested component condenses. Grids also get Vaadin's `compact`
row theme. Opt-in and non-breaking. Compose partially via `@Style(StyleConstants.COMPACT)`.

## `@Zones` — multi-column layout

`@Zones({@Zone(name="left", width="64%"), @Zone(name="right", width="36%")})` lays sections
side by side; each `@Section(zone="left")` goes in that column. Incompatible with
`@FoldedLayout` (zones win). Combine with `@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)` for
edge-to-edge operational screens.

Real example: check-in demo (`CompactCheckInScreen` / `CheckInForm`). See also
[form-actions.md](form-actions.md), [editor.md](editor.md), and
[component-communication.md](component-communication.md) for wiring the sub-forms together.
