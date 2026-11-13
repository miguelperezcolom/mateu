using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
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

// Uploads through the IFileStorage port (design/uploads/file-uploads-contract.md).

[UI("uploads-probe"), Title("Uploads probe")]
public class UploadsProbeView
{
    [FileUpload(".pdf,image/*", MaxBytes = 20)]
    public string? Contract { get; set; }

    [FileUpload]
    public List<string> Attachments { get; set; } = [];

    [FileUpload(Storage = "direct")]
    public string? Photo { get; set; }

    [FileUpload, Mateu.Uidl.ReadOnly]
    public string? Signed { get; set; }

    [FileUpload(Storage = "nowhere")]
    public string? Lost { get; set; }

    [FileUpload(".csv", Storage = FileUploadAttribute.Inline)]
    public string? Csv { get; set; }
}

/// <summary>A store that keeps the bytes in memory.</summary>
public sealed class InMemoryFileStorage(string name = "") : IFileStorage
{
    public ConcurrentDictionary<string, byte[]> Files { get; } = new();

    public bool Fail { get; set; }

    public string Name => name;

    public async Task<StoredFile> StoreAsync(IncomingFile file, IncomingRequest request)
    {
        if (Fail) throw new InvalidOperationException("disk full: /var/secret");
        using var buffer = new MemoryStream();
        await file.Content.CopyToAsync(buffer);
        var id = Guid.NewGuid().ToString("N");
        Files[id] = buffer.ToArray();
        return new StoredFile(id, file.Name, file.ContentType, -1, "https://files.example.com/" + id);
    }
}

/// <summary>A store issuing pre-signed targets.</summary>
public sealed class DirectFileStorage : IFileStorage
{
    public string Name => "direct";

    public bool DirectUploads => true;

    public bool IssueNone { get; set; }

    public Task<StoredFile> StoreAsync(IncomingFile file, IncomingRequest request) =>
        Task.FromResult(new StoredFile("streamed", file.Name, file.ContentType, file.Size));

    public Task<UploadTarget?> UploadTargetAsync(UploadRequest upload, IncomingRequest request) =>
        Task.FromResult<UploadTarget?>(IssueNone
            ? null
            : new UploadTarget("https://bucket.example.com/k1?sig=x", null,
                new Dictionary<string, string> { ["x-amz-acl"] = "private" },
                new StoredFile("k1", upload.Name, upload.ContentType, upload.Size)));
}

/// <summary>A store that answers whatever its scenario says: an exception, a header echo, the stream
/// read on another task (so the size limit arrives wrapped in an AggregateException).</summary>
public sealed class ScriptedFileStorage(string name) : IFileStorage
{
    public Func<Exception>? Throw { get; set; }

    public bool ReadOnAnotherTask { get; set; }

    /// <summary>What the store saw of the request (read while it was in flight).</summary>
    public (string? Trace, string? Absent, Identity? Identity) Seen { get; private set; }

    public string Name => name;

    public bool DirectUploads => true;

    public async Task<StoredFile> StoreAsync(IncomingFile file, IncomingRequest request)
    {
        Seen = (request.Header("X-Trace"), request.Header("X-Absent"), request.Identity);
        if (Throw is not null) throw Throw();
        using var buffer = new MemoryStream();
        if (ReadOnAnotherTask) Task.Run(() => file.Content.CopyToAsync(buffer)).Wait();
        else await file.Content.CopyToAsync(buffer);
        return new StoredFile("s1", file.Name, file.ContentType, buffer.Length);
    }

    public Task<UploadTarget?> UploadTargetAsync(UploadRequest upload, IncomingRequest request)
    {
        if (Throw is not null) throw Throw();
        return Task.FromResult<UploadTarget?>(new UploadTarget("https://bucket.example.com/t", "POST", null,
            new StoredFile("t1", upload.Name, upload.ContentType, upload.Size)));
    }
}

