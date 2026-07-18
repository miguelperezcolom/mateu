using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Views under test ──────────────────────────────────────────────────────────

[UI("dash"), Title("Dash")]
public class Dash : Dashboard
{
    protected override int Columns => 3;

    public MetricCard Revenue { get; } = new()
    {
        Title = "Revenue", Value = "1.2", Unit = "M",
        Trend = MetricTrend.Up, TrendLabel = "12% more", Icon = "euro",
        Description = "Total revenue", ActionId = "openRevenue",
    };

    public MetricCard Orders { get; } = new() { Title = "Orders", Value = "348", Trend = MetricTrend.Down };

    [Panel(Title = "Plan", Subtitle = "Q3", ColSpan = 2, RowSpan = 1)]
    public Gantt Plan { get; } = new()
    {
        Tasks =
        [
            new GanttTask
            {
                Id = "t1", Title = "Build", Start = new DateOnly(2026, 7, 1),
                End = new DateOnly(2026, 8, 15), Progress = 60.5, Color = "#4caf50",
            },
        ],
    };

    [Panel(Title = "Board")]
    public Kanban Board { get; } = new()
    {
        Columns =
        [
            new KanbanColumn
            {
                Id = "todo", Title = "To do", Color = "#94a3b8",
                Cards = [new KanbanCard { Id = "c1", Title = "Task A", Badge = "3" }],
            },
            new KanbanColumn
            {
                Id = "doing", Title = "Doing",
                Cards = [new KanbanCard { Id = "c2", Title = "Task B", Description = "in flight", ActionId = "openCard" }],
            },
        ],
    };

    [Panel(Title = "Board")]
    public Timeline Feed { get; } = new()
    {
        Items =
        [
            new TimelineItem { Id = "e1", Title = "Order placed", Timestamp = "09:00", Icon = "cart" },
            new TimelineItem { Id = "e2", Title = "Shipped", Description = "Tracking #ABC", Timestamp = "14:20", Color = "#10b981", ActionId = "openShipment" },
        ],
    };

    [Panel(Title = "Progress")]
    public ProgressSteps Progress { get; } = new()
    {
        Steps =
        [
            new Step { Id = "s1", Title = "Cart", Status = "done" },
            new Step { Id = "s2", Title = "Payment", Description = "in progress", Status = "current" },
            new Step { Id = "s3", Title = "Done", Status = "upcoming" },
        ],
    };

    [Panel(Title = "MRR")]
    public Stat Mrr { get; } = new()
    {
        Label = "MRR", Value = "48.2", Unit = "k", Delta = "+7.4%", Trend = "up",
        Spark = [30, 32, 31, 35, 40, 42, 48], ActionId = "openMrr",
    };

    [Panel(Title = "Calendar")]
    public Calendar Cal { get; } = new()
    {
        Month = new DateOnly(2026, 3, 1),
        Events =
        [
            new CalendarEvent { Id = "ev1", Title = "Kickoff", Date = new DateOnly(2026, 3, 4), Color = "#3b82f6" },
            new CalendarEvent { Id = "ev2", Title = "Launch", Date = new DateOnly(2026, 3, 20), ActionId = "openEvent" },
        ],
    };

    [Panel(Title = "Pricing")]
    public PricingTable Pricing { get; } = new()
    {
        Plans =
        [
            new PricingPlan { Id = "free", Name = "Free", Price = "0", Period = "/mo", Features = ["1 project"], CtaLabel = "Start", ActionId = "choosePlan" },
            new PricingPlan { Id = "pro", Name = "Pro", Price = "29", Period = "/mo", Featured = true, Features = ["Unlimited projects", "Priority support"], CtaLabel = "Go Pro", ActionId = "choosePlan" },
        ],
    };

    [Panel(Title = "Org")]
    public OrgChart Org { get; } = new()
    {
        Root = new OrgNode
        {
            Id = "ceo", Title = "Ada", Subtitle = "CEO", ActionId = "openPerson",
            Children =
            [
                new OrgNode { Id = "cto", Title = "Alan", Subtitle = "CTO" },
                new OrgNode { Id = "cfo", Title = "Grace", Subtitle = "CFO" },
            ],
        },
    };

    [Panel(Title = "Heat")]
    public Heatmap Heat { get; } = new()
    {
        Cells =
        [
            new HeatCell { Date = new DateOnly(2026, 3, 1), Value = 2 },
            new HeatCell { Date = new DateOnly(2026, 3, 2), Value = 5, Label = "5 commits" },
        ],
    };

