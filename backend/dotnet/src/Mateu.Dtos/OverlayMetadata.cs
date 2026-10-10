using System.Text.Json.Serialization;

namespace Mateu.Dtos;

/// <summary>A popover (mirrors io.mateu.dtos.PopoverDto): the wrapped component and the content of
/// its floating panel, opened on <c>click</c> (default) or <c>hover</c>.</summary>
public record PopoverMetadataDto(ComponentDto? Content, ComponentDto? Wrapped, string Trigger = "click") : ComponentMetadataDto;

/// <summary>A drawer overlay (mirrors io.mateu.dtos.DrawerDto): a panel sliding in from a
/// viewport edge whose content travels in the Content field. Emitted as an Add fragment so it
/// stacks on the page instead of replacing it.</summary>
public record DrawerMetadataDto(string? Id, string? HeaderTitle, ComponentDto? Content) : ComponentMetadataDto
{
    public string? Subtitle { get; init; }
    public ComponentDto? Header { get; init; }
    public ComponentDto? Footer { get; init; }
    /// <summary>start|end (the viewport edge the drawer slides from).</summary>
    public string Position { get; init; } = "end";
    public string? Width { get; init; }
    /// <summary>Standard drawer size ("s"|"m"|"l"|"xl"); Width overrides it. (Mirrors DrawerDto.size.)</summary>
    public string? Size { get; init; }
    /// <summary>When true, the header shows a maximize button that bumps the drawer a size up.</summary>
    public bool Maximizable { get; init; }
    /// <summary>Bottom drawer only: a handle collapses the drawer to its header strip and back.</summary>
    public bool Collapsible { get; init; }
    /// <summary>Previous/next peer-object arrows in the drawer header; null when none.</summary>
    public PeerNavDto? PeerNav { get; init; }
    public bool NoPadding { get; init; }
    public bool Modeless { get; init; }
    /// <summary>Push (layout) mode: the drawer docks to its edge and pushes the page content aside
    /// instead of overlaying it (implies non-modal).</summary>
    public bool Layout { get; init; }
    public object? InitialData { get; init; }
}

/// <summary>A remote Mateu UI embedded as an island inside this page (mirrors
/// io.mateu.dtos.MicroFrontendDto): the renderer mounts a mateu-ux against BaseUrl/Route and the
/// island runs its own sync loop against the remote backend.</summary>
public record MicroFrontendMetadataDto(string BaseUrl, string Route) : ComponentMetadataDto
{
    public string ConsumedRoute { get; init; } = "_empty";
    public string? Style { get; init; }
    public string? CssClasses { get; init; }
    public string ServerSideType { get; init; } = "";
    public object? AppState { get; init; }
    public string? ActionId { get; init; }
}

/// <summary>A modal dialog overlay (mirrors io.mateu.dtos.DialogDto).</summary>
public record DialogMetadataDto(string? Id, string? HeaderTitle, ComponentDto? Content) : ComponentMetadataDto
{
    public ComponentDto? Header { get; init; }
    public ComponentDto? Footer { get; init; }
    public bool NoPadding { get; init; }
    public bool Modeless { get; init; }
    public string? Width { get; init; }
    public string? Height { get; init; }
    public bool CloseButtonOnHeader { get; init; } = true;
    public object? InitialData { get; init; }
}

/// <summary>A form cell holding an arbitrary component (an adapted-type island, an embedded view):
/// a label over the content, spanning Colspan columns (mirrors io.mateu.dtos.CustomFieldDto).</summary>
public record CustomFieldMetadataDto(string Label, ComponentDto Content, int Colspan) : ComponentMetadataDto;
