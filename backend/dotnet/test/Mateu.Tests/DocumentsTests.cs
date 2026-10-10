using System.Net;
using System.Net.Http.Json;
using System.Text;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

/// <summary>Actions that return documents — mirrors the Java DocumentsSyncTest fixture.</summary>
[UI("documents")]
[Title("Documents")]
public class DocumentsView : IComponentTreeSupplier
{
    public static readonly byte[] Small = Encoding.ASCII.GetBytes("%PDF-1.4 small");
    public static readonly byte[] Large = new byte[400 * 1024];
    public static int LazyCalls;

    public IComponent Component() => new Text("Documents");

    [Action] public Document Preview() => Document.Pdf("folio.pdf", Small);
    [Action] public Document Download() => Document.Attachment("export.csv", "text/csv", Encoding.ASCII.GetBytes("a;b"));
    [Action] public Document Big() => Document.Pdf("report.pdf", Large);
    [Action] public Document LazyOne() => Document.Lazy("lazy.pdf", Document.PdfMediaType, () => { LazyCalls++; return Small; });
    [Action] public Document PrintFolio() => Document.Pdf("folio.pdf", Small).Printed();
    [Action] public object[] WithMessage() => [new Message("Invoice ready"), Document.Pdf("invoice.pdf", Small)];
    [Action] public UICommandDto PrintPage() => UICommandDto.Print();
}

public class DocumentsTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(DocumentsView).Assembly));

    private static UIIncrementDto Run(string actionId, string? baseUrl = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "documents",
            ActionId = actionId,
            ServerSideType = typeof(DocumentsView).FullName,
            InitiatorComponentId = "cmp-1",
        }, baseUrl);

    private static FileDownloadDto TheDownload(UIIncrementDto inc) =>
        Assert.IsType<FileDownloadDto>(Assert.Single(inc.Commands, c => c.Type == "DownloadFile").Data);

    [Fact]
    public void A_small_inline_pdf_travels_base64_in_the_response()
    {
        var inc = Run("preview");
        var file = TheDownload(inc);
        Assert.Equal("folio.pdf", file.Filename);
        Assert.Equal("application/pdf", file.MimeType);
        Assert.Equal("inline", file.Disposition);
        Assert.False(file.Print);
        Assert.Null(file.Url);
        Assert.Equal(DocumentsView.Small, Convert.FromBase64String(file.Base64Content!));
        Assert.Empty(inc.Fragments);
        Assert.Equal("cmp-1", Assert.Single(inc.Commands).TargetComponentId);
    }

    [Fact]
    public void An_attachment_is_downloaded()
    {
        var file = TheDownload(Run("download"));
        Assert.Equal("attachment", file.Disposition);
        Assert.Equal("text/csv", file.MimeType);
    }

    [Fact]
    public void A_large_document_travels_behind_a_single_use_url_under_the_mount()
    {
        var file = TheDownload(Run("big", "http://localhost:5000/hotel"));
        Assert.Null(file.Base64Content);
        Assert.StartsWith("http://localhost:5000/hotel/mateu/v3/documents/", file.Url);
        var url = file.Url!;
        var token = url[(url.LastIndexOf('/') + 1)..];

        var first = DocumentDownloads.Serve(token);
        Assert.Equal(200, first.Status);
        Assert.Equal(DocumentsView.Large, first.Body);
        Assert.Equal("application/pdf", first.Headers["Content-Type"]);
        Assert.Equal("inline; filename=\"report.pdf\"; filename*=UTF-8''report.pdf", first.Headers["Content-Disposition"]);
        Assert.Equal("no-store", first.Headers["Cache-Control"]);
        Assert.Equal("nosniff", first.Headers["X-Content-Type-Options"]);
        Assert.Equal(404, DocumentDownloads.Serve(token).Status);
    }

    [Fact]
    public void A_lazy_document_is_produced_only_when_fetched()
    {
        DocumentsView.LazyCalls = 0;
        var file = TheDownload(Run("lazyOne"));
        Assert.Equal(0, DocumentsView.LazyCalls);
        var url = file.Url!;
        var served = DocumentDownloads.Serve(url[(url.LastIndexOf('/') + 1)..]);
        Assert.Equal(DocumentsView.Small, served.Body);
        Assert.Equal(1, DocumentsView.LazyCalls);
    }

    [Fact]
    public void A_printed_document_asks_the_client_to_print_it()
    {
        var file = TheDownload(Run("printFolio"));
        Assert.Equal("inline", file.Disposition);
        Assert.True(file.Print);
    }

    [Fact]
    public void A_document_rides_with_a_message_and_print_reaches_the_wire()
    {
        var inc = Run("withMessage");
        Assert.Equal("invoice.pdf", TheDownload(inc).Filename);
        Assert.Single(inc.Messages);
        Assert.Contains(Run("printPage").Commands, c => c.Type == "Print" && c.Data is null);
    }

    [Fact]
    public void Tokens_expire_and_the_store_is_bounded()
    {
        var now = DateTimeOffset.Parse("2026-10-10T10:00:00Z");
        var store = new DocumentStore(TimeSpan.FromSeconds(30), () => now);
        var token = store.Park(Document.Pdf("a.pdf", [1, 2, 3]));
        now = now.AddSeconds(31);
        Assert.Equal(404, DocumentDownloads.Serve(token, store).Status);

        var bounded = new DocumentStore(TimeSpan.FromMinutes(5));
        var first = bounded.Park(Document.Pdf("first.pdf", [1]));
        for (var i = 0; i < DocumentStore.MaxEntries; i++) bounded.Park(Document.Pdf(i + ".pdf", [1]));
        Assert.Equal(DocumentStore.MaxEntries, bounded.Count);
        Assert.Null(bounded.Take(first));
        Assert.Equal(404, DocumentDownloads.Serve("../../etc/passwd").Status);
    }

    [Fact]
    public void Content_disposition_and_media_type_are_safe()
    {
        Assert.Equal("attachment; filename=\"Factura _ _.pdf\"; filename*=UTF-8''Factura%20%C3%B1%20%E2%82%AC.pdf",
            DocumentDownloads.ContentDisposition(DocumentDisposition.Attachment, "Factura ñ €.pdf"));
        var hostile = DocumentDownloads.ContentDisposition(DocumentDisposition.Inline, "a\r\nSet-Cookie: x=1\"; b=\\..\\x.pdf");
        Assert.DoesNotContain("\r", hostile);
        Assert.DoesNotContain("\n", hostile);
        Assert.StartsWith("inline; filename=\"a__Set-Cookie: x=1_; b=_.._x.pdf\";", hostile);
        Assert.Equal("_.._etc_passwd", DocumentDownloads.SafeFilename("../../etc/passwd"));
        Assert.Equal("a_gpj.exe", DocumentDownloads.SafeFilename("a‮gpj.exe"));
        Assert.Equal("application/octet-stream", DocumentDownloads.SafeMediaType("text/html\r\nX: 1"));
        Assert.Equal("text/csv; charset=utf-8", DocumentDownloads.SafeMediaType("text/csv; charset=utf-8"));

        var store = new DocumentStore(TimeSpan.FromMinutes(5));
        var html = store.Park(Document.Inline("x.html", "text/html", [1]));
        Assert.Equal("sandbox", DocumentDownloads.Serve(html, store).Headers["Content-Security-Policy"]);
    }

    [Fact]
    public void Document_rules()
    {
        Assert.Throws<ArgumentException>(() => new Document("x", null, null));
        var d = new Document("x", null, [1], print: true);
        Assert.Equal("application/octet-stream", d.MediaType);
        Assert.False(d.Print);
        Assert.Equal(DocumentDisposition.Inline, d.ShowInline().Disposition);
        Assert.False(Document.Pdf("x", [1]).Printed().Downloaded().Print);
    }

}

