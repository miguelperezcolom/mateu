using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Reflection;
using System.Text;

namespace Mateu.Uidl;

/// <summary>One row of the import wizard's mapping grid: a CSV column, a sample value from the
/// first data row, and the target row-class field it pours into (TargetField is the only editable
/// cell — an inline select whose options are the row class's assignable field names; blank = skip
/// the column). (C# analogue of Java's ColumnMapping.)</summary>
public class ColumnMapping
{
    [ReadOnly, Label("CSV column")] public string? CsvColumn { get; set; }
    [ReadOnly, Label("Sample")] public string? Sample { get; set; }
    [Label("Target field")] public string? TargetField { get; set; }
}

/// <summary>One problem found while validating a CSV data row in the import wizard.
/// (C# analogue of Java's RowIssue.)</summary>
public class RowIssue
{
    [Label("Line")] public int Line { get; set; }
    [Label("Column")] public string? Column { get; set; }
    [Label("Value")] public string? Value { get; set; }
    [Label("Problem")] public string? Problem { get; set; }
}

/// <summary>
/// Guided CSV import wizard (the C# analogue of Java's <c>ImportWizard&lt;Row&gt;</c> archetype):
/// upload (or paste) a CSV, map its columns onto the row class's properties (auto-mapped by name
/// similarity, adjustable in an inline-editable grid whose target-field cell is a select fed by
/// the wizard's <see cref="IOptionsSupplier"/>), review a validation report (conversion failures
/// + DataAnnotations violations per line), then import the valid rows through
/// <see cref="ImportRows"/>. The result step shows imported/skipped counts.
///
/// <para>Steps: 1 upload → 2 mapping → 3 validation → 4 result. Moving forward computes the next
/// step's content (<see cref="OnNext"/>); the import itself runs on the validation step's Next —
/// the port's wizards have no completion-action button, Next/Finish is the driver.</para>
///
/// <para>Extend it, route it with <c>[UI]</c>, and implement <c>ImportRows</c>:</para>
/// <code>
/// [UI("product-import")]
/// public class ProductImport : ImportWizard&lt;Product&gt;
/// {
///     protected override void ImportRows(List&lt;Product&gt; rows) => rows.ForEach(repository.Save);
/// }
/// </code>
/// </summary>
public abstract class ImportWizard<Row> : Wizard, IOptionsSupplier where Row : new()
{
    [Step(1), FileUpload(".csv"), Label("CSV file")]
    public string? File { get; set; }

    [Step(1), Stereotype("textarea"), Label("...or paste the CSV")]
    public string? Pasted { get; set; }

    [Step(2), InlineEditing, Label("Column mapping")]
    public List<ColumnMapping> Mappings { get; set; } = [];

    [Step(3), PlainText, Label("Valid rows")]
    public int ValidRows { get; set; }

    [Step(3), PlainText, Label("Rows with problems")]
    public int InvalidRows { get; set; }

    [Step(3), ReadOnly, Label("Issues")]
    public List<RowIssue> Issues { get; set; } = [];

    [Step(4), PlainText, Label("Imported")]
    public int Imported { get; set; }

    [Step(4), PlainText, Label("Skipped")]
    public int Skipped { get; set; }

    /// <summary>Receives the valid typed rows when the user confirms the import (Next on the
    /// validation step).</summary>
    protected abstract void ImportRows(List<Row> rows);

    public override Message Complete() => new($"Imported {Imported} rows ({Skipped} skipped)");

    public override void OnNext(int from, int to)
    {
        if (from == 1 && to == 2) PopulateMappings();
        if (from == 2 && to == 3) ValidateRows();
        if (from == 3 && to == 4)
        {
            var (valid, _, invalidCount) = Assemble();
            ImportRows(valid);
            Imported = valid.Count;
            Skipped = invalidCount;
        }
    }

    /// <summary>The mapping grid's target-field select options: "— skip —" plus the row class's
    /// assignable (coercible, writable) property names.</summary>
    public IReadOnlyList<Option> Options(string fieldName)
    {
        if (fieldName != "targetField") return [];
        var options = new List<Option> { new("", "— skip —") };
        options.AddRange(AssignableProperties().Select(p => new Option(CamelCase(p.Name), CamelCase(p.Name))));
        return options;
    }

