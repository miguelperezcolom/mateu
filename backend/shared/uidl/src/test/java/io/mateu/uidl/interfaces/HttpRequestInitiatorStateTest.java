package io.mateu.uidl.interfaces;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Verifies {@link HttpRequest#getInitiatorState(Class)}: it reads the state the originating
 * component bubbled up in {@code parameters.initiatorState} (e.g. an editor form bubbling save up
 * to its mediator), falling back to the regular component state when nothing bubbled.
 */
class HttpRequestInitiatorStateTest {

  @Test
  void readsBubbledInitiatorStateWhenPresent() {
    var rq =
        RunActionRqDto.builder()
            .parameters(Map.of("initiatorState", Map.of("name", "edited")))
            .componentState(Map.of("name", "stale"))
            .build();

    Map<String, Object> result = fake(rq).getInitiatorState(Map.class);

    assertThat(result).containsEntry("name", "edited");
  }

  @Test
  void fallsBackToComponentStateWhenNoInitiatorState() {
    var rq =
        RunActionRqDto.builder()
            .parameters(Map.of())
            .componentState(Map.of("name", "fromComponentState"))
            .build();

    Map<String, Object> result = fake(rq).getInitiatorState(Map.class);

    assertThat(result).containsEntry("name", "fromComponentState");
  }

  @Test
  void fallsBackToComponentStateWhenParametersAreNull() {
    var rq = RunActionRqDto.builder().componentState(Map.of("k", "v")).build();

    Map<String, Object> result = fake(rq).getInitiatorState(Map.class);

    assertThat(result).containsEntry("k", "v");
  }

  private static HttpRequest fake(RunActionRqDto rq) {
    return new HttpRequest() {
      @Override
      public RunActionRqDto runActionRq() {
        return rq;
      }

      @Override
      public String getParameterValue(String name) {
        return null;
      }

      @Override
      public List<String> getParameterValues(String name) {
        return List.of();
      }

      @Override
      public Object getAttribute(String key) {
        return null;
      }

      @Override
      public void setAttribute(String key, Object value) {}

      @Override
      public String getHeaderValue(String key) {
        return null;
      }

      @Override
      public List<String> getHeaderValues(String key) {
        return List.of();
      }

      @Override
      public String path() {
        return "";
      }

      @Override
      public List<String> getParameterNames() {
        return List.of();
      }
    };
  }
}
