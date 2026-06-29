namespace Mateu.Uidl;

/// <summary>Translates user-facing strings (titles, labels). Register an implementation to enable i18n.</summary>
public interface ITranslator
{
    string Translate(string key);
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

/// <summary>Restricts an [App] or [UI] view to users holding this permission.</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class SecuredAttribute(string permission) : Attribute
{
    public string Permission { get; } = permission;
}
