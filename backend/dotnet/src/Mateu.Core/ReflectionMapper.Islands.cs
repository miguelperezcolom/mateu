using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Islands: component adapters (Java: AdapterRegistry + AdaptedComponentTree) and routed views
// embedded in a host form as independent mediators (Java: EmbeddedOrchestratorFieldBuilder).
public sealed partial class ReflectionMapper
{
    /// <summary>Query-string marker of an embedded island's route: the view is running inside a host
    /// page (Java's EmbeddedOrchestratorFieldBuilder.EMBEDDED_MARKER).</summary>
    public const string EmbeddedMarker = "_embeddedMediator";

    /// <summary>Marker of an island whose host field is [Inline]: no page chrome, no card around a
    /// single-section form (Java's INLINE_MARKER).</summary>
    public const string InlineMarker = "_inline";

    /// <summary>An adapted model as its own ServerSide component: the adapter's components (one, or
    /// several stacked), its state as initialData, its action ids advertised, and the MODEL's type as
    /// serverSideType — so its actions route back to the adapter (Java: AdaptedComponentTree, a
    /// component-tree supplier: no Page wrapper, style "width: 100%;").</summary>
    internal ServerSideComponentDto MapAdapted(object model, IComponentAdapter adapter, string route,
        out IReadOnlyDictionary<string, object?>? data)
    {
        var view = adapter.Adapt(model);
        data = view.Data;
        IComponent tree = view.Components.Count switch
        {
            0 => new VerticalLayout(),
            1 => view.Components[0],
            _ => new VerticalLayout { Content = view.Components, Style = "width: 100%;" },
        };
        var state = view.State?.ToDictionary(kv => kv.Key, kv => kv.Value) ?? new Dictionary<string, object?>();
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), model.GetType().FullName!, route, [ComponentMapper.Map(tree)],
            state, (view.Actions ?? []).Select(a => new ActionDto(a, ValidationRequired: false)).ToList(),
            [], "width: 100%;", null, null);
    }

    /// <summary>Whether a property renders as an island instead of a field: its type has a
    /// registered adapter, or is a routed view ([UI]) embedded in the host.</summary>
    internal bool IsIslandProperty(PropertyInfo p) =>
        registry?.AdapterFor(p.PropertyType) is not null || IsEmbeddedView(p.PropertyType);

    private static bool IsEmbeddedView(Type t) =>
        t.IsClass && t != typeof(string) && !typeof(IComponent).IsAssignableFrom(t)
        && t.GetCustomAttribute<UIAttribute>() is not null && t.GetCustomAttribute<AppAttribute>() is null;

    /// <summary>The island a property renders as, in a CustomField cell spanning the whole row; null
    /// when the property is no island or holds no value.</summary>
    private ClientSideComponentDto? MapIslandField(PropertyInfo p, object instance, int columns)
    {
        var value = p.GetValue(instance);
        if (value is null) return null;
        var fieldId = Naming.CamelCase(p.Name);
        ComponentDto content;
        if (registry?.AdapterFor(p.PropertyType) is { } adapter)
        {
            // An adapted value is an independent island: own serverSideType, state and actions, so
            // its buttons round-trip through the adapter without the host (Java: the CustomField
            // around an AdaptedComponentTree in ReflectionFormFieldMapper).
            content = MapAdapted(value, adapter, "", out _);
        }
        else if (IsEmbeddedView(p.PropertyType))
        {
            content = MapEmbeddedIsland(p, value);
        }
        else return null;
        var label = p.Find<InlineAttribute>() != null ? "" : T(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        return Client(new CustomFieldMetadataDto(label, content, p.Find<ColspanAttribute>()?.Value ?? columns),
            fieldId, []) with { Style = "width: 100%;" };
    }

    /// <summary>A routed view embedded in a host form: a ServerSide wrapper carrying the view's own
    /// serverSideType and actions around a MEDIATOR app shell aimed at the view's route plus the
    /// <c>_embeddedMediator</c> (and, for [Inline], <c>_inline</c>) markers. The renderer mounts an
    /// inner mateu-ux that loads that route with the wrapper's initialData as its state — the markers
    /// plus the host-configured value's SIMPLE properties, so the island hydrates with the context
    /// the host set on it (Java: EmbeddedOrchestratorFieldBuilder.build + seedInstanceState).</summary>
    private ServerSideComponentDto MapEmbeddedIsland(PropertyInfo p, object value)
    {
        var type = value.GetType();
        var route = "/" + (type.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");
        if (route == "/")
            // the island would load the app's ROOT and render the page inside itself forever
            throw new InvalidOperationException(
                $"{p.DeclaringType?.Name}.{p.Name} embeds {type.Name}, a view with no route of its own: give it a [UI(\"/…\")] route.");
        var inline = p.Find<InlineAttribute>() != null;
        var markedRoute = route + "?" + EmbeddedMarker + "=1" + (inline ? "&" + InlineMarker + "=1" : "");
        var initialData = new Dictionary<string, object?> { [EmbeddedMarker] = true };
        if (inline) initialData[InlineMarker] = true;
        foreach (var member in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!member.CanRead || member.GetIndexParameters().Length > 0) continue;
            var t = Nullable.GetUnderlyingType(member.PropertyType) ?? member.PropertyType;
            var simple = t == typeof(string) || t.IsPrimitive || t == typeof(decimal) || t.IsEnum;
            if (!simple) continue;
            var memberValue = member.GetValue(value);
            if (memberValue is not null)
                initialData[Naming.CamelCase(member.Name)] = t.IsEnum ? memberValue.ToString() : memberValue;
        }
        // the island claims its own actions, so a toolbar click goes to the view, not the host
        var actions = MapView(type, value, route).Actions;
        var app = Client(new AppMetadataDto("", "MEDIATOR", [])
        {
            HomeRoute = markedRoute,
            HomeConsumedRoute = route,
            HomeServerSideType = type.FullName!,
            ServerSideType = type.FullName!,
            Route = route,
        }, Naming.CamelCase(p.Name) + "_app", []) with { Style = "width: 100%;" };
        return new ServerSideComponentDto(
            Naming.CamelCase(p.Name), type.FullName!, markedRoute, [app], initialData, actions, [],
            "width: 100%;", null, null);
    }

    /// <summary>[Inline] island demotion of a page's content: a single-section form drops its
    /// outlined card (the host section already frames it).</summary>
    private static List<ComponentDto> UnwrapSingleSectionCard(List<ComponentDto> content) =>
        content is [ClientSideComponentDto { CssClasses: "mateu-section", Metadata: CardMetadataDto card }]
            ? [card.Content]
            : content;
}
