using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.MicroFrontends;

/// <summary>The knobs of server-side micro frontend resolution (Java: MicroFrontendSettings +
/// mateu.self-base-url).</summary>
internal sealed record MicroFrontendSettings(
    int DefaultTimeoutMs = 500,
    int MaxBudgetMs = 2000,
    string ContentRemoteId = "content",
    string ContentRoute = "/content-slots/{key}",
    string? SelfBaseUrl = null)
{
    public static MicroFrontendSettings Defaults { get; } = new();

    /// <summary>Positive ints / non-blank texts win, anything else keeps the default.</summary>
    public static MicroFrontendSettings Of(int? defaultTimeoutMs, int? maxBudgetMs, string? contentRemoteId,
        string? contentRoute, string? selfBaseUrl) => new(
        defaultTimeoutMs is > 0 ? defaultTimeoutMs.Value : 500,
        maxBudgetMs is > 0 ? maxBudgetMs.Value : 2000,
        string.IsNullOrWhiteSpace(contentRemoteId) ? "content" : contentRemoteId.Trim(),
        string.IsNullOrWhiteSpace(contentRoute) ? "/content-slots/{key}" : contentRoute.Trim(),
        string.IsNullOrWhiteSpace(selfBaseUrl) ? null : selfBaseUrl.Trim());

    public string ContentRouteFor(string? key) => ContentRoute.Replace("{key}", key ?? "");
}

/// <summary>Whether the response being built carries something the server has to resolve — marked
/// by the mapper that emits one, so a response without any costs no walk (Java: the
/// mateu.microfrontends.pending request attribute).</summary>
internal static class MicroFrontendPending
{
    private static readonly AsyncLocal<StrongBox<bool>?> Current = new();

    public static StrongBox<bool> Begin()
    {
        var box = new StrongBox<bool>();
        Current.Value = box;
        return box;
    }

    public static void Mark()
    {
        if (Current.Value is { } box) box.Value = true;
    }
}

/// <summary>The wire form of a <see cref="MicroFrontend"/> and a <see cref="ContentSlot"/> (Java:
/// MicroFrontendMapper).</summary>
internal static class MicroFrontendMapping
{
    public static MicroFrontendMetadataDto Metadata(MicroFrontend mf)
    {
        ServerResolutionDto? server = null;
        if (mf.Resolve == Resolve.Server)
        {
            server = new ServerResolutionDto(mf.TimeoutMs, null, null, null, true);
            MicroFrontendPending.Mark();
        }
        var meta = new MicroFrontendMetadataDto(mf.BaseUrl, mf.Route)
        {
            Style = mf.Style,
            CssClasses = mf.CssClasses,
            AppState = mf.AppState,
            Server = server,
        };
        // set only when declared: a micro frontend without them keeps its JSON byte for byte
        if (mf.ServerSideType is not null) meta = meta with { ServerSideType = mf.ServerSideType };
        if (mf.ActionId is not null) meta = meta with { ActionId = mf.ActionId };
        return meta;
    }

    public static ClientSideComponentDto Slot(ContentSlot slot)
    {
        var id = "slot_" + NonAlphanumeric.Replace(slot.Key ?? "", "_");
        ComponentDto? fallback = string.IsNullOrWhiteSpace(slot.Fallback)
            ? null
            : new ClientSideComponentDto(new TextMetadataDto(slot.Fallback) { Container = "div" }, id, [],
                slot.Style, slot.CssClasses, null);
        MicroFrontendPending.Mark();
        return new ClientSideComponentDto(
            new MicroFrontendMetadataDto(null!, null!)
            {
                Style = slot.Style,
                CssClasses = slot.CssClasses,
                Server = new ServerResolutionDto(slot.TimeoutMs, null, slot.Key, fallback, slot.DegradeToClient),
            },
            id, [], slot.Style, slot.CssClasses, null);
    }

    internal static readonly Regex NonAlphanumeric = new("[^a-zA-Z0-9]", RegexOptions.Compiled);
}

/// <summary>The id of the island a renderer hosts a micro frontend in — what the remote's fragments
/// target (Java: MicroFrontendIds; the renderers compute the same from the metadata they receive).</summary>
internal static class MicroFrontendIds
{
    public static string Of(MicroFrontendMetadataDto mf) =>
        "mfe_" + MicroFrontendMapping.NonAlphanumeric.Replace(
            string.Join("|", new string?[] { mf.BaseUrl, mf.Route, mf.ConsumedRoute, mf.ServerSideType }
                .Select(part => part ?? "")), "_");
}

