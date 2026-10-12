namespace Mateu.Uidl;

/// <summary>Translates user-facing strings (titles, labels). Register an implementation to enable i18n.</summary>
public interface ITranslator
{
    string Translate(string key);

    /// <summary>The UI language as a BCP 47 tag ("es", "en-GB"), or null to let the browser decide.
    /// Travels as AppMetadataDto.Locale: the web client sets &lt;html lang&gt; from it and draws its own
    /// chrome (buttons, empty states…) in that language.</summary>
    string? Locale => null;
}

/// <summary>Declares the event name this component emits (via UICommand.DispatchEvent on the wire).</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class EmitsAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

/// <summary>Runs <paramref name="action"/> on this component when the named custom event fires.</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class SubscribeToAttribute(string @event, string action) : Attribute
{
    public string Event { get; } = @event;
    public string Action { get; } = action;
}

/// <summary>Meant to restrict an [App] or [UI] view to users holding this permission — but it was
/// never enforced (nothing reads it). Deprecated in 3.0-alpha.412: use
/// <c>[EyesOnly(Permissions = new[] { "x" })]</c> on the class, which refuses the view (403) and
/// hides the menu entries leading to it, exactly like Java's <c>@EyesOnly</c>.</summary>
[Obsolete("[Secured] was never enforced: use [EyesOnly(Permissions = new[] { \"...\" })] on the class instead.")]
[AttributeUsage(AttributeTargets.Class)]
public sealed class SecuredAttribute(string permission) : Attribute
{
    public string Permission { get; } = permission;
}
