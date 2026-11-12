using System.Text.Json.Serialization;

namespace Mateu.Dtos;

public record ButtonMetadataDto(string Label, string ActionId) : ComponentMetadataDto
{
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }

    /// <summary>The button colour (normal/success/error/contrast; Java's ButtonDto.color). Omitted
    /// when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Color { get; init; }

    /// <summary>Extra parameters merged into the dispatched action request (e.g. the conflict
    /// dialog's <c>_forceOverwrite</c>).</summary>
    public IReadOnlyDictionary<string, object?>? Parameters { get; init; }

    /// <summary>A route this button navigates to on the client instead of running an action (Java's
    /// ButtonDto.route — a Button whose actionable is a RouteLink). Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Route { get; init; }

    /// <summary>The keyboard shortcut of the action the button runs (Java's ButtonDto.shortcut).
    /// Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Shortcut { get; init; }

    /// <summary>The button size ("small"…; Java's ButtonDto.size). Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Size { get; init; }

    /// <summary>The buttons behind this one's ▾ — a dropdown group or a SPLIT button (Java's
    /// ButtonDto.children). Typed as the base so each carries its "type". Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyList<ComponentMetadataDto>? Children { get; init; }

    /// <summary>A SPLIT button: it runs its own action and its ▾ opens <see cref="Children"/>
    /// (Java's ButtonDto.split). Omitted when false.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
    public bool Split { get; init; }
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

    /// <summary>The page template the form fills (its type and own values); null — and omitted —
    /// for a free page. Its slots travel laid out among the children. (Java's FormDto.template.)</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PageTemplateDto? Template { get; init; }
}

/// <summary>A page template's own values on the wire: its <see cref="Type"/> (the template record's
/// name, e.g. <c>ItemOverviewPage</c>) and, for the item overview, its avatar/photo. (Mirrors
/// io.mateu.dtos.PageTemplateDto.)</summary>
public record PageTemplateDto(string Type, TemplateImageDto? Avatar = null, TemplateImageDto? Photo = null);

/// <summary>A template image: a picture or initials. (Mirrors io.mateu.dtos.TemplateImageDto.)</summary>
public record TemplateImageDto(string? Src, string? Initials);
