package io.mateu.core.infra;

import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

/**
 * The caller's display name ({@code preferred_username}, else {@code sub}, else the framework
 * principal's name) — taken from the identity the framework authenticated ({@link
 * IdentityResolver}), never from the Bearer token's payload.
 */
public class JwtExtractor {

  public static Optional<String> getUsername(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return Optional.empty();
    }
    return Optional.ofNullable(IdentityResolver.resolve(httpRequest).name());
  }
}