    [Panel(Title = "Funnel")]
    public Funnel Funnel { get; } = new()
    {
        Stages =
        [
            new FunnelStage { Label = "Visits", Value = 1000 },
            new FunnelStage { Label = "Signups", Value = 400, Color = "#8b5cf6" },
            new FunnelStage { Label = "Paid", Value = 120 },
        ],
    };

    [Panel(Title = "Trend")]
    public TrendChart Trend { get; } = new()
    {
        Title = "Revenue", Values = [10, 14, 12, 18, 22], Labels = ["Jan", "Feb", "Mar", "Apr", "May"],
        Color = "#10b981", Area = true,
    };

    [Panel(Title = "Features")]
    public FeatureGrid Features { get; } = new()
    {
        Columns = 3,
        Features =
        [
            new Feature { Icon = "fast", Title = "Fast", Description = "Blazing quick", ActionId = "openFeature" },
            new Feature { Icon = "lock", Title = "Secure", Description = "Locked down" },
        ],
    };

    [Panel(Title = "Voices")]
    public Testimonials Voices { get; } = new()
    {
        Items =
        [
            new Testimonial { Quote = "Shipped in a day.", Author = "Ada", Role = "CTO", Rating = 5 },
            new Testimonial { Quote = "Solid.", Author = "Alan", Rating = 4 },
        ],
    };

    [Panel(Title = "FAQ")]
    public Faq Faq { get; } = new()
    {
        Items =
        [
            new FaqItem { Question = "Is it free?", Answer = "There is a free tier.", Open = true },
            new FaqItem { Question = "Self-host?", Answer = "Yes." },
        ],
    };

    [Panel(Title = "Callout")]
    public CalloutCard Callout { get; } = new()
    {
        Theme = "success", Icon = "party", Title = "You're all set",
        Description = "Your workspace is ready.", CtaLabel = "Open it", ActionId = "openWorkspace",
    };

    [Panel(Title = "Thread")]
    public CommentThread Thread { get; } = new()
    {
        Comments =
        [
            new Comment
            {
                Id = "c1", Author = "Ada", Text = "Looks good.", Timestamp = "2h",
                Replies = [new Comment { Id = "c2", Author = "Alan", Text = "Agreed." }],
            },
        ],
    };

    [Panel(Title = "Files")]
    public FileList Files { get; } = new()
    {
        Files =
        [
            new FileItem { Name = "report.pdf", Size = "2.4 MB", Type = "pdf", Url = "/dl/report.pdf" },
            new FileItem { Name = "logo.png", Size = "120 KB", Type = "image", ActionId = "openFile" },
        ],
    };

    [Panel(Title = "Checklist")]
    public Checklist Check { get; } = new()
    {
        Title = "Onboarding",
        Items =
        [
            new ChecklistItem { Id = "a", Label = "Create account", Done = true },
            new ChecklistItem { Id = "b", Label = "Invite team", ActionId = "toggleStep" },
        ],
    };

    [Panel(Title = "Comparison")]
    public ComparisonCard Compare { get; } = new()
    {
        Title = "This month vs last",
        LeftLabel = "Last month", LeftValue = "€38k",
        RightLabel = "This month", RightValue = "€48k",
        Delta = "+26%", Trend = "up",
    };

    [Panel(Title = "Guest")]
    public EntityHeader Guest { get; } = new()
    {
        Title = "María Fernández",
        Badges = [new Chip { Label = "PLATINUM", Color = "contrast" }],
        Subtitle = "Ocean Suite · 30 Apr → 07 May · 7N · 2pax · All Inclusive",
        Facts =
        [
            new Fact { Label = "TOTAL RESERVA", Value = "€ 4.890,00" },
            new Fact { Label = "AGENCIA", Value = "TUI Group · TUI Magic Life" },
        ],
        MetricLabel = "FIDELIDAD", MetricValue = "48.500", MetricCaption = "23 estancias",
    };

    [Panel(Title = "Balance")]
    public Meter Balance { get; } = new()
    {
        Label = "BALANCE ACTUAL", Value = 1240.0, Max = 1800.0, Unit = "€",
        Caption = "69% de la preautorización consumido", WarnAt = 1440.0, DangerAt = 1710.0,
    };

    [Panel(Title = "Pax")]
    public TaskProgress Pax { get; } = new()
    {
        Label = "Reserva con 4 pax. Registrar huéspedes adicionales.",
        Total = 4, Done = 1, ActionLabel = "Añadir siguiente pax", ActionId = "addPax",
    };

