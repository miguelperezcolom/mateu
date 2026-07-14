using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Maps fluent components (Mateu.Uidl.IComponent trees) to wire ClientSideComponentDtos —
/// the C# analogue of the Java fragment-mapper mappers (MetricCardMapper, FoldoutLayoutMapper…).
/// The JSON shape (type discriminators, field names, slots) matches the Java backend exactly.</summary>
public static class ComponentMapper
{
    public static ClientSideComponentDto Map(IComponent component) => component switch
    {
        MetricCard m => Dto(m, new MetricCardMetadataDto(
            m.Title, m.Value, m.Unit, LowerName(m.Trend), m.TrendLabel, m.Icon, m.Description, m.ActionId)),

        Scoreboard s => Dto(s, new ScoreboardMetadataDto(), s.Metrics.Select(Map)),

        DashboardPanel p => Dto(p,
            new DashboardPanelMetadataDto(p.Title, p.Subtitle, p.ColSpan, p.RowSpan),
            p.Content is null ? null : new ComponentDto[] { Map(p.Content) }),

        DashboardLayout d => Dto(d, new DashboardLayoutMetadataDto(d.Columns), d.Items.Select(Map)),

        FoldoutLayout f => MapFoldout(f),

        HeroSection h => Dto(h,
            new HeroSectionMetadataDto(h.Title, h.Subtitle, h.Image, h.Height, h.Centered),
            h.Content.Select(Map)),

        EmptyState e => Dto(e, new EmptyStateMetadataDto(e.Icon, e.Title, e.Description, e.ActionId, e.ActionLabel)),

        Skeleton s => Dto(s, new SkeletonMetadataDto(LowerName(s.Variant)!, s.Count)),

        Gantt g => Dto(g, new GanttMetadataDto(g.Tasks.Select(t => new GanttTaskDto(
            t.Id, t.Title, Iso(t.Start), Iso(t.End), t.Progress, t.Color)).ToList())),

        Kanban k => Dto(k, new KanbanMetadataDto(k.Columns.Select(col => new KanbanColumnDto(
            col.Id, col.Title, col.Color, col.Cards.Select(c => new KanbanCardDto(
                c.Id, c.Title, c.Description, c.Badge, c.Color, c.ActionId)).ToList())).ToList())),

        Timeline tl => Dto(tl, new TimelineMetadataDto(tl.Items.Select(it => new TimelineItemDto(
            it.Id, it.Title, it.Description, it.Timestamp, it.Icon, it.Color, it.ActionId)).ToList())),

        ProgressSteps ps => Dto(ps, new ProgressStepsMetadataDto(ps.Steps.Select(st => new StepDto(
            st.Id, st.Title, st.Description, st.Status)).ToList())),

        Stat st => Dto(st, new StatMetadataDto(
            st.Label, st.Value, st.Unit, st.Delta, st.Trend, st.Spark, st.ActionId)),

        Calendar cal => Dto(cal, new CalendarMetadataDto(Iso(cal.Month), cal.Events.Select(e =>
            new CalendarEventDto(e.Id, e.Title, Iso(e.Date), e.Color, e.ActionId)).ToList())),

        PricingTable pt => Dto(pt, new PricingTableMetadataDto(pt.Plans.Select(p => new PricingPlanDto(
            p.Id, p.Name, p.Price, p.Period, p.Featured, p.Features, p.CtaLabel, p.ActionId)).ToList())),

        OrgChart oc => Dto(oc, new OrgChartMetadataDto(MapOrgNode(oc.Root))),

        Heatmap hm => Dto(hm, new HeatmapMetadataDto(hm.Cells.Select(cl =>
            new HeatCellDto(Iso(cl.Date), cl.Value, cl.Label)).ToList())),

        Funnel fn => Dto(fn, new FunnelMetadataDto(fn.Stages.Select(s =>
            new FunnelStageDto(s.Label, s.Value, s.Color)).ToList())),

        TrendChart tc => Dto(tc, new TrendChartMetadataDto(tc.Title, tc.Values, tc.Labels, tc.Color, tc.Area)),

        FeatureGrid fg => Dto(fg, new FeatureGridMetadataDto(fg.Features.Select(f =>
            new FeatureDto(f.Icon, f.Title, f.Description, f.ActionId)).ToList(), fg.Columns)),

        Testimonials ts => Dto(ts, new TestimonialsMetadataDto(ts.Items.Select(t =>
            new TestimonialDto(t.Quote, t.Author, t.Role, t.Avatar, t.Rating)).ToList())),

        // Generic building blocks (used by the archetypes and free composition).
        Text t => Dto(t, new TextMetadataDto(t.Content)),
        Button b => Dto(b, new ButtonMetadataDto(b.Label, b.ActionId) { ButtonStyle = b.Primary ? "Primary" : null }),
        Card c => Dto(c, new CardMetadataDto(c.Content is null ? null! : Map(c.Content)) { Title = c.Title }),
        HorizontalLayout hl => Dto(hl, new HorizontalLayoutMetadataDto { Spacing = hl.Spacing }, hl.Content.Select(Map)),
        VerticalLayout vl => Dto(vl, new VerticalLayoutMetadataDto { Spacing = vl.Spacing }, vl.Content.Select(Map)),
        TabLayout tl => Dto(tl,
            new TabLayoutMetadataDto { GroupRelationship = LowerName(tl.GroupRelationship), Adaptable = tl.Adaptable },
            // The tab selected on first render is the first one flagged Active, else the first tab.
            tl.Tabs.Select((tab, i) =>
                new ClientSideComponentDto(
                    new TabMetadataDto(tab.Label) { Active = i == TabActiveIndex(tl.Tabs) }, null, [Map(tab.Content)], null, null, null))),

        // Federation — a remote Mateu UI mounted as an island inside this page.
        MicroFrontend mf => Dto(mf, new MicroFrontendMetadataDto(mf.BaseUrl, mf.Route)
        {
            Style = mf.Style,
            CssClasses = mf.CssClasses,
            AppState = mf.AppState,
        }),

        // Overlays — returned from actions; SyncHandler emits them as Add fragments.
        Drawer dr => Dto(dr, new DrawerMetadataDto(dr.Id, dr.HeaderTitle, dr.Content is null ? null : Map(dr.Content))
        {
            Header = dr.Header is null ? null : Map(dr.Header),
            Footer = dr.Footer is null ? null : Map(dr.Footer),
            Position = LowerName(dr.Position),
            Width = dr.Width,
            NoPadding = dr.NoPadding,
            Modeless = dr.Modeless,
        }),
        Dialog dg => Dto(dg, new DialogMetadataDto(dg.Id, dg.HeaderTitle, dg.Content is null ? null : Map(dg.Content))
        {
            Header = dg.Header is null ? null : Map(dg.Header),
            Footer = dg.Footer is null ? null : Map(dg.Footer),
            Width = dg.Width,
            Height = dg.Height,
            NoPadding = dg.NoPadding,
            Modeless = dg.Modeless,
            CloseButtonOnHeader = dg.CloseButtonOnHeader,
        }),

        _ => throw new NotSupportedException($"Unmapped component type: {component.GetType().Name}"),
    };

