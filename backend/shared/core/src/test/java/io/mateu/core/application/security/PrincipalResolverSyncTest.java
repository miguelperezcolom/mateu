package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An application can tell Mateu who the caller is itself — e.g. from headers its own gateway sets
 * after authenticating — with a {@link PrincipalResolver} bean. It is consulted before the
 * framework's principal.
 */
class PrincipalResolverSyncTest {

  @UI("/resolver-salaries")
  public static class Salaries {
    public String employee = "Ada";

    @EyesOnly(roles = "hr")
    public String salary = "salary-shown-to-hr";
  }

  /** The app's resolver: the roles its gateway put in X-Gateway-Roles. */
  public static class GatewayPrincipalResolver implements PrincipalResolver {
    @Override
    public Optional<CallerIdentity> resolve(HttpRequest httpRequest) {
      var roles = httpRequest.getHeaderValue("X-Gateway-Roles");
      return roles == null
          ? Optional.empty()
          : Optional.of(CallerIdentity.withRoles("gateway-user", Arrays.asList(roles.split(","))));
    }
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new GatewayPrincipalResolver()), Salaries.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String load(Map<String, String> headers) {
    return JsonSerializer.toJson(
        mateu.run(
            RunActionRqDto.builder()
                .route("/resolver-salaries")
                .consumedRoute("")
                .actionId("")
                .initiatorComponentId("c1")
                .componentState(Map.of())
                .build(),
            headers));
  }

  @Test
  void theResolversIdentityIsUsed() {
    assertThat(load(Map.of("X-Gateway-Roles", "hr"))).contains("salary-shown-to-hr");
  }

  @Test
  void withoutItTheCallerIsAnonymous() {
    assertThat(load(Map.of())).doesNotContain("salary-shown-to-hr");
  }
}
