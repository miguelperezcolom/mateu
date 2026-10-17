package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The deprecated {@link JwtExtractor} keeps answering exactly what its replacement does — the name
 * of the identity the framework authenticated — until it is removed.
 */
@SuppressWarnings("removal")
class JwtExtractorTest {

  @Test
  void answersTheAuthenticatedName() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal())
        .thenReturn(new AuthenticatedPrincipal(CallerIdentity.withRoles("bob", List.of("admin"))));

    assertThat(JwtExtractor.getUsername(req)).contains("bob");
    assertThat(JwtExtractor.getUsername(req).orElse(null))
        .isEqualTo(IdentityResolver.resolve(req).name());
  }

  @Test
  void anAnonymousOrMissingRequestHasNoName() {
    assertThat(JwtExtractor.getUsername(null)).isEmpty();
    assertThat(JwtExtractor.getUsername(mock(HttpRequest.class))).isEmpty();
  }
}
