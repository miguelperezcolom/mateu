using System.Text.Json.Serialization;

namespace Mateu.Dtos;

public record ButtonMetadataDto(string Label, string ActionId) : ComponentMetadataDto
{
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }

    /// <summary>Extra parameters merged into the dispatched action request (e.g. the conflict
    /// dialog's <c>_forceOverwrite</c>).</summary>
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }

    /// <summary>A route this button navigates to on the client instead of running an action (Java's
    /// ButtonDto.route — a Button whose actionable is a RouteLink). Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Route { get; init; }
}

public record FormSectionMetadataDto(string Title) : ComponentMetadataDto;

/// <summary>A fluent/YAML <c>type: Form</c> page: its header (title, subtitle and the page-header
/// elements, with the same field names as <see cref="PageMetadataDto"/>) over its content, which
/// travels as the component's children. (Mirrors io.mateu.dtos.FormDto.)</summary>
public record FormMetadataDto : ComponentMetadataDto
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public bool ReadOnly { get; init; }
    public bool NoHeader { get; init; }
    public IReadOnlyList<ButtonDto> Toolbar { get; init; } = [];
    public IReadOnlyList<ButtonDto> Buttons { get; init; } = [];
    public string? Overline { get; init; }
    public string? TitlePlaceholder { get; init; }
    public string? Timestamp { get; init; }
    public IReadOnlyList<BadgeDto> Badges { get; init; } = [];
    public IReadOnlyList<KpiDto> Kpis { get; init; } = [];
    public IReadOnlyList<BannerDto> Banners { get; init; } = [];
    public IReadOnlyList<FabDto> Fabs { get; init; } = [];
    public PeerNavDto? PeerNav { get; init; }

    /// <summary>The record/context switcher; null — and omitted — when the page declares none.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public RecordSwitcherDto? Switcher { get; init; }
}
