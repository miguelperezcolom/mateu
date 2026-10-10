package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** What a request looks like in a log line: its keys, never the values the user typed. */
class RedactedToStringTest {

  @Test
  void aCommandNamesItsStateKeysButNotTheirValues() {
    var command =
        new RunActionCommand(
            "",
            "",
            "/login",
            "_empty",
            "signIn",
            Map.of("user", "ann", "password", "hunter2"),
            Map.of("token", "eyJhbGciOi"),
            null,
            null,
            null,
            null);
    assertThat(command.toString())
        .contains("/login", "signIn", "password", "user", "token")
        .doesNotContain("hunter2", "eyJhbGciOi", "ann");
  }

  @Test
  void aRequestDtoNamesItsKeysButNotTheirValues() {
    var rq =
        RunActionRqDto.builder()
            .route("/login")
            .actionId("signIn")
            .componentState(Map.of("password", "hunter2"))
            .parameters(Map.of("_clickedRow", Map.of("iban", "ES12 3456")))
            .build();
    assertThat(rq.toString())
        .contains("/login", "password", "_clickedRow")
        .doesNotContain("hunter2", "ES12");
  }
}
