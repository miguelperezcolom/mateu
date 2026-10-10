package io.mateu.core.infra.security;

import io.mateu.uidl.security.CallerIdentity;
import java.security.Principal;

/**
 * A principal an ADAPTER builds from its framework's authenticated identity when that identity is
 * not itself a {@link Principal} carrying roles (Quarkus' {@code SecurityIdentity}). Read as is by
 * {@link CallerIdentities#fromPrincipal}.
 */
public record AuthenticatedPrincipal(CallerIdentity identity) implements Principal {

  @Override
  public String getName() {
    return identity.name();
  }
}
