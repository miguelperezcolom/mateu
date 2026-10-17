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

    /// <summary>Where the subscription listens (Java's <c>@SubscribeTo(source)</c>): the global
    /// event bus by default.</summary>
    public SubscriptionSource Source { get; init; } = SubscriptionSource.Document;

    /// <summary>With <see cref="SubscriptionSource.Component"/>: the emitter's [Emits] name the
    /// event must come from.</summary>
    public string From { get; init; } = "";

    /// <summary>A client expression that must hold for the action to run (blank = always).</summary>
    public string Condition { get; init; } = "";
}

/// <summary>Where a [SubscribeTo] listens: <c>Document</c> = the global bus (reaches sibling and
/// unrelated components), <c>Component</c> = the bus filtered by the emitter's name,
/// <c>Self</c> = only events bubbling up from the component's own descendants. (Mirrors
/// io.mateu.uidl.annotations.SubscriptionSource.)</summary>
public enum SubscriptionSource { Document, Component, Self }

/// <summary>When a [Trigger] fires (mirrors io.mateu.uidl.annotations.TriggerType).</summary>
public enum TriggerType { OnLoad, OnSuccess, OnError, OnValueChange, OnCustomEvent }

/// <summary>Runs <paramref name="actionId"/> on this view when <paramref name="type"/> happens — the C#
/// analogue of Java's <c>@Trigger</c>: <c>OnLoad</c> (with <see cref="TimeoutMillis"/> and
/// <see cref="Times"/> — 0 = unbounded — a periodic refresh), <c>OnSuccess</c> / <c>OnError</c>
/// of <see cref="CalledActionId"/> (chained actions, polls), <c>OnValueChange</c> of
/// <see cref="PropertyName"/> (any field when blank), <c>OnCustomEvent</c> of
/// <see cref="EventName"/> (listening on the component itself; [SubscribeTo] is the bus form).
/// Action ids are the ids on the wire, as for [SubscribeTo].</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class TriggerAttribute(TriggerType type, string actionId) : Attribute
{
    public TriggerType Type { get; } = type;
    public string ActionId { get; } = actionId;
    public int TimeoutMillis { get; init; }
    public int Times { get; init; } = 1;
    public string Condition { get; init; } = "";
    public string CalledActionId { get; init; } = "";
    public string PropertyName { get; init; } = "";
    public string EventName { get; init; } = "";
    /// <summary>Run the triggered action as a silent background refresh (no loading veil).</summary>
    public bool Background { get; init; }
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
