using System.Diagnostics;
using System.Text.Json;
using Mateu.Core;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Mateu.AspNetCore;

// Uploads through the IFileStorage port the app implements (design/uploads/file-uploads-contract.md
// §4): POST /mateu/v3/upload (the raw body streamed into the ticket's store) and
// POST /mateu/v3/upload/target (a pre-signed target). EXPERIMENTAL.
public static partial class MateuExtensions
{
    private const string UploadsMappedKey = "Mateu.Uploads.Mapped";

    /// <summary>The uploads of the registered <see cref="IFileStorage"/> services (null when none):
    /// tickets are signed with <see cref="MateuOptions.UploadsSecret"/> and bound to the caller of the
    /// request in flight.</summary>
    private static FileUploads? UploadsOf(IServiceProvider sp, MateuOptions options, IHttpContextAccessor accessor)
    {
        var storages = sp.GetServices<IFileStorage>().ToList();
        return storages.Count == 0
            ? null
            : new FileUploads(storages, options.UploadsSecret, () => UploadCaller(accessor.HttpContext, options));
    }

    /// <summary>The caller hash of <paramref name="ctx"/>, from the host's identity resolution.</summary>
    private static string UploadCaller(HttpContext? ctx, MateuOptions? options) => ctx is null
        ? FileUploads.CallerHash(null, null)
        : FileUploads.CallerHash(PrincipalName(ctx), (options?.Identity ?? ClaimsIdentityMapper.FromUser)(ctx));

    /// <summary>Maps both upload endpoints at the ROOT, once per application whatever the number of
    /// mounts. The upload takes ANY body type — it is exempt from the JSON-body guard: its required
    /// ticket header forces a CORS preflight, which is what keeps it safe from cross-site forgery. The
    /// target endpoint takes a JSON body, so it keeps the guard.</summary>
    private static void MapUploadEndpoints(WebApplication app)
    {
        var properties = ((IApplicationBuilder)app).Properties;
        if (properties.ContainsKey(UploadsMappedKey)) return;
        properties[UploadsMappedKey] = true;
        app.MapPost(FileUploads.UploadPath, UploadEndpoint);
        app.MapPost(FileUploads.TargetPath, (Delegate)(Func<HttpContext, Task>)UploadTargetEndpoint).JsonBodiesOnly();
    }

