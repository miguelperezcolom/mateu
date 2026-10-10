using System.Globalization;
using System.IO.Compression;
using System.Security;
using System.Text;
using Mateu.Uidl;

namespace Mateu.Core.Export;

/// <summary>The exporters a SyncHandler uses for export-csv / export-excel / export-pdf. Each one
/// defaults to a dependency-free built-in writer; an app replaces any of them by registering its own
/// <see cref="ICsvExporter"/> / <see cref="IExcelExporter"/> / <see cref="IPdfExporter"/>.</summary>
public sealed record MateuExporters(ICsvExporter Csv, IExcelExporter Excel, IPdfExporter Pdf)
{
    public static readonly MateuExporters BuiltIn =
        new(new BuiltInCsvExporter(), new BuiltInExcelExporter(), new BuiltInPdfExporter());
}

/// <summary>RFC 4180-ish CSV, UTF-8, '\n' line ends (mirrors Java's DefaultCsvExporter).</summary>
public sealed class BuiltInCsvExporter : ICsvExporter
{
    public byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns)
    {
        static string Escape(string value) =>
            value.Contains(',') || value.Contains('"') || value.Contains('\n')
                ? "\"" + value.Replace("\"", "\"\"") + "\""
                : value;
        var sb = new StringBuilder();
        sb.Append(string.Join(",", columns.Select(c => Escape(c.Label)))).Append('\n');
        foreach (var row in rows)
            sb.Append(string.Join(",", columns.Select(c => Escape(c.TextOf(row))))).Append('\n');
        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}

/// <summary>A minimal, valid Office Open XML workbook (.xlsx) written with System.IO.Compression
/// only — no third-party dependency, so no licence to vet. One sheet, a bold header row, numbers
/// and booleans as typed cells, everything else as inline strings.</summary>
public sealed class BuiltInExcelExporter : IExcelExporter
{
    public byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns)
    {
        using var buffer = new MemoryStream();
        using (var zip = new ZipArchive(buffer, ZipArchiveMode.Create, leaveOpen: true))
        {
            Entry(zip, "[Content_Types].xml",
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                + "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
                + "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
                + "<Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>"
                + "</Types>");
            Entry(zip, "_rels/.rels",
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                + "</Relationships>");
            Entry(zip, "xl/workbook.xml",
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" "
                + "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                + "<sheets><sheet name=\"Export\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>");
            Entry(zip, "xl/_rels/workbook.xml.rels",
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
                + "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>"
                + "</Relationships>");
            // style 0 = normal, style 1 = bold (the header row)
            Entry(zip, "xl/styles.xml",
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
                + "<fonts count=\"2\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font>"
                + "<font><b/><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts>"
                + "<fills count=\"2\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill></fills>"
                + "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>"
                + "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>"
                + "<cellXfs count=\"2\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/>"
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyFont=\"1\"/></cellXfs>"
                + "<cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles>"
                + "</styleSheet>");
            Entry(zip, "xl/worksheets/sheet1.xml", Sheet(rows, columns));
        }
        return buffer.ToArray();
    }

    private static string Sheet(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns)
    {
        var sb = new StringBuilder();
        sb.Append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
            .Append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>");
        sb.Append("<row r=\"1\">");
        for (var c = 0; c < columns.Count; c++)
            sb.Append(InlineString(Ref(c, 1), columns[c].Label, style: 1));
        sb.Append("</row>");
        for (var r = 0; r < rows.Count; r++)
        {
            var rowNumber = r + 2;
            sb.Append("<row r=\"").Append(rowNumber).Append("\">");
            for (var c = 0; c < columns.Count; c++)
            {
                var cell = Ref(c, rowNumber);
                switch (columns[c].ValueOf(rows[r]))
                {
                    case null:
                        break;
                    case bool b:
                        sb.Append("<c r=\"").Append(cell).Append("\" t=\"b\"><v>").Append(b ? 1 : 0).Append("</v></c>");
                        break;
                    case byte or sbyte or short or ushort or int or uint or long or ulong or float or double or decimal:
                        sb.Append("<c r=\"").Append(cell).Append("\"><v>")
                            .Append(Convert.ToString(columns[c].ValueOf(rows[r]), CultureInfo.InvariantCulture))
                            .Append("</v></c>");
                        break;
                    default:
                        sb.Append(InlineString(cell, columns[c].TextOf(rows[r]), style: 0));
                        break;
                }
            }
            sb.Append("</row>");
        }
        sb.Append("</sheetData></worksheet>");
        return sb.ToString();
    }

    private static string InlineString(string cell, string text, int style) =>
        $"<c r=\"{cell}\"{(style > 0 ? $" s=\"{style}\"" : "")} t=\"inlineStr\"><is><t xml:space=\"preserve\">{Xml(text)}</t></is></c>";

    /// <summary>XML-escaped, with the characters XML 1.0 forbids dropped.</summary>
    private static string Xml(string text) =>
        SecurityElement.Escape(new string(text.Where(ch => ch is '\t' or '\n' or '\r' || ch >= ' ').ToArray()));

    /// <summary>The A1 reference of a 0-based column and 1-based row.</summary>
    public static string Ref(int column, int row)
    {
        var name = "";
        for (var n = column + 1; n > 0; n = (n - 1) / 26) name = (char)('A' + (n - 1) % 26) + name;
        return name + row;
    }

    private static void Entry(ZipArchive zip, string name, string content)
    {
        using var writer = new StreamWriter(zip.CreateEntry(name, CompressionLevel.Optimal).Open(), new UTF8Encoding(false));
        writer.Write(content);
    }
}

