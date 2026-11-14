using System.Security.Claims;

namespace Mateu.Uidl;

/// <summary>The signed-in user as the app's header shows them: the user menu (avatar or initials,
/// the name, and Sign out inside it). Display only — never an input to access control, which reads
/// <see cref="Identity"/>. (Mirrors io.mateu.uidl.security.UserProfile.) EXPERIMENTAL.</summary>
public sealed record UserProfile
{
    /// <summary>A user profile. <paramref name="name"/> is required (never blank); a blank
    /// <paramref name="email"/> or <paramref name="picture"/> is none.</summary>
    /// <param name="name">the name to show</param>
    /// <param name="email">the e-mail address, or null</param>
    /// <param name="picture">an http(s) URL of the user's picture, or null (initials are drawn instead)</param>
    public UserProfile(string name, string? email = null, string? picture = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("A user profile needs a name to show", nameof(name));
        Name = name;
        Email = string.IsNullOrWhiteSpace(email) ? null : email;
        Picture = string.IsNullOrWhiteSpace(picture) ? null : picture;
    }

    /// <summary>The name to show (never blank).</summary>
    public string Name { get; }

    /// <summary>The e-mail address, or null.</summary>
    public string? Email { get; }

    /// <summary>An http(s) URL of the user's picture, or null.</summary>
    public string? Picture { get; }

    /// <summary>A user known by name only.</summary>
    public static UserProfile Named(string name) => new(name);
}

/// <summary>Says how the signed-in user is shown in the app's header (name, e-mail, picture).
/// Register one as a service when the defaults are not what you want — Mateu otherwise reads them
/// off <c>HttpContext.User</c>: the <c>name</c>, <c>email</c> and <c>picture</c> claims (GitHub:
/// <c>name</c>, <c>avatar_url</c>), else the identity's name.
///
/// <para>Consulted only for a caller with an identity, in registration order (the first non-null
/// answer wins); return null to fall back to the defaults. Display only: it never grants or denies
/// anything. (Mirrors io.mateu.uidl.security.UserProfileSupplier.) EXPERIMENTAL.</para></summary>
public interface IUserProfileSupplier
{
    /// <summary>How <paramref name="user"/> (the request's authenticated user) is shown; null = the
    /// defaults.</summary>
    UserProfile? Profile(ClaimsPrincipal user);
}
