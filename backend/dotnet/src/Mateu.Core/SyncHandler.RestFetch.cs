using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Proxy-mode REST fetch: the __restfetch__ reserved action (Java: RunActionUseCase proxy + RestSourceResolver).
public sealed partial class SyncHandler
{
    /// <summary>The __restfetch__ reserved action: resolve the DECLARED source of the routed view by
    /// _sourceKind/_sourceId, interpolate ${state.x}/${secret.X}, fetch server-side and return the
    /// raw JSON on appData._restfetch (an empty object on any failure — the renderer maps it as in
    /// direct mode).</summary>
    private UIIncrementDto RestFetchResponse(RunActionRqDto rq)
    {
        object? json = new Dictionary<string, object?>();
        if (registry.Resolve(rq.ServerSideType, rq.Route) is { } type)
        {
            ActionGuard.EnsureViewVisible(type);
            var kind = StateString(GetState(rq.Parameters, "_sourceKind"));
            var id = StateString(GetState(rq.Parameters, "_sourceId"));
            if (ReflectionMapper.ResolveRestSource(type, kind, id) is { } source)
                json = FetchProxy(source, rq.ComponentState) ?? new Dictionary<string, object?>();
        }
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = json }, null);
    }

    /// <summary>Fetch a resolved source server-side (url/headers/body interpolated); null on any
    /// non-2xx or transport error.</summary>
    private object? FetchProxy(RestDataSourceDto source, Dictionary<string, object?> state)
    {
        try
        {
            var url = Interpolate(source.Url, state, ResolveSecret);
            var method = string.IsNullOrWhiteSpace(source.Method) ? "GET" : source.Method!.ToUpperInvariant();
            using var req = new HttpRequestMessage(new HttpMethod(method), url);
            if (source.Headers is not null)
                foreach (var (k, v) in source.Headers)
                    req.Headers.TryAddWithoutValidation(k, Interpolate(v, state, ResolveSecret));
            if (method is not "GET" and not "HEAD" && !string.IsNullOrWhiteSpace(source.Body))
                req.Content = new StringContent(Interpolate(source.Body, state, ResolveSecret) ?? "");
            using var resp = RestHttp.Send(req);
            if ((int)resp.StatusCode >= 400) return null;
            using var reader = new StreamReader(resp.Content.ReadAsStream());
            return JsonSerializer.Deserialize<JsonElement>(reader.ReadToEnd());
        }
        catch
        {
            return null;
        }
    }

    /// <summary>Resolve a secret: the injected provider first, then the same-named env var.</summary>
    private string? ResolveSecret(string key) => secrets?.Invoke(key) ?? Environment.GetEnvironmentVariable(key);

    /// <summary>Interpolate ${state.x}/${secret.X} placeholders (unknown → empty).</summary>
    private static string Interpolate(string? template, Dictionary<string, object?> state, Func<string, string?> secrets)
    {
        if (string.IsNullOrEmpty(template)) return template ?? "";
        return Regex.Replace(template, @"\$\{([^}]+)\}", m =>
        {
            var expr = m.Groups[1].Value.Trim();
            if (expr.StartsWith("state.")) return StateString(GetState(state, expr[6..])) ?? "";
            if (expr.StartsWith("secret.")) return secrets(expr[7..]) ?? "";
            return "";
        });
    }
}