/// <summary>Mateu's remote registry: every <see cref="IRemoteCatalogSupplier"/> plus the configured
/// remotes (which win on the same id). A remote whose base url is neither an absolute http(s) url
/// nor a path is not registered (Java: DefaultRemoteRegistry).</summary>
internal sealed class DefaultRemoteRegistry : IRemoteRegistry
{
    private readonly Dictionary<string, RemoteDescriptor> _remotes = new(StringComparer.Ordinal);

    public DefaultRemoteRegistry(IEnumerable<IRemoteCatalogSupplier> suppliers, IEnumerable<RemoteDescriptor>? configured = null)
    {
        foreach (var supplier in suppliers)
            foreach (var remote in supplier.Remotes() ?? []) Register(remote);
        foreach (var remote in configured ?? []) Register(remote);
    }

    public IReadOnlyList<RemoteDescriptor> All => _remotes.Values.ToList();

    private void Register(RemoteDescriptor? remote)
    {
        if (remote is null || string.IsNullOrWhiteSpace(remote.Id)) return;
        if (Parse(remote.BaseUrl) is null)
        {
            MateuLogging.For("Mateu.MicroFrontends").LogWarning(
                "Remote {Id} is not registered: its base url {BaseUrl} is neither an absolute http(s) url nor a path",
                remote.Id, remote.BaseUrl);
            return;
        }
        _remotes[remote.Id] = remote;
    }

    public RemoteDescriptor? ById(string id) => id is not null && _remotes.TryGetValue(id, out var r) ? r : null;

    public RemoteDescriptor? ForUrl(string url)
    {
        if (Parse(url) is not { } target) return null;
        RemoteDescriptor? best = null;
        var bestLength = -1;
        foreach (var remote in _remotes.Values)
            if (Parse(remote.BaseUrl) is { } b && Owns(b, target) && b.Path.Length > bestLength)
            {
                best = remote;
                bestLength = b.Path.Length;
            }
        return best;
    }

    internal sealed record Target(string? Scheme, string? Host, int Port, string Path);

    internal static bool Owns(Target b, Target t)
    {
        if (b.Scheme is null || t.Scheme is null)
        {
            if (b.Scheme is not null || t.Scheme is not null) return false;
        }
        else if (b.Scheme != t.Scheme || b.Host != t.Host || b.Port != t.Port) return false;
        var basePath = b.Path.TrimEnd('/');
        var targetPath = t.Path.TrimEnd('/');
        return targetPath == basePath || targetPath.StartsWith(basePath + "/", StringComparison.Ordinal);
    }

    internal static Target? Parse(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        url = url.Trim();
        var cut = url.IndexOfAny(['?', '#']);
        var head = cut < 0 ? url : url[..cut];
        if (head.Split('/').Any(segment => segment == "..")) return null;
        if (head.StartsWith('/'))
            return head.StartsWith("//", StringComparison.Ordinal) || head.Contains('\\') ? null : new Target(null, null, -1, head);
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;
        var scheme = uri.Scheme.ToLowerInvariant();
        if (scheme is not ("http" or "https") || string.IsNullOrEmpty(uri.Host) || !string.IsNullOrEmpty(uri.UserInfo))
            return null;
        return new Target(scheme, uri.Host.ToLowerInvariant(), uri.Port, uri.AbsolutePath);
    }
}

/// <summary>The identity strategies by name: Mateu's <c>none</c> and <c>forward-authorization</c>,
/// replaced by the application's of the same name (Java: RemoteIdentityStrategies).</summary>
internal sealed class RemoteIdentityStrategies
{
    private readonly Dictionary<string, IRemoteIdentityStrategy> _byName = new(StringComparer.Ordinal);

    public RemoteIdentityStrategies(IEnumerable<IRemoteIdentityStrategy>? declared = null)
    {
        Register(new NoIdentity());
        Register(new ForwardAuthorization());
        foreach (var strategy in declared ?? []) Register(strategy);
    }

    private void Register(IRemoteIdentityStrategy? strategy)
    {
        if (strategy?.Name is { } name) _byName[name] = strategy;
    }

