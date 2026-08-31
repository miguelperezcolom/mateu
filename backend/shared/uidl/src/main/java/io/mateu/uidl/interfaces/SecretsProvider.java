package io.mateu.uidl.interfaces;

/**
 * Supplies secret values referenced as {@code ${secret.KEY}} in a
 * {@code @RestOptions}/{@code @RestListing}/{@code @RestAction}/{@code @RestData} url/headers/body
 * when the source is fetched in PROXY mode (server-side). Because the interpolation happens on the
 * Mateu server, the secret never reaches the browser — the auth-hardening counterpart of the
 * CORS-hardening proxy mode.
 *
 * <p>Register an implementation as a bean (e.g. a Spring {@code @Service}); it is discovered via
 * the platform bean provider. With no implementation registered, Mateu falls back to reading an
 * environment variable of the same name. Return {@code null} for an unknown key (Mateu then tries
 * the next provider, and finally the environment).
 */
public interface SecretsProvider {

  /**
   * The secret for {@code key} (e.g. {@code API_TOKEN} for {@code ${secret.API_TOKEN}}); null if
   * unknown.
   */
  String getSecret(String key);
}