public class StoredFileValueTests
{
    [Fact]
    public void A_value_round_trips_with_every_parameter_encoded()
    {
        var file = new StoredFile("a b/1+2", "Ñandú contrato 1+1.pdf", "application/pdf", 1234,
            "https://files.example.com/a b?x=1&y=2");
        var value = file.ToValue();
        Assert.Equal("mateu-file:a%20b%2F1%2B2?name=%C3%91and%C3%BA%20contrato%201%2B1.pdf"
                     + "&type=application%2Fpdf&size=1234&url=https%3A%2F%2Ffiles.example.com%2Fa%20b%3Fx%3D1%26y%3D2",
            value);
        Assert.Equal(file, StoredFile.Parse(value));
    }

    [Fact]
    public void Absent_parameters_are_omitted_and_a_plus_is_a_plus()
    {
        Assert.Equal("mateu-file:x", new StoredFile("x").ToValue());
        Assert.Equal("mateu-file:x?size=0", new StoredFile("x", Size: 0).ToValue());
        Assert.Equal("mateu-file:x?type=text%2Fplain", new StoredFile("x", "", "text/plain", -1, "").ToValue());
        var parsed = StoredFile.Parse("mateu-file:a+b?name=c+d&size=nope")!;
        Assert.Equal("a+b", parsed.Id);
        Assert.Equal("c+d", parsed.Name);
        Assert.Equal(-1, parsed.Size);
        Assert.Null(parsed.ContentType);
        Assert.Null(parsed.Url);
    }

    [Fact]
    public void A_non_reference_value_is_not_a_stored_file()
    {
        Assert.Null(StoredFile.Parse("data:application/pdf;base64,AAAA"));
        Assert.Null(StoredFile.Parse(null));
        Assert.Null(StoredFile.Parse(""));
    }

    [Fact]
    public void Sizes_print_in_1024_units()
    {
        Assert.Equal("20 bytes", FileUploads.SizeText(20));
        Assert.Equal("1 KB", FileUploads.SizeText(1024));
        Assert.Equal("1.5 KB", FileUploads.SizeText(1536));
        Assert.Equal("20 MB", FileUploads.SizeText(20L * 1024 * 1024));
        Assert.Equal("100 MB", FileUploads.SizeText(FileUploads.DefaultMaxBytes));
        Assert.Equal("2 GB", FileUploads.SizeText(2L * 1024 * 1024 * 1024));
    }

    [Fact]
    public void The_accept_rule_matches_extensions_type_prefixes_and_exact_types()
    {
        Assert.True(FileUploads.Accepts("", "x.exe", "application/x-msdownload"));
        Assert.True(FileUploads.Accepts(".pdf, image/*", "Contract.PDF", "application/octet-stream"));
        Assert.True(FileUploads.Accepts(".pdf,image/*", "photo", "image/png"));
        Assert.True(FileUploads.Accepts("application/pdf", "x", "Application/PDF; charset=binary"));
        Assert.False(FileUploads.Accepts(".pdf,image/*", "notes.txt", "text/plain"));
    }

    [Fact]
    public void A_ticket_is_bound_to_its_signature_caller_and_lifetime()
    {
        var uploads = new FileUploads([new InMemoryFileStorage()], "secret");
        var caller = FileUploads.CallerHash("ann", new Identity(Roles: ["b", "a"]));
        Assert.Equal(caller, FileUploads.CallerHash("ann", new Identity(Roles: ["a", "b"])));
        var ticket = uploads.Issue("", "contract", 20, ".pdf", false, caller);
        var granted = uploads.Verify(ticket, caller)!;
        Assert.Equal(("", "contract", 20L, ".pdf", false), (granted.Storage, granted.FieldId, granted.MaxBytes, granted.Accept, granted.Multiple));
        Assert.Null(uploads.Verify(ticket, FileUploads.CallerHash(null, null)));
        Assert.Null(uploads.Verify(ticket, caller, DateTimeOffset.UtcNow.AddHours(9)));
        Assert.Null(new FileUploads([], "another secret").Verify(ticket, caller));
        Assert.Null(uploads.Verify(ticket[..^2] + "AA", caller));
        Assert.Null(uploads.Verify("garbage", caller));
    }
}

