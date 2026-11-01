using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

// Proxy-mode REST fetch: the __restfetch__ reserved action (Java: RunActionUseCase proxy + RestSourceResolver).
internal sealed partial class SyncHandler
{
    /// <summary>The __restfetch__ reserved action: resolve the DECLARED source of the routed view by
    /// _sourceKind/_sourceId, interpolate ${state.x}/${secret.X}, fetch server-side and return the
    /// raw JSON on appData._restfetch (an empty object when the view declares no such source). A
    /// failed call (a &gt;=400 upstream answer, or a transport error) answers
    /// appData._restfetchError <c>{status, message}</c> instead — Java's restFetchError, same texts —
    /// so the renderer shows an error rather than toasting "Saved" over a write that never happened.</summary>
    private async Task<UIIncrementDto> RestFetchResponseAsync(RunActionRqDto rq, CancellationToken cancellationToken)
    {
        object? json = new Dictionary<string, object?>();
        if (registry.Resolve(rq.ServerSideType, rq.Route) is { } type)
        {
            ActionGuard.EnsureViewVisible(type);
            var kind = StateString(GetState(rq.Parameters, "_sourceKind"));
            var id = StateString(GetState(rq.Parameters, "_sourceId"));
            var source = ResolveProxySource(type, rq, kind, id);
            // SAMPLE mode (opt-in only): a source carrying sample data answers with it instead of
            // being called — the proxied twin of the browser's short-circuit, so both legs agree. A
            // read gets the sample; a write succeeds without persisting anything.
            if (source is { Sample: { } sample } && SampleMode)
                json = SampleSources.IsRead(source.Method) ? sample : new Dictionary<string, object?>();
            else if (source is { Proxy: false } direct && !string.IsNullOrEmpty(direct.Url))
                // a DIRECT source is the browser's to call: proxying it on request ran a server-side
                // call (with ${secret.X} resolved) the author never asked for — refused (403)
                throw new MateuForbiddenException(
                    $"__restfetch__: {kind}/{id} is not a proxied source (Proxy = true)");
            else if (source is not null)
            {
                var (body, status, detail) = await FetchProxyAsync(source, rq.ComponentState, cancellationToken).ConfigureAwait(false);
                if (status is { } failed)
                {
                    var error = new Dictionary<string, object?>
                    {
                        ["status"] = failed,
                        ["message"] = "Request failed" + (failed > 0 ? $" (HTTP {failed})" : ""),
                    };
                    // what the service said (its error body): the renderer shows it instead
                    if (detail is not null) error["detail"] = detail;
                    return new UIIncrementDto([], [], [], [], false,
                        new Dictionary<string, object?> { ["_restfetchError"] = error }, null);
                }
                json = body ?? new Dictionary<string, object?>();
            }
        }
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = json }, null);
    }

    /// <summary>Fetch a resolved source server-side (url/headers/body interpolated). Answers the
    /// parsed body (an empty body — a 204 — is an empty object), or the failure status: the upstream's
    /// for a &gt;=400 answer, 0 for a transport error — logged without the url's query, which may carry
    /// an interpolated secret.</summary>
    private async Task<(object? Body, int? FailedStatus, string? Detail)> FetchProxyAsync(
        RestDataSourceDto source, Dictionary<string, object?> state, CancellationToken cancellationToken)
    {
        // values percent-encoded by position: client state cannot steer the server's request
        var url = UrlTemplate.Interpolate(source.Url, expr => ValueOf(expr, state, ResolveSecret));
        try
        {
            var method = string.IsNullOrWhiteSpace(source.Method) ? "GET" : source.Method!.ToUpperInvariant();
            using var req = new HttpRequestMessage(new HttpMethod(method), url);
            req.Headers.Accept.ParseAdd("application/json");
            if (method is not "GET" and not "HEAD" && !string.IsNullOrWhiteSpace(source.Body))
            {
                // The values go into the body ESCAPED when the request declares JSON: a quote or a
                // newline in a value would otherwise close the string early (or inject members).
                Func<string, string>? escape = DeclaresJson(source.Headers) ? JsonEscape : null;
                req.Content = new StringContent(Interpolate(source.Body, state, ResolveSecret, escape) ?? "");
            }
            if (source.Headers is not null)
                foreach (var (k, v) in source.Headers)
                {
                    var value = Interpolate(v, state, ResolveSecret);
                    // Content headers (Content-Type…) belong to the content: on the request they were
                    // silently dropped, so a declared JSON body travelled as text/plain.
                    if (req.Content is not null && k.StartsWith("Content-", StringComparison.OrdinalIgnoreCase))
                    {
                        req.Content.Headers.Remove(k);
                        req.Content.Headers.TryAddWithoutValidation(k, value);
                    }
                    else req.Headers.TryAddWithoutValidation(k, value);
                }
            using var resp = await _http.SendAsync(req, cancellationToken).ConfigureAwait(false);
            if ((int)resp.StatusCode >= 400)
            {
                MateuLogging.For("Mateu.RestProxy").LogWarning(
                    "Proxied {Method} {Url} answered {Status}", method, StripQuery(url), (int)resp.StatusCode);
                string? detail = null;
                try { detail = ServiceMessageOf(await resp.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false)); }
                catch (Exception) when (!cancellationToken.IsCancellationRequested) { detail = null; }
                return (null, (int)resp.StatusCode, detail);
            }
            var text = await resp.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            if (string.IsNullOrWhiteSpace(text)) return (new Dictionary<string, object?>(), null, null);
            return (JsonSerializer.Deserialize<JsonElement>(text), null, null);
        }
        catch (Exception e) when (e is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            // The url may carry an interpolated secret in its query: log it without the query.
            MateuLogging.For("Mateu.RestProxy").LogWarning(
                "Proxied fetch of {Url} failed: {Error}", StripQuery(url), e.GetType().Name);
            return (null, 0, null);
        }
    }

    private const int ServiceMessageMax = 300;

    /// <summary>What an error body says, for a person (Java's RestProxyCalls.serviceMessageOf, same
    /// rule): a JSON object's <c>message</c>, <c>detail</c> (RFC 7807), <c>error</c> (a string, or an
    /// object with a message) or <c>title</c>; else short plain text (never HTML or a list); control
    /// characters out, whitespace folded, at most 300 characters; null when nothing is worth showing.</summary>
    internal static string? ServiceMessageOf(string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return null;
        var text = body.Trim();
        if (text.StartsWith('{'))
        {
            try
            {
                using var doc = JsonDocument.Parse(text);
                if (doc.RootElement.ValueKind != JsonValueKind.Object) return null;
                foreach (var key in new[] { "message", "detail", "error", "title" })
                {
                    if (!doc.RootElement.TryGetProperty(key, out var value)) continue;
                    if (value.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(value.GetString()))
                        return Clipped(value.GetString()!);
                    if (value.ValueKind == JsonValueKind.Object && value.TryGetProperty("message", out var nested)
                        && nested.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(nested.GetString()))
                        return Clipped(nested.GetString()!);
                }
            }
            catch (JsonException)
            {
                return null;
            }
            return null;
        }
        if (text.StartsWith('<') || text.StartsWith('[') || text.Length > ServiceMessageMax) return null;
        return Clipped(text);
    }

    private static string? Clipped(string text)
    {
        var clean = Regex.Replace(Regex.Replace(text, "[\\u0000-\\u0009\\u000b-\\u001f\\u007f]", ""), "\\s+", " ").Trim();
        if (clean.Length == 0) return null;
        return clean.Length > ServiceMessageMax ? clean[..(ServiceMessageMax - 1)] + "…" : clean;
    }

    /// <summary>Whether the request declares a JSON body (a Content-Type naming json) — Java's
    /// TemplateInterpolator.declaresJson.</summary>
    internal static bool DeclaresJson(IReadOnlyDictionary<string, string>? headers) =>
        headers is not null && headers.Any(h =>
            string.Equals(h.Key, "Content-Type", StringComparison.OrdinalIgnoreCase)
            && h.Value is not null && h.Value.Contains("json", StringComparison.OrdinalIgnoreCase));

    /// <summary>The value as the inside of a JSON string literal (Java's TemplateInterpolator.jsonEscape).</summary>
    internal static string JsonEscape(string value)
    {
        var quoted = JsonSerializer.Serialize(value, new JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        });
        return quoted[1..^1];
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

    /// <summary>A placeholder's text: <c>state.x</c>, <c>state.x.y</c>, <c>secret.X</c>, <c>a ?? b</c>,
    /// <c>encodeURIComponent(x)</c>; a money value lands as its amount (<see cref="UrlTemplate.ValueOf"/>).</summary>
    private static string ValueOf(string expr, Dictionary<string, object?> state, Func<string, string?> secrets) =>
        UrlTemplate.ValueOf(expr, state, secrets);

    /// <summary>Interpolate ${state.x}/${secret.X} placeholders (unknown → empty); <paramref name="escape"/>
    /// applies to each VALUE, never to the template's own punctuation.</summary>
    private static string Interpolate(string? template, Dictionary<string, object?> state, Func<string, string?> secrets,
        Func<string, string>? escape = null)
    {
        if (string.IsNullOrEmpty(template)) return template ?? "";
        return Regex.Replace(template, @"\$\{([^}]+)\}", m =>
        {
            var value = ValueOf(m.Groups[1].Value.Trim(), state, secrets);
            return escape is null ? value : escape(value);
        });
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
