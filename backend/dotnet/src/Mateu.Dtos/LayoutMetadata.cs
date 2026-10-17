using System.Text.Json.Serialization;

namespace Mateu.Dtos;

/// <summary>Tab strip metadata (mirrors io.mateu.dtos.TabLayoutDto). GroupRelationship —
/// alternative|sequential|simultaneous — carries the semantic relationship between the tabbed
/// groups; Adaptable tells renderers they may swap the concrete widget (e.g. degrade tabs to an
/// accordion on narrow viewports) as long as the disclosure semantics are preserved.</summary>
public record TabLayoutMetadataDto : ComponentMetadataDto
{
    public string? GroupRelationship { get; init; }
    public bool Adaptable { get; init; }
}

/// <summary>Accordion metadata (mirrors io.mateu.dtos.AccordionLayoutDto). Panels is empty on the
/// wire — the panels travel as component children carrying AccordionPanel metadata.</summary>
public record AccordionLayoutMetadataDto : ComponentMetadataDto
{
    public IReadOnlyList<AccordionPanelMetadataDto> Panels { get; init; } = [];
    public string? Variant { get; init; }
}

/// <summary>One collapsible accordion panel (mirrors io.mateu.dtos.AccordionPanelDto); its content
/// travels as the component's child.</summary>
public record AccordionPanelMetadataDto(string Label) : ComponentMetadataDto
{
    public string? Id { get; init; }
    public bool Active { get; init; }
    public bool Disabled { get; init; }
}

public record TabMetadataDto(string Label) : ComponentMetadataDto
{
    public bool Active { get; init; }
    public string? Shortcut { get; init; }
}

/// <summary>A KPI card in the page header (mirrors Java's io.mateu.dtos.KPIDto). The wire carries a
/// "type":"KPIDto" discriminator and the value under "text".</summary>
public record KpiDto(string Title, string Text)
{
    public string Type => "KPIDto";
    public string? Style { get; init; }
    public string? CssClasses { get; init; }
}

public record FabDto(string Icon, string ActionId)
{
    /// <summary>The FAB's id (a data-declared FAB carries its action id here, like Java's
    /// FabDto.id); omitted when absent, so reflected pages' wire is unchanged.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Id { get; init; }

    public string? Label { get; init; }
    public int Order { get; init; }

    /// <summary>The button emphasis; a FAB is a primary action by default (mirrors Java's
    /// FabDto.buttonStyle).</summary>
    public string? ButtonStyle { get; init; }
}

public record HorizontalLayoutMetadataDto : ComponentMetadataDto
{
    public bool Spacing { get; init; } = true;

    /// <summary>Lets the row's items wrap to the next line (responsive zone stacking).</summary>
    public bool Wrap { get; init; }

    /// <summary>Main-axis placement of the children (START/CENTER/END/BETWEEN/AROUND/EVENLY; Java's
    /// HorizontalLayoutDto.justification). Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Justification { get; init; }
}

public record ProgressBarMetadataDto(double Value) : ComponentMetadataDto
{
    public double Min { get; init; }
    public double Max { get; init; } = 1;
    public bool Indeterminate { get; init; }
    public string? ValueKey { get; init; }
    public string? Text { get; init; }
    public string? Theme { get; init; }
}

/// <summary>Formatted text from Markdown (mirrors Java's MarkdownDto).</summary>
public record MarkdownMetadataDto(string? Markdown) : ComponentMetadataDto;

/// <summary>An image by url or data URI (mirrors Java's ImageDto).</summary>
public record ImageMetadataDto(string? Src) : ComponentMetadataDto;

/// <summary>A small status chip (mirrors Java's BadgeDto).</summary>
public record BadgeMetadataDto(string? Text) : ComponentMetadataDto
{
    public string? IconOnLeft { get; init; }
    public string? IconOnRight { get; init; }
    public string? Color { get; init; }
    public bool Primary { get; init; }
    public bool Small { get; init; }
    public bool Pill { get; init; }
}

/// <summary>A person's picture or initials (mirrors Java's AvatarDto).</summary>
public record AvatarMetadataDto(string? Name, string? Abbreviation = null, string? Image = null) : ComponentMetadataDto;

/// <summary>Overlapping avatars, the rest as +N (mirrors Java's AvatarGroupDto).</summary>
public record AvatarGroupMetadataDto(IReadOnlyList<ComponentMetadataDto> Avatars, int MaxItemsVisible) : ComponentMetadataDto;

public record ChartDatasetDto(string? Label, IReadOnlyList<double> Data);

