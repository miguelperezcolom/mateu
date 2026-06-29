using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Handles a single POST /mateu/v3/sync/{route} call → a UIIncrement.</summary>
public sealed class SyncHandler(MateuRegistry registry, ITranslator? translator = null)
{
    private readonly ReflectionMapper _mapper = new(translator);

    public UIIncrementDto Handle(RunActionRqDto rq)
    {
        // 1. App shell at the root route.
        if (string.IsNullOrEmpty(rq.ActionId)
            && registry.Resolve(rq.ServerSideType, rq.Route) is { } t0
            && t0.GetCustomAttribute<AppAttribute>() is { } app)
            return RenderApp(t0, app.Title);

        // 2. A Crud (resolved by serverSideType or by route prefix) — list / detail / new / edit + actions.
        if (ResolveCrud(rq) is { } c)
            return HandleCrud(c.Type, c.Element, c.BaseRoute, rq);

        var type = registry.Resolve(rq.ServerSideType, rq.Route);
        if (type is null) return Error($"Route not found: {rq.Route}");

        // 3. A wizard.
        if (typeof(Wizard).IsAssignableFrom(type)) return HandleWizard(type, rq);

        // 4. A plain view.
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        return string.IsNullOrEmpty(rq.ActionId) ? Render(type, instance, rq) : RunAction(type, instance, rq);
    }

    private UIIncrementDto HandleWizard(Type type, RunActionRqDto rq)
    {
        var wizard = Activator.CreateInstance(type)!;
        BindState(wizard, rq.ComponentState);
        var step = StepOf(rq);
        var total = ReflectionMapper.EditableProperties(type)
            .Select(p => p.GetCustomAttribute<StepAttribute>()?.Step ?? 1).DefaultIfEmpty(1).Max();
        var route = "/" + (type.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");

        switch (rq.ActionId)
        {
            case "back": step = Math.Max(1, step - 1); break;
            case "next" when step >= total: return MapResult(((Wizard)wizard).Complete());
            case "next": step++; break;
        }
        return FragmentResponse(Title(type), _mapper.MapWizard(type, wizard, route, step));
    }

    private static int StepOf(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("__step", out var v) && v is JsonElement { ValueKind: JsonValueKind.Number } el
            ? el.GetInt32() : 1;

    // ── CRUD ───────────────────────────────────────────────────────────────────
    private (Type Type, Type Element, string BaseRoute)? ResolveCrud(RunActionRqDto rq)
    {
        if (!string.IsNullOrEmpty(rq.ServerSideType) && registry.Resolve(rq.ServerSideType, null) is { } byName
            && ReflectionMapper.CrudElementType(byName) is { } el1)
            return (byName, el1, "/" + (byName.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? ""));

        if (registry.ResolveByPrefix(rq.Route) is { } pref
            && ReflectionMapper.CrudElementType(pref.Type) is { } el2)
            return (pref.Type, el2, "/" + pref.BaseRoute);

        return null;
    }

    private UIIncrementDto HandleCrud(Type crudType, Type element, string baseRoute, RunActionRqDto rq)
    {
        var crud = Activator.CreateInstance(crudType)!;
        var (mode, id) = ParseCrudRoute(baseRoute, rq.Route);

        return rq.ActionId switch
        {
            "search" => CrudSearch(crud, element, SearchText(rq)),
            "create" or "save" => CrudSave(crud, crudType, element, id, rq, baseRoute),
            "delete" => Navigate(baseRoute, id is null ? null : Delete(crud, id)),
            null or "" => mode switch
            {
                "new" => RenderEntity(crudType, element, New(element), "new", $"{baseRoute}/new"),
                "view" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "view", $"{baseRoute}/{id}"),
                "edit" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "edit", $"{baseRoute}/{id}/edit"),
                _ => RenderCrudList(crudType, crud, baseRoute),
            },
            _ => Error($"Action not found: {rq.ActionId}"),
        };
    }

