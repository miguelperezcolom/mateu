using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Forms: sections, zones, tabs, folded layouts, fields and buttons (Java: SectionFormRenderer, FormLayoutBuilder, ReflectionFormFieldMapper, FieldTypeMapper).
public sealed partial class ReflectionMapper
{
    /// <summary>Detail/edit/new form for a single CRUD entity, with a mode-specific toolbar.</summary>
    public ServerSideComponentDto MapEntityForm(Type crudType, Type element, object entity, string mode, string route)
    {
        var title = crudType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(element.Name);
        IReadOnlyList<ButtonDto> toolbar = mode switch
        {
            "view" => [new("Back to list", "cancel-view"), new("Edit", "edit"), new("Add another", "new")],
            "edit" => [new("Cancel", "cancel-edit"), new("Save", "create") { ButtonStyle = "Primary" }],
            _ /* new */ => [new("Cancel", "cancel-new"), new("Save", "create") { ButtonStyle = "Primary" }],
        };
        var page = Client(new PageMetadataDto(title, title, null, toolbar, []), null,
            FormCards(element, entity, readOnly: mode == "view"));
        // The entity's field values ARE the form state: seed them into initialData (and, via
        // FragmentResponse, the fragment state) so a view/edit form arrives prefilled — the values
        // no longer ride as per-field initialValue (Java parity).
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), crudType.FullName!, route, [page],
            InitialDataOf(element, entity), FieldActions(element), [], null, null, null)
        {
            // [Hidden]/[Disabled] on entity fields rule the detail form too.
            Rules = MapRules(element, entity),
            PageType = PageTypeOf(crudType),
        };
    }

    /// <summary>The detail form of a grid row: a ServerSide component of the row type whose page
    /// carries the row's fields, the editor buttons at its foot and (when editing) the Prev/Next
    /// toolbar. It advertises NO actions, so its buttons bubble to the hosting form, which owns the
    /// list (Java: CrudFieldHandlerHelper.buildDetailForm).</summary>
    internal ServerSideComponentDto MapRowEditor(Type rowType, string title, Dictionary<string, object?> data,
        ComponentDto? header, IReadOnlyList<ButtonDto> toolbar, IReadOnlyList<ButtonDto> buttons, string route)
    {
        var simple = rowType == typeof(string) || rowType.IsPrimitive || rowType.IsAbstract;
        var instance = simple ? new object() : Activator.CreateInstance(rowType)!;
        var columns = FormColumns(rowType);
        var content = new List<ComponentDto>();
        if (header is not null) content.Add(header);
        if (!simple)
            content.Add(Client(new FormLayoutMetadataDto { MaxColumns = columns }, null,
                FormRows(MapFields(EditableProperties(rowType).Where(Visible), instance), columns)));
        var page = Client(new PageMetadataDto(T(title), T(title), null, toolbar, buttons) { Level = 1 }, null, content);
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), rowType.FullName!, route, [page], data, [], [], "width: 100%;", null, null)
        {
            Rules = simple ? [] : MapRules(rowType, instance),
            Validations = simple ? [] : MapValidations(rowType),
        };
    }

    // Groups fields by [Section] into cards (one plain card when there are no sections), or into a
    // TabLayout when any field carries [Tab]. Under [AutoLayout] the inference decision table
    // (LayoutInference, ported from the Java reference) may regroup them: a heavy unstructured
    // editable form folds its optional fields into a "More options" accordion, and a heavy
    // read-only view with many sections is presented as adaptable tabs.
    private List<ComponentDto> FormCards(Type type, object instance, bool readOnly = false)
    {
        var props = EditableProperties(type).Where(Visible).ToList();
        // A tabbed form is wrapped in an (untitled) mateu-section Card just like a plain one — the
        // TabLayout is the card's body (Java parity: Card → Div → VerticalLayout → TabLayout).
        if (props.Any(p => p.Find<TabAttribute>() != null))
            return [SectionCardOfBody((ClientSideComponentDto)TabLayout(type, props, instance, readOnly))];

        var sections = new List<(string? Title, List<PropertyInfo> Props)>();
        var sectionZones = new List<string>();
        var sectionAttrs = new List<SectionAttribute?>();
        string? current = null;
        var currentZone = "";
        SectionAttribute? currentAttr = null;
        foreach (var p in props)
        {
            // A new section starts when the [Section] declaration actually changes — comparing
            // EVERY attribute, not just the caption: two consecutive untitled sections pointing
            // at different zones (or with different PropertyList/Frameless flags) are distinct.
            var sec = p.Find<SectionAttribute>();
            var startsNew = sections.Count == 0
                || (sec != null && (currentAttr == null || !SameSection(sec, currentAttr)));
            if (sec != null)
            {
                current = sec.Caption;
                currentZone = sec.Zone;
                currentAttr = sec;
            }
            if (startsNew)
            {
                sections.Add((current, new List<PropertyInfo>()));
                sectionZones.Add(currentZone);
                sectionAttrs.Add(currentAttr);
            }
            sections[^1].Props.Add(p);
        }

        // [Zone] columns on the class: sections lay out side by side (zones win over inference).
        var zones = type.GetCustomAttributes<ZoneAttribute>().ToList();
        if (zones.Count > 0 && sections.Count > 1)
            return [BuildZones(type, zones, sections, sectionZones, sectionAttrs, instance, readOnly)];

        // [FoldedLayout]: the section cards side by side in one horizontal row (zones win).
        if (type.Find<FoldedLayoutAttribute>() != null && sections.Count > 1)
            return [new ClientSideComponentDto(
                new HorizontalLayoutMetadataDto { Spacing = true }, null,
                sections.Select((s, i) => (ComponentDto)SectionCard(
                    s.Title, MapFields(s.Props, instance, readOnly),
                    sectionAttrs[i], type, s.Props, titled: true)).ToList(),
                null, null, null)];

        // Read-only view with many substantial sections: present the sections as adaptable tabs.
        if (sections.Count > 1 && LayoutInference.PreferTabs(type, sections, readOnly))
            return [TabsFromSections(type, sections, instance, readOnly)];

        // Heavy unstructured editable form: required fields stay visible, optionals fold away.
        if (sections.Count == 1
            && LayoutInference.BuildFoldPlan(type, sections[0].Title, sections[0].Props, readOnly) is { } plan)
            return [FoldedCard(type, plan, instance)];

        // Several stacked sections carry their titles (each an <h3> inside its Card) and sit in a
        // full-width VerticalLayout; a single section is untitled (Java parity).
        var titled = sections.Count > 1;
        var cards = sections.Select((s, i) => (ComponentDto)SectionCard(
            s.Title, MapFields(s.Props, instance, readOnly),
            sectionAttrs[i], type, s.Props, titled)).ToList();
        if (titled)
            return [new ClientSideComponentDto(
                new VerticalLayoutMetadataDto { Spacing = true }, null, cards, "width: 100%;", null, null)];
        return cards;
    }

    /// <summary>Distributes sections into the [Zone] columns and lays them out side by side —
    /// each zone a VerticalLayout stacking its section cards, its width from Zone.Width;
    /// sections with an unrecognised zone fall into a trailing flexible column (mirrors Java's
    /// SectionFormRenderer.renderZones).</summary>
    private ComponentDto BuildZones(
        Type type,
        List<ZoneAttribute> zones,
        List<(string? Title, List<PropertyInfo> Props)> sections,
        List<string> sectionZones,
        List<SectionAttribute?> sectionAttrs,
        object instance,
        bool readOnly)
    {
        ComponentDto CardOf(int i) =>
            SectionCard(sections[i].Title,
                MapFields(sections[i].Props, instance, readOnly),
                sectionAttrs[i], type, sections[i].Props, titled: true);

        // Consolidated onto the one responsive grid (coherence-plan #9): each zone is a grid track
        // sized from its width, so the column is a bare VerticalLayout (mirrors Java's zoneColumn).
        ComponentDto Column(IEnumerable<ComponentDto> cards) =>
            new ClientSideComponentDto(
                new VerticalLayoutMetadataDto { Spacing = true }, null, cards.ToList(),
                "min-width: 0;", null, null);

        var columns = new List<ComponentDto>();
        var tracks = new List<string>();
        var remaining = Enumerable.Range(0, sections.Count).ToList();
        foreach (var zone in zones)
        {
            var mine = remaining.Where(i => sectionZones[i] == zone.Name).ToList();
            if (mine.Count == 0) continue;
            remaining.RemoveAll(mine.Contains);
            columns.Add(Column(mine.Select(CardOf)));
            tracks.Add(zone.Width.Length > 0 ? zone.Width : "1fr");
        }
        if (remaining.Count > 0)
        {
            columns.Add(Column(remaining.Select(CardOf)));
            tracks.Add("1fr");
        }

        // Zone widths become grid tracks; stackBelow collapses the row to one column on narrow
        // containers (mirrors Java's flushZonedRow — the old flex-wrap point was ~20rem/column).
        return new ClientSideComponentDto(
            new ResponsiveGridMetadataDto(string.Join(" ", tracks), null, null, "40rem"), null, columns,
            "width: 100%; align-items: start;", null, null);
    }

    // Groups consecutive fields sharing the same [Tab] name into the tabs of a single TabLayout.
    // Developer-declared tabs always carry the alternative group semantics; they are adaptable
    // (renderers may degrade them to an accordion) only when the class opted into [AutoLayout].
    private ComponentDto TabLayout(Type type, List<PropertyInfo> props, object instance, bool readOnly)
    {
        var tabs = new List<(string name, bool open, List<PropertyInfo> props, List<ClientSideComponentDto> fields)>();
        var current = "Tab";
        foreach (var p in props)
        {
            var attr = p.Find<TabAttribute>();
            if (attr?.Name is { } n) current = n;
            if (tabs.Count == 0 || tabs[^1].name != current)
                // The field that opens a group carries its [Tab(Open=...)] flag (mirrors the Java
                // pair.first().open() rule); fields before any [Tab] fall into the default group.
                tabs.Add((current, attr?.Open ?? false, new List<PropertyInfo>(), new List<ClientSideComponentDto>()));
            tabs[^1].props.Add(p);
            tabs[^1].fields.Add(MapField(p, instance, readOnly));
        }
        // Only a tab explicitly marked [Tab(Open=true)] carries active on the wire; with none opened
        // the renderer defaults to the first tab (Java parity: the corpus emits no active by default).
        var columns = FormColumns(type);
        var tabComps = tabs.Select((tb, i) => (ComponentDto)Client(
            new TabMetadataDto(T(tb.name)) { Active = tb.open }, null,
            [Client(new FormLayoutMetadataDto
            {
                MaxColumns = columns,
                LabelsAside = LabelsAsideInference.LabelsAside(tb.props, columns, type, T),
            }, null, FormRows(tb.fields, columns))])).ToList();
        var meta = new TabLayoutMetadataDto
        {
            GroupRelationship = "alternative",
            Adaptable = LayoutInference.Enabled(type),
        };
        return Client(meta, "_tabs", tabComps) with { Style = "width: 100%;" };
    }

    /// <summary>The sections-to-tabs inference presentation: one tab per section, labeled with the
    /// section title. The tab layout carries the group semantics and is marked adaptable so
    /// renderers may degrade it to an accordion on narrow viewports.</summary>
    private ComponentDto TabsFromSections(
        Type type,
        List<(string? Title, List<PropertyInfo> Props)> sections, object instance, bool readOnly)
    {
        var columns = FormColumns(type);
        var tabs = sections.Select((s, i) => (ComponentDto)Client(
            new TabMetadataDto(T(s.Title ?? "")) { Active = i == 0 }, null,
            [Client(new FormLayoutMetadataDto
            {
                MaxColumns = columns,
                LabelsAside = LabelsAsideInference.LabelsAside(s.Props, columns, type, T),
            }, null,
                FormRows(MapFields(s.Props, instance, readOnly), columns))])).ToList();
        var meta = new TabLayoutMetadataDto { GroupRelationship = "alternative", Adaptable = true };
        return Client(meta, "_tabs", tabs);
    }

    /// <summary>The fold-optionals inference presentation: the required fields' form layout stays
    /// visible and the optional fields collapse into a single "More options" accordion panel
    /// underneath, inside the usual untitled section card.</summary>
    private ClientSideComponentDto FoldedCard(Type type, LayoutInference.FoldPlan plan, object instance)
    {
        var columns = FormColumns(type);
        var main = Client(new FormLayoutMetadataDto
        {
            MaxColumns = columns,
            LabelsAside = LabelsAsideInference.LabelsAside(plan.Main, columns, type, T),
        }, null,
            FormRows(MapFields(plan.Main, instance), columns));
        var folded = Client(new FormLayoutMetadataDto
        {
            MaxColumns = columns,
            LabelsAside = LabelsAsideInference.LabelsAside(plan.Folded, columns, type, T),
        }, null,
            FormRows(MapFields(plan.Folded, instance), columns));
        var panel = Client(new AccordionPanelMetadataDto(LayoutInference.MoreOptionsLabel), null, [folded]);
        var accordion = Client(new AccordionLayoutMetadataDto(), null, [panel]);
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [main, accordion]);
        var div = Client(new DivMetadataDto(), "fieldId", [vlayout]);
        return Client(new CardMetadataDto(div), "fieldId", []);
    }

    /// <summary>The form's column count: [FormLayout(Columns = …)] when declared, else 2
    /// (mirrors Java's PageFormBuilder.getFormColumns).</summary>
    internal static int FormColumns(Type? type) => type?.Find<FormLayoutAttribute>()?.Columns ?? 2;

    private ClientSideComponentDto SectionCard(
        string? title, List<ClientSideComponentDto> fields, SectionAttribute? section = null,
        Type? formType = null, IReadOnlyList<PropertyInfo>? props = null, bool titled = false)
    {
        var columns = FormColumns(formType);
        // [Section(PropertyList = true)]: every data field becomes a read-only property row
        // (label left / value right, divider between rows), stacked full-width — so the body is a
        // plain vertical layout instead of the responsive form layout (mirrors Java's
        // SectionFormRenderer.asPropertyList).
        var body = section?.PropertyList == true
            ? Client(new VerticalLayoutMetadataDto { HorizontalAlignment = "STRETCH" }, null,
                fields.Select(f => f.Metadata is FormFieldMetadataDto ff && ff.Stereotype != "grid"
                    ? f with { Metadata = ff with { PropertyRow = true, ReadOnly = true, Colspan = 1 } }
                    : (ComponentDto)f).ToList()) with { Style = "width: 100%;" }
            : Client(new FormLayoutMetadataDto
            {
                MaxColumns = columns,
                LabelsAside = LabelsAsideInference.LabelsAside(props ?? [], columns, formType, T),
                // [Compact] tightens the responsive minimum column width so more columns fit
                // (mirrors Java's PageFormBuilder compact columnWidth).
                ColumnWidth = formType?.Find<CompactAttribute>() != null ? "7em" : null,
            }, null, FormRows(fields, columns));
        // [Section(Frameless = true)]: no card wrapper, no padding — the content sits bare
        // (mirrors Java's @Section(frameless=true)).
        if (section?.Frameless == true)
            return Client(new DivMetadataDto(), null, [body]) with
            {
                Style = "flex: 1; min-width: 0; width:100%;",
            };
        // A titled section (one of several stacked or zoned sections) carries its title as an <h3>
        // Text inside the Card, and the Card takes the flex style (mirrors Java's SectionFormRenderer
        // when the section has a heading).
        if (titled && !string.IsNullOrWhiteSpace(title))
        {
            var heading = Client(new TextMetadataDto(T(title!)) { Container = "h3" }, null, []) with
            {
                Style = " flex: 1; margin: 0;",
            };
            var inner = Client(new VerticalLayoutMetadataDto(), null, [body]) with
            {
                Style = "width: 100%;",
            };
            var content = Client(new VerticalLayoutMetadataDto(), null, [heading, inner]);
            return Client(new CardMetadataDto(content), null, []) with
            {
                CssClasses = "mateu-section",
                Style = "flex: 1; min-width: 0; width:100%;",
            };
        }
        // A single untitled section maps to an outlined Card carrying the "mateu-section" marker
        // class; its body nests under metadata.content as Div → VerticalLayout → body (mirrors Java's
        // SectionFormRenderer / CardMapper). The section TITLE does not travel as a FormSection — the
        // golden simple sections carry no title member on the Card.
        return SectionCardOfBody(body);
    }

    /// <summary>Wraps an arbitrary body component in an untitled mateu-section Card
    /// (Card → Div → VerticalLayout → body) — the shape a plain form section AND a tabbed form use.</summary>
    private static ClientSideComponentDto SectionCardOfBody(ClientSideComponentDto body)
    {
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [body]) with
        {
            Style = "width: 100%;",
        };
        var div = Client(new DivMetadataDto(), null, [vlayout]) with
        {
            Style = "flex: 1; min-width: 0; width:100%;",
        };
        return Client(new CardMetadataDto(div), null, []) with { CssClasses = "mateu-section" };
    }

    private ClientSideComponentDto MapField(PropertyInfo p, object instance, bool readOnly = false)
    {
        var fieldId = Naming.CamelCase(p.Name);
        if (GridRowType(p) is { } rowType) return MapGridField(p, rowType, instance, readOnly);
        // [Text]: the value shown as a text block bound to the state (Java: the @Text branch of
        // ReflectionFormFieldMapper).
        if (p.Find<TextAttribute>() is { } text)
            return Client(new TextMetadataDto("${state." + fieldId + "}")
            {
                Container = text.Container,
                Size = text.Size,
                NoMargins = text.NoMargins,
            }, fieldId, []);
        var label = T(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        var required = p.Find<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        // an IOptionsSupplier view wins (its options may carry Children → tree selects);
        // enums keep contributing their constants
        var options = instance is IOptionsSupplier supplier
                      && supplier.Options(fieldId) is { Count: > 0 } supplied
            ? supplied.Select(MapOption).ToList()
            : t.IsEnum
                // value = the constant name; label = its [Label], else the name humanized
                // (Java: FieldMetadataExtractor.enumLabel)
                ? Enum.GetNames(t).Select(n => new OptionDto(n, EnumLabel(t, n))).ToList()
                : new List<OptionDto>();
        // A [PlainText] field — or any field of a [PlainText] class — renders as read-only text.
        var plainText = p.Find<PlainTextAttribute>() != null
                        || p.DeclaringType?.Find<PlainTextAttribute>() != null;
        var multiline = p.Find<MultilineAttribute>() != null;
        var stereotype = StereotypeOf(p, plainText, multiline);

        // [ReadOnlyUnless] (field or class level): read-only unless the caller is authorized.
        var readOnlyByPermission =
            !Authorized(p.Find<ReadOnlyUnlessAttribute>())
            || (p.DeclaringType is { } owner && !Authorized(owner.Find<ReadOnlyUnlessAttribute>()));
        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t, p, plainText), label)
        {
            Stereotype = stereotype,
            Required = required,
            // A plain-text field carries the "plainText" stereotype, not a readOnly flag — Java does
            // not set readOnly on it (the money-field golden's plainText total has no readOnly).
            ReadOnly = readOnly || readOnlyByPermission,
            Multiline = multiline,
            Options = options,
            TreeLeavesOnly = p.Find<TreeSelectAttribute>()?.LeavesOnly ?? false,
            // An integer field shows the +/- step buttons; a textarea spans both columns (Java
            // parity). initialValue is NOT emitted per field — the values ride in initialData/state.
            StepButtonsVisible = t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long),
            // [Colspan(n)] wins; otherwise 1 — an intrinsically wide widget (textarea, rich text…)
            // is widened to the full row by FormRows, which knows the section's column count.
            Colspan = p.Find<ColspanAttribute>()?.Value ?? 1,
            Link = LinkOf(p, instance),
            // [Lookup]: the combo box loads its options remotely through the field's
            // search-<fieldId> action (answered from the view's IOptionsSupplier).
            RemoteCoordinates = p.Find<LookupAttribute>() != null
                ? new RemoteCoordinatesDto("search-" + fieldId)
                : null,
            // [RestOptions]: options fetched client-side from an arbitrary REST endpoint.
            OptionsSource = RestOptionsOf(p),
            // [FileUpload(Accept = ".csv")]: the file input's accept filter travels in the
            // field's generic attributes list — no dedicated wire field (Java parity).
            Attributes = p.Find<FileUploadAttribute>() is { Accept.Length: > 0 } fileUpload
                ? [new PairDto("accept", fileUpload.Accept)]
                : [],
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
        if (p.Find<LinkToAttribute>() is { } linkTo)
            return new NavLinkDto(linkTo.Href, linkTo.Icon, linkTo.Title, linkTo.Target);
        return null;
    }

    /// <summary>Maps a uidl Option including its children, so hierarchical option sets survive.</summary>
    private static OptionDto MapOption(Option option) => new(option.Value, option.Label)
    {
        Children = (option.Children ?? []).Select(MapOption).ToList(),
    };

    /// <summary>The field stereotype: explicit [Stereotype] wins, else [Multiline]/[Password]/[Money]
    /// map to their names, else plain-text context yields "plainText", else enums render as a
    /// dropdown ("select") — or as "radio" when [UseRadioButtons] or the small-enum inference rule
    /// applies — else "regular".</summary>
    private static string StereotypeOf(PropertyInfo p, bool plainText, bool multiline)
    {
        if (p.Find<StereotypeAttribute>()?.Value is { } s) return s;
        if (p.Find<BulletedListAttribute>() != null) return "bulletedList";
        if (p.Find<SignatureAttribute>() != null) return "signature";
        if (p.Find<PhotoCaptureAttribute>() != null) return "camera";
        if (p.Find<FileUploadAttribute>() != null) return "fileUpload";
        if (p.Find<TreeSelectAttribute>() != null) return "treeSelect";
        if (p.Find<PasswordAttribute>() != null) return "password";
        if (p.Find<MoneyAttribute>() != null) return plainText ? "plainText" : "money";
        // [RestOptions]: options fetched client-side from an arbitrary REST endpoint → a select.
        if (p.Find<RestOptionsAttribute>() != null) return "select";
        if (p.Find<LookupAttribute>() != null) return "combobox";
        if (p.Find<SearchableAttribute>() != null) return "searchable";
        if (plainText) return "plainText";
        if ((Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType).IsEnum)
            return p.Find<UseRadioButtonsAttribute>() != null || LayoutInference.PreferRadio(p)
                ? "radio"
                : "select";
        if (multiline) return "textarea";
        return "regular";
    }

    /// <summary>The stereotype a field renders with, including its plain-text context — the weight
    /// unit LayoutInference measures thresholds in.</summary>
    internal static string EffectiveStereotype(PropertyInfo p)
    {
        var plainText = p.Find<PlainTextAttribute>() != null
                        || p.DeclaringType?.Find<PlainTextAttribute>() != null;
        return StereotypeOf(p, plainText, p.Find<MultilineAttribute>() != null);
    }

    private static string? FormatValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        _ => value.ToString(),
    };

    /// <summary>A form's field values as the initialData/state map (fieldId → value): a grid property
    /// travels as its list of row dicts, everything else as its typed value. Java emits these on the
    /// component's initialData and the fragment state, instead of a per-field initialValue.</summary>
    private Dictionary<string, object?> InitialDataOf(Type type, object instance)
    {
        var data = new Dictionary<string, object?>();
        foreach (var p in EditableProperties(type))
        {
            // Fields hidden from the caller ([EyesOnly] / [Audience] projection) must not leak their
            // value into the state either. Header-hoisted fields ([Kpi]/[Timestamp]) DO carry state.
            if (!Authorized(p.Find<EyesOnlyAttribute>()) || !ForCurrentAudience(p)
                || p.Find<Mateu.Uidl.AsideAttribute>() != null)
                continue;
            // an island (adapted value / embedded view) keeps its own state, not the host's
            if (IsIslandProperty(p)) continue;
            data[Naming.CamelCase(p.Name)] = GridRowType(p) is { } rowType
                ? GridRows(p, rowType, instance)
                : InitialValueOf(p.GetValue(instance));
        }
        return data;
    }

    /// <summary>The value as it rides in initialData/state: native JSON types are preserved (a bool
    /// stays a bool, an int stays an int) so the wire matches Java; dates serialize ISO and enums as
    /// their constant name; a list (grid rows, [BulletedList]) travels as-is. Java emits the typed
    /// value here, NOT a stringified one.</summary>
    private static object? InitialValueOf(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };

    /// <summary>
    /// Copies the method's [ActionOptions] onto the action heading to the client. The action id is
    /// the camel-cased method name, so the declaring method is found by matching that back.
    /// Without a declaration the safe defaults ride: the client's own timeout, and no self-retry.
    /// </summary>
    private static ActionDto WithActionOptions(ActionDto action, Type type, string actionId)
    {
        var method = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .FirstOrDefault(m => Naming.CamelCase(m.Name) == actionId);
        var options = method?.Find<ActionOptionsAttribute>();
        if (options is null) return action;
        return action with { TimeoutMillis = options.TimeoutMillis, Idempotent = options.Idempotent };
    }

    private ButtonDto MapButton(MethodInfo m)
    {
        var label = m.Find<ButtonAttribute>()?.Label
                    ?? m.Find<LabelAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new ButtonDto(T(label), Naming.CamelCase(m.Name))
        {
            Shortcut = m.Find<ShortcutAttribute>()?.Keys,
            Disabled = !Authorized(m.Find<DisabledUnlessAttribute>()),
        };
    }

    // Group fields into FormRow components of at most `maxColumns` (here 2).
    /// <summary>Whether two [Section] declarations describe the same section (every attribute equal).</summary>
    private static bool SameSection(SectionAttribute a, SectionAttribute b) =>
        a.Caption == b.Caption && a.Zone == b.Zone
        && a.PropertyList == b.PropertyList && a.Frameless == b.Frameless;

    /// <summary>Maps the section's properties to field DTOs, inserting a full-width separator
    /// above any [SeparatorBefore] property (mirrors Java's FormLayoutBuilder).</summary>
    private List<ClientSideComponentDto> MapFields(
        IEnumerable<PropertyInfo> props, object instance, bool readOnly = false)
    {
        var fields = new List<ClientSideComponentDto>();
        foreach (var p in props)
        {
            if (p.Find<SeparatorBeforeAttribute>() != null)
                fields.Add(Client(new SeparatorMetadataDto(
                    new Dictionary<string, string> { ["data-colspan"] = "2" }), null, []));
            fields.Add(IsIslandProperty(p)
                ? MapIslandField(p, instance, FormColumns(p.DeclaringType)) ?? MapField(p, instance, readOnly)
                : MapField(p, instance, readOnly));
        }
        return fields;
    }

    /// <summary>Stereotypes that render an intrinsically wide component: squeezed into one cell of a
    /// multi-column section is never what the developer meant (mirrors Java's
    /// FormLayoutBuilder.WIDE_STEREOTYPES).</summary>
    private static readonly HashSet<string> WideStereotypes = ["grid", "textarea", "richText", "html", "markdown"];

    /// <summary>An intrinsically wide field spans the full row of a multi-column section; an explicit
    /// [Colspan] greater than 1 always wins (Java: FormLayoutBuilder.widenIfIntrinsicallyWide).</summary>
    private static ClientSideComponentDto WidenIfIntrinsicallyWide(ClientSideComponentDto field, int columns) =>
        columns > 1 && field.Metadata is FormFieldMetadataDto { Colspan: <= 1 } ff
                    && ff.Stereotype is { } s && WideStereotypes.Contains(s)
            ? field with { Metadata = ff with { Colspan = columns } }
            : field;

    private static List<ComponentDto> FormRows(List<ClientSideComponentDto> fields, int maxColumns = 2)
    {
        var rows = new List<ComponentDto>();
        var pending = new List<ComponentDto>();
        var used = 0; // columns consumed by the pending row (fields carry a colspan)
        foreach (var declared in fields)
        {
            var field = WidenIfIntrinsicallyWide(declared, maxColumns);
            // A separator always takes a full row of its own (its data-colspan spans the columns).
            if (field.Metadata is SeparatorMetadataDto)
            {
                if (pending.Count > 0)
                {
                    rows.Add(Client(new FormRowMetadataDto(), null, pending));
                    pending = new List<ComponentDto>();
                    used = 0;
                }
                rows.Add(Client(new FormRowMetadataDto(), null, [field]));
                continue;
            }
            var span = field.Metadata switch
            {
                FormFieldMetadataDto ff => Math.Max(1, ff.Colspan),
                CustomFieldMetadataDto cf => Math.Max(1, cf.Colspan),
                _ => 1,
            };
            // A field that would overflow the row's remaining columns starts a new row (a colspan=2
            // field — e.g. a textarea — thus always lands on its own row). Mirrors Java's
            // FormLayoutBuilder.buildRows.
            if (pending.Count > 0 && used + span > maxColumns)
            {
                rows.Add(Client(new FormRowMetadataDto(), null, pending));
                pending = new List<ComponentDto>();
                used = 0;
            }
            pending.Add(field);
            used += span;
            if (used >= maxColumns)
            {
                rows.Add(Client(new FormRowMetadataDto(), null, pending));
                pending = new List<ComponentDto>();
                used = 0;
            }
        }
        if (pending.Count > 0)
            rows.Add(Client(new FormRowMetadataDto(), null, pending));
        return rows;
    }

    private static string InferDataType(Type t, PropertyInfo? p = null, bool plainText = false)
    {
        // A list-of-values field (e.g. [BulletedList]) is an array on the wire (Java parity).
        if (t.IsGenericType && typeof(System.Collections.IEnumerable).IsAssignableFrom(t) && t != typeof(string))
            return "array";
        if (t.IsEnum) return "string";
        if (t == typeof(bool)) return "bool";
        if (t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long)) return "integer";
        if (t == typeof(float) || t == typeof(double) || t == typeof(decimal))
            // A money field in a plain-text context upgrades its dataType to "money" so the renderer
            // formats it as currency (Java's FieldTypeMapper money branch).
            return p?.Find<MoneyAttribute>() != null && plainText ? "money" : "number";
        if (t == typeof(DateOnly) || t == typeof(DateTime)) return "date";
        return "string";
    }
}
