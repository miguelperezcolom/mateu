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
        // the route's parameters over the state on this leg too — FIXED ones win over whatever the
        // client sent, as on the route load (a pin enforced only in the browser would be a suggestion;
        // mirrors Java's RouteSegmentUtils applied to the proxied fetch)
        if (_routes.Match(rq.Route) is { } routeMatch)
            rq = rq with { ComponentState = routeMatch.Params(rq.ComponentState, RequestQuery?.Invoke()) };
        object? json = new Dictionary<string, object?>();
        var kind = StateString(GetState(rq.Parameters, "_sourceKind"));
        var id = StateString(GetState(rq.Parameters, "_sourceId"));
        var type = registry.Resolve(rq.ServerSideType, rq.Route);
        if (type is not null)
        {
            ActionGuard.EnsureViewVisible(type);
            EnsureMayFetch(type, kind, id);
        }
        // a definition-only page (no class): the source is the one its OWN `actions:` declares for
        // that id, resolved against the server's catalogue (Java's SeededYamlPage as a
        // RestSourceSupplier) — the only channel that injects ${secret.X} for such a page. A refused
        // action is not in the caller's copy (and GuardYamlAccess already answered 403).
        // Its listings' rows and its selects' options likewise: what the LAYOUT declares, by the
        // listing's / field's id — never a client-supplied url.
        var definitionSource = type is null
                               && PersonalSpec(rq.Route) is { Shell: null } spec && string.IsNullOrEmpty(spec.ModelView)
            ? YamlDeclaredActions.SourceFor(YamlDeclaredActions.SourcesOf(spec.Actions, spec.Layout), kind, id)
            : null;
        if (type is not null || definitionSource is not null)
        {
            var source = type is not null ? ResolveProxySource(type, rq, kind, id) : definitionSource;
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
                // the pin wins over the action's parameters too, and over each selected row below
                var pinned = _routes.Match(rq.Route)?.Entry.FixedParams;
                var state = WithPinned(CallState(rq), pinned);
                // Bulk (forEachSelectedRow): the loop runs HERE, once per selected listing row, each
                // row merged over the state so `.../people/${state.id}` resolves to that row's id —
                // one round trip, the secret stays server-side (Java's RestProxyCalls.forEachSelectedRow)
                if (StateString(GetState(rq.Parameters, "_forEachSelectedRow")) is "true" or "True")
                    return await ForEachSelectedRowAsync(source, state, pinned, cancellationToken).ConfigureAwait(false);
                var (body, status, detail) = await FetchProxyAsync(source, state, cancellationToken).ConfigureAwait(false);
                if (status is { } failed)
                    return RestFetchError(failed, "Request failed" + StatusSuffix(failed), detail);
                json = body ?? new Dictionary<string, object?>();
            }
        }
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = json }, null);
    }

    /// <summary>Refuses a proxy fetch whose declaring member the caller may not use: the
    /// [EyesOnly]/[DisabledUnless] of an <c>action</c> method, the [EyesOnly] of an <c>options</c>
    /// property — the answer the method or the field would give if asked directly (Java's
    /// RestSourceResolver.checkAccess). Without it a caller who gets no button could still send
    /// <c>__restfetch__</c> and have the server make the call, secrets included. <c>rows</c> and
    /// <c>data</c> are declared on the class, whose [EyesOnly] <see cref="ActionGuard.EnsureViewVisible"/>
    /// already enforced.</summary>
    internal static void EnsureMayFetch(Type type, string? kind, string? id)
    {
        if (string.IsNullOrEmpty(id)) return;
        switch (kind)
        {
            case "action":
                foreach (var m in type.GetMethods().Where(m => m.Name == id || Naming.CamelCase(m.Name) == id))
                {
                    if (!ActionGuard.Authorized(m.Find<Mateu.Uidl.DisabledUnlessAttribute>()))
                        ActionGuard.Deny($"proxied action '{id}' on {type.FullName} denied by [DisabledUnless]");
                    if (!ActionGuard.Authorized(m.Find<Mateu.Uidl.EyesOnlyAttribute>()))
                        ActionGuard.Deny($"proxied action '{id}' on {type.FullName} denied by [EyesOnly]");
                }
                break;
            case "options":
                foreach (var p in type.GetProperties().Where(p => p.Name == id || Naming.CamelCase(p.Name) == id))
                    if (!ActionGuard.Authorized(p.Find<Mateu.Uidl.EyesOnlyAttribute>()))
                        ActionGuard.Deny($"proxied options '{id}' on {type.FullName} denied by [EyesOnly]");
                break;
        }
    }

    /// <summary>The proxy's own routing keys: what to call, never a value to interpolate.</summary>
    private static readonly HashSet<string> RoutingParameters = ["_sourceKind", "_sourceId", "_forEachSelectedRow"];

    /// <summary>The state a proxied call interpolates with: the component state with the action's
    /// parameters over it — a kanban move's <c>_cardId</c>/<c>_toColumnId</c> reach
    /// <c>${state._toColumnId}</c> as on the browser's direct leg (Java's RestProxyCalls.callState).</summary>
    private static Dictionary<string, object?> CallState(RunActionRqDto rq)
    {
        var state = new Dictionary<string, object?>(rq.ComponentState ?? []);
        if (rq.Parameters is not null)
            foreach (var (key, value) in rq.Parameters)
                if (!RoutingParameters.Contains(key)) state[key] = value;
        return state;
    }

    private static Dictionary<string, object?> WithPinned(
        Dictionary<string, object?> state, IReadOnlyDictionary<string, object?>? pinned)
    {
        if (pinned is not null)
            foreach (var (key, value) in pinned) state[key] = value;
        return state;
    }

    /// <summary><c>_appsource</c>: a PROXIED source the mount's <c>type: AppShell</c> declares, by
    /// role (<c>_appSource</c>) and, for a context picker, field (<c>_field</c>); resolved against the
    /// server's catalogue and never taken from the request, so it cannot be turned into an open
    /// proxy. A direct source is the browser's to fetch (403); a role the shell does not fill answers
    /// a 404 <c>_restfetchError</c> (Java's RestProxyCalls.appSourceCall).</summary>
    private async Task<UIIncrementDto> AppSourceResponseAsync(RunActionRqDto rq, CancellationToken cancellationToken)
    {
        var shell = PersonalSpec(_routes.MountOf(rq.Route) ?? "")?.Shell;
        var declared = shell is null
            ? null
            : YamlAppShell.DeclaredSource(shell,
                StateString(GetState(rq.Parameters, "_appSource")) ?? "",
                StateString(GetState(rq.Parameters, "_field")) ?? "");
        if (declared is null) return RestFetchError(404, "The app shell declares no such source", null);
        var source = MateuCatalogs.Resolved(declared)!;
        if (source is { Sample: { } sample } && SampleMode)
            return new UIIncrementDto([], [], [], [], false, new Dictionary<string, object?>
            {
                ["_restfetch"] = SampleSources.IsRead(source.Method) ? sample : new Dictionary<string, object?>(),
            }, null);
        if (source is { Proxy: false } && !string.IsNullOrEmpty(source.Url))
            throw new MateuForbiddenException("_appsource: the shell's source is not a proxied source (Proxy = true)");
        // the variables the browser interpolates with (searchText, ids…), minus the routing keys
        var state = (rq.Parameters ?? []).Where(p => !p.Key.StartsWith('_')).ToDictionary(p => p.Key, p => p.Value);
        var (body, status, detail) = await FetchProxyAsync(source, state, cancellationToken).ConfigureAwait(false);
        if (status is { } failed)
            return RestFetchError(failed, "Request failed" + StatusSuffix(failed), detail);
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = body ?? new Dictionary<string, object?>() }, null);
    }

    private async Task<UIIncrementDto> ForEachSelectedRowAsync(
        RestDataSourceDto source, Dictionary<string, object?> state, IReadOnlyDictionary<string, object?>? pinned,
        CancellationToken cancellationToken)
    {
        var rows = new List<object?>();
        switch (GetState(state, "crud_selected_items"))
        {
            case JsonElement { ValueKind: JsonValueKind.Array } array:
                rows.AddRange(array.EnumerateArray().Select(e => (object?)e));
                break;
            case System.Collections.IEnumerable list and not string:
                rows.AddRange(list.Cast<object?>());
                break;
        }
        var failedCount = 0;
        (int Status, string? Detail)? first = null;
        foreach (var row in rows)
        {
            var rowState = new Dictionary<string, object?>(state);
            switch (row)
            {
                case JsonElement { ValueKind: JsonValueKind.Object } el:
                    foreach (var p in el.EnumerateObject()) rowState[p.Name] = p.Value;
                    break;
                case IDictionary<string, object?> map:
                    foreach (var (k, v) in map) rowState[k] = v;
                    break;
            }
            WithPinned(rowState, pinned);
            var (_, status, detail) = await FetchProxyAsync(source, rowState, cancellationToken).ConfigureAwait(false);
            if (status is { } failed)
            {
                failedCount++;
                first ??= (failed, detail);
            }
        }
        // a failed row must not read as success: surface it rather than reload as if all were done
        if (first is { } error)
            return RestFetchError(error.Status, $"{failedCount} of {rows.Count} failed" + StatusSuffix(error.Status), error.Detail);
        // the rows are gone; the client reloads the listing (successRoute), so no body is needed
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetch"] = new Dictionary<string, object?>() }, null);
    }

    private static string StatusSuffix(int status) => status > 0 ? $" (HTTP {status})" : "";

    /// <summary>A failed proxied call (Java's restFetchError, same texts): <c>{status, message}</c>
    /// plus what the service said, which the renderer shows instead.</summary>
    private static UIIncrementDto RestFetchError(int status, string message, string? detail)
    {
        var error = new Dictionary<string, object?> { ["status"] = status, ["message"] = message };
        if (detail is not null) error["detail"] = detail;
        return new UIIncrementDto([], [], [], [], false,
            new Dictionary<string, object?> { ["_restfetchError"] = error }, null);
    }

    /// <summary>Fetch a resolved source server-side (url/headers/body interpolated). Answers the
    /// parsed body (an empty body — a 204 — is an empty object), or the failure status: the upstream's
    /// for a &gt;=300 answer (a redirect is not followed: it would carry the source's headers, a
    /// <c>${secret.X}</c> included, to wherever it points), 0 for a transport error — logged without the url's query, which may carry
    /// an interpolated secret.</summary>
    private async Task<(object? Body, int? FailedStatus, string? Detail)> FetchProxyAsync(
        RestDataSourceDto source, Dictionary<string, object?> state, CancellationToken cancellationToken)
    {
        // values percent-encoded by position: client state cannot steer the server's request
        var url = UrlTemplate.Interpolate(source.Url, expr => ValueOf(expr, state, ResolveSecret));
        try
        {
            // a relative url is this app's own endpoint (it failed as "an invalid request URI")
            url = AbsoluteProxyUrl(url)
                  ?? throw new InvalidOperationException(
                      "a proxied source with a relative url needs this server's base url: set MateuOptions.SelfBaseUrl");
            var method = string.IsNullOrWhiteSpace(source.Method) ? "GET" : source.Method!.ToUpperInvariant();
            // a child activity of the request's, named by the url TEMPLATE without its query (never a
            // secret, never a value of the state); HttpClient's own activity nests under it
            using var activity = Observability.MateuTelemetry.Source.StartActivity(
                "mateu rest_proxy " + method, System.Diagnostics.ActivityKind.Client);
            activity?.SetTag("http.request.method", method);
            activity?.SetTag("url.template", source.Url is null ? null : StripQuery(source.Url));
            activity?.SetTag("mateu.rest_source", source.Ref);
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
            activity?.SetTag("http.response.status_code", (int)resp.StatusCode);
            if ((int)resp.StatusCode >= 300)
            {
                activity?.SetStatus(System.Diagnostics.ActivityStatusCode.Error);
                MateuLogging.For("Mateu.RestProxy").LogWarning(
                    "Proxied {Method} {Url} answered {Status}", ForLog(method), ForLog(StripQuery(url)), (int)resp.StatusCode);
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
                "Proxied fetch of {Url} failed: {Error}", ForLog(StripQuery(url)), e.GetType().Name);
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

    /// <summary>A value fit for one log line: an interpolated url (or a method) cannot forge a new entry.</summary>
    private static string ForLog(string? value) =>
        value is null ? "" : value.Replace("\r", "").Replace("\n", "");

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
