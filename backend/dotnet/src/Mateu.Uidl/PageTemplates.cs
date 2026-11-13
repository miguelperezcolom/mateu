namespace Mateu.Uidl;

// ── Page templates (C# analogue of io.mateu.uidl.fluent.FormTemplate + its io.mateu.uidl.data records)
// A Form FILLS a design-system page template (YAML `template:` on a `type: Form`), or is FREE (no
// template, its content as written). A template's fields and slots are the TEMPLATE's: the server
// lays the slots out as ordinary components, each in a container whose id names the slot, so every
// renderer draws the page, and the template's own values travel on the Form's wire metadata
// (`template`) for a renderer that has the template itself (Redwood paints Spectra's).
// Experimental, like Java's ("page templates (3.0 beta)").

/// <summary>A page template a <see cref="Form"/> fills (Java's <c>FormTemplate</c>). The YAML
/// <c>type:</c> of a template IS its record's name.</summary>
public interface IFormTemplate;

/// <summary>An image of a template: a picture (<see cref="Src"/>) or, for an avatar, the
/// <see cref="Initials"/> drawn without one. (Mirrors io.mateu.uidl.data.TemplateImage.)</summary>
public sealed record TemplateImage
{
    public string? Src { get; init; }
    public string? Initials { get; init; }
    /// <summary>What a screen reader reads for the image; null = the page's title (the image is the
    /// record the page is about).</summary>
    public string? Alt { get; init; }
}

/// <summary>Redwood's Item overview page: an overview panel (its <see cref="Avatar"/> or
/// <see cref="Photo"/>, its <see cref="Body"/> and <see cref="Footer"/> slots) beside the main slot —
/// the form's content. The form's title, subtitle, first badge and toolbar are the item's.</summary>
public sealed record ItemOverviewPage : IFormTemplate
{
    public TemplateImage? Avatar { get; init; }
    public TemplateImage? Photo { get; init; }
    public IReadOnlyList<IComponent> Body { get; init; } = [];
    public IReadOnlyList<IComponent> Footer { get; init; } = [];
}

/// <summary>Resolves a template's <c>backgroundColor</c> (Spectra's <c>dark-&lt;tone&gt;</c> or the bare
/// tone) to a <see cref="HeroTone"/>; null when blank or unknown (Java's WelcomePage.toneOrNull).</summary>
public static class TemplateTones
{
    public static HeroTone? ToneOf(string? backgroundColor)
    {
        if (string.IsNullOrWhiteSpace(backgroundColor)) return null;
        var tone = backgroundColor.Trim();
        if (tone.StartsWith("dark-", StringComparison.Ordinal)) tone = tone["dark-".Length..];
        foreach (var t in Enum.GetValues<HeroTone>())
            if (string.Equals(t.ToString(), tone, StringComparison.OrdinalIgnoreCase))
                return t == HeroTone.Auto ? null : t;
        return null;
    }
}

/// <summary>Redwood's Welcome page: the template OWNS the header — the form's title, subtitle,
/// overline and toolbar become a centred banner over the content (the tiles).</summary>
public sealed record WelcomePage : IFormTemplate
{
    /// <summary>Spectra's <c>dark-&lt;tone&gt;</c> or the bare <see cref="HeroTone"/> name.</summary>
    public string? BackgroundColor { get; init; }
}

/// <summary>Redwood's Dashboard landing page: the <see cref="Kpi"/> slot's metrics as one scoreboard
/// band over the panels (the form's content) on the dashboard grid. The header stays the form's.</summary>
public sealed record DashboardLandingPage : IFormTemplate
{
    public IReadOnlyList<IComponent> Kpi { get; init; } = [];
}

/// <summary>Redwood's General overview page: the main slot (the form's content) beside the
/// <see cref="Info"/> panel. The header (title, record switcher, KPIs, toolbar) is the form's.</summary>
public sealed record GeneralOverviewPage : IFormTemplate
{
    public IReadOnlyList<IComponent> Info { get; init; } = [];
}

/// <summary>Redwood's Collection detail page: the collection (<see cref="List"/>) beside the
/// selected item's detail (the form's content) — or <see cref="NoSelection"/> when the page has no
/// content. Selection is the URL.</summary>
public sealed record CollectionDetailPage : IFormTemplate
{
    public IReadOnlyList<IComponent> List { get; init; } = [];
    public IReadOnlyList<IComponent> NoSelection { get; init; } = [];
}

/// <summary>Redwood's Foldout page: one foldout layout — the <see cref="Overview"/> slot as its
/// always-visible overview, the form's <see cref="FoldoutPanel"/>s as its panels.</summary>
public sealed record FoldoutPage : IFormTemplate
{
    public IReadOnlyList<IComponent> Overview { get; init; } = [];
    /// <summary>"vertical" (overview on the left, the default) or "horizontal" (on top).</summary>
    public string? Orientation { get; init; }
}

/// <summary>A multimedia content page: like the welcome page, a banner (the form's header) over the
/// sections (the content). Spectra has no such component; it is composed.</summary>
public sealed record MultimediaContentPage : IFormTemplate
{
    public string? BackgroundColor { get; init; }
}

/// <summary>Redwood's Advanced create and edit page: the main slot (the form's content) and, with a
/// <see cref="Detail"/>, the detail beside it like an aside.</summary>
public sealed record AdvancedCreateEditPage : IFormTemplate
{
    public IReadOnlyList<IComponent> Detail { get; init; } = [];
}

/// <summary>One step of a <see cref="GuidedProcessPage"/>. (Mirrors io.mateu.uidl.data.GuidedProcessStep.)</summary>
public sealed record GuidedProcessStep
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>Redwood's Guided process page: the <see cref="Steps"/>, laid out as one tab strip (one
/// form — moving between steps keeps the state, no round trip).</summary>
public sealed record GuidedProcessPage : IFormTemplate
{
    public IReadOnlyList<GuidedProcessStep> Steps { get; init; } = [];
}

/// <summary>Redwood's Data management page: the title, the toolbar (the form's buttons), the data
/// view (the content) and the docked <see cref="End"/> / <see cref="Bottom"/> panels, shown while
/// open. The template owns the header.</summary>
public sealed record DataManagementPage : IFormTemplate
{
    public DockedPanel? End { get; init; }
    public DockedPanel? Bottom { get; init; }
}

/// <summary>Redwood's Hero search page: a centred hero (the form's header) over the results (the
/// content). The template owns the header.</summary>
public sealed record HeroSearchPage : IFormTemplate
{
    public string? BackgroundColor { get; init; }
}
