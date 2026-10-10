using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Core.Mcp;
using Mateu.Dtos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
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

    public static IServiceCollection AddMateu(this IServiceCollection services, params Assembly[] assemblies)
    {
        services.AddSingleton(new MateuRegistry(assemblies));
        // ITranslator is optional — register an Mateu.Uidl.ITranslator to enable i18n.
        services.AddSingleton(sp => new SyncHandler(
            sp.GetRequiredService<MateuRegistry>(),
            sp.GetService<Mateu.Uidl.ITranslator>()));
        return services;
    }

    public static void MapMateu(this WebApplication app, string baseUrl = "")
    {
        var prefix = string.IsNullOrEmpty(baseUrl) ? "" : "/" + baseUrl.Trim('/');
        app.MapPost(prefix + "/mateu/v3/sync/{**route}", async (HttpContext ctx, SyncHandler handler) =>
        {
            var rq = await JsonSerializer.DeserializeAsync<RunActionRqDto>(ctx.Request.Body, Json)
                     ?? new RunActionRqDto();
            UIIncrementDto increment;
            try
            {
                increment = handler.Handle(rq, $"{ctx.Request.Scheme}://{ctx.Request.Host}{prefix}");
            }
            catch (MateuForbiddenException e)
            {
                // A denied action/view ([DisabledUnless]/[Audience]/[EyesOnly] not satisfied at
                // invocation): 403 with an error message increment, the method never ran.
                ctx.RequestServices.GetService<ILoggerFactory>()?.CreateLogger("Mateu.Security")
                    .LogWarning("Mateu request denied ({Route}, action {ActionId}): {Reason}",
                        rq.Route, rq.ActionId, e.Message);
                ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                increment = UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", "Forbidden", 5000)]);
            }
            catch (Exception e)
            {
                // The error boundary (mirrors Java's): an exception used to escape as a framework
                // 500 with no toast. A UserFacingException / ValidationException shows its message;
                // anything else a generic one with a reference id the full exception is logged under.
                var (message, reference) = ErrorBoundary.Describe(e);
                if (reference is not null)
                    ctx.RequestServices.GetService<ILoggerFactory>()?.CreateLogger("Mateu.Errors")
                        .LogError(e, "Error handling action {ActionId} on {Route} [ref {Reference}]",
                            rq.ActionId, rq.Route, reference);
                increment = UIIncrementDto.Of(messages: [message]);
            }
            ctx.Response.ContentType = "application/json";
            await JsonSerializer.SerializeAsync(ctx.Response.Body, increment, Json);
        });

        // Native MCP endpoint — the app is also an MCP (the agent-operability plane). A JSON-RPC 2.0
        // message in, the projected wire out; reuses the SyncHandler so RBAC applies as on sync.
        app.MapPost(prefix + "/mateu/mcp", async (HttpContext ctx, SyncHandler handler) =>
        {
            var message = await JsonSerializer.DeserializeAsync<JsonNode>(ctx.Request.Body, Json);
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
}
