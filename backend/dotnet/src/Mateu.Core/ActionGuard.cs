using System.Collections;
using System.Reflection;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Thrown when a request asks for something the caller may not do: an action gated by
/// [DisabledUnless]/[Audience]/[EyesOnly] the caller does not satisfy, or a view hidden by a
/// class-level [EyesOnly]. The ASP.NET Core endpoint answers it with HTTP 403.</summary>
public sealed class MateuForbiddenException(string message) : Exception(message);

/// <summary>The security gate of the action pipeline (mirrors Java's action authorization).
///
/// <para>An actionId arrives from the wire, so it must only ever reach a method that is DECLARED
/// as an action. <see cref="ResolveAction"/> accepts a public instance method (never one declared
/// by <see cref="object"/>, never a property/event accessor, never a generic definition) whose
/// camelCase name is the actionId AND that is either</para>
/// <list type="bullet">
/// <item>marked as an action: [Action], [Button] or [Fab] (directly or through a composed
/// attribute), or</item>
/// <item>advertised by the view itself: an [OnRowSelected] value, a [SubscribeTo] action, the
/// IRefreshOnChange refresh action, any *ActionId of the view's component tree (fluent archetype
/// tree, [AutoPage]-inferred tree or the YAML layout bound to it), of its IRuleSupplier rules or of
/// its IAppActionsSupplier header actions.</item>
/// </list>
/// <para>Methods declared by the framework's own base classes (Mateu.Uidl / Mateu.Core) are never
/// reachable through the advertised path — only when they carry an action marker. Bulk row
/// actions (<c>action-on-row-*</c>) only reach [ListToolbarButton] methods
/// (<see cref="ResolveRowAction"/>).</para>
///
/// <para>Once resolved, <see cref="EnsureMayInvoke"/> enforces the access attributes at
/// invocation — [DisabledUnless], [Audience] and [EyesOnly] — and <see cref="EnsureViewVisible"/>
/// enforces a class-level [EyesOnly] on a view resolved from the wire.</para></summary>
internal static class ActionGuard
{
    /// <summary>The identity provider of the request being handled (AsyncLocal because the
    /// SyncHandler is a singleton shared across requests).</summary>
    private static readonly AsyncLocal<Func<Identity?>?> IdentitySource = new();

    private static readonly HashSet<Assembly> FrameworkAssemblies =
        [typeof(ButtonAttribute).Assembly, typeof(ActionGuard).Assembly, typeof(Mateu.Dtos.ActionDto).Assembly];

    internal static void SetIdentity(Func<Identity?>? source) => IdentitySource.Value = source;

    /// <summary>Whether the caller passes <paramref name="gate"/> — the same rule as the mapper
    /// (Java's Authorizer): AND across declared dimensions, OR within each; nothing declared →
    /// unrestricted; no identity → unauthorized.</summary>
    internal static bool Authorized(IdentityGatedAttribute? gate)
    {
        if (gate is null) return true;
        if (gate.Roles.Length + gate.Groups.Length + gate.Scopes.Length + gate.Permissions.Length == 0)
            return true;
        if (IdentitySource.Value?.Invoke() is not { } id) return false;
        return Matches(gate.Roles, id.Roles) && Matches(gate.Groups, id.Groups)
               && Matches(gate.Scopes, id.Scopes) && Matches(gate.Permissions, id.Permissions);

        static bool Matches(string[] declared, IReadOnlyList<string>? held) =>
            declared.Length == 0 || (held is not null && declared.Any(held.Contains));
    }

    /// <summary>Whether the wire may WRITE this property: an [EyesOnly] field the caller cannot see
    /// or a [ReadOnlyUnless] field (or class) the caller cannot edit is dropped, keeping the
    /// server-side value (mirrors Java's Hydrater).</summary>
    internal static bool MayWrite(PropertyInfo p) =>
        Authorized(p.Find<EyesOnlyAttribute>())
        && Authorized(p.Find<ReadOnlyUnlessAttribute>())
        && (p.DeclaringType is not { } owner || Authorized(owner.Find<ReadOnlyUnlessAttribute>()));

    private static bool IsFramework(Type? type) => type is not null && FrameworkAssemblies.Contains(type.Assembly);

    private static bool HasActionMarker(MethodInfo m) =>
        m.Find<ActionAttribute>() != null || m.Find<ButtonAttribute>() != null || m.Find<FabAttribute>() != null;

    /// <summary>Declared by a framework base class (or overriding a framework virtual).</summary>
    private static bool IsFrameworkMethod(MethodInfo m) =>
        IsFramework(m.DeclaringType) || IsFramework(m.GetBaseDefinition().DeclaringType);

