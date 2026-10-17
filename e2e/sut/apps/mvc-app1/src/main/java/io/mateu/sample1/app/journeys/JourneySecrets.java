package io.mateu.sample1.app.journeys;

import io.mateu.uidl.interfaces.SecretsProvider;
import org.springframework.stereotype.Component;

/**
 * The secret the proxied YAML actions of {@code /j/proxied} send to their upstream
 * ({@code ${secret.J_UPSTREAM_KEY}}). The upstream (started by tests/journeys/yaml-proxy.spec.ts)
 * answers 401 without it, so a successful call proves the server injected it — and the spec checks
 * the browser never saw it. Any other key is unknown here (null), so the shared specs' secrets keep
 * their usual fallback.
 */
@Component
public class JourneySecrets implements SecretsProvider {

  public static final String UPSTREAM_KEY = "j-upstream-0a6f";

  @Override
  public String getSecret(String key) {
    return "J_UPSTREAM_KEY".equals(key) ? UPSTREAM_KEY : null;
  }
}
