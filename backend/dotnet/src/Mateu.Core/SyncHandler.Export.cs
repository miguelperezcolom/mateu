using Mateu.Core.Export;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Listing export: export-csv / export-excel / export-pdf (Java: ExportActionRunner + the CsvExporter /
// ExcelExporter / PdfExporter ports).
public sealed partial class SyncHandler
{
    /// <summary>The exporters behind export-csv / export-excel / export-pdf. Built-in, dependency-free
    /// writers by default; AddMateu swaps in any ICsvExporter / IExcelExporter / IPdfExporter the app
    /// registers as a service.</summary>
    public MateuExporters Exporters { get; init; } = MateuExporters.BuiltIn;

    /// <summary>The export kind an action id names, when the crud opted into it
    /// (Crud.CsvExportable / ExcelExportable / PdfExportable); null otherwise — the id is wire
    /// input, so a crud that does not offer an export never answers it.</summary>
    private static string? ExportKind(object crud, string? actionId) => actionId switch
    {
        "export-csv" when crud is ICrudExports { CsvExportable: true } => "csv",
        "export-excel" when crud is ICrudExports { ExcelExportable: true } => "excel",
        "export-pdf" when crud is ICrudExports { PdfExportable: true } => "pdf",
        _ => null,
    };

    /// <summary>Exports the WHOLE filtered result set (search text + smart-search-bar filters, the
    /// same rows the listing pages through), one column per visible entity property, answered as a
    /// DownloadFile command carrying the file base64-encoded — the same command Java's
    /// ExportActionRunner emits (export.csv / export.xlsx / export.pdf).</summary>
    private UIIncrementDto Export(string kind, object crud, Type element, RunActionRqDto rq)
    {
        var props = ReflectionMapper.EditableProperties(element).ToList();
        var rows = FilteredRows(crud, rq, props);
        var columns = _mapper.ExportColumns(element)
            .Select(c => new ExportColumn(c.Property.Name, c.Label))
            .ToList();
        return Download(kind, rows, columns, rq);
    }

    /// <summary>Exports what a LISTING's search returned for an unpaged request (Java exports any
    /// Listing, not only a Crud): the ListingData content, one column per visible row property.</summary>
    private UIIncrementDto ExportRows(string kind, object? found, Type rowType, RunActionRqDto rq)
    {
        var rows = found?.GetType().GetProperty("Content")?.GetValue(found) is System.Collections.IEnumerable content
            ? content.Cast<object>().ToList()
            : [];
        var columns = _mapper.ExportColumns(rowType)
            .Select(c => new ExportColumn(c.Property.Name, c.Label))
            .ToList();
        return Download(kind, rows, columns, rq);
    }

    private UIIncrementDto Download(string kind, List<object> rows, List<ExportColumn> columns, RunActionRqDto rq)
    {
        var (bytes, filename, mimeType) = kind switch
        {
            "excel" => (Exporters.Excel.Export(rows, columns), "export.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            "pdf" => (Exporters.Pdf.Export(rows, columns), "export.pdf", "application/pdf"),
            _ => (Exporters.Csv.Export(rows, columns), "export.csv", "text/csv"),
        };
        return UIIncrementDto.Of(commands:
        [
            new UICommandDto(Target(rq), "DownloadFile",
                new { filename, mimeType, base64Content = Convert.ToBase64String(bytes) }),
        ]);
    }
}
