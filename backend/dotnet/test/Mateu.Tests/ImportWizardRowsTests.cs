using System.ComponentModel.DataAnnotations;
using System.Text;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// The import wizard's row assembly, driven step by step on the instance (the wire round trip is
/// ImportWizardTests): every coercible column type, the uploaded-file encodings, the CSV dialects
/// a user exports from a spreadsheet, a mapping the user pointed at a column that is not there,
/// and the result message.
/// </summary>
public class ImportWizardRowsTests
{
    public enum Tier { Bronze, Gold }

    public class Everything
    {
        [Required] public string? Code { get; set; }
        public long Big { get; set; }
        public float Ratio { get; set; }
        public double Weight { get; set; }
        public decimal Price { get; set; }
        public DateOnly Day { get; set; }
        public DateTime At { get; set; }
        public TimeOnly Time { get; set; }
        public DateTimeOffset Stamp { get; set; }
        public Guid Key { get; set; }
        public Tier Tier { get; set; }
        public byte Small { get; set; }
        public short Medium { get; set; }
        public int? Maybe { get; set; }
        [Range(0, 10)] public int Score { get; set; }
        public List<string> Tags { get; set; } = []; // not coercible: never a mapping target
        public string Computed => "x"; // read-only: never a mapping target
    }

    public class EverythingImport : ImportWizard<Everything>
    {
        public List<Everything> Rows = [];
        protected override void ImportRows(List<Everything> rows) => Rows = rows;
    }

    private const string Header = "Code,Big,Ratio,Weight,Price,Day,At,Time,Stamp,Key,Tier,Small,Medium,Maybe,Score";
    private const string Good =
        "A-1,9000000000,0.5,1.25,10.99,2026-10-17,2026-10-17T10:30:00,08:15,2026-10-17T10:30:00+02:00,"
        + "6f9619ff-8b86-d011-b42d-00cf4fc964ff,gold,7,300,,4";

    private static EverythingImport Run(string csv, Action<EverythingImport>? adjustMappings = null)
    {
        var wizard = new EverythingImport { Pasted = csv };
        wizard.OnNext(1, 2);
        adjustMappings?.Invoke(wizard);
        wizard.OnNext(2, 3);
        wizard.OnNext(3, 4);
        return wizard;
    }

    [Fact]
    public void Every_coercible_column_type_lands_typed_on_the_row()
    {
        var wizard = Run(Header + "\n" + Good + "\n");
        Assert.Equal(1, wizard.Imported);
        var row = wizard.Rows.Single();
        Assert.Equal(9000000000L, row.Big);
        Assert.Equal(0.5f, row.Ratio);
        Assert.Equal(1.25, row.Weight);
        Assert.Equal(10.99m, row.Price);
        Assert.Equal(new DateOnly(2026, 10, 17), row.Day);
        Assert.Equal(new DateTime(2026, 10, 17, 10, 30, 0), row.At);
        Assert.Equal(new TimeOnly(8, 15), row.Time);
        Assert.Equal(TimeSpan.FromHours(2), row.Stamp.Offset);
        Assert.Equal(Guid.Parse("6f9619ff-8b86-d011-b42d-00cf4fc964ff"), row.Key);
        Assert.Equal(Tier.Gold, row.Tier); // enum names match case-insensitively
        Assert.Equal(7, row.Small);
        Assert.Equal(300, row.Medium);
        Assert.Null(row.Maybe); // a blank cell leaves the property alone
        Assert.Equal("Imported 1 rows (0 skipped)", wizard.Complete().Text);
    }

    [Fact]
    public void A_cell_that_does_not_convert_and_a_violated_constraint_are_reported_on_their_line()
    {
        var bad = Good.Replace(",gold,", ",platinum,").Replace(",4", ",11");
        var wizard = new EverythingImport { Pasted = Header + "\n" + Good + "\n" + bad + "\n" };
        wizard.OnNext(1, 2);
        wizard.OnNext(2, 3);
        Assert.Equal(1, wizard.ValidRows);
        Assert.Equal(1, wizard.InvalidRows);
        Assert.Contains(wizard.Issues, i => i is { Line: 3, Column: "Tier", Value: "platinum", Problem: "Cannot convert to Tier" });
        Assert.Contains(wizard.Issues, i => i.Line == 3 && i.Column == "Score" && i.Value == "11");
    }

