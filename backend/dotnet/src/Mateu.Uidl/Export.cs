using System.Globalization;
using System.Reflection;

namespace Mateu.Uidl;

/// <summary>A column of a listing export: the row PROPERTY it reads and the header label.
/// (C# analogue of Java's io.mateu.uidl.data.ExportColumn.)</summary>
public sealed record ExportColumn(string Field, string Label)
{
    /// <summary>The raw value of this column on <paramref name="row"/> (null when the row has no
    /// such property).</summary>
    public object? ValueOf(object? row) =>
        row?.GetType().GetProperty(Field, BindingFlags.Public | BindingFlags.Instance)?.GetValue(row);

    /// <summary>The value as export text: invariant culture, ISO dates, enum names.</summary>
    public string TextOf(object? row) => ValueOf(row) switch
    {
        null => "",
        DateOnly d => d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        DateTime dt => dt.ToString("yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture),
        bool b => b ? "true" : "false",
        IFormattable f => f.ToString(null, CultureInfo.InvariantCulture),
        var v => v.ToString() ?? "",
    };
}

/// <summary>The export opt-ins of a listing (Crud implements it): each flag adds its toolbar button
/// and makes the server answer its export-* action.</summary>
public interface ICrudExports
{
    bool CsvExportable { get; }
    bool ExcelExportable { get; }
    bool PdfExportable { get; }
}

/// <summary>Renders a listing's rows as CSV. Register one as a service to replace the built-in
/// writer. (C# analogue of Java's CsvExporter.)</summary>
public interface ICsvExporter
{
    byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns);
}

/// <summary>Renders a listing's rows as an Excel workbook (.xlsx). Register one as a service to
/// replace the built-in, dependency-free writer (e.g. to add formatting with your spreadsheet
/// library of choice). (C# analogue of Java's ExcelExporter.)</summary>
public interface IExcelExporter
{
    byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns);
}

/// <summary>Renders a listing's rows as a PDF document. Register one as a service to replace the
/// built-in, dependency-free writer (a paginated table in Helvetica). (C# analogue of Java's
/// PdfExporter.)</summary>
public interface IPdfExporter
{
    byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns);
}
