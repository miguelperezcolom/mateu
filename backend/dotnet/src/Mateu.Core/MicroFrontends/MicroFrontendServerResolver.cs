using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.MicroFrontends;

/// <summary>Resolves, while the host builds a response, the micro frontends declared
/// <c>Resolve.Server</c> (and the content slots): asks their remotes in parallel, on the user's
/// behalf, within the view's time budget, and embeds what arrives in time. What does not — slow,
/// failing, down — goes out as it would have with <c>Resolve.Client</c> (the renderer asks), or as
/// its fallback for a content slot. So it never makes a screen worse than resolving in the client.
/// <list type="number">
/// <item>each one must be under a registered remote (<see cref="IRemoteRegistry"/>): if not, that is
/// a configuration error, the response fails and nothing is asked (no server-side request forgery
/// from a UI definition);</item>
/// <item>the budget is the largest timeout among them, capped by MaxBudgetMs; each waits its own
/// timeout within it, and the calls still running at their deadline are cancelled;</item>
/// <item>each call carries the caller's identity as its remote's strategy says, and the
/// correlation id (<c>X-Mateu-Correlation-Id</c>);</item>
/// <item>a remote may declare its answer cacheable (<c>fragmentCache</c>); the host obeys;</item>
/// <item>every fragment leaves a trace (log category <c>Mateu.MicroFrontends</c>) and is told to
/// the <see cref="IMicroFrontendResolutionListener"/>s.</item>
/// </list>
/// Resolving is not absorbing: the embedded answer keeps the micro frontend's base url, route and
/// type, and the renderer sends everything after the first paint to the remote. (Mirrors Java's
/// MicroFrontendServerResolver.)</summary>
internal sealed class MicroFrontendServerResolver(
    IRemoteRegistry registry,
    HttpClient http,
    IFragmentCacheStore cache,
    RemoteIdentityStrategies identities,
    ICorrelationIdProvider correlation,
    IReadOnlyList<IMicroFrontendResolutionListener> listeners,
    MicroFrontendSettings settings)
{
    public const string FragmentKeysHeader = FragmentCachePolicies.FragmentKeysHeader;
    private const int MaxKnownKeys = 16;

    private static readonly string[] RestrictedHeaders = ["connection", "content-length", "expect", "host", "upgrade"];

    /// <summary>A resolver with Mateu's defaults and no remotes (a handler built without the adapter).</summary>
    public static MicroFrontendServerResolver Default(HttpClient http) => new(
        new DefaultRemoteRegistry([]), http, new InMemoryFragmentCacheStore(), new RemoteIdentityStrategies(),
        new DefaultCorrelationIdProvider(), [], MicroFrontendSettings.Defaults);

    private static ILogger Trace => MateuLogging.For("Mateu.MicroFrontends");

    /// <summary>The increment with its server-resolved micro frontends resolved, embedded or degraded.</summary>
    public async Task<UIIncrementDto> ResolveAsync(UIIncrementDto increment, IncomingRequest request,
        Func<string?>? requestSelfBaseUrl = null, CancellationToken cancellationToken = default)
    {
        var found = MicroFrontendTree.Collect(increment);
        if (found.Count == 0) return increment;
        // planned up front: a configuration error fails the response before anything is asked
        // a remote registered as a path on this server is called at the configured self base url,
        // else at the adapter's view of the local socket — never at a request header
        Func<string?> self = () => settings.SelfBaseUrl ?? requestSelfBaseUrl?.Invoke();
        var plans = found.Select(each => Plan(each, self)).ToList();
        var budget = Math.Min(plans.Max(p => p.TimeoutMs), settings.MaxBudgetMs);
        var correlationId = correlation.CorrelationId(request);
        var replacements = await Task.WhenAll(plans.Select(plan =>
            FetchAsync(plan, Math.Min(plan.TimeoutMs, budget), request, correlationId, cancellationToken)));
        var byHost = new Dictionary<ClientSideComponentDto, ComponentDto>(ReferenceEqualityComparer.Instance);
        for (var i = 0; i < plans.Count; i++) byHost[plans[i].Found.Host] = replacements[i];
        return MicroFrontendTree.Rewrite(increment, byHost);
    }

    private sealed record PlanOf(
        MicroFrontendTree.Found Found,
        MicroFrontendMetadataDto MicroFrontend,
        RemoteDescriptor? Remote,
        string? CallBaseUrl,
        int TimeoutMs,
        string? SlotKey,
        ComponentDto? Fallback,
        bool DegradeToClient,
        string? Problem);

    private PlanOf Plan(MicroFrontendTree.Found found, Func<string?>? requestSelfBaseUrl)
    {
        var microFrontend = found.MicroFrontend;
        var server = microFrontend.Server!;
        if (server.SlotKey is not null)
        {
            // a content slot: the content remote, at the route its key names
            server = server with { RemoteId = server.RemoteId ?? settings.ContentRemoteId };
            microFrontend = microFrontend with
            {
                Route = microFrontend.Route ?? settings.ContentRouteFor(server.SlotKey),
                Resolved = null,
                Server = server,
            };
        }
        RemoteDescriptor? remote;
        if (server.RemoteId is not null)
        {
            remote = registry.ById(server.RemoteId);
            // a slot names its remote: the url is built from it, the developer never writes it
            if (remote is not null) microFrontend = microFrontend with { BaseUrl = remote.BaseUrl };
        }
        else
        {
            remote = microFrontend.BaseUrl is null ? null : registry.ForUrl(microFrontend.BaseUrl);
        }
        string? problem = null;
        string? callBaseUrl = null;
        if (remote is null)
        {
            problem = server.RemoteId is not null
                ? $"no remote is registered as '{server.RemoteId}'"
                : $"{microFrontend.BaseUrl} is not under any registered remote (MateuOptions.Remotes)";
        }
        else
        {
            callBaseUrl = Absolute(microFrontend.BaseUrl, requestSelfBaseUrl);
            if (callBaseUrl is null)
                problem = $"its base url {microFrontend.BaseUrl} is a path on this server and this server does not"
                          + " know its own base url: set MateuOptions.SelfBaseUrl";
        }
        if (problem is not null && server.SlotKey is null)
            // a plain micro frontend the host may not ask: a configuration error, never degraded
            // (a content slot paints its fallback instead: it never brings the screen down)
            throw new InvalidOperationException(
                $"Micro frontend {Describe(microFrontend)} is resolve = Server but {problem}");
        // an unknown identity strategy is a configuration error too — before anything is asked
        if (remote is not null) identities.Of(remote);
        var timeout = server.TimeoutMs is > 0 ? server.TimeoutMs.Value
            : remote?.TimeoutMs is > 0 ? remote.TimeoutMs.Value
            : settings.DefaultTimeoutMs;
        return new PlanOf(found, microFrontend, remote, callBaseUrl, timeout, server.SlotKey, server.Fallback,
            server.DegradeToClient, problem);
    }

    private sealed record Answer(JsonObject? Increment, MicroFrontendResolutionOutcome Outcome, string? Error = null);

    private async Task<ComponentDto> FetchAsync(PlanOf plan, int timeoutMs, IncomingRequest request,
        string correlationId, CancellationToken cancellationToken)
    {
        var started = Stopwatch.GetTimestamp();
        if (plan.Problem is not null)
            // only a content slot gets here: its remote is not configured, the screen does not fail —
            // and with no remote to point at, the renderer could not ask it either
            return Fallback(plan, started, MicroFrontendResolutionOutcome.Error, correlationId, plan.Problem);
        var url = UrlOf(plan);
        var strategy = identities.Of(plan.Remote!);
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        deadline.CancelAfter(timeoutMs);
        Answer answer;
        try
        {
            // a strategy may block (a token exchange): never on the request thread
            var identityHeaders = await Task.Run(() => strategy.Headers(plan.Remote!, request), deadline.Token)
                .WaitAsync(deadline.Token).ConfigureAwait(false);
            var callerKey = FragmentCacheKeys.Caller(request.UserName, AuthorizationOf(identityHeaders));
            if (Cached(url, callerKey) is { } cached)
            {
                answer = new Answer(cached, MicroFrontendResolutionOutcome.FromCache);
            }
            else
            {
                var headers = new Dictionary<string, string>(identityHeaders, StringComparer.OrdinalIgnoreCase)
                {
                    [DefaultCorrelationIdProvider.Header] = correlationId,
                };
                if (cache.Get(FragmentCacheKeys.Known(url)) is { } known && !string.IsNullOrWhiteSpace(known))
                    headers[FragmentKeysHeader] = known;
                var received = await SendAsync(plan.CallBaseUrl!, RequestFor(plan.MicroFrontend), headers, deadline.Token)
                    .ConfigureAwait(false);
                answer = Received(url, callerKey, received);
            }
        }
        catch (OperationCanceledException) when (deadline.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            return Degrade(plan, started, MicroFrontendResolutionOutcome.Timeout, correlationId, null);
        }
        catch (Exception e) when (!cancellationToken.IsCancellationRequested)
        {
            return Degrade(plan, started, MicroFrontendResolutionOutcome.Error, correlationId, MessageOf(e));
        }
        if (answer.Outcome == MicroFrontendResolutionOutcome.Error)
            return Degrade(plan, started, MicroFrontendResolutionOutcome.Error, correlationId, answer.Error);
        if (plan.SlotKey is not null && IsEmpty(answer.Increment))
            return Degrade(plan, started, MicroFrontendResolutionOutcome.Empty, correlationId, null);
        TraceOf(plan, started, answer.Outcome, null, correlationId, null);
        return plan.Found.Host with
        {
            Metadata = plan.MicroFrontend with { Resolved = Embeddable(answer.Increment), Server = null },
        };
    }

    /// <summary>What the host had for this url and caller, when the remote allowed it.</summary>
    private JsonObject? Cached(string url, string callerKey)
    {
        var rule = cache.Get(FragmentCacheKeys.Rule(url));
        if (rule is null) return null;
        string? key = null;
        if (rule == FragmentVary.Key)
        {
            key = cache.Get(FragmentCacheKeys.Memo(url, callerKey));
            if (key is null) return null;
        }
        var varying = FragmentCacheKeys.Varying(rule, callerKey, key);
        return varying is null ? null : Read(cache.Get(FragmentCacheKeys.Entry(url, varying)));
    }

    /// <summary>What the remote answered, remembered as it allowed.</summary>
    private Answer Received(string url, string callerKey, JsonObject answer)
    {
        var policy = PolicyOf(answer);
        if (policy is { NotModified: true })
        {
            // "use yours": the host offered this key, the entry must still be there
            var mine = policy.Key is null ? null : Read(cache.Get(FragmentCacheKeys.Entry(url, "key:" + policy.Key)));
            if (mine is null)
                return new Answer(null, MicroFrontendResolutionOutcome.Error, "remote answered not-modified for a key not held");
            Remember(url, callerKey, policy, null);
            return new Answer(mine, MicroFrontendResolutionOutcome.FromCache);
        }
        var embeddable = Embeddable(answer);
        if (FragmentCacheKeys.Cacheable(policy)) Remember(url, callerKey, policy!, embeddable);
        return new Answer(embeddable, MicroFrontendResolutionOutcome.Embedded);
    }

    private void Remember(string url, string callerKey, FragmentCacheDto policy, JsonObject? fragment)
    {
        var ttl = TimeSpan.FromSeconds(policy.MaxAgeSeconds);
        var vary = FragmentCacheKeys.Normalised(policy.VaryBy);
        cache.Put(FragmentCacheKeys.Rule(url), vary, ttl);
        if (vary == FragmentVary.Key && policy.Key is not null)
        {
            cache.Put(FragmentCacheKeys.Memo(url, callerKey), policy.Key, ttl);
            var known = new List<string> { policy.Key };
            if (cache.Get(FragmentCacheKeys.Known(url)) is { } before)
                foreach (var key in before.Split(','))
                    if (!string.IsNullOrWhiteSpace(key) && known.Count < MaxKnownKeys && !known.Contains(key.Trim()))
                        known.Add(key.Trim());
            cache.Put(FragmentCacheKeys.Known(url), string.Join(",", known), ttl);
        }
        if (fragment is not null && FragmentCacheKeys.Varying(vary, callerKey, policy.Key) is { } varying)
            cache.Put(FragmentCacheKeys.Entry(url, varying), fragment.ToJsonString(), ttl);
    }

    private static FragmentCacheDto? PolicyOf(JsonObject answer)
    {
        if (answer["fragmentCache"] is not JsonObject policy) return null;
        var maxAge = policy["maxAgeSeconds"] is JsonValue m && m.TryGetValue<int>(out var seconds) ? seconds : 0;
        var varyBy = policy["varyBy"] is JsonValue v && v.TryGetValue<string>(out var vary) ? vary : null;
        var key = policy["key"] is JsonValue k && k.TryGetValue<string>(out var keyText) ? keyText : null;
        var notModified = policy["notModified"] is JsonValue n && n.TryGetValue<bool>(out var flag) && flag;
        return new FragmentCacheDto(maxAge, varyBy!) { Key = key, NotModified = notModified };
    }

    /// <summary>The remote's answer as embedded: its fragments, nothing that would act on the HOST's
    /// page — commands (a window title, a navigation), messages, banners and the app state/data belong
    /// to a page and an app, and both are the host's.</summary>
    private static JsonObject? Embeddable(JsonObject? answer)
    {
        if (answer is null) return null;
        var embedded = new JsonObject
        {
            ["commands"] = new JsonArray(),
            ["messages"] = new JsonArray(),
            ["fragments"] = answer["fragments"]?.DeepClone() ?? new JsonArray(),
            ["banners"] = new JsonArray(),
            ["appendBanners"] = false,
            ["appData"] = null,
            ["appState"] = null,
        };
        if (answer["wireVersion"] is { } wireVersion) embedded["wireVersion"] = wireVersion.DeepClone();
        if (answer["restSources"] is { } restSources) embedded["restSources"] = restSources.DeepClone();
        return embedded;
    }

    private static bool IsEmpty(JsonObject? increment) =>
        increment?["fragments"] is not JsonArray fragments
        || !fragments.Any(f => f is JsonObject fragment && fragment["component"] is not null);

    private ComponentDto Degrade(PlanOf plan, long started, MicroFrontendResolutionOutcome outcome,
        string correlationId, string? error)
    {
        if (plan.DegradeToClient)
        {
            TraceOf(plan, started, outcome, "client", correlationId, error);
            return plan.Found.Host with { Metadata = plan.MicroFrontend with { Resolved = null, Server = null } };
        }
        return Fallback(plan, started, outcome, correlationId, error);
    }

    private ComponentDto Fallback(PlanOf plan, long started, MicroFrontendResolutionOutcome outcome,
        string correlationId, string? error)
    {
        if (plan.Fallback is not null)
        {
            TraceOf(plan, started, outcome, "fallback", correlationId, error);
            return plan.Fallback;
        }
        TraceOf(plan, started, outcome, "nothing", correlationId, error);
        return MicroFrontendTree.Remove;
    }

    private void TraceOf(PlanOf plan, long started, MicroFrontendResolutionOutcome outcome, string? degradedTo,
        string correlationId, string? error)
    {
        var resolution = new MicroFrontendResolutionEvent(
            plan.Remote?.Id,
            plan.CallBaseUrl is not null ? UrlOf(plan) : Describe(plan.MicroFrontend),
            plan.SlotKey,
            (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds,
            outcome,
            degradedTo,
            correlationId,
            error);
        if (outcome == MicroFrontendResolutionOutcome.Error)
            Trace.LogWarning(
                "micro frontend remote={RemoteId} url={Url} slot={Slot} outcome={Outcome} degradedTo={DegradedTo} ms={Ms} correlationId={CorrelationId} error={Error}",
                resolution.RemoteId, resolution.Url, resolution.SlotKey, OutcomeName(outcome), resolution.DegradedTo,
                resolution.DurationMillis, resolution.CorrelationId, MateuLogging.Safe(resolution.Error));
        else
            Trace.LogInformation(
                "micro frontend remote={RemoteId} url={Url} slot={Slot} outcome={Outcome} degradedTo={DegradedTo} ms={Ms} correlationId={CorrelationId}",
                resolution.RemoteId, resolution.Url, resolution.SlotKey, OutcomeName(outcome), resolution.DegradedTo,
                resolution.DurationMillis, resolution.CorrelationId);
        foreach (var listener in listeners)
        {
            try
            {
                listener.OnResolution(resolution);
            }
            catch (Exception e)
            {
                Trace.LogWarning("An IMicroFrontendResolutionListener failed: {Error}", e.ToString());
            }
        }
    }

    /// <summary>The outcome as Java's constant (EMBEDDED, FROM_CACHE…): one log format for operators.</summary>
    internal static string OutcomeName(MicroFrontendResolutionOutcome outcome) => outcome switch
    {
        MicroFrontendResolutionOutcome.FromCache => "FROM_CACHE",
        _ => outcome.ToString().ToUpperInvariant(),
    };

    /// <summary>The load the host sends to the remote AS the island the renderer will host it in.</summary>
    private static RunActionRqDto RequestFor(MicroFrontendMetadataDto mf) => new()
    {
        ActionId = mf.ActionId ?? "",
        Route = mf.Route ?? "",
        ConsumedRoute = mf.ConsumedRoute,
        ServerSideType = mf.ServerSideType,
        AppState = AppStateOf(mf.AppState),
        ComponentState = new(),
        InitiatorComponentId = MicroFrontendIds.Of(mf),
    };

    private static Dictionary<string, object?> AppStateOf(object? value)
    {
        if (value is null) return new();
        if (value is IDictionary<string, object?> map) return new Dictionary<string, object?>(map);
        try
        {
            var node = JsonSerializer.SerializeToNode(value, WireJson.Options);
            return node is JsonObject obj
                ? JsonSerializer.Deserialize<Dictionary<string, object?>>(obj.ToJsonString(), WireJson.Options) ?? new()
                : new();
        }
        catch (Exception)
        {
            return new();
        }
    }

    private async Task<JsonObject> SendAsync(string baseUrl, RunActionRqDto call, IDictionary<string, string> headers,
        CancellationToken cancellationToken)
    {
        var path = string.IsNullOrEmpty(call.Route) ? "/_no_route" : call.Route;
        if (!path.StartsWith('/')) path = "/" + path;
        var target = ConstrainedTarget(baseUrl, path);
        using var message = new HttpRequestMessage(HttpMethod.Post, target)
        {
            Content = new StringContent(JsonSerializer.Serialize(call, WireJson.Options), Encoding.UTF8, "application/json"),
        };
        foreach (var (name, value) in headers)
            if (!string.IsNullOrWhiteSpace(value) && !RestrictedHeaders.Contains(name.ToLowerInvariant()))
                message.Headers.TryAddWithoutValidation(name, value);
        using var response = await http.SendAsync(message, HttpCompletionOption.ResponseContentRead, cancellationToken)
            .ConfigureAwait(false);
        var status = (int)response.StatusCode;
        if (status is < 200 or >= 300) throw new HttpRequestException($"HTTP {status} from {target}");
        var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        if (response.StatusCode == HttpStatusCode.NoContent || string.IsNullOrWhiteSpace(body))
            return new JsonObject { ["fragments"] = new JsonArray() };
        return JsonNode.Parse(body) as JsonObject
               ?? throw new InvalidOperationException($"The answer of {target} is not a UI increment");
    }

    /// <summary>{base}/mateu/v3/sync{path}, refused when the route would leave the remote app.</summary>
    internal static Uri ConstrainedTarget(string baseUrl, string path)
    {
        var baseUri = new Uri(baseUrl, UriKind.Absolute);
        var basePath = baseUri.AbsolutePath.TrimEnd('/');
        var target = new Uri(baseUrl.TrimEnd('/') + "/mateu/v3/sync" + path, UriKind.Absolute);
        if (!string.Equals(baseUri.Scheme, target.Scheme, StringComparison.OrdinalIgnoreCase)
            || !string.Equals(baseUri.Host, target.Host, StringComparison.OrdinalIgnoreCase)
            || baseUri.Port != target.Port
            || !string.IsNullOrEmpty(target.UserInfo)
            || !target.AbsolutePath.StartsWith(basePath + "/mateu/v3/sync/", StringComparison.Ordinal))
            throw new ArgumentException($"Route {path} leaves the remote app at {baseUrl}");
        return target;
    }

    /// <summary>What identifies the fragment for caching: everything the load sends.</summary>
    private static string UrlOf(PlanOf plan)
    {
        var mf = plan.MicroFrontend;
        var b = plan.CallBaseUrl ?? mf.BaseUrl ?? "";
        var route = mf.Route ?? "";
        var parts = new List<string>();
        if (!string.IsNullOrEmpty(mf.ServerSideType)) parts.Add("type=" + mf.ServerSideType);
        if (mf.ConsumedRoute is not null) parts.Add("consumed=" + mf.ConsumedRoute);
        if (!string.IsNullOrWhiteSpace(mf.ActionId)) parts.Add("action=" + mf.ActionId);
        if (mf.AppState is not null) parts.Add("appState=" + JsonSerializer.Serialize(mf.AppState, WireJson.Options));
        return b.TrimEnd('/') + (route.StartsWith('/') || route.Length == 0 ? route : "/" + route)
               + (parts.Count == 0 ? "" : "#" + string.Join("&", parts));
    }

    private static string? Absolute(string? baseUrl, Func<string?>? requestSelfBaseUrl)
    {
        if (baseUrl is null) return null;
        if (baseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return baseUrl;
        var self = SaneOrigin(requestSelfBaseUrl?.Invoke());
        if (self is null) return null;
        return self + (baseUrl.StartsWith('/') ? baseUrl : "/" + baseUrl);
    }

    /// <summary>A self base url as a bare http(s) origin, or null when it is not one.</summary>
    private static string? SaneOrigin(string? self)
    {
        if (string.IsNullOrWhiteSpace(self)) return null;
        if (!Uri.TryCreate(self.Trim().TrimEnd('/'), UriKind.Absolute, out var uri)
            || uri.Scheme is not ("http" or "https")
            || string.IsNullOrEmpty(uri.Host)
            || !string.IsNullOrEmpty(uri.UserInfo)
            || uri.AbsolutePath is not ("" or "/"))
            return null;
        return uri.GetLeftPart(UriPartial.Authority);
    }

    private static string? AuthorizationOf(IReadOnlyDictionary<string, string> headers) =>
        headers.FirstOrDefault(h => string.Equals(h.Key, "authorization", StringComparison.OrdinalIgnoreCase)).Value;

    private static string Describe(MicroFrontendMetadataDto mf) => (mf.BaseUrl ?? "") + (mf.Route ?? "");

    private static string MessageOf(Exception error)
    {
        var cause = error;
        while (cause.InnerException is not null) cause = cause.InnerException;
        return cause.GetType().Name + (string.IsNullOrEmpty(cause.Message) ? "" : ": " + cause.Message);
    }

    private static JsonObject? Read(string? json)
    {
        if (json is null) return null;
        try
        {
            return JsonNode.Parse(json) as JsonObject;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