    /// <summary>The strategy of <paramref name="remote"/>; an unknown name is a configuration error.</summary>
    public IRemoteIdentityStrategy Of(RemoteDescriptor remote)
    {
        var name = string.IsNullOrWhiteSpace(remote.Identity)
            ? IRemoteIdentityStrategy.ForwardAuthorizationName
            : remote.Identity.Trim();
        return _byName.TryGetValue(name, out var strategy)
            ? strategy
            : throw new InvalidOperationException(
                $"Remote {remote.Id} names the identity strategy '{name}', but no IRemoteIdentityStrategy service is called so");
    }

    private sealed class NoIdentity : IRemoteIdentityStrategy
    {
        public string Name => IRemoteIdentityStrategy.NoneName;
        public IReadOnlyDictionary<string, string> Headers(RemoteDescriptor remote, IncomingRequest request) =>
            new Dictionary<string, string>();
    }

    private sealed class ForwardAuthorization : IRemoteIdentityStrategy
    {
        public string Name => IRemoteIdentityStrategy.ForwardAuthorizationName;
        public IReadOnlyDictionary<string, string> Headers(RemoteDescriptor remote, IncomingRequest request) =>
            request.Header("Authorization") is { Length: > 0 } authorization && !string.IsNullOrWhiteSpace(authorization)
                ? new Dictionary<string, string> { ["Authorization"] = authorization }
                : new Dictionary<string, string>();
    }
}

/// <summary>The caller's sane <c>X-Mateu-Correlation-Id</c>, else the trace id of its
/// <c>traceparent</c>, else this request's trace id (the one the error boundary logs), else a new
/// id (Java: DefaultCorrelationIdProvider).</summary>
internal sealed partial class DefaultCorrelationIdProvider : ICorrelationIdProvider
{
    public const string Header = "X-Mateu-Correlation-Id";

    [GeneratedRegex("^[A-Za-z0-9._:-]{1,128}$")]
    private static partial Regex Safe();

    [GeneratedRegex("^[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$")]
    private static partial Regex TraceParent();

    public string CorrelationId(IncomingRequest request)
    {
        // a value passed on to other services: only a sane token, never whatever the client wrote
        if (request.Header(Header)?.Trim() is { } declared && Safe().IsMatch(declared)) return declared;
        if (request.Header("traceparent")?.Trim().ToLowerInvariant() is { } traceparent
            && TraceParent().Match(traceparent) is { Success: true } m)
            return m.Groups[1].Value;
        if (Activity.Current is { } activity && activity.TraceId != default) return activity.TraceId.ToString();
        if (request.TraceIdentifier is { Length: > 0 } trace && Safe().IsMatch(trace)) return trace;
        return Guid.NewGuid().ToString();
    }
}

/// <summary>Mateu's fragment cache: in memory, bounded (least recently used out first), each entry
/// expiring after its ttl (Java: InMemoryFragmentCacheStore).</summary>
internal sealed class InMemoryFragmentCacheStore(int capacity = 1000, Func<DateTimeOffset>? clock = null) : IFragmentCacheStore
{
    private readonly Func<DateTimeOffset> _clock = clock ?? (() => DateTimeOffset.UtcNow);
    private readonly Dictionary<string, LinkedListNode<(string Key, string Value, DateTimeOffset Expires)>> _entries = new();
    private readonly LinkedList<(string Key, string Value, DateTimeOffset Expires)> _order = new();
    private readonly object _lock = new();

    public string? Get(string key)
    {
        lock (_lock)
        {
            if (!_entries.TryGetValue(key, out var node)) return null;
            if (node.Value.Expires <= _clock())
            {
                _entries.Remove(key);
                _order.Remove(node);
                return null;
            }
            _order.Remove(node);
            _order.AddFirst(node);
            return node.Value.Value;
        }
    }

    public void Put(string key, string value, TimeSpan ttl)
    {
        if (key is null || value is null || ttl <= TimeSpan.Zero) return;
        lock (_lock)
        {
            if (_entries.TryGetValue(key, out var existing))
            {
                _order.Remove(existing);
                _entries.Remove(key);
            }
            _entries[key] = _order.AddFirst((key, value, _clock() + ttl));
            while (_entries.Count > capacity && _order.Last is { } eldest)
            {
                _order.RemoveLast();
                _entries.Remove(eldest.Value.Key);
            }
        }
    }
}

