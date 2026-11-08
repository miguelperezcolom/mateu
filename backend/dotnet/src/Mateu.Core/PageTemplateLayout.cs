using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// A <see cref="Form"/> that fills a page template, laid out (mirrors Java's
/// <c>fragmentmapper.mappers.PageTemplates</c> — keep both in step; pinned by the Java goldens in
/// YamlPageTemplatesTests): the template's slots become ordinary components — each in a container
/// whose id names the slot — so every renderer draws the page, and the template's own values travel
/// on the Form metadata's <c>template</c> for a renderer that has the template itself.
/// </summary>
/// <remarks>The wrappers are built as wire DTOs directly: they carry layout attributes (a wrapping
/// row, a stretched full-width column, a card without variants) the .NET fluent layouts do not
/// expose, and only their slot contents are the author's components.</remarks>
internal static class PageTemplateLayout
{
    /// <summary>The page's children: the template laid out, or the authored content of a free page.</summary>
    public static IReadOnlyList<ComponentDto> ContentOf(Form form, Func<IComponent, ComponentDto> map)
    {
        List<ComponentDto> Content() => form.Content.Select(map).ToList();
        return form.Template switch
        {
            ItemOverviewPage io => [ItemOverview(io, Content(), map)],
            WelcomePage w => Banner("welcome", TemplateTones.ToneOf(w.BackgroundColor), form, map),
            MultimediaContentPage m => Banner("multimedia-banner", TemplateTones.ToneOf(m.BackgroundColor), form, map),
            HeroSearchPage h => Banner("hero-search", TemplateTones.ToneOf(h.BackgroundColor), form, map),
            DashboardLandingPage d => Dashboard(d, Content(), map),
            GeneralOverviewPage g => [GeneralOverview(g, Content(), map)],
            CollectionDetailPage c => [CollectionDetail(c, Content(), map)],
            FoldoutPage f => [Foldout(f, form, map)],
            AdvancedCreateEditPage a => AdvancedCreateEdit(a, Content(), map),
            GuidedProcessPage p => [GuidedProcess(p, map)],
            DataManagementPage dm => [DataManagement(dm, form, map)],
            _ => Content(),
        };
    }

    /// <summary>Whether the template draws the page's header itself (its title, subtitle and actions
    /// live in the template's banner): the form then carries no header and no toolbar of its own.</summary>
    public static bool OwnsHeader(Form form) =>
        form.Template is WelcomePage or MultimediaContentPage or DataManagementPage or HeroSearchPage;

    /// <summary>The template's own values, for the wire; null for a free page.</summary>
    public static PageTemplateDto? DtoOf(IFormTemplate? template) => template switch
    {
        null => null,
        ItemOverviewPage io => new PageTemplateDto(nameof(ItemOverviewPage), ImageDto(io.Avatar), ImageDto(io.Photo)),
        _ => new PageTemplateDto(template.GetType().Name),
    };

    /// <summary>The page type a template stands for, as its wire name (Java's
    /// PageTypeResolver.ofTemplate): whether or not the page has its content yet, it is the same page.</summary>
    public static string? PageTypeOf(IFormTemplate? template) => template switch
    {
        CollectionDetailPage or DataManagementPage => "collection",
        DashboardLandingPage => "dashboard",
        WelcomePage or HeroSearchPage => "landing",
        ItemOverviewPage or GeneralOverviewPage or FoldoutPage or MultimediaContentPage => "detail",
        GuidedProcessPage => "process",
        AdvancedCreateEditPage => "form",
        _ => null,
    };

    /// <summary>Every component a template's slots hold (not the form's content), so the actions they
    /// reference are advertised like the content's.</summary>
    public static IEnumerable<IComponent> SlotComponents(IFormTemplate? template) => template switch
    {
        ItemOverviewPage io => io.Body.Concat(io.Footer),
        DashboardLandingPage d => d.Kpi,
        GeneralOverviewPage g => g.Info,
        CollectionDetailPage c => c.List.Concat(c.NoSelection),
        FoldoutPage f => f.Overview,
        AdvancedCreateEditPage a => a.Detail,
        GuidedProcessPage p => p.Steps.SelectMany(s => s.Content),
        DataManagementPage dm => new[] { dm.End?.Content, dm.Bottom?.Content }.OfType<IComponent>(),
        _ => [],
    };

    private static TemplateImageDto? ImageDto(TemplateImage? image) =>
        image is null ? null : new TemplateImageDto(image.Src, image.Initials);

    // ── the templates ──────────────────────────────────────────────────────────────────────

