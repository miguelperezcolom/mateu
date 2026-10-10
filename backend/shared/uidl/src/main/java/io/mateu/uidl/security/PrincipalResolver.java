package io.mateu.uidl.security;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

/**
 * Tells Mateu who the caller is. Register one as a bean when the identity lives somewhere Mateu
 * cannot see by itself (a session, a header set by a trusted gateway, an in-house security
 * context). It is consulted FIRST, before the framework's authenticated principal and before any
 * Bearer token.
 *
 * <p>Return {@link Optional#empty()} to let the next source decide; return {@link
 * CallerIdentity#anonymous()} to state that the caller has no identity. Whatever it returns is
 * TRUSTED: never build it from a value the client can forge (an unverified token, a request header
 * a browser can set).
 */
@FunctionalInterface
public interface PrincipalResolver {

  Optional<CallerIdentity> resolve(HttpRequest httpRequest);
}
