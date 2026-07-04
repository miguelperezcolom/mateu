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
        return new FoldoutLayout { Id = Archetypes.IdOf(this), Overview = overview, Panels = panels };
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