    private static async Task UploadEndpoint(HttpContext ctx)
    {
        if (!UploadGranted(ctx, out var ticket, out var store))
        {
            await RefuseUpload(ctx, ticket);
            return;
        }
        // the store gets a bare name, never the path a client sent (../x, C:\x)
        var name = FileUploads.BareFileName(ctx.Request.Headers[FileUploads.FileNameHeader].FirstOrDefault() is { Length: > 0 } header
            ? StoredFile.Decode(header)
            : null);
        var contentType = string.IsNullOrWhiteSpace(ctx.Request.ContentType)
            ? "application/octet-stream"
            : ctx.Request.ContentType!;
        if (!FileUploads.Accepts(ticket!.Accept, name, contentType))
        {
            await NotAccepted(ctx);
            return;
        }
        var length = ctx.Request.ContentLength;
        if (length > ticket.MaxBytes)
        {
            await TooLarge(ctx, ticket.MaxBytes);
            return;
        }
        // the limit is the ticket's (enforced while streaming), not the server's default body size
        if (ctx.Features.Get<IHttpMaxRequestBodySizeFeature>() is { IsReadOnly: false } bodySize)
            bodySize.MaxRequestBodySize = null;
        var limited = new LimitedStream(ctx.Request.Body, ticket.MaxBytes);
        StoredFile stored;
        try
        {
            stored = await store!.StoreAsync(new IncomingFile(name, contentType, length ?? -1, limited),
                UploadRequestOf(ctx));
        }
        catch (Exception e) when (FindTooLarge(e) is not null)
        {
            await TooLarge(ctx, ticket.MaxBytes);
            return;
        }
        catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested)
        {
            return;
        }
        catch (Exception e)
        {
            await StoreFailed(ctx, e);
            return;
        }
        // a store that did not count the bytes gets the count Mateu streamed
        if (stored.Size < 0) stored = stored with { Size = limited.BytesRead };
        ctx.Response.ContentType = "application/json";
        await JsonSerializer.SerializeAsync(ctx.Response.Body,
            new Dictionary<string, object?> { ["value"] = stored.ToValue(), ["file"] = FileJson(stored) },
            Json, ctx.RequestAborted);
    }

    private static async Task UploadTargetEndpoint(HttpContext ctx)
    {
        if (!UploadGranted(ctx, out var ticket, out var store))
        {
            await RefuseUpload(ctx, ticket);
            return;
        }
        JsonElement body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<JsonElement>(ctx.Request.Body, Json, ctx.RequestAborted);
        }
        catch (JsonException)
        {
            await UploadError(ctx, StatusCodes.Status400BadRequest, "Bad request", "The upload request is not valid JSON.");
            return;
        }
        var isObject = body.ValueKind == JsonValueKind.Object;
        string? Text(string property) =>
            isObject && body.TryGetProperty(property, out var v) && v.ValueKind == JsonValueKind.String
                ? v.GetString()
                : null;
        var name = FileUploads.BareFileName(Text("name"));
        var contentType = Text("contentType") is { Length: > 0 } declaredType ? declaredType : "application/octet-stream";
        var size = isObject && body.TryGetProperty("size", out var s) && s.ValueKind == JsonValueKind.Number
                   && s.TryGetInt64(out var n)
            ? n
            : -1;
        if (size > ticket!.MaxBytes)
        {
            await TooLarge(ctx, ticket.MaxBytes);
            return;
        }
        if (!FileUploads.Accepts(ticket.Accept, name, contentType))
        {
            await NotAccepted(ctx);
            return;
        }
        UploadTarget? target;
        try
        {
            target = store!.DirectUploads
                ? await store.UploadTargetAsync(new UploadRequest(name, contentType, size), UploadRequestOf(ctx))
                : null;
        }
        catch (Exception e)
        {
            await StoreFailed(ctx, e);
            return;
        }
        if (target is null)
        {
            // the store issued none: the client streams through /mateu/v3/upload instead
            await UploadError(ctx, StatusCodes.Status404NotFound, "Not found", "This store issues no upload target.");
            return;
        }
        ctx.Response.ContentType = "application/json";
        await JsonSerializer.SerializeAsync(ctx.Response.Body, new Dictionary<string, object?>
        {
            ["url"] = target.Url,
            ["method"] = string.IsNullOrWhiteSpace(target.Method) ? "PUT" : target.Method,
            ["headers"] = target.Headers ?? new Dictionary<string, string>(),
            ["value"] = target.File.ToValue(),
            ["file"] = FileJson(target.File),
        }, Json, ctx.RequestAborted);
    }

    /// <summary>Whether the request carries a valid ticket of THIS caller whose store is registered.
    /// <paramref name="ticket"/> is the verified ticket (null when none is valid).</summary>
    private static bool UploadGranted(HttpContext ctx, out FileUploads.Ticket? ticket, out IFileStorage? store)
    {
        store = null;
        var uploads = ctx.RequestServices.GetService<SyncHandler>()?.Uploads;
        ticket = uploads?.Verify(ctx.Request.Headers[FileUploads.TicketHeader].FirstOrDefault(),
            UploadCaller(ctx, ctx.RequestServices.GetService<MateuOptions>()));
        if (ticket is null) return false;
        store = uploads!.Find(ticket.Storage);
        return store is not null;
    }

    /// <summary>403 without a valid ticket; 404 for a valid one whose store is no longer registered.</summary>
    private static Task RefuseUpload(HttpContext ctx, FileUploads.Ticket? ticket)
    {
        if (ticket is not null)
            return UploadError(ctx, StatusCodes.Status404NotFound, "Not found", "Uploads are not available.");
        Logger(ctx, "Mateu.Security").LogWarning("Mateu upload refused ({Path}): no valid ticket", ctx.Request.Path.Value);
        return UploadError(ctx, StatusCodes.Status403Forbidden, "Forbidden", "This upload is not allowed.");
    }

    private static Task NotAccepted(HttpContext ctx) => UploadError(ctx,
        StatusCodes.Status415UnsupportedMediaType, "Not accepted", "This type of file is not accepted.");

    private static Task TooLarge(HttpContext ctx, long maxBytes) => UploadError(ctx,
        StatusCodes.Status413PayloadTooLarge, "Too large",
        "This file is too large (max " + FileUploads.SizeText(maxBytes) + ").");

    /// <summary>The store threw: the error boundary's texts, with a reference the log entry carries
    /// (a refusal of the store is a 403).</summary>
    private static Task StoreFailed(HttpContext ctx, Exception e)
    {
        var cause = MateuErrors.Unwrap(e);
        if (cause is MateuForbiddenException)
            return UploadError(ctx, StatusCodes.Status403Forbidden, "Forbidden", "This upload is not allowed.");
        var correlationId = Activity.Current?.TraceId.ToString() ?? ctx.TraceIdentifier;
        var (message, reference) = ErrorBoundary.Describe(cause, Detailed(ctx), correlationId);
        var log = Logger(ctx, "Mateu.Errors");
        if (reference is null)
            log.LogInformation("An upload answered a user-facing error [{CorrelationId}]: {Message}", correlationId, cause.Message);
        else
            log.LogError(cause, "Unhandled error storing an upload [{CorrelationId}]", correlationId);
        return UploadError(ctx, StatusCodes.Status500InternalServerError, message.Title, message.Text);
    }

    private static async Task UploadError(HttpContext ctx, int status, string error, string message)
    {
        if (ctx.Response.HasStarted) return;
        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/json";
        await JsonSerializer.SerializeAsync(ctx.Response.Body,
            new Dictionary<string, string> { ["error"] = error, ["message"] = message }, Json, ctx.RequestAborted);
    }

    private static FileTooLargeException? FindTooLarge(Exception? e)
    {
        for (; e is not null; e = e.InnerException)
        {
            if (e is FileTooLargeException tooLarge) return tooLarge;
            if (e is AggregateException aggregate)
                foreach (var inner in aggregate.InnerExceptions)
                    if (FindTooLarge(inner) is { } found) return found;
        }
        return null;
    }

    private static Dictionary<string, object?> FileJson(StoredFile file) => new()
    {
        ["id"] = file.Id,
        ["name"] = file.Name,
        ["contentType"] = file.ContentType,
        ["size"] = file.Size,
        ["url"] = file.Url,
    };

    /// <summary>The request as a store sees it: the headers and the caller the host authenticated.</summary>
    private static IncomingRequest UploadRequestOf(HttpContext ctx) => new(
        name => ctx.Request.Headers.TryGetValue(name, out var value) ? value.ToString() : null,
        PrincipalName(ctx),
        (ctx.RequestServices.GetService<MateuOptions>()?.Identity ?? ClaimsIdentityMapper.FromUser)(ctx),
        ctx.TraceIdentifier);
}
