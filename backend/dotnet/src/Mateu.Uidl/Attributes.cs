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
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Class)]
public sealed class AppContextAttribute(string label = "") : Attribute
{
    public string Label { get; } = label;
}

/// <summary>Signature capture on a string property: a drawing canvas whose accepted strokes land
/// in the value as a PNG data URI (same self-contained contract as the uploadable image).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class SignatureAttribute : Attribute;

/// <summary>Photo capture on a string property: the device camera, storing the shot in the value
/// as a JPEG data URI (file-input fallback opens the native camera on phones).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class PhotoCaptureAttribute : Attribute;

/// <summary>Renders the property's dropdown as a TREE: the options carry children (supply them by
/// implementing IOptionsSupplier). With LeavesOnly only leaf nodes are selectable.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class TreeSelectAttribute(bool leavesOnly = false) : Attribute
{
    public bool LeavesOnly { get; } = leavesOnly;
}

/// <summary>On a numeric property of a Crud entity: the listing filter becomes a min–max RANGE
/// widget (the from/to bounds travel as &lt;field&gt;_from/&lt;field&gt;_to state keys) instead of
/// an equality input. Temporal properties are ranges by default; numerics opt in with this.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class RangeFilterAttribute : Attribute;

/// <summary>A method exposed as a button at the bottom of the page.</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class ButtonAttribute(string? label = null) : Attribute
{
    public string? Label { get; } = label;
}

/// <summary>An overridden display label for a field or method.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Class)]
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

/// <summary>AI chat on the app: a floating button opens a chat panel that streams its answers
/// from the given Server-Sent-Events endpoint. The endpoint is yours to implement — the panel
/// POSTs {message, sessionId, menuContext?} with Accept: text/event-stream and renders the
/// "data:" chunks as the streamed reply. (C# analogue of Java's @AI.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class AIAttribute(string sse) : Attribute
{
    /// <summary>URL of the SSE chat endpoint.</summary>
    public string Sse { get; } = sse;
}

/// <summary>A menu entry on an [App] class: a parameterless method returning the target view instance.</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class MenuItemAttribute(string? label = null) : Attribute
{
    public string? Label { get; } = label;
}

/// <summary>A FEDERATED menu entry on the [App] class: the option points at another Mateu backend
/// by base URL — the frontend fetches the remote app's menu itself and mounts its views, so
/// several services compose into one shell at runtime. With Explode the remote menu's entries are
/// inlined at this level instead of nesting under the label.
/// (C# analogue of Java's RemoteMenu.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class RemoteMenuAttribute(string label, string baseUrl) : Attribute
{
    public string Label { get; } = label;
    public string BaseUrl { get; } = baseUrl;

    /// <summary>Route inside the remote backend ("" = its root app).</summary>
    public string Route { get; set; } = "";

    /// <summary>Inline the remote entries at this level instead of nesting under Label.</summary>
    public bool Explode { get; set; }
}

/// <summary>Groups the following fields under a titled section (card) in a form.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class, AllowMultiple = false)]
public sealed class SectionAttribute(string caption) : Attribute
{
    public string Caption { get; } = caption;

    /// <summary>Assigns the section to a [Zone] column ([Zone]s on the class lay sections out
    /// side by side); unrecognised zones fall into a trailing flexible column.</summary>
    public string Zone { get; set; } = "";
}

/// <summary>A named column of a multi-column form. Declare several on the class (order matters)
/// and assign each [Section(Zone = ...)] to one — the sections lay out side by side, each zone a
/// vertical column of its section cards. Width like "64%" fixes the column; empty shares the
/// remaining space. (C# analogue of Java's @Zones/@Zone.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class ZoneAttribute(string name, string width = "") : Attribute
{
    public string Name { get; } = name;
    public string Width { get; } = width;
}

/// <summary>Lays the form's section cards out side by side in one horizontal row (equal shares)
/// instead of stacking them. [Zone] columns take precedence when both are declared.
/// (C# analogue of Java's @FoldedLayout.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class FoldedLayoutAttribute : Attribute;

/// <summary>A subtitle shown under the page title.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class SubtitleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

public enum BannerTheme { Info, Success, Warning, Danger }

/// <summary>An action-returned page banner: return one, or a list, from an action/toolbar method.</summary>
public sealed record PageBanner(BannerTheme Theme = BannerTheme.Info, string? Title = null, string? Description = null);

/// <summary>A page banner. Put on a method returning the description (string), or a void method.</summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public sealed class BannerAttribute(BannerTheme theme = BannerTheme.Info, string? title = null) : Attribute
{
    public BannerTheme Theme { get; } = theme;
    public string? Title { get; } = title;
}

/// <summary>A status chip in the page header strip, from a string property's value.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class HeaderBadgeAttribute(string color = "normal") : Attribute
{
    public string Color { get; } = color;
}

/// <summary>Assigns a property to a wizard step (1-based).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class StepAttribute(int step) : Attribute
{
    public int Step { get; } = step;
}
