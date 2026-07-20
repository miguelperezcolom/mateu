using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Turns an annotated C# view instance into the Mateu component tree (App→Page→Card→…→FormField).</summary>
public sealed class ReflectionMapper(ITranslator? translator = null, Func<Identity?>? identity = null)
{
    /// <summary>Translates a user-facing string when a translator is registered, else returns it unchanged.</summary>
    private string T(string s) => translator?.Translate(s) ?? s;

    /// <summary>Whether the caller passes <paramref name="gate"/> (mirrors Java's Authorizer):
    /// AND across declared dimensions, OR within each; nothing declared → unrestricted; no
    /// identity → unauthorized.</summary>
    private bool Authorized(IdentityGatedAttribute? gate)
    {
        if (gate is null) return true;
        if (gate.Roles.Length + gate.Groups.Length + gate.Scopes.Length + gate.Permissions.Length == 0)
            return true;
        if (identity?.Invoke() is not { } id) return false;
        return Matches(gate.Roles, id.Roles) && Matches(gate.Groups, id.Groups)
               && Matches(gate.Scopes, id.Scopes) && Matches(gate.Permissions, id.Permissions);

        static bool Matches(string[] declared, IReadOnlyList<string>? held) =>
            declared.Length == 0 || (held is not null && declared.Any(held.Contains));
    }

    /// <summary>The audience projection active for the request being handled (the appState value
    /// under "audience", i.e. the [AppContext] selector named audience); null → no projection.
    /// AsyncLocal because the mapper is shared by the singleton SyncHandler across requests.</summary>
    private static readonly AsyncLocal<string?> Audience = new();

    /// <summary>Activates (or clears) the audience projection for the current request flow.</summary>
    internal static void SetCurrentAudience(string? audience) =>
        Audience.Value = string.IsNullOrWhiteSpace(audience) ? null : audience;

    /// <summary>[Audience(...)]: shown when no audience is set (full view) or when the declared
    /// values contain the current one. A UX projection, NOT security (that's [EyesOnly]).</summary>
    internal static bool ForCurrentAudience(MemberInfo member) =>
        member.Find<AudienceAttribute>() is not { } gate
        || Audience.Value is not { } current
        || gate.Audiences.Contains(current);

    /// <summary>[EyesOnly]: the member is visible only to authorized callers; an unmatched
    /// [Audience] projects it out as well.</summary>
    private bool Visible(MemberInfo member) =>
        Authorized(member.Find<EyesOnlyAttribute>()) && ForCurrentAudience(member)
        // [Timestamp] properties render as the header "last updated" text, never as form fields.
        && member.Find<Mateu.Uidl.TimestampAttribute>() == null;

    /// <summary>OnCustomEvent triggers (from [SubscribeTo]) and the [Emits] name for a view type.</summary>
    private static (List<object> Triggers, string? EmitsName) EventsOf(Type type)
    {
        var triggers = type.GetCustomAttributes<SubscribeToAttribute>()
            .Select(s => (object)new CustomTriggerDto(s.Event, s.Action)).ToList();
        return (triggers, type.Find<EmitsAttribute>()?.Name);
    }

    /// <summary>Builds the App shell (header + menu) from an [App] class's [MenuItem] methods.</summary>
    /// <summary>The navigation chrome (mirrors Java's AppMetadataExtractor.getVariant): an
    /// explicit [App(Variant = …)] always wins; a menu with folders → TILES when a folder nests
    /// another folder, HAMBURGUER_MENU past 7 top-level entries, else MENU_ON_TOP; a flat menu of
    /// leaf entries → TABS.</summary>
    private static string VariantOf(AppAttribute app, List<MenuItemDto> items)
    {
        if (app.Variant.Length > 0) return app.Variant;
        if (items.Any(i => i.Submenus.Count > 0))
        {
            if (items.Any(i => i.Submenus.Any(s => s.Submenus.Count > 0))) return "TILES";
            return items.Count > 7 ? "HAMBURGUER_MENU" : "MENU_ON_TOP";
        }
        return "TABS";
    }

