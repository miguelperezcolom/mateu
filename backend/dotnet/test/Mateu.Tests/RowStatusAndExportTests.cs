using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror Java's RowStatusSyncTest / CrudExportToolbarSyncTest) ──

public enum RsTone { success, warning, danger }

public class RsReservationRow
{
    public string Id { get; set; } = "";
    public string Guest { get; set; } = "";
    [RowStatus] public RsTone Tone { get; set; }
}

public class RsPlainRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("rs-toned"), Title("Toned")]
public class RsToned : IListing<RsReservationRow>
{
    public ListingData<RsReservationRow> Search(SearchRequest request) => ListingData.From(
        new List<RsReservationRow> { new() { Id = "r1", Guest = "Ana", Tone = RsTone.warning } });
}

[UI("rs-plain"), Title("Plain")]
public class RsPlain : IListing<RsPlainRow>
{
    public ListingData<RsPlainRow> Search(SearchRequest request) =>
        ListingData.From(new List<RsPlainRow> { new() { Id = "p1", Name = "x" } });
}

/// <summary>A full Crud whose rows carry a [RowStatus] — the crud path emits it too.</summary>
[UI("rs-toned-crud"), Title("Toned crud")]
public class RsTonedCrud : Crud<RsReservationRow>
{
    public override IEnumerable<RsReservationRow> Fetch(string? search) =>
        [new() { Id = "r1", Guest = "Ana", Tone = RsTone.danger }];
}

[UI("rs-guests-export"), Title("Guests")]
public class RsGuestsExport : Crud<RsPlainRow>
{
    public override bool CsvExportable => true;

    public override IEnumerable<RsPlainRow> Fetch(string? search) =>
        new List<RsPlainRow> { new() { Id = "1", Name = "Ana" }, new() { Id = "2", Name = "Luis, Jr." } }
            .Where(r => string.IsNullOrEmpty(search) || r.Name.Contains(search));
}

[UI("rs-guests-no-export"), Title("Guests")]
public class RsGuestsNoExport : Crud<RsPlainRow>
{
    public override IEnumerable<RsPlainRow> Fetch(string? search) => [new() { Id = "1", Name = "Ana" }];
}

/// <summary>Row tones ([RowStatus] → CrudMetadataDto.RowStatusField) and the CSV export button on
/// a Crud (Crud.CsvExportable → "Export CSV" / export-csv → DownloadFile).</summary>
public class RowStatusAndExportTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(RsToned).Assembly));

    private static JsonElement Sync(Type view) => JsonSerializer.SerializeToElement(
        Handler().Handle(new RunActionRqDto { ServerSideType = view.FullName }), Json);

    private static JsonElement Crud(Type view) => Objects(Sync(view))
        .First(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == "Crud");

    [Fact]
    public void The_row_status_field_travels_on_the_listing()
    {
        Assert.Equal("tone", Crud(typeof(RsToned)).GetProperty("rowStatusField").GetString());
    }

    [Fact]
    public void A_row_without_row_status_has_none()
    {
        Assert.Equal(JsonValueKind.Null, Crud(typeof(RsPlain)).GetProperty("rowStatusField").ValueKind);
    }

    [Fact]
    public void The_crud_listing_carries_the_row_status_field_too()
    {
        Assert.Equal("tone", Crud(typeof(RsTonedCrud)).GetProperty("rowStatusField").GetString());
    }

    [Fact]
    public void An_exportable_crud_offers_the_export_button_and_exports()
    {
        var toolbar = Crud(typeof(RsGuestsExport)).GetProperty("toolbar").EnumerateArray()
            .Select(b => b.GetProperty("actionId").GetString()).ToList();
        Assert.Contains("export-csv", toolbar);

        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "rs-guests-export",
            ActionId = "export-csv",
            ServerSideType = typeof(RsGuestsExport).FullName,
            InitiatorComponentId = "c1",
        });
        var command = Assert.Single(inc.Commands);
        Assert.Equal("DownloadFile", command.Type);
        var data = JsonSerializer.SerializeToElement(command.Data, Json);
        Assert.Equal("export.csv", data.GetProperty("filename").GetString());
        Assert.Equal("text/csv", data.GetProperty("mimeType").GetString());
        var csv = Encoding.UTF8.GetString(Convert.FromBase64String(data.GetProperty("base64Content").GetString()!));
        Assert.Equal("Id,Name\n1,Ana\n2,\"Luis, Jr.\"\n", csv);
    }

    [Fact]
    public void A_crud_that_is_not_exportable_offers_no_export_and_refuses_it()
    {
        var toolbar = Crud(typeof(RsGuestsNoExport)).GetProperty("toolbar").EnumerateArray()
            .Select(b => b.GetProperty("actionId").GetString()).ToList();
        Assert.DoesNotContain("export-csv", toolbar);
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "rs-guests-no-export",
            ActionId = "export-csv",
            ServerSideType = typeof(RsGuestsNoExport).FullName,
            InitiatorComponentId = "c1",
        });
        Assert.DoesNotContain(inc.Commands, c => c.Type == "DownloadFile");
    }

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
