namespace Mateu.Uidl;

/// <summary>Marks a class as a routed Mateu view. Empty route = root. (C# analogue of Java's @UI.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class UIAttribute(string route = "") : Attribute
{
    public string Route { get; } = route;
}

/// <summary>Page/window title for a view.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class TitleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>A method exposed as a button at the bottom of the page.</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class ButtonAttribute(string? label = null) : Attribute
{
    public string? Label { get; } = label;
}

/// <summary>An overridden display label for a field or method.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method)]
public sealed class LabelAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}
