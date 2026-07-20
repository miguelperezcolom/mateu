using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("hotel-directory"), Title("Hotels")]
public class HotelDirectory : CollectionDetail<HotelDirectory.Hotel>
{
    public record Hotel(string Id, string Name, string City, int Rooms);

    public static readonly List<Hotel> Hotels =
    [
        new("h1", "Riu Palace", "Palma", 350),
        new("h2", "Riu Plaza", "Madrid", 500),
        new("h3", "Riu Playa", "Cancún", 420),
    ];

    protected override IEnumerable<Hotel> Rows(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Hotels
            : Hotels.Where(h => (h.Name + " " + h.City).Contains(search, StringComparison.OrdinalIgnoreCase));

    protected override string? IdOf(Hotel row) => row.Id;

    protected override string TitleOf(Hotel row) => row.Name;

    protected override string? CaptionOf(Hotel row) => row.City;

    protected override IComponent Detail(Hotel row) =>
        new EntityHeader { Title = row.Name, Subtitle = row.City };
}

[UI("gantt-project-plan"), Title("Project plan")]
public class GanttProjectPlan : GanttPage
{
    protected override IReadOnlyList<GanttTask> Tasks() =>
    [
        new() { Id = "t1", Title = "Design", Start = new DateOnly(2026, 1, 1), End = new DateOnly(2026, 1, 10), Progress = 100 },
        new() { Id = "t2", Title = "Build", Start = new DateOnly(2026, 1, 11), End = new DateOnly(2026, 2, 1), Progress = 40 },
    ];

    protected override IComponent Detail() => new Text("detail panel");
}

[UI("requisition-overview"), Title("Requisitions")]
public class RequisitionOverview : GeneralOverview<RequisitionOverview.Requisition>
{
    public record Requisition(string Id, string Title, string Unit);

    public static readonly List<Requisition> All =
    [
        new("r1", "Requisition 204", "Vision Operations"),
        new("r2", "Requisition 205", "Vision Services"),
    ];

    protected override IReadOnlyList<Option> SwitcherOptions() =>
        All.Select(r => new Option(r.Id, r.Title)).ToList();

    protected override Requisition? Load(string id) => All.FirstOrDefault(r => r.Id == id);

    protected override IComponent Overview(Requisition row) =>
        new EntityHeader { Title = row.Title, Facts = [new Fact { Label = "Business Unit", Value = row.Unit }] };
}

[UI("my-tasks"), Title("My tasks")]
public class MyTasks : TodoList<MyTasks.Todo>
{
    public record Todo(string Id, string Title, string Bucket, string? Due = null, string? Priority = null);

    public static readonly List<Todo> Todos =
    [
        new("t1", "Book the venue", "Today"),
        new("t2", "Send the invites", "Today", "2026-07-20", "High"),
        new("t3", "Order the catering", "This week"),
    ];

    protected override IEnumerable<Todo> Rows() => Todos;

    protected override string? IdOf(Todo row) => row.Id;

    protected override string TitleOf(Todo row) => row.Title;

    protected override string GroupOf(Todo row) => row.Bucket;

    protected override object? ActionOn(Todo row) => $"/todos/{row.Id}";

    protected override string? CaptionOf(Todo row) => row.Due is null ? null : $"Due {row.Due}";

    protected override IReadOnlyList<Chip> BadgesOf(Todo row) =>
        row.Priority is null ? [] : [new Chip { Label = row.Priority, Color = "error" }];
}

/// <summary>The same list, but with an explicit bucket order.</summary>
[UI("ordered-tasks"), Title("Ordered tasks")]
public class OrderedTasks : MyTasks
{
    protected override IReadOnlyList<string> GroupOrder() => ["This week", "Today"];
}

/// <summary>Nothing pending: the all-caught-up state renders instead of the queue.</summary>
[UI("caught-up-tasks"), Title("Caught up")]
public class CaughtUpTasks : MyTasks
{
    protected override IEnumerable<Todo> Rows() => [];
}

/// <summary>Three events over two months, with a fixed initial month (for determinism) and the
/// create flow enabled.</summary>
[UI("team-calendar"), Title("Team calendar")]
public class TeamCalendar : CalendarPage
{
    public static readonly List<CalendarEvent> All =
    [
        new() { Id = "e1", Title = "Sprint planning", Date = new DateOnly(2026, 7, 6), Color = "blue" },
        new() { Id = "e2", Title = "Release day", Date = new DateOnly(2026, 7, 24), Color = "green" },
        new() { Id = "e3", Title = "August retro", Date = new DateOnly(2026, 8, 7), Color = "orange" },
    ];

    protected override IReadOnlyList<CalendarEvent> Events(DateOnly month) =>
        All.Where(e => e.Date is { } d && d.Year == month.Year && d.Month == month.Month).ToList();