    private static IEnumerable<MethodInfo> Candidates(Type type, string name) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => !m.IsSpecialName && !m.IsGenericMethodDefinition
                        && m.DeclaringType != typeof(object)
                        && m.GetBaseDefinition().DeclaringType != typeof(object)
                        && Naming.CamelCase(m.Name) == name);

    /// <summary>The method <paramref name="actionId"/> may invoke on a view, or null when no
    /// declared action has that id (see the class summary for the recognition rule).</summary>
    internal static MethodInfo? ResolveAction(Type type, object instance, string actionId, IComponent? layoutOverride)
    {
        HashSet<string>? advertised = null;
        foreach (var m in Candidates(type, actionId))
        {
            if (HasActionMarker(m)) return m;
            if (IsFrameworkMethod(m)) continue;
            advertised ??= AdvertisedIds(type, instance, layoutOverride);
            if (advertised.Contains(actionId)) return m;
        }
        return null;
    }

    /// <summary>The [ListToolbarButton] method a bulk <c>action-on-row-{name}</c> may invoke, or null.</summary>
    internal static MethodInfo? ResolveRowAction(Type type, string name) =>
        Candidates(type, name).FirstOrDefault(m => m.Find<ListToolbarButtonAttribute>() != null);

    /// <summary>Enforces the access attributes of a resolved action at invocation: the render
    /// path only disables/hides the button, the wire can still name the action.</summary>
    internal static void EnsureMayInvoke(Type type, MethodInfo method, string actionId)
    {
        string? reason = null;
        if (!Authorized(method.Find<DisabledUnlessAttribute>())) reason = "[DisabledUnless]";
        else if (!Authorized(method.Find<EyesOnlyAttribute>())) reason = "[EyesOnly]";
        else if (!ReflectionMapper.ForCurrentAudience(method)) reason = "[Audience]";
        if (reason is not null) Deny($"action '{actionId}' on {type.FullName} denied by {reason}");
    }

    /// <summary>Enforces a class-level [EyesOnly] on a view type resolved from the wire.</summary>
    internal static void EnsureViewVisible(Type type)
    {
        if (!Authorized(type.Find<EyesOnlyAttribute>()))
            Deny($"view {type.FullName} denied by class-level [EyesOnly]");
    }

    private static void Deny(string what)
    {
        Console.Error.WriteLine($"[mateu] security: {what} — the request was rejected (403)");
        throw new MateuForbiddenException($"Forbidden: {what}");
    }

    /// <summary>Every action id the view advertises besides its marked methods — the ids the
    /// mapper puts on the wire that route back to a method of the view.</summary>
    internal static HashSet<string> AdvertisedIds(Type type, object instance, IComponent? layoutOverride)
    {
        var ids = new HashSet<string>();
        foreach (var p in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            if (p.Find<OnRowSelectedAttribute>() is { } onRow && onRow.Value.Length > 0)
                ids.Add(Naming.CamelCase(onRow.Value));
        foreach (var s in type.GetCustomAttributes<SubscribeToAttribute>())
            if (s.Action.Length > 0) ids.Add(s.Action);
        if (instance is IRefreshOnChange refresh && !string.IsNullOrEmpty(refresh.RefreshActionId))
            ids.Add(refresh.RefreshActionId);

        var seen = new HashSet<object>(ReferenceEqualityComparer.Instance);
        Collect(() => layoutOverride, ids, seen);
        Collect(() => instance is IComponentTreeSupplier supplier ? supplier.Component() : null, ids, seen);
        Collect(() => layoutOverride is null && instance is not IComponentTreeSupplier
                      && PageInference.ComposesDashboard(type)
            ? ArchetypeComposers.ComposeDashboard(instance, 0)
            : null, ids, seen);
        Collect(() => layoutOverride is null && instance is not IComponentTreeSupplier
                      && !PageInference.ComposesDashboard(type) && PageInference.ComposesWelcome(type)
            ? ArchetypeComposers.ComposeWelcome(instance, type.Find<TitleAttribute>()?.Value, null, null)
            : null, ids, seen);
        Collect(() => instance is IRuleSupplier rules ? rules.Rules() : null, ids, seen);
        Collect(() => instance is IAppActionsSupplier app ? app.AppActions() : null, ids, seen);
        return ids;
    }

    private static void Collect(Func<object?> source, HashSet<string> ids, HashSet<object> seen)
    {
        object? root;
        try { root = source(); }
        catch { return; }
        Walk(root, ids, seen, 0);
    }

    /// <summary>Walks a fluent component tree (or any framework record graph) collecting the value
    /// of every string property whose name ends in "ActionId" (Button.ActionId, MetricCard.ActionId,
    /// PlanningBoard.MoveActionId, Rule.ActionId, AppHeaderAction.ActionId…).</summary>
    private static void Walk(object? node, HashSet<string> ids, HashSet<object> seen, int depth)
    {
        if (node is null or string || depth > 64) return;
        var t = node.GetType();
        if (t.IsPrimitive || t.IsEnum) return;
        if (!t.IsValueType && !seen.Add(node)) return;
        if (node is IEnumerable items)
        {
            foreach (var item in items) Walk(item, ids, seen, depth + 1);
            return;
        }
        if (!IsFramework(t) && node is not IComponent) return;
        foreach (var p in t.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!p.CanRead || p.GetIndexParameters().Length > 0) continue;
            object? value;
            try { value = p.GetValue(node); }
            catch { continue; }
            if (value is string s)
            {
                if (s.Length > 0 && p.Name.EndsWith("ActionId", StringComparison.Ordinal)) ids.Add(s);
            }
            else Walk(value, ids, seen, depth + 1);
        }
    }
}
