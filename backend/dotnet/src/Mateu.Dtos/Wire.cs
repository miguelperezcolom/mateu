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
    object? AppState,
    // Version of the wire protocol this payload conforms to (e.g. "3.0"). Additive within a major
    // version; a consumer may read it to guard against a mismatched producer. Trailing optional
    // parameter so every existing positional construction keeps compiling.
    string WireVersion = "3.0")   // literal: a positional-record param default cannot reference the body const
{
    /// <summary>Current wire protocol version. Bumped only on a breaking (major) wire change;
    /// additions within a major are backward compatible and do not change it.</summary>
    public const string CurrentWireVersion = "3.0";

    public static UIIncrementDto Of(
        IEnumerable<UICommandDto>? commands = null,
        IEnumerable<MessageDto>? messages = null,
        IEnumerable<UIFragmentDto>? fragments = null,
        IEnumerable<object>? banners = null,
        bool appendBanners = false) =>
        new(commands?.ToList() ?? [], messages?.ToList() ?? [], fragments?.ToList() ?? [], banners?.ToList() ?? [], appendBanners, null, null);
}

public record UICommandDto(string TargetComponentId, string Type, object? Data)
{
    /// <summary>Closes the topmost open overlay (dialog or drawer).</summary>
    public static UICommandDto CloseModal() => new("ux_main", "CloseModal", null);

    /// <summary>Closes the topmost open overlay and emits <paramref name="eventName"/> (with
    /// <paramref name="detail"/> as its payload) through the custom-event bus, so the host page
    /// can react — refresh itself or receive the overlay's result (mirrors Java's
    /// UICommand.closeModal).</summary>
    public static UICommandDto CloseModal(string eventName, object? detail = null) =>
        new("ux_main", "CloseModal", new CustomEventDto(eventName, detail));

    /// <summary>Emits a named custom event from the current component (mirrors Java's
    /// UICommand.dispatchEvent) — @SubscribeTo counterparts react to it.</summary>
    public static UICommandDto DispatchEvent(string eventName, object? detail = null) =>
        new("ux_main", "DispatchEvent", new CustomEventDto(eventName, detail));
}

/// <summary>A named custom event riding on a CloseModal/DispatchEvent command (mirrors
/// io.mateu.uidl.fluent.CustomEvent).</summary>
public record CustomEventDto(string EventName, object? Detail);

public record MessageDto(
    string Variant,
    string Position,
    string Title,
    string Text,
    int Duration,
    string? UndoLabel = null,
    string? UndoActionId = null,
    IReadOnlyDictionary<string, object?>? UndoParameters = null);

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
    string? Slot) : ComponentDto
{
    /// <summary>The sizing intent (coherence-plan #8): "hug" | "fill" | "fixed:&lt;len&gt;". Null =
    /// unset (default flow). Portable intent-as-data; the web maps it to flex on the component host.
    /// An init property (not positional) so the many Client(...) call-sites keep compiling.</summary>
    public string? Sizing { get; init; }
}

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

    /// <summary>How the page's content column is sized (the first parameter of the Redwood page
    /// templates): "fixed"|"fullWidth"|"edgeToEdge"; null = no opinion — the renderer infers the
    /// width from the page content. From [PageWidth] on the view class, else the IPageWidthSupplier
    /// hook. (Mirrors io.mateu.dtos.ServerSideComponentDto.pageWidth.)</summary>
    public string? PageWidth { get; init; }

    /// <summary>The page's coarse template type (the Redwood page-template families):
    /// "landing"|"collection"|"detail"|"form"|"process"|"dashboard" — never null, every page gets
    /// a type (default "form"). From [PageTemplate] on the view class when present, else inferred
    /// from the ModelView's shape. (Mirrors io.mateu.dtos.ServerSideComponentDto.pageType.)</summary>
    public string? PageType { get; init; }

    /// <summary>Client-side rules ([Hidden]/[Disabled] fields, IRuleSupplier): the renderer's
    /// no-eval engine re-evaluates them on every state change.</summary>
    public IReadOnlyList<RuleDto> Rules { get; init; } = [];

    /// <summary>Client-side field validations derived from the bean-validation constraints
    /// ([Required]/[Range]…), re-evaluated on every state change (mirrors io.mateu.dtos.ValidationDto).</summary>
    public IReadOnlyList<ValidationDto> Validations { get; init; } = [];

    /// <summary>The view is declared [StaticView]: its full response never varies, so the client
    /// caches it for the session and skips the round-trip on return visits (mirrors
    /// io.mateu.dtos.ServerSideComponentDto.staticView). A developer promise; false unless declared.</summary>
    public bool StaticView { get; init; }

    /// <summary>Stable content hash (ETag) of this component's structure (phase b of the client
    /// structure cache). The client stores it next to the cached structure and echoes it back as
    /// RunActionRqDto.KnownStructureHash; when it still matches, the server omits the component and
    /// the client reuses its cache. (Mirrors io.mateu.dtos.ServerSideComponentDto.structureHash.)</summary>
    public string? StructureHash { get; init; }
}

