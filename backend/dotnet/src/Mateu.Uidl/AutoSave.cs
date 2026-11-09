namespace Mateu.Uidl;

/// <summary>Saves the page as the user types: whenever a field value changes, the named
/// <see cref="Action"/> (default <c>save</c>) runs once the user has been idle for
/// <see cref="DebounceMillis"/> ms (default 800). For settings screens and draft editors where an
/// explicit Save button is unwanted. Travels as the <c>AutoSave</c> trigger
/// <c>{type, actionId, debounceMillis}</c> the renderers already honour. Composable: it may decorate
/// a semantic attribute. (C# analogue of Java's <c>@AutoSave(debounceMillis, action)</c>.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class AutoSaveAttribute : Attribute
{
    /// <summary>How long the user must be idle before the action runs, in ms.</summary>
    public int DebounceMillis { get; set; } = 800;

    /// <summary>The action (a method of the view, camelCase id) the change runs.</summary>
    public string Action { get; set; } = "save";
}
