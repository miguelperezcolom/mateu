using System.Reflection;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// [Subresource]: a record's sub-listings, placed in its tabs (several stacked in one tab), given the
// parent as context, lazy by default and counted on the tab when eager — and the embedded
// orchestrator island they render as (Java's Subresources + EmbeddedOrchestratorFieldBuilder).
internal sealed partial class ReflectionMapper
{
    public const string HideTitleMarker = "_hideTitle";
    public const string ScopeMarker = "_scope";
    public const string LazyMarker = "_lazy";

    /// <summary>A listing or crud (any orchestrator) a property can embed as an island (Java's MultiView).</summary>
    internal static bool IsOrchestratorType(Type t) =>
        t.IsClass && (CrudElementType(t) is not null
                      || typeof(IEditableView).IsAssignableFrom(t)
                      || typeof(IMasterDetailView).IsAssignableFrom(t)
                      || t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IListing<>)));

    /// <summary><c>gateways</c> → "Gateways" (Java's Subresources.label).</summary>
    private static string SubresourceLabel(string spec) => Naming.HumanizeConstant(spec.Replace('-', ' '));

    /// <summary>Java's Humanizer.toKebabCase: <c>internetGateways</c> → <c>internet-gateways</c>.</summary>
    private static string Kebab(string spec) =>
        Regex.Replace(Regex.Replace(spec.Trim(), "(?<=[a-z0-9])(?=[A-Z])", "-"), @"[\s_]+", "-").ToLowerInvariant();

    /// <summary>Moves every [Subresource] property into the tab it names — an existing one matched
    /// by key or label, else a new one at the end — after that tab's own properties, in Order; one
    /// whose Show flag is off is left out (Java's Subresources.place).</summary>
    private static void PlaceSubresources(List<TabGroup> groups, List<PropertyInfo> movable)
    {
        var byTab = new List<(string Spec, List<PropertyInfo> Props)>();
        foreach (var p in movable.Where(p => RoutedTabs.Shows(p.Find<SubresourceAttribute>()!.Show)))
        {
            var attr = p.Find<SubresourceAttribute>()!;
            var spec = string.IsNullOrEmpty(attr.Tab) ? Naming.CamelCase(p.Name) : attr.Tab;
            var bucket = byTab.FirstOrDefault(b => b.Spec == spec);
            if (bucket.Props is null)
            {
                bucket = (spec, []);
                byTab.Add(bucket);
            }
            bucket.Props.Add(p);
        }
        foreach (var (spec, props) in byTab)
        {
            var ordered = props.OrderBy(p => p.Find<SubresourceAttribute>()!.Order).ToList();
            var target = groups.FirstOrDefault(g =>
                string.Equals(spec, g.Key, StringComparison.OrdinalIgnoreCase)
                || string.Equals(spec, g.Name, StringComparison.OrdinalIgnoreCase)
                || string.Equals(SubresourceLabel(spec), g.Name, StringComparison.OrdinalIgnoreCase));
            if (target is null)
            {
                target = new TabGroup(SubresourceLabel(spec), false, Kebab(spec), null, []);
                groups.Add(target);
            }
            target.Props.AddRange(ordered);
        }
    }

    /// <summary>wire name → property of every public property of <paramref name="t"/>.</summary>
    private static Dictionary<string, PropertyInfo> WireProperties(Type t)
    {
        var map = new Dictionary<string, PropertyInfo>();
        foreach (var p in t.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            if (p.GetIndexParameters().Length == 0)
                map.TryAdd(Naming.CamelCase(p.Name), p);
        return map;
    }

    private static object? SimpleValue(PropertyInfo p, object host)
    {
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        var simple = t == typeof(string) || t.IsPrimitive || t == typeof(decimal) || t.IsEnum;
        if (!simple || !p.CanRead) return null;
        var value = p.GetValue(host);
        return value is null ? null : t.IsEnum ? value.ToString() : value;
    }

    /// <summary>The parent, as the sub-listing's context (wire names): the request route's path
    /// parameters, the host's simple properties the listing also has, and the explicit Context
    /// bindings (Java's Subresources.context).</summary>
    internal static Dictionary<string, object?> SubresourceContext(PropertyInfo p, object? host)
    {
        var listing = WireProperties(p.PropertyType);
        var context = new Dictionary<string, object?>();
        foreach (var (name, value) in RoutedTabs.ChainParams())
            if (listing.ContainsKey(name)) context[name] = value;
        if (host is null) return context;
        var hostProps = WireProperties(host.GetType());
        foreach (var (wire, hp) in hostProps)
        {
            if (hp == p || !listing.ContainsKey(wire)) continue;
            if (SimpleValue(hp, host) is { } value) context[wire] = value;
        }
        foreach (var binding in p.Find<SubresourceAttribute>()?.Context ?? [])
        {
            var parts = binding.Split('=', 2);
            var target = parts[0].Trim();
            var source = parts.Length > 1 ? parts[1].Trim() : target;
            var hp = hostProps.GetValueOrDefault(source)
                     ?? hostProps.Values.FirstOrDefault(x => x.Name == source)
                     ?? throw new InvalidOperationException(
                         $"[Subresource] {p.Name}: context '{binding}' names {source}, which {host.GetType().Name} does not have");
            if (SimpleValue(hp, host) is { } value) context[target] = value;
        }
        return context;
    }

    /// <summary>The rows an eager sub-listing has for this parent, or null when it cannot tell.</summary>
    private static long? SubresourceRows(PropertyInfo p, object? host)
    {
        try
        {
            var listing = Activator.CreateInstance(p.PropertyType)!;
            var props = WireProperties(p.PropertyType);
            foreach (var (wire, value) in SubresourceContext(p, host))
                if (props.TryGetValue(wire, out var lp) && lp.CanWrite)
                    lp.SetValue(listing, Convert.ChangeType(value, Nullable.GetUnderlyingType(lp.PropertyType) ?? lp.PropertyType,
                        System.Globalization.CultureInfo.InvariantCulture));
            if (p.PropertyType.GetMethod("Fetch", [typeof(string)]) is { } fetch
                && fetch.Invoke(listing, [null]) is System.Collections.IEnumerable rows)
                return rows.Cast<object>().LongCount();
        }
        catch (Exception)
        {
            // no count
        }
        return null;
    }

    /// <summary>The tab badge for its EAGER sub-resources: their rows summed, or null (Java's
    /// Subresources.badge).</summary>
    private static string? SubresourceBadge(IEnumerable<PropertyInfo> props, object? host)
    {
        long total = 0;
        var counted = false;
        foreach (var p in props)
        {
            if (p.Find<SubresourceAttribute>() is not { Load: SubresourceLoad.Eager }) continue;
            if (SubresourceRows(p, host) is { } n)
            {
                total += n;
                counted = true;
            }
        }
        return counted ? total.ToString(System.Globalization.CultureInfo.InvariantCulture) : null;
    }

    /// <summary>The sub-listing's title: its type's [Title], else the property name humanized.</summary>
    private static string SubresourceTitle(PropertyInfo p) =>
        p.PropertyType.GetCustomAttribute<TitleAttribute>()?.Value is { Length: > 0 } title
            ? title
            : Naming.HumanizeConstant(Naming.CamelCase(p.Name));

    /// <summary>A property whose TYPE is an orchestrator (a listing, a crud): an independent island —
    /// a MEDIATOR app shell bound to the type, in a ServerSide wrapper seeded with the context — and,
    /// for a [Subresource], its title and help line above it (Java's
    /// EmbeddedOrchestratorFieldBuilder.build).</summary>
    private ClientSideComponentDto MapOrchestratorField(PropertyInfo p, object instance, int columns,
        (string Label, int Subresources, int Fields)? currentTab)
    {
        var type = p.PropertyType;
        var marker = p.Find<SubresourceAttribute>();
        var route = type.GetCustomAttribute<UIAttribute>() is { } ui ? "/" + ui.Route.Trim('/') : "";
        if (route.Length == 0 && RoutedTabs.AuthoredRouteOf(type.FullName) is { } authored) route = authored;
        if (route.Length == 0)
        {
            if (marker is null)
                // The island would load route "" — the app's ROOT — and render the whole page inside
                // itself, which renders the island again: an endless reload with nothing on screen to
                // say why. Fail where the cause is.
                throw new InvalidOperationException(
                    $"{instance.GetType().Name}.{p.Name} embeds {type.Name}, an orchestrator with no route of its own,"
                    + " so its island would load the app's root route and render the page inside itself forever."
                    + $" Give {type.Name} a route ([UI(\"/…\")] or a routes.yaml entry), or declare the property [Subresource].");
            // a sub-resource needs no route of its own: its island is addressed by its type
            route = $"/_subresource/{instance.GetType().Name}/{Naming.CamelCase(p.Name)}";
        }
        var inline = p.Find<InlineAttribute>() is not null;
        var marked = route + "?" + EmbeddedMarker + "=1" + (inline ? "&" + InlineMarker + "=1" : "");
        var context = marker is not null ? SubresourceContext(p, instance) : new Dictionary<string, object?>();
        if (marker is not null)
        {
            marked += "&" + HideTitleMarker + "=1";
            // the names the parent fixes: the island's listing shows them as its scope
            if (context.Count > 0) marked += "&" + ScopeMarker + "=" + string.Join(",", context.Keys);
            if (marker.Load != SubresourceLoad.Eager) marked += "&" + LazyMarker + "=1";
        }
        var initialData = new Dictionary<string, object?> { [EmbeddedMarker] = true };
        if (inline) initialData[InlineMarker] = true;
        if (marker is not null)
        {
            initialData[HideTitleMarker] = true;
            foreach (var (k, v) in context) initialData[k] = v;
        }
        if (p.CanRead && p.GetValue(instance) is { } value)
            foreach (var member in WireProperties(value.GetType()))
                if (SimpleValue(member.Value, value) is { } v)
                    initialData[member.Key] = v;
        var id = "_" + Naming.CamelCase(p.Name);
        var app = Client(new AppMetadataDto("", "MEDIATOR", [])
        {
            HomeRoute = marked,
            HomeConsumedRoute = route,
            HomeServerSideType = type.FullName!,
            ServerSideType = type.FullName!,
            Route = route,
            RootRoute = "_empty",
            Style = "width: 100%;",
        }, id + "_app", []) with { Style = "width: 100%;" };
        ComponentDto island = new ServerSideComponentDto(id, type.FullName!, marked, [app], initialData, [], [],
            "width: 100%;", null, null);
        if (marker is not null) island = SubresourceHeader(p, marker, instance, island, currentTab);
        return Client(new CustomFieldMetadataDto("", island, columns), "fieldId", []) with { Style = "width: 100%;" };
    }

    /// <summary>A sub-resource's title and help line above its island; the title is left out when it
    /// would only repeat the tab's label, the page's title, or a tab holding it alone.</summary>
    private static ComponentDto SubresourceHeader(PropertyInfo p, SubresourceAttribute marker, object instance,
        ComponentDto island, (string Label, int Subresources, int Fields)? currentTab)
    {
        var title = SubresourceTitle(p);
        var pageTitle = instance.GetType().GetCustomAttribute<TitleAttribute>()?.Value ?? "";
        var showTitle = marker.ShowTitle
                        && !(currentTab is { } tab
                             && (string.Equals(title, tab.Label, StringComparison.OrdinalIgnoreCase)
                                 || (tab.Subresources == 1 && tab.Fields == 1)))
                        && !string.Equals(title, pageTitle, StringComparison.OrdinalIgnoreCase);
        var content = new List<ComponentDto>();
        if (showTitle)
            content.Add(Client(new TextMetadataDto(title) { Container = "h3", NoMargins = true }, null, [])
                with { Style = "", CssClasses = "mateu-subresource-title" });
        if (!string.IsNullOrEmpty(marker.Help))
            content.Add(Client(new TextMetadataDto(marker.Help) { Container = "p", NoMargins = true }, null, [])
                with
                {
                    Style = "color: var(--lumo-secondary-text-color, #666); margin: 0 0 .5rem 0;",
                    CssClasses = "mateu-subresource-help",
                });
        if (content.Count == 0) return island;
        content.Add(island);
        return Client(new VerticalLayoutMetadataDto(), null, content)
            with { Style = "width: 100%; gap: .25rem;", CssClasses = "mateu-subresource" };
    }
}
