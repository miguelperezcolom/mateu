namespace Mateu.Uidl;

// ── Field rendering modes ──────────────────────────────────────────────────────
/// <summary>Groups the following fields under a tab (instead of a section).</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class TabAttribute(string name) : Attribute
{
    public string Name { get; } = name;
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
