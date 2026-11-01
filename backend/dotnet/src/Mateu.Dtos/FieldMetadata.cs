using System.Text.Json.Serialization;

namespace Mateu.Dtos;

public record FormFieldMetadataDto(string FieldId, string DataType, string Label) : ComponentMetadataDto
{
    public string Stereotype { get; init; } = "regular";
    public bool TreeLeavesOnly { get; init; }
    public bool Required { get; init; }
    public bool ReadOnly { get; init; }
    public int Colspan { get; init; } = 1;

    /// <summary>Number of columns the options widget lays out in (mirrors Java's
    /// FormFieldDto.optionsColumns). 1 by default.</summary>
    public int OptionsColumns { get; init; } = 1;

    /// <summary>Upper bound for a slider-stereotype field (mirrors Java's FormFieldDto.sliderMax).
    /// 100 by default.</summary>
    public int SliderMax { get; init; } = 100;

    /// <summary>Whether an integer field shows the +/- step buttons (mirrors Java's
    /// FormFieldDto.stepButtonsVisible). True for integer fields.</summary>
    public bool StepButtonsVisible { get; init; }

    /// <summary>Lower bound for a slider-stereotype field (mirrors Java's FormFieldDto.sliderMin;
    /// [SliderMin]). 0 by default.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int SliderMin { get; init; }

    /// <summary>The field's help text ([Help]; mirrors Java's FormFieldDto.description, from
    /// @Help): shown under / next to the control and as its accessible description.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Description { get; init; }

    /// <summary>Hint shown inside the empty control (mirrors FormFieldDto.placeholder; a fluent
    /// FormField's Placeholder, as in Java).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Placeholder { get; init; }

    /// <summary>The control takes the focus when rendered (mirrors FormFieldDto.autofocus).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public bool Autofocus { get; init; }

    /// <summary>The increment of a number / slider control; 0 = the control's own (mirrors
    /// FormFieldDto.step).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public double Step { get; init; }

    public object? InitialValue { get; init; }
    public IReadOnlyList<OptionDto> Options { get; init; } = [];
    public bool Multiline { get; init; }
    /// <summary>Property-list sections ([Section(PropertyList = true)]): render as a read-only row
    /// with the label aligned left and the plain-text value aligned right, divider between rows.</summary>
    public bool PropertyRow { get; init; }
    /// <summary>Navigation link rendered as an icon at the right side of this field; null = no link.</summary>
    public NavLinkDto? Link { get; init; }

    /// <summary>Where a lookup (remote combo) field searches its options: the renderer fires
    /// Action with {searchText, page, size} and expects a page of options back. Null on
    /// non-lookup fields.</summary>
    public RemoteCoordinatesDto? RemoteCoordinates { get; init; }

    /// <summary>Options fetched CLIENT-SIDE from an arbitrary (non-Mateu) REST endpoint
    /// ([RestOptions]); the renderer calls the URL directly and maps the JSON into the select's
    /// options. Null on fields without an external source.</summary>
    public RestDataSourceDto? OptionsSource { get; init; }

    /// <summary>Grid (list-of-rows) fields: one GridColumn per row-type property. Null on
    /// non-grid fields.</summary>
    public IReadOnlyList<GridColumnDto>? Columns { get; init; }

    /// <summary>Grid fields: the row-identity path ("_rowNumber" — rows are identified by
    /// position).</summary>
    public string? ItemIdPath { get; init; }

    /// <summary>Grid fields: action dispatched when the user selects (clicks) a row, carrying
    /// the row as the _clickedRow parameter ([OnRowSelected]).</summary>
    public string? OnItemSelectionActionId { get; init; }

    /// <summary>Grid fields: keyboard base combo for selecting a row by position.</summary>
    public string? RowSelectionShortcut { get; init; }

    /// <summary>Grid fields: cells edit in place ([InlineEditing]) instead of through the row detail
    /// form (mirrors FormFieldDto.inlineEditing).</summary>
    public bool InlineEditing { get; init; }

