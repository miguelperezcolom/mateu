using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Core.Mcp;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Mateu.AspNetCore;

public static class MateuExtensions
{
    /// <summary>Mateu's JSON contract: camelCase, case-insensitive, keep nulls, and raw UTF-8 —
    /// no \uXXXX escaping of non-ASCII/HTML characters — to match the Java (Jackson) output
    /// byte for byte.</summary>
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>Registers Mateu with the default options: the views of <paramref name="assemblies"/>
    /// (all loaded assemblies when none), the identity taken from <c>HttpContext.User</c>'s claims.</summary>
    public static IServiceCollection AddMateu(this IServiceCollection services, params Assembly[] assemblies) =>
        services.AddMateu(_ => { }, assemblies);

    /// <summary>Registers Mateu. <paramref name="configure"/> sets the identity mapping, the secrets
    /// provider of proxied REST sources and the error detail policy (<see cref="MateuOptions"/>).</summary>
    public static IServiceCollection AddMateu(
        this IServiceCollection services, Action<MateuOptions> configure, params Assembly[] assemblies)
    {
        var options = new MateuOptions();
        configure(options);
        if (options.Dev ?? DevSpecs.Enabled) DevSpecs.Enable(true);
        services.AddSingleton(options);
        services.AddHttpContextAccessor();
        services.AddSingleton(new MateuRegistry(assemblies));
        // ITranslator is optional — register an Mateu.Uidl.ITranslator to enable i18n.
        services.AddSingleton(sp =>
        {
            MateuLogging.UseLoggerFactory(sp.GetService<ILoggerFactory>());
            var accessor = sp.GetRequiredService<IHttpContextAccessor>();
            var secretsProvider = sp.GetService<ISecretsProvider>();
            Func<string, string?>? secrets = options.Secrets
                ?? (secretsProvider is null ? null : secretsProvider.Secret);
            var registry = sp.GetRequiredService<MateuRegistry>();
            // Component adapters registered as services join the ones found by assembly scan.
            foreach (var adapter in sp.GetServices<IComponentAdapter>()) registry.RegisterAdapter(adapter);
            return new SyncHandler(
                registry,
                sp.GetService<ITranslator>(),
                // Read per call: the handler is a singleton, the identity is the current request's.
                identity: () => accessor.HttpContext is { } ctx ? options.Identity(ctx) : null,
                secrets: secrets,
                http: options.HttpClient)
            {
                // Listing exports: an exporter registered as a service replaces the built-in writer
                // of its format (Java: the CsvExporter/ExcelExporter/PdfExporter beans).
                Exporters = new Mateu.Core.Export.MateuExporters(
                    sp.GetService<ICsvExporter>() ?? Mateu.Core.Export.MateuExporters.BuiltIn.Csv,
                    sp.GetService<IExcelExporter>() ?? Mateu.Core.Export.MateuExporters.BuiltIn.Excel,
                    sp.GetService<IPdfExporter>() ?? Mateu.Core.Export.MateuExporters.BuiltIn.Pdf),
            };
        });
        return services;
    }

    public static void MapMateu(this WebApplication app, string baseUrl = "")
    {
        var prefix = string.IsNullOrEmpty(baseUrl) ? "" : "/" + baseUrl.Trim('/');
        app.MapPost(prefix + "/mateu/v3/sync/{**route}", async (HttpContext ctx, SyncHandler handler) =>
        {
            var rq = await JsonSerializer.DeserializeAsync<RunActionRqDto>(ctx.Request.Body, Json, ctx.RequestAborted)
                     ?? new RunActionRqDto();
            var increment = await RunGuarded(ctx, rq, () =>
                handler.HandleAsync(rq, $"{ctx.Request.Scheme}://{ctx.Request.Host}{prefix}", ctx.RequestAborted));
            ctx.Response.ContentType = "application/json";
            await JsonSerializer.SerializeAsync(ctx.Response.Body, increment, Json, ctx.RequestAborted);
        });

        // Live reload (development mode only): the event stream and the re-render trigger. Absent
        // otherwise — a production app does not even route them.
        if (DevSpecs.Enabled) MapDevEndpoints(app);

        // Native MCP endpoint — the app is also an MCP (the agent-operability plane). A JSON-RPC 2.0
        // message in, the projected wire out; reuses the SyncHandler so RBAC applies as on sync.
        app.MapPost(prefix + "/mateu/mcp", async (HttpContext ctx, SyncHandler handler) =>
        {
            var message = await JsonSerializer.DeserializeAsync<JsonNode>(ctx.Request.Body, Json, ctx.RequestAborted);
            var mcp = new McpService(handler, Json, $"{ctx.Request.Scheme}://{ctx.Request.Host}{prefix}");
            var response = McpJsonRpc.Handle(message, mcp);
            if (response is null)
            {
                ctx.Response.StatusCode = 202;
                return;
            }
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(response.ToJsonString(Json));
        });
    }

