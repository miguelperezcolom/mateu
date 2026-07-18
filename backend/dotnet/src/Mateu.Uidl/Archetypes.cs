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
public abstract class Foldout : IComponentTreeSupplier
{
    /// <summary>Big heading of the header band above the columns (RDS "overview title"). Defaults to
    /// the class [Title]; override to compute it. Return null/blank to hide the header band.</summary>
    protected virtual string? HeaderTitle =>
        GetType().GetCustomAttribute<TitleAttribute>()?.Value is { Length: > 0 } t ? t : null;

    /// <summary>Label/Value chips shown under the header title. Empty by default.</summary>
    protected virtual IReadOnlyList<string> HeaderBadges => [];

    /// <summary>Overview orientation: "vertical" (overview on the left, default) or "horizontal"
    /// (overview across the top, panels in a row below).</summary>
    protected virtual string Orientation => "vertical";

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
