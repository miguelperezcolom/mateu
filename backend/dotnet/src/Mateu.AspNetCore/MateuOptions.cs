using System.Security.Claims;
using Mateu.Uidl;
using Microsoft.AspNetCore.Http;

namespace Mateu.AspNetCore;

/// <summary>Configuration of <c>AddMateu(o => …)</c>.</summary>
public sealed class MateuOptions
{
    /// <summary>Resolves the caller's <see cref="Mateu.Uidl.Identity"/> — what
    /// [EyesOnly]/[ReadOnlyUnless]/[DisabledUnless] match against — from the current request.
    /// Defaults to <see cref="ClaimsIdentityMapper.FromUser"/>: the authenticated
    /// <c>HttpContext.User</c>'s role, group, scope and permission claims (whatever authentication
    /// the host configured: JWT bearer, cookies, Windows…). Null for an anonymous caller, which every
    /// gate with a declared dimension then denies.</summary>
    public Func<HttpContext, Identity?> Identity { get; set; } = ClaimsIdentityMapper.FromUser;

    /// <summary>Resolves the <c>${secret.KEY}</c> placeholders of PROXIED REST sources. When null, an
    /// <see cref="ISecretsProvider"/> registered as a service is used, and failing that the
    /// environment variable <c>MATEU_SECRET_&lt;KEY&gt;</c>.</summary>
    public Func<string, string?>? Secrets { get; set; }

    /// <summary>Whether an unexpected exception's message reaches the screen. Null (the default)
    /// means "only in the Development environment"; elsewhere the user sees a generic message and a
    /// correlation id, and the details go to the log. A <see cref="UserFacingException"/> always
    /// shows its message.</summary>
    public bool? DetailedErrors { get; set; }

    /// <summary>Development mode (live reload): specs watched, every cache dropped on change and
    /// <c>GET /mateu/dev/events</c> + <c>POST /mateu/dev/reload</c> served. Null (the default) means
    /// "only when the MATEU_DEV environment variable is true" — never set it in a production profile.</summary>
    public bool? Dev { get; set; }

    /// <summary>The build id every response of a Mateu endpoint carries in <c>X-Mateu-Build</c> (what a
    /// renderer compares to tell the app was redeployed, or that a refusal comes from a newer build).
    /// Null (the default) reads <c>MATEU_BUILD_ID</c>; none → a fingerprint computed once of Mateu's
    /// version, the registered UI types' assemblies (MVIDs) and names, and the YAML specs served —
    /// identical on every replica of one release. Reduced to <c>[A-Za-z0-9._-]</c>, at most 64 chars.</summary>
    public string? BuildId { get; set; }

    /// <summary>A mirror of Oracle's CDN (<c>https://static.oracle.com/cdn</c>) the Redwood renderer's
    /// page loads JET, Spectra, the Visual Builder runtime and the gallery images from — for an
    /// organisation that hosts those files itself (e.g. <c>https://cdn.example.com/oracle/cdn</c>).
    /// Mateu never bundles Oracle's files; it only re-points the URLs of the page it serves. Null (the
    /// default) reads <c>MATEU_ORACLE_CDN_URL</c>; blank = off. A value that is not an absolute http(s)
    /// URL, or that carries a quote, <c>&lt;</c>, <c>&gt;</c> or whitespace, is ignored with a warning.
    /// Java: <c>mateu.oracle-cdn.url</c>.</summary>
    public string? OracleCdnUrl { get; set; }

    /// <summary>Serve every UI as an installable Progressive Web App: the served page links a web app
    /// manifest and registers a network-first service worker (an offline shell; never the API or the
    /// REST-source data), both under <c>{mount}/mateu/v3/pwa/</c>. Null (the default) means ON unless the
    /// environment variable <c>MATEU_PWA_ENABLED</c> is <c>false</c>; always off in development mode.
    /// Switched off, the worker's URL answers a worker that unregisters itself. Java:
    /// <c>mateu.pwa.enabled</c>.</summary>
    public bool? Pwa { get; set; }

    /// <summary>The remotes the server may resolve micro frontends against (<c>MicroFrontend.Resolve =
    /// Resolve.Server</c>, content slots), merged over the <see cref="IRemoteCatalogSupplier"/> services
    /// (a configured remote wins on the same id). Ignored when the app registers its own
    /// <see cref="IRemoteRegistry"/> service. Only urls under a registered remote are ever requested.
    /// EXPERIMENTAL. Java: <c>mateu.remotes</c>.</summary>
    public List<RemoteDescriptor> Remotes { get; set; } = [];

    /// <summary>The time budget of a server-resolved fragment whose micro frontend and remote name
    /// none, in ms (default 500). EXPERIMENTAL. Java: <c>mateu.microfrontends.default-timeout-ms</c>.</summary>
    public int DefaultTimeoutMs { get; set; } = 500;

