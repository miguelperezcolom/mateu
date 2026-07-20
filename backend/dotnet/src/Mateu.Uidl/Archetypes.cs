using System.Reflection;
using System.Text;

namespace Mateu.Uidl;

// ── Declarative page archetypes (C# analogues of the Java core orchestrators) ─────
// Declare public component-holding properties on a subclass and Mateu composes the page for you.
// [Panel] carries title/subtitle/colSpan/rowSpan/icon/open, exactly like Java's @Panel.

/// <summary>Declarative dashboard landing page. Consecutive <see cref="MetricCard"/> properties are
/// grouped into a <see cref="Scoreboard"/> band; [Panel] component properties become titled
/// <see cref="DashboardPanel"/> tiles; other component properties land on the grid as-is.
/// Override <see cref="Columns"/> to fix the column count (0 = responsive auto-fit).</summary>
public abstract class Dashboard : IComponentTreeSupplier
{
    /// <summary>Number of grid columns; 0 (default) means responsive auto-fit.</summary>
    protected virtual int Columns => 0;

    public IComponent Component()
    {
        var items = new List<IComponent>();
        var pendingMetrics = new List<MetricCard>();
        foreach (var p in Archetypes.ComponentProperties(GetType()))
        {
            var value = p.GetValue(this);
            if (value is MetricCard metricCard)
            {
                pendingMetrics.Add(metricCard);
                continue;
            }
            Archetypes.FlushMetrics(pendingMetrics, items);
            if (value is not IComponent component) continue;
            items.Add(p.GetCustomAttribute<PanelAttribute>() is { } panel
                ? Archetypes.Tile(panel, p, component)
                : component);
        }
        Archetypes.FlushMetrics(pendingMetrics, items);
        return new DashboardLayout { Id = Archetypes.IdOf(this), Columns = Columns, Items = items };
    }
}

/// <summary>Declarative Redwood-style foldout page: the first component property without [Panel] is
/// the always-visible overview (left); [Panel] component properties become lateral fold-out panels
/// (Open controls the initial state).</summary>
public abstract class Foldout : IComponentTreeSupplier, IPageWidthSupplier
{
    /// <summary>Foldouts are full-bleed canvases: edge-to-edge by default — annotate the concrete
    /// view with [PageWidth] to change it. (Java parity: Foldout.pageWidth.)</summary>
    public virtual PageWidthStyle? PageWidth() => PageWidthStyle.EdgeToEdge;

    /// <summary>Big heading of the header band above the columns (RDS "overview title"). Defaults to
    /// the class [Title]; override to compute it. Return null/blank to hide the header band.</summary>
    protected virtual string? HeaderTitle =>
        GetType().GetCustomAttribute<TitleAttribute>()?.Value is { Length: > 0 } t ? t : null;

    /// <summary>Label/Value chips shown under the header title. Empty by default.</summary>
    protected virtual IReadOnlyList<string> HeaderBadges => [];

    /// <summary>Overview orientation: "vertical" (overview on the left, default) or "horizontal"
    /// (overview across the top, panels in a row below).</summary>
    protected virtual string Orientation => "vertical";

    /// <summary>Navigation Header (prev/next + go-to-parent). Null (default) hides the bar; each
    /// non-blank *ActionId names a method Mateu runs when the control is clicked.</summary>
    protected virtual FoldoutNavigation? NavigationHeader => null;

    /// <summary>ActionId run by the overview's Edit affordance (RDS edit flow). Null (default) hides
    /// the Edit button; the method typically returns a Dialog (vertical) or navigates (horizontal).</summary>
    protected virtual string? OverviewEditActionId => null;

