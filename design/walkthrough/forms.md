# Walkthrough — forms, fields, layouts and wizards

Branch `walkthrough/forms` (2026-10-12). Walked by priority, as the owner asked: first what a user
meets in a normal **Java/Vaadin** and **YAML/Vaadin** served app, then **Redwood (VB)**, then the
ports. Every cell was driven in a real browser (Playwright: typing, selecting, uploading, drawing a
signature, keyboard shortcuts, submit, read back what the SERVER received through an echo action) —
not just "it renders".

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken / gap, not fixed (why) ·
⏳ not walked yet · N/A (why).

Columns: **J/V** Java + Vaadin served (MVC; the shared specs also run on WebFlux, verified) ·
**Y/V** YAML + Vaadin served · **J/R** Java + Redwood/VB served · **.NET / Py** the ports (wire +
server behaviour, by their test suites) · **Static** `mateu:bundle` specsOnly · **RN / IJ** native
renderers.

Fixtures (e2e/sut): `FieldsWalkForm` /walk-fields, `SpecialFieldsWalkForm` /walk-special,
`LayoutWalkForm` /walk-layout, `LabelsAsideWalkForm` /walk-labels-aside, `BehaviourWalkForm`
/walk-behaviour, `WalkWizard` /walk-wizard (all 5 apps), `walk-yaml-form.yaml` + `types.yaml`
/walk-yaml. Permanent specs: `tests/shared/{forms,layout,wizard,behaviour,yaml-form}-walk.spec.ts`
(all 5 Java adapters, Vaadin) and `tests/renderer/forms.spec.ts` (renderer-agnostic: Vaadin AND
VB/Redwood projects).

## Fields

| Feature | J/V | Y/V | J/R | .NET / Py | Static | RN / IJ |
|---|---|---|---|---|---|---|
| text, textarea, email, password | ✅ edit+echo (forms-walk) | ✅ render (yaml-form-walk) | ✅ edit+echo (renderer/forms) | ✅ suites | ⏳ | ⏳ |
| int / Integer / long / double / BigDecimal | ✅ edit+echo | ✅ render | ✅ edit+echo | ✅ suites | ⏳ | ⏳ |
| clearing a number/date | 🔧 6efd3f039 (null into a primitive kept the initializer) | ✅ | ✅ | 🔧 658f25e79 (both ports kept the initializer) | ⏳ | ⏳ |
| money stereotype / Amount | ✅ edit+echo | N/A | 🔧 2c975fd51 (Amount drew blank) — ❌ editing an Amount on Redwood commits a bare number (not verified on the server) | ✅ | ⏳ | ⏳ |
| date / time / dateTime | ✅ edit+echo | ✅ render | 🔧 2c975fd51 (LocalTime not drawn at all) ✅ edit+echo | ✅ | ⏳ | ⏳ |
| bool checkbox / toggle | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ |
| enum select, humanized labels, @Label constant | ✅ (forms-walk) | N/A | ✅ | ✅ (conformance) | ⏳ | ⏳ |
| small enum → radio | ✅ under @AutoLayout (layout-walk) — plain forms keep a select, as documented | N/A | ✅ | ✅ conformance | ⏳ | ⏳ |
| List<Enum> without stereotype | ❌ renders a grid of the enum's Name/Ordinal/Hash (ChoiceCollections keeps it deliberately: "an undeclared collection keeps its previous rendering") — **owner: default it to multiSelect?** | | | | | |
| multiSelect / checkbox set of enums | ✅ edit+echo (forms-walk) | ⏳ | ✅ render | ✅ | ⏳ | ⏳ |
| OptionsSupplier.supports() | 🔧 6efd3f039 (ignored on forms: a tree's options replaced every enum's) | N/A | ✅ (same wire) | ⏳ ports have no supports() equivalent to check | | |
| @Lookup combo (search-as-you-type, label of the stored id) | ✅ edit+echo | ⏳ | ✅ render | ✅ conformance | ⏳ | ⏳ |
| @TreeSelect | ✅ pick nested + echo | N/A | 🔧 7a7317893 (only top level offered; a nested value showed as its parent) | ✅ | ⏳ | ⏳ |
| colour | 🔧 6efd3f039 (always painted black) | N/A | ✅ | ✅ | ⏳ | ⏳ |
| stars / slider | ✅ edit+echo | N/A | 🔧 2c975fd51 (rating drew 100 stars as a hairline) | ✅ | ⏳ | ⏳ |
| @UploadableImage / @FileUpload / @Signature | ✅ upload/draw + echo | N/A | ✅ render | ✅ | ⏳ | ⏳ |
| @PhotoCapture | ✅ render (no camera headless) | N/A | ✅ render | ✅ | ⏳ | ⏳ |
| markdown / html | ✅ render | N/A | ❌ shown as editable raw source (Vaadin renders it) — owner: which is the contract for an editable markdown field? | ✅ | ⏳ | ⏳ |
| @PlainText / @Multiline / @ReadOnly | ✅ | N/A | 🔧 7a7317893 (@PlainText was an editable input) | ✅ | ⏳ | ⏳ |
| @Badge / @BulletedList / @Notice / @Text(size) / @SeparatorBefore | ✅ | N/A | 🔧 @Badge was an editable switch (7a7317893); others ✅ render; separator line not visible ❌ cosmetic | ✅ | ⏳ | ⏳ |
| placeholder (FormField / field type) | 🔧 0627d3afa (Vaadin never rendered it) | 🔧 same | ⏳ | N/A | ⏳ | ⏳ |
| field types catalogue (`types.yaml`, `fieldType:`) | N/A | ✅ label/stereotype/placeholder/required applied | ⏳ | ✅ suites | ⏳ | ⏳ |
| identity gates: @EyesOnly / @ReadOnlyUnless / @DisabledUnless | 🔧 34f69ea2e (@DisabledUnless / @Disabled / disabling rules never disabled a Vaadin field or button) ✅ hidden, read-only, tampered write ignored | ⏳ | ✅ (renderer/forms) | ✅ suites | N/A | ⏳ |
| component-holder field (`Callable<Component>`) | ✅ drawn, survives the round trip | N/A | ❌ not drawn in a plain (non-rich) form — the generic form drops non-field components inside a section | ⏳ | | |
| Double sent back as a whole number | ✅ (behaviour-walk) | | ✅ | ✅ | | |

