using System.Reflection;
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Islands: adapted domain objects (Java: AdapterInstanceFactory + AdaptedComponentTree) and routed
// views embedded in a host page (Java: EmbeddedOrchestratorFieldBuilder's markers).
public sealed partial class SyncHandler
{
    /// <summary>An embedded island loads its route with markers in a query string
    /// (<c>/documento?_embeddedMediator=1&amp;_inline=1</c>). The route resolves without them; the
    /// markers fold into the component state, where every later request of the island also carries
    /// them (the island's initialData seeds them).</summary>
    private static RunActionRqDto FoldRouteMarkers(RunActionRqDto rq)
    {
        var route = rq.Route ?? "";
        var q = route.IndexOf('?');
        if (q < 0) return rq;
        var state = new Dictionary<string, object?>(rq.ComponentState);
        foreach (var pair in route[(q + 1)..].Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var key = pair.Split('=')[0];
            if (key is ReflectionMapper.EmbeddedMarker or ReflectionMapper.InlineMarker && !state.ContainsKey(key))
                state[key] = true;
        }
        var consumed = rq.ConsumedRoute is { } c && c.IndexOf('?') is var cq and >= 0 ? c[..cq] : rq.ConsumedRoute;
        return rq with { Route = route[..q], ConsumedRoute = consumed, ComponentState = state };
    }

    /// <summary>Whether the request comes from an embedded island, and from an [Inline] one.</summary>
    private static (bool Embedded, bool Inline) IslandFlags(RunActionRqDto rq) =>
        (IsTrue(GetState(rq.ComponentState, ReflectionMapper.EmbeddedMarker)),
         IsTrue(GetState(rq.ComponentState, ReflectionMapper.InlineMarker)));

    private static bool IsTrue(object? raw) => raw switch
    {
        bool b => b,
        JsonElement { ValueKind: JsonValueKind.True } => true,
        JsonElement { ValueKind: JsonValueKind.String } el => el.GetString() is "true" or "1",
        string s => s is "true" or "1",
        _ => false,
    };

    /// <summary>A routed view object returned by an action: rendered in place.</summary>
    private static bool IsRoutedViewResult(object? result) =>
        result is not null and not IComponent and not string
        && result.GetType().GetCustomAttribute<UIAttribute>() is not null
        && result.GetType().GetCustomAttribute<AppAttribute>() is null;

    /// <summary>A request for an adapted type: the model is rebuilt from the state by its adapter
    /// (an empty state on the first load, so the model's initializers survive); an action named by
    /// the adapted view's <see cref="AdaptedView.Actions"/> runs the model method of that camelCase
    /// name and the result maps as any action result (null or the model itself re-renders the
    /// island). (Java: AdapterInstanceFactory + the regular method runner.)</summary>
    private UIIncrementDto HandleAdapted(IComponentAdapter adapter, RunActionRqDto rq)
    {
        var model = adapter.Deserialize(Unwrapped(rq.ComponentState));
        if (!string.IsNullOrEmpty(rq.ActionId))
        {
            var declared = adapter.Adapt(model).Actions ?? [];
            if (!declared.Contains(rq.ActionId))
                return Error($"Action not found: {rq.ActionId}");
            var method = model.GetType()
                .GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance)
                .FirstOrDefault(m => !m.IsSpecialName && Naming.CamelCase(m.Name) == rq.ActionId
                                     && m.DeclaringType != typeof(object));
            if (method is null) return Error($"Action not found: {rq.ActionId}");
            var result = method.Invoke(model, BuildArguments(method, rq));
            if (result is not null && !ReferenceEquals(result, model)) return MapResult(result, rq);
        }
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        var component = _mapper.MapAdapted(model, adapter, route, out var data);
        // the adapter owns the whole UI: no page, so no window title (Java: a component-tree supplier)
        return FragmentResponse(Title(model.GetType()), component, rq, data, emitWindowTitle: false);
    }

    /// <summary>Wire state with JSON scalars unwrapped (string, long, double, bool, null); objects
    /// and arrays stay JsonElement.</summary>
    private static IReadOnlyDictionary<string, object?> Unwrapped(IDictionary<string, object?> state) =>
        state.ToDictionary(kv => kv.Key, kv => kv.Value is JsonElement el ? Unwrap(el) : kv.Value);

    private static object? Unwrap(JsonElement el) => el.ValueKind switch
    {
        JsonValueKind.String => el.GetString(),
        JsonValueKind.Number => el.TryGetInt64(out var l) ? l : el.GetDouble(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Null or JsonValueKind.Undefined => null,
        _ => el.Clone(),
    };
}