    /// <summary>Foldout: panel headers ride in the metadata; the overview travels as the child
    /// slotted "overview" and each panel's content as the child slotted "panel-N".</summary>
    private static ClientSideComponentDto MapFoldout(FoldoutLayout f)
    {
        var children = new List<ComponentDto>();
        if (f.Overview is not null)
            children.Add(Map(f.Overview) with { Slot = "overview" });
        var infos = new List<FoldoutPanelInfoDto>();
        for (var i = 0; i < f.Panels.Count; i++)
        {
            var panel = f.Panels[i];
            infos.Add(new FoldoutPanelInfoDto(panel.Title, panel.Subtitle, panel.Icon, panel.Open));
            if (panel.Content is not null)
                children.Add(Map(panel.Content) with { Slot = $"panel-{i}" });
        }
        return new ClientSideComponentDto(new FoldoutLayoutMetadataDto(infos), f.Id, children, f.Style, f.CssClasses, null);
    }

    /// <summary>All actionIds referenced anywhere in the tree (MetricCard/EmptyState tiles, buttons),
    /// so the view's ServerSideComponent can advertise them and the renderer routes them back.</summary>
    public static IEnumerable<string> CollectActionIds(IComponent component)
    {
        var ids = new List<string>();
        Collect(component, ids);
        return ids.Distinct();
    }

    private static void Collect(IComponent c, List<string> ids)
    {
        switch (c)
        {
            case MetricCard m when !string.IsNullOrEmpty(m.ActionId): ids.Add(m.ActionId); break;
            case EmptyState e when !string.IsNullOrEmpty(e.ActionId): ids.Add(e.ActionId); break;
            case Button b when !string.IsNullOrEmpty(b.ActionId): ids.Add(b.ActionId); break;
            case Scoreboard s: foreach (var m in s.Metrics) Collect(m, ids); break;
            case DashboardPanel p when p.Content is not null: Collect(p.Content, ids); break;
            case DashboardLayout d: foreach (var i in d.Items) Collect(i, ids); break;
            case FoldoutLayout f:
                if (f.Overview is not null) Collect(f.Overview, ids);
                foreach (var p in f.Panels.Where(p => p.Content is not null)) Collect(p.Content!, ids);
                break;
            case HeroSection h: foreach (var i in h.Content) Collect(i, ids); break;
            case Card card when card.Content is not null: Collect(card.Content, ids); break;
            case HorizontalLayout hl: foreach (var i in hl.Content) Collect(i, ids); break;
            case VerticalLayout vl: foreach (var i in vl.Content) Collect(i, ids); break;
            case TabLayout tl: foreach (var t in tl.Tabs) Collect(t.Content, ids); break;
        }
    }

    private static ClientSideComponentDto Dto(IComponent c, ComponentMetadataDto meta, IEnumerable<ComponentDto>? children = null) =>
        new(meta, c.Id, children?.ToList() ?? [], c.Style, c.CssClasses, null);

    private static string? LowerName<T>(T? value) where T : struct, Enum =>
        value?.ToString().ToLowerInvariant();

    private static string LowerName<T>(T value) where T : struct, Enum =>
        value.ToString().ToLowerInvariant();

    private static string? Iso(DateOnly? d) => d?.ToString("yyyy-MM-dd");

    private static OrgNodeDto? MapOrgNode(OrgNode? n) =>
        n is null ? null : new OrgNodeDto(n.Id, n.Title, n.Subtitle, n.Avatar, n.Color, n.ActionId,
            n.Children.Select(c => MapOrgNode(c)!).ToList());

    // Index of the tab selected on first render: the first one flagged Active, else the first tab.
    private static int TabActiveIndex(IReadOnlyList<TabPanel> tabs)
    {
        for (var i = 0; i < tabs.Count; i++)
            if (tabs[i].Active) return i;
        return 0;
    }
}