public record ChartDataDto(IReadOnlyList<string> Labels, IReadOnlyList<ChartDatasetDto> Datasets);

/// <summary>A chart (mirrors Java's ChartDto).</summary>
public record ChartMetadataDto(string? ChartType, ChartDataDto? ChartData, object? ChartOptions = null) : ComponentMetadataDto;

/// <summary>A BPMN diagram from its XML (mirrors Java's BpmnDto).</summary>
public record BpmnMetadataDto(string? Xml) : ComponentMetadataDto;

public record TextMetadataDto(string Text) : ComponentMetadataDto
{
    /// <summary>Font size: xl | l | m | s | xs. m (or null) applies nothing.</summary>
    public string? Size { get; init; }

    /// <summary>Drops the container's block margins (margin-block-start/end: 0).</summary>
    public bool NoMargins { get; init; }

    /// <summary>The HTML container element (e.g. "h3" for a section heading); "div" unless set, as
    /// in Java (TextDto.container never null: io.mateu.uidl.data.Text defaults it to div).</summary>
    public string? Container { get; init; } = "div";
}

/// <summary>A horizontal divider line (&lt;hr&gt;); data-colspan in Attributes makes it span the
/// full form row.</summary>
public record SeparatorMetadataDto(IReadOnlyDictionary<string, string>? Attributes = null) : ComponentMetadataDto;

/// <summary>A custom component (coherence-plan #14): a type Name a renderer registers against + a
/// Props bag it reads. Slotted children ride on the ClientSideComponentDto's children.</summary>
public record CustomComponentMetadataDto(string Name, IReadOnlyDictionary<string, object>? Props = null) : ComponentMetadataDto;

/// <summary>A hyperlink (mirrors AnchorDto). Target "_blank" is rendered with rel=noopener.</summary>
public record AnchorMetadataDto(string Text, string Url, string? Target = null) : ComponentMetadataDto;

/// <summary>A compact inline banner: theme-tinted strip with a severity icon, one line of text
/// and an optional right-aligned action.</summary>
public record NoticeMetadataDto(string? Text, string? Theme, string? Icon, string? ActionLabel, string? ActionId, bool Slim = false, bool FullWidth = false, bool NoIcon = false, string? Status = null, bool InlineContent = false) : ComponentMetadataDto;

// ── Generic building blocks ported from Java (M-A5): 1:1 mirrors of the Java wire DTOs ──

/// <summary>An arbitrary HTML element / web component (mirrors io.mateu.dtos.ElementDto).</summary>
public record ElementMetadataDto(string? Name, IReadOnlyDictionary<string, string>? Attributes,
    IReadOnlyDictionary<string, string>? On, string? Content, bool Html = false) : ComponentMetadataDto;

/// <summary>A tooltip over a wrapped component, which travels in the metadata (mirrors TooltipDto).</summary>
public record TooltipMetadataDto(string? Text, ComponentDto? Wrapped) : ComponentMetadataDto;

/// <summary>A confirmation dialog; its content travels as the component's single child (mirrors
/// ConfirmDialogDto).</summary>
public record ConfirmDialogMetadataDto(string? Header, bool CanCancel, bool CanReject, string? RejectText,
    string? ConfirmText, string? OpenedCondition, string? ConfirmActionId, string? RejectActionId,
    string? CancelActionId) : ComponentMetadataDto;

/// <summary>A disclosure; summary and content travel in the metadata (mirrors DetailsDto).</summary>
public record DetailsMetadataDto(ComponentDto? Summary, ComponentDto? Content, bool Opened) : ComponentMetadataDto;

/// <summary>Two panes with a splitter; master and detail travel as the two children (mirrors
/// SplitLayoutDto). Orientation: horizontal | vertical; variant: small | minimal.</summary>
public record SplitLayoutMetadataDto(string? Orientation, string? Variant, bool FullWidth) : ComponentMetadataDto;

/// <summary>One breadcrumb link (mirrors BreadcrumbDto).</summary>
public record BreadcrumbDto(string? Text, string? Link);

/// <summary>A breadcrumb trail (mirrors BreadcrumbsDto).</summary>
public record BreadcrumbsMetadataDto(string? CurrentItemText, IReadOnlyList<BreadcrumbDto> Breadcrumbs) : ComponentMetadataDto;

/// <summary>An icon by name (mirrors IconDto).</summary>
public record IconMetadataDto(string? Icon) : ComponentMetadataDto;

/// <summary>An inline notification (mirrors NotificationDto).</summary>
public record NotificationMetadataDto(string? Title, string? Text) : ComponentMetadataDto;
