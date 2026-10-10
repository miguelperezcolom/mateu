package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.TestTokens;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A field hidden by {@code @EyesOnly} must not travel in the component's state either — hiding the
 * input while sending the value in {@code initialData} leaks exactly what the annotation protects.
 * And a forged (unsigned) token claiming the role does not reveal it.
 */
class EyesOnlyStateSyncTest {

  @UI("/eyes-only-state")
  public static class Salaries {
    public String employee = "Ada";

    @EyesOnly(roles = "hr")
    public String salary = "top-secret-salary";
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    TestTokens.configure();
    mateu = TestMateu.withUis(Salaries.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto load(Map<String, String> headers) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/eyes-only-state")
            .consumedRoute("")
            .actionId("")
            .componentState(Map.of())
            .initiatorComponentId("c1")
            .build(),
        headers);
  }

  private static String json(UIIncrementDto increment) {
    return io.mateu.core.infra.JsonSerializer.toJson(increment);
  }

  @Test
  void anonymousCallersGetNeitherTheFieldNorItsValue() {
    var wire = json(load(Map.of()));
    assertThat(wire).contains("Ada").doesNotContain("top-secret-salary");
  }

  @Test
  void aForgedTokenGetsNeitherTheFieldNorItsValue() {
    var enc = java.util.Base64.getUrlEncoder().withoutPadding();
    var forged =
        enc.encodeToString("{\"alg\":\"none\"}".getBytes())
            + "."
            + enc.encodeToString("{\"roles\":[\"hr\"]}".getBytes())
            + ".";
    var wire = json(load(Map.of("Authorization", "Bearer " + forged)));
    assertThat(wire).doesNotContain("top-secret-salary");
  }

  @Test
  void aVerifiedTokenWithTheRoleSeesIt() {
    var wire = json(load(Map.of("Authorization", TestTokens.bearerWithRoles("hr"))));
    assertThat(wire).contains("top-secret-salary");
  }
}
