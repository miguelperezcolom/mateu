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
    string? Slot) : ComponentDto;

public record ActionDto(string Id, bool ValidationRequired = true);

// ── Component metadata (discriminated on "type") ───────────────────────────────
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PageMetadataDto), "Page")]
[JsonDerivedType(typeof(CardMetadataDto), "Card")]
[JsonDerivedType(typeof(DivMetadataDto), "Div")]
[JsonDerivedType(typeof(VerticalLayoutMetadataDto), "VerticalLayout")]
[JsonDerivedType(typeof(FormLayoutMetadataDto), "FormLayout")]
[JsonDerivedType(typeof(FormRowMetadataDto), "FormRow")]
[JsonDerivedType(typeof(FormFieldMetadataDto), "FormField")]
public abstract record ComponentMetadataDto;

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
    public IReadOnlyList<object> Badges { get; init; } = [];
    public IReadOnlyList<object> Kpis { get; init; } = [];
    public IReadOnlyList<object> Banners { get; init; } = [];
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
}

public record OptionDto(string Value, string Label);

// A button (ButtonDto in Java) — a flat record carrying its own "type":"Button".
public record ButtonDto(string Label, string ActionId)
{
    public string Type { get; init; } = "Button";
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }
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
