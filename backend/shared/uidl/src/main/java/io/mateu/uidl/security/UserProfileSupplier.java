package io.mateu.uidl.security;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

/**
 * Says how the signed-in user is shown in the app's header (name, e-mail, picture). Register one as
 * a bean when the defaults are not what you want — Mateu otherwise reads them off the principal the
 * framework authenticated: the {@code name}, {@code email} and {@code picture} claims (GitHub:
 * {@code name}, {@code avatar_url}), else the principal's name.
 *
 * <p>Consulted only for a caller with an identity; return {@link Optional#empty()} to fall back to
 * the defaults. Display only: it never grants or denies anything.
 */
@Experimental
@FunctionalInterface
public interface UserProfileSupplier {

  Optional<UserProfile> profile(HttpRequest httpRequest);
}
