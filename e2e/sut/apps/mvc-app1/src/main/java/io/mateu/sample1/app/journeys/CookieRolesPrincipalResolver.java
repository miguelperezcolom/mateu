package io.mateu.sample1.app.journeys;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * TEST-ONLY identity for the e2e journeys (tests/journeys/access.spec.ts): the caller's roles come
 * from the {@code mateu-e2e-roles} cookie ({@code staff,manager}). A browser can set a cookie, so
 * this is exactly what the {@link PrincipalResolver} contract says never to trust — and that is the
 * point here: the SUT has no login, and the journeys need to be one role or another per test.
 *
 * <p>No cookie → {@link Optional#empty()}, so every other spec served by this app stays anonymous,
 * as it was before this bean existed.
 */
@Component
public class CookieRolesPrincipalResolver implements PrincipalResolver {

  static final String COOKIE = "mateu-e2e-roles";

  @Override
  public Optional<CallerIdentity> resolve(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return Optional.empty();
    }
    var header = httpRequest.getHeaderValue("Cookie");
    if (header == null) {
      return Optional.empty();
    }
    return Arrays.stream(header.split(";"))
        .map(String::trim)
        .filter(cookie -> cookie.startsWith(COOKIE + "="))
        .map(cookie -> cookie.substring(COOKIE.length() + 1))
        .findFirst()
        .map(
            value -> {
              List<String> roles =
                  Arrays.stream(value.split(",")).map(String::trim).filter(r -> !r.isEmpty()).toList();
              return CallerIdentity.withRoles("e2e-" + String.join("-", roles), roles);
            });
  }
}
