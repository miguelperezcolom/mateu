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
    /// <summary>The button's colour theme ("error" for a crud's Delete, as in Java); omitted when
    /// none.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Color { get; init; }
    /// <summary>The button's size (Java's ButtonDto.size); omitted when none.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Size { get; init; }
    /// <summary>Draws a separator before the button (Java's ButtonDto.separatorBefore); omitted
    /// when false.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
    public bool SeparatorBefore { get; init; }
    // A bulk action (a [ListToolbarButton]): the renderer disables the button while no row is
    // selected. On the BUTTON so no renderer has to look the advertised action up by id (mirrors
    // Java's ButtonDto.rowsSelectedRequired). Omitted when false, so other buttons' wire is unchanged.
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
    public bool RowsSelectedRequired { get; init; }
    /// <summary>A route the button NAVIGATES to on the client (Java's ButtonDto.route — a toolbar
    /// button whose actionable is a RouteLink). Omitted when null.</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Route { get; init; }
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

    /// <summary>The chrome of the EMBEDDED micro frontend that sends this request (<c>NONE</c> |
    /// <c>COMPACT</c> | <c>PAGE</c>); null/blank = a top-level request. An embedded island is a block
    /// of another page, so its answers carry no window commands (SetWindowTitle, SetFavicon,
    /// PushStateToHistory). EXPERIMENTAL. (Mirrors io.mateu.dtos.RunActionRqDto.embeddedChrome.)</summary>
    public string? EmbeddedChrome { get; init; }

    /// <summary>Whether the request comes from an embedded micro frontend.</summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public bool Embedded => !string.IsNullOrWhiteSpace(EmbeddedChrome);
}
