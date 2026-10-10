using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// The access keys of a YAML definition, applied for ONE request — the data twin of [EyesOnly] /
/// [ReadOnlyUnless] / [DisabledUnless], matched by the very same predicate
/// (<see cref="ActionGuard.Satisfies"/>). (Mirrors Java's io.mateu.core.application.security.YamlAccess.)
///
/// <para>The keys are an overlay every component accepts (like <c>note:</c>): this pass reads them
/// off the deserialised tree BEFORE it is built into components, rewrites a COPY for the caller and
/// strips them, so what reaches the wire is what this caller may see.</para>
/// <list type="bullet">
/// <item><c>eyesOnly:</c> (or <c>access:</c>) on a component — removed;</item>
/// <item><c>readOnlyUnless:</c> — <c>readOnly: true</c> on it and on every field under it;</item>
/// <item><c>disabledUnless:</c> — <c>disabled: true</c> (a FormField becomes read-only);</item>
/// <item><c>access:</c> on an <c>actions:</c> entry — removed, its id reported as refused (403 when
/// invoked anyway) and any Button naming it disabled;</item>
/// <item><c>access:</c> on a menu item — removed; a RouteLink with none inherits its route's.</item>
/// </list>
/// Hidden or read-only fields are reported as LOCKED: their client-sent values are dropped.
/// </summary>
public static class YamlAccess
{
    public const string AccessKey = "access";
    public const string EyesOnlyKey = "eyesOnly";
    public const string ReadOnlyUnlessKey = "readOnlyUnless";
    public const string DisabledUnlessKey = "disabledUnless";

    private static readonly string[] Keys = [AccessKey, EyesOnlyKey, ReadOnlyUnlessKey, DisabledUnlessKey];

    /// <summary>The tree for one request, plus the refused action ids and the locked field ids.</summary>
    public sealed record Applied(object? Tree, IReadOnlySet<string> RefusedActions, IReadOnlySet<string> LockedFields);

    /// <summary>An <c>access:</c>-shaped node as a restriction, or null when absent/empty. A bare
    /// string or list is the roles shorthand.</summary>
    public static Access? AccessOf(object? node)
    {
        Access? access = node switch
        {
            null => null,
            string s => new Access(Roles: Strings(s)),
            IDictionary<object, object> map => new Access(
                Strings(map.TryGetValue("roles", out var r) ? r : null),
                Strings(map.TryGetValue("groups", out var g) ? g : null),
                Strings(map.TryGetValue("scopes", out var sc) ? sc : null),
                Strings(map.TryGetValue("permissions", out var p) ? p : null)),
            IEnumerable<object> list => new Access(Roles: Strings(list)),
            _ => null,
        };
        return access is not null && access.Restricts() ? access : null;
    }

    private static List<string> Strings(object? node) => node switch
    {
        null => [],
        string s => s.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
        IEnumerable<object> list => list.Where(i => i is not null).Select(i => i.ToString()!).ToList(),
        _ => [node.ToString()!],
    };

    /// <summary>Whether the tree declares any access key anywhere — a tree that does not can be shared.</summary>
    public static bool DeclaresAccess(object? node) => node switch
    {
        IDictionary<object, object> map => Keys.Any(k => map.ContainsKey(k)) || map.Values.Any(DeclaresAccess),
        IEnumerable<object> list when node is not string => list.Any(DeclaresAccess),
        _ => false,
    };

    /// <summary>A deep copy of a deserialised YAML tree (maps and lists; scalars are immutable).</summary>
    public static object? DeepCopy(object? node) => node switch
    {
        IDictionary<object, object> map => map.ToDictionary(kv => kv.Key, kv => DeepCopy(kv.Value)),
        string s => s,
        IEnumerable<object> list => list.Select(DeepCopy).ToList<object?>(),
        _ => node,
    };

    /// <summary>Applies the access keys of <paramref name="root"/> for the current caller, on a COPY.</summary>
    /// <param name="root">The deserialised definition.</param>
    /// <param name="granted">Whether the caller satisfies a restriction (the identity predicate).</param>
    /// <param name="routeReachable">Whether the caller may reach a route — for a RouteLink that
    /// declares no <c>access:</c> of its own (null = no inheritance).</param>
    /// <param name="alsoRefused">Ids of actions refused from elsewhere — the action catalogue's
    /// restricted entries the tree names — treated like the page's own refused actions.</param>
    public static Applied Apply(object? root, Func<Access?, bool> granted, Func<string, bool>? routeReachable = null,
        IEnumerable<string>? alsoRefused = null)
    {
        var walker = new Walker(granted, routeReachable);
        if (alsoRefused is not null) walker.Refused.UnionWith(alsoRefused);
        var copy = DeepCopy(root);
        if (walker.Removes(copy, null)) return new Applied(null, walker.Refused, walker.Locked);
        walker.Walk(copy, null, false);
        if (walker.Refused.Count > 0) DisableButtonsFor(copy, walker.Refused);
        return new Applied(copy, walker.Refused, walker.Locked);
    }

