using System.Text.Json;
using System.Text.Json.Nodes;

namespace Mateu.AspNetCore.Testing;

/// <summary>A field on a <see cref="MateuScreen"/>. Typing changes the state the screen sends with
/// its next action, as in a browser (an OnValueChange trigger of the screen fires). EXPERIMENTAL (3.0).</summary>
public sealed class MateuField
{
    private readonly MateuScreen _screen;
    private readonly MateuScreen.Frame _frame;
    private readonly JsonObject _node;

    internal MateuField(MateuScreen screen, MateuScreen.Frame frame, JsonObject node)
    {
        _screen = screen;
        _frame = frame;
        _node = node;
    }

    /// <summary>The field id (the property name, camelCase on the wire).</summary>
    public string Id => Json.Str(_node["fieldId"]);

    /// <summary>The label shown next to it.</summary>
    public string Label => Json.Str(_node["label"]);

    /// <summary>The current value, as the wire JSON (null when empty).</summary>
    public JsonNode? Value => _frame.State[Id];

    /// <summary>The current value as text ("" when empty).</summary>
    public string Text => Json.Str(Value);

    /// <summary>The wire data type (string, integer, number, bool, date, money…).</summary>
    public string DataType => Json.Str(_node["dataType"]);

    /// <summary>How it is drawn (regular, select, radio, textarea, plainText…).</summary>
    public string Stereotype => Json.Str(_node["stereotype"]);

    /// <summary>Whether it is read-only.</summary>
    public bool ReadOnly => _node["readOnly"]?.GetValueKind() == JsonValueKind.True;

    /// <summary>Whether it is marked required.</summary>
    public bool Required => _node["required"]?.GetValueKind() == JsonValueKind.True;

    /// <summary>The choices of a select / radio, as (value, label), in order.</summary>
    public IReadOnlyList<(string Value, string Label)> Options =>
        Json.Items(_node["options"]).Select(o => (Json.Str(o?["value"]), Json.Str(o?["label"]))).ToList();

    /// <summary>Types a value (a string, number, bool, enum, list…); refused on a read-only field.</summary>
    public MateuScreen Set(object? value)
    {
        if (ReadOnly) throw new MateuTestException($"Field \"{Id}\" is not editable");
        _frame.State[Id] = Json.ToNode(value);
        _screen.StartGesture();
        foreach (var t in Json.Items(_frame.ServerSide["triggers"]))
        {
            if (!string.Equals(Json.Str(t?["type"]), "OnValueChange", StringComparison.OrdinalIgnoreCase)) continue;
            var property = Json.Str(t?["propertyName"]);
            if (property.Length == 0 || property == Id) _screen.Dispatch(_frame, Json.Str(t?["actionId"]), new JsonObject());
        }
        return _screen;
    }

    /// <inheritdoc />
    public override string ToString() => Id + " = " + Text;
}

/// <summary>A button on a <see cref="MateuScreen"/>. EXPERIMENTAL (3.0).</summary>
public sealed class MateuButton
{
    private readonly MateuScreen _screen;
    private readonly MateuScreen.Frame _frame;
    private readonly JsonObject _node;

    internal MateuButton(MateuScreen screen, MateuScreen.Frame frame, JsonObject node)
    {
        _screen = screen;
        _frame = frame;
        _node = node;
    }

    /// <summary>What it reads.</summary>
    public string Label => Json.Str(_node["label"]);

    /// <summary>The action it runs.</summary>
    public string ActionId => Json.Str(_node["actionId"]) is { Length: > 0 } a ? a : Json.Str(_node["id"]);

    /// <summary>Whether it can be pressed.</summary>
    public bool Enabled => _node["disabled"]?.GetValueKind() != JsonValueKind.True;

    /// <summary>Presses it: runs its action (or follows its route) and applies the answer.</summary>
    public MateuScreen Press()
    {
        if (!Enabled) throw new MateuTestException($"Button \"{this}\" is disabled");
        var route = Json.Str(_node["route"]);
        if (route.Length > 0) return _screen.Navigate(route);
        _screen.StartGesture();
        _screen.Dispatch(_frame, ActionId,
            _node["parameters"] is JsonObject p ? (JsonObject)p.DeepClone() : new JsonObject());
        return _screen;
    }

    /// <inheritdoc />
    public override string ToString() => Label.Length == 0 ? ActionId : $"{Label} ({ActionId})";
}

/// <summary>The listing on a <see cref="MateuScreen"/>: its columns, the rows of the page on show,
/// searching and opening a row. EXPERIMENTAL (3.0).</summary>
public sealed class MateuListing
{
    private readonly MateuScreen _screen;
    private readonly MateuScreen.Frame _frame;
    private readonly JsonObject _crud;

    internal MateuListing(MateuScreen screen, MateuScreen.Frame frame, JsonObject crud)
    {
        _screen = screen;
        _frame = frame;
        _crud = crud;
    }

    private JsonObject Metadata => _crud["metadata"] as JsonObject ?? new JsonObject();

