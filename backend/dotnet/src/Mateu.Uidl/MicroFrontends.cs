namespace Mateu.Uidl;

// Server-side micro frontend resolution and content slots (docs/specs/microfrontend-server-resolution.md)
// — C# analogues of the Java uidl types of the same names (io.mateu.uidl.data.Resolve / ContentSlot,
// io.mateu.uidl.annotations.ContentSlot / CacheableFragment, io.mateu.uidl.remote.*).
// EXPERIMENTAL: may change in a minor release.

/// <summary>Where a <see cref="MicroFrontend"/> is resolved. <see cref="Client"/> (the default) is
/// what Mateu always did: the renderer receives the reference and asks the remote itself.
/// <see cref="Server"/>: the host asks the remote while it builds the response and embeds the
/// answer — and, when the remote is slow, failing or down, sends the reference as <c>Client</c>
/// would have. EXPERIMENTAL. (C# analogue of io.mateu.uidl.data.Resolve.)</summary>
public enum Resolve
{
    Client,
    Server,
}

/// <summary>A hole for MANAGED content (an editorial text, a notice, a help block) that a content
/// service fills: a <see cref="MicroFrontend"/> resolved on the server against the content remote
/// (<c>MateuOptions.ContentRemoteId</c>, default <c>content</c>) at a route built from
/// <see cref="Key"/> — the developer never writes its url. It never brings the screen down: when the
/// slot is empty, or its service slow, failing or down, the <see cref="Fallback"/> text is painted
/// (nothing when it is blank) unless <see cref="DegradeToClient"/>. <see cref="Key"/> is
/// <c>application.screen.name</c> (lower case letters, digits and dashes, dot-separated, at least
/// three segments). EXPERIMENTAL. (C# analogue of io.mateu.uidl.data.ContentSlot.)</summary>
public sealed record ContentSlot(string Key) : ComponentBase
{
    /// <summary>What is painted when the slot cannot be filled; blank = nothing.</summary>
    public string? Fallback { get; init; }

    /// <summary>The slot's own time budget in ms (null = the content remote's, else the default).</summary>
    public int? TimeoutMs { get; init; }

    /// <summary>A description for the content service's editors.</summary>
    public string? Description { get; init; }

    /// <summary>When the content cannot be fetched in time, hand the renderer the reference (like a
    /// <c>Resolve.Client</c> micro frontend) instead of painting the fallback.</summary>
    public bool DegradeToClient { get; init; }
}

/// <summary>Renders the property as a <see cref="ContentSlot"/>: a hole for managed content, resolved
/// by the server against the content remote (the property's value is irrelevant). The key must be
/// <c>application.screen.name</c> and unique in the application — a malformed or repeated key fails
/// at startup, when the views are registered. EXPERIMENTAL. (C# analogue of Java's @ContentSlot.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
public sealed class ContentSlotAttribute : Attribute
{
    public string Key { get; set; } = "";
    public string Fallback { get; set; } = "";
    /// <summary>0 = unset (the content remote's timeout, else the default).</summary>
    public int TimeoutMs { get; set; }
    public string Description { get; set; } = "";
    public bool DegradeToClient { get; set; }
}

/// <summary>Declares, on a view other hosts embed with <c>Resolve.Server</c>, that its LOAD answers
/// may be cached by the host for <see cref="MaxAgeSeconds"/>, varying by <see cref="VaryBy"/>
/// (<c>none</c> | <c>shared</c> | <c>user</c>; see <see cref="FragmentVary"/>). The remote decides,
/// never the host. For a per-caller key implement <see cref="IFragmentCachePolicySupplier"/>.
/// EXPERIMENTAL. (C# analogue of Java's @CacheableFragment.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class CacheableFragmentAttribute(int maxAgeSeconds) : Attribute
{
    public int MaxAgeSeconds { get; } = maxAgeSeconds;
    public string VaryBy { get; set; } = FragmentVary.User;
}

/// <summary>The request a strategy, a correlation provider or a cache policy is asked about: the
/// incoming request of the HOST (its headers) and the caller the host framework authenticated.
/// EXPERIMENTAL. (The port's view of Java's HttpRequest for these extension points.)</summary>
public sealed class IncomingRequest(Func<string, string?>? headers = null, string? userName = null,
    Identity? identity = null, string? traceIdentifier = null)
{
    private readonly Func<string, string?> _headers = headers ?? (_ => null);

    /// <summary>The value of the request header <paramref name="name"/> (case-insensitive), or null.</summary>
    public string? Header(string name) => _headers(name);

    /// <summary>The authenticated caller's name, or null.</summary>
    public string? UserName { get; } = userName;

    /// <summary>The authenticated caller's identity, or null.</summary>
    public Identity? Identity { get; } = identity;

    /// <summary>The host framework's own id of this request (ASP.NET's TraceIdentifier), or null.</summary>
    public string? TraceIdentifier { get; } = traceIdentifier;
}

/// <summary>A remote the host may call on the user's behalf: an id, the base url its micro frontends
/// live under (an absolute http(s) url, or a path on this server such as <c>/_content-hub</c>), the
/// default time budget of its fragments and the name of the <see cref="IRemoteIdentityStrategy"/>
/// that says how the caller's identity travels (null = <c>forward-authorization</c>). Only urls under
/// a registered remote are ever requested by the server. EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.remote.RemoteDescriptor.)</summary>
public sealed record RemoteDescriptor(string Id, string BaseUrl, int? TimeoutMs = null, string? Identity = null);