/// <summary>A minimal, valid PDF 1.4 document written by hand — no third-party dependency. A4
/// landscape pages with the standard Helvetica fonts (no embedding), the header row in bold on
/// every page, equal-width columns with long values cut to fit, and correct cross-reference
/// offsets. Text is WinAnsi-encoded; characters outside it print as '?'.</summary>
public sealed class BuiltInPdfExporter : IPdfExporter
{
    private const float PageWidth = 842, PageHeight = 595, Margin = 36, FontSize = 9, LineHeight = 14;

    public byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns)
    {
        var usable = PageWidth - 2 * Margin;
        var columnWidth = columns.Count == 0 ? usable : usable / columns.Count;
        // Helvetica averages ~0.52 em per glyph: cut each cell to what fits its column
        var maxChars = Math.Max(1, (int)(columnWidth / (FontSize * 0.52f)) - 1);
        var linesPerPage = (int)((PageHeight - 2 * Margin) / LineHeight) - 2; // minus the header
        var pages = new List<string>();
        var index = 0;
        do
        {
            var content = new StringBuilder();
            var y = PageHeight - Margin - FontSize;
            Line(content, "F2", columns.Select(c => c.Label).ToList(), y, columnWidth, maxChars);
            content.Append(Fmt(Margin)).Append(' ').Append(Fmt(y - 4)).Append(" m ")
                .Append(Fmt(PageWidth - Margin)).Append(' ').Append(Fmt(y - 4)).Append(" l 0.5 w S\n");
            y -= LineHeight * 1.5f;
            for (var i = 0; i < linesPerPage && index < rows.Count; i++, index++)
            {
                Line(content, "F1", columns.Select(c => c.TextOf(rows[index])).ToList(), y, columnWidth, maxChars);
                y -= LineHeight;
            }
            pages.Add(content.ToString());
        } while (index < rows.Count);
        return Document(pages);
    }

    private static void Line(StringBuilder content, string font, IReadOnlyList<string> cells, float y,
        float columnWidth, int maxChars)
    {
        for (var c = 0; c < cells.Count; c++)
        {
            var text = cells[c].Replace('\n', ' ').Replace('\r', ' ');
            if (text.Length > maxChars) text = text[..Math.Max(0, maxChars - 1)] + "…";
            content.Append("BT /").Append(font).Append(' ').Append(Fmt(FontSize)).Append(" Tf ")
                .Append(Fmt(Margin + c * columnWidth)).Append(' ').Append(Fmt(y)).Append(" Td (")
                .Append(PdfString(text)).Append(") Tj ET\n");
        }
    }

    private static string Fmt(float value) => value.ToString("0.##", CultureInfo.InvariantCulture);

    /// <summary>A PDF literal string body in WinAnsi: backslash, parentheses escaped; non-encodable
    /// characters → '?'; € and … mapped to their WinAnsi codes, emitted as octal escapes.</summary>
    internal static string PdfString(string text)
    {
        var sb = new StringBuilder();
        foreach (var ch in text)
        {
            int code = ch switch
            {
                '€' => 0x80,
                '…' => 0x85,
                '‘' => 0x91,
                '’' => 0x92,
                '“' => 0x93,
                '”' => 0x94,
                '–' => 0x96,
                '—' => 0x97,
                _ when ch < 0x20 => ' ',
                _ when ch <= 0xFF && (ch < 0x80 || ch > 0x9F) => ch,
                _ => '?',
            };
            if (code is '\\' or '(' or ')') sb.Append('\\').Append((char)code);
            else if (code < 0x80) sb.Append((char)code);
            else sb.Append('\\').Append(Convert.ToString(code, 8).PadLeft(3, '0'));
        }
        return sb.ToString();
    }

    /// <summary>Assembles the objects (catalog, page tree, two fonts, then one page + one content
    /// stream per page) and the cross-reference table with exact byte offsets.</summary>
    private static byte[] Document(IReadOnlyList<string> pageContents)
    {
        var objects = new List<string>();
        var pageIds = Enumerable.Range(0, pageContents.Count).Select(i => 5 + 2 * i).ToList();
        objects.Add("<< /Type /Catalog /Pages 2 0 R >>");
        objects.Add($"<< /Type /Pages /Kids [{string.Join(" ", pageIds.Select(id => $"{id} 0 R"))}] /Count {pageIds.Count} >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
        for (var i = 0; i < pageContents.Count; i++)
        {
            objects.Add($"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {Fmt(PageWidth)} {Fmt(PageHeight)}] "
                        + $"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {pageIds[i] + 1} 0 R >>");
            var stream = pageContents[i];
            objects.Add($"<< /Length {Latin1.GetByteCount(stream)} >>\nstream\n{stream}endstream");
        }

        using var output = new MemoryStream();
        void Write(string s) { var bytes = Latin1.GetBytes(s); output.Write(bytes, 0, bytes.Length); }
        Write("%PDF-1.4\n%âãÏÓ\n");
        var offsets = new List<long>();
        for (var i = 0; i < objects.Count; i++)
        {
            offsets.Add(output.Position);
            Write($"{i + 1} 0 obj\n{objects[i]}\nendobj\n");
        }
        var xref = output.Position;
        var table = new StringBuilder();
        table.Append("xref\n0 ").Append(objects.Count + 1).Append('\n').Append("0000000000 65535 f \n");
        foreach (var offset in offsets) table.Append(offset.ToString("D10", CultureInfo.InvariantCulture)).Append(" 00000 n \n");
        table.Append("trailer\n<< /Size ").Append(objects.Count + 1).Append(" /Root 1 0 R >>\nstartxref\n")
            .Append(xref).Append("\n%%EOF\n");
        Write(table.ToString());
        return output.ToArray();
    }

    private static readonly Encoding Latin1 = Encoding.Latin1;
}
