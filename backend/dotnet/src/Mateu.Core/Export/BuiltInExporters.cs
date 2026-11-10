using System.Text;
using Mateu.Uidl;

namespace Mateu.Core.Export;

/// <summary>The listing exporters a SyncHandler uses for export-csv / export-excel / export-pdf.
/// Mateu ships no spreadsheet or PDF engine: Excel and PDF are offered only when the application
/// registers an <see cref="IListingExporter"/> for them. CSV defaults to the dependency-free
/// <see cref="BuiltInCsvExporter"/>, which an application CSV exporter replaces.</summary>
internal sealed class MateuExporters
{
    /// <summary>The built-in exporters only: CSV.</summary>
    public static readonly MateuExporters BuiltIn = new([]);

    private readonly IReadOnlyList<IListingExporter> _exporters;

    /// <summary>The application's exporters (null entries ignored); the built-in CSV writer fills in
    /// when none of them writes CSV.</summary>
    public MateuExporters(IEnumerable<IListingExporter?> exporters)
    {
        var own = exporters.Where(e => e != null).Cast<IListingExporter>().ToList();
        if (own.All(e => e.Format != ExportFormat.Csv)) own.Add(new BuiltInCsvExporter());
        _exporters = own;
    }

    /// <summary>The exporter for <paramref name="format"/>, or null when none is registered.</summary>
    public IListingExporter? For(ExportFormat format) => _exporters.FirstOrDefault(e => e.Format == format);

    /// <summary>Whether some exporter writes <paramref name="format"/> (its button may show).</summary>
    public bool Offers(ExportFormat format) => For(format) != null;
}

/// <summary>RFC 4180-ish CSV, UTF-8, '\n' line ends (mirrors Java's DefaultCsvExporter).</summary>
public sealed class BuiltInCsvExporter : IListingExporter
{
    public ExportFormat Format => ExportFormat.Csv;

    public ExportedFile Export(ListingExport export) => new(Bytes(export.Rows, export.Columns));

    /// <summary>A value a spreadsheet would run as a formula, prefixed with ' so it stays text (the
    /// cells come from what users typed). A plain number (-12.5, +34) is data and is left alone.</summary>
    private static string Neutralized(string value) =>
        value.Length == 0 || "=+-@\t\r".IndexOf(value[0]) < 0
            || System.Text.RegularExpressions.Regex.IsMatch(value, @"\A[+-]?[0-9]+([.,][0-9]+)?\z")
            ? value
            : "'" + value;

    private static byte[] Bytes(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns)
    {
        static string Escape(string raw)
        {
            var value = Neutralized(raw);
            return value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r')
                ? "\"" + value.Replace("\"", "\"\"") + "\""
                : value;
        }
        var sb = new StringBuilder();
        sb.Append(string.Join(",", columns.Select(c => Escape(c.Label)))).Append('\n');
        foreach (var row in rows)
            sb.Append(string.Join(",", columns.Select(c => Escape(c.TextOf(row))))).Append('\n');
        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