    public IComponent Component()
    {
        IComponent? overview = null;
        var panels = new List<FoldoutPanel>();
        foreach (var p in Archetypes.ComponentProperties(GetType()))
        {
            if (p.GetValue(this) is not IComponent component) continue;
            if (p.GetCustomAttribute<PanelAttribute>() is not { } panel)
            {
                overview ??= component;
                continue;
            }
            panels.Add(new FoldoutPanel
            {
                Id = Archetypes.CamelCase(p.Name),
                Title = Archetypes.TitleOf(panel, p),
                Subtitle = panel.Subtitle is "" ? null : panel.Subtitle,
                Icon = panel.Icon is "" ? null : panel.Icon,
                Open = panel.Open,
                Content = component,
            });
        }
        return new FoldoutLayout
        {
            Id = Archetypes.IdOf(this), Overview = overview, Panels = panels,
            HeaderTitle = HeaderTitle, Badges = HeaderBadges, Orientation = Orientation,
            Navigation = NavigationHeader, OverviewEditActionId = OverviewEditActionId,
        };
    }
}

/// <summary>Welcome page: a centered hero (title, subtitle, optional background image) with
/// call-to-action <see cref="Button"/> properties inside it, plus a grid of highlight tiles below
/// ([Panel] component properties). Override the Hero* members for the hero chrome.</summary>
public abstract class Welcome : IComponentTreeSupplier
{
    protected virtual string? HeroTitle => null;
    protected virtual string? HeroSubtitle => null;
    /// <summary>Optional background image URL for the hero.</summary>
    protected virtual string? HeroImage => null;

    public IComponent Component()
    {
        var ctas = new List<IComponent>();
        var tiles = new List<IComponent>();
        foreach (var p in Archetypes.ComponentProperties(GetType()))
        {
            var value = p.GetValue(this);
            if (value is Button button)
            {
                ctas.Add(button);
                continue;
            }
            if (value is not IComponent component) continue;
            tiles.Add(p.GetCustomAttribute<PanelAttribute>() is { } panel
                ? Archetypes.Tile(panel, p, component)
                : component);
        }
        var content = new List<IComponent>
        {
            new HeroSection
            {
                Id = "hero", Title = HeroTitle, Subtitle = HeroSubtitle, Image = HeroImage,
                Centered = true, Content = ctas,
            },
        };
        if (tiles.Count > 0) content.Add(new DashboardLayout { Id = "highlights", Items = tiles });
        return new VerticalLayout { Id = Archetypes.IdOf(this), Spacing = true, Content = content };
    }
}

/// <summary>Item overview page: the first component property without [Panel] is the key-info panel
/// (left, sticky); [Panel] component properties become tabs on the right. Override
/// <see cref="PanelWidth"/> to change the key-info panel width.</summary>
public abstract class ItemOverview : IComponentTreeSupplier
{
    /// <summary>CSS width of the left key-info panel.</summary>
    protected virtual string PanelWidth => "22rem";

    public IComponent Component()
    {
        IComponent? keyInfo = null;
        var tabs = new List<TabPanel>();
        foreach (var p in Archetypes.ComponentProperties(GetType()))
        {
            if (p.GetValue(this) is not IComponent component) continue;
            if (p.GetCustomAttribute<PanelAttribute>() is not { } panel)
            {
                keyInfo ??= component;
                continue;
            }
            tabs.Add(new TabPanel(Archetypes.TitleOf(panel, p), component));
        }
        var content = new List<IComponent>();
        if (keyInfo is not null)
            content.Add(new Card
            {
                Id = "key-info", Content = keyInfo,
                Style = $"flex: 0 0 {PanelWidth}; align-self: flex-start; position: sticky; top: 1rem;",
            });
        content.Add(new TabLayout { Id = "item-tabs", Tabs = tabs, Style = "flex: 1; min-width: 0;" });
        return new HorizontalLayout { Id = Archetypes.IdOf(this), Spacing = true, Content = content };
    }
}

internal static class Archetypes
{
    /// <summary>The declared public readable properties of the concrete archetype class, in
    /// declaration order (the C# analogue of Java's getDeclaredFields()).</summary>
    internal static IEnumerable<PropertyInfo> ComponentProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(p => p.CanRead && p.GetIndexParameters().Length == 0)
            .OrderBy(p => p.MetadataToken);

