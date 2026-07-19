namespace Mateu.Uidl;

// ── Field rendering modes ──────────────────────────────────────────────────────
/// <summary>Groups the following fields under a tab (instead of a section).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class TabAttribute(string name) : Attribute
{
    public string Name { get; } = name;

    /// <summary>When true this tab is the one selected when its strip first renders (instead of the
    /// default first tab). If several tabs in the same strip set it, the first one wins.</summary>
    public bool Open { get; init; }
}

/// <summary>Sets a field stereotype explicitly (textarea, password, money, plainText, …).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class StereotypeAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>Renders the field as a multi-line text area.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class MultilineAttribute : Attribute;

/// <summary>Renders the field as a password input.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class PasswordAttribute : Attribute;

/// <summary>Renders a numeric field as a formatted currency amount.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class MoneyAttribute : Attribute;

/// <summary>Renders the field (or every field of the class) as read-only plain text.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class PlainTextAttribute : Attribute;

/// <summary>Renders an enum field as radio buttons instead of the default dropdown, regardless of
/// how many constants the enum has. (C# analogue of Java's @UseRadioButtons.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class UseRadioButtonsAttribute : Attribute;

/// <summary>A remote, search-as-you-type reference field: renders a combo box whose options come
/// from the server page by page — the view (or crud) answers the field's
/// <c>search-&lt;fieldId&gt;</c> action from its <see cref="IOptionsSupplier"/>, filtered by the
/// typed text. Use it when the option set is too large to embed in the form.
/// (C# analogue of Java's @Lookup.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class LookupAttribute : Attribute;

/// <summary>A reference field picked through a full selector DIALOG instead of a combo: clicking
/// the field fires <c>codesearch-&lt;fieldId&gt;</c>, which opens the given selector — a Listing
/// implementing ISelector — in a modal; selecting a row writes its (id, label) back into the
/// field and closes the dialog. (C# analogue of Java's @Searchable.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class SearchableAttribute(Type selector) : Attribute
{
    /// <summary>The Listing + ISelector view that backs the dialog.</summary>
    public Type Selector { get; } = selector;
}

/// <summary>Hides the field while the client-side expression is truthy, re-evaluated on every
/// state change without a server round-trip — e.g. <c>[Hidden("!state.special")]</c> shows the
/// field only when Special is set. (C# analogue of Java's @Hidden.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class HiddenAttribute(string value) : Attribute
{
    /// <summary>Client-side expression over <c>state</c>; truthy → the field hides.</summary>
    public string Value { get; } = value;
}

/// <summary>Renders the field permanently disabled (visible but not editable).
/// (C# analogue of Java's @Disabled.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class DisabledAttribute : Attribute;

/// <summary>On a grid (list-of-rows) property: runs the named method when the user selects
/// (clicks) a row — the clicked row is injected into a method parameter typed as the row class.
/// Works on read-only grids, so it is the way to build master/detail. Optional Shortcut (e.g.
/// "ctrl+shift") lets the base combo plus a digit select the row by position.
/// (C# analogue of Java's @OnRowSelected.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class OnRowSelectedAttribute(string value) : Attribute
{
    /// <summary>The method to run (its camelCase name becomes the action id).</summary>
    public string Value { get; } = value;

    /// <summary>Keyboard base combo for selecting a row by position (combo+1 → first row…).</summary>
    public string Shortcut { get; set; } = "";
}

/// <summary>A client-side rule (the uidl mirror of io.mateu.uidl.data.Rule): while Filter is
/// truthy the renderer applies Action — most commonly SetDataValue of a field attribute (hidden,
/// disabled, required…) to the value of Expression, both evaluated against the live state.</summary>
public sealed record Rule(
    string Filter,
    string Action,
    string? FieldName,
    string? FieldAttribute,
    object? Value,
    string? Expression,
    string Result = "Continue",
    string? ActionId = null)
{
    /// <summary>Hide <paramref name="fieldName"/> while <paramref name="expression"/> is truthy.</summary>
    public static Rule Hide(string fieldName, string expression) =>
        new("true", "SetDataValue", fieldName, "hidden", null, expression);

    /// <summary>Disable <paramref name="fieldName"/> while <paramref name="expression"/> is truthy.</summary>
    public static Rule Disable(string fieldName, string expression = "true") =>
        new("true", "SetDataValue", fieldName, "disabled", null, expression);
}

/// <summary>Programmatic client-side rules for a view (the C# analogue of Java's RuleSupplier);
/// they complement the [Hidden]/[Disabled] attribute-derived rules.</summary>
public interface IRuleSupplier
{
    IReadOnlyList<Rule> Rules();
}