    public ClientSideComponentDto MapApp(Type appType, string? requestBaseUrl = null)
    {
        var app = appType.GetCustomAttribute<AppAttribute>()!;
        // [MenuItem(Group = "…")] entries sharing a Group nest as that folder's submenu (the
        // folder appears where its first entry was declared); ungrouped entries stay leaves.
        var items = new List<MenuItemDto>();
        var folders = new Dictionary<string, List<MenuItemDto>>();
        foreach (var m in appType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                     .Where(m => m.Find<MenuItemAttribute>() != null && ForCurrentAudience(m)))
        {
            var entry = MapMenuItem(m);
            var group = m.Find<MenuItemAttribute>()!.Group;
            if (group.Length == 0)
            {
                items.Add(entry);
            }
            else if (folders.TryGetValue(group, out var submenu))
            {
                submenu.Add(entry);
            }
            else
            {
                var submenus = new List<MenuItemDto> { entry };
                folders[group] = submenus;
                items.Add(new MenuItemDto(T(group), "", "") { Submenus = submenus });
            }
        }
        // [RemoteMenu] entries: federated options — the frontend fetches the remote backend's
        // menu itself and mounts its views (no server-side proxying).
        items.AddRange(appType.GetCustomAttributes<RemoteMenuAttribute>()
            .Select(r => new MenuItemDto(T(r.Label), r.Route, "")
            {
                Remote = true,
                BaseUrl = r.BaseUrl,
                Explode = r.Explode,
                ConsumedRoute = "_empty",
            }));
        var variant = VariantOf(app, items);
        var home = items.FirstOrDefault();
        var meta = new AppMetadataDto(T(app.Title), variant, items)
        {
            HomeRoute = home?.Route ?? "",
            HomeConsumedRoute = home?.ConsumedRoute ?? "",
            HomeBaseUrl = requestBaseUrl ?? "",
            HomeServerSideType = home?.ServerSideType ?? "",
            ServerSideType = appType.FullName!,
            SseUrl = appType.Find<AIAttribute>()?.Sse,
            ContextSelectors = MapContextSelectors(appType),
            ContextActions = MapContextActions(appType),
            NotificationsEnabled = typeof(INotificationsSupplier).IsAssignableFrom(appType),
            // ⌘K palette entity search: the app class implements IGlobalSearchSupplier → the
            // palette also asks _globalsearch (mirrors AppMapper's globalSearchEnabled).
            GlobalSearchEnabled = typeof(IGlobalSearchSupplier).IsAssignableFrom(appType),
            // Command center (Ask-Oracle): the FAB + full-screen palette; chromeless implies it.
            CommandCenterEnabled = app.CommandCenter || app.Chromeless,
            Chromeless = app.Chromeless,
        };
        return new ClientSideComponentDto(meta, "ux_main_app", [], null, null, null);
    }

    /// <summary>Header action buttons next to the context selectors: the app class implements
    /// IAppActionsSupplier and decides on every shell build which actions exist (visibility
    /// follows server-side state). Each ActionId dispatches against the app class: the method
    /// with that name runs.</summary>
    private static IReadOnlyList<AppHeaderActionDto> MapContextActions(Type appType)
    {
        if (!typeof(IAppActionsSupplier).IsAssignableFrom(appType)
            || Activator.CreateInstance(appType) is not IAppActionsSupplier supplier)
            return [];
        var actions = supplier.AppActions();
        return actions is null ? [] : actions.Select(MapHeaderAction).ToList();
    }

    private static AppHeaderActionDto MapHeaderAction(AppHeaderAction action) =>
        new(action.ActionId, action.Label, action.Icon,
            action.Children?.Select(MapHeaderAction).ToList());

    /// <summary>[AppContext] members of the app class become header context selectors: an enum
    /// property contributes its constants, a method its returned (value, label) pairs.</summary>
    private IReadOnlyList<AppContextSelectorDto> MapContextSelectors(Type appType)
    {
        var selectors = new List<AppContextSelectorDto>();
        foreach (var property in appType.GetProperties())
        {
            var attribute = property.Find<AppContextAttribute>();
            if (attribute is null || !property.PropertyType.IsEnum) continue;
            var options = Enum.GetNames(property.PropertyType)
                .Select(name => new OptionDto(name, Naming.Humanize(name)))
                .ToList();
            selectors.Add(new AppContextSelectorDto(
                Naming.CamelCase(property.Name),
                attribute.Label != "" ? T(attribute.Label) : Naming.Humanize(property.Name),
                options));
        }
        foreach (var method in appType.GetMethods())
        {
            var attribute = method.Find<AppContextAttribute>();
            if (attribute is null) continue;
            var options = new List<OptionDto>();
            if (method.GetParameters().Length == 0
                && Activator.CreateInstance(appType) is { } instance
                && method.Invoke(instance, null) is System.Collections.IEnumerable values)
            {
                foreach (var value in values)
                {
                    if (value is OptionDto option) options.Add(option);
                }
            }
            selectors.Add(new AppContextSelectorDto(
                Naming.CamelCase(method.Name),
                attribute.Label != "" ? T(attribute.Label) : Naming.Humanize(method.Name),
                options));
        }
        return selectors;
    }

