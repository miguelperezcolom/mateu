package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.dtos.RunActionRqDto;
import org.junit.jupiter.api.Test;

/**
 * Forward compatibility of the inbound wire request across a federated deployment: a shell built
 * against a NEWER Mateu talks server-to-server to a remote built against an older one, so the
 * remote receives fields it has never heard of. Rejecting them answers HTTP 400 to the shell's
 * deep-link resolution while the same screen keeps working through the menu (there the browser
 * calls the remote directly, with the request shape that remote's own frontend produces) — a
 * failure mode that only shows up by URL. Seen for real with {@code knownStructureHash} against a
 * 3.0-alpha.275 service.
 */
class WireRequestCompatibilityTest {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void anUnknownFieldFromANewerShellDoesNotBreakTheRequest() {
    var json =
        """
        {"componentState":{},"appState":{},"parameters":null,"initiatorComponentId":"_ux",\
        "consumedRoute":"_empty","actionId":"","route":"/forms/tasks","serverSideType":"",\
        "serverSideComponentRoute":null,"knownStructureHash":null,\
        "aFieldAddedInSomeFutureRelease":"whatever"}
        """;

    assertThatCode(() -> objectMapper.readValue(json, RunActionRqDto.class))
        .doesNotThrowAnyException();

    var request = readRequest(json);
    assertThat(request.route()).isEqualTo("/forms/tasks");
    assertThat(request.consumedRoute()).isEqualTo("_empty");
  }

  private RunActionRqDto readRequest(String json) {
    try {
      return objectMapper.readValue(json, RunActionRqDto.class);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