/// <summary>The keys the resolver keeps a url's cache under (Java: FragmentCacheKeys): the RULE the
/// remote declared for the url, a per-caller MEMO of the key it named, the KNOWN keys of the url,
/// and the ENTRY per url + what it varies by.</summary>
internal static class FragmentCacheKeys
{
    public static bool Cacheable(FragmentCacheDto? policy)
    {
        if (policy is null || policy.MaxAgeSeconds <= 0 || policy.VaryBy is null) return false;
        var vary = Normalised(policy.VaryBy);
        return vary is FragmentVary.Shared or FragmentVary.User
               || (vary == FragmentVary.Key && !string.IsNullOrWhiteSpace(policy.Key));
    }

    public static string Normalised(string? varyBy) => varyBy?.Trim().ToLowerInvariant() ?? "";

    public static string Rule(string url) => "mfe-rule:" + Sha256(url);

    public static string Memo(string url, string caller) => "mfe-memo:" + Sha256(url + "\n" + caller);

    public static string Known(string url) => "mfe-keys:" + Sha256(url);

    public static string Entry(string url, string varying) => "mfe:" + Sha256(url + "\n" + varying);

    public static string? Varying(string? varyBy, string caller, string? key) => Normalised(varyBy) switch
    {
        FragmentVary.Shared => "shared",
        FragmentVary.User => "user:" + caller,
        FragmentVary.Key => key is null ? null : "key:" + key,
        _ => null,
    };

    public static string Caller(string? userName, string? authorization)
    {
        if (!string.IsNullOrWhiteSpace(userName)) return "user:" + userName;
        if (!string.IsNullOrWhiteSpace(authorization)) return "token:" + Sha256(authorization);
        return "anonymous";
    }

    public static string Sha256(string text) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text))).ToLowerInvariant();
}

/// <summary>The remote side of the cache: a view other hosts embed ([CacheableFragment] or an
/// <see cref="IFragmentCachePolicySupplier"/>) stamps its policy on its LOAD answers; when the host
/// says (<c>X-Mateu-Fragment-Keys</c>) it already holds the key the answer names, the fragments are
/// left out and the answer says "not modified" (Java: FragmentCachePolicies).</summary>
internal static class FragmentCachePolicies
{
    public const string FragmentKeysHeader = "X-Mateu-Fragment-Keys";

    public static UIIncrementDto Stamp(UIIncrementDto increment, string? actionId, IncomingRequest request, object? candidate)
    {
        if (!IsLoad(actionId) || PolicyOf(candidate, request) is not { } policy) return increment;
        return Apply(increment, policy, request);
    }

    /// <summary>Whether <paramref name="type"/> declares a cache policy at all (no instance is built
    /// for a view that does not).</summary>
    public static bool Declares(Type type) =>
        typeof(IFragmentCachePolicySupplier).IsAssignableFrom(type) || type.Find<CacheableFragmentAttribute>() is not null;

    internal static UIIncrementDto Apply(UIIncrementDto increment, FragmentCachePolicy policy, IncomingRequest request)
    {
        var key = string.IsNullOrWhiteSpace(policy.Key) ? null : policy.Key;
        var dto = new FragmentCacheDto(Math.Max(0, policy.MaxAgeSeconds), policy.VaryBy ?? FragmentVary.None) { Key = key };
        if (key is not null && string.Equals(FragmentVary.Key, policy.VaryBy, StringComparison.OrdinalIgnoreCase)
            && HeldByHost(key, request))
            return increment with { Fragments = [], FragmentCache = dto with { NotModified = true } };
        return increment with { FragmentCache = dto };
    }

    private static bool HeldByHost(string key, IncomingRequest request) =>
        request.Header(FragmentKeysHeader) is { } held && held.Split(',').Select(k => k.Trim()).Contains(key);

    private static FragmentCachePolicy? PolicyOf(object? candidate, IncomingRequest request)
    {
        if (candidate is IFragmentCachePolicySupplier supplier) return supplier.CachePolicy(request);
        if (candidate?.GetType().Find<CacheableFragmentAttribute>() is { } attribute)
            return new FragmentCachePolicy(attribute.MaxAgeSeconds, attribute.VaryBy);
        return null;
    }

    private static bool IsLoad(string? actionId) => string.IsNullOrEmpty(actionId) || actionId == "__load__";
}

/// <summary>The JSON of the wire, as the endpoint writes it (camelCase, nulls kept).</summary>
internal static class WireJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
}
