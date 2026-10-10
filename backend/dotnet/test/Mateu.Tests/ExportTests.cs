using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Core.Export;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

public class ExGuest
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int Nights { get; set; }
    public bool Vip { get; set; }
    public decimal Amount { get; set; }
}

[UI("ex-guests"), Title("Guests")]
public class ExGuests : Crud<ExGuest>
{
    public override bool CsvExportable => true;
    public override bool ExcelExportable => true;
    public override bool PdfExportable => true;

    public static List<ExGuest> All { get; } = Enumerable.Range(1, 120).Select(i => new ExGuest
    {
        Id = i.ToString(), Name = i == 7 ? "Zoë (VIP) 100€" : $"Guest {i}", Nights = i % 5, Vip = i % 2 == 0,
        Amount = i * 10.5m,
    }).ToList();

    public override IEnumerable<ExGuest> Fetch(string? search) =>
        All.Where(g => string.IsNullOrEmpty(search) || g.Name.Contains(search));
}

[UI("ex-csv-only"), Title("Csv only")]
public class ExCsvOnly : Crud<ExGuest>
{
    public override bool CsvExportable => true;
    public override IEnumerable<ExGuest> Fetch(string? search) => ExGuests.All;
}

/// <summary>Listing exports (Java's ExportActionRunner + Csv/Excel/Pdf exporters): the toolbar
/// buttons, the DownloadFile command and the built-in, dependency-free .xlsx and PDF writers.</summary>
public class ExportTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(ExGuests).Assembly));

    private static (string Filename, string MimeType, byte[] Bytes) Download(UIIncrementDto inc)
    {
        var command = Assert.Single(inc.Commands);
        Assert.Equal("DownloadFile", command.Type);
        var data = JsonSerializer.SerializeToElement(command.Data, Json);
        return (data.GetProperty("filename").GetString()!, data.GetProperty("mimeType").GetString()!,
            Convert.FromBase64String(data.GetProperty("base64Content").GetString()!));
    }

    private static UIIncrementDto Run(SyncHandler handler, Type crud, string actionId, string? search = null) =>
        handler.Handle(new RunActionRqDto
        {
            Route = crud == typeof(ExGuests) ? "ex-guests" : "ex-csv-only",
            ActionId = actionId,
            ServerSideType = crud.FullName,
            InitiatorComponentId = "c1",
            ComponentState = search is null ? new() : new() { ["searchText"] = JsonSerializer.SerializeToElement(search) },
        });

    [Fact]
    public void Each_opted_in_format_gets_its_toolbar_button_in_Javas_order()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "ex-guests" }), Json);
        var csv = json.IndexOf("\"export-csv\"", StringComparison.Ordinal);
        var excel = json.IndexOf("\"export-excel\"", StringComparison.Ordinal);
        var pdf = json.IndexOf("\"export-pdf\"", StringComparison.Ordinal);
        Assert.True(csv > 0 && excel > csv && pdf > excel);
        Assert.Contains("\"label\":\"Export Excel\"", json);
        Assert.Contains("\"label\":\"Export PDF\"", json);

        var only = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "ex-csv-only" }), Json);
        Assert.Contains("export-csv", only);
        Assert.DoesNotContain("export-excel", only);
        Assert.DoesNotContain("export-pdf", only);
    }

    [Fact]
    public void A_format_the_crud_does_not_offer_is_refused()
    {
        var inc = Run(Handler(), typeof(ExCsvOnly), "export-pdf");
        Assert.DoesNotContain(inc.Commands, c => c.Type == "DownloadFile");
    }

    [Fact]
    public void Excel_export_is_a_valid_workbook_with_every_filtered_row()
    {
        var (filename, mime, bytes) = Download(Run(Handler(), typeof(ExGuests), "export-excel"));
        Assert.Equal("export.xlsx", filename);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", mime);

        using var zip = new ZipArchive(new MemoryStream(bytes));
        var names = zip.Entries.Select(e => e.FullName).ToHashSet();
        foreach (var part in new[] { "[Content_Types].xml", "_rels/.rels", "xl/workbook.xml",
                     "xl/_rels/workbook.xml.rels", "xl/styles.xml", "xl/worksheets/sheet1.xml" })
        {
            Assert.Contains(part, names);
            using var stream = zip.GetEntry(part)!.Open();
            XDocument.Load(stream); // every part is well-formed XML
        }
        XNamespace ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
        using var sheetStream = zip.GetEntry("xl/worksheets/sheet1.xml")!.Open();
        var sheet = XDocument.Load(sheetStream);
        var rows = sheet.Descendants(ns + "row").ToList();
        Assert.Equal(121, rows.Count); // header + the whole result set, not one page
        Assert.Equal(["Id", "Name", "Nights", "Vip", "Amount"],
            rows[0].Elements(ns + "c").Select(c => c.Value));
        Assert.Equal("1", rows[0].Elements(ns + "c").First().Attribute("s")?.Value); // bold header
        var seven = rows[7].Elements(ns + "c").ToList();
        Assert.Equal("Zoë (VIP) 100€", seven[1].Value);
        Assert.Equal("2", seven[2].Value);
        Assert.Null(seven[2].Attribute("t")); // a number cell
        Assert.Equal("b", seven[3].Attribute("t")?.Value);
        Assert.Equal("73.5", seven[4].Value);
    }

    [Fact]
    public void The_export_honours_the_search_text()
    {
        var (_, _, bytes) = Download(Run(Handler(), typeof(ExGuests), "export-csv", search: "Guest 11"));
        var csv = Encoding.UTF8.GetString(bytes).TrimEnd('\n').Split('\n');
        Assert.Equal("Id,Name,Nights,Vip,Amount", csv[0]);
        Assert.Equal(["11", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
            csv.Skip(1).Select(l => l.Split(',')[0]));
    }

    [Fact]
    public void Pdf_export_is_a_valid_paginated_document()
    {
        var (filename, mime, bytes) = Download(Run(Handler(), typeof(ExGuests), "export-pdf"));
        Assert.Equal("export.pdf", filename);
        Assert.Equal("application/pdf", mime);
        var text = Encoding.Latin1.GetString(bytes);
        Assert.StartsWith("%PDF-1.4", text);
        Assert.EndsWith("%%EOF\n", text);
        Assert.Contains("(Guest 120) Tj", text);
        Assert.Contains("(Zo\\353 \\(VIP\\) 100\\200) Tj", text); // ë, escaped parens, € in WinAnsi
        // 120 rows do not fit one A4 page: several pages, each repeating the bold header
        var pages = text.Split("/Type /Page ").Length - 1;
        Assert.True(pages >= 3, $"{pages} pages");
        Assert.Equal(pages, text.Split("BT /F2 9 Tf 36 550 Td (Id) Tj ET").Length - 1);

        // the cross-reference table points at every object exactly
        var startxref = long.Parse(text[(text.LastIndexOf("startxref\n", StringComparison.Ordinal) + 10)..].Split('\n')[0]);
        Assert.StartsWith("xref\n0 ", text[(int)startxref..]);
        var lines = text[(int)startxref..].Split('\n');
        var count = int.Parse(lines[1].Split(' ')[1]);
        for (var i = 1; i < count; i++)
        {
            var offset = int.Parse(lines[2 + i][..10]);
            Assert.StartsWith($"{i} 0 obj\n", text[offset..]);
        }
        Assert.Contains($"/Size {count} /Root 1 0 R", text);
    }

    [Fact]
    public void Content_stream_lengths_match_their_bytes()
    {
        var bytes = new BuiltInPdfExporter().Export(ExGuests.All.Cast<object>().ToList(),
            [new ExportColumn("Name", "Name")]);
        var text = Encoding.Latin1.GetString(bytes);
        var at = 0;
        while ((at = text.IndexOf("/Length ", at, StringComparison.Ordinal)) >= 0)
        {
            var length = int.Parse(text[(at + 8)..].Split(' ')[0]);
            var start = text.IndexOf("stream\n", at, StringComparison.Ordinal) + 7;
            Assert.Equal("endstream", text.Substring(start + length, 9));
            at = start;
        }
    }

    private sealed class FakeExcel : IExcelExporter
    {
        public byte[] Export(IReadOnlyList<object> rows, IReadOnlyList<ExportColumn> columns) =>
            Encoding.UTF8.GetBytes($"{rows.Count} rows, {string.Join("|", columns.Select(c => c.Label))}");
    }

    [Fact]
    public void A_registered_exporter_replaces_the_built_in_writer()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IExcelExporter, FakeExcel>();
        services.AddMateu(typeof(ExGuests).Assembly);
        var handler = services.BuildServiceProvider().GetRequiredService<SyncHandler>();
        var (_, _, bytes) = Download(Run(handler, typeof(ExGuests), "export-excel"));
        Assert.Equal("120 rows, Id|Name|Nights|Vip|Amount", Encoding.UTF8.GetString(bytes));
        Assert.IsType<BuiltInPdfExporter>(handler.Exporters.Pdf);
    }

    [Fact]
    public void Column_letters_go_past_Z()
    {
        Assert.Equal("A1", BuiltInExcelExporter.Ref(0, 1));
        Assert.Equal("Z3", BuiltInExcelExporter.Ref(25, 3));
        Assert.Equal("AA1", BuiltInExcelExporter.Ref(26, 1));
        Assert.Equal("ZZ1", BuiltInExcelExporter.Ref(701, 1));
        Assert.Equal("AAA1", BuiltInExcelExporter.Ref(702, 1));
    }

    [Fact]
    public void Any_listing_that_opts_in_exports_its_whole_filtered_result_set()
    {
        // Java exports any Listing (Listing.csvExportable & co), not only a Crud.
        var handler = Handler();
        foreach (var (type, route) in new[] { (typeof(ExGuestListing), "ex-guest-listing"), (typeof(ExCapListing), "ex-cap-listing") })
        {
            var render = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto { Route = route }), Json);
            Assert.Contains("\"label\":\"Export CSV\",\"actionId\":\"export-csv\"", render);
            Assert.DoesNotContain("export-pdf", render);
            var (filename, _, bytes) = Download(handler.Handle(new RunActionRqDto
            {
                Route = route, ActionId = "export-csv", ServerSideType = type.FullName, InitiatorComponentId = "c1",
                ComponentState = new() { ["searchText"] = JsonSerializer.SerializeToElement("Guest 1"), ["size"] = JsonSerializer.SerializeToElement(10) },
            }));
            Assert.Equal("export.csv", filename);
            var lines = Encoding.UTF8.GetString(bytes).Trim().Split('\n');
            // header + every match (Guest 1, 10-19, 100-120 = 32), not just the first page of 10
            Assert.Equal(33, lines.Length);
            // a format the listing did not opt into is refused
            var pdf = handler.Handle(new RunActionRqDto
            {
                Route = route, ActionId = "export-pdf", ServerSideType = type.FullName, InitiatorComponentId = "c1",
            });
            Assert.DoesNotContain(pdf.Commands, c => c.Type == "DownloadFile");
        }
    }
}

public class ExGuestListingFilters { }

[UI("ex-guest-listing"), Title("Guest listing")]
public class ExGuestListing : Listing<ExGuestListingFilters, ExGuest>
{
    public override bool CsvExportable => true;

    public override ListingData<ExGuest> Search(SearchRequest request) =>
        ListingData.From(ExGuests.All.Where(g => g.Name.Contains(request.SearchText ?? "")).ToList());
}

[UI("ex-cap-listing"), Title("Guest capability listing")]
public class ExCapListing : IListing<ExGuest>, Mateu.Uidl.ISearchable, INavigable<ExGuest, string>, ICrudExports
{
    public bool CsvExportable => true;
    public bool ExcelExportable => false;
    public bool PdfExportable => false;

    public ListingData<ExGuest> Search(SearchRequest request) =>
        ListingData.From(ExGuests.All.Where(g => g.Name.Contains(request.SearchText ?? "")).ToList());

    public ExGuest View(string id) => ExGuests.All.First(g => g.Id == id);
}
