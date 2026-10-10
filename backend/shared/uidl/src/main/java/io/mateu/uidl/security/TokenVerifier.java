package io.mateu.uidl.security;

import java.util.Map;
import java.util.Optional;

/**
 * Verifies a Bearer token and answers its claims — only when the signature AND the time window
 * ({@code exp}/{@code nbf}) and, when configured, the issuer and audience check out. A token that
 * fails answers {@link Optional#empty()}: the caller then has no identity.
 *
 * <p>Register one as a bean to plug in your own verification (an introspection endpoint, a library
 * you already use). Without one Mateu uses its built-in JWT verifier when {@code
 * mateu.security.jwt.jwks-uri} or {@code mateu.security.jwt.secret} is configured.
 */
@FunctionalInterface
public interface TokenVerifier {

  Optional<Map<String, Object>> verify(String token);
}
