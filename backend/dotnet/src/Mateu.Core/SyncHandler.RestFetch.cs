using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

// Proxy-mode REST fetch: the __restfetch__ reserved action (Java: RunActionUseCase proxy + RestSourceResolver).
public sealed partial class SyncHandler
{
    /// <summary>The __restfetch__ reserved action: resolve the DECLARED source of the routed view by
    /// _sourceKind/_sourceId, interpolate ${state.x}/${secret.X}, fetch server-side and return the
    /// raw JSON on appData._restfetch (an empty object on any failure — the renderer maps it as in
    /// direct mode).</summary>
    private async Task<UIIncrementDto> RestFetchResponseAsync(RunActionRqDto rq, CancellationToken cancellationToken)
    {
        object? json = new Dictionary<string, object?>();
        if (registry.Resolve(rq.ServerSideType, rq.Route) is { } type)
        {
            ActionGuard.EnsureViewVisible(type);
            var kind = StateString(GetState(rq.Parameters, "_sourceKind"));
            var id = StateString(GetState(rq.Parameters, "_sourceId"));
            if (ResolveProxySource(type, rq, kind, id) is { } source)
                json = await FetchProxyAsync(source, rq.ComponentState, cancellationToken).ConfigureAwait(false)
                       ?? new Dictionary<string, object?>();
        }
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = json }, null);
    }

    /// <summary>Fetch a resolved source server-side (url/headers/body interpolated); null on any
    /// non-2xx or transport error — logged, since the screen only sees an empty result.</summary>
    private async Task<object?> FetchProxyAsync(
        RestDataSourceDto source, Dictionary<string, object?> state, CancellationToken cancellationToken)
    {
        // values percent-encoded by position: client state cannot steer the server's request
        var url = UrlTemplate.Interpolate(source.Url, expr => ValueOf(expr, state, ResolveSecret));
        try
        {
            var method = string.IsNullOrWhiteSpace(source.Method) ? "GET" : source.Method!.ToUpperInvariant();
            using var req = new HttpRequestMessage(new HttpMethod(method), url);
            if (source.Headers is not null)
                foreach (var (k, v) in source.Headers)
                    req.Headers.TryAddWithoutValidation(k, Interpolate(v, state, ResolveSecret));
            if (method is not "GET" and not "HEAD" && !string.IsNullOrWhiteSpace(source.Body))
                req.Content = new StringContent(Interpolate(source.Body, state, ResolveSecret) ?? "");
            using var resp = await _http.SendAsync(req, cancellationToken).ConfigureAwait(false);
            if ((int)resp.StatusCode >= 400)
            {
                MateuLogging.For("Mateu.RestProxy").LogWarning(
                    "Proxied {Method} {Url} answered {Status}", method, StripQuery(url), (int)resp.StatusCode);
                return null;
            }
            await using var stream = await resp.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            return await JsonSerializer.DeserializeAsync<JsonElement>(stream, cancellationToken: cancellationToken)
                .ConfigureAwait(false);
        }
        catch (Exception e) when (e is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            // The url may carry an interpolated secret in its query: log it without the query.
            MateuLogging.For("Mateu.RestProxy").LogWarning(
                "Proxied fetch of {Url} failed: {Error}", StripQuery(url), e.Message);
            return null;
        }
    }

    private static string StripQuery(string url)
    {
        var q = url.IndexOf('?');
        return q < 0 ? url : url[..q];
    }

    /// <summary>Resolve a secret: the injected provider first, then the environment — but ONLY a
    /// variable prefixed <c>MATEU_SECRET_</c> (<c>${secret.API_TOKEN}</c> reads
    /// <c>MATEU_SECRET_API_TOKEN</c>), so a template cannot read any variable of the process
    /// (database passwords, cloud credentials) and send it to an endpoint.</summary>
    public string? ResolveSecret(string key) =>
        secrets?.Invoke(key) ?? Environment.GetEnvironmentVariable(UrlTemplate.SecretEnvName(key));

    private static string ValueOf(string expr, Dictionary<string, object?> state, Func<string, string?> secrets)
    {
        if (expr.StartsWith("state.")) return StateString(GetState(state, expr[6..])) ?? "";
        if (expr.StartsWith("secret.")) return secrets(expr[7..]) ?? "";
        return "";
    }

    /// <summary>Interpolate ${state.x}/${secret.X} placeholders (unknown → empty).</summary>
    private static string Interpolate(string? template, Dictionary<string, object?> state, Func<string, string?> secrets)
    {
        if (string.IsNullOrEmpty(template)) return template ?? "";
        return Regex.Replace(template, @"\$\{([^}]+)\}", m => ValueOf(m.Groups[1].Value.Trim(), state, secrets));
    }

    /// <summary>The source a proxied fetch may hit: ONLY one the routed view declares — by
    /// attribute, or at runtime as an <see cref="Mateu.Uidl.IRestSourceSupplier"/> (the instance is
    /// built and bound from the state like any action target) — with a catalogue reference resolved
    /// from the server's table. Never a url from the request.</summary>
    private RestDataSourceDto? ResolveProxySource(Type type, RunActionRqDto rq, string? kind, string? id)
    {
        object? instance = null;
        if (typeof(Mateu.Uidl.IRestSourceSupplier).IsAssignableFrom(type)
            && type is { IsAbstract: false } && type.GetConstructor(Type.EmptyTypes) is not null)
        {
            instance = Activator.CreateInstance(type)!;
            BindState(instance, rq.ComponentState);
        }
        return ReflectionMapper.ResolveRestSource(type, instance, kind, id);
    }
}
