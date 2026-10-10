using System.Text.Json.Serialization;

namespace Mateu.Dtos;

/// <summary>Navigation link on a form field (mirrors io.mateu.dtos.NavLinkDto). Href/title travel
/// as raw <c>${...}</c> templates — the renderer interpolates them against the live state.</summary>
public record NavLinkDto(string Href, string? Icon, string? Title, string? Target);

public record OptionDto(string Value, string Label)
{
    /// <summary>Sub-options of a hierarchical option set (tree selects); empty on flat lists.</summary>
    public IReadOnlyList<OptionDto> Children { get; init; } = [];
}

// A button (ButtonDto in Java) — a flat record carrying its own "type":"Button".
public record ButtonDto(string Label, string ActionId)
{
    public string Type { get; init; } = "Button";
    public bool Disabled { get; init; }
    public string? ButtonStyle { get; init; }
    public string? Shortcut { get; init; }
}

// ── ModelView bindable contract (mirrors io.mateu.dtos.ModelViewContractDto) ────
// The bindable surface of a ModelView — its fields (a FormField id must name one) and actions (a
// Button actionId must name one) — delivered over the wire via the reserved "__contract__" sync
// action, on the response's appData under "_contract". The visual-builder tooling validates a
// YAML/visual layout against it.
public record ModelViewContractDto(
    string ModelView,
    IReadOnlyList<ModelViewContractDto.Field> Fields,
    IReadOnlyList<ModelViewContractDto.Action> Actions)
{
    public record Field(string Id, string? DataType, string? Stereotype, string? Label, bool Required, bool ReadOnly);

    public record Action(string Id);
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

    /// <summary>The structure hash (ETag) the client already holds for this route (phase b of the
    /// client structure cache). When it matches the hash of the structure the server would send,
    /// the server omits the component and replies with only state/data. Null = full structure.
    /// (Mirrors io.mateu.dtos.RunActionRqDto.knownStructureHash.)</summary>
    public string? KnownStructureHash { get; init; }
}