## Validation

| Feature | J/V | Y/V | J/R | .NET / Py | Static |
|---|---|---|---|---|---|
| client refuses, marks and focuses the field, no request | ✅ (forms-walk) | 🔧 0627d3afa (a definition-only page sent NO validations; `required: true` was cosmetic) | ✅ required only (Redwood checks `required`, not min/max) | ✅ | 🔧 f2d0c6bbe (the expander sent `validations: []`) |
| server re-checks before a validationRequired action | 🔧 6efd3f039 (never did: a tampered/non-validating client ran the action) — also CRUD save/create | N/A (actions run in the browser) | ✅ covers what Redwood's client does not (min/max/pattern) | 🔧 6efd3f039 (.NET had none; Python only for CRUD) | N/A |
| conditions follow Bean Validation (0/false valid for @NotNull; empty optional passes @Min) | 🔧 6efd3f039 (conformance `validation` regenerated, three servers identical) | 🔧 | ✅ | 🔧 | 🔧 |
| fixing a field after a refused submit | 🔧 232d3f775 (error vanished on blur, button jumped, the click was lost) | ✅ | ✅ | N/A | ✅ |
| composed (meta) @Min/@Max/@Pattern | 🔧 6efd3f039 (threw NPE) | | | | |

## Layouts

| Feature | J/V | J/R |
|---|---|---|
| @Section, columns=1, frameless, sticky, propertyList, edit/add/viewMore affordances | ✅ (layout-walk) | 🔧 7bb044c38 (a card + tab bar anywhere was taken for an item overview: only the first section and the tabs were drawn); ✅ after |
| @Tab open + Alt+N shortcuts, value kept in a hidden tab | ✅ | ✅ open tab (shortcuts ⏳) |
| @Toc index (click, Ctrl+Alt+N, scrollspy) | ✅ | ❌ no index on Redwood (gap) |
| @Zones / @Compact / @FoldedLayout | ✅ render | ⏳ |
| @AutoLayout fold-optionals "More options" | 🔧 7dc060632 (Vaadin opened it: the folded fields showed expanded) | ⏳ |
| labels aside inference | ✅ | ⏳ |
| editable grid field: detail editor, save-and-add-another, inline append | ✅ (layout-walk) | 🔧 2c975fd51 (a form with a grid field lost its @Button row) |
| @Inline subform with toolbar / button / shortcut | ✅ (behaviour-walk) | ✅ (renderer/forms) |

## Behaviour and wizards

| Feature | J/V | J/R | .NET / Py |
|---|---|---|---|
| @AutoSave | ✅ | 🔧 9c9cf8029 (a field of the generic form never autosaved) | ✅ suites |
| @Action(shortcut) page + subform | ✅ | ✅ | N/A |
| @ConfirmOnNavigationIfDirty | ✅ existing confirm-dirty.spec | ⏳ | ⏳ |
| Wizard: validation per step, beforeStepNavigate, branch (stepApplies), Back keeps values, cross-step result, RAIL, Draftable save | ✅ (wizard-walk) | 🔧 7a7317893 (Continue saved the DRAFT instead of advancing; Next shown next to Continue; completion twice) ✅ after | ✅ suites |
| ImportWizard | ⏳ | ⏳ | ⏳ |

## YAML

| Feature | Y/V served | Static |
|---|---|---|
| definition-only route under a root `@UI("")` class | 🔧 0627d3afa (a fresh load showed the ROOT form instead) | ⏳ |
| `actions:` with restAction, validated first | ✅ (yaml-form-walk; the REST leg on mvc-app1, which serves the JSON) | ⏳ |
| YAML layout bound to a viewModel | ⏳ (core YamlModelViewSyncTest only) | N/A |

## Not walked (owner's budget: by priority)

React Native (expo web) and the IntelliJ renderer (renderProbe), the visual editor (authoring
forms / Play), Quarkus / Micronaut / Helidon (the shared specs run there in CI), and the static
bundle beyond the expander unit test.

## Doc claims found wrong and fixed

- `fluent-validations.md` documented a `ValidationException(fieldId, message)` that does not exist;
  now: server-side re-check + `UserFacingException` for business rules.
- `field-types.md` `@Searchable.label()` typed as `LabelSupplier` (it is `LookupLabelSupplier`).
- `@FoldedLayout` was described as "collapsible panels" in five pages; it has always laid the
  sections side by side (as CLAUDE.md says).
- `validation.md`: bean constraints are now checked on both sides, with Bean Validation semantics.
- `fold-more-options.png` showed the folded panel expanded (the bug); regenerated.

## For other areas

- `FieldTypeRegistry` reads ONLY `specs/ui/types.yaml`; the IDE's New › Mateu › Types lets the user
  name the file, and any other name is silently ignored (the field type renders "as declared").
- `Callable<String>` (a non-component holder) renders as an empty editable text field.
- Number fields commit strings ("19.95") into the client state (the server coerces; client rules
  compare a string).