    internal static void FlushMetrics(List<MetricCard> pendingMetrics, List<IComponent> items)
    {
        if (pendingMetrics.Count == 0) return;
        items.Add(new Scoreboard { Metrics = pendingMetrics.ToList() });
        pendingMetrics.Clear();
    }

    internal static DashboardPanel Tile(PanelAttribute panel, PropertyInfo p, IComponent component) =>
        new()
        {
            Id = CamelCase(p.Name),
            Title = TitleOf(panel, p),
            Subtitle = panel.Subtitle is "" ? null : panel.Subtitle,
            ColSpan = panel.ColSpan,
            RowSpan = panel.RowSpan,
            Content = component,
        };

    internal static string TitleOf(PanelAttribute panel, PropertyInfo p) =>
        panel.Title is not "" ? panel.Title
            : p.GetCustomAttribute<LabelAttribute>()?.Value ?? Humanize(p.Name);

    internal static string IdOf(object instance) => CamelCase(instance.GetType().Name);

    internal static string CamelCase(string s) =>
        string.IsNullOrEmpty(s) ? s : char.ToLowerInvariant(s[0]) + s[1..];

    /// <summary>"FirstName" → "First name".</summary>
    internal static string Humanize(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        var sb = new StringBuilder();
        for (var i = 0; i < s.Length; i++)
        {
            var c = s[i];
            if (i > 0 && char.IsUpper(c) && !char.IsUpper(s[i - 1])) sb.Append(' ');
            sb.Append(i == 0 ? char.ToUpperInvariant(c) : char.ToLowerInvariant(c));
        }
        return sb.ToString();
    }
}

/// <summary>A tree-supplier view whose state changes should re-render it in place: the framework
/// emits an AutoSave trigger firing <see cref="RefreshActionId"/> (debounced) whenever a field
/// value changes, and seeds the view's scalar properties into the component's initialData so they
/// round-trip through componentState.</summary>
public interface IRefreshOnChange
{
    string RefreshActionId { get; }
    int RefreshDebounceMillis { get; }
}

/// <summary>Collection-detail page (the Redwood "Collection Detail" template, the C# analogue of
/// Java's CollectionDetail archetype): a searchable list of items on the left — clickable cards
/// with title, caption and badges — and the selected item's detail on the right, re-rendered in
/// place on every selection. Implement <see cref="Rows"/>, <see cref="IdOf"/>,
/// <see cref="TitleOf"/> and <see cref="Detail"/>.</summary>
public abstract class CollectionDetail<TRow> : IComponentTreeSupplier, IRefreshOnChange
{
    /// <summary>The search box value (bound from componentState).</summary>
    public string? Search { get; set; }

    /// <summary>The selected row's id (bound from componentState; set by the row click).</summary>
    public string? SelectedId { get; set; }

    public string RefreshActionId => "filterCollection";
    public int RefreshDebounceMillis => 400;

    /// <summary>The (already filtered) rows to list, in display order.</summary>
    protected abstract IEnumerable<TRow> Rows(string? search);

    /// <summary>Stable id of a row (used to track the selection).</summary>
    protected abstract string? IdOf(TRow row);

    /// <summary>Main line of the row's list card.</summary>
    protected abstract string TitleOf(TRow row);

    /// <summary>The detail pane for the selected row.</summary>
    protected abstract IComponent Detail(TRow row);

    /// <summary>Secondary line of the row's list card. Null for none.</summary>
    protected virtual string? CaptionOf(TRow row) => null;

    /// <summary>Badges of the row's list card.</summary>
    protected virtual IReadOnlyList<Chip> BadgesOf(TRow row) => [];

    /// <summary>Label over the list. Default: a results counter.</summary>
    protected virtual string ListLabel(int count) => $"{count} items";

    /// <summary>CSS flex-basis of the list column.</summary>
    protected virtual string ListWidth => "24rem";

