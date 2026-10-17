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

/// <summary>Restricts a [UI] view to callers holding this permission. Before 3.0-alpha.412 nothing
/// read it, so a view carrying it was open to everyone; it is now ENFORCED with exactly the
/// semantics of <c>[EyesOnly(Permissions = new[] { permission })]</c> — the view and its actions
/// are refused (403) to a caller without the permission or with no principal, and the menu entries
/// leading to it are hidden. Deprecated: use <c>[EyesOnly]</c>, the attribute that also takes
/// roles, groups and scopes.</summary>
[Obsolete("[Secured] is enforced as [EyesOnly(Permissions = [...])]: use [EyesOnly(Permissions = new[] { \"...\" })] on the class instead.", DiagnosticId = "MATEU001")]
[AttributeUsage(AttributeTargets.Class)]
public sealed class SecuredAttribute(string permission) : Attribute
{
    public string Permission { get; } = permission;
}
