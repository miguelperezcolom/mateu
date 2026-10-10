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
}

public record ProgressBarMetadataDto(double Value) : ComponentMetadataDto
{
    public double Min { get; init; }
    public double Max { get; init; } = 1;
}

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
