using Mateu.Core.Export;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Listing export: export-csv / export-excel / export-pdf (Java: ExportActionRunner + the
// ListingExporter port).
public sealed partial class SyncHandler
{
    private MateuExporters _exporters = MateuExporters.BuiltIn;

    /// <summary>The exporters behind export-csv / export-excel / export-pdf: the built-in CSV writer
    /// plus whatever IListingExporter services the app registers (AddMateu collects them). Mateu ships
    /// no Excel / PDF engine, so those buttons only show while an exporter for them exists.</summary>
    public MateuExporters Exporters
    {
        get => _exporters;
        init
        {
            _exporters = value;
            _mapper.ExportOffered = value.Offers;
        }
    }

    /// <summary>The export format an action id names, when the crud opted into it
    /// (Crud.CsvExportable / ExcelExportable / PdfExportable); null otherwise — the id is wire
    /// input, so a crud that does not offer an export never answers it.</summary>
    private static ExportFormat? ExportKind(object crud, string? actionId) => actionId switch
    {
        "export-csv" when crud is ICrudExports { CsvExportable: true } => ExportFormat.Csv,
        "export-excel" when crud is ICrudExports { ExcelExportable: true } => ExportFormat.Excel,
        "export-pdf" when crud is ICrudExports { PdfExportable: true } => ExportFormat.Pdf,
        _ => null,
    };

    /// <summary>Exports the WHOLE filtered result set (search text + smart-search-bar filters, the
    /// same rows the listing pages through), one column per visible entity property, answered as a
    /// DownloadFile command carrying the file base64-encoded — the same command Java's
    /// ExportActionRunner emits (export.csv / export.xlsx / export.pdf).</summary>
    private UIIncrementDto Export(ExportFormat kind, object crud, Type element, RunActionRqDto rq)
    {
        var props = ReflectionMapper.EditableProperties(element).ToList();
        var rows = FilteredRows(crud, rq, props);
        var columns = _mapper.ExportColumns(element)
            .Select(c => new ExportColumn(c.Property.Name, c.Label))
            .ToList();
        return Download(kind, Title(crud.GetType()), rows, columns, rq);
    }

    /// <summary>Exports what a LISTING's search returned for an unpaged request (Java exports any
    /// Listing, not only a Crud): the ListingData content, one column per visible row property.</summary>
    private UIIncrementDto ExportRows(ExportFormat kind, object? found, Type rowType, Type listingType, RunActionRqDto rq)
    {
        var rows = found?.GetType().GetProperty("Content")?.GetValue(found) is System.Collections.IEnumerable content
            ? content.Cast<object>().ToList()
            : [];
        var columns = _mapper.ExportColumns(rowType)
            .Select(c => new ExportColumn(c.Property.Name, c.Label))
            .ToList();
        return Download(kind, Title(listingType), rows, columns, rq);
    }

    private UIIncrementDto Download(ExportFormat format, string? title, List<object> rows,
        List<ExportColumn> columns, RunActionRqDto rq)
    {
        // the button only shows while an exporter exists; a request naming a format nobody writes
        // gets a message, never a 500
        var exporter = Exporters.For(format)
            ?? throw new UserFacingException("Export not available", "This application has no exporter for that format.");
        var file = exporter.Export(new ListingExport(format, title, columns, rows, SearchText(rq)));
        var filename = file.Filename ?? format.DefaultFilename();
        var mimeType = file.MediaType ?? format.DefaultMediaType();
        return UIIncrementDto.Of(commands:
        [
            new UICommandDto(Target(rq), "DownloadFile",
                new { filename, mimeType, base64Content = Convert.ToBase64String(file.Content) }),
        ]);
    }
}