/// <summary>The ASP.NET endpoint, end to end. In the DevMode collection with the other test that
/// boots a WebApplication: its logger factory becomes Mateu.Core's while it lives.</summary>
[Collection("DevMode")]
public class DocumentsEndpointTests
{
    [Fact]
    public async Task The_mount_serves_a_parked_document_once()
    {
        try { await ServeOnce(); }
        finally { MateuLogging.UseLoggerFactory(null); }
    }

    private static async Task ServeOnce()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(DocumentsView).Assembly);
        await using var app = builder.Build();
        app.MapMateu("hotel");
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address) };

        // the action, over HTTP: a big PDF comes back as a URL under the mount
        var sync = await http.PostAsJsonAsync("/hotel/mateu/v3/sync/documents", new RunActionRqDto
        {
            Route = "documents",
            ActionId = "big",
            ServerSideType = typeof(DocumentsView).FullName,
            InitiatorComponentId = "cmp-1",
        });
        var json = await sync.Content.ReadAsStringAsync();
        var url = System.Text.RegularExpressions.Regex.Match(json, "\"url\":\"([^\"]+)\"").Groups[1].Value;
        Assert.StartsWith(address.TrimEnd('/') + "/hotel/mateu/v3/documents/", url);

        using var first = await http.GetAsync(url);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal("application/pdf", first.Content.Headers.ContentType?.MediaType);
        Assert.Equal("inline", first.Content.Headers.ContentDisposition?.DispositionType);
        Assert.Equal("report.pdf", first.Content.Headers.ContentDisposition?.FileNameStar);
        Assert.True(first.Headers.CacheControl?.NoStore);
        Assert.Equal(DocumentsView.Large.Length, (await first.Content.ReadAsByteArrayAsync()).Length);
        Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync(url)).StatusCode);
    }
}
