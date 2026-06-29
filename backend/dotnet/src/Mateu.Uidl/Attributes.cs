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

/// <summary>Marks a class as the application shell (header + menu). Its [MenuItem] methods are the menu.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class AppAttribute(string title) : Attribute
{
    public string Title { get; } = title;
}

/// <summary>A menu entry on an [App] class: a parameterless method returning the target view instance.</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class MenuItemAttribute(string? label = null) : Attribute
{
    public string? Label { get; } = label;
}

/// <summary>Groups the following fields under a titled section (card) in a form.</summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class SectionAttribute(string caption) : Attribute
{
    public string Caption { get; } = caption;
}