    /// <summary>The field's own CSS (mirrors FormFieldDto.style; grids default to
    /// "min-width: 10rem; width: 100%;").</summary>
    public string? Style { get; init; }

    /// <summary>Grid fields: where the row detail form opens (right | bottom…), its column count and
    /// the grid's minimum height while it is open (mirrors FormFieldDto.formPosition/formColumns/
    /// minHeightWhenDetailVisible).</summary>
    public string? FormPosition { get; init; }

    public int FormColumns { get; init; }

    public string? MinHeightWhenDetailVisible { get; init; }

    /// <summary>Generic field attributes (mirrors FormFieldDto.attributes, a list of key/value
    /// pairs) — e.g. the [FileUpload] accept filter travels as {"key":"accept","value":".csv"}.</summary>
    public IReadOnlyList<PairDto> Attributes { get; init; } = [];
}

/// <summary>A generic key/value pair (mirrors io.mateu.dtos.PairDto).</summary>
public record PairDto(string Key, object? Value);

/// <summary>Coordinates of a remote data source (mirrors io.mateu.dtos.RemoteCoordinatesDto);
/// only Action is set for same-backend lookups.</summary>
public record RemoteCoordinatesDto(string Action)
{
    public string? BaseUrl { get; init; }
    public string? Route { get; init; }
    public Dictionary<string, object?>? Params { get; init; }
}

/// <summary>Descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE (mirrors
/// io.mateu.dtos.RestDataSourceDto): the renderer fetches the URL directly, navigates ItemsPath to
/// the response array and maps each item via ValuePath/LabelPath. Url/Headers/Body support
/// ${state.x} interpolation.</summary>
public record RestDataSourceDto(string Url)
{
    public string? Method { get; init; }

    /// <summary>The request headers — read by the SERVER for a proxied fetch. On the wire they are
    /// written only for a direct (browser) source: a proxied one is called from the server's own
    /// table, and its headers are where an API key gets written (mirrors Java's
    /// RestDataSource.forTheClient).</summary>
    [JsonIgnore]
    public Dictionary<string, string>? Headers { get; init; }

    /// <summary>The body template — like <see cref="Headers"/>, kept off the wire when proxied.</summary>
    [JsonIgnore]
    public string? Body { get; init; }

    [JsonInclude]
    [JsonPropertyName("headers")]
    private Dictionary<string, string>? WireHeaders
    {
        get => Proxy ? null : Headers;
        init => Headers = value;
    }

    [JsonInclude]
    [JsonPropertyName("body")]
    private string? WireBody
    {
        get => Proxy ? null : Body;
        init => Body = value;
    }

    public string? ItemsPath { get; init; }
    public string? ValuePath { get; init; }
    public string? LabelPath { get; init; }

    /// <summary>Fetch through the Mateu SERVER (proxy mode) instead of directly from the browser:
    /// no CORS, and ${secret.X} auth is injected server-side. The renderer dispatches the reserved
    /// __restfetch__ action instead of a direct fetch. Default false (client-direct).</summary>
    public bool Proxy { get; init; }

    /// <summary>The name of a catalogue entry to take the endpoint from; null/blank means this
    /// descriptor is inline (carries its own Url). The <c>data: countries</c> shorthand in
    /// routes.yaml produces a ref-only descriptor. The renderer resolves it against the catalogue on
    /// AppMetadataDto.RestSources; the server resolves it only for a proxied fetch. (Mirrors
    /// io.mateu.dtos.RestDataSourceDto.ref.)</summary>
    public string? Ref { get; init; }

    /// <summary>SAMPLE data answered instead of calling the endpoint, in sample mode only; absent
    /// (omitted from the JSON) when there is none. (Mirrors io.mateu.dtos.RestDataSourceDto.sample.)</summary>
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public object? Sample { get; init; }

    /// <summary>A descriptor that only names a catalogue entry — the <c>data: countries</c>
    /// shorthand (empty Url, Ref set).</summary>
    public static RestDataSourceDto FromRef(string name) => new("") { Ref = name };
}