    /// <summary>The most a response waits for its server-resolved fragments, in ms (default 2000): the
    /// budget is the largest of their timeouts, capped by this. EXPERIMENTAL. Java:
    /// <c>mateu.microfrontends.max-budget-ms</c>.</summary>
    public int MaxBudgetMs { get; set; } = 2000;

    /// <summary>The id of the registered remote content slots are resolved against (default
    /// <c>content</c>). EXPERIMENTAL. Java: <c>mateu.content-slots.remote</c>.</summary>
    public string ContentRemoteId { get; set; } = "content";

    /// <summary>The route of a content slot on the content remote; <c>{key}</c> is replaced by the
    /// slot's key (default <c>/content-slots/{key}</c>). EXPERIMENTAL. Java: <c>mateu.content-slots.route</c>.</summary>
    public string ContentRoute { get; set; } = "/content-slots/{key}";

    /// <summary>This server's own base url (an origin, e.g. <c>https://app.example.com</c>), where a
    /// remote registered as a PATH on this server (<c>/_content-hub</c>) is called. Null (the
    /// default): the local socket the request arrived on — never a request header. EXPERIMENTAL.
    /// Java: <c>mateu.self-base-url</c>.</summary>
    public string? SelfBaseUrl { get; set; }

    /// <summary>Serve the reserved action <c>__content_slots__</c>, which answers the application's
    /// content slot descriptor for the content service. Off by default (it describes the
    /// application's screens; refused with 403). EXPERIMENTAL. Java:
    /// <c>mateu.content-slots.descriptor.enabled</c>.</summary>
    public bool ContentSlotsDescriptorEnabled { get; set; }

    /// <summary>The client proxied REST fetches use (null → a shared client with a 60 s timeout).</summary>
    public HttpClient? HttpClient { get; set; }

    /// <summary>The deployment environment whose <c>type: Environment</c> file is overlaid on the REST
    /// source catalogue (re-pointing base urls / urls / headers / proxy without editing
    /// sources.yaml). Null (the default) reads MATEU_ENVIRONMENT; none → the catalogue as authored.
    /// Never put a secret in an environment file — use <c>${secret.X}</c>.</summary>
    public string? Environment { get; set; }

    /// <summary>SAMPLE mode: REST sources that carry sample data (<c>sample:</c> / <c>sampleFile:</c>
    /// in sources.yaml) answer with it instead of being called, on the proxied leg and — told by the
    /// app metadata — the browser's direct one. Null (the default) reads the environment variable
    /// <c>MATEU_SOURCES_MOCK</c> (<c>true</c>/<c>1</c>). Never switch it on in production.</summary>
    public bool? MockSources { get; set; }

    /// <summary>Serve the native MCP endpoint <c>POST /mateu/mcp</c>. Null (the default) reads the
    /// environment variable <c>MATEU_MCP_ENABLED</c> (<c>true</c>/<c>1</c>); otherwise it is OFF, as
    /// on Java (<c>mateu.mcp.enabled</c>): it gives any caller a programmatic way to drive every
    /// screen, which the application has to decide to expose.</summary>
    public bool? Mcp { get; set; }

    /// <summary>Whether <c>MATEU_MCP_ENABLED</c> turns the MCP endpoint on (true/1/yes).</summary>
    public static bool McpEnabledByEnvironment() =>
        System.Environment.GetEnvironmentVariable("MATEU_MCP_ENABLED")?.Trim().ToLowerInvariant() is "true" or "1" or "yes";

    /// <summary>Live UI push (phase C): the MCP tools that send UI to a UI that is OPEN in a browser
    /// tab or an app window (mateu_list_sessions, mateu_pair_session, mateu_push_ui, mateu_navigate,
    /// mateu_dispatch_event) and the UI's agent channel. Effective only when the MCP endpoint is on
    /// (<see cref="Mcp"/>). Null (the default) reads <c>MATEU_MCP_PUSH_ENABLED</c>; otherwise OFF, as
    /// on Java (<c>mateu.mcp.push.enabled</c>).</summary>
    public bool? McpPush { get; set; }

    /// <summary>Messages an agent may send to one UI session per rolling minute. Null (the default)
    /// reads <c>MATEU_MCP_PUSH_RATE_PER_MINUTE</c>, else 30.</summary>
    public int? McpPushRatePerMinute { get; set; }

    /// <summary>The most live UI sessions held at once. Null (the default) reads
    /// <c>MATEU_MCP_PUSH_MAX_SESSIONS</c>, else 1000.</summary>
    public int? McpPushMaxSessions { get; set; }

    /// <summary>The most live UI sessions one signed-in user (the UI's principal name) holds at once.
    /// Null (the default) reads <c>MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER</c>, else 20.</summary>
    public int? McpPushMaxSessionsPerOwner { get; set; }