    private static (string Mode, string? Id) ParseCrudRoute(string baseRoute, string? route)
    {
        var r = "/" + MateuRegistry.Normalize(route);
        var bp = baseRoute.TrimEnd('/');
        var suffix = r.Length > bp.Length && r.StartsWith(bp) ? r[bp.Length..].Trim('/') : "";
        if (suffix == "") return ("list", null);
        if (suffix == "new") return ("new", null);
        var parts = suffix.Split('/');
        return parts.Length >= 2 && parts[1] == "edit" ? ("edit", parts[0]) : ("view", parts[0]);
    }

    private UIIncrementDto RenderCrudList(Type crudType, object crud, string baseRoute) =>
        FragmentResponse(Title(crudType), _mapper.MapView(crudType, crud, baseRoute));

    private UIIncrementDto RenderEntity(Type crudType, Type element, object entity, string mode, string route) =>
        FragmentResponse(Title(crudType), _mapper.MapEntityForm(crudType, element, entity, mode, route));

    private UIIncrementDto CrudSave(object crud, Type crudType, Type element, string? id, RunActionRqDto rq, string baseRoute)
    {
        // Start from the stored entity (so untouched fields survive) and apply the edited fields.
        var entity = id is not null ? GetOrNew(crud, crudType, element, id) : New(element);
        BindState(entity, rq.ComponentState);
        if (id is not null) element.GetProperty("Id")?.SetValue(entity, id);

        var missing = RequiredMissing(entity, element);
        if (missing.Count > 0)
            return Error("Please fill: " + string.Join(", ", missing));

        crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        return Navigate(baseRoute, "Saved");
    }

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

    private static object New(Type element) => Activator.CreateInstance(element)!;

    private static object GetOrNew(object crud, Type crudType, Type element, string? id) =>
        (id is not null ? crudType.GetMethod("Get")!.Invoke(crud, [id]) : null) ?? New(element);

    private static string? Delete(object crud, string id)
    {
        crud.GetType().GetMethod("Delete")!.Invoke(crud, [id]);
        return "Deleted";
    }

    private static List<string> RequiredMissing(object entity, Type element) =>
        ReflectionMapper.EditableProperties(element)
            .Where(p => p.GetCustomAttribute<RequiredAttribute>() != null
                        && string.IsNullOrWhiteSpace(p.GetValue(entity)?.ToString()))
            .Select(p => p.GetCustomAttribute<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))
            .ToList();

    // ── Plain views ─────────────────────────────────────────────────────────────
    private UIIncrementDto RenderApp(Type appType, string title) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", _mapper.MapApp(appType), null, null, "Replace", null)]);

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq)
    {
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        return FragmentResponse(Title(type), _mapper.MapView(type, instance, route));
    }

    private static UIIncrementDto RunAction(Type type, object instance, RunActionRqDto rq)
    {
        var method = type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(m => !m.IsSpecialName && Naming.CamelCase(m.Name) == rq.ActionId);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        return MapResult(method.Invoke(instance, []));
    }

    private static UIIncrementDto MapResult(object? result) => result switch
    {
        Message msg => UIIncrementDto.Of(messages:
            [new MessageDto(msg.Variant.ToString().ToLowerInvariant(), "middle", msg.Title, msg.Text, msg.Duration)]),
        _ => UIIncrementDto.Of(),
    };

    // ── Helpers ──────────────────────────────────────────────────────────────────
    private static string Title(Type type) =>
        type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

    private static UIIncrementDto FragmentResponse(string title, ComponentDto component) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", component, null, null, "Replace", null)]);

    private static UIIncrementDto Navigate(string route, string? successText) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "NavigateTo", route)],
            messages: successText is null ? [] : [new MessageDto("success", "middle", "", successText, 3000)]);

    private static UIIncrementDto Error(string text) =>
        UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", text, 5000)]);

    private static string? SearchText(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("searchText", out var v) && v is JsonElement { ValueKind: JsonValueKind.String } el
            ? el.GetString()
            : null;

    private static object? CellValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };

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
            if (target == typeof(DateOnly)) return DateOnly.Parse(el.GetString() ?? "");
            if (target == typeof(DateTime)) return DateTime.Parse(el.GetString() ?? "");
            if (target.IsEnum) return Enum.Parse(target, el.GetString() ?? "", ignoreCase: true);
            return el.Deserialize(target);
        }
        catch
        {
            return null;
        }
    }
}