    private sealed class Walker(Func<Access?, bool> isGranted, Func<string, bool>? routeReachable)
    {
        /// <summary>No restriction always passes, whatever the predicate says about null.</summary>
        private bool Granted(Access? access) => access is null || isGranted(access);

        public HashSet<string> Refused { get; } = [];
        public HashSet<string> Locked { get; } = [];

        private static string? Str(IDictionary<object, object> map, string key) =>
            map.TryGetValue(key, out var v) ? v?.ToString() : null;

        private static object? Get(IDictionary<object, object> map, string key) =>
            map.TryGetValue(key, out var v) ? v : null;

        public bool Removes(object? node, string? containerKey)
        {
            if (node is not IDictionary<object, object> map) return false;
            var access = AccessOf(Get(map, AccessKey));
            var linkRefused = access is null && routeReachable is not null
                              && Str(map, "type") == "RouteLink"
                              && Str(map, "route") is { } route
                              && !routeReachable(route);
            var eyesOnly = AccessOf(Get(map, EyesOnlyKey));
            if (!linkRefused && Granted(access) && Granted(eyesOnly)) return false;
            if (containerKey == "actions" && Str(map, "id") is { } id) Refused.Add(id);
            LockFieldsUnder(map);
            return true;
        }

        public void Walk(object? node, string? containerKey, bool readOnly)
        {
            if (node is IDictionary<object, object> map)
            {
                var isField = Str(map, "type") == "FormField";
                if (!Granted(AccessOf(Get(map, ReadOnlyUnlessKey)))) readOnly = true;
                if (!Granted(AccessOf(Get(map, DisabledUnlessKey))))
                {
                    if (isField)
                    {
                        map["readOnly"] = true;
                        Lock(map);
                    }
                    else map["disabled"] = true;
                }
                if (readOnly && isField)
                {
                    map["readOnly"] = true;
                    Lock(map);
                }
                else if (readOnly && map.ContainsKey("readOnly")) map["readOnly"] = true;
                foreach (var k in Keys) map.Remove(k);
                foreach (var name in map.Keys.ToList())
                {
                    var child = map[name];
                    if (child is IDictionary<object, object> && Removes(child, name?.ToString()))
                        map.Remove(name!);
                    else if (child is IDictionary<object, object> or List<object?>)
                    {
                        var wasNonEmpty = child is List<object?> { Count: > 0 };
                        Walk(child, name?.ToString(), readOnly);
                        // a menu group whose every entry was taken away is no group at all
                        if (wasNonEmpty && child is List<object?> { Count: 0 }
                                        && name?.ToString() == "submenu" && Str(map, "type") == "Menu")
                            map["__emptied"] = true;
                    }
                }
            }
            else if (node is List<object?> list)
            {
                for (var i = list.Count - 1; i >= 0; i--)
                {
                    if (Removes(list[i], containerKey))
                    {
                        list.RemoveAt(i);
                        continue;
                    }
                    Walk(list[i], containerKey, readOnly);
                    if (list[i] is IDictionary<object, object> m && m.ContainsKey("__emptied")) list.RemoveAt(i);
                }
            }
        }

        private void Lock(IDictionary<object, object> field)
        {
            if (Str(field, "id") is { } id) Locked.Add(id);
        }

        private void LockFieldsUnder(object? node)
        {
            switch (node)
            {
                case IDictionary<object, object> map:
                    if (Str(map, "type") == "FormField") Lock(map);
                    foreach (var v in map.Values) LockFieldsUnder(v);
                    break;
                case List<object?> list:
                    foreach (var v in list) LockFieldsUnder(v);
                    break;
            }
        }
    }

    /// <summary>Disables every Button that names an action the caller may not run.</summary>
    private static void DisableButtonsFor(object? node, IReadOnlySet<string> refused)
    {
        switch (node)
        {
            case IDictionary<object, object> map:
                if (map.TryGetValue("type", out var t) && t?.ToString() == "Button"
                    && map.TryGetValue("actionId", out var a) && a?.ToString() is { } actionId
                    && refused.Contains(actionId))
                    map["disabled"] = true;
                foreach (var v in map.Values) DisableButtonsFor(v, refused);
                break;
            case List<object?> list:
                foreach (var v in list) DisableButtonsFor(v, refused);
                break;
        }
    }
}
