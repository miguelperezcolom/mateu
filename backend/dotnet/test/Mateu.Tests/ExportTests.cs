using System.Text;
using System.Text.Json;
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

/// <summary>A sample application exporter (Mateu ships no Excel / PDF engine — the app implements
/// IListingExporter with ClosedXML, QuestPDF…). Writes a readable digest of what Mateu handed it.</summary>
public sealed class DigestExporter(ExportFormat format, string? filename = null) : IListingExporter
{
    public ListingExport? Last { get; private set; }

    public ExportFormat Format => format;

    public ExportedFile Export(ListingExport export)
    {
        Last = export;
        var digest = $"{export.Title}: {export.Rows.Count} rows, {string.Join("|", export.Columns.Select(c => c.Label))}";
        return new ExportedFile(Encoding.UTF8.GetBytes(digest), Filename: filename);
    }
}

/// <summary>Listing exports (Java's ExportActionRunner + the ListingExporter port): the toolbar
/// buttons, the DownloadFile command and what the application's exporter receives.</summary>
public class ExportTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler(params IListingExporter[] exporters) =>
        new(new MateuRegistry(typeof(ExGuests).Assembly)) { Exporters = new MateuExporters(exporters) };

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
        var handler = Handler(new DigestExporter(ExportFormat.Excel), new DigestExporter(ExportFormat.Pdf));
        var json = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto { Route = "ex-guests" }), Json);
        var csv = json.IndexOf("\"export-csv\"", StringComparison.Ordinal);
        var excel = json.IndexOf("\"export-excel\"", StringComparison.Ordinal);
        var pdf = json.IndexOf("\"export-pdf\"", StringComparison.Ordinal);
        Assert.True(csv > 0 && excel > csv && pdf > excel);
        Assert.Contains("\"label\":\"Export Excel\"", json);
        Assert.Contains("\"label\":\"Export PDF\"", json);

        var only = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto { Route = "ex-csv-only" }), Json);
        Assert.Contains("export-csv", only);
        Assert.DoesNotContain("export-excel", only);
        Assert.DoesNotContain("export-pdf", only);
    }

    [Fact]
    public void Without_an_exporter_the_Excel_and_PDF_buttons_are_not_offered()
    {
        // Mateu ships no Excel / PDF engine: the crud opts into all three, only CSV (built in) shows
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "ex-guests" }), Json);
        Assert.Contains("export-csv", json);
        Assert.DoesNotContain("export-excel", json);
        Assert.DoesNotContain("export-pdf", json);
        // and a request naming a format nobody writes is a message for the user, not a crash
        var error = Assert.Throws<UserFacingException>(() => Run(Handler(), typeof(ExGuests), "export-excel"));
        Assert.Equal("Export not available", error.Title);
    }

    [Fact]
    public void A_format_the_crud_does_not_offer_is_refused()
    {
        var inc = Run(Handler(new DigestExporter(ExportFormat.Pdf)), typeof(ExCsvOnly), "export-pdf");
        Assert.DoesNotContain(inc.Commands, c => c.Type == "DownloadFile");
    }

    [Fact]
    public void The_exporter_receives_the_title_columns_and_every_filtered_row()
    {
        var excel = new DigestExporter(ExportFormat.Excel);
        var (filename, mime, bytes) = Download(Run(Handler(excel), typeof(ExGuests), "export-excel"));
        // no filename / media type answered: the format's defaults
        Assert.Equal("export.xlsx", filename);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", mime);
        Assert.Equal("Guests: 120 rows, Id|Name|Nights|Vip|Amount", Encoding.UTF8.GetString(bytes));
        var handed = excel.Last!;
        Assert.Equal(ExportFormat.Excel, handed.Format);
        Assert.Equal("Zoë (VIP) 100€", handed.Columns[1].TextOf(handed.Rows[6]));
        Assert.Equal(73.5m, handed.Columns[4].ValueOf(handed.Rows[6]));
    }

    [Fact]
    public void The_exporters_filename_wins_over_the_default()
    {
        var (filename, mime, _) = Download(Run(Handler(new DigestExporter(ExportFormat.Pdf, "guests.pdf")),
            typeof(ExGuests), "export-pdf"));
        Assert.Equal("guests.pdf", filename);
        Assert.Equal("application/pdf", mime);
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
    public void Exporters_registered_as_services_are_picked_up_and_a_csv_one_replaces_the_built_in()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IListingExporter>(new DigestExporter(ExportFormat.Excel));
        services.AddSingleton<IListingExporter>(new DigestExporter(ExportFormat.Csv));
        services.AddMateu(typeof(ExGuests).Assembly);
        var handler = services.BuildServiceProvider().GetRequiredService<SyncHandler>();
        var (_, _, bytes) = Download(Run(handler, typeof(ExGuests), "export-excel"));
        Assert.Equal("Guests: 120 rows, Id|Name|Nights|Vip|Amount", Encoding.UTF8.GetString(bytes));
        Assert.IsType<DigestExporter>(handler.Exporters.For(ExportFormat.Csv));
        Assert.False(handler.Exporters.Offers(ExportFormat.Pdf));
        Assert.IsType<BuiltInCsvExporter>(MateuExporters.BuiltIn.For(ExportFormat.Csv));
    }

    [Fact]
    public void Any_listing_that_opts_in_exports_its_whole_filtered_result_set()
    {
        // Java exports any Listing (Listing.csvExportable & co), not only a Crud.
        var handler = Handler(new DigestExporter(ExportFormat.Pdf));
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
