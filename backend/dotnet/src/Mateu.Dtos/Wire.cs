using System.Text.Json.Serialization;

namespace Mateu.Dtos;

// ── Top-level wire envelope (mirrors io.mateu.dtos.UIIncrementDto) ──────────────
public record UIIncrementDto(
    IReadOnlyList<UICommandDto> Commands,
    IReadOnlyList<MessageDto> Messages,
    IReadOnlyList<UIFragmentDto> Fragments,
    IReadOnlyList<object> Banners,
    bool AppendBanners,
    object? AppData,
    object? AppState)
{
    public static UIIncrementDto Of(
        IEnumerable<UICommandDto>? commands = null,
        IEnumerable<MessageDto>? messages = null,
        IEnumerable<UIFragmentDto>? fragments = null) =>
        new(commands?.ToList() ?? [], messages?.ToList() ?? [], fragments?.ToList() ?? [], [], false, null, null);
}

public record UICommandDto(string TargetComponentId, string Type, object? Data);

public record MessageDto(string Variant, string Position, string Title, string Text, int Duration);

public record UIFragmentDto(
    string TargetComponentId,
    ComponentDto? Component,
    object? State,
    object? Data,
    string Action,
    string? ContainerId);

// ── Component tree (discriminated on "type") ───────────────────────────────────
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ClientSideComponentDto), "ClientSide")]
[JsonDerivedType(typeof(ServerSideComponentDto), "ServerSide")]
public abstract record ComponentDto;

public record ClientSideComponentDto(
    ComponentMetadataDto Metadata,
    string? Id,
    IReadOnlyList<ComponentDto> Children,
    string? Style,
    string? CssClasses,
    string? Slot) : ComponentDto;

public record ServerSideComponentDto(
    string Id,
    string ServerSideType,
    string Route,
    IReadOnlyList<ComponentDto> Children,
    object InitialData,
    IReadOnlyList<ActionDto> Actions,
    IReadOnlyList<object> Triggers,
    string? Style,
    string? CssClasses,
    string? Slot) : ComponentDto
{
    public string? EmitsName { get; init; }
    public bool ConfirmOnNavigationIfDirty { get; init; }
}

public record ActionDto(string Id, bool ValidationRequired = true);

/// <summary>A trigger that fires <c>ActionId</c> when a named custom event is received.</summary>
public record CustomTriggerDto(string Event, string ActionId)
{
    public string Type { get; init; } = "OnCustomEvent";
}

// ── Component metadata (discriminated on "type") ───────────────────────────────
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AppMetadataDto), "App")]
[JsonDerivedType(typeof(PageMetadataDto), "Page")]
[JsonDerivedType(typeof(CardMetadataDto), "Card")]
[JsonDerivedType(typeof(DivMetadataDto), "Div")]
[JsonDerivedType(typeof(VerticalLayoutMetadataDto), "VerticalLayout")]
[JsonDerivedType(typeof(FormLayoutMetadataDto), "FormLayout")]
[JsonDerivedType(typeof(FormRowMetadataDto), "FormRow")]
[JsonDerivedType(typeof(FormFieldMetadataDto), "FormField")]
[JsonDerivedType(typeof(FormSectionMetadataDto), "FormSection")]
[JsonDerivedType(typeof(CrudMetadataDto), "Crud")]
[JsonDerivedType(typeof(HorizontalLayoutMetadataDto), "HorizontalLayout")]
[JsonDerivedType(typeof(ProgressBarMetadataDto), "ProgressBar")]
[JsonDerivedType(typeof(TextMetadataDto), "Text")]
[JsonDerivedType(typeof(ButtonMetadataDto), "Button")]
[JsonDerivedType(typeof(TabLayoutMetadataDto), "TabLayout")]
[JsonDerivedType(typeof(TabMetadataDto), "Tab")]
public abstract record ComponentMetadataDto;

public record TabLayoutMetadataDto : ComponentMetadataDto;

public record TabMetadataDto(string Label) : ComponentMetadataDto
{
    public bool Active { get; init; }
    public string? Shortcut { get; init; }
}

public record KpiDto(string Title, string Value)
{
    public string? Icon { get; init; }
    public string? Color { get; init; }
}

public record FabDto(string Icon, string ActionId)
{
    public string? Label { get; init; }
    public int Order { get; init; }
}

