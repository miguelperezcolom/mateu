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
        var fabs = Fabs(type);
        // Both [Button] and [Fab] methods are server-side actions the renderer can invoke.
        var actions = buttons.Select(b => new ActionDto(b.ActionId))
            .Concat(fabs.Select(f => new ActionDto(f.ActionId))).ToList();

        // A component-tree view (an archetype like Dashboard/Foldout, or any IComponentTreeSupplier)
        // renders its fluent tree as the page content; actionIds referenced by the tree (metric-card
        // drill-ins, empty-state CTAs, welcome buttons) are advertised so the renderer routes them back.
        List<ComponentDto> content;
        if (instance is IComponentTreeSupplier supplier)
        {
            var tree = supplier.Component();
            content = [ComponentMapper.Map(tree)];
            actions.AddRange(ComponentMapper.CollectActionIds(tree)
                .Where(a => actions.All(x => x.Id != a)).Select(a => new ActionDto(a)));
        }
        else
        {
            // A [ReadOnly] class renders as a display view (fields read-only, tabs inference may apply).
            content = FormCards(type, instance, type.GetCustomAttribute<ReadOnlyAttribute>() != null);
        }

        var compact = type.GetCustomAttribute<CompactAttribute>() != null;
        var pageMeta = new PageMetadataDto(
            title, title, OptT(type.GetCustomAttribute<SubtitleAttribute>()?.Value), [], buttons)
        {
            Banners = Banners(type, instance),
            Badges = Badges(type, instance),
            Kpis = Kpis(type, instance),
            Fabs = fabs,
        };
        var page = new ClientSideComponentDto(
            pageMeta, null, content, compact ? "--mateu-compact:1" : null, null, null);

        var (triggers, emits) = EventsOf(type);
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            [page], new Dictionary<string, object?>(), actions, triggers, null, null, null)
        {
            EmitsName = emits,
            ConfirmOnNavigationIfDirty = type.GetCustomAttribute<ConfirmOnNavigationIfDirtyAttribute>() != null,
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

    // Groups fields by [Section] into cards (one plain card when there are no sections), or into a
    // TabLayout when any field carries [Tab]. Under [AutoLayout] the inference decision table
    // (LayoutInference, ported from the Java reference) may regroup them: a heavy unstructured
    // editable form folds its optional fields into a "More options" accordion, and a heavy
    // read-only view with many sections is presented as adaptable tabs.
    private List<ComponentDto> FormCards(Type type, object instance, bool readOnly = false)
    {
        var props = EditableProperties(type).ToList();
        if (props.Any(p => p.GetCustomAttribute<TabAttribute>() != null))
            return [TabLayout(type, props, instance, readOnly)];

        var sections = new List<(string? Title, List<PropertyInfo> Props)>();
        string? current = null;
        foreach (var p in props)
        {
            if (p.GetCustomAttribute<SectionAttribute>()?.Caption is { } s) current = s;
            if (sections.Count == 0 || sections[^1].Title != current)
                sections.Add((current, new List<PropertyInfo>()));
            sections[^1].Props.Add(p);
        }

        // Read-only view with many substantial sections: present the sections as adaptable tabs.
        if (sections.Count > 1 && LayoutInference.PreferTabs(type, sections, readOnly))
            return [TabsFromSections(sections, instance, readOnly)];

        // Heavy unstructured editable form: required fields stay visible, optionals fold away.
        if (sections.Count == 1
            && LayoutInference.BuildFoldPlan(type, sections[0].Title, sections[0].Props, readOnly) is { } plan)
            return [FoldedCard(plan, instance)];

        return sections.Select(s => (ComponentDto)SectionCard(
            s.Title, s.Props.Select(p => MapField(p, instance, readOnly)).ToList())).ToList();
    }

    // Groups consecutive fields sharing the same [Tab] name into the tabs of a single TabLayout.
    // Developer-declared tabs always carry the alternative group semantics; they are adaptable
    // (renderers may degrade them to an accordion) only when the class opted into [AutoLayout].
    private ComponentDto TabLayout(Type type, List<PropertyInfo> props, object instance, bool readOnly)
    {
        var tabs = new List<(string name, bool open, List<ClientSideComponentDto> fields)>();
        var current = "Tab";
        foreach (var p in props)
        {
            var attr = p.GetCustomAttribute<TabAttribute>();
            if (attr?.Name is { } n) current = n;
            if (tabs.Count == 0 || tabs[^1].name != current)
                // The field that opens a group carries its [Tab(Open=...)] flag (mirrors the Java
                // pair.first().open() rule); fields before any [Tab] fall into the default group.
                tabs.Add((current, attr?.Open ?? false, new List<ClientSideComponentDto>()));
            tabs[^1].fields.Add(MapField(p, instance, readOnly));
        }
        // The tab selected on first render is the first one flagged Open, else the first tab.
        var activeIndex = Math.Max(0, tabs.FindIndex(tb => tb.open));
        var tabComps = tabs.Select((tb, i) => (ComponentDto)Client(
            new TabMetadataDto(T(tb.name)) { Active = i == activeIndex }, null,
            [Client(new FormLayoutMetadataDto(), null, FormRows(tb.fields))])).ToList();
        var meta = new TabLayoutMetadataDto
        {
            GroupRelationship = "alternative",
            Adaptable = LayoutInference.Enabled(type),
        };
        return Client(meta, "_tabs", tabComps);
    }

    /// <summary>The sections-to-tabs inference presentation: one tab per section, labeled with the
    /// section title. The tab layout carries the group semantics and is marked adaptable so
    /// renderers may degrade it to an accordion on narrow viewports.</summary>
    private ComponentDto TabsFromSections(
        List<(string? Title, List<PropertyInfo> Props)> sections, object instance, bool readOnly)
    {
        var tabs = sections.Select((s, i) => (ComponentDto)Client(
            new TabMetadataDto(T(s.Title ?? "")) { Active = i == 0 }, null,
            [Client(new FormLayoutMetadataDto(), null,
                FormRows(s.Props.Select(p => MapField(p, instance, readOnly)).ToList()))])).ToList();
        var meta = new TabLayoutMetadataDto { GroupRelationship = "alternative", Adaptable = true };
        return Client(meta, "_tabs", tabs);
    }

    /// <summary>The fold-optionals inference presentation: the required fields' form layout stays
    /// visible and the optional fields collapse into a single "More options" accordion panel
    /// underneath, inside the usual untitled section card.</summary>
    private ClientSideComponentDto FoldedCard(LayoutInference.FoldPlan plan, object instance)
    {
        var main = Client(new FormLayoutMetadataDto(), null,
            FormRows(plan.Main.Select(p => MapField(p, instance)).ToList()));
        var folded = Client(new FormLayoutMetadataDto(), null,
            FormRows(plan.Folded.Select(p => MapField(p, instance)).ToList()));
        var panel = Client(new AccordionPanelMetadataDto(LayoutInference.MoreOptionsLabel), null, [folded]);
        var accordion = Client(new AccordionLayoutMetadataDto(), null, [panel]);
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [main, accordion]);
        var div = Client(new DivMetadataDto(), "fieldId", [vlayout]);
        return Client(new CardMetadataDto(div), "fieldId", []);
    }

    /// <summary>KPI cards from [Kpi] methods (the title is the attribute, the value is the call result).</summary>
    private static List<KpiDto> Kpis(Type type, object instance) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<KpiAttribute>() != null && m.GetParameters().Length == 0)
            .Select(m => new KpiDto(m.GetCustomAttribute<KpiAttribute>()!.Title, m.Invoke(instance, [])?.ToString() ?? ""))
            .ToList();

    /// <summary>Floating action buttons from [Fab] methods (the method name is the action id).</summary>
    private static List<FabDto> Fabs(Type type) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<FabAttribute>() != null)
            .Select(m =>
            {
                var a = m.GetCustomAttribute<FabAttribute>()!;
                return new FabDto(a.Icon, Naming.CamelCase(m.Name)) { Label = a.Label, Order = a.Order };
            })
            .OrderBy(f => f.Order)
            .ToList();

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

        // A [PlainText] field — or any field of a [PlainText] class — renders as read-only text.
        var plainText = p.GetCustomAttribute<PlainTextAttribute>() != null
                        || p.DeclaringType?.GetCustomAttribute<PlainTextAttribute>() != null;
        var multiline = p.GetCustomAttribute<MultilineAttribute>() != null;
        var stereotype = StereotypeOf(p, plainText, multiline);

        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t, p), label)
        {
            Stereotype = stereotype,
            Required = required,
            ReadOnly = readOnly || plainText,
            Multiline = multiline,
            Options = options,
            InitialValue = FormatValue(value),
            Link = LinkOf(p, instance),
        };
        return Client(meta, fieldId, []);
    }

    /// <summary>The field's nav link: an <see cref="ILinkSupplier"/> on the view wins; when it
    /// returns null the [LinkTo] attribute applies; no link → null. Href/title travel verbatim —
    /// ${...} templates are interpolated client-side, never on the server.</summary>
    private static NavLinkDto? LinkOf(PropertyInfo p, object instance)
    {
        if ((instance as ILinkSupplier)?.Link(p.Name) is { } supplied)
            return new NavLinkDto(supplied.Href, supplied.Icon, supplied.Title, supplied.Target);
        if (p.GetCustomAttribute<LinkToAttribute>() is { } linkTo)
            return new NavLinkDto(linkTo.Href, linkTo.Icon, linkTo.Title, linkTo.Target);
        return null;
    }

    /// <summary>The field stereotype: explicit [Stereotype] wins, else [Multiline]/[Password]/[Money]
    /// map to their names, else plain-text context yields "plainText", else enums render as a
    /// dropdown ("select") — or as "radio" when [UseRadioButtons] or the small-enum inference rule
    /// applies — else "regular".</summary>
    private static string StereotypeOf(PropertyInfo p, bool plainText, bool multiline)
    {
        if (p.GetCustomAttribute<StereotypeAttribute>()?.Value is { } s) return s;
        if (p.GetCustomAttribute<PasswordAttribute>() != null) return "password";
        if (p.GetCustomAttribute<MoneyAttribute>() != null) return plainText ? "plainText" : "money";
        if (plainText) return "plainText";
        if ((Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType).IsEnum)
            return p.GetCustomAttribute<UseRadioButtonsAttribute>() != null || LayoutInference.PreferRadio(p)
                ? "radio"
                : "select";
        if (multiline) return "textarea";
        return "regular";
    }

    /// <summary>The stereotype a field renders with, including its plain-text context — the weight
    /// unit LayoutInference measures thresholds in.</summary>
    internal static string EffectiveStereotype(PropertyInfo p)
    {
        var plainText = p.GetCustomAttribute<PlainTextAttribute>() != null
                        || p.DeclaringType?.GetCustomAttribute<PlainTextAttribute>() != null;
        return StereotypeOf(p, plainText, p.GetCustomAttribute<MultilineAttribute>() != null);
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
        return new ButtonDto(T(label), Naming.CamelCase(m.Name))
        {
            Shortcut = m.GetCustomAttribute<ShortcutAttribute>()?.Keys,
        };
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

    private static string InferDataType(Type t, PropertyInfo? p = null) => p?.GetCustomAttribute<MoneyAttribute>() != null ? "money" : t switch
    {
        _ when t.IsEnum => "string",
        _ when t == typeof(bool) => "boolean",
        _ when t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) => "integer",
        _ when t == typeof(float) || t == typeof(double) || t == typeof(decimal) => "number",
        _ when t == typeof(DateOnly) || t == typeof(DateTime) => "date",
        _ => "string",
    };
}