    /// <summary>What the right pane shows before any selection.</summary>
    protected virtual IComponent EmptyDetail() => new EmptyState
    {
        Icon = "👈", Title = "Select an item",
        Description = "Pick an item from the list to see its detail.",
        Style = "flex: 1; margin-top: 3rem;",
    };

    public IComponent Component()
    {
        var items = new List<QueueItem>();
        TRow? selected = default;
        var found = false;
        foreach (var row in Rows(Search))
        {
            var id = IdOf(row);
            var isSelected = id is not null && id == SelectedId;
            if (isSelected) { selected = row; found = true; }
            items.Add(new QueueItem
            {
                Id = id, Title = TitleOf(row), Caption = CaptionOf(row),
                Badges = BadgesOf(row), Selected = isSelected,
            });
        }
        var list = new TaskQueue
        {
            ActionId = "selectCollectionItem",
            Style = $"flex: 0 0 {ListWidth}; min-width: min({ListWidth}, 100%);",
            Groups = [new QueueGroup { Label = ListLabel(items.Count), Items = items }],
        };
        var detail = found ? Detail(selected!) : EmptyDetail();
        return new VerticalLayout
        {
            Id = Archetypes.IdOf(this), Spacing = true,
            Content =
            [
                new FormField { FieldId = "search", Label = "Search" },
                new HorizontalLayout
                {
                    Style = "align-items: flex-start; gap: 1.5rem; width: 100%;",
                    Content = [list, detail],
                },
            ],
        };
    }
}

/// <summary>The non-generic face of <see cref="TodoList{TRow}"/>: lets the sync handler run a
/// row click without knowing the row type (the analogue of Java dispatching the archetype's
/// @Action openTodoItem by reflection).</summary>
public interface ITodoList
{
    /// <summary>Finds the row behind a clicked item id and returns its ActionOn result; null
    /// means "unknown row / nothing to do" (the handler then re-renders the list, like Java
    /// returning `this`).</summary>
    object? OpenTodoItem(string? id);
}

/// <summary>To-do list page (the Redwood "To-do list" template, the C# analogue of Java's
/// TodoList archetype): the user's pending work as a <see cref="TaskQueue"/> of grouped,
/// clickable cards — buckets such as <i>Today / This week / Later</i> or per status, each
/// labelled with its counter — where clicking an item <b>acts on it</b> (typically navigating
/// to the task) instead of selecting it for a side detail pane. Implement <see cref="Rows"/>,
/// <see cref="IdOf"/>, <see cref="TitleOf"/>, <see cref="GroupOf"/> and <see cref="ActionOn"/>.</summary>
public abstract class TodoList<TRow> : IComponentTreeSupplier, ITodoList
{
    /// <summary>The last clicked row's id (bound from componentState; set by the row click).</summary>
    public string? SelectedId { get; set; }

    /// <summary>The pending rows to list, in display order within each bucket.</summary>
    protected abstract IEnumerable<TRow> Rows();

    /// <summary>Stable id of a row (used to find it back on click).</summary>
    protected abstract string? IdOf(TRow row);

    /// <summary>Main line of the row's card.</summary>
    protected abstract string TitleOf(TRow row);

    /// <summary>Bucket key of a row (e.g. "Today"); buckets render in first-appearance order
    /// unless <see cref="GroupOrder"/> says otherwise.</summary>
    protected abstract string GroupOf(TRow row);

    /// <summary>What clicking the row's card does — typically a route string to navigate to the
    /// task, or any other Mateu action result (a Message, a Drawer/Dialog, ...).</summary>
    protected abstract object? ActionOn(TRow row);

    /// <summary>Secondary line of the row's card. Null for none.</summary>
    protected virtual string? CaptionOf(TRow row) => null;

    /// <summary>Badges of the row's card (due date, priority, ...).</summary>
    protected virtual IReadOnlyList<Chip> BadgesOf(TRow row) => [];

