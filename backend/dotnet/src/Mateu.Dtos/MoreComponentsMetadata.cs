namespace Mateu.Dtos;

// 1:1 mirrors of the Java wire DTOs of the last component types that were Java-only
// (io.mateu.dtos.BoardLayoutDto & friends). Where a part travels (metadata vs children) follows the
// Java mappers; members a Java mapper never sets are left out.

/// <summary>Mirrors BoardLayoutDto: the rows travel as children.</summary>
public record BoardLayoutMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors BoardLayoutRowDto: the items travel as children.</summary>
public record BoardLayoutRowMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors BoardLayoutItemDto: the content is the single child.</summary>
public record BoardLayoutItemMetadataDto(int BoardCols) : ComponentMetadataDto;

/// <summary>Mirrors CarouselLayoutDto (direction: horizontal | vertical). Slides travel as children.</summary>
public record CarouselLayoutMetadataDto(
    bool Alt, bool Animating, bool Auto, string? Direction, bool Disabled, bool DisableSwipe,
    bool DisableKeys, int Duration, bool Dots, bool End, bool Loop, bool Nav, int Selected, int Total)
    : ComponentMetadataDto;

/// <summary>Mirrors ChatDto.</summary>
public record ChatMetadataDto(string? SseUrl, string? UploadUrl) : ComponentMetadataDto;

/// <summary>Mirrors ContainerDto: the content is the single child.</summary>
public record ContainerMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors FullWidthDto: the content is the single child.</summary>
public record FullWidthMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors ScrollerDto: the content is the single child.</summary>
public record ScrollerMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors FormItemDto: the content travels as children.</summary>
public record FormItemMetadataDto : ComponentMetadataDto;

/// <summary>Mirrors FormSubSectionDto: the content travels as children.</summary>
public record FormSubSectionMetadataDto(string? Title) : ComponentMetadataDto;

/// <summary>Mirrors MasterDetailLayoutDto: master and detail travel as children.</summary>
public record MasterDetailLayoutMetadataDto : ComponentMetadataDto;

/// <summary>One entry of a menu component (the members Java's ContextMenuMapper/DirectoryMapper/
/// MenuBarMapper set on io.mateu.dtos.MenuOptionDto).</summary>
public record MenuOptionDto(string? Label, string? Path)
{
    public ComponentDto? Component { get; init; }
    public bool Visible { get; init; } = true;
    public bool Selected { get; init; }
    public bool Disabled { get; init; }
    public bool DisabledOnClick { get; init; }
    public string? ClassName { get; init; }
    public object? ItemData { get; init; }
    public IReadOnlyList<MenuOptionDto> Submenus { get; init; } = [];
    public bool Separator { get; init; }
}

/// <summary>Mirrors ContextMenuDto.</summary>
public record ContextMenuMetadataDto(IReadOnlyList<MenuOptionDto> Menu, ComponentDto? Wrapped, bool ActivateOnLeftClick)
    : ComponentMetadataDto;

/// <summary>Mirrors DirectoryDto.</summary>
public record DirectoryMetadataDto(IReadOnlyList<MenuOptionDto> Menu) : ComponentMetadataDto;

/// <summary>Mirrors MenuBarDto.</summary>
public record MenuBarMetadataDto(IReadOnlyList<MenuOptionDto> Options) : ComponentMetadataDto;

/// <summary>Mirrors CookieConsentDto (position: Top | Bottom | TopLeft | TopRight | BottomLeft | BottomRight).</summary>
public record CookieConsentMetadataDto(
    string? Position, string? CookieName, string? Message, string? Theme, string? LearnMore,
    string? LearnMoreLink, string? Dismiss) : ComponentMetadataDto;

/// <summary>Mirrors FormEditorDto.</summary>
public record FormEditorMetadataDto(string? Value) : ComponentMetadataDto;

/// <summary>Mirrors WorkflowDto.</summary>
public record WorkflowMetadataDto(string? Value) : ComponentMetadataDto;