/// <summary>Renders a navigation icon at the right side of the field that takes the user to the
/// given URL or route. Href and Title travel verbatim and support <c>${...}</c> state expressions
/// interpolated client-side, so the link follows the value as the user edits the form. For a
/// programmatic alternative implement <see cref="ILinkSupplier"/> on the view class (it takes
/// precedence over this attribute). (C# analogue of Java's @LinkTo.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class LinkToAttribute(string href) : Attribute
{
    /// <summary>Destination URL or route. Supports <c>${...}</c> state interpolation.</summary>
    public string Href { get; } = href;

    /// <summary>Icon to render; the renderer picks a sensible default when empty.</summary>
    public string Icon { get; set; } = "";

    /// <summary>Tooltip for the icon. Supports <c>${...}</c> state interpolation.</summary>
    public string Title { get; set; } = "";

    /// <summary>Link target, e.g. <c>_blank</c> to open in a new tab.</summary>
    public string Target { get; set; } = "";
}

// ── Page-level features ────────────────────────────────────────────────────────
/// <summary>A KPI card in the page header. Put on a method returning the value.</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public sealed class KpiAttribute(string title) : Attribute
{
    public string Title { get; } = title;
}

/// <summary>A floating action button. Put on a method (the action).</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class FabAttribute(string icon, string? label = null, int order = 0) : Attribute
{
    public string Icon { get; } = icon;
    public string? Label { get; } = label;
    public int Order { get; } = order;
}

/// <summary>Binds a keyboard shortcut to a [Button]/action method, e.g. "ctrl+s".</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class ShortcutAttribute(string keys) : Attribute
{
    public string Keys { get; } = keys;
}

/// <summary>Warns before leaving the view with unsaved changes.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class ConfirmOnNavigationIfDirtyAttribute : Attribute;

/// <summary>Sticky right-hand index (table of contents) on long docs-style pages: lists every
/// section title, click scroll-jumps, the active entry highlights on scroll. Tri-state like
/// Java's @Toc: absent → the renderer decides (auto), [Toc] → force on, [Toc(false)] → suppress.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class TocAttribute(bool value = true) : Attribute
{
    public bool Value { get; } = value;
}

/// <summary>High-density rendering (condensed spacing) for information-dense screens.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class CompactAttribute : Attribute;

/// <summary>How a page's content column is sized within the viewport (the first parameter of the
/// Oracle Redwood page templates; the names follow them). Selected with [PageWidth] or the
/// <see cref="IPageWidthSupplier"/> hook; when neither is present the renderer infers the width
/// from the page content (full-bleed canvases like gantt/planning boards → edge-to-edge, dense
/// inline-editing datagrids → full width, anything else → fixed). Fixed caps the column (1408px
/// in Redwood) and centers it; FullWidth keeps the side margins but is never capped; EdgeToEdge
/// touches the viewport edges. (C# analogue of Java's PageWidthStyle.)</summary>
public enum PageWidthStyle { Fixed, FullWidth, EdgeToEdge }

/// <summary>Explicitly sets how the page's content column is sized within the viewport (the first
/// parameter of the Oracle Redwood page templates). When absent, the <see cref="IPageWidthSupplier"/>
/// hook applies, and otherwise the renderer infers the width from the page content (defaulting to
/// fixed). Inherited by subclasses. (C# analogue of Java's @PageWidth.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class PageWidthAttribute(PageWidthStyle value) : Attribute
{
    /// <summary>The page width to paint.</summary>
    public PageWidthStyle Value { get; } = value;
}

/// <summary>Programmatic counterpart of [PageWidth] — lets an archetype declare its default page
/// width (<see cref="Foldout"/> is edge-to-edge). The [PageWidth] attribute on the concrete view
/// class wins over this hook. (C# analogue of Java's PageWidthSupplier.)</summary>
public interface IPageWidthSupplier
{
    PageWidthStyle? PageWidth();
}

/// <summary>Renders the whole view read-only (a display page, not an editable form). On a
/// property of an [InlineEditing] crud entity it keeps that column display-only.
/// (C# analogue of Java's @ReadOnly.)</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public sealed class ReadOnlyAttribute : Attribute;

/// <summary>Makes every data column an in-place editor ([ReadOnly] properties stay
/// display-only). On a Crud class each committed cell persists its row immediately through the
/// crud's update-row action; on a grid (list-of-rows) PROPERTY the committed cells accumulate in
/// the form state and travel with the next save. (C# analogue of Java's @InlineEditing, which
/// targets both.)</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public sealed class InlineEditingAttribute : Attribute;

