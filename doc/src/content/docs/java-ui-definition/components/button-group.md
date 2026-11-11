---
title: "ButtonGroup & split buttons"
---

A `ButtonGroup` puts several actions behind one control. It comes in two shapes:

- a **dropdown** — one trigger, labelled with the group's `label`, that opens the group's buttons;
- a **split button** — a group with a `primary`: the primary action runs from the button itself,
  and an adjacent ▾ opens the other buttons. Use it when one action is the usual one and the rest
  are variants of it ("Save" + "Save as draft", "Save and close").

A group sits wherever a button does: a page or form toolbar, a form's buttons, a listing toolbar
and plain content. Every button in it keeps its own `actionId` (or handler, or route) and runs
exactly as it would on its own.

:::note[Imports]
The samples leave out their `import` lines. `io.mateu.uidl.data.Button` (the record) and
`io.mateu.uidl.annotations.Button` (the annotation) share a name — see
[Java imports](/reference/java-imports/).
:::

## Fluent

```java
// a dropdown
ButtonGroup.of("Export",
    new Button("CSV", "exportCsv"),
    new Button("PDF", "exportPdf"));

// a split button: "Save" runs from the button, the rest is behind its ▾
ButtonGroup.split(
    Button.builder().label("Save").actionId("save").buttonStyle(ButtonStyle.primary).build(),
    new Button("Save as draft", "saveAsDraft"),
    new Button("Save and close", "saveAndClose"));

// or with the builder
ButtonGroup.builder()
    .primary(new Button("Save", "save"))
    .buttons(List.of(new Button("Save as draft", "saveAsDraft")))
    .build();
```

Put them in a `Form`'s `toolbar`/`buttons`, a listing's `toolbar`, or any layout's content. A
button with its own handler (`callable`/`runnable`) inside a group is advertised and runs like any
other fluent handler button.

## Declared on a page

`@Toolbar` (and `@Button`) methods sharing a `group` collapse into one dropdown labelled with the
group's name. Mark one member `groupPrimary = true` and the group becomes a split button instead:

```java
@Toolbar(group = "save", groupPrimary = true, buttonStyle = ButtonStyle.primary, order = 1)
public Message save() { … }

@Toolbar(group = "save", order = 2)
@Label("Save as draft")
public Message saveAsDraft() { … }

@Toolbar(group = "export", order = 3) public void csv() { … }   // the "Export" dropdown
@Toolbar(group = "export", order = 4) public void pdf() { … }
```

`order` fixes the sequence (reflection does not keep the declaration order); the group takes the
place of its first member. Several members claiming `groupPrimary`: the first wins.

## YAML

```yaml
toolbar:
  - type: ButtonGroup            # a split button: it has a primary
    primary: {type: Button, label: Save, actionId: save, buttonStyle: primary}
    buttons:
      - {type: Button, label: Save as draft, actionId: saveAsDraft}
  - type: ButtonGroup            # a dropdown
    label: Export
    buttons:
      - {type: Button, label: CSV, actionId: exportCsv}
      - {type: Button, label: PDF, actionId: exportPdf}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `id` | String | Optional component id |
| `label` | String | The dropdown's trigger text (not drawn on a split button) |
| `iconOnLeft` / `iconOnRight` | String | The dropdown trigger's icons |
| `separatorBefore` | boolean | A separator before the group in a toolbar |
| `buttons` | `List<Button>` | The buttons behind the trigger / the ▾ |
| `primary` | `Button` | Set: a split button whose button runs this action |

## How each renderer draws it

| Renderer | Dropdown | Split button |
|---|---|---|
| Vaadin | `vaadin-menu-bar` with one item | one `vaadin-menu-bar`: the primary + a ▾ item named "More actions" (←/→ between the parts, ↓/Enter opens the menu, Esc closes it) |
| Redwood | its buttons in the row / the Spectra header's actions | in content `oj-button` + an icon-only `oj-menu-button` ("More actions"); in the page header the primary first, then the rest (Spectra's header has its own primary slot and overflow) |
| React Native | a button opening a Paper `Menu` | a Paper button + a ▾ button ("More actions") opening a `Menu` |
| Desktop (IntelliJ) | a "label ▾" button with a popup menu | a `JButton` + a ▾ button ("More actions", ↓ opens) with a popup menu; the native host toolbar lists the primary then the rest |

On the wire a group is a `Button` whose `children` are its buttons; a split button is the primary
button itself with `split: true` (see the [wire specification](/reference/wire-specification/)).

## In C# and Python

- **.NET** — `Button.Group("Export", …)` / `Button.Split(primary, …)` (a `Button` carrying
  `Buttons`), and `[Toolbar(Group = "save", GroupPrimary = true)]`.
- **Python** — `Button.group("Export", …)` / `Button.split(primary, …)`, and
  `@toolbar(group="save", group_primary=True)`.

The three backends emit the same wire (conformance case `button-groups`).

**See it live in the Explorer:** [Button, ButtonGroup & split buttons](https://explorer.mateu.io/components/actions-and-navigation/button)
