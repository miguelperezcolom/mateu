using System.Security.Claims;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>The signed-in user the header's user menu shows (Java's
/// <c>io.mateu.core.infra.security.UserProfiles</c>, Python's <c>mateu_ui.core.user_profiles</c> —
/// same rules). Only for a caller with an identity (a non-blank <see cref="Identity.Name"/>); then
/// the app's <see cref="IUserProfileSupplier"/> services first, else what the authenticated
/// <see cref="ClaimsPrincipal"/> says about the person:
/// <list type="bullet">
/// <item>name: <c>name</c>, else <c>given_name</c> + <c>family_name</c>, else
/// <c>preferred_username</c>, <c>login</c> (GitHub), <c>nickname</c>, else the identity's name;</item>
/// <item>email: <c>email</c>;</item>
/// <item>picture: <c>picture</c> (OIDC), else <c>avatar_url</c> (GitHub) — http(s) only.</item>
/// </list>
/// The standard .NET claim types count as their short spellings (<see cref="ClaimTypes.Name"/> as
/// <c>name</c>, <see cref="ClaimTypes.GivenName"/>, <see cref="ClaimTypes.Surname"/>,
/// <see cref="ClaimTypes.Email"/>); a short claim wins over its long spelling. Display only:
/// nothing here grants or denies. EXPERIMENTAL.</summary>
public static class UserProfiles
{
    private static readonly IReadOnlyDictionary<string, string> LongSpellings = new Dictionary<string, string>
    {
        [ClaimTypes.Name] = "name",
        [ClaimTypes.GivenName] = "given_name",
        [ClaimTypes.Surname] = "family_name",
        [ClaimTypes.Email] = "email",
    };

    /// <summary>The signed-in user of <paramref name="user"/>, or null for an anonymous caller (no
    /// <paramref name="identityName"/>). A supplier that throws is logged and skipped.</summary>
    public static UserProfile? Of(ClaimsPrincipal? user, string? identityName,
        IEnumerable<IUserProfileSupplier>? suppliers = null)
    {
        if (string.IsNullOrWhiteSpace(identityName)) return null;
        var principal = user ?? new ClaimsPrincipal(new ClaimsIdentity());
        foreach (var supplier in suppliers ?? [])
        {
            try
            {
                if (supplier.Profile(principal) is { } supplied) return supplied;
            }
            catch (Exception e)
            {
                MateuLogging.For("Mateu.UserProfiles").LogWarning(
                    "IUserProfileSupplier {Supplier} failed: {Error}", supplier.GetType().FullName, e.ToString());
            }
        }
        return FromClaims(ClaimsOf(principal), identityName);
    }

    /// <summary>The wire form of <see cref="Of"/>.</summary>
    public static UserProfileDto? Dto(ClaimsPrincipal? user, string? identityName,
        IEnumerable<IUserProfileSupplier>? suppliers = null) =>
        Of(user, identityName, suppliers) is { } p ? new UserProfileDto(p.Name, p.Email, p.Picture) : null;

    /// <summary>The claims of <paramref name="user"/> by their short names: the first claim of a type
    /// wins, a short spelling wins over the long one.</summary>
    public static IReadOnlyDictionary<string, string?> ClaimsOf(ClaimsPrincipal user)
    {
        var claims = new Dictionary<string, string?>(StringComparer.Ordinal);
        foreach (var claim in user.Claims)
            if (!LongSpellings.ContainsKey(claim.Type)) claims.TryAdd(claim.Type, claim.Value);
        foreach (var claim in user.Claims)
            if (LongSpellings.TryGetValue(claim.Type, out var shortName)) claims.TryAdd(shortName, claim.Value);
        return claims;
    }

    /// <summary>What the claims say about the person; <paramref name="fallbackName"/> when they name
    /// nobody.</summary>
    public static UserProfile FromClaims(IReadOnlyDictionary<string, string?> claims, string fallbackName)
    {
        var name = Text(claims, "name");
        if (name is null)
        {
            var given = Text(claims, "given_name");
            var family = Text(claims, "family_name");
            if (given is not null || family is not null)
                name = ((given ?? "") + " " + (family ?? "")).Trim();
        }
        name ??= Text(claims, "preferred_username");
        name ??= Text(claims, "login");
        name ??= Text(claims, "nickname");
        name ??= fallbackName;
        var picture = Text(claims, "picture");
        if (!IsHttp(picture)) picture = Text(claims, "avatar_url");
        return new UserProfile(name, Text(claims, "email"), IsHttp(picture) ? picture : null);
    }

    private static string? Text(IReadOnlyDictionary<string, string?> claims, string key)
    {
        if (!claims.TryGetValue(key, out var value) || value is null) return null;
        var text = value.Trim();
        return text.Length == 0 ? null : text;
    }

    private static bool IsHttp(string? url) =>
        url is not null && (url.StartsWith("https://", StringComparison.Ordinal) || url.StartsWith("http://", StringComparison.Ordinal));
}