    /// <summary>The most ANONYMOUS live UI sessions one client address holds at once. The address is
    /// <c>HttpContext.Connection.RemoteIpAddress</c> — the socket peer, unless the app runs ASP.NET's
    /// <c>ForwardedHeaders</c> middleware with its known proxies — so behind a reverse proxy without it
    /// every anonymous UI shares the proxy's address. Null (the default) reads
    /// <c>MATEU_MCP_PUSH_MAX_ANONYMOUS_SESSIONS_PER_ADDRESS</c>, else 200 (Java:
    /// <c>mateu.mcp.push.max-anonymous-sessions-per-address</c>).</summary>
    public int? McpPushMaxAnonymousSessionsPerAddress { get; set; }

    /// <summary>Whether <c>MATEU_MCP_PUSH_ENABLED</c> turns live UI push on (true/1/yes).</summary>
    public static bool McpPushEnabledByEnvironment() =>
        System.Environment.GetEnvironmentVariable("MATEU_MCP_PUSH_ENABLED")?.Trim().ToLowerInvariant() is "true" or "1" or "yes";

    /// <summary>Whether this configuration turns live UI push on: the MCP endpoint AND its push switch.</summary>
    internal bool McpPushEffective =>
        (Mcp ?? McpEnabledByEnvironment()) && (McpPush ?? McpPushEnabledByEnvironment());

    internal int PushRatePerMinute => McpPushRatePerMinute ?? IntFromEnvironment("MATEU_MCP_PUSH_RATE_PER_MINUTE")
        ?? Mateu.Core.AgentPush.AgentSessions.DefaultRatePerMinute;

    internal int PushMaxSessions => McpPushMaxSessions ?? IntFromEnvironment("MATEU_MCP_PUSH_MAX_SESSIONS")
        ?? Mateu.Core.AgentPush.AgentSessions.DefaultMaxSessions;

    internal int PushMaxSessionsPerOwner => McpPushMaxSessionsPerOwner
        ?? IntFromEnvironment("MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER")
        ?? Mateu.Core.AgentPush.AgentSessions.DefaultMaxSessionsPerOwner;

    internal int PushMaxAnonymousSessionsPerAddress => McpPushMaxAnonymousSessionsPerAddress
        ?? IntFromEnvironment("MATEU_MCP_PUSH_MAX_ANONYMOUS_SESSIONS_PER_ADDRESS")
        ?? Mateu.Core.AgentPush.AgentSessions.DefaultMaxAnonymousSessionsPerAddress;

    private static int? IntFromEnvironment(string name) =>
        int.TryParse(System.Environment.GetEnvironmentVariable(name)?.Trim(), out var n) && n > 0 ? n : null;
}

/// <summary>The default claims → <see cref="Identity"/> mapping. Claim names vary by issuer, so
/// each dimension reads the usual spellings:
/// <list type="bullet">
/// <item>roles: <see cref="ClaimsIdentity.RoleClaimType"/> (what <c>IsInRole</c> reads),
/// <c>role</c>, <c>roles</c>;</item>
/// <item>groups: <c>groups</c>, <c>group</c>;</item>
/// <item>scopes: <c>scope</c> and <c>scp</c> — space-separated per OAuth 2.0 (RFC 8693), or one per
/// claim;</item>
/// <item>permissions: <c>permissions</c>, <c>permission</c>.</item>
/// </list>
/// A claim holding a JSON array (some issuers flatten lists that way) is split too.</summary>
public static class ClaimsIdentityMapper
{
    /// <summary>The identity of <c>ctx.User</c>, or null when no identity is authenticated.</summary>
    public static Identity? FromUser(HttpContext ctx) => From(ctx.User);

    /// <summary>The identity of <paramref name="user"/>, or null when it is not authenticated.</summary>
    public static Identity? From(ClaimsPrincipal? user)
    {
        if (user?.Identities.Any(i => i.IsAuthenticated) != true) return null;
        var roleTypes = user.Identities.Select(i => i.RoleClaimType).Append("role").Append("roles");
        return new Identity(
            Roles: Values(user, roleTypes),
            Groups: Values(user, ["groups", "group"]),
            Scopes: Values(user, ["scope", "scp"], spaceSeparated: true),
            Permissions: Values(user, ["permissions", "permission"]));
    }

    private static IReadOnlyList<string> Values(ClaimsPrincipal user, IEnumerable<string> types, bool spaceSeparated = false)
    {
        var wanted = new HashSet<string>(types, StringComparer.OrdinalIgnoreCase);
        return user.Claims
            .Where(c => wanted.Contains(c.Type))
            .SelectMany(c => Split(c.Value, spaceSeparated))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    private static IEnumerable<string> Split(string value, bool spaceSeparated)
    {
        var v = value.Trim();
        if (v.StartsWith('[') && v.EndsWith(']'))
            return v[1..^1].Split(',').Select(s => s.Trim().Trim('"')).Where(s => s.Length > 0);
        return spaceSeparated ? v.Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) : v.Length > 0 ? [v] : [];
    }
}