    /// <summary>Label of a bucket. Default: "name (count)".</summary>
    protected virtual string GroupLabel(string group, int count) => $"{group} ({count})";

    /// <summary>Explicit bucket order (buckets not listed go last, in first-appearance order).
    /// Default: first appearance.</summary>
    protected virtual IReadOnlyList<string> GroupOrder() => [];

    /// <summary>What the page shows when there is nothing pending.</summary>
    protected virtual IComponent EmptyState() => new EmptyState
    {
        Icon = "🎉", Title = "All caught up!",
        Description = "There is nothing pending on your plate.",
    };

    public object? OpenTodoItem(string? id)
    {
        SelectedId = id;
        foreach (var row in Rows())
            if (IdOf(row) == id)
                return ActionOn(row);
        return null;
    }

    public IComponent Component()
    {
        var buckets = new List<(string Key, List<QueueItem> Items)>();
        foreach (var row in Rows())
        {
            var id = IdOf(row);
            var key = GroupOf(row);
            var index = buckets.FindIndex(b => b.Key == key);
            if (index < 0)
            {
                buckets.Add((key, []));
                index = buckets.Count - 1;
            }
            buckets[index].Items.Add(new QueueItem
            {
                Id = id, Title = TitleOf(row), Caption = CaptionOf(row),
                Badges = BadgesOf(row), Selected = id is not null && id == SelectedId,
            });
        }
        if (buckets.Count == 0) return EmptyState();
        var order = GroupOrder();
        // OrderBy is stable: buckets not listed keep their first-appearance order, last.
        var ordered = order.Count == 0 ? buckets : buckets.OrderBy(b => Rank(b.Key)).ToList();
        return new TaskQueue
        {
            ActionId = "openTodoItem",
            Groups = ordered.Select(b => new QueueGroup
            {
                Label = GroupLabel(b.Key, b.Items.Count), Items = b.Items,
            }).ToList(),
        };

        int Rank(string key)
        {
            for (var i = 0; i < order.Count; i++)
                if (order[i] == key) return i;
            return order.Count;
        }
    }
}

/// <summary>Record overview page (the Redwood "General Overview" template, the C# analogue of
/// Java's GeneralOverview archetype): a record context switcher at the top jumps between records
/// without leaving the page; the selected record renders below — typically an EntityHeader over
/// property cards. Implement <see cref="SwitcherOptions"/>, <see cref="Load"/> and
/// <see cref="Overview"/>.</summary>
public abstract class GeneralOverview<TRow> : IComponentTreeSupplier, IRefreshOnChange
{
    /// <summary>The switcher value (bound from componentState); empty selects the first option.</summary>
    public string? Record { get; set; }

    public string RefreshActionId => "switchRecord";
    public int RefreshDebounceMillis => 0;

    /// <summary>The context switcher's entries (value = record id, label = what the user reads).</summary>
    protected abstract IReadOnlyList<Option> SwitcherOptions();

    /// <summary>Loads the record behind a switcher value. Null hides the overview.</summary>
    protected abstract TRow? Load(string id);

    /// <summary>The record's overview — typically an EntityHeader with the title/badges/facts strip
    /// over property cards.</summary>
    protected abstract IComponent Overview(TRow row);

    /// <summary>What to show when no record is selected/found.</summary>
    protected virtual IComponent EmptyOverview() => new EmptyState
    {
        Icon = "🗂", Title = "Select a record", Description = "Pick a record in the switcher above.",
    };

    public IComponent Component()
    {
        var options = SwitcherOptions();
        if (string.IsNullOrEmpty(Record) && options.Count > 0) Record = options[0].Value;
        var row = string.IsNullOrEmpty(Record) ? default : Load(Record!);
        return new VerticalLayout
        {
            Id = Archetypes.IdOf(this), Spacing = true,
            Content =
            [
                new FormField { FieldId = "record", Label = "", Options = options },
                row is null ? EmptyOverview() : Overview(row),
            ],
        };
    }
}