    [Panel(Title = "Incidents")]
    public StatusList Incidents { get; } = new()
    {
        Items =
        [
            new StatusItem
            {
                Id = "ac", Icon = "🌡", Title = "Aire acondicionado con ruido",
                Description = "Habitación 901 · Reportado 28 Apr · Mantenimiento avisado",
                Status = "En curso", StatusColor = "normal",
            },
            new StatusItem
            {
                Id = "key", Icon = "🔑", Title = "Grabar llave / pulsera",
                Description = "Complemento de llave digital",
                ActionLabel = "Grabar", ActionId = "encodeKey",
            },
            new StatusItem
            {
                Id = "ses", Icon = "✓", Title = "Parte viajeros (SES)",
                Description = "Se enviará automáticamente al confirmar el check-in",
                Status = "Automático", StatusColor = "success",
            },
        ],
    };

    [Panel(Title = "Queue")]
    public TaskQueue Queue { get; } = new()
    {
        ActionId = "openGuest",
        Groups =
        [
            new QueueGroup
            {
                Label = "En hotel · late check-out primero",
                Items =
                [
                    new QueueItem
                    {
                        Id = "1108", Title = "Carlos Mendoza", Caption = "Hab 1108 · 7N",
                        Badges = [new Chip { Label = "LATE · 18:00", Color = "warning" }], Selected = true,
                    },
                ],
            },
            new QueueGroup
            {
                Label = "Salida pendiente",
                Items =
                [
                    new QueueItem
                    {
                        Id = "901", Title = "Sophie Laurent", Caption = "Hab 901",
                        Badges = [new Chip { Label = "GOLD", Color = "contrast" }],
                    },
                ],
            },
        ],
    };

    [Panel(Title = "Rooms")]
    public ResourceGrid Rooms { get; } = new()
    {
        ActionId = "pickRoom", Columns = 4, RecommendedLabel = "RECOMENDADA",
        Items =
        [
            new ResourceItem
            {
                Id = "1201", Title = "1201", Subtitle = "Ocupada", StatusLabel = "Sucia",
                StatusColor = "contrast", Disabled = true,
            },
            new ResourceItem
            {
                Id = "1204", Title = "1204", Subtitle = "Ocean Suite", StatusLabel = "Inspeccionada",
                StatusColor = "success", Recommended = true, Selected = true,
            },
            new ResourceItem
            {
                Id = "1206", Title = "1206", Subtitle = "Libre", StatusLabel = "Limpia",
                StatusColor = "success", Note = "Ducha averiada", NoteColor = "error",
            },
        ],
    };

    [Panel(Title = "Offer")]
    public OfferCard Offer { get; } = new()
    {
        Tag = "UPGRADE DISPONIBLE", Title = "Master Oceanfront Suite",
        Subtitle = "Planta 14 · Primera línea", Image = "https://img/suite.jpg",
        Features = ["68 m²", "Vista mar frontal", "Terraza + jacuzzi", "Sofá lounge"],
        PriceLabel = "+ € 65 / noche", ActionLabel = "Mejorar a esta habitación",
        ActionId = "upgrade", Added = true, AddedLabel = "✓ Upgrade añadido",
    };

    [Panel(Title = "Extras")]
    public AddOnPicker Extras { get; } = new()
    {
        TotalLabel = "Añadidos", Currency = "€", ActionId = "extrasChanged",
        Items =
        [
            new AddOn
            {
                Id = "allinc", Icon = "🍹", Title = "Paquete All Inclusive",
                Description = "Todo incluido · 7 noches · 2 pax", Price = 343.0, Unit = "estancia",
            },
            new AddOn
            {
                Id = "parking", Icon = "🅿", Title = "Parking",
                Description = "Cubierto · Vigilancia 24h", IncludedLabel = "Incluido Platinum",
            },
            new AddOn
            {
                Id = "late", Icon = "🕕", Title = "Late check-out",
                Description = "Hasta las 18:00h", Price = 40.0, Added = true,
            },
        ],
    };

    [Panel(Title = "Folio")]
    public Ledger Folio { get; } = new()
    {
        Currency = "€", TotalLabel = "Total",
        Lines =
        [
            new LedgerLine { Concept = "Alojamiento x7 noches", Amount = 1540.0 },
            new LedgerLine { Concept = "All Inclusive Package", Included = true, IncludedLabel = "Incluido" },
            new LedgerLine { Concept = "Descuento Platinum -10%", Amount = -154.0 },
        ],
        Total = 1710.5,
    };

    [Panel(Title = "Payment")]
    public PaymentPicker Payment { get; } = new()
    {
        ActionId = "confirmPayment",
        Methods =
        [
            new PaymentMethod { Id = "card", Label = "Tarjeta" },
            new PaymentMethod { Id = "cash", Label = "Efectivo" },
            new PaymentMethod { Id = "points", Label = "Puntos" },
        ],
        Selected = "card",
        ContextLabel = "PREAUTORIZADO", ContextValue = "€ 1.800,00",
        ConfirmLabel = "Confirmar — € 1.710,50",
    };

