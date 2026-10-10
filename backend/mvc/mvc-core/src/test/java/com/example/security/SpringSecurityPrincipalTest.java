package com.example.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.SpringHttpRequest;
import io.mateu.core.infra.security.CallerIdentities;
import io.mateu.core.infra.security.IdentityResolver;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * A real Spring Security {@code Authentication} — what the servlet request answers as its user
 * principal once Spring Security authenticated it — gives Mateu its roles, scopes and permissions.
 */
class SpringSecurityPrincipalTest {

  @Test
  void anAuthenticationsAuthoritiesBecomeTheCallersIdentity() {
    var authentication =
        UsernamePasswordAuthenticationToken.authenticated(
            "ana",
            null,
            List.of(
                new SimpleGrantedAuthority("ROLE_admin"),
                new SimpleGrantedAuthority("SCOPE_orders:read"),
                new SimpleGrantedAuthority("invoice.approve")));
    var servlet = new MockHttpServletRequest();
    servlet.setUserPrincipal(authentication);
    // even with a forged token on the side: the framework's principal wins
    servlet.addHeader("Authorization", "Bearer e30.eyJyb2xlcyI6WyJyb290Il19.");

    var identity = IdentityResolver.resolve(new SpringHttpRequest(servlet));

    assertThat(identity.name()).isEqualTo("ana");
    assertThat(identity.roles()).contains("admin", "invoice.approve").doesNotContain("root");
    assertThat(identity.scopes()).containsExactly("orders:read");
    assertThat(identity.permissions()).containsExactly("invoice.approve");
  }

  @Test
  void anAnonymousAuthenticationIsNobody() {
    var anonymous =
        new AnonymousAuthenticationToken(
            "key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
    assertThat(CallerIdentities.fromPrincipal(anonymous)).isEmpty();
  }
}