/// <summary>Mirrors NotFoundDto.</summary>
public record NotFoundMetadataDto(string? Title, string? Message, string? BackRoute, string? BackLabel) : ComponentMetadataDto;

/// <summary>Mirrors MessageListItemDto.</summary>
public record MessageListItemDto(string? Text, string? UserName, string? Time, string? UserImg, string? UserAbbr, int? UserColorIndex);

/// <summary>Mirrors MessageListDto.</summary>
public record MessageListMetadataDto(IReadOnlyList<MessageListItemDto> Items) : ComponentMetadataDto;

/// <summary>Mirrors MessageInputDto.</summary>
public record MessageInputMetadataDto(string? ActionId) : ComponentMetadataDto;

/// <summary>Mirrors DataPageDto. The content is typed <c>object</c> on purpose: Java's is a
/// <c>List&lt;?&gt;</c>, so its items (rows, or a VirtualList's components) travel without the
/// ClientSide/ServerSide discriminator.</summary>
public record DataPageDto(IReadOnlyList<object> Content, long TotalElements);

/// <summary>A component inside a <see cref="DataPageDto"/>: the ClientSide shape WITHOUT its
/// discriminator, as Jackson writes a component held in Java's untyped page content (System.Text.Json
/// would stamp "type" on the ClientSideComponentDto itself).</summary>
public record DataPageComponentDto(ComponentMetadataDto Metadata, string? Id, IReadOnlyList<ComponentDto> Children,
    string? Style, string? CssClasses, string? Slot);

/// <summary>Mirrors VirtualListDto.</summary>
public record VirtualListMetadataDto(DataPageDto Page) : ComponentMetadataDto;

/// <summary>Mirrors GridDto: the columns (and column groups) travel in <see cref="Content"/>.</summary>
public record GridMetadataDto(
    IReadOnlyList<ComponentDto> Content, DataPageDto? Page, bool Tree, int Size, bool WrapCellContent,
    bool Compact, bool NoBorder, bool NoRowBorder, bool ColumnBorders, bool RowStripes,
    string? VaadinGridCellBackground, string? VaadinGridCellPadding) : ComponentMetadataDto;

/// <summary>A column of a fluent Grid as a component (mirrors GridColumnDto as Java's
/// GridColumnMapper fills it). A listing's columns use <see cref="GridColumnMetaDto"/>.</summary>
public record GridColumnComponentMetadataDto(string? Id, string? Label) : ComponentMetadataDto
{
    public string? Align { get; init; }
    public string? DataType { get; init; }
    public string? Stereotype { get; init; }
    public bool AutoWidth { get; init; }
    public string? CssClasses { get; init; }
    public bool Filterable { get; init; }
    public string? FlexGrow { get; init; }
    public bool Frozen { get; init; }
    public bool FrozenToEnd { get; init; }
    public bool Resizable { get; init; }
    public bool Sortable { get; init; }
    public string? SortingProperty { get; init; }
    public string? Width { get; init; }
    public string? TooltipPath { get; init; }
    public string? ActionId { get; init; }
    public string? Text { get; init; }
    public string? CaptionPath { get; init; }
    public string? LeadingPath { get; init; }
    public string? Style { get; init; }
    public int? Priority { get; init; }
    public bool Identifier { get; init; }
    public bool Editable { get; init; }
    public string? EditorType { get; init; }
    public IReadOnlyList<OptionDto>? EditorOptions { get; init; }
    public double? Weight { get; init; }
    public string? Aggregate { get; init; }
    public int? Line { get; init; }
    public IReadOnlyDictionary<string, string>? Tones { get; init; }
    public IReadOnlyDictionary<string, string>? ValueLabels { get; init; }
}

/// <summary>Mirrors GridGroupColumnDto: the grouped columns travel in <see cref="Columns"/>.</summary>
public record GridGroupColumnMetadataDto(string? Id, string? Label, string? Style, string? CssClasses, IReadOnlyList<ComponentDto> Columns)
    : ComponentMetadataDto;