    [Panel(Title = "Automations")]
    public ProcessMonitor Automations { get; } = new()
    {
        Items =
        [
            new ProcessItem
            {
                Id = "credit", Name = "Facturación a Crédito", Systems = ["OHIP", "OIC", "Voxel"],
                Ok = 847, Warnings = 6, Errors = 0, Status = "warning",
                ActionLabel = "Solucionar", ActionId = "fixCredit",
            },
            new ProcessItem
            {
                Id = "sales", Name = "Comercializadora", Systems = ["OHIP", "ERP Fusion A/R"],
                Ok = 418, Warnings = 0, Errors = 0, Status = "ok",
            },
        ],
    };

    [Panel] // title defaults to the humanized property name
    public EmptyState Alerts { get; } = new()
    {
        Icon = "party", Title = "No alerts", Description = "All good.",
        ActionId = "refresh", ActionLabel = "Refresh",
    };

    public Skeleton Loading { get; } = new() { Variant = SkeletonVariant.Grid, Count = 5 };

    public Message OpenRevenue() => new("drill-in");
    public Message Refresh() => new("refreshed");
}

[UI("fold"), Title("Fold")]
public class Fold : Foldout
{
    protected override IReadOnlyList<string> HeaderBadges => ["Confirmed", "12-19 Aug"];

    public Text Overview { get; } = new("the record overview");

    [Panel(Title = "Guests", Icon = "people")]
    public Text Guests { get; } = new("guest list");

    [Panel(Title = "Payments", Subtitle = "Money", Open = false)]
    public Text Payments { get; } = new("payment info");
}

[UI("greet-page"), Title("Greet page")]
public class WelcomePage : Welcome
{
    protected override string? HeroTitle => "Hello there";
    protected override string? HeroSubtitle => "Start here";
    protected override string? HeroImage => "https://img/hero.jpg";

    public Button Start { get; } = new("Get started", "go") { Primary = true };

    [Panel(Title = "Feature A")]
    public Text A { get; } = new("does A");

    public Message Go() => new("gone");
}

[UI("item"), Title("Item")]
public class Item : ItemOverview
{
    public Text KeyInfo { get; } = new("the key info");

    [Panel(Title = "Details")]
    public Text Details { get; } = new("the details");

    [Panel(Title = "History")]
    public Text History { get; } = new("the history");
}

/// <summary>The planning board / tape chart (Java: PlanningBoardSyncTest's fixture).</summary>
[UI("planning"), Title("Room planning")]
public class PlanningPage : IComponentTreeSupplier
{
    public IComponent Component() => new PlanningBoard
    {
        Id = "tape",
        From = new DateOnly(2026, 8, 1),
        To = new DateOnly(2026, 8, 21),
        Resources =
        [
            new PlanningResource { Id = "101", Label = "Room 101", Group = "Floor 1" },
            new PlanningResource { Id = "102", Label = "Room 102", Group = "Floor 1" },
            new PlanningResource { Id = "201", Label = "Room 201", Group = "Floor 2" },
        ],
        Blocks =
        [
            new PlanningBlock
            {
                Id = "b1", ResourceId = "101", Start = new DateOnly(2026, 8, 3),
                End = new DateOnly(2026, 8, 7), Label = "Ada Lovelace",
                Color = "#3b82f6", Status = "confirmed",
            },
            new PlanningBlock
            {
                Id = "b2", ResourceId = "201", Start = new DateOnly(2026, 8, 5),
                End = new DateOnly(2026, 8, 12), Label = "Grace Hopper",
            },
        ],
        MoveActionId = "moveBooking",
        SelectActionId = "openBooking",
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

public class ComponentTests
{
    // Same options as the sync endpoint (MateuExtensions.Json): camelCase, keep nulls, raw UTF-8
    // (no \uXXXX escaping) — the Java (Jackson) wire representation.
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(Dash).Assembly));

