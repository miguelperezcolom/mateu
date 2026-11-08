using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Editable views and master-detail views (Java: EditableView / AutoEditableView / MasterDetailView,
// MultiView mediators there). This port renders their pages directly, like its Crud<T>, with Java's
// toolbar and action ids.
internal sealed partial class ReflectionMapper
{
    // ── Editable views ─────────────────────────────────────────────────────────

    /// <summary>Whether <paramref name="type"/> is an editable view.</summary>
    internal static bool IsEditableView(Type type) => typeof(IEditableView).IsAssignableFrom(type) && !type.IsAbstract;

    /// <summary>A read-only editable view: the class's [ReadOnly] (directly or composed) or its own ReadOnly.</summary>
    internal static bool EditableViewReadOnly(Type type, IEditableView view) =>
        view.ReadOnly || type.Find<ReadOnlyAttribute>() is not null;

    /// <summary>The actions an editable view claims (Java's EditableView.actions): a read-only one
    /// only <c>cancel-edit</c>; otherwise <c>edit</c>, <c>save</c> (validated) and <c>cancel-edit</c>.</summary>
    internal static List<ActionDto> EditableViewActions(Type type, IEditableView view) =>
        EditableViewReadOnly(type, view)
            ? [new ActionDto("cancel-edit", ValidationRequired: false)]
            :
            [
                new ActionDto("edit", ValidationRequired: false),
                new ActionDto("save", ValidationRequired: true),
                new ActionDto("cancel-edit", ValidationRequired: false),
            ];

    /// <summary>The view's own context (its writable scalar properties): seeded into the page state
    /// so every later request of the page binds it back (Java hydrates the orchestrator's fields).</summary>
    private static Dictionary<string, object?> ContextOf(object owner)
    {
        var context = new Dictionary<string, object?>();
        foreach (var p in owner.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!p.CanRead || !p.CanWrite || p.GetIndexParameters().Length > 0) continue;
            var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
            if (t != typeof(string) && !t.IsPrimitive && !t.IsEnum && t != typeof(decimal)) continue;
            if (p.GetValue(owner) is { } value) context[Naming.CamelCase(p.Name)] = t.IsEnum ? value.ToString() : value;
        }
        return context;
    }

    /// <summary>The view page (<paramref name="mode"/> <c>view</c>) or the edit page (<c>edit</c>) of
    /// an editable view: the model's form (read-only on the view page, or the model's own detail
    /// content) under a page titled after the model, with Java's toolbar — <b>Edit</b> on the view
    /// page (not for a read-only view), <b>Cancel</b> (<c>cancel-edit</c>) + <b>Save</b> (<c>save</c>)
    /// on the edit page. The component's serverSideType is the EDITABLE VIEW, so its actions come
    /// back to it. An [Inline] island drops the badges/kpis, demotes the title and the card of a
    /// single-section form (Java's EditableView.isInline).</summary>
    internal ServerSideComponentDto MapEditableViewPage(Type viewType, IEditableView view, object model, string mode,
        string route, bool embedded, bool inline)
    {
        var modelType = model.GetType();
        var readOnly = EditableViewReadOnly(viewType, view);
        var toolbar = mode == "edit"
            ? new List<ButtonDto>
            {
                new(T("Cancel"), "cancel-edit") { ButtonStyle = "tertiary" },
                new(T("Save"), "save") { ButtonStyle = "primary" },
            }
            : readOnly ? [] : new List<ButtonDto> { new(T("Edit"), "edit") };
        var content = DetailContent(model, mode) ?? FormCards(modelType, model, readOnly: mode == "view");
        if (inline) content = UnwrapSingleSectionCard(content);
        var page = Client(new PageMetadataDto(TitleOf(modelType, model), null, null, toolbar, [])
        {
            Level = inline ? 1 : 0,
            Badges = inline ? [] : Badges(modelType, model),
            Kpis = inline || mode == "edit" ? [] : Kpis(modelType, model),
            TitleIsText = TitledByData(modelType, model) ? true : null,
        }, null, content);
        var initialData = ContextOf(view);
        foreach (var kv in InitialDataOf(modelType, model)) initialData[kv.Key] = kv.Value;
        if (embedded) initialData[EmbeddedMarker] = true;
        if (inline) initialData[InlineMarker] = true;
        var actions = FieldActions(modelType);
        actions.AddRange(EditableViewActions(viewType, view).Where(a => actions.All(x => x.Id != a.Id)));
        var (triggers, emits) = EventsOf(modelType);
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), viewType.FullName!, route, [page], initialData, actions, triggers,
            "width: 100%;", null, null)
        {
            EmitsName = emits,
            Rules = MapRules(modelType, model),
            Validations = mode == "edit" ? MapValidations(modelType) : [],
            PageType = mode == "edit" ? "form" : "detail",
            // the editor guards what was typed, like any create/edit form
            ConfirmOnNavigationIfDirty = mode == "edit",
        };
    }

    // ── [ViewToolbarButton] on a crud's record view ────────────────────────────

    /// <summary>The prefix of a crud record view's own toolbar actions (Java's RecordToolbarActions.PREFIX).</summary>
    internal const string ActionOnViewPrefix = "action-on-view-";

    /// <summary>The crud's [ViewToolbarButton] methods visible to the caller, in declaration order.</summary>
    internal List<MethodInfo> ViewToolbarMethods(Type crudType) =>
        crudType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => !m.IsSpecialName && m.Find<ViewToolbarButtonAttribute>() is not null && Visible(m))
            .OrderBy(m => m.MetadataToken)
            .ToList();

    /// <summary>The view page's [ViewToolbarButton] buttons (label: [Toolbar(label)] > [Label] >
    /// the humanized name; style from [Toolbar(ButtonStyle)]) — Java's ViewToolbarBuilder.</summary>
    internal List<ButtonDto> ViewToolbarButtons(Type crudType) =>
        ViewToolbarMethods(crudType).Select(m =>
        {
            var toolbar = m.Find<ToolbarAttribute>();
            var label = toolbar?.Label ?? m.Find<LabelAttribute>()?.Value ?? Naming.Humanize(m.Name);
            return new ButtonDto(T(label), ActionOnViewPrefix + Naming.CamelCase(m.Name))
            {
                ButtonStyle = string.IsNullOrWhiteSpace(toolbar?.ButtonStyle) || toolbar!.ButtonStyle == "none"
                    ? null : toolbar.ButtonStyle,
                Disabled = !Authorized(m.Find<DisabledUnlessAttribute>()),
            };
        }).ToList();

    /// <summary>Their actions, advertised with the attribute's confirmation (Java's CrudActionsBuilder).</summary>
    internal List<ActionDto> ViewToolbarActions(Type crudType) =>
        ViewToolbarMethods(crudType).Select(m => new ActionDto(ActionOnViewPrefix + Naming.CamelCase(m.Name),
            ValidationRequired: false,
            ConfirmationRequired: m.Find<ViewToolbarButtonAttribute>()!.ConfirmationRequired)).ToList();

    // ── Master-detail views ────────────────────────────────────────────────────

    /// <summary>The wire protocol of a master-detail view (Java's MasterDetailView constants).</summary>
    internal const string MasterDetailEvent = "mateu-md:part-selected";
    internal const string MasterDetailReload = "__md_reload";
    internal const string MasterDetailPick = "__md_pick:";
    internal const string MasterDetailRoutePrefix = "/__md/";
    /// <summary>Where the selected part rides in the page state.</summary>
    internal const string MasterDetailStateKey = "_mdPart";

    internal sealed record DetailPart(IReadOnlyList<string> PropertyNames, string Key, string Label, int Order);

    /// <summary>The detail parts of a master-detail view, in [DetailPart(Order)] order (stable). The
    /// properties sharing a key are ONE part — this port's forms are flat, so a part is the set of
    /// properties marked with its key (Java's part is one [Inline] section field); its label and order
    /// are the first declaration's.</summary>
    internal List<DetailPart> DetailParts(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .OrderBy(p => p.MetadataToken)
            .Select(p => (p, part: p.Find<DetailPartAttribute>()))
            .Where(x => x.part is not null)
            .GroupBy(x => string.IsNullOrWhiteSpace(x.part!.Key) ? Naming.CamelCase(x.p.Name) : x.part.Key)
            .Select(g =>
            {
                var (first, part) = g.First();
                var label = g.Select(x => x.part!.Label).FirstOrDefault(l => !string.IsNullOrWhiteSpace(l));
                return new DetailPart(g.Select(x => x.p.Name).ToList(), g.Key,
                    T(label ?? Naming.Humanize(first.Name)), part!.Order);
            })
            .OrderBy(p => p.Order)
            .ToList();

    /// <summary>The property names the form must not draw while this render runs (the non-selected
    /// detail parts). AsyncLocal: the mapper is shared, the hidden set is per request.</summary>
    private static readonly AsyncLocal<HashSet<string>?> Hidden = new();

    private static bool HiddenParts(MemberInfo member) =>
        member is PropertyInfo && Hidden.Value is { } hidden && hidden.Contains(member.Name);

    /// <summary>A master-detail view's page: its own form (master + the SELECTED part; the other parts
    /// hidden) under the header components, with a button bar — one button per part, the selected
    /// one primary, the rest tertiary — dispatching <c>__md_pick:&lt;key&gt;</c>, and the
    /// subscription to <c>mateu-md:part-selected</c> → <c>__md_reload</c>. (Mirrors Java's
    /// MasterDetailView.resolveInternalRoute + triggers + actions.)</summary>
    internal ServerSideComponentDto MapMasterDetail(Type type, IMasterDetailView view, string? selectedKey, string route,
        bool embedded, bool inline)
    {
        var parts = DetailParts(type);
        var previous = Hidden.Value;
        Hidden.Value = parts.Where(p => p.Key != selectedKey).SelectMany(p => p.PropertyNames).ToHashSet();
        ServerSideComponentDto dto;
        try
        {
            dto = MapView(type, view, route, null, embedded, inline);
        }
        finally
        {
            Hidden.Value = previous;
        }
        var bar = parts.Select(p => new ButtonDto(p.Label, MasterDetailPick + p.Key)
        {
            // the selection reaches the screen as the primary button (Java's buttonStyle)
            ButtonStyle = p.Key == selectedKey ? "primary" : "tertiary",
        }).ToList();
        var header = view.PageHeader().Select(ComponentMapper.Map).ToList();
        var children = dto.Children.Select(child => child is ClientSideComponentDto { Metadata: PageMetadataDto meta } page
            ? page with
            {
                Metadata = meta with { Title = view.PageTitle() is { } t ? T(t) : meta.Title, Toolbar = bar },
                Children = [.. header, .. page.Children],
            }
            : child).ToList();
        var actions = new List<ActionDto> { new(MasterDetailReload, ValidationRequired: false) };
        actions.AddRange(parts.Select(p => new ActionDto(MasterDetailPick + p.Key, ValidationRequired: false)));
        actions.AddRange(dto.Actions.Where(a => actions.All(x => x.Id != a.Id)));
        var initialData = dto.InitialData is IReadOnlyDictionary<string, object?> seeded
            ? new Dictionary<string, object?>(seeded)
            : new Dictionary<string, object?>();
        if (selectedKey is not null) initialData[MasterDetailStateKey] = selectedKey;
        return dto with
        {
            Children = children,
            Actions = actions,
            InitialData = initialData,
            Triggers = [.. dto.Triggers, new CustomTriggerDto(MasterDetailEvent, MasterDetailReload) { Source = "DOCUMENT" }],
        };
    }
}
