using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Mateu.AspNetCore;

public static class MateuExtensions
{
    /// <summary>Mateu's JSON contract: camelCase, case-insensitive, keep nulls (match the Java output).</summary>
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
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
            var increment = handler.Handle(rq);
            ctx.Response.ContentType = "application/json";
            await JsonSerializer.SerializeAsync(ctx.Response.Body, increment, Json);
        });
    }
}
