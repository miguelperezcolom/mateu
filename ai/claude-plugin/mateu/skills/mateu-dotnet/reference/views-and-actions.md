# C# views: fields, layout, actions

All attributes live in `Mateu.Uidl`; validation comes from `System.ComponentModel.DataAnnotations`
(`[Required]`, `[Range]`, `[EmailAddress]`, `[StringLength]`…), enforced client- and server-side.

## Field attributes (on public properties)

| Attribute | Effect |
|---|---|
| `[Label("…")]`, `[Help("…")]` | label / help text |
| `[Section("Title")]` | starts a titled card that the following properties join |
| `[Tab("Name")]` (`Open = true` = initially selected) | consecutive properties form a tab strip |
| `[ReadOnly]`, `[PlainText]` (also class-level), `[Disabled]` | not editable |
| `[Hidden]` / `[Hidden("state.kind == 'B2C'")]` | always / conditionally hidden (client expression over `state`) |
| `[Multiline]`, `[Password]`, `[Money]`, `[Stereotype("…")]` | control overrides |
| `[Colspan(n)]` | span n columns (grids, textareas, rich text span the row on their own) |
| `[UseRadioButtons]` | enum as radio group |
| `[Lookup]` + the view implements `IOptionsSupplier` | search-as-you-type remote select |
| `[TreeSelect(leavesOnly: true)]` + `IOptionsSupplier` (options with `Children`) | tree dropdown |
| `[Signature]`, `[PhotoCapture]` | capture into a data-URI string |
| `[LinkTo("/customers/${state.customerId}")]` | navigation icon on the field |
| `[HeaderBadge("success")]` | status chip in the page header (shown when non-empty) |
| `[InlineEditing]` on a `List<Row>` | edit grid cells in place (default: a row editor beside the grid) |
| `[EyesOnly(Roles = ["admin"])]`, `[ReadOnlyUnless(…)]`, `[DisabledUnless(…)]` | identity gates (roles/groups/scopes/permissions) |

```csharp
[UI("check-in"), Title("Check-in")]
public class CheckIn : IOptionsSupplier
{
    [Required, Section("Guest")] public string? Name { get; set; }
    [Lookup] public string? Country { get; set; }
    [Tab("Notes"), Multiline, Colspan(2)] public string? Notes { get; set; }
    [InlineEditing] public List<Companion> Companions { get; set; } = [];

    public IReadOnlyList<Option> Options(string fieldName) =>
        fieldName == "country" ? [new Option("es", "Spain"), new Option("pt", "Portugal")] : [];

    [Button] public Message Save() => new($"{Companions.Count} companions");
}

public class Companion { [Required] public string? Name { get; set; } public int Age { get; set; } }
```

## Class-level page attributes

`[Title]`, `[Subtitle]`, `[Overline]`, `[Compact]` (dense), `[AutoLayout]` (layout inference),
`[ConfirmOnNavigationIfDirty]`, `[PageWidth(...)]`, `[Zones]`/`[Zone]` + `[Section(Zone = "left")]`
(side-by-side columns), `[EyesOnly]` (whole view refused with 403, menu entries hidden).

## Actions

| Attribute | Renders | Notes |
|---|---|---|
| `[Button("Label")]` | button in the form footer | validates first |
| `[Toolbar("Label", ButtonStyle = "primary")]` | button in the page header toolbar | validates first |
| `[Action]` | nothing | invocable target of a component `ActionId`, an undo toast, client code |
| `[Fab("plus", "Add", 0)]` | floating action button | |
| `[Kpi("Open tickets")]` on a parameterless method | KPI card in the header (shows the return value) | |
| `[Banner(BannerTheme.Info, "Heads up")]` on a method returning `string` | banner below the header | |
| `[Shortcut("ctrl+s")]`, `[ActionOptions(TimeoutMillis = …, Idempotent = true)]` | compose with the above | |
| `[OnRowSelected("OnGuest")]` on a `List<Row>` | runs `OnGuest(Row row)` on row click | the clicked row is injected |

A method parameter typed `RunActionRqDto` (`Mateu.Dtos`) receives the raw request (parameters,
component state). Effects are listed in SKILL.md; examples:

```csharp
[Toolbar] public object Delete() => new object[] { new Message("Deleted"), "/orders" };
[Button]  public Drawer Details() => new() { HeaderTitle = "Details", Content = new Text("…") };
[Action]  public UICommandDto Close() => UICommandDto.CloseModal("saved");  // closes the overlay + emits "saved"
```

`UICommandDto` (namespace `Mateu.Dtos`) also has `DispatchEvent(name, detail)`, `NavigateTo(route)`,
`MarkAsClean()`, `Announce(text)`, `Print()`.

Throw `UserFacingException("…")` for a business refusal shown as written; any other exception is
shown as a generic error with a reference id (logged).

## Events between views

```csharp
[UI("orders"), Emits("order-created"), SubscribeTo("inventory-changed", "refresh")]
public class OrdersBoard
{
    [Action] public object Refresh() => this;                                  // re-render on the event
    [Button] public UICommandDto Create() => UICommandDto.DispatchEvent("order-created");
}
```

## Composed (semantic) attributes

```csharp
[AttributeUsage(AttributeTargets.Property)]
[Money, Label("Total amount")]
public sealed class TotalAmountAttribute : Attribute;
// usage: [TotalAmount] public decimal Total { get; set; }
```

`[UI]`/`[App]` are not composable.