public record HorizontalLayoutMetadataDto : ComponentMetadataDto
{
    public bool Spacing { get; init; } = true;
}

public record ProgressBarMetadataDto(double Value) : ComponentMetadataDto
{
    public double Min { get; init; }
    public double Max { get; init; } = 1;
}

public record TextMetadataDto(string Text) : ComponentMetadataDto;

public record ButtonMetadataDto(string Label, string ActionId) : ComponentMetadataDto
{
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }
}

public record FormSectionMetadataDto(string Title) : ComponentMetadataDto;

public record CrudMetadataDto(
    string? Title,
    IReadOnlyList<GridColumnDto> Columns,
    IReadOnlyList<ButtonDto> Toolbar) : ComponentMetadataDto
{
    public string? Subtitle { get; init; }
    public bool Searchable { get; init; } = true;
    public bool CanEdit { get; init; }
    public string? DetailPath { get; init; }
    public string CrudlType { get; init; } = "table";
}

public record GridColumnDto(GridColumnMetaDto Metadata);

public record GridColumnMetaDto(string Id, string Label)
{
    public string Type { get; init; } = "GridColumn";
}

public record TriggerDto(string Type, string ActionId);

public record AppMetadataDto(
    string Title,
    string Variant,
    IReadOnlyList<MenuItemDto> Menu) : ComponentMetadataDto
{
    public string Layout { get; init; } = "SINGLE_SLOT";
    public string HomeRoute { get; init; } = "";
    public string HomeConsumedRoute { get; init; } = "";
    public string HomeServerSideType { get; init; } = "";
    public string ServerSideType { get; init; } = "";
    public string RootRoute { get; init; } = "";
    public string? Subtitle { get; init; }
    public string? LoginUrl { get; init; }
    public string? LogoutUrl { get; init; }
}

public record MenuItemDto(string Label, string Route, string ServerSideType)
{
    public string ConsumedRoute { get; init; } = "";
    public string? ActionId { get; init; }
    public bool Separator { get; init; }
    public bool Visible { get; init; } = true;
    public IReadOnlyList<MenuItemDto> Submenus { get; init; } = [];
}

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
    public IReadOnlyList<BadgeDto> Badges { get; init; } = [];
    public IReadOnlyList<KpiDto> Kpis { get; init; } = [];
    public IReadOnlyList<BannerDto> Banners { get; init; } = [];
    public IReadOnlyList<FabDto> Fabs { get; init; } = [];
}

/// <summary>A page banner (mirrors io.mateu.dtos.BannerDto). Theme: INFO|SUCCESS|WARNING|DANGER.</summary>
public record BannerDto(string Theme, string? Title, string? Description)
{
    public bool HasIcon { get; init; } = true;
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
}

public record FormLayoutMetadataDto : ComponentMetadataDto
{
    public int MaxColumns { get; init; } = 2;
    public bool AutoResponsive { get; init; } = true;
}

public record FormRowMetadataDto : ComponentMetadataDto;

public record FormFieldMetadataDto(string FieldId, string DataType, string Label) : ComponentMetadataDto
{
    public string Stereotype { get; init; } = "regular";
    public bool Required { get; init; }
    public bool ReadOnly { get; init; }
    public int Colspan { get; init; } = 1;
    public object? InitialValue { get; init; }
    public IReadOnlyList<OptionDto> Options { get; init; } = [];
    public bool Multiline { get; init; }
}

public record OptionDto(string Value, string Label);

// A button (ButtonDto in Java) — a flat record carrying its own "type":"Button".
public record ButtonDto(string Label, string ActionId)
{
    public string Type { get; init; } = "Button";
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }
    public string? Shortcut { get; init; }
}

// ── Inbound request (mirrors io.mateu.dtos.RunActionRqDto) ──────────────────────
public record RunActionRqDto
{
    public Dictionary<string, object?> ComponentState { get; init; } = new();
    public Dictionary<string, object?> AppState { get; init; } = new();
    public Dictionary<string, object?> Parameters { get; init; } = new();
    public string? InitiatorComponentId { get; init; }
    public string? ConsumedRoute { get; init; }
    public string? ActionId { get; init; }
    public string? Route { get; init; }
    public string? ServerSideType { get; init; }
    public string? ServerSideComponentRoute { get; init; }
}