    protected override object? ActionOn(CalendarEvent ev) => $"/events/{ev.Id}";

    protected override DateOnly InitialMonth() => new(2026, 7, 1);

    protected override bool ShowCreate => true;

    protected override object? CreateAction() => "/events/new";
}

/// <summary>The CollectionDetail / GeneralOverview archetypes (Redwood "Collection Detail" and
/// "General Overview" templates), built on the fluent FormField primitive — mirroring Java's
/// CollectionDetailSyncTest / GeneralOverviewSyncTest.</summary>
public class ArchetypeTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(HotelDirectory).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    private static UIIncrementDto Run(string route, Type type, string? actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ActionId = actionId, ServerSideType = type.FullName,
            InitiatorComponentId = "ux_main",
            ComponentState = state ?? [], Parameters = parameters ?? [],
        });

    private static JsonElement Val(string json) => JsonDocument.Parse(json).RootElement;

    [Fact]
    public void Collection_detail_renders_the_search_field_the_list_and_the_empty_detail()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), null));
        Assert.Contains("\"type\":\"FormField\"", json);
        Assert.Contains("\"fieldId\":\"search\"", json);
        Assert.Contains("\"type\":\"TaskQueue\"", json);
        Assert.Contains("Riu Palace", json);
        Assert.Contains("3 items", json);
        Assert.Contains("\"type\":\"EmptyState\"", json);
        // the state round-trips and typing re-filters through the AutoSave trigger
        Assert.Contains("\"type\":\"AutoSave\"", json);
        Assert.Contains("\"actionId\":\"filterCollection\"", json);
    }

    [Fact]
    public void Gantt_page_is_edge_to_edge_with_the_canvas_heading_and_detail()
    {
        var json = Render(Run("/gantt-project-plan", typeof(GanttProjectPlan), null));
        Assert.Contains("\"pageType\":\"detail\"", json);
        Assert.Contains("\"type\":\"Gantt\"", json);
        Assert.Contains("\"onTaskSelectionActionId\":\"selectGanttTask\"", json);
        Assert.Contains("Project plan", json);   // the heading
        Assert.Contains("detail panel", json);    // the docked detail
    }

    [Fact]
    public void Clicking_a_gantt_task_opens_it_in_a_drawer()
    {
        var json = Render(Run("/gantt-project-plan", typeof(GanttProjectPlan), "selectGanttTask",
            parameters: new() { ["_clickedTaskId"] = "t2" }));
        Assert.Contains("\"type\":\"Drawer\"", json);
        Assert.Contains("\"headerTitle\":\"Build\"", json);
    }

    [Fact]
    public void Selecting_an_item_renders_its_detail_and_marks_the_card()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), "selectCollectionItem",
            parameters: new Dictionary<string, object?> { ["_item"] = Val("\"h2\"") }));
        Assert.Contains("\"type\":\"EntityHeader\"", json);
        Assert.Contains("Riu Plaza", json);
        Assert.Contains("\"selected\":true", json);
        Assert.DoesNotContain("\"type\":\"EmptyState\"", json);
        // the selection survives the response: it rides in initialData
        Assert.Contains("\"selectedId\":\"h2\"", json);
    }

    [Fact]
    public void Typing_in_the_search_box_filters_the_list()
    {
        var json = Render(Run("/hotel-directory", typeof(HotelDirectory), "filterCollection",
            state: new Dictionary<string, object?> { ["search"] = Val("\"cancún\"") }));
        Assert.Contains("Riu Playa", json);
        Assert.DoesNotContain("Riu Palace", json);
        Assert.Contains("1 items", json);
    }

    [Fact]
    public void General_overview_selects_the_first_record_and_renders_the_switcher()
    {
        var json = Render(Run("/requisition-overview", typeof(RequisitionOverview), null));
        Assert.Contains("\"fieldId\":\"record\"", json);
        Assert.Contains("Requisition 205", json);   // in the switcher options
        Assert.Contains("\"type\":\"EntityHeader\"", json);
        Assert.Contains("Vision Operations", json); // the FIRST record's overview
        Assert.Contains("\"record\":\"r1\"", json); // initialData carries the selection
    }

    [Fact]
    public void Switching_the_record_re_renders_the_overview_in_place()
    {
        var json = Render(Run("/requisition-overview", typeof(RequisitionOverview), "switchRecord",
            state: new Dictionary<string, object?> { ["record"] = Val("\"r2\"") }));
        Assert.Contains("Vision Services", json);
        Assert.DoesNotContain("Vision Operations", json);
        Assert.Empty(Run("/requisition-overview", typeof(RequisitionOverview), "switchRecord",
            state: new Dictionary<string, object?> { ["record"] = Val("\"r2\"") }).Commands
            .Where(c => c.Type == "NavigateTo"));
    }

    // ── TodoList (the Redwood "To-do list" template) ─────────────────────────────

    [Fact]
    public void Todo_list_groups_the_rows_in_buckets_in_first_appearance_order()
    {
        var json = Render(Run("/my-tasks", typeof(MyTasks), null));
        Assert.Contains("\"type\":\"TaskQueue\"", json);
        Assert.Contains("\"actionId\":\"openTodoItem\"", json);
        Assert.Contains("Today (2)", json);
        Assert.Contains("This week (1)", json);
        Assert.True(json.IndexOf("Today (2)", StringComparison.Ordinal)
                    < json.IndexOf("This week (1)", StringComparison.Ordinal));
        Assert.Contains("Book the venue", json);
        Assert.Contains("Due 2026-07-20", json); // the caption
        Assert.Contains("High", json);           // the badge chip
        Assert.DoesNotContain("All caught up!", json);
    }

    [Fact]
    public void An_explicit_group_order_wins_over_first_appearance()
    {
        var json = Render(Run("/ordered-tasks", typeof(OrderedTasks), null));
        Assert.True(json.IndexOf("This week (1)", StringComparison.Ordinal)
                    < json.IndexOf("Today (2)", StringComparison.Ordinal));
    }

    [Fact]
    public void Clicking_an_item_runs_ActionOn_and_navigates_to_its_result()
    {
        var inc = Run("/my-tasks", typeof(MyTasks), "openTodoItem",
            parameters: new Dictionary<string, object?> { ["_item"] = Val("\"t2\"") });
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/todos/t2");
    }

    [Fact]
    public void A_todo_list_without_rows_renders_the_all_caught_up_state()
    {
        var json = Render(Run("/caught-up-tasks", typeof(CaughtUpTasks), null));
        Assert.Contains("\"type\":\"EmptyState\"", json);
        Assert.Contains("All caught up!", json);
        Assert.DoesNotContain("\"type\":\"TaskQueue\"", json);
    }

    // ── CalendarPage (the Redwood "Calendar" template) ───────────────────────

    [Fact]
    public void Calendar_page_renders_the_toolbar_and_the_initial_month_events()
    {
        var json = Render(Run("/team-calendar", typeof(TeamCalendar), null));
        Assert.Contains("\"type\":\"Calendar\"", json);
        Assert.Contains("\"month\":\"2026-07-01\"", json);
        Assert.Contains("Sprint planning", json);
        Assert.Contains("Release day", json);
        Assert.DoesNotContain("August retro", json);
        // the toolbar: ‹ Today › plus the primary "+ Create" button
        Assert.Contains("\"actionId\":\"previousCalendarMonth\"", json);
        Assert.Contains("\"actionId\":\"goCalendarToday\"", json);
        Assert.Contains("\"actionId\":\"nextCalendarMonth\"", json);
        Assert.Contains("\"actionId\":\"createCalendarEvent\"", json);
        Assert.Contains("\"buttonStyle\":\"Primary\"", json);
        // every event chip is re-sealed to the uniform click action
        Assert.Contains("\"actionId\":\"openCalendarEvent\"", json);
    }

    [Fact]
    public void Next_month_re_fetches_and_shows_only_the_new_month_events()
    {
        var json = Render(Run("/team-calendar", typeof(TeamCalendar), "nextCalendarMonth",
            state: new Dictionary<string, object?> { ["month"] = Val("\"2026-07-01\"") }));
        Assert.Contains("\"month\":\"2026-08-01\"", json); // the new month round-trips in initialData
        Assert.Contains("August retro", json);
        Assert.DoesNotContain("Sprint planning", json);
        Assert.DoesNotContain("Release day", json);
    }

    [Fact]
    public void Clicking_an_event_runs_ActionOn_and_navigates_to_its_result()
    {
        var inc = Run("/team-calendar", typeof(TeamCalendar), "openCalendarEvent",
            state: new Dictionary<string, object?> { ["month"] = Val("\"2026-07-01\"") },
            parameters: new Dictionary<string, object?>
            {
                ["_clickedEvent"] =
                    Val("{\"id\":\"e2\",\"title\":\"Release day\",\"date\":\"2026-07-24\",\"color\":\"green\"}"),
            });
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/events/e2");
    }

    [Fact]
    public void Create_runs_CreateAction_and_navigates_to_its_result()
    {
        var inc = Run("/team-calendar", typeof(TeamCalendar), "createCalendarEvent",
            state: new Dictionary<string, object?> { ["month"] = Val("\"2026-07-01\"") });
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/events/new");
    }
}
