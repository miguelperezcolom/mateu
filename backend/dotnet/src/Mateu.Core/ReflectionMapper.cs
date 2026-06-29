using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Turns an annotated C# view instance into the Mateu component tree (App→Page→Card→…→FormField).</summary>
public sealed class ReflectionMapper
{
    /// <summary>Builds the App shell (header + menu) from an [App] class's [MenuItem] methods.</summary>
    public ClientSideComponentDto MapApp(Type appType)
    {
        var app = appType.GetCustomAttribute<AppAttribute>()!;
        var items = appType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<MenuItemAttribute>() != null)
            .Select(MapMenuItem).ToList();
        var variant = items.Count > 7 ? "HAMBURGUER_MENU" : "MENU_ON_LEFT";
        var home = items.FirstOrDefault();
        var meta = new AppMetadataDto(app.Title, variant, items)
        {
            HomeRoute = home?.Route ?? "",
            HomeConsumedRoute = home?.ConsumedRoute ?? "",
            HomeServerSideType = home?.ServerSideType ?? "",
            ServerSideType = appType.FullName!,
        };
        return new ClientSideComponentDto(meta, "ux_main_app", [], null, null, null);
    }

    private static MenuItemDto MapMenuItem(MethodInfo m)
    {
        var viewType = m.ReturnType;
        var route = "/" + (viewType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");
        var label = m.GetCustomAttribute<MenuItemAttribute>()?.Label
                    ?? viewType.GetCustomAttribute<TitleAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new MenuItemDto(label, route, viewType.FullName!) { ConsumedRoute = route };
    }

    public ServerSideComponentDto MapView(Type type, object instance, string route)
    {
        var crudElement = CrudElementType(type);
        if (crudElement is not null) return MapCrud(type, crudElement, route);

        var title = type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

        var buttons = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<ButtonAttribute>() != null)
            .Select(MapButton).ToList();
        var actions = buttons.Select(b => new ActionDto(b.ActionId)).ToList();

        var page = Client(new PageMetadataDto(title, title, null, [], buttons), null, FormCards(type, instance));

        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            [page], new Dictionary<string, object?>(), actions, [], null, null, null);
    }

    // Groups fields by [Section] into cards (one plain card when there are no sections).
    private List<ComponentDto> FormCards(Type type, object instance)
    {
        var sections = new List<(string? title, List<ClientSideComponentDto> fields)>();
        string? current = null;
        foreach (var p in EditableProperties(type))
        {
            if (p.GetCustomAttribute<SectionAttribute>()?.Caption is { } s) current = s;
            if (sections.Count == 0 || sections[^1].title != current)
                sections.Add((current, new List<ClientSideComponentDto>()));
            sections[^1].fields.Add(MapField(p, instance));
        }
        return sections.Select(s => (ComponentDto)SectionCard(s.title, s.fields)).ToList();
    }

    private ClientSideComponentDto SectionCard(string? title, List<ClientSideComponentDto> fields)
    {
        var formLayout = Client(new FormLayoutMetadataDto(), null, FormRows(fields));
        if (title is not null)
            return Client(new FormSectionMetadataDto(title), null, [formLayout]);
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [formLayout]);
        var div = Client(new DivMetadataDto(), "fieldId", [vlayout]);
        return Client(new CardMetadataDto(div), "fieldId", []);
    }

    /// <summary>If <paramref name="type"/> derives from Crud&lt;T&gt;, returns T; else null.</summary>
    internal static Type? CrudElementType(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Crud<>))
                return t.GetGenericArguments()[0];
        return null;
    }

    private ServerSideComponentDto MapCrud(Type viewType, Type element, string route)
    {
        var title = viewType.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(viewType.Name);
        var columns = EditableProperties(element)
            .Select(p => new GridColumnDto(new GridColumnMetaDto(
                Naming.CamelCase(p.Name),
                p.GetCustomAttribute<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))))
            .ToList();
        var toolbar = new List<ButtonDto> { new("New", "new"), new("Delete", "delete") };
        var crud = Client(new CrudMetadataDto(title, columns, toolbar), "crud", []);
        var page = Client(new PageMetadataDto(null, null, null, [], []), null, [crud]);
        var actions = new List<ActionDto> { new("search"), new("new"), new("delete") };
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), viewType.FullName!, route, [page],
            new Dictionary<string, object?>(), actions, [new TriggerDto("OnLoad", "search")], null, null, null);
    }

    internal static IEnumerable<PropertyInfo> EditableProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true });

    private static ClientSideComponentDto MapField(PropertyInfo p, object instance)
    {
        var fieldId = Naming.CamelCase(p.Name);
        var label = p.GetCustomAttribute<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name);
        var required = p.GetCustomAttribute<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        var options = t.IsEnum
            ? Enum.GetNames(t).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList()
            : new List<OptionDto>();
        var value = p.GetValue(instance);

        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t), label)
        {
            Required = required,
            Options = options,
            InitialValue = value is null ? null : value.ToString(),
        };
        return Client(meta, fieldId, []);
    }

    private static ButtonDto MapButton(MethodInfo m)
    {
        var label = m.GetCustomAttribute<ButtonAttribute>()?.Label
                    ?? m.GetCustomAttribute<LabelAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new ButtonDto(label, Naming.CamelCase(m.Name));
    }

    // Group fields into FormRow components of at most `maxColumns` (here 2).
    private static List<ComponentDto> FormRows(List<ClientSideComponentDto> fields, int maxColumns = 2)
    {
        var rows = new List<ComponentDto>();
        for (var i = 0; i < fields.Count; i += maxColumns)
            rows.Add(Client(new FormRowMetadataDto(), null, fields.Skip(i).Take(maxColumns).Cast<ComponentDto>().ToList()));
        return rows;
    }

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id, IReadOnlyList<ComponentDto> children) =>
        new(meta, id, children, null, null, null);

    private static string InferDataType(Type t) => t switch
    {
        _ when t.IsEnum => "string",
        _ when t == typeof(bool) => "boolean",
        _ when t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) => "integer",
        _ when t == typeof(float) || t == typeof(double) || t == typeof(decimal) => "number",
        _ when t == typeof(DateOnly) || t == typeof(DateTime) => "date",
        _ => "string",
    };
}