    /// <summary>The overview panel (its image, its body and footer slots) beside the main slot — a
    /// fixed-width panel pinned while the main area scrolls, wrapping under it on a narrow screen.</summary>
    private static ComponentDto ItemOverview(ItemOverviewPage t, List<ComponentDto> main, Func<IComponent, ComponentDto> map)
    {
        var panel = new List<ComponentDto>();
        if (Media(t) is { } media) panel.Add(Slot("item-overview-media", [media], "width: 100%; align-items: center"));
        panel.Add(Slot("item-overview-body", t.Body.Select(map).ToList(), "width: 100%"));
        if (t.Footer.Count > 0) panel.Add(Slot("item-overview-footer", t.Footer.Select(map).ToList(), "width: 100%"));
        var card = new ClientSideComponentDto(
            new CardMetadataDto(Slot("item-overview-panel-content", panel, "width: 100%")) { Variants = [] },
            "item-overview-panel", [],
            "flex: 0 0 22rem; max-width: 100%; position: sticky; top: 0; align-self: flex-start", null, null);
        return Row("item-overview", [card, Slot("item-overview-main", main, "flex: 1 1 24rem; min-width: min(24rem, 100%)")]);
    }

    /// <summary>The avatar (a round image, else the initials) or the 4:3 photo.</summary>
    private static ComponentDto? Media(ItemOverviewPage t)
    {
        if (t.Avatar is { Src: { } src } && !string.IsNullOrWhiteSpace(src))
            return Client(new ImageMetadataDto(src), null, [], "width: 8rem; height: 8rem; border-radius: 50%; object-fit: cover");
        if (t.Avatar is { Initials: { } initials } && !string.IsNullOrWhiteSpace(initials))
            return Client(new AvatarMetadataDto(null, initials), null, [], "width: 8rem; height: 8rem");
        if (t.Photo is { Src: { } photo } && !string.IsNullOrWhiteSpace(photo))
            return Client(new ImageMetadataDto(photo), null, [], "width: 100%; aspect-ratio: 4 / 3; object-fit: cover");
        return null;
    }

    /// <summary>A welcome-style banner (the form's title, subtitle and overline, its toolbar as the
    /// calls to action) over the form's content — the welcome page (its tiles), the multimedia
    /// content page (its sections) and the hero search page (its results).</summary>
    private static List<ComponentDto> Banner(string id, HeroTone? tone, Form form, Func<IComponent, ComponentDto> map)
    {
        var hero = Client(
            new HeroSectionMetadataDto(form.Title, form.Subtitle, null, null, true)
            {
                Tone = tone?.ToString().ToLowerInvariant(),
                Overline = string.IsNullOrWhiteSpace(form.Overline) ? null : form.Overline,
            },
            id, form.Toolbar.Select(b => map(b)).ToList(), "width: 100%; box-sizing: border-box; margin-bottom: 1rem");
        return [hero, .. form.Content.Select(map)];
    }

    /// <summary>The kpi slot's metrics as one Scoreboard band over the panels on the dashboard grid;
    /// a non-metric component in the slot follows the band as it is.</summary>
    private static List<ComponentDto> Dashboard(DashboardLandingPage t, List<ComponentDto> main, Func<IComponent, ComponentDto> map)
    {
        var page = new List<ComponentDto>();
        var metrics = t.Kpi.OfType<MetricCard>().ToList();
        if (metrics.Count > 0)
            page.Add(Client(new ScoreboardMetadataDto(), "dashboard-kpi", metrics.Select(m => map(m)).ToList()));
        page.AddRange(t.Kpi.Where(c => c is not MetricCard).Select(map));
        page.Add(Client(new DashboardLayoutMetadataDto(0), "dashboard-panels", main));
        return page;
    }

    private static ComponentDto GeneralOverview(GeneralOverviewPage t, List<ComponentDto> main, Func<IComponent, ComponentDto> map)
    {
        var columns = new List<ComponentDto> { Slot("general-overview-main", main, "flex: 2 1 32rem; min-width: min(32rem, 100%)") };
        if (t.Info.Count > 0)
            columns.Add(Slot("general-overview-info", t.Info.Select(map).ToList(), "flex: 1 1 16rem; min-width: min(16rem, 100%)"));
        return Row("general-overview", columns);
    }

    /// <summary>The collection beside the selected item's detail — or, when the page has no content,
    /// the noSelection slot.</summary>
    private static ComponentDto CollectionDetail(CollectionDetailPage t, List<ComponentDto> detail, Func<IComponent, ComponentDto> map) =>
        Row("collection-detail",
        [
            Slot("collection-detail-list", t.List.Select(map).ToList(), "flex: 0 0 24rem; max-width: 100%"),
            detail.Count == 0
                ? Slot("collection-detail-no-selection", t.NoSelection.Select(map).ToList(), "flex: 1 1 24rem; min-width: min(24rem, 100%)")
                : Slot("collection-detail-detail", detail, "flex: 1 1 24rem; min-width: min(24rem, 100%)"),
        ]);

    /// <summary>One FoldoutLayout: the overview slot as its overview, the form's FoldoutPanels as its
    /// panels (any other content component becomes an untitled open panel). The header stays the form's.</summary>
    private static ComponentDto Foldout(FoldoutPage t, Form form, Func<IComponent, ComponentDto> map)
    {
        var panels = new List<FoldoutPanel>();
        foreach (var c in form.Content)
            panels.Add(c as FoldoutPanel ?? new FoldoutPanel { Id = "panel" + panels.Count, Open = true, Content = c });
        var layout = new FoldoutLayout
        {
            Id = "foldout",
            Overview = new VerticalLayout { Id = "foldout-overview", Content = t.Overview, Style = "width: 100%" },
            Panels = panels,
            Orientation = string.IsNullOrWhiteSpace(t.Orientation) ? "vertical" : t.Orientation.Trim().ToLowerInvariant(),
        };
        return map(layout);
    }