    private MenuItemDto MapMenuItem(MethodInfo m)
    {
        var viewType = m.ReturnType;
        var route = "/" + (viewType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");
        var label = m.Find<MenuItemAttribute>()?.Label
                    ?? viewType.Find<TitleAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new MenuItemDto(T(label), route, viewType.FullName!) { ConsumedRoute = route };
    }

    public ServerSideComponentDto MapView(Type type, object instance, string route)
    {
        var crudElement = CrudElementType(type);
        if (crudElement is not null) return MapCrud(type, crudElement, route, instance);
        if (ListingTypes(type) is { } listing) return MapListing(type, listing.Filters, listing.Row, route);

        var title = T(type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name));

        var buttons = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<ButtonAttribute>() != null && ForCurrentAudience(m))
            .Select(MapButton).ToList();
        var fabs = Fabs(type);
        // Both [Button] and [Fab] methods are server-side actions the renderer can invoke.
        var actions = buttons.Select(b => new ActionDto(b.ActionId))
            .Concat(fabs.Select(f => new ActionDto(f.ActionId))).ToList();
        // [OnRowSelected] grid actions must be advertised or the renderer drops the row click.
        actions.AddRange(EditableProperties(type)
            .Select(p => p.Find<OnRowSelectedAttribute>())
            .Where(a => a is not null)
            .Select(a => new ActionDto(Naming.CamelCase(a!.Value), ValidationRequired: false))
            .Where(a => actions.All(x => x.Id != a.Id)));

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
            content = FormCards(type, instance, type.Find<ReadOnlyAttribute>() != null);
        }

        // A [WelcomeBanner] prepends a centered HeroSection (id "welcome-banner") to the page
        // content — the hero IS the banner, there is no new wire type; an empty Title falls back
        // to the view's [Title]. (Mirrors Java's ReflectionPageMapper.mapToPageComponent.)
        if (WelcomeBannerOf(type) is { } banner)
            content.Insert(0, Client(new HeroSectionMetadataDto(
                banner.Title.Length > 0 ? T(banner.Title) : title,
                banner.Subtitle.Length > 0 ? T(banner.Subtitle) : null,
                banner.Image.Length > 0 ? banner.Image : null,
                null, true), "welcome-banner", []));

        var compact = type.Find<CompactAttribute>() != null;
        var pageMeta = new PageMetadataDto(
            title, title, OptT(type.Find<SubtitleAttribute>()?.Value), [], buttons)
        {
            Toc = type.Find<TocAttribute>()?.Value,
            PageWidth = PageWidthOf(type, instance),
            PageType = PageTypeOf(type),
            Banners = Banners(type, instance),
            Badges = Badges(type, instance),
            Kpis = Kpis(type, instance),
            Fabs = fabs,
            PeerNav = PeerNavOf(instance),
            Timestamp = TimestampOf(type, instance),
        };
        var page = new ClientSideComponentDto(
            pageMeta, null, content, compact ? "--mateu-compact:1" : null, null, null);

        var (triggers, emits) = EventsOf(type);
        var initialData = new Dictionary<string, object?>();
        if (instance is IComponentTreeSupplier)
        {
            // Tree-supplier views (archetypes): scalar properties are the view's state — seed
            // them into initialData so they round-trip through componentState (search text,
            // selection, switcher value…).
            foreach (var p in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!p.CanRead || !p.CanWrite) continue;
                var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
                if (t != typeof(string) && !t.IsPrimitive && !t.IsEnum && t != typeof(decimal)) continue;
                initialData[Naming.CamelCase(p.Name)] = p.GetValue(instance);
            }
            if (instance is IRefreshOnChange refresh)
            {
                // any field change re-renders the view in place (debounced) — the AutoSave
                // trigger the shared frontend already honors
                triggers = [.. triggers, new
                {
                    type = "AutoSave", actionId = refresh.RefreshActionId,
                    debounceMillis = refresh.RefreshDebounceMillis,
                }];
            }
        }
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            [page], initialData, actions, triggers, null, null, null)
        {
            EmitsName = emits,
            ConfirmOnNavigationIfDirty = type.Find<ConfirmOnNavigationIfDirtyAttribute>() != null,
            Rules = MapRules(type, instance),
            PageWidth = PageWidthOf(type, instance),
            PageType = PageTypeOf(type),
        };
    }

    /// <summary>Client-side rules of a view (mirrors Java's RuleMapper.createRules): [Disabled]
    /// fields disable unconditionally, [Hidden(expr)] fields hide while the expression is truthy,
    /// and an IRuleSupplier contributes programmatic rules.</summary>
    internal List<RuleDto> MapRules(Type type, object? instance)
    {
        var rules = new List<RuleDto>();
        foreach (var p in EditableProperties(type))
        {
            var fieldId = Naming.CamelCase(p.Name);
            if (p.Find<DisabledAttribute>() != null
                || !Authorized(p.Find<DisabledUnlessAttribute>()))
                rules.Add(new RuleDto("true", "SetDataValue", fieldId, "disabled", null, "true", "Continue", null));
            if (p.Find<HiddenAttribute>() is { Value.Length: > 0 } hidden)
                rules.Add(new RuleDto("true", "SetDataValue", fieldId, "hidden", null, hidden.Value, "Continue", null));
        }
        if (instance is IRuleSupplier supplier)
            rules.AddRange(supplier.Rules().Select(r => new RuleDto(
                r.Filter, r.Action, r.FieldName, r.FieldAttribute, r.Value, r.Expression, r.Result, r.ActionId)));
        return rules;
    }

    private string? OptT(string? s) => s is null ? null : T(s);

    private static List<BannerDto> Banners(Type type, object instance) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<BannerAttribute>() != null)
            .Select(m =>
            {
                var a = m.Find<BannerAttribute>()!;
                var desc = m.ReturnType == typeof(string) ? m.Invoke(instance, [])?.ToString() : null;
                return new BannerDto(a.Theme.ToString().ToUpperInvariant(), a.Title, desc);
            })
            .ToList();

    private static List<BadgeDto> Badges(Type type, object instance) =>
        EditableProperties(type)
            .Where(p => p.Find<HeaderBadgeAttribute>() != null)
            .Select(p => (text: p.GetValue(instance)?.ToString(), color: p.Find<HeaderBadgeAttribute>()!.Color))
            .Where(x => !string.IsNullOrWhiteSpace(x.text))
            .Select(x => new BadgeDto(x.text!, x.color))
            .ToList();

    /// <summary>A wizard step: title + progress bar + the current step's fields + Back/Next. The state
    /// (__step + all field values) rides in initialData so it round-trips through componentState.</summary>
    public ServerSideComponentDto MapWizard(Type type, object instance, string route, int step)
    {
        var stepProps = EditableProperties(type)
            .Select(p => (p, step: p.Find<StepAttribute>()?.Step ?? 1))
            .ToList();
        var total = stepProps.Count == 0 ? 1 : stepProps.Max(x => x.step);
        var current = Math.Clamp(step, 1, total);
        var currentProps = stepProps.Where(x => x.step == current).Select(x => x.p).ToList();
        var fields = currentProps.Select(p => MapField(p, instance)).ToList();

        var title = type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);
        var titleText = Client(new TextMetadataDto(title), null, []);
        var progressStyle = type.Find<WizardProgressAttribute>()?.Style;
        StepDto Bullet(int i) => new($"step-{i}", $"Step {i}", null,
            i < current ? "done" : i == current ? "current" : "upcoming");
        // [WizardProgress("steps")]: connected step bullets instead of the progress bar
        // (mirrors Java's @WizardProgress(WizardProgressStyle.STEPS)).
        var progress = progressStyle == "steps"
            ? Client(new ProgressStepsMetadataDto(Enumerable.Range(1, total).Select(Bullet).ToList()), "fieldId", [])
            : Client(new ProgressBarMetadataDto((double)current / total), "fieldId", []);
        var columns = FormColumns(type);
        var card = Client(new CardMetadataDto(Client(new FormLayoutMetadataDto
        {
            MaxColumns = columns,
            LabelsAside = LabelsAsideInference.LabelsAside(currentProps, columns, type, T),
        }, null, FormRows(fields, columns))), "fieldId", []);
        var back = Client(new ButtonMetadataDto("Back", "back") { Disabled = current == 1 }, null, []);
        var next = Client(new ButtonMetadataDto(current == total ? "Finish" : "Next", "next") { ButtonStyle = "Primary" }, null, []);
        var bar = Client(new HorizontalLayoutMetadataDto(), null, [back, next]);
        ComponentDto layout;
        if (progressStyle == "rail")
        {
            // [WizardProgress("rail")]: the Redwood Guided Process rail — the step form on the
            // left, a sticky right band with a big current|total counter over the vertical step
            // list (mirrors Java's WizardProgressStyle.RAIL).
            var counter = Client(new TextMetadataDto($"{current} | {total}"), null, []) with
                { Style = "font-size: 2rem; font-weight: 300; margin: 0 0 1rem; letter-spacing: .1em;" };
            var steps = Client(new ProgressStepsMetadataDto(
                Enumerable.Range(1, total).Select(Bullet).ToList(), Vertical: true), "fieldId", []);
            var rail = Client(new VerticalLayoutMetadataDto(), null, [counter, steps]) with
            {
                Style = "flex: 0 0 15rem; align-self: flex-start; position: sticky; top: 1rem;"
                    + " border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));"
                    + " padding-left: 1.5rem;",
            };
            var main = Client(new VerticalLayoutMetadataDto { Spacing = true }, null, [titleText, card, bar]) with
                { Style = "flex: 1; min-width: 0;" };
            layout = Client(new HorizontalLayoutMetadataDto(), null, [main, rail]) with
                { Style = "align-items: flex-start; gap: 2rem; width: 100%;" };
        }
        else
        {
            layout = Client(new VerticalLayoutMetadataDto { Spacing = true }, null, [titleText, progress, card, bar]);
        }

        var initial = new Dictionary<string, object?> { ["__step"] = current };
        foreach (var (p, _) in stepProps)
            // Grid (list-of-rows) fields ride as row dicts and scalars keep their JSON type
            // (numbers/booleans as-is, dates ISO, enums by name — the grid-cell convention), so
            // every step field round-trips through the componentState (Java parity: the wizard
            // state is typed, not stringified).
            initial[Naming.CamelCase(p.Name)] = GridRowType(p) is { } rowType
                ? GridRows(p, rowType, instance)
                : CellValueOf(p.GetValue(instance));

        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route, [layout], initial, [], [], null, null, null)
        {
            PageType = PageTypeOf(type),
        };
    }

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
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), crudType.FullName!, route, [page],
            new Dictionary<string, object?>(), [], [], null, null, null)
        {
            // [Hidden]/[Disabled] on entity fields rule the detail form too.
            Rules = MapRules(element, entity),
            PageType = PageTypeOf(crudType),
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
        if (props.Any(p => p.Find<TabAttribute>() != null))
            return [TabLayout(type, props, instance, readOnly)];

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
                sections.Select(s => (ComponentDto)SectionCard(
                    s.Title, MapFields(s.Props, instance, readOnly), formType: type, props: s.Props)).ToList(),
                null, null, null)];

        // Read-only view with many substantial sections: present the sections as adaptable tabs.
        if (sections.Count > 1 && LayoutInference.PreferTabs(type, sections, readOnly))
            return [TabsFromSections(type, sections, instance, readOnly)];

        // Heavy unstructured editable form: required fields stay visible, optionals fold away.
        if (sections.Count == 1
            && LayoutInference.BuildFoldPlan(type, sections[0].Title, sections[0].Props, readOnly) is { } plan)
            return [FoldedCard(type, plan, instance)];

        return sections.Select((s, i) => (ComponentDto)SectionCard(
            s.Title, MapFields(s.Props, instance, readOnly),
            sectionAttrs[i], type, s.Props)).ToList();
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
                sectionAttrs[i], type, sections[i].Props);

        // Grow AND shrink around the declared basis minus the spacing gap (with flex-wrap the
        // line breaks are computed from the basis, so 62% + 38% + gap would wrap or overflow);
        // min-width sets the responsive wrap point (mirrors Java's widthStyle).
        ComponentDto Column(IEnumerable<ComponentDto> cards, string width) =>
            new ClientSideComponentDto(
                new VerticalLayoutMetadataDto { Spacing = true }, null, cards.ToList(),
                width.Length > 0
                    ? $"flex: 1 1 calc({width} - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);"
                    : "flex: 1 1 12rem; min-width: min(20rem, 100%);",
                null, null);

        var columns = new List<ComponentDto>();
        var remaining = Enumerable.Range(0, sections.Count).ToList();
        foreach (var zone in zones)
        {
            var mine = remaining.Where(i => sectionZones[i] == zone.Name).ToList();
            if (mine.Count == 0) continue;
            remaining.RemoveAll(mine.Contains);
            columns.Add(Column(mine.Select(CardOf), zone.Width));
        }
        if (remaining.Count > 0)
            columns.Add(Column(remaining.Select(CardOf), ""));

        return new ClientSideComponentDto(
            new HorizontalLayoutMetadataDto { Spacing = true, Wrap = true }, null, columns,
            "width: 100%; align-items: flex-start;", null, null);
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
        // The tab selected on first render is the first one flagged Open, else the first tab.
        var activeIndex = Math.Max(0, tabs.FindIndex(tb => tb.open));
        var columns = FormColumns(type);
        var tabComps = tabs.Select((tb, i) => (ComponentDto)Client(
            new TabMetadataDto(T(tb.name)) { Active = i == activeIndex }, null,
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
        return Client(meta, "_tabs", tabComps);
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

    /// <summary>KPI cards from [Kpi] methods (the title is the attribute, the value is the call result).</summary>
    private static List<KpiDto> Kpis(Type type, object instance) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<KpiAttribute>() != null && m.GetParameters().Length == 0)
            .Select(m => new KpiDto(m.Find<KpiAttribute>()!.Title, m.Invoke(instance, [])?.ToString() ?? ""))
            .ToList();

    /// <summary>Floating action buttons from [Fab] methods (the method name is the action id).</summary>
    private static List<FabDto> Fabs(Type type) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<FabAttribute>() != null)
            .Select(m =>
            {
                var a = m.Find<FabAttribute>()!;
                return new FabDto(a.Icon, Naming.CamelCase(m.Name)) { Label = a.Label, Order = a.Order };
            })
            .OrderBy(f => f.Order)
            .ToList();

    /// <summary>The form's column count: [FormLayout(Columns = …)] when declared, else 2
    /// (mirrors Java's PageFormBuilder.getFormColumns).</summary>
    internal static int FormColumns(Type? type) => type?.Find<FormLayoutAttribute>()?.Columns ?? 2;

    private ClientSideComponentDto SectionCard(
        string? title, List<ClientSideComponentDto> fields, SectionAttribute? section = null,
        Type? formType = null, IReadOnlyList<PropertyInfo>? props = null)
    {
        var columns = FormColumns(formType);
        // [Section(PropertyList = true)]: every data field becomes a read-only property row
        // (label left / value right, divider between rows), stacked full-width — so the body is a
        // plain vertical layout instead of the responsive form layout (mirrors Java's
        // SectionFormRenderer.asPropertyList).
        var body = section?.PropertyList == true
            ? Client(new VerticalLayoutMetadataDto(), null,
                fields.Select(f => f.Metadata is FormFieldMetadataDto ff && ff.Stereotype != "grid"
                    ? f with { Metadata = ff with { PropertyRow = true, ReadOnly = true, Colspan = 1 } }
                    : (ComponentDto)f).ToList()) with { Style = "width: 100%; align-items: stretch;" }
            : Client(new FormLayoutMetadataDto
            {
                MaxColumns = columns,
                LabelsAside = LabelsAsideInference.LabelsAside(props ?? [], columns, formType, T),
            }, null, FormRows(fields, columns));
        // [Section(Frameless = true)]: no card wrapper, no padding — the content sits bare
        // (mirrors Java's @Section(frameless=true)).
        if (section?.Frameless == true)
            return Client(new DivMetadataDto(), null, [body]) with
            {
                Style = "flex: 1; min-width: 0; width:100%;",
            };
        if (title is not null)
            return Client(new FormSectionMetadataDto(title), null, [body]);
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [body]);
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
        }, "crud", []);
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
                        Options = Enum.GetNames(el).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList(),
                    };
                if (t.IsEnum)
                    return new FormFieldMetadataDto(id, "string", label)
                    {
                        Stereotype = "select",
                        Options = Enum.GetNames(t).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList(),
                    };
                return new FormFieldMetadataDto(id, InferDataType(t, p), label);
            })
            .ToList();

    private ServerSideComponentDto MapCrud(Type viewType, Type element, string route, object? instance = null)
    {
        // HeroSearch: a centered hero header over the listing, results as cards, no auto-search.
        var hero = (instance ?? Activator.CreateInstance(viewType)) as IHeroSearch;
        var title = viewType.Find<TitleAttribute>()?.Value ?? Naming.Humanize(viewType.Name);
        // Class-level [InlineEditing]: every data column (except [ReadOnly] ones) is edited in
        // place; each committed cell dispatches the crud's update-row action (Java parity).
        var inlineEditing = viewType.Find<InlineEditingAttribute>() != null;
        var columns = EditableProperties(element)
            .Where(Visible)
            .Select(p =>
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
                });
            })
            .ToList();
        var toolbar = new List<ButtonDto> { new("New", "new"), new("Delete", "delete") };
        var actions = new List<ActionDto> { new("search"), new("new"), new("delete") };
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
        var crud = Client(new CrudMetadataDto(title, columns, toolbar)
        {
            Filters = MapCrudFilters(element),
            CrudlType = hero is not null ? "cards" : "table",
            GroupBy = GroupByOf(element),
        }, "crud", []);
        var pageChildren = new List<ComponentDto>();
        if (hero is not null)
            pageChildren.Add(Client(new HeroSectionMetadataDto(
                hero.HeroTitle(), hero.HeroSubtitle(), hero.HeroImage(), null, true), null, []));
        pageChildren.Add(crud);
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

    internal static IEnumerable<PropertyInfo> EditableProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true });

    /// <summary>The [Aggregate] function of a listing column as its wire name (the lowercase Java
    /// enum: sum|avg|min|max|count); null on non-aggregated columns.</summary>
    internal static string? AggregateOf(PropertyInfo p) =>
        p.Find<AggregateAttribute>()?.Function.ToString().ToLowerInvariant();

    /// <summary>The view's [WelcomeBanner], when declared. Inherited from a base class (the Java
    /// annotation is @Inherited), so the lookup walks the base-type chain like PageTypeOf does.</summary>
    private static WelcomeBannerAttribute? WelcomeBannerOf(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.Find<WelcomeBannerAttribute>() is { } banner) return banner;
        return null;
    }

    /// <summary>The view's declared page width as its wire name (fixed|fullWidth|edgeToEdge — the
    /// lowercase-camel Java enum names), or null when neither [PageWidth] on the class nor the
    /// IPageWidthSupplier hook says anything (the renderer then infers the width from the page
    /// content). The attribute on the concrete view wins over the hook (mirrors Java's
    /// PageWidthResolver).</summary>
    /// <summary>Previous/next peer-object arrows from an IPeerNavigationSupplier, as the wire DTO;
    /// null when the page supplies none (mirrors Java's PageMetadataExtractor.getPeerNav).</summary>
    internal static PeerNavDto? PeerNavOf(object? instance)
    {
        if ((instance as IPeerNavigationSupplier)?.Peers() is { } p)
            return new PeerNavDto(p.PrevLabel, p.PrevRoute, p.NextLabel, p.NextRoute);
        return null;
    }

    /// <summary>The page's "last updated" timestamp from the first [Timestamp] property (an
    /// optional label prefix + the value's ToString()); null when there is no such property or its
    /// value is null (mirrors Java's PageMetadataExtractor.getTimestamp).</summary>
    internal static string? TimestampOf(Type type, object? instance)
    {
        foreach (var p in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (p.Find<Mateu.Uidl.TimestampAttribute>() is not { } attr) continue;
            var value = p.GetValue(instance);
            if (value is null) return null;
            return string.IsNullOrWhiteSpace(attr.Label) ? value.ToString() : $"{attr.Label} {value}";
        }
        return null;
    }

    internal static string? PageWidthOf(Type type, object? instance)
    {
        var style = type.Find<PageWidthAttribute>()?.Value
                    ?? (instance as IPageWidthSupplier)?.PageWidth();
        return style switch
        {
            PageWidthStyle.Fixed => "fixed",
            PageWidthStyle.FullWidth => "fullWidth",
            PageWidthStyle.EdgeToEdge => "edgeToEdge",
            _ => null,
        };
    }

    /// <summary>The view's coarse page type (the Redwood page-template families) as its wire name
    /// (landing|collection|detail|form|process|dashboard — the lowercase Java enum names). Never
    /// null: every page gets a type. The explicit [PageTemplate] on the view class (inherited from
    /// a base class) wins; otherwise the type is inferred from the ModelView's shape — archetypes
    /// map to their family, a Crud/Listing is a collection page, a view with MetricCard fields is
    /// a dashboard, and a plain reflected form is a form page. (Mirrors Java's
    /// PageTypeResolver.)</summary>
    internal static string PageTypeOf(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.Find<PageTemplateAttribute>() is { } template)
                return template.Value.ToString().ToLowerInvariant();
        if (typeof(Dashboard).IsAssignableFrom(type)) return "dashboard";
        if (typeof(Welcome).IsAssignableFrom(type)) return "landing";
        if (DerivesFrom(type, typeof(HeroSearch<>))) return "landing";
        if (DerivesFrom(type, typeof(SmartSearchPage<,>))) return "collection";
        if (DerivesFrom(type, typeof(TodoList<>))) return "collection";
        if (typeof(CalendarPage).IsAssignableFrom(type)) return "collection";
        if (DerivesFrom(type, typeof(CollectionDetail<>))) return "collection";
        if (typeof(Wizard).IsAssignableFrom(type)) return "process";
        if (typeof(Foldout).IsAssignableFrom(type)) return "detail";
        if (typeof(ItemOverview).IsAssignableFrom(type)) return "detail";
        if (DerivesFrom(type, typeof(GeneralOverview<>))) return "detail";
        if (CrudElementType(type) is not null) return "collection";
        if (ListingTypes(type) is not null) return "collection";
        if (type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Any(p => p.PropertyType == typeof(MetricCard))) return "dashboard";
        return "form";
    }

    /// <summary>Whether <paramref name="type"/> derives from the generic base class
    /// <paramref name="genericBase"/> (an open generic type definition like Crud&lt;&gt;).</summary>
    private static bool DerivesFrom(Type type, Type genericBase)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == genericBase)
                return true;
        return false;
    }

    /// <summary>The [GroupBy] column of a row class (camelCase field id); one per row class —
    /// first declared wins. Null when the class declares none (mirrors ListingSummarySpec).</summary>
    internal static string? GroupByOf(Type row) =>
        EditableProperties(row).FirstOrDefault(p => p.Find<GroupByAttribute>() != null) is { } group
            ? Naming.CamelCase(group.Name)
            : null;

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
                    ? Enum.GetNames(x.Type).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList()
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

    private static List<OptionDto>? EditorOptionsOf(PropertyInfo p)
    {
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        return t.IsEnum
            ? Enum.GetNames(t).Select(n => new OptionDto(n, n)).ToList()
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
                    DataType = InferDataType(Nullable.GetUnderlyingType(c.PropertyType) ?? c.PropertyType, c),
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
        var rows = GridRows(p, rowType, instance);
        var onRow = p.Find<OnRowSelectedAttribute>();
        var meta = new FormFieldMetadataDto(fieldId, "array", T(
            p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name)))
        {
            Stereotype = "grid",
            ReadOnly = readOnly,
            Columns = columns,
            ItemIdPath = "_rowNumber",
            InitialValue = rows,
            OnItemSelectionActionId = onRow is null ? null : Naming.CamelCase(onRow.Value),
            RowSelectionShortcut = onRow is { Shortcut.Length: > 0 } ? onRow.Shortcut : null,
        };
        return Client(meta, fieldId, []);
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

    private ClientSideComponentDto MapField(PropertyInfo p, object instance, bool readOnly = false)
    {
        var fieldId = Naming.CamelCase(p.Name);
        if (GridRowType(p) is { } rowType) return MapGridField(p, rowType, instance, readOnly);
        var label = T(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        var required = p.Find<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        // an IOptionsSupplier view wins (its options may carry Children → tree selects);
        // enums keep contributing their constants
        var options = instance is IOptionsSupplier supplier
                      && supplier.Options(fieldId) is { Count: > 0 } supplied
            ? supplied.Select(MapOption).ToList()
            : t.IsEnum
                ? Enum.GetNames(t).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList()
                : new List<OptionDto>();
        var value = p.GetValue(instance);

        // A [PlainText] field — or any field of a [PlainText] class — renders as read-only text.
        var plainText = p.Find<PlainTextAttribute>() != null
                        || p.DeclaringType?.Find<PlainTextAttribute>() != null;
        var multiline = p.Find<MultilineAttribute>() != null;
        var stereotype = StereotypeOf(p, plainText, multiline);

        // [ReadOnlyUnless] (field or class level): read-only unless the caller is authorized.
        var readOnlyByPermission =
            !Authorized(p.Find<ReadOnlyUnlessAttribute>())
            || (p.DeclaringType is { } owner && !Authorized(owner.Find<ReadOnlyUnlessAttribute>()));
        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t, p), label)
        {
            Stereotype = stereotype,
            Required = required,
            ReadOnly = readOnly || plainText || readOnlyByPermission,
            Multiline = multiline,
            Options = options,
            TreeLeavesOnly = p.Find<TreeSelectAttribute>()?.LeavesOnly ?? false,
            InitialValue = FormatValue(value),
            Link = LinkOf(p, instance),
            // [Lookup]: the combo box loads its options remotely through the field's
            // search-<fieldId> action (answered from the view's IOptionsSupplier).
            RemoteCoordinates = p.Find<LookupAttribute>() != null
                ? new RemoteCoordinatesDto("search-" + fieldId)
                : null,
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
            fields.Add(MapField(p, instance, readOnly));
        }
        return fields;
    }

    private static List<ComponentDto> FormRows(List<ClientSideComponentDto> fields, int maxColumns = 2)
    {
        var rows = new List<ComponentDto>();
        var pending = new List<ComponentDto>();
        foreach (var field in fields)
        {
            // A separator always takes a full row of its own (its data-colspan spans the columns).
            if (field.Metadata is SeparatorMetadataDto)
            {
                if (pending.Count > 0)
                {
                    rows.Add(Client(new FormRowMetadataDto(), null, pending));
                    pending = new List<ComponentDto>();
                }
                rows.Add(Client(new FormRowMetadataDto(), null, [field]));
                continue;
            }
            pending.Add(field);
            if (pending.Count == maxColumns)
            {
                rows.Add(Client(new FormRowMetadataDto(), null, pending));
                pending = new List<ComponentDto>();
            }
        }
        if (pending.Count > 0)
            rows.Add(Client(new FormRowMetadataDto(), null, pending));
        return rows;
    }

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id, IReadOnlyList<ComponentDto> children) =>
        new(meta, id, children, null, null, null);

    private static string InferDataType(Type t, PropertyInfo? p = null) => t switch
    {
        _ when t.IsEnum => "string",
        _ when t == typeof(bool) => "boolean",
        _ when t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) => "integer",
        _ when t == typeof(float) || t == typeof(double) || t == typeof(decimal) => "number",
        _ when t == typeof(DateOnly) || t == typeof(DateTime) => "date",
        _ => "string",
    };
}