/// <summary>The non-generic face of <see cref="CalendarPage"/>: lets the sync handler run the
/// archetype's built-in actions (month navigation, event click, create) without reflection
/// (the analogue of Java dispatching the archetype's @Action methods by name).</summary>
public interface ICalendarPage
{
    /// <summary>Finds the event behind a clicked event id and returns its ActionOn result; null
    /// means "unknown event / nothing to do" (the handler then re-renders the page, like Java
    /// returning `this`).</summary>
    object? OpenCalendarEvent(string? id);

    /// <summary>Moves the displayed month one month back.</summary>
    void PreviousMonth();

    /// <summary>Moves the displayed month one month forward.</summary>
    void NextMonth();

    /// <summary>Moves the displayed month back to the current one.</summary>
    void GoToday();

    /// <summary>Runs the "+ Create" action; null means "nothing to do" (re-render).</summary>
    object? CreateCalendarEvent();
}

/// <summary>Calendar page (the Redwood "Calendar" template, the C# analogue of Java's CalendarPage
/// archetype): a full month-grid <see cref="Calendar"/> under the page's calendar toolbar —
/// previous/next month chevrons, a <i>Today</i> button and an optional primary <i>+ Create</i>
/// button — where clicking an event <b>acts on it</b> (typically navigating to its detail). Month
/// navigation re-runs <see cref="Events"/> with the newly displayed month, so events can be fetched
/// per month from the backend. Implement <see cref="Events"/> and <see cref="ActionOn"/>;
/// <see cref="InitialMonth"/> defaults to the current month, <see cref="ShowCreate"/> and
/// <see cref="CreateAction"/> enable the create flow.</summary>
public abstract class CalendarPage : IComponentTreeSupplier, ICalendarPage
{
    /// <summary>The displayed month (any day of it, ISO-8601; bound from componentState).</summary>
    public string? Month { get; set; }

    /// <summary>The last clicked event's id (bound from componentState; set by the event click).</summary>
    public string? EventId { get; set; }

    /// <summary>The events of the displayed month (any day of it, for the grid to place them).</summary>
    protected abstract IReadOnlyList<CalendarEvent> Events(DateOnly month);

    /// <summary>What clicking an event does — typically a route string to navigate to its detail,
    /// or any other Mateu action result (a Message, a Drawer/Dialog, ...).</summary>
    protected abstract object? ActionOn(CalendarEvent ev);

    /// <summary>The initially displayed month. Default: the current month.</summary>
    protected virtual DateOnly InitialMonth() => DateOnly.FromDateTime(DateTime.Today);

    /// <summary>Whether the primary "+ Create" button shows in the toolbar. Default: false.</summary>
    protected virtual bool ShowCreate => false;

    /// <summary>What the "+ Create" button does (required when <see cref="ShowCreate"/> is true).</summary>
    protected virtual object? CreateAction() => null;

    private DateOnly CurrentMonth() =>
        Month is not null && DateOnly.TryParse(Month, out var parsed) ? parsed : InitialMonth();

    public object? OpenCalendarEvent(string? id)
    {
        EventId = id;
        foreach (var ev in Events(CurrentMonth()))
            if (ev.Id == id)
                return ActionOn(ev);
        return null;
    }

    public void PreviousMonth() => Month = Iso(CurrentMonth().AddMonths(-1));

    public void NextMonth() => Month = Iso(CurrentMonth().AddMonths(1));

    public void GoToday() => Month = Iso(DateOnly.FromDateTime(DateTime.Today));

    public object? CreateCalendarEvent() => CreateAction();

