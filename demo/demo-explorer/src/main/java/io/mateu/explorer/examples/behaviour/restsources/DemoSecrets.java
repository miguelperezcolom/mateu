package io.mateu.explorer.examples.behaviour.restsources;

import io.mateu.uidl.interfaces.SecretsProvider;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Where the SERVER finds {@code ${secret.X}}: a {@code SecretsProvider} bean (without one, only the
 * environment variable {@code MATEU_SECRET_<X>}). This one reads the environment and, for the
 * Explorer's own keys only, falls back to demo values so the examples work out of the box. A real
 * app reads its vault here and has no defaults.
 */
@Component
public class DemoSecrets implements SecretsProvider {

  static final String DEFAULT_DEMO_KEY = "explorer-demo-key-0001";

  private final Environment environment;

  public DemoSecrets(Environment environment) {
    this.environment = environment;
  }

  @Override
  public String getSecret(String key) {
    var fromEnv = System.getenv("MATEU_SECRET_" + key);
    if (fromEnv != null && !fromEnv.isBlank()) {
      return fromEnv;
    }
    return switch (key) {
      case "DEMO" -> DEFAULT_DEMO_KEY;
      // the origin of the proxied calls: the proxy needs an ABSOLUTE url, and only a secret may
      // name the origin of a proxied source — here, this very server
      case "EXPLORER_ORIGIN" -> "http://localhost:" + environment.getProperty("local.server.port", "8640");
      default -> null;
    };
  }
}
