package io.mateu.core.infra;

import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

/**
 * The caller's display name ({@code preferred_username}, else {@code sub}, else the framework
 * principal's name) — taken from the identity the framework authenticated ({@link
 * IdentityResolver}), never from the Bearer token's payload.
 *
 * @deprecated the name says JWT but nothing here reads a token any more: use {@code
 *     IdentityResolver.resolve(httpRequest).name()} (null when anonymous), or the framework
 *     principal itself ({@link HttpRequest#getUserPrincipal()}).
 */
@Deprecated(since = "3.0-alpha.425", forRemoval = true)
public class JwtExtractor {

  /**
   * @deprecated use {@code Optional.ofNullable(IdentityResolver.resolve(httpRequest).name())}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static Optional<String> getUsername(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return Optional.empty();
    }
    return Optional.ofNullable(IdentityResolver.resolve(httpRequest).name());
  }
}
