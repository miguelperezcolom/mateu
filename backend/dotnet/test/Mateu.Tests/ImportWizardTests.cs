using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Views under test ──────────────────────────────────────────────────────────

public class ImportedProduct
{
    [Required] public string? Name { get; set; }
    public int Units { get; set; }
    public bool Active { get; set; }
}

/// <summary>The guided CSV import wizard (Java: ImportWizardSyncTest's ProductImport).</summary>
[UI("product-import")]
public class ProductImport : ImportWizard<ImportedProduct>
{
    public static List<ImportedProduct>? ImportedRows;

    protected override void ImportRows(List<ImportedProduct> rows) => ImportedRows = [.. rows];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

/// <summary>The ImportWizard&lt;Row&gt; archetype: upload/paste a CSV, auto-map its columns onto
/// the row class (adjustable in an inline-editable grid whose target-field cell is a select fed
/// by the wizard's IOptionsSupplier), review a per-line validation report (conversion failures +
/// DataAnnotations constraints), then import exactly the valid rows. Driven through the same wire
/// the browser uses (the state JSON round-trips between requests), mirroring Java's
/// ImportWizardSyncTest. Port deltas vs Java: the import runs on the validation step's Next
/// (the port's wizards have no @WizardCompletionAction button), and the constraint messages are
/// the DataAnnotations defaults ("The Name field is required.") instead of Java's jakarta-style
/// wording.</summary>
public class ImportWizardTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(ProductImport).Assembly));

    // 3 good rows + 1 missing name ([Required]) + 1 uncoercible units
    private const string Csv =
        "Name,Units,Active\n" +
        "Keyboard,10,true\n" +
        "Mouse,25,false\n" +
        ",5,true\n" +
        "Screen,abc,true\n" +
        "Cable,3,false\n";

    [Fact]
    public void The_wizard_parses_maps_validates_and_imports_only_the_valid_rows()
    {
        ProductImport.ImportedRows = null;
        var first = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(ProductImport).FullName });
        var firstState = StateOf(first);
        Assert.Equal(1, firstState.GetProperty("__step").GetInt32());

        // step 1 → 2: paste the CSV and go next — the mapping auto-detects by name similarity
        var s1 = Wire(firstState, ("pasted", Csv));
        var second = Handler().Handle(Next(s1));
        var secondState = StateOf(second);
        Assert.Equal(2, secondState.GetProperty("__step").GetInt32());
        var mappings = secondState.GetProperty("mappings").EnumerateArray().ToList();
        Assert.Equal(3, mappings.Count);
        Assert.Equal(["Name", "Units", "Active"],
            mappings.Select(m => m.GetProperty("csvColumn").GetString()!).ToArray());
        Assert.Equal(["name", "units", "active"],
            mappings.Select(m => m.GetProperty("targetField").GetString()!).ToArray());
        // the sample column carries the first data row
        Assert.Equal("Keyboard", mappings[0].GetProperty("sample").GetString());

        // step 2 → 3: the validation report counts 3 valid / 2 invalid and details the issues
        var third = Handler().Handle(Next(Wire(secondState)));
        var thirdState = StateOf(third);
        Assert.Equal(3, thirdState.GetProperty("__step").GetInt32());
        Assert.Equal(3, thirdState.GetProperty("validRows").GetInt32());
        Assert.Equal(2, thirdState.GetProperty("invalidRows").GetInt32());
        var issues = thirdState.GetProperty("issues").EnumerateArray().ToList();
        Assert.Equal(2, issues.Count);
        var problems = issues.Select(i => i.GetProperty("problem").GetString()!).ToList();
        Assert.Contains(problems, p => p.Contains("required"));
        Assert.Contains(problems, p => p.Contains("Cannot convert"));

        // validation → result: Next imports exactly the 3 valid rows, typed; the result step
        // shows the counts (the port equivalent of Java's doImport completion action)
        var done = Handler().Handle(Next(Wire(thirdState)));
        Assert.NotNull(ProductImport.ImportedRows);
        Assert.Equal(3, ProductImport.ImportedRows!.Count);
        Assert.Equal(["Keyboard", "Mouse", "Cable"], ProductImport.ImportedRows.Select(p => p.Name!).ToArray());
        Assert.Equal(10, ProductImport.ImportedRows[0].Units);
        Assert.True(ProductImport.ImportedRows[0].Active);
        var doneState = StateOf(done);
        Assert.Equal(4, doneState.GetProperty("__step").GetInt32());
        Assert.Equal(3, doneState.GetProperty("imported").GetInt32());
        Assert.Equal(2, doneState.GetProperty("skipped").GetInt32());

        // Finish on the result step completes with the summary message
        var finished = Handler().Handle(Next(Wire(doneState)));
        Assert.Equal("Imported 3 rows (2 skipped)", Assert.Single(finished.Messages).Text);
    }

    [Fact]
    public void The_target_field_cell_is_an_inline_select_fed_by_the_row_class_field_names()
    {
        var first = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(ProductImport).FullName });
        var second = Handler().Handle(Next(Wire(StateOf(first), ("pasted", Csv))));
        var json = JsonSerializer.Serialize(second, Json);

        Assert.Contains(
            "\"id\":\"targetField\",\"label\":\"Target field\",\"type\":\"GridColumn\"," +
            "\"dataType\":\"string\",\"stereotype\":null,\"editable\":true,\"editorType\":\"select\"",
            json);
        Assert.Contains("{\"value\":\"\",\"label\":\"— skip —\",\"children\":[]}", json);
        Assert.Contains("{\"value\":\"name\",\"label\":\"name\",\"children\":[]}", json);
        Assert.Contains("{\"value\":\"units\",\"label\":\"units\",\"children\":[]}", json);
        Assert.Contains("{\"value\":\"active\",\"label\":\"active\",\"children\":[]}", json);
        // the read-only cells stay display-only
        Assert.Contains(
            "\"id\":\"csvColumn\",\"label\":\"CSV column\",\"type\":\"GridColumn\"," +
            "\"dataType\":\"string\",\"stereotype\":null,\"editable\":false",
            json);
    }

    [Fact]
    public void Edited_mappings_and_semicolon_separated_uploads_are_honoured()
    {
        ProductImport.ImportedRows = null;
        // headers that do NOT match the field names, semicolon-separated, as an uploaded data URI
        var csv = "Producto;Cantidad\nTeclado;4\nRaton;7\n";
        var dataUri = "data:text/csv;name=productos.csv;base64,"
                      + Convert.ToBase64String(Encoding.UTF8.GetBytes(csv));
        var first = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(ProductImport).FullName });
        var second = Handler().Handle(Next(Wire(StateOf(first), ("file", dataUri))));
        var secondState = StateOf(second);
        var mappings = secondState.GetProperty("mappings").EnumerateArray().ToList();
        Assert.Equal(2, mappings.Count);
        // nothing auto-mapped — the user edits the target-field cells in the grid
        Assert.All(mappings, m => Assert.Equal("", m.GetProperty("targetField").GetString()));

        var edited = Wire(secondState, ("mappings", new[]
        {
            new Dictionary<string, object?> { ["csvColumn"] = "Producto", ["sample"] = "Teclado", ["targetField"] = "name" },
            new Dictionary<string, object?> { ["csvColumn"] = "Cantidad", ["sample"] = "4", ["targetField"] = "units" },
        }));
        var third = Handler().Handle(Next(edited));
        var thirdState = StateOf(third);
        Assert.Equal(2, thirdState.GetProperty("validRows").GetInt32());
        Assert.Equal(0, thirdState.GetProperty("invalidRows").GetInt32());

        Handler().Handle(Next(Wire(thirdState)));
        Assert.Equal(["Teclado", "Raton"], ProductImport.ImportedRows!.Select(p => p.Name!).ToArray());
        Assert.Equal([4, 7], ProductImport.ImportedRows!.Select(p => p.Units).ToArray());
    }

    // ── CSV parser unit tests ────────────────────────────────────────────────────

    [Fact]
    public void Csv_parser_handles_quoted_fields_doubled_quotes_embedded_newlines_and_blank_lines()
    {
        var rows = CsvParser.Parse(
            "a,b\n\"1,5\",\"say \"\"hi\"\"\"\r\n\n\"multi\nline\",x\r");
        Assert.Equal(3, rows.Count);
        Assert.Equal(["a", "b"], rows[0]);
        Assert.Equal(["1,5", "say \"hi\""], rows[1]);
        Assert.Equal(["multi\nline", "x"], rows[2]);
    }

    [Fact]
    public void Csv_parser_detects_the_semicolon_separator_on_the_first_line_outside_quotes()
    {
        Assert.Equal(';', CsvParser.DetectSeparator("a;b;c\n1,2;3\n"));
        Assert.Equal(',', CsvParser.DetectSeparator("a,b,c\n"));
        Assert.Equal(',', CsvParser.DetectSeparator("\"a;b\",c\n")); // ; inside quotes ignored
        var rows = CsvParser.Parse("Producto;Cantidad\nTeclado;4\n");
        Assert.Equal(["Producto", "Cantidad"], rows[0]);
        Assert.Equal(["Teclado", "4"], rows[1]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    private static RunActionRqDto Next(Dictionary<string, object?> state) => new()
    {
        ActionId = "next",
        ServerSideType = typeof(ProductImport).FullName,
        ComponentState = state,
    };

    /// <summary>The wizard fragment's initialData — the state the browser would echo back.</summary>
    private static JsonElement StateOf(UIIncrementDto increment)
    {
        var component = (ServerSideComponentDto)increment.Fragments[0].Component!;
        return JsonSerializer.SerializeToElement(component.InitialData, Json);
    }

    /// <summary>JSON round-trips the state (exactly what the browser echoes back), optionally
    /// overriding entries — mirrors Java ImportWizardSyncTest's wire() helper.</summary>
    private static Dictionary<string, object?> Wire(JsonElement state, params (string Key, object? Value)[] overrides)
    {
        var map = state.EnumerateObject()
            .ToDictionary(p => p.Name, p => (object?)p.Value.Clone());
        foreach (var (key, value) in overrides)
            map[key] = JsonSerializer.SerializeToElement(value, Json);
        return map;
    }
}
