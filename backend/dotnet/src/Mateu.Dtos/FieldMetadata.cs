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
    public Dictionary<string, string>? Headers { get; init; }
    public string? Body { get; init; }
    public string? ItemsPath { get; init; }
    public string? ValuePath { get; init; }
    public string? LabelPath { get; init; }

    /// <summary>Fetch through the Mateu SERVER (proxy mode) instead of directly from the browser:
    /// no CORS, and ${secret.X} auth is injected server-side. The renderer dispatches the reserved
    /// __restfetch__ action instead of a direct fetch. Default false (client-direct).</summary>
    public bool Proxy { get; init; }

    /// <summary>The name of a catalogue entry to take the endpoint from; null/blank means this
    /// descriptor is inline (carries its own Url). The <c>data: countries</c> shorthand in
    /// routes.yaml produces a ref-only descriptor. (Mirrors io.mateu.dtos.RestDataSourceDto.ref;
    /// the .NET port has no source catalogue yet, so a ref-only descriptor travels on the wire but
    /// is not resolved server-side here.)</summary>
    public string? Ref { get; init; }

    /// <summary>A descriptor that only names a catalogue entry — the <c>data: countries</c>
    /// shorthand (empty Url, Ref set).</summary>
    public static RestDataSourceDto FromRef(string name) => new("") { Ref = name };
}
