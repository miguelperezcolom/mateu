package io.mateu.uidl.security;

/** How a {@link SignInProvider} signs the user in. */
public enum SignInProviderType {
  /**
   * The CLIENT runs OpenID Connect Authorization Code + PKCE against the provider's issuer (a
   * public client, no secret) and sends {@code Authorization: Bearer <access token>}.
   */
  oidc,
  /**
   * The HOST FRAMEWORK owns the login (Spring {@code oauth2Login}, Quarkus OIDC web-app, ASP.NET
   * {@code Challenge}, SAML, form login…): the client sends the browser to the provider's url and
   * the framework sets a session cookie.
   */
  redirect
}
