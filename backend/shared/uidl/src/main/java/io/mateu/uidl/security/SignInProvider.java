package io.mateu.uidl.security;

import java.util.List;
import lombok.Builder;

/**
 * One way to sign in to a Mateu UI, offered by every client (web, phone, desktop): one provider
 * sends the user straight to it, several show a sign-in chooser ("Continue with Google", "Sign in
 * with Acme SSO"…). Declared in the settings ({@code mateu.auth.providers=…}) or returned by a
 * {@link SignInProvidersSupplier} bean.
 *
 * <p>Mateu OFFERS the sign-in; it never validates a token or a session — the host framework does
 * (Spring Security, Quarkus OIDC, …), as for any other client.
 *
 * <p>Every member but {@code id} may be null: a well-known id ({@code google}, {@code microsoft},
 * {@code github}, {@code keycloak}…) fills in its type, label, icon and, where it has one, its
 * issuer or url (the presets of the sign-in guide).
 *
 * @param id a stable identifier ({@code acme}, {@code google}); also selects the preset
 * @param type {@code oidc} or {@code redirect}; null → the preset's, else oidc (redirect when a url
 *     is given)
 * @param label the text of its button ("Acme SSO"); null → the preset's, else the id
 * @param icon a brand token ({@code google|microsoft|apple|github|facebook|x|linkedin|gitlab|okta|
 *     auth0|keycloak|key}); null → the preset's, else {@code key}
 * @param issuer the OpenID Connect issuer (oidc)
 * @param clientId the public client id at that issuer (oidc)
 * @param scopes the scopes to ask for (oidc); null or empty → {@code openid profile}
 * @param audience the API audience to ask for, when the provider needs one (oidc, e.g. Auth0)
 * @param url where the browser is sent (redirect): a same-origin path or an absolute http(s) URL;
 *     null → the preset's ({@code /oauth2/authorization/<id>})
 * @param platforms where it is offered; null or empty → web, mobile and desktop for oidc, web only
 *     for redirect
 * @param continueParam whether the client adds {@code continue=<current url>} to a redirect url
 *     (null = yes)
 */
@Builder(toBuilder = true)
public record SignInProvider(
    String id,
    SignInProviderType type,
    String label,
    String icon,
    String issuer,
    String clientId,
    List<String> scopes,
    String audience,
    String url,
    List<SignInPlatform> platforms,
    Boolean continueParam) {

  public SignInProvider {
    scopes = scopes == null ? null : List.copyOf(scopes);
    platforms = platforms == null ? null : List.copyOf(platforms);
  }

  /** An OpenID Connect provider: the client signs the user in at {@code issuer}. */
  public static SignInProvider oidc(String id, String label, String issuer, String clientId) {
    return new SignInProvider(
        id, SignInProviderType.oidc, label, null, issuer, clientId, null, null, null, null, null);
  }

  /** A provider whose login the host framework owns, reached by sending the browser to a url. */
  public static SignInProvider redirect(String id, String label, String url) {
    return new SignInProvider(
        id, SignInProviderType.redirect, label, null, null, null, null, null, url, null, null);
  }

  /** A well-known provider by id ({@code google}, {@code github}…), the rest from its preset. */
  public static SignInProvider preset(String id) {
    return new SignInProvider(id, null, null, null, null, null, null, null, null, null, null);
  }
}