/// <summary>A client-side field validation (mirrors io.mateu.dtos.ValidationDto): Condition is a
/// JS-ish predicate over the live state; when it is falsy the field is invalid and Message shows.</summary>
public record ValidationDto(string Condition, string FieldId, string Message);

/// <summary>A client-side rule (mirrors io.mateu.dtos.RuleDto): when Filter evaluates truthy the
/// renderer applies Action — e.g. SetDataValue of FieldAttribute (hidden, disabled, required…) to
/// the value of Expression, both evaluated against the live state.</summary>
public record RuleDto(
    string Filter,
    string Action,
    string? FieldName,
    string? FieldAttribute,
    object? Value,
    string? Expression,
    string Result,
    string? ActionId);

// Field names mirror io.mateu.dtos.ActionDto (confirmationRequired/rowsSelectedRequired/bubble):
// the frontend blocks a rowsSelectedRequired action while the grid selection is empty, and
// bubble lets the event reach the enclosing crud component.
public record ActionDto(
    string Id,
    bool ValidationRequired = true,
    bool ConfirmationRequired = false,
    bool RowsSelectedRequired = false,
    bool Bubble = false)
{
    /// <summary>Client-side request ceiling in ms for this action; 0 keeps the client default
    /// (60s). One global timeout cannot serve both a type-ahead lookup and a report export.
    /// </summary>
    public int TimeoutMillis { get; init; }

    /// <summary>Declares that re-sending this action cannot apply the same change twice, so the
    /// client may retry it by itself after a transient network failure. Only for genuine reads or
    /// naturally idempotent writes: after a timeout the client cannot know whether the server
    /// processed the request.</summary>
    public bool Idempotent { get; init; }

    /// <summary>Makes this action call an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of
    /// dispatching to the Mateu server ([RestAction]); null for normal actions (mirrors
    /// io.mateu.dtos.ActionDto.restAction).</summary>
    public RestActionDto? RestAction { get; init; }

    /// <summary>The fields the client validates before sending the action (comma-separated), when
    /// only some must be valid — a grid row editor's Save validates the row's constrained fields,
    /// not the whole form (mirrors io.mateu.dtos.ActionDto.fieldsToValidate).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? FieldsToValidate { get; init; }
}

/// <summary>Descriptor for a button that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE
/// (mirrors io.mateu.dtos.RestActionDto): the renderer fetches <c>Source</c> directly, shows
/// <c>SuccessMessage</c> as a toast on a 2xx response and — when <c>ResultPath</c> is set — merges
/// the object at that path in the JSON response into the form state.</summary>
public record RestActionDto(RestDataSourceDto Source, string? SuccessMessage, string? ResultPath);

/// <summary>A trigger that fires <c>ActionId</c> when a named custom event is received.</summary>
public record CustomTriggerDto(string Event, string ActionId)
{
    public string Type { get; init; } = "OnCustomEvent";
}