    private static string RenderView(Type viewType) =>
        JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    [Fact]
    public void Dashboard_emits_scoreboard_band_panels_and_grid()
    {
        var json = RenderView(typeof(Dash));

        // The grid, with the fixed column count.
        Assert.Contains("\"type\":\"DashboardLayout\"", json);
        Assert.Contains("\"columns\":3", json);

        // Consecutive MetricCards grouped into one Scoreboard band.
        Assert.Contains("\"type\":\"Scoreboard\"", json);
        Assert.Contains("\"type\":\"MetricCard\"", json);
        Assert.Contains("\"title\":\"Revenue\"", json);
        Assert.Contains("\"value\":\"1.2\"", json);
        Assert.Contains("\"trend\":\"up\"", json);
        Assert.Contains("\"trend\":\"down\"", json);
        Assert.Contains("\"trendLabel\":\"12% more\"", json);
        Assert.Contains("\"description\":\"Total revenue\"", json);
        Assert.Contains("\"actionId\":\"openRevenue\"", json);

        // [Panel] wraps the component in a DashboardPanel tile (title/subtitle/spans in metadata).
        Assert.Contains("\"type\":\"DashboardPanel\"", json);
        Assert.Contains("\"title\":\"Plan\"", json);
        Assert.Contains("\"subtitle\":\"Q3\"", json);
        Assert.Contains("\"colSpan\":2", json);
        Assert.Contains("\"rowSpan\":1", json);
        Assert.Contains("\"title\":\"Alerts\"", json); // [Panel] title defaulted from the property name

        // EmptyState and Skeleton tiles.
        Assert.Contains("\"type\":\"EmptyState\"", json);
        Assert.Contains("\"actionLabel\":\"Refresh\"", json);
        Assert.Contains("\"type\":\"Skeleton\"", json);
        Assert.Contains("\"variant\":\"grid\"", json);
        Assert.Contains("\"count\":5", json);

        // Tile actionIds are advertised so the renderer routes them back.
        Assert.Contains("{\"id\":\"openRevenue\"", json);
        Assert.Contains("{\"id\":\"refresh\"", json);
    }

