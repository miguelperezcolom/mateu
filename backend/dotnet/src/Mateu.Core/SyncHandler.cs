using System.Reflection;
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Handles a single POST /mateu/v3/sync/{route} call → a UIIncrement.</summary>
public sealed class SyncHandler(MateuRegistry registry)
{
    private readonly ReflectionMapper _mapper = new();

    public UIIncrementDto Handle(RunActionRqDto rq)
    {
        var type = registry.Resolve(rq.ServerSideType, rq.Route);
        if (type is null)
            return Error($"Route not found: {rq.Route}");

        if (type.GetCustomAttribute<AppAttribute>() is { } app && string.IsNullOrEmpty(rq.ActionId))
            return RenderApp(type, app.Title);

        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);

        return string.IsNullOrEmpty(rq.ActionId)
            ? Render(type, instance, rq)
            : RunAction(type, instance, rq);
    }

    private UIIncrementDto RenderApp(Type appType, string title) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", _mapper.MapApp(appType), null, null, "Replace", null)]);

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq)
    {
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        var component = _mapper.MapView(type, instance, route);
        var title = type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);
        return UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", component, null, null, "Replace", null)]);
    }

    private static UIIncrementDto RunAction(Type type, object instance, RunActionRqDto rq)
    {
        var actionId = rq.ActionId!;
        var element = ReflectionMapper.CrudElementType(type);
        if (element is not null && actionId == "search")
            return CrudSearch(instance, element, SearchText(rq));

        var method = type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(m => !m.IsSpecialName && Naming.CamelCase(m.Name) == actionId);
        if (method is null) return Error($"Action not found: {actionId}");

        var result = method.Invoke(instance, []);
        return MapResult(result);
    }

    private static string? SearchText(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("searchText", out var v) && v is JsonElement { ValueKind: JsonValueKind.String } el
            ? el.GetString()
            : null;

    /// <summary>Runs a Crud's Fetch and returns the rows as a data-only fragment the renderer's table consumes.</summary>
    private static UIIncrementDto CrudSearch(object instance, Type element, string? search)
    {
        var items = (System.Collections.IEnumerable)instance.GetType().GetMethod("Fetch")!.Invoke(instance, [search])!;
        var props = ReflectionMapper.EditableProperties(element).ToList();
        var rows = new List<Dictionary<string, object?>>();
        foreach (var item in items)
        {
            var row = new Dictionary<string, object?>();
            foreach (var p in props) row[Naming.CamelCase(p.Name)] = CellValue(p.GetValue(item));
            rows.Add(row);
        }
        var data = new { crud = new { page = new { content = rows, pageSize = rows.Count, pageNumber = 0, totalElements = rows.Count } } };
        return UIIncrementDto.Of(fragments: [new UIFragmentDto("crud", null, null, data, "Replace", null)]);
    }

    private static object? CellValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };

    private static UIIncrementDto MapResult(object? result) => result switch
    {
        Message msg => UIIncrementDto.Of(messages:
            [new MessageDto(msg.Variant.ToString().ToLowerInvariant(), "middle", msg.Title, msg.Text, msg.Duration)]),
        _ => UIIncrementDto.Of(),
    };

    private static UIIncrementDto Error(string text) =>
        UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", text, 5000)]);

    private static void BindState(object instance, IDictionary<string, object?> state)
    {
        foreach (var p in ReflectionMapper.EditableProperties(instance.GetType()))
        {
            var key = Naming.CamelCase(p.Name);
            if (!state.TryGetValue(key, out var raw) || raw is null) continue;
            var value = ConvertValue(raw, p.PropertyType);
            if (value is not null) p.SetValue(instance, value);
        }
    }

    private static object? ConvertValue(object raw, Type target)
    {
        target = Nullable.GetUnderlyingType(target) ?? target;
        if (raw is not JsonElement el) return raw;
        try
        {
            if (el.ValueKind is JsonValueKind.Null) return null;
            if (target == typeof(string)) return el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
            if (target == typeof(bool)) return el.GetBoolean();
            if (target == typeof(int)) return el.GetInt32();
            if (target == typeof(long)) return el.GetInt64();
            if (target == typeof(double)) return el.GetDouble();
            if (target == typeof(decimal)) return el.GetDecimal();
            if (target.IsEnum) return Enum.Parse(target, el.GetString() ?? "", ignoreCase: true);
            return el.Deserialize(target);
        }
        catch
        {
            return null;
        }
    }
}