    /// <summary><c>GET /mateu/dev/events</c> (SSE: hello with the boot id, then every change, a ping
    /// every 15 s) and <c>POST /mateu/dev/reload[?scope=app]</c> (204), at the server root like Java's.</summary>
    internal static void MapDevEndpoints(WebApplication app)
    {
        app.MapGet(DevSpecs.EventsPath, async (HttpContext ctx) =>
        {
            ctx.Response.ContentType = "text/event-stream";
            ctx.Response.Headers.CacheControl = "no-cache";
            var queue = System.Threading.Channels.Channel.CreateUnbounded<string>();
            queue.Writer.TryWrite(DevSpecs.Hello());
            using var subscription = DevSpecs.Subscribe(json => queue.Writer.TryWrite(json));
            using var pings = new Timer(_ => queue.Writer.TryWrite("{\"type\":\"ping\"}"), null, 15000, 15000);
            try
            {
                await foreach (var json in queue.Reader.ReadAllAsync(ctx.RequestAborted))
                {
                    await ctx.Response.WriteAsync("data: " + json + "\n\n", ctx.RequestAborted);
                    await ctx.Response.Body.FlushAsync(ctx.RequestAborted);
                }
            }
            catch (OperationCanceledException)
            {
                // the browser went away
            }
        });
        app.MapPost(DevSpecs.ReloadPath, (HttpContext ctx) =>
        {
            DevSpecs.Reload(ctx.Request.Query["scope"].FirstOrDefault());
            return Results.NoContent();
        });
    }

    /// <summary>The error boundary of the sync endpoint. A denied request answers 403 with an error
    /// message; any other exception becomes an error-message increment (HTTP 200, like the Java
    /// core) the renderer shows as a toast, instead of a raw 500 it cannot render — with the
    /// exception's message only for a <see cref="UserFacingException"/> or in Development, and a
    /// correlation id that is also on the log entry.</summary>
    internal static async Task<UIIncrementDto> RunGuarded(
        HttpContext ctx, RunActionRqDto rq, Func<Task<UIIncrementDto>> run)
    {
        try
        {
            return await run();
        }
        catch (MateuForbiddenException e)
        {
            // A denied action/view ([DisabledUnless]/[EyesOnly] not satisfied at invocation): 403
            // with an error message increment, the method never ran.
            Logger(ctx, "Mateu.Security").LogWarning("Mateu request denied ({Route}, action {ActionId}): {Reason}",
                rq.Route, rq.ActionId, e.Message);
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", "Forbidden", 5000)]);
        }
        catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested)
        {
            // The client went away: nobody is listening for an answer.
            return UIIncrementDto.Of();
        }
        catch (Exception e)
        {
            var correlationId = Activity.Current?.TraceId.ToString() ?? ctx.TraceIdentifier;
            var cause = MateuErrors.Unwrap(e);
            var log = Logger(ctx, "Mateu.Errors");
            if (MateuErrors.IsForTheUser(cause))
                log.LogInformation("Action {ActionId} on {Route} answered a user-facing error [{CorrelationId}]: {Message}",
                    rq.ActionId, rq.Route, correlationId, cause.Message);
            else
                log.LogError(cause, "Unhandled error in action {ActionId} on {Route} [{CorrelationId}]",
                    rq.ActionId, rq.Route, correlationId);
            return MateuErrors.Increment(cause, correlationId, Detailed(ctx));
        }
    }

    private static bool Detailed(HttpContext ctx) =>
        ctx.RequestServices.GetService<MateuOptions>()?.DetailedErrors
        ?? (ErrorBoundary.DetailedByEnvironment() ? true : (bool?)null)
        ?? ctx.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment()
        ?? false;

    private static ILogger Logger(HttpContext ctx, string category) =>
        ctx.RequestServices.GetService<ILoggerFactory>()?.CreateLogger(category)
        ?? Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance;
}