    [Fact]
    public void Gantt_emits_tasks_with_iso_dates_and_progress()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Gantt\"", json);
        Assert.Contains("\"tasks\":[{", json);
        Assert.Contains("\"id\":\"t1\"", json);
        Assert.Contains("\"title\":\"Build\"", json);
        Assert.Contains("\"start\":\"2026-07-01\"", json);
        Assert.Contains("\"end\":\"2026-08-15\"", json);
        Assert.Contains("\"progress\":60.5", json);
        Assert.Contains("\"color\":\"#4caf50\"", json);
    }

    [Fact]
    public void PlanningBoard_emits_resources_groups_blocks_iso_dates_window_and_action_ids()
    {
        var json = RenderView(typeof(PlanningPage));

        // Same wire shape the Java backend emits for PlanningBoardSyncTest's fixture.
        Assert.Contains("\"type\":\"PlanningBoard\"", json);
        Assert.Contains(
            "\"resources\":[" +
            "{\"id\":\"101\",\"label\":\"Room 101\",\"group\":\"Floor 1\"}," +
            "{\"id\":\"102\",\"label\":\"Room 102\",\"group\":\"Floor 1\"}," +
            "{\"id\":\"201\",\"label\":\"Room 201\",\"group\":\"Floor 2\"}]",
            json);
        Assert.Contains(
            "\"blocks\":[" +
            "{\"id\":\"b1\",\"resourceId\":\"101\",\"start\":\"2026-08-03\",\"end\":\"2026-08-07\"," +
            "\"label\":\"Ada Lovelace\",\"color\":\"#3b82f6\",\"status\":\"confirmed\"}," +
            "{\"id\":\"b2\",\"resourceId\":\"201\",\"start\":\"2026-08-05\",\"end\":\"2026-08-12\"," +
            "\"label\":\"Grace Hopper\",\"color\":null,\"status\":null}]",
            json);
        Assert.Contains("\"from\":\"2026-08-01\"", json);
        Assert.Contains("\"to\":\"2026-08-21\"", json);
        Assert.Contains("\"moveActionId\":\"moveBooking\"", json);
        Assert.Contains("\"selectActionId\":\"openBooking\"", json);
        // The board's action ids are advertised so the renderer routes them back.
        Assert.Contains("{\"id\":\"moveBooking\"", json);
        Assert.Contains("{\"id\":\"openBooking\"", json);
        // The component id travels on the wrapping ClientSide component.
        Assert.Contains("\"id\":\"tape\"", json);
    }

    [Fact]
    public void Kanban_emits_columns_and_cards()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Kanban\"", json);
        Assert.Contains("\"columns\":[{", json);
        Assert.Contains("\"title\":\"To do\"", json);
        Assert.Contains("\"color\":\"#94a3b8\"", json);
        Assert.Contains("\"badge\":\"3\"", json);
        Assert.Contains("\"actionId\":\"openCard\"", json);
    }

    [Fact]
    public void Timeline_emits_items()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Timeline\"", json);
        Assert.Contains("\"items\":[{", json);
        Assert.Contains("\"title\":\"Order placed\"", json);
        Assert.Contains("\"timestamp\":\"14:20\"", json);
        Assert.Contains("\"actionId\":\"openShipment\"", json);
    }

    [Fact]
    public void Progress_steps_emit_statuses()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"ProgressSteps\"", json);
        Assert.Contains("\"steps\":[{", json);
        Assert.Contains("\"title\":\"Cart\"", json);
        Assert.Contains("\"status\":\"done\"", json);
        Assert.Contains("\"status\":\"current\"", json);
    }

    [Fact]
    public void Stat_emits_value_delta_and_sparkline()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Stat\"", json);
        Assert.Contains("\"value\":\"48.2\"", json);
        Assert.Contains("\"delta\":\"+7.4%\"", json);
        Assert.Contains("\"trend\":\"up\"", json);
        Assert.Contains("\"spark\":[30", json);
    }

    [Fact]
    public void Calendar_emits_month_and_events_with_iso_dates()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Calendar\"", json);
        Assert.Contains("\"month\":\"2026-03-01\"", json);
        Assert.Contains("\"title\":\"Kickoff\"", json);
        Assert.Contains("\"date\":\"2026-03-04\"", json);
        Assert.Contains("\"actionId\":\"openEvent\"", json);
    }

    [Fact]
    public void Pricing_table_emits_plans_with_featured_flag()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"PricingTable\"", json);
        Assert.Contains("\"name\":\"Pro\"", json);
        Assert.Contains("\"featured\":true", json);
        Assert.Contains("\"price\":\"29\"", json);
        Assert.Contains("\"ctaLabel\":\"Go Pro\"", json);
    }

    [Fact]
    public void Org_chart_emits_nested_nodes()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"OrgChart\"", json);
        Assert.Contains("\"title\":\"Ada\"", json);
        Assert.Contains("\"subtitle\":\"CEO\"", json);
        Assert.Contains("\"title\":\"Alan\"", json);
        Assert.Contains("\"children\":[", json);
    }

    [Fact]
    public void Heatmap_emits_cells_with_iso_dates()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Heatmap\"", json);
        Assert.Contains("\"date\":\"2026-03-01\"", json);
        Assert.Contains("\"value\":5", json);
        Assert.Contains("\"label\":\"5 commits\"", json);
    }

    [Fact]
    public void Funnel_emits_stages()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Funnel\"", json);
        Assert.Contains("\"label\":\"Visits\"", json);
        Assert.Contains("\"value\":1000", json);
        Assert.Contains("\"color\":\"#8b5cf6\"", json);
    }

    [Fact]
    public void Trend_chart_emits_values_and_labels()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"TrendChart\"", json);
        Assert.Contains("\"title\":\"Revenue\"", json);
        Assert.Contains("\"values\":[10", json);
        Assert.Contains("\"area\":true", json);
    }

    [Fact]
    public void Feature_grid_emits_features()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"FeatureGrid\"", json);
        Assert.Contains("\"columns\":3", json);
        Assert.Contains("\"title\":\"Fast\"", json);
        Assert.Contains("\"actionId\":\"openFeature\"", json);
    }

    [Fact]
    public void Testimonials_emit_quotes_and_ratings()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Testimonials\"", json);
        Assert.Contains("\"quote\":\"Shipped in a day.\"", json);
        Assert.Contains("\"author\":\"Ada\"", json);
        Assert.Contains("\"rating\":5", json);
    }

    [Fact]
    public void Faq_emits_items()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Faq\"", json);
        Assert.Contains("\"question\":\"Is it free?\"", json);
        Assert.Contains("\"answer\":\"There is a free tier.\"", json);
        Assert.Contains("\"open\":true", json);
    }

    [Fact]
    public void Callout_card_emits_theme_and_cta()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"CalloutCard\"", json);
        Assert.Contains("\"theme\":\"success\"", json);
        Assert.Contains("\"title\":\"You're all set\"", json);
        Assert.Contains("\"actionId\":\"openWorkspace\"", json);
    }

    [Fact]
    public void Comment_thread_emits_nested_replies()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"CommentThread\"", json);
        Assert.Contains("\"author\":\"Ada\"", json);
        Assert.Contains("\"text\":\"Looks good.\"", json);
        Assert.Contains("\"replies\":[", json);
        Assert.Contains("\"author\":\"Alan\"", json);
    }

    [Fact]
    public void File_list_emits_files()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"FileList\"", json);
        Assert.Contains("\"name\":\"report.pdf\"", json);
        Assert.Contains("\"type\":\"pdf\"", json);
        Assert.Contains("\"actionId\":\"openFile\"", json);
    }

    [Fact]
    public void Checklist_emits_items_and_done()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Checklist\"", json);
        Assert.Contains("\"title\":\"Onboarding\"", json);
        Assert.Contains("\"label\":\"Create account\"", json);
        Assert.Contains("\"done\":true", json);
        Assert.Contains("\"actionId\":\"toggleStep\"", json);
    }

    [Fact]
    public void Comparison_card_emits_both_sides_and_delta()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"ComparisonCard\"", json);
        Assert.Contains("\"title\":\"This month vs last\"", json);
        Assert.Contains("\"leftValue\":\"€38k\"", json);
        Assert.Contains("\"rightValue\":\"€48k\"", json);
        Assert.Contains("\"delta\":\"+26%\"", json);
        Assert.Contains("\"trend\":\"up\"", json);
    }

    [Fact]
    public void Entity_header_emits_badges_facts_and_metric()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"EntityHeader\"", json);
        Assert.Contains("\"title\":\"María Fernández\"", json);
        Assert.Contains("\"label\":\"PLATINUM\"", json);
        Assert.Contains("\"label\":\"TOTAL RESERVA\"", json);
        Assert.Contains("\"metricValue\":\"48.500\"", json);
    }

    [Fact]
    public void Meter_emits_value_max_and_thresholds_as_numbers()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Meter\"", json);
        Assert.Contains("\"label\":\"BALANCE ACTUAL\"", json);
        Assert.Contains("\"value\":1240", json);
        Assert.Contains("\"max\":1800", json);
        Assert.Contains("\"warnAt\":1440", json);
    }

    [Fact]
    public void Task_progress_emits_counts_and_cta()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"TaskProgress\"", json);
        Assert.Contains("\"total\":4", json);
        Assert.Contains("\"done\":1", json);
        Assert.Contains("\"actionId\":\"addPax\"", json);
    }

    [Fact]
    public void Status_list_emits_items_with_chips_and_actions()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"StatusList\"", json);
        Assert.Contains("\"title\":\"Aire acondicionado con ruido\"", json);
        Assert.Contains("\"status\":\"Automático\"", json);
        Assert.Contains("\"actionId\":\"encodeKey\"", json);
    }

    [Fact]
    public void Task_queue_emits_groups_with_badged_cards()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"TaskQueue\"", json);
        Assert.Contains("\"actionId\":\"openGuest\"", json);
        Assert.Contains("\"title\":\"Carlos Mendoza\"", json);
        Assert.Contains("\"label\":\"LATE · 18:00\"", json);
        Assert.Contains("\"selected\":true", json);
    }

    [Fact]
    public void Resource_grid_emits_items_with_status_and_flags()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"ResourceGrid\"", json);
        Assert.Contains("\"recommendedLabel\":\"RECOMENDADA\"", json);
        Assert.Contains("\"recommended\":true", json);
        Assert.Contains("\"note\":\"Ducha averiada\"", json);
        Assert.Contains("\"disabled\":true", json);
    }

    [Fact]
    public void Offer_card_emits_tag_features_and_price()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"OfferCard\"", json);
        Assert.Contains("\"tag\":\"UPGRADE DISPONIBLE\"", json);
        Assert.Contains("\"priceLabel\":\"+ € 65 / noche\"", json);
        Assert.Contains("\"current\":false", json);
        Assert.Contains("\"added\":true", json);
        Assert.Contains("Upgrade añadido", json);
    }

    [Fact]
    public void Add_on_picker_emits_prices_as_numbers_and_included_labels()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"AddOnPicker\"", json);
        Assert.Contains("\"price\":343", json);
        Assert.Contains("\"includedLabel\":\"Incluido Platinum\"", json);
        Assert.Contains("\"added\":true", json);
    }

    [Fact]
    public void Ledger_emits_lines_with_amounts_and_total()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"Ledger\"", json);
        Assert.Contains("\"concept\":\"Alojamiento x7 noches\"", json);
        Assert.Contains("\"amount\":-154", json);
        Assert.Contains("\"total\":1710.5", json);
    }

    [Fact]
    public void Payment_picker_emits_methods_context_and_confirm()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"PaymentPicker\"", json);
        Assert.Contains("\"selected\":\"card\"", json);
        Assert.Contains("\"contextLabel\":\"PREAUTORIZADO\"", json);
        Assert.Contains("\"confirmLabel\":\"Confirmar — € 1.710,50\"", json);
    }

    [Fact]
    public void Process_monitor_emits_items_with_counters()
    {
        var json = RenderView(typeof(Dash));

        Assert.Contains("\"type\":\"ProcessMonitor\"", json);
        Assert.Contains("\"name\":\"Facturación a Crédito\"", json);
        Assert.Contains("\"ok\":847", json);
        Assert.Contains("\"warnings\":6", json);
        Assert.Contains("\"actionId\":\"fixCredit\"", json);
    }

    [Fact]
    public void Metric_card_action_is_dispatched_by_method_name()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "openRevenue",
            ServerSideType = typeof(Dash).FullName,
        });
        Assert.Equal("drill-in", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Foldout_emits_panel_headers_and_slotted_children()
    {
        var json = RenderView(typeof(Fold));

        Assert.Contains("\"type\":\"FoldoutLayout\"", json);

        // Panel headers ride in the metadata.
        Assert.Contains("\"panels\":[{", json);
        Assert.Contains("\"title\":\"Guests\"", json);
        Assert.Contains("\"icon\":\"people\"", json);
        Assert.Contains("\"open\":true", json);
        Assert.Contains("\"title\":\"Payments\"", json);
        Assert.Contains("\"subtitle\":\"Money\"", json);
        Assert.Contains("\"open\":false", json);

        // The overview and each panel's content travel as slotted children.
        Assert.Contains("\"slot\":\"overview\"", json);
        Assert.Contains("\"slot\":\"panel-0\"", json);
        Assert.Contains("\"slot\":\"panel-1\"", json);
        Assert.Contains("the record overview", json);
        Assert.Contains("guest list", json);
        Assert.Contains("payment info", json);

        // Header band: title from [Title], chips flattened to text.
        Assert.Contains("\"headerTitle\":\"Fold\"", json);
        Assert.Contains("\"badges\":[\"Confirmed\",\"12-19 Aug\"]", json);
    }

    [Fact]
    public void Welcome_emits_hero_with_ctas_and_highlight_grid()
    {
        var json = RenderView(typeof(WelcomePage));

        Assert.Contains("\"type\":\"HeroSection\"", json);
        Assert.Contains("\"title\":\"Hello there\"", json);
        Assert.Contains("\"subtitle\":\"Start here\"", json);
        Assert.Contains("\"image\":\"https://img/hero.jpg\"", json);
        Assert.Contains("\"centered\":true", json);

        // The CTA button rides inside the hero; its action is advertised and dispatchable.
        Assert.Contains("\"label\":\"Get started\"", json);
        Assert.Contains("\"actionId\":\"go\"", json);

        // Highlight tiles on a DashboardLayout below.
        Assert.Contains("\"type\":\"DashboardLayout\"", json);
        Assert.Contains("\"title\":\"Feature A\"", json);

        var inc = Handler().Handle(new RunActionRqDto { ActionId = "go", ServerSideType = typeof(WelcomePage).FullName });
        Assert.Equal("gone", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Item_overview_emits_sticky_key_info_card_and_tabs()
    {
        var json = RenderView(typeof(Item));

        Assert.Contains("\"type\":\"HorizontalLayout\"", json);
        Assert.Contains("\"type\":\"Card\"", json);
        Assert.Contains("position: sticky", json);
        Assert.Contains("\"type\":\"TabLayout\"", json);
        Assert.Contains("\"label\":\"Details\"", json);
        Assert.Contains("\"label\":\"History\"", json);
        Assert.Contains("the key info", json);
    }

    [Fact]
    public void Fluent_components_map_to_the_exact_java_wire_shape()
    {
        // Byte-shape check of a hand-built tree against the Java reference JSON.
        var dto = ComponentMapper.Map(new Scoreboard
        {
            Id = "board",
            Metrics =
            [
                new MetricCard { Title = "Occupancy", Value = "87", Unit = "%", Trend = MetricTrend.Up },
            ],
        });
        var json = JsonSerializer.Serialize<ComponentDto>(dto, new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        });

        Assert.Equal(
            "{\"type\":\"ClientSide\",\"metadata\":{\"type\":\"Scoreboard\"},\"id\":\"board\",\"children\":[" +
            "{\"type\":\"ClientSide\",\"metadata\":{\"type\":\"MetricCard\",\"title\":\"Occupancy\",\"value\":\"87\"," +
            "\"unit\":\"%\",\"trend\":\"up\",\"trendLabel\":null,\"icon\":null,\"description\":null,\"actionId\":null}," +
            "\"id\":null,\"children\":[],\"style\":null,\"cssClasses\":null,\"slot\":null}]," +
            "\"style\":null,\"cssClasses\":null,\"slot\":null}",
            json);
    }

    [Fact]
    public void Anchor_emits_text_url_and_target()
    {
        var dto = ComponentMapper.Map(new Anchor("Open the docs", "https://mateu.io/docs") { Target = "_blank" });
        var json = JsonSerializer.Serialize<ComponentDto>(dto, Json);

        Assert.Contains("\"type\":\"Anchor\"", json);
        Assert.Contains("\"text\":\"Open the docs\"", json);
        Assert.Contains("\"url\":\"https://mateu.io/docs\"", json);
        Assert.Contains("\"target\":\"_blank\"", json);
    }
}