    /// <summary>Parses the CSV header + first data row and auto-maps columns by name similarity
    /// (exact case-insensitive match first, then containment either way; blank = unmapped).</summary>
    private void PopulateMappings()
    {
        Mappings = [];
        var records = CsvParser.Parse(Content());
        if (records.Count == 0) return;
        var header = records[0];
        var sample = records.Count > 1 ? records[1] : [];
        var targets = AssignableProperties().Select(p => CamelCase(p.Name)).ToList();
        for (var i = 0; i < header.Count; i++)
            Mappings.Add(new ColumnMapping
            {
                CsvColumn = header[i],
                Sample = i < sample.Count ? sample[i] : "",
                TargetField = AutoMap(header[i], targets),
            });
    }

    private static string AutoMap(string column, List<string> targets)
    {
        var normalized = column.Trim().ToLowerInvariant();
        foreach (var target in targets)
            if (target.ToLowerInvariant() == normalized)
                return target;
        foreach (var target in targets)
        {
            var name = target.ToLowerInvariant();
            if (normalized.Length > 0 && (name.Contains(normalized) || normalized.Contains(name)))
                return target;
        }
        return "";
    }

    /// <summary>Re-parses and validates every data row when entering the validation step.</summary>
    private void ValidateRows()
    {
        var (valid, issues, invalidCount) = Assemble();
        ValidRows = valid.Count;
        InvalidRows = invalidCount;
        Issues = issues;
    }

    /// <summary>Builds typed rows from the parsed CSV per the mappings: coerces each cell into the
    /// target property (string/numerics/bool/dates/enum), collects conversion failures, then runs
    /// the standard DataAnnotations validation ([Required], [Range], …) over the built row — the
    /// port's server-side validation surface.</summary>
    private (List<Row> Valid, List<RowIssue> Issues, int InvalidCount) Assemble()
    {
        var valid = new List<Row>();
        var issues = new List<RowIssue>();
        var invalidCount = 0;
        var records = CsvParser.Parse(Content());
        if (records.Count < 2 || Mappings.Count == 0) return (valid, issues, invalidCount);
        var header = records[0];
        for (var r = 1; r < records.Count; r++)
        {
            var line = r + 1; // 1-based, counting the header line
            var record = records[r];
            var rowIssues = new List<RowIssue>();
            var row = new Row();
            foreach (var mapping in Mappings)
            {
                if (string.IsNullOrWhiteSpace(mapping.TargetField)) continue;
                var index = header.IndexOf(mapping.CsvColumn ?? "");
                if (index < 0 || index >= record.Count) continue;
                var raw = record[index];
                if (string.IsNullOrWhiteSpace(raw)) continue; // requiredness → the validation pass
                var property = AssignableProperties()
                    .FirstOrDefault(p => CamelCase(p.Name) == mapping.TargetField);
                if (property is null)
                {
                    rowIssues.Add(new RowIssue
                    {
                        Line = line, Column = mapping.CsvColumn, Value = mapping.TargetField,
                        Problem = "Unknown target field",
                    });
                    continue;
                }
                try
                {
                    property.SetValue(row, Coerce(property.PropertyType, raw.Trim()));
                }
                catch
                {
                    rowIssues.Add(new RowIssue
                    {
                        Line = line, Column = mapping.CsvColumn, Value = raw,
                        Problem = "Cannot convert to " + (Nullable.GetUnderlyingType(property.PropertyType)
                                                          ?? property.PropertyType).Name,
                    });
                }
            }
            rowIssues.AddRange(ValidateConstraints(row, line));
            if (rowIssues.Count == 0)
            {
                valid.Add(row);
            }
            else
            {
                invalidCount++;
                issues.AddRange(rowIssues);
            }
        }
        return (valid, issues, invalidCount);
    }