    /// <summary>The main slot — and, with a detail, the detail beside it like an aside: the
    /// "main aside" named slots of one responsive grid, the aside fixed-width, stacking below 48rem.</summary>
    private static List<ComponentDto> AdvancedCreateEdit(AdvancedCreateEditPage t, List<ComponentDto> main, Func<IComponent, ComponentDto> map)
    {
        if (t.Detail.Count == 0) return main;
        return
        [
            Client(new ResponsiveGridMetadataDto("1fr 22rem", null, StackBelow: "48rem", GridTemplateAreas: "\"main aside\""),
                "advanced-create-edit",
                [Region(main) with { Slot = "main" }, Region(t.Detail.Select(map).ToList()) with { Slot = "aside" }]),
        ];
    }

    /// <summary>One tab per step, in order (the steps of one form, moved between without a round trip).</summary>
    private static ComponentDto GuidedProcess(GuidedProcessPage t, Func<IComponent, ComponentDto> map) =>
        Client(new TabLayoutMetadataDto(), "guided-process",
            t.Steps.Select((step, i) => (ComponentDto)Client(
                new TabMetadataDto(step.Title ?? "") { Active = i == 0 }, null,
                [Region(step.Content.Select(map).ToList())])).ToList());

    /// <summary>The DataManagement archetype's shape: the title, the toolbar (the form's buttons),
    /// the data view (the content, an open end panel reflowing beside it) and an open bottom panel.</summary>
    private static ComponentDto DataManagement(DataManagementPage t, Form form, Func<IComponent, ComponentDto> map)
    {
        var page = new List<ComponentDto>();
        if (!string.IsNullOrWhiteSpace(form.Title))
            page.Add(Client(new TextMetadataDto(form.Title) { Size = "xl", NoMargins = true, Container = "div" },
                "data-management-title", [], "font-weight: 600;"));
        page.Add(Client(new HorizontalLayoutMetadataDto { Spacing = true }, "data-management-toolbar",
            form.Toolbar.Select(b => map(b)).ToList(), "align-items: center;"));
        var view = Region(form.Content.Select(map).ToList());
        if (t.End is { Open: true } end)
            view = Client(new ResponsiveGridMetadataDto("1fr " + (end.Size ?? "22rem"), null, StackBelow: "48rem"),
                "data-management-body",
                [view, Docked(end, "border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding-left: var(--lumo-space-m, 1rem);", map)]);
        page.Add(view);
        if (t.Bottom is { Open: true } bottom)
            page.Add(Docked(bottom,
                "border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding-top: var(--lumo-space-s, .5rem); max-height: "
                + (bottom.Size ?? "16rem") + "; overflow: auto;", map));
        return Client(new VerticalLayoutMetadataDto { Spacing = true, FullWidth = true, HorizontalAlignment = "STRETCH" },
            "data-management", page);
    }

    /// <summary>A docked panel: its title over its content (no close button — nothing to toggle it with).</summary>
    private static ComponentDto Docked(DockedPanel panel, string style, Func<IComponent, ComponentDto> map)
    {
        var body = new List<ComponentDto>
        {
            Client(new HorizontalLayoutMetadataDto { Spacing = false }, null,
            [
                Client(new TextMetadataDto(panel.Title) { Size = "m", NoMargins = true, Container = "div" }, null, [],
                    "font-weight: 600; flex: 1;"),
            ], "align-items: center; width: 100%;"),
        };
        if (panel.Content is not null) body.Add(map(panel.Content));
        return new ClientSideComponentDto(new VerticalLayoutMetadataDto(), panel.Id, body, style, "mateu-docked-panel", null);
    }

    // ── building blocks ────────────────────────────────────────────────────────────────────

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id, List<ComponentDto> children, string? style = null) =>
        new(meta, id, children, style, null, null);

    /// <summary>A slot: a plain column whose id names it.</summary>
    private static ClientSideComponentDto Slot(string id, List<ComponentDto> content, string style) =>
        Client(new VerticalLayoutMetadataDto(), id, content, style);

    /// <summary>A wrapping, spaced row.</summary>
    private static ClientSideComponentDto Row(string id, List<ComponentDto> content) =>
        Client(new HorizontalLayoutMetadataDto { Spacing = true, Wrap = true }, id, content);

    /// <summary>A stretched, spaced, full-width column (a template region).</summary>
    private static ClientSideComponentDto Region(List<ComponentDto> content) =>
        Client(new VerticalLayoutMetadataDto { Spacing = true, FullWidth = true, HorizontalAlignment = "STRETCH" }, null, content);
}