    private IEnumerable<JsonObject> ColumnNodes =>
        Json.Collect(Metadata["columns"], n => Json.Str(n["type"]) == "GridColumn");

    /// <summary>The column ids, in order.</summary>
    public IReadOnlyList<string> Columns => ColumnNodes.Select(c => Json.Str(c["id"])).ToList();

    /// <summary>The column headers, in order.</summary>
    public IReadOnlyList<string> ColumnLabels => ColumnNodes.Select(c => Json.Str(c["label"])).ToList();

    private JsonObject Page
    {
        get
        {
            if (_frame.Data[Json.Str(_crud["id"])]?["page"] is JsonObject own && own["content"] is not null) return own;
            foreach (var (_, v) in _frame.Data)
                if (v?["page"] is JsonObject p && p["content"] is not null) return p;
            return new JsonObject();
        }
    }

    /// <summary>The rows of the page on show.</summary>
    public IReadOnlyList<MateuRow> Rows =>
        Json.Items(Page["content"]).OfType<JsonObject>().Where(r => r["__mateuGroup"] is null)
            .Select((r, i) => new MateuRow(this, i, r)).ToList();

    /// <summary>How many rows match over every page.</summary>
    public long Total => Page["totalElements"] is JsonValue v && v.TryGetValue<long>(out var n) ? n : Rows.Count;

    /// <summary>A row by position (0 = first).</summary>
    public MateuRow Row(int index) =>
        index >= 0 && index < Rows.Count ? Rows[index] : throw new MateuTestException($"The listing shows {Rows.Count} rows, no row {index}");

    /// <summary>The first row with a cell showing <paramref name="text"/>.</summary>
    public MateuRow Row(string text) =>
        Rows.FirstOrDefault(r => r.Values.Any(kv => Json.Str(kv.Value) == text))
        ?? throw new MateuTestException($"No row shows \"{text}\"");

    /// <summary>Types into the search box and searches (from the first page).</summary>
    public MateuScreen Search(string? text)
    {
        _frame.State["searchText"] = text ?? "";
        _frame.State["page"] = 0;
        return RunSearch();
    }

    /// <summary>Sets a filter of the filter bar and searches.</summary>
    public MateuScreen Filter(string filterId, object? value)
    {
        _frame.State[filterId] = Json.ToNode(value);
        _frame.State["page"] = 0;
        return RunSearch();
    }

    /// <summary>Goes to a page of the results (0 = first).</summary>
    public MateuScreen GoToPage(int page)
    {
        _frame.State["page"] = page;
        return RunSearch();
    }

    private MateuScreen RunSearch()
    {
        _frame.SeedSearch();
        _screen.StartGesture();
        _screen.Dispatch(_frame, "search", new JsonObject());
        return _screen;
    }

    private string SelectionKey => (Json.Str(_crud["id"]) is { Length: > 0 } id ? id : "crud") + "_selected_items";

    internal void Select(MateuRow row)
    {
        var selected = _frame.State[SelectionKey] as JsonArray ?? new JsonArray();
        selected.Add(row.Node.DeepClone());
        _frame.State[SelectionKey] = selected;
    }

    internal MateuScreen Open(MateuRow row)
    {
        var rowRoute = Json.Str(Metadata["rowRoute"]);
        if (rowRoute.Length > 0)
        {
            foreach (var (k, v) in row.Values) rowRoute = rowRoute.Replace("${row." + k + "}", Json.Str(v));
            return _screen.Navigate(rowRoute);
        }
        var open = ColumnNodes.Select(c => Json.Str(c["actionId"])).FirstOrDefault(a => a.Length > 0)
                   ?? throw new MateuTestException("The rows of this listing do not open (no rowRoute, no view column)");
        _screen.StartGesture();
        var parameters = (JsonObject)row.Node.DeepClone();
        parameters["_clickedRow"] = row.Node.DeepClone();
        _screen.Dispatch(_frame, open, parameters);
        return _screen;
    }
}

/// <summary>A row of a <see cref="MateuListing"/>. EXPERIMENTAL (3.0).</summary>
public sealed class MateuRow
{
    private readonly MateuListing _listing;

    internal MateuRow(MateuListing listing, int index, JsonObject node)
    {
        _listing = listing;
        Index = index;
        Node = node;
    }

    internal JsonObject Node { get; }

    /// <summary>Its position on the page.</summary>
    public int Index { get; }

    /// <summary>Its values by column id, as the server sent them.</summary>
    public IReadOnlyDictionary<string, JsonNode?> Values => Node.ToDictionary(kv => kv.Key, kv => kv.Value);

    /// <summary>One cell, as text ("" when empty).</summary>
    public string this[string columnId] => Json.Str(Node[columnId]);

    /// <summary>Clicks it: opens the record.</summary>
    public MateuScreen Open() => _listing.Open(this);

    /// <summary>Ticks its selection box (for Delete and the bulk actions).</summary>
    public MateuRow Select()
    {
        _listing.Select(this);
        return this;
    }

    /// <inheritdoc />
    public override string ToString() => Node.ToJsonString();
}