    /// <summary>DataAnnotations validation over the built row ([Required], [Range], [MinLength]…),
    /// reported per line with the CSV column mapped onto the failing member.</summary>
    private List<RowIssue> ValidateConstraints(Row row, int line)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(row!, new ValidationContext(row!), results, validateAllProperties: true);
        return results.Select(result =>
        {
            var member = result.MemberNames.FirstOrDefault() ?? "";
            var fieldId = CamelCase(member);
            var value = typeof(Row).GetProperty(member)?.GetValue(row);
            return new RowIssue
            {
                Line = line,
                Column = Mappings.FirstOrDefault(m => m.TargetField == fieldId)?.CsvColumn ?? fieldId,
                Value = value?.ToString() ?? "",
                Problem = result.ErrorMessage ?? "Invalid value",
            };
        }).ToList();
    }

    /// <summary>The row-class properties a CSV column can pour into (writable basics, enums and
    /// temporals).</summary>
    private static List<PropertyInfo> AssignableProperties() =>
        typeof(Row).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true } && IsCoercible(p.PropertyType))
            .ToList();

    private static bool IsCoercible(Type type)
    {
        type = Nullable.GetUnderlyingType(type) ?? type;
        return type == typeof(string) || type == typeof(bool)
            || type == typeof(byte) || type == typeof(short) || type == typeof(int) || type == typeof(long)
            || type == typeof(float) || type == typeof(double) || type == typeof(decimal)
            || type == typeof(DateOnly) || type == typeof(DateTime) || type.IsEnum;
    }

    private static object Coerce(Type type, string raw)
    {
        type = Nullable.GetUnderlyingType(type) ?? type;
        if (type == typeof(string)) return raw;
        if (type == typeof(bool)) return bool.Parse(raw);
        if (type == typeof(byte)) return byte.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(short)) return short.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(int)) return int.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(long)) return long.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(float)) return float.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(double)) return double.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(decimal)) return decimal.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(DateOnly)) return DateOnly.Parse(raw, CultureInfo.InvariantCulture);
        if (type == typeof(DateTime)) return DateTime.Parse(raw, CultureInfo.InvariantCulture);
        if (type.IsEnum) return Enum.Parse(type, raw, ignoreCase: true);
        throw new NotSupportedException(type.Name);
    }

    /// <summary>The CSV text: the uploaded file (base64-decoded data URI) when present, else the
    /// pasted text.</summary>
    private string Content()
    {
        if (!string.IsNullOrWhiteSpace(File)) return DecodeDataUri(File!);
        return Pasted ?? "";
    }

    /// <summary>Decodes a data: URI into text (base64 payload after the first comma, UTF-8);
    /// a plain (non-data-URI) value is returned as-is.</summary>
    private static string DecodeDataUri(string value)
    {
        if (!value.StartsWith("data:")) return value;
        var comma = value.IndexOf(',');
        if (comma < 0) return "";
        var meta = value[..comma];
        var payload = value[(comma + 1)..];
        if (meta.Contains(";base64"))
        {
            try
            {
                return Encoding.UTF8.GetString(Convert.FromBase64String(payload));
            }
            catch (FormatException)
            {
                return "";
            }
        }
        return Uri.UnescapeDataString(payload);
    }

    private static string CamelCase(string name) =>
        name.Length == 0 ? name : char.ToLowerInvariant(name[0]) + name[1..];
}

/// <summary>Minimal RFC-4180-ish CSV parser for the import wizard: quoted fields may embed the
/// separator, doubled quotes ("") and newlines; rows end at \n, \r\n or \r. Both , and ; separate
/// fields — the separator is detected by counting the candidates (outside quotes) on the first
/// line. (C# port of Java's CsvParser.)</summary>
public static class CsvParser
{
    /// <summary>Parses the whole content into rows of cells; fully-blank lines are dropped.</summary>
    public static List<List<string>> Parse(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return [];
        var separator = DetectSeparator(content);
        var rows = new List<List<string>>();
        var row = new List<string>();
        var cell = new StringBuilder();
        var inQuotes = false;
        var i = 0;
        var length = content.Length;
        while (i < length)
        {
            var c = content[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < length && content[i + 1] == '"') { cell.Append('"'); i += 2; continue; }
                    inQuotes = false;
                    i++;
                    continue;
                }
                cell.Append(c);
                i++;
                continue;
            }
            if (c == '"') { inQuotes = true; i++; continue; }
            if (c == separator) { row.Add(cell.ToString()); cell.Clear(); i++; continue; }
            if (c is '\r' or '\n')
            {
                row.Add(cell.ToString());
                cell.Clear();
                rows.Add(row);
                row = [];
                if (c == '\r' && i + 1 < length && content[i + 1] == '\n') i++;
                i++;
                continue;
            }
            cell.Append(c);
            i++;
        }
        if (cell.Length > 0 || row.Count > 0)
        {
            row.Add(cell.ToString());
            rows.Add(row);
        }
        rows.RemoveAll(cells => cells.All(string.IsNullOrWhiteSpace));
        return rows;
    }

    /// <summary>The field separator, detected on the first line: ; when it outnumbers , outside
    /// quotes, else ,.</summary>
    public static char DetectSeparator(string content)
    {
        var commas = 0;
        var semicolons = 0;
        var inQuotes = false;
        foreach (var c in content)
        {
            if (c == '"') inQuotes = !inQuotes;
            else if (!inQuotes)
            {
                if (c is '\r' or '\n') break;
                if (c == ',') commas++;
                if (c == ';') semicolons++;
            }
        }
        return semicolons > commas ? ';' : ',';
    }
}