/// <summary>Optimistic-locking version property of a crud entity (an int or long). The framework
/// bumps it on every successful save; when a save arrives carrying a version OLDER than the
/// stored one (someone else saved in between), the save is rejected and the user gets a conflict
/// dialog — reload to see the other user's changes, or overwrite them explicitly (the dialog's
/// button re-sends the save with <c>_forceOverwrite</c>). Works on the crud editor save and on
/// inline row editing; no-op for entities without a [Version] property.
/// (C# analogue of Java's @Version.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class VersionAttribute : Attribute;

/// <summary>Adds a toolbar button to the crud LISTING that runs the decorated method as a BULK
/// action over the rows selected in the grid. The frontend keeps the selection in the
/// crud_selected_items component state key and blocks the dispatch while RowsSelectedRequired
/// and nothing is selected; on the server a List&lt;T&gt; parameter receives the selected rows
/// rebuilt as typed entities. A null/void result re-runs the search so the listing reflects the
/// changes. (C# analogue of Java's @ListToolbarButton.)</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class ListToolbarButtonAttribute(
    bool confirmationRequired = false, bool rowsSelectedRequired = true) : Attribute
{
    public bool ConfirmationRequired { get; } = confirmationRequired;
    public bool RowsSelectedRequired { get; } = rowsSelectedRequired;
}

/// <summary>Lets Mateu infer the UX patterns of a form from the amount and structure of the
/// declared information, so the developer only declares the data and Mateu decides how to present
/// it. Inference only fills the gaps the developer left open — every explicit layout attribute
/// ([Section], [Tab], [Stereotype], [UseRadioButtons]…) always wins. The rules are deterministic
/// and based on the declared structure (never on runtime data), so the same class always renders
/// the same way. [AutoLayout(false)] opts a class out when inference is enabled globally via the
/// "Mateu.LayoutInference" AppContext switch. (C# analogue of Java's @AutoLayout.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class AutoLayoutAttribute(bool value = true) : Attribute
{
    public bool Value { get; } = value;
}

// ── Permission-driven field states ─────────────────────────────────────────────

/// <summary>The caller's identity, as the framework adapter resolves it (e.g. from the JWT
/// Bearer token): the dimensions [EyesOnly]/[ReadOnlyUnless]/[DisabledUnless] match against.
/// (C# analogue of what Java's Authorizer reads.)</summary>
public sealed record Identity(
    IReadOnlyList<string>? Roles = null,
    IReadOnlyList<string>? Groups = null,
    IReadOnlyList<string>? Scopes = null,
    IReadOnlyList<string>? Permissions = null);

/// <summary>Base of the three permission attributes: matching is AND across declared dimensions,
/// OR within each; nothing declared → unrestricted; no identity → unauthorized.</summary>
public abstract class IdentityGatedAttribute : Attribute
{
    public string[] Roles { get; set; } = [];
    public string[] Groups { get; set; } = [];
    public string[] Scopes { get; set; } = [];
    public string[] Permissions { get; set; } = [];
}

/// <summary>HIDES the field (form and listing columns) unless the caller is authorized.
/// (C# analogue of Java's @EyesOnly on fields.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class EyesOnlyAttribute : IdentityGatedAttribute;

/// <summary>The field (or every field of the class) is READ-ONLY unless the caller is
/// authorized. Composes with [EyesOnly] for layered access — e.g. hidden to non-staff,
/// read-only to staff, editable to managers. (C# analogue of Java's @ReadOnlyUnless.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class ReadOnlyUnlessAttribute : IdentityGatedAttribute;

/// <summary>The field or [Button] method is DISABLED unless the caller is authorized.
/// (C# analogue of Java's @DisabledUnless.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Class)]
public sealed class DisabledUnlessAttribute : IdentityGatedAttribute;

/// <summary>PERSONA PROJECTION: the field, [Button]/[Toolbar] method or [MenuItem] entry is shown
/// only when the CURRENT AUDIENCE — the app-state value under the "audience" key, i.e. the
/// [AppContext] selector named audience — is unset (no projection active → everything visible) or
/// is one of the declared values. NOT a security boundary (the data still travels to any client
/// that clears the selector) — a UX projection aid; combine with [EyesOnly] for real access
/// control. (C# analogue of Java's @Audience.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method)]
public sealed class AudienceAttribute(params string[] audiences) : Attribute
{
    /// <summary>The audiences the element is meant for (case-sensitive, OR within the list).</summary>
    public string[] Audiences { get; } = audiences;
}