    public IComponent Component()
    {
        var month = CurrentMonth();
        // Every event chip dispatches the same uniform actionId; the clicked event travels in the
        // action's parameters (_clickedEvent) and the archetype finds it back by id (Java parity).
        var events = Events(month)
            .Select(ev => ev with { ActionId = "openCalendarEvent" })
            .ToList();
        var buttons = new List<IComponent>
        {
            new Button("‹", "previousCalendarMonth"),
            new Button("Today", "goCalendarToday"),
            new Button("›", "nextCalendarMonth"),
        };
        if (ShowCreate) buttons.Add(new Button("+ Create", "createCalendarEvent") { Primary = true });
        return new VerticalLayout
        {
            Id = Archetypes.IdOf(this), Spacing = true,
            Content =
            [
                new HorizontalLayout
                {
                    Spacing = true, Style = "align-items: center;", Content = buttons,
                },
                new Calendar { Month = month, Events = events },
            ],
        };
    }

    private static string Iso(DateOnly d) => d.ToString("yyyy-MM-dd");
}

/// <summary>Implemented by a Gantt page so the SyncHandler can route a bar click to the archetype.</summary>
public interface IGanttPage
{
    /// <summary>The task bars of the canvas (used to resolve a clicked task id).</summary>
    IReadOnlyList<GanttTask> GanttTasks();

    /// <summary>Resolves the clicked task id and returns its detail overlay (a Drawer), or null.</summary>
    object? SelectGanttTask(string? taskId);
}

/// <summary>Gantt page (the Oracle Redwood "Gantt page" template): a full-bleed scheduling canvas
/// laid out edge-to-edge — a <see cref="Gantt"/> tape chart of <see cref="Tasks"/> — with an
/// optional <see cref="Detail"/> panel docked below it and a heading from [Title]. Clicking a bar
/// opens the task in a side <see cref="Drawer"/>. (Java parity: GanttPage.)</summary>
public abstract class GanttPage : IComponentTreeSupplier, IPageWidthSupplier, IGanttPage
{
    public virtual PageWidthStyle? PageWidth() => PageWidthStyle.EdgeToEdge;

    /// <summary>The bars of the scheduling canvas — one GanttTask per row.</summary>
    protected abstract IReadOnlyList<GanttTask> Tasks();

    /// <summary>Optional detail panel docked below the canvas (the Redwood bottom panel); null = none.</summary>
    protected virtual IComponent? Detail() => null;

    /// <summary>The page heading above the canvas; defaults to the class [Title], null/blank hides it.</summary>
    protected virtual string? Heading =>
        GetType().GetCustomAttribute<TitleAttribute>()?.Value is { Length: > 0 } t ? t : null;

    public IComponent Component()
    {
        var content = new List<IComponent>();
        if (Heading is { Length: > 0 } h)
            content.Add(new Text(h) { Id = "gantt-page-title", Size = "xl", NoMargins = true, Style = "font-weight: 600;" });
        content.Add(new Gantt { Id = "gantt", Tasks = Tasks(), OnTaskSelectionActionId = "selectGanttTask" });
        if (Detail() is { } d) content.Add(new Card { Id = "gantt-detail", Content = d });
        return new VerticalLayout { Id = "gantt-page", Spacing = true, Content = content };
    }

    public IReadOnlyList<GanttTask> GanttTasks() => Tasks();

    public object? SelectGanttTask(string? taskId)
    {
        var task = Tasks().FirstOrDefault(t => t.Id == taskId);
        return task is null ? null : TaskDrawer(task);
    }

    /// <summary>The drawer opened when a bar is clicked — a side General Drawer with the task title
    /// and Detail. Override to customise (size, position, peer navigation…).</summary>
    protected virtual Drawer TaskDrawer(GanttTask task) =>
        new() { Id = "gantt-task-drawer", HeaderTitle = task.Title, Size = DrawerSize.M, Content = TaskDetail(task) };

    /// <summary>Content shown for a clicked task inside TaskDrawer. Defaults to dates + progress.</summary>
    protected virtual IComponent TaskDetail(GanttTask task) =>
        new Text($"{task.Start:yyyy-MM-dd} → {task.End:yyyy-MM-dd} · {Math.Round(task.Progress)}% completado");
}
