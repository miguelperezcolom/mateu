using Mateu.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Mateu.AspNetCore;

/// <summary>Installs <see cref="VersionSkewMiddleware"/> first in the pipeline.</summary>
internal sealed class VersionSkewStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
    {
        app.Use(VersionSkewMiddleware.Invoke);
        next(app);
    };
}

/// <summary>On every request to a Mateu endpoint (a <c>/mateu/</c> segment): stamps
/// <c>X-Mateu-Build</c> on the response — set up front AND again when the response starts, so an
/// exception handler that clears the headers does not drop it — exposes it to cross-origin JS when the
/// host's CORS granted the origin, and warns once per distinct <c>X-Mateu-Renderer</c> speaking another
/// wire major. Never refuses anything.</summary>
internal static class VersionSkewMiddleware
{
    public static async Task Invoke(HttpContext ctx, Func<Task> next)
    {
        var skew = ctx.RequestServices.GetService<VersionSkew>();
        if (skew is null || !VersionSkew.IsMateuPath(ctx.Request.Path.Value))
        {
            await next();
            return;
        }
        var build = skew.BuildId;
        if (skew.WarningFor(ctx.Request.Headers[VersionSkew.RendererHeader].FirstOrDefault(),
                Mateu.Dtos.UIIncrementDto.CurrentWireVersion) is { } warning)
            ctx.RequestServices.GetService<ILoggerFactory>()?.CreateLogger("Mateu.VersionSkew")
                .LogWarning("{Warning}", warning);
        ctx.Response.Headers[VersionSkew.BuildHeader] = build;
        ctx.Response.OnStarting(() =>
        {
            var headers = ctx.Response.Headers;
            headers[VersionSkew.BuildHeader] = build;
            if (headers.ContainsKey("Access-Control-Allow-Origin")) Expose(headers);
            return Task.CompletedTask;
        });
        await next();
    }

    /// <summary>Adds the build header to <c>Access-Control-Expose-Headers</c>, keeping what is there.</summary>
    internal static void Expose(IHeaderDictionary headers)
    {
        var current = headers.AccessControlExposeHeaders.ToString();
        var names = current.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (names.Any(n => string.Equals(n, VersionSkew.BuildHeader, StringComparison.OrdinalIgnoreCase))) return;
        headers.AccessControlExposeHeaders = names.Length == 0
            ? VersionSkew.BuildHeader
            : string.Join(", ", names.Append(VersionSkew.BuildHeader));
    }
}
