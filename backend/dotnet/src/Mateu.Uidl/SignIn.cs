namespace Mateu.Uidl;

/// <summary>One way to sign in to the UI, offered by every client (web, phone, desktop): one
/// provider sends the user straight to it, several show a sign-in chooser. Java's and Python's
/// <c>SignInProvider</c>. Declare them in <c>MateuOptions.SignIn</c>; the environment
/// (<c>MATEU_AUTH_PROVIDERS</c> …) wins when it names any.
///
/// <para>Mateu OFFERS the sign-in; it never validates a token or a session — ASP.NET Core
/// authentication does. Every member but <see cref="Id"/> is optional: a well-known id
/// (<c>google</c>, <c>microsoft</c>, <c>github</c>, <c>keycloak</c>…) fills in its type, label, icon
/// and, where it has one, its issuer or url.</para></summary>
/// <param name="Id">A stable identifier (<c>acme</c>, <c>google</c>); also selects the preset.</param>
public sealed record SignInProvider(string Id)
{
    /// <summary><c>oidc</c> (the client runs Authorization Code + PKCE against <see cref="Issuer"/>
    /// with the public <see cref="ClientId"/>) or <c>redirect</c> (the browser goes to
    /// <see cref="Url"/>, where the host owns the login and sets a session cookie). Null = the
    /// preset's, else oidc (redirect when a url is given).</summary>
    public string? Type { get; init; }

    /// <summary>The text of its button ("Acme SSO"); null = the preset's, else the id.</summary>
    public string? Label { get; init; }

    /// <summary><c>google|microsoft|apple|github|facebook|x|linkedin|gitlab|okta|auth0|keycloak|key</c>;
    /// null = the preset's, else <c>key</c>.</summary>
    public string? Icon { get; init; }

    /// <summary>The OpenID Connect issuer (oidc).</summary>
    public string? Issuer { get; init; }

    /// <summary>The public client id at that issuer (oidc).</summary>
    public string? ClientId { get; init; }

    /// <summary>The scopes to ask for (oidc); null or empty = openid profile.</summary>
    public IReadOnlyList<string>? Scopes { get; init; }

    /// <summary>The API audience to ask for, when the provider needs one (oidc, e.g. Auth0).</summary>
    public string? Audience { get; init; }

    /// <summary>Where the browser is sent (redirect): a path of this site or an absolute http(s)
    /// URL; null = the preset's (<c>/oauth2/authorization/&lt;id&gt;</c>).</summary>
    public string? Url { get; init; }

    /// <summary>A subset of <c>web</c>, <c>mobile</c>, <c>desktop</c>; null = all three for oidc, web
    /// for redirect.</summary>
    public IReadOnlyList<string>? Platforms { get; init; }

    /// <summary>False = the client adds no <c>continue=&lt;current url&gt;</c> to <see cref="Url"/>.</summary>
    public bool? ContinueParam { get; init; }
}
