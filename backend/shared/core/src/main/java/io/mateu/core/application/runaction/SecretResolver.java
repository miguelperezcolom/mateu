package io.mateu.core.application.runaction;

/**
 * Resolves a {@code ${secret.KEY}} for a proxied REST call — the ONLY place a secret is read, and
 * only ever on the server (the browser's interpolator has no {@code secret} scope).
 *
 * <p>The first non-null {@link io.mateu.uidl.interfaces.SecretsProvider} bean wins; without one the
 * value falls back to the environment variable {@code MATEU_SECRET_KEY}, and to no other variable
 * of the process (see {@link #secretEnvName}). This is a security boundary: keep the fallback
 * exactly as it is — the .NET ({@code UrlTemplate.SecretEnvName}) and Python ({@code url_template})
 * ports mirror it.
 */
public final class SecretResolver {

  /** The only environment variables a {@code ${secret.X}} may fall back to. */
  public static final String SECRET_ENV_PREFIX = "MATEU_SECRET_";

  private SecretResolver() {}

  /**
   * The environment variable {@code ${secret.KEY}} falls back to: {@code MATEU_SECRET_KEY} (a key
   * that already carries the prefix is used as is). Restricted on purpose: the fallback used to
   * read ANY variable of the process, so a template naming {@code ${secret.DB_PASSWORD}} (or a
   * cloud credential) would send it to whatever endpoint the source declared.
   */
  public static String secretEnvName(String key) {
    return key.startsWith(SECRET_ENV_PREFIX) ? key : SECRET_ENV_PREFIX + key;
  }

  /**
   * A {@code ${secret.X}} value: the first non-null SecretsProvider bean, else the environment
   * variable {@code MATEU_SECRET_X} (see {@link #secretEnvName}).
   */
  public static String resolve(String key) {
    try {
      for (var p :
          io.mateu.uidl.di.MateuBeanProvider.getBeans(
              io.mateu.uidl.interfaces.SecretsProvider.class)) {
        var v = p.getSecret(key);
        if (v != null) {
          return v;
        }
      }
    } catch (Exception ignored) {
      // no provider registered (e.g. tests) — fall through to the environment
    }
    return System.getenv(secretEnvName(key));
  }
}