    [Fact]
    public void Only_writable_basic_properties_are_offered_as_targets()
    {
        var options = new EverythingImport().Options("targetField").Select(o => o.Value).ToList();
        Assert.Equal("", options[0]); // "— skip —"
        Assert.Contains("big", options);
        Assert.Contains("tier", options);
        Assert.DoesNotContain("tags", options);
        Assert.DoesNotContain("computed", options);
        Assert.Empty(new EverythingImport().Options("other"));
    }

    [Fact]
    public void A_column_maps_by_containment_when_no_name_matches_exactly()
    {
        var wizard = new EverythingImport { Pasted = "Product code;Weight (kg);Notes\nA;1;x\n" };
        wizard.OnNext(1, 2);
        Assert.Equal(["code", "weight", ""], wizard.Mappings.Select(m => m.TargetField!).ToArray());
        Assert.Equal(["A", "1", "x"], wizard.Mappings.Select(m => m.Sample!).ToArray());
    }

    [Fact]
    public void A_header_without_data_rows_maps_with_empty_samples_and_imports_nothing()
    {
        var wizard = Run("Code,Big\n");
        Assert.Equal(["", ""], wizard.Mappings.Select(m => m.Sample!).ToArray());
        Assert.Equal(0, wizard.Imported);
        Assert.Empty(wizard.Rows);
    }

    [Fact]
    public void A_mapping_pointed_at_a_missing_column_or_an_unknown_field_is_handled_per_row()
    {
        var wizard = Run("Code,Big\nA,1\n", w =>
        {
            w.Mappings[1].TargetField = "nonexistent";
            w.Mappings.Add(new ColumnMapping { CsvColumn = "Gone", TargetField = "weight" });
        });
        Assert.Equal(0, wizard.Imported);
        Assert.Equal(1, wizard.Skipped);
        Assert.Contains(wizard.Issues, i => i is { Line: 2, Column: "Big", Value: "nonexistent", Problem: "Unknown target field" });
    }

    [Fact]
    public void A_short_row_skips_the_cells_it_does_not_have()
    {
        var wizard = Run("Code,Big\nA\n");
        Assert.Equal(1, wizard.Imported);
        Assert.Equal(0, wizard.Rows.Single().Big);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void An_uploaded_file_wins_over_the_pasted_text_in_either_data_uri_encoding(bool base64)
    {
        const string csv = "Code,Big\nFILE,2\n";
        var file = base64
            ? "data:text/csv;base64," + Convert.ToBase64String(Encoding.UTF8.GetBytes(csv))
            : "data:text/csv," + Uri.EscapeDataString(csv);
        var wizard = new EverythingImport { File = file, Pasted = "Code\nPASTED\n" };
        wizard.OnNext(1, 2);
        wizard.OnNext(2, 3);
        wizard.OnNext(3, 4);
        Assert.Equal("FILE", wizard.Rows.Single().Code);
    }

    [Theory]
    [InlineData("data:text/csv;base64,@@not-base64@@")]
    [InlineData("data:text/csv")]
    public void An_unreadable_upload_yields_no_mappings(string file)
    {
        var wizard = new EverythingImport { File = file };
        wizard.OnNext(1, 2);
        Assert.Empty(wizard.Mappings);
    }

    [Fact]
    public void A_plain_file_value_is_read_as_the_csv_itself()
    {
        var wizard = new EverythingImport { File = "Code\nX" };
        wizard.OnNext(1, 2);
        Assert.Equal("X", wizard.Mappings.Single().Sample);
    }

    [Fact]
    public void Csv_quotes_embed_separators_quotes_and_newlines_and_the_last_line_needs_no_newline()
    {
        var rows = CsvParser.Parse("a,\"b,c\",\"say \"\"hi\"\"\"\r\n\"multi\nline\",x,y\r\n\r\nlast,1,2");
        Assert.Equal(3, rows.Count);
        Assert.Equal(["a", "b,c", "say \"hi\""], rows[0].ToArray());
        Assert.Equal("multi\nline", rows[1][0]);
        Assert.Equal(["last", "1", "2"], rows[2].ToArray());
        Assert.Empty(CsvParser.Parse("  "));
        Assert.Equal(["x", ""], CsvParser.Parse("x,")[0].ToArray());
    }

    [Fact]
    public void The_step_titles_are_the_four_stages()
    {
        var wizard = new EverythingImport();
        Assert.Equal(["Upload", "Mapping", "Validation", "Result"], Enumerable.Range(1, 4).Select(s => wizard.StepTitle(s)!).ToArray());
        Assert.Null(wizard.StepTitle(0));
        Assert.Null(wizard.StepTitle(5));
    }
}
