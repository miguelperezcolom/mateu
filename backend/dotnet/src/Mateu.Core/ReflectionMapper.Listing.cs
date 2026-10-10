using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Listings, CRUDs, capability listings and grid fields (Java: ListRouteResolver, PageListingBuilder, ListingColumnBuilder, GridColumnBuilder).
public sealed partial class ReflectionMapper
{
    /// <summary>If <paramref name="type"/> derives from Crud&lt;T&gt;, returns T; else null.</summary>
    internal static Type? CrudElementType(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Crud<>))
                return t.GetGenericArguments()[0];
        return null;
    }

    /// <summary>If <paramref name="type"/> derives from Listing&lt;TFilters, TRow&gt;, returns
    /// (TFilters, TRow); else null.</summary>
    internal static (Type Filters, Type Row)? ListingTypes(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Listing<,>))
                return (t.GetGenericArguments()[0], t.GetGenericArguments()[1]);
        return null;
    }

    /// <summary>A declarative Listing view: a read-only searchable listing — columns from the Row
    /// type, the smart search bar from the Filters type (typed DateRange/NumberRange/ISet
    /// properties render range and multi-select widgets — the type is the developer's explicit
    /// ask, mirroring Java's PageListingBuilder.isTypedFilter).</summary>
    /// <summary>Whether the listing view acts as a selector dialog (implements ISelector).</summary>
    internal static bool IsSelector(Type viewType) =>
        viewType.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ISelector<>));

    internal ServerSideComponentDto MapListing(Type viewType, Type filters, Type row, string route)
    {
        var title = viewType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(viewType.Name);
        var instance = Activator.CreateInstance(viewType);
        // A SmartSearchPage is search-first: its optional PageSubtitle rides as an intro text over
        // the crud, and the page starts EMPTY — no OnLoad→search preload trigger (mirrors Java's
        // SmartSearchPage archetype).
        var smartSearch = instance as ISmartSearchPage;
        // A self-referential children list makes rows hierarchical (GridLayout "tree"); it rides
        // inside the row dicts, never as a column.
        var columns = EditableProperties(row)
            .Where(p => GridRowType(p) is null && Visible(p))
            .Select(p => new GridColumnDto(new GridColumnMetaDto(
                Naming.CamelCase(p.Name),
                p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))
            {
                DataType = InferDataType(Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType, p),
                Aggregate = AggregateOf(p),
                Stereotype = ColumnStereotypeOf(p),
                CaptionPath = CaptionPathOf(p),
                LeadingPath = LeadingPathOf(p),
                TooltipPath = TooltipPathOf(p),
            }))
            .ToList();
        var actions = new List<ActionDto> { new("search") };
        if (IsSelector(viewType))
        {
            // The rows of a selector dialog show a Select button (the frontend keys on the
            // "select" action column) and clicking dispatches action-on-row-select.
            columns.Add(new GridColumnDto(new GridColumnMetaDto("select", "Select")
            {
                DataType = "action",
                Stereotype = "button",
            }));
            actions.Add(new ActionDto("action-on-row-select", ValidationRequired: false));
        }
        var gridLayout = viewType.GetMethod("GridLayout")!
            .Invoke(instance, []) as string ?? "auto";
        var crud = Client(new CrudMetadataDto(title, columns, [])
        {
            CanEdit = false,
            Filters = MapListingFilters(filters),
            GridLayout = gridLayout,
            GroupBy = GroupByOf(row),
            RowStatusField = RowStatusFieldOf(row),
            DragType = DragTypeOf(viewType),
            // [RestListing]: rows fetched client-side from an arbitrary REST endpoint.
            RowsSource = RestListingOf(viewType),
            // A listing fills the space its parent leaves and scrolls internally (coherence-plan #8).
        }, "crud", []) with { Sizing = "fill" };
        var pageChildren = new List<ComponentDto>();
        if (smartSearch?.PageSubtitle() is { } subtitle)
            pageChildren.Add(Client(new TextMetadataDto(subtitle), "page-subtitle", []));
        pageChildren.Add(crud);
        var page = Client(new PageMetadataDto(null, null, null, [], []), null, pageChildren);
        // A smart-search page starts EMPTY (the user searches); plain listings preload their rows.
        var triggers = smartSearch is null ? new List<TriggerDto> { new("OnLoad", "search") } : [];
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), viewType.FullName!, route, [page],
            new Dictionary<string, object?>(), actions, triggers, null, null, null)
        {
            PageWidth = PageWidthOf(viewType, instance),
            PageType = PageTypeOf(viewType),
        };
    }

    internal static Type? EnumSetElementType(PropertyInfo p)
    {
        var t = p.PropertyType;
        if (!t.IsGenericType) return null;
        var def = t.GetGenericTypeDefinition();
        if (def != typeof(ISet<>) && def != typeof(HashSet<>)) return null;
        var arg = t.GetGenericArguments()[0];
        return arg.IsEnum ? arg : null;
    }

    private static List<FormFieldMetadataDto> MapListingFilters(Type filters) =>
        EditableProperties(filters)
            .Select(p =>
            {
                var label = p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name);
                var id = Naming.CamelCase(p.Name);
                var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
                if (t == typeof(DateRange))
                    return new FormFieldMetadataDto(id, "date", label) { Stereotype = "dateRange" };
                if (t == typeof(NumberRange))
                    return new FormFieldMetadataDto(id, "number", label) { Stereotype = "numberRange" };
                if (EnumSetElementType(p) is { } el)
                    return new FormFieldMetadataDto(id, "string", label)
                    {
                        Stereotype = "multiSelect",
                        Options = Enum.GetNames(el).Select(n => new OptionDto(n, EnumLabel(el, n))).ToList(),
                    };
                if (t.IsEnum)
                    return new FormFieldMetadataDto(id, "string", label)
                    {
                        Stereotype = "select",
                        Options = Enum.GetNames(t).Select(n => new OptionDto(n, EnumLabel(t, n))).ToList(),
                    };
                return new FormFieldMetadataDto(id, InferDataType(t, p), label);
            })
            .ToList();

    private ServerSideComponentDto MapCrud(Type viewType, Type element, string route, object? instance = null)
    {
        var crud = instance ?? Activator.CreateInstance(viewType);
        // HeroSearch: a centered hero header over the listing, results as cards, no auto-search.
        var hero = crud as IHeroSearch;
        var title = viewType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(viewType.Name);
        // The crud's capability hooks (Crud<T>.CanView & co, default true): per-crud restrictions
        // remove the matching chrome — no New without CanCreate, no selection/Delete without
        // CanDelete, no clickable rows without CanView/CanEdit (mirrors Java's Crud switches).
        bool Hook(string name) => viewType.GetProperty(name)?.GetValue(crud) as bool? ?? true;
        bool Hook0(string name) => viewType.GetProperty(name)?.GetValue(crud) as bool? ?? false;
        var canView = Hook("CanView");
        var canEdit = Hook("CanEdit");
        var canCreate = Hook("CanCreate");
        var canDelete = Hook("CanDelete");
        var rowsClickable = canView || canEdit;
        // Class-level [InlineEditing]: every data column (except [ReadOnly] ones) is edited in
        // place; each committed cell dispatches the crud's update-row action (Java parity).
        var inlineEditing = viewType.Find<InlineEditingAttribute>() != null;
        var columns = EditableProperties(element)
            .Where(Visible)
            .Select((p, index) =>
            {
                var editable = inlineEditing && p.Find<ReadOnlyAttribute>() == null;
                return new GridColumnDto(new GridColumnMetaDto(
                    Naming.CamelCase(p.Name),
                    p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))
                {
                    Editable = editable,
                    EditorType = editable ? EditorTypeOf(p) : null,
                    EditorOptions = editable ? EditorOptionsOf(p) : null,
                    Aggregate = AggregateOf(p),
                    Stereotype = ColumnStereotypeOf(p),
                    CaptionPath = CaptionPathOf(p),
                    LeadingPath = LeadingPathOf(p),
                    TooltipPath = TooltipPathOf(p),
                    // The first column is the row-open affordance (mirrors the Java crud wire).
                    ActionId = rowsClickable && index == 0 ? "view" : null,
                });
            })
            .ToList();
        var toolbar = new List<ButtonDto>();
        var actions = new List<ActionDto> { new("search") };
        if (canCreate)
        {
            toolbar.Add(new ButtonDto("New", "new"));
            actions.Add(new ActionDto("new"));
        }
        // Export the listing (Crud.CsvExportable): the whole filtered set as a CSV download
        // (mirrors Java's ListRouteResolver export buttons; the port's built-in CSV writer is the
        // exporter, and Excel/PDF have none here).
        if (Hook0("CsvExportable"))
        {
            toolbar.Insert(0, new ButtonDto("Export CSV", "export-csv"));
            actions.Add(new ActionDto("export-csv", ValidationRequired: false));
        }
        if (canDelete)
        {
            toolbar.Add(new ButtonDto("Delete", "delete"));
            actions.Add(new ActionDto("delete"));
        }
        if (rowsClickable) actions.Add(new ActionDto("view", ValidationRequired: false));
        if (inlineEditing) actions.Add(new ActionDto("update-row"));
        // [ListToolbarButton] methods: BULK list actions — a listing toolbar button dispatching
        // action-on-row-<method> over the grid's selected rows; the action advertises the
        // confirmation/selection-required flags the frontend enforces (mirrors Java's
        // Crud.addButtonsToList + CrudActionsBuilder).
        foreach (var m in viewType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                     .Where(m => !m.IsSpecialName && m.Find<ListToolbarButtonAttribute>() != null))
        {
            var bulk = m.Find<ListToolbarButtonAttribute>()!;
            var actionId = "action-on-row-" + Naming.CamelCase(m.Name);
            toolbar.Add(new ButtonDto(m.Find<LabelAttribute>()?.Value ?? Naming.Humanize(m.Name), actionId));
            actions.Add(new ActionDto(actionId, ValidationRequired: false,
                ConfirmationRequired: bulk.ConfirmationRequired,
                RowsSelectedRequired: bulk.RowsSelectedRequired,
                Bubble: true));
        }
        var crudComponent = Client(new CrudMetadataDto(title, columns, toolbar)
        {
            Filters = MapCrudFilters(element),
            CrudlType = hero is not null ? "cards" : "table",
            GroupBy = GroupByOf(element),
            RowStatusField = RowStatusFieldOf(element),
            DragType = DragTypeOf(viewType),
            RowsSelectionEnabled = canDelete,
        }, "crud", []) with { Sizing = "fill" };
        var pageChildren = new List<ComponentDto>();
        if (hero is not null)
            pageChildren.Add(Client(new HeroSectionMetadataDto(
                hero.HeroTitle(), hero.HeroSubtitle(), hero.HeroImage(), null, true), null, []));
        pageChildren.Add(crudComponent);
        var page = Client(new PageMetadataDto(null, null, null, [], []), null, pageChildren);
        // A hero-search page starts EMPTY (the user searches); plain cruds preload their rows.
        var triggers = hero is null ? new List<TriggerDto> { new("OnLoad", "search") } : [];
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), viewType.FullName!, route, [page],
            new Dictionary<string, object?>(), actions, triggers, null, null, null)
        {
            PageWidth = PageWidthOf(viewType, instance),
            PageType = PageTypeOf(viewType),
        };
    }

    /// <summary>A capability listing (IListing + declared capabilities): the listing table with
    /// ONLY the chrome its declared capabilities ask for — the search box when ISearchable, the
    /// filter bar when IFilterable, clickable rows when INavigable/IEditable, New when ICreatable,
    /// selection + Delete when IDeletable; a bare listing is just the table (mirrors Java's
    /// CapabilityCrud + CapabilityListingSyncTest contract).</summary>
    internal ServerSideComponentDto MapCapabilityListing(CapabilityProfile profile, string route)
    {
        var viewType = profile.ListingType;
        var title = T(viewType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(viewType.Name));
        var instance = Activator.CreateInstance(viewType);
        var rowsClickable = profile.CanView || profile.CanEdit;
        var columns = EditableProperties(profile.RowType)
            .Where(p => GridRowType(p) is null && Visible(p))
            .Select((p, index) => new GridColumnDto(new GridColumnMetaDto(
                Naming.CamelCase(p.Name),
                p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))
            {
                DataType = InferDataType(Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType, p),
                Aggregate = AggregateOf(p),
                Stereotype = ColumnStereotypeOf(p),
                CaptionPath = CaptionPathOf(p),
                LeadingPath = LeadingPathOf(p),
                TooltipPath = TooltipPathOf(p),
                // Rows open through their first column: the read-only detail when navigable, the
                // edit drawer when editable-without-navigable (both dispatch "view").
                ActionId = rowsClickable && index == 0 ? "view" : null,
            }))
            .ToList();
        var toolbar = new List<ButtonDto>();
        var actions = new List<ActionDto> { new("search") };
        if (rowsClickable) actions.Add(new ActionDto("view", ValidationRequired: false));
        if (profile.CanCreate)
        {
            toolbar.Add(new ButtonDto("New", "new"));
            actions.Add(new ActionDto("new"));
            actions.Add(new ActionDto("create"));
            actions.Add(new ActionDto("cancel-new", ValidationRequired: false));
        }
        if (profile.CanDelete)
        {
            toolbar.Add(new ButtonDto("Delete", "delete"));
            actions.Add(new ActionDto("delete"));
        }
        if (profile.CanEdit)
        {
            actions.Add(new ActionDto("edit", ValidationRequired: false));
            actions.Add(new ActionDto("save"));
            actions.Add(new ActionDto("cancel-edit", ValidationRequired: false));
        }
        if (profile.CanView) actions.Add(new ActionDto("cancel-view", ValidationRequired: false));
        // [ListToolbarButton] bulk methods declared on the listing itself (the behaviour source).
        foreach (var m in viewType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                     .Where(m => !m.IsSpecialName && m.Find<ListToolbarButtonAttribute>() != null))
        {
            var bulk = m.Find<ListToolbarButtonAttribute>()!;
            var actionId = "action-on-row-" + Naming.CamelCase(m.Name);
            toolbar.Add(new ButtonDto(m.Find<LabelAttribute>()?.Value ?? Naming.Humanize(m.Name), actionId));
            actions.Add(new ActionDto(actionId, ValidationRequired: false,
                ConfirmationRequired: bulk.ConfirmationRequired,
                RowsSelectedRequired: bulk.RowsSelectedRequired,
                Bubble: true));
        }
        var gridLayout = viewType.GetMethod("GridLayout", Type.EmptyTypes)?.Invoke(instance, []) as string ?? "auto";
        var crud = Client(new CrudMetadataDto(title, columns, toolbar)
        {
            Searchable = profile.Searchable,
            Filters = profile.FiltersType is { } filtersType ? MapListingFilters(filtersType) : [],
            GridLayout = gridLayout,
            GroupBy = GroupByOf(profile.RowType),
            RowStatusField = RowStatusFieldOf(profile.RowType),
            DragType = DragTypeOf(viewType),
            RowsSelectionEnabled = profile.CanDelete,
        }, "crud", []) with { Sizing = "fill" };
        var page = Client(new PageMetadataDto(null, null, null, [], []), null, [crud]);
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), viewType.FullName!, route, [page],
            new Dictionary<string, object?>(), actions,
            new List<TriggerDto> { new("OnLoad", "search") }, null, null, null)
        {
            PageWidth = PageWidthOf(viewType, instance),
            PageType = PageTypeOf(viewType),
        };
    }

    /// <summary>A capability listing's detail/edit/create form: the reflected form of the type
    /// the capability method returned, under the listing's title, with a caller-supplied toolbar
    /// (only the buttons the declared capabilities allow).</summary>
    internal ServerSideComponentDto MapCapabilityForm(
        Type listingType, Type formType, object entity, bool readOnly,
        IReadOnlyList<ButtonDto> toolbar, string route)
    {
        var title = T(listingType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(formType.Name));
        var page = Client(new PageMetadataDto(title, title, null, toolbar, []), null,
            FormCards(formType, entity, readOnly));
        // The entity's field values ride in initialData / the fragment state (Java parity), so a
        // detail/edit/create form arrives prefilled.
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), listingType.FullName!, route, [page],
            InitialDataOf(formType, entity), [], [], null, null, null)
        {
            Rules = MapRules(formType, entity),
            PageType = PageTypeOf(listingType),
        };
    }

    internal static IEnumerable<PropertyInfo> EditableProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true });

    /// <summary>The [Aggregate] function of a listing column as its wire name (the lowercase Java
    /// enum: sum|avg|min|max|count); null on non-aggregated columns.</summary>
    internal static string? AggregateOf(PropertyInfo p) =>
        p.Find<AggregateAttribute>()?.Function.ToString().ToLowerInvariant();

    /// <summary>The rich "primary" column stereotype (coherence-plan #6) when the property carries
    /// [PrimaryColumn]; null otherwise. (Mirrors Java's ColumnTypeMapper.getStereotypeForColumn.)</summary>
    internal static string? ColumnStereotypeOf(PropertyInfo p) =>
        p.Find<PrimaryColumnAttribute>() is not null ? "primary" : null;

    internal static string? CaptionPathOf(PropertyInfo p) =>
        p.Find<PrimaryColumnAttribute>()?.Caption is { Length: > 0 } c ? c : null;

    /// <summary>[Tooltip("otherField")]: hovering the cell shows another field of the row (mirrors
    /// Java's ListingColumnBuilder.tooltipPathOf; the ports have no fixed column widths, so there
    /// is no own-name fallback).</summary>
    internal static string? TooltipPathOf(PropertyInfo p) =>
        p.Find<TooltipAttribute>()?.Value is { Length: > 0 } t && !string.IsNullOrWhiteSpace(t) ? t : null;

    internal static string? LeadingPathOf(PropertyInfo p) =>
        p.Find<PrimaryColumnAttribute>()?.Leading is { Length: > 0 } l ? l : null;

    /// <summary>The drag type of a listing whose rows can be dragged ([DragRows] on its class);
    /// null = none (mirrors ListingSummarySpec.dragTypeOf).</summary>
    internal static string? DragTypeOf(Type listing) =>
        listing.Find<DragRowsAttribute>() is { Type: { } t } && !string.IsNullOrWhiteSpace(t) ? t : null;

    /// <summary>The [GroupBy] column of a row class (camelCase field id); one per row class —
    /// first declared wins. Null when the class declares none (mirrors ListingSummarySpec).</summary>
    internal static string? GroupByOf(Type row) =>
        EditableProperties(row).FirstOrDefault(p => p.Find<GroupByAttribute>() != null) is { } group
            ? Naming.CamelCase(group.Name)
            : null;

    /// <summary>The [RowStatus] property of a row class (camelCase field id) — its value tones the
    /// row; first declared wins, null when none (mirrors ListingSummarySpec.rowStatusFieldOf).</summary>
    internal static string? RowStatusFieldOf(Type row) =>
        EditableProperties(row).FirstOrDefault(p => p.Find<RowStatusAttribute>() != null) is { } status
            ? Naming.CamelCase(status.Name)
            : null;

    /// <summary>The columns of a crud export: the listing's visible entity properties with their
    /// column labels (mirrors Java's ExportActionRunner.buildExportColumns).</summary>
    internal List<(PropertyInfo Property, string Label)> ExportColumns(Type element) =>
        EditableProperties(element)
            .Where(Visible)
            .Select(p => (p, p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name)))
            .ToList();

    /// <summary>The smart search bar's filters for a Crud entity (mirrors the Java AutoCrud
    /// semantics): every basic property and every enum becomes a filter — enums upgrade to
    /// multi-selects (IN) with their constants as options, temporals to from–to date ranges,
    /// [RangeFilter] numerics to min–max ranges.</summary>
    private static List<FormFieldMetadataDto> MapCrudFilters(Type element) =>
        EditableProperties(element)
            .Select(p => (Property: p, Type: Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType))
            .Where(x => x.Type.IsEnum || x.Type == typeof(string) || x.Type == typeof(bool)
                        || IsNumeric(x.Type) || IsTemporal(x.Type))
            .Select(x =>
            {
                var label = x.Property.Find<LabelAttribute>()?.Value
                            ?? Naming.Humanize(x.Property.Name);
                var stereotype =
                    x.Type.IsEnum ? "multiSelect"
                    : IsTemporal(x.Type) ? "dateRange"
                    : IsNumeric(x.Type) && x.Property.Find<RangeFilterAttribute>() != null ? "numberRange"
                    : "regular";
                var options = x.Type.IsEnum
                    ? Enum.GetNames(x.Type).Select(n => new OptionDto(n, EnumLabel(x.Type, n))).ToList()
                    : new List<OptionDto>();
                return new FormFieldMetadataDto(
                    Naming.CamelCase(x.Property.Name), InferDataType(x.Type, x.Property), label)
                {
                    Stereotype = stereotype,
                    Options = options,
                };
            })
            .ToList();

    /// <summary>The in-place editor widget for an [InlineEditing] column (mirrors Java's
    /// GridColumnBuilder.getEditorType): enums edit as a select, [Money] as a number, the rest by
    /// data type.</summary>
    private static string EditorTypeOf(PropertyInfo p)
    {
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        if (p.Find<LookupAttribute>() != null) return "lookup";
        if (t.IsEnum) return "select";
        if (p.Find<MoneyAttribute>() != null) return "number";
        if (t == typeof(bool)) return "boolean";
        if (t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long)) return "integer";
        if (IsNumeric(t)) return "number";
        if (t == typeof(DateOnly)) return "date";
        if (t == typeof(DateTime)) return "datetime";
        return "text";
    }

    /// <summary>What an enum member is called on screen: its [Label], else its name humanized
    /// (CHECK_OUT / CheckOut → "Check out"). Same rule as Java's FieldMetadataExtractor.enumLabel.</summary>
    internal static string EnumLabel(Type enumType, string name) =>
        enumType.GetField(name)?.GetCustomAttribute<LabelAttribute>()?.Value is { Length: > 0 } label
            ? label
            : Naming.HumanizeConstant(name);

    private static List<OptionDto>? EditorOptionsOf(PropertyInfo p)
    {
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        return t.IsEnum
            ? Enum.GetNames(t).Select(n => new OptionDto(n, EnumLabel(t, n))).ToList()
            : null;
    }

    internal static bool IsNumeric(Type t) =>
        t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long)
        || t == typeof(float) || t == typeof(double) || t == typeof(decimal);

    internal static bool IsTemporal(Type t) => t == typeof(DateOnly) || t == typeof(DateTime);

    /// <summary>The row type of a grid (list-of-complex-rows) property; null when the property is
    /// not a grid field (scalars, strings, enums, options-backed lists…).</summary>
    internal static Type? GridRowType(PropertyInfo p)
    {
        var t = p.PropertyType;
        if (!t.IsGenericType || !typeof(System.Collections.IEnumerable).IsAssignableFrom(t)) return null;
        var arg = t.GetGenericArguments().FirstOrDefault();
        return arg is { IsClass: true } && arg != typeof(string) ? arg : null;
    }

    /// <summary>A list-of-rows property → a grid FormField (dataType "array", stereotype "grid",
    /// one GridColumn per row property, rows identified by position). Mirrors Java's
    /// GridColumnBuilder.getFormFieldForArray.</summary>
    private ClientSideComponentDto MapGridField(PropertyInfo p, Type rowType, object instance, bool readOnly)
    {
        var fieldId = Naming.CamelCase(p.Name);
        // [InlineEditing] on the grid property: cells edit in place, commits accumulate in the
        // form state (the frontend's renderEditableCell form-grid path) and save with the form.
        var inline = !readOnly && p.Find<InlineEditingAttribute>() != null;
        var columns = EditableProperties(rowType)
            .Where(Visible)
            .Select(c =>
            {
                var editable = inline && c.Find<ReadOnlyAttribute>() == null;
                // The form instance's IOptionsSupplier can feed an editable cell's select options
                // (Java parity: the grid inline-editor machinery consults the form's
                // OptionsSupplier — e.g. the import wizard's targetField cell).
                var supplied = editable && instance is IOptionsSupplier supplier
                    ? supplier.Options(Naming.CamelCase(c.Name))
                    : null;
                return new GridColumnDto(new GridColumnMetaDto(
                    Naming.CamelCase(c.Name),
                    c.Find<LabelAttribute>()?.Value ?? Naming.Humanize(c.Name))
                {
                    // Grid-field columns carry the COARSE type (Java's ColumnTypeMapper: bool,
                    // status, else string) — the cell shows the row value as is.
                    DataType = GridColumnDataType(c),
                    Stereotype = ColumnStereotypeOf(c) ?? "regular",
                    AutoWidth = true,
                    Editable = editable,
                    EditorType = editable
                        ? supplied is { Count: > 0 } ? "select" : EditorTypeOf(c)
                        : null,
                    EditorOptions = editable
                        ? supplied is { Count: > 0 } ? supplied.Select(MapOption).ToList() : EditorOptionsOf(c)
                        : null,
                });
            })
            .ToList();
        // The per-row "Edit" button opens the row detail form (the <field>_select action of the
        // grid-field crud); inline editing replaces it (Java: GridColumnBuilder).
        if (!readOnly && !inline)
            columns.Add(new GridColumnDto(new GridColumnMetaDto("_select", "")
            {
                DataType = "string",
                Stereotype = "button",
                Text = "Edit",
                ActionId = fieldId + "_select",
                Width = "3rem",
            }));
        var onRow = p.Find<OnRowSelectedAttribute>();
        const string gridStyle = "min-width: 10rem; width: 100%;";
        // The rows ride in the component state (initialData), not as a per-field initialValue —
        // the field-crud actions rewrite that state list.
        var meta = new FormFieldMetadataDto(fieldId, "array", T(
            p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name)))
        {
            Stereotype = "grid",
            ReadOnly = readOnly,
            Columns = columns,
            ItemIdPath = "_rowNumber",
            InlineEditing = inline,
            OnItemSelectionActionId = onRow is not null
                ? Naming.CamelCase(onRow.Value)
                // without [OnRowSelected] an editable grid keeps the legacy detail-edit binding
                : readOnly ? null : fieldId + "_selected",
            RowSelectionShortcut = onRow is { Shortcut.Length: > 0 } ? onRow.Shortcut : null,
            Colspan = p.Find<ColspanAttribute>()?.Value ?? 1,
            Style = gridStyle,
            FormPosition = "right",
            FormColumns = FormColumns(rowType),
            MinHeightWhenDetailVisible = "16rem;",
            SliderMax = 0,
        };
        return Client(meta, fieldId, []) with { Style = gridStyle };
    }

    /// <summary>The row-editing actions of every LIST property of a view, in this order per list:
    /// _create, _create-and-stay, _add, _select, _selected, _prev, _next, _save, _remove, _move-up,
    /// _move-down, _cancel (the grid-field crud the SyncHandler answers). The three that persist a
    /// row require validation of the row's constrained fields only.</summary>
    internal static readonly string[] ListActionSuffixes =
    [
        "_create", "_create-and-stay", "_add", "_select", "_selected", "_prev", "_next", "_save",
        "_remove", "_move-up", "_move-down", "_cancel",
    ];

    /// <summary>The actions a view's PROPERTIES declare, in Java's FieldActionCollector order: list
    /// row editing, [OnRowSelected], [Lookup] search.</summary>
    internal static List<ActionDto> FieldActions(Type type)
    {
        var actions = new List<ActionDto>();
        var props = EditableProperties(type).ToList();
        foreach (var p in props.Where(p => ListElementType(p.PropertyType) is not null))
        {
            var fieldId = Naming.CamelCase(p.Name);
            var constrained = ConstrainedFieldNames(ListElementType(p.PropertyType)!);
            foreach (var suffix in ListActionSuffixes)
            {
                var validates = suffix is "_create" or "_create-and-stay" or "_save";
                actions.Add(new ActionDto(fieldId + suffix, ValidationRequired: validates)
                {
                    FieldsToValidate = validates ? constrained : null,
                });
            }
        }
        foreach (var onRow in props.Select(p => p.Find<OnRowSelectedAttribute>()).OfType<OnRowSelectedAttribute>())
        {
            var id = Naming.CamelCase(onRow.Value);
            if (actions.All(a => a.Id != id)) actions.Add(new ActionDto(id, ValidationRequired: false));
        }
        foreach (var p in props.Where(p => p.Find<LookupAttribute>() != null))
            actions.Add(new ActionDto("search-" + Naming.CamelCase(p.Name), ValidationRequired: false));
        return actions;
    }

    /// <summary>The element type of a list-typed property (List&lt;T&gt;, IList&lt;T&gt;,
    /// IReadOnlyList&lt;T&gt;, ICollection&lt;T&gt;, T[]), or null.</summary>
    internal static Type? ListElementType(Type t)
    {
        if (t == typeof(string)) return null;
        if (t.IsArray) return t.GetElementType();
        if (!t.IsGenericType) return null;
        var def = t.GetGenericTypeDefinition();
        return def == typeof(List<>) || def == typeof(IList<>) || def == typeof(IReadOnlyList<>)
               || def == typeof(ICollection<>) || def == typeof(IReadOnlyCollection<>)
            ? t.GetGenericArguments()[0]
            : null;
    }

    /// <summary>The row type's fields carrying a validation constraint, comma-separated (Java's
    /// getConstrainedFieldNames), or null.</summary>
    private static string? ConstrainedFieldNames(Type rowType)
    {
        if (rowType == typeof(string) || rowType.IsPrimitive || rowType.IsEnum) return null;
        var names = rowType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.GetCustomAttributes(typeof(ValidationAttribute), true).Length > 0)
            .Select(p => Naming.CamelCase(p.Name))
            .ToList();
        return names.Count == 0 ? null : string.Join(",", names);
    }

    /// <summary>The coarse data type of a grid-field column (Java: ColumnTypeMapper — booleans keep
    /// their checkbox, everything else is shown as text).</summary>
    private static string GridColumnDataType(PropertyInfo c)
    {
        var t = Nullable.GetUnderlyingType(c.PropertyType) ?? c.PropertyType;
        if (t == typeof(bool)) return "bool";
        return "string";
    }

    /// <summary>A grid property's rows as wire dicts (camelCase keys), also used for the wizard
    /// state so list fields round-trip as row lists instead of ToString() husks.</summary>
    private static List<Dictionary<string, object?>> GridRows(PropertyInfo p, Type rowType, object instance)
    {
        var rows = new List<Dictionary<string, object?>>();
        if (p.GetValue(instance) is System.Collections.IEnumerable items)
            foreach (var item in items)
            {
                var row = new Dictionary<string, object?>();
                foreach (var c in EditableProperties(rowType))
                    row[Naming.CamelCase(c.Name)] = CellValueOf(c.GetValue(item));
                rows.Add(row);
            }
        return rows;
    }

    private static object? CellValueOf(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };
}
