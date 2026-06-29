using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Turns an annotated C# view instance into the Mateu component tree (App→Page→Card→…→FormField).</summary>
public sealed class ReflectionMapper(ITranslator? translator = null)
{
    /// <summary>Translates a user-facing string when a translator is registered, else returns it unchanged.</summary>
    private string T(string s) => translator?.Translate(s) ?? s;

    /// <summary>OnCustomEvent triggers (from [SubscribeTo]) and the [Emits] name for a view type.</summary>
    private static (List<object> Triggers, string? EmitsName) EventsOf(Type type)
    {
        var triggers = type.GetCustomAttributes<SubscribeToAttribute>()
            .Select(s => (object)new CustomTriggerDto(s.Event, s.Action)).ToList();
        return (triggers, type.GetCustomAttribute<EmitsAttribute>()?.Name);
    }

    /// <summary>Builds the App shell (header + menu) from an [App] class's [MenuItem] methods.</summary>
    public ClientSideComponentDto MapApp(Type appType)
    {
        var app = appType.GetCustomAttribute<AppAttribute>()!;
        var items = appType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<MenuItemAttribute>() != null)
            .Select(MapMenuItem).ToList();
        var variant = items.Count > 7 ? "HAMBURGUER_MENU" : "MENU_ON_LEFT";
        var home = items.FirstOrDefault();
        var meta = new AppMetadataDto(T(app.Title), variant, items)
        {
            HomeRoute = home?.Route ?? "",
            HomeConsumedRoute = home?.ConsumedRoute ?? "",
            HomeServerSideType = home?.ServerSideType ?? "",
            ServerSideType = appType.FullName!,
        };
        return new ClientSideComponentDto(meta, "ux_main_app", [], null, null, null);
    }

    private MenuItemDto MapMenuItem(MethodInfo m)
    {
        var viewType = m.ReturnType;
        var route = "/" + (viewType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");
        var label = m.GetCustomAttribute<MenuItemAttribute>()?.Label
                    ?? viewType.GetCustomAttribute<TitleAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new MenuItemDto(T(label), route, viewType.FullName!) { ConsumedRoute = route };
    }

    public ServerSideComponentDto MapView(Type type, object instance, string route)
    {
        var crudElement = CrudElementType(type);
        if (crudElement is not null) return MapCrud(type, crudElement, route);

        var title = T(type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name));

        var buttons = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<ButtonAttribute>() != null)
            .Select(MapButton).ToList();
        var actions = buttons.Select(b => new ActionDto(b.ActionId)).ToList();

        var page = Client(new PageMetadataDto(
            title, title, OptT(type.GetCustomAttribute<SubtitleAttribute>()?.Value), [], buttons)
        {
            Banners = Banners(type, instance),
            Badges = Badges(type, instance),
        }, null, FormCards(type, instance));

        var (triggers, emits) = EventsOf(type);
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            [page], new Dictionary<string, object?>(), actions, triggers, null, null, null)
        {
            EmitsName = emits,
        };
    }

    private string? OptT(string? s) => s is null ? null : T(s);

    private static List<BannerDto> Banners(Type type, object instance) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<BannerAttribute>() != null)
            .Select(m =>
            {
                var a = m.GetCustomAttribute<BannerAttribute>()!;
                var desc = m.ReturnType == typeof(string) ? m.Invoke(instance, [])?.ToString() : null;
                return new BannerDto(a.Theme.ToString().ToUpperInvariant(), a.Title, desc);
            })
            .ToList();

    private static List<BadgeDto> Badges(Type type, object instance) =>
        EditableProperties(type)
            .Where(p => p.GetCustomAttribute<HeaderBadgeAttribute>() != null)
            .Select(p => (text: p.GetValue(instance)?.ToString(), color: p.GetCustomAttribute<HeaderBadgeAttribute>()!.Color))
            .Where(x => !string.IsNullOrWhiteSpace(x.text))
            .Select(x => new BadgeDto(x.text!, x.color))
            .ToList();

    /// <summary>A wizard step: title + progress bar + the current step's fields + Back/Next. The state
    /// (__step + all field values) rides in initialData so it round-trips through componentState.</summary>
    public ServerSideComponentDto MapWizard(Type type, object instance, string route, int step)
    {
        var stepProps = EditableProperties(type)
            .Select(p => (p, step: p.GetCustomAttribute<StepAttribute>()?.Step ?? 1))
            .ToList();
        var total = stepProps.Count == 0 ? 1 : stepProps.Max(x => x.step);
        var current = Math.Clamp(step, 1, total);
        var fields = stepProps.Where(x => x.step == current).Select(x => MapField(x.p, instance)).ToList();

        var title = type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);
        var titleText = Client(new TextMetadataDto(title), null, []);
        var progress = Client(new ProgressBarMetadataDto((double)current / total), "fieldId", []);
        var card = Client(new CardMetadataDto(Client(new FormLayoutMetadataDto(), null, FormRows(fields))), "fieldId", []);
        var back = Client(new ButtonMetadataDto("Back", "back") { Disabled = current == 1 }, null, []);
        var next = Client(new ButtonMetadataDto(current == total ? "Finish" : "Next", "next") { ButtonStyle = "Primary" }, null, []);
        var bar = Client(new HorizontalLayoutMetadataDto(), null, [back, next]);
        var layout = Client(new VerticalLayoutMetadataDto { Spacing = true }, null, [titleText, progress, card, bar]);

        var initial = new Dictionary<string, object?> { ["__step"] = current };
        foreach (var (p, _) in stepProps) initial[Naming.CamelCase(p.Name)] = FormatValue(p.GetValue(instance));

        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route, [layout], initial, [], [], null, null, null);
    }

    /// <summary>Detail/edit/new form for a single CRUD entity, with a mode-specific toolbar.</summary>
    public ServerSideComponentDto MapEntityForm(Type crudType, Type element, object entity, string mode, string route)
    {
        var title = crudType.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(element.Name);
        IReadOnlyList<ButtonDto> toolbar = mode switch
        {
            "view" => [new("Back to list", "cancel-view"), new("Edit", "edit"), new("Add another", "new")],
            "edit" => [new("Cancel", "cancel-edit"), new("Save", "create") { ButtonStyle = "Primary" }],
            _ /* new */ => [new("Cancel", "cancel-new"), new("Save", "create") { ButtonStyle = "Primary" }],
        };
        var page = Client(new PageMetadataDto(title, title, null, toolbar, []), null,
            FormCards(element, entity, readOnly: mode == "view"));
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), crudType.FullName!, route, [page],
            new Dictionary<string, object?>(), [], [], null, null, null);
    }

    // Groups fields by [Section] into cards (one plain card when there are no sections).
    private List<ComponentDto> FormCards(Type type, object instance, bool readOnly = false)
    {
        var sections = new List<(string? title, List<ClientSideComponentDto> fields)>();
        string? current = null;
        foreach (var p in EditableProperties(type))
        {
            if (p.GetCustomAttribute<SectionAttribute>()?.Caption is { } s) current = s;
            if (sections.Count == 0 || sections[^1].title != current)
                sections.Add((current, new List<ClientSideComponentDto>()));
            sections[^1].fields.Add(MapField(p, instance, readOnly));
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

    private ClientSideComponentDto MapField(PropertyInfo p, object instance, bool readOnly = false)
    {
        var fieldId = Naming.CamelCase(p.Name);
        var label = T(p.GetCustomAttribute<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        var required = p.GetCustomAttribute<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        var options = t.IsEnum
            ? Enum.GetNames(t).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList()
            : new List<OptionDto>();
        var value = p.GetValue(instance);

        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t), label)
        {
            Required = required,
            ReadOnly = readOnly,
            Options = options,
            InitialValue = FormatValue(value),
        };
        return Client(meta, fieldId, []);
    }

    private static string? FormatValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        _ => value.ToString(),
    };

    private ButtonDto MapButton(MethodInfo m)
    {
        var label = m.GetCustomAttribute<ButtonAttribute>()?.Label
                    ?? m.GetCustomAttribute<LabelAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new ButtonDto(T(label), Naming.CamelCase(m.Name));
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
