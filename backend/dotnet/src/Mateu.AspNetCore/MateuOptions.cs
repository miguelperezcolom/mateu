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

    /// <summary>The client proxied REST fetches use (null → a shared client with a 60 s timeout).</summary>
    public HttpClient? HttpClient { get; set; }
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
