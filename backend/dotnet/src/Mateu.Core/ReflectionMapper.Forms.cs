using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Forms: sections, zones, tabs, folded layouts, fields and buttons (Java: SectionFormRenderer, FormLayoutBuilder, ReflectionFormFieldMapper, FieldTypeMapper).
internal sealed partial class ReflectionMapper
{
    /// <summary>A [FoldedLayout] section column: grows, and wraps below the previous one under 20rem.</summary>
    internal const string FoldedColumnStyle = "flex: 1 1 20rem; min-width: min(20rem, 100%);";

    /// <summary>Detail/edit/new form for a single CRUD entity, with a mode-specific toolbar.</summary>
    public ServerSideComponentDto MapEntityForm(Type crudType, Type element, object entity, string mode, string route,
        ICrudAffordances? drawerOf = null)
    {
        // a creation form starts with what the server generates for its [GeneratedValue] fields
        // (Java's GeneratedValueInitializer)
        if (mode == "new") GenerateValues(element, entity);
        // The page is named after the RECORD, as Java's CrudFormComponentBuilder does (getTitle(entity)):
        // the entity's [Title], else its own ToString(), else its class name — never the crud's title.
        var title = TitleOf(element, entity);
        // The toolbar exactly as Java's CrudFormComponentBuilder / ViewToolbarBuilder draw it: the way
        // back (Cancel / Back to list) is a tertiary button, the view page offers "Edit" (no "Add
        // another": that belongs to the create flow — the toast confirming a create offers it), and
        // an EDIT form saves through "save" ("create" is the creation form's).
        var toolbar = (mode switch
        {
            "view" => new List<ButtonDto>
            {
                new("Back to list", "cancel-view") { ButtonStyle = "tertiary" }, new("Edit", "edit"),
            },
            "edit" => [new("Cancel", "cancel-edit") { ButtonStyle = "tertiary" }, new("Save", "save") { ButtonStyle = "primary" }],
            _ /* new */ => [new("Cancel", "cancel-new") { ButtonStyle = "tertiary" }, new("Save", "create") { ButtonStyle = "primary" }],
        });
        // The crud's [ViewToolbarButton] methods lead the view page's toolbar (Java's ViewToolbarBuilder)
        if (mode == "view") toolbar.InsertRange(0, ViewToolbarButtons(crudType));
        // The edit drawer's "Save and next" (CrudDisplay.SaveAndNext, the Redwood
        // spPrimaryActionAndNext): saves and moves the drawer on to the next row — beside Save
        // (mirrors Java's CrudFormComponentBuilder).
        if (mode == "edit" && drawerOf is { } affordances && affordances.Display.SaveAndNext.Shown())
            toolbar.Insert(toolbar.Count - 1, new ButtonDto(T(affordances.SaveAndNextLabel), "save-and-next")
            {
                Disabled = !affordances.Display.SaveAndNext.Enabled(),
            });
        // Java's form Page carries the title only (no pageTitle) and the record-form style.
        var page = Client(new PageMetadataDto(title, null, null, toolbar, [])
            {
                TitleIsText = TitledByData(element, entity) ? true : null,
            }, null,
            InCrudForm(mode, () => DetailContent(entity, mode) ?? FormCards(element, entity, readOnly: mode == "view")))
            with { Style = "max-width:900px;margin: auto;" };
        // The entity's field values ARE the form state: seed them into initialData (and, via
        // FragmentResponse, the fragment state) so a view/edit form arrives prefilled — the values
        // no longer ride as per-field initialValue (Java parity).
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), crudType.FullName!, route, [page],
            InitialDataOf(element, entity),
            // The toolbar's actions, advertised: this port answers them in place (there is no
            // mediator above the form for them to bubble to, as in Java), and the web client only
            // SENDS what the component advertises — unadvertised, Save/Edit/Cancel did nothing.
            // Saving validates the form on the client first.
            // the entity's nested data objects' actions (nested-form-action-<field>-<method>) lead,
            // as Java's ActionMapper advertises them on the entity's record form
            [.. NestedFormActions(element), .. FieldActions(element), .. toolbar.Where(b => !b.ActionId!.StartsWith(ActionOnViewPrefix))
                .Select(b => new ActionDto(b.ActionId!, ValidationRequired: b.ActionId is "create" or "save")),
                .. mode == "view" ? ViewToolbarActions(crudType) : []],
            [], "width: 100%;", null, null)
        {
            // [Hidden]/[Disabled] on entity fields rule the detail form too.
            Rules = MapRules(element, entity),
            // the entity's constraints, checked on the client before Save like on any form (Python
            // parity; without them a required field only failed on the server, with no field marked)
            Validations = mode == "view" ? []
                : MapValidations(element, EditableProperties(element).Where(p => !HiddenInForm(p, mode)).ToList()),
            // A create/edit form IS a form page (Java's crud forms answer pageType "form") and
            // guards its unsaved changes, like Java's (automatic there): leaving it half-typed asked nothing.
            // A record's view is a detail page (Java's crud view answers "detail"); the crud's own
            // type (collection) describes its listing, not its records.
            PageType = mode == "view" ? "detail" : "form",
            ConfirmOnNavigationIfDirty = mode != "view",
        };
    }

    /// <summary>The record page's own content (Java's ViewRouteResolver + DetailContent): what an
    /// <see cref="IDetailContentSupplier"/> record returns, on the VIEW page only — the edit and
    /// create forms of the same class keep their forms. <c>null</c> = the read-only form.</summary>
    private static List<ComponentDto>? DetailContent(object entity, string mode) =>
        mode == "view" && entity is IDetailContentSupplier supplier && supplier.DetailContent() is { } content
            ? new List<ComponentDto> { ComponentMapper.Map(content) }
            : null;

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
        // The optimistic-lock [Version] is plumbing, not an input: it rides in the state (the save
        // compares it) but an editable form never shows it — it was an editable number, so a user
        // could type their way past the conflict check (Java's FormFieldFilter.hiddenInEditor).
        var props = EditableProperties(type).Where(Visible)
            .Where(p => readOnly || p.Find<VersionAttribute>() is null).ToList();
        // A tabbed form is wrapped in an (untitled) mateu-section Card just like a plain one — the
        // TabLayout is the card's body (Java parity: Card → Div → VerticalLayout → TabLayout).
        if (props.Any(p => p.Find<TabAttribute>() != null || p.Find<SubresourceAttribute>() != null))
            return [SectionCardOfBody(TabbedBody(type, props, instance, readOnly))];

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

        // [FoldedLayout]: the section cards side by side in one horizontal row (zones win). The
        // row wraps and each column has a basis and a floor, so at phone width the sections stack
        // instead of the second one being cut off at the screen edge (mirrors Java's
        // FOLDED_COLUMN_STYLE).
        if (type.Find<FoldedLayoutAttribute>() != null && sections.Count > 1)
            return [new ClientSideComponentDto(
                new HorizontalLayoutMetadataDto { Spacing = true, Wrap = true }, null,
                sections.Select((s, i) => (ComponentDto)new ClientSideComponentDto(
                    new DivMetadataDto(), null,
                    [SectionCard(
                        s.Title, MapFields(s.Props, instance, readOnly, SectionColumns(sectionAttrs[i], type)),
                        sectionAttrs[i], type, s.Props, titled: true)],
                    FoldedColumnStyle, null, null)).ToList(),
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
            s.Title, MapFields(s.Props, instance, readOnly, SectionColumns(sectionAttrs[i], type)),
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
                MapFields(sections[i].Props, instance, readOnly, SectionColumns(sectionAttrs[i], type)),
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
    /// <summary>A tabbed form's body: the properties declared BEFORE the first [Tab] in a form layout
    /// of their own above the tab strip, then the tabs (Java's FormTabArranger noTabFields +
    /// FormLayoutBuilder).</summary>
    private List<ComponentDto> TabbedBody(Type type, List<PropertyInfo> props, object instance, bool readOnly)
    {
        // every [Subresource] that opens no [Tab] of its own moves into the tab it names (Java's
        // Subresources.place)
        var movable = props.Where(p => p.Find<SubresourceAttribute>() is not null && p.Find<TabAttribute>() is null).ToList();
        var rest = props.Where(p => !movable.Contains(p)).ToList();
        var first = rest.FindIndex(p => p.Find<TabAttribute>() is not null);
        if (first < 0) first = rest.Count;
        var body = new List<ComponentDto>();
        if (first > 0)
        {
            var columns = FormColumns(type);
            body.Add(Client(new FormLayoutMetadataDto { MaxColumns = columns }, null,
                FormRows(MapFields(rest.Take(first).ToList(), instance, readOnly), columns)));
        }
        var groups = TabGroups(rest.Skip(first));
        PlaceSubresources(groups, movable);
        if (groups.Count > 0) body.Add(TabLayout(type, groups, instance, readOnly));
        return body;
    }

    /// <summary>A tab of a tabbed form: its label, [Tab] flags and properties.</summary>
    private sealed record TabGroup(string Name, bool Open, string? Key, string? Show, List<PropertyInfo> Props, string? Shortcut = null);

    /// <summary>Consecutive properties sharing a [Tab] name.</summary>
    private static List<TabGroup> TabGroups(IEnumerable<PropertyInfo> props)
    {
        var groups = new List<TabGroup>();
        var current = "Tab";
        foreach (var p in props)
        {
            var attr = p.Find<TabAttribute>();
            if (attr?.Name is { } n) current = n;
            if (groups.Count == 0 || groups[^1].Name != current)
                // The field that opens a group carries its [Tab(Open=...)] flag (mirrors the Java
                // pair.first().open() rule); fields before any [Tab] fall into the default group.
                groups.Add(new TabGroup(current, attr?.Open ?? false, attr?.Key, attr?.Show, [], attr?.Shortcut));
            groups[^1].Props.Add(p);
        }
        return groups;
    }

    private ComponentDto TabLayout(Type type, List<TabGroup> groups, object instance, bool readOnly)
    {
        // Only a tab explicitly marked [Tab(Open=true)] carries active on the wire; with none opened
        // the renderer defaults to the first tab (Java parity: the corpus emits no active by default).
        // a tab whose Show flag is off is not offered at all, its fields with it (Java's
        // FormLayoutBuilder + FeatureFlagGate); the tab the URL names (its Key as the route's last
        // segment) is the open one
        groups = groups.Where(g => RoutedTabs.Shows(g.Show)).ToList();
        var routedKey = RoutedTabs.RoutedTabKey(groups.Select(g => g.Key));
        var columns = FormColumns(type);
        var tabComps = groups.Select(g =>
        {
            var label = T(g.Name);
            var count = g.Props.Count(p => p.Find<SubresourceAttribute>() is not null);
            var fields = new List<ClientSideComponentDto>();
            foreach (var p in g.Props)
            {
                if (p.Find<SubresourceAttribute>() is not null || (IsOrchestratorType(p.PropertyType) && !IsEmbeddedView(p.PropertyType)))
                    fields.Add(MapOrchestratorField(p, instance, columns, (label, count, g.Props.Count)));
                else
                    // MapFields: a [SeparatorBefore] inside a tab paints its divider too
                    fields.AddRange(MapFields([p], instance, readOnly));
            }
            return (ComponentDto)Client(
                new TabMetadataDto(label)
                {
                    Active = routedKey is not null ? routedKey == g.Key : g.Open,
                    RouteKey = string.IsNullOrWhiteSpace(g.Key) ? null : g.Key,
                    Badge = SubresourceBadge(g.Props, instance),
                    Shortcut = string.IsNullOrWhiteSpace(g.Shortcut) ? null : g.Shortcut,
                }, null,
                [Client(new FormLayoutMetadataDto
                {
                    MaxColumns = columns,
                    LabelsAside = LabelsAsideInference.LabelsAside(
                        g.Props.Where(p => p.Find<SubresourceAttribute>() is null).ToList(), columns, type, T),
                }, null, FormRows(fields, columns))]);
        }).ToList();
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

    /// <summary>The form's column count: [FormLayout(Columns = …)] when declared, 2 for a zoned
    /// form, else inferred from the form's size — 1 column up to 6 visible fields, 2 from 7 on
    /// (mirrors Java's PageFormBuilder.getFormColumns; see <see cref="FormColumnsInference"/>).</summary>
    internal static int FormColumns(Type? type) => FormColumnsInference.FormColumns(type);

    /// <summary>A section's column count: its [Section(Columns)] when set, else the form's.</summary>
    private static int SectionColumns(SectionAttribute? section, Type? formType) =>
        section?.Columns >= 1 ? section.Columns : FormColumns(formType);

    private ClientSideComponentDto SectionCard(
        string? title, List<ClientSideComponentDto> fields, SectionAttribute? section = null,
        Type? formType = null, IReadOnlyList<PropertyInfo>? props = null, bool titled = false,
        int? columnsOverride = null)
    {
        // [Section(Columns = n)] wins over the form's count (Java's SectionFormRenderer.sectionColumns)
        var columns = columnsOverride ?? (section?.Columns >= 1 ? section.Columns : FormColumns(formType));
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
        // [Section(EditAction/AddAction/ViewMoreAction)]: "Add"/"Edit" on the title row, "View
        // more" under the content — plain buttons composed server-side (mirrors Java's
        // SectionAffordances). A section declaring none is untouched.
        var titleButtons = SectionTitleButtons(section);
        if (SectionViewMoreButton(section) is { } viewMore)
            body = Client(new VerticalLayoutMetadataDto(), null,
            [
                body,
                Client(new HorizontalLayoutMetadataDto(), null, [viewMore]) with
                {
                    Style = "justify-content: flex-end; width: 100%;",
                },
            ]) with { Style = "width: 100%;" };
        var hasTitleRow = titleButtons.Count > 0;
        if (hasTitleRow && !(titled && !string.IsNullOrWhiteSpace(title) && section?.Frameless != true))
            // the untitled / frameless paths draw no heading of their own: the affordances bring
            // their title row (the caption, possibly blank, plus the buttons)
            body = Client(new VerticalLayoutMetadataDto(), null,
                [SectionTitleRow(title, titleButtons), body]) with { Style = "width: 100%;" };
        // [Section(Frameless = true)]: no card wrapper, no padding — the content sits bare
        // (mirrors Java's @Section(frameless=true)).
        if (section?.Frameless == true)
            return Client(new DivMetadataDto(), null, [body]) with
            {
                Style = "flex: 1; min-width: 0; width:100%;" + section.Style,
            };
        // A titled section (one of several stacked or zoned sections) carries its title as an <h3>
        // Text inside the Card, and the Card takes the flex style (mirrors Java's SectionFormRenderer
        // when the section has a heading).
        if (titled && !string.IsNullOrWhiteSpace(title))
        {
            // the [Inline] nested objects' triggers: [Toolbar] on the title row, [Button] below
            // (Java's SectionFormRenderer.buildTitleRow + the button row; multi-section path only)
            var (inlineToolbar, inlineButtons) = InlineTriggers(props);
            var heading = inlineToolbar.Count > 0
                ? SectionTitleRow(title, [.. titleButtons, .. inlineToolbar]) with
                {
                    Metadata = new HorizontalLayoutMetadataDto { Spacing = true },
                }
                : hasTitleRow
                ? SectionTitleRow(title, titleButtons)
                : Client(new TextMetadataDto(T(title!)) { Container = "h3" }, null, []) with
                {
                    Style = " flex: 1; margin: 0;",
                };
            var inner = Client(new VerticalLayoutMetadataDto(), null, [body]) with
            {
                Style = "width: 100%;",
            };
            var contentChildren = new List<ComponentDto> { heading, inner };
            if (inlineButtons.Count > 0)
                contentChildren.Add(Client(new HorizontalLayoutMetadataDto { Spacing = false }, null, inlineButtons) with
                {
                    Style = "justify-content: flex-end; width: 100%;",
                });
            var content = Client(new VerticalLayoutMetadataDto(), null, contentChildren) with
            {
                Style = string.IsNullOrEmpty(section?.Style) ? null : section.Style,
            };
            return Client(new CardMetadataDto(content), null, []) with
            {
                CssClasses = SectionCssClasses(section),
                Style = "flex: 1; min-width: 0; width:100%;" + StickyStyle(section),
            };
        }
        // A single untitled section maps to an outlined Card carrying the "mateu-section" marker
        // class; its body nests under metadata.content as Div → VerticalLayout → body (mirrors Java's
        // SectionFormRenderer / CardMapper). The section TITLE does not travel as a FormSection — the
        // golden simple sections carry no title member on the Card.
        return section?.Sticky == true
            ? SectionCardOfBody(body) with { CssClasses = SectionCssClasses(section), Style = StickyStyle(section) }
            : SectionCardOfBody(body);
    }

    /// <summary>The marker class every section card carries, plus the sticky one (Java's
    /// SectionFormRenderer.sectionCssClasses).</summary>
    private static string SectionCssClasses(SectionAttribute? section) =>
        "mateu-section" + (section?.Sticky == true ? " mateu-section--sticky" : "");

    /// <summary>A [Section(Sticky = true)] card is pinned while the rest scrolls (Java's stickyStyle).</summary>
    private static string StickyStyle(SectionAttribute? section) =>
        section?.Sticky == true ? "position: sticky; top: var(--mateu-sticky-top, 0.5rem); z-index: 2;" : "";

    /// <summary>Wraps an arbitrary body component in an untitled mateu-section Card
    /// (Card → Div → VerticalLayout → body) — the shape a plain form section AND a tabbed form use.</summary>
    private static ClientSideComponentDto SectionCardOfBody(ClientSideComponentDto body) =>
        SectionCardOfBody([body]);

    private static ClientSideComponentDto SectionCardOfBody(IReadOnlyList<ComponentDto> body)
    {
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, body) with
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
        // inside a nested form the id carries the nested fields' prefix ("supplier-name")
        var fieldId = PrefixedFieldId(p);
        // [ContentSlot]: a hole for managed content — the property's value is irrelevant, the slot
        // is resolved by the server against the content remote (Java: the @ContentSlot branch of
        // ReflectionFormFieldMapper; see MicroFrontendServerResolver)
        if (p.Find<ContentSlotAttribute>() is { } slot)
            return ComponentMapper.Map(new ContentSlot(slot.Key)
            {
                Fallback = string.IsNullOrWhiteSpace(slot.Fallback) ? null : slot.Fallback,
                TimeoutMs = slot.TimeoutMs > 0 ? slot.TimeoutMs : null,
                Description = string.IsNullOrWhiteSpace(slot.Description) ? null : slot.Description,
                DegradeToClient = slot.DegradeToClient,
                Style = "width: 100%;",
            });
        if (GridRowType(p) is { } rowType) return MapGridField(p, rowType, instance, readOnly);
        // [Text]: the value shown as a text block bound to the state (Java: the @Text branch of
        // ReflectionFormFieldMapper).
        if (p.Find<TextAttribute>() is { } text)
            return Client(new TextMetadataDto(StateExpression(fieldId))
            {
                Container = text.Container,
                Size = text.Size,
                NoMargins = text.NoMargins,
            }, fieldId, []);
        // [Notice] on a string property: its VALUE is an inline notice's text, bound to the state
        // (Java: the @Notice branch of ReflectionFormFieldMapper)
        if (p.Find<NoticeAttribute>() is { } notice)
            return ComponentMapper.Map(new Notice(StateExpression(fieldId))
            {
                Theme = notice.Theme,
                Icon = string.IsNullOrEmpty(notice.Icon) ? null : notice.Icon,
                Slim = notice.Slim,
                FullWidth = notice.FullWidth,
                ActionLabel = string.IsNullOrEmpty(notice.ActionLabel) ? null : T(notice.ActionLabel),
                ActionId = string.IsNullOrEmpty(notice.ActionId) ? null : notice.ActionId,
            }) with { Id = fieldId };
        var label = T(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        var required = p.Find<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        // an IOptionsSupplier view wins (its options may carry Children → tree selects);
        // enums keep contributing their constants
        var options = instance is IOptionsSupplier supplier
                      && supplier.Options(Naming.CamelCase(p.Name)) is { Count: > 0 } supplied
            ? supplied.Select(MapOption).ToList()
            : (t.IsEnum ? t : ElementEnum(t)) is { } choices
                // value = the constant name; label = its [Label], else the name humanized
                // (Java: FieldMetadataExtractor.enumLabel) — a List<Enum> offers its constants too
                ? Enum.GetNames(choices).Select(n => new OptionDto(n, EnumLabel(choices, n))).ToList()
                : new List<OptionDto>();
        // A [PlainText] field — or any field of a [PlainText] class — renders as read-only text.
        var plainText = p.Find<PlainTextAttribute>() != null
                        || p.DeclaringType?.Find<PlainTextAttribute>() != null;
        var multiline = p.Find<MultilineAttribute>() != null;
        var stereotype = StereotypeOf(p, plainText, multiline);

        // [ReadOnly] on the property locks it (Java's field-level @ReadOnly → readOnly on the wire);
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
            ReadOnly = readOnly || p.Find<ReadOnlyAttribute>() != null || readOnlyByPermission
                       // generated by the server; editable on the creation form only (Java's
                       // PageFormBuilder.isReadOnly)
                       || p.Find<GeneratedValueAttribute>() != null || LockedOutsideCreation(p),
            Multiline = multiline,
            Options = options,
            TreeLeavesOnly = p.Find<TreeSelectAttribute>()?.LeavesOnly ?? false,
            // An integer field shows the +/- step buttons; a textarea spans both columns (Java
            // parity). initialValue is NOT emitted per field — the values ride in initialData/state.
            StepButtonsVisible = t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long),
            // [Colspan(n)] wins; otherwise 1 — an intrinsically wide widget (textarea, rich text…)
            // is widened to the full row by FormRows, which knows the section's column count.
            Colspan = p.Find<ColspanAttribute>()?.Value ?? 1,
            // [Help]: the field's help text (Java's @Help → FormFieldDto.description)
            Description = p.Find<HelpAttribute>() is { } help ? T(help.Value) : null,
            SliderMin = p.Find<SliderMinAttribute>()?.Value ?? 0,
            SliderMax = p.Find<SliderMaxAttribute>()?.Value ?? 100,
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
            Attributes = FieldAttributes(p),
            // [OptionsLayout(Columns)]: the options laid out in columns (Java's getOptionsColumns)
            OptionsColumns = p.Find<OptionsLayoutAttribute>()?.Columns ?? 1,
            // [Style]: the field's own style, on the field and its wrapper (Java's FieldMapper)
            Style = p.Find<Mateu.Uidl.StyleAttribute>()?.Value,
        };
        // [Autocomplete]: the input's purpose (WCAG 1.3.5); an editable email field infers "email"
        meta = meta with { Autocomplete = InputPurpose.Of(p.Find<AutocompleteAttribute>()?.Value, meta.Stereotype, meta.ReadOnly) };
        // an upload field of a registered IFileStorage, editable: where and how it uploads
        if (stereotype == "fileUpload")
            meta = meta with { Attributes = [.. meta.Attributes, .. UploadAttributes(p, fieldId, meta.ReadOnly || plainText)] };
        return Client(meta, fieldId, []) with { Style = p.Find<Mateu.Uidl.StyleAttribute>()?.Value };
    }

    /// <summary>The upload options of a fileUpload field (design/uploads/file-uploads-contract.md §1):
    /// the declared <c>maxBytes</c> / <c>multiple</c> / <c>storage</c>, and — only when a matching
    /// <see cref="IFileStorage"/> is registered and the field is editable — <c>uploadUrl</c>, the signed
    /// <c>uploadTicket</c> and <c>uploadDirect</c>. No ticket → the client keeps the data-URI fallback.</summary>
    private static List<PairDto> UploadAttributes(PropertyInfo p, string fieldId, bool readOnly)
    {
        var declared = p.Find<FileUploadAttribute>();
        var attributes = new List<PairDto>();
        var multiple = (declared?.Multiple ?? false) || IsStringList(p.PropertyType);
        if (declared is { MaxBytes: > 0 })
            attributes.Add(new PairDto("maxBytes", declared.MaxBytes.ToString(System.Globalization.CultureInfo.InvariantCulture)));
        if (multiple) attributes.Add(new PairDto("multiple", "true"));
        if (!string.IsNullOrWhiteSpace(declared?.Storage)) attributes.Add(new PairDto("storage", declared.Storage));
        // the reserved "inline" storage never uses a store: the value stays a data URI
        if (readOnly || declared?.Storage == FileUploadAttribute.Inline
            || FileUploads.Current is not { } uploads || uploads.Find(declared?.Storage) is not { } store)
            return attributes;
        var maxBytes = declared is { MaxBytes: > 0 } ? declared.MaxBytes : FileUploads.DefaultMaxBytes;
        attributes.Add(new PairDto("uploadUrl", FileUploads.UploadPath));
        attributes.Add(new PairDto("uploadTicket", uploads.Issue(store.Name, fieldId, maxBytes,
            declared?.Accept ?? "", multiple, uploads.Caller())));
        if (store.DirectUploads) attributes.Add(new PairDto("uploadDirect", "true"));
        return attributes;
    }

    /// <summary>A collection of strings (List&lt;string&gt;, string[], IEnumerable&lt;string&gt;…): several files.</summary>
    private static bool IsStringList(Type t) =>
        t != typeof(string) && (t == typeof(string[])
            || (t.IsGenericType && t.GetGenericArguments() is [var arg] && arg == typeof(string)
                && typeof(System.Collections.IEnumerable).IsAssignableFrom(t)));

    /// <summary>Fills every [GeneratedValue] property of a fresh record with its generator's value
    /// (the generator is created with its parameterless constructor — the port's idiom for every
    /// class the mapper instantiates).</summary>
    internal static void GenerateValues(Type element, object entity)
    {
        foreach (var p in EditableProperties(element))
        {
            if (p.Find<GeneratedValueAttribute>() is not { } generated) continue;
            if (Activator.CreateInstance(generated.Generator) is not IValueGenerator generator) continue;
            var value = generator.Generate();
            try { p.SetValue(entity, value is null ? null : SyncHandler.ConvertValue(value, p.PropertyType)); }
            catch (ArgumentException) { /* a generator of another type: the field keeps its value */ }
        }
    }

    /// <summary>The field's generic attributes (Java's FieldMetadataExtractor.getAttributes):
    /// [DivStyle] as <c>divStyle</c>, [FileUpload(Accept)] as <c>accept</c>.</summary>
    private static List<PairDto> FieldAttributes(PropertyInfo p)
    {
        var attributes = new List<PairDto>();
        if (p.Find<DivStyleAttribute>() is { } divStyle) attributes.Add(new PairDto("divStyle", divStyle.Value));
        if (p.Find<FileUploadAttribute>() is { Accept.Length: > 0 } fileUpload)
            attributes.Add(new PairDto("accept", fileUpload.Accept));
        return attributes;
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
    internal static OptionDto MapOption(Option option) => new(option.Value, option.Label)
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
        // a List/Set of enum constants with no stereotype: pick several (Java's ChoiceCollections;
        // owner, 2026-10-12)
        if (ElementEnum(p.PropertyType) is not null) return "multiSelect";
        // slider bounds make it a slider (Java's FieldTypeMapper)
        if (p.Find<SliderMinAttribute>() != null || p.Find<SliderMaxAttribute>() != null) return "slider";
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
        _ => TemporalWire.Format(value) as string ?? value.ToString(),
    };

    /// <summary>A form's field values as the initialData/state map (fieldId → value): a grid property
    /// travels as its list of row dicts, everything else as its typed value. Java emits these on the
    /// component's initialData and the fragment state, instead of a per-field initialValue.</summary>
    /// <summary>An entity's field values as wire state (what a form's initialData carries).</summary>
    internal Dictionary<string, object?> EntityState(Type type, object instance) => InitialDataOf(type, instance);

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
            // a nested data object travels as a nested map (and, in the fragment state, flattened)
            if (IsNestedFormProperty(p))
            {
                data[Naming.CamelCase(p.Name)] = p.GetValue(instance) is { } nested ? NestedStateOf(nested) : null;
                continue;
            }
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
        Enum e => e.ToString(),
        _ => TemporalWire.Format(value),
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
        // a method answering a LongTask streams its progress: the client calls it over SSE
        if (method?.ReturnType == typeof(LongTaskRun)) action = action with { Sse = true };
        var options = method?.Find<ActionOptionsAttribute>();
        if (options is null) return action;
        return ActionOptionsOf(action, options);
    }

    /// <summary>A [Toolbar] method as a header toolbar button (Java's @Toolbar).</summary>
    private ButtonDto MapToolbarButton(MethodInfo m)
    {
        var toolbar = m.Find<ToolbarAttribute>()!;
        var label = toolbar.Label ?? m.Find<LabelAttribute>()?.Value ?? Naming.Humanize(m.Name);
        return new ButtonDto(T(label), Naming.CamelCase(m.Name))
        {
            ButtonStyle = Unset(toolbar.ButtonStyle),
            Color = Unset(toolbar.ButtonColor),
            Size = Unset(toolbar.ButtonSize),
            SeparatorBefore = toolbar.SeparatorBefore,
            Shortcut = m.Find<ShortcutAttribute>()?.Keys,
            Disabled = !Authorized(m.Find<DisabledUnlessAttribute>()),
        };
    }

    /// <summary>A [Toolbar] appearance member: blank or "none" means unset, so the renderer keeps
    /// its default (Java's ToolbarButtons.styleOf/colorOf/sizeOf).</summary>
    private static string? Unset(string? value) =>
        string.IsNullOrWhiteSpace(value) || value == "none" ? null : value;

    /// <summary>The [ListToolbarButton] methods of <paramref name="type"/> as listing toolbar
    /// buttons and their advertised actions (Java's ToolbarButtons.listToolbarButton /
    /// toolbarAction): dressed by a [Toolbar] on the same method (style, colour, size, separator),
    /// ordered by its Order (stable), behaving as an [ActionOptions] on it declares —
    /// confirmation texts, transport knobs — with the placement's confirmation/selection flags
    /// OR-ed in. Methods the caller may not see are left out (refused on invocation anyway).</summary>
    /// <para><paramref name="plain"/> (a listing with no interaction capability, Java's
    /// PageListingBuilder): an unlabelled button carries the bare (camelCased) method name, as
    /// Java's does there; a crud's or a bridged listing's is humanised and translated.</para>
    private (List<ButtonDto> Buttons, List<ActionDto> Actions) BulkToolbar(Type type, string prefix, bool bubble,
        bool plain = false)
    {
        var buttons = new List<ButtonDto>();
        var actions = new List<ActionDto>();
        foreach (var m in type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                     .Where(m => !m.IsSpecialName && m.Find<ListToolbarButtonAttribute>() != null
                                 && Authorized(m.Find<EyesOnlyAttribute>()))
                     .OrderBy(m => m.Find<ToolbarAttribute>()?.Order ?? 0))
        {
            var bulk = m.Find<ListToolbarButtonAttribute>()!;
            var look = m.Find<ToolbarAttribute>();
            var actionId = prefix + Naming.CamelCase(m.Name);
            var declared = m.Find<LabelAttribute>()?.Value;
            var label = plain ? declared ?? Naming.CamelCase(m.Name) : T(declared ?? Naming.Humanize(m.Name));
            buttons.Add(new ButtonDto(label, actionId)
            {
                ButtonStyle = Unset(look?.ButtonStyle),
                Color = Unset(look?.ButtonColor),
                Size = Unset(look?.ButtonSize),
                SeparatorBefore = look?.SeparatorBefore ?? false,
                RowsSelectedRequired = bulk.RowsSelectedRequired,
            });
            var action = new ActionDto(actionId, ValidationRequired: false,
                ConfirmationRequired: bulk.ConfirmationRequired,
                RowsSelectedRequired: bulk.RowsSelectedRequired,
                Bubble: bubble);
            actions.Add(m.Find<ActionOptionsAttribute>() is { } options ? ActionOptionsOf(action, options) : action);
        }
        return (buttons, actions);
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
        && a.PropertyList == b.PropertyList && a.Frameless == b.Frameless
        && a.EditAction == b.EditAction && a.AddAction == b.AddAction
        && a.ViewMoreAction == b.ViewMoreAction
        && a.Sticky == b.Sticky && a.Columns == b.Columns && a.Style == b.Style;

    // ── Section affordances ([Section(EditAction/AddAction/ViewMoreAction)], Java's
    // SectionAffordances): the named methods' wire ids are their camelCase names.

    /// <summary>Every action id the form's section affordances dispatch (advertised on the view).</summary>
    internal static IEnumerable<string> SectionActionIds(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Select(p => p.Find<SectionAttribute>())
            .Where(s => s is not null)
            .SelectMany(s => new[] { s!.AddAction, s.EditAction, s.ViewMoreAction })
            .Where(a => !string.IsNullOrWhiteSpace(a))
            .Select(a => Naming.CamelCase(a))
            .Distinct();

    private ClientSideComponentDto SectionAffordance(string kind, string action, string label)
    {
        var actionId = Naming.CamelCase(action);
        return Client(new ButtonMetadataDto(T(label), actionId) { ButtonStyle = "tertiary" },
            $"section-{kind}-{actionId}", []);
    }

    /// <summary>"Add" and "Edit" — the title-row affordances, in that order.</summary>
    private List<ComponentDto> SectionTitleButtons(SectionAttribute? section)
    {
        var buttons = new List<ComponentDto>();
        if (section is null) return buttons;
        if (!string.IsNullOrWhiteSpace(section.AddAction))
            buttons.Add(SectionAffordance("add", section.AddAction, "Add"));
        if (!string.IsNullOrWhiteSpace(section.EditAction))
            buttons.Add(SectionAffordance("edit", section.EditAction, "Edit"));
        return buttons;
    }

    /// <summary>"View more" — under the section's content.</summary>
    private ClientSideComponentDto? SectionViewMoreButton(SectionAttribute? section) =>
        section is not null && !string.IsNullOrWhiteSpace(section.ViewMoreAction)
            ? SectionAffordance("view-more", section.ViewMoreAction, "View more")
            : null;

    /// <summary>The section title (an h3, possibly blank) with the affordance buttons beside it.</summary>
    private ClientSideComponentDto SectionTitleRow(string? title, List<ComponentDto> buttons)
    {
        var heading = Client(new TextMetadataDto(T(title ?? "")) { Container = "h3" }, null, []) with
        {
            Style = " flex: 1; margin: 0;",
        };
        return Client(new HorizontalLayoutMetadataDto(), null, [heading, .. buttons]) with
        {
            Style = "align-items: center; width: 100%;",
        };
    }

    /// <summary>Maps the section's properties to field DTOs, inserting a full-width separator
    /// above any [SeparatorBefore] property (mirrors Java's FormLayoutBuilder).</summary>
    private List<ClientSideComponentDto> MapFields(
        IEnumerable<PropertyInfo> props, object instance, bool readOnly = false, int? columns = null)
    {
        var fields = new List<ClientSideComponentDto>();
        foreach (var p in props)
        {
            if (p.Find<SeparatorBeforeAttribute>() != null)
                fields.Add(Client(new SeparatorMetadataDto(
                    new Dictionary<string, string> { ["data-colspan"] = "2" }), null, []));
            // a property holding a fluent component with nothing in it renders nothing (never a field)
            if (IsComponentProperty(p) && p.GetValue(instance) is null) continue;
            // a data object: a nested form, spanning the section's row
            if (IsNestedFormProperty(p))
            {
                fields.Add(MapNestedFormField(p, instance, readOnly, columns ?? FormColumns(p.DeclaringType)));
                continue;
            }
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
            if (field.Metadata is SeparatorMetadataDto separator)
            {
                field = field with
                {
                    Metadata = separator with
                    {
                        Attributes = new Dictionary<string, string> { ["data-colspan"] = maxColumns.ToString() },
                    },
                };
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
        if (t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long)
            || t == typeof(System.Numerics.BigInteger)) return "integer";
        if (t == typeof(float) || t == typeof(double) || t == typeof(decimal))
            // A money field in a plain-text context upgrades its dataType to "money" so the renderer
            // formats it as currency (Java's FieldTypeMapper money branch).
            return p?.Find<MoneyAttribute>() != null && plainText ? "money" : "number";
        if (t == typeof(DateOnly)) return "date";
        // a DateTime carries a time (Java's LocalDateTime): mapped as a date, the time was dropped
        // on the first round trip
        if (t == typeof(DateTime) || t == typeof(DateTimeOffset)) return "dateTime";
        if (t == typeof(TimeOnly)) return "time";
        return "string";
    }

    /// <summary>The enum of a List/Set/array of enum constants, else null.</summary>
    internal static Type? ElementEnum(Type t)
    {
        if (t.IsArray) return t.GetElementType() is { IsEnum: true } e ? e : null;
        if (t == typeof(string) || !t.IsGenericType || !typeof(System.Collections.IEnumerable).IsAssignableFrom(t)) return null;
        var args = t.GetGenericArguments();
        return args.Length == 1 && args[0].IsEnum ? args[0] : null;
    }
}
