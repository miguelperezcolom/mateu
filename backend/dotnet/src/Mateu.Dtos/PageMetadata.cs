using System.Text.Json.Serialization;

namespace Mateu.Dtos;

/// <summary>Lateral navigation across peer objects — the previous/next arrows in the page header
/// (the Oracle Redwood "next/previous object" element). A null route on a side hides that arrow.
/// (Mirrors io.mateu.dtos.PeerNavDto.)</summary>
public record PeerNavDto(string? PrevLabel, string? PrevRoute, string? NextLabel, string? NextRoute);

/// <summary>The record/context switcher of the page header (the Redwood selectObject/selectContext
/// element). Picking an option dispatches <see cref="ActionId"/> with the picked value in the
/// <c>_record</c> parameter. Type: "object" (the record shown) | "context" (what the page is
/// evaluated in). (Mirrors io.mateu.dtos.RecordSwitcherDto.)</summary>
public record RecordSwitcherDto(
    IReadOnlyList<OptionDto> Options,
    string? Value,
    string Type,
    string? Label,
    bool Searchable,
    bool Disabled,
    string ActionId);

public record PageMetadataDto(
    string? Title,
    string? PageTitle,
    string? Subtitle,
    IReadOnlyList<ButtonDto> Toolbar,
    IReadOnlyList<ButtonDto> Buttons) : ComponentMetadataDto
{
    public int Level { get; init; }
    public bool ReadOnly { get; init; }
    public object? Actions { get; init; }
    /// <summary>Sticky sections index: null = renderer decides (auto), true = force, false = off.</summary>
    public bool? Toc { get; init; }
    /// <summary>Page width of a reflected view ("fixed"|"fullWidth"|"edgeToEdge"; null = the
    /// renderer infers it from the content). (Mirrors io.mateu.dtos.PageDto.pageWidth.)</summary>
    public string? PageWidth { get; init; }
    /// <summary>Coarse page type of a reflected view ("landing"|"collection"|"detail"|"form"|
    /// "process"|"dashboard"; never null — every page gets a type). (Mirrors
    /// io.mateu.dtos.PageDto.pageType.)</summary>
    public string? PageType { get; init; }
    /// <summary>The small line of text shown ABOVE the title (the Redwood overlineText header
    /// element); null when the page declares none. (Mirrors io.mateu.dtos.PageDto.overline.)</summary>
    public string? Overline { get; init; }
    /// <summary>What the header shows while Title is still empty (the Redwood
    /// pageTitlePlaceholder header element); a placeholder, NOT a default — renderers must ignore
    /// it once a title exists. (Mirrors io.mateu.dtos.PageDto.titlePlaceholder.)</summary>
    public string? TitlePlaceholder { get; init; }
    public IReadOnlyList<BadgeDto> Badges { get; init; } = [];
    public IReadOnlyList<KpiDto> Kpis { get; init; } = [];
    public IReadOnlyList<BannerDto> Banners { get; init; } = [];
    public IReadOnlyList<FabDto> Fabs { get; init; } = [];
    /// <summary>Previous/next peer-object arrows in the page header; null when the page supplies
    /// none. (Mirrors io.mateu.dtos.PageDto.peerNav.)</summary>
    public PeerNavDto? PeerNav { get; init; }
    /// <summary>The record/context switcher of the header (IRecordSwitcherSupplier); null — and
    /// omitted — when the page supplies none. (Mirrors io.mateu.dtos.PageDto.switcher.)</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public RecordSwitcherDto? Switcher { get; init; }
    /// <summary>The page's "last updated" timestamp shown in the header (from a [Timestamp]
    /// property); null when the page declares none. (Mirrors io.mateu.dtos.PageDto.timestamp.)</summary>
    public string? Timestamp { get; init; }
}

/// <summary>A page banner (mirrors io.mateu.dtos.BannerDto). Theme: INFO|SUCCESS|WARNING|DANGER.</summary>
public record BannerDto(string Theme, string? Title, string? Description)
{
    public bool HasIcon { get; init; }
    public bool HasCloseButton { get; init; }
    public int TimeoutSeconds { get; init; }
}

/// <summary>A status chip shown in the page header strip.</summary>
public record BadgeDto(string Text, string Color)
{
    public bool Primary { get; init; }
    public bool Small { get; init; }
    public bool Pill { get; init; } = true;
}

public record CardMetadataDto(ComponentDto Content) : ComponentMetadataDto
{
    public string? Title { get; init; }
    public IReadOnlyList<string> Variants { get; init; } = ["outlined"];
}

public record DivMetadataDto : ComponentMetadataDto
{
    public object? Content { get; init; }
}

public record VerticalLayoutMetadataDto : ComponentMetadataDto
{
    public bool Spacing { get; init; }

    /// <summary>Cross-axis alignment of the children: START, CENTER, END, STRETCH, BASELINE (Java
    /// HorizontalAlignmentDto); null = the renderer default.</summary>
    public string? HorizontalAlignment { get; init; }
}

public record FormLayoutMetadataDto : ComponentMetadataDto
{
    public int MaxColumns { get; init; } = 2;
    public bool AutoResponsive { get; init; } = true;

    /// <summary>Columns grow to fill the available width (mirrors Java's FormLayout.expandColumns).
    /// True by default; the normaliser keeps it because it is non-default.</summary>
    public bool ExpandColumns { get; init; } = true;

    /// <summary>The minimum responsive column width (mirrors Java's FormLayout.columnWidth); a
    /// [Compact] page tightens it to "7em". Null = the renderer's default.</summary>
    public string? ColumnWidth { get; init; }

    /// <summary>Whether the field labels sit aside (to the left of the field, in a 10rem column)
    /// instead of on top — the dense backoffice data-entry idiom. Resolved server-side: the
    /// explicit [FormLayout(LabelsAside = …)] wins, else inferred from the form's shape
    /// (mirrors the Java FormLayout.labelsAside wire flag).</summary>
    public bool LabelsAside { get; init; }
}

public record FormRowMetadataDto : ComponentMetadataDto;
