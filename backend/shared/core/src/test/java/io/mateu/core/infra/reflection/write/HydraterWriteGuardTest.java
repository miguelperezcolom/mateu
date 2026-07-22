package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The browser is untrusted: hydration must drop client state entries for fields whose {@link
 * EyesOnly} / {@link ReadOnlyUnless} restriction the request does not satisfy — otherwise a
 * tampered componentState could write fields the UI hides or renders read-only (the Mateu
 * equivalent of mass assignment). The rendering side of these annotations is covered by
 * FormFieldFilter / PageFormBuilder tests; this suite covers the symmetric write side.
 */
class HydraterWriteGuardTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  static class Payroll {
    String name;

    @EyesOnly(roles = "hr")
    String ssn = "server-truth-ssn";

    @ReadOnlyUnless(roles = "manager")
    String salary = "1000";
  }

  private static String jwt(Map<String, Object> claims) {
    try {
      String enc =
          Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(claims));
      return "header." + enc + ".sig";
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private static HttpRequest requestWithRoles(String... roles) {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getHeaderValue("Authorization"))
        .thenReturn("Bearer " + jwt(Map.of("roles", List.of(roles))));
    return req;
  }

  private static final Map<String, Object> TAMPERED =
      Map.of("name", "Alice", "ssn", "injected-ssn", "salary", "99999");

  @Test
  void unauthenticatedRequestCannotWriteProtectedFields() {
    var target = new Payroll();

    Hydrater.hydrate(target, TAMPERED, mock(InstanceFactory.class), mock(HttpRequest.class));

    assertThat(target.name).isEqualTo("Alice");
    assertThat(target.ssn).isEqualTo("server-truth-ssn");
    assertThat(target.salary).isEqualTo("1000");
  }

  @Test
  void partiallyAuthorizedRequestWritesOnlyTheFieldsItsRolesAllow() {
    var target = new Payroll();

    Hydrater.hydrate(target, TAMPERED, mock(InstanceFactory.class), requestWithRoles("manager"));

    assertThat(target.name).isEqualTo("Alice");
    assertThat(target.ssn).isEqualTo("server-truth-ssn");
    assertThat(target.salary).isEqualTo("99999");
  }

  @Test
  void fullyAuthorizedRequestWritesEveryField() {
    var target = new Payroll();

    Hydrater.hydrate(
        target, TAMPERED, mock(InstanceFactory.class), requestWithRoles("hr", "manager"));

    assertThat(target.name).isEqualTo("Alice");
    assertThat(target.ssn).isEqualTo("injected-ssn");
    assertThat(target.salary).isEqualTo("99999");
  }
}
