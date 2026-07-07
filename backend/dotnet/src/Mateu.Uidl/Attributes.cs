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

/// <summary>An application-level context selector on the app header (the active hotel, the
/// company…): on an enum property its constants are the options, on a method the returned
/// (value, label) pairs are. The picked value is sent in the app state of every request under the
/// member's (camelCased) name.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method)]
public sealed class AppContextAttribute(string label = "") : Attribute
{
    public string Label { get; } = label;
}

/// <summary>Signature capture on a string property: a drawing canvas whose accepted strokes land
/// in the value as a PNG data URI (same self-contained contract as the uploadable image).</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class SignatureAttribute : Attribute;

/// <summary>Photo capture on a string property: the device camera, storing the shot in the value
/// as a JPEG data URI (file-input fallback opens the native camera on phones).</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class PhotoCaptureAttribute : Attribute;

/// <summary>Renders the property's dropdown as a TREE: the options carry children (supply them by
/// implementing IOptionsSupplier). With LeavesOnly only leaf nodes are selectable.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class TreeSelectAttribute(bool leavesOnly = false) : Attribute
{
    public bool LeavesOnly { get; } = leavesOnly;
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

/// <summary>A subtitle shown under the page title.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class SubtitleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

public enum BannerTheme { Info, Success, Warning, Danger }

/// <summary>A page banner. Put on a method returning the description (string), or a void method.</summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
public sealed class BannerAttribute(BannerTheme theme = BannerTheme.Info, string? title = null) : Attribute
{
    public BannerTheme Theme { get; } = theme;
    public string? Title { get; } = title;
}

/// <summary>A status chip in the page header strip, from a string property's value.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class HeaderBadgeAttribute(string color = "normal") : Attribute
{
    public string Color { get; } = color;
}

/// <summary>Assigns a property to a wizard step (1-based).</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class StepAttribute(int step) : Attribute
{
    public int Step { get; } = step;
}