/// <summary>The endpoints, end to end over HTTP. In the DevMode collection with the other tests that
/// boot a WebApplication.</summary>
[Collection("DevMode")]
public class FileUploadEndpointTests
{
    private sealed class Running(WebApplication app, HttpClient http) : IAsyncDisposable
    {
        public HttpClient Http { get; } = http;

        public async ValueTask DisposeAsync()
        {
            Http.Dispose();
            await app.StopAsync();
            await app.DisposeAsync();
            MateuLogging.UseLoggerFactory(null);
        }
    }

    private static async Task<Running> Boot(params IFileStorage[] storages)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        foreach (var storage in storages) builder.Services.AddSingleton(storage);
        builder.Services.AddMateu(o =>
        {
            // the caller is whoever the X-Role header says (the test's stand-in for authentication)
            o.Identity = ctx => ctx.Request.Headers["X-Role"] is { Count: > 0 } role
                ? new Identity(Roles: [role.ToString()])
                : null;
            o.UploadsSecret = "test-secret";
        }, typeof(UploadsProbeView).Assembly);
        var app = builder.Build();
        app.MapMateu();
        app.MapMateu("second-mount");
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return new Running(app, new HttpClient { BaseAddress = new Uri(address) });
    }

    /// <summary>The attributes (key → value) of field <paramref name="fieldId"/> on the probe view's load.</summary>
    private static async Task<Dictionary<string, string>> AttributesOf(HttpClient http, string fieldId, string? role = null)
    {
        using var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/uploads-probe")
        {
            Content = JsonContent.Create(new RunActionRqDto
            {
                Route = "uploads-probe",
                ConsumedRoute = "uploads-probe",
                ActionId = "",
                ServerSideType = typeof(UploadsProbeView).FullName,
            }, options: MateuExtensions.Json),
        };
        if (role is not null) rq.Headers.Add("X-Role", role);
        using var response = await http.SendAsync(rq);
        var json = JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
        var field = Find(json, fieldId) ?? throw new Xunit.Sdk.XunitException("no field " + fieldId + ": " + json);
        return (field["attributes"] as JsonArray ?? [])
            .ToDictionary(a => a!["key"]!.GetValue<string>(), a => a!["value"]!.GetValue<string>());
    }

    private static JsonNode? Find(JsonNode? node, string fieldId)
    {
        switch (node)
        {
            case JsonObject o:
                if (o["fieldId"] is JsonValue v && v.TryGetValue<string>(out var id) && id == fieldId && o.ContainsKey("attributes"))
                    return o;
                foreach (var (_, child) in o)
                    if (Find(child, fieldId) is { } found) return found;
                return null;
            case JsonArray a:
                foreach (var child in a)
                    if (Find(child, fieldId) is { } found) return found;
                return null;
            default:
                return null;
        }
    }

    private static HttpRequestMessage Upload(string? ticket, byte[] bytes, string? contentType = "application/pdf",
        string? fileName = "Contrato 1+1 ñ.pdf", string? role = null, string path = "/mateu/v3/upload")
    {
        var rq = new HttpRequestMessage(HttpMethod.Post, path) { Content = new ByteArrayContent(bytes) };
        if (contentType is not null) rq.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        if (ticket is not null) rq.Headers.Add("X-Mateu-Upload-Ticket", ticket);
        if (fileName is not null) rq.Headers.Add("X-Mateu-File-Name", StoredFile.Encode(fileName));
        if (role is not null) rq.Headers.Add("X-Role", role);
        return rq;
    }

    private static async Task<JsonNode> Body(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    [Fact]
    public async Task An_editable_field_of_a_registered_store_gets_a_ticket()
    {
        await using var host = await Boot(new InMemoryFileStorage(), new DirectFileStorage());
        var contract = await AttributesOf(host.Http, "contract");
        Assert.Equal(".pdf,image/*", contract["accept"]);
        Assert.Equal("20", contract["maxBytes"]);
        Assert.Equal("/mateu/v3/upload", contract["uploadUrl"]);
        Assert.False(string.IsNullOrEmpty(contract["uploadTicket"]));
        Assert.False(contract.ContainsKey("uploadDirect"));
        Assert.False(contract.ContainsKey("multiple"));

        var attachments = await AttributesOf(host.Http, "attachments");
        Assert.Equal("true", attachments["multiple"]);
        Assert.True(attachments.ContainsKey("uploadTicket"));

        var photo = await AttributesOf(host.Http, "photo");
        Assert.Equal("direct", photo["storage"]);
        Assert.Equal("true", photo["uploadDirect"]);

        // read-only: no ticket; a store nobody registered: no ticket — the data-URI fallback
        var signed = await AttributesOf(host.Http, "signed");
        Assert.False(signed.ContainsKey("uploadTicket"));
        Assert.False(signed.ContainsKey("uploadUrl"));
        var lost = await AttributesOf(host.Http, "lost");
        Assert.Equal("nowhere", lost["storage"]);
        Assert.False(lost.ContainsKey("uploadTicket"));
        // the reserved "inline" storage keeps the data URI even with a store registered
        var csv = await AttributesOf(host.Http, "csv");
        Assert.Equal("inline", csv["storage"]);
        Assert.False(csv.ContainsKey("uploadTicket"));
        Assert.False(csv.ContainsKey("uploadUrl"));
    }

    [Fact]
    public async Task Without_a_store_no_field_gets_upload_attributes()
    {
        await using var host = await Boot();
        var contract = await AttributesOf(host.Http, "contract");
        Assert.Equal(new Dictionary<string, string> { ["accept"] = ".pdf,image/*", ["maxBytes"] = "20" }, contract);
        var attachments = await AttributesOf(host.Http, "attachments");
        Assert.Equal(new Dictionary<string, string> { ["multiple"] = "true" }, attachments);
        // the endpoint is there, but nobody holds a ticket
        using var r = await host.Http.SendAsync(Upload("x.y", [1, 2, 3]));
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
    }

    [Fact]
    public async Task A_file_is_streamed_into_the_store_and_answered_as_a_reference()
    {
        var store = new InMemoryFileStorage();
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "contract"))["uploadTicket"];
        using var r = await host.Http.SendAsync(Upload(ticket, Encoding.ASCII.GetBytes("%PDF-1.7")));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        var body = await Body(r);
        var file = body["file"]!;
        var id = file["id"]!.GetValue<string>();
        Assert.Equal("%PDF-1.7", Encoding.ASCII.GetString(store.Files[id]));
        Assert.Equal("Contrato 1+1 ñ.pdf", file["name"]!.GetValue<string>());
        Assert.Equal("application/pdf", file["contentType"]!.GetValue<string>());
        Assert.Equal(8, file["size"]!.GetValue<long>());
        Assert.Equal("https://files.example.com/" + id, file["url"]!.GetValue<string>());
        Assert.Equal(new StoredFile(id, "Contrato 1+1 ñ.pdf", "application/pdf", 8, "https://files.example.com/" + id),
            StoredFile.Parse(body["value"]!.GetValue<string>()));
    }

    [Fact]
    public async Task A_single_file_ticket_sends_its_share_then_answers_429()
    {
        var store = new InMemoryFileStorage();
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "contract"))["uploadTicket"];
        for (var i = 0; i < FileUploads.SingleFileUses; i++)
        {
            using var ok = await host.Http.SendAsync(Upload(ticket, Encoding.ASCII.GetBytes("%PDF-1.7")));
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        }
        using var refused = await host.Http.SendAsync(Upload(ticket, Encoding.ASCII.GetBytes("%PDF-1.7")));
        Assert.Equal((HttpStatusCode)429, refused.StatusCode);
        Assert.Contains("Too many uploads", await refused.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task An_upload_without_a_valid_ticket_of_this_caller_is_refused()
    {
        await using var host = await Boot(new InMemoryFileStorage());
        var ticket = (await AttributesOf(host.Http, "contract", role: "clerk"))["uploadTicket"];
        foreach (var (t, role) in new[] { ((string?)null, "clerk"), (ticket + "x", "clerk"), ("abc.def", "clerk"), (ticket, "boss"), (ticket, null) })
        {
            using var r = await host.Http.SendAsync(Upload(t, [1], role: role));
            Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
            var body = await Body(r);
            Assert.Equal("Forbidden", body["error"]!.GetValue<string>());
            Assert.Equal("This upload is not allowed.", body["message"]!.GetValue<string>());
        }
        using var ok = await host.Http.SendAsync(Upload(ticket, [1], role: "clerk"));
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
    }

    [Fact]
    public async Task A_file_over_its_limit_is_refused_up_front_and_while_streaming()
    {
        var store = new InMemoryFileStorage();
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "contract"))["uploadTicket"];
        using var declared = await host.Http.SendAsync(Upload(ticket, new byte[21]));
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, declared.StatusCode);
        var body = await Body(declared);
        Assert.Equal("Too large", body["error"]!.GetValue<string>());
        Assert.Equal("This file is too large (max 20 bytes).", body["message"]!.GetValue<string>());

        // no Content-Length (chunked): aborted while streaming
        var streamed = Upload(ticket, []);
        streamed.Content = new StreamContent(new MemoryStream(new byte[64]));
        streamed.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        streamed.Headers.TransferEncodingChunked = true;
        using var chunked = await host.Http.SendAsync(streamed);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, chunked.StatusCode);
        Assert.Empty(store.Files);

        using var exact = await host.Http.SendAsync(Upload(ticket, new byte[20]));
        Assert.Equal(HttpStatusCode.OK, exact.StatusCode);
    }

    [Fact]
    public async Task A_file_the_field_does_not_accept_is_refused()
    {
        await using var host = await Boot(new InMemoryFileStorage());
        var ticket = (await AttributesOf(host.Http, "contract"))["uploadTicket"];
        using var r = await host.Http.SendAsync(Upload(ticket, [1], contentType: "text/plain", fileName: "notes.txt"));
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, r.StatusCode);
        var body = await Body(r);
        Assert.Equal("Not accepted", body["error"]!.GetValue<string>());
        Assert.Equal("This type of file is not accepted.", body["message"]!.GetValue<string>());
        // no Content-Type: application/octet-stream — accepted by extension
        using var byName = await host.Http.SendAsync(Upload(ticket, [1], contentType: null, fileName: "a.pdf"));
        Assert.Equal(HttpStatusCode.OK, byName.StatusCode);
        Assert.Equal("application/octet-stream", (await Body(byName))["file"]!["contentType"]!.GetValue<string>());
        // an image by type prefix
        using var image = await host.Http.SendAsync(Upload(ticket, [1], contentType: "image/png", fileName: "p"));
        Assert.Equal(HttpStatusCode.OK, image.StatusCode);
    }

    [Fact]
    public async Task A_failing_store_answers_through_the_error_boundary()
    {
        var store = new InMemoryFileStorage { Fail = true };
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "attachments"))["uploadTicket"];
        using var r = await host.Http.SendAsync(Upload(ticket, [1, 2]));
        Assert.Equal(HttpStatusCode.InternalServerError, r.StatusCode);
        var body = await Body(r);
        Assert.Equal("Something went wrong", body["error"]!.GetValue<string>());
        Assert.StartsWith("An unexpected error occurred. Reference: ", body["message"]!.GetValue<string>());
        Assert.DoesNotContain("secret", body.ToJsonString());
    }

    [Fact]
    public async Task The_target_endpoint_issues_a_pre_signed_target_or_answers_404()
    {
        var direct = new DirectFileStorage();
        await using var host = await Boot(new InMemoryFileStorage(), direct);
        var ticket = (await AttributesOf(host.Http, "photo"))["uploadTicket"];

        HttpRequestMessage Target(string json, string? t = null) => new(HttpMethod.Post, "/mateu/v3/upload/target")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
            Headers = { { "X-Mateu-Upload-Ticket", t ?? ticket } },
        };

        using var r = await host.Http.SendAsync(Target("{\"name\":\"me.png\",\"contentType\":\"image/png\",\"size\":5}"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        var body = await Body(r);
        Assert.Equal("https://bucket.example.com/k1?sig=x", body["url"]!.GetValue<string>());
        Assert.Equal("PUT", body["method"]!.GetValue<string>());
        Assert.Equal("private", body["headers"]!["x-amz-acl"]!.GetValue<string>());
        Assert.Equal("mateu-file:k1?name=me.png&type=image%2Fpng&size=5", body["value"]!.GetValue<string>());
        Assert.Equal("k1", body["file"]!["id"]!.GetValue<string>());

        direct.IssueNone = true;
        using var none = await host.Http.SendAsync(Target("{\"name\":\"me.png\",\"contentType\":\"image/png\",\"size\":5}"));
        Assert.Equal(HttpStatusCode.NotFound, none.StatusCode);
        Assert.Equal("Not found", (await Body(none))["error"]!.GetValue<string>());

        // a store without direct uploads issues none either: the client streams instead
        var streamTicket = (await AttributesOf(host.Http, "contract"))["uploadTicket"];
        using var streamOnly = await host.Http.SendAsync(Target("{\"name\":\"a.pdf\",\"contentType\":\"application/pdf\",\"size\":5}", streamTicket));
        Assert.Equal(HttpStatusCode.NotFound, streamOnly.StatusCode);
        using var tooLarge = await host.Http.SendAsync(Target("{\"name\":\"a.pdf\",\"contentType\":\"application/pdf\",\"size\":21}", streamTicket));
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, tooLarge.StatusCode);
        using var refused = await host.Http.SendAsync(Target("{\"name\":\"a.txt\",\"contentType\":\"text/plain\",\"size\":2}", streamTicket));
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, refused.StatusCode);
        using var invalid = await host.Http.SendAsync(Target("{not json", streamTicket));
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.Equal("The upload request is not valid JSON.", (await Body(invalid))["message"]!.GetValue<string>());
        using var forged = await host.Http.SendAsync(Target("{}", "nope.nope"));
        Assert.Equal(HttpStatusCode.Forbidden, forged.StatusCode);
    }

    [Fact]
    public async Task The_upload_takes_any_body_type_but_the_target_takes_json_only()
    {
        await using var host = await Boot(new InMemoryFileStorage());
        var ticket = (await AttributesOf(host.Http, "attachments"))["uploadTicket"];
        // text/plain is what the JSON-body guard refuses elsewhere under /mateu/v3/
        using var upload = await host.Http.SendAsync(Upload(ticket, [1], contentType: "text/plain", fileName: "a.txt"));
        Assert.Equal(HttpStatusCode.OK, upload.StatusCode);
        var target = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/upload/target")
        {
            Content = new StringContent("{}", Encoding.UTF8, "text/plain"),
        };
        target.Headers.Add("X-Mateu-Upload-Ticket", ticket);
        using var r = await host.Http.SendAsync(target);
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, r.StatusCode);
    }
    [Fact]
    public async Task A_valid_ticket_of_a_store_no_longer_registered_answers_404()
    {
        await using var host = await Boot(new InMemoryFileStorage());
        // signed with this backend's secret for the anonymous caller, but naming a store nobody registered
        var ticket = new FileUploads([], "test-secret").Issue("nowhere", "contract", 20, "", false,
            FileUploads.CallerHash(null, null));
        using var r = await host.Http.SendAsync(Upload(ticket, [1]));
        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
        Assert.Equal("Uploads are not available.", (await Body(r))["message"]!.GetValue<string>());
        using var t = await host.Http.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/upload/target")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
            Headers = { { "X-Mateu-Upload-Ticket", ticket } },
        });
        Assert.Equal(HttpStatusCode.NotFound, t.StatusCode);
    }

    [Fact]
    public async Task A_store_refusal_is_403_and_its_user_facing_error_is_shown_as_written()
    {
        var store = new ScriptedFileStorage("direct");
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "photo"))["uploadTicket"];

        store.Throw = () => new MateuForbiddenException("not yours");
        using var forbidden = await host.Http.SendAsync(Upload(ticket, [1], contentType: "image/png", fileName: "p.png"));
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        Assert.Equal("This upload is not allowed.", (await Body(forbidden))["message"]!.GetValue<string>());

        store.Throw = () => new UserFacingException("Quota exceeded");
        using var quota = await host.Http.SendAsync(Upload(ticket, [1], contentType: "image/png", fileName: "p.png"));
        Assert.Equal(HttpStatusCode.InternalServerError, quota.StatusCode);
        Assert.Equal("Quota exceeded", (await Body(quota))["message"]!.GetValue<string>());

        // the target endpoint goes through the same boundary
        using var target = await host.Http.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/upload/target")
        {
            Content = new StringContent("{\"name\":\"p.png\",\"contentType\":\"image/png\"}", Encoding.UTF8, "application/json"),
            Headers = { { "X-Mateu-Upload-Ticket", ticket } },
        });
        Assert.Equal(HttpStatusCode.InternalServerError, target.StatusCode);
        Assert.Equal("Quota exceeded", (await Body(target))["message"]!.GetValue<string>());
    }

    [Fact]
    public async Task The_size_limit_is_found_even_wrapped_by_the_store()
    {
        var store = new ScriptedFileStorage("direct") { ReadOnAnotherTask = true };
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "photo"))["uploadTicket"];
        var streamed = Upload(ticket, [], contentType: "image/png", fileName: "p.png");
        streamed.Content = new StreamContent(new MemoryStream(new byte[64]));
        streamed.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        streamed.Headers.TransferEncodingChunked = true;
        // the photo's limit is the default (100 MB): 64 bytes fit, the store counted them itself
        using var fits = await host.Http.SendAsync(streamed);
        Assert.Equal(HttpStatusCode.OK, fits.StatusCode);
        Assert.Equal(64, (await Body(fits))["file"]!["size"]!.GetValue<long>());

        var contractTicket = new FileUploads([], "test-secret").Issue("direct", "contract", 20, "", false,
            FileUploads.CallerHash(null, null));
        var tooBig = Upload(contractTicket, [], fileName: null);
        tooBig.Content = new StreamContent(new MemoryStream(new byte[64]));
        tooBig.Headers.TransferEncodingChunked = true;
        using var refused = await host.Http.SendAsync(tooBig);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, refused.StatusCode);
    }

    [Fact]
    public async Task The_store_sees_the_request_and_a_nameless_file_is_called_file()
    {
        var store = new ScriptedFileStorage("direct");
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "photo", role: "clerk"))["uploadTicket"];
        var rq = Upload(ticket, [1, 2, 3], contentType: "image/png", fileName: null, role: "clerk");
        rq.Headers.Add("X-Trace", "abc");
        using var r = await host.Http.SendAsync(rq);
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.Equal("file", (await Body(r))["file"]!["name"]!.GetValue<string>());
        Assert.Equal("abc", store.Seen.Trace);
        Assert.Null(store.Seen.Absent);
        Assert.Equal(["clerk"], store.Seen.Identity!.Roles!);
    }

    [Fact]
    public async Task The_target_request_falls_back_on_defaults_for_what_it_does_not_say()
    {
        var store = new ScriptedFileStorage("direct");
        await using var host = await Boot(store);
        var ticket = (await AttributesOf(host.Http, "photo"))["uploadTicket"];
        foreach (var json in new[] { "[]", "{\"name\":3,\"contentType\":\"\",\"size\":\"big\"}", "{\"size\":1.5}" })
        {
            using var r = await host.Http.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/upload/target")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
                Headers = { { "X-Mateu-Upload-Ticket", ticket } },
            });
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
            var body = await Body(r);
            Assert.Equal("POST", body["method"]!.GetValue<string>());
            Assert.Empty(body["headers"]!.AsObject());
            Assert.Equal("file", body["file"]!["name"]!.GetValue<string>());
            Assert.Equal("application/octet-stream", body["file"]!["contentType"]!.GetValue<string>());
            Assert.Equal(-1, body["file"]!["size"]!.GetValue<long>());
        }
    }
}
