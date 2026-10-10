using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Turns an annotated C# view instance into the Mateu component tree (App→Page→Card→…→FormField).</summary>
public sealed partial class ReflectionMapper(ITranslator? translator = null, Func<Identity?>? identity = null,
    MateuRegistry? registry = null)
{
    /// <summary>Translates a user-facing string when a translator is registered, else returns it unchanged.</summary>
    private string T(string s) => translator?.Translate(s) ?? s;

    /// <summary>Whether the caller passes <paramref name="gate"/> (mirrors Java's Authorizer):
    /// AND across declared dimensions, OR within each; nothing declared → unrestricted; no
    /// identity → unauthorized.</summary>
    private bool Authorized(IdentityGatedAttribute? gate) =>
        gate is null || ActionGuard.Satisfies(gate.Roles, gate.Groups, gate.Scopes, gate.Permissions, identity?.Invoke());

    /// <summary>[Compact] high-density style — the exact CSS-var payload Java's StyleConstants.COMPACT
    /// carries (tighter form/card spacing + Lumo sizes), ending with the --mateu-compact:1 marker.</summary>
    private const string CompactStyle =
        ";--vaadin-form-layout-row-spacing:0.2rem;--vaadin-form-layout-label-spacing:0.05rem;"
        + "--vaadin-card-padding:0.2rem 0.7rem;--vaadin-card-gap:0.15rem;--lumo-size-xl:2.2rem;"
        + "--lumo-size-l:1.8rem;--lumo-size-m:1.35rem;--lumo-size-s:1.2rem;--lumo-size-xs:1.05rem;"
        + "--lumo-space-xl:0.9rem;--lumo-space-l:0.45rem;--lumo-space-m:0.3rem;--lumo-space-s:0.18rem;"
        + "--lumo-space-xs:0.1rem;--lumo-line-height-m:1.15;--mateu-label-font-size:var(--lumo-font-size-xs);"
        + "--mateu-label-padding-bottom:1px;--mateu-label-line-height:1.1;--mateu-compact:1;";

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
        && member.Find<Mateu.Uidl.TimestampAttribute>() == null
        // [Kpi] properties are hoisted into the header KPI band, never rendered as form fields.
        && member.Find<KpiAttribute>() == null
        // [Aside] properties render in the ContentLayout aside slot, not the form body.
        && member.Find<Mateu.Uidl.AsideAttribute>() == null;

    /// <summary>If the view declares any [Aside] component property, pull those into the aside slot
    /// of a ContentLayout wrapping the form (the main slot) — the C# analogue of Java's
    /// PageContentBuilder.wrapAsideIfPresent. Regions travel as slotted children main-N/aside-N.</summary>
    private List<ComponentDto> WrapAside(Type type, object instance, List<ComponentDto> mainContent)
    {
        var asideProps = type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.Find<Mateu.Uidl.AsideAttribute>() != null).ToList();
        if (asideProps.Count == 0) return mainContent;
        var asideComponents = new List<ClientSideComponentDto>();
        foreach (var p in asideProps)
            if (p.GetValue(instance) is IComponent c) asideComponents.Add(ComponentMapper.Map(c));
        if (asideComponents.Count == 0) return mainContent;
        var first = asideProps[0].Find<Mateu.Uidl.AsideAttribute>()!;
        var children = new List<ComponentDto>();
        for (var i = 0; i < mainContent.Count; i++)
            children.Add(mainContent[i] is ClientSideComponentDto cs ? cs with { Slot = $"main-{i}" } : mainContent[i]);
        for (var i = 0; i < asideComponents.Count; i++) children.Add(asideComponents[i] with { Slot = $"aside-{i}" });
        var meta = new ContentLayoutMetadataDto
        {
            AsidePosition = string.IsNullOrEmpty(first.Position) ? "end" : first.Position,
            AsideWidth = first.Width,
            AsideSticky = first.Sticky,
        };
        return [new ClientSideComponentDto(meta, "content", children, null, null, null)];
    }

    /// <summary>OnCustomEvent triggers (from [SubscribeTo]) and the [Emits] name for a view type.</summary>
    private static (List<object> Triggers, string? EmitsName) EventsOf(Type type)
    {
        var triggers = type.GetCustomAttributes<SubscribeToAttribute>()
            .Select(s => (object)new CustomTriggerDto(s.Event, s.Action)).ToList();
        return (triggers, type.Find<EmitsAttribute>()?.Name);
    }

    public ServerSideComponentDto MapView(Type type, object instance, string route, IComponent? layoutOverride = null,
        bool embedded = false, bool inline = false)
    {
        var crudElement = CrudElementType(type);
        if (crudElement is not null) return MapCrud(type, crudElement, route, instance);
        if (CapabilityProfile.Of(type) is { } capability) return MapCapabilityListing(capability, route);
        if (ListingTypes(type) is { } listing) return MapListing(type, listing.Filters, listing.Row, route);

        var title = T(type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name));

        var buttonMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<ButtonAttribute>() != null && ForCurrentAudience(m))
            .ToList();
        var buttons = buttonMethods.Select(MapButton).ToList();
        var fabs = Fabs(type);
        // [Button] methods are server-side actions the renderer can invoke; a [RestAction] button
        // carries the client-side REST descriptor on its action. A [Fab]'s action is NOT advertised
        // in the component actions list — it travels only on the page metadata's fabs (Java parity:
        // the fab golden carries no component.actions).
        // Field-declared actions first, in Java's FieldActionCollector order: the list fields' row
        // editing actions, the [OnRowSelected] grid actions (which must be advertised or the
        // renderer drops the row click), the [Lookup] search actions — then the [Button] methods.
        var actions = FieldActions(type);
        actions.AddRange(buttonMethods.Select(m =>
                WithActionOptions(new ActionDto(Naming.CamelCase(m.Name)) { RestAction = RestActionOf(m) },
                    type, Naming.CamelCase(m.Name)))
            .Where(a => actions.All(x => x.Id != a.Id)));
        // The section affordances ([Section(EditAction/AddAction/ViewMoreAction)]) dispatch the
        // named methods, and the header's record switcher dispatches _switchRecord — both must be
        // advertised or the renderer drops the click (mirrors Java's ActionMapper).
        foreach (var sectionAction in SectionActionIds(type).Where(a => actions.All(x => x.Id != a)))
            actions.Add(new ActionDto(sectionAction, ValidationRequired: false));
        if (instance is IRecordSwitcherSupplier)
            actions.Add(new ActionDto(IRecordSwitcherSupplier.ActionId, ValidationRequired: false));

        // A component-tree view (an archetype like Dashboard/Foldout, or any IComponentTreeSupplier)
        // renders its fluent tree as the page content; actionIds referenced by the tree (metric-card
        // drill-ins, empty-state CTAs, welcome buttons) are advertised so the renderer routes them back.
        List<ComponentDto> content;
        // Page-level inference ([AutoPage]): a plain class whose structure spells an archetype
        // is composed as it — the C# analogue of Java's InferredDashboard/InferredWelcome. The
        // welcome hero title is the declared [Title]; subtitle/image have no declarative source,
        // so setting them remains a reason to subclass Welcome.
        // A YAML page's layout (bound to this instance as its ModelView) is rendered as the page
        // content exactly like an archetype's fluent tree — its FormField ids bind to the instance's
        // state, its Button actionIds (collected below) route back to the instance's methods.
        var tree = layoutOverride
            ?? (instance is IComponentTreeSupplier supplier ? supplier.Component()
            : PageInference.ComposesDashboard(type) ? ArchetypeComposers.ComposeDashboard(instance, 0)
            : PageInference.ComposesWelcome(type)
                ? ArchetypeComposers.ComposeWelcome(instance, type.Find<TitleAttribute>()?.Value, null, null)
                : null);
        // A ComponentTreeSupplier view (an archetype, or an [AutoPage]-inferred dashboard/welcome)
        // is NOT a page: Java emits the supplied tree DIRECTLY as the ServerSideComponent's child,
        // with the supplier's own style() and NO Page wrapper / no SetWindowTitle — see
        // ViewTypeClassifier.isPage. A YAML-bound modelView (layoutOverride) DOES keep its page
        // (it is a reflected @UI class, only its layout is authored), so it is excluded here.
        var treeSupplierView = tree is not null && layoutOverride is null;
        if (tree is not null)
        {
            content = [ComponentMapper.Map(tree)];
            // The tree's action ids are advertised so the web client sends them (it only sends what
            // the component advertises). A tree-supplier view advertises the ones it has a handler
            // method for — an id it cannot handle may be an ancestor's and must not be captured
            // here (same rule as Java's TreeActionHarvester and Python's mapper). A YAML layout
            // override advertises every id its buttons reference.
            // OWNER FIRST, then the action catalogue: an id the view neither declares nor has a method
            // for runs the catalogue entry of that id (Java's TreeActionHarvester → ActionCatalogMapper),
            // so it is not advertised bare here.
            var catalogue = MateuCatalogs.Actions;
            bool FromCatalogue(string a) => catalogue.Get(a) is not null && !ActionGuard.HandlesTreeAction(type, a);
            var referenced = treeSupplierView
                ? ActionGuard.TreeActionIds(tree).Where(a => ActionGuard.HandlesTreeAction(type, a))
                : ComponentMapper.CollectActionIds(tree).Where(a => !FromCatalogue(a));
            actions.AddRange(referenced
                .Where(a => actions.All(x => x.Id != a)).Select(a => new ActionDto(a)));
            var unresolved = ActionGuard.TreeActionIds(tree).Where(a => actions.All(x => x.Id != a));
            // a refused catalogue entry counts as owned: never shipped, never followed
            actions.AddRange(ActionRegistry.ReferencedBy(MateuCatalogs.Actions, unresolved,
                    actions.Select(a => a.Id).Concat(MateuCatalogs.RefusedActions))
                .Select(ActionRegistry.ToDto));
        }
        else
        {
            // A [ReadOnly] class renders as a display view (fields read-only, tabs inference may apply).
            content = FormCards(type, instance, type.Find<ReadOnlyAttribute>() != null);
            content = WrapAside(type, instance, content);
            // [Inline] island: a single-section form drops its card — the host section frames it
            if (inline) content = UnwrapSingleSectionCard(content);
        }

        // A [WelcomeBanner] prepends a centered HeroSection (id "welcome-banner") to the page
        // content — the hero IS the banner, there is no new wire type; an empty Title falls back
        // to the view's [Title]. (Mirrors Java's ReflectionPageMapper.mapToPageComponent.)
        if (WelcomeBannerOf(type) is { } banner)
            content.Insert(0, Client(new HeroSectionMetadataDto(
                banner.Title.Length > 0 ? T(banner.Title) : title,
                banner.Subtitle.Length > 0 ? T(banner.Subtitle) : null,
                banner.Image.Length > 0 ? banner.Image : null,
                null, true)
            {
                Tone = banner.Tone == HeroTone.Auto ? null : banner.Tone.ToString().ToLowerInvariant(),
            }, "welcome-banner", []));

        var compact = type.Find<CompactAttribute>() != null;
        // pageTitle is the humanized class name; title is the declared [Title] (falling back to the
        // same). Java derives pageTitle from the class, so a class whose [Title] differs from its
        // name emits two distinct header strings (mirrors ReflectionPageMapper).
        var pageMeta = new PageMetadataDto(
            title, T(Naming.Humanize(type.Name)),
            OptT(type.Find<SubtitleAttribute>()?.Value), [], buttons)
        {
            // an [Inline] island nests under the host section: its title demotes to a sub-heading
            Level = inline ? 1 : 0,
            Toc = type.Find<TocAttribute>()?.Value,
            PageWidth = PageWidthOf(type, instance),
            PageType = PageTypeOf(type),
            Banners = Banners(type, instance),
            Badges = inline ? [] : Badges(type, instance),
            Kpis = inline ? [] : Kpis(type, instance),
            Fabs = fabs,
            PeerNav = PeerNavOf(instance),
            Switcher = SwitcherOf(instance),
            Timestamp = TimestampOf(type, instance),
            Overline = OptT(type.Find<OverlineAttribute>()?.Value),
            TitlePlaceholder = OptT(type.Find<TitlePlaceholderAttribute>()?.Value),
        };
        // The tree-supplier's children ARE the supplied tree (Page-less); a reflected form wraps its
        // content in a Page. The container style comes from the supplier for a tree view (Java's
        // ComponentTreeSupplier.style(), default "max-width:900px;margin: auto;", null for the
        // archetypes that compose their own full-width layout), and from [Compact] for a form.
        var treeStyle = instance is IComponentTreeSupplier supplierStyle ? supplierStyle.Style : null;
        List<ComponentDto> children;
        string? containerStyle;
        if (treeSupplierView)
        {
            children = content;
            containerStyle = treeStyle;
            // An explicit [Size] on the view sizes its whole surface (coherence-plan #8): a
            // full-canvas screen that fills the viewport and scrolls internally. Overrides inference.
            var sizing = SizingOf(type);
            if (sizing != null && children.Count > 0 && children[0] is ClientSideComponentDto leaf)
                children = new List<ComponentDto> { leaf with { Sizing = sizing } }
                    .Concat(children.Skip(1)).ToList();
        }
        else
        {
            var page = new ClientSideComponentDto(
                pageMeta, null, content, compact ? CompactStyle : null, null, null);
            children = [page];
            containerStyle = null;
        }

        var (triggers, emits) = EventsOf(type);
        var initialData = new Dictionary<string, object?>();
        if (instance is IComponentTreeSupplier || layoutOverride is not null)
        {
            // Tree-supplier views (archetypes) and YAML-bound modelViews: scalar properties are the
            // view's state — seed them into initialData so they round-trip through componentState
            // (a YAML FormField id="name" reads its value from the seeded "name", search text,
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
        else if (tree is null)
        {
            // A plain reflected form: its fields' values ARE the view's state. Seed them into
            // initialData (and, via FragmentResponse, the fragment state) so they round-trip through
            // componentState — Java emits both, identical, instead of a per-field initialValue
            // (mirrors ReflectionUiIncrementMapper). Header-hoisted fields ([Kpi]/[Timestamp]) still
            // carry state, so they are seeded too even though they leave the form body. The
            // conformance normaliser drops default values (false / 0 / "" / empty), so an untouched
            // field simply does not appear.
            foreach (var kv in InitialDataOf(type, instance)) initialData[kv.Key] = kv.Value;
        }
        // [RestData]: fetch the screen's initial data client-side on load — a synthetic __restdata__
        // action carrying the REST descriptor plus an OnLoad trigger that fires it (reuses the
        // [RestAction] fetch+merge path; silent load, so no success message).
        // An embedded island keeps its markers in its state, so every later request of the island
        // still says it runs embedded / [Inline] (Java seeds them into the island initialData).
        if (embedded) initialData[EmbeddedMarker] = true;
        if (inline) initialData[InlineMarker] = true;
        if (RestDataOf(type) is { } restData)
        {
            actions.Add(new ActionDto("__restdata__", ValidationRequired: false) { RestAction = restData });
            triggers = [.. triggers, new TriggerDto("OnLoad", "__restdata__")];
        }
        // Proxy mode ([RestOptions]/[RestListing]/[RestAction]/[RestData] with Proxy=true): advertise
        // the reserved __restfetch__ action so the renderer can route the fetch through the server
        // (which resolves the DECLARED source, injects ${secret.X} and fetches server-side).
        if (HasProxySource(type, instance))
            actions.Add(new ActionDto("__restfetch__"));
        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            children, initialData, actions, triggers, containerStyle, null, null)
        {
            EmitsName = emits,
            ConfirmOnNavigationIfDirty = type.Find<ConfirmOnNavigationIfDirtyAttribute>() != null,
            Rules = MapRules(type, instance),
            Validations = MapValidations(type),
            PageWidth = PageWidthOf(type, instance),
            PageType = PageTypeOf(type),
            StaticView = type.Find<StaticViewAttribute>() != null,
        };
    }

    private string? OptT(string? s) => s is null ? null : T(s);

    /// <summary>A wizard step: title + progress bar + the current step's fields + Back/Next. The state
    /// (__step + all field values) rides in initialData so it round-trips through componentState.</summary>
    /// <summary>Maps a routed view embedded via <see cref="EmbeddedView"/> into an INDEPENDENT
    /// ServerSideComponentDto carrying the view's OWN serverSideType + actions + its page as a child,
    /// so the view's actions (a wizard's step navigation) route back to itself instead of bubbling to
    /// the host (the Guided Process Drawer pattern). Mirrors Java's ComponentToFragmentDtoMapper's
    /// EmbeddedView branch, reusing the same view→ServerSideComponent machinery a route would.</summary>
    public ServerSideComponentDto MapEmbeddedView(object view)
    {
        var type = view.GetType();
        var route = "/" + (type.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");
        // A wizard opens on its first step; any other routed view maps as its own page.
        return typeof(Wizard).IsAssignableFrom(type)
            ? MapWizard(type, view, route, 1)
            : MapView(type, view, route);
    }

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id, IReadOnlyList<ComponentDto> children) =>
        new(meta, id, children, null, null, null);
}
