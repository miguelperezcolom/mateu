namespace Mateu.Uidl;

// ── Field rendering modes ──────────────────────────────────────────────────────
/// <summary>Groups the following fields under a tab (instead of a section).</summary>
[AttributeUsage(AttributeTargets.Property)]
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
[AttributeUsage(AttributeTargets.Property)]
public sealed class MultilineAttribute : Attribute;

/// <summary>Renders the field as a password input.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class PasswordAttribute : Attribute;

/// <summary>Renders a numeric field as a formatted currency amount.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class MoneyAttribute : Attribute;

/// <summary>Renders the field (or every field of the class) as read-only plain text.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class PlainTextAttribute : Attribute;

/// <summary>Renders an enum field as radio buttons instead of the default dropdown, regardless of
/// how many constants the enum has. (C# analogue of Java's @UseRadioButtons.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class UseRadioButtonsAttribute : Attribute;

/// <summary>Renders a navigation icon at the right side of the field that takes the user to the
/// given URL or route. Href and Title travel verbatim and support <c>${...}</c> state expressions
/// interpolated client-side, so the link follows the value as the user edits the form. For a
/// programmatic alternative implement <see cref="ILinkSupplier"/> on the view class (it takes
/// precedence over this attribute). (C# analogue of Java's @LinkTo.)</summary>
[AttributeUsage(AttributeTargets.Property)]
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
[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
public sealed class KpiAttribute(string title) : Attribute
{
    public string Title { get; } = title;
}

/// <summary>A floating action button. Put on a method (the action).</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class FabAttribute(string icon, string? label = null, int order = 0) : Attribute
{
    public string Icon { get; } = icon;
    public string? Label { get; } = label;
    public int Order { get; } = order;
}

/// <summary>Binds a keyboard shortcut to a [Button]/action method, e.g. "ctrl+s".</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class ShortcutAttribute(string keys) : Attribute
{
    public string Keys { get; } = keys;
}

/// <summary>Warns before leaving the view with unsaved changes.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class ConfirmOnNavigationIfDirtyAttribute : Attribute;

/// <summary>High-density rendering (condensed spacing) for information-dense screens.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class CompactAttribute : Attribute;

/// <summary>Renders the whole view read-only (a display page, not an editable form).
/// (C# analogue of Java's @ReadOnly.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class ReadOnlyAttribute : Attribute;

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