/// <summary>The remotes the server may resolve micro frontends against. Register your own as a
/// service to replace Mateu's (which merges every <see cref="IRemoteCatalogSupplier"/> service with
/// <c>MateuOptions.Remotes</c>). EXPERIMENTAL. (C# analogue of io.mateu.uidl.remote.RemoteRegistry.)</summary>
public interface IRemoteRegistry
{
    /// <summary>The remote registered as <paramref name="id"/>, or null.</summary>
    RemoteDescriptor? ById(string id);

    /// <summary>The remote whose base url owns <paramref name="url"/> (same scheme, host and port and
    /// a path-segment prefix; the longest match wins), or null.</summary>
    RemoteDescriptor? ForUrl(string url);
}

/// <summary>Contributes remotes to the default registry (register it as a service). EXPERIMENTAL.
/// (C# analogue of io.mateu.uidl.remote.RemoteCatalogSupplier.)</summary>
public interface IRemoteCatalogSupplier
{
    IReadOnlyList<RemoteDescriptor> Remotes();
}

/// <summary>How the caller's identity reaches a remote: the headers to send it, by
/// <see cref="Name"/> (what <see cref="RemoteDescriptor.Identity"/> names). Built in: <c>none</c>
/// and <c>forward-authorization</c> (the request's Authorization header — the default). Register an
/// implementation as a service (a token exchange, typically); one with a built-in name replaces it.
/// EXPERIMENTAL. (C# analogue of io.mateu.uidl.remote.RemoteIdentityStrategy.)</summary>
public interface IRemoteIdentityStrategy
{
    const string NoneName = "none";
    const string ForwardAuthorizationName = "forward-authorization";

    string Name { get; }

    IReadOnlyDictionary<string, string> Headers(RemoteDescriptor remote, IncomingRequest request);
}

/// <summary>The correlation id the host sends to every remote (<c>X-Mateu-Correlation-Id</c>). The
/// default takes a sane <c>X-Mateu-Correlation-Id</c> of the request, else the trace id of its
/// <c>traceparent</c>, else the request's own trace id. EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.remote.CorrelationIdProvider.)</summary>
public interface ICorrelationIdProvider
{
    string CorrelationId(IncomingRequest request);
}

/// <summary>Where the host keeps the fragments remotes allowed it to cache (default: in memory,
/// bounded, LRU). EXPERIMENTAL. (C# analogue of io.mateu.uidl.remote.FragmentCacheStore.)</summary>
public interface IFragmentCacheStore
{
    string? Get(string key);

    /// <summary>Keeps <paramref name="value"/> for <paramref name="ttl"/>; a non-positive ttl keeps nothing.</summary>
    void Put(string key, string value, TimeSpan ttl);
}

/// <summary>What a cached fragment varies by. EXPERIMENTAL.</summary>
public static class FragmentVary
{
    /// <summary>Never cached.</summary>
    public const string None = "none";
    /// <summary>One entry for every caller.</summary>
    public const string Shared = "shared";
    /// <summary>One entry per caller.</summary>
    public const string User = "user";
    /// <summary>One entry per opaque key the remote names (e.g. the hash of the caller's audience).</summary>
    public const string Key = "key";
}

/// <summary>A remote view's cache declaration for its load answers. EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.remote.FragmentCachePolicy.)</summary>
public sealed record FragmentCachePolicy(int MaxAgeSeconds, string VaryBy, string? Key = null)
{
    public static FragmentCachePolicy NotCached() => new(0, FragmentVary.None);
    public static FragmentCachePolicy SharedFor(int maxAgeSeconds) => new(maxAgeSeconds, FragmentVary.Shared);
    public static FragmentCachePolicy PerUser(int maxAgeSeconds) => new(maxAgeSeconds, FragmentVary.User);
    public static FragmentCachePolicy ByKey(string key, int maxAgeSeconds) => new(maxAgeSeconds, FragmentVary.Key, key);
}

/// <summary>A view other hosts embed that decides its cache policy per request (a key computed from
/// the caller, typically) — wins over [CacheableFragment]. EXPERIMENTAL. (C# analogue of
/// io.mateu.uidl.remote.FragmentCachePolicySupplier.)</summary>
public interface IFragmentCachePolicySupplier
{
    FragmentCachePolicy? CachePolicy(IncomingRequest request);
}

/// <summary>How the resolution of one server-resolved fragment ended. EXPERIMENTAL.</summary>
public enum MicroFrontendResolutionOutcome
{
    Embedded,
    FromCache,
    Timeout,
    Error,
    Empty,
}

/// <summary>The trace of one server-resolved fragment: its remote, url, slot key, duration, outcome,
/// what it degraded to (<c>client</c> | <c>fallback</c> | <c>nothing</c> | null), the correlation id
/// and the error, if any. EXPERIMENTAL. (C# analogue of io.mateu.uidl.remote.MicroFrontendResolutionEvent.)</summary>
public sealed record MicroFrontendResolutionEvent(
    string? RemoteId,
    string? Url,
    string? SlotKey,
    long DurationMillis,
    MicroFrontendResolutionOutcome Outcome,
    string? DegradedTo,
    string? CorrelationId,
    string? Error);

/// <summary>Told of every server-resolved fragment (register it as a service). EXPERIMENTAL. (C#
/// analogue of io.mateu.uidl.remote.MicroFrontendResolutionListener.)</summary>
public interface IMicroFrontendResolutionListener
{
    void OnResolution(MicroFrontendResolutionEvent resolution);
}
