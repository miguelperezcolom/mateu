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

/// <summary>A file format a listing can be exported to (Java's <c>io.mateu.uidl.data.ExportFormat</c>).
/// Each has its toolbar button — shown when the listing opts in (<see cref="ICrudExports"/>) AND an
/// <see cref="IListingExporter"/> for the format is registered — and its action id.</summary>
public enum ExportFormat
{
    Csv,
    Excel,
    Pdf,
}

/// <summary>Action ids, button labels and the default filename / media type of each format.</summary>
public static class ExportFormats
{
    /// <summary>The action id the toolbar button dispatches: export-csv | export-excel | export-pdf.</summary>
    public static string ActionId(this ExportFormat format) => "export-" + format.ToString().ToLowerInvariant();

    /// <summary>The toolbar button's label.</summary>
    public static string ButtonLabel(this ExportFormat format) => format switch
    {
        ExportFormat.Excel => "Export Excel",
        ExportFormat.Pdf => "Export PDF",
        _ => "Export CSV",
    };

    /// <summary>The filename used when the exporter answers none.</summary>
    public static string DefaultFilename(this ExportFormat format) => format switch
    {
        ExportFormat.Excel => "export.xlsx",
        ExportFormat.Pdf => "export.pdf",
        _ => "export.csv",
    };

    /// <summary>The media type used when the exporter answers none.</summary>
    public static string DefaultMediaType(this ExportFormat format) => format switch
    {
        ExportFormat.Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ExportFormat.Pdf => "application/pdf",
        _ => "text/csv",
    };
}

/// <summary>What Mateu hands an <see cref="IListingExporter"/>: everything the Export button decided,
/// so the exporter only writes the file. <paramref name="Rows"/> is the WHOLE filtered result set
/// (the same search text and filters as the listing on screen, not just the page); read a cell with
/// <see cref="ExportColumn.ValueOf"/> / <see cref="ExportColumn.TextOf"/>.</summary>
public sealed record ListingExport(
    ExportFormat Format,
    string? Title,
    IReadOnlyList<ExportColumn> Columns,
    IReadOnlyList<object> Rows,
    string? SearchText);

/// <summary>The file an <see cref="IListingExporter"/> produced; Mateu delivers it as a download. A
/// null media type / filename takes the format's default.</summary>
public sealed record ExportedFile(byte[] Content, string? MediaType = null, string? Filename = null);

/// <summary>The port that WRITES a listing export file (Java's
/// <c>io.mateu.uidl.interfaces.ListingExporter</c>). Mateu ships the UI of exporting — the Export
/// buttons, which columns, rows and filters are exported, and the download — but <b>no spreadsheet or
/// PDF engine</b>: the application implements this interface with the library of its choice
/// (ClosedXML, QuestPDF, …) and registers it as a service, one per <see cref="ExportFormat"/>.
/// <para>A listing's Excel / PDF button is shown only while an exporter for that format is
/// registered. CSV is the one exception: Mateu.Core carries a dependency-free CSV writer, which an
/// application exporter for <see cref="ExportFormat.Csv"/> replaces.</para></summary>
public interface IListingExporter
{
    /// <summary>The format this exporter writes.</summary>
    ExportFormat Format { get; }

    /// <summary>Writes the export file from the columns and rows Mateu decided on.</summary>
    ExportedFile Export(ListingExport export);
}
