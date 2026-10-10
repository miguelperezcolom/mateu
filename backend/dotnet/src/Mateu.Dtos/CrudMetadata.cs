using System.Text.Json.Serialization;

namespace Mateu.Dtos;

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

    /// <summary>Dense rows ([Compact] on the crud/listing): Vaadin's compact grid theme, Redwood's
    /// display="grid". Omitted when false (mirrors CrudlDto.compact).</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
    public bool Compact { get; init; }

    /// <summary>The renderer's grid layout: auto (renderer decides) | table | list | cards |
    /// masterDetail | tree (hierarchical rows carrying a self-referential children list —
    /// never auto-selected).</summary>
    public string GridLayout { get; init; } = "auto";

    /// <summary>The smart search bar's filters, one FormField per filterable entity property
    /// (enums as multi-selects, temporals as date ranges, [RangeFilter] numerics as min–max).</summary>
    public IReadOnlyList<FormFieldMetadataDto> Filters { get; init; } = [];

    /// <summary>The [GroupBy] column of the row class (camelCase field id): the listing groups
    /// its rows by it — implicit primary sort + a group subtotal row whenever the value changes.
    /// Null when the row class declares no [GroupBy] column (mirrors CrudlDto.groupBy).</summary>
    public string? GroupBy { get; init; }

    /// <summary>The [GroupAction] buttons rendered on every group header row; a click dispatches
    /// action-on-row-&lt;actionId&gt; with the group value as _groupValue (mirrors
    /// CrudlDto.groupActions).</summary>
    public IReadOnlyList<ButtonDto> GroupActions { get; init; } = [];

    /// <summary>Row selection checkboxes on the listing (a deletable/bulk-capable listing needs
    /// them; a bare listing shows none — mirrors CrudlDto.rowsSelectionEnabled).</summary>
    public bool RowsSelectionEnabled { get; init; }

    /// <summary>Rows fetched CLIENT-SIDE from an arbitrary (non-Mateu) REST endpoint
    /// ([RestListing]); the renderer maps each JSON item into a row keyed by column id instead of
    /// dispatching the server search. Null on server-backed listings (mirrors CrudlDto.rowsSource).</summary>
    public RestDataSourceDto? RowsSource { get; init; }

    /// <summary>Rows can be dragged onto a DropZone accepting this type ([DragRows]); null = not
    /// draggable (mirrors CrudlDto.dragType).</summary>
    public string? DragType { get; init; }

    /// <summary>The [RowStatus] property of the row class (camelCase field id): its value
    /// (success | warning | danger | info | neutral) tones the whole row. Null = no row tones
    /// (mirrors CrudlDto.rowStatusField).</summary>
    public string? RowStatusField { get; init; }

    /// <summary>Shown in place of the results until the first search has run (the Redwood
    /// smart-filter-search dashboard slot); null — and omitted — when none (mirrors
    /// CrudlDto.preSearch).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyList<ComponentDto>? PreSearch { get; init; }
}

/// <summary>A column of a listing or grid field. On the wire it is a ClientSide component (Java's
/// List&lt;ComponentDto&gt; columns), so it carries the discriminator and the column id.</summary>
public record GridColumnDto(GridColumnMetaDto Metadata)
{
    [JsonPropertyOrder(-1)] public string Type { get; init; } = "ClientSide";

    public string? Id => Metadata.Id;
}

public record GridColumnMetaDto(string Id, string Label)
{
    public string Type { get; init; } = "GridColumn";

    /// <summary>The column's value type (string|integer|number|boolean|date|money) — drives the
    /// renderer's cell formatting. Null on legacy crud columns.</summary>
    public string? DataType { get; init; }

    public string? Stereotype { get; init; }

    /// <summary>Rich "primary" column (coherence-plan #6): the row field for the secondary caption
    /// line, and the one for the leading avatar/icon. Set only when Stereotype == "primary".</summary>
    public string? CaptionPath { get; init; }

    public string? LeadingPath { get; init; }

    /// <summary>Inline editing (class-level [InlineEditing] on the crud): the cell renders an
    /// in-place editor and each commit dispatches the crud's update-row action.</summary>
    public bool Editable { get; init; }

    /// <summary>Editor widget when Editable: select|boolean|integer|number|date|datetime|text.</summary>
    public string? EditorType { get; init; }

    /// <summary>Options of a select editor (enum constants); null otherwise.</summary>
    public IReadOnlyList<OptionDto>? EditorOptions { get; init; }

    /// <summary>The [Aggregate] function of the column — sum|avg|min|max|count — computed over
    /// the WHOLE filtered result set and shown in the listing's totals footer (and per group).
    /// Null on non-aggregated columns (mirrors GridColumnDto.aggregate).</summary>
    public string? Aggregate { get; init; }

    /// <summary>Action dispatched when the cell is clicked — the listing's first column carries
    /// "view" when rows are clickable (navigable/editable listings); null on plain columns
    /// (mirrors GridColumnDto.actionId).</summary>
    public string? ActionId { get; init; }

    /// <summary>The row field whose text the cell shows on hover ([Tooltip("otherField")] on the
    /// row property); null when the column declares none (mirrors GridColumnDto.tooltipPath).</summary>
    public string? TooltipPath { get; init; }

    /// <summary>The column sizes to its content (Java: true unless a fixed width is set).</summary>
    public bool AutoWidth { get; init; }

    /// <summary>A fixed CSS width (e.g. the "3rem" of a grid field's Edit column).</summary>
    public string? Width { get; init; }

    /// <summary>The static text of a button column ("Edit").</summary>
    public string? Text { get; init; }

    /// <summary>A status column's badge tone per VALUE (success | warning | danger | info | neutral),
    /// from the column's field type; omitted when it declares none. (Mirrors GridColumnDto.tones.)</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyDictionary<string, string>? Tones { get; init; }

    /// <summary>What each raw value of the column reads as — an enum column's labels ([Label], else
    /// the humanized name), the same as its options. Display only: rows keep the raw value. Omitted
    /// for any other column. (Mirrors GridColumnDto.valueLabels.)</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyDictionary<string, string>? ValueLabels { get; init; }
}

public record TriggerDto(string Type, string ActionId);
